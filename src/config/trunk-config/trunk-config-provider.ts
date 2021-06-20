export interface TrunkConfigProvider {
    isTrunk: (name: string) => boolean | Promise<boolean>;
    resolveParent: (name: string, candidates: Set<string>) => string | Promise<string>;
}
