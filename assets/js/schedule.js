const BAVARIA_TIMEZONE = "Bayern/Munich";
const DAY_MS = 86400000;

export function resolveTimeZone(timeZone) {
  return timeZone === BAVARIA_TIMEZONE ? "Europe/Berlin" : timeZone;
}

export function isValidTimeZone(timeZone) {
  if (!timeZone || timeZone === BAVARIA_TIMEZONE) return Boolean(timeZone);
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function parseCronField(field, min, max) {
  if (typeof field !== "string" || !field.trim()) {
    throw new Error("empty cron field");
  }
  const values = new Set();
  for (const rawPart of field.split(",")) {
    const part = rawPart.trim();
    const match = part.match(/^(\*|\d+|\d+-\d+)(?:\/(\d+))?$/);
    if (!match) throw new Error(`invalid cron token "${part}"`);
    const step = match[2] ? Number(match[2]) : 1;
    if (!Number.isInteger(step) || step < 1) throw new Error(`invalid cron step "${part}"`);

    let start;
    let end;
    if (match[1] === "*") {
      start = min;
      end = max;
    } else if (match[1].includes("-")) {
      [start, end] = match[1].split("-").map(Number);
    } else {
      start = Number(match[1]);
      end = start;
    }
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < min || end > max || start > end) {
      throw new Error(`cron value outside ${min}-${max}: "${part}"`);
    }
    for (let value = start; value <= end; value += step) values.add(value);
  }
  return Array.from(values).sort((left, right) => left - right);
}

export function validateScheduleRule(rule) {
  const value = String(rule || "").trim();
  const intervalMatch = value.match(/^@every\s+(\d+)(s|m|h|d)$/i);
  if (intervalMatch) {
    const amount = Number(intervalMatch[1]);
    if (!Number.isInteger(amount) || amount < 1) throw new Error("interval must be positive");
    return;
  }
  const fields = value.split(/\s+/);
  if (fields.length !== 5) throw new Error("cron rule must contain exactly five fields");
  parseCronField(fields[0], 0, 59);
  parseCronField(fields[1], 0, 23);
  parseCronField(fields[2], 1, 31);
  parseCronField(fields[3], 1, 12);
  parseCronField(fields[4], 0, 6);
}

function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: resolveTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);
  const output = {};
  for (const part of parts) {
    if (part.type !== "literal") output[part.type] = part.value;
  }
  return {
    year: Number(output.year),
    month: Number(output.month),
    day: Number(output.day),
    hour: Number(output.hour),
    minute: Number(output.minute),
    second: Number(output.second)
  };
}

function zonedOffset(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    - date.getTime();
}

function zonedToUtc(year, month, day, hour, minute, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const firstPass = guess - zonedOffset(new Date(guess), timeZone);
  return new Date(guess - zonedOffset(new Date(firstPass), timeZone));
}

function zoneWeekday(date, timeZone) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: resolveTimeZone(timeZone)
  }).format(date);
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 })[weekday] ?? 0;
}

function timerActive(timer, nowMs) {
  const from = timer.activeFrom ? Date.parse(timer.activeFrom) : -Infinity;
  const until = timer.activeUntil ? Date.parse(timer.activeUntil) : Infinity;
  return nowMs >= from && nowMs <= until;
}

function upcomingFromCronRule(rule, timeZone, activeUntil, count, now) {
  const fields = rule.trim().split(/\s+/);
  const minutes = parseCronField(fields[0], 0, 59);
  const hours = parseCronField(fields[1], 0, 23);
  const monthDays = parseCronField(fields[2], 1, 31);
  const months = parseCronField(fields[3], 1, 12);
  const weekdays = parseCronField(fields[4], 0, 6);
  const results = [];

  for (let dayOffset = 0; dayOffset < 50 && results.length < count; dayOffset += 1) {
    const probe = new Date(now.getTime() + dayOffset * DAY_MS);
    const parts = zonedParts(probe, timeZone);
    if (!months.includes(parts.month) || !monthDays.includes(parts.day)) continue;
    if (!weekdays.includes(zoneWeekday(probe, timeZone))) continue;
    for (const hour of hours) {
      for (const minute of minutes) {
        const candidate = zonedToUtc(parts.year, parts.month, parts.day, hour, minute, timeZone);
        if (candidate.getTime() <= now.getTime()) continue;
        if (activeUntil && candidate.getTime() > Date.parse(activeUntil)) continue;
        results.push(candidate);
      }
    }
  }
  return results.sort((left, right) => left - right).slice(0, count);
}

