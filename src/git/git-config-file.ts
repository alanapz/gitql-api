import { BranchRef, TrackingBranchRef } from "src/git";

export interface GitRefspecConfig {
    value: string;
    toRemote: (ref: TrackingBranchRef) => BranchRef;
    toLocal: (ref: BranchRef) => TrackingBranchRef;
}

export interface GitRemoteConfig {
    name: string;
    fetchUrls: string[];
    pushUrls: string[];
}

export interface GitConfigFile {
    remotes: GitRemoteConfig[];
    getRemote: (remoteName: string) => GitRemoteConfig;
    resolveUpstream: (ref: BranchRef) => TrackingBranchRef;
}