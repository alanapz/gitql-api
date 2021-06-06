import { Ref } from "src/git/types";
import { RepositoryModel } from "src/query/repository/types";

export abstract class RefModelImplSupport {

    protected abstract _ref: Ref;

    protected abstract _repository: RepositoryModel;

    protected abstract _commitId: string;

    get ref() {
        return this._ref;
    }

    get repository() {
        return this._repository;
    }

    get commit() {
        return Promise.resolve(this._repository.lookupCommit(this._commitId, 'throw'));
    }
}
