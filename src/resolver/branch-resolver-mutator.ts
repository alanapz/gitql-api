import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GitService } from "src/git/git.service";
import { BranchRefModel } from "src/repository";

@Resolver("GQLBranchMutator")
export class BranchResolverMutator {

    constructor(private readonly gitService: GitService) {

    }

    @ResolveField("delete")
    async deleteBranch(@Parent() model: BranchRefModel): Promise<unknown> {
        await this.gitService.deleteBranch(model.repository.path, model.name);
        return true;
    }
}
