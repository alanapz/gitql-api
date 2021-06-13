import { Module } from "@nestjs/common";
import { ConfigService } from "src/config/config.service";
import { TrunkConfigService } from "src/config/trunk-config/trunk-config.service";
import { WebUrlService } from "src/config/web-url/web-url.service";

@Module({
    providers: [ConfigService, WebUrlService, TrunkConfigService],
    exports: [ConfigService, WebUrlService, TrunkConfigService]
})
export class ConfigModule {}
