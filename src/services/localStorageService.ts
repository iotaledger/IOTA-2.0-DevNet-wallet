import { IStorageService } from "../models/services/IStorageService";

/**
 * Storage service implementation for Local storage.
 */
export class LocalStorageService implements IStorageService {
    /**
     * Store a buffer in the storage system.
     * @param name The name of the item to store.
     * @param buffer The buffer of data to store.
     * @returns Promise.
     */
    public async set(name: string, buffer: Buffer): Promise<void> {
        window.localStorage.setItem(name, buffer.toString("base64"));
    }

    /**
     * Get a buffer from the storage system.
     * @param name The name of the item to retrieve.
     * @returns The buffer retrieved.
     */
    public async get(name: string): Promise<Buffer | undefined> {
        const item = window.localStorage.getItem(name);
        if (item) {
            return Buffer.from(item, "base64");
        }
    }

    /**
     * Remove a buffer from the storage system.
     * @param name The name of the item to remove.
     * @returns Promise.
     */
    public async remove(name: string): Promise<void> {
        window.localStorage.removeItem(name);
    }
}
