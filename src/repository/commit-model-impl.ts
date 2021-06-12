import { error } from "src/check";
import { GitPrincipal } from "src/git";
import { GitLogLine } from "src/git/types";
import { CommitModel, RefModel, RepositoryModel, TreeModel, WebUrlModel } from "src/repository";
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

    private readonly _webUrls = lazyValue<WebUrlModel[]>();

    constructor(readonly repository: RepositoryModel, private readonly _input: GitLogLine) {
        this._parentIds.setIfNotNull(_input.parentIds);
        this._treeId.setIfNotNull(_input.treeId);
        this._author.setIfNotNull(_input.author);
        this._committer.setIfNotNull(_input.committer);
        this._subject.setIfNotNull(_input.subject);
        this._message.setIfNotNull(_input.message);
        this._refNotes.setIfNotNull(_input.refNotes);
    }

    get id(): string {
        return this._input.id;
    }

    get parents(): Promise<CommitModel[]> {
        return this._parents.fetch(async () => {
            const parentIds = await this._parentIds.fetch(async () => (await this.allDetails).parentIds);
            return Promise.all(parentIds.map(parentId => this.repository.lookupCommit(parentId, 'throw')));
        });
    }

    get firstParent(): Promise<CommitModel> {
        return this._firstParent.fetch(async () => {
            const parentIds = await this._parentIds.fetch(async () => (await this.allDetails).parentIds);
            if (!parentIds.length) {
                return null;
            }
            return this.repository.lookupCommit(parentIds[0], 'throw');
        });
    }

    get tree(): Promise<TreeModel> {
        return this._tree.fetch(async () => {
            const treeId = await this._treeId.fetch(async () => (await this.allDetails).treeId);
            return this.repository.lookupTree(treeId, 'throw');
        });
    }

    get author(): Promise<GitPrincipal> {
        return this._author.fetch(async () => (await this.allDetails).author);
    }

    get committer(): Promise<GitPrincipal> {
        return this._committer.fetch(async () => (await this.allDetails).committer);
    }

    get subject(): Promise<string> {
        return this._subject.fetch(async () => (await this.allDetails).subject);
    }

    get message(): Promise<string> {
        return this._message.fetch(async () => (await this.allDetails).message);
    }

    get refNotes(): Promise<string[]> {
        return this._refNotes.fetch(async () => (await this.allDetails).refNotes);
    }

    private get allDetails(): Promise<GitLogLine> {
        return this._allDetails.fetch( () => { throw error(`Unable to fetch missing details for commit: '${this.id}', lazy-loading not supported`); });
    }

    get reachableBy(): Promise<RefModel[]> {
        return this._reachableBy.fetch(async () => {

            // We map result into temporary object as filter(async) doesn't do what we imagine it to do !
            const results = await Promise.all((await map_values(this.repository.allRefs)).map(async ref => {
                const refHeadId = await ref.commitId;

                // Lookup via cache first as traversing ancestors can be expensive
                const contains = await this.repository.cacheService.isReachableBy(
                    this.id,
                    refHeadId,
                    async () => ((await (await ref.commit).ancestors).includes(this)));

                return { ref, contains };
            }));

            return results.filter(result => result.contains).map(result => result.ref);
        });
    }

    get ancestors(): Promise<CommitModel[]> {
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

    get allAncestors(): Promise<CommitModel[]> {
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

    get webUrls(): Promise<WebUrlModel[]> {
        return this._webUrls.fetch(async () => map_values(this.repository.allRemotes).then(remotes => Promise.all(remotes.map(async remote => {
            const url = (await (await remote.webUrlHandler)).commitUrl(this);
            return ({ remote, url });
        }))).then(results => results.filter(result => !! result.url)));
    }
}