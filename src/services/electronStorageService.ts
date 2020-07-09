import { IStorageService } from "../models/services/IStorageService";

const elec = window.require("electron");
const fs = elec.remote.require("fs");
const path = elec.remote.require("path");

/**
 * Storage service implementation for Electron.
 */
export class ElectronStorageService implements IStorageService {
    /**
     * The name of the app to prefix the storage location.
     */
    private readonly _appName: string;

    /**
     * Create a new instance of ElectronStorageService.
     * @param appName The name of the app.
     */
    constructor(appName: string) {
        this._appName = appName;
    }

    /**
     * Store a buffer in the storage system.
     * @param name The name of the item to store.
     * @param buffer The buffer of data to store.
     * @returns Promise.
     */
    public async set(name: string, buffer: Buffer): Promise<void> {
        const fullPath = await this.createFullPath(name);

        try {
            fs.writeFileSync(fullPath, buffer);
        } catch(err) {
            console.error(err);
        }
    }

    /**
     * Get a buffer from the storage system.
     * @param name The name of the item to retrieve.
     * @returns The buffer retrieved.
     */
    public async get(name: string): Promise<Buffer | undefined> {
        const fullPath = await this.createFullPath(name);

        try {
            return fs.readFileSync(fullPath);
        } catch(err) {
            console.error(err);
        }
    }

    /**
     * Remove a buffer from the storage system.
     * @param name The name of the item to remove.
     * @returns Promise.
     */
    public async remove(name: string): Promise<void> {
        const fullPath = await this.createFullPath(name);

        try {
            fs.unlinkSync(fullPath);
        } catch(err) {
            console.error(err);
        }
    }

    /**
     * Generate the full path and create folder if required.
     * @param name The name of the file.
     * @returns The full path to the file.
     */
    private async createFullPath(name: string): Promise<string> {
        const appDataPath = elec.remote.app.getPath("appData");
        const fullPath = path.join(appDataPath, this._appName, name);
        try {
            const dir = path.dirname(fullPath);
            fs.mkdirSync(dir, { recursive: true });
        } catch(err) {
            console.error(err);
        }
        return fullPath;
    }
}
