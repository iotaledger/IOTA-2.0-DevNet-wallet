import { blake2b } from "blakejs";
import { randomBytes } from "crypto";
import { Base58 } from "./crypto/base58";
import { ED25519 } from "./crypto/ed25519";
import { IKeyPair} from "./models/IKeyPair";

/**
 * Class to help with seeds.
 */
export class Seed {
    /**
     * SeedSize is the size, in bytes, of private key seeds. These are the private key representations used by RFC 8032.
     */
    public static SEED_SIZE: number = 32;

    /**
     * Generate a new seed.
     * @returns The random seed.
     */
    public static generate(): Buffer {
        return randomBytes(Seed.SEED_SIZE);
    }

    /**
     * Generate the nth subseed.
     * @param seed The seed to generate from.
     * @param index The index of the subseed to generate.
     * @returns The subseed.
     */
    public static subseed(seed: Buffer, index: bigint): Buffer {
        const indexBytes = Buffer.alloc(8);
        indexBytes.writeBigUInt64LE(index);
        const hashOfIndexBytes = blake2b(indexBytes, undefined, 32 /* Blake256 */);
        const subseed = Buffer.alloc(this.SEED_SIZE);
        Seed.xorBytes(seed, Buffer.from(hashOfIndexBytes), subseed);
        return subseed;
    }

    /**
     * Is the string a valid seed.
     * @param seed The seed to check.
     * @returns True is the seed is valid.
     */
    public static isValid(seed?: string): boolean {
        if (!seed) {
            return false;
        }
        if (!Base58.isValid(seed)) {
            return false;
        }
        return Base58.decode(seed).length === Seed.SEED_SIZE;
    }

    /**
     * Generate a key pair for the seed index.
     * @param seed The seed.
     * @param index The index of the address to generate.
     * @returns The generated address key pair.
     */
    public static generateKeyPair(seed: Buffer, index: bigint): IKeyPair {
        const subSeed = Seed.subseed(seed, index);
        return ED25519.keyPairFromSeed(subSeed);
    }

    /**
     * Generate an address for the seed.
     * @param seed The seed.
     * @param index The index of the address to generate.
     * @returns The generated address.
     */
    public static generateAddress(seed: Buffer, index: bigint): string {
        const { publicKey } = Seed.generateKeyPair(seed, index);

        const digest = blake2b(publicKey, undefined, 32);

        const buffer = Buffer.alloc(Seed.SEED_SIZE + 1);
        buffer[0] = ED25519.VERSION;
        Buffer.from(digest).copy(buffer, 1);

        return Base58.encode(buffer);
    }

    /**
     * XOR the two input buffers into the output.
     * @param srcA The first source buffer.
     * @param srcB The second source buffer,
     * @param dest The destination buffer.
     */
    private static xorBytes(srcA: Buffer, srcB: Buffer, dest: Buffer): void {
        for (let i = 0; i < srcA.byteLength; i++) {
            dest.writeUInt8(srcA.readUInt8(i) ^ srcB.readUInt8(i), i);
        }
    }
}
