import { TrunkConfigProvider } from "src/config/trunk-config/trunk-config-provider";

export class DefaultTrunkConfigProvider implements TrunkConfigProvider {

    private readonly _trunkNames = ["main", "master", "develop"];

    isTrunk(name: string): boolean {
        return this._trunkNames.includes(name);
    }

    resolveParent(name: string, candidates: Set<string>): string {
        for (const trunkName of this._trunkNames) {
            if (candidates.has(trunkName)) {
                return trunkName;
            }
        }
        return null;
    }
}
