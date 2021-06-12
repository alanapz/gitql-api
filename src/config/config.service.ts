import { Injectable } from '@nestjs/common';
import { stringNotNullNotEmpty } from "src/check";

@Injectable()
export class ConfigService {

    private readonly _repoRoot: string;

    constructor() {
        this._repoRoot = stringNotNullNotEmpty(process.env["GQL_ROOT"], "'GQL_ROOT' not defined");
    }

    get repoRoot(): string {
        return this._repoRoot;
    }

    get maxSearchDepth(): number {
        return 2;
    }

    isPathSkipped(value: string): boolean {
        return value.includes("node_modules");
    }
}
