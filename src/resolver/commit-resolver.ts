import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GitPrincipal } from "src/git";
import { CommitModel, RefModel, RepositoryModel, TreeModel, WebUrlModel } from "src/repository";

@Resolver("GitCommit")
export class CommitResolver {

    @ResolveField("id")
    getCommitId(@Parent() model: CommitModel): Promise<string> {
        return Promise.resolve(model.id);
    }

    @ResolveField("repository")
    getRepository(@Parent() model: CommitModel): Promise<RepositoryModel> {
        return Promise.resolve(model.repository);
    }

    @ResolveField("firstParent")
    async getFirstParent(@Parent() model: CommitModel): Promise<CommitModel> {
        const allParentIds = await model.parents;
        return (allParentIds.length ? allParentIds[0] : null);
    }

    @ResolveField("parents")
    async getAllParents(@Parent() model: CommitModel): Promise<CommitModel[]> {
        return model.parents;
    }

    @ResolveField("tree")
    async getTree(@Parent() model: CommitModel): Promise<TreeModel> {
        return model.tree;
    }

    @ResolveField("author")
    getCommitAuthor(@Parent() model: CommitModel): Promise<GitPrincipal> {
        return model.author;
    }

    @ResolveField("committer")
    getCommitCommitter(@Parent() model: CommitModel): Promise<GitPrincipal> {
        return model.committer;
    }

    @ResolveField("message")
    getMessage(@Parent() model: CommitModel): Promise<string> {
        return model.message;
    }

    @ResolveField("ancestors")
    getAncestors(@Parent() model: CommitModel): Promise<CommitModel[]> {
        return model.ancestors;
    }

    @ResolveField("refNotes")
    getRefNotes(@Parent() model: CommitModel): Promise<string[]> {
        return model.refNotes;
    }

    @ResolveField("reachableBy")
    getReachableBy(@Parent() model: CommitModel): Promise<RefModel[]> {
        return model.reachableBy;
    }

    @ResolveField("webUrls")
    getWebUrls(@Parent() model: CommitModel): Promise<WebUrlModel[]> {
        return model.webUrls;
    }
}
