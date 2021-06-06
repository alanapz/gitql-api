import { Check } from "src/check";
import { RepositoryModel, WorkingDirectoryItemModel, WorkingDirectoryModel } from "src/query/repository/types";
import { WorkingDirectoryItemModelImpl } from "src/query/repository/WorkingDirectoryItemModelImpl";
import { lazyValue } from "src/utils/lazy-value";

const check: Check = require.main.require("./check");

export class WorkingDirectoryModelImpl implements WorkingDirectoryModel {

    private readonly _staged = lazyValue<WorkingDirectoryItemModel[]>();

    private readonly _unstaged = lazyValue<WorkingDirectoryItemModel[]>();

    private readonly _untracked = lazyValue<WorkingDirectoryItemModel[]>();

    constructor(private readonly _repository: RepositoryModel, private readonly _path: string) {
        check.nonNull(_repository, "repository");
        check.stringNonNullNotEmpty(_path, "path");
    }

    get path() {
        return this._path;
    }

    get repository() {
        return this._repository;
    }

    get staged() {
        return this._staged.fetch(async () => {
            return Array.from(await this._repository.gitService.getWorkingDirectoryStaged(this._repository.path, this._path)).map(r => new WorkingDirectoryItemModelImpl(this, r));
        });
    }

    get unstaged() {
        return this._unstaged.fetch(async () => {
            return Array.from(await this._repository.gitService.getWorkingDirectoryUnstaged(this._repository.path, this._path)).map(r => new WorkingDirectoryItemModelImpl(this, r));
        });
    }

    get untracked() {
        return this._untracked.fetch(async () => {
            return Array.from(await this._repository.gitService.getWorkingDirectoryUntracked(this._repository.path, this._path)).map(r => new WorkingDirectoryItemModelImpl(this, r));
        });
    }
}
