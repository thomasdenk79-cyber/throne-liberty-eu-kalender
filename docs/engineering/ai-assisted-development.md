---
title: KI-gestützte Entwicklung
doc_type: how-to
status: active
audience:
  - project-maintainer
  - developer
  - ai-agent
canonical: true
---

# KI-gestützte Entwicklung

## Zielbild

Menschen und KI-Systeme übernehmen unterschiedliche Rollen. Die KI ersetzt weder fachliche Verantwortung noch Prüfung, sondern beschleunigt Recherche, Strukturierung, Umsetzung und Dokumentation.

| Rolle | Hauptverantwortung |
|---|---|
| Projektinhaber | Ziele, Prioritäten, fachliche Abnahme und Freigabe |
| Browser Research & Chief AI | externe Stand-der-Technik-Recherche, Architektur-/Security-Review und Freigabeempfehlung |
| Local Chief Coding Agent | Repository-Analyse, Implementierung, lokale Tests, Diffs und CI-Nachweis |
| Junior Coding-Agent | klar begrenzte Implementierung, Tests und Dokumentation nach Vorgabe |
| Junior Admin Runner | reproduzierbare Builds und einfache, risikoarme Wartungsaufgaben |
| Repository-Wissensbasis | dauerhafte, versionierte Übergabeschnittstelle zwischen allen Beteiligten |

## Warum das Repository als Gedächtnis dient

Chatverläufe sind für langfristige Projektarbeit allein nicht ausreichend. Wichtige Erkenntnisse werden deshalb verdichtet und als versionierte Dateien im Repository abgelegt.

Das bedeutet nicht, dass ein Agent automatisch alles weiß. Ein Agent erhält zuverlässigen Kontext, wenn:

1. `AGENTS.md` als eindeutiger Einstiegspunkt vorhanden ist,
2. die Wissensbasis klar gegliedert ist,
3. kanonische Quellen eindeutig benannt sind,
4. relevante Dateien für die konkrete Aufgabe gelesen werden,
5. neue Erkenntnisse nach der Arbeit zurückgeschrieben werden.

## Kontextladeverfahren

### Stufe 1: immer laden

- `AGENTS.md`
- `docs/README.md`
- `docs/project/project-brief.md`

### Stufe 2: nach Aufgabe laden

- Architekturänderung: `docs/project/architecture.md`
- Implementierung: `docs/engineering/development-guidelines.md`
- Dokumentation: `docs/engineering/documentation-guidelines.md`
- Timerdaten: `config.ini` und README-Abschnitt zur Konfiguration
- frühere Grundsatzentscheidung: `docs/engineering/decision-log.md`

### Stufe 3: betroffene Implementierung laden

Erst danach werden die konkret betroffenen Stellen aus `index.html`, `config.ini` oder anderen Dateien untersucht.

Dieses Vorgehen verhindert, dass irrelevante Dateien und lange Logs den Modellkontext unnötig belegen.

## Arbeitsauftrag an einen Coding-Agenten

Ein guter Auftrag enthält:

1. **Ziel:** Welcher Nutzen soll entstehen?
2. **Ausgangslage:** Was funktioniert bereits?
3. **Abgrenzung:** Was soll ausdrücklich nicht geändert werden?
4. **Akzeptanzkriterien:** Woran erkennt man Erfolg?
5. **Prüfung:** Welche Tests oder Ansichten sind relevant?
6. **Dokumentation:** Welche Wissensdateien müssen aktualisiert werden?

Beispielstruktur:

```text
Lies zuerst AGENTS.md und die dort verlinkten Projektdokumente.

Ziel:
...

Nicht-Ziele:
...

Akzeptanzkriterien:
- ...
- ...

Prüfe anschließend:
- ...

Aktualisiere bei Bedarf Architektur, README und Decision Log.
```

## Erwartete Agentenantwort

Vor größeren Änderungen soll der Agent kurz nennen:

- sein Verständnis der Aufgabe,
- Annahmen,
- betroffene Dateien,
- geplante Schritte,
- Testidee.

Nach der Umsetzung soll er liefern:

