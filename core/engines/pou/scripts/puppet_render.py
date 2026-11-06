#!/usr/bin/env python3
"""Build cut-out rigs from stills and render puppet scenes timed to narration words.

  build  rigs/<char>.json                    cut every pose's parts out of its source still ->
                                             rigs/<char>/<pose>/{<part>.png, mask.png, parts.json}
  render <stage.json> -o out.mp4             render the stage's frame ranges (plates + puppets + reveal + opt-in boil +
                                             the video's overlays.json), muxed with audio cut from --audio-from

A rig file (all coordinates in the source still's pixels):
  {"name": "you", "poses": {"stand_front": {"source": "videos/.../s006.png", "parts": {
      "body": {"region": {"rects": [[x0,y0,x1,y1]], "polys": [...], "ellipses": [...], "minus": {...}},
               "pivot": [x,y], "parent": null, "z": 1, "ink_only": false, "grow": 3,
               "erase": {region}, "patch": {"region": {...}, "color_at": [x,y]},
               "features": [{"name": "eyeL", "kind": "eye", "lens": [cx,cy,rx,ry], "pupil": [cx,cy,rx,ry]},
                            {"name": "mouth", "kind": "mouth", "at": [x,y], "default": "flat",
                             "shapes": {"flat": [[[dx,dy], ...]]}}]}}}}}

A stage file lists scenes (still, start, end, the poses placed on it, plate fixes, occluders, init state, actions,
idle breathing) and the output frame ranges. See videos/2026-10-29_effort-brain/tests/animation/stage.json."""
from __future__ import annotations

import json
import math
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
import compose  # noqa: E402
import motion  # noqa: E402
import puppet as pp  # noqa: E402
import pou_paths  # noqa: E402
import cli_args  # noqa: E402

ROOT = pou_paths.channel_dir()   # the channel folder; video paths in rigs and stages are relative to it


def boil_settings(spec: dict) -> dict | None:
    """A stage scene's line boil, off unless the scene opts in with "boil": true or {"amp": ..., "seed": ...}.
    The owner banned boil (core/studio/rules/no-line-boil.md); the studio tool refuses any opt-in."""
    b = spec.get("boil", False)
    if not b:
        return None
    return b if isinstance(b, dict) else {}


# ---------------------------------------------------------------- build

def build_pose(pose: dict, out_dir: Path) -> dict:
    still = np.asarray(Image.open(ROOT / pose["source"]).convert("RGB"))
    paper = compose.paper_color(still)
    swatch = pp.paper_swatch(still, paper)
    H, W = still.shape[:2]
    out_dir.mkdir(parents=True, exist_ok=True)
    union = np.zeros((H, W), bool)
    meta = {"source": pose["source"], "parts": {}}
    for name, spec in pose["parts"].items():
        region = pp.region_mask((H, W), spec["region"])
        if spec.get("solid"):   # the whole region, paper and all (fog, a flame's glow): soft-edged, no silhouette
            m = region
        elif spec.get("ink_only"):
            ink, _ = motion.masks(still, paper)
            m = ink & region
            if spec.get("fill_holes"):
                m = ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=3))
            m = ndimage.binary_dilation(m, iterations=int(spec.get("grow", 2))) & region
        else:
            m = pp.silhouette(still, paper, region, grow=int(spec.get("grow", 3)))
        if spec.get("largest"):   # drop specks of neighbouring drawings caught by the region
            lab, n = ndimage.label(m)
            if n > 1:
                m = lab == 1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1))))
        rgb = still.copy()
        if "patch" in spec:   # paint where another drawing hid this part (e.g. a tunic behind a head)
            pm = pp.region_mask((H, W), spec["patch"]["region"])
            if "shift" in spec["patch"]:   # borrow the part's own texture from beside the hole
                dx, dy = spec["patch"]["shift"]
                ys, xs = np.nonzero(pm)
                rgb[ys, xs] = still[np.clip(ys + dy, 0, H - 1), np.clip(xs + dx, 0, W - 1)]
            else:
                _, acc = motion.masks(still, paper)
                cx, cy = spec["patch"]["color_at"]
                box = (slice(cy - 30, cy + 30), slice(cx - 30, cx + 30))
                col = np.median(still[box][acc[box]], axis=0)   # the accent colour, not an ink hatch
                noise = np.random.default_rng(3).normal(0, 4, (H, W, 1))
                rgb[pm] = np.clip(col + noise[pm], 0, 255).astype(np.uint8)
            m |= pm
        if "erase" in spec:   # raster features replaced by procedural ones
            em = pp.region_mask((H, W), spec["erase"])
            rgb = pp.paper_fill(rgb, em, swatch, feather=1.0)
        ys, xs = np.nonzero(m)
        alpha = ndimage.gaussian_filter(m.astype(np.float32), float(spec.get("feather", 0.7)))
        if spec.get("feather"):   # a wide soft edge (fog over paper): the paper grain cross-fades, no seam line
            m = ndimage.binary_dilation(m, iterations=int(2 * spec["feather"]))
            ys, xs = np.nonzero(m)
        else:
            alpha = np.maximum(alpha, ndimage.binary_erosion(m, iterations=1).astype(np.float32))
        if not spec.get("feather"):
            alpha[m & pp.ink_mask(still, paper)] = 1.0   # lines stay solid where a region cuts across them (necks)
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])[y0:y1, x0:x1].copy()
        Image.fromarray(rgba, "RGBA").save(out_dir / f"{name}.png")
        union |= m
        meta["parts"][name] = {"origin": [int(x0), int(y0)], "pivot": spec["pivot"], "parent": spec.get("parent"),
                               "z": spec.get("z", 0), "features": spec.get("features", [])}
    Image.fromarray((union * 255).astype(np.uint8)).save(out_dir / "mask.png")
    weights = {}
    for name in pose["parts"]:
        r = pp.region_mask((H, W), pose["parts"][name]["region"])
        weights[name] = round(pp.line_weight(still, paper, r), 2)
    meta["line_weight"] = weights
    (out_dir / "parts.json").write_text(json.dumps(meta, indent=1))
    return meta


