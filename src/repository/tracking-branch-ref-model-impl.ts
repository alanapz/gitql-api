import { TrackingBranchRef } from "src/git";
import { CommitModel, RemoteModel, RepositoryModel, TrackingBranchRefModel, WebUrlModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class TrackingBranchRefModelImpl implements TrackingBranchRefModel {

    readonly __typename = "GitTrackingBranch";

    readonly kind = "TRACKING";

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _remote = lazyValue<RemoteModel>();

    private readonly _isTrunk = lazyValue<boolean>();

    private readonly _parent = lazyValue<TrackingBranchRefModel>();

    private readonly _webUrl = lazyValue<WebUrlModel>();

    constructor(readonly repository: RepositoryModel, readonly ref: TrackingBranchRef, private readonly _commitId: string) {

    }

    get displayName(): string {
        return `${this.ref.remote}/${this.ref.name}`;
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

    get remote(): Promise<RemoteModel> {
        return this._remote.fetch(async () => this.repository.lookupRemote(this.ref.remote, 'throw'));
    }

    get isTrunk(): Promise<boolean> {
        return this._isTrunk.fetch(async () => (await this.repository.trunkConfigHandler).isTrunk(this));
    }

    get parent(): Promise<TrackingBranchRefModel> {
        return this._parent.fetch(async () => (await this.repository.trunkConfigHandler).resolveParent(this));
    }

    get webUrl(): Promise<WebUrlModel> {
        return this._webUrl.fetch(async () => {
            const remote = await this.remote;
            const url = (await remote.webUrlHandler).refUrl(this);
            return url && ({remote, url});
        });
    }
}
