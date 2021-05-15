import { ServiceFactory } from "../factories/serviceFactory";
import { ApiClient } from "../iota/api/apiClient";
import { Colors } from "../iota/colors";
import { Base58 } from "../iota/crypto/base58";
import { ITransaction } from "../iota/models/ITransaction";
import { Seed } from "../iota/seed";
import { Transaction } from "../iota/transaction";
import { ISendFundsOptions } from "../models/ISendFundsOptions";
import { IWallet } from "../models/IWallet";
import { IWalletAddress } from "../models/IWalletAddress";
import { IWalletAddressOutput } from "../models/IWalletAddressOutput";
import { IWalletAsset } from "../models/IWalletAsset";
import { IWalletBalance } from "../models/IWalletBalance";
import { IWalletOutput } from "../models/IWalletOutput";
import { IJsonStorageService } from "../models/services/IJsonStorageService";
import { IWalletService } from "../models/services/IWalletService";
import { SettingsService } from "./settingsService";
import { IUnlockBlock } from "../models/IUnlockBlock";
import { blake2b } from "blakejs";
import { IWalletOutputBalance } from "../models/IWalletOutputBalance";
import { PoW } from "../iota/crypto/pow";
import { Worker } from "worker_threads";

/**
 * Service to manage a wallet.
 */
export class WalletService implements IWalletService {
    /**
     * The json storage service to use.
     */
    private readonly _jsonStorageService: IJsonStorageService;

    /**
     * The current wallet.
     */
    private _wallet?: IWallet;

    /**
     * The unspent outputs for the wallet.
     */
    private _unspentOutputs?: IWalletAddressOutput[];

    /**
     * Current wallet balances.
     */
    private _balances?: IWalletBalance[];

    /**
     * Current wallet addresses.
     */
    private _addresses?: IWalletAddress[];

    /**
     * Local spent outputs.
     */
    private _spentOutputTransactions?: string[];

    /**
     * Timer to check update wallet.
     */
    private _timerId?: NodeJS.Timer;

    /**
     * Subsribers to wallet updates.
     */
    private readonly _subscribers: { [id: string]: () => void };

    /**
     * Do we allow reusable addresses.
     */
    private readonly _reusableAddresses: boolean;

    /**
     * Create a new instance of WalletService.
     */
    constructor() {
        this._jsonStorageService = ServiceFactory.get<IJsonStorageService>("json-storage");
        this._subscribers = {};
        this._reusableAddresses = false;
    }

    /**
     * Subscribe to the wallet updates.
     * @param callback The callback to trigger when there are updates.
     * @returns The subscription id.
     */
    public subscribe(callback: () => void): string {
        const id = Base58.encode(Seed.generate());

        this._subscribers[id] = callback;

        return id;
    }

    /**
     * Unsubscribe from the wallet updates.
     * @param id The subscription ids.
     */
    public unsubscribe(id: string): void {
        delete this._subscribers[id];
    }

    /**
     * Create a new wallet current wallet.
     * @param seed Optional seed to import.
     * @returns The new wallet.
     */
    public async create(): Promise<IWallet> {
        this._wallet = {
            seed: Base58.encode(Seed.generate()),
            lastAddressIndex: 0,
            spentAddresses: [],
            assets: []
        };

        await this.initialiseWallet();
        await this.save();
        await this.startUpdates();

        return this._wallet;
    }

    /**
     * Get the current wallet.
     * @returns The wallet if there is one.
     */
    public async get(): Promise<IWallet | undefined> {
        if (!this._wallet) {
            this._wallet = await this.load();
        }

        await this.initialiseWallet();
        await this.startUpdates();

        return this._wallet;
    }

    /**
     * Delete the current wallet.
     */
    public async delete(): Promise<void> {
        this.stopUpdates();
        this._wallet = undefined;
        this._balances = undefined;
        this._unspentOutputs = undefined;
        this._spentOutputTransactions = undefined;
        await this._jsonStorageService.remove("wallet.json");
    }

