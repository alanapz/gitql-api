import { TrackingBranchRef } from "src/git";

export interface TrunkConfigHandler {
    isTrunk: (ref: TrackingBranchRef) => Promise<boolean>;
    resolveParent: (ref: TrackingBranchRef) => Promise<TrackingBranchRef>;
}