def cmd_build(rig_path: Path) -> None:
    rig = json.loads(rig_path.read_text())
    base = rig_path.parent / rig["name"]
    for pose_name, pose in rig["poses"].items():
        t0 = time.time()
        meta = build_pose(pose, base / pose_name)
        print(f"{rig['name']}/{pose_name}: {len(meta['parts'])} parts, line weight {meta['line_weight']} "
              f"({time.time() - t0:.1f}s)")


# ---------------------------------------------------------------- stage

class Scene:
    def __init__(self, spec: dict, rigs_dir: Path, plates_dir: Path, words: list[dict]):
        self.spec = spec
        self.id = spec["id"]
        self.start, self.end = float(spec["start"]), float(spec["end"])
        still = np.asarray(Image.open(ROOT / spec["still"]).convert("RGB"))
        self.paper = compose.paper_color(still)
        self.parts: dict[str, pp.Part] = {}
        holes = np.zeros(still.shape[:2], bool)
        for pl in spec["place"]:
            d = rigs_dir / pl
            meta = json.loads((d / "parts.json").read_text())
            holes |= np.asarray(Image.open(d / "mask.png")) > 0
            prefix = pl.split("/")[0]
            for name, pm in meta["parts"].items():
                full = f"{prefix}.{name}"
                img = np.asarray(Image.open(d / f"{name}.png").convert("RGBA"))
                feats = [dict(f, name=f"{prefix}.{f['name']}") for f in pm["features"]]
                parent = f"{prefix}.{pm['parent']}" if pm["parent"] else None
                self.parts[full] = pp.Part(full, img, tuple(pm["origin"]), tuple(pm["pivot"]), parent,
                                           int(pm["z"]) + int(spec.get("z", {}).get(prefix, 0)), None, feats)
        for name, occ in spec.get("clip", {}).items():
            self.parts[name].clip = occ
        self.still = still
        self.wipes = []
        for w in spec.get("wipes", []):
            region = pp.region_mask(still.shape[:2], w["region"])
            sel = w.get("select", "drawing")
            if sel == "faint":   # pencil-light figures that the ink threshold misses
                d = (np.array(self.paper, np.int16) - still.astype(np.int16)).max(axis=2) > int(w.get("level", 14))
                m = ndimage.binary_dilation(d & region, iterations=2) & region
                if w.get("keep_ink"):
                    m &= ~ndimage.binary_dilation(pp.ink_mask(still, self.paper), iterations=1)
            elif sel == "all":
                m = region
            else:
                m = pp.silhouette(still, self.paper, region, grow=int(w.get("grow", 3)))
            holes |= m
            entry = {"spec": w, "mask": m, "kind": w.get("kind", "in")}
            if "waves" in w:
                entry["waves"] = pp.component_waves(m, tuple(w.get("from", [960, 540])), len(w["waves"]), int(w.get("link", 6)))
                entry["starts"] = [pp.resolve_at(a, words, self.start) for a in w["waves"]]
            else:
                fx, fy = w.get("from", [0, 0])
                yy, xx = np.mgrid[0:still.shape[0], 0:still.shape[1]]
                o = np.hypot(xx - fx, yy - fy).astype(np.float32)
                o = (o - o[m].min()) / max(1e-6, o[m].max() - o[m].min())
                entry["order"] = np.clip(o, 0, 1)
                entry["t0"] = pp.resolve_at(w["at"], words, self.start)
            self.wipes.append(entry)
        self.jitters = []
        for target, js in spec.get("jitter", {}).items():
            for i, j in enumerate(js if isinstance(js, list) else [js]):
                t_from = pp.resolve_at(j["from"], words, self.start) if "from" in j else self.start
                t_to = pp.resolve_at(j["to"], words, self.start) if "to" in j else self.end
                self.jitters.append((target, j, t_from, t_to, int(j.get("seed", i + 1))))
        plates_dir.mkdir(parents=True, exist_ok=True)
        import hashlib
        key = hashlib.sha1(json.dumps([spec["still"], spec["place"], spec.get("plate_paint", []), spec.get("wipes", []),
                                       [hashlib.sha1((rigs_dir / pl / "mask.png").read_bytes()).hexdigest() for pl in spec["place"]]],
                                      sort_keys=True).encode()).hexdigest()[:10]
        plate_path = plates_dir / f"{self.id}_{key}.png"
        if plate_path.exists():
            self.plate = np.asarray(Image.open(plate_path).convert("RGB"))
        else:
            swatch = pp.paper_swatch(still, self.paper)
            plate = pp.paper_fill(still, holes, swatch)
            for fix in spec.get("plate_paint", []):   # e.g. the ochre ring under a needle
                cx, cy, r0, r1 = fix["ring"]
                yy, xx = np.mgrid[0:plate.shape[0], 0:plate.shape[1]]
                rr = np.hypot(xx - cx, yy - cy)
                ring = (rr >= r0) & (rr <= r1)
                _, acc = motion.masks(still, self.paper)
                col = np.median(still[ring & acc], axis=0)
                tgt = ring & holes
                noise = np.random.default_rng(5).normal(0, 3, (int(tgt.sum()), 1))
                plate = plate.copy()
                plate[tgt] = np.clip(col + noise, 0, 255).astype(np.uint8)
            for w in self.wipes:   # shaded ground under faint figures: fill from the surroundings, not flat paper
                if w["spec"].get("fill") == "smooth":
                    plate = pp.smooth_fill(plate, w["mask"], swatch)
            Image.fromarray(plate).save(plate_path)
            self.plate = plate
        self.occluders = {}
        for name, occ in spec.get("occluders", {}).items():
            m = np.zeros(still.shape[:2], bool)
            if occ["kind"] == "below_edge":   # everything from the first ink line in [y0,y1] down, per column
                # only long horizontal strokes count as the edge (a couch back), not hems or hatching above it
                ink = ndimage.binary_opening(motion.masks(still, self.paper)[0], structure=np.ones((1, int(occ.get("run", 41))), bool))
                x0, x1 = occ["x"]
                y0, y1 = occ["y"]
                for x in range(x0, x1):
                    col = np.nonzero(ink[y0:y1, x])[0]
                    e = y0 + int(col[0]) if col.size else int(occ.get("default", y1))
                    m[max(0, e - int(occ.get("lift", 2))):, x] = True
            self.occluders[name] = m
            if occ.get("restore", True):   # the occluder is foreground: keep the still's own pixels there
                self.plate = np.where(m[..., None], still, self.plate)
        self.keys = pp.expand(spec.get("actions", []), words, self.start)
        self.init = spec.get("init", {})
        self.idle = spec.get("idle", {})
        self.order = compose.reveal_order(*still.shape[:2], int(spec.get("seed", 0))) if spec.get("reveal", 0) > 0 else None
        self.weight = float(spec.get("feature_weight", 6.0))

    def frame(self, t: float) -> np.ndarray:
        state = pp.channel_state(self.keys, t, self.init)
        for name, d in pp.idle(self.idle, t - self.start).items():
            st = state.setdefault(name, {})
            for ch, v in d.items():
                st[ch] = st.get(ch, pp.DEFAULTS[ch]) + v
        for target, j, t_from, t_to, seed in self.jitters:
            d = pp.jitter(j, t, t_from, t_to, seed)
            st = state.setdefault(target, {})
            for ch, v in d.items():
                st[ch] = st.get(ch, pp.DEFAULTS[ch]) + v
        out = self.plate.copy()
        for w in self.wipes:   # parts of the still drawn on / faded out over the plate
            if "waves" in w:
                a = pp.wave_alpha(w["waves"], w["kind"], t, w["starts"], float(w["spec"].get("dur", 0.4)))
            else:
                tl = pp.stepped(t, w["t0"])
                u = 0.0 if tl < 0 else min(1.0, (tl + 1.0 / pp.POSE_HZ) / float(w["spec"].get("dur", 1.0)))
                a = pp.wipe_alpha(w["order"], w["kind"], pp.ease(w["spec"].get("ease", "out"), u, u), float(w["spec"].get("soft", 0.08)))
            a = np.where(w["mask"], a, 0.0)[..., None]
            if a.any():
                out = (out * (1 - a) + self.still * a).astype(np.uint8)
        mats: dict[str, np.ndarray] = {}

        def mat(name: str) -> np.ndarray:
            if name in mats:
                return mats[name]
            p = self.parts[name]
            st = state.get(name, {})
            # whole-pixel moves: no resampling blur on plain translations (poses are held on twos anyway)
            local = pp.affine(p.pivot[0], p.pivot[1], round(st.get("x", 0.0)), round(st.get("y", 0.0)), st.get("rot", 0.0),
                              st.get("sx", 1.0), st.get("sy", 1.0), st.get("kx", 0.0))
            M = (mat(p.parent) @ local) if p.parent else local
            mats[name] = M
            return M

        for p in sorted(self.parts.values(), key=lambda p: p.z):
            img = pp.draw_features(p, state, self.weight)
            pp.place(out, img, mat(p.name), p.origin, self.occluders.get(p.clip) if p.clip else None)
        b = boil_settings(self.spec)
        if b is not None:
            out = pp.boil_like_compose(out, self.paper, t - self.start, float(b.get("amp", 1.0)), int(b.get("seed", 0)))
        rv = float(self.spec.get("reveal", 0))
        if rv > 0 and t - self.start < rv:
            p = 0.06 + 0.94 * compose._ease(max(0.0, (t - self.start) / rv))
            out = np.where((self.order < p)[..., None], out, np.array(self.paper, np.uint8))
        return out


