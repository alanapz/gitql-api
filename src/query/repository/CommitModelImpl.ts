import { Check } from "src/check";
import { GitLogLine, GitPrincipal, Ref } from "src/git/types";
import { CommitModel, RefModel, RepositoryModel, TreeModel } from "src/query/repository/types";
import { lazyValue } from "src/utils/lazy-value";

const check: Check = require.main.require("./check");

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

    private readonly _reachableByRefs = lazyValue<Ref[]>();

    private readonly _reachableBy = lazyValue<RefModel[]>();

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
        return this._allDetails.fetch(async () => {
            for (const result of await this.repository.gitService.lookupCommit(this.repository.path, [this.id])) {
                if (result.id === this.id) {
                    return result;
                }
            }
            throw check.error(`Unable to retrieve details for commit: '${this.id}'`);
        })
    }

    get reachableBy() {
        return this._reachableBy.fetch(async () => {
            const refs = await this._reachableByRefs.fetch(async () => Array.from(await this.repository.gitService.listCommitReachableBy(this.repository.path, this.id)));
            console.log("refs", refs);
            return Promise.all(refs.map(ref => this.repository.lookupRef(ref, 'throw')));
        });
    }
}