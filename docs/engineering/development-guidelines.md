---
title: Entwicklungsrichtlinien
doc_type: how-to
status: active
audience:
  - developer
  - ai-agent
canonical: true
---

# Entwicklungsrichtlinien

## Grundprinzip

Änderungen folgen immer diesem Ablauf:

1. **Verstehen:** relevante Dokumentation und betroffene Dateien lesen.
2. **Abgrenzen:** Ziel, Nicht-Ziele und Annahmen nennen.
3. **Planen:** kleine, überprüfbare Änderungsschritte festlegen.
4. **Umsetzen:** nur die notwendigen Dateien ändern.
5. **Prüfen:** Verhalten, Bedienung und Rückwärtskompatibilität testen.
6. **Dokumentieren:** Projektwissen und Entscheidungsprotokoll aktualisieren.

## Vor einer Änderung lesen

Mindestens:

- `AGENTS.md`
- `docs/README.md`
- `docs/project/project-brief.md`
- `docs/project/architecture.md`

Zusätzlich je nach Aufgabe:

| Aufgabe | Zusätzlich lesen |
|---|---|
| Timer oder INI ändern | `README.md`, `config.ini` |
| UI oder Verhalten ändern | `index.html`, Architektur |
| Agentenregeln ändern | `.github/copilot-instructions.md`, `AGENTS.md` |
| größere technische Entscheidung | `decision-log.md` |
| Dokumentation ändern | `documentation-guidelines.md` |

## Änderungsumfang

- Kleine, thematisch geschlossene Änderungen bevorzugen.
- Keine unaufgeforderten Komplettumbauten.
- Refactoring und neue Funktion möglichst trennen.
- Bestehendes Verhalten nicht beiläufig verändern.
- Annahmen und nicht geprüfte Punkte sichtbar kennzeichnen.

## HTML

- Semantische Elemente wie `header`, `nav`, `main`, `section`, `button` und `dialog` bevorzugen.
- Interaktive Elemente müssen per Tastatur erreichbar sein.
- Beschriftungen müssen auch ohne Farbe verständlich sein.
- IDs und Datenattribute sprechend und stabil benennen.
- Inline-Eventhandler vermeiden; Ereignisse zentral per JavaScript registrieren.

## CSS

- Mobile und schmale Ansichten mitdenken.
- Bestehende CSS-Variablen und Komponenten wiederverwenden.
- Keine unnötigen festen Höhen, wenn Inhalte wachsen können.
- Fokuszustände sichtbar lassen.
- `prefers-reduced-motion` bei Animationen beachten.
- Keine neue visuelle Variante ergänzen, wenn eine bestehende Komponente ausreicht.

## JavaScript

- Funktionen klein und nach Verantwortung schneiden.
- Fachlogik von DOM-Manipulation trennen, soweit dies ohne unnötige Komplexität möglich ist.
- UTC-Zeitpunkte intern eindeutig behandeln.
- Fehler beim Laden oder Parsen sichtbar und verständlich melden.
- Keine stillen Datenkorrekturen ohne Protokoll oder Benutzerhinweis.
- Lokalen Speicher defensiv lesen: fehlende, alte oder fehlerhafte Werte dürfen die Seite nicht unbrauchbar machen.

## `config.ini`

- Bestehende Schlüssel nicht ohne Migration umbenennen oder entfernen.
- `durationMinutes` beschreibt die Eventdauer, nicht das Wiederholungsintervall.
- Intervallregeln benötigen einen nachvollziehbaren `anchorUtc`.
- Zeitgrenzen als ISO-UTC-Werte schreiben.
- Neue Schlüssel dokumentieren und beim Export/Import berücksichtigen.
- Parseränderungen mit alten und neuen Beispielkonfigurationen prüfen.

## Externe Abhängigkeiten

Eine neue Bibliothek oder ein CDN ist nur sinnvoll, wenn:

1. der Nutzen konkret beschrieben ist,
2. die Funktion nicht mit überschaubarem Aufwand nativ lösbar ist,
3. Datenschutz, Ausfallrisiko und langfristige Pflege betrachtet wurden,
4. die Entscheidung im Entscheidungsprotokoll steht.

## Sicherheitsregeln

- Keine Tokens, Passwörter oder API-Schlüssel committen.
- Keine personenbezogenen Daten in Beispieldateien.
- Keine vertraulichen Unternehmensinformationen in dieses öffentliche Repository.
- Importierte Dateien als nicht vertrauenswürdig behandeln.
- Inhalte vor der Einfügung in HTML korrekt als Text behandeln; keine ungeprüfte HTML-Injektion.

## Testcheckliste

### Funktion

- Seite lädt ohne sichtbaren Fehler.
- `config.ini` wird erfolgreich gelesen.
- Countdown und laufende Events aktualisieren sich.
- Warn- und kritische Zustände funktionieren.
- Import und Export funktionieren.
- ICS-Export enthält plausible Zeitpunkte.
- lokale Einstellungen bleiben nach Neuladen erhalten.

### Oberfläche

- breite Desktopansicht
- schmales Browserfenster
- Tablet- oder Smartphonebreite
- Tastaturbedienung
- sichtbarer Fokus
- reduzierte Bewegung
- lange Eventnamen und leere Kategorien

### Kompatibilität

- vorhandene `config.ini` weiterhin lesbar
- alte lokale Einstellungen verursachen keinen Absturz
- fehlende Benachrichtigungsberechtigung wird verständlich behandelt

## Definition of Done

Eine Aufgabe ist fertig, wenn:

- die Anforderung umgesetzt ist,
- Nicht-Ziele nicht versehentlich mit umgesetzt wurden,
- relevante Tests durchgeführt und kurz dokumentiert sind,
- keine bekannten schwerwiegenden Regressionen offen sind,
- README und Wissensbasis zum neuen Stand passen,
- wichtige neue Entscheidungen protokolliert sind.
