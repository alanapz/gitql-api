import { Ref } from "src/git";
import {
    RefDistanceModel,
    RepositoryModel,
    TagRefModel,
    TrackingBranchRefModel,
    WebUrlModel
} from "src/repository/index";
import { map_values } from "src/utils/utils";

export class RepositoryUtils {

    static getRefWebUrls(repository: RepositoryModel, ref: TrackingBranchRefModel | TagRefModel): Promise<WebUrlModel[]> {
        return map_values(repository.allRemotes).then(remotes => Promise.all(remotes.map(async remote => {
            const url = (await (await remote.webUrlHandler)).refUrl(ref);
            return ({ remote, url });
        }))).then(results => results.filter(result => !! result.url));
    }

    static async calculateDistance(repository: RepositoryModel, source: Ref, target: Ref): Promise<RefDistanceModel> {

        const start = Date.now();

        console.log(`start ${source.refName} -> ${target.refName}`);

        const result = await repository.buildRefDistance(source, target, async () => {

            const [sourceCommitId, targetCommitId] = await Promise.all([
                (await repository.lookupRef(source, 'throw')).commitId,
                (await repository.lookupRef(target, 'throw')).commitId
            ]);

            if (!sourceCommitId || !targetCommitId) {
                return null;
            }

            return repository.cacheService.lookupRefDistance(sourceCommitId, targetCommitId, async () => {

                const lookupFirstParent = async (commitId: string) => {
                    const firstParent = (await (await repository.lookupCommit(commitId, 'throw')).firstParent);
                    return (firstParent && firstParent.id);
                };

                const distance = await repository.gitService.calculateDistance(repository.path, sourceCommitId, targetCommitId, lookupFirstParent);

                if (!distance) {
                    return null;
                }

                return {
                    ahead: distance.ahead,
                    behind: distance.behind,
                    mergeBaseId: distance.mergeBase};
            });
        });

        console.log(`${Date.now() - start} end ${source.refName} -> ${target.refName} ${result}`);
        return result;
    }
}
