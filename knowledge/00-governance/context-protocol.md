# Context Protocol

## Ziel

Dieses Protokoll sorgt dafür, dass mehrere KI-Agenten und Menschen auf demselben Wissensstand arbeiten können, ohne bei jedem Wechsel das gesamte Repository oder alte Chats neu einzulesen.

## Kontextpaket für eine Aufgabe

Ein Agent stellt für jede größere Aufgabe ein kleines, gezieltes Kontextpaket zusammen:

1. **Auftrag:** Was soll konkret erreicht werden?
2. **Rahmenbedingungen:** Welche Grenzen, Standards und Freigaben gelten?
3. **Projektstatus:** Wo steht das betroffene Projekt aktuell?
4. **Entscheidungen:** Welche ADRs sind verbindlich?
5. **Quellen:** Welche Dateien, Messungen oder externen Quellen sind maßgeblich?
6. **Offene Punkte:** Welche Annahmen oder Konflikte bestehen?
7. **Erwartetes Ergebnis:** Code, Konzept, Entscheidungsvorlage, Test oder Dokumentation?

## Start eines Agentenlaufs

Der Agent:

1. liest `AGENTS.md` und die Governance-Dateien,
2. liest `knowledge/90-handoffs/current.md`,
3. öffnet die Projekt- oder Domain-Indexdatei,
4. folgt nur den für die Aufgabe relevanten Verweisen,
5. prüft Aktualität, Status und Klassifikation,
6. nennt Unsicherheiten sichtbar, statt fehlende Informationen zu erfinden.

## Während der Arbeit

Neue Erkenntnisse werden zunächst unterschieden in:

- **ephemeral:** nur für den aktuellen Arbeitslauf relevant,
- **candidate knowledge:** könnte später wichtig sein,
- **canonical knowledge:** bestätigt und für künftige Arbeit maßgeblich.

Nur `candidate knowledge` und `canonical knowledge` werden am Ende verdichtet. Terminalausgaben, Debug-Logs und lange Gedankengänge werden nicht ungefiltert gespeichert.

## Rückführung nach der Arbeit

Am Ende einer größeren Aufgabe aktualisiert der Agent nach Bedarf:

- `status.md` des Projekts,
- Anforderungen oder Architektur,
- relevante ADRs,
- Forschungsnotizen,
- Backlog und offene Fragen,
- `knowledge/90-handoffs/current.md`.

Dabei muss erkennbar sein:

- was geändert wurde,
- warum es geändert wurde,
- wodurch es belegt ist,
- was noch unsicher ist,
- was als Nächstes passieren sollte.

## Wechsel zwischen ChatGPT und Repository-Agenten

### ChatGPT → Repository-Agent

ChatGPT liefert bevorzugt:

- Ziel und fachliche Begründung,
- Architektur oder Lösungskonzept,
- Akzeptanzkriterien,
- Risiken und Alternativen,
- betroffene Wissens- und Codebereiche,
- Prüf- und Teststrategie.

Diese Informationen werden als Projektdatei, ADR, Playbook oder Issue in Git abgelegt. Der Repository-Agent implementiert gegen diese versionierte Vorgabe.

### Repository-Agent → ChatGPT

Der Repository-Agent liefert bevorzugt:

- konkrete Änderungen und Commit/PR,
- ausgeführte Tests und Ergebnisse,
- technische Abweichungen vom Konzept,
- neue entdeckte Randbedingungen,
- verbleibende Fehler und Risiken,
- aktualisierte Übergabedatei.

ChatGPT kann anschließend Architektur, Verständlichkeit, Konsistenz und Forschungsstand erneut prüfen.

## Kontextwechsel zwischen Themen

Für jedes größere Themengebiet existiert ein eigener Einstiegspunkt unter `knowledge/20-domains/` oder `knowledge/30-projects/`. Ein Themenwechsel erfolgt über dessen `README.md`, nicht über das vollständige Einlesen aller Wissensdateien.

## Umgang mit langen Historien

Wenn ein Dokument zu groß oder widersprüchlich wird:

1. stabilen aktuellen Stand in eine kompakte Hauptdatei überführen,
2. historische Details ins Archiv verschieben,
3. wichtige Entscheidungen als ADR erhalten,
4. einen Änderungsvermerk und Verweis hinterlassen.

## Grenzen

Die Git-Wissensbasis wird nicht automatisch in jedes Modell geladen. Jeder Agent benötigt Zugriff auf das Repository und muss die Startdateien aktiv lesen. Das Protokoll minimiert diesen Aufwand, ersetzt ihn aber nicht.
