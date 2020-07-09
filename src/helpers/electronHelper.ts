
/**
 * Class to help with electron interop.
 */
export class ElectronHelper {
    /**
     * Are we running inside electron.
     * @returns True if this is the electron runtime.
     */
    public static isElectron(): boolean {
        return /electron/i.test(window.navigator.userAgent);
    }
}
