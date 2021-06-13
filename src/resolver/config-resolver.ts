import { ResolveField, Resolver } from "@nestjs/graphql";
import { ConfigService } from "src/config/config.service";

@Resolver("GQLConfig")
export class ConfigResolver {

    constructor(private readonly configService: ConfigService) {

    }

    @ResolveField("repoRoot")
    getConfig(): Promise<string> {
        return Promise.resolve(this.configService.repoRoot);
    }
}

