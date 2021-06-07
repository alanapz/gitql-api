import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

Promise.resolve()
    .then(() => generateSchema(join(process.cwd(), 'src/generated/graphql.ts')))
    .then(() => console.log("Generation complete"));

async function generateSchema(outputPath: string): Promise<void> {

    console.log(`Writing GraphQL schema to: ${outputPath}`);

    const definitionsFactory = new GraphQLDefinitionsFactory();
    await definitionsFactory.generate({
        typePaths: [ join(process.cwd(), 'schema/schema.graphqls'), join(process.cwd(), 'schema/schema-mutator.graphqls') ],
        path: outputPath,
        outputAs: 'interface',
        emitTypenameField: true,
        skipResolverArgs: false
    });
}
