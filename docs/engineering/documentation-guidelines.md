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

## Dokumentationsvertrag für Agenten

Jeder Agent bewertet vor dem Abschluss einer Änderung deren Wirkung. Nicht jede Datei
wird pauschal angefasst; die betroffene kanonische Sicht wird jedoch im selben
Änderungssatz aktualisiert.

| Änderung | Pflichtziel |
|---|---|
| sichtbare Funktion oder wichtiger Bugfix | `docs/user/whats-new.md` und Release-Eintrag im Changelog |
| neue oder geänderte Bedienung | passende Seite unter `docs/user/` |
| Datenfluss, Komponente oder Sicherheitsgrenze | `docs/project/architecture.md` |
| dauerhafte Grundsatzentscheidung | `docs/engineering/decision-log.md` |
| neue Entwicklungs- oder Reviewregel | passende Datei unter `docs/engineering/` und bei Bedarf `AGENTS.md` |
| Arbeitsstatus oder offene Abnahme | `docs/project/taskboard.md` |
| reine interne Umstrukturierung ohne Nutzerwirkung | technisches Changelog nur, wenn release- oder migrationsrelevant |

### Release-Versionierung als dokumentierte Muss-Regel

Fuer dieses Repository ist Versionierung eine verbindliche Agentenregel, nicht
nur ein Hinweis. Bei release-relevanten Aenderungen muessen alle
versionsgekoppelten Stellen mit identischem Wert aktualisiert werden
(`package.json`, `package-lock.json`, `index.html`-Versionsmarker,
`assets/js/app.js`, `assets/js/i18n.js`, `service-worker.js`).

SSOT-Regel: Die operative Schrittfolge fuer Agenten steht zentral in
`AGENTS.md`. Weitere Agenten-Instruktionsdateien verweisen darauf und pflegen
keine abweichenden Duplikate derselben Regelliste.

Die Regel gilt erst als erfuellt, wenn:

1. alle Marker synchron sind,
2. `npm run check` erfolgreich ist,
3. keine veraltete Release-Zeichenkette mehr im Repository verbleibt.

### Zwei Changelog-Sichten

- `docs/project/changelog.md` ist die technische, menschenlesbare Release-Historie.
- `docs/user/whats-new.md` erklärt Nutzerwirkung und Highlights ohne Code- oder
  Zeilennummern.
- Git-Commits bleiben kurz und technisch. Sie ersetzen kein Release-Changelog.

### Repository als lebendes Gedächtnis

Ein Agent übernimmt keine dauerhafte Erkenntnis blind aus einem Chat. Er:

1. prüft die vorhandene kanonische Quelle,
2. verdichtet die bestätigte Erkenntnis,
3. nennt Widerspruch oder ersetzte Annahme,
4. schlägt eine Grundsatzänderung als reviewbare Entscheidung vor,
5. überschreibt akzeptierte Architekturentscheidungen nicht still,
6. fragt bei einer erheblichen Abweichung nach fachlicher Bestätigung.

Rohe Chatprotokolle, vollständige Toolausgaben und Gedankengänge gehören nicht in
das Projektgedächtnis. Ziel ist genügend Kontext für einen neuen Menschen oder
Agenten bei möglichst wenig Rauschen.

### Schutzstufe für das Living Brain

Kanonische Agenten-, Architektur-, Governance-, Qualitäts- und
Entscheidungsdateien beeinflussen alle späteren Änderungen. Sie sind deshalb
keine gewöhnlichen Begleittexte. Vor einer Änderung sind mindestens zu prüfen:

1. welche Agenten und Arbeitsabläufe die Regel künftig steuert,
2. ob eine akzeptierte Entscheidung widersprochen oder ersetzt wird,
3. ob Code, Tests, Workflows oder andere kanonische Quellen angepasst werden,
4. wie die Änderung durch Diff, Test und Review zurückgenommen werden könnte.

Ein Agent mit unzureichendem Kontext oder unzureichenden Prüfmöglichkeiten
ändert diese Dateien nicht spekulativ. Er legt im Taskboard einen Vorschlag mit
Ausgangslage, Ziel, betroffenen Dateien, Risiko und Akzeptanzkriterien an und
markiert ihn mit **Chief-AI-Review erforderlich**. Modellnamen und
Reasoning-Stufen sind veränderliche Laufzeitangaben und ersetzen diese
Fähigkeitsprüfung nicht.

### Links und Build

Neue sichtbare Seiten werden in `mkdocs.yml` einsortiert. Vor dem Merge werden
relative Links sowie `mkdocs build --strict` geprüft. Generierte Dateien unter
`site/` bleiben unverändert.

Für die veröffentlichte Hilfe unter `/help/` wird lokal zusätzlich
`python scripts/build_help.py --site-dir help` verwendet. Optionale EN-
Übersetzung ist möglich, aber standardmäßig aus, um Tokens/Kosten zu sparen.

## Qualitätscheck

Ein Dokument ist gut, wenn ein neuer Mensch oder Agent nach dem Lesen:

- Zweck und Geltungsbereich versteht,
- die kanonische Quelle findet,
- konkrete nächste Schritte kennt,
- Annahmen und Grenzen erkennt,
- und nicht erst einen alten Chatverlauf rekonstruieren muss.
