import { Module } from "@nestjs/common";
import { GitService } from "src/git/git.service";

@Module({
    providers: [GitService],
    exports: [GitService]
})
export class GitModule {}
