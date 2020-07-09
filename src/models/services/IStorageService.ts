export interface IStorageService {
    /**
     * Store a buffer in the storage system.
     * @param name The name of the item to store.
     * @param buffer The buffer of data to store.
     */
    set(name: string, buffer: Buffer): Promise<void>;

    /**
     * Get a buffer from the storage system.
     * @param name The name of the item to retrieve.
     * @returns The buffer retrieved.
     */
    get(name: string): Promise<Buffer | undefined>;

    /**
     * Remove a buffer from the storage system.
     * @param name The name of the item to remove.
     */
    remove(name: string): Promise<void>;
}
