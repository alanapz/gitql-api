import { TreeItemSubtreeModel, TreeModel } from "src/repository";

export class TreeItemSubtreeModelImpl implements TreeItemSubtreeModel {

    readonly __typename = "GitTreeSubtreeItem";

    readonly kind = "SUBTREE";

    constructor(readonly tree: TreeModel, readonly name: string, readonly mode: number, readonly subtreeId: string) {

    }

    get subtree() {
        return this.tree.repository.lookupTree(this.subtreeId, 'throw');
    }
}
