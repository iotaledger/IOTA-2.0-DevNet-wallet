import nacl from "tweetnacl";
import { IKeyPair} from "../models/IKeyPair";

/**
 * Class to help with ED25519 Signature scheme.
 */
export class ED25519 {
    /**
     * Version for signature scheme.
     */
    public static VERSION: number = 1;

    /**
     * Public Key size.
     */
    public static PUBLIC_KEY_SIZE: number = 32;

    /**
     * Signature size for signing scheme.
     */
    public static SIGNATURE_SIZE: number = 64;

    /**
     * Generate a key pair from the seed.
     * @param seed The seed to generate the key pair from.
     * @returns The key pair.
     */
    public static keyPairFromSeed(seed: Buffer): IKeyPair {
        const signKeyPair = nacl.sign.keyPair.fromSeed(seed);

        return {
            publicKey: Buffer.from(signKeyPair.publicKey),
            secretKey: Buffer.from(signKeyPair.secretKey)
        };
    }

    /**
     * Privately sign the data.
     * @param keyPair The key pair to sign with.
     * @param buffer The data to sign.
     * @returns The signature.
     */
    public static privateSign(keyPair: IKeyPair, buffer: Buffer): Buffer {
        return Buffer.from(nacl.sign.detached(buffer, keyPair.secretKey));
    }
}
