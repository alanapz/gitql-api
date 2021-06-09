import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GitPrincipal } from "src/git";
import { TagRefModel } from "src/repository";
import { RefResolver } from "src/resolver/ref-resolver";

@Resolver("GitTag")
export class TagRefResolver extends RefResolver {

    @ResolveField("tagName")
    getTagName(@Parent() model: TagRefModel): Promise<string> {
        return Promise.resolve(model.ref.name);
    }

    @ResolveField("tagMessage")
    getTagMessage(@Parent() model: TagRefModel): Promise<string> {
        return model.tagMessage;
    }

    @ResolveField("tagAuthor")
    getTagAuthor(@Parent() model: TagRefModel): Promise<GitPrincipal> {
        return model.tagAuthor;
    }
}
