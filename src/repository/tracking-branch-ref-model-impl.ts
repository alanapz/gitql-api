import { TrackingBranchRef } from "src/git";
import { CommitModel, RepositoryModel, TrackingBranchRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class TrackingBranchRefModelImpl implements TrackingBranchRefModel {

    readonly __typename = "GitTrackingBranch";

    readonly kind = "TRACKING";

    private readonly _commit = lazyValue<CommitModel>();

    constructor(readonly repository: RepositoryModel, readonly ref: TrackingBranchRef, private readonly _commitId: string) {

    }

    get displayName() {
        return this.name;
    }

    get name() {
        return `${this.ref.remote}/${this.ref.name}`;
    }

    get commit() {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }
}
