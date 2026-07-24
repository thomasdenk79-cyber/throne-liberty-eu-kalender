import assert from "node:assert/strict";
import fs from "node:fs";
import { Window } from "happy-dom";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const config = fs.readFileSync(new URL("../config.ini", import.meta.url), "utf8");
const liveTimers = fs.readFileSync(new URL("../live-timers.ini", import.meta.url), "utf8");
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/);
assert(scriptMatch, "inline application script exists");

const window = new Window({
  url: "https://example.test/",
  settings: { disableJavaScriptEvaluation: false }
});
window.document.write(html.replace(scriptMatch[0], "</body>"));
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

window.fetch = async (resource) => {
  const url = String(resource);
  const body = url.includes("live-timers.ini") ? liveTimers : config;
  return { ok: true, text: async () => body };
};
window.matchMedia ||= () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {}
});
window.Notification = class {
  static permission = "default";
  static requestPermission = async () => "denied";
};

window.eval(scriptMatch[1]);
await new Promise((resolve) => setTimeout(resolve, 150));

assert.equal(window.document.querySelector("#xssProbe"), null, "imported INI values never become HTML");
assert.match(window.document.body.textContent, /<img id="xssProbe"/, "untrusted name is rendered as text");
assert(window.document.querySelectorAll("#cardStack .card").length >= 4, "timer cards render");
const firstCardBeforeTick = window.document.querySelector("#cardStack .card");
await new Promise((resolve) => setTimeout(resolve, 1100));
assert.equal(window.document.querySelector("#cardStack .card"), firstCardBeforeTick, "second tick updates cards without rebuilding DOM");
assert.equal(window.document.querySelectorAll("#cardStack .edit-btn").length, 0, "status cards stay edit-free");
assert(window.document.querySelectorAll("#timerToggle .toggle-edit").length >= 4, "timer selection exposes compact edit actions");
assert.equal(window.document.querySelectorAll("#themeSelect option").length, 6, "theme worlds are selectable");
assert.equal(window.document.querySelectorAll("#cardDensitySelect option").length, 5, "all density modes are selectable");
assert(window.document.querySelectorAll("#calendarGroups .calendar-group").length >= 4, "calendar groups render");
assert.equal(window.document.documentElement.lang, "en", "stored language is applied");
assert.equal(window.document.querySelector("#storageConsent").open, false, "accepted consent is not shown again");

const exportedScript = scriptMatch[1];
assert.match(exportedScript, /11806s/, "new Gate of Memory interval is compiled into migrations");
assert.doesNotMatch(exportedScript, /row\.innerHTML\s*=\s*""\s*\+\s*"<div class=\\"current-event/, "current events avoid imported HTML");
assert.match(config, /\[timer:archboss_eu\][\s\S]*?rules=0 22 \* \* 2 \|\| 0 19,22 \* \* 3,6/, "Archboss weekly schedule");
assert.match(config, /\[timer:boonstones_eu\][\s\S]*?rules=0 21 \* \* 1,5/, "Boonstone weekly schedule");
assert.match(config, /\[timer:riftstones_eu\][\s\S]*?rules=0 21 \* \* 2,6/, "Riftstone weekly schedule");
assert.match(config, /\[timer:innerspace_guild_boss\][\s\S]*?rules=10 20 \* \* 4/, "Guild Raid weekly schedule");
assert.match(config, /\[timer:interserver_eu\][\s\S]*?rules=30 21 \* \* 5,6/, "conditional Interserver schedule");
assert.match(config, /\[timer:gate_memory_eu\][\s\S]*?notifications\.warning\.seconds=360[\s\S]*?notifications\.critical\.seconds=120/, "Gate reminders allow login and travel time");
assert.match(liveTimers, /rules=@every 11806s[\s\S]*?anchorUtc=2026-07-24T14:56:16Z[\s\S]*?durationMinutes=4/, "Gate live values");

console.log("runtime smoke: cards, schedules, calendar, consent, localization and XSS guard OK");
await window.happyDOM.cancelAsync();
window.close();
