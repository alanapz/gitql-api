import { GitPrincipal, TagRef } from "src/git";
import { CommitModel, RepositoryModel, TagRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class LightweightTagRefModelImpl implements TagRefModel {

    readonly __typename = "GitTag";

    readonly kind = "TAG";

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _tagMessage = lazyValue<string>();

    private readonly _tagAuthor = lazyValue<GitPrincipal>();

    constructor(readonly repository: RepositoryModel, readonly ref: TagRef, private readonly _commitId: string) {

    }

    get displayName() {
        return this.name;
    }

    get commit() {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }

    get name() {
        return this.ref.name;
    }

    get tagMessage() {
        return this._tagMessage.fetch(async () => (await this.commit).subject);
    }

    get tagAuthor() {
        return this._tagAuthor.fetch(async () => (await this.commit).author);
    }
}
