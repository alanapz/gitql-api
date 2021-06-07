import { Resolver } from "@nestjs/graphql";
import { RefResolver } from "src/resolver/ref-resolver";

@Resolver("GitTag")
export class TagRefResolver extends RefResolver {

}
