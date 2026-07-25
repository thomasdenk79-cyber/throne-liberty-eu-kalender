import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ConfigValidationError,
  normalizeConfig,
  notificationSettings,
  parseIniConfig,
  serializeIniConfig
} from "../assets/js/config.js";
import {
  calculateTimerOccurrences,
  intervalSecondsFromRules,
  validateScheduleRule
} from "../assets/js/schedule.js";
import {
  normalizeSoundId,
  scheduleNotificationSound,
  soundDurationSeconds
} from "../assets/js/sounds.js";
import { buildIcs } from "../assets/js/ics.js";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const configText = fs.readFileSync(path.join(root, "config.ini"), "utf8");
const config = normalizeConfig(
  parseIniConfig(configText, { source: "config.ini" }),
  { source: "config.ini" }
);
assert(config.categories.length >= 2, "checked-in categories validate");
assert(config.timers.length >= 10, "checked-in timers validate");

assert.throws(
  () => parseIniConfig("[meta]\nschemaVersion=5\nbogus=true", { source: "bad.ini" }),
  (error) => error instanceof ConfigValidationError
    && error.message.includes("line 3")
    && error.message.includes("unknown key"),
  "unknown INI keys include source-line details"
);

const unsafe = structuredClone(config);
unsafe.timers[0].image = "https://tracking.example/image.webp";
assert.throws(
  () => normalizeConfig(unsafe, { source: "unsafe.ini" }),
  /safe local assets path/,
  "remote or unsafe image paths are rejected"
);

const roundTrip = parseIniConfig(serializeIniConfig(config), { source: "round-trip.ini" });
assert.equal(roundTrip.timers[0].notifications.warning.durationSeconds, 10, "sound duration survives INI round-trip");
assert.equal(notificationSettings({ critical: { sound: "urgent" } }).critical.sound, "neon", "legacy sounds map to curated equivalents");
assert.equal(normalizeSoundId("warhorn"), "action", "legacy action sound remains compatible");
assert.equal(soundDurationSeconds(90), 10, "sound duration rejects values above the limit");

validateScheduleRule("30 1,12,17 * * 1-5");
validateScheduleRule("@every 11806s");
assert.throws(() => validateScheduleRule("99 25 * * 9"), /outside/, "invalid cron ranges are rejected");
assert.equal(intervalSecondsFromRules(["@every 14d"]), 1209600, "day intervals convert to seconds");
const occurrences = calculateTimerOccurrences({
  rules: ["0 20 * * 4"],
  durationMinutes: 10
}, { timezone: "Europe/Berlin" }, 2, {
  nowMs: Date.parse("2026-07-20T00:00:00Z"),
  fallbackTimeZone: "Europe/Berlin"
});
assert.equal(occurrences.length, 2, "cron scheduling returns deterministic future occurrences");

const fakeStops = [];
const fakeContext = {
  currentTime: 0,
  destination: {},
  createOscillator() {
    return {
      type: "",
      frequency: {
        setValueAtTime() {},
        exponentialRampToValueAtTime() {}
      },
      connect() {},
      start() {},
      stop(value) { fakeStops.push(value); }
    };
  },
  createGain() {
    return {
      gain: {
        setValueAtTime() {},
        exponentialRampToValueAtTime() {}
      },
      connect() {}
    };
  }
};
scheduleNotificationSound(fakeContext, "vortex", 2);
assert(fakeStops.length > 0, "curated sound schedules audio nodes");
assert(Math.max(...fakeStops) <= 2.06, "sound scheduling respects the requested duration");

const ics = buildIcs([{
  start: Date.parse("2026-07-24T12:00:00Z"),
  timer: {
    id: "test",
    durationMinutes: 10,
    name: { de: "Test, Event" },
    description: { de: "Line 1\nLine 2" }
  }
}]);
assert.match(ics, /SUMMARY:Test\\, Event/, "ICS commas are escaped");
assert.match(ics, /DESCRIPTION:Line 1\\nLine 2/, "ICS newlines are escaped");

const appSource = fs.readFileSync(path.join(root, "assets", "js", "app.js"), "utf8");
const assetReferences = [
  ...config.timers.map((timer) => timer.image).filter(Boolean),
  ...Array.from(appSource.matchAll(/["'](assets\/[^"']+\.(?:avif|gif|jpe?g|png|webp))["']/gi), (match) => match[1])
];
for (const reference of new Set(assetReferences)) {
  assert(fs.existsSync(path.join(root, reference)), `referenced asset exists: ${reference}`);
}

console.log("module smoke: strict INI, schedules, sounds, ICS and assets OK");
