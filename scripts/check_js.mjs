import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const targets = [
  path.join(root, "service-worker.js"),
  ...fs.readdirSync(path.join(root, "assets", "js"))
    .filter((name) => name.endsWith(".js"))
    .map((name) => path.join(root, "assets", "js", name)),
  ...fs.readdirSync(path.join(root, "tests"))
    .filter((name) => name.endsWith(".mjs"))
    .map((name) => path.join(root, "tests", name))
];

for (const target of targets) {
  const result = spawnSync(process.execPath, ["--check", target], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}

JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
console.log(`source check: ${targets.length} JavaScript files and manifest syntax OK`);
