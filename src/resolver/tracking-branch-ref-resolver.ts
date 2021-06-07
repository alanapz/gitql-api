import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { TrackingBranchRefModel } from "src/repository";
import { RefResolver } from "src/resolver/ref-resolver";
import { xxx_todo_fixme } from "src/utils/utils";

@Resolver("GitTrackingBranch")
export class TrackingBranchRefResolver extends RefResolver {

    @ResolveField("remote")
    getRemote(@Parent() model: TrackingBranchRefModel): Promise<string> {
        throw xxx_todo_fixme();
    }

    @ResolveField("branchName")
    getBranchName(@Parent() model: TrackingBranchRefModel): Promise<string> {
        return Promise.resolve(model.name);
    }
}
