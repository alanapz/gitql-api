import { GitPrincipal } from "src/git";
import { AnnotatedTagModel, CommitModel, RepositoryModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class AnnotatedTagModelImpl implements AnnotatedTagModel {

    private readonly _commit = lazyValue<CommitModel>();

    constructor(readonly repository: RepositoryModel, readonly id: string, private readonly _commitId: string, private readonly _tagMessage: string, private readonly _tagAuthor: GitPrincipal) {

    }

    get commit() {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }

    get tagMessage() {
        return Promise.resolve(this._tagMessage);
    }

    get tagAuthor() {
        return Promise.resolve(this._tagAuthor);
    }
}
