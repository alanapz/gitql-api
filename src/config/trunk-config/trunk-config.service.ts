import { Injectable } from '@nestjs/common';
import { TrunkConfigHandler } from "src/config/trunk-config/index";
import { DefaultTrunkConfigProvider } from "src/config/trunk-config/provider/default-trunk-config-provider";
import { ViaviTrunkConfigProvider } from "src/config/trunk-config/provider/viavi-trunk-config-provider";
import { TrunkConfigHandlerImpl } from "src/config/trunk-config/trunk-config-handler-impl";
import { TrunkConfigProvider } from "src/config/trunk-config/trunk-config-provider";
import { RepositoryModel } from "src/repository";

@Injectable()
export class TrunkConfigService {

    private readonly fallback = new DefaultTrunkConfigProvider();

    async buildTrunkConfigHandler(repository: RepositoryModel): Promise<TrunkConfigHandler> {
        const provider = (await this.resolveProvider(repository)) || this.fallback;
        return Promise.resolve(new TrunkConfigHandlerImpl(repository, provider));
    }

    async resolveProvider(repository: RepositoryModel): Promise<TrunkConfigProvider> {
        const origin = await repository.lookupRemote("origin", "warn");

        if (!origin) {
            return null;
        }

        const fetchUrl = await origin.fetchUrl;
        if (!fetchUrl) {
            return null;
        }

        const handlers = [
            () => ViaviTrunkConfigProvider.matches(fetchUrl),
        ];

        for (const handler of handlers) {
            const result = handler();
            if (result) {
                return result;
            }
        }

        return null;
    }
}
