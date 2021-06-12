import { CommitModel, TagRefModel, TrackingBranchRefModel } from "src/repository";

export interface WebUrlHandler {
    repositoryUrl: string;
    activityUrl: string;
    refUrl: (ref: TrackingBranchRefModel | TagRefModel) => string;
    commitUrl: (commit: CommitModel) => string;
}
