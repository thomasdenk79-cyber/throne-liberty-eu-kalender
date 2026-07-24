---
title: Discord-Webhook
doc_type: how-to
status: active
audience:
  - project-maintainer
  - developer
  - discord-admin
canonical: true
---

# Discord-Webhook

## Ziel

Ein Incoming Webhook kann Warning- und Critical-Erinnerungen mit Linny-Text,
Eventbild, Startzeit und Link zur Timerseite in einen Gildenkanal posten.

## Sicherheitsgrenze

Die Webhook-URL ist ein sendefähiges Geheimnis. Sie darf niemals in `index.html`,
`config.ini`, einem Screenshot, Issue, Commit oder öffentlichen Workflow-Log
stehen. Eine statische GitHub-Pages-Seite darf sie auch nicht im Browser speichern.

## Was der Discord-Admin erledigt

1. Discord-Servereinstellungen öffnen.
2. **Integrationen → Webhooks → Neuer Webhook** wählen.
3. Namen, Avatar und Zielkanal festlegen.
4. Webhook-URL kopieren und ausschließlich über einen vereinbarten sicheren Weg
   an den Betreiber der Alarmkomponente übergeben.

Der Admin benötigt die Berechtigung **Webhooks verwalten**. Normale
Gildenmitglieder können diesen Schritt gewöhnlich nicht ausführen.

## Geplante Nachricht

Eine Nachricht enthält:

- Warning oder Critical mit klarer Farbe
- lokalisierten, zufällig gewählten Linny-Text
- Eventname, exakte Uhrzeit und tatsächliche Restzeit
- optionales Eventbild
- Link zu Linny's Epic Time Portal

Deutsch ist die sichere Vorgabe. Englisch oder Boarisch wird je Webhook zentral
konfiguriert.

## Betrieb

GitHub Pages allein kann Geheimnisse weder schützen noch Alarme im Hintergrund
sekundengenau versenden. Eine aktivierte Integration benötigt deshalb eine kleine
serverseitige Alarmkomponente. Für minutengenaue Critical-Meldungen eignet sich
ein geplanter Worker besser als der ungenaue Browser-Hintergrundtab.

Bis diese Komponente eingerichtet und der Webhook als Secret hinterlegt ist,
bleibt Discord in der Anwendung bewusst als „nicht eingerichtet“ gekennzeichnet.
Ein Agent darf keine scheinbar funktionierende Client-Lösung bauen, die die URL
offenlegt.
