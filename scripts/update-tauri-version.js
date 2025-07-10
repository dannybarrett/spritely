// scripts/update-tauri-version.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const packageJsonPath = path.resolve(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const newVersion = packageJson.version;

  const tauriConfigPath = path.resolve(
    __dirname,
    "..",
    "src-tauri",
    "tauri.conf.json"
  );
  let tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));

  // Update the top-level version property
  tauriConfig.version = newVersion;

  fs.writeFileSync(
    tauriConfigPath,
    JSON.stringify(tauriConfig, null, 2) + "\n", // Add a newline at the end
    "utf8"
  );

  const cargoPath = path.resolve(__dirname, "..", "src-tauri", "Cargo.toml");
  let cargo = JSON.parse(fs.readFileSync(cargoPath, "utf8"));
  cargo.version = newVersion;

  fs.writeFileSync(
    cargoPath,
    JSON.stringify(cargo, null, 2) + "\n", // Add a newline at the end
    "utf8"
  );

  console.log(
    `Updated tauri.conf.json and Cargo.toml to version ${newVersion}`
  );
} catch (error) {
  console.error("Failed to update tauri.conf.json:", error);
  process.exit(1);
}
