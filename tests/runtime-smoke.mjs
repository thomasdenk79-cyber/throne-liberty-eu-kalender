import assert from "node:assert/strict";
import fs from "node:fs";
import { Window } from "happy-dom";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const config = fs.readFileSync(new URL("../config.ini", import.meta.url), "utf8");
const liveTimers = fs.readFileSync(new URL("../live-timers.ini", import.meta.url), "utf8");
const moduleScript = /<script\s+type="module"\s+src="assets\/js\/app\.js(?:\?v=[^"]+)?"\s+id="appModuleScript"><\/script>/;
assert.match(html, moduleScript, "external application module exists");
assert.match(
  html,
  /appModuleScript"\)[\s\S]*addEventListener\("error"/,
  "classic fallback script reacts if the module fails to load (e.g. file:// CORS block)"
);

const window = new Window({
  url: "https://example.test/",
  settings: { disableJavaScriptEvaluation: false }
});
window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {}
});
window.Notification = class {
  static permission = "default";
  static requestPermission = async () => "denied";
};
window.fetch = async (resource) => {
  const url = String(resource);
  if (url.includes("countapi.mileshilliard.com")) {
    return { ok: true, status: 200, json: async () => ({ value: "42" }) };
  }
  const body = url.includes("live-timers.ini") ? liveTimers : config;
  return { ok: true, status: 200, text: async () => body };
};
window.document.write(html.replace(moduleScript, ""));
window.localStorage.setItem("timer_storage_consent_v1", "accepted");
window.localStorage.setItem("timer_language", "en");
window.localStorage.setItem("timer_local_config", JSON.stringify({
  categories: [],
  timers: [{
    id: "archboss_eu",
    categoryId: "tl_eu",
    name: {
      de: "Archboss",
      en: "<img id=\"xssProbe\" src=x onerror=alert(1)>",
      bar: "Archboss"
    }
  }]
}));

Object.assign(globalThis, {
  window,
  document: window.document,
  location: window.location,
  localStorage: window.localStorage,
  matchMedia: window.matchMedia,
  Notification: window.Notification,
  fetch: window.fetch,
  CSS: window.CSS,
  ResizeObserver: window.ResizeObserver
});
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: window.navigator
});

await import(new URL("../assets/js/app.js", import.meta.url));
await new Promise((resolve) => setTimeout(resolve, 200));

assert.equal(window.document.querySelector("#startupError").hidden, true, "application starts without a visible error");
assert.equal(window.document.querySelector("#xssProbe"), null, "stored values never become HTML");
assert.match(window.document.body.textContent, /<img id="xssProbe"/, "untrusted name is rendered as text");
assert(window.document.querySelectorAll("#cardStack .card").length >= 4, "timer cards render");
const firstCardBeforeTick = window.document.querySelector("#cardStack .card");
await new Promise((resolve) => setTimeout(resolve, 1100));
assert.equal(window.document.querySelector("#cardStack .card"), firstCardBeforeTick, "second tick updates cards without rebuilding DOM");
assert.equal(window.document.querySelectorAll("#cardStack .edit-btn").length, 0, "status cards stay edit-free");
assert(window.document.querySelectorAll("#timerToggle .toggle-edit").length >= 4, "timer selection exposes compact edit actions");
assert.equal(window.document.querySelectorAll("#themeSelect option").length, 6, "theme worlds are selectable");
assert.equal(window.document.querySelectorAll("#cardDensitySelect option").length, 6, "all density modes are selectable");
assert.equal(window.document.querySelectorAll("#dockPad [data-dock-side]").length, 8, "dock pad exposes all eight positions");
assert.equal(window.document.querySelectorAll("#imageZoomSelect option").length, 5, "all hover-preview sizes are selectable");
assert.equal(window.document.querySelectorAll("#editNotifyWarningSound option").length, 11, "ten curated sounds plus silent mode are selectable");
assert(window.document.querySelector("#editNotifyWarningDuration"), "warning sound duration is editable");
assert(window.document.querySelector("#editNotifyCriticalDuration"), "critical sound duration is editable");
assert(window.document.querySelector("#settingsPanel"), "settings panel exists");
assert(window.document.querySelector("#gateSyncDialog"), "Gate timer can be corrected locally from a dedicated dialog");
assert(window.document.querySelector("#gateSyncOpenBtn"), "Gate sync dialog has a visible entry point");
window.document.querySelector("#gateSyncOpenBtn").click();
const knownStart = new Date(Date.now() - 60 * 60 * 1000);
const knownParts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
}).formatToParts(knownStart).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
window.document.querySelector("#gateSyncDate").value = `${knownParts.year}-${knownParts.month}-${knownParts.day}`;
window.document.querySelector("#gateSyncTime").value = `${knownParts.hour}:${knownParts.minute}:${knownParts.second}`;
window.document.querySelector("#gateSyncTimezone").value = "Europe/Berlin";
window.document.querySelector("#gateSyncSubmitBtn").click();
assert.equal(window.document.querySelector("#gateSyncDialog").open, false, "valid last-known Gate time closes the sync dialog");
const locallySyncedGate = JSON.parse(window.localStorage.getItem("timer_local_config"))
  .timers.find((timer) => timer.id === "gate_memory_eu");
