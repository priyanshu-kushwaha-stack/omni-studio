"""Export the G2 story reel's shot list for Remotion (reel/): shots/a.py..d.py -> assets/reel/shots.json, in film order.

    python export_shots.py            # writes ../assets/reel/shots.json, prints problems, exit 1 on any

Each shot keeps its id, kind (3d|card|drawn|tag), anchor, offset_s, move, split, picture, text, the still path
"reel/stills/<id>.png" (relative to assets/, Remotion's public dir) and whether that still exists yet (a missing still
renders as a dark frame with the id). Cards with no `text` take the research `> TAG:` line nearest their anchor in
script.md, tags with no `text` the nearest plain `> TAG:`; a card's text is parsed into title, authors, year and the
kind of evidence. Anchors resolve in film order: each to the first story.json line at or after the previous shot's
line that equals it or starts with it (citations stripped, the `Role: ` prefix included), since lines like
"Echo: Handled." repeat. A shot's `cast_tag` passes through. Problems: an anchor matching nothing from there on, shots
out of time order, an unknown kind, move, split or picture.
The shot files are plain data, imported without Blender (reel3d.py itself needs Blender and is not imported).
"""

import importlib
import json
import os
import re
import sys

sys.dont_write_bytecode = True  # the shot files belong to the still builders: leave their folder alone
HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
sys.path.insert(0, HERE)

FPS = 30
SECTIONS = ["a", "b", "c", "d"]
KINDS = {"3d", "card", "drawn", "tag"}
MOVES = {"push_in", "push_out", "pan_left", "pan_right", "drift_up", "hold"}
SPLITS = {None, "left", "right"}
PICTURES = {"gym", "concert", "wheel", "exam"}
CITE = re.compile(r"\s*\((?:c\d+(?:,\s*)?)+\)")
CARD_RE = re.compile(r'^"(?P<title>[^"]+)",\s*(?P<authors>.+?),\s*(?P<year>\d{4})\.\s*(?P<evidence>.*)$')


def strip_cites(s: str) -> str:
    return CITE.sub("", s).strip()


def line_of(anchor: str, texts: list[str], after: int) -> tuple[int | None, bool]:
    """The first line at or after `after` that equals the anchor or starts with it (anchors like "Echo: Handled."
    repeat by design), and whether a later line matches it exactly while this one only by prefix."""
    a = strip_cites(anchor)
    for i in range(after, len(texts)):
        if texts[i] == a:
            return i, False
        if texts[i].startswith(a):
            return i, any(t == a for t in texts[i + 1 :])
    return None, False


def load_shots() -> list[tuple[str, dict]]:
    out = []
    for sec in SECTIONS:
        try:
            mod = importlib.import_module(f"shots.{sec}")
        except ModuleNotFoundError:
            continue
        out += [(sec, s) for s in getattr(mod, "SHOTS", [])]
    return out


def script_tags() -> tuple[list[str], list[tuple[int, str]]]:
    """script.md's lines (citations stripped) and its `> TAG:` lines with their line numbers."""
    with open(os.path.join(VIDEO, "script.md"), encoding="utf-8") as fh:
        raw = fh.read().splitlines()
    tags = [(i, ln[len("> TAG:"):].strip()) for i, ln in enumerate(raw) if ln.startswith("> TAG:")]
    return [strip_cites(ln) for ln in raw], tags


def nearest_tag(anchor: str, script: list[str], tags: list[tuple[int, str]], research: bool) -> str | None:
    a = strip_cites(anchor)
    at = next((i for i, ln in enumerate(script) if ln.startswith(a)), None)
    pool = [(i, t) for i, t in tags if t.startswith('"') == research]
    if at is None or not pool:
        return None
    return min(pool, key=lambda it: abs(it[0] - at))[1]


def parse_card(text: str) -> list[dict]:
    """One entry per study on the card (" · " joins two)."""
    out = []
    for part in text.split(" · "):
        part = strip_cites(part)
        m = CARD_RE.match(part)
        if m:
            out.append({k: m.group(k).strip() for k in ("title", "authors", "year", "evidence")})
        else:
            out.append({"title": part, "authors": "", "year": "", "evidence": ""})
    return out


def check_fields(sid: str, kind: str, s: dict, problems: list[str]) -> None:
    if kind not in KINDS:
        problems.append(f"{sid}: unknown kind {kind!r}")
    if s.get("move", "push_in") not in MOVES:
        problems.append(f"{sid}: unknown move {s.get('move')!r}")
    if s.get("split") not in SPLITS:
        problems.append(f"{sid}: unknown split {s.get('split')!r}")
    if kind == "drawn" and s.get("picture") not in PICTURES:
        problems.append(f"{sid}: drawn shot needs picture in {sorted(PICTURES)}, got {s.get('picture')!r}")