- Zusammenfassung der Änderungen,
- geänderte Dateien,
- durchgeführte Prüfungen,
- offene Risiken oder nicht geprüfte Punkte,
- aktualisierte Dokumentation.

## Review-Schleife

```text
Fachliches Ziel durch Menschen
        ↓
Konzept und Kontext in der Wissensbasis
        ↓
Umsetzung durch Coding-Agent
        ↓
automatische oder manuelle Tests
        ↓
Review auf Funktion, Architektur und Verständlichkeit
        ↓
Dokumentation und Entscheidungen aktualisieren
```

Details zu Zuständigkeiten, Ablehnungsgründen und Freigabe-Gates stehen unter [Rollen und Governance](../project/team-governance.md). Der aktuelle Arbeitsstand steht im [Taskboard](../project/taskboard.md).

## Periodischer Stand-der-Technik-Audit

Wenn der letzte dokumentierte Audit älter als sechs Monate ist oder vor einer
größeren Architektur-/Security-Änderung, beauftragt Thomas bevorzugt eine
Browser-Research-Instanz mit guter Internetrecherche. Sie prüft mit
Primärquellen:

- Web-, PWA-, Accessibility- und Security-Standards,
- unterstützte Laufzeiten, Actions und Abhängigkeiten,
- Programmier-, Test- und Dokumentationsrichtlinien,
- Architekturgrenzen und bekannte technische Schuld,
- Qualität, Konsistenz und Kontextkosten des Living Brain.

Das Ergebnis nennt Quellen und Abrufdatum, unterscheidet Muss/Soll/Kann und
erzeugt reviewbare Vorschläge. Es ändert akzeptierte Grundsätze nicht allein.
Der lokale Agent validiert die tatsächliche Codebasis, setzt freigegebene
Änderungen um und führt reproduzierbare Tests aus. Der Audit wird im Decision
Log vermerkt; offene Maßnahmen kommen ins Taskboard.

Reasoning-Einstellungen wie `medium`, `high` oder `max` sind
produktspezifische Laufzeitoptionen und nicht zwischen Browser und lokalem
Agenten direkt vergleichbar. Für Zuständigkeit und Vertrauen zählen
nachweisbare Recherche-, Kontext-, Werkzeug- und Testfähigkeiten.

## Regeln gegen typische KI-Fehler

- Keine Behauptung über Code machen, der nicht gelesen wurde.
- Keine erfolgreiche Prüfung behaupten, wenn sie nicht ausgeführt wurde.
- Keine Anforderungen erfinden, um Lücken bequem zu schließen.
- Keine großen Umbauten als Nebeneffekt einer kleinen Aufgabe.
- Keine Dokumente erstellen, die nur denselben Inhalt duplizieren.
- Bei Konflikten gilt die ausdrücklich benannte kanonische Quelle.
- Veraltete Dokumentation wird korrigiert oder klar als veraltet markiert.
- Unsicherheit wird benannt, nicht sprachlich versteckt.

## Wann ChatGPT und wann Coding-Agent?

### ChatGPT im Web

Geeignet für:

- aktuelle Recherche und Quellenvergleich
- Architektur- und Prozesskonzepte
- Anforderungsanalyse
- verständliche Dokumentation
- Workshop- und Demo-Konzeption
- Review über mehrere Themenbereiche

### Coding-Agent im Repository

Geeignet für:

- konkrete Dateiänderungen
- Implementierung über mehrere Dateien
- Ausführen von Tests und Befehlen
- Fehlersuche anhand der tatsächlichen Codebasis
- Erstellen nachvollziehbarer Diffs

## Aktualisierung des Projektgedächtnisses

Nach jeder relevanten Arbeit wird geprüft:

- Hat sich das Zielbild geändert?
- Hat sich Architektur oder Datenfluss geändert?
- Gibt es eine neue dauerhafte Entwicklungsregel?
- Wurde eine Grundsatzentscheidung getroffen?
- Ist eine bisherige Annahme widerlegt worden?

Nur dauerhaft relevantes Wissen wird aufgenommen. Tagesnotizen, lange Chatprotokolle und rohe Logs gehören nicht ungefiltert in die kanonische Wissensbasis.
