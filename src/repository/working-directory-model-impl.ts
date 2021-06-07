import { RepositoryModel, WorkingDirectoryItemModel, WorkingDirectoryModel } from "src/repository";
import { WorkingDirectoryItemModelImpl } from "src/repository/working-directory-item-model-impl";
import { lazyValue } from "src/utils/lazy-value";

export class WorkingDirectoryModelImpl implements WorkingDirectoryModel {

    private readonly _staged = lazyValue<WorkingDirectoryItemModel[]>();

    private readonly _unstaged = lazyValue<WorkingDirectoryItemModel[]>();

    private readonly _untracked = lazyValue<WorkingDirectoryItemModel[]>();

    constructor(private readonly _repository: RepositoryModel, private readonly _path: string) {

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
