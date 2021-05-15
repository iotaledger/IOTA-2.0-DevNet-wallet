const { app, nativeImage, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const windowStateKeeper = require('electron-window-state');

app.commandLine.appendSwitch('disable-web-security');;

const logo = path.join(__dirname, '../build/logo.png');

let mainWindow;
function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 900,
    defaultHeight: 800
  });

  mainWindow = new BrowserWindow(
    {
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      backgroundColor: '#f6f8fc',
      frame: false,
      title: "Pollen Wallet",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        nodeIntegrationInWorker: true,
        webSecurity: false,
        enableRemoteModule: true
      }
    });

  mainWindowState.manage(mainWindow);
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3001"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));

  const image = nativeImage.createFromPath(logo);
  mainWindow.setIcon(image);
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
