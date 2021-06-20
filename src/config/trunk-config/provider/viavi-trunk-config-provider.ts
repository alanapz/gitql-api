import { TrunkConfigProvider } from "src/config/trunk-config/trunk-config-provider";

export class ViaviTrunkConfigProvider implements TrunkConfigProvider {

    private static readonly INSTANCE = new ViaviTrunkConfigProvider();

    private constructor() {

    }

    isTrunk(name: string): boolean {
        return name === 'main' || !! name.match("^[a-z]{2,}\\d{4}$") || !! name.match("^release/");
    }

    // noinspection JSUnusedLocalSymbols
    resolveParent(name: string, candidates: Set<string>): string {
        const matcher = name.match("^(feature|hotfix)/(?<trunk>[a-z]{2,}\\d{4})/.+");
        if (!matcher) {
            return null;
        }
        return (matcher && matcher.groups["trunk"]);
    }

    public static matches(fetchUrl: string): TrunkConfigProvider {

        const sshMatcher = fetchUrl.match("^ssh://git@cosgit1\\.ds\\.jdsu\\.net:7999/.+");

        if (sshMatcher) {
            return ViaviTrunkConfigProvider.INSTANCE;
        }

        return null;
    }
}
