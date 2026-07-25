import assert from "node:assert/strict";
import fs from "node:fs";
import { Window } from "happy-dom";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const config = fs.readFileSync(new URL("../config.ini", import.meta.url), "utf8");
const liveTimers = fs.readFileSync(new URL("../live-timers.ini", import.meta.url), "utf8");
const moduleScript = /<script\s+type="module"\s+src="assets\/js\/app\.js"\s+id="appModuleScript"><\/script>/;
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

const applicationSource = fs.readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");
assert.match(applicationSource, /11806s/, "new Gate of Memory interval is compiled into migrations");
assert.doesNotMatch(applicationSource, /row\.innerHTML\s*=\s*""\s*\+\s*"<div class=\\"current-event/, "current events avoid imported HTML");
assert.match(config, /\[timer:archboss_eu\][\s\S]*?rules=0 22 \* \* 2 \|\| 0 19,22 \* \* 3,6/, "Archboss weekly schedule");
assert.match(config, /\[timer:boonstones_eu\][\s\S]*?rules=0 21 \* \* 1,5/, "Boonstone weekly schedule");
assert.match(config, /\[timer:riftstones_eu\][\s\S]*?rules=0 21 \* \* 2,6/, "Riftstone weekly schedule");
assert.match(config, /\[timer:innerspace_guild_boss\][\s\S]*?rules=10 20 \* \* 4/, "Guild Raid weekly schedule");
assert.match(config, /\[timer:interserver_eu\][\s\S]*?rules=30 21 \* \* 5,6/, "conditional Interserver schedule");
assert.match(config, /\[timer:gate_memory_eu\][\s\S]*?notifications\.warning\.seconds=360[\s\S]*?notifications\.critical\.seconds=120/, "Gate reminders allow login and travel time");
assert.match(liveTimers, /rules=@every 11806s[\s\S]*?anchorUtc=2026-07-24T14:56:16Z[\s\S]*?durationMinutes=4/, "Gate live values");

console.log("runtime smoke: modules, cards, panels, schedules, consent, localization and XSS guard OK");
await window.happyDOM.cancelAsync();
window.close();
