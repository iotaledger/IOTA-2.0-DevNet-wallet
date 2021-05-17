const { app, nativeImage, BrowserWindow, ipcMain } = require("electron");
app.allowRendererProcessReuse = true;
const path = require("path");
const isDev = require("electron-is-dev");
const windowStateKeeper = require('electron-window-state');
require("@electron/remote/main").initialize();

app.commandLine.appendSwitch('disable-web-security');;

const logo = path.join(__dirname, '../build/logo.png');

let mainWindow;
let workerWindow;
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

// Create a hidden background window
function createWorkerWindow() {
  workerWindow = new BrowserWindow({
    "show": false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      enableRemoteModule: true
    }
  });
  workerWindow.loadURL(
    isDev
      ? `file://${path.join(__dirname, "worker.html")}`
      : `file://${path.join(__dirname, "../build/worker.html")}`
  );
  workerWindow.on('closed', () => {
    console.log('background window closed')
  });
  return workerWindow
}

app.on("ready", createWindow);
app.on("ready", createWorkerWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
  if (workerWindow === null) {
    createWorkerWindow();
  }
});

// Windows can talk to each other via main
ipcMain.on('for-renderer', (event, aManaPledge, cManaPledge, address, nonce) => {
  console.log("MAIN RECEIVED for renderer--------", aManaPledge, cManaPledge, address, nonce);
  mainWindow.webContents.send('to-renderer', aManaPledge, cManaPledge, address, nonce);
});
ipcMain.on('for-background', (event, aManaPledge, cManaPledge, address, data) => {
  console.log("MAIN RECEIVED for background--------", aManaPledge, cManaPledge, address, data);
  workerWindow.webContents.send('message', aManaPledge, cManaPledge, address, data);
});
