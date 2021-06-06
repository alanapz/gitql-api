import { Check } from "src/check";
import { RepositoryModel } from "src/query/repository/types";

const check: Check = require.main.require("./check");

export class TagImpl {

    public constructor(public readonly repository: RepositoryModel, public readonly name: string) {
        check.nonNull(repository, 'repository');
        check.stringNonNullNotEmpty(name, 'name');
    }
}