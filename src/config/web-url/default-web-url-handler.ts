import { WebUrlHandler } from "src/config/web-url";
import { CommitModel, TagRefModel, TrackingBranchRefModel } from "src/repository";

export class DefaultWebUrlHandler implements WebUrlHandler {

    get repositoryUrl(): string {
        return null;
    }

    get activityUrl(): string {
        return null;
    }

    refUrl(ref: TrackingBranchRefModel|TagRefModel): string {
        return null;
    }

     commitUrl(commit: CommitModel): string {
        return null;
    }
}