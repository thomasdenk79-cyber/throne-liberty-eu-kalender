"""Stage only public application files for the private design preview."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
output = root / "dist"
if not (root / "help/index.html").is_file():
    raise SystemExit("Build help first: python scripts/build_help.py --site-dir help")
output.mkdir(exist_ok=True)
for directory in ("assets", "help"):
    shutil.copytree(root / directory, output / directory, dirs_exist_ok=True)
for name in ("index.html", "config.ini", "live-timers.ini", "service-worker.js", "manifest.webmanifest", "robots.txt", "sitemap.xml", "googlebe057d3a9364d58b.html"):
    shutil.copy2(root / name, output / name)
print("Static application and help staged in dist/")
