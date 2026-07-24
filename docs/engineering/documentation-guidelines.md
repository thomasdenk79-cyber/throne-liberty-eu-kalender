---
title: Dokumentationsrichtlinien
doc_type: reference
status: active
audience:
  - project-maintainer
  - developer
  - ai-agent
canonical: true
---

# Dokumentationsrichtlinien

## Grundentscheidung

Die Dokumentation wird nach dem **Docs-as-Code-Prinzip** gepflegt:

- Markdown-Dateien sind die editierbare Quelle.
- Git speichert Änderungen, Autorenschaft und Historie.
- MkDocs erzeugt daraus eine klickbare HTML-Dokumentation.
- Generiertes HTML im Verzeichnis `site/` wird nicht manuell bearbeitet und normalerweise nicht committet.
- Code und Dokumentation werden in derselben Änderung konsistent gehalten.

## Warum Markdown?

Markdown ist einfacher Klartext mit sichtbarer Struktur. Menschen können die Quelldatei direkt lesen; Werkzeuge und KI-Agenten können Überschriften, Listen, Links und Codeblöcke zuverlässig erkennen. CommonMark definiert die grundlegende Syntax, GitHub erweitert sie um praktische Repository-Funktionen.

Für dieses Projekt ist Markdown geeigneter als XML, weil keine strikte fachliche Datenschema-Validierung für Dokumenttexte benötigt wird. `config.ini` bleibt für Laufzeitdaten zuständig; Markdown dokumentiert Bedeutung, Entscheidungen und Arbeitsweisen.

## Dokumenttypen

Jede Datei soll überwiegend genau einem Zweck dienen:

| Typ | Frage des Lesers | Beispiel |
|---|---|---|
| Tutorial | Wie lerne ich das Schritt für Schritt? | erste Änderung mit einem Agenten |
| How-to | Wie erledige ich eine konkrete Aufgabe? | neuen Timer ergänzen |
| Reference | Welche Regeln oder Felder gibt es? | INI-Schlüssel und Markdown-Syntax |
| Explanation | Warum ist das so aufgebaut? | Architektur und Entscheidungen |

Diese Trennung folgt dem Diátaxis-Prinzip. Eine Datei darf auf andere Typen verweisen, soll sie aber nicht unnötig vermischen.

## Verzeichnis- und Dateinamen

- Dateinamen klein schreiben.
- Wörter mit Bindestrichen trennen: `ai-assisted-development.md`.
- Namen nach Inhalt, nicht nach Erstellungsdatum wählen.
- Keine Dateien wie `neu.md`, `final2.md` oder `sonstiges.md`.
- Dauerhafte Entscheidungen nummerieren, beispielsweise `0001-docs-as-code.md`.

## Metadaten

Wichtige Dokumente beginnen mit YAML-Frontmatter:

```yaml
---
title: Architektur
doc_type: explanation
status: active
audience:
  - developer
  - ai-agent
canonical: true
---
```

Empfohlene Felder:

| Feld | Bedeutung |
|---|---|
| `title` | Seitentitel |
| `doc_type` | `tutorial`, `how-to`, `reference` oder `explanation` |
| `status` | `draft`, `active`, `deprecated` oder `archived` |
| `audience` | Hauptzielgruppen |
| `canonical` | ob die Datei eine Quelle der Wahrheit ist |

Metadaten dürfen nicht zu einem Verwaltungsprojekt werden. Nur Felder verwenden, die später tatsächlich helfen.

## Überschriften

- Genau eine `#`-Überschrift pro Datei.
- Danach Ebenen lückenlos verwenden: `##`, dann `###`.
- Überschriften kurz und eindeutig formulieren.
- Überschriften nicht allein zur optischen Vergrößerung verwenden.
- Manuelle Kapitelnummern vermeiden; sie werden bei Umstellungen schnell falsch.

GitHub und MkDocs erzeugen aus Überschriften automatisch Sprungmarken.

Beispiel:

