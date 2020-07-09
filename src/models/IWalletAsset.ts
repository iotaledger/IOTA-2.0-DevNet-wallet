export interface IWalletAsset {
    /**
     * The color in base58.
     */
    color: string;

    /**
     * The asset name.
     */
    name: string;

    /**
     * The asset symbol.
     */
    symbol: string;

    /**
     * The asset precision.
     */
    precision: number;
}
