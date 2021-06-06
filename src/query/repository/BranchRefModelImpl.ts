import { Check } from "src/check";
import { BranchRef } from "src/git/types";
import { RefModelImplSupport } from "src/query/repository/RefModelImplSupport";
import { BranchRefModel, RepositoryModel, TrackingBranchRefModel } from "src/query/repository/types";
import { lazyValue } from "src/utils/lazy-value";

const check: Check = require.main.require("./check");

export class BranchRefModelImpl extends RefModelImplSupport implements BranchRefModel {

    readonly __typename = "GitBranch";

    readonly kind = "BRANCH";

    private readonly _upstream = lazyValue<TrackingBranchRefModel>();

    constructor(protected readonly _repository: RepositoryModel, protected readonly _ref: BranchRef, protected readonly _commitId: string) {
        super();
        check.nonNull(_repository, "repository");
        check.nonNull(_ref, "ref");
        check.stringNonNullNotEmpty(_commitId, "commitId");
    }

    get displayName() {
        return this.name;
    }

    get name() {
        return this._ref.branchName;
    }

    get upstream() {
        return this._upstream.fetch(async () => {
            const upstream = (await this.repository.gitConfig).resolveUpstream(this._ref);
            return (upstream ? this.repository.lookupTrackingBranch(upstream, 'null') : null);
        });
    }
}
