import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { GqlModuleOptions } from "@nestjs/graphql/dist/interfaces/gql-module-options.interface";
import { GitContextInterceptor } from "src/query/ctx/GitContextInterceptor";
import { ResolverModule } from "src/resolver/resolver.module";
import { AppController } from './app.controller';

const join = require('path').join;

const graphQl: GqlModuleOptions = {
  typePaths: [ join(process.cwd(), 'schema/schema.graphqls'), join(process.cwd(), 'schema/schema-mutator.graphqls') ],
  debug: true,
  playground: true,
  definitions: {
    path: join(process.cwd(), 'src/generated/graphql.ts'),
    outputAs: 'interface',
    emitTypenameField: true,
    skipResolverArgs: false
  },
  // https://docs.nestjs.com/graphql/other-features#execute-enhancers-at-the-field-resolver-level
  fieldResolverEnhancers: ['interceptors'],
  resolverValidationOptions: {
    requireResolversForArgs: "error",
    requireResolversForNonScalar: "error",
    requireResolversToMatchSchema: "error",
    requireResolversForResolveType: "ignore",
  },
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
};

@Module({
  imports: [GraphQLModule.forRoot(graphQl), ResolverModule],
  controllers: [AppController],
  providers: [{
    provide: APP_INTERCEPTOR,
    useClass: GitContextInterceptor,
  }],
})
export class AppModule {}