def cmd_render(stage_path: Path, out: Path, audio_from: Path | None, only: list[str] | None, workers: int,
               ranges: list[list[float]] | None = None, overlays: bool | None = None) -> dict:
    stage = json.loads(stage_path.read_text())
    if ranges:
        stage["ranges"] = ranges
    video_dir = ROOT / stage["video_dir"]
    words = json.loads((ROOT / stage["words"]).read_text())
    rigs_dir = ROOT / stage.get("rigs", "rigs")
    plates_dir = ROOT / stage["plates"] if "plates" in stage else stage_path.parent / "plates"
    fps = int(stage.get("fps", 30))
    scenes = [Scene(s, rigs_dir, plates_dir, words) for s in stage["scenes"] if not only or s["id"] in only]
    H, W = scenes[0].still.shape[:2] if scenes else (1080, 1920)   # the stills' own size: 16:9 or a 9:16 Short
    plan = json.loads((video_dir / "scene_plan.json").read_text())
    groups = compose.build_groups(plan, video_dir / "assets" / "stills", None, None)
    draw_ovs = stage.get("overlays", True) if overlays is None else overlays
    specs = json.loads((video_dir / "overlays.json").read_text()) if draw_ovs else []
    ovs = [o for o in compose.resolve_overlays(specs, words, groups, None) if o.spec.get("kind") != "punch"]
    compose.place_overlays(ovs, W, H)
    frames = []
    for a, b in stage["ranges"]:
        frames += list(range(math.ceil(a * fps - 1e-6), math.ceil(b * fps - 1e-6)))
    if only:
        frames = [n for n in frames if any(s.start <= n / fps < s.end for s in scenes)]
    tmp = out.with_suffix(".video.mp4")
    out.parent.mkdir(parents=True, exist_ok=True)
    enc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(fps), "-i", "-", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "19",
                            "-pix_fmt", "yuv420p", str(tmp)], stdin=subprocess.PIPE)
    t0 = time.time()

    def render_one(n: int) -> bytes:
        t = n / fps
        sc = next(s for s in scenes if s.start <= t < s.end)
        fr = sc.frame(t)
        for ov in ovs:
            if ov.start <= t < ov.end:
                al, frac = compose.overlay_alpha(ov, t)
                if al > 0:
                    compose.composite(fr, ov, al, frac)
        return fr.tobytes()

    if workers > 1:
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(workers) as ex:
            for i, buf in enumerate(ex.map(render_one, frames)):
                enc.stdin.write(buf)
                if i % 150 == 0:
                    print(f"  frame {i}/{len(frames)} {time.time() - t0:.0f}s", file=sys.stderr)
    else:
        for i, n in enumerate(frames):
            enc.stdin.write(render_one(n))
            if i % 150 == 0:
                print(f"  frame {i}/{len(frames)} {time.time() - t0:.0f}s", file=sys.stderr)
    enc.stdin.close()
    if enc.wait() != 0:
        raise SystemExit("encode failed")
    secs = time.time() - t0
    if audio_from:
        parts = "".join(f"[1:a]atrim=start={math.ceil(a * fps - 1e-6) / fps}:end={math.ceil(b * fps - 1e-6) / fps},asetpts=PTS-STARTPTS[a{i}];"
                        for i, (a, b) in enumerate(stage["ranges"]))
        cat = "".join(f"[a{i}]" for i in range(len(stage["ranges"]))) + f"concat=n={len(stage['ranges'])}:v=0:a=1[a]"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-i", str(audio_from), "-filter_complex",
                        parts + cat, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                        "-shortest", str(out)], check=True)
        tmp.unlink()
    else:
        tmp.rename(out)
    return {"out": str(out), "frames": len(frames), "render_seconds": round(secs, 1),
            "seconds_per_frame": round(secs / max(1, len(frames)), 3)}


