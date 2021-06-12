import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { RemoteModel, WebUrlModel } from "src/repository";

@Resolver("GitWebUrl")
export class WebUrlResolver {

    @ResolveField("remote")
    getRemote(@Parent() model: WebUrlModel): Promise<RemoteModel> {
        return Promise.resolve(model.remote);
    }

    @ResolveField("url")
    getUrl(@Parent() model: WebUrlModel): Promise<string> {
        return Promise.resolve(model.url);
    }
}
