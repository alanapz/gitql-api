import { Injectable } from '@nestjs/common';
import { DefaultTrunkConfigHandler } from "src/config/trunk-config/default-trunk-config-handler";
import { TrunkConfigHandler } from "src/config/trunk-config/index";
import { RepositoryModel } from "src/repository";

@Injectable()
export class TrunkConfigService {

    buildTrunkConfigHandler(repository: RepositoryModel): Promise<TrunkConfigHandler> {
        return Promise.resolve(new DefaultTrunkConfigHandler(repository));
    }
}
