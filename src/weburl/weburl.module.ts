import { Module } from "@nestjs/common";
import { WebUrlService } from "src/weburl/weburl.service";

@Module({
    providers: [WebUrlService],
    exports: [WebUrlService]
})
export class WebUrlModule {}
