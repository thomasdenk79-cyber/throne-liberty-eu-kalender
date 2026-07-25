---
title: Entscheidungsprotokoll
doc_type: reference
status: active
audience:
  - project-maintainer
  - developer
  - ai-agent
canonical: true
---

# Entscheidungsprotokoll

Dieses Protokoll verhindert, dass Menschen oder Agenten bereits geklärte Grundsatzfragen immer wieder neu entscheiden.

## Statuswerte

- **proposed:** vorgeschlagen, noch nicht verbindlich
- **accepted:** gültige Entscheidung
- **superseded:** durch eine neuere Entscheidung ersetzt
- **rejected:** bewusst nicht umgesetzt

## Entscheidungen

| ID | Status | Entscheidung | Begründung in Kürze |
|---|---|---|---|
| ADR-0001 | accepted | Markdown ist die kanonische Dokumentationsquelle; MkDocs erzeugt HTML. | menschen- und agentenlesbar, versionierbar, geringe Einstiegshürde |
| ADR-0002 | accepted | Die Anwendung bleibt zunächst statisch und backendfrei. | einfache Veröffentlichung, kein Serverbetrieb, lokale Datenhaltung |
| ADR-0003 | accepted | `config.ini` ist die einzige kanonische Quelle für Standardtimer. | Konfiguration bleibt lesbar, exportierbar und von Programmlogik getrennt |
| ADR-0004 | accepted | Projektwissen wird verdichtet im Repository gespeichert, nicht als rohe Chatkopie. | weniger Rauschen, nachvollziehbare Quellen der Wahrheit, agententauglicher Kontext |
| ADR-0005 | accepted | Dokumentation und Agentenanweisungen werden auf Deutsch geschrieben; technische Bezeichner bleiben Englisch. | verständlich für das Team, kompatibel mit Code und APIs |
| ADR-0006 | accepted | Restart-sensitive Anchor werden als validierte INI-Überlagerung beim Pages-Build aktualisiert. | Serverneustarts dürfen den Countdown nicht dauerhaft verschieben; INI bleibt das einzige Konfigurationsformat |
| ADR-0007 | accepted | Die Anwendung wird als PWA mit kleiner Offline-App-Shell ausgeliefert. | app-ähnliche Installation ohne APK oder Backend |
| ADR-0008 | accepted | Ein Repository-Taskboard bleibt die portable Quelle; Teams darf nur spiegeln. | nachvollziehbar, versioniert und unabhängig von einem einzelnen Kollaborationstool |
| ADR-0009 | accepted | Anwender-Neuigkeiten, technisches Changelog und Git-Commit erfüllen getrennte Zwecke. | verständliche Produktkommunikation ohne Verlust technischer Nachvollziehbarkeit |
| ADR-0010 | accepted | Themes sind vollständige visuelle Themenwelten; Bilder bleiben austauschbare, kategorisierte Assets. | konsistentes Erlebnis ohne Abhängigkeit von einer sofort vollständigen Bildbibliothek |
| ADR-0011 | accepted | Discord-Zugangsdaten werden niemals in Browsercode oder Repository gespeichert. | öffentliche GitHub-Pages-Dateien dürfen keine sendefähigen Secrets enthalten |
| ADR-0012 | accepted | Living-Brain-Grundsatzänderungen benötigen fähigkeitsbasiertes Review und bei Unsicherheit einen Taskboard-Handoff. | verhindert zufällige Regel- und Architekturdrift durch unvollständigen Kontext |
| ADR-0013 | accepted | Browser Research auditiert mindestens halbjährlich externe Standards; lokale Agenten validieren und implementieren reproduzierbar. | verbindet aktuelle Primärquellen mit tatsächlicher Code- und Testprüfung |
| ADR-0014 | accepted | Die statische Anwendung verwendet native ES-Module und externes CSS ohne verpflichtenden Build. | klare Verantwortungen und direkte GitHub-Pages-Auslieferung bleiben vereinbar |
| ADR-0015 | accepted | Der Local Chief Coding Agent darf Commits direkt auf `main` erstellen und pushen, ohne verpflichtenden Feature-Branch/PR-Umweg. | von Thomas als Product Owner autorisiert; Änderungen bleiben per Git-Revert risikofrei rücksetzbar |

