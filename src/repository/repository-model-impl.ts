import { PersistentCacheService } from "src/cache/persistent-cache.service";
import { error, notNull, stringNotNullNotEmpty } from "src/check";
import {
    BranchRef,
    GitPrincipal,
    isBranchRef,
    isStashRef,
    isTagRef,
    isTrackingBranchRef,
    ParseListRefsCallback,
    ParseListStashesCallback,
    ParseListTagsCallback,
    Ref,
    RefDistance,
    StashRef,
    TagRef,
    TrackingBranchRef
} from "src/git";
import { GitConfigFile } from "src/git/git-config-file";
import { GitService } from "src/git/git.service";
import {
    AnnotatedTagModel,
    BlobModel,
    BranchRefModel,
    CommitModel,
    RefDistanceModel,
    RefModel,
    RemoteModel,
    RepositoryModel,
    StashRefModel,
    TagRefModel,
    TrackingBranchRefModel,
    TreeModel,
    WorkingDirectoryModel
} from "src/repository";
import { AnnotatedTagModelImpl } from "src/repository/annotated-tag-model-impl";
import { AnnotatedTagRefModelImpl } from "src/repository/annotated-tag-ref-model-impl";
import { BlobModelImpl } from "src/repository/blob-model-impl";
import { BranchRefModelImpl } from "src/repository/branch-ref-model-impl";
import { CommitModelImpl } from "src/repository/commit-model-impl";
import { LightweightTagRefModelImpl } from "src/repository/lightweight-tag-ref-model-impl";
import { RefDistanceModelImpl } from "src/repository/ref-distance-model-impl";
import { RemoteModelImpl } from "src/repository/remote-model-impl";
import { StashRefModelImpl } from "src/repository/stash-ref-model-impl";
import { TrackingBranchRefModelImpl } from "src/repository/tracking-branch-ref-model-impl";
import { TreeModelImpl } from "src/repository/tree-model-impl";
import { WorkingDirectoryModelImpl } from "src/repository/working-directory-model-impl";
import { asyncMap } from "src/utils/async-map";
import { lazyValue } from "src/utils/lazy-value";
import { as, if_not_found, IfNotFound, map_reducer, map_values } from "src/utils/utils";

export class RepositoryModelImpl implements RepositoryModel {

    private readonly _allBranches = lazyValue<Map<string, BranchRefModel>>();
    private readonly _allTrackingBranches = lazyValue<Map<string, TrackingBranchRefModel>>();
    private readonly _allTags = lazyValue<Map<string, TagRefModel>>();
    private readonly _allStashes = lazyValue<Map<string, StashRefModel>>();
    private readonly _allRefs = lazyValue<Map<string, RefModel>>();

    private readonly _allReachableCommits = lazyValue<Map<string, CommitModel>>();
    private readonly _allAnnotatedTags = lazyValue<Map<string, AnnotatedTagModel>>();

    private readonly _allRemotes = lazyValue<Map<string, RemoteModel>>();

    private readonly _repoHead = lazyValue<RefModel>();
    private readonly _gitConfig = lazyValue<GitConfigFile>();

    private readonly _cachedBlobs = asyncMap<string, BlobModel>();
    private readonly _cachedTrees = asyncMap<string, TreeModel>();
    private readonly _cachedRefDistances = asyncMap<string, RefDistanceModel>();
    private readonly _cachedWorkingDirectories = asyncMap<string, WorkingDirectoryModel>();

    constructor(public readonly path: string, public readonly gitService: GitService, public readonly persistentCacheService: PersistentCacheService) {
        stringNotNullNotEmpty(path, 'path');
    }

    get allBranches() {
        return this._allBranches.fetch(async () => (await map_values(this.allRefs))
            .filter(branch => branch.kind == 'BRANCH')
            .map(branch => branch as BranchRefModel)
            .reduce(map_reducer(branch => branch.ref.refName), new Map<string, BranchRefModel>()));
    }