assert.deepEqual(locallySyncedGate.rules, ["@every 11806s"], "local Gate correction keeps the exact interval");
assert.equal(locallySyncedGate.liveSourceUrl, "local-user", "local Gate correction records its source");
assert.equal(window.document.querySelector("#settingsPanel").hidden, false, "settings panel is always visible (v3.2 layout)");
assert.equal(window.document.querySelector("#settingsPopover").open, false, "secondary settings popover starts closed");
window.document.querySelector("#settingsToggleBtn").click();
assert.equal(window.document.querySelector("#settingsPopover").open, true, "gear button opens the secondary settings popover");
window.document.querySelector("#settingsPopoverCloseBtn").click();
assert.equal(window.document.querySelector("#settingsPopover").open, false, "close button closes the secondary settings popover");
assert(window.document.querySelector("#liveCollapseBtn"), "main timer module is collapsible");
assert(window.document.querySelector("#calendarCollapseBtn"), "calendar module is collapsible");
assert.equal(window.document.querySelector("#dockSideSelect"), null, "dock dropdown is replaced by direct controls");
assert(window.document.querySelectorAll("#calendarGroups .calendar-group").length >= 4, "calendar groups render");
assert.equal(window.document.documentElement.lang, "en", "stored language is applied");
assert.equal(window.document.querySelector("#storageConsent").open, false, "accepted consent is not shown again");
assert.match(window.document.querySelector("#visitorCounter").textContent, /42/, "visitor counter uses the replacement CountAPI response");

const applicationSource = fs.readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");
assert.match(applicationSource, /11806s/, "new Gate of Memory interval is compiled into migrations");
assert.match(applicationSource, /countapi\.mileshilliard\.com\/api\/v1/, "visitor counter no longer calls the unavailable countapi.xyz service");
assert.doesNotMatch(applicationSource, /row\.innerHTML\s*=\s*""\s*\+\s*"<div class=\\"current-event/, "current events avoid imported HTML");
assert.match(config, /\[timer:archboss_eu\][\s\S]*?rules=0 22 \* \* 2 \|\| 0 19,22 \* \* 3,6/, "Archboss weekly schedule");
assert.match(config, /\[timer:boonstones_eu\][\s\S]*?rules=0 21 \* \* 1,5/, "Boonstone weekly schedule");
assert.match(config, /\[timer:riftstones_eu\][\s\S]*?rules=0 21 \* \* 2,6/, "Riftstone weekly schedule");
assert.match(config, /\[timer:innerspace_guild_boss\][\s\S]*?rules=10 20 \* \* 4/, "Guild Raid weekly schedule");
assert.match(config, /\[timer:interserver_eu\][\s\S]*?rules=30 21 \* \* 5,6/, "conditional Interserver schedule");
assert.match(config, /\[timer:gate_memory_eu\][\s\S]*?notifications\.warning\.seconds=360[\s\S]*?notifications\.critical\.seconds=120/, "Gate reminders allow login and travel time");
assert.match(liveTimers, /rules=@every 11806s[\s\S]*?anchorUtc=2026-08-09T12:58:16Z[\s\S]*?durationMinutes=4/, "Gate live values");

const galleryImages = () => Array.from(window.document.querySelectorAll('#galleryGrid img'));
assert.equal(galleryImages().length, 3, 'new artwork is visible without filling the page with the entire archive');
assert.equal(window.document.querySelectorAll('#worldNav button').length, 6, 'all existing themes have direct controls');
window.document.querySelector('#worldNav [data-world="time-vortex"]').click();
assert.equal(window.document.documentElement.dataset.theme, 'time-vortex', 'world controls change the actual app theme');
assert.equal(window.localStorage.getItem('timer_theme'), 'time-vortex', 'world controls respect existing consent-aware persistence');
window.document.querySelector('#galleryFilters [data-group="all"]').click();
assert(galleryImages().length > 30, 'the complete existing art collection is accessible');
const sources = galleryImages().map(img => img.getAttribute('src'));
assert.equal(new Set(sources).size, sources.length, 'gallery never duplicates artwork also used by timer cards');
for (const src of sources) assert(fs.existsSync(new URL('../' + src, import.meta.url)), `gallery asset exists: ${src}`);
window.document.querySelector('#galleryFilters [data-group="fresh"]').click();
window.document.querySelector('#galleryGrid button').click();
assert.equal(window.document.querySelector('#imageLightbox').open, true, 'gallery opens the existing accessible image dialog');
const firstArt = window.document.querySelector('#imageLightboxImage').src;
window.document.querySelector('#galleryNext').click();
assert.notEqual(window.document.querySelector('#imageLightboxImage').src, firstArt, 'next artwork changes the image');
window.document.querySelector('#galleryPrev').click();
assert.equal(window.document.querySelector('#imageLightboxImage').src, firstArt, 'previous artwork restores it');
window.document.querySelector('#galleryPlay').click();
assert.equal(window.document.querySelector('#galleryPlay').getAttribute('aria-pressed'), 'true', 'slideshow is explicitly enabled');
window.document.querySelector('#imageLightboxCloseBtn').click();
await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(window.document.querySelector('#galleryPlay').getAttribute('aria-pressed'), 'false', 'closing the dialog stops the slideshow');
window.document.querySelector('#heroArtBtn').click();
assert.equal(window.document.querySelector('#imageLightbox').open, true, 'hero artwork can be inspected at full size');
assert.equal(window.document.querySelector('#galleryNext').hidden, true, 'standalone hero preview does not retain gallery controls');
window.document.querySelector('#imageLightboxCloseBtn').click();

console.log("runtime smoke: modules, cards, panels, schedules, consent, localization, gallery and XSS guard OK");
await window.happyDOM.cancelAsync();
window.close();