    /**
     * Get the current wallet balances.
     * @returns The balances.
     */
    public getWalletBalances(): IWalletBalance[] | undefined {
        return this._balances;
    }

    /**
     * Get the current wallet addresses.
     * @returns The addresses.
     */
    public getWalletAddresses(): IWalletAddress[] | undefined {
        return this._addresses;
    }

    /**
     * Get the receive address for transfers.
     * @returns The receive address.
     */
    public getReceiveAddress(): string | undefined {
        if (this._addresses) {
            const unspent = this._addresses.filter(f => !f.isSpent);

            return unspent.length > 0 ? unspent[0].address : undefined;
        }
    }

    /**
     * Create a new asset.
     * @param name The name for the new asset.
     * @param symbol The symbol for the new asset.
     * @param amount The amount of tokens to create.
     * @returns The updated wallet.
     */
    public async createAsset(name: string, symbol: string, amount: bigint): Promise<void> {
        if (this._wallet && this._addresses) {
            const receiveAddress = this.getReceiveAddress();

            if (receiveAddress) {
                const txId = await this.sendFundsWithOptions(
                    this.createSendFundOptions(receiveAddress, amount, Colors.MINT)
                );

                if (txId) {
                    this._wallet.assets.push({
                        color: txId,
                        name,
                        symbol,
                        precision: 0
                    });
                    await this.save();
                    await this.doUpdates();
                }
            }
        }
    }

    /**
     * Update an asset.
     * @param name The color of the asset to update.
     * @param name The name for the updated asset.
     * @param symbol The symbol for the updated asset.
     */
    public async updateAsset(color: string, name: string, symbol: string): Promise<void> {
        if (this._wallet) {
            const asset = this._wallet.assets.find(a => a.color === color);
            if (asset) {
                asset.name = name;
                asset.symbol = symbol;
            } else {
                this._wallet.assets.push({
                    color,
                    name,
                    symbol,
                    precision: 0
                });
            }

            await this.save();
        }
    }

    /**
     * Delete an asset.
     * @param name The color of the asset to delete.
     */
    public async deleteAsset(color: string): Promise<void> {
        if (this._wallet) {
            let hasBalance = false;
            if (this._balances) {
                hasBalance = this._balances.findIndex(b => b.asset.color === color) >= 0;
            }

            if (!hasBalance) {
                const assetIdx = this._wallet.assets.findIndex(a => a.color === color);
                if (assetIdx >= 0) {
                    this._wallet.assets.splice(assetIdx, 1);
                }
            }

            await this.save();
        }
    }

    /**
     * Send funds to an address.
     * @param address The address to send the funds to.
     * @param color The color of the tokens to send.
     * @param amount The amount of tokens to send.
     */
    public async sendFunds(address: string, color: string, amount: bigint): Promise<void> {
        const txId = await this.sendFundsWithOptions(
            this.createSendFundOptions(address, amount, color)
        );

        if (txId) {
            await this.save();
            await this.doUpdates();
        }
    }