## ADR-0001: Markdown als Quelle, HTML als Ausgabe

### Kontext

Die Dokumentation soll zugleich Projektgedächtnis für KI-Agenten, lesbare Repository-Dokumentation und vorzeigbare Website für Kollegen sein.

### Entscheidung

Markdown-Dateien unter `docs/` sind die editierbare Quelle. `mkdocs.yml` definiert Navigation und Darstellung. MkDocs erzeugt bei Bedarf eine statische HTML-Dokumentation im Verzeichnis `site/`.

### Folgen

- Änderungen werden im Git-Diff sichtbar.
- GitHub rendert die Quelldateien direkt.
- Menschen können eine navigierbare HTML-Seite verwenden.
- Agenten lesen strukturierte Klartextdateien.
- generierte HTML-Dateien dürfen nicht manuell gepflegt werden.

### Alternativen

- **reines HTML:** gut darstellbar, aber aufwendiger zu pflegen und schlechter als Wissensquelle zu überblicken
- **XML/DITA/DocBook:** stark strukturiert und validierbar, für dieses kleine Demo-Projekt jedoch unnötig komplex
- **Wiki:** bequem, aber vom Code und dessen Versionsstand getrennt

## ADR-0015: Direct-Push-Befugnis für den Local Chief Coding Agent

### Kontext

Der reguläre Feature-Branch-plus-Pull-Request-Ablauf (siehe `CONTRIBUTING.md`) erzeugt bei kleinen, vom Product Owner direkt beauftragten Fixes und Iterationen unnötige Wartezeit, ohne dass in der Praxis ein zweites Review stattfindet.

### Entscheidung

Thomas Denk (Product Owner, finale Instanz laut `docs/project/team-governance.md`) autorisiert den Local Chief Coding Agent (Copilot CLI in VS Code) am 2026-07-25, Commits direkt auf `main` zu erstellen und zu pushen, ohne dass dafür zwingend ein Feature-Branch und Pull Request nötig sind. Dies gilt ausschließlich für diesen Agenten in dieser Rolle, nicht pauschal für alle Agenten oder Menschen.

Unverändert bleiben:

- Commit-Metadaten-Pflicht (Was/Warum/Agent/Version/LLM) aus `AGENTS.md`.
- Living-Brain-Schutz: Grundsatzänderungen an Governance-, Architektur- oder Qualitätsdokumenten benötigen weiterhin einen sichtbaren Vermerk und im Zweifel Thomas' Freigabe (hier bereits erteilt).
- Qualitätspflicht: `npm run check` und relevante Doku-Builds bleiben vor jedem Push verpflichtend.
- Server-seitiger GitHub-Branchschutz (falls für `main` aktiviert) kann einen direkten Push weiterhin technisch verhindern; das liegt außerhalb der lokalen Repository-Konfiguration und muss ggf. separat von Thomas angepasst werden.

### Folgen

- Schnellere Iteration bei vom Product Owner direkt beauftragten Änderungen.
- Kein Vier-Augen-Review durch Dritte mehr vor dem Merge; Rücksetzung erfolgt bei Bedarf per `git revert`/`git reset`.
- Andere Mitwirkende (Junior Agents, externe Beiträge) folgen weiterhin dem Feature-Branch/PR-Ablauf aus `CONTRIBUTING.md`.

### Alternativen

- **Weiterhin PR-Pflicht für alle:** sicherer, aber unnötig langsam bei Aufgaben, die Thomas direkt und vollständig selbst beauftragt und prüft.
- **Branch-Schutz clientseitig deaktivieren:** kein sauberer Hebel, da Branchschutz serverseitig auf GitHub verwaltet wird.

## Neue Entscheidung ergänzen

Für kleine Entscheidungen genügt ein neuer Tabellenpunkt mit kurzem Abschnitt. Umfangreiche oder strittige Entscheidungen können später in einzelne Dateien unter `docs/decisions/` ausgelagert werden.

Vor dem Ergänzen prüfen:

1. Ist die Entscheidung dauerhaft relevant?
2. Verändert sie Architektur, Schnittstellen, Arbeitsweise oder Qualitätsregeln?
3. Ist sie nicht bereits an anderer Stelle entschieden?
4. Welche frühere Entscheidung ersetzt sie eventuell?
