import { ServiceFactory } from "./factories/serviceFactory";
import { ElectronHelper } from "./helpers/electronHelper";
import { IConfiguration } from "./models/config/IConfiguration";
import { JsonStorageService } from "./services/jsonStorageService";
import { SettingsService } from "./services/settingsService";
import { WalletService } from "./services/walletService";

/**
 * Register all the services.
 */
export function registerServices(config: IConfiguration, appName: string): void {
    ServiceFactory.register("configuration", () => config);

    if (ElectronHelper.isElectron()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { ElectronStorageService } = require("./services/electronStorageService");
        ServiceFactory.register("storage", () => new ElectronStorageService(appName));
    } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { LocalStorageService } = require("./services/localStorageService");
        ServiceFactory.register("storage", () => new LocalStorageService());
    }
    ServiceFactory.register("json-storage", () => new JsonStorageService());
    ServiceFactory.register("wallet", () => new WalletService());
    ServiceFactory.register("settings", () => new SettingsService());
}