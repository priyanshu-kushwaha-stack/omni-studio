"""script.md -> story.json for the what-if engine.

    python story.py <video folder>          writes <video folder>/story.json

A video folder is channels/<slug>/videos/<id>/. Reads its script.md (the owner-approved script), claims.md (the
source of every cited id), narration/say.yaml (optional: the text the voice speaks for a line, when numbers need
spelling out or the delivery needs a direction such as "[whispers]"), and the channel's voices.yaml. Keeps any
named cues already in story.json: cues are added at the rough cut.

Script rules (channels/say-suppose/cast.md): bare lines under "## [mm:ss]" headings are spoken; "> MOOD: x" sets the
light for the lines after it; "> HOLD: N s" is a wordless gap of N seconds after the previous line; other "> " lines
are directions. The first "## " heading without a time ends the spoken script.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import yaml

LEAD_IN = 0.4
GAP = 0.35
TAIL = 2.4
MOODS = ("morning", "day", "dusk", "night", "lamp", "frozen")
CITE_RE = re.compile(r"\s*\(((?:c\d{2,3})(?:\s*,\s*c\d{2,3})*)\)")
TIMED_HEADING = re.compile(r"^## \[\d{2}:\d{2}\]")
SKIP_PREFIXES = ("#", "|", "-", "format:", "status:", "claims:")


def _ledger(text: str) -> dict[str, tuple[str, str]]:
    """id -> (source URL, status) from the first table with id, source and status columns."""
    rows: dict[str, tuple[str, str]] = {}
    header: list[str] | None = None
    for line in text.splitlines():
        if not line.lstrip().startswith("|"):
            header = None
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if header is None:
            header = [c.lower() for c in cells]
            continue
        if set("".join(cells)) <= set("-: "):
            continue
        col = {name: next((i for i, h in enumerate(header) if h.startswith(name)), None) for name in ("id", "source", "status")}
        if None in col.values():
            continue
        url = re.search(r"https?://\S+", cells[col["source"]])
        rows[cells[col["id"]]] = (url.group(0) if url else "", cells[col["status"]].lower())
    return rows


def _voice(channel: Path) -> dict:
    data = yaml.safe_load((channel / "voices.yaml").read_text(encoding="utf-8"))
    narrator = data["voices"]["narrator"]
    model = narrator["tool"].split()[-1]
    voice = {"model": model, "voiceType": narrator["voice_type"], "voiceId": narrator["voice_id"]}
    if narrator.get("variant"):
        voice["variant"] = narrator["variant"]
    return voice


def build(video: Path) -> dict:
    video = Path(video)
    ledger = _ledger((video / "claims.md").read_text(encoding="utf-8"))
    say_path = video / "narration" / "say.yaml"
    say = yaml.safe_load(say_path.read_text(encoding="utf-8")) or {} if say_path.is_file() else {}

    lines: list[dict] = []
    lead_in = LEAD_IN
    mood = "day"
    in_script = False
    for raw in (video / "script.md").read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("## "):
            if TIMED_HEADING.match(line):
                in_script = True
                continue
            if in_script:
                break
        if not in_script or not line:
            continue
        if line.startswith(">"):
            body = line[1:].strip()
            if body.startswith("MOOD:"):
                mood = body[5:].strip().split()[0].lower()
                if mood not in MOODS:
                    raise ValueError(f"unknown mood {mood!r} in {raw!r}: use one of {', '.join(MOODS)}")
            elif body.startswith("HOLD:"):
                seconds = float(re.match(r"HOLD:\s*([\d.]+)\s*s", body).group(1))
                if lines:
                    # The first hold after a line replaces its normal gap; a second hold adds to it.
                    held = lines[-1].pop("_held", False)
                    lines[-1]["gapAfterSec"] = lines[-1]["gapAfterSec"] + seconds if held else seconds
                    lines[-1]["_held"] = True
                else:
                    lead_in += seconds
            continue
        if line.startswith(SKIP_PREFIXES):
            continue
        claims = [c.strip() for group in CITE_RE.findall(line) for c in group.split(",")]
        for cid in claims:
            if cid not in ledger:
                raise ValueError(f"script cites {cid}, which has no row in claims.md")
            if ledger[cid][1] == "dropped":
                raise ValueError(f"script cites {cid}, which claims.md marks dropped")
        text = CITE_RE.sub("", line).strip()
        lines.append({"text": text, "say": text, "gapAfterSec": GAP, "mood": mood, "claims": claims})

    for l in lines:
        l.pop("_held", None)
    by_text = {l["text"]: l for l in lines}
    for key, spoken in say.items():
        key = str(key).strip()
        if key not in by_text:
            raise ValueError(f"narration/say.yaml: {key!r} is not a spoken line of script.md")
        by_text[key]["say"] = str(spoken)

    old = video / "story.json"
    cues = json.loads(old.read_text(encoding="utf-8")).get("cues", {}) if old.is_file() else {}
    cited = [c for l in lines for c in l["claims"]]
    return {
        "id": video.name,
        "voice": _voice(video.parent.parent),
        "leadInSec": lead_in,
        "tailSec": TAIL,
        "lines": lines,
        "sources": {cid: ledger[cid][0] for cid in dict.fromkeys(cited)},
        "cues": cues,
    }


if __name__ == "__main__":
    folder = Path(sys.argv[1])
    data = build(folder)
    (folder / "story.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{folder / 'story.json'}: {len(data['lines'])} lines, lead-in {data['leadInSec']:.1f} s")
