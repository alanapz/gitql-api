import { Injectable } from '@nestjs/common';
import { stringNotNullNotEmpty } from "src/check";

@Injectable()
export class ConfigService {

    private readonly _workspaceRoot: string;

    private readonly _hostWorkspaceRoot: string;

    constructor() {
        this._workspaceRoot = stringNotNullNotEmpty(process.env["WORKSPACE_ROOT"], "'WORKSPACE_ROOT' not defined");
        this._hostWorkspaceRoot = stringNotNullNotEmpty(process.env["HOST_WORKSPACE_ROOT"] || process.env["WORKSPACE_ROOT"], "'HOST_WORKSPACE_ROOT' not defined");
    }

    get workspaceRoot(): string {
        return this._workspaceRoot;
    }

    get hostWorkspaceRoot(): string {
        return this._hostWorkspaceRoot;
    }

    get maxSearchDepth(): number {
        return 2;
    }

    isPathSkipped(value: string): boolean {
        return value.includes("node_modules");
    }

    logInfo(message: any[]): void {
        if (process.env["GQL_DEBUG"]) {
            console.log(... message);
        }
    }
}
