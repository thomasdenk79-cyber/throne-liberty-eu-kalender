---
applyTo: "README.md,AGENTS.md,docs/**/*.md,mkdocs.yml"
---

# Dokumentations-Instruktionen

## Vor Änderungen lesen

- `docs/README.md`
- `docs/engineering/documentation-guidelines.md`
- bei fachlichen Änderungen die jeweilige kanonische Projektdatei

## Regeln

- Dokumentation auf Deutsch schreiben; technische Bezeichner bleiben Englisch.
- Markdown ist die kanonische Quelle, nicht generiertes HTML unter `site/`.
- Pro Datei genau eine `#`-Überschrift verwenden.
- Überschriftenebenen nicht überspringen.
- Relative Links innerhalb von `docs/` verwenden.
- Inhalte außerhalb von `docs/`, die nicht in die HTML-Seite eingebaut werden, als Repository-Link oder als klaren Dateipfad nennen.
- Keine zweite Quelle der Wahrheit erzeugen; auf die kanonische Datei verweisen.
- YAML-Frontmatter vorhandener kanonischer Dokumente erhalten und sinnvoll aktualisieren.
- Keine vertraulichen Unternehmensinformationen oder personenbezogenen Daten ergänzen.
- Rohe Chatprotokolle nicht als Projektdokumentation übernehmen; Wissen verdichten.

## Abschlussprüfung

- stimmen Links und Überschriften?
- ist die Datei in `mkdocs.yml` auffindbar, falls sie zur sichtbaren Dokumentation gehört?
- wurde bei einer Grundsatzentscheidung das Entscheidungsprotokoll aktualisiert?
- passt die Dokumentation zum tatsächlich implementierten Verhalten?