    /**
     * Send funds from source to destination.
     * @param sendFundsOptions The options for sending.
     * @returns The new tx id.
     */
    public async sendFundsWithOptions(sendFundsOptions: ISendFundsOptions): Promise<string | undefined> {
        if (this._wallet && this._addresses) {
            await this.doUpdates();
            const apiClient = await this.buildApiClient();
            
            const settingsService = ServiceFactory.get<SettingsService>("settings");
            const settings = await settingsService.get();

            let aManaPledge = settings.accessManaPledgeID;
            let cManaPledge = settings.consensusManaPledgeID;

            const allowedManaPledgeResp = await apiClient.allowedManaPledge();
            if (aManaPledge === "" && allowedManaPledgeResp.accessMana.allowed != null) {
                aManaPledge = allowedManaPledgeResp.accessMana.allowed[0];
            }
            if (cManaPledge === "" && allowedManaPledgeResp.consensusMana.allowed != null) {
                cManaPledge = allowedManaPledgeResp.consensusMana.allowed[0];
            }
            
            const aManaPledgeBytes = Base58.decode(aManaPledge);
            if (aManaPledgeBytes.length !== 32) {
                throw new Error("accessManaPledgeID is not valid");
            }

            const cManaPledgeBytes = Base58.decode(cManaPledge);
            if (cManaPledgeBytes.length !== 32) {
                throw new Error("consensusManaPledgeID is not valid");
            }

            const version = 0;
            const time = Date.now();
            const timestamp = BigInt(time*1000000);
 
            // Calculate the spending requirements
            const consumedOutputs = this.determineOutputsToConsume(sendFundsOptions);

            const { inputs, consumedFunds } = this.buildInputs(consumedOutputs);
            const outputs = this.buildOutputs(sendFundsOptions, consumedFunds);

            const seed = Base58.decode(this._wallet.seed);

            const unlockBlocks: IUnlockBlock[] = [];
            const tx: ITransaction = {
                version,
                timestamp,
                aManaPledge,
                cManaPledge,
                inputs,
                outputs,
                unlockBlocks: unlockBlocks
            };

            const txEssence = Transaction.essence(tx);
            
            const addressByOutputID: { [outputID: string]: string } = {};
            for (const address in consumedOutputs) {
                for (const outputID in consumedOutputs[address]){
                    addressByOutputID[outputID] = address;
                }
            }

            const existingUnlockBlocks: { [address: string]: number } = {};
            for (const index in inputs) {
                const addr = this._addresses.find(a => a.address === addressByOutputID[inputs[index]]);
                if (addr) {
                    if (existingUnlockBlocks[addr.address] !== undefined) {
                        unlockBlocks.push({type:1, referenceIndex:existingUnlockBlocks[addr.address], publicKey: Buffer.alloc(0), signature: Buffer.alloc(0) });
                        continue;
                    }
                    const keyPair = Seed.generateKeyPair(seed, addr.index);
                    const signatureUnlockBlock = {type:0, referenceIndex:0, publicKey: keyPair.publicKey, signature: Transaction.sign(keyPair, txEssence)};
                    existingUnlockBlocks[addr.address] = unlockBlocks.length; 
                    unlockBlocks.push(signatureUnlockBlock);
                }
            }

            tx.unlockBlocks = unlockBlocks;

            const response = await apiClient.sendTransaction({
                txn_bytes: Transaction.bytes(tx, txEssence).toString("base64")
            });

            if (response.error) {
                throw new Error(response.error);
            }

            // Mark outputs as spent
            this._spentOutputTransactions = this._spentOutputTransactions ?? [];
            for (const address in consumedOutputs) {
                for (const transactionId in consumedOutputs[address]) {
                    if (!this._spentOutputTransactions.includes(transactionId)) {
                        this._spentOutputTransactions.push(transactionId);
                    }
                }
            }

            // mark addresses as spent
            if (!this._reusableAddresses) {
                for (const address in consumedOutputs) {
                    if (!this._wallet.spentAddresses.includes(address)) {
                        this._wallet.spentAddresses.push(address);
                    }
                }
            }

            const txID = response.transaction_id;
            if (txID) {
                const index = Transaction.mintIndex(tx.outputs);
                const indexBytes = Buffer.alloc(2);
                indexBytes.writeUInt16LE(index);
                const txIDBytes = Base58.decode(txID);
                return Base58.encode(Buffer.from(blake2b(Buffer.concat([txIDBytes, indexBytes]), undefined, 32 /* Blake256 */)));
            }

            return undefined;
        }
    }

