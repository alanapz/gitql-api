import { Check } from "src/check";
import { GitRefspecConfig } from "src/git/git-config-file";
import { BranchRef, TrackingBranchRef } from "src/git/types";
import { GitUtils } from "src/git/utils";

const check: Check = require.main.require("./check");

// https://git-scm.com/book/en/v2/Git-Internals-The-Refspec
export class GitRefspecConfigImpl implements GitRefspecConfig {

    private readonly remotePattern: string;

    private readonly localPattern: string;

    constructor(public readonly value: string) {

        // eg: +refs/heads/qa*:refs/remotes/origin/qa*
        // ("remote" is branch on the server, local is client remote-tracking branch)

        const matcher = value.match(/^\+?(?<remote>.*):(?<local>.*)$/);
        if (!matcher) {
            throw check.error(`Unexpected refspec: ${value}`);
        }

        this.remotePattern = matcher.groups["remote"];
        this.localPattern = matcher.groups["local"];
    }

    toRemote(ref: TrackingBranchRef): BranchRef {
        return GitUtils.toBranchRef(this.convert(ref.refName, this.localPattern, this.remotePattern));
    }

    toLocal(ref: BranchRef): TrackingBranchRef {
        return GitUtils.toTrackingBranchRef(this.convert(ref.refName, this.remotePattern, this.localPattern));
    }

    private convert(srcName: string, srcPattern: string, destPattern: string): string {
        // Fairly complex - we convert refspect to regex
        const matcher = srcName.match(`^${srcPattern.replace("*", "(?<value>.+)")}$`);
        if (!matcher) {
            return null;
        }

        return destPattern.replace("*", matcher.groups["value"]);
    }
}