# Solisium Pulse

Kompakter, konfigurationsbasierter Event-Timer fuer Throne and Liberty EU. Die Seite laeuft statisch auf GitHub Pages und liest ihre Standard-Timer ausschliesslich aus `config.ini`.

## Features

- Deutsch und Englisch, automatisch nach Browsersprache
- Live-Countdowns fuer Cron-Zeitplaene und sekundengenaue Intervalle
- Automatische Anzeige in der lokalen Zeitzone des Nutzers
- Timer pro Kategorie ein- und ausblendbar
- Saisonale Timer mit optionalem Gueltigkeitszeitraum
- Browser-, Popup- und Audio-Erinnerungen
- Explizite Browserfreigabe mit Statusanzeige und testbarer Mehrton-Erinnerung
- ICS-Export einzelner oder beliebig vieler ausgewaehlter Termine in einer Datei
- Kompakte zweispaltige Auswahl der sichtbaren Timer
- Lokale Anpassungen als lesbare INI importieren und exportieren
- Responsive Sidebar-Ansicht

## Dateien

- `index.html`: Oberflaeche, Timer-Engine und Benachrichtigungen
- `config.ini`: einzige Standard-Konfiguration fuer Kategorien und Timer

## Timer in `config.ini`

Jeder Timer besitzt einen eigenen Abschnitt:

```ini
[timer:gate_memory_eu]
categoryId=tl_eu
name.de=Tor der Erinnerung
name.en=Gate of Memory
durationMinutes=4
activeFrom=2026-01-01T00:00:00Z
activeUntil=2026-12-31T23:59:59Z
rules=@every 11808s
anchorUtc=2026-07-19T00:03:00Z
notifications.enabled=true
notifications.minutes=5
notifications.channels=browser,popup,beep
```

Zeitplanformate:

- Cron: `Minute Stunde Tag Monat Wochentag`
- Mehrere Regeln: mit `||` trennen
- Intervall: `@every 11808s`, `@every 90m` oder `@every 2h`
- Bei Intervallen legt `anchorUtc` den exakten Startpunkt fest
- `activeFrom` und `activeUntil` sind optionale ISO-UTC-Grenzen

Der Export-Button erzeugt eine vollstaendige `timer-config.ini`. Dieselbe Datei kann ohne JSON-Zwischenschritt wieder importiert oder als neue `config.ini` ins Repository uebernommen werden.

Windows-/Browserbenachrichtigungen werden ueber den Button in der Oberflaeche freigegeben. Die Seite muss fuer Timer, In-App-Popups und Audio-Erinnerungen geoeffnet bleiben.

## Deployment

Ein Push auf `main` startet den vorhandenen GitHub-Pages-Workflow.

```powershell
git add index.html config.ini README.md
git commit -m "Update Solisium Pulse"
git push origin main
```
