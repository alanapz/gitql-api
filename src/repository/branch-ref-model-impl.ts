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

    get displayName(): string {
        return this.name;
    }

    get name(): string {
        return this.ref.name;
    }

    get commitId(): Promise<string> {
        return Promise.resolve(this._commitId);
    }

    get commit(): Promise<CommitModel> {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }

    get upstream(): Promise<TrackingBranchRefModel> {
        return this._upstream.fetch(async () => {
            const upstream = (await this.repository.gitConfig).resolveUpstream(this.ref);
            return (upstream && this.repository.lookupTrackingBranch(upstream, 'null'));
        });
    }
}
