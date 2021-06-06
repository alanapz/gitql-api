import { Check } from "src/check";
import { TrackingBranchRef } from "src/git/types";
import { RefModelImplSupport } from "src/query/repository/RefModelImplSupport";
import { RepositoryModel, TrackingBranchRefModel } from "src/query/repository/types";

const check: Check = require.main.require("./check");

export class TrackingBranchRefModelImpl extends RefModelImplSupport implements TrackingBranchRefModel {

    readonly __typename = "GitTrackingBranch";

    readonly kind = "TRACKING";

    constructor(protected readonly _repository: RepositoryModel, protected readonly _ref: TrackingBranchRef, protected readonly _commitId: string) {
        super();
        check.nonNull(_repository, "repository");
        check.nonNull(_ref, "_ref");
        check.stringNonNullNotEmpty(_commitId, "commitId");
    }

    get displayName() {
        return this.name;
    }

    get name() {
        return `${this._ref.remoteName}/${this._ref.branchName}`;
    }
}
