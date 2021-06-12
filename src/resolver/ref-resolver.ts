import { Args, Parent, ResolveField } from "@nestjs/graphql";
import { stringNotNullNotEmpty } from "src/check";
import { Ref } from "src/git";
import { GitUtils } from "src/git/utils";
import { CommitModel, RefDistanceModel, RefModel, RepositoryModel } from "src/repository";

export abstract class RefResolver {

    @ResolveField("refName")
    getRefName(@Parent() model: RefModel): Promise<string> {
        return Promise.resolve(model.ref.refName);
    }

    @ResolveField("displayName")
    getDisplayName(@Parent() model: RefModel): Promise<string> {
        return Promise.resolve(model.displayName);
    }

    @ResolveField("repository")
    getRepository(@Parent() model: RefModel): Promise<RepositoryModel> {
        return Promise.resolve(model.repository);
    }

    @ResolveField("commit")
    getCommit(@Parent() model: RefModel): Promise<CommitModel> {
        return model.commit;
    }

    @ResolveField("ancestors")
    async getAncestors(@Parent() model: RefModel,  @Args('count') count: number): Promise<CommitModel[]> {
        const commit = await model.commit;
        if (!commit) {
            return [];
        }
        return (await commit.ancestors).slice(0, count);
    }

    @ResolveField("distance")
    async getDistance(@Parent() model: RefModel, @Args('refName') refName: string): Promise<RefDistanceModel> {
        stringNotNullNotEmpty(refName, "refName");
        return this.calculateDistance(model.repository, model.ref, GitUtils.parseExplicitRef(refName));
    }

    protected async calculateDistance(repository: RepositoryModel, source: Ref, target: Ref): Promise<RefDistanceModel> {

        return repository.buildRefDistance(source, target, async () => {

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
    }
}
