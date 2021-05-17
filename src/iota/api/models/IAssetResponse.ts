import { IResponse } from "./IResponse";

export interface IAssetResponse extends IResponse {
    assets: {
        ID: string;
        name: string;
        symbol: string;
        supply: BigInt;
        transactionID: string;
    }[];
}
