import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { BlobModel, TreeItemBlobModel } from "src/repository";
import { TreeItemResolver } from "src/resolver/tree-item-resolver";

@Resolver("GitTreeBlobItem")
export class TreeItemBlobResolver extends TreeItemResolver {

    @ResolveField("blob")
    getBlob(@Parent() model: TreeItemBlobModel): Promise<BlobModel> {
        return model.blob;
    }
}
