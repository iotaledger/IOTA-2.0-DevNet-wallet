import React, { Component, ReactNode } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ISettings } from "../../models/ISettings";
import { ISettingsService } from "../../models/services/ISettingsService";
import { SettingsProps } from "./SettingsProps";
import { SettingsState } from "./SettingsState";

/**
 * Component which will display settings.
 */
class Settings extends Component<SettingsProps, SettingsState> {
    /**
     * Settings service.
     */
    private readonly _settingsService: ISettingsService;

    /**
     * Create a new instance of App.
     * @param props The props.
     */
    constructor(props: SettingsProps) {
        super(props);

        this._settingsService = ServiceFactory.get<ISettingsService>("settings");

        this.state = {
            isBusy: true
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        const settings = await this._settingsService.get();
        this.setState({
            settings,
            apiEndpoint: settings.apiEndpoint,
            isBusy: false
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="settings">
                <div className="card">
                    <div className="card--header">
                        <h2>General</h2>
                    </div>
                    <div className="card--content">
                        <div className="card--label">
                            API Endpoint
                        </div>
                        <div className="card--value">
                            <input
                                className="fill"
                                type="text"
                                value={this.state.apiEndpoint}
                                onChange={e => this.setState({ apiEndpoint: e.target.value })}
                            />
                        </div>
                        <div className="margin-t-s">
                            <button
                                onClick={() => this.save()}
                                className="margin-r-t"
                            >
                                OK
                            </button>
                            <button
                                onClick={() => this.props.onClose()}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Save the settings.
     */
    private async save(): Promise<void> {
        let newEndpoint = this.state.apiEndpoint ?? "";
        if (newEndpoint.endsWith("/")) {
            newEndpoint = newEndpoint.substr(0, newEndpoint.length - 1);
        }

        const newSettings: ISettings = {
            apiEndpoint: newEndpoint
        };
        await this._settingsService.set(newSettings);

        this.props.onClose(newSettings);
    }
}

export default Settings;
