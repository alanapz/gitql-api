import { Module } from "@nestjs/common";
import { ConfigModule } from "src/config/config.module";
import { GitModule } from "src/git/git.module";
import { BlobResolver } from "src/query/repository/BlobResolver";
import { BranchRefResolver } from "src/query/repository/BranchRefResolver";
import { CommitResolver } from "src/query/repository/CommitResolver";
import { MutationResolver } from "src/query/repository/MutationResolver";
import { PrincipalResolver } from "src/query/repository/PrincipalResolver";
import { QueryResolver } from "src/query/repository/QueryResolver";
import { RefDistanceResolver } from "src/query/repository/RefDistanceResolver";
import { RepositoryResolver } from "src/query/repository/RepositoryResolver";
import { StashRefResolver } from "src/query/repository/StashRefResolver";
import { TagRefResolver } from "src/query/repository/TagRefResolver";
import { TrackingBranchRefResolver } from "src/query/repository/TrackingBranchRefResolver";
import { TreeDescendantResolver } from "src/query/repository/TreeDescendantResolver";
import { TreeItemBlobResolver } from "src/query/repository/TreeItemBlobResolver";
import { TreeItemSubtreeResolver } from "src/query/repository/TreeItemSubtreeResolver";
import { TreeResolver } from "src/query/repository/TreeResolver";
import { WorkingDirectoryItemResolver } from "src/query/repository/WorkingDirectoryItemResolver";
import { WorkingDirectoryResolver } from "src/query/repository/WorkingDirectoryResolver";

@Module({
  imports: [GitModule, ConfigModule],
  providers: [
      BlobResolver,
      BranchRefResolver,
      CommitResolver,
      MutationResolver,
      PrincipalResolver,
      QueryResolver,
      RefDistanceResolver,
      RepositoryResolver,
      StashRefResolver,
      TagRefResolver,
      TrackingBranchRefResolver,
      TreeDescendantResolver,
      TreeResolver,
      TreeItemBlobResolver,
      TreeItemSubtreeResolver,
      WorkingDirectoryResolver,
      WorkingDirectoryItemResolver
  ],
})
export class QueryModule {}
