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
            apiRegistryEndpoint: settings.apiRegistryEndpoint,
            apiEndpoint: settings.apiEndpoint,
            user: settings.user,
            password: settings.password,
            accessManaPledgeID: settings.accessManaPledgeID,
            consensusManaPledgeID: settings.consensusManaPledgeID,
            gofConfThreshold: settings.gofConfThreshold,
            isBusy: false
        });
    }

    private static imposeMinMax(el: HTMLInputElement): void {
        if (el.value !== "") {
            if (parseInt(el.value) < parseInt(el.min)) {
                el.value = el.min;
            }
            if (parseInt(el.value) > parseInt(el.max)) {
                el.value = el.max;
            }
        }
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
                        {/* <div className="card--label">
                            API Asset Registry Endpoint
                        </div>
                        <div className="card--value">
                            <input
                                className="fill"
                                type="text"
                                value={this.state.apiRegistryEndpoint}
                                onChange={e => this.setState({ apiRegistryEndpoint: e.target.value })}
                            />
                        </div> */}
                        {this.props.isDev &&
                            <div>
                                <div className="card--label">
                                    API Asset Registry Endpoint
                                </div>
                                <div className="card--value">
                                    <input
                                        className="fill"
                                        type="text"
                                        value={this.state.apiRegistryEndpoint}
                                        onChange={e => this.setState({ apiRegistryEndpoint: e.target.value })}
                                    />
                                </div>
                            </div>
                        }
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
                        <div className="card--label">
                            API Username
                        </div>
                        <div className="card--value">
                            <input
                                className="fill"
                                type="text"
                                value={this.state.user}
                                onChange={e => this.setState({ user: e.target.value })}
                            />
                        </div>
                        <div className="card--label">
                            API Password
                        </div>
                        <div className="card--value">
                            <input
                                className="fill"
                                type="password"
                                value={this.state.password}
                                onChange={e => this.setState({ password: e.target.value })}
                            />
                        </div>
                        <div className="card--label">
                            Access Mana Pledge ID
                        </div>
                        <div className="card--value">
                            <input
                                className="fill"
                                type="text"
                                value={this.state.accessManaPledgeID}
                                onChange={e => this.setState({ accessManaPledgeID: e.target.value })}
                            />
                        </div>
                        <div className="card--label">
                            Consensus Mana Pledge ID
                        </div>
                        <div className="card--value">
                            <input
                                className="fill"
                                type="text"
                                value={this.state.consensusManaPledgeID}
                                onChange={e => this.setState({ consensusManaPledgeID: e.target.value })}
                            />
                        </div>
                        <div className="card--label">
                            Grade Of Finality for confirmation
                        </div>
                        <div className="card--value">
                            <input
                                className="fill"
                                type="number"
                                min="1"
                                max="3"
                                value={this.state.gofConfThreshold}
                                onChange={e => {
                                    Settings.imposeMinMax(e.target);
                                    this.setState({ gofConfThreshold: e.target.valueAsNumber });
                                    }
                                }
                            />
                        </div>
                        <div className="margin-t-s">
                            <button
                                onClick={() => this.save()}
                                className="margin-r-t"
                            >
                                OK
                            </button>
                            <button className="button--secondary"
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

        let newRegistryEndpoint = this.state.apiRegistryEndpoint ?? "";
        if (newRegistryEndpoint.endsWith("/")) {
            newRegistryEndpoint = newRegistryEndpoint.substr(0, newRegistryEndpoint.length - 1);
        }

        const newSettings: ISettings = {
            apiRegistryEndpoint: newRegistryEndpoint,
            apiEndpoint: newEndpoint,
            user: this.state.user ?? "",
            password: this.state.password ?? "",
            accessManaPledgeID: this.state.accessManaPledgeID ?? "",
            consensusManaPledgeID: this.state.consensusManaPledgeID ?? "",
            gofConfThreshold: this.state.gofConfThreshold ?? 0
        };
        await this._settingsService.set(newSettings);

        this.props.onClose(newSettings);
    }
}

export default Settings;