export function intervalSecondsFromRules(rules) {
  const rule = (rules || []).find((value) => /^@every\s+/i.test(value));
  const match = rule?.match(/^@every\s+(\d+)(s|m|h|d)$/i);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  return unit === "d" ? amount * 86400
    : unit === "h" ? amount * 3600
      : unit === "m" ? amount * 60
        : amount;
}

function intervalSchedule(timer) {
  const seconds = intervalSecondsFromRules(timer.rules);
  if (!seconds) return null;
  const anchor = Date.parse(timer.anchorUtc || timer.activeFrom || "");
  if (!Number.isFinite(anchor)) return null;
  return { anchor, step: seconds * 1000 };
}

function upcomingFromInterval(timer, count, nowMs) {
  const schedule = intervalSchedule(timer);
  if (!schedule) return [];
  const { anchor, step } = schedule;
  const first = nowMs > anchor
    ? anchor + Math.ceil((nowMs - anchor) / step) * step
    : anchor;
  const results = [];
  for (let index = 0; index < count; index += 1) {
    const timestamp = first + index * step;
    if (timer.activeUntil && timestamp > Date.parse(timer.activeUntil)) break;
    results.push(new Date(timestamp));
  }
  return results;
}

export function calculateTimerOccurrences(timer, category, count, options = {}) {
  const nowMs = options.nowMs ?? Date.now();
  if (!timerActive(timer, nowMs)) return [];
  const timeZone = timer.timezone || category?.timezone || options.fallbackTimeZone || "Europe/Berlin";
  if ((timer.rules || []).some((rule) => rule.startsWith("@every"))) {
    return upcomingFromInterval(timer, count, nowMs);
  }
  const now = new Date(nowMs);
  const results = [];
  for (const rule of timer.rules || []) {
    results.push(...upcomingFromCronRule(rule, timeZone, timer.activeUntil, count, now));
  }
  return results.sort((left, right) => left - right).slice(0, count);
}

function cronRuleMatches(rule, date, timeZone) {
  const fields = rule.trim().split(/\s+/);
  if (fields.length !== 5) return false;
  const parts = zonedParts(date, timeZone);
  return parseCronField(fields[0], 0, 59).includes(parts.minute)
    && parseCronField(fields[1], 0, 23).includes(parts.hour)
    && parseCronField(fields[2], 1, 31).includes(parts.day)
    && parseCronField(fields[3], 1, 12).includes(parts.month)
    && parseCronField(fields[4], 0, 6).includes(zoneWeekday(date, timeZone));
}

export function calculateRecentTimerState(timer, category, options = {}) {
  const nowMs = options.nowMs ?? Date.now();
  const durationMs = Math.max(1, Number(timer.durationMinutes) || 10) * 60000;
  const historyMs = Math.max(0, Number(options.historyMinutes) || 0) * 60000;
  const timeZone = timer.timezone || category?.timezone || options.fallbackTimeZone || "Europe/Berlin";
  const interval = intervalSchedule(timer);
  let startMs = NaN;

  if (interval && nowMs >= interval.anchor) {
    startMs = interval.anchor + Math.floor((nowMs - interval.anchor) / interval.step) * interval.step;
  } else if (!interval) {
    const currentMinute = Math.floor(nowMs / 60000) * 60000;
    const lookbackMinutes = Math.ceil((durationMs + historyMs) / 60000) + 1;
    for (let offset = 0; offset <= lookbackMinutes; offset += 1) {
      const candidate = new Date(currentMinute - offset * 60000);
      if ((timer.rules || []).some((rule) => cronRuleMatches(rule, candidate, timeZone))) {
        startMs = candidate.getTime();
        break;
      }
    }
  }

  if (!Number.isFinite(startMs)) return null;
  const activeFrom = timer.activeFrom ? Date.parse(timer.activeFrom) : -Infinity;
  const activeUntil = timer.activeUntil ? Date.parse(timer.activeUntil) : Infinity;
  if (startMs < activeFrom || startMs > activeUntil) return null;
  const endMs = startMs + durationMs;
  if (nowMs >= startMs && nowMs < endMs) {
    return { status: "running", startMs, endMs, durationMs, progress: (nowMs - startMs) / durationMs };
  }
  if (nowMs >= endMs && nowMs <= endMs + historyMs) {
    return { status: "ended", startMs, endMs, durationMs, progress: 1 };
  }
  return null;
}

export function compactDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) {
    return String(hours).padStart(2, "0")
      + ":" + String(minutes).padStart(2, "0")
      + ":" + String(seconds).padStart(2, "0");
  }
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}
