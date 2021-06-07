import { TreeItemBlobModel, TreeModel } from "src/repository";

export class TreeItemBlobModelImpl implements TreeItemBlobModel {

    readonly __typename = "GitTreeBlobItem";

    readonly kind = "BLOB";

    constructor(public readonly tree: TreeModel, public readonly name: string, public readonly mode: number, public readonly blobId: string) {

    }

    get blob() {
        return this.tree.repository.lookupBlob(this.blobId, 'throw');
    }
}
