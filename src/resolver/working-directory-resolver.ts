import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { RepositoryModel, WorkingDirectoryItemModel, WorkingDirectoryModel } from "src/repository";

@Resolver("GitWorkingDirectory")
export class WorkingDirectoryResolver {

    @ResolveField("path")
    getPath(@Parent() model: WorkingDirectoryModel): Promise<string> {
        return Promise.resolve(model.path);
    }

    @ResolveField("repository")
    getRepository(@Parent() model: WorkingDirectoryModel): Promise<RepositoryModel> {
        return Promise.resolve(model.repository);
    }

    @ResolveField("stagedLength")
    async getStagedLength(@Parent() model: WorkingDirectoryModel): Promise<number> {
        return (await model.staged).length;
    }

    @ResolveField("staged")
    getStaged(@Parent() model: WorkingDirectoryModel): Promise<WorkingDirectoryItemModel[]> {
        return model.staged;
    }

    @ResolveField("unstagedLength")
    async getUnstagedLength(@Parent() model: WorkingDirectoryModel): Promise<number> {
        return (await model.unstaged).length;
    }

    @ResolveField("unstaged")
    getUnstaged(@Parent() model: WorkingDirectoryModel): Promise<WorkingDirectoryItemModel[]> {
        return model.unstaged;
    }

    @ResolveField("untrackedLength")
    async getUntrackedLength(@Parent() model: WorkingDirectoryModel): Promise<number> {
        return (await model.untracked).length;
    }

    @ResolveField("untracked")
    getUntracked(@Parent() model: WorkingDirectoryModel): Promise<WorkingDirectoryItemModel[]> {
        return model.untracked;
    }
}
