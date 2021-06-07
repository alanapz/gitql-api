import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GitWorkingDirectoryItemStatus } from "src/generated/graphql";
import { WorkingDirectoryItemModel, WorkingDirectoryModel } from "src/repository";

@Resolver("GitWorkingDirectoryItem")
export class WorkingDirectoryItemResolver {

    @ResolveField("directory")
    getDirectory(@Parent() model: WorkingDirectoryItemModel): Promise<WorkingDirectoryModel> {
        return Promise.resolve(model.directory);
    }

    @ResolveField("path")
    getPath(@Parent() model: WorkingDirectoryItemModel): Promise<string> {
        return Promise.resolve(model.path);
    }

    @ResolveField("status")
    getStatus(@Parent() model: WorkingDirectoryItemModel): Promise<GitWorkingDirectoryItemStatus[]> {
        return model.status;
    }
}
