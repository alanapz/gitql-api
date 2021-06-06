import { Injectable } from '@nestjs/common';
import { Check } from "src/check";
import { GitConfigFile } from "src/git/git-config-file";
import { GitConfigFileParser } from "src/git/git-config-file-parser";
import {
    GitLogField,
    GitLogLine,
    GitObject,
    GitStashLine,
    GitTreeItem,
    ParseRefListCallback,
    Ref,
    WorkingDirectoryItem
} from "src/git/types";
import { GitUtils } from "src/git/utils";
import { ioUtils } from "src/utils/io-utils";
import { first_common_element } from "src/utils/utils";

const fs = require("fs/promises");
const path = require("path");

const check: Check = require.main.require("./check");

const seperator = "¶¶¶";

@Injectable()
export class GitService {

    async isGitRepoPath(repoPath: string): Promise<boolean> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
        const fstat = await ioUtils.fstatOrNull(path.join(repoPath, ".git"));
        return (fstat && fstat.isDirectory());
    }

    async listRefs(repoPath: string, callback: ParseRefListCallback): Promise<void> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
        check.nonNull(callback, "callback");
        const result = await this.gitExecute(['-C', repoPath, 'show-ref']);
        GitUtils.parseRefListResponse(result, callback);
    }

    async getRefTarget(repoPath: string, ref: Ref): Promise<string> {
        const refFilename = path.join(repoPath, ".git", ref.refName);
        const fstat = await ioUtils.fstatOrNull(refFilename);
        if (!fstat || !fstat.isFile()) {
            throw check.error(`Couldn't resolve branch head, file not found: ${refFilename}`);
        }
        const fileData = (await fs.readFile(refFilename, { encoding: "UTF8", flags: "r"}));
        return fileData.trim();
    }

    async listObjects(repoPath: string): Promise<Generator<GitObject>> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
        const result = await this.gitExecute(['-C', repoPath, 'cat-file', '--batch-check', '--batch-all-objects']);
        return GitUtils.parseListObjects(result);
    }

    async listTreeItems(repoPath: string, treeId: string): Promise<Generator<GitTreeItem>> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
        check.stringNonNullNotEmpty(treeId, "treeId");
        const result = await this.gitExecute(['-C', repoPath, 'cat-file', '-p', treeId]);
        return GitUtils.parseTreeItems(result);
    }

    async listStashes(repoPath: string): Promise<Generator<GitStashLine>> {
        const fields = ['H', 'gD'];
        const result = await this.gitExecute(['-C', repoPath, 'stash', 'list', `--format=${fields.map(field => `${field}:%${field}${seperator}`).join("")}${seperator}`]);
        return GitUtils.parseStashList(result, seperator);
    }

    async listAllCommits(repoPath: string): Promise<Generator<GitLogLine>> {
        // All fields
        return this.retrieveCommits(repoPath, ['--all'], ['H', 'T', 'P', 'an', 'ae', 'at', 'cn', 'ce', 'ct', 's', 'B', 'D']);
    }

    async lookupCommit(repoPath: string, commitIds: string[]): Promise<Generator<GitLogLine>> {
        // All fields
        return this.retrieveCommits(repoPath, ['--no-walk', ... commitIds ], ['H', 'T', 'P', 'an', 'ae', 'at', 'cn', 'ce', 'ct', 's', 'B', 'D']);
    }

    private async retrieveCommits(repoPath: string, params: string[], fields: GitLogField[]): Promise<Generator<GitLogLine>> {
        const result = await this.gitExecute(['-C', repoPath, 'log', ... params, `--format=${fields.map(field => `${field}:%${field}${seperator}`).join("")}${seperator}`]);
        return GitUtils.parseGitLog(result, seperator);
    }

    async getRepoHead(repoPath: string): Promise<Ref> {
        const fstat = await ioUtils.fstatOrNull(path.join(repoPath, ".git", "HEAD"));
        if (!fstat || !fstat.isFile()) {
            return null;
        }
        const fileData = await fs.readFile(path.join(repoPath, ".git", "HEAD"), { encoding: "UTF8", flags: "r"});
        const matcher = fileData.trim().match(/^ref:\s+(?<ref>.*)$/);
        if (!matcher) {
            return null;
        }
        return GitUtils.parseExplicitRef(matcher.groups["ref"]);
    }

    async parseConfig(repoPath: string): Promise<GitConfigFile> {
        const fileData = await fs.readFile(path.join(repoPath, ".git", "config"), { encoding: "UTF8", flags: "r"});
        const parser = new GitConfigFileParser();

        for (const inputLine of fileData.trim().split("\n")) {
            parser.nextLine(inputLine);
        }

        return parser;
    }

    async calculateDistance(repoPath: string, source: Ref, target: Ref, lookupFirstParent: (commitId: string) => Promise<string>): Promise<{ mergeBase: string, ahead: number, behind: number }> {

        const [sourceHead, targetHead] = await Promise.all([
            this.getRefTarget(repoPath, source),
            this.getRefTarget(repoPath, target)]);

        const sourceCommits: string[] = [];
        const targetCommits: string[] = [];

        let sourceCurrentId = sourceHead;
        let targetCurrentId = targetHead;

        while (true) {

            sourceCommits.push(sourceCurrentId);
            targetCommits.push(targetCurrentId);

            const mergeBaseId = first_common_element(sourceCommits, targetCommits);
            if (mergeBaseId) {
                return {
                    mergeBase: mergeBaseId,
                    ahead: sourceCommits.indexOf(mergeBaseId),
                    behind: targetCommits.indexOf(mergeBaseId)
                };
            }

            sourceCurrentId = await lookupFirstParent(sourceCurrentId);
            targetCurrentId = await lookupFirstParent(targetCurrentId);
        }
    }

    // Returns all the refs that contain the specified commit
    async listCommitReachableBy(repoPath: string, commitId: string): Promise<Generator<Ref>> {
        const input = await this.gitExecute(['-C', repoPath, 'for-each-ref', '--contains', commitId]);
        return GitUtils.parseForEachRef(input, commitId);
    }

    async getLastFetchDate(repoPath: string): Promise<number|null> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");

        try {
            return Math.floor((await fs.stat(path.join(repoPath, ".git", "FETCH_HEAD"))).mtimeMs / 1000);
        }
        catch (e) {
            return null;
        }
    }

    async fetchRepository(repoPath: string): Promise<void> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
        // Can't return directly as Promise<string> isn't assignable to Promise<void>
        await this.gitExecute(['-C', repoPath, 'fetch', '--all', '--prune', '--quiet']);
    }

    async getWorkingDirectoryStaged(repoPath: string, dirPath: string): Promise<Generator<WorkingDirectoryItem>> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
        check.stringNonNullNotEmpty(dirPath, "dirPath");
        // We temporarily disable crlf conversion (to prevent warning: LF will be replaced by CRLF in XXX messages)
        const data = await this.gitExecute(['-C', repoPath, '-c', 'core.autocrlf=false', 'diff', '--name-status', '--no-renames', '--cached', '--', dirPath]);
        return GitUtils.parsePathDiffStatus(data);
    }

    async getWorkingDirectoryUnstaged(repoPath: string, dirPath: string): Promise<Generator<WorkingDirectoryItem>> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
        check.stringNonNullNotEmpty(dirPath, "dirPath");
        const data = await this.gitExecute(['-C', repoPath, '-c', 'core.autocrlf=false', 'diff', '--name-status', '--no-renames', '--', dirPath]);
        return GitUtils.parsePathDiffStatus(data);
    }

    async getWorkingDirectoryUntracked(repoPath: string, dirPath: string): Promise<Generator<WorkingDirectoryItem>> {
        check.stringNonNullNotEmpty(repoPath, "repoPath");
        check.stringNonNullNotEmpty(dirPath, "dirPath");
        // https://stackoverflow.com/questions/3801321/git-list-only-untracked-files-also-custom-commands
        const data = await this.gitExecute(['-C', repoPath, 'ls-files', '--others', '--exclude-standard', '--', dirPath]);
        return GitUtils.parseListUntracked(data);
    }

    private gitExecute(args: string[], input?: string): Promise<string> {

        return new Promise((resolve, reject) => {

            const { spawn } = require('child_process');

            console.log("git", ...args);

            const cmd = spawn('git', args);

            let output: string = "";
            let error: string = "";

            cmd.stdout.on('data', (data) => {
                output += data.toString();
            });
            cmd.stderr.on('data', (data) => {
                error += data.toString();
            });

            cmd.on('close', (code) => {
                if (code !== 0) {
                    reject(code);
                    return;
                }

                if (error.length) {
                    reject(error);
                    return;
                }

                resolve(output.trim());
            });

            if (input) {
                cmd.stdin.setEncoding('utf-8');
                cmd.stdin.write(input);
                cmd.stdin.end();
            }
        });
    }
}
