import { app, BrowserWindow } from "electron";
import * as path from "path";

import { API_URL } from "./config";
import {
  bootstrapSyncIfSignedIn,
  getPreloadPath,
  onAuthDeepLink,
  registerIpcHandlers,
  setMainWindow,
} from "./ipc";
import { stopSyncLoop } from "./sync";
import { store } from "./store";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: "Typefolio",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: "#0a0a0a",
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      sandbox: false,
    },
  });

  setMainWindow(mainWindow);

  if (!store.get("apiBaseUrl")) {
    store.set("apiBaseUrl", API_URL);
  }

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
    setMainWindow(null);
  });
}

app.setAsDefaultProtocolClient("typefolio");

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const deepLink = argv.find((a) => a.startsWith("typefolio://"));
    if (deepLink) onAuthDeepLink(deepLink);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on("open-url", (event, url) => {
  event.preventDefault();
  onAuthDeepLink(url);
});

registerIpcHandlers();

app.whenReady().then(() => {
  createWindow();
  bootstrapSyncIfSignedIn();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  stopSyncLoop();
});
