import { Check } from "src/check";
import { GitObjectParserProcessor } from "src/git/git-object-parser";
import {
    BranchRef,
    GitLogLine,
    GitObject,
    GitObjectDetails,
    GitObjectType,
    GitStashLine,
    GitTreeItem,
    GitTreeItemType,
    ParseRefListCallback,
    Ref,
    StashRef,
    TrackingBranchRef,
    WorkingDirectoryItem
} from "src/git/types";

const check: Check = require.main.require("./check");

export class GitUtils {

    private static readonly validObjectTypes: GitObjectType[] = [GitObjectType.Blob, GitObjectType.Tree, GitObjectType.Commit, GitObjectType.Tag];

    private static readonly validTreeItemTypes: GitTreeItemType[] = [GitTreeItemType.Blob, GitTreeItemType.Subtree];

    static parseExplicitRef(input: string): Ref {

        if (input.match(/^refs\/heads\/.+$/)) {
            return GitUtils.toBranchRef(input);
        }

        if (input.match(/^refs\/remotes\/.+?\/.+$/)) {
            return GitUtils.toTrackingBranchRef(input);
        }

        if (input.match(/^refs\/tags\/(?<tag>.+)$/)) {
            /// XXX: TODO: Handle tags
            return null;
        }

        if (input.match(/^refs\/stash@{\d+}$/)) {
            return GitUtils.toStashRef(input);
        }

        throw check.error(`Unable to parse explicit ref: '${input}'`);
    }

    static toBranchRef(input: string): BranchRef {

        check.stringNonNullNotEmpty(input, 'input');

        // If it's already a branch ref, great
        const refMatcher = input.match(/^refs\/heads\/(?<branch>.+)$/);
        if (refMatcher) {
            return {
                kind: "BRANCH",
                refName: input,
                branchName: refMatcher.groups["branch"]
            };
        }

        // Fail if it's a different reftype
        if (input.startsWith("refs/")) {
            throw check.error(`Ref: '${input}' is not a branch ref`);
        }

        // Branch name, convert to ref
        return {
            kind: "BRANCH",
            refName: `refs/heads/${input}`,
            branchName: input
        };
    }

    static toTrackingBranchRef(input: string): TrackingBranchRef {

        // If it's already a tracking ref, great
        const refMatcher = input.match(/^refs\/remotes\/(?<remote>.+?)\/(?<branch>.+)$/);
        if (refMatcher) {
            return {
                kind: "TRACKING",
                refName: input,
                remoteName: refMatcher.groups["remote"],
                branchName: refMatcher.groups["branch"]
            };
        }

        // Fail if it's a different reftype
        if (input.startsWith("refs/")) {
            throw check.error(`Ref: '${input}' is not a tracking ref`);
        }

        // Try to parse tracking branch remote from name
        // eg: origin/dev - remote origin, branch dev
        const trackingMatcher = input.match(/^(?<remote>.+?)\/(?<branch>.+)$/);

        if (!trackingMatcher) {
            throw check.error(`Unparseable tracking branch ref: '${input}'`);
        }

        return {
            kind: "TRACKING",
            refName: `refs/remotes/${trackingMatcher.groups["remote"]}/${trackingMatcher.groups["branch"]}`,
            remoteName: trackingMatcher.groups["remote"],
            branchName: trackingMatcher.groups["branch"]
        };
    }

    static toStashRef(input: string): StashRef {
        // If it's already a stashref, great
        const refMatcher = input.match(/^refs\/(?<stash>stash@{\d+})$/);
        if (refMatcher) {
            return {
                kind: "STASH",
                refName: input,
                stashName: refMatcher.groups["stash"]
            };
        }

        // Fail if it's a different reftype
        if (input.startsWith("refs/")) {
            throw check.error(`Ref: '${input}' is not a stash ref`);
        }

        if (!input.match(/^stash@{\d+}$/)) {
            throw check.error(`Unparseable stash ref: '${input}'`);
        }

        // Stash name, convert to ref
        return {
            kind: "STASH",
            refName: `refs/${input}`,
            stashName: input
        };
    }

    static *parseListObjects(input: string): Generator<GitObject> {
        if (!input || !input.trim().length) {
            return [];
        }

        for (const match of input.trim().matchAll(/^([a-f0-9]{40})\s+(blob|tree|commit|tag)\s+(\d+)$/gmi)) {

            if (GitUtils.validObjectTypes.indexOf(match[2] as GitObjectType) === -1) {
                continue;
            }

            yield {
                id: match[1],
                type: (match[2] as GitObjectType),
                size: parseInt(match[3], 10)
            };
        }
    }

