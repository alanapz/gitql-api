import { PersistentCacheService } from "src/cache/persistent-cache.service";
import { TrunkConfigHandler } from "src/config/trunk-config";
import { WebUrlHandler } from "src/config/web-url";
import { WebUrlService } from "src/config/web-url/web-url.service";
import { GitWorkingDirectoryItemStatus } from "src/generated/graphql";
import { BranchRef, GitPrincipal, Ref, RefDistance, StashRef, TagRef, TrackingBranchRef } from "src/git";
import { GitConfigFile } from "src/git/git-config-file";
import { GitService } from "src/git/git.service";
import { IfNotFound } from "src/utils/utils";

export interface AnnotatedTagModel {
    id: string;
    repository: RepositoryModel;
    commitId: Promise<string>;
    commit: Promise<CommitModel>;
    message: Promise<string>;
    author: Promise<GitPrincipal>;
}

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
    ancestors: Promise<CommitModel[]>;
    allAncestors: Promise<CommitModel[]>;
    webUrls: Promise<WebUrlModel[]>;
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
    commitId: Promise<string>;
    commit: Promise<CommitModel>;
}

export interface BranchRefModel extends RefModel {
    kind: "BRANCH";
    name: string;
    upstream: Promise<TrackingBranchRefModel>;
    isTrunk: Promise<boolean>;
    parent: Promise<TrackingBranchRefModel>;
}

export interface TrackingBranchRefModel extends RefModel {
    kind: "TRACKING";
    ref: TrackingBranchRef;
    remote: Promise<RemoteModel>;
    name: string;
    isTrunk: Promise<boolean>;
    parent: Promise<TrackingBranchRefModel>;
    webUrl: Promise<WebUrlModel>;
}

export interface TagRefModel extends RefModel {
    kind: "TAG";
    name: string;
    message: Promise<string>;
    author: Promise<GitPrincipal>;
    webUrls: Promise<WebUrlModel[]>;
}

export interface StashRefModel extends RefModel {
    kind: "STASH";
    message: Promise<string>;
    timestamp: Promise<number>;
}

export function isBranchRefModel(obj: RefModel): obj is BranchRefModel {
    return (obj && obj.kind === "BRANCH");
}

export function isTrackingBranchRefModel(obj: RefModel): obj is TrackingBranchRefModel {
    return (obj && obj.kind === "TRACKING");
}

export function isTagRefModel(obj: RefModel): obj is TagRefModel {
    return (obj && obj.kind === "TAG");
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
    path: string;
    allRefs: Promise<Map<string, RefModel>>;
    allBranches: Promise<Map<string, BranchRefModel>>;
    allTrackingBranches: Promise<Map<string, TrackingBranchRefModel>>;
    allTags: Promise<Map<string, TagRefModel>>;
    allStashes: Promise<Map<string, StashRefModel>>;
    allReachableCommits: Promise<Map<string, CommitModel>>;
    allAnnotatedTags: Promise<Map<string, AnnotatedTagModel>>;
    lookupCommit: (commitId: string, ifNotFound: IfNotFound) => Promise<CommitModel>;
    lookupBlob: (blobId: string, ifNotFound: IfNotFound) => Promise<BlobModel>;
    lookupTree: (treeId: string, ifNotFound: IfNotFound) => Promise<TreeModel>;
    lookupAnnotatedTag: (annotatedTagId: string, ifNotFound: IfNotFound) => Promise<AnnotatedTagModel>;
    lookupRef: (ref: Ref, ifNotFound: IfNotFound) => Promise<RefModel>;
    lookupBranch: (ref: BranchRef, ifNotFound: IfNotFound) => Promise<BranchRefModel>;
    lookupTrackingBranch: (ref: TrackingBranchRef, ifNotFound: IfNotFound) => Promise<TrackingBranchRefModel>;
    lookupTag: (ref: TagRef, ifNotFound: IfNotFound) => Promise<TagRefModel>;
    lookupStash: (ref: StashRef, ifNotFound: IfNotFound) => Promise<StashRefModel>;
    buildRefDistance: (source: Ref, target: Ref, supplier: () => Promise<RefDistance>) => Promise<RefDistanceModel>;
    allRemotes: Promise<Map<string, RemoteModel>>;
    lookupRemote: (name: string, ifNotFound: IfNotFound) => Promise<RemoteModel>;
    head: Promise<RefModel>;
    lastFetchDate: Promise<number>;
    gitConfig: Promise<GitConfigFile>;
    workingDirectory: Promise<WorkingDirectoryModel>;
    webUrls: Promise<WebUrlModel[]>;
    trunkConfigHandler: Promise<TrunkConfigHandler>;
    gitService: GitService;
    webUrlService: WebUrlService;
    cacheService: PersistentCacheService;
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

export interface RefDistanceModel {
    ahead: Promise<number>;
    behind: Promise<number>;
    mergeBaseId: Promise<string>;
    mergeBase: Promise<CommitModel>;
}

export interface RemoteModel {
    repository: RepositoryModel;
    name: string;
    fetchUrl: Promise<string>;
    pushUrls: Promise<string[]>;
    webUrlHandler: Promise<WebUrlHandler>;
    branches: Promise<TrackingBranchRefModel[]>;
}

export interface WebUrlModel {
    remote: RemoteModel,
    url: string;
}
