import { error, notNull, stringNotNullNotEmpty } from "src/check";
import { GitCommit, GitObject, GitObjectDetails, GitObjectType } from "src/git/types";
import { as } from "src/utils/utils";

export class GitObjectParserProcessor
{
    private current: GitObjectParser;

    constructor(private results: GitObjectDetails[]) {

    }

    nextLine(line: string): void {

        const matcher = line.match(/^(?<id>[a-f0-9]{40})\s+(?<type>blob|tree|commit|tag)\s+(?<size>\d+)$/i);

        // If we are not a header line, add current line to existing object
        if (!matcher) {
            this.current?.nextLine(line);
            return;
        }

        // If we are a header line, clear previous object (object is now complete)
        this.complete();

        const id = stringNotNullNotEmpty(matcher.groups['id'], 'id');
        const type = notNull(matcher.groups['type'] as GitObjectType, 'type');
        const size = parseInt(matcher.groups['size'], 10);
    }

    complete() {
        if (this.current) {
            this.results.push(this.current.build());
            this.current = null;
        }
    }
}

export interface GitObjectParser {
    nextLine: (line: string) => void;
    build: () => GitObject;
}

export class GitCommitParser implements GitObjectParser {

    private treeId: string;
    private parentIds: string[] = [];
    private author: string = "unknown";
    private committer: string = "unknown";
    private readonly message: string[] = [];

    private headerComplete = false;

    constructor(private readonly id: string, private readonly size: number) {

    }

    nextLine(line: string) {

        if (this.headerComplete) {
            this.message.push(line)
            return;
        }

        if (!line.trim().length) {
            this.headerComplete = true;
            return;
        }

        let matcher: RegExpMatchArray;

        if ((matcher = line.match(/^tree\s+(?<treeId>[a-f0-9]+)\s*$/i))) {
            this.treeId = matcher.groups['treeId'];
        }
        else if ((matcher = line.match(/^parent\s+(?<parentId>[a-f0-9]+)\s*$/i))) {
            this.parentIds.push(matcher.groups['parentId']);
        }
        else {
            console.warn("Unmatched line: ", line);
        }
    }

    build(): GitCommit {

        if (!this.treeId || !this.treeId.length) {
            throw error(`treeId required for commit: ${this.id}`);
        }
        if (!this.author || !this.author.length) {
            throw error(`author required for commit: ${this.id}`);
        }
        if (!this.committer || !this.committer.length) {
            throw error(`committer required for commit: ${this.id}`);
        }
        if (!this.message || !this.message.length) {
            throw error(`message required for commit: ${this.id}`);
        }

        return as<GitCommit>({
          type: GitObjectType.Commit,
            id: this.id,
            size: this.size,
            parentIds: this.parentIds,
            treeId: this.treeId,
            message: this.message.join("\n").trim()
        });
    }
}