    /**
     * Request funds from the faucet.
     * @returns Returns the transaction id.
     */
    public async requestFunds(): Promise<string | undefined> {
        if (this._wallet && this._addresses) {
            const receiveAddress = this.getReceiveAddress();

            if (receiveAddress) {

                const worker = new Worker("../utils/worker.js", {
                    workerData: {
                    value: 15,
                    path: "../utils/worker.ts"
                    }
                });
                
                worker.on("message", (result) => {
                    console.log("HELLLLLLOOOOOOO", result);
                });

                const data = Buffer.alloc(1);
                data.writeUInt8(255); 
                const start = performance.now();
                await PoW.calculateProofOfWork(20, data);
                console.log("----------------- PoW", performance.now()-start);


                const apiClient = await this.buildApiClient();
                const response = await apiClient.faucet({
                    address: receiveAddress
                });
                if (response.error) {
                    throw new Error(response.error);
                }
                await this.doUpdates();

                return response.id;
            }
        }
    }

    private mapToArray(b: {[color: string]: bigint}): (IWalletOutputBalance[]) {
        const balances: IWalletOutputBalance[] = [];
   
        for (const [color, value] of Object.entries(b)) {
            let colorName = color;
            if (color === Colors.IOTA_BASE58) {
                colorName = Colors.IOTA_NAME;
            }
            balances.push({
                color: colorName, 
                value: BigInt(value)
            });
        }
        return balances;
    }

