import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { BranchRefModel, RefDistanceModel, TrackingBranchRefModel } from "src/repository";
import { RepositoryUtils } from "src/repository/repository-utils";
import { RefResolver } from "src/resolver/ref-resolver";

@Resolver("GitBranch")
export class BranchRefResolver extends RefResolver {

    @ResolveField("branchName")
    getBranchName(@Parent() model: BranchRefModel): Promise<string> {
        return Promise.resolve(model.name);
    }

    @ResolveField("upstream")
    getUpstream(@Parent() model: BranchRefModel): Promise<TrackingBranchRefModel> {
        return model.upstream;
    }

    @ResolveField("upstreamDistance")
    async getUpstreamDistance(@Parent() model: BranchRefModel): Promise<RefDistanceModel> {
        const upstream = await model.upstream;
        return (upstream && RepositoryUtils.calculateDistance(model.repository, model.ref, upstream.ref));
    }
}
