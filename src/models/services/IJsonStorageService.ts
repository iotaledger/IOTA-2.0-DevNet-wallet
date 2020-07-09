export interface IJsonStorageService {
    /**
     * Store an object in the storage system.
     * @param name The name of the item to store.
     * @param obj The buffer of data to store.
     */
    set<T>(name: string, obj: T): Promise<void>;

    /**
     * Get an object from the storage system.
     * @param name The name of the item to retrieve.
     * @returns The object retrieved.
     */
    get<T>(name: string): Promise<T | undefined>;

    /**
     * Remove an object from the storage system.
     * @param name The name of the item to remove.
     */
    remove(name: string): Promise<void>;
}
