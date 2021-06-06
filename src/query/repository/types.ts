import { GitWorkingDirectoryItemStatus } from "src/generated/graphql";
import { GitConfigFile } from "src/git/git-config-file";
import { GitService } from "src/git/git.service";
import { BranchRef, GitPrincipal, Ref, StashRef, TagRef, TrackingBranchRef } from "src/git/types";
import { RefDistanceModel } from "src/query/repository/RefDistanceModel";
import { IfNotFound } from "src/utils/utils";

export interface BlobModelParams {
    size?: number;
    value?: string;
}

export interface BlobModel {
    id: string;
    repository: RepositoryModel;
    size: Promise<number>;
    value: Promise<string>;
    update(params?: BlobModelParams): BlobModel;
}

export interface CommitModel {
    id: string;
    repository: RepositoryModel;
    parents: Promise<CommitModel[]>;
    firstParent: Promise<CommitModel>;
    tree: Promise<TreeModel>;
    author: Promise<GitPrincipal>;
    committer: Promise<GitPrincipal>;
    subject: Promise<string>;
    message: Promise<string>;
    refNotes: Promise<string[]>;
    reachableBy: Promise<RefModel[]>;
}

export interface TreeModel {
    id: string;
    repository: RepositoryModel;
    items: Promise<TreeItemModel[]>;
}

export interface RefModel {
    __typename: string;
    kind: "BRANCH" | "TRACKING" | "TAG" | "STASH";
    ref: Ref;
    displayName: string;
    repository: RepositoryModel;
    commit: Promise<CommitModel>;
}

export interface BranchRefModel extends RefModel {
    kind: "BRANCH";
    name: string;
    upstream: Promise<TrackingBranchRefModel>;
}

export interface TrackingBranchRefModel extends RefModel {
    kind: "TRACKING";
    name: string;
}

export interface TagRefModel extends RefModel {
    kind: "TAG";
    name: string;
}

export interface StashRefModel extends RefModel {
    kind: "STASH";
}

export function isBranchRefModel(obj: RefModel): obj is BranchRefModel {
    return (obj && obj.kind === "BRANCH");
}

export function isTrackingBranchRefModel(obj: RefModel): obj is TrackingBranchRefModel {
    return (obj && obj.kind === "TRACKING");
}

export function isStashRefModel(obj: RefModel): obj is StashRefModel {
    return (obj && obj.kind === "STASH");
}

export interface TreeItemModel {
    __typename: string;
    kind: "SUBTREE" | "BLOB";
    tree: TreeModel;
    name: string;
    mode: number;
}

export interface TreeItemSubtreeModel extends TreeItemModel {
    kind: "SUBTREE";
    subtree: Promise<TreeModel>;
}

export interface TreeItemBlobModel extends TreeItemModel {
    kind: "BLOB";
    blob: Promise<BlobModel>;
}

export function isTreeItemSubtree(obj: TreeItemModel): obj is TreeItemSubtreeModel {
    return (obj && obj.kind === "SUBTREE");
}

export function isTreeItemBlob(obj: TreeItemModel): obj is TreeItemBlobModel {
    return (obj && obj.kind === "BLOB");
}

export interface TreeDescendantModel {
    path: string;
    item: TreeItemModel;
}

export interface RepositoryModel {
    path: string
    allBranches: Promise<Map<string, BranchRefModel>>;
    allTrackingBranches: Promise<Map<string, TrackingBranchRefModel>>;
    allTags: Promise<Map<string, TagRefModel>>;
    allStashes: Promise<Map<string, StashRefModel>>;
    lookupCommit: (commitId: string, ifNotFound: IfNotFound) => Promise<CommitModel>;
    lookupBlob: (blobId: string, ifNotFound: IfNotFound) => Promise<BlobModel>;
    lookupTree: (treeId: string, ifNotFound: IfNotFound) => Promise<TreeModel>;
    lookupRef: (ref: Ref, ifNotFound: IfNotFound) => Promise<RefModel>;
    lookupBranch: (ref: BranchRef, ifNotFound: IfNotFound) => Promise<BranchRefModel>;
    lookupTrackingBranch: (ref: TrackingBranchRef, ifNotFound: IfNotFound) => Promise<TrackingBranchRefModel>;
    lookupTag: (ref: TagRef, ifNotFound: IfNotFound) => Promise<TagRefModel>;
    lookupStash: (ref: StashRef, ifNotFound: IfNotFound) => Promise<StashRefModel>;
    buildRefDistance: (source: Ref, target: Ref, supplier: () => Promise<{ahead: number, behind: number, mergeBase: string}>) => Promise<RefDistanceModel>;
    gitService: GitService;
    head: Promise<RefModel>;
    gitConfig: Promise<GitConfigFile>;
    lastFetchDate: Promise<number>;
    workingDirectory: Promise<WorkingDirectoryModel>;
}

export interface WorkingDirectoryModel {
    path: string
    repository: RepositoryModel;
    staged: Promise<WorkingDirectoryItemModel[]>
    unstaged: Promise<WorkingDirectoryItemModel[]>
    untracked: Promise<WorkingDirectoryItemModel[]>
}

export interface WorkingDirectoryItemModel {
    directory: WorkingDirectoryModel;
    path: string;
    status: Promise<GitWorkingDirectoryItemStatus[]>;
}