import { Injectable } from '@nestjs/common';
import { error, stringNotNullNotEmpty } from "src/check";
import { ConfigService } from "src/config/config.service";
import { GitService } from "src/git/git.service";
import { RepositoryModel } from "src/repository";
import { RepositoryModelImpl } from "src/repository/repository-model-impl";

@Injectable()
export class RepositoryService {

    constructor(private readonly configService: ConfigService, private readonly gitService: GitService) {

    }

    async openRepository(fullPath: string): Promise<RepositoryModel> {
        stringNotNullNotEmpty(fullPath, "fullPath");

        if (!await this.gitService.isGitRepoPath(fullPath)) {
            throw error(`Folder is not a valid Git repository: '${fullPath}'`);
        }

        return new RepositoryModelImpl(fullPath, this.gitService);
    }
}
