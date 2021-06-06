import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { TreeItemResolver } from "src/query/repository/TreeItemResolver";
import { BlobModel, TreeItemBlobModel } from "src/query/repository/types";

@Resolver("GitTreeBlobItem")
export class TreeItemBlobResolver extends TreeItemResolver {

    @ResolveField("blob")
    getBlob(@Parent() model: TreeItemBlobModel): Promise<BlobModel> {
        return model.blob;
    }
}
