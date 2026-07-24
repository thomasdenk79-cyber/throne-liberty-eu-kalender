# AGENTS.md

## Zweck

Dieses Repository enthält neben dem eigentlichen Projekt eine experimentelle, versionierte Wissensbasis unter `knowledge/`. Sie dient als gemeinsame Gesprächs- und Arbeitsschnittstelle für ChatGPT, GitHub Copilot und lokale Entwicklungsagenten.

Das Repository ist **nicht** das Gedächtnis eines einzelnen Modells. Es ist die nachvollziehbare, von Menschen kontrollierbare Quelle für Fakten, Entscheidungen, Anforderungen, Forschungsstände und Übergaben.

## Verbindliche Lesereihenfolge

Vor größeren Aufgaben:

1. `knowledge/README.md`
2. `knowledge/00-governance/knowledge-policy.md`
3. `knowledge/00-governance/context-protocol.md`
4. die Indexdatei des betroffenen Projekts oder Themengebiets
5. relevante ADRs, Forschungsnotizen und aktuelle Übergabe

Nicht wahllos alle Dateien laden. Zuerst den Index lesen und anschließend nur die für die Aufgabe benötigten Dokumente öffnen.

## Arbeitsregeln für Agenten

- Dokumentation wird zunächst auf Deutsch verfasst.
- Klassen-, Methoden-, Variablen-, API-, SQL- und technische Bezeichner bleiben Englisch.
- Fakten, Annahmen, Entscheidungen, offene Fragen und Empfehlungen klar voneinander trennen.
- Keine erfundenen Quellen, Messwerte, Systemzustände oder Entscheidungen.
- Veraltete Aussagen nicht stillschweigend überschreiben; Datum und Änderung dokumentieren.
- Relevante neue Erkenntnisse am Ende einer Aufgabe in die Wissensbasis zurückführen.
- Rohprotokolle, lange Chats und Terminalausgaben nicht ungefiltert als Wissen speichern.
- Bei Widersprüchen die Quellen nennen und den Konflikt sichtbar machen.
- Sicherheits- und Datenschutzklassifikation jeder neuen Wissensdatei beachten.
- Keine Passwörter, Tokens, privaten Schlüssel, personenbezogenen Gesundheitsdaten oder vertraulichen Unternehmensinhalte in ein öffentliches Repository schreiben.

## Abschluss einer größeren Aufgabe

Eine Aufgabe gilt erst als übergabefähig, wenn mindestens Folgendes aktualisiert wurde:

- betroffener Projektstatus,
- neue oder geänderte Entscheidungen,
- offene Punkte und Risiken,
- nächste sinnvolle Arbeitsschritte,
- `knowledge/90-handoffs/current.md`, sofern ein anderer Agent übernehmen soll.

## Priorität bei Konflikten

1. Sicherheits- und Compliance-Vorgaben
2. explizite aktuelle Anweisung des Nutzers
3. projektspezifische Anforderungen und ADRs
4. diese Datei
5. allgemeine Agentengewohnheiten
