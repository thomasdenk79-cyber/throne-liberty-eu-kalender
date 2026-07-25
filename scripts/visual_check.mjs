// Visuelle Prüfung per echtem Headless-Chromium (Playwright).
//
// Warum es das gibt: DOM-basierte Smoke-Tests (happy-dom, Kartenanzahl,
// Fehler-Listener) koennen gruen sein, obwohl die Seite fuer echte
// Besucher:innen visuell kaputt aussieht (z. B. durch Service-Worker-Cache,
// CSS-Fehler, Layout-Verschiebungen). Dieses Skript macht Screenshots der
// echten gerenderten Seite, damit ein Agent (oder Mensch) das Ergebnis mit
// eigenen Augen pruefen kann, statt sich nur auf Zaehl-Assertions zu
// verlassen.
//
// Nutzung:
//   npm run visual:local   -> startet einen lokalen Static-Server und
//                             fotografiert die Seite aus dem Arbeitsbaum
//   npm run visual:live    -> fotografiert die aktuell live deployte Seite
//   node scripts/visual_check.mjs --url=https://example.org/ --label=custom
//
// Ergebnis liegt in tests/visual-baselines/<label>-<viewport>.png (wird bei
// jedem Lauf ueberschrieben) sowie einer datierten Kopie in
// tests/visual-baselines/history/ zur Nachverfolgung ueber die Zeit.
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const outDir = path.join(root, "tests", "visual-baselines");
const historyDir = path.join(outDir, "history");
fs.mkdirSync(historyDir, { recursive: true });

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const [key, ...rest] = arg.slice(2).split("=");
      return [key, rest.join("=") || "true"];
    })
);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ini": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function startLocalServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURIComponent(req.url.split("?")[0]);
      if (reqPath === "/") reqPath = "/index.html";
      const filePath = path.join(root, reqPath);
      if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function captureViewport(page, label, name, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(600);
  const target = path.join(outDir, `${label}-${name}.png`);
  await page.screenshot({ path: target, fullPage: true });
  const dated = path.join(historyDir, `${label}-${name}-${new Date().toISOString().replace(/[:.]/g, "-")}.png`);
  fs.copyFileSync(target, dated);
  console.log(`saved ${path.relative(root, target)}`);
}

async function main() {
  const isLive = args.target === "live" || Boolean(args.url);
  const label = args.label || (isLive ? "live" : "local");
  let server = null;
  let baseUrl = args.url;
  if (!baseUrl) {
    server = await startLocalServer();
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}/`;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  const failedRequests = [];
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
  });

  await page.goto(baseUrl + (baseUrl.includes("?") ? "&" : "?") + "cachebust=" + Date.now(), {
    waitUntil: "networkidle"
  });
  await page.waitForTimeout(1200);
  await page.click("#storageAcceptBtn").catch(() => {});
  await page.waitForTimeout(800);

  await captureViewport(page, label, "desktop", { width: 1400, height: 1000 });
  await captureViewport(page, label, "mobile", { width: 390, height: 844 });

  await browser.close();
  if (server) server.close();

  console.log(`console errors: ${consoleErrors.length}`);
  if (consoleErrors.length) console.log(JSON.stringify(consoleErrors, null, 2));
  console.log(`failed requests (>=400): ${failedRequests.length}`);
  if (failedRequests.length) console.log(JSON.stringify(failedRequests, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
