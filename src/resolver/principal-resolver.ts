import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GitPrincipal } from "src/git/types";

@Resolver("GitPrincipal")
export class PrincipalResolver {

    @ResolveField("name")
    getName(@Parent() model: GitPrincipal): Promise<string> {
        return Promise.resolve(model.name);
    }

    @ResolveField("emailAddress")
    getEmailAddress(@Parent() model: GitPrincipal): Promise<string> {
        return Promise.resolve(model.emailAddress);
    }

    @ResolveField("timestamp")
    getTimestamp(@Parent() model: GitPrincipal): Promise<number> {
        return Promise.resolve(model.timestamp);
    }
}
