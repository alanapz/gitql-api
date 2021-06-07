import { error } from "src/check";
import { GitTreeItem, GitTreeItemType } from "src/git/types";
import { RepositoryModel, TreeItemModel, TreeModel } from "src/repository";
import { TreeItemBlobModelImpl } from "src/repository/tree-item-blob-model-impl";
import { TreeItemSubtreeModelImpl } from "src/repository/tree-item-subtree-model";
import { lazyValue } from "src/utils/lazy-value";

export class TreeModelImpl implements TreeModel {

    private readonly _items = lazyValue<TreeItemModel[]>();

    constructor(readonly repository: RepositoryModel, readonly id: string) {

    }

    get items() {
        return this._items.fetch(async () => {
            const treeItems = Array.from(await this.repository.gitService.listTreeItems(this.repository.path, this.id));
            return Promise.all(treeItems.map(item => this.buildTreeItem(item)));
        });
    }

    private buildTreeItem(item: GitTreeItem): TreeItemModel {
        if (item.type === GitTreeItemType.Blob) {
            return new TreeItemBlobModelImpl(this, item.name, item.mode, item.id);
        }
        if (item.type === GitTreeItemType.Subtree) {
            return new TreeItemSubtreeModelImpl(this, item.name, item.mode, item.id);
        }
        throw error(`Unexpected tree item type: '${item.type}' for item: '${item.id}'`);
    }
}