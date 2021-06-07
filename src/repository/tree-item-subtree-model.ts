import { TreeItemSubtreeModel, TreeModel } from "src/repository";

export class TreeItemSubtreeModelImpl implements TreeItemSubtreeModel {

    readonly __typename = "GitTreeSubtreeItem";

    readonly kind = "SUBTREE";

    constructor(public readonly tree: TreeModel, public readonly name: string, public readonly mode: number, public readonly subtreeId: string) {

    }

    get subtree() {
        return this.tree.repository.lookupTree(this.subtreeId, 'throw');
    }
}
