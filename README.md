# Throne and Liberty Community Event Timer

Konfigurationsbasiertes GitHub-Pages Tool fuer Throne and Liberty Events.

## Features

- Mehrsprachig: Deutsch und Englisch
- Auto-Sprache ueber Browser/Windows-Sprache (de -> Deutsch, sonst Englisch)
- Region-Auswahl (Default: EU) mit lokaler Zeitdarstellung fuer jeden Nutzer
- Dynamische Event-Timer per Checkbox ein/ausblendbar
- Sticky-Bar mit naechstem Event und Live-Countdown
- Saisonale Events werden nur im gueltigen Datumsfenster angezeigt
- ICS-Export pro Event-Slot
- Browser-Benachrichtigungen 5 Minuten vor Event
- Schmale Sidebar-Ansicht fuer angedocktes Fenster rechts

## Dateien

- `index.html`: UI, Rendering, Timer-Engine, Notifications
- `events.json`: Regionen und Event-Konfiguration

## Event-Konfiguration (`events.json`)

Jedes Event ist ueber einen JSON-Eintrag pflegbar.

Wichtige Felder:

- `id`: eindeutige ID
- `enabled`: `true` oder `false`
- `type`: `fixedTimes` oder `interval`
- `regions`: erlaubte Regionen (z. B. `eu`, `nae`, `naw`)
- `activeFrom`, `activeUntil`: UTC-Zeitfenster (`YYYY-MM-DDTHH:mm:ssZ`)
- `names.de` / `names.en`
- `descriptions.de` / `descriptions.en`
- `source.de` / `source.en`
- `durationMinutes`: Dauer fuer ICS

Fuer `fixedTimes`:

- `timesByWeekday.default`: Tageszeiten als `HH:mm`
- `timesByWeekday.weekend`: optionale Wochenend-Slots

Fuer `interval`:

- `intervalMinutes`
- `anchorUtc` oder `anchorUtcByRegion`

## Neue Events einfuegen

1. In `events.json` einen neuen Eintrag in `events` anlegen.
2. Falls noetig Region in `regions` erweitern.
3. `enabled` auf `true` setzen, sobald Zeiten bestaetigt sind.
4. Commit und Push auf `main`.

## Deployment

Die GitHub Page aktualisiert sich nach einem Push auf den verwendeten Pages-Branch (hier `main`).

Beispiel:

```powershell
git add index.html events.json README.md
git commit -m "Add universal config-driven event timer"
git push origin main
```
