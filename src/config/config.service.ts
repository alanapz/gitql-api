import { Injectable } from '@nestjs/common';
import { Check } from "src/check";
import { lazyValue } from "src/utils/lazy-value";

const check: Check = require.main.require("./check");

@Injectable()
export class ConfigService {

    private readonly _repoRoot: string;

    constructor() {
        this._repoRoot = check.stringNonNullNotEmpty(process.env["GQL_ROOT"], "'GQL_ROOT' not defined");
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
