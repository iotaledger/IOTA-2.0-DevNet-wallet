import { ISettings } from "../../models/ISettings";
import { IWallet } from "../../models/IWallet";
import { IWalletAddress } from "../../models/IWalletAddress";
import { IWalletBalance } from "../../models/IWalletBalance";

export interface WalletState {
    /**
     * Is the component busy.
     */
    isBusy: boolean;
    
    /**
     * Has the wallet been loaded.
     */
    walletServiceLoaded: boolean;

    /**
     * The current settings.
     */
    settings?: ISettings;

    /**
     * The current wallet.
     */
    wallet?: IWallet;

    /**
     * The wallet was just created.
     */
    justCreated: boolean;

    /**
     * Error from the faucet.
     */
    faucetStatus?: string;

    /**
     * Error from the faucet.
     */
    faucetIsError: boolean;

    /**
     * Addresses for the wallet.
     */
    addresses?: IWalletAddress[];

    /**
     * The receive address.
     */
    receiveAddress?: string;

    /**
     * Balances.
     */
    balances?: IWalletBalance[];

    /**
     * Is the faucet component busy.
     */
    isBusyFaucet: boolean;

    /**
     * New wallet asset name.
     */
    newAssetName?: string;

    /**
     * New wallet asset symbol.
     */
    newAssetSymbol?: string;

    /**
     * New wallet asset color.
     */
    newAssetColor?: string;

    /**
     * The amount of tokens to create.
     */
    newAssetAmount: string;

    /**
     * Is the new asset component busy.
     */
    isBusyNewAsset: boolean;

    /**
     * Errors when creating new asset.
     */
    errorNewAsset: string;

    /**
     * Address to send funds to.
     */
    sendFundsAddress?: string;

    /**
     * Amount of funds to send.
     */
    sendFundsAmount: string;

    /**
     * Color of token to send.
     */
    sendFundsColor?: string;

    /**
     * Send funds error.
     */
    errorSendFunds?: string;

    /**
     * Busy sending funds.
     */
    isBusySendFunds: boolean;
}
