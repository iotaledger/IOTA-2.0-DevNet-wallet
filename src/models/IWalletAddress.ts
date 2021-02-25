export interface IWalletAddress {
    /**
     * The index.
     */
    index: bigint;
    
    /**
     * The address.
     */
    address: string;

    /**
     * Is the address spent.
     */
    isSpent: boolean;
}
