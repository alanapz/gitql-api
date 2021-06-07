import { Module } from "@nestjs/common";
import { ConfigModule } from "src/config/config.module";
import { GitModule } from "src/git/git.module";
import { RepositoryService } from "src/repository/repository.service";

@Module({
    providers: [RepositoryService],
    exports: [RepositoryService],
    imports: [ConfigModule, GitModule]
})
export class RepositoryModule {}
