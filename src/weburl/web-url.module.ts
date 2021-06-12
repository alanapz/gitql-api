import { Module } from "@nestjs/common";
import { WebUrlService } from "src/weburl/web-url.service";

@Module({
    providers: [WebUrlService],
    exports: [WebUrlService]
})
export class WebUrlModule {}
