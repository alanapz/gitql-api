import { Check } from "src/check";
import { GitConfigFile, GitRefspecConfig, GitRemoteConfig } from "src/git/git-config-file";
import { GitRefspecConfigImpl } from "src/git/git-refspec-config";
import { BranchRef, TrackingBranchRef } from "src/git/types";
import { GitUtils } from "src/git/utils";
import { cacheMap } from "src/utils/cachemap";
import { as } from "src/utils/utils";

const check: Check = require.main.require("./check");

class GitRemoteConfigImpl implements GitRemoteConfig {
    name: string;
    fetchUrls: string[];
    pushUrls: string[];
    refspecs: GitRefspecConfig[];
}

class GitBranchConfigImpl {
    name: string;
    remoteName?: string;
    upstreamName?: string
}

type ConfigFileSection = (key: string, value: string) => void;

export class GitConfigFileParser implements GitConfigFile {

    private readonly remotes = cacheMap<string, GitRemoteConfigImpl>();

    private readonly branches = cacheMap<string, GitBranchConfigImpl>();

    private currentSection: ConfigFileSection;

    private static ignoredSection: ConfigFileSection = () => {};

    nextLine(line: string): void {

        // Ignore empty lines
        if (!(line = line.trim()).length) {
            return;
        }

        // Skip comment lines
        if (line.startsWith("#")) {
            return;
        }

        // Assume sections start with [
        if (line.startsWith("[")) {

            if ((this.currentSection = this.isRemoteSection(line))) {
                // Nothing to do
            }
            else if ((this.currentSection = this.isBranchSection(line))) {
                // Nothing to do
            }
            else {
                this.currentSection = GitConfigFileParser.ignoredSection;
            }

            return;
        }

        // Otherwise, it's a simple value so try and parse to add to current section
        const matcher = line.match(/^\s*(?<key>.+?)\s+=\s+(?<value>.+)$/);
        if (!matcher) {
            throw check.error(`Unparseable config line: ${line}`);
        }

        // Not much we can do here
        if (!this.currentSection) {
            throw check.error(`Unexpected line: ${line} (not in section)`);
        }

        this.currentSection(matcher.groups["key"], matcher.groups["value"]);
    }

    private isRemoteSection(line: string): ConfigFileSection {

        const matcher = line.match(/\s*\[remote "(.*)"]\s*/);

        if (!matcher) {
            return null;
        }

        const remote = this.remotes.fetch(matcher[1], remoteName => as<GitRemoteConfigImpl>({
            name: remoteName,
            fetchUrls: [],
            pushUrls: [],
            refspecs: []}));

        return (key, value) => {
            if (key === 'fetch') {
                remote.refspecs.push(new GitRefspecConfigImpl(value));
            }
            else if (key === 'url') {
                remote.fetchUrls.push(value);
            }
            else if (key === 'pushurl') {
                remote.pushUrls.push(value);
            }
        }
    }

    private isBranchSection(line: string): ConfigFileSection {

        const matcher = line.match(/\s*\[branch "(.*)"]\s*/);

        if (!matcher) {
            return null;
        }

        const branch = this.branches.fetch(matcher[1], branchName => as<GitBranchConfigImpl>({ name: branchName }));

        return (key, value) => {
            if (key === 'remote') {
                branch.remoteName = value;
            }
            else if (key === 'merge') {
                branch.upstreamName = value;
            }
        }
    }

    listRemotes() {
        return [ ... this.remotes.values() ];
    }

    getRemote(remoteName: string) {
        return this.remotes.get(remoteName);
    }

    // Returns the corresponding "upstream" for the given local branch
    // eg: dev -> refs/remotes/
    resolveUpstream(ref: BranchRef): TrackingBranchRef {
        check.nonNull(ref, "ref");

        // Skip if branch not configured
        if (!this.branches.has(ref.branchName)) {
            return null;
        }

        const branch = this.branches.get(ref.branchName);

        // Or if branch has no upstream configured
        if (!branch.remoteName || !branch.upstreamName) {
            return null;
        }

        const remote = this.remotes.get(branch.remoteName);
        if (!remote) {
            throw check.error(`Unknown remote: ${branch.remoteName}`)
        }

        const upstreamRef = GitUtils.toBranchRef(branch.upstreamName);

        for (const refspec of remote.refspecs) {
            const trackingRef = refspec.toLocal(upstreamRef);
            if (trackingRef) {
                return trackingRef;
            }
        }

        // No refspec corresponds to target branch
        return null;
    }
}
