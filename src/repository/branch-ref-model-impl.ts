import { BranchRef } from "src/git";
import { BranchRefModel, CommitModel, RepositoryModel, TrackingBranchRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class BranchRefModelImpl implements BranchRefModel {

    readonly __typename = "GitBranch";

    readonly kind = "BRANCH";

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _upstream = lazyValue<TrackingBranchRefModel>();

    constructor(readonly repository: RepositoryModel, readonly ref: BranchRef, private readonly _commitId: string) {

    }

    get displayName() {
        return this.name;
    }

    get name() {
        return this.ref.name;
    }

    get commit() {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }

    get upstream() {
        return this._upstream.fetch(async () => {
            const upstream = (await this.repository.gitConfig).resolveUpstream(this.ref);
            return (upstream ? this.repository.lookupTrackingBranch(upstream, 'null') : null);
        });
    }
}
