import { ISettings } from "../models/ISettings";
import { IWallet } from "../models/IWallet";

export interface AppState {
    /**
     * Is the component busy.
     */
    isBusy: boolean;

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
