# Beitragen

Vor einer Änderung sind [`AGENTS.md`](AGENTS.md) und die dort verlinkten
kanonischen Dokumente zu lesen.

## Lokaler Qualitätscheck

```powershell
npm ci
npm run check
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-docs.txt
.\.venv\Scripts\python.exe -m py_compile scripts\sync_gate_memory.py
.\.venv\Scripts\python.exe -m py_compile scripts\build_help.py
.\.venv\Scripts\mkdocs.exe build --strict
.\.venv\Scripts\python.exe scripts\build_help.py --site-dir help
```

Änderungen erfolgen auf einem Feature-Branch und werden per Pull Request
eingereicht. Sichtbares Verhalten benötigt passende Tests, Changelog und
Anwenderhinweis. Änderungen am Living Brain benötigen Owner-Review; bei
Unsicherheit ist nur ein Vorschlag mit `Chief-AI-Review erforderlich`
einzureichen.

Ausnahme (siehe [ADR-0015](docs/engineering/decision-log.md)): Der Local Chief
Coding Agent ist von Thomas als Product Owner autorisiert, direkt auf `main`
zu committen und zu pushen, ohne Feature-Branch/PR. Die Qualitätspflicht
(`npm run check`, Doku-Build) und die Commit-Metadaten-Pflicht aus `AGENTS.md`
gelten dabei unverändert.
