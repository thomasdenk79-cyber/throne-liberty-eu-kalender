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
    +-- index.html  -------- semantische Benutzeroberfläche
    +-- assets/styles/ ---- Darstellung und responsive Layouts
    +-- assets/js/ -------- native ES-Module ohne Laufzeit-Build
    +-- config.ini  -------- Standardkategorien und Standardtimer
    +-- live-timers.ini  --- validierte, generierte Anchor-Überlagerung
    +-- service-worker.js -- Offline-App-Shell

Browser
    |
    +-- lädt index.html, config.ini und optional live-timers.ini
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

### Rendering und Medien

Statische Kartenelemente werden nicht im Sekundentakt neu erzeugt. Der Tick
aktualisiert ausschließlich Countdown, Dringlichkeitsstatus und Phasenfortschritt.
Die strukturelle Karte wird nur bei Kategorie-, Sprach-, Sichtbarkeits-,
Termin- oder Bildwechsel neu aufgebaut. Eventbilder wechseln in einem stabilen
Zehn-Minuten-Zeitfenster.

Themes verändern die visuelle Inszenierung, nicht Timerdaten oder Alarmsemantik.
Fehlende Theme-Bilder fallen auf den passenden Epic- oder Fun-Assetpool zurück.

### Externe Benachrichtigungen

Discord-Webhooks sind eine optionale Erweiterung außerhalb der statischen
Browsergrenze. Sendefähige URLs und Tokens dürfen nie in ausgelieferten Dateien
stehen. GitHub Pages zeigt und konfiguriert daher keine geheimen Webhook-Werte.
Eine spätere minutengenaue Integration benötigt eine kleine serverseitige,
geplante Alarmkomponente.

### Lokale Personalisierung

Benutzereinstellungen und importierte Anpassungen werden im Browser gespeichert. Die kanonische Repository-Konfiguration bleibt davon getrennt.

## Datenfluss

<a name="arch-config-load"></a>
### Laden der Konfiguration

1. Der Browser lädt `index.html`.
2. Die Anwendung lädt `config.ini`.
3. Der Browser lädt `live-timers.ini` ohne Cache und übernimmt ausschließlich validierte Live-Felder.
4. Kategorien, Timerregeln, Pfade, Zeitzonen und
   Benachrichtigungseinstellungen werden strikt validiert.
5. Lokale Benutzereinstellungen werden nach erteilter Einwilligung ergänzt.
6. Die sichtbaren Timerkarten und Countdown-Zustände werden erzeugt.

### Restart-sensitive Timer

`config.ini` bleibt die kanonische Standardquelle. Gate of Memory kann nach einem Serverneustart jedoch einen neuen Anchor erhalten. Deshalb extrahiert `scripts/sync_gate_memory.py` beim stündlichen Pages-Build das Event-JSON-LD von MetaForge, validiert Intervall, Dauer und UTC-Zeitpunkt und erzeugt `live-timers.ini`.

Die Überlagerung darf nur vorhandene Timer und die Felder `rules`, `anchorUtc` und `durationMinutes` ändern. Bei Quell- oder Netzfehlern bleibt die eingecheckte letzte geprüfte INI-Datei unverändert. Es gibt keinen JSON-Konfigurationsfallback.

### PWA und Offline-Modus

`manifest.webmanifest` macht die Seite installierbar. Der Service Worker speichert
HTML, CSS, ES-Module und die wichtigsten Eventbilder. Nur erfolgreiche
Netzantworten werden gecacht. `live-timers.ini` wird network-first geladen,
damit Online-Nutzer den neuesten Anchor erhalten und Offline-Nutzer auf den
letzten Cachewert zurückfallen.

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
| `index.html` | semantische HTML-Struktur und statische Einstiegspunkte |
| `assets/styles/app.css` | Themes, Komponenten, Panels und responsive Darstellung |
| `assets/js/app.js` | DOM-Orchestrierung, Zustand und Browserfunktionen |
| `assets/js/config.js` | strikter INI-Import/-Export, Migration und Validierung |
| `assets/js/schedule.js` | Cron-/Intervallberechnung und Zeitlogik |
| `assets/js/sounds.js` | kuratierte Web-Audio-Synthese und Dauern |
| `assets/js/ics.js` | sicherer ICS-Aufbau und Download |
| `assets/js/i18n.js` | lokalisierte UI-Texte |
| `config.ini` | Standarddaten und Standardbenachrichtigungen |
| `live-timers.ini` | letzte validierte Live-Überlagerung für restart-sensitive Timer |
| `scripts/sync_gate_memory.py` | validierter MetaForge-Abgleich im Pages-Build |
| `manifest.webmanifest`, `service-worker.js` | Installation und Offline-App-Shell |
| `README.md` | Bedienung und schneller Projekteinstieg |
| `docs/project/` | Produkt- und Architekturwissen |
| `docs/engineering/` | Vorgehen, Qualitätsregeln und Entscheidungen |
| `docs/demo/` | wiederverwendbares Vorführ- und Lernmaterial |
| `AGENTS.md` | herstellerneutraler Agenteneinstieg |
| `.github/instructions/` | pfadspezifische Copilot-Regeln |

## Architekturregeln

Agenten und Entwickler müssen folgende Invarianten erhalten, sofern eine Aufgabe nicht ausdrücklich eine Änderung verlangt:

1. `config.ini` bleibt die einzige kanonische Standard-Timerquelle.
2. Live-Überlagerungen dürfen nur dokumentierte, validierte Felder vorhandener Timer ersetzen.
3. Bestehende INI-Schlüssel bleiben rückwärtskompatibel oder erhalten eine Migration.
4. UTC wird für kanonische Zeitpunkte verwendet; die Anzeige wird lokalisiert.
5. Die Anwendung bleibt ohne Backend lauffähig.
6. Persönliche Einstellungen verlassen den Browser nicht.
7. Neue externe Abhängigkeiten benötigen eine dokumentierte Begründung.
8. Barrierefreiheit und responsive Darstellung gehören zur Funktion, nicht zur optionalen Verschönerung.

## Modulgrenzen

Die Anwendung bleibt ohne Bundler direkt auslieferbar. Neue Fachlogik gehört in
ein verantwortliches ES-Modul und erhält einen Modul- oder Runtime-Test.
`app.js` verbindet diese Module mit dem DOM; es soll keine zweite
Konfigurations-, Zeitplan-, Audio- oder ICS-Implementierung enthalten.

### Bekannte Browsergrenze: `file://`

Browser blockieren aus Sicherheitsgründen den Fetch von ES-Modulen über das
`file://`-Protokoll (CORS). Wird `index.html` lokal per Doppelklick statt über
einen Webserver oder GitHub Pages geöffnet, kann `assets/js/app.js` dadurch
nicht laden. Ein klassisches, nicht modulares Inline-Script in `index.html`
fängt diesen Ladefehler über das `error`-Ereignis des Modul-Scripts ab, blendet
`html.booting` (siehe PWA-Abschnitt) wieder ein und zeigt eine verständliche
Fehlermeldung statt einer leeren Seite. Lokal testen daher über einen
einfachen Webserver, z. B. `npx http-server` oder `python -m http.server`.
