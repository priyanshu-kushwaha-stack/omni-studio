#!/usr/bin/env python3
"""Rigs and a puppet stage for a Short from a small hand-written spec (shorts/<slug>/anim.json).

Shorts change picture every 2-4 s, so hand-cutting a full rig per still (video 3) doesn't pay. Each still here
names only rough eye centres, an optional head ellipse + neck pivot, and optional moving props; the pupils are
found from the ink (the dark blob nearest each rough centre), so the numbers need only be within a few pixels.

anim.json:
  {"characters": {"<scene>": {"eyes": [[x, y, R], ...], "dot": false,
                              "head": [cx, cy, rx, ry, neck_y] | null,
                              "look": [{"word": "...", "px": 6, "py": 0}], "tilt": [{"word": "...", "rot": 4}]}},
   "props": {"<scene>": [{"name": "tag", "region": {...}, "pivot": [x, y], "ink_only": false,
                          "swing": {"amp": 6, "period": 1.2} | null,
                          "enter": {"word": "...", "from": [dx, dy], "dur": 0.35} | null,
                          "bob": {"amp": 6, "period": 0.9} | null}]},
   "copies": {"s010": "s001"}}
Writes <short>/rigs/<slug>.json (puppet_render build input) and <short>/stage.json (puppet_render clips input).
Every scene blinks about every 2.6 s and never boils (owner: no line wobble).
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
import compose  # noqa: E402
import puppet  # noqa: E402
import motion  # noqa: E402
import pou_paths  # noqa: E402

ROOT = pou_paths.channel_dir()  # the channel folder; video paths in rigs and stages are relative to it
BLINK_EVERY = 2.6


def find_pupil(still: np.ndarray, x: float, y: float, r: float) -> tuple[float, float, float, float]:
    """(cx, cy, rx, ry) of the filled dark blob nearest (x, y) within 1.6 r. Blobs are taken from a darkness
    threshold with each small blob's own holes filled (glints), so a ring-shaped lens never swallows its pupil;
    falls back to a small ellipse at (x, y) when the pupil touches the lens ring (no separate blob)."""
    paper = compose.paper_color(still)
    dark = (np.array(paper, np.int16) - still.astype(np.int16)).max(axis=2) > 60
    h, w = dark.shape
    R = r * 1.6
    x0, y0, x1, y1 = int(max(0, x - R)), int(max(0, y - R)), int(min(w, x + R + 1)), int(min(h, y + R + 1))
    lab, n = ndimage.label(dark[y0:y1, x0:x1])
    best, best_d = None, 1e9
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        bw, bh = np.ptp(xs) + 1, np.ptp(ys) + 1
        if max(bw, bh) > 1.3 * r or min(bw, bh) < 4:  # lens rings, brows, outlines; specks
            continue
        m = np.zeros((bh, bw), bool)
        m[ys - ys.min(), xs - xs.min()] = True
        m = ndimage.binary_fill_holes(m)
        area = int(m.sum())
        if area < max(25, 0.03 * math.pi * r * r) or area / (bw * bh) < 0.55:  # pupils are filled ovals
            continue
        cx, cy = float(xs.min() + (bw - 1) / 2 + x0), float(ys.min() + (bh - 1) / 2 + y0)
        d = math.hypot(cx - x, cy - y)
        if d < best_d and d <= R:
            best, best_d = (cx, cy, bw / 2, bh / 2), d
    if best is None:
        return float(x), float(y), max(4.0, r * 0.18), max(5.0, r * 0.24)
    return best


def character_pose(still_path: str, spec: dict, prefix: str, part: str = "head") -> dict:
    still = np.asarray(Image.open(ROOT / still_path).convert("RGB"))
    feats, erase = [], []
    for i, (x, y, r) in enumerate(spec["eyes"]):
        cx, cy, prx, pry = find_pupil(still, x, y, r)
        lens_r = max(prx, pry) + r * 0.45
        feats.append(
            {
                "name": f"{prefix}Eye{i}",
                "kind": "eye",
                "dot": bool(spec.get("dot")),
                "lens": [round(cx), round(cy), round(lens_r), round(lens_r)],
                "pupil": [round(cx), round(cy), round(prx + 0.5), round(pry + 0.5)],
            }
        )
        erase.append([round(cx), round(cy), round(prx + 3), round(pry + 3)])
    mouth_region = []
    if spec.get("mouth"):  # [x, y, w]: a generated mouth replaces the drawn one (dialogue scenes)
        mx, my, mw = spec["mouth"]
        feats.append(
            {
                "name": f"{prefix}Mouth",
                "kind": "mouth",
                "at": [mx, my],
                "default": "closed",
                "fill": True,
                "shapes": puppet.mouth_shapes(mw),
            }
        )
        erase.append([round(mx), round(my), round(mw * 0.72), round(mw * 0.5)])
        mouth_region = [[mx, my, mw * 0.8, mw * 0.6]]
    if spec.get("head"):
        cx, cy, rx, ry, neck = spec["head"]
        region = {
            "ellipses": [[cx, cy, rx, ry]],
            "minus": {"rects": [[cx - rx - 20, neck, cx + rx + 20, cy + ry + 40]]},
        }
        pivot = [cx, neck]
    else:  # eyes only: a part made of the eye areas, nothing else moves
        region = {"ellipses": [[e[0], e[1], e[2] + 4, e[2] + 4] for e in spec["eyes"]] + mouth_region}
        pivot = [spec["eyes"][0][0], spec["eyes"][0][1]]
    return {
        "source": still_path,
        "parts": {
            part: {"region": region, "pivot": pivot, "z": 2, "grow": 3, "erase": {"ellipses": erase}, "features": feats}
        },
    }


def cued_in(words: list[dict], word: str, start: float, end: float) -> bool:
    """True when `word` is spoken inside [start, end): a copied scene (a continuation reusing an earlier
    still) inherits its source's look/tilt cues, and only the ones spoken in its own window apply."""
    try:
        return puppet.word_time(words, word, start - 0.05) < end
    except KeyError:
        return False


