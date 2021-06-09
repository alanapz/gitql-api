import { GitPrincipal, TagRef } from "src/git";
import { CommitModel, RepositoryModel, TagRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class LightweightTagRefModelImpl implements TagRefModel {

    readonly __typename = "GitTag";

    readonly kind = "TAG";

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _message = lazyValue<string>();

    private readonly _author = lazyValue<GitPrincipal>();

    constructor(readonly repository: RepositoryModel, readonly ref: TagRef, private readonly _commitId: string) {

    }

    get displayName() {
        return this.name;
    }

    get commitId() {
        return Promise.resolve(this._commitId);
    }

    get commit() {
        return this._commit.fetch(() => this.repository.lookupCommit(this._commitId, 'throw'));
    }

    get name() {
        return this.ref.name;
    }

    get message() {
        return this._message.fetch(async () => (await this.commit).subject);
    }

    get author() {
        return this._author.fetch(async () => (await this.commit).author);
    }
}
