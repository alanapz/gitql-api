import { TrackingBranchRef } from "src/git";
import { CommitModel, RemoteModel, RepositoryModel, TrackingBranchRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class TrackingBranchRefModelImpl implements TrackingBranchRefModel {

    readonly __typename = "GitTrackingBranch";

    readonly kind = "TRACKING";

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _remote = lazyValue<RemoteModel>();

    constructor(readonly repository: RepositoryModel, readonly ref: TrackingBranchRef, private readonly _commitId: string) {

    }

    get displayName() {
        return this.name;
    }

    get name() {
        return `${this.ref.remote}/${this.ref.name}`;
    }

    get commitId() {
        return Promise.resolve(this._commitId);
    }

    get commit() {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }

    get remote() {
        return this._remote.fetch(async () => this.repository.lookupRemote(this.ref.remote, 'throw'));
    }
}
