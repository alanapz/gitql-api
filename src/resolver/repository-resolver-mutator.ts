import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { ConfigService } from "src/config/config.service";
import { GitService } from "src/git/git.service";
import { RepositoryModel } from "src/repository";
import { RepositoryService } from "src/repository/repository.service";

@Resolver("GitRepositoryMutator")
export class RepositoryResolverMutator {

    constructor(
        private readonly gitService: GitService,
        private readonly configService: ConfigService,
        private readonly repoService: RepositoryService) {
    }

    @ResolveField("fetch")
    async fetchRepository(@Parent() model: RepositoryModel): Promise<RepositoryModel> {
        await this.gitService.fetchAll(model.path);
        return this.repoService.openRepository(model.path);
    }

    @ResolveField("cleanWorkingDirectory")
    async cleanWorkingDirectory(@Parent() model: RepositoryModel): Promise<RepositoryModel> {
        await this.gitService.cleanWorkingDirectory(model.path);
        return this.repoService.openRepository(model.path);
    }
}
