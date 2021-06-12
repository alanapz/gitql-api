import { error } from "src/check";
import { GitObjectDetails } from "src/git/types";
import { GitUtils } from "src/git/utils";

export class GitCatFileParser
{
    private bytesRemaining: number;

    private header: string;

    private buffer: string;

    constructor(private readonly objectFound: (object: GitObjectDetails) => void, private readonly objectMissing: (objectId: string) => void) {

    }

    processNext(next: string): void {
        next.split('\n').forEach(line => {
            this.processLine(`${line}\n`);
        });
    }

    private processLine(next: string): void {

        if (this.consumeHeader(next)) {
            return;
        }

        if (this.consumeError(next)) {
            return;
        }

        if (this.consumeData(next)) {
            return;
        }

        if (next == '\n') {
            return;
        }

        throw error(`Unexpected value: '${next}'`);
    }

    private consumeHeader(next: string): boolean {

        const matcher = next.match(/^(?<id>[a-f0-9]+)\s+(?<type>blob|tree|commit|tag)\s+(?<size>\d+)\n$/i);

        if (!matcher) {
            return false
        }

        this.flushBuffer();

        this.bytesRemaining = parseInt(matcher.groups['size'], 10) + 2; // +2 for the 2 newlines between header and body
        this.header = next.trim();
        this.buffer = "";

        return true;
    }

    private flushBuffer(): void {

        if (this.buffer) {
            const completeObject = `${this.header.trim()}\n${this.buffer.trim()}`;
            // console.log("X |" + completeObject + "|")
            const results = GitUtils.parseObjectDetailsList(completeObject);
            if (!results || results.length !== 1) {
                throw error(`Unparseable result: '${results}'`);
            }
            this.objectFound(results[0]);
        }

        this.bytesRemaining = null;
        this.header = null;
        this.buffer = null;
    }

    private consumeError(next: string): boolean {

        const matcher = next.match(/^(?<id>[a-f0-9]+)\s+missing\n$/i);

        if (!matcher) {
            return false;
        }

        this.flushBuffer();

        this.objectMissing(matcher.groups['id']);

        return true;
    }

    private consumeData(next: string): boolean {

        if (this.bytesRemaining === null) {
            return false;
        }

        this.bytesRemaining -= next.length;
        this.buffer += next;

        if (this.bytesRemaining == 0) {
            this.flushBuffer();
        }

        if (this.bytesRemaining < 0) {
            throw error("Negative bytes remaining");
        }

        return true;
    }
}
