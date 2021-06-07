import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GitPrincipal } from "src/git/types";
import { CommitModel, RefModel, RepositoryModel, TreeModel } from "src/repository";

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
    async getAncestors(@Parent() model: CommitModel): Promise<CommitModel[]> {
        const ancestors: CommitModel[] = [];
        const commitCache = new Map<string, CommitModel>();
        await this.recurseCommitAncestors(model, ancestors, commitCache);
        return ancestors;
    }

    private async recurseCommitAncestors(commit: CommitModel, ancestors: CommitModel[], commitCache: Map<string, CommitModel>): Promise<void> {
        if (!commitCache.has(commit.id)) {
            ancestors.push(commit);
            commitCache.set(commit.id, commit);
            (await commit.parents).forEach(parent => this.recurseCommitAncestors(parent, ancestors, commitCache));
        }
    }

    @ResolveField("refNotes")
    getRefNotes(@Parent() model: CommitModel): Promise<string[]> {
        return model.refNotes;
    }

    @ResolveField("reachableBy")
    getReachableBy(@Parent() model: CommitModel): Promise<RefModel[]> {
        return model.reachableBy;
    }
}
