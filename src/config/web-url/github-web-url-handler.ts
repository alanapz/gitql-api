import { WebUrlHandler } from "src/config/web-url";
import { CommitModel, isTrackingBranchRefModel, TagRefModel, TrackingBranchRefModel } from "src/repository";

export class GithubWebUrlHandler implements WebUrlHandler {

    private constructor(private readonly user: string, private readonly project: string) {

    }

    get repositoryUrl() {
        // eg: https://github.com/alanapz/gitql-api
        return `https://github.com/${this.user}/${this.project}`;
    }

    get activityUrl() {
        return null;
    }

    refUrl(ref: TrackingBranchRefModel|TagRefModel) {
        // eg: https://github.com/alanapz/gitql-api/tree/feature/GQL14-web-url-support
        if (isTrackingBranchRefModel(ref)) {
            return `https://github.com/${this.user}/${this.project}/tree/${ref.name}`;
        }
        return null;
    }

    commitUrl(commit: CommitModel) {
        // eg: https://github.com/alanapz/gitql-api/commit/b7ad1669efc35fe60ed892364dc359953a619829
        return `https://github.com/${this.user}/${this.project}/commit/${commit.id}`;
    }

    public static matches(url: string): WebUrlHandler {

        // https://github.com/alanapz/gitql-api.git
        const httpsMatcher = url.match("^https://github.com/(?<user>.+)/(?<project>.+).git$");
        if (httpsMatcher) {
            return new GithubWebUrlHandler(httpsMatcher.groups["user"], httpsMatcher.groups["project"]);
        }

        return null;
    }
}