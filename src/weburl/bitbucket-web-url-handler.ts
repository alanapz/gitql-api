import {
    CommitModel,
    isTagRefModel,
    isTrackingBranchRefModel,
    TagRefModel,
    TrackingBranchRefModel
} from "src/repository";
import { WebUrlHandler } from "src/weburl";

export class BitbucketWebUrlHandler implements WebUrlHandler {

    private constructor(private readonly server: string, private readonly project: string, private readonly repo: string) {

    }

    get repositoryUrl() {
        // eg: https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/browse
        return `https://${this.server}/projects/${this.project}/repos/${this.repo}/browse`;
    }

    get activityUrl() {
        // eg: https://cosgit1.ds.jdsu.net/plugins/servlet/rss4stash/repo-activities/ONMSI/aaa-service
        return `https://${this.server}/plugins/servlet/rss4stash/repo-activities/${this.project}/${this.repo}`;
    }

    refUrl(ref: TrackingBranchRefModel|TagRefModel) {
        // eg: https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/commits?until=refs%2Fheads%2Ffeature%2FONMSI-7482-ept-7761-btor-aaa-add-the-accounting-part
        if (isTrackingBranchRefModel(ref)) {
            return `https://${this.server}/projects/${this.project}/repos/${this.repo}/commits?until=refs%2Fheads%2F${encodeURIComponent(ref.name)}`;
        }
        else if (isTagRefModel(ref)) {
            return `https://${this.server}/projects/${this.project}/repos/${this.repo}/commits?until=refs%2Ftags%2F${encodeURIComponent(ref.name)}`;
        }
        else {
            return null;
        }
    }

    commitUrl(commit: CommitModel) {
        // eg: https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/commits/1b1855676308e67d18b9f2999e63b6da8c93a7d7
        return `https://${this.server}/projects/${this.project}/repos/${this.repo}/commits/${commit.id}`;
    }

    public static matches(url: string): WebUrlHandler {

        // ssh://git@cosgit1.ds.jdsu.net:7999/onmsi/topaz-app.git
        const sshMatcher = url.match("^ssh://.+@(?<server>.+)(:\d)?/(?<project>.+)/(?<repo>.+).git$");
        if (sshMatcher) {
            return new BitbucketWebUrlHandler(
                sshMatcher.groups["server"],
                sshMatcher.groups["project"],
                sshMatcher.groups["repo"]);
        }

        return null;
    }
}