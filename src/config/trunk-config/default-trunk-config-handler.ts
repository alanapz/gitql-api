import { TrunkConfigHandler } from "src/config/trunk-config/index";
import { BranchRefModel, RepositoryModel, TrackingBranchRefModel } from "src/repository";

export class DefaultTrunkConfigHandler implements TrunkConfigHandler {

    // NOTE: We only consider branches on "origin" to be trunk
    private readonly _trunkNames = ["main", "master", "develop"];

    constructor(private readonly repository: RepositoryModel) {

    }

    isTrunk(ref: TrackingBranchRefModel): Promise<boolean> {
        return Promise.resolve(this._trunkNames.includes(ref.ref.name));
    }

    async resolveParent(ref: BranchRefModel | TrackingBranchRefModel): Promise<TrackingBranchRefModel> {

        if (this._trunkNames.includes(ref.ref.name)) {
            return null;
        }

        const trackingBranches = await this.repository.allTrackingBranches;

        for (const trunkName of this._trunkNames) {
            if (trackingBranches.has(trunkName)) {
                return trackingBranches.get(trunkName);
            }
        }

        // No trunk found
        console.warn(`Unable to resolve parent for: '${ref.displayName}', repo: '${this.repository.path}'`);
        return null;
    }
}