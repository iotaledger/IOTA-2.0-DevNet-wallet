import { IWalletAsset } from "./IWalletAsset";

export interface IWallet {
    /**
     * The wallet seed.
     */
    seed: string;

    /**
     * The last address index used.
     */
    lastAddressIndex: number;

    /**
     * List of the spent addresses.
     */
    spentAddresses: string[];

    /**
     * List of assets.
     */
    assets: IWalletAsset[];
}
