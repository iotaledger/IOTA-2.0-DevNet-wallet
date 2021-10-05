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
             *  GradeOfFinality represents the confirmation level. 0 is not confirmed.
             *  3 is the maximum confirmation level.
             */
            gradeOfFinality: number;
        }[];
    }[];
}
