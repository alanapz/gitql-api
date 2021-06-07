import { Parent, ResolveField } from "@nestjs/graphql";
import { TreeItemModel, TreeModel } from "src/repository";

export abstract class TreeItemResolver {

    @ResolveField("tree")
    getTreeItemTree(@Parent() model: TreeItemModel): Promise<TreeModel> {
        return Promise.resolve(model.tree);
    }

    @ResolveField("name")
    getTreeItemName(@Parent() model: TreeItemModel): Promise<string> {
        return Promise.resolve(model.name);
    }

    @ResolveField("mode")
    getTreeItemMode(@Parent() model: TreeItemModel): Promise<number> {
        return Promise.resolve(model.mode);
    }
}
