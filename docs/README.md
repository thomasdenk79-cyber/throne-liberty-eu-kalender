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

<section class="linny-hero">
  <div class="linny-hero__copy">
    <span class="linny-kicker">Solisium Engineering Excellence</span>
    <div class="linny-hero-title">Linny führt. Menschen und KI liefern.</div>
    <p>Das gemeinsame, versionierte Projektgedächtnis für eine Event-App – und eine bewusst übertriebene Demo dafür, wie moderne Softwareentwicklung mit Menschen, Agenten und einer sehr epischen Zauberin aussehen kann.</p>
  </div>
</section>

<div class="linny-grid">
  <article class="linny-card">
    <h3>Für Nutzer</h3>
    <p>Timer starten, Warnungen einstellen, Termine exportieren und die App auf Handy oder Desktop installieren.</p>
    <p><a href="user/quickstart/">Zum Schnellstart →</a></p>
  </article>
  <article class="linny-card">
    <h3>Für Entwickler</h3>
    <p>Architektur, INI-Vertrag, Sicherheitsregeln, Tests und nachvollziehbare Entscheidungen.</p>
    <p><a href="project/architecture/">Architektur öffnen →</a></p>
  </article>
  <article class="linny-card">
    <h3>Für KI-Agenten</h3>
    <p>Rollen, Review-Gates, Kontextladeverfahren und ein Repository als belastbares Langzeitgedächtnis.</p>
    <p><a href="engineering/ai-assisted-development/">KI-Workflow ansehen →</a></p>
  </article>
</div>

Die Markdown-Dateien sind die gepflegte Quelle; MkDocs erzeugt daraus diese klickbare und durchsuchbare Website.

## Build-Vertrag fuer lokale Agenten (verbindlich)

Wenn ein Agent Markdown oder Doku-Struktur aendert, muss er lokal die Hilfe neu
bauen und pruefen. Quelle bleibt `docs/` (Docs-as-Code), nicht generiertes HTML.

```powershell
npm ci
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-docs.txt
.\.venv\Scripts\python.exe scripts\build_help.py --site-dir help
```

Optionale EN-Uebersetzung (default aus, um Tokens/API-Kosten zu sparen):

```powershell
set DOCS_TRANSLATION_MODEL=qwen3:8b
.\.venv\Scripts\python.exe scripts\build_help.py --site-dir help --translate-en --translator ollama
```

Alternativ (nur wenn bewusst konfiguriert):

```powershell
set OPENAI_API_KEY=...
set DOCS_TRANSLATION_MODEL=gpt-4o-mini
.\.venv\Scripts\python.exe scripts\build_help.py --site-dir help --translate-en --translator openai
```

Die erzeugte Hilfe enthaelt `help/.build-meta.json`. Der Pages-Workflow nutzt
eine bereits lokal erzeugte Hilfe nur bei passendem Fingerprint, sonst baut er
serverseitig ohne Uebersetzung neu (Fallback fuer Browser-Edits).

## Linny in völlig angemessenem Maßstab

<div class="linny-gallery">
  <figure>
    <img src="assets/linny/linny-felswacht-conqueror-v1.webp" alt="Linny vor Burg Felswacht, während sich eine große Armee verbeugt">
    <figcaption>Linny erobert Burg Felswacht mit dem kleinen Finger. Das Review dauerte länger.</figcaption>
  </figure>
  <figure>
    <img src="assets/linny/linny-kart-race-v1.webp" alt="Linny in einem magischen Kart auf einer bunten Rennstrecke">
    <figcaption>Continuous Delivery, jetzt mit Sternenantrieb und ohne Tempolimit.</figcaption>
  </figure>
  <figure>
    <img src="assets/linny/linny-baggersee-v1.webp" alt="Linny und Amitoi beim Baden an einem Bergsee">
    <figcaption>Nach dem Release: Baggersee. Der Drache hat selbstverständlich Schwimmflügel.</figcaption>
  </figure>
</div>

## Einstieg nach Rolle

| Rolle oder Aufgabe | Empfohlener Einstieg |
|---|---|
| Nutzer der Timer-Seite | [Projekt-README auf GitHub](https://github.com/thomasdenk79-cyber/throne-liberty-eu-kalender/blob/main/README.md) |
| neuer Entwickler | [Projektüberblick](project/project-brief.md) und [Architektur](project/architecture.md) |
| Coding-Agent | [AGENTS.md auf GitHub](https://github.com/thomasdenk79-cyber/throne-liberty-eu-kalender/blob/main/AGENTS.md), danach die dort verlinkten Dateien |
| GitHub Copilot | [AGENTS.md auf GitHub](https://github.com/thomasdenk79-cyber/throne-liberty-eu-kalender/blob/main/AGENTS.md), danach passende `.github/instructions/` |
| konkrete Implementierung | [Entwicklungsrichtlinien](engineering/development-guidelines.md) |
| KI-Workflow verstehen | [KI-gestützte Entwicklung](engineering/ai-assisted-development.md) |
| Markdown lernen | [Markdown-Kurzreferenz](reference/markdown-cheatsheet.md) |
| Demo für Kollegen | [Vorstellung für Kollegen](demo/colleague-demo.md) |

## Wissensbereiche

| Bereich | Zweck |
|---|---|
| `docs/user/` | Anwenderhilfe fuer Nutzung, Konfiguration und FAQ |
| `docs/project/` | Was ist das Projekt, warum gibt es das und wie ist es aufgebaut? |
| `docs/engineering/` | Wie wird entwickelt, getestet, dokumentiert und mit KI gearbeitet? |
| `docs/reference/` | kompakte Nachschlagewerke und Syntaxreferenzen |
| `docs/demo/` | Vorführung, Lernmaterial und wiederverwendbare Prompt-Beispiele |

## Oeffentliche Ziele auf GitHub Pages

- Hauptanwendung: `/`
- Hilfe und Doku: `/help/`

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
