---
title: Dokumentations- und Wissensstruktur
doc_type: explanation
status: active
audience:
  - project-maintainer
  - developer
  - ai-agent
canonical: true
---

# Dokumentations- und Wissensstruktur

Diese Dokumentation ist das gemeinsame, versionierte **Projektgedächtnis für Menschen, ChatGPT und Coding-Agenten**. Die Markdown-Dateien sind die gepflegte Quelle; aus ihnen kann mit MkDocs eine klickbare HTML-Dokumentation erzeugt werden.

## Einstieg nach Rolle

| Rolle oder Aufgabe | Empfohlener Einstieg |
|---|---|
| Nutzer der Timer-Seite | [Projekt-README auf GitHub](https://github.com/thomasdenk79-cyber/throne-liberty-eu-kalender/blob/main/README.md) |
| neuer Entwickler | [Projektüberblick](project/project-brief.md) und [Architektur](project/architecture.md) |
| Coding-Agent | [AGENTS.md auf GitHub](https://github.com/thomasdenk79-cyber/throne-liberty-eu-kalender/blob/main/AGENTS.md), danach die dort verlinkten Dateien |
| GitHub Copilot | [Copilot-Instruktionen auf GitHub](https://github.com/thomasdenk79-cyber/throne-liberty-eu-kalender/blob/main/.github/copilot-instructions.md) |
| konkrete Implementierung | [Entwicklungsrichtlinien](engineering/development-guidelines.md) |
| KI-Workflow verstehen | [KI-gestützte Entwicklung](engineering/ai-assisted-development.md) |
| Markdown lernen | [Markdown-Kurzreferenz](reference/markdown-cheatsheet.md) |
| Demo für Kollegen | [Vorstellung für Kollegen](demo/colleague-demo.md) |

## Wissensbereiche

| Bereich | Zweck |
|---|---|
| `docs/project/` | Was ist das Projekt, warum gibt es das und wie ist es aufgebaut? |
| `docs/engineering/` | Wie wird entwickelt, getestet, dokumentiert und mit KI gearbeitet? |
| `docs/reference/` | kompakte Nachschlagewerke und Syntaxreferenzen |
| `docs/demo/` | Vorführung, Lernmaterial und wiederverwendbare Prompt-Beispiele |

## Schnellstart für Agenten

1. `AGENTS.md` lesen.
2. Diese Datei als Wissenslandkarte verwenden.
3. Je nach Aufgabe gezielt Projekt-, Engineering- und Referenzdateien laden.
4. Betroffene Implementierung untersuchen.
5. Änderung klein und überprüfbar umsetzen.
6. Tests durchführen oder nicht geprüfte Punkte klar nennen.
7. Dauerhaft relevantes Wissen zurück in die passende kanonische Datei schreiben.
8. Grundsatzentscheidungen im [Entscheidungsprotokoll](engineering/decision-log.md) festhalten.

## Quellen der Wahrheit

Nicht jede Datei darf dieselbe Information neu erzählen. Maßgeblich sind:

| Information | Kanonische Quelle |
|---|---|
| Produktziel und Nicht-Ziele | `project/project-brief.md` |
| Architektur und Datenfluss | `project/architecture.md` |
| Entwicklungs- und Testregeln | `engineering/development-guidelines.md` |
| KI-Zusammenarbeit | `engineering/ai-assisted-development.md` |
| Dokumentationsformat | `engineering/documentation-guidelines.md` |
| wichtige Entscheidungen | `engineering/decision-log.md` |
| Standardtimer | `config.ini` im Repository-Stamm |
| tatsächlich implementiertes Verhalten | `index.html` im Repository-Stamm |

## HTML-Dokumentation lokal starten

Voraussetzung: Python ist installiert. Die Befehle werden im Repository-Stamm ausgeführt.

### Windows PowerShell

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-docs.txt
mkdocs serve
```

### Linux oder macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-docs.txt
mkdocs serve
```

MkDocs zeigt anschließend die lokale Adresse an. Änderungen an Markdown-Dateien werden während `mkdocs serve` automatisch neu dargestellt.

## Statische HTML-Ausgabe erzeugen

```bash
mkdocs build --strict
```

Die generierte Website landet unter `site/`. Dieses Verzeichnis ist Build-Ausgabe, wird nicht von Hand bearbeitet und ist in `.gitignore` ausgeschlossen.

## Abgrenzung

Dieses öffentliche Privat-Repository enthält keine vertraulichen Unternehmensdaten. Beispiele aus beruflichen Kontexten dürfen nur abstrahiert und ohne interne Namen, Systeme, Daten oder Zugangsinformationen dokumentiert werden.

## Pflegeprinzip

Eine Wissensdatei ist kein Ablageort für rohe Chatprotokolle. Aufgenommen werden nur bestätigte Fakten, tragfähige Entscheidungen, relevante Annahmen, Risiken und wiederverwendbare Arbeitsweisen. Veraltete oder widersprüchliche Informationen werden korrigiert statt durch weitere Kopien ergänzt.
