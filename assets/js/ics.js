function formatIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function calendarEntryKey(timerId, timestamp) {
  return timerId + "|" + timestamp;
}

export function buildIcs(entries, options = {}) {
  const timerName = options.timerName || ((timer) => timer.name?.de || timer.id);
  const timerDescription = options.timerDescription || ((timer) => timer.description?.de || "");
  const createdAt = formatIcsDate(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Linny's Epic Time Portal//TL EU Event Timer//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Linny's Epic Time Portal"
  ];

  for (const entry of entries.slice().sort((left, right) => left.start - right.start)) {
    const start = new Date(entry.start);
    const end = new Date(start.getTime() + (entry.timer.durationMinutes || 10) * 60000);
    lines.push(
      "BEGIN:VEVENT",
      "UID:" + entry.timer.id + "-" + start.getTime() + "@linny-epic-time-portal",
      "DTSTAMP:" + createdAt,
      "DTSTART:" + formatIcsDate(start),
      "DTEND:" + formatIcsDate(end),
      "SUMMARY:" + escapeIcsText(timerName(entry.timer)),
      "DESCRIPTION:" + escapeIcsText(timerDescription(entry.timer)),
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR", "");
  return lines.join("\r\n");
}

export function downloadIcs(entries, filename, options = {}) {
  const blob = new Blob([buildIcs(entries, options)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
