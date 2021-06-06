import { Args, Query, Resolver } from "@nestjs/graphql";
import { Check } from "src/check";
import { ConfigService } from "src/config/config.service";
import { GitService } from "src/git/git.service";
import { RepositoryModelImpl } from "src/query/repository/RepositoryModelImpl";
import { RepositoryModel } from "src/query/repository/types";
import { ioUtils } from "src/utils/io-utils";

const fs = require("fs/promises");
const path = require("path");

const check: Check = require.main.require("./check");

@Resolver()
export class QueryResolver {

    constructor(private readonly gitService: GitService, private readonly configService: ConfigService) {
        check.nonNull(gitService, "gitService");
        check.nonNull(configService, "configService");
    }

    @Query("repository")
    async openRepository(@Args("path") relativePath: string): Promise<RepositoryModel> {
        check.stringNonNullNotEmpty(relativePath, "relativePath");

        const fullPath = path.join(this.configService.repoRoot, relativePath);
``
        if (!await this.gitService.isGitRepoPath(fullPath)) {
            throw check.error(`Folder is not a valid Git repository: '${fullPath}'`);
        }

        return new RepositoryModelImpl(fullPath, this.gitService);
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

