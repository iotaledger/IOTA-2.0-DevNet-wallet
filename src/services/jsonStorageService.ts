import { ServiceFactory } from "../factories/serviceFactory";
import { IJsonStorageService } from "../models/services/IJsonStorageService";
import { IStorageService } from "../models/services/IStorageService";

/**
 * Storage service implementation for Local storage.
 */
export class JsonStorageService implements IJsonStorageService {
    /**
     * The storage service to use.
     */
    private readonly _storageService: IStorageService;

    /**
     * Create a new instance of JsonStorageService.
     */
    constructor() {
        this._storageService = ServiceFactory.get<IStorageService>("storage");
    }

    /**
     * Store an object in the storage system.
     * @param name The name of the item to store.
     * @param obj The buffer of data to store.
     * @returns Promise.
     */
    public async set<T>(name: string, obj: T): Promise<void> {
        return this._storageService.set(name, Buffer.from(JSON.stringify(obj, undefined, "\t")));
    }

    /**
     * Get an object from the storage system.
     * @param name The name of the item to retrieve.
     * @returns The object retrieved.
     */
    public async get<T>(name: string): Promise<T | undefined> {
        const buffer = await this._storageService.get(name);
        return buffer ? JSON.parse(buffer.toString()) : undefined;
    }

    /**
     * Remove an object from the storage system.
     * @param name The name of the item to remove.
     * @returns Promise.
     */
    public async remove(name: string): Promise<void> {
        return this._storageService.remove(name);
    }
}
