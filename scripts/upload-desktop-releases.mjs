#!/usr/bin/env node
/**
 * Upload Electron installers to Vercel Blob (public) and publish manifest.json.
 *
 * Requires BLOB_READ_WRITE_TOKEN (font store on typefolio-app — Vercel Dashboard → Storage → Blob).
 *
 * Usage:
 *   npm run dist:desktop:mac
 *   npm run upload:desktop:blob
 *
 * Uses the marketing site's /desktop/releases/* paths (see apps/marketing/next.config.ts rewrites).
 */

import { readdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { put } from "@vercel/blob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const defaultReleaseDir = path.join(repoRoot, "apps/typefolio-desktop/release");
const defaultPkg = path.join(repoRoot, "apps/typefolio-desktop/package.json");

const MANIFEST_PATHNAME = "desktop/releases/manifest.json";

function marketingOrigin() {
  return (
    process.env.DESKTOP_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_MARKETING_URL?.trim().replace(/\/$/, "") ||
    "https://typefolio.app"
  );
}

function publicDesktopUrl(blobUrl) {
  try {
    const parsed = new URL(blobUrl);
    if (!parsed.pathname.startsWith("/desktop/releases/")) {
      return blobUrl;
    }
    return `${marketingOrigin()}${parsed.pathname}${parsed.search}`;
  } catch {
    return blobUrl;
  }
}

function parseArgs(argv) {
  const args = { releaseDir: defaultReleaseDir, version: null };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--release-dir" && argv[i + 1]) {
      args.releaseDir = path.resolve(argv[i + 1]);
      i += 1;
    } else if (argv[i] === "--version" && argv[i + 1]) {
      args.version = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function listFiles(dir) {
  try {
    return readdirSync(dir).map((name) => path.join(dir, name));
  } catch {
    return [];
  }
}

function pickArtifact(files, predicate) {
  const matches = files.filter((filePath) => {
    try {
      return statSync(filePath).isFile() && predicate(filePath);
    } catch {
      return false;
    }
  });
  if (matches.length === 0) {
    return null;
  }
  matches.sort((a, b) => statSync(b).size - statSync(a).size);
  return matches[0];
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".dmg") {
    return "application/x-apple-diskimage";
  }
  if (ext === ".exe") {
    return "application/vnd.microsoft.portable-executable";
  }
  if (ext === ".appimage") {
    return "application/x-appimage";
  }
  if (ext === ".deb") {
    return "application/vnd.debian.package-archive";
  }
  return "application/octet-stream";
}

async function uploadFile(filePath, pathname, version, token) {
  const buffer = await readFile(filePath);
  const contentType = contentTypeFor(filePath);
  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
  console.log(`Uploading ${path.basename(filePath)} (${sizeMb} MB) → ${pathname}`);

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
    allowOverwrite: true,
    addRandomSuffix: false,
    multipart: buffer.length > 20 * 1024 * 1024,
    cacheControlMaxAge: 60 * 60 * 24 * 7,
    token,
  });

  console.log(`  ${blob.url}`);
  return {
    url: blob.downloadUrl ?? blob.url,
    fileName: path.basename(filePath),
    version,
  };
}

async function fetchExistingManifest(version) {
  const url = `${marketingOrigin()}/desktop/releases/manifest.json`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (data?.version !== version || !data.downloads || typeof data.downloads !== "object") {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

async function main() {
  const token =
    process.env.DESKTOP_BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    console.error(
      "Missing DESKTOP_BLOB_READ_WRITE_TOKEN or BLOB_READ_WRITE_TOKEN. Pull from typefolio-marketing (public desktop Blob store).",
    );
    process.exit(1);
  }

  const { releaseDir, version: versionArg } = parseArgs(process.argv);
  const pkg = JSON.parse(await readFile(defaultPkg, "utf8"));
  const version = versionArg || pkg.version || "0.1.0";

  const topLevel = listFiles(releaseDir);
  const nested = topLevel.flatMap((entry) => {
    try {
      return statSync(entry).isDirectory() ? listFiles(entry) : [entry];
    } catch {
      return [];
    }
  });
  const allFiles = [...topLevel, ...nested];

  const mac = pickArtifact(
    allFiles,
    (f) => path.extname(f).toLowerCase() === ".dmg" && !f.endsWith(".blockmap"),
  );
  const win = pickArtifact(allFiles, (f) => path.extname(f).toLowerCase() === ".exe");
  const linux =
    pickArtifact(allFiles, (f) => path.extname(f).toLowerCase() === ".appimage") ||
    pickArtifact(allFiles, (f) => path.extname(f).toLowerCase() === ".deb");

  if (!mac && !win && !linux) {
    console.error(`No installers found under ${releaseDir}. Run npm run dist:desktop:* first.`);
    process.exit(1);
  }

  const downloads = {};
  const prefix = `desktop/releases/${version}`;

  if (mac) {
    const fileName = path.basename(mac);
    const { url } = await uploadFile(mac, `${prefix}/${fileName}`, version, token);
    downloads.macos = { url: publicDesktopUrl(url), fileName };
  }
  if (win) {
    const fileName = path.basename(win);
    const { url } = await uploadFile(win, `${prefix}/${fileName}`, version, token);
    downloads.windows = { url: publicDesktopUrl(url), fileName };
  }
  if (linux) {
    const fileName = path.basename(linux);
    const { url } = await uploadFile(linux, `${prefix}/${fileName}`, version, token);
    downloads.linux = { url: publicDesktopUrl(url), fileName };
  }

  const existing = await fetchExistingManifest(version);
  const mergedDownloads = {
    ...(existing?.downloads ?? {}),
    ...downloads,
  };

  const manifest = {
    version,
    publishedAt: new Date().toISOString(),
    downloads: mergedDownloads,
  };

  const manifestBlob = await put(MANIFEST_PATHNAME, JSON.stringify(manifest, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 300,
    token,
  });

  console.log("\nPublished desktop release manifest (Blob):");
  console.log(manifestBlob.url);
  console.log("\nPublic URLs (marketing domain):");
  console.log(`${marketingOrigin()}/desktop/releases/manifest.json`);
  for (const [platform, entry] of Object.entries(mergedDownloads)) {
    console.log(`  ${platform}: ${entry.url}`);
  }
  console.log(
    "\nEnsure typefolio-marketing has DESKTOP_BLOB_PUBLIC_ORIGIN set to the Blob store origin, then redeploy marketing.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
