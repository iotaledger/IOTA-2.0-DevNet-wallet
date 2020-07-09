export interface ISendFundsOptions {
    /**
     * Destination addresses.
     */
    destinations: {
        [address: string]: { [color: string]: bigint };
    };

    /**
     * Remainder address.
     */
    remainderAddress?: string;
}
