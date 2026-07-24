---
title: Prompt-Beispiele
doc_type: reference
status: active
audience:
  - project-maintainer
  - developer
  - beginner
canonical: false
---

# Prompt-Beispiele

Diese Beispiele sind Startpunkte. Ziel, Grenzen und Akzeptanzkriterien müssen immer an die konkrete Aufgabe angepasst werden.

## Neue kleine Funktion

```text
Lies zuerst AGENTS.md und alle dort für diese Aufgabe genannten Dateien.

Ziel:
Ergänze [konkrete Funktion und Nutzwert].

Ausgangslage:
[Was funktioniert bereits?]

Nicht-Ziele:
- keine Änderung an [Bereich]
- keine neue externe Abhängigkeit
- keine Änderung des bestehenden Konfigurationsformats, sofern nicht nötig

Akzeptanzkriterien:
- [sichtbares Ergebnis]
- [Randfall]
- [responsive oder barrierefreie Anforderung]
- bestehende Konfigurationen funktionieren weiter

Nenne vor der Änderung kurz:
1. dein Aufgabenverständnis,
2. betroffene Dateien,
3. geplante Schritte,
4. Testidee.

Setze danach die Änderung um, prüfe sie und aktualisiere relevante Dokumentation.
```

## Fehler untersuchen und beheben

```text
Lies AGENTS.md, die Architektur und die Entwicklungsrichtlinien.

Fehlerbild:
[genaue Beobachtung]

Erwartetes Verhalten:
[was sollte passieren?]

Reproduktion:
1. ...
2. ...
3. ...

Untersuche zuerst die Ursache. Ändere nicht vorsorglich mehrere unabhängige Bereiche.

Liefere:
- wahrscheinliche oder bestätigte Ursache,
- kleinste sinnvolle Korrektur,
- geänderte Dateien,
- durchgeführte Prüfung,
- verbleibende Unsicherheiten.

Aktualisiere Dokumentation nur dann, wenn Verhalten, Architektur oder eine dauerhafte Regel betroffen ist.
```

## Code-Review ohne Änderung

```text
Lies zuerst AGENTS.md, Projektüberblick, Architektur und Entwicklungsrichtlinien.

Prüfe die betroffenen Dateien auf:
- funktionale Fehler,
- Zeit- und Zeitzonenfehler,
- Rückwärtskompatibilität der INI-Konfiguration,
- Accessibility,
- responsive Darstellung,
- Sicherheitsprobleme,
- unnötige Komplexität,
- fehlende oder widersprüchliche Dokumentation.

Nimm noch keine Änderungen vor.
Ordne Funde nach Schweregrad und nenne für jeden Fund:
- Datei und Stelle,
- konkrete Auswirkung,
- Begründung,
- empfohlene Korrektur,
- geeigneten Test.

Wenn du keinen Fehler bestätigen kannst, sage das ausdrücklich und erfinde keinen Fund.
```

## Dokumentation aus Code aktualisieren

```text
Lies AGENTS.md und docs/engineering/documentation-guidelines.md.
Vergleiche anschließend die relevante Implementierung mit README und docs/.

Ziel:
Korrigiere veraltete oder widersprüchliche Dokumentation, ohne neue Produktanforderungen zu erfinden.

Regeln:
- Code und Konfiguration sind für implementiertes Verhalten maßgeblich.
- Projektziele und Nicht-Ziele werden nicht stillschweigend geändert.
- Vermeide doppelte Quellen der Wahrheit.
- Verwende relative Links und klare Überschriften.
- Aktualisiere das Entscheidungsprotokoll nur bei einer dauerhaften Grundsatzentscheidung.

Liefere am Ende eine Liste der korrigierten Widersprüche.
```

## Neuen Timer ergänzen

```text
Lies AGENTS.md, README.md, config.ini, Projektarchitektur und Entwicklungsrichtlinien.

Ergänze einen neuen Standardtimer mit folgenden fachlichen Angaben:
- Kategorie: ...
- deutscher Name: ...
- englischer Name: ...
- Laufzeit: ... Minuten
- Zeitregel: ...
- gültig von/bis: ...
- Warnung: ... Sekunden vorher
- kritisch: ... Sekunden vorher

Prüfe:
- korrekte UTC- und lokale Anzeige,
- Parser-Kompatibilität,
- Warn- und kritischen Zustand,
- INI-Export und erneuten Import,
- ICS-Ausgabe.

Spezialcode in index.html ist nur zulässig, wenn die bestehende generische Konfiguration die Anforderung nachweislich nicht ausdrücken kann.
```

## Architekturvorschlag ohne Implementierung

```text
Lies das vollständige Projektgedächtnis über AGENTS.md und docs/README.md.

Analysiere folgende gewünschte Erweiterung:
[Erweiterung]

Erstelle noch keinen Code.
Vergleiche mindestens:
1. Erweiterung innerhalb der bestehenden statischen Architektur,
2. kleine Modularisierung ohne Backend,
3. neue Architekturkomponente nur falls wirklich erforderlich.

Bewerte je Option:
- Nutzen,
- Komplexität,
- Risiken,
- Datenschutz,
- Betrieb,
- Testbarkeit,
- Migration,
- Auswirkungen auf bestehende Nutzer und Konfigurationen.

Gib eine begründete Empfehlung und einen möglichen ADR-Entwurf ab.
```

## Wissensbasis nach einer Diskussion aktualisieren

```text
Verdichte die vorliegenden Diskussionsergebnisse in dauerhaftes Projektwissen.

Übernimm nur:
- bestätigte Fakten,
- getroffene Entscheidungen,
- relevante Annahmen,
- offene Risiken,
- klare nächste Schritte.

Übernimm nicht:
- Wiederholungen,
- spontane Ideen ohne Entscheidung,
- persönliche oder vertrauliche Daten,
- lange Gesprächsprotokolle,
- bereits vorhandene Informationen als Duplikat.

Ordne jede Erkenntnis der kanonisch passenden Datei zu. Zeige vor der Änderung kurz, welche Dateien du warum aktualisieren wirst.
```
