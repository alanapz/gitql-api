import { arrayNotNullNotEmpty, stringNotNullNotEmpty } from "src/check";
import { GitRemoteConfig } from "src/git/git-config-file";
import { RemoteModel, RepositoryModel } from "src/repository";

export class RemoteModelImpl implements RemoteModel {

    private readonly _fetchUrl: string;

    private readonly _pushUrls: string[];

    constructor(readonly repository: RepositoryModel, readonly name: string, input: GitRemoteConfig) {
        this._fetchUrl = stringNotNullNotEmpty(arrayNotNullNotEmpty(input.fetchUrls)[0]);
        this._pushUrls = (input.pushUrls && input.pushUrls.length ? input.pushUrls : [input.fetchUrls[0]]);
    }

    get fetchUrl() {
        return Promise.resolve(this._fetchUrl);
    }

    get pushUrls() {
        return Promise.resolve(this._pushUrls);
    }
}
