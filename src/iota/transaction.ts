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
     * Get the index of the MINT output.
     * @param outputs The ouputs of the transaction.
     * @returns The index of the MINT output.
     */
    public static mintIndex(outputs: { [address: string]: {color: string; value: bigint }[] }): number {
        let mintOutput = "";
        let mintAddress = "";
        let mintOutputIndex = 0;

        const bufferOutputs: Buffer[] = [];
        for (const address in outputs) {
            const outputType = Buffer.alloc(1);
            outputType.writeUInt8(1);

            const balancesCount = Buffer.alloc(4);
            balancesCount.writeUInt32LE(outputs[address].length);

            const bufferColors: Buffer[] = [];
            for (const balance of outputs[address]) {
                const color = balance.color === Colors.IOTA_NAME ? Colors.IOTA_BUFFER : Base58.decode(balance.color);
                if (balance.color === Colors.MINT) {
                    mintAddress = address;
                }
                
                const colorValueBuffer = Buffer.alloc(8);
                colorValueBuffer.writeBigUInt64LE(balance.value);
                bufferColors.push(Buffer.concat([color, colorValueBuffer]));
            }
            bufferColors.sort((a, b) => a.compare(b));

            const decodedAddress = Base58.decode(address);
            const output = Buffer.concat([outputType, balancesCount, Buffer.concat(bufferColors), decodedAddress]);
            bufferOutputs.push(output);

            if (mintAddress === address) {
                mintOutput = output.toString("hex");
            }
        }

        bufferOutputs.sort((a, b) => a.compare(b));

        let i = 0;
        for (const index in bufferOutputs) {
            if (bufferOutputs[index].toString("hex") === mintOutput) {
                mintOutputIndex = i;
            }
            i += 1;
        }
        
        return mintOutputIndex;
    }

    /**
     * Get the essence for a transaction.
     * @param tx The tx to get the essence for.
     * @returns The essence of the transaction.
     */
    public static essence(tx: ITransaction): Buffer {
        const buffers: Buffer[] = [];

        // version
        const version = Buffer.alloc(1);
        version.writeUInt8(tx.version);
        buffers.push(version);
        
        // timestamp
        const timestamp = Buffer.alloc(8);
        timestamp.writeBigInt64LE(tx.timestamp);
        buffers.push(timestamp);

        // aManaPledge
        buffers.push(Base58.decode(tx.aManaPledge));

        // cManaPledge
        buffers.push(Base58.decode(tx.cManaPledge));

        // Input Size
        const inputsCount = Buffer.alloc(2);
        inputsCount.writeUInt16LE(tx.inputs.length);
        buffers.push(inputsCount);

        // Inputs
        for (const input of tx.inputs) {
            const inputType = Buffer.alloc(1);
            inputType.writeUInt8(0);
            buffers.push(inputType);

            const decodedInput = Base58.decode(input);
            buffers.push(decodedInput);
        }

        // Output count
        const outputsCount = Buffer.alloc(2);
        outputsCount.writeUInt16LE(Object.keys(tx.outputs).length);
        buffers.push(outputsCount);

        // Outputs
        const bufferOutputs: Buffer[] = [];
        for (const address in tx.outputs) {
            const outputType = Buffer.alloc(1);
            outputType.writeUInt8(1);

            const balancesCount = Buffer.alloc(4);
            balancesCount.writeUInt32LE(tx.outputs[address].length);

            const bufferColors: Buffer[] = [];
            for (const balance of tx.outputs[address]) {
                const color = balance.color === Colors.IOTA_NAME ? Colors.IOTA_BUFFER : Base58.decode(balance.color);
                const colorValueBuffer = Buffer.alloc(8);
                colorValueBuffer.writeBigUInt64LE(balance.value);
                bufferColors.push(Buffer.concat([color, colorValueBuffer]));
            }
            bufferColors.sort((a, b) => a.compare(b));

            const decodedAddress = Base58.decode(address);
            const output = Buffer.concat([outputType, balancesCount, Buffer.concat(bufferColors), decodedAddress]);
            bufferOutputs.push(output);
        }

        bufferOutputs.sort((a, b) => a.compare(b));
        buffers.push(Buffer.concat(bufferOutputs));

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
        buffers.unshift(payloadSizeBuffer);

        return Buffer.concat(buffers);
    }
}
