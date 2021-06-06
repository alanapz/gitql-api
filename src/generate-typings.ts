import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const fs = require("fs/promises");
const path = require("path");

Promise.resolve()
    .then(() => generateSchema(join(process.cwd(), 'src/generated/graphql.ts')))
    .then(() => generateSchema(join(process.cwd(), '../dorax/src/generated/graphql.ts')))
    .then(() => console.log("Generation complete"));

async function generateSchema(outputPath: string): Promise<void> {

    try {
        await fs.stat(path.dirname(outputPath));
    }
    catch (exception) {
        console.warn(`Not writing schema to '${outputPath}', parent folder not found`)
        return;
    }

    console.log(`Writing GraphQL schema to: ${outputPath}`);

    const definitionsFactory = new GraphQLDefinitionsFactory();
    await definitionsFactory.generate({
        typePaths: [ join(process.cwd(), 'schema/schema.graphqls') ],
        path: outputPath,
        outputAs: 'interface',
        emitTypenameField: true,
        skipResolverArgs: false
    });
}
