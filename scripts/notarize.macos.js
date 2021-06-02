const { notarize } = require('electron-notarize');
const path = require('path');

exports.default = async () => {
    if (process.platform !== 'darwin' || process.env.MACOS_SKIP_NOTARIZATION || process.env.MACOS_SKIP_NOTARISATION) {
        return true;
    }

    const APPLE_ID = process.env.POLLEN_APPLE_ID;
    const APPLE_ID_PASSWORD = process.env.POLLEN_APPLE_ID_PASSWORD;

    if (!APPLE_ID) {
        throw Error('Notarization failed: Environment variable "POLLEN_APPLE_ID" is not defined');
    }

    if (!APPLE_ID_PASSWORD) {
        throw Error('Notarization failed: Environment variable "POLLEN_APPLE_ID_PASSWORD" is not defined');
    }

    await notarize({
        appBundleId: 'org.iota.pollen-wallet',
        appPath: path.resolve(__dirname, '../out/mac/IOTA DevNet Wallet.app'),
        appleId: APPLE_ID,
        appleIdPassword: APPLE_ID_PASSWORD,
        ascProvider: 'UG77RJKZHH',
    });
};
