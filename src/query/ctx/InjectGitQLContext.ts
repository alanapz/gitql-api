import { createParamDecorator } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { GitQLContext } from "src/query/ctx/GitQLContext";

export const InjectGitQLContext = createParamDecorator(
    (data: unknown, context: ExecutionContextHost): GitQLContext => {

        const obj: any = context.getArgByIndex(1)['gitQLContext'];

        return obj;
    }
);