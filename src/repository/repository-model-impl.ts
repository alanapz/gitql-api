import { error, notNull, stringNotNullNotEmpty } from "src/check";
import { GitConfigFile } from "src/git/git-config-file";
import { GitService } from "src/git/git.service";
import {
    BranchRef,
    isBranchRef,
    isStashRef,
    isTagRef,
    isTrackingBranchRef,
    ParseRefListCallback,
    Ref,
    StashRef,
    TagRef,
    TrackingBranchRef
} from "src/git/types";
import {
    BlobModel,
    BranchRefModel,
    CommitModel,
    RefDistanceModel,
    RefModel,
    RepositoryModel,
    StashRefModel,
    TagRefModel,
    TrackingBranchRefModel,
    TreeModel,
    WorkingDirectoryModel
} from "src/repository";
import { BlobModelImpl } from "src/repository/blob-model-impl";
import { BranchRefModelImpl } from "src/repository/branch-ref-model-impl";
import { CommitModelImpl } from "src/repository/commit-model-impl";
import { RefDistanceModelImpl } from "src/repository/ref-distance-model-impl";
import { StashRefModelImpl } from "src/repository/stash-ref-model-impl";
import { TagRefModelImpl } from "src/repository/tag-ref-model-impl";
import { TrackingBranchRefModelImpl } from "src/repository/tracking-branch-ref-model-impl";
import { TreeModelImpl } from "src/repository/tree-model-impl";
import { WorkingDirectoryModelImpl } from "src/repository/working-directory-model-impl";
import { asyncMap } from "src/utils/async-map";
import { lazyValue } from "src/utils/lazy-value";
import { as, if_not_found, IfNotFound, map_reducer, map_values } from "src/utils/utils";

export class RepositoryModelImpl implements RepositoryModel {

    private readonly _allCommits = lazyValue<Map<string, CommitModel>>();
    private readonly _allBranches = lazyValue<Map<string, BranchRefModel>>();
    private readonly _allTrackingBranches = lazyValue<Map<string, TrackingBranchRefModel>>();
    private readonly _allTags = lazyValue<Map<string, TagRefModel>>();
    private readonly _allStashes = lazyValue<Map<string, StashRefModel>>();
    private readonly _allRefs = lazyValue<Map<string, RefModel>>();

    private readonly _repoHead = lazyValue<RefModel>();
    private readonly _gitConfig = lazyValue<GitConfigFile>();

    private readonly _cachedCommits = asyncMap<string, CommitModel>();
    private readonly _cachedBlobs = asyncMap<string, BlobModel>();
    private readonly _cachedTrees = asyncMap<string, TreeModel>();
    private readonly _cachedRefDistances = asyncMap<string, RefDistanceModel>();
    private readonly _cachedWorkingDirectories = asyncMap<string, WorkingDirectoryModel>();

    constructor(public readonly path: string, public readonly gitService: GitService) {
        stringNotNullNotEmpty(path, 'path');
        notNull(gitService, 'gitService');
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
        return this._allStashes.fetch(async () => Array.from(await this.gitService.listStashes(this.path))
            .map(result => new StashRefModelImpl(this, result.ref, result))
            .reduce(map_reducer(stash => stash.ref.refName), new Map<string, StashRefModel>()));
    }

    private get allRefs(): Promise<Map<string, RefModel>> {
        const repository = this;
        return this._allRefs.fetch(async () => {

            const results = new Map<string, RefModel>();

            await this.gitService.listRefs(this.path, as<ParseRefListCallback>({

                branch(ref: BranchRef, commitId: string) {
                    results.set(ref.refName, new BranchRefModelImpl(repository, ref, commitId));
                },

                trackingBranch(ref: TrackingBranchRef, commitId: string): void {
                    results.set(ref.refName, new TrackingBranchRefModelImpl(repository, ref, commitId));
                },

                tag(ref: TagRef, commitId: string): void {
                    // XXXX: TODO: FIXME - tag doesn't always point to a commit
                    results.set(ref.refName, new TagRefModelImpl(repository, ref, commitId));
                }
            }));

            return results;
        });
    }

    async lookupCommit(commitId: string, ifNotFound: IfNotFound): Promise<CommitModel> {
        stringNotNullNotEmpty(commitId, "commitId");

        const result = this._cachedCommits.fetch(commitId, async () => {

            const allCommits = await this._allCommits.fetch(async () => Array.from(await this.gitService.listAllCommits(this.path))
                .map(result => new CommitModelImpl(this, result))
                .reduce(map_reducer(commit => commit.id), new Map<string, CommitModel>()));

            if (allCommits.has(commitId)) {
                return allCommits.get(commitId);
            }

            const unreachableCommits = Array.from(await this.gitService.lookupCommit(this.path, [commitId]))
                .map(result => new CommitModelImpl(this, result))
                .reduce(map_reducer(commit => commit.id), new Map<string, CommitModel>());

            if (unreachableCommits.has(commitId)) {
                return unreachableCommits.get(commitId);
            }

            return null;
        });

        return if_not_found({
            value: ifNotFound,
            result,
            error: () => error(`Commit not found: '${commitId}'`)});
    }

    async lookupBlob(blobId: string, ifNotFound: IfNotFound) {
        stringNotNullNotEmpty(blobId, "blobId");
        return if_not_found({
            value: ifNotFound,
            result: (await this._cachedBlobs.fetch(blobId, async () => new BlobModelImpl(this, blobId))),
            error: () => error(`Blob not found: '${blobId}'`)});
    }

    async lookupTree(treeId: string, ifNotFound: IfNotFound) {
        stringNotNullNotEmpty(treeId, "treeId");
        return if_not_found({
            value: ifNotFound,
            result: (await this._cachedTrees.fetch(treeId, async () => new TreeModelImpl(this, treeId))),
            error: () => error(`Tree not found: '${treeId}'`)});
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
            error: () => error(`Branch not found: '${ref.refName}'`)});
    }

    async lookupTrackingBranch(ref: TrackingBranchRef, ifNotFound: IfNotFound) {
        notNull(ref, "trackingRef");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allTrackingBranches).get(ref.refName),
            error: () => error(`Tracking branch not found: '${ref.refName}'`)});
    }

    async lookupTag(ref: TagRef, ifNotFound: IfNotFound) {
        notNull(ref, "tagRef");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allTags).get(ref.refName),
            error: () => error(`Tag branch not found: '${ref.refName}'`)});
    }

    async lookupStash(ref: StashRef, ifNotFound: IfNotFound) {
        notNull(ref, "stashRef");
        return if_not_found({
            value: ifNotFound,
            result: (await this.allStashes).get(ref.refName),
            error: () => error(`Stash not found: '${ref.refName}'`)});
    }

    buildRefDistance(source: Ref, target: Ref, supplier: () => Promise<{mergeBase: string, ahead: number, behind: number}>): Promise<RefDistanceModel> {
        notNull(source, "source");
        notNull(target, "target");
        notNull(supplier, "supplier");
        return this._cachedRefDistances.fetch(`${source.refName}_${target.refName}`, async () => {
            const result = await supplier();
            return new RefDistanceModelImpl(this, source, target, result.ahead, result.behind, result.mergeBase);
        });
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

            throw error(`Unparseable head ref: ${ref.refName}`);
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