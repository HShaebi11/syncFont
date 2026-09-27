import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const monorepoRoot = path.resolve(packageRoot, "../..");
const electronApp = path.join(monorepoRoot, "node_modules/electron/dist/Electron.app");
const electronBin = path.join(electronApp, "Contents/MacOS/Electron");

function prepareMacBinary() {
  if (process.platform !== "darwin" || !existsSync(electronApp)) {
    return;
  }
  spawnSync("xattr", ["-cr", electronApp], { stdio: "ignore" });
  const sign = spawnSync(
    "codesign",
    ["--force", "--deep", "--sign", "-", electronApp],
    { stdio: "pipe", encoding: "utf8" },
  );
  if (sign.status !== 0) {
    console.warn(
      "Could not ad-hoc sign Electron.app (Gatekeeper may still block).",
      sign.stderr?.trim(),
    );
  }
}

if (!existsSync(electronBin)) {
  console.log("Electron binary missing (macOS may have moved it to Bin). Reinstalling…");
  const rebuild = spawnSync("npm", ["rebuild", "electron", "-w", "typefolio-desktop"], {
    cwd: monorepoRoot,
    stdio: "inherit",
  });
  if (rebuild.status !== 0) {
    process.exit(rebuild.status ?? 1);
  }
}

if (!existsSync(electronBin)) {
  console.error(
    "Electron still missing. Run from repo root:\n  npm rebuild electron -w typefolio-desktop",
  );
  process.exit(1);
}

prepareMacBinary();
