import { Injectable } from '@nestjs/common';
import { WebUrlHandler } from "src/weburl";
import { BitbucketWebUrlHandler } from "src/weburl/bitbucket-web-url-handler";
import { GithubWebUrlHandler } from "src/weburl/github-web-url-handler";
import { NullWebUrlHandler } from "src/weburl/null-web-url-handler";

@Injectable()
export class WebUrlService {

    private readonly fallback = new NullWebUrlHandler();

    buildWebHandler(url: string): WebUrlHandler {

        const handlers = [
            () => BitbucketWebUrlHandler.matches(url),
            () => GithubWebUrlHandler.matches(url)
        ];

        for (const handler of handlers) {
            const result = handler();
            if (result) {
                return result;
            }
        }

        return this.fallback;
    }
}
