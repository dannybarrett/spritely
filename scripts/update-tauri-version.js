// scripts/update-tauri-version.js
const fs = require("node:fs");
const path = require("node:path");

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

  if (tauriConfig.package && tauriConfig.package.version) {
    tauriConfig.package.version = newVersion;
  } else {
    // If 'package' or 'version' doesn't exist, create it
    tauriConfig.package = { version: newVersion };
  }

  fs.writeFileSync(
    tauriConfigPath,
    JSON.stringify(tauriConfig, null, 2),
    "utf8"
  );

  console.log(`Updated tauri.conf.json to version: ${newVersion}`);
} catch (error) {
  console.error("Failed to update tauri.conf.json:", error);
  process.exit(1); // Exit with error code
}
