import { Args, Parent, ResolveField } from "@nestjs/graphql";
import { stringNotNullNotEmpty } from "src/check";
import { GitUtils } from "src/git/utils";
import { CommitModel, RefDistanceModel, RefModel, RepositoryModel } from "src/repository";
import { RepositoryUtils } from "src/repository/repository-utils";

export abstract class RefResolver {

    @ResolveField("refName")
    getRefName(@Parent() model: RefModel): Promise<string> {
        return Promise.resolve(model.ref.refName);
    }

    @ResolveField("displayName")
    getDisplayName(@Parent() model: RefModel): Promise<string> {
        return Promise.resolve(model.displayName);
    }

    @ResolveField("repository")
    getRepository(@Parent() model: RefModel): Promise<RepositoryModel> {
        return Promise.resolve(model.repository);
    }

    @ResolveField("commit")
    getCommit(@Parent() model: RefModel): Promise<CommitModel> {
        return model.commit;
    }

    @ResolveField("ancestors")
    async getAncestors(@Parent() model: RefModel,  @Args('count') count: number): Promise<CommitModel[]> {
        const commit = await model.commit;
        if (!commit) {
            return [];
        }
        return (await commit.ancestors).slice(0, count);
    }

    @ResolveField("distance")
    async getDistance(@Parent() model: RefModel, @Args('refName') refName: string): Promise<RefDistanceModel> {
        stringNotNullNotEmpty(refName, "refName");
        return RepositoryUtils.calculateDistance(model.repository, model.ref, GitUtils.parseExplicitRef(refName));
    }
}
