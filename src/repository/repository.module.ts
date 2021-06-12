import { Module } from "@nestjs/common";
import { PersistentCacheModule } from "src/cache/persistent-cache.module";
import { ConfigModule } from "src/config/config.module";
import { GitModule } from "src/git/git.module";
import { RepositoryService } from "src/repository/repository.service";
import { WebUrlModule } from "src/weburl/web-url.module";

@Module({
    providers: [RepositoryService],
    exports: [RepositoryService],
    imports: [ConfigModule, WebUrlModule, GitModule, PersistentCacheModule]
})
export class RepositoryModule {}
