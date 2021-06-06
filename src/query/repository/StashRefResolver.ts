import { Resolver } from "@nestjs/graphql";
import { RefResolver } from "src/query/repository/RefResolver";

@Resolver("GitStash")
export class StashRefResolver extends RefResolver {

}
