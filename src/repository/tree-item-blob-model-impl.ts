import { TreeItemBlobModel, TreeModel } from "src/repository";

export class TreeItemBlobModelImpl implements TreeItemBlobModel {

    readonly __typename = "GitTreeBlobItem";

    readonly kind = "BLOB";

    constructor(readonly tree: TreeModel, readonly name: string, readonly mode: number, readonly blobId: string) {

    }

    get blob() {
        return this.tree.repository.lookupBlob(this.blobId, 'throw');
    }
}
