import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
<<<<<<< HEAD
import { RemoteModel, TrackingBranchRefModel } from "src/repository";
=======
import { BranchRefModel, RefDistanceModel, TrackingBranchRefModel } from "src/repository";
>>>>>>> GQL14 - Add provider config support
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

    @ResolveField("upstream")
    getUpstream(@Parent() model: BranchRefModel): Promise<TrackingBranchRefModel> {
        return model.upstream;
    }

    @ResolveField("upstreamDistance")
    async getUpstreamDistance(@Parent() model: BranchRefModel): Promise<RefDistanceModel> {
        const upstream = await model.upstream;
        return (upstream ? this.calculateDistance(model.repository, model.ref, upstream.ref) : null);
    }

    @ResolveField("webUrl")
    getWebUrl(@Parent() model: TrackingBranchRefModel): Promise<string> {
        return model.webUrl;
    }
}
