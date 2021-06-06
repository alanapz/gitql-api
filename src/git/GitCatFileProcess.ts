import { ChildProcess } from "child_process";
import { Check } from "src/check";
import { GitCatFileParser } from "src/git/git-cat-file-parser";
import { GitObjectDetails } from "src/git/types";

const { spawn } = require("child_process");

const check: Check = require.main.require("./check");

interface Awaiter {
    found: (object: GitObjectDetails) => void;
    missing: (objectId: string) => void;
}

/**
 * Class used to represent a persistent connection to a Git batch process
 * (Used to retrieve object details)
 */
export class GitCatFileProcess {

    private readonly awaiters: Map<string, Awaiter[]> = new Map<string, Awaiter[]>();

    private cmd: ChildProcess;

    constructor(private repoPath: string) {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
    }

    lookup(objectId: string): Promise<GitObjectDetails> {
        check.stringNonNullNotEmpty(objectId, "objectId");

        console.debug(`cat-file lookup object: ${objectId}, pending: ${this.awaiters.size}`);

        return new Promise<GitObjectDetails>((resolve: (result: GitObjectDetails) => void, reject: (err: unknown) => void) => {

            const awaiter: Awaiter = {

                found(object: GitObjectDetails): void {
                    console.debug(`cat-file lookup object: ${objectId} found`);
                    resolve(object);
                },

                missing(objectId: string): void {
                    console.debug(`cat-file lookup object: ${objectId} missing`);
                    reject(`Object not found: ${objectId}`);
                }
            };

            // If we have already have an outstanding request for this object,
            // simply add our awaiter to the list
            if (this.awaiters.has(objectId)) {
                this.awaiters.get(objectId).push(awaiter);
                return;
            }

            // Otherwise, initialise awaiter list and send request
            this.awaiters.set(objectId, [ awaiter ]);

            this.launchIfNecessary();

            this.cmd.stdin.write(`${objectId}\n`);
        });
    }

    private launchIfNecessary() {

        if (this.cmd) {
            return;
        }

        const args = ['-C', this.repoPath, 'cat-file', '--batch'];

        console.debug("git", ...args);

        const objectParser = new GitCatFileParser(
            (object: GitObjectDetails) => this.fireObjectFound(object),
            (objectId: string) => this.fireObjectMissing(objectId));

        const cmd: ChildProcess = this.cmd = spawn('git', args);

        cmd.stdout.on('end', () => {
            // Nothing to do
        });

        cmd.stdout.on('data', (data) => {

            objectParser.processNext(data.toString());

            // Terminate process if no awaiters (nothing to do)
            if (!this.awaiters.size) {
                console.log("No awaiters, killing process");
                this.cmd.kill();
                this.cmd = null;
            }
        });

        cmd.stderr.on('data', (data) => {
            throw check.error(`Unexpected response: ${data.toString()}`);
        });
    }

    private fireObjectFound(object: GitObjectDetails): void {
        const awaiterList = this.awaiters.get(object.id);
        if (!awaiterList || !awaiterList.length) {
            // Not always an error - could be race condiiton with previous results
            return;
        }
        this.awaiters.delete(object.id);
        for (const awaiter of (awaiterList || [])) {
            awaiter.found(object);
        }
    }

    private fireObjectMissing(objectId: string): void {
        const awaiterList = this.awaiters.get(objectId);
        if (!awaiterList || !awaiterList.length) {
            // Not always an error - could be race condiiton with previous results
            return;
        }
        this.awaiters.delete(objectId);
        for (const awaiter of (awaiterList || [])) {
            awaiter.missing(objectId);
        }
    }
}
