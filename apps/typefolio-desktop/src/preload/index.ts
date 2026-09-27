import { contextBridge, ipcRenderer } from "electron";

export interface DesktopSession {
  signedIn: boolean;
  email: string;
  apiBaseUrl: string;
  token: string;
}

const typefolioDesktop = {
  getSession: (): Promise<DesktopSession> => ipcRenderer.invoke("get-session"),
  getAccessToken: (): Promise<string> => ipcRenderer.invoke("get-access-token"),
  signInWithBrowser: (): Promise<{ token: string; email: string }> =>
    ipcRenderer.invoke("sign-in-with-browser"),
  openSignUpInBrowser: (): Promise<void> => ipcRenderer.invoke("open-sign-up-in-browser"),
  openBillingInBrowser: (): Promise<void> => ipcRenderer.invoke("open-billing-in-browser"),
  signOut: (): Promise<void> => ipcRenderer.invoke("sign-out"),
  syncNow: (): Promise<string> => ipcRenderer.invoke("sync-now"),
  getSyncStatus: (): Promise<string> => ipcRenderer.invoke("get-sync-status"),
  onSyncUpdate: (callback: (message: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, message: string) => callback(message);
    ipcRenderer.on("sync-update", handler);
    return () => ipcRenderer.removeListener("sync-update", handler);
  },
  onSessionChanged: (callback: (session: { signedIn: boolean; email: string }) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, session: { signedIn: boolean; email: string }) =>
      callback(session);
    ipcRenderer.on("session-changed", handler);
    return () => ipcRenderer.removeListener("session-changed", handler);
  },
  pickAndUploadFonts: (): Promise<{ added: number; rejected: string[] }> =>
    ipcRenderer.invoke("pick-and-upload-fonts"),
  downloadAllZip: (): Promise<{ ok: boolean; path?: string }> =>
    ipcRenderer.invoke("download-all-zip"),
  fetchFontBlobBase64: (libraryId: string, fontId: string): Promise<string> =>
    ipcRenderer.invoke("fetch-font-blob", libraryId, fontId),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke("open-external", url),
};

contextBridge.exposeInMainWorld("typefolioDesktop", typefolioDesktop);

export type TypefolioDesktopApi = typeof typefolioDesktop;

declare global {
  interface Window {
    typefolioDesktop: TypefolioDesktopApi;
  }
}
