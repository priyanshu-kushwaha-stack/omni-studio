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
import difflib
import json
import math
import re
from pathlib import Path

SECTION_RE = re.compile(r"^## \[(\d{2}):(\d{2})\] (.+)$")
CLAIM_RE = re.compile(r"\s*\(c\d+(?:,\s*c\d+)*\)")
WORD_RE = re.compile(r"[a-z0-9']+")

CARD_WORDS = (
    "card",
    "counter",
    "label",
    "bar ",
    "bars",
    "chart",
    "stat",
    "ticks",
    "tick at",
    "split card",
    "comparison",
)
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
            beats.append({"section": section, "beat": line[len("> VISUAL:") :].strip(), "words": []})
        elif line.startswith("> ASK:"):  # a question to the viewer: read aloud, so it is narration
            if not beats:
                beats.append({"section": section, "beat": "(no beat)", "words": []})
            beats[-1]["words"].extend(normalise(CLAIM_RE.sub("", line[len("> ASK:") :]).replace("*", "")))
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
    """Assign (start, end) to each beat by matching the script's words to the transcriber's tokens.

    Transcribers split or merge tokens ("5.7" -> "5" ".7", "eight-hour" -> "8" "-hour"), so
    counting tokens drifts late over a long read. Instead the whole script is sequence-aligned to
    the token stream; a beat starts where its first word (or the nearest aligned neighbour) is
    spoken, and runs to the next beat's start.
    """
    spoken = [(normalise(w["word"]), float(w["start"]), float(w["end"])) for w in words]
    spoken = [(toks[0], s, e) for toks, s, e in spoken if toks]
    script: list[str] = []
    first_idx: list[int | None] = []
    for b in beats:
        first_idx.append(len(script) if b["words"] else None)
        script.extend(b["words"])
    matched: dict[int, int] = {}
    sm = difflib.SequenceMatcher(None, script, [t for t, _, _ in spoken], autojunk=False)
    for a, b_, n in sm.get_matching_blocks():
        for k in range(n):
            matched[a + k] = b_ + k

    def spoken_index(i: int) -> int:
        """Token index for script word i: exact match, else interpolated between matched neighbours."""
        if i in matched:
            return matched[i]
        lo = max((k for k in matched if k < i), default=None)
        hi = min((k for k in matched if k > i), default=None)
        if lo is None and hi is None:
            return min(i, len(spoken) - 1)
        if lo is None:
            return max(0, matched[hi] - (hi - i))
        if hi is None:
            return min(len(spoken) - 1, matched[lo] + (i - lo))
        # map the unmatched script run (lo, hi) onto the unmatched spoken run between their matches, so
        # "two hundred and five" against "205" starts on "205"; an empty spoken run means the words were
        # dropped, and the beat starts on the next spoken word
        gap = matched[hi] - matched[lo] - 1
        if gap <= 0:
            return matched[hi]
        frac = (i - lo - 1) / max(1, hi - lo - 2)
        return min(len(spoken) - 1, matched[lo] + 1 + round(frac * (gap - 1)))

    starts: list[float | None] = []
    for fi in first_idx:
        starts.append(None if fi is None else spoken[spoken_index(fi)][1])
    # a beat with no narration of its own fills the pause after the previous beat's last word
    # (+0.2 s), when that pause leaves it at least 0.5 s before the next spoken beat
    last_end: list[float | None] = []
    for b, fi in zip(beats, first_idx):
        last_end.append(None if fi is None else spoken[spoken_index(fi + len(b["words"]) - 1)][2])
    for k, s in enumerate(starts):
        if s is not None:
            continue
        prev = next((last_end[j] for j in range(k - 1, -1, -1) if last_end[j] is not None), None)
        nxt = next((starts[j] for j in range(k + 1, len(starts)) if starts[j] is not None), None)
        if prev is not None and (nxt is None or nxt - (prev + 0.2) >= 0.5):
            starts[k] = round(prev + 0.2, 3)
    out: list[tuple[float, float]] = []
    for k, s in enumerate(starts):
        if s is None:  # a wordless beat with no room in a pause: zero-length at the previous end
            s = out[-1][1] if out else 0.0
        out.append((s, s))
    contiguous = []
    for k, (s, _) in enumerate(out):
        nxt = out[k + 1][0] if k + 1 < len(out) else s
        contiguous.append((s, max(nxt, s + 0.5)))
    if contiguous:
        s, _ = contiguous[-1]
        contiguous[-1] = (s, max(s + 0.5, spoken[-1][2] + 1.0))
    return contiguous


