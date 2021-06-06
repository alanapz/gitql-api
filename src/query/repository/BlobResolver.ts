import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GitBlob } from "src/generated/graphql";
import { BlobModel, RepositoryModel } from "src/query/repository/types";

@Resolver("GitBlob")
export class BlobResolver {

    @ResolveField("id")
    getId(@Parent() blob: BlobModel): Promise<string> {
        return Promise.resolve(blob.id);
    }

    @ResolveField("repository")
    getRepository(@Parent() blob: BlobModel): Promise<RepositoryModel> {
        return Promise.resolve(blob.repository);
    }

    @ResolveField("size")
    getSize(@Parent() blob: BlobModel): Promise<number> {
        return blob.size;
    }

    @ResolveField("value")
    getValue(@Parent() blob: BlobModel): Promise<string> {
        return blob.value;
    }
}
