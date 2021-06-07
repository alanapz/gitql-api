import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { CommitModel, RefDistanceModel } from "src/repository";

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
