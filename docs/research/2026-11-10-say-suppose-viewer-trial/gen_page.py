"""Build the blind marking page for the viewer trial: python gen_page.py <output.html>

Models are shown as Viewer 1-4 in a random order; the key is written to out/KEY-open-after-marking.json.
"""

from __future__ import annotations

import html
import json
import random
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
TITLES = {"last-time": "Film 1 · What if you knew the last time you'd see someone",
          "real-odds": "Film 2 · Real odds (current script)",
          "real-odds-fable": "Film 2 · Real odds (Fable 5.1's script)"}


def main(dest: str) -> None:
    calls = [json.loads(p.read_text()) for p in sorted(OUT.glob("*--*.json"))]
    key_path = OUT / "KEY-open-after-marking.json"
    if key_path.exists():
        key = json.loads(key_path.read_text())
    else:
        models = sorted({c["model"] for c in calls})
        random.SystemRandom().shuffle(models)
        key = {f"Viewer {i + 1}": m for i, m in enumerate(models)}
        key_path.write_text(json.dumps(key, indent=2) + "\n")
    revealed = dict(key)  # round 1's key, opened after the owner marked
    key2_path = OUT / "KEY-2-open-after-marking.json"  # round 2: models added later get the next numbers, blind
    key2 = json.loads(key2_path.read_text()) if key2_path.exists() else {}
    new = sorted({c["model"] for c in calls} - set(key.values()) - set(key2.values()))
    if new:
        random.SystemRandom().shuffle(new)
        key2.update({f"Viewer {len(key) + len(key2) + i + 1}": m for i, m in enumerate(new)})
        key2_path.write_text(json.dumps(key2, indent=2) + "\n")
    key = {**key, **key2}
    label = {m: v for v, m in key.items()}
    blockers, rows = [], []
    for c in calls:
        v = label[c["model"]]
        bl = c.get("verdict", {}).get("blockers") or [] if c["status"] == "ok" else []
        rows.append({"script": c["script"], "viewer": v, "status": c["status"], "seconds": c["seconds"], "blockers": len(bl)})
        for i, b in enumerate(bl):
            blockers.append({"id": f"{c['script']}.{v.replace(' ', '')}.{i + 1}", "script": c["script"], "viewer": v,
                             **{k: b.get(k) for k in ("line", "domain", "quote", "why", "fix")}})
    order = {s: i for i, s in enumerate(TITLES)}
    blockers.sort(key=lambda b: (order[b["script"]], b["line"] or 0, b["viewer"]))
    data = {"viewers": sorted(key), "calls": rows, "blockers": blockers,
            "scripts": [{"key": k, "title": t} for k, t in TITLES.items()]}
    issues_path = HERE / "issues.json"  # written after the owner marked: the key and each distinct issue
    if issues_path.exists():
        issues = json.loads(issues_path.read_text())
        in_issues = {"Viewer " + c.split(".")[1][6:] for i in issues for c in i["cards"]}  # a round is revealed once
        revealed.update({v: m for v, m in key.items() if v in in_issues})  # its cards are counted in issues.json
        data.update(reveal=revealed, issues=issues)
    scripts_html = "\n".join(
        f'<details class="draft"><summary>{html.escape(t)}</summary><pre>'
        + "\n".join(f"{i:>4}  {html.escape(l)}" for i, l in
                    enumerate((HERE / "inputs" / k / "script.md").read_text().splitlines(), 1))
        + "</pre></details>" for k, t in TITLES.items())
    page = ((HERE / "head.part").read_text() + (HERE / "body.part").read_text())
    page = page.replace("{{DATA}}", json.dumps(data).replace("</", "<\\/")).replace("{{SCRIPTS}}", scripts_html)
    Path(dest).write_text(page)
    print(f"{len(blockers)} blockers from {len(calls)} calls -> {dest}")


if __name__ == "__main__":
    main(sys.argv[1])
