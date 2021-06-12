import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { RemoteModel, TrackingBranchRefModel, WebUrlModel } from "src/repository";
import { RefResolver } from "src/resolver/ref-resolver";

@Resolver("GitTrackingBranch")
export class TrackingBranchRefResolver extends RefResolver {

    @ResolveField("remote")
    getRemote(@Parent() model: TrackingBranchRefModel): Promise<RemoteModel> {
        return model.remote;
    }

    @ResolveField("branchName")
    getBranchName(@Parent() model: TrackingBranchRefModel): Promise<string> {
        return Promise.resolve(model.name);
    }

    @ResolveField("webUrl")
    getWebUrl(@Parent() model: TrackingBranchRefModel): Promise<WebUrlModel> {
        return model.webUrl;
    }
}
