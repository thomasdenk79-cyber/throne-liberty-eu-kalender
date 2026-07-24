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
