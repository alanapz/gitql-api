import { Stats } from "node:fs";

const fs = require("fs/promises");

export const ioUtils = {

    async fstatOrNull(path: string): Promise<Stats> {
        try {
            // Do not optimise (by removing await) - otherwise catch will be ignored (not on stack)
            return await fs.stat(path);
        }
        catch (e) {
            return null;
        }
    }
};
