import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import logoHeader from "../assets/logo-header.svg";
import { ServiceFactory } from "../factories/serviceFactory";
import { ElectronHelper } from "../helpers/electronHelper";
import { ISettingsService } from "../models/services/ISettingsService";
import { IWalletService } from "../models/services/IWalletService";
import "./App.scss";
import { AppProps } from "./AppProps";
import { AppState } from "./AppState";
import Settings from "./components/Settings";
import Wallet from "./components/Wallet";

/**
 * Main application class.
 */
class App extends Component<AppProps, AppState> {
    /**
     * Settings service.
     */
    private readonly _settingsService: ISettingsService;

    /**
     * Wallet service.
     */
    private readonly _walletService: IWalletService;

    /**
     * Create a new instance of App.
     * @param props The props.
     */
    constructor(props: AppProps) {
        super(props);

        this._settingsService = ServiceFactory.get<ISettingsService>("settings");
        this._walletService = ServiceFactory.get<IWalletService>("wallet");

        this.state = {
            displayMode: "wallet"
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        const wallet = await this._walletService.get();
        const settings = await this._settingsService.get();
        this.setState({
            wallet,
            settings
        });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="app">
                <header>
                    <Link className="brand" to="/">
                        <img src={logoHeader} alt="Pollen Wallet" />
                    </Link>
                    {ElectronHelper.isElectron() && (
                        <button
                            onClick={() => window.close()}
                        >
                            X
                        </button>
                    )}
                </header>
                <div className="content">
                    {this.state.displayMode === "settings" && (
                        <Settings
                            onClose={settings => this.setState({
                                settings: settings ?? this.state.settings,
                                displayMode: "wallet"
                            })}
                        />
                    )}
                    {this.state.displayMode === "wallet" && (
                        <Wallet onUpdated={
                            async () => this.setState({
                                wallet: await this._walletService.get()
                            })
                        } />
                    )}
                    {this.state.displayMode === "wallet" &&
                        (!this.state.wallet || (this.state.wallet && !this.state.wallet.seed)) &&
                        this.state.settings?.apiRegistryEndpoint === "http://asset-registry.tokenizedassetsdemo.iota.cafe" && (
                            <div className="card margin-t-s">
                                <div className="card--header">
                                    <h2>Asset Registry Connection</h2>
                                </div>
                            </div>
                        )}
                    {this.state.displayMode === "wallet" &&
                        (!this.state.wallet || (this.state.wallet && !this.state.wallet.seed)) &&
                        this.state.settings?.apiEndpoint === "http://127.0.0.1:8080" && (
                            <div className="card margin-t-s">
                                <div className="card--header">
                                    <h2>Node Connection</h2>
                                </div>
                                <div className="card--content">
                                    <p>By default the wallet is configured to access the API of a Pollen node running on your local machine at http://127.0.0.1:8080</p>
                                    <br />
                                    <p>If you don&apos;t have a node running locally you can either:</p>
                                    <ul className="margin-t-s">
                                        <li>Configure and run a node locally.</li>
                                        <li>Change the Settings to connect to a remote node.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    {this.state.displayMode === "delete-wallet" && (
                        <div className="card">
                            <div className="card--header">
                                <h2>Delete Wallet</h2>
                            </div>
                            <div className="card--content">
                                <p className="margin-b-s">
                                    ARE YOU SURE YOU WANT TO DELETE THE WALLET ?
                                </p>
                                <button
                                    className="button--danger margin-r-s"
                                    onClick={() => this.deleteWallet()}
                                >
                                    Yes
                                </button>
                                <button
                                    className="button--secondary"
                                    onClick={() => this.setState({
                                        displayMode: "wallet"
                                    })}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <footer className="row space-between middle">
                    <div>
                        <button
                            disabled={this.state.displayMode !== "wallet"}
                            className="margin-r-s"
                            onClick={() => this.setState({ displayMode: "settings" })}
                        >
                            Settings
                        </button>
                    </div>
                    <span className="margin-r-s">v{process.env.REACT_APP_VERSION}</span>
                    <div>
                        <button
                            disabled={this.state.displayMode !== "wallet" || !this.state.wallet}
                            className="button--danger"
                            onClick={() => this.setState({ displayMode: "delete-wallet" })}
                        >
                            Delete Wallet
                        </button>
                    </div>

                </footer>
            </div >
        );
    }

    /**
     * Delete a wallet using the service.
     */
    private async deleteWallet(): Promise<void> {
        await this._walletService.delete();
        this.setState({
            displayMode: "wallet",
            wallet: undefined
        });
    }
}

export default App;
