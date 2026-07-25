---
title: Changelog
doc_type: reference
status: active
audience:
  - project-maintainer
  - developer
  - ai-agent
canonical: true
---

# Changelog

Alle relevanten Produktänderungen werden hier menschenlesbar zusammengefasst. Das Git-Log bleibt die technische Detailhistorie.

## 3.3.2 – 25. Juli 2026

<span class="status-chip status-active">Live</span>

Direktes Nutzerfeedback nach 3.3.1: Die 3.3.0-Umstellung des
Einstellungsbereichs (Kategorie verwalten, Anzeige & Darstellung,
Timer-Werkstatt, Timer anzeigen, Benachrichtigungen) auf ein per Zahnrad
ein-/ausblendbares Overlay mit fixierter Position und abdunkelndem
Hintergrund wurde als Verschlechterung gegenüber 3.2 empfunden, wo dieser
Bereich direkt unter dem Hero-Bild sichtbar war und nicht extra geöffnet
werden musste.

- Revert: Der Einstellungsbereich (`#settingsPanel`) ist kein fixiertes
  Overlay mit Backdrop, Kopfzeile und ×-Knopf mehr, sondern wieder ein
  normaler Seitenabschnitt direkt unter dem Hero-Bild – wie in 3.2. Das
  Zahnrad-Symbol blendet ihn weiterhin ein/aus (jetzt per einfachem
  `hidden`-Attribut statt Overlay-Logik) und der Zustand wird wie zuvor im
  Browser gespeichert; standardmäßig ist er sichtbar.
- Die fünf klar beschrifteten, unabhängig auf-/zuklappbaren Bereiche
  (Kategorie, Anzeige & Darstellung, Timer-Werkstatt, Timer anzeigen,
  Benachrichtigungen) aus 3.3.1 bleiben erhalten – nur die Overlay-Hülle
  drumherum wurde entfernt, sie sind jetzt Karten in einem responsiven Raster
  innerhalb des immer sichtbaren Bereichs.
- Der Sprachumschalter (DE/EN/Boarisch) ist wieder direkt in der Kopfzeile
  statt in der (jetzt entfallenen) Overlay-Kopfzeile.
- Der „Speicher verwalten"-Schnellzugriff bleibt als kleiner Knopf am Anfang
  des Einstellungsbereichs erhalten.
- `tests/runtime-smoke.mjs` prüft jetzt das neue Sichtbarkeits-Verhalten
  (`hidden`-Attribut, standardmäßig sichtbar, per Zahnrad umschaltbar) statt
  der entfernten Overlay-Zustände.
- Versionsnummer im Header von „v3.3.1" auf „v3.3.2" angehoben.

## 3.3.1 – 25. Juli 2026

<span class="status-chip status-done">Done</span>

Zwei Nachbesserungen an der 3.3.0-Modularisierung, gefunden per echtem
Headless-Browser-Test (Chromium) sowohl gegen `file://` als auch gegen die
veröffentlichte GitHub-Pages-Seite:

