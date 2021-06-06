import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { RefResolver } from "src/query/repository/RefResolver";
import { TrackingBranchRefModel } from "src/query/repository/types";
import { xxx_todo_fixme } from "src/utils/utils";

@Resolver("GitTrackingBranch")
export class TrackingBranchRefResolver extends RefResolver{

    @ResolveField("remote")
    getRemote(@Parent() model: TrackingBranchRefModel): Promise<string> {
        throw xxx_todo_fixme();
    }

    @ResolveField("branchName")
    getBranchName(@Parent() model: TrackingBranchRefModel): Promise<string> {
        return Promise.resolve(model.name);
    }
}
