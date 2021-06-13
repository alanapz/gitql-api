import { Injectable } from '@nestjs/common';
import { WebUrlHandler } from "src/config/web-url";
import { BitbucketWebUrlHandler } from "src/config/web-url/bitbucket-web-url-handler";
import { DefaultWebUrlHandler } from "src/config/web-url/default-web-url-handler";
import { GithubWebUrlHandler } from "src/config/web-url/github-web-url-handler";

@Injectable()
export class WebUrlService {

    private readonly fallback = new DefaultWebUrlHandler();

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
