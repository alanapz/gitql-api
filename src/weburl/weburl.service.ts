import { Injectable } from '@nestjs/common';
import { stringNotNullNotEmpty } from "src/check";
import { RefModel, RepositoryModel } from 'src/repository';

@Injectable()
export class WebUrlService {

    private readonly _repoRoot: string;

    constructor() {
        this._repoRoot = stringNotNullNotEmpty(process.env["GQL_ROOT"], "'GQL_ROOT' not defined");
    }

    refWebUrl(repo: RepositoryModel, ref: RefModel) {
        // ssh://git@cosgit1.ds.jdsu.net:7999/onmsi/topaz-app.git
        return "https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/commits?until=refs%2Fheads%2Ffeature%2FONMSI-7482-ept-7761-btor-aaa-add-the-accounting-part";
    }

    commitUrl() {
        return "https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/commits/1b1855676308e67d18b9f2999e63b6da8c93a7d7";
    }

    activityUrl() {
        return "https://cosgit1.ds.jdsu.net/plugins/servlet/rss4stash/repo-activities/ONMSI/aaa-service";
    }


    repositoryUrl() {
        return "https://cosgit1.ds.jdsu.net/projects/ONMSI/repos/aaa-service/browse";
    }

    allBranches() {
        return "https://cosgit1.ds.jdsu.net/plugins/servlet/bb_ag/projects/ONMSI/repos/aaa-service/commits";
    }

    get repoRoot() {
        return this._repoRoot;
    }

    get maxSearchDepth() {
        return 2;
    }

    isPathSkipped(value: string) {
        return value.indexOf("node_modules") !== -1;
    }
}
