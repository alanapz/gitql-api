import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { stringNotNullNotEmpty } from "src/check";
import { GitService } from "src/git/git.service";
import { GitUtils } from "src/git/utils";
import { BranchRefModel, RepositoryModel } from "src/repository";

@Resolver("GQLRepositoryMutator")
export class RepositoryResolverMutator {

    constructor(private readonly gitService: GitService) {

    }

    @ResolveField("branch")
    getBranchByName(@Parent() model: RepositoryModel, @Args('name') branchName: string): Promise<BranchRefModel> {
        stringNotNullNotEmpty(branchName, 'branchName');
        return model.lookupBranch(GitUtils.toBranchRef(branchName), 'null');
    }

    @ResolveField("fetch")
    async fetchRepository(@Parent() model: RepositoryModel): Promise<unknown> {
        await this.gitService.fetchRepository(model.path);
        return true;
    }

    @ResolveField("cleanWorkingDirectory")
    async cleanWorkingDirectory(@Parent() model: RepositoryModel): Promise<unknown> {
        await this.gitService.cleanWorkingDirectory(model.path);
        return true;
    }
}
