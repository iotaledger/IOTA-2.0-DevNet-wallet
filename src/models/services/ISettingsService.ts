import { ISettings} from "../ISettings";

export interface ISettingsService {
    /**
     * Get the current settings.
     * @returns The settings.
     */
    get(): Promise<ISettings>;

    /**
     * Set the settings.
     * @param settings The settings to store.
     */
    set(settings: ISettings): Promise<void>;
}
