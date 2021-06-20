import { arrayNotNullNotEmpty, stringNotNullNotEmpty } from "src/check";
import { WebUrlHandler } from "src/config/web-url";
import { GitRemoteConfig } from "src/git/git-config-file";
import { RemoteModel, RepositoryModel, TrackingBranchRefModel } from "src/repository";
import { lazyValue } from "src/utils/lazy-value";
import { map_values } from "src/utils/utils";

export class RemoteModelImpl implements RemoteModel {

    private readonly _fetchUrl: string;

    private readonly _pushUrls: string[];

    private readonly _webUrlHandler = lazyValue<WebUrlHandler>();

    private readonly _branches = lazyValue<TrackingBranchRefModel[]>();

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

    get branches(): Promise<TrackingBranchRefModel[]> {
        return this._branches.fetch(async () => {

            const allTrackingBranches = await Promise.all((await map_values(this.repository.allTrackingBranches)).map(async branch => {
                const remote = await branch.remote;
                return {branch, remote};
            }));

            return allTrackingBranches
                .filter(result => result.remote?.name === this.name)
                .map(result => result.branch);
        });
    }

}
