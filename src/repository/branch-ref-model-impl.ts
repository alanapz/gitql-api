import { BranchRef } from "src/git";
import { GitUtils } from "src/git/utils";
import { BranchRefModel, CommitModel, RepositoryModel, TrackingBranchRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class BranchRefModelImpl implements BranchRefModel {

    readonly __typename = "GitBranch";

    readonly kind = "BRANCH";

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _upstream = lazyValue<TrackingBranchRefModel>();

    private readonly _isTrunk = lazyValue<boolean>();

    private readonly _parent = lazyValue<TrackingBranchRefModel>();

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

            // First check if an explicit upstream has been configured (via git push or set-upstream-to)
            const upstreamRef = (await this.repository.gitConfig).resolveUpstream(this.ref);
            if (upstreamRef) {
                return this.repository.lookupTrackingBranch(upstreamRef, 'null');
            }

            // Otherwise, the the branch origin/our brnahc name exists, assume it'S our upstream
            const implictUpstream = await this.repository.lookupTrackingBranch(GitUtils.toTrackingBranchRef(`refs/remotes/origin/${this.name}`), 'null');
            if (implictUpstream) {
                return Promise.resolve(implictUpstream);
            }

            // Otherwise...
            return null;
        });
    }

    get isTrunk(): Promise<boolean> {
        return this._isTrunk.fetch(async () => (await this.repository.trunkConfigHandler).isTrunk(this));
    }

    get parent(): Promise<TrackingBranchRefModel> {
        return this._parent.fetch(async () => (await this.repository.trunkConfigHandler).resolveParent(this));
    }
}
