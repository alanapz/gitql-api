import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { TreeDescendantModel, TreeItemModel } from "src/repository";

@Resolver("GitTreeDescendant")
export class TreeDescendantResolver {

    @ResolveField("path")
    getPath(@Parent() model: TreeDescendantModel): Promise<string> {
        return Promise.resolve(model.path);
    }

    @ResolveField("item")
    getItem(@Parent() model: TreeDescendantModel): Promise<TreeItemModel> {
        return Promise.resolve(model.item);
    }
}
