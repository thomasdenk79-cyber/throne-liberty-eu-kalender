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
- Dynamische Inhalte mit `textContent`, DOM-Knoten oder gleichwertigem Escaping erzeugen; `innerHTML` nur für statische, vertrauenswürdige Templates verwenden.

## Testcheckliste

### Reproduzierbare lokale Einrichtung

Die Projektdateien definieren die Werkzeuge; ein Agent installiert keine
beliebigen globalen Testprogramme als versteckte Voraussetzung.

```powershell
# Anwendung: Node.js 24
npm ci
npm run check

# Python und Dokumentation
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-docs.txt
.\.venv\Scripts\python.exe -m py_compile scripts\sync_gate_memory.py
.\.venv\Scripts\mkdocs.exe build --strict
```

Wenn die exakte Python-Minor-Version lokal nicht vorhanden ist, darf eine
kompatible unterstützte Version verwendet werden. Die Abweichung wird im
Testnachweis genannt. `npm ci` ist gegenüber `npm install` zu bevorzugen, weil
es den Lockfile-Stand reproduziert.

### Visuelle Regressionsprüfung

Bei jeder Änderung an `index.html`, `assets/styles/app.css` oder
layoutrelevantem JavaScript zusätzlich:

```powershell
npm run visual:local
```

Das Skript `scripts/visual_check.mjs` startet einen lokalen statischen
Server, akzeptiert automatisch den Speicher-Consent-Dialog und schreibt
Desktop- und Mobile-Screenshots nach `tests/visual-baselines/`. Diese
Screenshots müssen mit dem Bildbetrachter tatsächlich angesehen werden — ein
Agent darf visuelle Korrektheit nicht allein aus dem Nichtvorhandensein von
Konsolenfehlern ableiten. Nach einem Deploy zusätzlich `npm run visual:live`
gegen die echte GitHub-Pages-URL laufen lassen. `tests/visual-baselines/*.png`
wird committet (aktueller Stand); `tests/visual-baselines/history/` ist
lokal und per `.gitignore` ausgeschlossen.

### Testmatrix nach Ausführungsumgebung

| Umgebung | Pflicht, soweit verfügbar | Darf nicht behaupten |
|---|---|---|
| Browser-Chat | Anforderungen und Diffs prüfen, aktuelle externe Quellen recherchieren, sichtbare UX/PWA auf bereitgestellter Seite prüfen | lokale Befehle, Dateisystem- oder CI-Tests seien gelaufen |
| lokaler Coding-Agent | `npm run check`, Python-Syntax, strikter Doku-Build, Asset-/Link-Prüfung und relevante Browser-Smokes | nicht ausgeführte Geräte-, Installations- oder Cloudtests seien bestanden |
| CI | sauberer Checkout, deterministische App- und Doku-Checks, Deployment nur nach Erfolg | menschliche Bedien- oder Spielabnahme ersetzen |
| Human QA | Windows-/Mobil-PWA, Benachrichtigungen, Audio, Layout und fachliche Eventzeiten | technische Regressionstests ersetzen |

Nicht verfügbare Prüfungen werden mit Grund und zuständiger Folgeebene
dokumentiert. Ein Browser-Chat kann beispielsweise externe Standards besser
recherchieren; der lokale Agent kann dafür Builds, Tests und reale Diffs
reproduzierbar ausführen.

### Funktion

- Seite lädt ohne sichtbaren Fehler.
- `config.ini` wird erfolgreich gelesen.
- Countdown und laufende Events aktualisieren sich.
- Warn- und kritische Zustände funktionieren.
- Import und Export funktionieren.
- ICS-Export enthält plausible Zeitpunkte.
- lokale Einstellungen bleiben nach Neuladen erhalten.
- Gate-of-Memory-Live-Overlay wird geladen und fällt bei Netzproblemen sauber auf den geprüften INI-Anchor zurück.
- Manifest und Service Worker sind syntaktisch gültig.

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
- neue oder geänderte Fachlogik passende automatisierte Tests besitzt,
- Änderungen an Testwerkzeugen in `package.json`, Workflows und dieser
  Richtlinie konsistent dokumentiert sind,
- keine bekannten schwerwiegenden Regressionen offen sind,
- README und Wissensbasis zum neuen Stand passen,
- wichtige neue Entscheidungen protokolliert sind.
