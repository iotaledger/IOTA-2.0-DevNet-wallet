// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable no-bitwise */
import { blake2b } from "blakejs";

/**
 * Helper methods for POW.
 */
export class PoW {

    private static numberToUInt64LE(n: number): Buffer {
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(BigInt(n),0);
        return buffer;
    } 

    public static calculateProofOfWork(target: number, message: Buffer): number{ 
        for(let nonce=0;;nonce++){ 
            const nonceLE = this.numberToUInt64LE(nonce);
            const digest = blake2b(Buffer.concat([message, nonceLE]));
            const b = Buffer.alloc(4);
            for (let i = 0; i <4; i++) {
                b[i] = digest[i];
            }
            const leadingZeros = Math.clz32(b.readUInt32BE());
            if (leadingZeros >= target) {
                return nonce; 
            }
        } 
    }

}
