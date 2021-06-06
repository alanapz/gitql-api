import { Check } from "src/check";
import { GitWorkingDirectoryItemStatus } from "src/generated/graphql";
import { WorkingDirectoryItem } from "src/git/types";
import { WorkingDirectoryItemModel, WorkingDirectoryModel } from "src/query/repository/types";

const check: Check = require.main.require("./check");

export class WorkingDirectoryItemModelImpl implements WorkingDirectoryItemModel {

    constructor(private readonly _directory: WorkingDirectoryModel, private readonly _item: WorkingDirectoryItem) {
        check.nonNull(_directory, "repository");
        check.nonNull(_item, "item");
    }

    get directory() {
        return this._directory;
    }

    get path() {
        return this._item.path;
    }

    get status() {
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
    }
}
