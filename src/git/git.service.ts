import { Injectable } from '@nestjs/common';
import { error, stringNotNullNotEmpty } from "src/check";
import {
    isBranchRef,
    isStashRef,
    isTagRef,
    isTrackingBranchRef,
    ParseListRefsCallback,
    ParseListStashesCallback,
    ParseListTagsCallback,
    Ref
} from "src/git";
import { GitConfigFile } from "src/git/git-config-file";
import { GitConfigFileParser } from "src/git/git-config-file-parser";
import { GitLogField, GitLogLine, GitObject, GitTreeItem, WorkingDirectoryItem } from "src/git/types";
import { GitUtils } from "src/git/utils";
import { ioUtils } from "src/utils/io-utils";
import { record_to_map } from "src/utils/utils";

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

    async listRefs(repoPath: string, callback: ParseListRefsCallback): Promise<void> {

        // See: https://git-scm.com/docs/git-for-each-ref#Documentation/git-for-each-ref.txt---formatltformatgt
        const fields = Array.from(record_to_map({
            ref: 'refname',
            id: 'objectname',
            type: 'objecttype',
            rtype: '*objecttype' }));

        const result = await this.gitExecute(['-C', repoPath, 'for-each-ref', `--format=${fields.map(field => `${field[0]}:%(${field[1]})${seperator}`).join("")}${seperator}`]);

        for (const {val, inputLine} of GitUtils.parseSerializedResponse<{ref, id, type, rtype}>(result, seperator)) {

            stringNotNullNotEmpty(val.ref, `Unexpected refname for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.id, `Unexpected objectId for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.type, `Unexpected objectType for line: '${inputLine}', repo: '${repoPath}'`);

            // Skip pseudo "stash"
            if (val.ref === 'refs/stash') {
                continue;
            }

            // We point directly to a commit - either branch, tracking branch, or lightweight tag
            const ref = GitUtils.parseExplicitRef(val.ref);

            if (isBranchRef(ref) && val.type === 'commit') {
                callback.branch(ref, val.id);
            }
            else if (isTrackingBranchRef(ref) && val.type === 'commit') {
                callback.trackingBranch(ref, val.id);
            }
            else if (isTagRef(ref) && val.type === 'commit') {
                // Lightweight tag to commit
                callback.lightweightTag(ref, val.id);
            }
            else if (isTagRef(ref) && (val.type === 'blob' || val.type === 'tree')) {
                // Skip lightweight tags to non-commit objects
            }
            else if (isTagRef(ref) && val.type === 'tag' && val.rtype === 'commit') {
                // Annotated tag to commit
                callback.annotatedTag(ref, val.id);
            }
            else if (isTagRef(ref) && val.type === 'tag' && (val.rtype === 'blob' || val.rtype === 'tree')) {
                // Skip annotated tags to non-commit objects
            }
            else if (isTagRef(ref) && val.type === 'tag' && val.rtype === 'tag') {
                // We also skip annotated tags to annotated-tags because WTH
            }
            else {
                throw error(`Unexpected object type for input line: '${inputLine}', repo: '${repoPath}'`);
            }
        }
    }

    async listAnnotatedTags(repoPath: string, callback: ParseListTagsCallback): Promise<void> {

        // See: https://git-scm.com/docs/git-for-each-ref#Documentation/git-for-each-ref.txt---formatltformatgt
        const fields = Object.entries<string>({
            id: 'objectname',
            type: 'objecttype',
            tm: 'subject',
            an: 'taggername',
            ae: 'taggeremail',
            t: 'taggerdate:unix',
            rid: '*objectname',
            rtype: '*objecttype'
        });

        const result = await this.gitExecute(['-C', repoPath, 'for-each-ref', `--format=${fields.map(field => `${field[0]}:%(${field[1]})${seperator}`).join("")}${seperator}`, 'refs/tags/']);

        for (const {val, inputLine} of GitUtils.parseSerializedResponse<{id, type, tm, an, ae, t, rid, rtype}>(result, seperator)) {

            if (val.type === 'commit' || val.type === 'blob' || val.type === 'tree') {
                // Skip lightweight tags
                continue;
            }

            if (val.type !== 'tag') {
                throw error(`Unexpected object type: '${val.type}' for line: '${inputLine}'`);
            }

            stringNotNullNotEmpty(val.id, `Unexpected objectId for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.rid, `Unexpected targetId for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.tm, `Unexpected message for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.an, `Unexpected authorName for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.ae, `Unexpected authorEmail for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.t, `Unexpected timestamp for line: '${inputLine}', repo: '${repoPath}'`);

            if (val.rtype === 'blob' || val.rtype === 'tree') {
                // Skip annotated tags to non-commit objects
                continue;
            }
            if (val.rtype === 'tag') {
                // We also skip annotated tags to annotated-tags because WTH
                continue;
            }

            if (val.rtype !== 'commit') {
                throw error(`Unexpected target type: '${val.rtype}' for line: '${inputLine}', repo: '${repoPath}'`);
            }

            callback.tagToCommit(val.id, val.rid, val.tm, {
                name: val.an,
                emailAddress: val.ae,
                timestamp: parseInt(val.t, 10)
            });
        }
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

    async listStashes(repoPath: string, callback: ParseListStashesCallback): Promise<void> {

        // See: https://git-scm.com/docs/pretty-formats for a list of all placeholders
        const fields = Object.entries<string>({
            id: 'H', // Stash ID
            name: 'gD', // Reflog name
            message: 'gs', // Reflog subject
            timestamp: 'ct', // Commit date
        });

        const result = await this.gitExecute(['-C', repoPath, 'stash', 'list', `--format=${fields.map(field => `${field[0]}:%${field[1]}${seperator}`).join("")}`]);

        for (const {val, inputLine} of GitUtils.parseSerializedResponse<{id, name, message, timestamp}>(result, seperator)) {

            stringNotNullNotEmpty(val.id, `Unexpected objectId for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.name, `Unexpected name for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.message, `Unexpected message for line: '${inputLine}', repo: '${repoPath}'`);
            stringNotNullNotEmpty(val.timestamp, `Unexpected timestamp for line: '${inputLine}', repo: '${repoPath}'`);

            const ref = GitUtils.parseExplicitRef(val.name);

            if (!isStashRef(ref)) {
                throw error(`Unexpected ref: '${ref}' for line: '${inputLine}', repo: '${repoPath}'`);
            }

            callback.stash(ref, val.message, parseInt(val.timestamp, 10));
        }
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

            // Handle loops (see end of loop - a branch with no first-parent is it's own first-parent)
            if (sourceCommits.includes(sourceCommitId) && targetCommits.includes(targetCommitId)) {
                return null;
            }

            if (!sourceCommits.includes(sourceCommitId)) {
                sourceCommits.push(sourceCommitId);
            }

            if (!targetCommits.includes(targetCommitId)) {
                targetCommits.push(targetCommitId);
            }

            const mergeBaseId = this.firstCommonElement(sourceCommits, targetCommits);
            if (mergeBaseId) {
                return {
                    mergeBase: mergeBaseId,
                    ahead: sourceCommits.indexOf(mergeBaseId),
                    behind: targetCommits.indexOf(mergeBaseId)
                };
            }

            [sourceCommitId, targetCommitId] = await Promise.all([
                await lookupFirstParent(sourceCommitId) || sourceCommitId,
                await lookupFirstParent(targetCommitId) || targetCommitId]);
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
