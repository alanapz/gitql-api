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

export type GitLogField = 'H' | 'T' | 'P' | 'an' | 'ae' | 'at' | 'cn' | 'ce' | 'ct' | 'D' | 's' | 'B';

export interface GitLogLine {
    id: string;
    treeId?: string;
    parentIds?: string[];
    author?: GitPrincipal;
    committer?: GitPrincipal;
    subject?: string;
    message?: string;
    refNotes?: string[];
}

export interface GitStashLine {
    ref: StashRef;
    commitId?: string;
}

export enum GitObjectType {
    Blob = "blob",
    Tree = "tree",
    Commit = "commit",
    Tag = "tag"
}

export enum GitTreeItemType {
    Blob = "blob",
    Subtree = "tree"
}

export interface GitObject {
    id: string;
    type: GitObjectType;
    size: number;
}

export interface GitTreeItem {
    id: string;
    type: GitTreeItemType;
    name: string;
    mode: number;
}

export interface GitObjectDetails {
    id: string;
    type: GitObjectType;
    size: number;
}

export interface GitBlob extends GitObjectDetails {
    type: GitObjectType.Blob;
    value: string;
}

export interface GitCommit extends GitObjectDetails {
    type: GitObjectType.Commit;
    parentIds: string[];
    treeId: string;
    message: string;
    refNotes?: string;
}

export interface WorkingDirectoryItem {
    path: string;
    added?: boolean;
    copied?: boolean;
    deleted?: boolean;
    modified?: boolean;
    typeChanged?: boolean;
    unmerged?: boolean;
    unknown?: boolean;
    broken?: boolean;
    untracked?: boolean;
}

export interface ParseRefListCallback {
    branch: (ref: BranchRef, commitId: string) => void;
    trackingBranch: (ref: TrackingBranchRef, commitId: string) => void;
    tag: (ref: TagRef, targetId: string) => void;
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

export function isGitBlobObject(obj: GitObjectDetails): obj is GitBlob {
    return (obj.type === GitObjectType.Blob);
}

export function isGitTreeObject(obj: GitObjectDetails): obj is GitCommit {
    return (obj.type === GitObjectType.Tree);
}

export function isGitCommitObject(obj: GitObjectDetails): obj is GitCommit {
    return (obj.type === GitObjectType.Commit);
}

export function isGitTagObject(obj: GitObjectDetails): obj is GitCommit {
    return (obj.type === GitObjectType.Tag);
}
