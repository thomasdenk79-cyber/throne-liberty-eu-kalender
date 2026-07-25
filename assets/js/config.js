import { isValidTimeZone, validateScheduleRule } from "./schedule.js";
import { normalizeSoundId, soundDurationSeconds } from "./sounds.js";

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const IMAGE_PATTERN = /^assets\/[A-Za-z0-9_./-]+\.(?:avif|gif|jpe?g|png|webp)$/i;
const SETTINGS_KEYS = new Set([
  "language", "displayTimezone", "categoryId", "visibleTimerIds", "dockSide",
  "editorSide", "historyMinutes", "historyCollapsed", "cardDensity", "theme",
  "notificationOverride", "colorblindMode", "showThumbnails", "imageZoom",
  "liveCollapsed", "calendarCollapsed"
]);
const CATEGORY_KEYS = new Set([
  "label.de", "label.en", "label.bar", "region", "timezone"
]);
const TIMER_KEYS = new Set([
  "categoryId", "name.de", "name.en", "name.bar", "description.de",
  "description.en", "description.bar", "motif", "image", "timezone",
  "durationMinutes", "activeFrom", "activeUntil", "rules", "anchorUtc",
  "notifications.enabled", "notifications.minutes", "notifications.channels",
  "notifications.warning.enabled", "notifications.warning.seconds",
  "notifications.warning.sound", "notifications.warning.durationSeconds",
  "notifications.critical.enabled", "notifications.critical.seconds",
  "notifications.critical.sound", "notifications.critical.durationSeconds"
]);
const LIVE_TIMER_KEYS = new Set([
  "rules", "anchorUtc", "durationMinutes", "verifiedAt", "sourceUrl"
]);

export class ConfigValidationError extends Error {
  constructor(source, issues) {
    super(`${source} is invalid:\n- ${issues.join("\n- ")}`);
    this.name = "ConfigValidationError";
    this.source = source;
    this.issues = issues;
  }
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function positiveSeconds(value, fallback) {
  const seconds = Math.round(Number(value));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : fallback;
}

export function notificationSettings(timerOrNotifications, fallbackWarning = 300, fallbackCritical = 60) {
  const notifications = timerOrNotifications?.notifications || timerOrNotifications || {};
  const legacyMinutes = Array.from(new Set((notifications.minutes || [])
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)))
    .sort((left, right) => right - left);
  const legacyEnabled = notifications.enabled !== false;
  const legacyHasSound = (notifications.channels || []).includes("beep");
  const warningSeconds = positiveSeconds(
    notifications.warning?.seconds,
    Math.round((legacyMinutes[0] || fallbackWarning / 60) * 60)
  );
  const derivedCriticalMinutes = legacyMinutes.length > 1
    ? legacyMinutes[legacyMinutes.length - 1]
    : Math.max(0.5, Math.min((legacyMinutes[0] || fallbackWarning / 60) / 5, 2));
  const criticalSeconds = positiveSeconds(
    notifications.critical?.seconds,
    Math.round(derivedCriticalMinutes * 60) || fallbackCritical
  );
  return {
    channels: (notifications.channels || ["popup"])
      .filter((channel) => ["browser", "popup"].includes(channel)),
    warning: {
      enabled: notifications.warning?.enabled ?? legacyEnabled,
      seconds: warningSeconds,
      sound: normalizeSoundId(
        notifications.warning?.sound,
        legacyHasSound ? "gentle" : "none"
      ),
      durationSeconds: soundDurationSeconds(notifications.warning?.durationSeconds, 10)
    },
    critical: {
      enabled: notifications.critical?.enabled ?? legacyEnabled,
      seconds: criticalSeconds,
      sound: normalizeSoundId(
        notifications.critical?.sound,
        legacyHasSound ? "neon" : "none"
      ),
      durationSeconds: soundDurationSeconds(notifications.critical?.durationSeconds, 10)
    }
  };
}

