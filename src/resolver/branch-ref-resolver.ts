import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { BranchRefModel, RefDistanceModel, TrackingBranchRefModel } from "src/repository";
import { RefResolver } from "src/resolver/ref-resolver";
import { xxx_todo_fixme } from "src/utils/utils";

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
        return (upstream ? this.calculateDistance(model.repository, model.ref, upstream.ref) : null);
    }

    @ResolveField("parent")
    getParent(@Parent() model: BranchRefModel): Promise<TrackingBranchRefModel> {
        throw xxx_todo_fixme();
    }

    @ResolveField("parentDistance")
    getParentDistance(@Parent() model: BranchRefModel): Promise<RefDistanceModel> {
        throw xxx_todo_fixme();
    }
}
