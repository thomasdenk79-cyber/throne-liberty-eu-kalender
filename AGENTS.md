# AGENTS.md

Dieses Repository dient als kleines Demo-Projekt für KI-unterstützte Entwicklung. Es enthält eine statische Event-Timer-Webseite und gleichzeitig eine dokumentierte Arbeitsweise, wie Menschen, ChatGPT und Coding-Agenten gemeinsam entwickeln können.

## Rolle der Agenten

Agenten handeln nicht autonom ins Blaue hinein. Sie arbeiten als technische Umsetzer innerhalb dieses Repositories.

Vor jeder größeren Änderung zuerst lesen:

1. `README.md` für Projektzweck und Bedienung
2. `docs/README.md` für die Wissensstruktur
3. `docs/project/project-brief.md` für Zielbild und Nicht-Ziele
4. `docs/project/architecture.md` für Architektur und wichtige technische Regeln
5. `docs/engineering/development-guidelines.md` für Coding- und Testregeln
6. `docs/engineering/ai-assisted-development.md` für den KI-Workflow
7. bei Dokumentationsarbeiten `docs/engineering/documentation-guidelines.md`
8. bei Grundsatzfragen `docs/engineering/decision-log.md`

## Arbeitsprinzip

- Erst verstehen, dann ändern.
- Kleine nachvollziehbare Änderungen bevorzugen.
- Bestehendes Verhalten erhalten, außer die Aufgabe verlangt explizit etwas anderes.
- Keine geheimen Zugangsdaten, Tokens oder personenbezogenen Daten ins Repository schreiben.
- Keine Siemens-internen Inhalte in dieses öffentliche Privat-Repository aufnehmen.
- Dokumentation auf Deutsch schreiben; technische Bezeichner bleiben Englisch.
- Bei Unsicherheit Annahmen sichtbar dokumentieren.
- Jede relevante Änderung in der Dokumentation nachziehen.
- Keine erfolgreiche Prüfung behaupten, die nicht tatsächlich durchgeführt wurde.

## Quellen der Wahrheit

- `config.ini`: Standardkategorien und Standardtimer
- `index.html`: tatsächlich implementiertes Anwendungsverhalten
- `docs/project/project-brief.md`: Ziele und Nicht-Ziele
- `docs/project/architecture.md`: Architektur und Datenfluss
- `docs/engineering/development-guidelines.md`: Entwicklungsqualität
- `docs/engineering/decision-log.md`: dauerhafte Grundsatzentscheidungen

Bei Widersprüchen nicht still eine neue Variante ergänzen. Die kanonische Quelle prüfen und den Widerspruch sichtbar korrigieren.

## Definition of Done

Eine Änderung ist erst fertig, wenn:

- die Seite weiterhin als statische GitHub-Pages-Seite funktioniert,
- `index.html`, `config.ini` und Dokumentation konsistent sind,
- neue Konfigurationen importierbar/exportierbar bleiben,
- die Bedienung für Nicht-Programmierer verständlich bleibt,
- relevante Ansichten und Randfälle geprüft wurden,
- und ein kurzer Testnachweis oder eine ehrliche Liste nicht geprüfter Punkte vorliegt.

## Umgang mit Kontext

Dieses Repository ist die gemeinsame Schnittstelle zwischen Mensch, ChatGPT und lokalen Agenten. Agenten sollen nicht das gesamte Repository ungefiltert in den Kontext laden, sondern gezielt über Indexdateien einsteigen:

- Einstieg: `docs/README.md`
- Projektverstehen: `docs/project/`
- Umsetzung: `docs/engineering/`
- kompakte Syntax und Regeln: `docs/reference/`
- Demo und Wissenstransfer: `docs/demo/`

Wenn eine neue Erkenntnis wichtig für spätere Arbeit ist, wird sie verdichtet in der passenden Markdown-Datei oder im Decision Log abgelegt. Rohe Chatprotokolle und lange Logs werden nicht ungefiltert zum Projektgedächtnis.

## Dokumentationsausgabe

Markdown unter `docs/` ist die gepflegte Quelle. `mkdocs.yml` erzeugt daraus bei Bedarf eine HTML-Dokumentation.

- `site/` ist generierte Ausgabe und darf nicht manuell bearbeitet werden.
- Neue sichtbare Dokumentationsseiten werden in `mkdocs.yml` einsortiert.
- Interne Links innerhalb von `docs/` bleiben relativ.
