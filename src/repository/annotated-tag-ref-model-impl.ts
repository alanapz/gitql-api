import { GitPrincipal, TagRef } from "src/git";
import { AnnotatedTagModel, CommitModel, RepositoryModel, TagRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class AnnotatedTagRefModelImpl implements TagRefModel {

    readonly __typename = "GitTag";

    readonly kind = "TAG";

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _tagMessage = lazyValue<string>();

    private readonly _tagAuthor = lazyValue<GitPrincipal>();

    private readonly _annotatedTag = lazyValue<AnnotatedTagModel>();

    constructor(readonly repository: RepositoryModel, readonly ref: TagRef, private readonly _annotatedTagId: string) {

    }

    get displayName() {
        return this.name;
    }

    get commit() {
        return this._commit.fetch(async () => (await this.annotatedTag).commit);
    }

    get name() {
        return this.ref.name;
    }

    get tagMessage() {
        return this._tagMessage.fetch(async () => (await this.annotatedTag).tagMessage);
    }

    get tagAuthor() {
        return this._tagAuthor.fetch(async () => (await this.annotatedTag).tagAuthor);
    }

    private get annotatedTag() {
        return this._annotatedTag.fetch(() => this.repository.lookupAnnotatedTag(this._annotatedTagId, 'throw'));
    }
}
