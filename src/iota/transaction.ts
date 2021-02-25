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
        const bufferColors: Buffer[] = [];

        // version
        const version = Buffer.alloc(1);
        version.writeUInt8(tx.version);
        buffers.push(version);
        
        // timestamp
        const timestamp = Buffer.alloc(8);
        timestamp.writeBigInt64LE(tx.timestamp);
        console.log("timestamp", tx.timestamp);
        buffers.push(timestamp);

        // aManaPledge
        buffers.push(Base58.decode(tx.aManaPledge));

        // cManaPledge
        buffers.push(Base58.decode(tx.cManaPledge));

        // Input Size
        const inputsCount = Buffer.alloc(2);
        inputsCount.writeUInt16LE(tx.inputs.length);
        console.log("inputs count", tx.inputs.length);
        buffers.push(inputsCount);

        // Inputs
        for (const input of tx.inputs) {
            const inputType = Buffer.alloc(1);
            inputType.writeUInt8(0);
            buffers.push(inputType);

            const decodedInput = Base58.decode(input);
            buffers.push(decodedInput);
            console.log("input", input);
        }

        // Output count
        const outputsCount = Buffer.alloc(2);
        outputsCount.writeUInt16LE(Object.keys(tx.outputs).length);
        console.log("outputs count", Object.keys(tx.outputs).length);
        buffers.push(outputsCount);

        // Outputs
        for (const address in tx.outputs) {
            const outputType = Buffer.alloc(1);
            outputType.writeUInt8(1);
            buffers.push(outputType);

            const balancesCount = Buffer.alloc(4);
            balancesCount.writeUInt32LE(tx.outputs[address].length);
            console.log("DEBUG: balancesCount", tx.outputs[address].length);
            buffers.push(balancesCount);

            for (const balance of tx.outputs[address]) {
                const color = balance.color === Colors.IOTA_NAME ? Colors.IOTA_BUFFER : Base58.decode(balance.color);
                console.log("COLOR:", Base58.encode(color));
                
                const colorValueBuffer = Buffer.alloc(8);
                colorValueBuffer.writeBigUInt64LE(balance.value);
                bufferColors.push(Buffer.concat([color, colorValueBuffer]));
                console.log("Value:", balance.value);
                
                // buffers.push(color);
                // buffers.push(colorValueBuffer);
            }
            bufferColors.sort((a, b) => a.compare(b));
            buffers.push(Buffer.concat(bufferColors));

            const decodedAddress = Base58.decode(address);
            buffers.push(decodedAddress);
            console.log("address", Base58.encode(decodedAddress));
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

        const payloadType = Buffer.alloc(4);
        payloadType.writeUInt32LE(1337);
        console.log("payloadType", 1337);
        buffers.push(payloadType);

        const essenceBytes = Transaction.essence(tx);
        buffers.push(essenceBytes);

        const unlockBlocksCount = Buffer.alloc(2);
        unlockBlocksCount.writeUInt16LE(tx.unlockBlocks.length);
        buffers.push(unlockBlocksCount);

        for (const index in tx.unlockBlocks) {
            const ubType = tx.unlockBlocks[index].type;

            const unlockBlockType = Buffer.alloc(1);
            unlockBlockType.writeUInt8(ubType);
            buffers.push(unlockBlockType);

            if (ubType === 0){
                const ED25519Type = Buffer.alloc(1);
                ED25519Type.writeUInt8(0);
                buffers.push(ED25519Type);
                buffers.push(tx.unlockBlocks[index].publicKey);
                buffers.push(tx.unlockBlocks[index].signature);
                continue;
            }

            const referencedIndex = Buffer.alloc(2);
            referencedIndex.writeUInt16LE(tx.unlockBlocks[index].referenceIndex);
            buffers.push(referencedIndex);
        }

        const payloadSize = Buffer.concat(buffers).length; 
        const payloadSizeBuffer = Buffer.alloc(4);
        payloadSizeBuffer.writeUInt32LE(payloadSize);
        console.log("payloadSize", payloadSize);
        buffers.unshift(payloadSizeBuffer);

        return Buffer.concat(buffers);
    }
}
