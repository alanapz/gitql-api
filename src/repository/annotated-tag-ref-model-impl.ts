import { GitPrincipal, TagRef } from "src/git";
import { AnnotatedTagModel, CommitModel, RepositoryModel, TagRefModel, WebUrlModel } from "src/repository";
import { RepositoryUtils } from "src/repository/repository-utils";
import { lazyValue } from "src/utils/lazy-value";

export class AnnotatedTagRefModelImpl implements TagRefModel {

    readonly __typename = "GitTag";

    readonly kind = "TAG";

    private readonly _commitId = lazyValue<string>();

    private readonly _commit = lazyValue<CommitModel>();

    private readonly _message = lazyValue<string>();

    private readonly _author = lazyValue<GitPrincipal>();

    private readonly _annotatedTag = lazyValue<AnnotatedTagModel>();

    private readonly _webUrls = lazyValue<WebUrlModel[]>();

    constructor(readonly repository: RepositoryModel, readonly ref: TagRef, private readonly _annotatedTagId: string) {

    }

    get displayName(): string {
        return this.name;
    }

    get commitId(): Promise<string> {
        return this._commitId.fetch(async () => (await this.annotatedTag).commitId);
    }

    get commit(): Promise<CommitModel> {
        return this._commit.fetch(async () => (await this.annotatedTag).commit);
    }

    get name(): string {
        return this.ref.name;
    }

    get message(): Promise<string> {
        return this._message.fetch(async () => (await this.annotatedTag).message);
    }

    get author(): Promise<GitPrincipal> {
        return this._author.fetch(async () => (await this.annotatedTag).author);
    }

    private get annotatedTag(): Promise<AnnotatedTagModel> {
        return this._annotatedTag.fetch(() => this.repository.lookupAnnotatedTag(this._annotatedTagId, 'throw'));
    }

    get webUrls(): Promise<WebUrlModel[]> {
        return this._webUrls.fetch(() => RepositoryUtils.getRefWebUrls(this.repository, this));
    }
}
