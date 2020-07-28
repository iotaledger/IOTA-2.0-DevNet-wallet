import { IWallet } from "../IWallet";
import { IWalletAddress } from "../IWalletAddress";
import { IWalletBalance } from "../IWalletBalance";

export interface IWalletService {
    /**
     * Subscribe to the wallet updates.
     * @param callback The callback to trigger when there are updates.
     * @returns The subscription id.
     */
    subscribe(callback: () => void): string;

    /**
     * Unsubscribe from the wallet updates.
     * @param id The subscription ids.
     */
    unsubscribe(id: string): void;

    /**
     * Create a new wallet current wallet.
     * @param seed Optional seed to import.
     * @returns The new wallet.
     */
    create(seed?: string): Promise<IWallet>;

    /**
     * Get the current wallet.
     * @returns The wallet if there is one.
     */
    get(): Promise<IWallet | undefined>;

    /**
     * Delete the current wallet.
     */
    delete(): Promise<void>;

    /**
     * Request funds.
     * @returns The transactions id if successful.
     */
    requestFunds(): Promise<string | undefined>;

    /**
     * Get the current wallet balances.
     * @returns The balances.
     */
    getWalletBalances(): IWalletBalance[] | undefined;

    /**
     * Get the current wallet addresses.
     * @returns The addresses.
     */
    getWalletAddresses(): IWalletAddress[] | undefined;

    /**
     * Get the receive address for transfers.
     * @returns The receive address.
     */
    getReceiveAddress(): string | undefined;

    /**
     * Create a new asset.
     * @param name The name for the new asset.
     * @param symbol The symbol for the new asset.
     * @param amount The amount of tokens to create.
     */
    createAsset(name: string, symbol: string, amount: bigint): Promise<void>;

    /**
     * Update an asset.
     * @param name The color of the asset to update.
     * @param name The name for the updated asset.
     * @param symbol The symbol for the updated asset.
     */
    updateAsset(color: string, name: string, symbol: string): Promise<void>;

    /**
     * Delete an asset.
     * @param name The color of the asset to delete.
     */
    deleteAsset(color: string): Promise<void>;

    /**
     * Send funds to an address.
     * @param address The address to send the funds to.
     * @param color The color of the tokens to send.
     * @param amount The amount of tokens to send.
     */
    sendFunds(address: string, color: string, amount: bigint): Promise<void>;
}
