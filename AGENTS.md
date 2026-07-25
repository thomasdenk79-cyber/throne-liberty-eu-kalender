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
9. bei sichtbaren UI-Arbeiten `docs/engineering/design-system.md`
10. bei Dokumentationswirkung `docs/engineering/documentation-guidelines.md#dokumentationsvertrag-fuer-agenten`

## Arbeitsprinzip

- Erst verstehen, dann ändern.
- Kleine nachvollziehbare Änderungen bevorzugen.
- Bestehendes Verhalten erhalten, außer die Aufgabe verlangt explizit etwas anderes.
- Keine geheimen Zugangsdaten oder Tokens ins Repository schreiben. Personenbezogene Daten sind nur in der ausdrücklich freigegebenen gesetzlichen Anbieterangabe zulässig; niemals in Beispielen, Logs oder Testdaten.
- Keine Siemens-internen Inhalte in dieses öffentliche Privat-Repository aufnehmen.
- Dokumentation auf Deutsch schreiben; technische Bezeichner bleiben Englisch.
- Bei Unsicherheit Annahmen sichtbar dokumentieren.
- Jede relevante Änderung in der Dokumentation nachziehen.
- Keine erfolgreiche Prüfung behaupten, die nicht tatsächlich durchgeführt wurde.

## Geschütztes Projektgedächtnis

