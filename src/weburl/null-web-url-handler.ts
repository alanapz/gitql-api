import { CommitModel, TagRefModel, TrackingBranchRefModel } from "src/repository";
import { WebUrlHandler } from "src/weburl";

export class NullWebUrlHandler implements WebUrlHandler {

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