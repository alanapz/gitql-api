import { Check } from "src/check";
import { TreeItemSubtreeModel, TreeModel } from "src/query/repository/types";

const check: Check = require.main.require("./check");

export class TreeItemSubtreeModelImpl implements TreeItemSubtreeModel {

    readonly __typename = "GitTreeSubtreeItem";

    readonly kind = "SUBTREE";

    constructor(public readonly tree: TreeModel, public readonly name: string, public readonly mode: number, public readonly subtreeId: string) {
        check.nonNull(tree, 'tree');
        check.stringNonNullNotEmpty(name, 'name');
        check.nonNull(mode, 'mode');
        check.stringNonNullNotEmpty(subtreeId, 'subtreeId');
    }

    get subtree() {
        return this.tree.repository.lookupTree(this.subtreeId, 'throw');
    }
}
