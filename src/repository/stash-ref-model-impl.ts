import { error } from "src/check";
import { GitStash } from "src/generated/graphql";
import { StashRef } from "src/git";
import { GitStashLine } from "src/git/types";
import { CommitModel, RepositoryModel, StashRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";

export class StashRefModelImpl implements StashRefModel {

    readonly __typename = "GitStash";

    readonly kind = "STASH";

    private readonly _commitId = lazyValue<string>();

    private readonly _commit = lazyValue<CommitModel>();

    constructor(readonly repository: RepositoryModel, readonly ref: StashRef, private readonly _input: GitStashLine) {
        this._commitId.setIfNotNull(_input.commitId);
        console.log("STASHREF", _input.commitId);
        console.log("STASHREF", _input);
        console.log("STASHREF", ref);
    }

    get displayName() {
        return this.ref.name;
    }

    get commit() {
        return this._commit.fetch(async () => {
            const commitId = await this._commitId.fetch(async () => (await this.allDetails).commitId);
            return this.repository.lookupCommit(commitId, 'throw');
        });
    }

    private get allDetails(): Promise<GitStashLine> {
        throw error(`Unable to retrieve details for stash: '${this.ref.refName}'`);
    }
}
