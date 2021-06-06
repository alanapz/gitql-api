import { Check } from "src/check";
import { GitBlob } from "src/git/types";
import { BlobModel, BlobModelParams, RepositoryModel } from "src/query/repository/types";
import { lazyValue } from "src/utils/lazy-value";
import { xxx_todo_fixme } from "src/utils/utils";

const check: Check = require.main.require("./check");

export class BlobModelImpl implements BlobModel {

    private readonly _details = lazyValue<GitBlob>();

    private readonly _size = lazyValue<number>();

    private readonly _value = lazyValue<string>();

    constructor(private readonly _repository: RepositoryModel, private readonly _id: string) {
        check.nonNull(_repository, 'repository');
        check.stringNonNullNotEmpty(_id, 'id');
    }

    get id() {
        return this._id;
    }

    get repository() {
        return this._repository;
    }

    get size() {
        return this._size.fetch(async () => (await this.details).size);
    }

    get value() {
        return this._value.fetch(async () => (await this.details).value);
    }

    update(params?: BlobModelParams) {
        if (params && params.size != null) {
            this._size.set(params.size);
        }
        if (params && params.value != null) {
            this._value.set(params.value);
        }
        return this;
    }

    private get details(): Promise<GitBlob> {
        throw xxx_todo_fixme();
    }
}