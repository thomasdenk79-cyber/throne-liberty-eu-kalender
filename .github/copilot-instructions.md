# GitHub Copilot Repository Instructions

Antworte und dokumentiere in diesem Repository bevorzugt auf Deutsch. Klassen-, Funktions-, Variablen-, Datei- und API-Namen bleiben Englisch.

## Projektkontext

Dieses Projekt ist eine statische GitHub-Pages-Webseite: ein konfigurationsbasierter Event-Timer für Throne and Liberty EU. Es dient zugleich als Demo, wie KI-gestützte Entwicklung mit Markdown-Wissensbasis, Coding-Guidelines und Agenten-Instruktionen funktionieren kann.

## Vor jeder Änderung lesen

- `AGENTS.md`
- `docs/README.md`
- `docs/project/project-brief.md`
- `docs/project/architecture.md`
- `docs/engineering/development-guidelines.md`
- `docs/engineering/ai-assisted-development.md`
- bei Dokumentationsarbeiten `docs/engineering/documentation-guidelines.md`
- bei Grundsatzentscheidungen `docs/engineering/decision-log.md`
- bei UI- und Theme-Arbeiten `docs/engineering/design-system.md`

Lade anschließend nur die für die konkrete Aufgabe relevanten Implementierungsdateien und zusätzlichen Dokumente.

## Coding-Regeln

- Halte die Anwendung statisch und ohne Build-Abhängigkeit, solange nicht explizit anders beauftragt.
- Verändere `config.ini` kompatibel: bestehende Timer-Definitionen dürfen nicht brechen.
- UI-Änderungen müssen responsiv bleiben.
- Verwende bei bekannten Aktionen bevorzugt verständliche Symbole mit Tooltip,
  `aria-label`, Fokus- und Touchbedienung. Text bleibt bei unbekannten oder
  riskanten Aktionen erhalten.
- Accessibility beachten: Kontraste, Tastaturbedienung, reduzierte Bewegung und verständliche Beschriftungen.
- Keine externen Tracking-Skripte oder unnötigen CDN-Abhängigkeiten ergänzen.
- Keine Secrets oder personenbezogenen Daten committen.
- Keine Siemens-internen Informationen in dieses öffentliche Repository schreiben.
- Bei größeren Änderungen zuerst kurz Verständnis, Annahmen, betroffene Dateien, Plan und Testidee nennen.
- Behaupte keine erfolgreiche Prüfung, die nicht tatsächlich ausgeführt wurde.
- Richte fehlende Projektwerkzeuge reproduzierbar nach
  `docs/engineering/development-guidelines.md` ein; verwende keine
  undokumentierten globalen Testabhängigkeiten.
- Pflege bei Verhaltens-, Architektur- oder Werkzeugänderungen die zugehörigen
  Tests, Workflows und kanonischen Dokumente im selben Änderungssatz.

## Living-Brain-Schutz

`AGENTS.md`, diese Datei, `.github/agents/`, `.github/instructions/` sowie die
kanonischen Architektur-, Governance-, Entwicklungs- und Entscheidungsdokumente
bestimmen das Verhalten späterer Menschen und Agenten. Ändere sie nur nach
Prüfung von Geltungsbereich, Widersprüchen und Folgewirkungen.

Wenn deine Fähigkeiten, dein Kontext oder deine Prüfmöglichkeiten für eine
Grundsatzänderung nicht ausreichen, ändere die Regel nicht. Ergänze stattdessen
im Taskboard einen reviewbaren Vorschlag mit Risiko, Akzeptanzkriterien und
`Chief-AI-Review erforderlich`. Modell- oder Anbietername allein ist kein
Qualitätsnachweis. Die finale Entscheidung liegt bei Thomas.

## Quellen der Wahrheit

- `config.ini`: Standardtimer und Kategorien
- `index.html`: implementiertes Verhalten
- `docs/project/project-brief.md`: Zielbild und Nicht-Ziele
- `docs/project/architecture.md`: Architektur
- `docs/engineering/development-guidelines.md`: Entwicklungsqualität
- `docs/engineering/decision-log.md`: Grundsatzentscheidungen

Keine widersprüchliche zweite Quelle der Wahrheit erzeugen. Bestehende kanonische Dateien aktualisieren oder auf sie verweisen.

## Dokumentation

Wenn Code oder Verhalten geändert wird, prüfe immer, ob diese Dateien aktualisiert werden müssen:

- `README.md`
- `docs/project/project-brief.md`
- `docs/project/architecture.md`
- `docs/engineering/development-guidelines.md`
- `docs/engineering/decision-log.md`
- passende Referenz- oder Demo-Seiten
- `docs/user/whats-new.md` bei sichtbaren Funktionen oder wichtigen Bugfixes
- `docs/project/changelog.md` für die technische Release-Historie
- `docs/project/taskboard.md` für Status und noch ausstehende Abnahmen

Die verbindliche Zuordnung steht im
`docs/engineering/documentation-guidelines.md#dokumentationsvertrag-fuer-agenten`.
Akzeptierte Entscheidungen niemals still überschreiben; Widerspruch benennen und
eine reviewbare Gedächtnisänderung vorschlagen.

Markdown unter `docs/` ist die Quelle. `site/` ist generierte MkDocs-Ausgabe und darf nicht manuell bearbeitet werden. Neue sichtbare Seiten in `mkdocs.yml` einsortieren.

## Stil

- Schreibe klar, knapp und nachvollziehbar.
- Begründe technische Entscheidungen kurz.
- Lieber kleine, überprüfbare Schritte als große unübersichtliche Umbauten.
- Verdichte dauerhaftes Wissen; übernimm keine rohen Chatprotokolle.

## Commit-Metadaten (Pflicht fuer Agenten-Commits)

Wenn ein Agent einen Commit erstellt, muss die Commit Message neben dem Aenderungsinhalt auch Folgendes enthalten:

- warum die Aenderung gemacht wurde
- Agentenname
- Agentenversion
- LLM-Name
- LLM-Version

Beispielzeile fuer den Commit-Body:

`why: ... | agent: GitHub Copilot | agent_version: 1.0 | llm: GPT-5.3-Codex | llm_version: GPT-5.3-Codex`
