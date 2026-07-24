# Knowledge Policy

## Zweck

Diese Richtlinie legt fest, welche Informationen in die Wissensbasis aufgenommen werden, wie sie strukturiert werden und wie Qualität, Aktualität, Datenschutz und Nachvollziehbarkeit erhalten bleiben.

## Aufnahmeentscheidung

Eine Information wird aufgenommen, wenn mindestens eines gilt:

- sie beeinflusst zukünftige Entscheidungen,
- sie wird voraussichtlich mehrfach benötigt,
- sie erklärt eine wichtige Randbedingung,
- sie dokumentiert eine getroffene Entscheidung,
- sie verhindert, dass ein Fehler oder eine Recherche wiederholt wird,
- sie ist für die Übergabe an einen anderen Agenten notwendig.

Nicht aufnehmen:

- belanglose Gesprächsdetails,
- ungefilterte Chatprotokolle,
- temporäre Zwischenstände ohne Wiederverwendungswert,
- redundante Kopien bestehender Dokumente,
- Geheimnisse oder Inhalte außerhalb der zulässigen Klassifikation.

## Metadaten

Wichtige Wissensdateien beginnen möglichst mit:

```yaml
---
title: Kurzer Titel
status: confirmed | observed | assumed | proposed | deprecated | conflicted
owner: Mensch oder verantwortliche Rolle
updated: YYYY-MM-DD
review_due: YYYY-MM-DD oder null
classification: public | internal | confidential | restricted
sources:
  - Beschreibung oder Link/Referenz
related:
  - relative/datei.md
---
```

## Quellen und Belege

- Externe Fakten erhalten Quelle und Abrufdatum.
- Interne Fakten nennen das Ursprungssystem, Dokument, Ticket, Messskript oder den verantwortlichen Entscheider.
- Aussagen ohne Beleg werden als `assumed` oder `proposed` markiert.
- Zeitabhängige Recherche nennt einen Prüf- oder Gültigkeitszeitpunkt.
- Sekundärquellen dürfen Primärquellen nicht ohne Begründung ersetzen.

## Verdichtung statt Chatablage

Nach einem längeren Gespräch wird nicht das gesamte Gespräch gespeichert. Stattdessen werden getrennt festgehalten:

1. bestätigte neue Fakten,
2. getroffene Entscheidungen,
3. verworfene Alternativen mit Begründung,
4. offene Fragen,
5. nächste Arbeitsschritte,
6. relevante Quellen und Artefakte.

## Aktualisierung und Widersprüche

- Eine neuere Aussage ersetzt eine ältere nicht automatisch.
- Bei fachlicher Änderung wird das Dokument aktualisiert und die Änderung im Commit beschrieben.
- Historisch wichtige Altstände werden als `deprecated` markiert oder archiviert.
- Widersprüche erhalten den Status `conflicted`, bis sie geklärt sind.
- Kritische Entscheidungen werden über ADRs geändert oder aufgehoben.

## Datenschutz und Klassifikation

### public

Für öffentliche Repositories geeignet.

### internal

Nur für einen freigegebenen privaten Arbeitsbereich. Keine Veröffentlichung.

### confidential

Geschäfts-, Kunden-, Produktions-, Vertrags- oder personenbezogene Informationen mit erhöhtem Schutzbedarf.

### restricted

Zugangsdaten, Schlüssel, Tokens, besonders sensible personenbezogene Daten oder streng regulierte Inhalte. Diese gehören grundsätzlich nicht in die normale Git-Wissensbasis.

## Verbotene Inhalte

Unabhängig von der Klassifikation niemals unverschlüsselt in Git speichern:

- Passwörter und API-Tokens,
- private Schlüssel und Zertifikatsgeheimnisse,
- vollständige Zugangsdaten,
- produktive Datenbank-Dumps,
- ungekürzte personenbezogene Datensätze,
- Inhalte, deren Speicherung gegen Unternehmensrichtlinien verstößt.

## Review

Mindestens bei größeren Meilensteinen prüfen:

- Ist der Projektstatus aktuell?
- Sind Entscheidungen und Annahmen getrennt?
- Gibt es veraltete Forschungsstände?
- Sind sensible Inhalte korrekt klassifiziert?
- Sind Indexe und Verweise noch gültig?
- Kann ein neuer Agent den Stand ohne den ursprünglichen Chat verstehen?
