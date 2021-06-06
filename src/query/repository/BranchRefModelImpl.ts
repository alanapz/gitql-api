import { BranchRef } from "src/git/types";
import { RefModelImplSupport } from "src/query/repository/RefModelImplSupport";
import { BranchRefModel, RepositoryModel, TrackingBranchRefModel } from "src/query/repository/types";
import { lazyValue } from "src/utils/lazy-value";

export class BranchRefModelImpl extends RefModelImplSupport implements BranchRefModel {

    readonly __typename = "GitBranch";

    readonly kind = "BRANCH";

    private readonly _upstream = lazyValue<TrackingBranchRefModel>();

    constructor(repository: RepositoryModel, private readonly _branchRef: BranchRef, commitId: string) {
        super(repository, _branchRef, commitId);
    }

    get displayName() {
        return this.name;
    }

    get name() {
        return this.ref.name;
    }

    get upstream() {
        return this._upstream.fetch(async () => {
            const upstream = (await this.repository.gitConfig).resolveUpstream(this._branchRef);
            return (upstream ? this.repository.lookupTrackingBranch(upstream, 'null') : null);
        });
    }
}
