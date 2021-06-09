import { GitPrincipal, StashRef } from "src/git";

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
