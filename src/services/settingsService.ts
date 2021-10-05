import { ServiceFactory } from "../factories/serviceFactory";
import { ISettings } from "../models/ISettings";
import { IJsonStorageService } from "../models/services/IJsonStorageService";
import { ISettingsService } from "../models/services/ISettingsService";

const defaultGofConfThreshold = 3;

/**
 * Service to manage settings.
 */
export class SettingsService implements ISettingsService {
    /**
     * The json storage service to use.
     */
    private readonly _jsonStorageService: IJsonStorageService;

    /**
     * The current settings.
     */
    private _settings?: ISettings;

    /**
     * Create a new instance of SettingsService.
     */
    constructor() {
        this._jsonStorageService = ServiceFactory.get<IJsonStorageService>("json-storage");
    }

    /**
     * Get the current settings.
     * @returns The settings.
     */
    public async get(): Promise<ISettings> {
        if (!this._settings) {
            this._settings = await this._jsonStorageService.get<ISettings>("settings.json");
        }

        if (!this._settings) {
            this._settings = {
                apiRegistryEndpoint: "http://asset-registry.tokenizedassetsdemo.iota.cafe",
                apiEndpoint: "http://nodes.nectar.iota.cafe",
                user: "",
                password: "",
                accessManaPledgeID: "",
                consensusManaPledgeID: "",
                gofConfThreshold: defaultGofConfThreshold
            };
        }

        // always override local settings
        this._settings.apiRegistryEndpoint = "http://asset-registry.tokenizedassetsdemo.iota.cafe";

        return this._settings;
    }

    /**
     * Set the settings.
     * @param settings The settings to store.
     */
    public async set(settings: ISettings): Promise<void> {
        this._settings = settings;

        await this._jsonStorageService.set<ISettings>("settings.json", this._settings);
    }
}
