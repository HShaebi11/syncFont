import * as os from "os";
import * as path from "path";

import type { DevicePlatform } from "@typefolio/core/types";

export const API_URL =
  process.env.TYPEFOLIO_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:43124";

export const WEB_APP_URL =
  process.env.TYPEFOLIO_WEB_APP_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:43124";

export const SYNC_INTERVAL_MS = 30_000;

export const FONT_INSTALL_DIR: string = (() => {
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Fonts");
  }
  if (process.platform === "win32") {
    return path.join(
      os.homedir(),
      "AppData",
      "Local",
      "Microsoft",
      "Windows",
      "Fonts",
    );
  }
  return path.join(os.homedir(), ".local", "share", "fonts", "typefolio");
})();

export function devicePlatform(): DevicePlatform {
  if (process.platform === "darwin") return "macos";
  if (process.platform === "win32") return "windows";
  return "linux";
}

export function deviceName(): string {
  const host = os.hostname()?.trim();
  return host || "Typefolio Desktop";
}
