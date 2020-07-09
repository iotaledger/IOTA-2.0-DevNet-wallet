/**
 * Class to help with base48 encoding/decoding.
 */
export class Base58 {
    /**
     * The base58 alphabet.
     */
    private static readonly ALPHABET: string = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

    /**
     * The base58 alphabet map.
     */
    private static readonly ALPHABET_MAP: { [id: string]: number } = {};

    /**
     * Encode a buffer to base58.
     * @param buffer The buffer to encode as base 58.
     * @returns The encoded data as a string.
     */
    public static encode(buffer: Buffer): string {
        if (!buffer || buffer.length === 0) {
            return "";
        }
        let i = 0;
        let j;
        let carry;
        const digits = [0];
        while (i < buffer.length) {
            j = 0;
            while (j < digits.length) {
                digits[j] <<= 8;
                j++;
            }
            digits[0] += buffer[i];
            carry = 0;
            j = 0;
            while (j < digits.length) {
                digits[j] += carry;
                carry = (digits[j] / 58) | 0;
                digits[j] %= 58;
                ++j;
            }
            while (carry) {
                digits.push(carry % 58);
                carry = (carry / 58) | 0;
            }
            i++;
        }
        i = 0;
        while (buffer[i] === 0 && i < buffer.length - 1) {
            digits.push(0);
            i++;
        }
        return digits.reverse().map(digit => {
            return Base58.ALPHABET[digit];
        }).join("");
    }

    /**
     * Decode a base58 string to a buffer.
     * @param encoded The buffer to encode as base 58.
     * @returns The encoded data as a string.
     */
    public static decode(encoded: string): Buffer {
        if (!encoded || encoded.length === 0) {
            return Buffer.from("");
        }
        Base58.buildMap();
        let i = 0;
        let j;
        let c;
        let carry;
        const bytes = [0];
        i = 0;
        while (i < encoded.length) {
            c = encoded[i];
            if (!(c in Base58.ALPHABET_MAP)) {
                throw new Error(`Character '${c}' is not in the Base58 alphabet.`);
            }
            j = 0;
            while (j < bytes.length) {
                bytes[j] *= 58;
                j++;
            }
            bytes[0] += Base58.ALPHABET_MAP[c];
            carry = 0;
            j = 0;
            while (j < bytes.length) {
                bytes[j] += carry;
                carry = bytes[j] >> 8;
                bytes[j] &= 0xff;
                ++j;
            }
            while (carry) {
                bytes.push(carry & 0xff);
                carry >>= 8;
            }
            i++;
        }
        i = 0;
        while (encoded[i] === "1" && i < encoded.length - 1) {
            bytes.push(0);
            i++;
        }
        return Buffer.from(bytes.reverse());
    }

    /**
     * Is the encoded string valid base58.
     * @param encoded The encoded string as base 58.
     * @returns True is the characters are valid.
     */
    public static isValid(encoded?: string): boolean {
        if (!encoded) {
            return false;
        }
        Base58.buildMap();
        for (const ch of encoded) {
            if (!(ch in Base58.ALPHABET_MAP)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Concatenate 2 base58 strings.
     * @param id1 The first id.
     * @param id2 The second id.
     * @returns The concatenated ids.
     */
    public static concat(id1: string, id2: string): string {
        const b1 = Base58.decode(id1);
        const b2 = Base58.decode(id2);
        const combined = Buffer.alloc(b1.length + b2.length);
        combined.set(b1, 0);
        combined.set(b2, b1.length);
        return Base58.encode(combined);
    }

    /**
     * Build the reverse lookup map.
     */
    private static buildMap(): void {
        if (Object.keys(Base58.ALPHABET_MAP).length === 0) {
            let i = 0;
            while (i < Base58.ALPHABET.length) {
                Base58.ALPHABET_MAP[Base58.ALPHABET.charAt(i)] = i;
                i++;
            }
        }
    }
}
