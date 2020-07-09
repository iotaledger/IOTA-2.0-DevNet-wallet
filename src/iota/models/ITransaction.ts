import { IKeyPair } from "./IKeyPair";

export interface ITransaction {
    /**
     * The inputs to send.
     */
    inputs: string[];

    /**
     * The outputs to send.
     */
    outputs: {
        [address: string]: {
            /**
             * The color.
             */
            color: string;
            /**
             * The value.
             */
            value: bigint;
        }[];
    };

    /**
     * The signatures to send.
     */
    signatures: {
        [address: string]: {
            /**
             * Key pair that generated the signature.
             */
            keyPair: IKeyPair;
            /**
             * The signature.
             */
            signature: Buffer;
        };
    };
}
