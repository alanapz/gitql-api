import { CommitModel, RepositoryModel, TagRefModel, TrackingBranchRefModel } from "src/repository";

export interface ConfigHandler {

    isTrunk(repo: RepositoryModel, ref: TrackingBranchRefModel): Promise<boolean>;

    resolveParent(repo: RepositoryModel, branchName: string): Promise<string>;

    repositoryUrl(repo: RepositoryModel): Promise<string>;

    activityUrl(repo: RepositoryModel): Promise<string>;

    refUrl(ref: TrackingBranchRefModel|TagRefModel): Promise<string>;

    commitUrl(commit: CommitModel): Promise<string>;
}
