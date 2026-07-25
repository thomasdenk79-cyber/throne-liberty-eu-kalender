#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from urllib import error, request

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DOCS_DIR = REPO_ROOT / "docs"
DEFAULT_MKDOCS_CONFIG = REPO_ROOT / "mkdocs.yml"
DEFAULT_SITE_DIR = REPO_ROOT / "help"
META_FILENAME = ".build-meta.json"
CACHE_DIR = REPO_ROOT / ".translation-cache" / "en"


def iter_source_files() -> list[Path]:
    files: list[Path] = []
    for root in (REPO_ROOT / "docs",):
        for path in root.rglob("*"):
            if path.is_file():
                files.append(path)
    files.extend([REPO_ROOT / "mkdocs.yml", REPO_ROOT / "requirements-docs.txt"])
    return sorted(path for path in files if path.exists())


def source_fingerprint() -> str:
    digest = hashlib.sha256()
    for path in iter_source_files():
        rel = path.relative_to(REPO_ROOT).as_posix()
        digest.update(rel.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def run_mkdocs_build(config_path: Path, site_dir: Path, strict: bool, clean: bool) -> None:
    command = [
        sys.executable,
        "-m",
        "mkdocs",
        "build",
        "--config-file",
        str(config_path),
        "--site-dir",
        str(site_dir),
    ]
    if strict:
        command.append("--strict")
    if clean:
        command.append("--clean")
    subprocess.run(command, check=True, cwd=REPO_ROOT)


def call_ollama(prompt: str, model: str, base_url: str = "http://127.0.0.1:11434") -> str:
    payload = json.dumps(
        {
            "model": model,
            "stream": False,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You translate German markdown to English. Keep markdown structure, code fences, "
                        "links, URLs, HTML tags and YAML keys intact. Translate only natural language text. "
                        "Return markdown only."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "options": {"temperature": 0},
        }
    ).encode("utf-8")
    req = request.Request(
        f"{base_url.rstrip('/')}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=300) as response:
            body = json.loads(response.read().decode("utf-8"))
            return body["message"]["content"].strip()
    except error.URLError as exc:
        raise RuntimeError(f"Ollama translation request failed: {exc}") from exc


def call_openai(prompt: str, model: str) -> str:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")
    payload = json.dumps(
        {
            "model": model,
            "temperature": 0,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You translate German markdown to English. Keep markdown structure, code fences, "
                        "links, URLs, HTML tags and YAML keys intact. Translate only natural language text. "
                        "Return markdown only."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        }
    ).encode("utf-8")
    req = request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=300) as response:
            body = json.loads(response.read().decode("utf-8"))
            return body["choices"][0]["message"]["content"].strip()
    except error.URLError as exc:
        raise RuntimeError(f"OpenAI translation request failed: {exc}") from exc


def translate_markdown(text: str, translator: str, model: str) -> str:
    prompt = (
        "Translate the following Markdown from German to English.\n"
        "Preserve structure and technical tokens exactly.\n\n"
        "----- BEGIN MARKDOWN -----\n"
        f"{text}\n"
        "----- END MARKDOWN -----\n"
    )
    if translator == "ollama":
        return call_ollama(prompt, model)
    if translator == "openai":
        return call_openai(prompt, model)
    raise RuntimeError(f"Unsupported translator: {translator}")


def file_sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def translate_docs_to_english(
    source_docs_dir: Path,
    target_docs_dir: Path,
    translator: str,
    model: str,
) -> None:
    if target_docs_dir.exists():
        shutil.rmtree(target_docs_dir)
    shutil.copytree(source_docs_dir, target_docs_dir)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    for source_path in sorted(source_docs_dir.rglob("*.md")):
        rel = source_path.relative_to(source_docs_dir)
        target_path = target_docs_dir / rel
        source_text = source_path.read_text(encoding="utf-8")
        source_hash = file_sha(source_text)
        cache_text_path = CACHE_DIR / rel
        cache_meta_path = cache_text_path.with_suffix(cache_text_path.suffix + ".meta.json")
        translated_text = None
        if cache_text_path.exists() and cache_meta_path.exists():
            try:
                metadata = json.loads(cache_meta_path.read_text(encoding="utf-8"))
                if metadata.get("source_hash") == source_hash and metadata.get("translator") == translator and metadata.get("model") == model:
                    translated_text = cache_text_path.read_text(encoding="utf-8")
            except json.JSONDecodeError:
                translated_text = None
        if translated_text is None:
            translated_text = translate_markdown(source_text, translator=translator, model=model)
            cache_text_path.parent.mkdir(parents=True, exist_ok=True)
            cache_text_path.write_text(translated_text, encoding="utf-8")
            cache_meta_path.write_text(
                json.dumps(
                    {
                        "source_hash": source_hash,
                        "translator": translator,
                        "model": model,
                    },
                    ensure_ascii=False,
                    indent=2,
                )
                + "\n",
                encoding="utf-8",
            )
        target_path.write_text(translated_text, encoding="utf-8")


def write_en_mkdocs_config(base_config: Path, docs_dir: Path, output_dir: Path) -> Path:
    config = yaml.safe_load(base_config.read_text(encoding="utf-8"))
    config["docs_dir"] = str(docs_dir)
    config["site_dir"] = str(output_dir)
    theme = config.setdefault("theme", {})
    theme["language"] = "en"
    site_name = config.get("site_name")
    if isinstance(site_name, str) and "Hilfe" in site_name:
        config["site_name"] = site_name.replace("Hilfe", "Help")
    temp_dir = Path(tempfile.mkdtemp(prefix="mkdocs-en-", dir=REPO_ROOT))
    config_path = temp_dir / "mkdocs.en.generated.yml"
    config_path.write_text(yaml.safe_dump(config, allow_unicode=True, sort_keys=False), encoding="utf-8")
    return config_path


def write_build_metadata(site_dir: Path, include_en: bool, translator: str | None, model: str | None) -> None:
    metadata = {
        "source_fingerprint": source_fingerprint(),
        "built_at_utc": datetime.now(tz=timezone.utc).isoformat(),
        "include_en": include_en,
        "translator": translator,
        "model": model,
    }
    (site_dir / META_FILENAME).write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def validate_prebuilt(site_dir: Path) -> bool:
    marker_path = site_dir / META_FILENAME
    if not marker_path.exists() or not (site_dir / "index.html").exists():
        return False
    try:
        marker = json.loads(marker_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    return marker.get("source_fingerprint") == source_fingerprint()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build help docs locally with optional EN translation.")
    parser.add_argument("--site-dir", default=str(DEFAULT_SITE_DIR), help="Target directory for generated help HTML.")
    parser.add_argument("--mkdocs-config", default=str(DEFAULT_MKDOCS_CONFIG), help="Path to mkdocs.yml.")
    parser.add_argument("--docs-dir", default=str(DEFAULT_DOCS_DIR), help="Path to source markdown docs.")
    parser.add_argument("--translate-en", action="store_true", help="Generate an additional English help build under <site-dir>/en.")
    parser.add_argument("--translator", choices=["ollama", "openai"], default="ollama", help="Translator backend for --translate-en.")
    parser.add_argument("--model", default=os.environ.get("DOCS_TRANSLATION_MODEL", "qwen3:8b"), help="Model name used by the selected translator.")
    parser.add_argument("--strict", action="store_true", default=True, help="Run mkdocs in strict mode.")
    parser.add_argument("--no-strict", dest="strict", action="store_false", help="Disable strict mode.")
    parser.add_argument("--clean", action="store_true", default=True, help="Clean mkdocs output directory before build.")
    parser.add_argument("--no-clean", dest="clean", action="store_false", help="Do not clean output directory before build.")
    parser.add_argument("--print-source-fingerprint", action="store_true", help="Print source fingerprint and exit.")
    parser.add_argument("--validate-prebuilt", default="", help="Validate prebuilt help directory against current source fingerprint.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.print_source_fingerprint:
        print(source_fingerprint())
        return 0
    if args.validate_prebuilt:
        is_valid = validate_prebuilt(Path(args.validate_prebuilt).resolve())
        print("valid" if is_valid else "invalid")
        return 0 if is_valid else 1

    site_dir = Path(args.site_dir).resolve()
    docs_dir = Path(args.docs_dir).resolve()
    mkdocs_config = Path(args.mkdocs_config).resolve()

    run_mkdocs_build(mkdocs_config, site_dir, strict=args.strict, clean=args.clean)

    include_en = False
    if args.translate_en:
        include_en = True
        translated_docs_dir = Path(tempfile.mkdtemp(prefix="docs-en-", dir=REPO_ROOT))
        translate_docs_to_english(
            source_docs_dir=docs_dir,
            target_docs_dir=translated_docs_dir,
            translator=args.translator,
            model=args.model,
        )
        en_config = write_en_mkdocs_config(mkdocs_config, translated_docs_dir, site_dir / "en")
        run_mkdocs_build(en_config, site_dir / "en", strict=args.strict, clean=True)
        shutil.rmtree(translated_docs_dir, ignore_errors=True)
        shutil.rmtree(en_config.parent, ignore_errors=True)

    write_build_metadata(site_dir, include_en=include_en, translator=args.translator if include_en else None, model=args.model if include_en else None)
    print(f"Help built at {site_dir}")
    if include_en:
        print(f"English help built at {site_dir / 'en'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
