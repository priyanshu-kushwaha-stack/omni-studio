#!/usr/bin/env python3
"""Build an OpenMontage-shaped scene_plan.json from script.md plus narration word timestamps.

Each `> VISUAL:` beat becomes a scene that starts when the first narration word after it is
spoken and ends when the next beat starts. Beats longer than the hold limit (4 s in the first
60 s, 6 s after) are split into sub-scenes; the first sub-scene keeps the beat's class, the
rest are `motion` (push-in / draw-on continuation on the same drawing). metadata.change_classes
is filled for scripts/scene_plan_check.py.

Word timestamps: a JSON list of {"word": str, "start": float, "end": float} (faster-whisper).
"""
from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path

SECTION_RE = re.compile(r"^## \[(\d{2}):(\d{2})\] (.+)$")
CLAIM_RE = re.compile(r"\s*\(c\d\d\)")
WORD_RE = re.compile(r"[a-z0-9']+")

CARD_WORDS = ("card", "counter", "label", "bar ", "bars", "chart", "stat", "ticks", "tick at", "split card", "comparison")
CHAR_WORDS = ('"you" figure', "figure", "figures", "camp", "ring of")
DIAGRAM_WORDS = ("map", "timeline", "cross-section", "globe", "curve")


def normalise(s: str) -> list[str]:
    return WORD_RE.findall(s.lower().replace("’", "'"))


def classify(beat: str) -> tuple[str, str, str]:
    """Return (change_class, scene_type, movement) for a `> VISUAL:` beat."""
    b = beat.lower()
    if any(w in b for w in DIAGRAM_WORDS):
        return "illustration", "diagram", "draw-on"
    if any(w in b for w in CARD_WORDS):
        return "card", "text_card", "draw-on"
    if any(w in b for w in CHAR_WORDS):
        return "character", "character_scene", "draw-on"
    return "illustration", "generated", "push-in"


def parse_script(text: str) -> list[dict]:
    """Return beats: [{section, beat, narration_words:[...]}] in order."""
    beats: list[dict] = []
    section = None
    for line in text.splitlines():
        if line.startswith("## Chapters") or line.startswith("## Sources"):
            break
        m = SECTION_RE.match(line)
        if m:
            section = m.group(3)
            continue
        if section is None:
            continue
        if line.startswith("> VISUAL:"):
            beats.append({"section": section, "beat": line[len("> VISUAL:"):].strip(), "words": []})
        elif line.startswith("> ") or line.startswith("#") or not line.strip():
            continue
        elif line.startswith(("template:", "target_minutes:", "status:", "hook:")):
            continue
        else:
            if not beats:
                beats.append({"section": section, "beat": "(no beat)", "words": []})
            beats[-1]["words"].extend(normalise(CLAIM_RE.sub("", line).replace("*", "")))
    return beats


def align(beats: list[dict], words: list[dict]) -> list[tuple[float, float]]:
    """Assign (start, end) to each beat by walking the narration words in order."""
    spoken = [(normalise(w["word"]), float(w["start"]), float(w["end"])) for w in words]
    spoken = [(toks[0], s, e) for toks, s, e in spoken if toks]
    times: list[tuple[float, float]] = []
    i = 0
    for b in beats:
        n = len(b["words"])
        if n == 0:
            times.append((None, None))
            continue
        start = spoken[i][1] if i < len(spoken) else spoken[-1][2]
        j = min(i + n, len(spoken))
        end = spoken[j - 1][2] if j > i else start
        times.append((start, end))
        i = j
    # fill beats with no words (rare) and make contiguous
    out: list[tuple[float, float]] = []
    for k, (s, e) in enumerate(times):
        if s is None:
            s = out[-1][1] if out else 0.0
            e = s
        out.append((s, e))
    contiguous = []
    for k, (s, e) in enumerate(out):
        nxt = out[k + 1][0] if k + 1 < len(out) else e
        contiguous.append((s, max(nxt, s + 0.5)))
    if contiguous:
        s, e = contiguous[-1]
        contiguous[-1] = (s, max(e, spoken[-1][2] + 1.0))
    return contiguous


def build_plan(script_text: str, words: list[dict], *, playbook: str = "stickman-explainer",
               hook_seconds: float = 60.0, hook_hold: float = 4.0, body_hold: float = 6.0,
               tail_seconds: float = 12.0) -> dict:
    beats = parse_script(script_text)
    spans = align(beats, words)
    scenes: list[dict] = []
    classes: dict[str, str] = {}
    n = 0
    for b, (start, end) in zip(beats, spans):
        cls, stype, movement = classify(b["beat"])
        limit = hook_hold if start < hook_seconds else body_hold
        duration = max(end - start, 0.5)
        n_segs = max(1, math.ceil(duration / limit - 1e-9))
        seg = duration / n_segs
        first = True
        for k in range(n_segs):
            n += 1
            t = start + k * seg
            seg_end = end if k == n_segs - 1 else start + (k + 1) * seg
            sid = f"s{n:03d}"
            scenes.append({
                "id": sid,
                "type": stype if first else "animation",
                "description": b["beat"] if first else f"continue: {b['beat'][:80]} (push-in / draw-on continuation)",
                "start_seconds": round(t, 2),
                "end_seconds": round(seg_end, 2),
                "script_section_id": b["section"],
                "movement": movement if first else "push-in",
                "overlay_notes": "labels as handwriting overlays; no text inside the image",
                "required_assets": [{"type": "image", "description": b["beat"], "source": "provided"}] if first else [],
            })
            classes[sid] = cls if first else "motion"
            first = False
            t = seg_end
    # end-screen tail: slow push-in continuations of the last drawing, never longer than the body hold
    t = scenes[-1]["end_seconds"] if scenes else 0.0
    remaining = tail_seconds
    while remaining > 1e-6:
        n += 1
        seg = min(body_hold, remaining)
        sid = f"s{n:03d}"
        scenes.append({
            "id": sid, "type": "animation",
            "description": "end-screen hold: slow push-in on the final drawing, right third of the frame kept quiet",
            "start_seconds": round(t, 2), "end_seconds": round(t + seg, 2),
            "script_section_id": scenes[-1]["script_section_id"] if scenes else "",
            "movement": "push-in",
            "overlay_notes": "final hold: keep the right third of the frame quiet for end screens",
            "required_assets": [],
        })
        classes[sid] = "motion"
        t += seg
        remaining -= seg
    return {"version": "1.0", "style_playbook": playbook, "scenes": scenes,
            "metadata": {"change_classes": classes, "minute_exceptions": [],
                         "source": "scripts/scene_plan_from_script.py"}}


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("script", type=Path)
    p.add_argument("words", type=Path, help="JSON list of {word,start,end}")
    p.add_argument("-o", "--out", type=Path, required=True)
    a = p.parse_args()
    plan = build_plan(a.script.read_text(), json.loads(a.words.read_text()))
    a.out.write_text(json.dumps(plan, indent=2) + "\n")
    print(f"{len(plan['scenes'])} scenes -> {a.out}")


if __name__ == "__main__":
    main()
