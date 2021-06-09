import { StashRef } from "src/git";
import { RepositoryModel, StashRefModel } from "src/repository";

export class StashRefModelImpl implements StashRefModel {

    readonly __typename = "GitStash";

    readonly kind = "STASH";

    constructor(readonly repository: RepositoryModel, readonly ref: StashRef, private readonly _message: string, private readonly _timestamp: number) {

    }

    get displayName() {
        return this.ref.name;
    }

    get commitId() {
        return null;
    }

    get commit() {
        return null;
    }

    get message() {
        return Promise.resolve(this._message);
    }

    get timestamp() {
        return Promise.resolve(this._timestamp);
    }
}
