import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { stringNotNullNotEmpty } from "src/check";
import { ConfigService } from "src/config/config.service";
import { RepositoryModel } from "src/repository";
import { RepositoryService } from "src/repository/repository.service";

const path = require("path");

@Resolver()
export class MutationResolver {

    constructor(
        private readonly configService: ConfigService,
        private readonly repoService: RepositoryService) {
    }

    @Mutation("repository")
    async openRepository(@Args("path") relativePath: string): Promise<RepositoryModel> {
        stringNotNullNotEmpty(relativePath, "relativePath");
        return this.repoService.openRepository(path.join(this.configService.workspaceRoot, relativePath));
    }
}

