import { IResponse } from "./IResponse";

export interface IFaucetResponse extends IResponse {
    /**
     * The id of the transaction created.
     */
    id?: string;
}
