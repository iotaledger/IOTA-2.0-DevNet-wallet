import { IResponse } from "./IResponse";

export interface IUnspentOutputsResponse extends IResponse {
    /**
     * The unspent output details.
     */
     unspentOutputs: {
        /**
         * The address.
         */
        address: {
            /**
             * The type of the address.
             */
            type: string;

            /**
             * The base58 representation of the address.
             */
            base58: string;
        };

        /**
         * Outputs consist of an address and balances
         */
        outputs: {
            output: {
                /**
                 * The id of the output.
                 */
                outputID: {
                    base58: string;
                    transactionID: string;
                    outputIndex: number;
                };

                type: string;

                output: {
                        /**
                     * The balances holds the value and the color of token
                     */
                    balances: {
                        [color: string]: bigint;
                    };

                    address: string;
                };
            };

            /**
             *  InclusionState represents the different states of an OutputID.
             */
            inclusion_state: {
                /**
                 * Is the output confirmed.
                 */
                confirmed?: boolean;
                /**
                 * Is the output rejected.
                 */
                rejected?: boolean;
                /**
                 * Is the output conflicting.
                 */
                conflicting?: boolean;
            };
        }[];
    }[];
}