- Fix: Die neue Modul-Aufteilung (`assets/js/app.js` u.a. via
  `<script type="module">`) lud beim direkten Öffnen von `index.html` per
  Doppelklick (`file://`) nicht mehr: Browser blockieren ES-Modul-Fetches über
  `file://` aus Sicherheitsgründen (CORS). Da zuvor kein Fehler sichtbar
  wurde, blieb die Seite dauerhaft leer („booting"-Zustand). Ein kleines
  klassisches Inline-Script fängt das `error`-Ereignis des Modul-Scripts jetzt
  ab, blendet die Seite wieder ein und zeigt eine verständliche
  zweisprachige Hinweismeldung, statt stumm leer zu bleiben. Über GitHub
  Pages oder einen lokalen Webserver war und bleibt die Seite unverändert
  funktionsfähig. Siehe
  `docs/project/architecture.md#bekannte-browsergrenze-file`.
- Fix: Das rotierende Hero-Hintergrundbild (Themen Astral/Bavaria) 404ete auf
  der echten Live-Seite, weil der per JavaScript gesetzte
  CSS-Custom-Property-Wert `--hero-image: url(...)` einen relativen
  Bildpfad enthielt. Chromium löst `url()`-Werte innerhalb einer per `var()`
  konsumierten Custom Property relativ zum Stylesheet auf, das sie
  konsumiert (`assets/styles/app.css`), nicht relativ zum Dokument – dadurch
  landete der Request unter `assets/styles/assets/events/...`. Der Pfad wird
  vor dem Setzen jetzt über `new URL(..., document.baseURI)` in eine
  absolute URL aufgelöst.
- Sichtbare Versionsnummer im Header von „v3.3" auf „v3.3.1" angehoben und
  Service-Worker-Cachename entsprechend gebumpt (`linny-epic-time-portal-v3-3-1`),
  damit auch wiederkehrende Besucher:innen die Fixes sofort erhalten und am
  Header erkennbar ist, welcher Stand geladen wurde.
- UX-Nachbesserung am 3.3.0-Einstellungs-Overlay: Kategorie, Anzeige &
  Darstellung, Timer-Werkstatt (Neuer Timer/Export/Import), Timer anzeigen
  und Benachrichtigungen sind jetzt fünf klar beschriftete, unabhängig
  auf-/zuklappbare Bereiche (`<details>`) statt eines unübersichtlichen
  Blocks – die Kategorie-Verwaltung war zuvor optisch nicht von den
  Neuer-Timer/Export/Import-Knöpfen abgegrenzt.
- Der Sound-Test-Knopf bei Benachrichtigungen stand zuvor isoliert neben dem
  Alarmsteuerungs-Auswahlfeld; er zeigt jetzt Symbol **und** Beschriftung
  und ist sichtbar der Alarmsteuerung zugeordnet.
- Die Pfeile zum Positionieren der schwebenden Statusleiste (Dock-Pad) wurden
  spürbar vergrößert (38px → 48px, Schriftgröße 20px → 26px).
- „Nächste Events" klappt nicht mehr nach oben weg, sondern dockt seitlich
  zu einer schmalen Leiste am rechten Rand (Pfeil zeigt zum Einklappen nach
  rechts, Hero-/Kalenderbereich gewinnt dadurch Breite zurück).
- Neues Werkzeug `scripts/visual_check.mjs` (Playwright) für echte
  Screenshot-Prüfungen (`npm run visual:local` / `npm run visual:live`);
  aktuelle Baseline-Screenshots liegen unter `tests/visual-baselines/*.png`
  im Repository, siehe `AGENTS.md#visuelle-prüfung-bei-ui--layout-änderungen`.

## 3.3.0 – 25. Juli 2026

<span class="status-chip status-active">In Review</span>

- Monolithisches Inline-CSS/-JavaScript in direkt auslieferbare ES-Module und
  eine Stylesheet-Datei getrennt.
- Strikte, zeilengenaue INI-Validierung für IDs, Zeitpläne, Zeitzonen,
  Datumsgrenzen, Bilder und Motive ergänzt.
- Einstellungen als rechtes Overlay, Timereditor verschiebbar und einklappbar,
  Timerbereich bis zur Kalenderhöhe sowie fünf Bildvorschaugrößen umgesetzt.
- PWA-Button zeigt den laufenden Standalone-Modus und erscheint im Browser nur,
  wenn eine Installation angeboten wird.
- Fünf eigenständige Synth-Sounds mit getrennten Dauern für Warning und
  Critical; alte Sound-IDs bleiben importierbar.
- Service-Worker-Caching, sichtbare Start-/Importfehler und Live-Sync-Status
  gehärtet.
- App-, Modul-, Asset-, INI-, ICS- und Runtime-Tests erweitert; Pages deployt
  erst nach erfolgreichen App- und Doku-Gates.
- Living-Brain-Schutz, fähigkeitsbasierte Agentenreviews, periodische externe
  Stand-der-Technik-Audits und Repository-Vorlagen ergänzt.

## 3.2.0 – 24. Juli 2026

<span class="status-chip status-active">Chief Review</span>

- Haupt-Timerliste und Kalenderexport als dauerhaft speicherbare, einklappbare Module umgesetzt.
- Direkte achtteilige Dock-Steuerung ersetzt das Positions-Dropdown; horizontale Statusleisten laufen einreihig.
- Kino- und Großbildkarten neu angeordnet: vollständige Namen, größere Motive und kompakter platzierte Countdowns.
- Konfigurierbare Hover-Großvorschau für Eventbilder ergänzt; einfacher Klick öffnet weiterhin die Vollansicht.
- Detail-Tooltips erscheinen auf der Hauptseite nach einer Sekunde und bleiben im reinen Statusfenster verborgen.
- Einstellungsbereich über ein Zahnrad ein-/ausblendbar; Benachrichtigungsstatus in kompakte Tooltips verschoben.
- Themenwelten prägen nun auch Flächen, Rahmen und Hintergrund der vollständigen Oberfläche deutlicher.
- Sichtbares Sprach- und Motivflackern beim initialen Laden durch atomaren Startzustand beseitigt.
- Pages-Workflow bleibt die einzige Veröffentlichungsquelle für Anwendung und MkDocs-Hilfe.

Bekannte Browsergrenze: Die URL-/Titelleiste eines Popupfensters wird aus Sicherheitsgründen vom Browser gesteuert und kann von einer Webseite nicht zuverlässig entfernt werden.

## 3.1.0 – 24. Juli 2026

<span class="status-chip status-done">Done</span>

- Kartenrendering entkoppelt: Countdowns aktualisieren sich weiterhin sekündlich, ohne Bilder und komplette Karten neu aufzubauen.
- Neue Themenwelten, Kino- und Großbildmodus sowie rotierender Hero-Bereich ergänzt.
- Timerbearbeitung aus den Statuskarten in die kompakte Timerauswahl verschoben.
- Verspätete Browseralarme zeigen nun die tatsächlich verbleibende Zeit statt des konfigurierten Soll-Vorlaufs.
- Gate-of-Memory-Standard auf sechs Minuten Warning und zwei Minuten Critical angepasst.
- Entwurfs-Timer werden erst beim Speichern dauerhaft; alte leere „Neuer Timer“-Entwürfe werden migriert.
- Tooltip-Positionierung, lange Namen, Timerlisten-Scrolling und das überlagerte Seitenende korrigiert.
- Zentrale Alarmsteuerung und Theme-Einstellungen in INI-Import/-Export und lokalen Einstellungen ergänzt.
- Neues Hauptmotiv, Time-Lady-, Anime- und Arcade-Motive in die erweiterbare Theme-Struktur aufgenommen.
- Dokumentationsvertrag, Designsystem, Anwender-Neuigkeiten und sichere Discord-Webhook-Planung ergänzt.

## 3.0.0 – 24. Juli 2026

<span class="status-chip status-done">Chief Review</span>

- Gate of Memory auf `11806` Sekunden, neuen Anchor und vier Minuten Dauer korrigiert.
- Stündlichen, validierten MetaForge-Abgleich über GitHub Pages und `live-timers.ini` ergänzt.
- InnerSphere-Wochenplan für Boonstone, Riftstone, Archboss, Guild Raid, Interserver, Tax Delivery und Siege übernommen.
- Installierbare Progressive Web App mit Offline-App-Shell ergänzt.
- Boarisch/Minga als Standard für deutsche Clients beibehalten.
- Warning und Critical unabhängig konfigurierbar; 20 synthetisierte Sounds und fließende Farbphasen.
- Timerkarten, Statusfenster, Historie, Kalenderauswahl und Ultra-Kompaktmodus überarbeitet.
- Einwilligungsdialog, Impressum, Datenschutzansicht und lokale Datenspeicherung ergänzt.
- Eventbilder und tägliche Linny-Galerie mit Großansicht eingebaut.
- Potenzielle HTML-Injektion aus importierten INI-Werten beseitigt.
- MkDocs auf ein responsives Linny-Design umgestellt; Taskboard und Governance ergänzt.

## 2.6.0 – 20. Juli 2026

- Drei Sprachen, neue Anzeigezeitzone, zweistufige Erinnerungen und dynamische Timerkarten.
- INI-Import/-Export, Kalender-Massenauswahl und einklappbare Eventhistorie.

## 2.0.0 – Juli 2026

- Modernes Dashboard, lokaler Timereditor und GitHub-Pages-Deployment.

## Pflege

Jeder Merge mit sichtbarer Produkt-, Architektur- oder Prozessänderung ergänzt:

1. Version und Datum,
2. Nutzerwirkung,
3. technische oder sicherheitsrelevante Änderung,
4. Migration oder bekannte Einschränkung.

Reine Formatierungsänderungen ohne Nutzerwirkung benötigen keinen eigenen Eintrag.
