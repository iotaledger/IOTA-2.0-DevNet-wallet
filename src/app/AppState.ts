import { ISettings } from "../models/ISettings";
import { IWallet } from "../models/IWallet";

export interface AppState {
    /**
     * The display mode.
     */
    displayMode: string;

    /**
     * The current wallet.
     */
    wallet?: IWallet;

    /**
     * The current settings.
     */
    settings?: ISettings;
}
