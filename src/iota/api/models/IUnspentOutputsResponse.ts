import { IResponse } from "./IResponse";

export interface IUnspentOutputsResponse extends IResponse {
    /**
     * The unspent output details.
     */
    unspent_outputs: {
        /**
         * The address.
         */
        address: string;

        /**
         * Outputs consist of an address and balances
         */
        output_ids: {
            /**
             * The id of the transaction.
             */
            id: string;

            /**
             * The balances holds the value and the color of token
             */
            balances: {
                /**
                 * The value of the balance.
                 */
                value: number;

                /**
                 * The color of the balance.
                 */
                color: string;
            }[];

            /**
             *  InclusionState represents the different states of an OutputID.
             */
            inclusion_state: {
                /**
                 * Is the output solid.
                 */
                solid?: boolean;
                /**
                 * Is the output confirmed.
                 */
                confirmed?: boolean;
                /**
                 * Is the output rejected.
                 */
                rejected?: boolean;
                /**
                 * Is the output liked.
                 */
                liked?: boolean;
                /**
                 * Is the output conflicting.
                 */
                conflicting?: boolean;
                /**
                 * Is the output finalized.
                 */
                finalized?: boolean;
                /**
                 * Is the output preferred.
                 */
                preferred?: boolean;
            };
        }[];
    }[];
}
