import { Module } from "@nestjs/common";
import { PersistentCacheModule } from "src/cache/persistent-cache.module";
import { ConfigModule } from "src/config/config.module";
import { GitModule } from "src/git/git.module";
import { RepositoryModule } from "src/repository/repository.module";
import { BlobResolver } from "src/resolver/blob-resolver";
import { BranchRefResolver } from "src/resolver/branch-ref-resolver";
import { CommitResolver } from "src/resolver/commit-resolver";
import { MutationResolver } from "src/resolver/mutation-resolver";
import { PrincipalResolver } from "src/resolver/principal-resolver";
import { QueryResolver } from "src/resolver/query-resolver";
import { RefDistanceResolver } from "src/resolver/ref-distance-resolver";
import { RemoteResolver } from "src/resolver/remote-resolver";
import { RepositoryResolver } from "src/resolver/repository-resolver";
import { RepositoryResolverMutator } from "src/resolver/repository-resolver-mutator";
import { StashRefResolver } from "src/resolver/stash-ref-resolver";
import { TagRefResolver } from "src/resolver/tag-ref-resolver";
import { TrackingBranchRefResolver } from "src/resolver/tracking-branch-ref-resolver";
import { TreeDescendantResolver } from "src/resolver/tree-descendant-resolver";
import { TreeItemBlobResolver } from "src/resolver/tree-item-blob-resolver";
import { TreeItemSubtreeResolver } from "src/resolver/tree-item-subtree-resolver";
import { TreeResolver } from "src/resolver/tree-resolver";
import { WorkingDirectoryItemResolver } from "src/resolver/working-directory-item-resolver";
import { WorkingDirectoryResolver } from "src/resolver/working-directory-resolver";

@Module({
  imports: [ConfigModule, GitModule, PersistentCacheModule, RepositoryModule],
  providers: [
      QueryResolver,
      MutationResolver,
      BlobResolver,
      BranchRefResolver,
      CommitResolver,
      PrincipalResolver,
      RefDistanceResolver,
      RemoteResolver,
      RepositoryResolver,
      RepositoryResolverMutator,
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
export class ResolverModule {}
