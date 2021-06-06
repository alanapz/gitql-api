import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { RefDistanceModel } from "src/query/repository/RefDistanceModel";
import { CommitModel } from "src/query/repository/types";

@Resolver("GitRefDistance")
export class RefDistanceResolver {

    @ResolveField("mergeBase")
    getMergeBase(@Parent() model: RefDistanceModel): Promise<CommitModel> {
        return model.mergeBase;
    }

    @ResolveField("ahead")
    getAhead(@Parent() model: RefDistanceModel): Promise<number> {
        return model.ahead;
    }

    @ResolveField("behind")
    getBehind(@Parent() model: RefDistanceModel): Promise<number> {
        return model.behind;
    }
}
