import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { TreeItemSubtreeModel, TreeModel } from "src/repository";
import { TreeItemResolver } from "src/resolver/tree-item-resolver";

@Resolver("GitTreeSubtreeItem")
export class TreeItemSubtreeResolver extends TreeItemResolver {

    @ResolveField("subtree")
    getSubtree(@Parent() model: TreeItemSubtreeModel): Promise<TreeModel> {
        return model.subtree;
    }
}
