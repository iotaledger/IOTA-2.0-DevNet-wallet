import { IResponse } from "./IResponse";

export interface ISendTransactionResponse extends IResponse {
    /**
     * The id of the transaction created.
     */
    transaction_id?: string;
}
