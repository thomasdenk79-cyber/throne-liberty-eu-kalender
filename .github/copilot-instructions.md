# GitHub Copilot Repository Instructions

Antworte und dokumentiere in diesem Repository bevorzugt auf Deutsch. Klassen-, Funktions-, Variablen-, Datei- und API-Namen bleiben Englisch.

## Projektkontext

Dieses Projekt ist eine statische GitHub-Pages-Webseite: ein konfigurationsbasierter Event-Timer fuer Throne and Liberty EU. Es dient zugleich als Demo, wie KI-gestuetzte Entwicklung mit Markdown-Wissensbasis, Coding-Guidelines und Agenten-Instruktionen funktionieren kann.

## Vor jeder Aenderung lesen

- `AGENTS.md`
- `docs/README.md`
- `docs/project/project-brief.md`
- `docs/project/architecture.md`
- `docs/engineering/development-guidelines.md`
- `docs/engineering/ai-assisted-development.md`

## Coding-Regeln

- Halte die Anwendung statisch und ohne Build-Abhaengigkeit, solange nicht explizit anders beauftragt.
- Veraendere `config.ini` kompatibel: bestehende Timer-Definitionen duerfen nicht brechen.
- UI-Aenderungen muessen responsiv bleiben.
- Accessibility beachten: Kontraste, Tastaturbedienung, reduzierte Bewegung, verstaendliche Beschriftungen.
- Keine externen Tracking-Skripte oder unnoetigen CDN-Abhaengigkeiten ergaenzen.
- Keine Secrets oder personenbezogenen Daten committen.
- Bei groesseren Aenderungen zuerst kurz Plan, betroffene Dateien und Testidee nennen.

## Dokumentation

Wenn Code oder Verhalten geaendert wird, pruefe immer, ob diese Dateien aktualisiert werden muessen:

- `README.md`
- `docs/project/architecture.md`
- `docs/engineering/development-guidelines.md`
- `docs/engineering/decision-log.md`

## Stil

- Schreibe klar, knapp und nachvollziehbar.
- Begruende technische Entscheidungen kurz.
- Lieber kleine, reviewbare Schritte als grosse unuebersichtliche Umbauten.
