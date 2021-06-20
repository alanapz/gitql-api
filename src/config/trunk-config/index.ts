import { BranchRefModel, TrackingBranchRefModel } from "src/repository";

export interface TrunkConfigHandler {
    isTrunk: (ref: BranchRefModel | TrackingBranchRefModel) => Promise<boolean>;
    resolveParent: (ref: BranchRefModel | TrackingBranchRefModel) => Promise<TrackingBranchRefModel>;
}
