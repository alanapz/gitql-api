export type Ref = BranchRef | TrackingBranchRef | TagRef | StashRef;

export interface BranchRef {
    kind: "BRANCH",
    refName: string;
    name: string;
}

export interface TrackingBranchRef {
    kind: "TRACKING",
    refName: string;
    remote: string;
    name: string;
}

export interface TagRef {
    kind: "TAG",
    refName: string;
    name: string;
}

export interface StashRef {
    kind: "STASH",
    refName: string;
    name: string;
}

export interface GitPrincipal {
    name: string;
    emailAddress: string;
    timestamp: number;
}

export interface ParseListRefsCallback {
    branch: (ref: BranchRef, commitId: string) => void;
    trackingBranch: (ref: TrackingBranchRef, commitId: string) => void;
    lightweightTag: (ref: TagRef, commitId: string) => void;
    annotatedTag: (ref: TagRef, annotatedTagId: string) => void;
}

export interface ParseListTagsCallback {
    tagToCommit: (annotatedTagId: string, commitId: string, tagMessage: string, tagAuthor: GitPrincipal) => void;
}

export function isBranchRef(obj: Ref): obj is BranchRef {
    return (obj.kind === "BRANCH");
}

export function isTrackingBranchRef(obj: Ref): obj is TrackingBranchRef {
    return (obj.kind === "TRACKING");
}

export function isTagRef(obj: Ref): obj is TagRef {
    return (obj.kind === "TAG");
}

export function isStashRef(obj: Ref): obj is StashRef {
    return (obj.kind === "STASH");
}
