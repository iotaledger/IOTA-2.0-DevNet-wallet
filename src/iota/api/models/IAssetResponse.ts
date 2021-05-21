import { IResponse } from "./IResponse";

export interface IAssetResponse extends IResponse {
    ID: string;
    name: string;
    symbol: string;
    supply: number;
    transactionID: string;
}
