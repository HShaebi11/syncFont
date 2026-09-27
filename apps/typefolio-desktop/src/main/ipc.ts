import { BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";

import {
  handleDeepLink,
  openBillingInBrowser,
  openSignUpInBrowser,
  signInWithBrowser,
  signOut,
} from "./auth";
import { store } from "./store";
import {
  downloadLibraryZip,
  fetchFontBytes,
  getSyncStatus,
  runSync,
  startSyncLoop,
  stopSyncLoop,
  uploadFontFiles,
} from "./sync";

let mainWindow: BrowserWindow | null = null;

function broadcast(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, payload);
  }
}

export function setMainWindow(win: BrowserWindow | null): void {
  mainWindow = win;
}

export function registerIpcHandlers(): void {
  ipcMain.handle("get-session", () => ({
    signedIn: Boolean(store.get("token")),
    email: store.get("email"),
    apiBaseUrl: store.get("apiBaseUrl"),
    token: store.get("token"),
  }));

  ipcMain.handle("get-access-token", () => store.get("token"));

  ipcMain.handle("sign-in-with-browser", async () => {
    const session = await signInWithBrowser();
    startSyncLoop((msg) => broadcast("sync-update", msg));
    await runSync((msg) => broadcast("sync-update", msg));
    return session;
  });

  ipcMain.handle("open-sign-up-in-browser", () => openSignUpInBrowser());

  ipcMain.handle("open-billing-in-browser", () => openBillingInBrowser());

  ipcMain.handle("sign-out", () => {
    stopSyncLoop();
    signOut();
  });

  ipcMain.handle("sync-now", async () => {
    await runSync((msg) => broadcast("sync-update", msg));
    return getSyncStatus();
  });

  ipcMain.handle("get-sync-status", () => getSyncStatus());

  ipcMain.handle("pick-and-upload-fonts", async () => {
    const { dialog } = await import("electron");
    if (!mainWindow) return { added: 0, rejected: ["No window"] };
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Fonts",
          extensions: ["ttf", "otf", "woff", "woff2"],
        },
      ],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { added: 0, rejected: [] };
    }
    return uploadFontFiles(result.filePaths);
  });

  ipcMain.handle("download-all-zip", async () => {
    const { dialog } = await import("electron");
    if (!mainWindow) return { ok: false };
    const save = await dialog.showSaveDialog(mainWindow, {
      defaultPath: "typefolio-fonts.zip",
      filters: [{ name: "ZIP", extensions: ["zip"] }],
    });
    if (save.canceled || !save.filePath) return { ok: false };
    await downloadLibraryZip(save.filePath);
    return { ok: true, path: save.filePath };
  });

  ipcMain.handle(
    "fetch-font-blob",
    async (_event, libraryId: string, fontId: string) => {
      const bytes = await fetchFontBytes(libraryId, fontId);
      return bytes.toString("base64");
    },
  );

  ipcMain.handle("open-external", (_event, url: string) => {
    void shell.openExternal(url);
  });
}

export function onAuthDeepLink(deepLink: string): void {
  const session = handleDeepLink(deepLink);
  if (!session) return;
  startSyncLoop((msg) => broadcast("sync-update", msg));
  void runSync((msg) => broadcast("sync-update", msg));
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    mainWindow.webContents.send("session-changed", {
      signedIn: true,
      email: session.email,
    });
  }
}

export function bootstrapSyncIfSignedIn(): void {
  if (!store.get("token")) return;
  startSyncLoop((msg) => broadcast("sync-update", msg));
  void runSync((msg) => broadcast("sync-update", msg));
}

export function getPreloadPath(): string {
  return path.join(__dirname, "../preload/index.js");
}