def spans(scenes: list[dict], stills: Path, copies: dict) -> list[tuple[str, float, float]]:
    """(id, start, end) per animated span. compose plays one clip per still group (a scene with a still, plus
    the following continuation scenes that have none), so a scene without its own still or copy extends the
    previous span instead of getting a clip compose would never use."""
    out: list[list] = []
    for sc in sorted(scenes, key=lambda x: x["start_seconds"]):
        sid = sc["id"]
        if out and sid not in copies and not (stills / f"{sid}.png").exists():
            out[-1][2] = float(sc["end_seconds"])
        else:
            out.append([sid, float(sc["start_seconds"]), float(sc["end_seconds"])])
    return [tuple(x) for x in out]


def cast_of(spec, src: str) -> list[dict]:
    """A scene's characters as a list of {spec, prefix, part}. A dict is one character (the Shorts format, part
    "head"); a list is a dialogue two-shot: each entry names its character ("name") and may say which script
    speaker it voices ("speaker", e.g. "YOU"), so its mouth talks on that speaker's lines."""
    if isinstance(spec, list):
        return [{"spec": c, "prefix": f"{src}{c['name']}", "part": f"{c['name']}Head"} for c in spec]
    return [{"spec": spec, "prefix": src, "part": "head"}]


def dialogue_actions(
    cast: list[dict], slug: str, lines: list[dict], start: float, end: float, line_dir: Path
) -> list[dict]:
    """For each spoken line inside [start, end): the speaker's mouth talks from that line's own audio, and everyone
    else on screen turns their eyes toward the speaker (a speaker looks toward the nearest other character)."""
    acts: list[dict] = []
    xs = {c["prefix"]: float(np.mean([e[0] for e in c["spec"]["eyes"]])) for c in cast}
    for ln in lines:
        if not (start - 0.05 <= ln["start"] < end):
            continue
        who = [c for c in cast if c["spec"].get("speaker") == ln["speaker"]]
        for c in who:
            if c["spec"].get("mouth"):
                acts.append(
                    {"talk": f"{slug}.{c['prefix']}Mouth", "audio": str(line_dir / ln["file"]), "at": ln["start"]}
                )
        sx = xs[who[0]["prefix"]] if who else None
        for c in cast:
            me = xs[c["prefix"]]
            if sx is None or c in who:
                others = [x for p, x in xs.items() if p != c["prefix"]]
                if not others:
                    continue
                target = min(others, key=lambda x: abs(x - me))
            else:
                target = sx
            px = 4 if target > me else -4
            for i in range(len(c["spec"]["eyes"])):
                acts.append(
                    {
                        "pose": f"{slug}.{c['prefix']}Eye{i}",
                        "at": ln["start"],
                        "to": {"px": px, "py": 0},
                        "ease": "spring:320:22",
                    }
                )
    return acts