    /**
     * Get unspent outputs data.
     * @returns The unspent output data.
     */
    public async getUnspentOutputs(): Promise<IWalletAddressOutput[]> {
        if (!this._wallet) {
            return [];
        }
        try {
            const apiClient = await this.buildApiClient();

            const bufferSeed = Base58.decode(this._wallet.seed);
            const BLOCK_COUNT = 20;
            let blockIdx = 0;
            let spentAddresses;
            let unspentOutputs: IWalletAddressOutput[] = [];

            do {
                const addresses = [];
                for (let i = 0; i < BLOCK_COUNT; i++) {
                    addresses.push(Seed.generateAddress(bufferSeed, BigInt(i + blockIdx * BLOCK_COUNT)));
                }
                const response = await apiClient.unspentOutputs({
                    addresses
                });

                spentAddresses = response.unspentOutputs.filter(u => this._wallet && this._wallet.spentAddresses.includes(u.address.base58));
                const usedAddresses = response.unspentOutputs.filter(u => u.outputs.length > 0);
                blockIdx++;

                unspentOutputs = unspentOutputs.concat(usedAddresses.map(uo => ({
                    address: uo.address.base58,
                    outputs: uo.outputs.filter(o => o.output.type === "SigLockedColoredOutputType").map(uid => ({
                        id: uid.output.outputID.base58,
                        balances: this.mapToArray(uid.output.output.balances),
                        inclusionState: uid.inclusionState
                    }))
                })));
            } while (spentAddresses.length > BLOCK_COUNT - 2);

            // unspentOutputs.forEach(o => {
            //     console.log("address: ", o.address)
            //     o.outputs.forEach(output => {
            //         console.log("output:", output.id)
            //         console.log("inclusion state:", output.inclusionState)
            //     })
            // });

            return unspentOutputs;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    /**
     * Save the wallet.
     */
    private async save(): Promise<void> {
        if (this._wallet) {
            await this._jsonStorageService.set("wallet.json", this._wallet);
        }
    }

    /**
     * Load the wallet.
     * @returns The wallet if there is one.
     */
    private async load(): Promise<IWallet | undefined> {
        this._wallet = await this._jsonStorageService.get("wallet.json");
        return this._wallet;
    }

    /**
     * From all the inputs determine which ones we need to consume.
     * @param sendFundOptions The request funds.
     * @returns The output that we need to consume.
     */
    private determineOutputsToConsume(sendFundOptions: ISendFundsOptions): {
        [address: string]: { [outputID: string]: IWalletOutput };
    } {
        const outputsToConsume: { [address: string]: { [outputID: string]: IWalletOutput } } = {};

        const requiredFunds: { [color: string]: bigint } = {};

        for (const dest in sendFundOptions.destinations) {
            for (const color in sendFundOptions.destinations[dest]) {
                // if we want to color something then we need fresh IOTA
                const col = color === Colors.MINT ? "IOTA" : color;
                if (!requiredFunds[col]) {
                    requiredFunds[col] = sendFundOptions.destinations[dest][color];
                } else {
                    requiredFunds[col] += sendFundOptions.destinations[dest][color];
                }
            }
        }

        // look for the required funds in the available unspent outputs
        if (this._unspentOutputs) {
            for (const unspentOutput of this._unspentOutputs) {
                let outputsFromAddressSpent = false;
               
                const confirmedUnspentOutputs = unspentOutput.outputs.filter(o =>
                    (!this._spentOutputTransactions ||
                    !this._spentOutputTransactions.includes(o.id)) && 
                    o.inclusionState.confirmed);
               
                // scan the outputs on this address for required funds
                for (const output of confirmedUnspentOutputs) {
                    // keeps track if the output contains any usable funds
                    let requiredColorFoundInOutput = false;

                    // subtract the found matching balances from the required funds
                    for (const balance of output.balances) {
                        if (requiredFunds[balance.color]) {
                            if (requiredFunds[balance.color] > balance.value) {
                                requiredFunds[balance.color] -= balance.value;
                            } else {
                                delete requiredFunds[balance.color];
                            }
                            requiredColorFoundInOutput = true;
                        }
                    }

                    // if we found required tokens in this output
                    if (requiredColorFoundInOutput) {
                        // store the output in the outputs to use for the transfer
                        outputsToConsume[unspentOutput.address] = {};
                        outputsToConsume[unspentOutput.address][output.id] = output;

                        // mark address as spent
                        outputsFromAddressSpent = true;
                    }
                }

                // if outputs from this address were spent add the remaining outputs as well
                // (we want to spend only once from every address if we are not using a reusable address)
                if (outputsFromAddressSpent && !this._reusableAddresses) {
                    for (const output of confirmedUnspentOutputs) {
                        outputsToConsume[unspentOutput.address][output.id] = output;
                    }
                }
            }
        }

        // update remainder address with default value (first unspent address) if none was provided
        if (!sendFundOptions.remainderAddress) {
            sendFundOptions.remainderAddress = this.getRemainderAddress();
        }

        if ((!sendFundOptions.remainderAddress || outputsToConsume[sendFundOptions.remainderAddress])
            && !this._reusableAddresses) {
            sendFundOptions.remainderAddress = this.getReceiveAddress();
        }

        if ((!sendFundOptions.remainderAddress || outputsToConsume[sendFundOptions.remainderAddress])
            && !this._reusableAddresses) {
            sendFundOptions.remainderAddress = this.newReceiveAddress();
        }

        if (Object.keys(requiredFunds).length > 0) {
            throw new Error("Not enough funds to create transaction");
        }

        return outputsToConsume;
    }

    /**
     * Build input for the transfer.
     * @param outputsToUseAsInputs The output to use in the transfer.
     * @returns The inputs and consumed funds.
     */
    private buildInputs(outputsToUseAsInputs: { [address: string]: { [outputID: string]: IWalletOutput } }): {
        /**
         * The inputs to send.
         */
        inputs: string[];
        /**
         * The fund that were consumed.
         */
        consumedFunds: { [color: string]: bigint };
    } {
        const inputs: string[] = [];
        const consumedFunds: { [color: string]: bigint } = {};

        for (const address in outputsToUseAsInputs) {
            for (const outputID in outputsToUseAsInputs[address]) {
                inputs.push(outputID);

                for (const balance of outputsToUseAsInputs[address][outputID].balances) {
                    if (!consumedFunds[balance.color]) {
                        consumedFunds[balance.color] = balance.value;
                    } else {
                        consumedFunds[balance.color] += balance.value;
                    }
                }
            }
        }

        inputs.sort((a, b) => Base58.decode(a).compare(Base58.decode(b)));

        return { inputs, consumedFunds };
    }

    /**
     * Build outputs for the transfer.
     * @param sendFundsOptions The options for sending.
     * @param consumedFunds The funds to consume in the transfer.
     * @returns The outputs by address.
     */
    private buildOutputs(sendFundsOptions: ISendFundsOptions, consumedFunds: { [color: string]: bigint }): {
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
    } {
        const outputsByColor: { [address: string]: { [color: string]: bigint } } = {};

        // build outputs for destinations
        for (const address in sendFundsOptions.destinations) {
            if (!outputsByColor[address]) {
                outputsByColor[address] = {};
            }

            for (const color in sendFundsOptions.destinations[address]) {
                const amount = sendFundsOptions.destinations[address][color];
                if (!outputsByColor[address][color]) {
                    outputsByColor[address][color] = BigInt(0);
                }
                outputsByColor[address][color] += amount;

                const col = color === Colors.MINT ? "IOTA" : color;

                consumedFunds[col] -= amount;
                if (consumedFunds[col] === BigInt(0)) {
                    delete consumedFunds[col];
                }
            }
        }

        // build outputs for remainder
        if (Object.keys(consumedFunds).length > 0) {
            if (!sendFundsOptions.remainderAddress) {
                throw new Error("No remainder address available");
            }
            if (!outputsByColor[sendFundsOptions.remainderAddress]) {
                outputsByColor[sendFundsOptions.remainderAddress] = {};
            }
            for (const consumed in consumedFunds) {
                if (!outputsByColor[sendFundsOptions.remainderAddress][consumed]) {
                    outputsByColor[sendFundsOptions.remainderAddress][consumed] = BigInt(0);
                }
                outputsByColor[sendFundsOptions.remainderAddress][consumed] += consumedFunds[consumed];
            }
        }

        // construct result
        const outputsBySlice: {
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
        } = {};

        for (const address in outputsByColor) {
            outputsBySlice[address] = [];
            for (const color in outputsByColor[address]) {
                outputsBySlice[address].push({
                    color,
                    value: outputsByColor[address][color]
                });
            }
        }

        return outputsBySlice;
    }

    /**
     * Create send fund options from the parameters.
     * @param address The source address.
     * @param amount The amount.
     * @param color The color.
     * @returns The options.
     */
    private createSendFundOptions(address: string, amount: bigint, color: string): ISendFundsOptions {
        const options: ISendFundsOptions = {
            destinations: {}
        };

        options.destinations[address] = {};
        options.destinations[address][color] = amount;

        return options;
    }

    /**
     * Start wallet updates.
     */
    private async startUpdates(): Promise<void> {
        this.stopUpdates();
        this._timerId = setInterval(
            async () => this.doUpdates(),
            10000);
    }

    /**
     * Stop wallet updates.
     */
    private stopUpdates(): void {
        if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = undefined;
        }
    }

    /**
     * Perform wallet updates.
     */
    private async doUpdates(): Promise<void> {
        this._unspentOutputs = await this.getUnspentOutputs();
        await this.calculateAddressesAndBalances();

        for (const id in this._subscribers) {
            this._subscribers[id]();
        }
    }

    /**
     * Initialise the current wallet.
     * @returns The wallet if there is one.
     */
    private async initialiseWallet(): Promise<void> {
        this._unspentOutputs = await this.getUnspentOutputs();
        this._spentOutputTransactions = [];
        await this.calculateAddressesAndBalances();
    }

    /**
     * Calculate balances from the address outputs.
     * @param addressOutputs The address outputs to calculate balance from.
     */
    private async calculateAddressesAndBalances(): Promise<void> {
        if (this._wallet && this._unspentOutputs) {
            this._balances = [];
            this._addresses = [];
            const colorMap: { [id: string]: IWalletBalance } = {};
            const addressMap: { [id: string]: IWalletAddress } = {};
            const assetsMap: { [id: string]: IWalletAsset } = {};
            const addedAssets: IWalletAsset[] = [];

            for (let i = 0; i <= this._wallet.lastAddressIndex; i++) {
                const addr = Seed.generateAddress(Base58.decode(this._wallet.seed), BigInt(i));
                const address: IWalletAddress = {
                    index: BigInt(i),
                    address: addr,
                    isSpent: this._wallet &&
                        this._wallet.spentAddresses.includes(addr) ? true : false
                };
                addressMap[address.address] = address;
                this._addresses.push(address);
            }

            assetsMap.IOTA = {
                color: "IOTA",
                name: "IOTA",
                symbol: "I",
                precision: 0
            };
            for (const asset of this._wallet.assets) {
                assetsMap[asset.color] = asset;
            }

            for (const addressOutput of this._unspentOutputs) {
                for (const output of addressOutput.outputs) {
                    for (const balance of output.balances) {
                        if (!colorMap[balance.color]) {
                            if (!assetsMap[balance.color]) {
                                // We have received an asset we don't recognise
                                // so create a dummy entry, in the future this
                                // will be looked up from a central registry
                                const asset = {
                                    color: balance.color,
                                    name: "Unknown",
                                    symbol: "",
                                    precision: 0
                                };
                                addedAssets.push(asset);
                                assetsMap[balance.color] = asset;
                            }
                            colorMap[balance.color] = {
                                asset: assetsMap[balance.color],
                                confirmed: BigInt(0),
                                unConfirmed: BigInt(0),
                                rejected: BigInt(0)
                            };
                            this._balances.push(colorMap[balance.color]);
                        }
                        if (output.inclusionState.confirmed) {
                            colorMap[balance.color].confirmed += balance.value;
                        } else if (output.inclusionState.rejected) {
                            colorMap[balance.color].rejected += balance.value;
                        } else {
                            colorMap[balance.color].unConfirmed += balance.value;
                        }
                    }
                }
            }

            const lastUnspent = this.getLastUnspentAddress();

            if (!lastUnspent) {
                this.newReceiveAddress();
            }

            if (addedAssets.length > 0) {
                this._wallet.assets = this._wallet.assets.concat(addedAssets);
                await this.save();
            }
        }
    }

    /**
     * Get the remainder address for transfers.
     * @returns The first unspent address.
     */
    private getRemainderAddress(): string | undefined {
        if (this._addresses) {
            const unspent = this._addresses.filter(f => !f.isSpent);

            return unspent.length > 0 ? unspent[0].address : undefined;
        }
    }

    /**
     * Get the last unspent address from the list.
     * @returns The last unspent address.
     */
    private getLastUnspentAddress(): string | undefined {
        if (this._addresses) {
            const unspent = this._addresses.filter(f => !f.isSpent);

            return unspent.length > 0 ? unspent[unspent.length - 1].address : undefined;
        }
    }

    /**
     * Get a new receive address for transfers.
     * @returns The new receive address.
     */
    private newReceiveAddress(): string | undefined {
        if (this._wallet && this._addresses) {
            this._wallet.lastAddressIndex++;

            const addr = Seed.generateAddress(Base58.decode(this._wallet.seed), BigInt(this._wallet.lastAddressIndex));
            const address: IWalletAddress = {
                index: BigInt(this._wallet.lastAddressIndex),
                address: addr,
                isSpent: false
            };
            this._addresses.push(address);

            return addr;
        }
    }

    /**
     * Build an API Client for requests.
     * @returns The API Client.
     */
    private async buildApiClient(): Promise<ApiClient> {
        const settingsService = ServiceFactory.get<SettingsService>("settings");
        const settings = await settingsService.get();
        return new ApiClient(settings.apiEndpoint, settings.user, settings.password);
    }
}
