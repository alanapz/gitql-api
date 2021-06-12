import { error } from "src/check";
import { BranchRef, TrackingBranchRef } from "src/git";
import { GitConfigFile, GitRefspecConfig, GitRemoteConfig } from "src/git/git-config-file";
import { GitRefspecConfigImpl } from "src/git/git-refspec-config";
import { GitUtils } from "src/git/utils";
import { cacheMap } from "src/utils/cachemap";
import { as } from "src/utils/utils";

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

    private readonly _remotes = cacheMap<string, GitRemoteConfigImpl>();

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
            throw error(`Unparseable config line: ${line}`);
        }

        // Not much we can do here
        if (!this.currentSection) {
            throw error(`Unexpected line: ${line} (not in section)`);
        }

        this.currentSection(matcher.groups["key"], matcher.groups["value"]);
    }

    private isRemoteSection(line: string): ConfigFileSection {

        const matcher = line.match(/\s*\[remote "(.*)"]\s*/);

        if (!matcher) {
            return null;
        }

        const remote = this._remotes.fetch(matcher[1], remoteName => as<GitRemoteConfigImpl>({
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

    get remotes() {
        return [ ... this._remotes.values() ];
    }

    getRemote(remoteName: string) {
        return this._remotes.get(remoteName);
    }

    // Returns the corresponding "upstream" for the given local branch
    // eg: dev -> refs/remotes/
    resolveUpstream(ref: BranchRef): TrackingBranchRef {

        // Skip if branch not configured
        if (!this.branches.has(ref.name)) {
            return null;
        }

        const branch = this.branches.get(ref.name);

        // Or if branch has no upstream configured
        if (!branch.remoteName || !branch.upstreamName) {
            return null;
        }

        const remote = this._remotes.get(branch.remoteName);
        if (!remote) {
            throw error(`Unknown remote: ${branch.remoteName}`)
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