Diese Dateien bilden das **Living Brain** des Projekts und steuern Ziele,
Architektur, Agentenverhalten und Qualitätsregeln:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/agents/` und `.github/instructions/`
- `docs/project/project-brief.md`
- `docs/project/architecture.md`
- `docs/project/team-governance.md`
- `docs/engineering/development-guidelines.md`
- `docs/engineering/ai-assisted-development.md`
- `docs/engineering/documentation-guidelines.md`
- `docs/engineering/decision-log.md`

Änderungen daran benötigen besondere Sorgfalt. Ein Agent beurteilt nicht nach
einem Modellnamen, sondern nach seinen nachweisbaren Fähigkeiten, seinem
Kontext und seiner Sicherheit bei der konkreten Entscheidung. Kann er
Auswirkungen oder Widersprüche nicht vollständig prüfen, darf er keine
Grundsatzregel eigenmächtig ändern. Er erstellt stattdessen einen konkreten
Vorschlag im `docs/project/taskboard.md` mit Kontext, betroffenen Quellen,
Risiko, Akzeptanzkriterien und dem Vermerk **Chief-AI-Review erforderlich**.
Thomas entscheidet bei Konflikten und Freigaben endgültig.

## Testpflicht und Umgebungen

Jede Umgebung prüft das, was sie nachweisbar ausführen kann:

- Browser-Chat: Anforderungen, aktuelle externe Quellen, UX und sichtbares
  Verhalten prüfen; nicht ausgeführte lokale Tests als offen kennzeichnen.
- Lokaler Coding-Agent: Abhängigkeiten reproduzierbar installieren,
  `npm run check`, Python-Syntax, `mkdocs build --strict` und
  `python scripts/build_help.py --site-dir help` ausführen sowie relevante
  manuelle Browserfälle dokumentieren.
- CI: dieselben deterministischen Anwendungs- und Dokumentationsprüfungen auf
  einem sauberen Checkout wiederholen und Deployment blockieren.

Fehlen Werkzeuge, werden sie nach den versionierten Projektdateien eingerichtet:
Node.js 24, `npm ci`, Python-Venv und
`pip install -r requirements-docs.txt`. Keine globalen Ad-hoc-Werkzeuge zur
Pflicht machen. Werden Verhalten, Module, Testwerkzeuge oder Prozesse geändert,
müssen Tests, Workflows und betroffene Living-Brain-Dokumente im selben
Änderungssatz nachgezogen werden.

Für optionale EN-Doku gilt: Übersetzung nur bei explizitem Auftrag
(`python scripts/build_help.py --translate-en ...`), default ohne Übersetzung,
um Tokens/Kosten zu sparen.

## Visuelle Prüfung bei UI-/Layout-Änderungen

Da Thomas selbst keine Screenshots hochladen kann, muss ein Agent bei jeder
Änderung an `index.html`, `assets/styles/app.css` oder layoutrelevantem
`assets/js/app.js`-Code die Seite tatsächlich rendern und ansehen, bevor er
"fertig" meldet:

1. `npm run visual:local` ausführen (startet einen lokalen statischen Server,
   akzeptiert automatisch den Speicher-Consent-Dialog und schreibt
   Desktop-/Mobile-Screenshots nach `tests/visual-baselines/`).
2. Die erzeugten PNGs mit dem Bild-/View-Werkzeug tatsächlich ansehen, nicht
   nur "Datei existiert" prüfen.
3. Nach einem Deploy zusätzlich `npm run visual:live` gegen die echte
   GitHub-Pages-URL laufen lassen, um Cache-/Deploy-Probleme sichtbar zu
   machen (Konsole-Fehler, fehlgeschlagene Requests ≥400).
4. `tests/visual-baselines/*.png` (aktueller Stand, keine Historie) wird mit
   committet, damit der jeweils letzte bekannte visuelle Zustand im Repo
   nachvollziehbar bleibt. Der Ordner `tests/visual-baselines/history/`
   sammelt Zeitstempel-Kopien nur lokal (per `.gitignore` ausgeschlossen), um
   den Repo-Wachstum nicht unbegrenzt zu treiben.

Das Werkzeug dafür ist `scripts/visual_check.mjs` (Playwright, permanente
Dev-Dependency). Es ist kein Ersatz für `npm run check`, sondern eine
zusätzliche, verpflichtende Sichtprüfung für sichtbare Änderungen.

## Quellen der Wahrheit

- `config.ini`: Standardkategorien und Standardtimer
- `index.html`: tatsächlich implementiertes Anwendungsverhalten
- `docs/project/project-brief.md`: Ziele und Nicht-Ziele
- `docs/project/architecture.md`: Architektur und Datenfluss
- `docs/engineering/development-guidelines.md`: Entwicklungsqualität
- `docs/engineering/decision-log.md`: dauerhafte Grundsatzentscheidungen
- `docs/project/changelog.md`: menschenlesbare Release-Historie
- `docs/project/taskboard.md`: versionierter Arbeitsstatus und Demo-Backlog

Bei Widersprüchen nicht still eine neue Variante ergänzen. Die kanonische Quelle prüfen und den Widerspruch sichtbar korrigieren.

## Definition of Done

Eine Änderung ist erst fertig, wenn:

- die Seite weiterhin als statische GitHub-Pages-Seite funktioniert,
- `index.html`, `config.ini` und Dokumentation konsistent sind,
- neue Konfigurationen importierbar/exportierbar bleiben,
- die Bedienung für Nicht-Programmierer verständlich bleibt,
- relevante Ansichten und Randfälle geprüft wurden,
- bei sichtbaren UI-/Layout-Änderungen zusätzlich `npm run visual:local`
  (und nach Deploy `npm run visual:live`) ausgeführt und die Screenshots
  tatsächlich angesehen wurden (siehe „Visuelle Prüfung bei UI-/Layout-
  Änderungen“),
- und ein kurzer Testnachweis oder eine ehrliche Liste nicht geprüfter Punkte vorliegt.
- sichtbare Änderungen im Changelog und betroffene Aufgaben im Taskboard gepflegt sind.
- nutzerrelevante Änderungen zusätzlich unter `docs/user/whats-new.md` verständlich beschrieben sind.

## Umgang mit Kontext

Dieses Repository ist die gemeinsame Schnittstelle zwischen Mensch, ChatGPT und lokalen Agenten. Agenten sollen nicht das gesamte Repository ungefiltert in den Kontext laden, sondern gezielt über Indexdateien einsteigen:

- Einstieg: `docs/README.md`
- Projektverstehen: `docs/project/`
- Umsetzung: `docs/engineering/`
- kompakte Syntax und Regeln: `docs/reference/`
- Demo und Wissenstransfer: `docs/demo/`

Wenn eine neue Erkenntnis wichtig für spätere Arbeit ist, wird sie verdichtet in der passenden Markdown-Datei oder im Decision Log abgelegt. Rohe Chatprotokolle und lange Logs werden nicht ungefiltert zum Projektgedächtnis.

Akzeptierte Architektur- oder Prozessentscheidungen werden nicht still
überschrieben. Ein Agent benennt den Widerspruch, schlägt die Gedächtnisänderung
reviewbar vor und fordert bei wesentlicher Abweichung eine fachliche Bestätigung
an. Das Repository-Gedächtnis darf sich entwickeln, aber nicht zufällig driften.

## Dokumentationsausgabe

Markdown unter `docs/` ist die gepflegte Quelle. `mkdocs.yml` erzeugt daraus bei Bedarf eine HTML-Dokumentation.

- `site/` ist generierte Ausgabe und darf nicht manuell bearbeitet werden.
- Neue sichtbare Dokumentationsseiten werden in `mkdocs.yml` einsortiert.
- Interne Links innerhalb von `docs/` bleiben relativ.

## Commit-Identitaet

Dieses Repository ist oeffentlich und gehoert dem privaten Account
`thomasdenk79-cyber` (Push-Zugriff ueber dessen lokal hinterlegtes
Credential). Der Siemens-Account (`thomas-denk_SAGCP`) ist ein GitHub
Enterprise Managed User und kann laut GitHub-Richtlinie nicht als
Collaborator auf oeffentlichen Repos ausserhalb der Siemens-Enterprise
hinzugefuegt werden ("Managed user accounts cannot create public content
or collaborate outside your enterprise"). Push-Rechte haengen daher nicht
von der Commit-Autoren-Identitaet ab.

Damit dennoch nachvollziehbar bleibt, welches Werkzeug einen Commit erzeugt
hat, gilt folgende Autoren-Konvention (rein informativ, nicht
sicherheitsrelevant):

- **GitHub Copilot CLI in VS Code (Siemens-SSO-Login):** Commit-Autor
  `Thomas <Thomas.denk@siemens.com>` (lokaler globaler Git-Default).
- **Andere/lokale Agenten mit eigenem Git-Login:** Commit-Autor
  `thomasdenk79-cyber <thomas.denk79@gmail.com>`.

Ein Agent aendert die lokale Git-Identitaet nicht eigenmaechtig auf ein
drittes Konto und schreibt niemals Zugangsdaten oder Tokens in Repository-
Dateien.

## Commit-Vorgaben fuer Agenten

Wenn ein Agent Commits erstellt, muss die Commit Message immer enthalten:

1. Ticket oder Kontextbezug (falls vorhanden)
2. Was geaendert wurde
3. Warum die Aenderung gemacht wurde
4. Agentenname
5. Agentenversion
6. LLM-Name
7. LLM-Version

Beispiel (Kurzform):

`docs/assets: move Linny images to structured folder and update references`
`why: improve repository clarity and keep links consistent`
`agent: GitHub Copilot | agent_version: 1.0 | llm: GPT-5.3-Codex | llm_version: GPT-5.3-Codex`
