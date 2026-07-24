# Architecture Decision Records

## Zweck

Dieser Ordner enthält wichtige fachliche, technische und organisatorische Entscheidungen. ADRs verhindern, dass spätere Agenten nur das Ergebnis sehen, aber Anlass, Alternativen und Folgen nicht mehr verstehen.

## Benennung

```text
ADR-0001-kurzer-titel.md
ADR-0002-weiterer-titel.md
```

Nummern werden nicht wiederverwendet. Aufgehobene Entscheidungen bleiben erhalten und verweisen auf die nachfolgende ADR.

## Status

- `proposed`: zur Diskussion
- `accepted`: verbindlich beschlossen
- `deprecated`: weiterhin nachvollziehbar, aber nicht mehr empfohlen
- `superseded`: durch eine andere ADR ersetzt
- `rejected`: geprüft und verworfen

## Wann ist eine ADR erforderlich?

Eine ADR ist sinnvoll, wenn eine Entscheidung:

- mehrere Komponenten oder Teams beeinflusst,
- schwer oder teuer rückgängig zu machen ist,
- Sicherheits-, Betriebs- oder Datenfolgen hat,
- später wahrscheinlich erneut diskutiert wird,
- von einer wichtigen Alternative abweicht,
- als verbindliche Vorgabe für Agenten dienen soll.

## Mindestinhalt

```markdown
---
title: ADR-0001 – Titel
status: proposed
updated: YYYY-MM-DD
classification: public
---

# ADR-0001 – Titel

## Kontext

## Entscheidungstreiber

## Betrachtete Optionen

## Entscheidung

## Folgen

### Positiv

### Negativ

### Risiken

## Validierung

## Verweise
```

## Änderungsregel

Eine akzeptierte ADR wird nicht nachträglich so umgeschrieben, als wäre die ursprüngliche Entscheidung anders gewesen. Wesentliche Änderungen erfolgen über eine neue ADR, die die alte ersetzt oder ergänzt.
