import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GitPrincipal } from "src/git";
import { TagRefModel, WebUrlModel } from "src/repository";
import { RefResolver } from "src/resolver/ref-resolver";

@Resolver("GitTag")
export class TagRefResolver extends RefResolver {

    @ResolveField("tagName")
    getTagName(@Parent() model: TagRefModel): Promise<string> {
        return Promise.resolve(model.ref.name);
    }

    @ResolveField("message")
    getMessage(@Parent() model: TagRefModel): Promise<string> {
        return model.message;
    }

    @ResolveField("author")
    getAuthor(@Parent() model: TagRefModel): Promise<GitPrincipal> {
        return model.author;
    }

    @ResolveField("webUrls")
    getWebUrls(@Parent() model: TagRefModel): Promise<WebUrlModel[]> {
        return model.webUrls;
    }
}
