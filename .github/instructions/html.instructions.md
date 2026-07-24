---
applyTo: "index.html,**/*.html,**/*.css,**/*.js"
---

# HTML/CSS/JavaScript Instructions

Gilt für Arbeiten an `index.html` und an direkt eingebettetem oder später ausgelagertem CSS/JavaScript.

## Grundsatz

Dieses Projekt bleibt absichtlich einfach: statische Webseite, direkt auf GitHub Pages deploybar, keine Build-Pipeline als Voraussetzung für die Anwendung.

## Vor Änderungen lesen

- `AGENTS.md`
- `docs/project/project-brief.md`
- `docs/project/architecture.md`
- `docs/engineering/development-guidelines.md`

## UI und UX

- Mobile, Tablet und Desktop prüfen.
- Keine festen Pixel-Layouts, die auf kleinen Displays brechen.
- Beschriftungen für Nicht-Programmierer verständlich halten.
- Bestehende lokale Einstellungen im Browser nicht unnötig invalidieren.
- Animationen sparsam einsetzen und nicht als einzige Informationsquelle verwenden.
- Tastaturbedienung, Fokuszustände und reduzierte Bewegung berücksichtigen.

## JavaScript

- Funktionen klein und fachlich benennen.
- Zeitberechnungen zentral halten und Zeitzonen/DST bewusst behandeln.
- Fehlerfälle sichtbar machen, statt still falsche Timer anzuzeigen.
- Import/Export der INI-Konfiguration rückwärtskompatibel halten.
- Konfigurationsdaten nicht durch timer-spezifischen Spezialcode duplizieren.

## Kommentare

Inline-Kommentare sollen erklären, warum etwas so gebaut ist. Offensichtliche Codezeilen nicht kommentieren. Dauerhafte Architekturbegründungen gehören zusätzlich in die Projektdokumentation oder das Entscheidungsprotokoll.
