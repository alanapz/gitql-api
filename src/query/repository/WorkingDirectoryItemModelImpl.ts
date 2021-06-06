import { GitWorkingDirectoryItemStatus } from "src/generated/graphql";
import { WorkingDirectoryItem } from "src/git/types";
import { WorkingDirectoryItemModel, WorkingDirectoryModel } from "src/query/repository/types";
import { lazyValue } from "src/utils/lazy-value";

export class WorkingDirectoryItemModelImpl implements WorkingDirectoryItemModel {

    private readonly _status = lazyValue<GitWorkingDirectoryItemStatus[]>();

    constructor(readonly directory: WorkingDirectoryModel, private readonly _item: WorkingDirectoryItem) {

    }

    get path() {
        return this._item.path;
    }

    get status() {
        return this._status.fetch(() => {
            const flags: GitWorkingDirectoryItemStatus[] = [];
            if (this._item.added) {
                flags.push(GitWorkingDirectoryItemStatus.ADDED);
            }
            if (this._item.copied) {
                flags.push(GitWorkingDirectoryItemStatus.COPIED);
            }
            if (this._item.deleted) {
                flags.push(GitWorkingDirectoryItemStatus.DELETED);
            }
            if (this._item.modified) {
                flags.push(GitWorkingDirectoryItemStatus.MODIFIED);
            }
            if (this._item.typeChanged) {
                flags.push(GitWorkingDirectoryItemStatus.TYPE_CHANGED);
            }
            if (this._item.unmerged) {
                flags.push(GitWorkingDirectoryItemStatus.UNMERGED);
            }
            if (this._item.unknown) {
                flags.push(GitWorkingDirectoryItemStatus.UNKNOWN);
            }
            if (this._item.broken) {
                flags.push(GitWorkingDirectoryItemStatus.BROKEN);
            }
            if (this._item.untracked) {
                flags.push(GitWorkingDirectoryItemStatus.UNTRACKED);
            }
            return Promise.resolve(flags);
        });
    }
}
