import { ConfigHandler } from "src/config/config-handler";
import {
    CommitModel,
    isTagRefModel,
    isTrackingBranchRefModel,
    RepositoryModel,
    TagRefModel,
    TrackingBranchRefModel
} from "src/repository";

class ViaviConfigHandler implements ConfigHandler {

    isTrunk(repo: RepositoryModel, branchName: string): Promise<boolean> {
        return Promise.resolve(!! branchName.match("^[a-z]{2,}\d{4}$"));
    }

    resolveParent(repo: RepositoryModel, branchName: string): Promise<string> {
        const matcher = branchName.match("^(feature|hotfix)/(?<trunk>[a-z]{2,}\d{4))/.+$")
        return Promise.resolve(matcher && matcher.groups["trunk"]);
    }

    async repositoryUrl(repo: RepositoryModel): Promise<string> {
        // eg: https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/browse
        const server = await this.parseServerUrl(repo);
        return Promise.resolve(server && `https://${server.url}/projects/${server.project}/repos/${server.repo}/browse`);
    }

    async activityUrl(repo: RepositoryModel): Promise<string> {
        // eg: https://cosgit1.ds.jdsu.net/plugins/servlet/rss4stash/repo-activities/ONMSI/aaa-service
        const server = await this.parseServerUrl(repo);
        return Promise.resolve(server && `https://${server.url}/plugins/servlet/rss4stash/repo-activities/${server.project}/${server.repo}`);
    }

    async refUrl(ref: TrackingBranchRefModel|TagRefModel): Promise<string> {
        // eg: https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/commits?until=refs%2Fheads%2Ffeature%2FONMSI-7482-ept-7761-btor-aaa-add-the-accounting-part
        const server = await this.parseServerUrl(ref.repository);
        if (isTrackingBranchRefModel(ref)) {
            return Promise.resolve(server && `https://${server.url}/projects/${server.project}/repos/${server.repo}/commits?until=refs%2Fheads%2F${encodeURIComponent(ref.name)}`);
        }
        else if (isTagRefModel(ref)) {
            return Promise.resolve(server && `https://${server.url}/projects/${server.project}/repos/${server.repo}/commits?until=refs%2Ftags%2F${encodeURIComponent(ref.name)}`);
        }
        else {
            return null;
        }
    }

    async commitUrl(commit: CommitModel): Promise<string> {
        // eg: https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/commits/1b1855676308e67d18b9f2999e63b6da8c93a7d7
        const server = await this.parseServerUrl(commit.repository);
        return Promise.resolve(server && `https://${server.url}/projects/${server.project}/repos/${server.repo}/commits/${commit.id}`);
    }

    private async parseServerUrl(repo: RepositoryModel): Promise<{url: string, project: string, repo: string}> {

        const cloneUrl = (await repo.gitConfig).cloneUrl;
        if (!cloneUrl) {
            return null;
        }

        // ssh://git@cosgit1.ds.jdsu.net:7999/onmsi/topaz-app.git
        // https://
        const sshMatcher = cloneUrl.match("^ssh://.+@(?<url>.+)(:\d)?/(?<project>.+)/(?<repo>.+).git$");
        if (sshMatcher) {
            return {
                url: sshMatcher.groups["url"],
                project: sshMatcher.groups["server"],
                repo: sshMatcher.groups["server"]
            }}

        return "https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/commits?until=refs%2Fheads%2Ffeature%2FONMSI-7482-ept-7761-btor-aaa-add-the-accounting-part";
    }


}