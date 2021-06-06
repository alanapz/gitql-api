import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { TreeItemResolver } from "src/query/repository/TreeItemResolver";
import { TreeItemSubtreeModel, TreeModel } from "src/query/repository/types";

@Resolver("GitTreeSubtreeItem")
export class TreeItemSubtreeResolver extends TreeItemResolver {

    @ResolveField("subtree")
    getSubtree(@Parent() model: TreeItemSubtreeModel): Promise<TreeModel> {
        return model.subtree;
    }
}
