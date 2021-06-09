import { Injectable } from '@nestjs/common';
import { RefDistance } from "src/git";
import { asyncMap } from "src/utils/async-map";

@Injectable()
export class PersistentCacheService {

    private readonly _refDistances = asyncMap<string, RefDistance>();

    private readonly _commitReachability = asyncMap<string, boolean>();

    lookupRefDistance(sourceCommitId: string, targetCommitId: string, supplier: () => Promise<RefDistance>): Promise<RefDistance> {
        return this._refDistances.fetch(`${sourceCommitId}_${targetCommitId}`, supplier);
    }

    isReachableBy(commitId: string, refHeadId: string, supplier: () => Promise<boolean>): Promise<boolean> {
        //console.log(this._commitReachability);
        return this._commitReachability.fetch(`${commitId}_${refHeadId}`, supplier);
    }
}
