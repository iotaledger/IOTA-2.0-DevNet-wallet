import { IWalletOutputBalance } from "./IWalletOutputBalance";
import { IWalletOutputInclusionState } from "./IWalletOutputInclusionState";

export interface IWalletOutput {
    /**
     * The id.
     */
    id: string;

    /**
     * The balances.
     */
    balances: IWalletOutputBalance[];

    /**
     * Grade of finality.
     */
    gof: number;
}
