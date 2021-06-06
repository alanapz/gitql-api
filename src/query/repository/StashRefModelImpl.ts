import { Check } from "src/check";
import { GitStash } from "src/generated/graphql";
import { GitStashLine, StashRef } from "src/git/types";
import { CommitModel, RepositoryModel, StashRefModel } from "src/query/repository/types";
import { lazyValue } from "src/utils/lazy-value";

const check: Check = require.main.require("./check");

export class StashRefModelImpl implements StashRefModel {

    readonly __typename = "GitStash";

    readonly kind = "STASH";

    private readonly _commitId = lazyValue<string>();

    private readonly _commit = lazyValue<CommitModel>();

    constructor(readonly repository: RepositoryModel, readonly ref: StashRef, private readonly _input: GitStashLine) {
        this._commitId.setIfNotNull(_input.commitId);
    }

    get displayName() {
        return this.ref.stashName;
    }

    get commit() {
        return this._commit.fetch(async () => {
            const commitId = await this._commitId.fetch(async () => (await this.allDetails).commitId);
            return this.repository.lookupCommit(commitId, 'throw');
        });
    }

    private get allDetails(): Promise<GitStashLine> {
        throw check.error(`Unable to retrieve details for stash: '${this.ref.refName}'`);
    }
}
