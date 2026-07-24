---
title: Designsystem und UX
doc_type: reference
status: active
audience:
  - developer
  - ai-agent
canonical: true
---

# Designsystem und UX

## Zielbild

Die Anwendung ist zugleich Werkzeug und Demo. Sie soll auf einem schmalen
Statusfenster, Smartphone, Tablet, Desktop und Ultrawide-Monitor geordnet wirken.
Linny wird episch und humorvoll inszeniert; Timerinformation bleibt dennoch die
erste Aufgabe.

## Gestaltungsprinzipien

1. **Informationshierarchie:** Eventname, Countdown und Phasenbalken sind sofort
   erfassbar. Details liegen in Tooltips oder Einstellungen.
2. **Symbol-first, nicht symbol-only:** bekannte Aktionen dürfen Icons verwenden.
   Jedes Icon braucht `title`, `aria-label`, Tastaturfokus und eine verständliche
   Erklärung. Unbekannte oder riskante Aktionen behalten Text.
3. **Responsive statt fester Pixelbühne:** CSS Grid, `minmax()`, `clamp()` und
   sinnvolle Umbruchgrenzen verwenden. Kein Inhalt darf nur bei einer Testbreite
   funktionieren.
4. **WYSIWYG:** Eine Einstellung zeigt ihre Wirkung unmittelbar. Auswahl und
   Ergebnis sollen räumlich nachvollziehbar bleiben.
5. **Progressive Offenlegung:** seltene Einstellungen sind einklappbar oder im
   Einstellungsbereich; das Dashboard zeigt den Status.
6. **Barrierefreiheit:** Kontrastmodus bleibt optional. Farbe ist nie das einzige
   Signal. `prefers-reduced-motion`, Fokuszustände und Touchbedienung beachten.
7. **Goldener Schnitt als Orientierung, nicht Dogma:** große Bildbühne und
   Informationsflächen sollen ungefähr in einer 60/40-Beziehung funktionieren,
   dürfen auf schmalen Ansichten aber vollständig stapeln.

## Themenwelten

Ein Theme verändert mehr als Akzentfarben:

- Hintergrundbühne und Lichtstimmung
- Panelmaterial, Radien, Schatten und Muster
- Typografie-Akzente und Animationstemperament
- passendes Hero- und Kartenbild, sofern verfügbar
- niemals Timersemantik, Alarmzeit oder Lesbarkeit

Assets liegen langfristig unter `assets/events/themes/<theme>/`. Fehlt einem Theme
noch Bildmaterial, verwendet die Anwendung den kategoriegerechten Pool. Fehlende
Bilder blockieren daher kein Theme.

## Tooltips

- kurze, handlungsorientierte Texte
- Desktop-Hover bei umfangreichen Karteninformationen verzögert
- Tastaturfokus ohne künstliche Verzögerung
- innerhalb des Viewports positionieren
- Touch-Nutzer erhalten dieselbe Information über Fokus, Dialog oder Hilfe
- Tooltiptexte ersetzen keine notwendige Anwenderdokumentation

## Review-Check

- 320 px, 768 px, 1440 px und Ultrawide prüfen
- lange deutsche und boarische Texte testen
- mit und ohne Eventbilder prüfen
- Zoom auf mindestens 200 Prozent
- Tastaturreihenfolge und sichtbaren Fokus prüfen
- keine Sekundentakt-DOM-Neuerzeugung für statische Inhalte