    /**
     *  Parses git cat-object syntax, where multiple objects are concatenated together
     */
    static parseObjectDetailsList(rawInput: string): GitObjectDetails[] {

        if (!rawInput || !rawInput.length) {
            return [];
        }

        console.log(rawInput);

        const input: string[] = rawInput.trim().split("\n")

        console.log(input);

        if (!input.length) {
            return [];
        }

        const results: GitObjectDetails[] = [];

        const processor = new GitObjectParserProcessor(results);

        while (input.length) {
            processor.nextLine(input.shift());
        }

        processor.complete();

        return results;
    }

    static *parseTreeItems(input: string): Generator<GitTreeItem> {
        if (!input || !input.trim().length) {
            return [];
        }

        for (const match of input.trim().matchAll(/^(\d+)\s+(blob|tree)\s+([a-f0-9]{40})\s+(.*)$/gm)) {

            if (GitUtils.validTreeItemTypes.indexOf(match[2] as GitTreeItemType) === -1) {
                continue;
            }

            yield  {
                mode: parseInt(match[1], 10),
                type: (match[2] as GitTreeItemType),
                id: match[3],
                name: match[4]
            }
        }
    }

    static parseRefListResponse(input: string, callback: ParseRefListCallback): void {

        let matcher;

        for (const line of input.trim().split("\n")) {

            if (!(matcher = line.match(/^\s*(?<target>[a-f0-9]+)\s+(?<name>refs\/.+)$/))) {
                throw check.error(`Unparseable input line: '${line}'`);
            }

            const targetId = matcher.groups["target"];
            const refName = matcher.groups["name"];

            if ((matcher = refName.match(/^refs\/heads\/(?<branchName>.+)$/))) {
                callback.branch({kind: "BRANCH", refName, branchName: matcher.groups["branchName"]}, targetId);
            } else if ((matcher = refName.match(/^refs\/remotes\/(?<remoteName>.+?)\/(?<branchName>.+)$/))) {
                callback.trackingBranch({
                    kind: "TRACKING",
                    refName,
                    remoteName: matcher.groups["remoteName"],
                    branchName: matcher.groups["branchName"]
                }, targetId);
            } else if ((matcher = refName.match(/^refs\/tags\/(?<tagName>.+)$/))) {
                callback.tag({kind: "TAG", refName, tagName: matcher.groups["tagName"]}, targetId);
            } else if ((matcher = refName.match(/^refs\/stash$/))) {
                // Ignore fake "stash" refs
            } else {
                throw check.error(`Unexpected type for input line: '${line}'`);
            }
        }
    }

    static *parsePathDiffStatus(input: string): Generator<WorkingDirectoryItem> {
        check.nonNull(input);
        for (const inputLine of input.trim().split("\n").map(val => val.trim())) {
            if (inputLine.length) {
                const matcher = inputLine.trim().match(/^(?<status>[A-Z]*)\s+(?<name>.*)$/);
                if (!matcher) {
                    throw check.error(`Unparseable diff status: '${input}'`);
                }
                const status = matcher.groups["status"];
                // https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---diff-filterACDMRTUXB82308203
                yield {
                    path: matcher.groups["name"],
                    added: status.includes("A"),
                    copied: status.includes("C"),
                    deleted: status.includes("D"),
                    modified: status.includes("M"),
                    typeChanged: status.includes("T"),
                    unmerged: status.includes("U"),
                    unknown: status.includes("X"),
                    broken: status.includes("B")
                };
            }
        }
    }

    static *parseListUntracked(input: string): Generator<WorkingDirectoryItem> {
        check.nonNull(input);
        for (const inputLine of input.trim().split("\n").map(val => val.trim())) {
            if (inputLine.length) {
                yield {
                    path: inputLine,
                    untracked: true
                };
            }
        }
    }

    static *parseStashList(input: string, splitBy: string): Generator<GitStashLine> {
        check.nonNull(input);
        for (const inputLine of input.trim().split(`${splitBy}${splitBy}`).map(val => val.trim())) {
            if (inputLine.length) {
                if (inputLine.length) {
                    yield GitUtils.parseGitStashList(inputLine, splitBy);
                }
            }
        }
    }

