import { ISettings } from "../../models/ISettings";

export interface SettingsState {
    /**
     * Is the component busy.
     */
    isBusy: boolean;

    /**
     * The current settings.
     */
    settings?: ISettings;

    /**
     * The api endpoint.
     */
    apiEndpoint?: string;

    /**
     * The nodeID of the access Mana pledge.
     */
    accessManaPledgeID?: string;

    /**
     * The nodeID of the consensus Mana pledge.
     */
    consensusManaPledgeID?: string;
}
