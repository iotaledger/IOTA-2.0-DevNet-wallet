import { Colors } from "./colors";
import { Base58 } from "./crypto/base58";
import { ED25519 } from "./crypto/ed25519";
import { IKeyPair } from "./models/IKeyPair";
import { ITransaction } from "./models/ITransaction";

/**
 * Class to help with transactions.
 */
export class Transaction {
    /**
     * Sign a transaction.
     * @param keyPair The key pair to sign with.
     * @param buffer The data to sign.
     * @returns The signature.
     */
    public static sign(keyPair: IKeyPair, buffer: Buffer): Buffer {
        return ED25519.privateSign(keyPair, buffer);
    }

    /**
     * Get the essence for a transaction.
     * @param tx The tx to get the essence for.
     * @returns The essence of the transaction.
     */
    public static essence(tx: ITransaction): Buffer {
        const buffers: Buffer[] = [];

        // Input Size
        const inputsSize = Buffer.alloc(4);
        inputsSize.writeUInt32LE(tx.inputs.length);
        buffers.push(inputsSize);

        // Inputs
        for (const input of tx.inputs) {
            buffers.push(Base58.decode(input));
        }

        // Output Size
        const outputsSize = Buffer.alloc(4);
        outputsSize.writeUInt32LE(Object.keys(tx.outputs).length);
        buffers.push(outputsSize);

        // Outputs
        for (const output in tx.outputs) {
            buffers.push(Base58.decode(output));

            const balancesSize = Buffer.alloc(4);
            balancesSize.writeUInt32LE(tx.outputs[output].length);
            buffers.push(balancesSize);

            for (const balance of tx.outputs[output]) {
                const colorValueBuffer = Buffer.alloc(8);
                colorValueBuffer.writeBigUInt64LE(balance.value);
                buffers.push(colorValueBuffer);
                buffers.push(balance.color === Colors.IOTA_NAME ? Colors.IOTA_BUFFER : Base58.decode(balance.color));
            }
        }

        // dataPayload size
        const dataPayloadSize = Buffer.alloc(4);
        dataPayloadSize.writeUInt32LE(0);
        buffers.push(dataPayloadSize);

        return Buffer.concat(buffers);
    }

    /**
     * Get the bytes for a transaction.
     * @param tx The tx to get the bytes for.
     * @param essence Existing essence.
     * @returns The bytes of the transaction.
     */
    public static bytes(tx: ITransaction, essence?: Buffer): Buffer {
        const buffers: Buffer[] = [];

        buffers.push(essence ? essence : Transaction.essence(tx));

        for (const address in tx.signatures) {
            const sigBuffer = Buffer.alloc(1);
            sigBuffer.writeUInt8(ED25519.VERSION);
            buffers.push(sigBuffer);
            buffers.push(tx.signatures[address].keyPair.publicKey);
            buffers.push(tx.signatures[address].signature);
        }

        // trailing 0 to indicate the end of signatures
        buffers.push(Buffer.alloc(1).fill(0));

        return Buffer.concat(buffers);
    }
}