```markdown
## Konfiguration laden
```

Link innerhalb derselben Datei:

```markdown
[Zur Konfiguration](#konfiguration-laden)
```

Link aus einer anderen Datei:

```markdown
[Konfiguration laden](../project/architecture.md#konfiguration-laden)
```

## Stabile benannte Sprungmarken

Automatische Anker ändern sich, wenn eine Überschrift umbenannt wird. Für oft referenzierte Architekturpunkte kann deshalb direkt vor der Überschrift ein stabiler Anker stehen:

```html
<a name="arch-config-load"></a>
```

Darauf wird so verwiesen:

```markdown
[Konfigurationsfluss](../project/architecture.md#arch-config-load)
```

Solche manuellen Anker sparsam einsetzen. Normale Überschriftenanker reichen meistens aus.

## Inhaltsverzeichnisse

### Auf GitHub

GitHub erzeugt für gerenderte Markdown-Dateien automatisch eine Gliederung aus den Überschriften. Zusätzlich kann man direkt auf jede Überschrift verlinken.

### In der HTML-Dokumentation

MkDocs erzeugt:

- die globale Navigation aus `mkdocs.yml`,
- ein Inhaltsverzeichnis je Seite,
- Suchfunktion,
- Vor- und Zurücknavigation,
- dauerhafte Überschriftenlinks.

Deshalb werden manuell gepflegte Inhaltsverzeichnisse nur verwendet, wenn eine Datei außerhalb dieser Systeme verteilt werden muss.

## Links

- Innerhalb des Repositories relative Links verwenden.
- Dateiendung `.md` im Quelltext beibehalten.
- Aussagekräftigen Linktext schreiben, nicht „hier klicken“.
- Auf die kanonische Quelle verweisen statt Inhalte zu kopieren.

Gut:

```markdown
Siehe [Architekturregeln](../project/architecture.md#architekturregeln).
```

Ungünstig:

```markdown
Weitere Informationen gibt es [hier](../project/architecture.md).
```

## Code und Konfiguration

- Inline-Bezeichner mit Backticks: `durationMinutes`.
- Mehrzeilige Beispiele mit Sprachangabe schreiben.
- Beispiele klein halten und ihren Zweck erklären.
- Keine echten Secrets oder internen Unternehmensdaten verwenden.

```ini
[timer:example]
durationMinutes=5
rules=@every 2h
```

## Tabellen

Tabellen eignen sich für kurze Referenzdaten. Lange Erklärungen, verschachtelte Listen oder umfangreicher Code gehören nicht in Tabellen.

## Entscheidungen

Eine dauerhafte technische oder organisatorische Grundsatzentscheidung wird als ADR oder Eintrag im Entscheidungsprotokoll festgehalten. Dokumentiert werden:

- Kontext,
- Entscheidung,
- Begründung,
- Folgen,
- Alternativen.

## Quellen und Recherche

Bei extern recherchierten Fakten werden Quelle und Abrufkontext festgehalten. Zeitabhängige Aussagen müssen als solche erkennbar sein. Produktinterne Entscheidungen brauchen keine künstliche externe Quelle, aber eine nachvollziehbare Begründung.

## Pflege bei Änderungen

Bei jeder Codeänderung prüfen:

1. Ist der README-Schnellstart noch korrekt?
2. Hat sich Architektur oder Datenfluss verändert?
3. Gibt es eine neue Konfiguration?
4. Braucht ein Agent künftig eine neue Regel?
5. Wurde eine frühere Entscheidung ersetzt?
6. Gibt es nun doppelte oder widersprüchliche Aussagen?

## Qualitätscheck

Ein Dokument ist gut, wenn ein neuer Mensch oder Agent nach dem Lesen:

- Zweck und Geltungsbereich versteht,
- die kanonische Quelle findet,
- konkrete nächste Schritte kennt,
- Annahmen und Grenzen erkennt,
- und nicht erst einen alten Chatverlauf rekonstruieren muss.
