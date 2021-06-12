import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { RemoteModel, RepositoryModel } from "src/repository";

@Resolver("GitRemote")
export class RemoteResolver {

    @ResolveField("repository")
    getRepository(@Parent() model: RemoteModel): Promise<RepositoryModel> {
        return Promise.resolve(model.repository);
    }

    @ResolveField("name")
    getName(@Parent() model: RemoteModel): Promise<string> {
        return Promise.resolve(model.name);
    }

    @ResolveField("fetchUrl")
    getFetchUrl(@Parent() model: RemoteModel): Promise<string> {
        return model.fetchUrl;
    }

    @ResolveField("pushUrls")
    getPushUrls(@Parent() model: RemoteModel): Promise<string[]> {
        return model.pushUrls;
    }
}
