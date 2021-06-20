import { error } from "src/check";
import { TrunkConfigHandler } from "src/config/trunk-config/index";
import { TrunkConfigProvider } from "src/config/trunk-config/trunk-config-provider";
import {
    BranchRefModel,
    isBranchRefModel,
    isTrackingBranchRefModel,
    RepositoryModel,
    TrackingBranchRefModel
} from "src/repository";
import { map_reducer } from "src/utils/utils";

export class TrunkConfigHandlerImpl implements TrunkConfigHandler {

    constructor(private readonly repository: RepositoryModel, private readonly provider: TrunkConfigProvider) {

    }

    isTrunk(ref: BranchRefModel | TrackingBranchRefModel): Promise<boolean> {
        return Promise.resolve(this.provider.isTrunk(ref.name));
    }

    async resolveParent(ref: BranchRefModel | TrackingBranchRefModel): Promise<TrackingBranchRefModel> {

        if (await this.isTrunk(ref)) {
            return null;
        }

        const candidateBranches = await this.getCandidateBranches(ref);
        if (!candidateBranches) {
            return null;
        }

        const candidateBranchMap = candidateBranches.reduce(map_reducer(branch => branch.name), new Map<string, TrackingBranchRefModel>());

        const selectedTrunk = await this.provider.resolveParent(ref.name, new Set<string>(candidateBranchMap.keys()));

        if (!selectedTrunk) {
            console.warn(`Couldn't resolve parent for: '${ref.name}', repo: '${this.repository.path}', provider: '${this.provider.constructor.name}'`);
            return null;
        }

        if (!candidateBranchMap.has(selectedTrunk)) {
            throw error(`Parent branch not found: '${selectedTrunk}', for: '${ref.name}', repo: '${this.repository.path}'`);
        }

        return candidateBranchMap.get(selectedTrunk);
    }

    private async getCandidateBranches(ref: BranchRefModel | TrackingBranchRefModel): Promise<TrackingBranchRefModel[]> {

        // For tracking branches, filter by remote (we only show branches that share the same remote)
        if (isTrackingBranchRefModel(ref)) {
            return (await ref.remote).branches;
        }

        // For local branches, we assume tracking branches from "origin
        if (isBranchRefModel(ref)) {
            const origin = await this.repository.lookupRemote("origin", "warn");
            return (origin && origin.branches);
        }
    }
}