def cmd_frames(stage_path: Path, times: list[float], out_dir: Path) -> None:
    stage = json.loads(stage_path.read_text())
    words = json.loads((ROOT / stage["words"]).read_text())
    rigs_dir = ROOT / stage.get("rigs", "rigs")
    out_dir.mkdir(parents=True, exist_ok=True)
    cache: dict[str, Scene] = {}
    for t in times:
        spec = next(s for s in stage["scenes"] if s["start"] <= t < s["end"])
        if spec["id"] not in cache:
            cache[spec["id"]] = Scene(spec, rigs_dir, ROOT / stage["plates"] if "plates" in stage else stage_path.parent / "plates", words)
        Image.fromarray(cache[spec["id"]].frame(t)).save(out_dir / f"B_{t:.2f}.png")


def cmd_check(stage_path: Path) -> list[dict]:
    """For every word-anchored action: the first frame its target changes vs. the word's time (criterion: within
    +-2 frames). Uses the engine's own channel_state, so it measures what is rendered."""
    stage = json.loads(stage_path.read_text())
    words = json.loads((ROOT / stage["words"]).read_text())
    fps = int(stage.get("fps", 30))
    rows = []
    for sc in stage["scenes"]:
        acts = sc.get("actions", [])
        init = sc.get("init", {})
        for i, a in enumerate(acts):
            if not isinstance(a["at"], dict) or "word" not in a["at"]:
                continue
            target = a.get("pose") or a.get("bob") or a["blink"][0]
            with_k = pp.expand(acts, words, sc["start"])
            without = pp.expand(acts[:i] + acts[i + 1:], words, sc["start"])
            wt = pp.word_time(words, a["at"]["word"], a["at"].get("after", sc["start"])) + float(a["at"].get("offset", 0))
            hit = None
            for n in range(math.ceil((wt - 0.3) * fps), math.ceil((wt + 0.5) * fps)):
                s1 = pp.channel_state(with_k, n / fps, init).get(target, {})
                s0 = pp.channel_state(without, n / fps, init).get(target, {})
                if any((s1.get(k) != s0.get(k)) if isinstance(s1.get(k, 0), str) else abs(s1.get(k, 0) - s0.get(k, 0)) > 1e-3
                       for k in set(s1) | set(s0)):
                    hit = n
                    break
            off = None if hit is None else round((hit / fps - wt) * fps, 2)
            rows.append({"scene": sc["id"], "target": target, "word": a["at"]["word"],
                         "offset_s": a["at"].get("offset", 0), "word_t": round(wt, 3), "first_frame_t": None if hit is None else round(hit / fps, 3),
                         "frames_late": off})
        # jitter windows and wipes keyed to a word: the first frame they change, from the same functions the render uses
        timed = []
        for target, js in sc.get("jitter", {}).items():
            for i, j in enumerate(js if isinstance(js, list) else [js]):
                if isinstance(j.get("from"), dict) and "word" in j["from"]:
                    t_to = pp.resolve_at(j["to"], words, sc["start"]) if "to" in j else sc["end"]
                    timed.append((f"{target}~", j["from"], lambda t, j=j, t_to=t_to, i=i, at=j["from"]: bool(pp.jitter(
                        j, t, pp.resolve_at(at, words, sc["start"]), t_to, int(j.get("seed", i + 1))))))
        for k, w in enumerate(sc.get("wipes", [])):
            for at in (w["waves"] if "waves" in w else [w["at"]]):
                if isinstance(at, dict) and "word" in at:
                    timed.append((f"wipe{k}", at, lambda t, at=at: pp.stepped(t, pp.resolve_at(at, words, sc["start"])) >= 0))
        for target, at, moved in timed:
            wt = pp.resolve_at(at, words, sc["start"])
            hit = next((n for n in range(math.ceil((wt - 0.3) * fps), math.ceil((wt + 0.5) * fps)) if moved(n / fps)), None)
            rows.append({"scene": sc["id"], "target": target, "word": at["word"], "offset_s": at.get("offset", 0),
                         "word_t": round(wt, 3), "first_frame_t": None if hit is None else round(hit / fps, 3),
                         "frames_late": None if hit is None else round((hit / fps - wt) * fps, 2)})
    return rows


