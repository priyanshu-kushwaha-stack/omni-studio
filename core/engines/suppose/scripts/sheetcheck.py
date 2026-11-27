"""Validate a Say Suppose shot sheet before any render, and emit film.json for the kit (spec: Errors, W1-W5, L5, L8).

python sheetcheck.py <video_dir> [--emit]   -> exit 1 on any FAIL
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from sheet import ACTS, EPS, MIX, MOODS, MOVES, NO_SET, NUMBER_WORDS, SHOT_TYPES, load_sheet

STANDALONE = {"data", "blueprint", "title", "end"}


def _refs(s: dict, lib, customs: set[str]) -> list[str]:
    sid, out = s.get("id", "?"), []
    if s.get("type") not in SHOT_TYPES:
        out.append(f"{sid}: unknown type {s.get('type')!r}")
    if s.get("custom") and s["custom"] not in customs:
        out.append(f"{sid}: unknown custom shot {s['custom']!r}")
    if s.get("type") not in NO_SET:
        st = lib.sets.get(s.get("set"))
        if st is None:
            out.append(f"{sid}: unknown set {s.get('set')!r}")
        elif s.get("angle") not in st["angles"]:
            out.append(f"{sid}: set {s['set']} has no angle {s.get('angle')!r}")
    cam = s.get("camera", {})
    if cam and cam.get("move") not in MOVES:
        out.append(f"{sid}: unknown camera move {cam.get('move')!r}")
    return out


def _act_fails(sid: str, a: dict, lib) -> list[str]:
    out = []
    if a.get("act") not in ACTS:
        out.append(f"{sid}: unknown action {a.get('act')!r}")
    if a.get("mood") is not None and a["mood"] not in MOODS:
        out.append(f"{sid}: unknown mood {a['mood']!r}")
    if a.get("prop") is not None and a["prop"] not in lib.props:
        out.append(f"{sid}: unknown prop {a['prop']!r}")
    return out


def _cast(s: dict, lib) -> list[str]:
    sid, out = s.get("id", "?"), []
    members = s.get("cast", [])
    for c in members:
        if c.get("who") not in lib.cast:
            out.append(f"{sid}: unknown character {c.get('who')!r}")
        for a in c.get("acts", []):
            out += _act_fails(sid, a, lib)
    in_frame = {c.get("who") for c in members}
    out += [
        f"{sid}: {ln['who']} speaks but is not in frame (W4)" for ln in s.get("lines", []) if ln["who"] not in in_frame
    ]
    acting = s.get("custom") or s.get("type") in STANDALONE or any(c.get("acts") for c in members)
    if not acting:
        out.append(f"{sid}: no character acts; a camera move over a still set is a slide (L8.3)")
    return out


def _timeline(shots: list[dict]) -> list[str]:
    out = []
    for a, b in zip(shots, shots[1:], strict=False):
        if b["from"] > a["to"] + EPS:
            out.append(f"gap {a['to']}-{b['from']} between {a['id']} and {b['id']}")
        if b["from"] < a["to"] - EPS:
            out.append(f"overlap between {a['id']} and {b['id']}")
    return out


def _changes(s: dict) -> list[float]:
    times = [s["from"], s["to"]]
    for c in s.get("cast", []):
        times += [a["at"] for a in c.get("acts", []) if "at" in a]
    times += [x["at"] for key in ("labels", "lines", "sfx") for x in s.get(key, [])]
    if s.get("readout"):
        times.append(s["readout"]["at"])
    return sorted(t for t in times if s["from"] <= t <= s["to"])


def _shot_warns(s: dict, beats: list[dict]) -> list[str]:
    out = []
    ch = _changes(s)
    gap = max((b - a for a, b in zip(ch, ch[1:], strict=False)), default=0)
    if gap > 5 + EPS and not s.get("hold"):
        out.append(f"{s['id']}: hold of {gap:.1f} s with no hold: reason (L8, a guide)")
    if sum(1 for c in s.get("cast", []) if c.get("focus", True)) > 4:
        out.append(f"{s['id']}: more than four characters in focus (W4)")
    ro = s.get("readout")
    if ro and not any(abs(b["at"] - ro["at"]) <= 0.5 for b in beats):
        out.append(f"{s['id']}: readout change at {ro['at']} is not on a story beat (L5.2)")
    return out


def _warns(sheet: dict, words: list[dict]) -> list[str]:
    shots, out = sheet["shots"], []
    for s in shots:
        out += _shot_warns(s, sheet.get("beats", []))
    out += [
        f"{a['id']}, {b['id']}: same type {a['type']} twice in a row (W1)"
        for a, b in zip(shots, shots[1:], strict=False)
        if a["type"] == b["type"] and a["type"] != "custom"
    ]
    return out + _mix_warns(shots) + _number_warns(shots, words)


def _mix_warns(shots: list[dict]) -> list[str]:
    total = sum(s["to"] - s["from"] for s in shots) or 1
    if total < 120:
        return []
    out = []
    for t, share in MIX.items():
        have = sum(s["to"] - s["from"] for s in shots if s["type"] == t) / total
        if abs(have - share) > max(0.06, share * 0.6):
            out.append(f"shot mix: {t} is {have:.0%} of the film, aim for about {share:.0%} (W1)")
    return out


def _number_warns(shots: list[dict], words: list[dict]) -> list[str]:
    shown = [(lb["at"] - 0.6, lb.get("to", lb["at"] + 3) + 0.6) for s in shots for lb in s.get("labels", [])]
    shown += [(s["readout"]["at"] - 0.6, s["to"]) for s in shots if s.get("readout")]
    out = []
    for w in words:
        token = re.sub(r"[^a-z]", "", w["word"].lower())
        if token in NUMBER_WORDS - {"one", "half", "quarter"} and not any(a <= w["start"] <= b for a, b in shown):
            out.append(f"spoken number '{token}' at {w['start']:.1f} s is not on screen (W5)")
    return out


def check(sheet: dict, lib, words: list[dict], customs: set[str] = frozenset()) -> tuple[list[str], list[str]]:
    shots = sheet.get("shots", [])
    fails = _timeline(shots)
    for s in shots:
        fails += _refs(s, lib, set(customs)) + _cast(s, lib)
    return fails, _warns(sheet, words) if not fails else []


def emit(sheet: dict, lib, out: Path) -> Path:
    used_sets = {s["set"] for s in sheet["shots"] if s.get("set")}
    used_cast = {c["who"] for s in sheet["shots"] for c in s.get("cast", [])} | {"scarf"}
    data = {
        **{k: sheet[k] for k in ("film", "fps", "size", "beats", "shots")},
        "audio": sheet.get("audio", "audio/mix.wav"),
        "duration": max(s["to"] for s in sheet["shots"]),
        "cast": {k: v for k, v in lib.cast.items() if k in used_cast},
        "crowd": {k: v for k, v in lib.cast.items() if "crowd" in v.get("roles", [])},
        "sets": {k: v for k, v in lib.sets.items() if k in used_sets},
        "props": lib.props,
    }
    out.write_text(json.dumps(data, indent=1), encoding="utf-8")
    return out


def customs_in(video: Path) -> set[str]:
    names: set[str] = set()
    for f in (video / "custom").glob("*.tsx"):
        names |= set(re.findall(r"export const (\w+)\s*:\s*Shot", f.read_text(encoding="utf-8")))
    return names


def main(argv: list[str]) -> int:
    from library import Library

    video = Path(argv[0]).resolve()
    sheet = load_sheet(video / "shots.yaml")
    words_path = video / "audio" / "narration.words.json"
    words = json.loads(words_path.read_text()) if words_path.is_file() else []
    lib = Library.for_channel("say-suppose")
    fails, warns = check(sheet, lib, words, customs_in(video))
    for line in [*(f"FAIL {f}" for f in fails), *(f"WARN {w}" for w in warns)]:
        print(line)
    if not fails and "--emit" in argv:
        print(emit(sheet, lib, video / "film.json"))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
