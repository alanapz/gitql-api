import { GitPrincipal } from "src/git";
import { AnnotatedTagModel, CommitModel, RepositoryModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class AnnotatedTagModelImpl implements AnnotatedTagModel {

    private readonly _commit = lazyValue<CommitModel>();

    constructor(readonly repository: RepositoryModel, readonly id: string, private readonly _commitId: string, private readonly _message: string, private readonly _author: GitPrincipal) {

    }

    get commitId() {
        return Promise.resolve(this._commitId);
    }

    get commit() {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }

    get message() {
        return Promise.resolve(this._message);
    }

    get author() {
        return Promise.resolve(this._author);
    }
}
