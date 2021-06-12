import { arrayNotNullNotEmpty, stringNotNullNotEmpty } from "src/check";
import { GitRemoteConfig } from "src/git/git-config-file";
import { RemoteModel, RepositoryModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";
import { WebUrlHandler } from "src/weburl";

export class RemoteModelImpl implements RemoteModel {

    private readonly _fetchUrl: string;

    private readonly _pushUrls: string[];

    private readonly _webUrlHandler = lazyValue<WebUrlHandler>();

    constructor(readonly repository: RepositoryModel, readonly name: string, input: GitRemoteConfig) {
        this._fetchUrl = stringNotNullNotEmpty(arrayNotNullNotEmpty(input.fetchUrls)[0]);
        this._pushUrls = (input.pushUrls && input.pushUrls.length ? input.pushUrls : [input.fetchUrls[0]]);
    }

    get fetchUrl(): Promise<string> {
        return Promise.resolve(this._fetchUrl);
    }

    get pushUrls(): Promise<string[]> {
        return Promise.resolve(this._pushUrls);
    }

    get webUrlHandler(): Promise<WebUrlHandler> {
        return this._webUrlHandler.fetch(async () => this.repository.webUrlService.buildWebHandler(this._fetchUrl));
    }
}
