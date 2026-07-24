---
title: Projektüberblick
doc_type: explanation
status: active
audience:
  - project-maintainer
  - developer
  - ai-agent
canonical: true
---

# Projektüberblick

## Zweck

**Linny's Astral Solisium Pulse** ist eine statische, browserbasierte Event-Timer-Seite für *Throne and Liberty EU*. Sie zeigt wiederkehrende und saisonale Ereignisse, Countdown-Zeiten, laufende Ereignisse sowie konfigurierbare Warnungen an.

Das Repository erfüllt gleichzeitig einen zweiten Zweck: Es ist ein bewusst überschaubares Demo-Projekt für **KI-gestützte Softwareentwicklung mit gemeinsamem Projektgedächtnis**.

## Zielgruppen

- Spieler, die Ereignisse und Erinnerungen übersichtlich sehen möchten
- der Projektinhaber als fachlicher Entscheider und Tester
- ChatGPT als Recherche-, Konzept- und Dokumentationspartner
- GitHub Copilot und andere Coding-Agenten als technische Umsetzer
- Kollegen, die anhand eines kleinen Projekts den Einsatz von KI-Agenten kennenlernen möchten

## Produktziele

1. Ereignisse zuverlässig und zeitzonensicher anzeigen.
2. Timer vollständig über eine lesbare `config.ini` konfigurieren.
3. Ohne Backend, Datenbank oder Benutzerkonto funktionieren.
4. Auf Desktop, Tablet und Smartphone verständlich bedienbar bleiben.
5. Einstellungen lokal im Browser speichern.
6. Benachrichtigungen, Sounds und Kalenderexport anbieten.
7. Das Projekt so dokumentieren, dass Menschen und KI-Agenten es schnell verstehen und sicher erweitern können.

## Nicht-Ziele

- kein zentrales Benutzerkonto
- kein Server-Backend
- keine Speicherung persönlicher Daten auf einem Server
- kein Tracking oder Werbenetzwerk
- keine vollständige Spiel-Datenbank
- keine ungeprüfte automatische Übernahme externer Event-Daten
- keine vertraulichen Siemens- oder Unternehmensinformationen

## Aktueller technischer Rahmen

| Bestandteil | Aufgabe |
|---|---|
| `index.html` | Benutzeroberfläche, Timer-Logik und Browser-Interaktion |
| `config.ini` | kanonische Standardkonfiguration für Kategorien und Timer |
| Browser-Speicher | lokale Benutzereinstellungen und lokale Anpassungen |
| Browser APIs | Benachrichtigungen, Audio, Dateiexport und Fensterverhalten |
| GitHub Pages | statische Veröffentlichung der Anwendung |
| `docs/` | gemeinsames Projektwissen für Menschen und Agenten |
| `AGENTS.md` | Einstieg und Arbeitsregeln für Coding-Agenten |
| `.github/copilot-instructions.md` | automatisch geladene Copilot-Projektregeln |

## Quellen der Wahrheit

Informationen sollen nicht unnötig doppelt gepflegt werden.

| Information | Kanonische Quelle |
|---|---|
| Standard-Timer und Kategorien | `config.ini` |
| tatsächlich implementiertes Verhalten | `index.html` |
| Produktziel und Nicht-Ziele | diese Datei |
| technische Struktur und Datenfluss | `architecture.md` |
| Entwicklungsregeln | `../engineering/development-guidelines.md` |
| Agentenarbeitsweise | `../../AGENTS.md` und `../engineering/ai-assisted-development.md` |
| Begründung wichtiger Entscheidungen | `../engineering/decision-log.md` |

## Erfolgskriterien

Eine Erweiterung ist erfolgreich, wenn sie:

- für den Nutzer verständlich ist,
- bestehende Konfigurationen nicht unbeabsichtigt bricht,
- auf kleinen und großen Bildschirmen funktioniert,
- ohne zusätzliche Serverkomponenten auskommt, sofern keine bewusste Architekturentscheidung anderes festlegt,
- nachvollziehbar getestet wurde,
- und das Projektgedächtnis nach der Änderung weiterhin mit dem Code übereinstimmt.
