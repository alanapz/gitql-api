import { TagRef } from "src/git/types";
import { RepositoryModel, TagRefModel } from "src/repository";
import { RefModelSupportImpl } from "src/repository/ref-model-support-impl";

export class TagRefModelImpl extends RefModelSupportImpl implements TagRefModel {

    readonly __typename = "GitTag";

    readonly kind = "TAG";

    constructor(repository: RepositoryModel, private readonly _tagRef: TagRef, commitId: string) {
        super(repository, _tagRef, commitId);
    }

    get displayName() {
        return this.name;
    }

    get name() {
        return this.ref.name;
    }
}