def build(short: Path) -> tuple[dict, dict]:
    anim = json.loads((short / "anim.json").read_text())
    plan = json.loads((short / "scene_plan.json").read_text())
    words_path = short / "narration" / "words.json"
    words = json.loads(words_path.read_text()) if words_path.exists() else []
    lines_path = short / "narration" / "lines.json"
    lines = json.loads(lines_path.read_text()) if lines_path.exists() else []
    slug = short.name.split("_", 1)[1]
    rel = short.relative_to(ROOT)
    stills = rel / "assets" / "stills"
    copies = anim.get("copies", {})
    rig = {"name": slug, "about": f"auto rig for {rel} (scripts/short_rigs.py)", "poses": {}}
    scenes = []
    for sid, start, end in spans(plan["scenes"], ROOT / stills, copies):
        src = copies.get(sid, sid)
        chars = anim.get("characters", {})
        if isinstance(chars.get(src), list):
            ch = chars[src]
        else:
            ch = {
                **chars.get(src, {}),
                **(chars.get(sid, {}) if sid != src else {}),
            } or None  # a copy may re-time the acting
        props = anim.get("props", {}).get(src, [])
        if not ch and not props:
            continue
        place, actions, idle, init = [], [], {}, {}
        if ch:
            pose = f"{src}_char"
            cast = cast_of(ch, src)
            if pose not in rig["poses"]:
                parts = {}
                for c in cast_of(chars[src], src):
                    parts.update(character_pose(str(stills / f"{src}.png"), c["spec"], c["prefix"], c["part"])["parts"])
                rig["poses"][pose] = {"source": str(stills / f"{src}.png"), "parts": parts}
            place.append(f"{slug}/{pose}")
            for k, c in enumerate(cast):
                spec = c["spec"]
                head = f"{slug}.{c['part']}"
                eyes = [f"{slug}.{c['prefix']}Eye{i}" for i in range(len(spec["eyes"]))]
                t = start + 0.7 + 0.9 * k  # two characters never blink on the same frame
                while t < end - 0.3:
                    actions.append({"blink": eyes, "at": round(t, 3)})
                    t += BLINK_EVERY
                for lk in [x for x in spec.get("look", []) if cued_in(words, x["word"], start, end)]:
                    for e in eyes:
                        actions.append(
                            {
                                "pose": e,
                                "at": {"word": lk["word"], "after": start - 0.05},
                                "to": {"px": lk.get("px", 0), "py": lk.get("py", 0)},
                                "ease": "spring:320:22",
                            }
                        )
                for tl in [x for x in spec.get("tilt", []) if cued_in(words, x["word"], start, end)]:
                    actions.append(
                        {
                            "pose": head,
                            "at": {"word": tl["word"], "after": start - 0.05},
                            "to": {"rot": tl["rot"]},
                            "ease": "spring:260:18",
                        }
                    )
                if spec.get("head"):
                    idle[head] = {"amp": 1.2, "period": 3.0, "phase": 0.37 * k}
            actions.extend(dialogue_actions(cast, slug, lines, start, end, short / "narration"))
        for pr in props:
            pose = f"{src}_{pr['name']}"
            if pose not in rig["poses"]:
                rig["poses"][pose] = {
                    "source": str(stills / f"{src}.png"),
                    "parts": {
                        pr["name"]: {
                            "region": pr["region"],
                            "pivot": pr["pivot"],
                            "z": 1,
                            "grow": int(pr.get("grow", 3)),
                            **({"ink_only": True} if pr.get("ink_only") else {}),
                        }
                    },
                }
            place.append(f"{slug}/{pose}")
            tgt = f"{slug}.{pr['name']}"
            if pr.get("enter"):
                en = pr["enter"]
                dx, dy = en["from"]
                init[tgt] = {"x": dx, "y": dy, **({"rot": en["rot"]} if "rot" in en else {})}
                actions.append(
                    {
                        "pose": tgt,
                        "at": {"word": en["word"], "after": start - 0.05}
                        if "word" in en
                        else {"scene": en.get("scene", 0.0)},
                        "to": {"x": 0, "y": 0, "rot": 0},
                        "dur": en.get("dur", 0.35),
                        "ease": en.get("ease", "spring:200:14"),
                    }
                )
            if pr.get("exit"):
                ex = pr["exit"]
                actions.append(
                    {
                        "pose": tgt,
                        "at": {"word": ex["word"], "after": start - 0.05},
                        "to": ex["to"],
                        "dur": ex.get("dur", 0.5),
                        "ease": ex.get("ease", "in"),
                    }
                )
            if pr.get("swing"):
                sw = pr["swing"]
                k, t = 0, start
                while t < end:
                    actions.append(
                        {
                            "pose": tgt,
                            "at": round(t, 3),
                            "to": {"rot": sw["amp"] * (1 if k % 2 == 0 else -1)},
                            "dur": sw["period"] / 2,
                            "ease": "inout",
                        }
                    )
                    t += sw["period"] / 2
                    k += 1
            if pr.get("bob"):
                idle[tgt] = {"amp": pr["bob"]["amp"], "period": pr["bob"]["period"]}
        # a placed pose's parts all share the rig prefix; names must be unique per scene
        scenes.append(
            {
                "id": sid,
                "still": str(stills / f"{src}.png"),
                "start": start,
                "end": end,
                "place": place,
                "reveal": 0.0 if sid in copies or ch else 0.45,
                "seed": len(scenes) + 1,
                "boil": False,
                "feature_weight": float(anim.get("feature_weight", 10.0)),
                "idle": idle,
                "init": init,
                "actions": actions,
            }
        )
    stage = {
        "about": f"Short puppet stage, generated by scripts/short_rigs.py from {rel}/anim.json",
        "video_dir": str(rel),
        "words": str(rel / "narration" / "words.json"),
        "rigs": str(rel / "rigs"),
        "plates": str(rel / "assets" / "plates"),
        "fps": 30,
        "overlays": False,
        "protect": [],
        "ranges": [[s["start"], s["end"]] for s in scenes],
        "scenes": scenes,
    }
    return rig, stage


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("short_dir", type=Path)
    a = p.parse_args()
    short = a.short_dir.resolve()
    rig, stage = build(short)
    (short / "rigs").mkdir(exist_ok=True)
    (short / "rigs" / f"{rig['name']}.json").write_text(json.dumps(rig, indent=1))
    (short / "stage.json").write_text(json.dumps(stage, indent=1))
    print(f"{len(rig['poses'])} poses, {len(stage['scenes'])} animated scenes")


if __name__ == "__main__":
    main()
