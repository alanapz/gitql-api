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

    @ResolveField("staged")
    getStaged(@Parent() model: WorkingDirectoryModel): Promise<WorkingDirectoryItemModel[]> {
        return model.staged;
    }

    @ResolveField("unstaged")
    getUnstaged(@Parent() model: WorkingDirectoryModel): Promise<WorkingDirectoryItemModel[]> {
        return model.unstaged;
    }

    @ResolveField("untracked")
    getUntracked(@Parent() model: WorkingDirectoryModel): Promise<WorkingDirectoryItemModel[]> {
        return model.untracked;
    }
}
