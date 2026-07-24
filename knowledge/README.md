# Gemeinsame KI-Wissensbasis

## Ziel

Diese Wissensbasis ist die versionierte Gesprächs- und Arbeitsschnittstelle zwischen Mensch, ChatGPT, GitHub Copilot und lokalen Agenten. Sie soll Kontextwechsel ermöglichen, ohne jedes Thema vollständig neu erklären zu müssen.

Sie speichert nicht jeden Chat. Sie speichert den **verdichteten, überprüfbaren Arbeitsstand**:

- stabile Fakten und Rahmenbedingungen,
- Ziele und Anforderungen,
- Architektur- und Prozessentscheidungen,
- Forschungsstände mit Quellen,
- Projektstatus und offene Punkte,
- Übergaben zwischen Agenten,
- wiederverwendbare Standards, Vorlagen und Arbeitsweisen.

## Grundprinzip

> Chats sind Arbeitsgespräche. Git ist das kontrollierte Langzeitgedächtnis.

Chatverläufe dürfen als Eingangsmaterial dienen, sind aber nicht automatisch die maßgebliche Wahrheit. Relevante Inhalte werden strukturiert, dedupliziert, datiert und mit ihrem Status in diese Wissensbasis übernommen.

## Ordnerstruktur

```text
knowledge/
├── README.md
├── 00-governance/
│   ├── knowledge-policy.md
│   └── context-protocol.md
├── 10-context/
│   ├── glossary.md
│   ├── constraints.md
│   └── preferences.md
├── 20-domains/
│   └── <domain>/
│       ├── README.md
│       ├── facts.md
│       ├── processes.md
│       └── open-questions.md
├── 30-projects/
│   └── <project>/
│       ├── README.md
│       ├── requirements.md
│       ├── architecture.md
│       ├── status.md
│       └── backlog.md
├── 40-decisions/
│   ├── README.md
│   └── ADR-0001-example.md
├── 50-research/
│   └── <topic>.md
├── 60-playbooks/
│   └── <workflow>.md
├── 70-templates/
│   ├── project.md
│   ├── research-note.md
│   ├── adr.md
│   └── handoff.md
├── 80-archive/
└── 90-handoffs/
    ├── README.md
    └── current.md
```

Ordner entstehen in Git erst, sobald eine Datei darin gespeichert wird. Die Struktur wird deshalb schrittweise nach tatsächlichem Bedarf aufgebaut.

## Minimale Startmenge für Agenten

Bei jeder größeren Aufgabe zuerst lesen:

1. `/AGENTS.md`
2. `/knowledge/00-governance/knowledge-policy.md`
3. `/knowledge/00-governance/context-protocol.md`
4. `/knowledge/90-handoffs/current.md`
5. `README.md` des betroffenen Themengebiets oder Projekts

Danach nur die konkret referenzierten Dateien laden. So bleibt der Kontext fokussiert und wird nicht durch irrelevantes Wissen überfüllt.

## Dokumenttypen

### Kontext

Langfristig relevante Rahmenbedingungen, Begriffe, Präferenzen und Einschränkungen. Nur speichern, wenn sie zukünftige Entscheidungen tatsächlich beeinflussen.

### Projektakte

Aktueller, kompakter Zustand eines Projekts. Sie verweist auf Anforderungen, Architektur, Entscheidungen, Forschungsnotizen und Backlog.

### ADR

Eine Architecture Decision Record dokumentiert eine wichtige Entscheidung mit Anlass, Alternativen, Entscheidung, Folgen und Status.

### Forschungsnotiz

Zeitabhängige externe Erkenntnisse mit Quellen, Abrufdatum, Gültigkeitsgrenze und offenen Unsicherheiten.

### Playbook

Ein wiederverwendbarer, möglichst ausführbarer Arbeitsablauf mit Rollen, Eingaben, Schritten, Qualitätskontrollen und Ergebnissen.

### Übergabe

Kompakte Arbeitsübergabe für den nächsten Menschen oder Agenten: aktueller Stand, letzte Änderungen, Risiken, offene Fragen und nächste Schritte.

## Wissensstatus

Jede wesentliche Aussage soll erkennbar einem Status zugeordnet sein:

- `confirmed`: bestätigt und als Arbeitsgrundlage freigegeben
- `observed`: aus System, Code, Messung oder Dokument beobachtet
- `assumed`: plausible, noch nicht bestätigte Annahme
- `proposed`: Vorschlag ohne Entscheidung
- `deprecated`: nicht mehr gültig, aus Nachvollziehbarkeit erhalten
- `conflicted`: widersprüchliche Quellen oder Aussagen

## Verantwortungsmodell

- **Mensch:** Ziele, Freigaben, Prioritäten und vertrauliche Grenzen
- **ChatGPT:** Recherche, Synthese, Strategie, Architektur, Qualitätssicherung und Wissensverdichtung
- **Repository-Agenten:** Implementierung, Tests, Repository-Analyse und technische Rückführung der Ergebnisse
- **Git:** Historie, Review, Konflikterkennung und gemeinsame Quelle

Kein Agent ist unfehlbar. Wichtige Entscheidungen bleiben nachvollziehbar und überprüfbar.

## Öffentliche und vertrauliche Inhalte

Dieses konkrete Repository ist öffentlich. Hier dürfen nur öffentliche oder bewusst freigegebene Informationen gespeichert werden. Eine produktive Wissensbasis für Siemens-Arbeit oder private sensible Themen muss in einem dafür freigegebenen privaten Repository beziehungsweise Unternehmenssystem liegen.
