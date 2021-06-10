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
<<<<<<< HEAD
    remotes: GitRemoteConfig[];
=======
    cloneUrl: string;
    listRemotes: () => GitRemoteConfig[];
>>>>>>> GQL14 - Add provider config support
    getRemote: (remoteName: string) => GitRemoteConfig;
    resolveUpstream: (ref: BranchRef) => TrackingBranchRef;
}