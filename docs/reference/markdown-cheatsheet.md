---
title: Markdown-Kurzreferenz
doc_type: reference
status: active
audience:
  - project-maintainer
  - beginner
  - developer
  - ai-agent
canonical: false
---

# Markdown-Kurzreferenz

Markdown ist eine **Markup-Sprache**. „Markup“ ist der Oberbegriff; „Markdown“ ist die konkrete, bewusst leicht lesbare Schreibweise.

## Überschriften

```markdown
# Seitentitel
## Hauptabschnitt
### Unterabschnitt
```

Pro Datei nur eine Überschrift mit einem `#` verwenden.

## Textauszeichnung

```markdown
**fett**
*kursiv*
`technischerBezeichner`
~~durchgestrichen~~
```

## Listen

```markdown
- erster Punkt
- zweiter Punkt
  - Unterpunkt

1. erster Schritt
2. zweiter Schritt
```

## Links

```markdown
[Projektarchitektur](../project/architecture.md)
[Direkt zum Datenfluss](../project/architecture.md#datenfluss)
```

Relative Links funktionieren sowohl im geklonten Repository als auch auf GitHub und werden von MkDocs beim HTML-Build angepasst.

## Automatische Sprungmarken

Aus dieser Überschrift:

```markdown
## Konfiguration laden
```

entsteht normalerweise der Anker:

```text
#konfiguration-laden
```

Link innerhalb derselben Datei:

```markdown
[Zum Abschnitt](#konfiguration-laden)
```

Beim gerenderten Dokument kann man auf GitHub über das Kettensymbol neben der Überschrift den exakten Link kopieren.

## Stabile eigene Sprungmarke

```html
<a name="config-load"></a>
## Konfiguration laden
```

```markdown
[Zum stabilen Anker](#config-load)
```

Eigene Anker nur verwenden, wenn viele andere Dokumente langfristig auf exakt diesen Punkt verweisen.

## Codeblöcke

````markdown
```javascript
function greet(name) {
  return `Hallo ${name}`;
}
```
````

Für Konfigurationen die passende Sprache angeben:

````markdown
```ini
[timer:example]
durationMinutes=5
```
````

## Tabellen

```markdown
| Feld | Bedeutung |
|---|---|
| `durationMinutes` | Laufzeit des Events |
| `anchorUtc` | Startanker für Intervalle |
```

Tabellen nur für kompakte Vergleiche und Referenzdaten verwenden.

## Hinweise

MkDocs unterstützt hervorgehobene Hinweise:

```markdown
!!! note "Hinweis"
    Dieser Text wird in der HTML-Dokumentation hervorgehoben.
```

Auf GitHub bleibt der Inhalt auch ohne spezielle Darstellung lesbar.

## Zitate

```markdown
> Eine wichtige Aussage oder ein Auszug.
```

## Aufgabenlisten

```markdown
- [x] Dokumentation angelegt
- [ ] Test durchgeführt
```

## Bilder

```markdown
![Beschreibung des Bildes](../assets/example.png)
```

Der Alternativtext beschreibt den Inhalt und ist für Barrierefreiheit wichtig.

## Trennlinie

```markdown
---
```

Nicht mit YAML-Frontmatter am Dateianfang verwechseln.

## YAML-Frontmatter

```yaml
---
title: Beispielseite
doc_type: how-to
status: active
audience:
  - developer
  - ai-agent
canonical: true
---
```

Frontmatter enthält Metadaten über das Dokument. Es gehört ganz an den Anfang der Datei.

## Gute Grundstruktur einer Datei

```markdown
---
title: Neuer Timer
doc_type: how-to
status: active
---

# Neuen Timer ergänzen

## Ziel

Kurze Beschreibung des Ergebnisses.

## Voraussetzungen

Was vorher bekannt oder vorhanden sein muss.

## Vorgehen

1. Erster Schritt
2. Zweiter Schritt

## Prüfung

Woran erkennt man, dass es funktioniert?

## Siehe auch

- [Konfigurationsreferenz](../project/architecture.md)
```

## Häufige Fehler

- Überschriftenebenen überspringen
- absolute lokale Dateipfade verlinken
- denselben Inhalt in mehreren Dateien pflegen
- unklare Dateinamen wie `final-neu-2.md`
- lange Codeblöcke ohne Erklärung
- manuell nummerierte Kapitel nach Umstellungen nicht aktualisieren
- HTML-Ausgabe direkt ändern, obwohl sie aus Markdown generiert wird
