import { IWalletOutput } from "./IWalletOutput";

export interface IWalletAddressOutput {
    /**
     * The address.
     */
    address: string;

    /**
     * The outputs.
     */
    outputs: IWalletOutput[];
}
