import { createParamDecorator } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { GraphQLResolveInfo } from "graphql";
import { FieldNode } from "graphql/language/ast";
import { aggregate, as } from "src/utils/utils";

export interface GraphQLQueryMetadata {
    directFields(): string[];
}

export const InjectGraphQLQueryMetadata = createParamDecorator(
    (data: unknown, context: ExecutionContextHost) => {

        const resolveInfo: GraphQLResolveInfo = context.getArgByIndex<GraphQLResolveInfo>(3);

        if (!resolveInfo || !resolveInfo.fieldNodes || !resolveInfo.fieldNodes.length) {
            throw new Error('resolveInfo not available');
        }

        return as<GraphQLQueryMetadata>({

            directFields(): string[] {
                return aggregate(resolveInfo.fieldNodes.map(fieldNode => fieldNode.selectionSet
                    .selections
                    .filter(x => x.kind === 'Field')
                    .map(x => x as FieldNode)
                    .map(x => x.name.value)))
            }
        });
    }
);