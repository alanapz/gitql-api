import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { PersistentCacheService } from "src/cache/persistent-cache.service";
import { stringNotNullNotEmpty } from "src/check";
import { ConfigService } from "src/config/config.service";
import { GitService } from "src/git/git.service";
import { RepositoryModel } from "src/repository";
import { RepositoryService } from "src/repository/repository.service";
import { WebUrlService } from "src/weburl/web-url.service";

const path = require("path");

@Resolver()
export class MutationResolver {

    constructor(
        private readonly configService: ConfigService,
        private readonly webUrlService: WebUrlService,
        private readonly persistentCacheService: PersistentCacheService,
        private readonly gitService: GitService,
        private readonly repoService: RepositoryService) {
    }

    @Mutation("repository")
    async openRepository(@Args("path") relativePath: string): Promise<RepositoryModel> {
        stringNotNullNotEmpty(relativePath, "relativePath");
        return this.repoService.openRepository(path.join(this.configService.repoRoot, relativePath));
    }
}

