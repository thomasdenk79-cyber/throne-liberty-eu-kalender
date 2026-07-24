---
title: Taskboard
doc_type: reference
status: active
audience:
  - project-maintainer
  - developer
  - ai-agent
canonical: true
---

# Taskboard

Dieses Repository-Board ist die portable Demo-Quelle. Es funktioniert ohne externes Tool, wird mit dem Code versioniert und kann später nach GitHub Projects oder Microsoft Teams gespiegelt werden.

## Erledigt

| Status | Arbeitspaket | Verantwortlich | Abnahme |
|---|---|---|---|
| <span class="status-chip status-done">Done</span> | Responsive Timerkarten und Dock-Fenster | Junior Coding Agent | Chief AI Review |
| <span class="status-chip status-done">Done</span> | Projektgedächtnis und MkDocs-Grundstruktur | Junior Coding Agent | Thomas / Chief AI |
| <span class="status-chip status-done">Done</span> | Gate-of-Memory-Live-Synchronisation | Chief AI Developer | automatisierte Tests |
| <span class="status-chip status-done">Done</span> | PWA, Offline-App-Shell und Installationsbutton | Chief AI Developer | Browser-Smoke-Test |
| <span class="status-chip status-done">Done</span> | Sicherheitsreview für importierte INI-Inhalte | Chief AI Architect | DOM-XSS-Test |

## In Arbeit

| Status | Arbeitspaket | Verantwortlich | Ziel |
|---|---|---|---|
| <span class="status-chip status-active">Review</span> | Juli-Eventdaten im Spiel gegenprüfen | Thomas · Product Owner | nächste Spielsession |
| <span class="status-chip status-active">Review</span> | PWA-Installation auf Android, iOS und Windows prüfen | Human QA | nächster Release |
| <span class="status-chip status-active">Review</span> | Linny Portal 3.1: Themes, stabile Karten und Symbol-UI | Chief AI Developer | automatisierte und visuelle Abnahme |
| <span class="status-chip status-active">Review</span> | Discord-Webhook mit Gildenadmin einrichten | Thomas / Discord Admin | Secret außerhalb des Repositories hinterlegt |

## Als Nächstes

| Status | Arbeitspaket | Verantwortlich | Akzeptanzkriterium |
|---|---|---|---|
| <span class="status-chip status-next">Next</span> | GitHub-Issues als echtes Teamboard aktivieren | Thomas / Project Lead | Labels und Templates vorhanden |
| <span class="status-chip status-next">Next</span> | Teams-Demo anbinden | Admin Runner | Teams-Plugin verbunden; keine Geheimnisse im Repo |
| <span class="status-chip status-next">Next</span> | Browser-End-to-End-Tests erweitern | Junior Developer | mobile, wide und PWA im CI |
| <span class="status-chip status-next">Next</span> | Theme-Galerien schrittweise mit zusätzlichen Linny-Motiven füllen | Creative AI / Human Review | je Themenwelt ausreichende Bildauswahl |

## Workflow

```text
Backlog → Ready → Umsetzung → Pull Request → Chief Review → Human Acceptance → Done
```

Ein Agent darf den Status nicht allein auf „Done“ setzen, wenn fachliche Abnahme oder ein externer Test aussteht.

![Linny vor einer unendlichen Armee](../assets/linny/linny-goddess-of-armies-v1.webp)

*Linny priorisiert das Backlog. Zehntausend Stakeholder stimmen aus Gründen geschlossen zu.*
