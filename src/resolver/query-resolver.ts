import { Args, Query, Resolver } from "@nestjs/graphql";
import { stringNotNullNotEmpty } from "src/check";
import { ConfigService } from "src/config/config.service";
import { GitService } from "src/git/git.service";
import { RepositoryModel } from "src/repository";
import { RepositoryModelImpl } from "src/repository/repository-model-impl";
import { RepositoryService } from "src/repository/repository.service";
import { ioUtils } from "src/utils/io-utils";

const fs = require("fs/promises");
const path = require("path");

@Resolver()
export class QueryResolver {

    constructor(
        private readonly gitService: GitService,
        private readonly configService: ConfigService,
        private readonly repoService: RepositoryService) {
    }

    @Query("repository")
    async openRepository(@Args("path") relativePath: string): Promise<RepositoryModel> {
        stringNotNullNotEmpty(relativePath, "relativePath");
        return this.repoService.openRepository(path.join(this.configService.repoRoot, relativePath));
    }

    @Query("searchRepositories")
    async allRepositories(): Promise<RepositoryModel[]> {
        const repositories: RepositoryModel[] = [];
        await this.recurseFolder(0, this.configService.repoRoot, repositories);
        return repositories;
    }

    private async recurseFolder(depth: number, parentPath: string, repositories: RepositoryModel[]): Promise<void> {

        const awaiters: Promise<void>[] = [];

        for (const filename of await fs.readdir(parentPath)) {

            const filePath = path.join(parentPath, filename);

            if (this.configService.isPathSkipped(filePath)) {
                continue;
            }

            const stat = await ioUtils.fstatOrNull(filePath);

            if (!stat || !stat.isDirectory()) {
                continue;
            }

            if (await this.gitService.isGitRepoPath(filePath)) {
                repositories.push(new RepositoryModelImpl(filePath, this.gitService));
                continue;
            }

            if (depth < this.configService.maxSearchDepth) {
                awaiters.push(this.recurseFolder(depth + 1, filePath, repositories));
            }
        }

        await Promise.all(awaiters);
    }
}

