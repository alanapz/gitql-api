import { ResolveField, Resolver } from "@nestjs/graphql";
import { ConfigService } from "src/config/config.service";

@Resolver("GQLConfig")
export class ConfigResolver {

    constructor(private readonly configService: ConfigService) {

    }

    @ResolveField("workspaceRoot")
    getWorkspaceRoot(): Promise<string> {
        return Promise.resolve(this.configService.workspaceRoot);
    }

    @ResolveField("hostWorkspaceRoot")
    getHostWorkspaceRoot(): Promise<string> {
        return Promise.resolve(this.configService.hostWorkspaceRoot);
    }
}

