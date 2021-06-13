import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { RefDistanceModel, RemoteModel, TrackingBranchRefModel, WebUrlModel } from "src/repository";
import { RepositoryUtils } from "src/repository/repository-utils";
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

    @ResolveField("isTrunk")
    isTrunk(@Parent() model: TrackingBranchRefModel): Promise<boolean> {
        return model.isTrunk;
    }

    @ResolveField("parent")
    getParent(@Parent() model: TrackingBranchRefModel): Promise<TrackingBranchRefModel> {
        return model.parent;
    }

    @ResolveField("parentDistance")
    async getParentDistance(@Parent() model: TrackingBranchRefModel): Promise<RefDistanceModel> {
        const parent = await model.parent;
        return (parent && RepositoryUtils.calculateDistance(model.repository, model.ref, parent.ref));
    }

    @ResolveField("webUrl")
    getWebUrl(@Parent() model: TrackingBranchRefModel): Promise<WebUrlModel> {
        return model.webUrl;
    }
}
