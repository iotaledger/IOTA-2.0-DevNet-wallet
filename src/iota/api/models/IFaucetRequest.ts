export interface IFaucetRequest {
    accessManaPledgeID: string;
    consensusManaPledgeID: string;
    /**
     * The address to send the funds to.
     */
    address: string;
    nonce: number;
}
