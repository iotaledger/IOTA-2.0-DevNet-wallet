import { IResponse } from "./IResponse";

export interface IAllowedManaPledgeResponse extends IResponse {
    accessMana: {
        isFilterEnabled: boolean;
        allowed?: Array<string>;
    };

    consensusMana: {
        isFilterEnabled: boolean;
        allowed?: Array<string>;
    };
}