    get allTrackingBranches() {
        return this._allTrackingBranches.fetch(async () => (await map_values(this.allRefs))
            .filter(result => result.kind == 'TRACKING')
            .map(result => result as TrackingBranchRefModel)
            .reduce(map_reducer(branch => branch.ref.refName), new Map<string, TrackingBranchRefModel>()));
    }

    get allTags() {
        return this._allTags.fetch(async () => (await map_values(this.allRefs))
            .filter(tag => tag.kind == 'TAG')
            .map(tag => tag as TagRefModel)
            .reduce(map_reducer(tag => tag.ref.refName), new Map<string, TagRefModel>()));
    }

    get allStashes() {
        return this._allStashes.fetch(async () => {

            const results = new Map<string, StashRefModel>();
            const repository = this;

            const callback: ParseListStashesCallback = {

                stash(ref: StashRef, message: string, timestamp: number) {
                    results.set(ref.refName, new StashRefModelImpl(repository, ref, message, timestamp));
                }
            };

            await this.gitService.listStashes(this.path, callback);

            return results;
        });
    }

    get allRefs(): Promise<Map<string, RefModel>> {
        return this._allRefs.fetch(async () => {

            const results = new Map<string, RefModel>();
            const repository = this;

            const callback: ParseListRefsCallback = {

                branch(ref: BranchRef, commitId: string) {
                    results.set(ref.refName, new BranchRefModelImpl(repository, ref, commitId));
                },

                trackingBranch(ref: TrackingBranchRef, commitId: string) {
                    results.set(ref.refName, new TrackingBranchRefModelImpl(repository, ref, commitId));
                },

                lightweightTag(ref: TagRef, commitId: string) {
                    results.set(ref.refName, new LightweightTagRefModelImpl(repository, ref, commitId));
                },

                annotatedTag(ref: TagRef, annotatedTagId: string) {
                    results.set(ref.refName, new AnnotatedTagRefModelImpl(repository, ref, annotatedTagId));
                }
            };

            await this.gitService.listRefs(this.path, callback);

            return results;
        });
    }

    get allReachableCommits() {
        return this._allReachableCommits.fetch(async () => Array.from(await this.gitService.listAllCommits(this.path))
            .map(result => as<CommitModel>(new CommitModelImpl(this, result)))
            .reduce(map_reducer(commit => commit.id), new Map<string, CommitModel>()));
    }

    get allAnnotatedTags() {
        return this._allAnnotatedTags.fetch(async () => {

            const results = new Map<string, AnnotatedTagModel>();
            const repository = this;

            const callback: ParseListTagsCallback = {

                tagToCommit(annotatedTagId: string, commitId: string, message: string, author: GitPrincipal) {
                    results.set(annotatedTagId, new AnnotatedTagModelImpl(repository, annotatedTagId, commitId, message, author));
                }
            };

            await this.gitService.listAnnotatedTags(this.path, callback);

            return results;
        });
    }

