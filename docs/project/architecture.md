---
title: Architektur
doc_type: explanation
status: active
audience:
  - developer
  - ai-agent
canonical: true
---

# Architektur

## Architekturüberblick

Die Anwendung ist bewusst als **statische Single-Page-Webanwendung ohne Backend** aufgebaut.

```text
GitHub Pages
    |
    +-- index.html  -------- Benutzeroberfläche und Anwendungslogik
    |
    +-- config.ini  -------- Standardkategorien und Standardtimer

Browser
    |
    +-- lädt index.html und config.ini
    +-- berechnet Zeitpunkte und Countdown-Zustände lokal
    +-- speichert persönliche Einstellungen lokal
    +-- erzeugt Benachrichtigungen, Sounds und ICS-Dateien lokal
```

## Zentrale Architekturentscheidungen

### Statische Auslieferung

Die Anwendung benötigt keinen eigenen Serverprozess. GitHub Pages liefert die Dateien aus; sämtliche Laufzeitlogik wird im Browser ausgeführt.

Vorteile:

- geringe Betriebs- und Wartungskosten
- keine Serverdatenbank
- keine serverseitigen Benutzerkonten
- leicht lokal testbar
- einfaches Deployment

Grenzen:

- die Seite muss für zeitnahe Browserbenachrichtigungen geöffnet bleiben
- Browser-Energiesparmechanismen können Hintergrundausführung verzögern
- gemeinsame serverseitige Synchronisierung ist nicht vorhanden

### Konfiguration vor Code

Neue oder geänderte Standardtimer sollen nach Möglichkeit in `config.ini` gepflegt werden. Die JavaScript-Logik soll generisch bleiben und nicht für jeden einzelnen Timer Spezialcode enthalten.

### Lokale Personalisierung

Benutzereinstellungen und importierte Anpassungen werden im Browser gespeichert. Die kanonische Repository-Konfiguration bleibt davon getrennt.

## Datenfluss

<a name="arch-config-load"></a>
### Laden der Konfiguration

1. Der Browser lädt `index.html`.
2. Die Anwendung lädt `config.ini`.
3. Kategorien, Timerregeln und Benachrichtigungseinstellungen werden geparst.
4. Lokale Benutzereinstellungen werden ergänzt.
5. Die sichtbaren Timerkarten und Countdown-Zustände werden erzeugt.

<a name="arch-timer-cycle"></a>
### Timerzyklus

1. Eine Cron- oder Intervallregel bestimmt den nächsten Eventstart.
2. `durationMinutes` bestimmt die Laufzeit des Ereignisses.
3. Die Oberfläche unterscheidet zukünftige, warnende, kritische und laufende Zustände.
4. Die Anzeige wird fortlaufend aktualisiert.
5. Aktivierte Browser- und In-App-Benachrichtigungen werden lokal ausgelöst.

<a name="arch-import-export"></a>
### Import und Export

- Der Konfigurationsexport erzeugt eine lesbare INI-Datei.
- Dieselbe Struktur kann wieder importiert werden.
- Der Kalenderexport erzeugt ICS-Daten für ausgewählte Ereignisse.
- Es gibt keinen serverseitigen Upload.

## Dateiverantwortung

| Datei oder Bereich | Verantwortung |
|---|---|
| `index.html` | HTML-Struktur, CSS, JavaScript, Rendering und Browserfunktionen |
| `config.ini` | Standarddaten und Standardbenachrichtigungen |
| `README.md` | Bedienung und schneller Projekteinstieg |
| `docs/project/` | Produkt- und Architekturwissen |
| `docs/engineering/` | Vorgehen, Qualitätsregeln und Entscheidungen |
| `docs/demo/` | wiederverwendbares Vorführ- und Lernmaterial |
| `AGENTS.md` | herstellerneutraler Agenteneinstieg |
| `.github/copilot-instructions.md` | GitHub-Copilot-spezifische Regeln |
| `.github/instructions/` | pfadspezifische Copilot-Regeln |

## Architekturregeln

Agenten und Entwickler müssen folgende Invarianten erhalten, sofern eine Aufgabe nicht ausdrücklich eine Änderung verlangt:

1. `config.ini` bleibt die einzige kanonische Standard-Timerquelle.
2. Bestehende INI-Schlüssel bleiben rückwärtskompatibel oder erhalten eine Migration.
3. UTC wird für kanonische Zeitpunkte verwendet; die Anzeige wird lokalisiert.
4. Die Anwendung bleibt ohne Backend lauffähig.
5. Persönliche Einstellungen verlassen den Browser nicht.
6. Neue externe Abhängigkeiten benötigen eine dokumentierte Begründung.
7. Barrierefreiheit und responsive Darstellung gehören zur Funktion, nicht zur optionalen Verschönerung.

## Bekannte technische Schuld

Die Anwendung ist für ein kleines Demo-Projekt bewusst kompakt. Wenn `index.html` durch weitere Funktionen deutlich wächst, soll vor einem Umbau geprüft werden, ob CSS und JavaScript in getrennte Dateien ausgelagert werden sollten.

Eine Modularisierung ist kein Selbstzweck. Sie ist sinnvoll, wenn mindestens eines dieser Probleme eintritt:

- Änderungen verursachen regelmäßig unbeabsichtigte Seiteneffekte.
- Tests oder Fehlersuche werden unverhältnismäßig schwierig.
- mehrere Entwickler oder Agenten bearbeiten häufig dieselbe Datei.
- einzelne Module können nicht mehr klar beschrieben werden.

Die Entscheidung muss dann im [Entscheidungsprotokoll](../engineering/decision-log.md) festgehalten werden.
