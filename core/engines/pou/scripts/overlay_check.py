#!/usr/bin/env python3
"""Check (and optionally fix) where on-screen text lands: every overlay and burnt-in caption, on the frame it
actually appears over.

For each overlay the base frame is rebuilt with compose's own Source (the still, cover-cropped, at the push-in
of that moment) at three times (after the reveal, middle, end), and the drawing is taken as every inked or
accent pixel, dilated a little. The box is judged against:
  frame    fully inside the frame with a 3 % margin
  ui       9:16: clear of the Shorts player (top 6 %, bottom 20 % title strip, right 14 % button column below
           40 % height); 16:9: clear of the end-screen right third in the last 15 s
  drawing  ink under the box: > 4 % fail, > 1.5 % warn (captions only warn: they keep their band)
  overlaps no other text on screen at the same time
--fix moves failing labels (not captions) to the nearest clear spot, writes overlays.json and re-checks.
--sheet saves a contact sheet of every non-ok item with its box drawn, for a human look.
Exit 1 when anything fails.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
import compose  # noqa: E402
import motion  # noqa: E402

INK_FAIL, INK_WARN = 0.04, 0.015
MARGIN = 0.03
END_SCREEN_SECONDS = 15.0

Box = tuple[float, float, float, float]   # x0, y0, x1, y1 in pixels


def forbidden_zones(W: int, H: int, t: float, total: float) -> list[Box]:
    if H > W:   # YouTube Shorts player chrome
        return [(0, 0, W, 0.06 * H), (0, 0.80 * H, W, H), (0.86 * W, 0.40 * H, W, H)]
    if total - t <= END_SCREEN_SECONDS:
        return [(0.66 * W, 0, W, H)]
    return []


def _area(b: Box) -> float:
    return max(0.0, b[2] - b[0]) * max(0.0, b[3] - b[1])


def overlap(box: Box, others: list[Box]) -> float:
    """Largest fraction of `box` covered by any one of `others`."""
    best = 0.0
    for o in others:
        inter = (max(box[0], o[0]), max(box[1], o[1]), min(box[2], o[2]), min(box[3], o[3]))
        best = max(best, _area(inter) / max(1.0, _area(box)))
    return best


def ink_fraction(box: Box, mask: np.ndarray) -> float:
    h, w = mask.shape
    x0, y0 = max(0, int(box[0])), max(0, int(box[1]))
    x1, y1 = min(w, int(math.ceil(box[2]))), min(h, int(math.ceil(box[3])))
    if x1 <= x0 or y1 <= y0:
        return 0.0
    return float(mask[y0:y1, x0:x1].mean())


def judge(box: Box, mask: np.ndarray, zones: list[Box], others: list[Box], size: tuple[int, int],
          caption: bool = False, faces: list[Box] | None = None) -> dict:
    W, H = size
    why, verdict = [], "ok"
    if faces and overlap(box, faces) > 0:
        why.append("covers a face")
        verdict = "fail"
    mx, my = MARGIN * W, MARGIN * H
    if box[0] < mx or box[1] < my or box[2] > W - mx or box[3] > H - my:
        why.append("runs off the frame edge")
        verdict = "fail"
    ui = overlap(box, zones)
    if ui > 0:
        why.append(f"under player UI / end screen ({ui:.0%})")
        verdict = "fail"
    ink = ink_fraction(box, mask)
    if ink > INK_FAIL and not caption:
        why.append(f"covers the drawing ({ink:.0%} ink)")
        verdict = "fail"
    elif ink > INK_WARN:
        why.append(f"touches the drawing ({ink:.0%} ink)")
        verdict = "warn" if verdict == "ok" else verdict
    clash = overlap(box, others)
    if clash > 0:
        why.append(f"overlaps other text ({clash:.0%})")
        verdict = "fail"
    return {"verdict": verdict, "why": "; ".join(why), "ink": round(ink, 3)}


def find_spot(wh: tuple[int, int], mask: np.ndarray, zones: list[Box], others: list[Box], size: tuple[int, int],
              prefer: tuple[float, float], step: float = 0.02) -> tuple[float, float] | None:
    """Centre (fractions) of the clear spot nearest `prefer` for a box of wh pixels, or None."""
    W, H = size
    bw, bh = wh
    best, best_cost = None, 1e18
    for fy in np.arange(0.0, 1.0001, step):
        for fx in np.arange(0.0, 1.0001, step):
            cx, cy = fx * W, fy * H
            box = (cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2)
            j = judge(box, mask, zones, others, size)
            if j["verdict"] != "ok":
                continue
            cost = math.hypot(fx - prefer[0], (fy - prefer[1]) * H / W) + j["ink"] * 5
            if cost < best_cost:
                best, best_cost = (round(float(fx), 3), round(float(fy), 3)), cost
    return best


def drawing_mask(frame: np.ndarray, grow: int = 8) -> np.ndarray:
    paper = compose.paper_color(frame)
    ink, acc = motion.masks(frame, paper)
    return ndimage.binary_dilation(ink | acc, iterations=grow)


def _box(ov: compose.Overlay) -> Box:
    return (ov.x, ov.y, ov.x + ov.image.width, ov.y + ov.image.height)


def analyse(video_dir: Path, words_path: Path, W: int, H: int, captions: bool) -> tuple[list[dict], dict]:
    plan = json.loads((video_dir / "scene_plan.json").read_text())
    words = json.loads(words_path.read_text())
    groups = compose.build_groups(plan, video_dir / "assets" / "stills", None)
    total = groups[-1].end
    specs = json.loads((video_dir / "overlays.json").read_text())
    ovs = compose.resolve_overlays(specs, words, groups, None)
    faces = face_boxes(video_dir, W, H)
    layout = compose.load_caption_layout(video_dir)
    caps = compose.caption_overlays(words, None, layout=layout, groups=groups) if captions else []
    compose.place_overlays(ovs + caps, W, H)
    scratch = Path(tempfile.mkdtemp(prefix="ovcheck-"))
    by_scene = {g.scene_id: i for i, g in enumerate(groups)}
    sources: dict[int, compose.Source] = {}
    masks: dict[tuple[int, float], np.ndarray] = {}

    def mask_at(gi: int, t: float) -> np.ndarray:
        key = (gi, round(t, 2))
        if key not in masks:
            if gi not in sources:
                sources[gi] = compose.Source(groups[gi], W, H, scratch, gi)
            masks[key] = drawing_mask(sources[gi].frame(t))
        return masks[key]

    def group_at(t: float) -> int:
        return max(i for i, g in enumerate(groups) if g.start <= t + 1e-6)

    results = []
    everything = ovs + caps
    for ov in everything:
        is_cap = ov.spec.get("kind") == "caption"
        t0 = ov.start + (compose.REVEAL_SECONDS if not is_cap else 0.0)
        times = sorted({min(max(t0, ov.start), ov.end - 0.05), (ov.start + ov.end) / 2, ov.end - 0.05})
        box = _box(ov)
        others = [_box(o) for o in everything if o is not ov and o.start < ov.end and ov.start < o.end]
        worst = None
        for t in times:
            gi = by_scene.get(ov.spec.get("scene"), None) if not is_cap else None
            gi = group_at(t) if gi is None or not (groups[gi].start <= t < groups[gi].end + 1e-6) else gi
            j = judge(box, mask_at(gi, t), forbidden_zones(W, H, t, total), others, (W, H), caption=is_cap,
                      faces=faces.get(groups[gi].scene_id))
            rank = {"ok": 0, "warn": 1, "fail": 2}[j["verdict"]]
            if worst is None or rank > {"ok": 0, "warn": 1, "fail": 2}[worst["verdict"]]:
                worst = dict(j, t=round(t, 2), gi=gi)
        results.append({"ov": ov, "caption": is_cap, "box": box, **worst})
    return results, {"groups": groups, "mask_at": mask_at, "total": total, "specs": specs, "layout": layout,
                     "faces": faces}


def face_boxes(video_dir: Path, W: int, H: int) -> dict[str, list[Box]]:
    """Per scene, a box around each rigged character's face (eyes from anim.json, widened to brows and mouth,
    padded for the push-in). Text may never sit on a face, however light its ink."""
    p = video_dir / "anim.json"
    if not p.exists():
        return {}
    anim = json.loads(p.read_text())
    chars = anim.get("characters", {})
    out: dict[str, list[Box]] = {}
    for sid in set(chars) | set(anim.get("copies", {})):
        src = anim.get("copies", {}).get(sid, sid)
        eyes = chars.get(src, {}).get("eyes")
        if not eyes:
            continue
        xs, ys, r = [e[0] for e in eyes], [e[1] for e in eyes], max(e[2] for e in eyes)
        pad = 0.04 * W
        out[sid] = [(min(xs) - 2.2 * r - pad, min(ys) - 2.6 * r - pad, max(xs) + 2.2 * r + pad, max(ys) + 2.6 * r + pad)]
    return out


CAPTION_YS = [round(0.56 + 0.02 * k, 2) for k in range(9)]   # 0.56 .. 0.72: slack above the Shorts title strip


def fix_captions(results: list[dict], ctx: dict, W: int, H: int) -> dict:
    """caption_layout.json: 16-character lines nudged left of the button column, and per shot the height in
    CAPTION_YS whose lines cross the least drawing (UI-safe heights only; ties go to 0.70)."""
    layout = {"max_chars": 16, "x": 0.45, "y": {}}
    caps = [r for r in results if r["caption"]]
    labels = [r for r in results if not r["caption"]]
    for gi, g in enumerate(ctx["groups"]):
        mine = [r for r in caps if g.start <= r["ov"].start + 1e-6 < g.end]
        if not mine:
            continue
        best, best_cost = None, 1e18
        for y in CAPTION_YS:
            cost = abs(y - 0.70) * 0.05
            for r in mine:
                ov = r["ov"]
                w = min(ov.image.width, 0.76 * W)   # 16-char lines; width capped to what fits left of the buttons
                h = ov.image.height
                cx, cy = layout["x"] * W, y * H
                box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
                t = (ov.start + ov.end) / 2
                others = [l["box"] for l in labels if l["ov"].start < ov.end and ov.start < l["ov"].end]
                j = judge(box, ctx["mask_at"](gi, min(max(t, g.start), g.end - 0.01)), forbidden_zones(W, H, t, ctx["total"]),
                          others, (W, H), caption=True, faces=ctx["faces"].get(g.scene_id))
                cost += 1e6 if j["verdict"] == "fail" else j["ink"]
            if cost < best_cost:
                best, best_cost = y, cost
        layout["y"][g.scene_id] = best
    return layout


def fix(results: list[dict], ctx: dict, W: int, H: int) -> int:
    moved = 0
    specs_by_id = {s.get("id"): s for s in ctx["specs"]}
    placed = [r for r in results if r["verdict"] != "fail" or r["caption"]]
    for r in results:
        if r["verdict"] != "fail" or r["caption"]:
            continue
        ov = r["ov"]
        others = [p["box"] for p in placed if p["ov"].start < ov.end and ov.start < p["ov"].end]
        others += ctx["faces"].get(ctx["groups"][r["gi"]].scene_id, [])   # faces are no-go boxes too
        mask = ctx["mask_at"](r["gi"], r["t"])
        for t in (ov.start + compose.REVEAL_SECONDS, ov.end - 0.05):
            if ctx["groups"][r["gi"]].start <= t < ctx["groups"][r["gi"]].end:
                mask = mask | ctx["mask_at"](r["gi"], t)
        zones = forbidden_zones(W, H, ov.start, ctx["total"]) + forbidden_zones(W, H, ov.end, ctx["total"])
        pad = 12
        spec = specs_by_id.get(ov.spec.get("id"))
        if spec is None:
            continue
        base = ov.spec.get("size", {"label": 68, "number": 150, "card": 60, "chapter": 48, "strike": 96}.get(ov.spec.get("kind", "label"), 68))
        pos = None
        for k in (1.0, 0.85, 0.7, 0.55):   # big cards that fit nowhere get smaller before they cover the drawing
            trial = dict(ov.spec, size=int(base * k))
            im = compose.render_overlay(trial, W, H, compose.random.Random(1))
            pos = find_spot((im.width + pad, im.height + pad), mask, zones, others, (W, H), tuple(ov.spec.get("pos", [0.5, 0.12])))
            if pos:
                if k < 1.0:
                    spec["size"] = int(base * k)
                ov.image = im
                break
        if pos is None:
            print(f"  no clear spot for {ov.spec.get('id')} {ov.spec.get('text')!r}; change the shot or drop the label")
            continue
        spec["pos"] = list(pos)
        cx, cy = pos[0] * W, pos[1] * H
        r["box"] = (cx - ov.image.width / 2, cy - ov.image.height / 2, cx + ov.image.width / 2, cy + ov.image.height / 2)
        placed.append(r)
        moved += 1
    return moved


def sheet(results: list[dict], ctx: dict, W: int, H: int, out: Path) -> None:
    bad = [r for r in results if r["verdict"] != "ok"]
    if not bad:
        return
    tw = 270 if H > W else 480
    th = int(tw * H / W)
    cols = 6 if H > W else 4
    img = Image.new("RGB", (cols * tw, math.ceil(len(bad) / cols) * (th + 30)), "white")
    for i, r in enumerate(bad):
        g = ctx["groups"][r["gi"]]
        src = compose.Source(g, W, H, Path(tempfile.mkdtemp()), r["gi"])
        fr = Image.fromarray(src.frame(r["t"]))
        d = ImageDraw.Draw(fr)
        d.rectangle(r["box"], outline=(220, 0, 0) if r["verdict"] == "fail" else (230, 150, 0), width=6)
        x, y = (i % cols) * tw, (i // cols) * (th + 30)
        img.paste(fr.resize((tw, th)), (x, y + 30))
        ImageDraw.Draw(img).text((x + 3, y + 2), f"{r['verdict']} {r['ov'].spec.get('text', '')[:28]!r}\n{r['why'][:44]}",
                                 fill="black")
    img.save(out)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("video_dir", type=Path)
    p.add_argument("--words", type=Path, default=None, help="default: <video_dir>/narration/words.json")
    p.add_argument("--size", default=None, help="WxH; default 1080x1920 for shorts/, else 1920x1080")
    p.add_argument("--captions", action="store_true", help="include burnt-in captions (only if the render burns them)")
    p.add_argument("--fix", action="store_true", help="move failing labels to the nearest clear spot")
    p.add_argument("--sheet", type=Path, default=None, help="contact sheet of warn/fail items")
    a = p.parse_args()
    vd = a.video_dir
    size = a.size or ("1080x1920" if "shorts" in vd.resolve().parts else "1920x1080")
    W, H = (int(v) for v in size.split("x"))
    words = a.words or vd / "narration" / "words.json"
    captions = a.captions   # owner 2026-10-31: no subtitles on the Shorts, so captions are opt-in
    results, ctx = analyse(vd, words, W, H, captions)
    if a.fix:
        if captions and any(r["caption"] and r["verdict"] != "ok" for r in results):
            (vd / "caption_layout.json").write_text(json.dumps(fix_captions(results, ctx, W, H), indent=1))
            print("wrote caption_layout.json; re-checking")
            results, ctx = analyse(vd, words, W, H, captions)
        n = fix(results, ctx, W, H)
        if n:
            (vd / "overlays.json").write_text(json.dumps(ctx["specs"], indent=1))
            print(f"moved {n} label(s); re-checking")
            results, ctx = analyse(vd, words, W, H, captions)
    counts = {"ok": 0, "warn": 0, "fail": 0}
    for r in results:
        counts[r["verdict"]] += 1
        if r["verdict"] != "ok":
            kind = "caption" if r["caption"] else r["ov"].spec.get("id", "")
            print(f"[{r['verdict'].upper():4s}] {r['t']:6.2f}s {kind:8s} {r['ov'].spec.get('text', '')[:30]!r}: {r['why']}")
    print(f"{counts['ok']} ok, {counts['warn']} warn, {counts['fail']} fail ({len(results)} text items)")
    if a.sheet:
        sheet(results, ctx, W, H, a.sheet)
    sys.exit(1 if counts["fail"] else 0)


if __name__ == "__main__":
    main()
