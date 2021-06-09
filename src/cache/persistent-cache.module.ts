import { Module } from "@nestjs/common";
import { PersistentCacheService } from "src/cache/persistent-cache.service";

@Module({
    providers: [PersistentCacheService],
    exports: [PersistentCacheService]
})
export class PersistentCacheModule {}
