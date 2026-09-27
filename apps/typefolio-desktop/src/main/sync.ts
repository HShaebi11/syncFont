import { execFile } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import { FONT_INSTALL_DIR, deviceName, devicePlatform } from "./config";
import { apiFetch, apiJson } from "./api-client";
import { store } from "./store";

const execFileAsync = promisify(execFile);

interface ManifestFont {
  id: string;
  originalName: string;
  extension: string;
  sha256?: string;
}

interface ManifestBody {
  manifest: {
    etag: string;
    fonts: ManifestFont[];
  };
}

interface MeBody {
  library: { id: string; name: string };
}

interface RegisterDeviceBody {
  device: { id: string };
}

let syncTimer: ReturnType<typeof setInterval> | null = null;
let lastSyncStatus = "idle";
let isSyncing = false;

export function getSyncStatus(): string {
  return lastSyncStatus;
}

export function stopSyncLoop(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

export function startSyncLoop(onUpdate: (msg: string) => void): void {
  if (syncTimer) return;
  void runSync(onUpdate);
  syncTimer = setInterval(() => {
    void runSync(onUpdate);
  }, 30_000);
}

async function ensureLibraryId(): Promise<string | null> {
  const cached = store.get("libraryId");
  if (cached) return cached;
  const me = await apiJson<MeBody>("/api/me");
  if (me.status === 200 && me.data?.library?.id) {
    store.set("libraryId", me.data.library.id);
    return me.data.library.id;
  }
  return null;
}

async function ensureDeviceRegistered(libraryId: string): Promise<string | null> {
  const existing = store.get("deviceId");
  if (existing) return existing;

  const res = await apiJson<RegisterDeviceBody>(
    `/api/libraries/${libraryId}/devices`,
    {
      method: "POST",
      body: JSON.stringify({ name: deviceName(), platform: devicePlatform() }),
    },
  );

  if (res.status === 200 && res.data?.device?.id) {
    store.set("deviceId", res.data.device.id);
    return res.data.device.id;
  }
  return null;
}

async function verifySha256(filePath: string, expected?: string): Promise<boolean> {
  if (!expected) return true;
  const hash = crypto.createHash("sha256");
  hash.update(await fs.promises.readFile(filePath));
  return hash.digest("hex") === expected;
}

async function refreshFontCache(): Promise<void> {
  if (process.platform !== "linux") return;
  try {
    await execFileAsync("fc-cache", ["-f", FONT_INSTALL_DIR]);
  } catch {
    lastSyncStatus = "Installed fonts (fc-cache skipped)";
  }
}

export async function runSync(onUpdate?: (msg: string) => void): Promise<void> {
  const token = store.get("token");
  if (!token || isSyncing) return;

  isSyncing = true;
  const log = (msg: string) => {
    lastSyncStatus = msg;
    onUpdate?.(msg);
  };

  try {
    const libraryId = await ensureLibraryId();
    if (!libraryId) {
      log("Could not resolve library.");
      return;
    }

    await ensureDeviceRegistered(libraryId);

    const etag = store.get("lastEtag");
    const manifestRes = await apiFetch(`/api/libraries/${libraryId}/manifest`);

    if (!manifestRes.ok) {
      log(`Manifest fetch failed (${manifestRes.status}).`);
      return;
    }

    const manifestData = (await manifestRes.json()) as ManifestBody;
    const manifest = manifestData.manifest;

    if (etag && manifest.etag === etag) {
      log("Already up to date.");
      return;
    }

    store.set("lastEtag", manifest.etag);

    if (!fs.existsSync(FONT_INSTALL_DIR)) {
      fs.mkdirSync(FONT_INSTALL_DIR, { recursive: true });
    }

    const installed = new Set(store.get("installedFontIds"));
    let installedThisRun = 0;

    for (const font of manifest.fonts) {
      if (installed.has(font.id)) continue;
      const dest = path.join(FONT_INSTALL_DIR, font.originalName);
      try {
        const download = await apiFetch(
          `/api/libraries/${libraryId}/fonts/${font.id}`,
        );
        if (!download.ok) {
          log(`Skipped ${font.originalName}: download failed.`);
          continue;
        }
        const buffer = Buffer.from(await download.arrayBuffer());
        await fs.promises.writeFile(dest, buffer);
        if (!(await verifySha256(dest, font.sha256))) {
          await fs.promises.unlink(dest).catch(() => undefined);
          log(`Skipped ${font.originalName}: checksum mismatch.`);
          continue;
        }
        installed.add(font.id);
        installedThisRun += 1;
        log(`Installed ${font.originalName}.`);
      } catch (err) {
        log(`Failed ${font.originalName}: ${String(err)}`);
      }
    }

    store.set("installedFontIds", Array.from(installed));
    await refreshFontCache();

    const deviceId = store.get("deviceId");
    if (deviceId) {
      await apiJson(`/api/libraries/${libraryId}/devices/${deviceId}`, {
        method: "PATCH",
        body: JSON.stringify({
          lastSyncAt: new Date().toISOString(),
          installedFontIds: Array.from(installed),
        }),
      });
    }

    if (installedThisRun === 0) {
      log("Sync complete.");
    }
  } finally {
    isSyncing = false;
  }
}

export async function fetchFontBytes(
  libraryId: string,
  fontId: string,
): Promise<Buffer> {
  const res = await apiFetch(`/api/libraries/${libraryId}/fonts/${fontId}`);
  if (!res.ok) {
    throw new Error(`Font download failed (${res.status})`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function downloadLibraryZip(destPath: string): Promise<void> {
  const libraryId = store.get("libraryId") || (await ensureLibraryId());
  if (!libraryId) throw new Error("Not signed in");

  const res = await apiFetch(`/api/libraries/${libraryId}/download`);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(destPath, buffer);
}

export async function uploadFontFiles(filePaths: string[]): Promise<{
  added: number;
  rejected: string[];
}> {
  const boundary = `----Typefolio${Date.now()}`;
  const parts: Buffer[] = [];

  for (const filePath of filePaths) {
    const filename = path.basename(filePath);
    const data = await fs.promises.readFile(filePath);
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="fonts"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`,
      ),
    );
    parts.push(data);
    parts.push(Buffer.from("\r\n"));
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`));
  const body = Buffer.concat(parts);

  const res = await apiFetch("/api/fonts", {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body,
  });

  const data = (await res.json()) as {
    added?: number;
    rejected?: string[];
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? "Upload failed");
  }

  return { added: data.added ?? 0, rejected: data.rejected ?? [] };
}
