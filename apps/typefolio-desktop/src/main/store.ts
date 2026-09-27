import Store from "electron-store";

export interface DesktopStoreSchema {
  apiBaseUrl: string;
  token: string;
  email: string;
  libraryId: string;
  lastEtag: string;
  deviceId: string;
  installedFontIds: string[];
}

export const store = new Store<DesktopStoreSchema>({
  defaults: {
    apiBaseUrl: "",
    token: "",
    email: "",
    libraryId: "",
    lastEtag: "",
    deviceId: "",
    installedFontIds: [],
  },
});

export function clearSession(): void {
  store.set("token", "");
  store.set("email", "");
  store.set("libraryId", "");
  store.set("lastEtag", "");
  store.set("deviceId", "");
  store.set("installedFontIds", []);
}

export function hasSession(): boolean {
  return Boolean(store.get("token")?.trim());
}