def build_plan(
    script_text: str,
    words: list[dict],
    *,
    playbook: str = "stickman-explainer",
    hook_seconds: float = 60.0,
    hook_hold: float = 4.0,
    body_hold: float = 6.0,
    tail_seconds: float = 12.0,
) -> dict:
    beats = parse_script(script_text)
    spans = align(beats, words)
    scenes: list[dict] = []
    classes: dict[str, str] = {}
    n = 0  # beat index: ids are keyed by the beat, so a new narration pace never renames an asset
    for b, (start, end) in zip(beats, spans):
        cls, stype, movement = classify(b["beat"])
        limit = hook_hold if start < hook_seconds else body_hold
        duration = max(end - start, 0.5)
        n_segs = max(1, math.ceil(duration / limit - 1e-9))
        seg = duration / n_segs
        first = True
        n += 1
        for k in range(n_segs):
            t = start + k * seg
            seg_end = end if k == n_segs - 1 else start + (k + 1) * seg
            sid = f"s{n:03d}" if k == 0 else f"s{n:03d}c{k}"
            scenes.append(
                {
                    "id": sid,
                    "type": stype if first else "animation",
                    "description": b["beat"]
                    if first
                    else f"continue: {b['beat'][:80]} (push-in / draw-on continuation)",
                    "start_seconds": round(t, 2),
                    "end_seconds": round(seg_end, 2),
                    "script_section_id": b["section"],
                    "movement": movement if first else "push-in",
                    "overlay_notes": "labels as handwriting overlays; no text inside the image",
                    "required_assets": [{"type": "image", "description": b["beat"], "source": "provided"}]
                    if first
                    else [],
                }
            )
            classes[sid] = cls if first else "motion"
            first = False
            t = seg_end
    # end-screen tail: slow push-in continuations of the last drawing, never longer than the body hold
    t = scenes[-1]["end_seconds"] if scenes else 0.0
    remaining = tail_seconds
    tail = 0
    while remaining > 1e-6:
        tail += 1
        seg = min(body_hold, remaining)
        sid = f"e{tail:02d}"
        scenes.append(
            {
                "id": sid,
                "type": "animation",
                "description": "end-screen hold: slow push-in on the final drawing, right third of the frame kept quiet",
                "start_seconds": round(t, 2),
                "end_seconds": round(t + seg, 2),
                "script_section_id": scenes[-1]["script_section_id"] if scenes else "",
                "movement": "push-in",
                "overlay_notes": "final hold: keep the right third of the frame quiet for end screens",
                "required_assets": [],
            }
        )
        classes[sid] = "motion"
        t += seg
        remaining -= seg
    exceptions = []
    if tail_seconds > 0 and scenes:
        # the end-screen tail is quiet by design; exempt the minute it falls in from the density rule
        exceptions.append(
            {
                "minute": int(math.ceil(scenes[-1]["end_seconds"] / 60)),
                "reason": f"end-screen tail ({tail_seconds:.0f} s kept quiet for end screens)",
            }
        )
    return {
        "version": "1.0",
        "style_playbook": playbook,
        "scenes": scenes,
        "metadata": {
            "change_classes": classes,
            "minute_exceptions": exceptions,
            "source": "scripts/scene_plan_from_script.py",
        },
    }


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("script", type=Path)
    p.add_argument("words", type=Path, help="JSON list of {word,start,end}")
    p.add_argument("-o", "--out", type=Path, required=True)
    p.add_argument(
        "--tail-seconds",
        type=float,
        default=12.0,
        help="end-screen hold after the last word (12 for a video, ~3 for a trailer)",
    )
    a = p.parse_args()
    plan = build_plan(a.script.read_text(), json.loads(a.words.read_text()), tail_seconds=a.tail_seconds)
    a.out.write_text(json.dumps(plan, indent=2) + "\n")
    print(f"{len(plan['scenes'])} scenes -> {a.out}")


if __name__ == "__main__":
    main()
