import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Check } from "src/check";
import { ConfigService } from "src/config/config.service";
import { GitBranchFilter, GitRepository } from "src/generated/graphql";
import { GitUtils } from "src/git/utils";
import {
    BlobModel,
    BranchRefModel,
    CommitModel,
    RefModel,
    RepositoryModel,
    StashRefModel,
    TrackingBranchRefModel,
    TreeModel,
    WorkingDirectoryModel
} from "src/query/repository/types";
import { map_values } from "src/utils/utils";

const path = require("path");

const check: Check = require.main.require("./check");

@Resolver("GitRepository")
export class RepositoryResolver {

    constructor(private readonly configService: ConfigService) {
        check.nonNull(configService, "configService");
    }

    @ResolveField("path")
    getPath(@Parent() model: RepositoryModel): Promise<string> {
        return Promise.resolve(path.relative(this.configService.repoRoot, model.path));
    }

    @ResolveField("commit")
    getCommitById(@Parent() model: RepositoryModel, @Args('id') commitId: string): Promise<CommitModel> {
        check.stringNonNullNotEmpty(commitId, 'commitId');
        return model.lookupCommit(commitId, 'null');
    }

    @ResolveField("blob")
    getBlobById(@Parent() model: RepositoryModel, @Args('id') blobId: string): Promise<BlobModel> {
        check.stringNonNullNotEmpty(blobId, 'blobId');
        return model.lookupBlob(blobId, 'null');
    }

    @ResolveField("tree")
    getTreeById(@Parent() model: RepositoryModel, @Args('id') treeId: string): Promise<TreeModel> {
        check.stringNonNullNotEmpty(treeId, 'treeId');
        return model.lookupTree(treeId, 'null');
    }

    @ResolveField("ref")
    getRefByName(@Parent() model: RepositoryModel, @Args('name') refName: string): Promise<RefModel> {
        check.stringNonNullNotEmpty(refName, 'refName');
        return model.lookupRef(GitUtils.parseExplicitRef(refName), 'null');
    }

    @ResolveField("branches")
    async listBranches(@Parent() model: RepositoryModel, @Args('filter') filter: GitBranchFilter): Promise<BranchRefModel[]> {
        let branches: BranchRefModel[] = Array.from((await model.allBranches).values());
        if (filter && filter.upstreamConfigured !== undefined && filter.upstreamConfigured !== null) {
            branches = branches.filter(ref => (ref.upstream == null) == filter.upstreamConfigured);
        }
        return branches;
    }

    @ResolveField("branch")
    getBranchByName(@Parent() model: RepositoryModel, @Args('name') branchName: string): Promise<BranchRefModel> {
        check.stringNonNullNotEmpty(branchName, 'branchName');
        return model.lookupBranch(GitUtils.toBranchRef(branchName), 'null');
    }

    @ResolveField("trackingBranches")
    listTrackingBranches(@Parent() model: RepositoryModel): Promise<TrackingBranchRefModel[]> {
        return map_values(model.allTrackingBranches);
    }

    @ResolveField("trackingBranch")
    getTrackingBranchByName(@Parent() model: RepositoryModel, @Args('name') trackingBranchName: string): Promise<TrackingBranchRefModel> {
        check.stringNonNullNotEmpty(trackingBranchName, 'trackingBranchName');
        return model.lookupTrackingBranch(GitUtils.toTrackingBranchRef(trackingBranchName), 'null');
    }

    @ResolveField("stashes")
    listStashes(@Parent() model: RepositoryModel): Promise<StashRefModel[]> {
        return map_values(model.allStashes);
    }

    @ResolveField("stash")
    getStashByName(@Parent() model: RepositoryModel, @Args('name') stashName: string): Promise<StashRefModel> {
        check.stringNonNullNotEmpty(stashName, 'stashName');
        return model.lookupStash(GitUtils.toStashRef(stashName), 'null');
    }

    @ResolveField("lastFetchDate")
    getLastFetchDate(@Parent() model: RepositoryModel): Promise<number|null> {
        return model.lastFetchDate;
    }

    @ResolveField("head")
    getHead(@Parent() model: RepositoryModel): Promise<RefModel> {
        return model.head;
    }

    @ResolveField("workingDirectory")
    getWorkingDirectory(@Parent() model: RepositoryModel): Promise<WorkingDirectoryModel> {
        return model.workingDirectory;
    }
}

