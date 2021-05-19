import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import nectarDrop1 from "../../assets/nectar-drop-1.svg";
import nectarDrop2 from "../../assets/nectar-drop-2.svg";
import nectarDrop3 from "../../assets/nectar-drop-3.svg";
import logo from "../../assets/iota-devnet-logo.svg";
import seed from "../../assets/seed.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { ClipboardHelper } from "../../helpers/clipboardHelper";
import { IWalletAsset } from "../../models/IWalletAsset";
import { IWalletService } from "../../models/services/IWalletService";
import Spinner from "./Spinner";
import { WalletProps } from "./WalletProps";
import { WalletState } from "./WalletState";

/**
 * Component which will display wallet.
 */
class Wallet extends Component<WalletProps, WalletState> {
    /**
     * Wallet service.
     */
    private readonly _walletService: IWalletService;

    /**
     * Subscription id for wallet updates.
     */
    private _subscriptionId?: string;

    /**
     * Create a new instance of Wallet.
     * @param props The props.
     */
    constructor(props: WalletProps) {
        super(props);

        this._walletService = ServiceFactory.get<IWalletService>("wallet");

        this.state = {
            isBusy: true,
            justCreated: false,
            isBusyFaucet: false,
            isBusyNewAsset: false,
            isBusySendFunds: false,
            faucetIsError: false,
            errorNewAsset: "",
            sendFundsAmount: "100",
            newAssetAmount: "100"
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        const wallet = await this._walletService.get();
        this.setState(
            {
                wallet,
                isBusy: false,
                balances: this._walletService.getWalletBalances(),
                addresses: this._walletService.getWalletAddresses(),
                receiveAddress: this._walletService.getReceiveAddress()
            },
            () => {
                this._subscriptionId = this._walletService.subscribe(() => {
                    this.setState({
                        balances: this._walletService.getWalletBalances(),
                        addresses: this._walletService.getWalletAddresses(),
                        receiveAddress: this._walletService.getReceiveAddress()
                    });
                });
            });
    }

    /**
     * The component will unmount so update flag.
     */
    public componentWillUnmount(): void {
        if (this._subscriptionId) {
            this._walletService.unsubscribe(this._subscriptionId);
            this._subscriptionId = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div 
                className={`wallet col ${this.state.wallet && this.state.wallet.seed && this.state.justCreated ? "center middle fill" : ""}`}>

                {this.state.isBusy && (
                    <Spinner />
                )}
                {(!this.state.wallet || !this.state.wallet.seed) && (
                    <div>
                        <div className="landing-banner">
                            <div className="nectar-drops">
                                <img src={nectarDrop1} alt="Nectar drop" className="nectar-drop" id="drop-1"/>
                                <div id="scale-drop">
                                    <img src={nectarDrop2} alt="Nectar drop" className="nectar-drop" id="drop-2"/>
                                </div>
                                <img src={nectarDrop3} alt="Nectar drop" className="nectar-drop" id="drop-3"/>
                            </div>
                            <div className="row center fill z-1">
                                <div className="col center middle">
                                    <img src={logo} alt="IOTA 2.0 Devnet Logo" />
                                    <button
                                        className="margin-t-80 button--landing"
                                        disabled={this.state.isBusy}
                                        onClick={() => this.createWallet()}
                                    >
                                        New Wallet
                                    </button> 
                                </div>
                            </div>
                        </div>  
                    </div>  
                )}
                {this.state.wallet && this.state.wallet.seed && this.state.justCreated && (
                    <div>
                        <div className="row fill">
                            <div className="col fill center middle">
                                <div className="card card--modal">
                                    <div className="card--header">
                                        <h2>Wallet created</h2>
                                    </div>
                                    <div className="card--content">
                                        <p className="margin-b-s padding-r-m padding-l-m">
                                            Your new wallet has been created, please copy the seed for future use.
                                        </p>
                                        <React.Fragment>
                                            <div className="row middle">
                                                <img src={seed} alt="Seed" />
                                                <div className="margin-l-t">
                                                    <div className="card--label">
                                                        Seed
                                                    </div>
                                                    <div className="card--value margin-b-s">
                                                        {this.state.wallet.seed}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                        <button
                                            className="margin-t-s"
                                            onClick={() => this.setState({ justCreated: false })}
                                        >
                                            OK
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                )}
                {this.state.wallet && this.state.wallet.seed && !this.state.justCreated && (
                    <React.Fragment>
                        <div className="card margin-b-s">
                            <div className="card--header">
                                <h2>Balance</h2>
                            </div>
                            <div className="card--content">
                                {this.state.sendFundsAddress !== undefined &&
                                    this.state.sendFundsColor !== undefined && (
                                        <React.Fragment>
                                            <div className="card--label">
                                                Address
                                            </div>
                                            <div className="card--value margin-b-s">
                                                <input
                                                    className="fill"
                                                    type="text"
                                                    disabled={this.state.isBusySendFunds}
                                                    value={this.state.sendFundsAddress}
                                                    onChange={e => this.setState({
                                                        sendFundsAddress: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <div className="card--label">
                                                Amount
                                            </div>
                                            <div className="card--value margin-b-s">
                                                <input
                                                    className="fill"
                                                    type="text"
                                                    disabled={this.state.isBusySendFunds}
                                                    value={this.state.sendFundsAmount}
                                                    onChange={e => this.setState({
                                                        sendFundsAmount: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <div className="row">
                                                <button
                                                    className="margin-r-s"
                                                    disabled={this.state.sendFundsAddress.trimEnd().length === 0 ||
                                                        this.state.sendFundsColor.trimEnd().length === 0 ||
                                                        !Number.isFinite(parseInt(this.state.sendFundsAmount, 10)) ||
                                                        parseInt(this.state.sendFundsAmount, 10) <= 0 ||
                                                        this.state.isBusySendFunds}
                                                    onClick={() => this.sendFunds()}
                                                >
                                                    OK
                                                </button>
                                                <button
                                                    className="button--secondary"
                                                    disabled={this.state.isBusySendFunds}
                                                    onClick={() => this.setState({
                                                        sendFundsColor: undefined,
                                                        sendFundsAddress: undefined
                                                    })}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            {this.state.isBusySendFunds && (
                                                <Spinner className="margin-t-s" />
                                            )}
                                            {this.state.errorSendFunds && (
                                                <p className="margin-t-s danger">{this.state.errorSendFunds}</p>
                                            )}
                                        </React.Fragment>
                                    )}
                                {(!this.state.balances || this.state.balances.length === 0) &&
                                    this.state.sendFundsAddress === undefined && (
                                        <p>There are no balances in the wallet.</p>
                                    )}
                                {this.state.balances && this.state.balances.length > 0 &&
                                    this.state.sendFundsAddress === undefined && (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Token Name</th>
                                                    <th>Color</th>
                                                    <th>Confirmed</th>
                                                    <th>Pending</th>
                                                    <th>Rejected</th>
                                                    <th>&nbsp;</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.balances && this.state.balances
                                                    .sort((a, b) => a.asset.name.localeCompare(b.asset.name))
                                                    .map((balance, idx) => (
                                                        <tr key={idx}>
                                                            <td className="break">
                                                                {balance.asset && balance.asset.name}
                                                            </td>
                                                            <td className="break">
                                                                {balance.asset && balance.asset.color}
                                                            </td>
                                                            <td className="success">
                                                                {balance.confirmed.toString()}
                                                            </td>
                                                            <td className="warning">
                                                                {balance.unConfirmed.toString()}
                                                            </td>
                                                            <td className="danger">
                                                                {balance.rejected.toString()}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    disabled={balance.confirmed <= 0}
                                                                    onClick={() => this.setState({
                                                                        sendFundsAddress: "",
                                                                        sendFundsColor: balance.asset.color,
                                                                        sendFundsAmount: balance.confirmed.toString(),
                                                                        errorSendFunds: ""
                                                                    })}
                                                                >
                                                                    Send
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    )}
                            </div>
                        </div>

                        <div className="card margin-b-s">
                            <div className="card--header row space-between">
                                <h2>Addresses</h2>
                                {this.state.newAssetName === undefined && (
                                    <button className = "button--secondary"
                                        onClick={() => this.copyReceiveAddress()}>
                                        Copy Address
                                    </button>
                                )}
                            </div>
                            <div className="card--content">
                                {(!this.state.addresses || this.state.addresses.length === 0) && (
                                    <p>There are no addresses in the wallet.</p>
                                )}
                                {this.state.addresses && this.state.addresses.length > 0 && (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Index</th>
                                                <th>Address</th>
                                                <th>Is Spent</th>
                                                <th>Is Receive</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.addresses && this.state.addresses.map((address, idx) => (
                                                <tr key={idx}>
                                                    <td>{address.index.toString()}</td>
                                                    <td className="break">{address.address}</td>
                                                    <td>{address.isSpent ? "Yes" : "No"}</td>
                                                    <td>{address.address === this.state.receiveAddress
                                                        ? "Yes" : "No"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div className="card margin-b-s">
                            <div className="card--header row space-between">
                                <h2>Assets</h2>
                                {this.state.newAssetName === undefined && (
                                    <button className = "button--secondary"
                                        onClick={() => this.setState({
                                            newAssetName: "",
                                            newAssetSymbol: "",
                                            newAssetColor: "",
                                            newAssetAmount: "100",
                                            errorNewAsset: ""
                                        })}
                                    >
                                        Create Asset
                                    </button>
                                )}
                            </div>
                            <div className="card--content">
                                {this.state.newAssetName !== undefined &&
                                    this.state.newAssetSymbol !== undefined && (
                                        <React.Fragment>
                                            <div className="card--label">
                                                Name
                                            </div>
                                            <div className="card--value margin-b-s">
                                                <input
                                                    className="fill"
                                                    type="text"
                                                    disabled={this.state.isBusyNewAsset}
                                                    value={this.state.newAssetName}
                                                    onChange={e => this.setState({
                                                        newAssetName: e.target.value
                                                    })}
                                                />
                                            </div>
                                            <div className="card--label">
                                                Symbol
                                            </div>
                                            <div className="card--value margin-b-s">
                                                <input
                                                    className="fill"
                                                    type="text"
                                                    disabled={this.state.isBusyNewAsset}
                                                    value={this.state.newAssetSymbol}
                                                    onChange={e => this.setState({
                                                        newAssetSymbol: e.target.value
                                                    })}
                                                />
                                            </div>
                                            {!this.state.newAssetColor && (
                                                <React.Fragment>
                                                    <div className="card--label">
                                                        Amount
                                                    </div>
                                                    <div className="card--value margin-b-s">
                                                        <input
                                                            className="fill"
                                                            type="text"
                                                            disabled={this.state.isBusyNewAsset}
                                                            value={this.state.newAssetAmount}
                                                            onChange={e => this.setState({
                                                                newAssetAmount: e.target.value
                                                            })}
                                                        />
                                                    </div>
                                                </React.Fragment>
                                            )}
                                            <div className="row">
                                                <button
                                                    className="margin-r-s"
                                                    disabled={this.state.newAssetName.trimEnd().length === 0 ||
                                                        this.state.newAssetSymbol.trimEnd().length === 0 ||
                                                        !Number.isFinite(parseInt(this.state.newAssetAmount, 10)) ||
                                                        parseInt(this.state.newAssetAmount, 10) <= 0 ||
                                                        this.state.isBusyNewAsset}
                                                    onClick={() => this.createAsset()}
                                                >
                                                    OK
                                                </button>
                                                <button
                                                    className="button--secondary"
                                                    disabled={this.state.isBusyNewAsset}
                                                    onClick={() => this.setState({
                                                        newAssetName: undefined,
                                                        newAssetSymbol: undefined,
                                                        newAssetColor: undefined
                                                    })}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            {this.state.isBusyNewAsset && (
                                                <Spinner className="margin-t-s" />
                                            )}
                                            {this.state.errorNewAsset && (
                                                <p className="margin-t-s danger">{this.state.errorNewAsset}</p>
                                            )}
                                        </React.Fragment>
                                    )}
                                {(!this.state.wallet.assets || this.state.wallet.assets.length === 0) &&
                                    this.state.newAssetName === undefined &&
                                    !this.state.isBusyNewAsset && (
                                        <p>There are no assets in the wallet.</p>
                                    )}
                                {this.state.wallet.assets && this.state.wallet.assets.length > 0 &&
                                    this.state.newAssetName === undefined &&
                                    !this.state.isBusyNewAsset && (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Color</th>
                                                    <th>Name</th>
                                                    <th>Symbol</th>
                                                    <th>&nbsp;</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.wallet.assets &&
                                                    this.state.wallet.assets.map((asset, idx) => (
                                                        <tr key={idx} className="middle">
                                                            <td className="break">{asset.color}</td>
                                                            <td className="break">{asset.name}</td>
                                                            <td>{asset.symbol}</td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="margin-r-t button--secondary"
                                                                    onClick={() => this.setState({
                                                                        newAssetName: asset.name,
                                                                        newAssetSymbol: asset.symbol,
                                                                        newAssetColor: asset.color,
                                                                        newAssetAmount: "1",
                                                                        errorNewAsset: ""
                                                                    })}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="button--danger"
                                                                    disabled={!this.assetHasBalance(asset)}
                                                                    onClick={() => this.deleteAsset(asset.color)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    )}
                            </div>
                        </div>

                        <div className="card margin-b-s">
                            <div className="card--header card--header__space-between">
                                <h2>Faucet</h2>
                                <button
                                    disabled={this.state.isBusyFaucet}
                                    onClick={() => this.requestFunds()}
                                >
                                    Request Funds
                                </button>
                            </div>
                            <div className="card--content">

                                <div className="row middle margin-t-s">
                                    {this.state.isBusyFaucet && (
                                        <Spinner />
                                    )}
                                    {this.state.faucetStatus && (
                                        <p className={
                                            classNames(
                                                { "danger": this.state.faucetIsError }
                                            )
                                        }>
                                            {this.state.faucetStatus}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )
                }
            </div>
        );
    }

    /**
     * Create a new wallet or from existing seed using the service.
     * @param seed An existing seed.
     */
    private createWallet(seed?: string): void {
        this.setState(
            { isBusy: true },
            async () => {
                const wallet = await this._walletService.create(seed);
                this.setState(
                    {
                        wallet,
                        isBusy: false,
                        justCreated: true,
                        balances: this._walletService.getWalletBalances(),
                        addresses: this._walletService.getWalletAddresses(),
                        receiveAddress: this._walletService.getReceiveAddress()
                    });
                this.props.onUpdated();
            });
    }

    /**
     * Request funds from the faucet.
     */
    private requestFunds(): void {
        this.setState(
            {
                isBusyFaucet: true,
                faucetIsError: false,
                faucetStatus: "Requesting funds, please wait..."
            },
            async () => {
                try {
                    await this._walletService.requestFunds();
                    this.setState({
                        isBusyFaucet: false,
                        faucetIsError: false,
                        faucetStatus: "Faucet request successful, a new balance should appear shortly."
                    });
                } catch (err) {
                    this.setState({
                        isBusyFaucet: false,
                        faucetIsError: true,
                        faucetStatus: err.message
                    });
                }
            });
    }

    /**
     * Create the new asset.
     */
    private createAsset(): void {
        this.setState(
            {
                isBusyNewAsset: true,
                errorNewAsset: ""
            },
            async () => {
                if (this.state.newAssetName && this.state.newAssetSymbol) {
                    try {
                        if (this.state.newAssetColor) {
                            await this._walletService.updateAsset(
                                this.state.newAssetColor,
                                this.state.newAssetName,
                                this.state.newAssetSymbol);
                        } else {
                            await this._walletService.createAsset(
                                this.state.newAssetName,
                                this.state.newAssetSymbol,
                                BigInt(parseInt(this.state.newAssetAmount, 10))
                            );
                        }

                        this.setState({
                            isBusyNewAsset: false,
                            newAssetAmount: "100",
                            newAssetName: undefined,
                            newAssetSymbol: undefined,
                            newAssetColor: undefined
                        });
                    } catch (err) {
                        this.setState({
                            errorNewAsset: err.message,
                            isBusyNewAsset: false
                        });
                    }
                }
            }
        );
    }

    /**
     * Delete an asset.
     * @param color The color of the asset to delete.
     */
    private deleteAsset(color: string): void {
        this.setState(
            {
                isBusyNewAsset: true,
                errorNewAsset: ""
            },
            async () => {
                try {
                    await this._walletService.deleteAsset(color);

                    this.setState({
                        isBusyNewAsset: false
                    });
                } catch (err) {
                    this.setState({
                        errorNewAsset: err.message,
                        isBusyNewAsset: false
                    });
                }
            }
        );
    }

    /**
     * Send funds to address.
     */
    private sendFunds(): void {
        this.setState(
            {
                isBusySendFunds: true,
                errorSendFunds: ""
            },
            async () => {
                if (this.state.sendFundsAddress && this.state.sendFundsColor) {
                    try {
                        await this._walletService.sendFunds(
                            this.state.sendFundsAddress,
                            this.state.sendFundsColor,
                            BigInt(parseInt(this.state.sendFundsAmount, 10))
                        );

                        this.setState({
                            isBusySendFunds: false,
                            sendFundsAmount: "100",
                            sendFundsAddress: undefined,
                            sendFundsColor: undefined
                        });
                    } catch (err) {
                        this.setState({
                            errorSendFunds: err.message,
                            isBusySendFunds: false
                        });
                    }
                }
            }
        );
    }

    /**
     * Does the asset have a balance.
     * @param asset The asset to check.
     * @returns True if the asset has a balance.
     */
    private assetHasBalance(asset: IWalletAsset): boolean {
        if (this.state.balances) {
            return this.state.balances.find(b => b.asset.color === asset.color) === undefined;
        }

        return false;
    }

    /**
     * Copy the receive address to the clipboard.
     */
    private copyReceiveAddress(): void {
        ClipboardHelper.copy(this.state.receiveAddress);
    }
}

export default Wallet;
