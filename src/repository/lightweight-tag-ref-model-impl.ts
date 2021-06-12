import { GitPrincipal, TagRef } from "src/git";
import { CommitModel, RepositoryModel, TagRefModel, WebUrlModel } from "src/repository";
import { RepositoryUtils } from "src/repository/repository-utils";
import { lazyValue } from "src/utils/lazy-value";

export class LightweightTagRefModelImpl implements TagRefModel {

    readonly __typename = "GitTag";

    readonly kind = "TAG";

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _message = lazyValue<string>();

    private readonly _author = lazyValue<GitPrincipal>();

    private readonly _webUrls = lazyValue<WebUrlModel[]>();

    constructor(readonly repository: RepositoryModel, readonly ref: TagRef, private readonly _commitId: string) {

    }

    get displayName(): string {
        return this.name;
    }

    get commitId(): Promise<string> {
        return Promise.resolve(this._commitId);
    }

    get commit(): Promise<CommitModel> {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }

    get name(): string {
        return this.ref.name;
    }

    get message(): Promise<string> {
        return this._message.fetch(async () => (await this.commit).subject);
    }

    get author(): Promise<GitPrincipal> {
        return this._author.fetch(async () => (await this.commit).author);
    }

    get webUrls(): Promise<WebUrlModel[]> {
        return this._webUrls.fetch(() => RepositoryUtils.getRefWebUrls(this.repository, this));
    }
}
