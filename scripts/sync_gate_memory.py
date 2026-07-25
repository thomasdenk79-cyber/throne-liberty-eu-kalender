#!/usr/bin/env python3
"""Refresh the restart-sensitive Gate of Memory anchor from MetaForge.

The public timer page exposes an Event JSON-LD object.  We deliberately keep
the generated overlay tiny and validate every value before replacing the
checked-in last-known-good file.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


SOURCE_URL = "https://metaforge.app/throne-and-liberty/timer"
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "live-timers.ini"
USER_AGENT = "Linny-Solisium-Pulse/3.0 (+GitHub Pages timer sync)"


def iter_json_ld(html: str):
    pattern = re.compile(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        re.IGNORECASE | re.DOTALL,
    )
    for match in pattern.finditer(html):
        try:
            yield json.loads(match.group(1))
        except json.JSONDecodeError:
            continue


def event_nodes(value):
    if isinstance(value, dict):
        if value.get("@type") == "Event":
            yield value
        for child in value.values():
            yield from event_nodes(child)
    elif isinstance(value, list):
        for child in value:
            yield from event_nodes(child)


def parse_iso_utc(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("startDate has no timezone")
    return parsed.astimezone(timezone.utc)


def main() -> int:
    request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        html = response.read().decode("utf-8")

    candidates = [
        event
        for document in iter_json_ld(html)
        for event in event_nodes(document)
        if "Gate of Memory" in str(event.get("name", ""))
        or "Gate of Memory" in str(event.get("description", ""))
    ]
    if not candidates:
        raise RuntimeError("MetaForge JSON-LD contains no Gate of Memory event")

    event = candidates[0]
    start = parse_iso_utc(str(event["startDate"]))
    now = datetime.now(timezone.utc)
    if abs((start - now).total_seconds()) > 7 * 86400:
        raise ValueError(f"implausible startDate: {start.isoformat()}")
    description = str(event.get("description", ""))
    interval_match = re.search(
        r"every\s+(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?",
        description,
        re.IGNORECASE,
    )
    duration_match = re.search(r"lasts\s+(\d+)\s+minutes?", description, re.IGNORECASE)
    if not interval_match or not duration_match:
        raise RuntimeError("MetaForge interval or duration format changed")

    hours, minutes, seconds = (int(part or 0) for part in interval_match.groups())
    interval_seconds = hours * 3600 + minutes * 60 + seconds
    duration_minutes = int(duration_match.group(1))
    if not 10_000 <= interval_seconds <= 13_000:
        raise ValueError(f"implausible interval: {interval_seconds}")
    if not 1 <= duration_minutes <= 30:
        raise ValueError(f"implausible duration: {duration_minutes}")

    anchor = start.isoformat(timespec="seconds").replace("+00:00", "Z")
    generated = now.isoformat(timespec="seconds").replace("+00:00", "Z")
    output = f"""; Automatically refreshed for GitHub Pages by scripts/sync_gate_memory.py.
; The checked-in values are the last known-good fallback when MetaForge is unavailable.

[meta]
generatedAt={generated}
sourceUrl={SOURCE_URL}

[timer:gate_memory_eu]
rules=@every {interval_seconds}s
anchorUtc={anchor}
durationMinutes={duration_minutes}
verifiedAt={generated}
sourceUrl={SOURCE_URL}
"""
    OUTPUT_PATH.write_text(output, encoding="utf-8")
    print(
        f"Gate of Memory synced: anchor={anchor}, "
        f"interval={interval_seconds}s, duration={duration_minutes}m"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # keep the checked-in fallback intact
        prefix = "::warning title=Gate of Memory sync fallback::" if "GITHUB_ACTIONS" in __import__("os").environ else ""
        print(f"{prefix}Gate of Memory sync skipped: {error}", file=sys.stderr)
        raise SystemExit(0)
