import { Resolver } from "@nestjs/graphql";
import { RefResolver } from "src/query/repository/RefResolver";

@Resolver("GitTag")
export class TagRefResolver extends RefResolver {

}