export function mergeConfig(baseConfig, localConfig) {
  const merged = clone(baseConfig);
  const categoryMap = new Map(merged.categories.map((category) => [category.id, category]));
  const timerMap = new Map(merged.timers.map((timer) => [timer.id, timer]));

  for (const category of localConfig?.categories || []) {
    if (category.deleted) categoryMap.delete(category.id);
    else categoryMap.set(category.id, clone(category));
  }
  for (const timer of localConfig?.timers || []) {
    if (timer.deleted) {
      timerMap.delete(timer.id);
      continue;
    }
    const baseTimer = timerMap.get(timer.id);
    const localTimer = clone(timer);
    timerMap.set(timer.id, {
      ...(baseTimer || {}),
      ...localTimer,
      image: localTimer.image || baseTimer?.image || ""
    });
  }

  const validCategoryIds = new Set(categoryMap.keys());
  for (const [timerId, timer] of timerMap) {
    if (!validCategoryIds.has(timer.categoryId)) timerMap.delete(timerId);
  }

  return {
    schemaVersion: baseConfig.schemaVersion || 5,
    categories: Array.from(categoryMap.values()),
    timers: Array.from(timerMap.values())
  };
}

function validDate(value) {
  return !value || Number.isFinite(Date.parse(value));
}

function validateTextMap(value, path, issues, required = true) {
  if (!value || typeof value !== "object") {
    if (required) issues.push(`${path} must contain localized text`);
    return;
  }
  const entries = ["de", "en", "bar"].map((language) => String(value[language] || "").trim());
  if (required && !entries.some(Boolean)) issues.push(`${path} must not be empty`);
  if (entries.some((entry) => entry.length > 500)) issues.push(`${path} entries must not exceed 500 characters`);
}

