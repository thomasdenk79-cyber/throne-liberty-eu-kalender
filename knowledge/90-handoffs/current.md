---
title: Aktuelle Übergabe
status: proposed
updated: 2026-07-24
classification: public
---

# Aktuelle Übergabe

## Ziel

Eine gemeinsame, Git-basierte Wissensbasis als Gesprächs- und Arbeitsschnittstelle zwischen ChatGPT, GitHub Copilot und lokalen Agenten aufbauen.

## Aktueller Stand

- Separater Vorschlags-Branch `proposal/shared-ai-knowledge-base` wurde angelegt.
- `main` und die produktive GitHub-Pages-Seite wurden nicht verändert.
- `AGENTS.md` definiert die gemeinsamen Agentenregeln.
- `.github/copilot-instructions.md` richtet GitHub Copilot auf den Knowledge-Workflow aus.
- `knowledge/README.md` beschreibt Informationsarchitektur, Rollen und Startreihenfolge.
- Governance für Wissensqualität, Datenschutz, Kontextaufbau und Übergaben ist angelegt.
- ADR-Prozess ist vorbereitet.

## Wichtige Rahmenbedingung

Das vorhandene Repository ist öffentlich und gehört fachlich zum Throne-and-Liberty-Kalender. Es eignet sich nur zum Testen der neutralen Struktur. Persönliche, vertrauliche oder Siemens-interne Inhalte dürfen hier nicht abgelegt werden.

## Empfohlene Zielarchitektur

Für den produktiven Einsatz ein separates, privates und freigegebenes Repository anlegen. Die neutrale Struktur aus diesem Branch kann dorthin übernommen werden. Fachbereiche und Projekte werden anschließend schrittweise aus bestehenden Chats, Dokumenten und Repositories verdichtet.

## Offene Entscheidungen

1. Ein gemeinsames privates Knowledge-Repository oder getrennte Repositories für privat und Siemens?
2. Welche Inhalte dürfen ChatGPT, Copilot Business/Enterprise und lokale Agenten jeweils lesen?
3. Welche Systeme sind Source of Truth für Code, Tickets, Wiki, SharePoint und Betriebsdaten?
4. Soll die Wissensbasis ausschließlich Markdown enthalten oder zusätzlich maschinenlesbare YAML/JSON-Indizes?
5. Wie erfolgt die regelmäßige Aktualitätsprüfung?

## Nächste sinnvolle Schritte

1. Privates Ziel-Repository beziehungsweise freigegebenes Siemens-Repository bestimmen.
2. Struktur übernehmen und Schutzregeln festlegen.
3. Erstes echtes Projekt als Pilot aufnehmen, vorzugsweise die Oracle-zu-PostgreSQL-Migration.
4. Projektakte, Glossar, Architektur, Anforderungen, ADRs und Forschungsstand aus vorhandenen Unterlagen erstellen.
5. Lokale Copilot-/Agenten-Anweisungen und Testworkflow ergänzen.
6. Nach dem Pilot die Struktur vereinfachen oder erweitern.

## Übergabehinweis für Agenten

Keine sensiblen Inhalte in diesen öffentlichen Vorschlags-Branch schreiben. Neue Arbeit soll entweder die neutrale Struktur verbessern oder in einem dafür freigegebenen privaten Repository stattfinden.
