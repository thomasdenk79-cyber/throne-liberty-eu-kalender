# Linny's Astral Solisium Pulse

Kompakter, konfigurationsbasierter Event-Timer fuer Throne and Liberty EU. Die Seite laeuft statisch auf GitHub Pages und liest ihre Standard-Timer ausschliesslich aus `config.ini`.

Das Repository dient zugleich als kleines Demo-Projekt fuer **KI-gestuetzte Softwareentwicklung**: Menschen, ChatGPT und Coding-Agenten arbeiten ueber eine gemeinsame, versionierte Markdown-Wissensbasis zusammen.

## Dokumentation und Projektgedaechtnis

- [Dokumentationsstart](docs/README.md)
- [Projektueberblick](docs/project/project-brief.md)
- [Architektur](docs/project/architecture.md)
- [Entwicklungsrichtlinien](docs/engineering/development-guidelines.md)
- [KI-gestuetzte Entwicklung](docs/engineering/ai-assisted-development.md)
- [Markdown-Kurzreferenz](docs/reference/markdown-cheatsheet.md)
- [Demo fuer Kollegen](docs/demo/colleague-demo.md)
- [Prompt-Beispiele](docs/demo/prompt-examples.md)

Agenten beginnen mit [`AGENTS.md`](AGENTS.md). GitHub Copilot verwendet zusaetzlich [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

Die Markdown-Dateien sind die gepflegte Quelle. Mit MkDocs kann daraus lokal eine navigierbare HTML-Dokumentation mit Suche und Inhaltsverzeichnissen erzeugt werden:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-docs.txt
mkdocs serve
```

## Features

- Boarisch, Deutsch und Englisch; deutsche Clients starten boarisch, alle anderen englisch
- Eigene Anzeigezeitzone `Bayern/Munich`, intern DST-sicher auf `Europe/Berlin` abgebildet
- Live-Countdowns fuer Cron-Zeitplaene und exakte Intervalle
- Automatische Anzeige in der lokalen Zeitzone des Nutzers
- Timer pro Kategorie ein- und ausblendbar
- Saisonale Timer mit optionalem Gueltigkeitszeitraum
- Laufende Events mit Fortschrittsbalken, einklappbarer Historie und lokal gespeichertem 30-Minuten-Rueckblick
- Separates, editierfreies Statusfenster fuer die linke oder rechte Bildschirmseite
- Unabhaengig aktivierbare Warning- und Critical-Erinnerungen mit sekundengenauem Vorlauf
- Mehrere separat waehl- und testbare Sounds: sanftes Glockenspiel bis Solisium-Sirene
- Vollstaendiger 10-Sekunden-Test fuer Warning und Critical inklusive Sound, Popup und Browsermeldung
- ICS-Export einzelner oder beliebig vieler ausgewaehlter Termine; Doppelklick auf einen Eventnamen waehlt dessen Termine an oder ab
- Kompakte zweispaltige Auswahl der sichtbaren Timer
- Lokale Anpassungen als lesbare INI importieren und exportieren
- Responsives Dashboard mit grossem Linny-Intro und kompakter Timer-Ansicht
- Kompakte Timerkarten mit Info-Tooltip und responsivem Ein-, Zwei- oder Dreispaltenlayout
- Kontinuierlicher Farbübergang samt neu startendem Fortschrittsbalken je Alarmphase
- Violetter Puls- und Blinkalarm in der letzten Minute
- Komfortable, kompakte und ultrakompakte Kartendichte plus Farbenblind-Symbole
- Aktivitaetswarnung fuer Hintergrund-Tabs sowie Konfigurations- und Ablaufstatus

## Dateien

- `index.html`: Oberflaeche, Timer-Engine und Benachrichtigungen
- `config.ini`: einzige Standard-Konfiguration fuer Kategorien und Timer
- `AGENTS.md`: herstellerneutraler Einstieg fuer Coding-Agenten
- `.github/copilot-instructions.md`: Repository-Regeln fuer GitHub Copilot
- `docs/`: Projektwissen, Architektur, Entwicklungsregeln und Demo-Material
- `mkdocs.yml`: Navigation und Build-Konfiguration der HTML-Dokumentation

## Timer in `config.ini`

Jeder Timer besitzt einen eigenen Abschnitt:

```ini
[timer:gate_memory_eu]
categoryId=tl_eu
name.de=Tor der Erinnerung
name.en=Gate of Memory
durationMinutes=5
activeFrom=2026-01-01T00:00:00Z
activeUntil=2026-12-31T23:59:59Z
rules=@every 11808s
anchorUtc=2026-07-19T00:03:00Z
notifications.warning.enabled=true
notifications.warning.seconds=300
notifications.warning.sound=gentle
notifications.critical.enabled=true
notifications.critical.seconds=90
notifications.critical.sound=urgent
notifications.channels=browser,popup
```

Zeitplanformate:

- Cron: `Minute Stunde Tag Monat Wochentag`
- Mehrere Regeln: mit `||` trennen
- Intervall: `@every 11808s`, `@every 90m` oder `@every 2h`
- Bei Intervallen legt `anchorUtc` den exakten Startpunkt fest
- `activeFrom` und `activeUntil` sind optionale ISO-UTC-Grenzen

`durationMinutes` ist die Laufzeit des Events, nicht das Wiederholungsintervall. Sie steuert Fortschrittsbalken, Rueckblick und das Ende eines ICS-Termins. Das Wiederholungsintervall steht ausschliesslich in der `@every`-Regel.

Der Export-Button erzeugt eine vollstaendige `timer-config.ini`. Dieselbe Datei kann ohne JSON-Zwischenschritt wieder importiert oder als neue `config.ini` ins Repository uebernommen werden.

Warning und Critical besitzen jeweils einen eigenen Ein-/Ausschalter, sekundengenauen Vorlauf und Sound. Gueltige Sounds sind `none`, `gentle`, `crystal`, `bell`, `urgent` und `siren`. `notifications.channels` steuert unabhaengig davon Browser- und In-App-Popups. Alte `notifications.minutes`-Eintraege werden weiterhin gelesen und beim Export in das neue Format umgewandelt.

Windows-/Browserbenachrichtigungen werden ueber den Button in der Oberflaeche freigegeben. Die Seite muss fuer Timer, In-App-Popups und Audio-Erinnerungen geoeffnet bleiben. Hintergrund-Tabs koennen durch Browser-Energiesparen verzoegert werden; der Aktivitaetsstatus weist darauf hin.

Sprache, Anzeigezeitzone, sichtbare Timer, Andockseite, Historienlaenge und eingeklappter Zustand, Kartendichte, Farbenblind-Modus sowie lokale Timer-Aenderungen werden dauerhaft im Browser gespeichert. Der normale INI-Export nimmt diese Einstellungen in einem `[settings]`-Abschnitt mit und stellt sie beim Import wieder her.

## Deployment

Ein Push auf `main` startet den vorhandenen GitHub-Pages-Workflow.

```powershell
git add index.html config.ini README.md
git commit -m "Update Linny's Astral Solisium Pulse"
git push origin main
```

Die MkDocs-Dokumentation wird derzeit bewusst nur lokal gebaut. Dadurch bleibt die bestehende GitHub-Pages-Anwendung unveraendert. Eine spaetere separate Veroeffentlichung der Dokumentation benoetigt eine eigene, dokumentierte Deployment-Entscheidung.
