import { GitPrincipal, TagRef } from "src/git";
import { AnnotatedTagModel, CommitModel, RepositoryModel, TagRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class AnnotatedTagRefModelImpl implements TagRefModel {

    readonly __typename = "GitTag";

    readonly kind = "TAG";

    private readonly _commitId = lazyValue<string>();

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _message = lazyValue<string>();

    private readonly _author = lazyValue<GitPrincipal>();

    private readonly _annotatedTag = lazyValue<AnnotatedTagModel>();

    constructor(readonly repository: RepositoryModel, readonly ref: TagRef, private readonly _annotatedTagId: string) {

    }

    get displayName() {
        return this.name;
    }

    get commitId() {
        return this._commitId.fetch(async () => (await this.annotatedTag).commitId);
    }

    get commit() {
        return this._commit.fetch(async () => (await this.annotatedTag).commit);
    }

    get name() {
        return this.ref.name;
    }

    get message() {
        return this._message.fetch(async () => (await this.annotatedTag).message);
    }

    get author() {
        return this._author.fetch(async () => (await this.annotatedTag).author);
    }

    private get annotatedTag() {
        return this._annotatedTag.fetch(() => this.repository.lookupAnnotatedTag(this._annotatedTagId, 'throw'));
    }
}
