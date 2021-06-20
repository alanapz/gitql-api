import { TrunkConfigProvider } from "src/config/trunk-config/trunk-config-provider";
import { RepositoryModel } from "src/repository";

export class ViaviTrunkConfigProvider implements TrunkConfigProvider {

    private static readonly INSTANCE = new ViaviTrunkConfigProvider();

    private constructor() {

    }

    isTrunk(name: string): boolean {
        return ViaviTrunkConfigProvider._isTrunk(name);
    }

    // noinspection JSUnusedLocalSymbols
    resolveParent(name: string, candidates: Set<string>): string {
        const matcher = name.match("^(feature|hotfix)/(?<trunk>[a-z]{2,}\\d{4})/.+");
        if (!matcher) {
            return null;
        }
        return (matcher && matcher.groups["trunk"]);
    }

    public static async matches(repository: RepositoryModel): Promise<TrunkConfigProvider> {

        // We consider ourselves a Viavi multi-trunk repo if we have multiple trunk tracking branches on origin
        const origin = await repository.lookupRemote("origin", "null");

        if (!origin) {
            return null;
        }

        const trunkBranches = (await origin.branches).filter(branch => ViaviTrunkConfigProvider._isTrunk(branch.name));

        if (trunkBranches.length > 1) {
            return ViaviTrunkConfigProvider.INSTANCE;
        }

        return null;
    }

    private static _isTrunk(name: string): boolean {
        return name === 'main' || !! name.match("^[a-z]{2,}\\d{4}$") || !! name.match("^release/");
    }
}
