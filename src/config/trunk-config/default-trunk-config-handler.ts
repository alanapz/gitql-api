import { TrunkConfigHandler } from "src/config/trunk-config/index";
import { TrackingBranchRef } from "src/git";
import { GitUtils } from "src/git/utils";
import { RepositoryModel } from "src/repository";

export class DefaultTrunkConfigHandler implements TrunkConfigHandler {

    private readonly _trunkNames = ["main", "master", "develop"];

    constructor(private readonly repository: RepositoryModel) {

    }

    isTrunk(ref: TrackingBranchRef): Promise<boolean> {
        return Promise.resolve(this._trunkNames.includes(ref.name));
    }

    async resolveParent(ref: TrackingBranchRef): Promise<TrackingBranchRef> {

        if (await this.isTrunk(ref)) {
            return null;
        }

        const trackingBranches = await this.repository.allTrackingBranches;

        for (const trunkName of this._trunkNames) {
            const trunkRef = GitUtils.toTrackingBranchRef(`refs/remotes/${ref.remote}/${trunkName}`);
            if (trackingBranches.has(trunkRef.refName)) {
                return trunkRef;
            }
        }

        // No trunk found
        console.warn(`Unable to resolve parent for: '${ref.refName}', repo: '${this.repository.path}'`);
        return null;
    }
}
