import { Check } from "src/check";
import { TreeItemBlobModel, TreeModel } from "src/query/repository/types";

const check: Check = require.main.require("./check");

export class TreeItemBlobModelImpl implements TreeItemBlobModel {

    readonly __typename = "GitTreeBlobItem";

    readonly kind = "BLOB";

    constructor(public readonly tree: TreeModel, public readonly name: string, public readonly mode: number, public readonly blobId: string) {
        check.nonNull(tree, 'tree');
        check.stringNonNullNotEmpty(name, 'name');
        check.nonNull(mode, 'mode');
        check.stringNonNullNotEmpty(blobId, 'blobId');
    }

    get blob() {
        return this.tree.repository.lookupBlob(this.blobId, 'throw');
    }
}
