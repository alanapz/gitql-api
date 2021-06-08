import { Injectable } from '@nestjs/common';
import { stringNotNullNotEmpty } from "src/check";
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

const fs = require("fs/promises");
const path = require("path");

const seperator = "¶¶¶";

@Injectable()
export class GitService {

    async isGitRepoPath(repoPath: string): Promise<boolean> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        //
        const fstat = await ioUtils.fstatOrNull(path.join(repoPath, ".git"));
        return (fstat && fstat.isDirectory());
    }

    async listRefs(repoPath: string, callback: ParseRefListCallback): Promise<void> {
        const result = await this.gitExecute(['-C', repoPath, 'show-ref']);
        GitUtils.parseRefListResponse(result, callback);
    }

    async listObjects(repoPath: string): Promise<Generator<GitObject>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        //
        const result = await this.gitExecute(['-C', repoPath, 'cat-file', '--batch-check', '--batch-all-objects']);
        return GitUtils.parseListObjects(result);
    }

    async listTreeItems(repoPath: string, treeId: string): Promise<Generator<GitTreeItem>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        stringNotNullNotEmpty(treeId, "treeId");
        //
        const result = await this.gitExecute(['-C', repoPath, 'cat-file', '-p', treeId]);
        return GitUtils.parseTreeItems(result);
    }

    async listStashes(repoPath: string): Promise<Generator<GitStashLine>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        //
        const fields = ['H', 'gD'];
        const result = await this.gitExecute(['-C', repoPath, 'stash', 'list', `--format=${fields.map(field => `${field}:%${field}${seperator}`).join("")}${seperator}`]);
        return GitUtils.parseStashList(result, seperator);
    }

    async listAllCommits(repoPath: string): Promise<Generator<GitLogLine>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        // All fields
        return this.retrieveCommits(repoPath, ['--all'], ['H', 'T', 'P', 'an', 'ae', 'at', 'cn', 'ce', 'ct', 's', 'B', 'D']);
    }

    async lookupCommit(repoPath: string, commitIds: string[]): Promise<Generator<GitLogLine>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        // All fields
        return this.retrieveCommits(repoPath, ['--no-walk', ... commitIds ], ['H', 'T', 'P', 'an', 'ae', 'at', 'cn', 'ce', 'ct', 's', 'B', 'D']);
    }

    private async retrieveCommits(repoPath: string, params: string[], fields: GitLogField[]): Promise<Generator<GitLogLine>> {
        const result = await this.gitExecute(['-C', repoPath, 'log', ... params, `--format=${fields.map(field => `${field}:%${field}${seperator}`).join("")}${seperator}`]);
        return GitUtils.parseGitLog(result, seperator);
    }

    async getRepoHead(repoPath: string): Promise<Ref> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        //
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
        stringNotNullNotEmpty(repoPath, "repoPath");
        //
        const fileData = await fs.readFile(path.join(repoPath, ".git", "config"), { encoding: "UTF8", flags: "r"});
        const parser = new GitConfigFileParser();

        for (const inputLine of fileData.trim().split("\n")) {
            parser.nextLine(inputLine);
        }

        return parser;
    }

    async calculateDistance(repoPath: string, sourceCommitId: string, targetCommitId: string, lookupFirstParent: (commitId: string) => Promise<string>): Promise<{ mergeBase: string, ahead: number, behind: number }> {

        const sourceCommits: string[] = [];
        const targetCommits: string[] = [];

        while (true) {

            sourceCommits.push(sourceCommitId);
            targetCommits.push(targetCommitId);

            const mergeBaseId = this.firstCommonElement(sourceCommits, targetCommits);
            if (mergeBaseId) {
                return {
                    mergeBase: mergeBaseId,
                    ahead: sourceCommits.indexOf(mergeBaseId),
                    behind: targetCommits.indexOf(mergeBaseId)
                };
            }

            [sourceCommitId, targetCommitId] = await Promise.all([
                await lookupFirstParent(sourceCommitId),
                await lookupFirstParent(targetCommitId)]);
        }
    }

    // Returns all the refs that contain the specified commit
    async listCommitReachableBy(repoPath: string, commitId: string): Promise<Generator<Ref>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        stringNotNullNotEmpty(commitId, "commitId");
        //
        const input = await this.gitExecute(['-C', repoPath, 'for-each-ref', '--contains', commitId]);
        return GitUtils.parseForEachRef(input, commitId);
    }

    async getLastFetchDate(repoPath: string): Promise<number|null> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        //
        try {
            return Math.floor((await fs.stat(path.join(repoPath, ".git", "FETCH_HEAD"))).mtimeMs / 1000);
        }
        catch (e) {
            return null;
        }
    }

    async fetchRepository(repoPath: string): Promise<void> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        // Can't return directly as Promise<string> isn't assignable to Promise<void>
        await this.gitExecute(['-C', repoPath, 'fetch', '--all', '--prune', '--quiet']);
    }

    async getWorkingDirectoryStaged(repoPath: string, dirPath: string): Promise<Generator<WorkingDirectoryItem>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        stringNotNullNotEmpty(dirPath, "dirPath");
        // We temporarily disable crlf conversion (to prevent warning: LF will be replaced by CRLF in XXX messages)
        const data = await this.gitExecute(['-C', repoPath, '-c', 'core.autocrlf=false', 'diff', '--name-status', '--no-renames', '--cached', '--', dirPath]);
        return GitUtils.parsePathDiffStatus(data);
    }

    async getWorkingDirectoryUnstaged(repoPath: string, dirPath: string): Promise<Generator<WorkingDirectoryItem>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        stringNotNullNotEmpty(dirPath, "dirPath");
        //
        const data = await this.gitExecute(['-C', repoPath, '-c', 'core.autocrlf=false', 'diff', '--name-status', '--no-renames', '--', dirPath]);
        return GitUtils.parsePathDiffStatus(data);
    }

    async getWorkingDirectoryUntracked(repoPath: string, dirPath: string): Promise<Generator<WorkingDirectoryItem>> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        stringNotNullNotEmpty(dirPath, "dirPath");
        // https://stackoverflow.com/questions/3801321/git-list-only-untracked-files-also-custom-commands
        const data = await this.gitExecute(['-C', repoPath, 'ls-files', '--others', '--exclude-standard', '--', dirPath]);
        return GitUtils.parseListUntracked(data);
    }

    async fetchAll(repoPath: string): Promise<void> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        await this.gitExecute(['-C', repoPath, 'fetch', '--all', '--prune', '--tags']);
    }

    async cleanWorkingDirectory(repoPath: string): Promise<void> {
        stringNotNullNotEmpty(repoPath, "repoPath");
        await this.gitExecute(['-C', repoPath, 'clean', '-ffddx']);
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

    private firstCommonElement<T>(a: T[], b: T[]): T {
        const setB = new Set<T>(b);
        const common = [...new Set<T>(a)].filter(x => setB.has(x));
        return (common && common.length ? common[0] : null);
    }
}