    async lookupCommit(commitId: string, ifNotFound: IfNotFound): Promise<CommitModel> {
        stringNotNullNotEmpty(commitId, "commitId");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allReachableCommits).get(commitId),
            error: () => error(`Commit not found (or is unreachable): '${commitId}' for repo: '${this.path}'`)});
    }

    async lookupAnnotatedTag(annotatedTagId: string, ifNotFound: IfNotFound): Promise<AnnotatedTagModel> {
        stringNotNullNotEmpty(annotatedTagId, "annotatedTagId");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allAnnotatedTags).get(annotatedTagId),
            error: () => error(`Annotated tag not found: '${annotatedTagId}' for repo: '${this.path}'`)});
    }

    async lookupBlob(blobId: string, ifNotFound: IfNotFound) {
        stringNotNullNotEmpty(blobId, "blobId");
        return if_not_found({
            value: ifNotFound,
            result: (await this._cachedBlobs.fetch(blobId, async () => new BlobModelImpl(this, blobId))),
            error: () => error(`Blob not found: '${blobId}' for repo: '${this.path}'`)});
    }

    async lookupTree(treeId: string, ifNotFound: IfNotFound) {
        stringNotNullNotEmpty(treeId, "treeId");
        return if_not_found({
            value: ifNotFound,
            result: (await this._cachedTrees.fetch(treeId, async () => new TreeModelImpl(this, treeId))),
            error: () => error(`Tree not found: '${treeId}' for repo: '${this.path}'`)});
    }

    async lookupRef(ref: Ref, ifNotFound: IfNotFound) {
        notNull(ref, "ref");
        if (isBranchRef(ref)) {
            return this.lookupBranch(ref, ifNotFound);
        }
        if (isTrackingBranchRef(ref)) {
            return this.lookupTrackingBranch(ref, ifNotFound);
        }
        if (isTagRef(ref)) {
            return this.lookupTag(ref, ifNotFound);
        }
        if (isStashRef(ref)) {
            return this.lookupStash(ref, ifNotFound);
        }
    }

    async lookupBranch(ref: BranchRef, ifNotFound: IfNotFound) {
        notNull(ref, "branchRef");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allBranches).get(ref.refName),
            error: () => error(`Branch not found: '${ref.refName}' for repo: '${this.path}'`)});
    }

    async lookupTrackingBranch(ref: TrackingBranchRef, ifNotFound: IfNotFound) {
        notNull(ref, "trackingRef");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allTrackingBranches).get(ref.refName),
            error: () => error(`Tracking branch not found: '${ref.refName}' for repo: '${this.path}'`)});
    }

    async lookupTag(ref: TagRef, ifNotFound: IfNotFound) {
        notNull(ref, "tagRef");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allTags).get(ref.refName),
            error: () => error(`Tag branch not found: '${ref.refName}' for repo: '${this.path}'`)});
    }

    async lookupStash(ref: StashRef, ifNotFound: IfNotFound) {
        notNull(ref, "stashRef");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allStashes).get(ref.refName),
            error: () => error(`Stash not found: '${ref.refName}' for repo: '${this.path}'`)});
    }

    buildRefDistance(source: Ref, target: Ref, supplier: () => Promise<RefDistance>): Promise<RefDistanceModel> {
        // We have two levels of cache: local (per-repo) and global
        // (We do this as ref distance is expensive and refs are immutable)
        return this._cachedRefDistances.fetch(`${source.refName}_${target.refName}`, async () => {
            const result = await supplier();
            return new RefDistanceModelImpl(this, source, target, result.ahead, result.behind, result.mergeBaseId);
        });
    }

    get allRemotes() {
        return this._allRemotes.fetch(async () => (await this.gitConfig).remotes
            .map(remoteConfig => new RemoteModelImpl(this, remoteConfig.name, remoteConfig))
            .reduce(map_reducer<string, RemoteModel>(remote => remote.name), new Map<string, RemoteModel>()));
    }

    async lookupRemote(name: string, ifNotFound: IfNotFound) {
        stringNotNullNotEmpty(name, "name");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allRemotes).get(name),
            error: () => error(`Remote not found: '${name}' for repo: '${this.path}'`)});
    }

    get head() {
        return this._repoHead.fetch(async () => {

            const ref = await this.gitService.getRepoHead(this.path);

            if (isBranchRef(ref)) {
                return this.lookupBranch(ref, 'throw');
            }

            if (isTrackingBranchRef(ref)) {
                return this.lookupTrackingBranch(ref, 'throw');
            }

            throw error(`Unparseable head ref: '${ref.refName}' for repo: '${this.path}'`);
        });
    }

    get gitConfig() {
        return this._gitConfig.fetch(() => this.gitService.parseConfig(this.path));
    }

    get lastFetchDate() {
        return this.gitService.getLastFetchDate(this.path);
    }

    get workingDirectory() {
        return this._cachedWorkingDirectories.fetch(this.path, async path => new WorkingDirectoryModelImpl(this, path));
    }
}