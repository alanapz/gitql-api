import { Resolver } from "@nestjs/graphql";
import { ConfigService } from "src/config/config.service";
import { GitService } from "src/git/git.service";
import { QueryResolver } from "src/query/repository/QueryResolver";

@Resolver()
export class MutationResolver extends QueryResolver {

    constructor(gitService: GitService, configService: ConfigService) {
        super(gitService, configService);
    }
}

