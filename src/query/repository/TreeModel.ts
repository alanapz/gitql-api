import { Check } from "src/check";
import { GitTreeItem, GitTreeItemType } from "src/git/types";
import { TreeItemBlobModelImpl } from "src/query/repository/TreeItemBlobModel";
import { TreeItemSubtreeModelImpl } from "src/query/repository/TreeItemSubtreeModel";
import { RepositoryModel, TreeItemModel, TreeModel } from "src/query/repository/types";
import { lazyValue } from "src/utils/lazy-value";

const check: Check = require.main.require("./check");

export class TreeModelImpl implements TreeModel {

    private readonly _items = lazyValue<TreeItemModel[]>();

    constructor(private readonly _repository: RepositoryModel, private readonly _id: string) {
        check.nonNull(_repository, "repository");
        check.stringNonNullNotEmpty(_id, "id");
    }

    get id() {
        return this._id;
    }

    get repository() {
        return this._repository;
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
        throw check.error(`Unexpected tree item type: '${item.type}' for item: '${item.id}'`);
    }
}