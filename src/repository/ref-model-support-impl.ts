import { Ref } from "src/git/types";
import { CommitModel, RepositoryModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";
import { xxx_todo_fixme } from "src/utils/utils";

export abstract class RefModelSupportImpl {

    private readonly _commitId = lazyValue<string>();

    private readonly _commit = lazyValue<CommitModel>();

    constructor(private readonly _repository: RepositoryModel, private readonly _ref: Ref, commitId: string) {
        this._commitId.setIfNotNull(commitId);
    }

    get ref() {
        return this._ref;
    }

    get repository() {
        return this._repository;
    }

    get commit() {
        return this._commit.fetch(async () => {
            const commitId = await this._commitId.fetch(async () => { throw xxx_todo_fixme(); });
            return Promise.resolve(this._repository.lookupCommit(commitId, 'throw'));
        });
    }
}
