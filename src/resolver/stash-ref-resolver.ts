import { Resolver } from "@nestjs/graphql";
import { RefResolver } from "src/resolver/ref-resolver";

@Resolver("GitStash")
export class StashRefResolver extends RefResolver {

}
