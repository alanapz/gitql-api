import { TagRef } from "src/git/types";
import { RefModelImplSupport } from "src/query/repository/RefModelImplSupport";
import { RepositoryModel, TagRefModel } from "src/query/repository/types";

export class TagRefModelImpl extends RefModelImplSupport implements TagRefModel {

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
