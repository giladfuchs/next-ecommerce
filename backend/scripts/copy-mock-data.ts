const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const src = path.join(root, "scripts", "mock-data.json");
const destDir = path.join(root, "dist", "scripts");
const dest = path.join(destDir, "mock-data.json");

if (!fs.existsSync(src)) {
  throw new Error(`mock-data.json not found at: ${src}`);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);

