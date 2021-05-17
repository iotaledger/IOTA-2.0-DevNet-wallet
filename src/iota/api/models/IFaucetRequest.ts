export interface IFaucetRequest {
    aManaPledge: string;
    cManaPledge: string;
    /**
     * The address to send the funds to.
     */
    address: string;
    nonce: number;
}
