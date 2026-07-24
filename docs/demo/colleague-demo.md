---
title: Vorstellung für Kollegen
doc_type: tutorial
status: active
audience:
  - presenter
  - beginner
canonical: false
---

# Vorstellung für Kollegen

## Ziel der Demo

An einem kleinen privaten Webprojekt zeigen, wie ein Mensch, ChatGPT und ein Coding-Agent gemeinsam entwickeln können, ohne dass jeder neue Agent das Projekt von null rekonstruieren muss.

Die zentrale Botschaft lautet:

> Gute KI-Entwicklung beginnt nicht mit einem langen Prompt, sondern mit einem verständlichen, versionierten Projektkontext.

## Empfohlene Dauer

Etwa 15 bis 20 Minuten.

## Demo-Ablauf

### 1. Das sichtbare Produkt zeigen

- Event-Timer im Browser öffnen.
- Kategorien, Countdowns und Benachrichtigungseinstellungen zeigen.
- Erklären, dass die Seite statisch auf GitHub Pages läuft.

Ziel: Erst den Nutzen zeigen, nicht sofort über Dateien sprechen.

### 2. Das Repository öffnen

Diese drei Dateien zeigen:

1. `README.md` – Einstieg für Nutzer und Entwickler
2. `config.ini` – lesbare Laufzeitkonfiguration
3. `index.html` – tatsächliche Anwendung

Dann erklären: Code allein beschreibt noch nicht zuverlässig, **warum** etwas so gebaut wurde und **wie** ein Agent ändern darf.

### 3. Das Projektgedächtnis zeigen

Öffne nacheinander:

- `AGENTS.md`
- `docs/README.md`
- `docs/project/project-brief.md`
- `docs/project/architecture.md`
- `docs/engineering/development-guidelines.md`
- `docs/engineering/decision-log.md`

Erklärung:

- `AGENTS.md` ist die Eingangstür für Agenten.
- der Projektüberblick beschreibt Ziel und Nicht-Ziele.
- die Architektur beschreibt Struktur und unveränderliche Regeln.
- Entwicklungsrichtlinien definieren Qualität und Tests.
- das Entscheidungsprotokoll verhindert, dass alte Diskussionen wiederholt werden.

### 4. Markdown als gemeinsame Sprache demonstrieren

Eine Überschrift in `docs/reference/markdown-cheatsheet.md` öffnen und zeigen:

- Quelldatei ist direkt lesbar.
- GitHub stellt sie formatiert dar.
- die Gliederung wird automatisch erzeugt.
- Überschriften haben direkte Sprunglinks.
- Git zeigt jede Änderung zeilenweise.

### 5. HTML-Dokumentation lokal starten

Unter Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-docs.txt
mkdocs serve
```

Dann im Browser die von MkDocs angezeigte lokale Adresse öffnen.

Zeigen:

- Navigation
- Seitengliederung
- Suche
- Links zwischen Dokumenten
- Bearbeitungslink zurück zum Repository

### 6. Einen Coding-Agenten starten

Beispielauftrag aus `prompt-examples.md` verwenden.

Der Agent soll zuerst die Wissensbasis lesen und anschließend beispielsweise:

- eine kleine Beschriftung verbessern,
- eine neue Testcheckliste ergänzen,
- oder einen Beispiel-Timer hinzufügen.

Vor der Umsetzung soll der Agent Plan, betroffene Dateien und Testidee nennen.

### 7. Den Unterschied sichtbar machen

Einen ungeführten Prompt gegenüberstellen:

```text
Mach die Seite besser.
```

Dann einen strukturierten Auftrag verwenden:

```text
Lies zuerst AGENTS.md und die dort genannten Projektdateien.
Verbessere danach ...
Erhalte dabei ...
Prüfe ...
Aktualisiere ...
```

Erklären: Das bessere Ergebnis entsteht nicht nur durch ein stärkeres Modell, sondern durch besseren Kontext, klare Grenzen und überprüfbare Kriterien.

## Kernaussagen für die Kollegen

1. **KI braucht Projektkontext, nicht nur Quellcode.**
2. **Wissen gehört versioniert zum Projekt.**
3. **Markdown ist gleichzeitig Menschen- und Agentenschnittstelle.**
4. **Der Agent setzt um; der Mensch bleibt verantwortlich.**
5. **Kleine überprüfbare Änderungen sind sicherer als autonome Großumbauten.**
6. **Dokumentation wird zusammen mit dem Code geändert.**
7. **Öffentliche Demo-Projekte dürfen keine internen Unternehmensdaten enthalten.**

## Übertragung auf ein neues Projekt

Kollegen können folgende Teile kopieren und anschließend durch einen Agenten anpassen lassen:

```text
AGENTS.md
.github/copilot-instructions.md
.github/instructions/
docs/
mkdocs.yml
requirements-docs.txt
```

Dabei müssen Projektziel, Architekturregeln, Testverfahren und Sicherheitsvorgaben vollständig auf das neue Projekt angepasst werden. Die Dateien dürfen nicht blind als universelle Wahrheit übernommen werden.

## Abschlussfrage an das Publikum

> Welche Information müsst ihr einem neuen menschlichen Entwickler immer wieder erklären – und warum steht sie noch nicht versioniert im Repository?
