import { Module } from "@nestjs/common";
import { ConfigModule } from "src/config/config.module";
import { GitService } from "src/git/git.service";

@Module({
    providers: [GitService],
    exports: [GitService],
    imports: [ConfigModule]
})
export class GitModule {}
