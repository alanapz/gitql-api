import { TrunkConfigHandler } from "src/config/trunk-config/index";
import { TrackingBranchRef } from "src/git";
import { GitUtils } from "src/git/utils";

export class ViaviTrunkConfigHandler implements TrunkConfigHandler {

    isTrunk(ref: TrackingBranchRef): Promise<boolean> {
        return Promise.resolve(ref.name === 'main' || !! ref.name.match("^[a-z]{2,}\d{4}$"));
    }

    async resolveParent(ref: TrackingBranchRef): Promise<TrackingBranchRef> {

        if (await this.isTrunk(ref)) {
            return null;
        }

        const matcher = ref.name.match("^(feature|hotfix)/(?<trunk>[a-z]{2,}\d{4))/.+$");

        if (!matcher) {
            return null;
        }

        return GitUtils.toTrackingBranchRef(`${ref.remote}/${matcher.groups["trunk"]}`);
    }
}
