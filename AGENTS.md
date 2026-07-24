# AGENTS.md

Dieses Repository dient als kleines Demo-Projekt fuer KI-unterstuetzte Entwicklung. Es enthaelt eine statische Event-Timer-Webseite und gleichzeitig eine dokumentierte Arbeitsweise, wie Menschen, ChatGPT und Coding-Agenten gemeinsam entwickeln koennen.

## Rolle der Agenten

Agenten handeln nicht autonom ins Blaue hinein. Sie arbeiten als technische Umsetzer innerhalb dieses Repositories.

Vor jeder groesseren Aenderung zuerst lesen:

1. `README.md` fuer Projektzweck und Bedienung
2. `docs/README.md` fuer die Wissensstruktur
3. `docs/project/project-brief.md` fuer Zielbild und Nicht-Ziele
4. `docs/project/architecture.md` fuer Architektur und wichtige technische Entscheidungen
5. `docs/engineering/development-guidelines.md` fuer Coding-Regeln
6. `docs/engineering/ai-assisted-development.md` fuer den KI-Workflow

## Arbeitsprinzip

- Erst verstehen, dann aendern.
- Kleine nachvollziehbare Aenderungen bevorzugen.
- Bestehendes Verhalten erhalten, ausser die Aufgabe verlangt explizit etwas anderes.
- Keine geheimen Zugangsdaten, Tokens oder personenbezogenen Daten ins Repository schreiben.
- Keine Siemens-internen Inhalte in dieses oeffentliche Privat-Repository aufnehmen.
- Dokumentation auf Deutsch schreiben; technische Bezeichner bleiben Englisch.
- Bei Unsicherheit Annahmen sichtbar dokumentieren.
- Jede relevante Aenderung in der Dokumentation nachziehen.

## Definition of Done

Eine Aenderung ist erst fertig, wenn:

- die Seite weiterhin als statische GitHub-Pages-Seite funktioniert,
- `index.html`, `config.ini` und Dokumentation konsistent sind,
- neue Konfigurationen importierbar/exportierbar bleiben,
- die Bedienung fuer Nicht-Programmierer verstaendlich bleibt,
- ein kurzer Testplan oder eine manuelle Pruefung dokumentiert ist.

## Umgang mit Kontext

Dieses Repository ist die gemeinsame Schnittstelle zwischen Mensch, ChatGPT und lokalen Agenten. Agenten sollen nicht das gesamte Repository in den Kontext laden, sondern gezielt ueber Indexdateien einsteigen:

- Einstieg: `docs/README.md`
- Projektverstehen: `docs/project/`
- Umsetzung: `docs/engineering/`
- Demo und Wissenstransfer: `docs/demo/`

Wenn eine neue Erkenntnis wichtig fuer spaetere Arbeit ist, wird sie als Markdown-Datei oder als Eintrag im Decision Log abgelegt.