def export_one(sec: str, s: dict, ctx: dict, problems: list[str], notes: list[str]) -> dict | None:
    sid = s.get("id", "?")
    kind = s.get("kind", "3d")
    check_fields(sid, kind, s, problems)
    anchor = s.get("anchor")
    if not anchor:
        problems.append(f"{sid}: no anchor")
        return None
    line, doubt = line_of(anchor, ctx["texts"], ctx["after"])
    if line is None:
        problems.append(f"{sid}: anchor {anchor!r} matches no line at or after line {ctx['after']}")
        return None
    if doubt:
        notes.append(f"{sid}: anchor {anchor!r} taken by prefix at line {line}; a later line matches it exactly")
    ctx["after"] = line
    clip = ctx["clips"][line]
    offset = float(s.get("offset_s", 0.0))
    start = clip["from"] + round(offset * FPS)
    if offset * FPS > clip["frames"] + 45:
        notes.append(f"{sid}: offset {offset}s runs past its line ({clip['frames'] / FPS:.1f}s)")
    text = s.get("text")
    if kind == "card" and not text:
        text = nearest_tag(anchor, ctx["script"], ctx["tags"], research=True)
    if kind == "tag" and not text:
        text = nearest_tag(anchor, ctx["script"], ctx["tags"], research=False)
    if kind in ("card", "tag") and not text:
        problems.append(f"{sid}: {kind} has no text and no `> TAG:` near its anchor")
    still = f"reel/stills/{sid}.png"
    exists = kind == "3d" and os.path.exists(os.path.join(VIDEO, "assets", still))
    if kind == "3d" and not exists:
        ctx["missing"].append(sid)
    out = {"id": sid, "section": sec, "kind": kind, "anchor": anchor, "offset_s": offset, "line": line, "from": start,
           "move": s.get("move", "push_in"), "split": s.get("split"), "picture": s.get("picture"), "text": text,
           "still": still, "exists": exists, "cast_tag": s.get("cast_tag")}
    if kind == "card" and text:
        out["card"] = parse_card(text)
    return out


def main() -> int:
    with open(os.path.join(VIDEO, "story.json"), encoding="utf-8") as fh:
        texts = [strip_cites(ln["text"]) for ln in json.load(fh)["lines"]]
    with open(os.path.join(VIDEO, "assets", "narration", "props.json"), encoding="utf-8") as fh:
        props = json.load(fh)
    clips = props["timeline"]["clips"]
    if len(clips) != len(texts):
        print(f"PROBLEM: story.json has {len(texts)} lines, props.json {len(clips)} clips (re-run the narration)")
        return 1
    script, tags = script_tags()
    ctx = {"texts": texts, "clips": clips, "script": script, "tags": tags, "missing": [], "after": 0}
    problems: list[str] = []
    notes: list[str] = []
    shots, seen = [], set()
    for sec, s in load_shots():
        sid = s.get("id", "?")
        if sid in seen:
            problems.append(f"{sid}: duplicate id")
        seen.add(sid)
        one = export_one(sec, s, ctx, problems, notes)
        if one:
            shots.append(one)
    for prev, cur in zip(shots, shots[1:]):
        if cur["from"] < prev["from"]:
            problems.append(f"{cur['id']}: starts at frame {cur['from']}, before {prev['id']} ({prev['from']})")
        elif cur["from"] - prev["from"] < 12 and not (prev["split"] and cur["split"]):
            notes.append(f"{prev['id']}: on screen only {cur['from'] - prev['from']} frames before {cur['id']}")
    out_dir = os.path.join(VIDEO, "assets", "reel")
    os.makedirs(os.path.join(out_dir, "stills"), exist_ok=True)
    with open(os.path.join(out_dir, "shots.json"), "w", encoding="utf-8") as fh:
        json.dump({"shots": shots}, fh, indent=1, ensure_ascii=False)
    n3d = sum(1 for s in shots if s["kind"] == "3d")
    print(f"wrote {len(shots)} shots ({n3d} 3D, {n3d - len(ctx['missing'])} stills present) -> assets/reel/shots.json")
    if ctx["missing"]:
        print(f"missing stills ({len(ctx['missing'])}): {', '.join(ctx['missing'])}")
    for n in notes:
        print("note:", n)
    for p in problems:
        print("PROBLEM:", p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
