import { Base58 } from "./crypto/base58";

/**
 * Class to help with colors.
 */
export class Colors {
    /**
     * Color size.
     */
    public static SIZE: number = 32;

    /**
     * Color for IOTA token, all zeros.
     */
    public static IOTA_BUFFER: Buffer = Buffer.from(new Uint8Array(Colors.SIZE).fill(0));

    /**
     * Color for IOTA token, all zeros.
     */
    public static IOTA_BASE58: string = Base58.encode(Colors.IOTA_BUFFER);

    /**
     * Color for IOTA token, all zeros.
     */
    public static IOTA_NAME: string = "IOTA";

    /**
     * Color for new Colors.
     */
    public static MINT: string = Base58.encode(Buffer.from(new Uint8Array(Colors.SIZE).fill(255)));
}
