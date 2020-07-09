import { IWalletAsset } from "./IWalletAsset";

export interface IWalletBalance {
    /**
     * The wallet asset.
     */
    asset: IWalletAsset;

    /**
     * Confirmed Balance.
     */
    confirmed: bigint;

    /**
     * Unconfirmed Balance.
     */
    unConfirmed: bigint;
}
