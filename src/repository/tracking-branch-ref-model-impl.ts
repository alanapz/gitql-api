import { TrackingBranchRef } from "src/git/types";
import { RepositoryModel, TrackingBranchRefModel } from "src/repository";
import { RefModelSupportImpl } from "src/repository/ref-model-support-impl";

export class TrackingBranchRefModelImpl extends RefModelSupportImpl implements TrackingBranchRefModel {

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
