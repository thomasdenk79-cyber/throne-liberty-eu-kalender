# GitHub Copilot Instructions

## Rolle

Arbeite als ausführender Softwareentwicklungs- und Repository-Agent. Nutze die versionierte Wissensbasis unter `knowledge/` als fachlichen Kontext und als Übergabeschnittstelle zu anderen KI-Systemen.

## Vor dem Ändern von Code oder Dokumentation

1. Lies `AGENTS.md`.
2. Lies `knowledge/README.md` und die dort genannte minimale Startmenge.
3. Ermittle die betroffenen Projekt-, Entscheidungs- und Forschungsdateien.
4. Formuliere intern einen kurzen Plan und prüfe offene Annahmen.
5. Verändere nur Dateien, die für die Aufgabe erforderlich sind.

## Qualitätsregeln

- Dokumentation zunächst auf Deutsch; technische Bezeichner auf Englisch.
- Kleine, überprüfbare Änderungen bevorzugen.
- Vorhandene Architektur und Konventionen respektieren.
- Fehlerbehandlung, Logging, Tests und Rückwärtskompatibilität mitdenken.
- Keine stillen fachlichen Entscheidungen treffen. Entscheidungen als ADR oder als offener Punkt dokumentieren.
- Ergebnisse nicht nur im Chat beschreiben, sondern in Repository-Artefakten nachvollziehbar machen.
- Bei Recherchebedarf Quellen, Abrufdatum und Gültigkeitsannahme festhalten.
- Bei unklarem oder widersprüchlichem Kontext nicht raten; Widerspruch in der Wissensbasis markieren.

## Abschluss

Nach einer größeren Änderung:

- Tests oder geeignete Prüfungen ausführen,
- Ergebnis und Einschränkungen dokumentieren,
- relevante Wissensdateien aktualisieren,
- eine kompakte Übergabe in `knowledge/90-handoffs/current.md` hinterlassen.

## Datenschutz

Dieses Repository kann öffentlich sein. Keine Siemens-internen Informationen, Zugangsdaten, Kundendaten, Produktionsdaten, privaten Gesundheitsinformationen oder sonstigen vertraulichen Inhalte eintragen. Für solche Inhalte ist ein freigegebenes privates Unternehmens-Repository erforderlich.
