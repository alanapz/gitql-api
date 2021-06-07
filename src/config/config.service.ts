import { Injectable } from '@nestjs/common';
import { stringNotNullNotEmpty } from "src/check";

@Injectable()
export class ConfigService {

    private readonly _repoRoot: string;

    constructor() {
        this._repoRoot = stringNotNullNotEmpty(process.env["GQL_ROOT"], "'GQL_ROOT' not defined");
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
