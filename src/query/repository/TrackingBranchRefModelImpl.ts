import { TrackingBranchRef } from "src/git/types";
import { RefModelImplSupport } from "src/query/repository/RefModelImplSupport";
import { RepositoryModel, TrackingBranchRefModel } from "src/query/repository/types";

export class TrackingBranchRefModelImpl extends RefModelImplSupport implements TrackingBranchRefModel {

    readonly __typename = "GitTrackingBranch";

    readonly kind = "TRACKING";

    constructor(repository: RepositoryModel, private readonly _trackingRef: TrackingBranchRef, commitId: string) {
        super(repository, _trackingRef, commitId);
    }

    get displayName() {
        return this.name;
    }

    get name() {
        return `${this._trackingRef.remote}/${this._trackingRef.name}`;
    }
}
