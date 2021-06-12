import { RepositoryModel, TagRefModel, TrackingBranchRefModel, WebUrlModel } from "src/repository/index";
import { map_values } from "src/utils/utils";

export class RepositoryUtils {

    static getRefWebUrls(repository: RepositoryModel, ref: TrackingBranchRefModel | TagRefModel): Promise<WebUrlModel[]> {
        return map_values(repository.allRemotes).then(remotes => Promise.all(remotes.map(async remote => {
            const url = (await (await remote.webUrlHandler)).refUrl(ref);
            return ({ remote, url });
        }))).then(results => results.filter(result => !! result.url));
    }
}