    private static parseGitStashList(inputLine: string, splitBy: string): GitStashLine {

        const val: Partial<{ commitId: string, refName: string }> = {};

        for (const inputComponent of inputLine.split(splitBy).map(val => val.trim())) {
            if (inputComponent.length) {

                let matcher: RegExpMatchArray;

                if ((matcher = inputComponent.trim().match(/^H:(?<commitId>[a-f0-9]+)$/))) {
                    val.commitId = matcher.groups["commitId"];
                }
                else if ((matcher = inputComponent.trim().match(/^gD:(?<refName>.+)$/))) {
                    val.refName = matcher.groups["refName"];
                }
                else {
                    throw check.error(`Unexpected component: '${inputComponent}' for line: '${inputLine}'`);
                }
            }
        }

        return {
            commitId: val.commitId,
            ref: GitUtils.toStashRef(val.refName)
        };
    }

    static *parseGitLog(input: string, splitBy: string): Generator<GitLogLine> {
        check.nonNull(input);
        for (const inputLine of input.trim().split(`${splitBy}${splitBy}`).map(val => val.trim())) {
            if (inputLine.length) {
                yield GitUtils.parseGitLogLine(inputLine, splitBy);
            }
        }
    }

    private static parseGitLogLine(inputLine: string, splitBy: string): GitLogLine {

        const val: Partial<{
            id: string,
            treeId: string,
            parentIds: string[],
            authorName: string,
            authorEmail: string,
            authorTimestamp: number,
            committerName: string,
            committerEmail: string,
            committerTimestamp: number,
            subject: string,
            message: string,
            refNotes: string[]}> = {};

        for (const inputComponent of inputLine.split(splitBy).map(val => val.trim())) {
            if (inputComponent.length) {

                let matcher: RegExpMatchArray;

                if ((matcher = inputComponent.trim().match(/^H:(?<id>[a-f0-9]+)$/))) {
                    val.id = matcher.groups["id"];
                }
                else if ((matcher = inputComponent.trim().match(/^T:(?<treeId>[a-f0-9]+)$/))) {
                    val.treeId = matcher.groups["treeId"];
                }
                else if ((matcher = inputComponent.trim().match(/^P:(?<parentIds>[a-f0-9 ]*)$/))) {
                    val.parentIds = matcher.groups["parentIds"].split(" ").map(val => val.trim()).filter(val => val.length);
                }
                else if ((matcher = inputComponent.trim().match(/^an:(?<authorName>.+)$/))) {
                    val.authorName = matcher.groups["authorName"];
                }
                else if ((matcher = inputComponent.trim().match(/^ae:(?<authorEmail>.+)$/))) {
                    val.authorEmail = matcher.groups["authorEmail"];
                }
                else if ((matcher = inputComponent.trim().match(/^at:(?<authorTimestamp>\d+)$/))) {
                    val.authorTimestamp = parseInt(matcher.groups["authorTimestamp"], 10);
                }
                else if ((matcher = inputComponent.trim().match(/^cn:(?<committerName>.+)$/))) {
                    val.committerName = matcher.groups["committerName"];
                }
                else if ((matcher = inputComponent.trim().match(/^ce:(?<committerEmail>.+)$/))) {
                    val.committerEmail = matcher.groups["committerEmail"];
                }
                else if ((matcher = inputComponent.trim().match(/^ct:(?<committerTimestamp>\d+)$/))) {
                    val.committerTimestamp = parseInt(matcher.groups["committerTimestamp"], 10);
                }
                else if ((matcher = inputComponent.trim().match(/^s:(?<subject>.*)$/s))) {
                    val.subject = matcher.groups["subject"];
                }
                else if ((matcher = inputComponent.trim().match(/^B:(?<message>.*)$/s))) {
                    val.message = matcher.groups["message"];
                }
                else if ((matcher = inputComponent.trim().match(/^D:(?<refNotes>.*)$/))) {
                    val.refNotes = matcher.groups["refNotes"]
                        .split(",")
                        .map(val => val.trim())
                        .map(val => val.replace("HEAD -> ", ""))
                        .filter(val => val.length);
                }
                else {
                    throw check.error(`Unexpected component: '${inputComponent}' for line: '${inputLine}'`);
                }
            }
        }

        return {
            id: val.id,
            treeId: val.treeId,
            parentIds: val.parentIds,
            author: { name: val.authorName, emailAddress: val.authorEmail, timestamp: val.authorTimestamp },
            committer: { name: val.committerName, emailAddress: val.committerEmail, timestamp: val.committerTimestamp },
            subject: val.subject,
            message: val.message,
            refNotes: val.refNotes
        };
    }
}
