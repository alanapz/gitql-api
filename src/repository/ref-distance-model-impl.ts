import { Ref } from "src/git";
import { CommitModel, RefDistanceModel, RepositoryModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class RefDistanceModelImpl implements RefDistanceModel {

    private readonly _mergeBase = lazyValue<CommitModel>();

    constructor(
        private readonly _repository: RepositoryModel,
        private readonly _sourceRef: Ref,
        private readonly _targetRef: Ref,
        private readonly _ahead: number,
        private readonly _behind: number,
        private readonly _mergeBaseId: string) {
    }

    get ahead() {
        return Promise.resolve(this._ahead);
    }

    get behind() {
        return Promise.resolve(this._behind);
    }

    get mergeBaseId() {
        return Promise.resolve(this._mergeBaseId);
    }

    get mergeBase() {
        return this._mergeBase.fetch(() => this._repository.lookupCommit(this._mergeBaseId, 'throw'));
    }
}
