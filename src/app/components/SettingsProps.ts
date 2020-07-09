import { ISettings } from "../../models/ISettings";

export interface SettingsProps {
    /**
     * The settings were closed.
     */
    onClose(settings?: ISettings): void;
}