export function normalizeConfig(raw, options = {}) {
  const source = options.source || "Timer configuration";
  const issues = [];
  if (!raw || typeof raw !== "object") {
    throw new ConfigValidationError(source, ["configuration root must be an object"]);
  }
  if (!Array.isArray(raw.categories)) issues.push("categories must be an array");
  if (!Array.isArray(raw.timers)) issues.push("timers must be an array");
  if (issues.length) throw new ConfigValidationError(source, issues);

  const normalized = clone(raw);
  normalized.schemaVersion = Number(normalized.schemaVersion) || 5;
  const categoryIds = new Set();
  for (const [index, category] of normalized.categories.entries()) {
    const path = `category ${index + 1}`;
    if (!category || typeof category !== "object") {
      issues.push(`${path} must be an object`);
      continue;
    }
    if (!IDENTIFIER_PATTERN.test(category.id || "")) {
      issues.push(`${path} has invalid id "${category.id || ""}"`);
    } else if (categoryIds.has(category.id)) {
      issues.push(`category id "${category.id}" is duplicated`);
    } else {
      categoryIds.add(category.id);
    }
    validateTextMap(category.label, `${path} label`, issues);
    if (!isValidTimeZone(category.timezone)) {
      issues.push(`${path} has unsupported timezone "${category.timezone || ""}"`);
    }
  }
  if (!normalized.categories.length && !options.allowEmpty) {
    issues.push("at least one category is required");
  }

  const timerIds = new Set();
  for (const [index, timer] of normalized.timers.entries()) {
    const path = `timer ${index + 1}`;
    if (!timer || typeof timer !== "object") {
      issues.push(`${path} must be an object`);
      continue;
    }
    if (!IDENTIFIER_PATTERN.test(timer.id || "")) {
      issues.push(`${path} has invalid id "${timer.id || ""}"`);
    } else if (timerIds.has(timer.id)) {
      issues.push(`timer id "${timer.id}" is duplicated`);
    } else {
      timerIds.add(timer.id);
    }
    if (!categoryIds.has(timer.categoryId)) {
      issues.push(`${path} references missing category "${timer.categoryId || ""}"`);
    }
    validateTextMap(timer.name, `${path} name`, issues);
    validateTextMap(timer.description, `${path} description`, issues, false);
    if (timer.timezone && !isValidTimeZone(timer.timezone)) {
      issues.push(`${path} has unsupported timezone "${timer.timezone}"`);
    }
    const duration = Number(timer.durationMinutes);
    if (!Number.isFinite(duration) || duration < 1 || duration > 1440) {
      issues.push(`${path} durationMinutes must be between 1 and 1440`);
    }
    if (!validDate(timer.activeFrom)) issues.push(`${path} activeFrom is not a valid ISO date`);
    if (!validDate(timer.activeUntil)) issues.push(`${path} activeUntil is not a valid ISO date`);
    if (timer.activeFrom && timer.activeUntil && Date.parse(timer.activeFrom) > Date.parse(timer.activeUntil)) {
      issues.push(`${path} activeFrom must be before activeUntil`);
    }
    if (timer.anchorUtc && !validDate(timer.anchorUtc)) {
      issues.push(`${path} anchorUtc is not a valid ISO date`);
    }
    if (timer.image && (!IMAGE_PATTERN.test(timer.image) || timer.image.includes(".."))) {
      issues.push(`${path} image must be a safe local assets path`);
    }
    if (timer.motif && (
      String(timer.motif).length > 1200
      || /(?:url\s*\(|@import|expression\s*\(|;)/i.test(timer.motif)
    )) {
      issues.push(`${path} motif contains unsafe CSS`);
    }
    if (!Array.isArray(timer.rules) || !timer.rules.length) {
      issues.push(`${path} must contain at least one schedule rule`);
    } else {
      const intervalRules = timer.rules.filter((rule) => /^@every\s+/i.test(rule));
      if (intervalRules.length && intervalRules.length !== timer.rules.length) {
        issues.push(`${path} must not mix interval and cron rules`);
      }
      for (const [ruleIndex, rule] of timer.rules.entries()) {
        try {
          validateScheduleRule(rule);
        } catch (error) {
          issues.push(`${path} rule ${ruleIndex + 1}: ${error.message}`);
        }
      }
      if (intervalRules.length && !validDate(timer.anchorUtc || timer.activeFrom)) {
        issues.push(`${path} interval schedule requires a valid anchorUtc or activeFrom`);
      }
    }
    timer.notifications = notificationSettings(timer);
  }

  if (normalized.settings?.displayTimezone
    && !isValidTimeZone(normalized.settings.displayTimezone)) {
    issues.push(`settings displayTimezone "${normalized.settings.displayTimezone}" is unsupported`);
  }
  if (issues.length) throw new ConfigValidationError(source, issues);
  return normalized;
}

function parseIniBoolean(value, fallback = false) {
  if (value == null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parseIniList(value, separator = ",") {
  if (!value) return [];
  return String(value).split(separator).map((item) => item.trim()).filter(Boolean);
}

function allowedKeysForSection(sectionName, liveOverlay) {
  if (sectionName === "meta") {
    return liveOverlay ? new Set(["generatedAt", "sourceUrl"]) : new Set(["schemaVersion"]);
  }
  if (sectionName === "settings") return SETTINGS_KEYS;
  if (sectionName.startsWith("category:")) return CATEGORY_KEYS;
  if (sectionName.startsWith("timer:")) return liveOverlay ? LIVE_TIMER_KEYS : TIMER_KEYS;
  return null;
}

function parseIni(text, options = {}) {
  const source = options.source || "INI configuration";
  const sections = new Map();
  const issues = [];
  let currentSection = "";
  const lines = String(text || "").split(/\r?\n/);

  for (const [lineIndex, rawLine] of lines.entries()) {
    const lineNumber = lineIndex + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith(";") || line.startsWith("#")) continue;
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      if (!allowedKeysForSection(currentSection, options.liveOverlay)) {
        issues.push(`line ${lineNumber}: unknown section [${currentSection}]`);
      }
      if (sections.has(currentSection)) {
        issues.push(`line ${lineNumber}: duplicate section [${currentSection}]`);
      } else {
        sections.set(currentSection, {});
      }
      continue;
    }
    if (line.startsWith("[") || line.endsWith("]")) {
      issues.push(`line ${lineNumber}: malformed section header`);
      continue;
    }
    const equalsIndex = line.indexOf("=");
    if (equalsIndex < 1) {
      issues.push(`line ${lineNumber}: expected key=value`);
      continue;
    }
    if (!currentSection) {
      issues.push(`line ${lineNumber}: key appears before a section`);
      continue;
    }
    const key = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim();
    const allowedKeys = allowedKeysForSection(currentSection, options.liveOverlay);
    if (allowedKeys && !allowedKeys.has(key)) {
      issues.push(`line ${lineNumber}: unknown key "${key}" in [${currentSection}]`);
    }
    const sectionData = sections.get(currentSection) || {};
    if (Object.hasOwn(sectionData, key)) {
      issues.push(`line ${lineNumber}: duplicate key "${key}" in [${currentSection}]`);
    }
    sectionData[key] = value;
    sections.set(currentSection, sectionData);
  }
  if (issues.length) throw new ConfigValidationError(source, issues);
  return sections;
}

export function parseIniConfig(text, options = {}) {
  const sections = parseIni(text, { source: options.source || "INI configuration" });
  const schemaVersion = Number((sections.get("meta") || {}).schemaVersion || "5") || 5;
  const settingsData = sections.get("settings") || {};
  const settings = Object.keys(settingsData).length ? {
    language: settingsData.language || "",
    displayTimezone: settingsData.displayTimezone || "",
    categoryId: settingsData.categoryId || "",
    visibleTimerIds: parseIniList(settingsData.visibleTimerIds),
    dockSide: settingsData.dockSide || "",
    editorSide: settingsData.editorSide || "",
    historyMinutes: Number(settingsData.historyMinutes),
    historyCollapsed: parseIniBoolean(settingsData.historyCollapsed),
    cardDensity: settingsData.cardDensity || "",
    theme: settingsData.theme || "",
    notificationOverride: settingsData.notificationOverride || "",
    colorblindMode: parseIniBoolean(settingsData.colorblindMode),
    showThumbnails: parseIniBoolean(settingsData.showThumbnails, true),
    imageZoom: settingsData.imageZoom || "",
    liveCollapsed: parseIniBoolean(settingsData.liveCollapsed),
    calendarCollapsed: parseIniBoolean(settingsData.calendarCollapsed)
  } : null;
  const categories = [];
  const timers = [];

  for (const [sectionName, data] of sections) {
    if (sectionName.startsWith("category:")) {
      const id = sectionName.slice("category:".length).trim();
      categories.push({
        id,
        label: {
          de: data["label.de"] || id,
          en: data["label.en"] || data["label.de"] || id,
          bar: data["label.bar"] || data["label.de"] || id
        },
        region: data.region || "custom",
        timezone: data.timezone || "Europe/Berlin"
      });
    } else if (sectionName.startsWith("timer:")) {
      const id = sectionName.slice("timer:".length).trim();
      const legacyEnabled = parseIniBoolean(data["notifications.enabled"], true);
      const legacyMinutes = parseIniList(data["notifications.minutes"]).map(Number).filter(Number.isFinite);
      timers.push({
        id,
        categoryId: data.categoryId || "personal",
        name: {
          de: data["name.de"] || id,
          en: data["name.en"] || data["name.de"] || id,
          bar: data["name.bar"] || data["name.de"] || id
        },
        description: {
          de: data["description.de"] || "",
          en: data["description.en"] || data["description.de"] || "",
          bar: data["description.bar"] || data["description.de"] || ""
        },
        motif: data.motif || "",
        image: data.image || "",
        timezone: data.timezone || "",
        durationMinutes: Number(data.durationMinutes || "10") || 10,
        activeFrom: data.activeFrom || "",
        activeUntil: data.activeUntil || "",
        rules: parseIniList(data.rules, "||"),
        anchorUtc: data.anchorUtc || "",
        notifications: notificationSettings({
          enabled: legacyEnabled,
          minutes: legacyMinutes,
          channels: parseIniList(data["notifications.channels"]),
          warning: {
            enabled: parseIniBoolean(data["notifications.warning.enabled"], legacyEnabled),
            seconds: Number(data["notifications.warning.seconds"] || "") || undefined,
            sound: data["notifications.warning.sound"] || undefined,
            durationSeconds: Number(data["notifications.warning.durationSeconds"] || "") || undefined
          },
          critical: {
            enabled: parseIniBoolean(data["notifications.critical.enabled"], legacyEnabled),
            seconds: Number(data["notifications.critical.seconds"] || "") || undefined,
            sound: data["notifications.critical.sound"] || undefined,
            durationSeconds: Number(data["notifications.critical.durationSeconds"] || "") || undefined
          }
        })
      });
    }
  }
  return { schemaVersion, categories, timers, settings };
}

export function applyLiveTimerOverrides(config, iniText) {
  const sections = parseIni(iniText, {
    source: "live-timers.ini",
    liveOverlay: true
  });
  for (const timer of config.timers) {
    const data = sections.get("timer:" + timer.id);
    if (!data) continue;
    const rules = parseIniList(data.rules, "||");
    const anchor = Date.parse(data.anchorUtc || "");
    const duration = Number(data.durationMinutes);
    if (rules.length && rules.every((rule) => /^@every\s+\d+(?:s|m|h|d)$/i.test(rule))) {
      timer.rules = rules;
    }
    if (Number.isFinite(anchor)) timer.anchorUtc = new Date(anchor).toISOString();
    if (Number.isFinite(duration) && duration > 0 && duration <= 1440) {
      timer.durationMinutes = duration;
    }
    timer.liveVerifiedAt = data.verifiedAt || "";
    timer.liveSourceUrl = data.sourceUrl || "";
  }
  return config;
}

function iniValue(value) {
  return String(value ?? "").replace(/\r?\n/g, " ").trim();
}

export function serializeIniConfig(rawConfig) {
  const config = normalizeConfig(rawConfig, { source: "Export configuration" });
  const lines = [
    "; Linny's Epic Time Portal timer configuration",
    "; Import this file directly in the timer UI.",
    "",
    "[meta]",
    "schemaVersion=" + Math.max(5, Number(config.schemaVersion) || 5)
  ];

  if (config.settings) {
    lines.push(
      "",
      "[settings]",
      "language=" + iniValue(config.settings.language || ""),
      "displayTimezone=" + iniValue(config.settings.displayTimezone || ""),
      "categoryId=" + iniValue(config.settings.categoryId || ""),
      "visibleTimerIds=" + (config.settings.visibleTimerIds || []).map(iniValue).filter(Boolean).join(","),
      "dockSide=" + iniValue(config.settings.dockSide || "right"),
      "editorSide=" + iniValue(config.settings.editorSide || "left"),
      "historyMinutes=" + Math.max(0, Number(config.settings.historyMinutes) || 0),
      "historyCollapsed=" + (config.settings.historyCollapsed ? "true" : "false"),
      "cardDensity=" + iniValue(config.settings.cardDensity || "compact"),
      "theme=" + iniValue(config.settings.theme || "astral"),
      "notificationOverride=" + iniValue(config.settings.notificationOverride || "default"),
      "colorblindMode=" + (config.settings.colorblindMode ? "true" : "false"),
      "showThumbnails=" + (config.settings.showThumbnails !== false ? "true" : "false"),
      "imageZoom=" + iniValue(config.settings.imageZoom || "large"),
      "liveCollapsed=" + (config.settings.liveCollapsed ? "true" : "false"),
      "calendarCollapsed=" + (config.settings.calendarCollapsed ? "true" : "false")
    );
  }

  for (const category of config.categories) {
    lines.push(
      "",
      "[category:" + iniValue(category.id) + "]",
      "label.de=" + iniValue(category.label?.de || category.id),
      "label.en=" + iniValue(category.label?.en || category.label?.de || category.id),
      "label.bar=" + iniValue(category.label?.bar || category.label?.de || category.id),
      "region=" + iniValue(category.region || "custom"),
      "timezone=" + iniValue(category.timezone || "Europe/Berlin")
    );
  }

  for (const timer of config.timers) {
    const notifications = notificationSettings(timer);
    lines.push(
      "",
      "[timer:" + iniValue(timer.id) + "]",
      "categoryId=" + iniValue(timer.categoryId || "personal"),
      "name.de=" + iniValue(timer.name?.de || timer.id),
      "name.en=" + iniValue(timer.name?.en || timer.name?.de || timer.id),
      "name.bar=" + iniValue(timer.name?.bar || timer.name?.de || timer.id),
      "description.de=" + iniValue(timer.description?.de || ""),
      "description.en=" + iniValue(timer.description?.en || timer.description?.de || ""),
      "description.bar=" + iniValue(timer.description?.bar || timer.description?.de || "")
    );
    if (timer.motif) lines.push("motif=" + iniValue(timer.motif));
    if (timer.image) lines.push("image=" + iniValue(timer.image));
    if (timer.timezone) lines.push("timezone=" + iniValue(timer.timezone));
    lines.push("durationMinutes=" + (Number(timer.durationMinutes) || 10));
    if (timer.activeFrom) lines.push("activeFrom=" + iniValue(timer.activeFrom));
    if (timer.activeUntil) lines.push("activeUntil=" + iniValue(timer.activeUntil));
    lines.push("rules=" + (timer.rules || []).map(iniValue).filter(Boolean).join(" || "));
    if (timer.anchorUtc) lines.push("anchorUtc=" + iniValue(timer.anchorUtc));
    lines.push(
      "notifications.warning.enabled=" + (notifications.warning.enabled ? "true" : "false"),
      "notifications.warning.seconds=" + notifications.warning.seconds,
      "notifications.warning.sound=" + iniValue(notifications.warning.sound),
      "notifications.warning.durationSeconds=" + notifications.warning.durationSeconds,
      "notifications.critical.enabled=" + (notifications.critical.enabled ? "true" : "false"),
      "notifications.critical.seconds=" + notifications.critical.seconds,
      "notifications.critical.sound=" + iniValue(notifications.critical.sound),
      "notifications.critical.durationSeconds=" + notifications.critical.durationSeconds,
      "notifications.channels=" + notifications.channels.map(iniValue).filter(Boolean).join(",")
    );
  }
  return lines.join("\n") + "\n";
}
