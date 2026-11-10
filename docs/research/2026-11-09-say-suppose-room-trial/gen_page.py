"""Build the owner's review page for the room trial from out/: python gen_page.py <output.html>"""

from __future__ import annotations

import html
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
SEAT_ORDER = ["first-time viewer", "retention editor", "story editor", "fact-checker", "director", "voice director",
              "voice actor", "animator"]
MODEL_NAME = {"grok-4.7-high": "Grok 4.7", "gpt-5.6-sol-high": "GPT-5.6 Sol", "gemini-3.7-flash-high": "Gemini 3.7 Flash",
              "claude-sonnet-5-5": "Claude Sonnet 5.5", "claude-fable-5-1": "Claude Fable 5.1",
              "claude-opus-5-5": "Claude Opus 5.5"}


def load_rooms() -> list[dict]:
    recs = [json.loads(p.read_text()) for p in sorted((OUT / "rooms").glob("*.json"))]
    recs.sort(key=lambda r: ({"current": 0, "both": 1, "persona": 2}[r["room"]], SEAT_ORDER.index(r["seat"])
                             if r["seat"] in SEAT_ORDER else 99))
    return recs


def blockers(recs: list[dict]) -> list[dict]:
    out = []
    for r in recs:
        if r.get("status") != "ok":
            continue
        for i, b in enumerate(r["verdict"].get("blockers") or []):
            out.append({"id": f"{r['room']}.{r['seat'].replace(' ', '-')}.{i + 1}", "room": r["room"], "seat": r["seat"],
                        "model": MODEL_NAME.get(r["model"], r["model"]), **b})
    return out


def room_stats(recs: list[dict]) -> dict:
    stats = {}
    for room in ("current", "persona"):
        mine = [r for r in recs if r["room"] in (room, "both")]
        stats[room] = {
            "seats": len(mine),
            "wall": max((r["seconds"] for r in mine), default=0),
            "seat_min": round(sum(r["seconds"] for r in mine) / 60, 1),
            "failed": sum(r["status"] != "ok" for r in mine),
            "blockers": sum(len(r.get("verdict", {}).get("blockers") or []) for r in mine if r["status"] == "ok"),
        }
    return stats


def esc(s) -> str:
    return html.escape(str(s if s is not None else ""))


def main(dest: str) -> None:
    recs = load_rooms()
    bl = blockers(recs)
    stats = room_stats(recs)
    w = OUT / "writers"
    scripts = {k: (w / f"script-{k}.md").read_text() for k in "AB"}
    writer_meta = json.loads((OUT / "summary-all.json").read_text())["calls"]
    wmeta = {c["writer"]: c for c in writer_meta if "writer" in c}
    draft = (HERE / "inputs" / "script.md").read_text()
    tmpl = (HERE / "page_template.html").read_text()
    data = {
        "blockers": bl,
        "seats": [{"room": r["room"], "seat": r["seat"], "model": MODEL_NAME.get(r["model"], r["model"]),
                   "status": r["status"], "seconds": r["seconds"],
                   "blockers": len(r.get("verdict", {}).get("blockers") or []) if r["status"] == "ok" else 0,
                   "suggestions": len(r.get("verdict", {}).get("suggestions") or []) if r["status"] == "ok" else 0}
                  for r in recs],
        "stats": stats,
        "writers": {"words": {k: len(v.split()) for k, v in scripts.items()},
                    "seconds": sorted(round(c["seconds"]) for c in wmeta.values())},
    }
    page = (tmpl.replace("{{DATA}}", json.dumps(data).replace("</", "<\\/"))
                .replace("{{SCRIPT_A}}", esc(scripts["A"]))
                .replace("{{SCRIPT_B}}", esc(scripts["B"]))
                .replace("{{DRAFT}}", "\n".join(f"{i:>4}  {esc(l)}" for i, l in enumerate(draft.splitlines(), 1))))
    Path(dest).write_text(page)
    print(f"{len(bl)} blockers, {len(recs)} seat records -> {dest}")


if __name__ == "__main__":
    main(sys.argv[1])
