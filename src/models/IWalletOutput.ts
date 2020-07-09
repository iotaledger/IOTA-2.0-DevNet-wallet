import { IWalletOutputBalance } from "./IWalletOutputBalance";
import { IWalletOutputInclusionState } from "./IWalletOutputInclusionState";

export interface IWalletOutput {
    /**
     * The id.
     */
    transactionId: string;

    /**
     * The balances.
     */
    balances: IWalletOutputBalance[];

    /**
     * Inclusion state.
     */
    inclusionState: IWalletOutputInclusionState;
}
