---
title: Was ist neu?
doc_type: explanation
status: active
audience:
  - user
canonical: true
---

# Was ist neu?

## Version 3.3.3: Layout-Feinschliff nach eurem Feedback

- Fix: Checkboxen (z. B. "Warning aktiv", Browser/Popup, Barrierefreiheit)
  erschienen über statt neben ihrem Text – jetzt überall korrekt nebeneinander.
- "Kategorie verwalten" und "Timer-Werkstatt" sind zur Gruppe "Verwaltung"
  zusammengefasst; der "+"-Knopf für neue Timer sitzt jetzt direkt bei
  "Timer anzeigen".
- Neu: Ein Zahnrad-Popover bündelt Speicherverwaltung, Anzeige & Darstellung
  und Import/Export – die Hauptseite bleibt aufgeräumt.
- Kartendichte jetzt sauber sortiert mit neuer Stufe "Extra groß".
- Benachrichtigungskarten: aktiv-Checkbox und Vorlaufzeit stehen nebeneinander,
  das Sound-Test-Symbol ist jetzt icon-only, das Sound-Dauer-Feld schmaler.
- 5 neue Sounds: Power-Riff, Sci-Fi-Signal, Retro-Chiptune, Smooth Groove und
  Kristallklang.
- Die Andock-Symbole für die Statusleisten-Position sind größer und einheitlich
  gestaltet.
- Die Editor-Aktionsleiste passt jetzt in eine Zeile mit kompakten
  Symbol-Knöpfen samt Tooltip.

## Version 3.3.2: Einstellungen wieder direkt sichtbar

- Rückmeldung nach 3.3.1: Kategorie, Anzeige & Darstellung, Timer-Werkstatt,
  Timer anzeigen und Benachrichtigungen mussten erst per Zahnrad in einem
  abgedunkelten Overlay geöffnet werden. Das ist jetzt zurückgebaut – dieser
  Bereich steht wieder direkt unter dem Hero-Bild, ganz ohne Klick, so wie in
  Version 3.2.
- Das Zahnrad blendet den Bereich weiterhin ein/aus, falls mehr Platz
  gebraucht wird; der Browser merkt sich die Wahl.
- Die fünf klar beschrifteten, einzeln auf-/zuklappbaren Bereiche aus 3.3.1
  bleiben erhalten und sind jetzt als Karten nebeneinander angeordnet.
- Der Sprachumschalter (DE/EN/Boarisch) ist wieder in der Kopfzeile.

## Version 3.3: mehr Platz und echte Einstellungen

- Das Zahnrad öffnet jetzt ein eigenes Einstellungsfenster mit Sprache und
  Speicherverwaltung.
- Der Timereditor lässt sich links oder rechts anzeigen und platzsparend
  einklappen.
- Die Timerliste nutzt auf breiten Bildschirmen die Höhe bis zum Kalender.
- Bildvorschauen gibt es in klein, mittel, groß und sehr groß.
- Warning und Critical besitzen getrennte Sound-Dauern von 1 bis 60 Sekunden.
- Fünf neue eigenständige Synth-Klangwelten ersetzen die unübersichtliche lange
  Soundliste; alte Einstellungen funktionieren weiterhin.
- Die installierte PWA zeigt eindeutig `App läuft`; im Browser erscheint der
  Installationsknopf nur, wenn eine Installation möglich ist.
- Fehlerhafte INI-Dateien zeigen konkrete Ursachen, statt unbemerkt falsche
  Timer zu übernehmen.
- Fix: Beim direkten Öffnen von `index.html` per Doppelklick blieb die Seite
  nach der Modul-Umstellung leer, weil Browser Modul-Skripte über `file://`
  blockieren. Jetzt erscheint stattdessen eine verständliche Hinweismeldung;
  über GitHub Pages oder einen lokalen Webserver funktioniert die Seite wie
  gewohnt.
- Fix: Das rotierende Hero-Hintergrundbild im Astral- und Bayern-Motiv lud auf
  der echten Seite gelegentlich nicht (404), weil der Bildpfad im Browser
  falsch aufgelöst wurde. Das Hero-Bild lädt jetzt zuverlässig.
- Verbesserung: Das Einstellungsfenster war zu unübersichtlich – Kategorie,
  Anzeige, Timer-Werkstatt (Neuer Timer/Export/Import), Timer anzeigen und
  Benachrichtigungen sind jetzt fünf einzeln auf-/zuklappbare Bereiche mit
  eigener Überschrift.
- Verbesserung: Der Sound-Test-Knopf bei den Benachrichtigungen zeigt jetzt
  eine Beschriftung statt nur ein einsames Lautsprecher-Symbol.
- Verbesserung: Die Pfeile zum Positionieren der Statusleiste sind deutlich
  größer und leichter zu treffen.
- Verbesserung: „Nächste Events" klappt jetzt seitlich zu einer schmalen
  Leiste am rechten Rand ein (Pfeil zeigt nach rechts), statt nach oben zu
  verschwinden – dadurch bleibt mehr Platz für Hero-Bild und Kalender.

## Das Portal räumt die Kommandozentrale auf

Version 3.2 macht die Oberfläche modular: Wer das separate Statusfenster verwendet,
kann die doppelte Timerliste auf der Hauptseite einklappen. Auch der Kalender lässt
sich platzsparend schließen; beide Entscheidungen merkt sich der Browser.

### Neu in 3.2

- großes Steuerkreuz zum direkten Andocken an acht Bildschirmpositionen
- einreihige Statusleisten am oberen und unteren Bildschirmrand
- vollständig lesbare Namen im Kino-Modus
- kompaktere Großbildkarten mit Countdown rechts neben dem Eventnamen
- konfigurierbare große oder sehr große Bildvorschau beim Darüberfahren
- einfacher Klick für die Vollbildansicht
- einklappbare Timer-, Kalender- und Einstellungsbereiche
- deutlich unterscheidbarere Themenwelten

Die sichtbare Browserleiste eines Popupfensters gehört zu Edge, Chrome oder Firefox.
Eine Webseite darf sie aus Sicherheitsgründen nicht vollständig ausblenden.

## Linny öffnet das Epic Time Portal

Version 3.1 macht aus dem Timer stärker eine kleine Themenwelt: Der große Einstieg
und die Eventbilder wechseln kontrolliert, ohne beim Sekundentakt zu flackern.

![Time Lady Linny vor ihrem Zeitportal](../assets/linny/linny-time-lady-gallifrey-v1.webp)

*Time Lady Linny wollte nur kurz die Uhr stellen. Gallifrey hat jetzt Sommerzeit in
acht Dimensionen.*

### Die wichtigsten Neuerungen

- mehrere vollständige Themenwelten statt eines bloßen Farbwechsels
- Kino- und Großbildmodus zusätzlich zu den kompakten Kartendichten
- stabil rotierende Linny-Bilder und ein größeres Titelmotiv
- kompaktere Symbolbedienung mit erklärenden Tooltips
- zentrale Auswahl: Timer-Standard, alle Alarme, nur visuell oder alles aus
- zuverlässigere Alarmtexte mit der wirklich verbleibenden Zeit
- sauber scrollende Timerlisten ohne abgeschnittene Karten am Seitenende
- verständlichere Timernamen und besser positionierte Detail-Tooltips

### Noch in Vorbereitung

Die Theme-Struktur ist bereits erweiterbar. Zusätzliche Doctor-Who-, Arcade-,
Fantasy-, Weltraum- und Comedy-Motive werden später ohne Umbau der Timerlogik
ergänzt.
