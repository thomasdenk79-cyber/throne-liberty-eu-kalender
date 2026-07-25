---
title: Rollen und Governance
doc_type: explanation
status: active
audience:
  - project-maintainer
  - developer
  - ai-agent
canonical: true
---

# Rollen und Governance

## Teammodell

| Rolle | Besetzung | Entscheidungskompetenz |
|---|---|---|
| Product Owner, Projektleiter und finale Instanz | Thomas Denk | Ziele, Priorität, Konfliktentscheidung, fachliche Abnahme, Veröffentlichung |
| Browser Research & Chief AI | leistungsfähiger Browser-Chat mit Internetrecherche | periodischer Stand-der-Technik-Audit, Primärquellen, Architektur-/Security-Review |
| Local Chief Coding Agent | Copilot CLI in VS Code mit leistungsfähigem Modell | tatsächliche Repository-Analyse, Implementierung, lokale Tests, Diffs und CI-Nachweis |
| Junior AI Developer | klar begrenzter Coding-Agent | Umsetzung nach Vorgabe, Tests und Dokumentation; keine unreviewte Living-Brain-Grundsatzänderung |
| Junior Admin Runner | einfacher Agent | reproduzierbare Builds, Prüfungen und klar begrenzte Wartungsaufgaben |
| Human Reviewer / QA | Teammitglied | Bedienbarkeit, Spielrealität und Freigabe risikoreicher Änderungen |

## Review-Gates

1. **Scope Gate:** Ziel, Nicht-Ziele und betroffene Quellen sind klar.
2. **Design Gate:** Datenmodell, UX und Rückwärtskompatibilität passen zur Architektur.
3. **Security Gate:** Importdaten bleiben Text; keine Geheimnisse; minimale externe Datenflüsse.
4. **Quality Gate:** Syntax, Runtime-Smoke-Test, Doku-Build und relevante Randfälle sind geprüft.
5. **Human Gate:** Fachliche Zeiten und öffentliche Inhalte sind abgenommen.

Der Chief AI Reviewer darf Änderungen ablehnen, wenn Nachweise fehlen, unnötig große Diffs entstehen oder kanonische Quellen widersprüchlich werden. Die endgültige Produktfreigabe bleibt beim Menschen.

Die Rollen hängen von Fähigkeiten ab, nicht dauerhaft von einem Produkt- oder
Modellnamen. Thomas kann die Besetzung ändern. Browser- und lokale
Reasoning-Stufen sind nicht direkt vergleichbar und begründen allein keine
Freigabekompetenz.

## Living-Brain-Gate

Änderungen an Agentenanweisungen, Architektur, Governance,
Entwicklungsrichtlinien oder akzeptierten Entscheidungen benötigen:

1. einen klaren Anlass und betroffene kanonische Quellen,
2. einen Widerspruchs- und Auswirkungscheck,
3. passende Test-/Workflow-Anpassungen,
4. Review durch eine Instanz mit ausreichendem Kontext und Fähigkeiten,
5. bei Grundsatz- oder Konfliktfragen die Freigabe durch Thomas.

Kann ein Junior-Agent diese Prüfung nicht leisten, schreibt er nur einen
Taskboard-Vorschlag mit **Chief-AI-Review erforderlich**.

## Audit-Kadenz

Mindestens halbjährlich sowie anlassbezogen vor großen Architektur- oder
Security-Änderungen wird ein externer Stand-der-Technik-Audit durchgeführt.
Browser Research liefert Quellen und Empfehlungen; der lokale Agent gleicht
diese mit Code und Tests ab. Datum und Ergebnis werden im Decision Log
festgehalten, Maßnahmen im Taskboard verfolgt.

## Arbeitsaufteilung

```text
Thomas                Chief AI                 Junior Agent            CI
  │ Ziel + Priorität      │                         │                    │
  ├──────────────────────▶│ Architektur + Auftrag   │                    │
  │                       ├────────────────────────▶│ Umsetzung          │
  │                       │                         ├───────────────────▶│ Tests
  │                       │◀────────────────────────┤ Diff + Nachweis     │
  │                       │ Review / Korrektur      │                    │
  │◀──────────────────────┤ Freigabeempfehlung      │                    │
  │ fachliche Abnahme     │                         │                    │
```

## Commit- und Changelog-Verantwortung

Jeder Agenten-Commit nennt Was, Warum, Agent, Agentenversion, LLM und LLM-Version. Sichtbare Änderungen aktualisieren zusätzlich den [Changelog](changelog.md); Statusänderungen gehören ins [Taskboard](taskboard.md).

## Microsoft Teams

Teams ist eine mögliche Präsentationsschicht, aber nicht die Quelle der Wahrheit. Nach Verbindung des Teams-Plugins kann das Taskboard als Kanalbeitrag, adaptive Karte oder regelmäßiger Projektstatus gespiegelt werden. Autoritative Daten bleiben im Repository; Tokens und Webhook-URLs gehören ausschließlich in geschützte Secrets.

![Linny erobert Felswacht](../assets/linny/linny-felswacht-conqueror-v1.webp)

*Chief Review abgeschlossen: Burg Felswacht erfüllt jetzt knapp die Mindestanforderungen.*