def cmd_clips(stage_path: Path, only: list[str] | None, workers: int) -> list[dict]:
    """Each stage scene -> <video>/assets/clips/<id>.mp4 over [start, end) (its whole compose group), with no
    overlays and no audio: compose lays overlays, SFX and the mix on top and plays the clip at motion.json's
    clip_rate (1.0 for these)."""
    stage = json.loads(stage_path.read_text())
    clips = ROOT / stage["video_dir"] / "assets" / "clips"
    keep = set(stage.get("protect", []))
    out = []
    for sc in stage["scenes"]:
        if only and sc["id"] not in only:
            continue
        if sc["id"] in keep:
            raise SystemExit(f"{sc['id']} is protected (an existing hero clip)")
        info = cmd_render(stage_path, clips / f"{sc['id']}.mp4", None, [sc["id"]], workers,
                          [[float(sc["start"]), float(sc["end"])]], overlays=False)
        print(json.dumps(info), flush=True)
        out.append(info)
    return out


def main() -> None:
    p = cli_args.puppet_render_parser(__doc__)
    a = p.parse_args()
    if a.cmd == "build":
        for rp in a.rigs:
            cmd_build(rp)
    elif a.cmd == "check":
        rows = cmd_check(a.stage)
        for r in rows:
            print(f"{r['scene']} {r['target']:<14} {r['word']:<10}+{r['offset_s']:<4} word {r['word_t']:>8} -> frame {r['first_frame_t']}  ({r['frames_late']} frames)")
        worst = max(abs(r["frames_late"]) for r in rows if r["frames_late"] is not None)
        print(f"worst offset: {worst} frames; missing: {sum(r['frames_late'] is None for r in rows)}")
    elif a.cmd == "clips":
        cmd_clips(a.stage, a.only, a.workers)
    elif a.cmd == "frames":
        cmd_frames(a.stage, a.times, a.dir)
    else:
        rg = [[float(v) for v in r.split(":")] for r in a.ranges.split(",")] if a.ranges else None
        print(json.dumps(cmd_render(a.stage, a.out, a.audio_from, a.only, a.workers, rg), indent=1))


if __name__ == "__main__":
    main()
