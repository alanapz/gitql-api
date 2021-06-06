import { Args, Parent, ResolveField } from "@nestjs/graphql";
import { Check } from "src/check";
import { Ref } from "src/git/types";
import { GitUtils } from "src/git/utils";
import { RefDistanceModel } from "src/query/repository/RefDistanceModel";
import { CommitModel, RefModel, RepositoryModel } from "src/query/repository/types";

const check: Check = require.main.require("./check");

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
        const results: CommitModel[] = [];

        let current = await model.commit;

        for (let i=0; i<count; i++) {
            if (!current) {
                break;
            }
            results.push(current);
            current = await current.firstParent;
        }

        return results;
    }

    @ResolveField("distance")
    async getDistance(@Parent() model: RefModel, @Args('refName') refName: string): Promise<RefDistanceModel> {
        check.stringNonNullNotEmpty(refName, "refName");
        return this.calculateDistance(model.repository, model.ref, GitUtils.parseExplicitRef(refName));
    }

    protected async calculateDistance(repository: RepositoryModel, source: Ref, target: Ref): Promise<RefDistanceModel> {

        return repository.buildRefDistance(source, target, async () => {

            const distance = await repository.gitService.calculateDistance(
                repository.path,
                source,
                target,
                async commitId => (await (await repository.lookupCommit(commitId, 'throw')).firstParent).id);

            if (!distance) {
                return null;
            }

            return {
                ahead: distance.ahead,
                behind: distance.behind,
                mergeBase: distance.mergeBase};
        });
    }
}
