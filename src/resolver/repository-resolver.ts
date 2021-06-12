import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { stringNotNullNotEmpty } from "src/check";
import { ConfigService } from "src/config/config.service";
import { GitBranchFilter } from "src/generated/graphql";
import { GitUtils } from "src/git/utils";
import {
    BlobModel,
    BranchRefModel,
    CommitModel,
    RefModel,
    RemoteModel,
    RepositoryModel,
    StashRefModel,
    TrackingBranchRefModel,
    TreeModel,
    WorkingDirectoryModel
} from "src/repository";
import { map_values } from "src/utils/utils";

const path = require("path");

@Resolver("GitRepository")
export class RepositoryResolver {

    constructor(private readonly configService: ConfigService) {

    }

    @ResolveField("path")
    getPath(@Parent() model: RepositoryModel): Promise<string> {
        return Promise.resolve(path.relative(this.configService.repoRoot, model.path));
    }

    @ResolveField("commit")
    getCommitById(@Parent() model: RepositoryModel, @Args('id') commitId: string): Promise<CommitModel> {
        stringNotNullNotEmpty(commitId, 'commitId');
        return model.lookupCommit(commitId, 'null');
    }

    @ResolveField("recentCommits")
    async listRecentCommits(@Parent() model: RepositoryModel, @Args('count') count: number): Promise<CommitModel[]> {
        // Slightly tricky, we need to sort by timestamp but there's no "async sort" function
        const results: {commit: CommitModel, timestamp: number}[] = [... await Promise.all((await map_values(model.allReachableCommits)).map(async commit => {
            const timestamp = (await commit.committer).timestamp;
            return { commit, timestamp };
        }))];
        return results
            .sort((left, right) => right.timestamp - left.timestamp)
            .map(result => result.commit)
            .slice(0, count);
    }

    @ResolveField("blob")
    getBlobById(@Parent() model: RepositoryModel, @Args('id') blobId: string): Promise<BlobModel> {
        stringNotNullNotEmpty(blobId, 'blobId');
        return model.lookupBlob(blobId, 'null');
    }

    @ResolveField("tree")
    getTreeById(@Parent() model: RepositoryModel, @Args('id') treeId: string): Promise<TreeModel> {
        stringNotNullNotEmpty(treeId, 'treeId');
        return model.lookupTree(treeId, 'null');
    }

    @ResolveField("ref")
    getRefByName(@Parent() model: RepositoryModel, @Args('name') refName: string): Promise<RefModel> {
        stringNotNullNotEmpty(refName, 'refName');
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
        stringNotNullNotEmpty(branchName, 'branchName');
        return model.lookupBranch(GitUtils.toBranchRef(branchName), 'null');
    }

    @ResolveField("trackingBranches")
    listTrackingBranches(@Parent() model: RepositoryModel): Promise<TrackingBranchRefModel[]> {
        return map_values(model.allTrackingBranches);
    }

    @ResolveField("trackingBranch")
    getTrackingBranchByName(@Parent() model: RepositoryModel, @Args('name') trackingBranchName: string): Promise<TrackingBranchRefModel> {
        stringNotNullNotEmpty(trackingBranchName, 'trackingBranchName');
        return model.lookupTrackingBranch(GitUtils.toTrackingBranchRef(trackingBranchName), 'null');
    }

    @ResolveField("stashes")
    listStashes(@Parent() model: RepositoryModel): Promise<StashRefModel[]> {
        return map_values(model.allStashes);
    }

    @ResolveField("stash")
    getStashByName(@Parent() model: RepositoryModel, @Args('name') stashName: string): Promise<StashRefModel> {
        stringNotNullNotEmpty(stashName, 'stashName');
        return model.lookupStash(GitUtils.toStashRef(stashName), 'null');
    }

    @ResolveField("remotes")
    listRemotes(@Parent() model: RepositoryModel): Promise<RemoteModel[]> {
        return map_values(model.allRemotes);
    }

    @ResolveField("remote")
    getRemoteByName(@Parent() model: RepositoryModel, @Args('name') remoteName: string): Promise<RemoteModel> {
        stringNotNullNotEmpty(remoteName, 'remoteName');
        return model.lookupRemote(remoteName, 'null');
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

