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

## Neue Entscheidung ergänzen

Für kleine Entscheidungen genügt ein neuer Tabellenpunkt mit kurzem Abschnitt. Umfangreiche oder strittige Entscheidungen können später in einzelne Dateien unter `docs/decisions/` ausgelagert werden.

Vor dem Ergänzen prüfen:

1. Ist die Entscheidung dauerhaft relevant?
2. Verändert sie Architektur, Schnittstellen, Arbeitsweise oder Qualitätsregeln?
3. Ist sie nicht bereits an anderer Stelle entschieden?
4. Welche frühere Entscheidung ersetzt sie eventuell?
