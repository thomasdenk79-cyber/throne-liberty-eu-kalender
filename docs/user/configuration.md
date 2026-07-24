---
title: Konfiguration und Import/Export
doc_type: how-to
status: active
audience:
  - user
  - project-maintainer
canonical: true
---

# Konfiguration und Import/Export

Die Standardkonfiguration liegt in `config.ini` im Repository. In der Anwendung kannst du lokal anpassen und als INI exportieren.

## Was ist konfigurierbar?

- Kategorien
- Timer-Namen
- Zeitplaene (Cron oder @every)
- Warn- und Critical-Erinnerungen
- Sounds und Kanaele
- optionale Aktivierungszeitfenster

## INI exportieren

1. In der Anwendung den Export-Button klicken.
2. Eine `timer-config.ini` wird heruntergeladen.
3. Diese Datei kann als Backup oder fuer Team-Sharing genutzt werden.

## INI importieren

1. Import-Button klicken.
2. Eine vorhandene INI-Datei auswaehlen.
3. Die Seite uebernimmt die Werte und aktualisiert die Anzeige.

## Kompatibilitaet

- Bestehende Schluessel sollen nicht ohne Migrationsidee geaendert werden.
- `durationMinutes` beschreibt die Laufzeit eines Events.
- Intervallregeln brauchen einen passenden `anchorUtc`, damit die Zeitpunkte stabil bleiben.

## Best Practice

- Aendere zuerst lokal und pruefe das Verhalten.
- Exportiere danach die funktionierende INI.
- Uebernimm sie erst dann als neue Standarddatei ins Repository.
