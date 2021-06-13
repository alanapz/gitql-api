import { Injectable } from '@nestjs/common';
import { PersistentCacheService } from "src/cache/persistent-cache.service";
import { error, stringNotNullNotEmpty } from "src/check";
import { ConfigService } from "src/config/config.service";
import { TrunkConfigService } from "src/config/trunk-config/trunk-config.service";
import { WebUrlService } from "src/config/web-url/web-url.service";
import { GitService } from "src/git/git.service";
import { RepositoryModel } from "src/repository";
import { RepositoryModelImpl } from "src/repository/repository-model-impl";

@Injectable()
export class RepositoryService {

    constructor(
        private readonly configService: ConfigService,
        private readonly gitService: GitService,
        private readonly webUrlService: WebUrlService,
        private readonly trunkConfigService: TrunkConfigService,
        private readonly cacheService: PersistentCacheService) {
    }

    async openRepository(fullPath: string): Promise<RepositoryModel> {
        stringNotNullNotEmpty(fullPath, "fullPath");

        if (!await this.gitService.isGitRepoPath(fullPath)) {
            throw error(`Folder is not a valid Git repository: '${fullPath}'`);
        }

        return new RepositoryModelImpl(fullPath, this.gitService, this.webUrlService, this.trunkConfigService, this.cacheService);
    }
}
