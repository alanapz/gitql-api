import { Check } from "src/check";
import { Ref } from "src/git/types";
import { RepositoryModel } from "src/query/repository/types";

const check: Check = require.main.require("./check");

export class RefDistanceModel {

    constructor(
        private readonly _repository: RepositoryModel,
        private readonly _sourceRef: Ref,
        private readonly _targetRef: Ref,
        private readonly _ahead: number,
        private readonly _behind: number,
        private readonly _mergeBaseCommitId: string) {
        check.nonNull(_repository, "repository");
        check.nonNull(_sourceRef, "sourceRef");
        check.nonNull(_targetRef, "targetRef");
        check.stringNonNullNotEmpty(_mergeBaseCommitId, "mergeBaseCommitId");
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
