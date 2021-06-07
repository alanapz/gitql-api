import { Ref } from "src/git/types";
import { RefDistanceModel, RepositoryModel } from "src/repository";

export class RefDistanceModelImpl implements RefDistanceModel{

    constructor(
        private readonly _repository: RepositoryModel,
        private readonly _sourceRef: Ref,
        private readonly _targetRef: Ref,
        private readonly _ahead: number,
        private readonly _behind: number,
        private readonly _mergeBaseCommitId: string) {
    }

    get ahead() {
        return Promise.resolve(this._ahead);
    }

    get behind() {
        return Promise.resolve(this._behind);
    }

    get mergeBase() {
        return this._repository.lookupCommit(this._mergeBaseCommitId, 'throw');
    }
}
