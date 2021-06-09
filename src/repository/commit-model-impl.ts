import { error } from "src/check";
import { GitPrincipal } from "src/git";
import { GitLogLine } from "src/git/types";
import { CommitModel, RefModel, RepositoryModel, TreeModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";
import { map_values } from "src/utils/utils";

export class CommitModelImpl implements CommitModel {

    private readonly _parentIds = lazyValue<string[]>();

    private readonly _parents = lazyValue<CommitModel[]>();

    private readonly _firstParent = lazyValue<CommitModel>();

    private readonly _treeId = lazyValue<string>();

    private readonly _tree = lazyValue<TreeModel>();

    private readonly _author = lazyValue<GitPrincipal>();

    private readonly _committer = lazyValue<GitPrincipal>();

    private readonly _subject = lazyValue<string>();

    private readonly _message = lazyValue<string>();

    private readonly _refNotes = lazyValue<string[]>();

    private readonly _allDetails = lazyValue<GitLogLine>();

    private readonly _reachableBy = lazyValue<RefModel[]>();

    private readonly _ancestors = lazyValue<CommitModel[]>();

    private readonly _allAncestors = lazyValue<CommitModel[]>();

    constructor(readonly repository: RepositoryModel, private readonly _input: GitLogLine) {
        this._parentIds.setIfNotNull(_input.parentIds);
        this._treeId.setIfNotNull(_input.treeId);
        this._author.setIfNotNull(_input.author);
        this._committer.setIfNotNull(_input.committer);
        this._subject.setIfNotNull(_input.subject);
        this._message.setIfNotNull(_input.message);
        this._refNotes.setIfNotNull(_input.refNotes);
    }

    get id() {
        return this._input.id;
    }

    get parents() {
        return this._parents.fetch(async () => {
            const parentIds = await this._parentIds.fetch(async () => (await this.allDetails).parentIds);
            return Promise.all(parentIds.map(parentId => this.repository.lookupCommit(parentId, 'throw')));
        });
    }

    get firstParent() {
        return this._firstParent.fetch(async () => {
            const parentIds = await this._parentIds.fetch(async () => (await this.allDetails).parentIds);
            if (!parentIds.length) {
                return null;
            }
            return this.repository.lookupCommit(parentIds[0], 'throw');
        });
    }

    get tree() {
        return this._tree.fetch(async () => {
            const treeId = await this._treeId.fetch(async () => (await this.allDetails).treeId);
            return this.repository.lookupTree(treeId, 'throw');
        });
    }

    get author() {
        return this._author.fetch(async () => (await this.allDetails).author);
    }

    get committer() {
        return this._committer.fetch(async () => (await this.allDetails).committer);
    }

    get subject() {
        return this._subject.fetch(async () => (await this.allDetails).subject);
    }

    get message() {
        return this._message.fetch(async () => (await this.allDetails).message);
    }

    get refNotes() {
        return this._refNotes.fetch(async () => (await this.allDetails).refNotes);
    }

    private get allDetails() {
        return this._allDetails.fetch( () => { throw error(`Unable to fetch missing details for commit: '${this.id}', lazy-loading not supported`); });
    }

    get reachableBy() {
        return this._reachableBy.fetch(async () => {

            // We map result into temporary object as filter(async) doesn't do what we imagine it to do !
            const results = await Promise.all((await map_values(this.repository.allRefs)).map(async ref => {
                const refHeadId = await ref.commitId;

                // Lookup via cache first as traversing ancestors can be expensive
                const contains = this.repository.persistentCacheService.isReachableBy(
                    this.id,
                    refHeadId, async () => ((await (await ref.commit).ancestors).includes(this)));

                return { ref, contains };
            }));

            return results.filter(result => result.contains).map(result => result.ref);
        });
    }

    get ancestors() {
        return this._ancestors.fetch(async () => {
            const results: CommitModel[] = [];

            let current: CommitModel = this;

            while (current) {
                results.push(current);
                current = await current.firstParent;
            }

            return results;
        });
    }

    get allAncestors() {
        return this._allAncestors.fetch(async () => {
            const results: CommitModel[] = [];
            await this.recurseAllAncestors(this, new Set<string>(), results);
            return results;
        });
    }

    private async recurseAllAncestors(current: CommitModel, seenCommitIds: Set<string>, results: CommitModel[]): Promise<void> {
        if (!current || seenCommitIds.has(current.id)) {
            return;
        }
        seenCommitIds.add(current.id);
        results.push(current);
        await Promise.all((await current.parents).map(parent => this.recurseAllAncestors(parent, seenCommitIds, results)));
    }
}
