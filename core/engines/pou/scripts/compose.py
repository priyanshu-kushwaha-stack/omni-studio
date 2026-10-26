#!/usr/bin/env python3
"""Compose the stickman-explainer edit from a scene plan, narration word timings and assets.

Layers, bottom to top:
  1. base: a still (assets/stills/<scene>.png) or a hero clip (assets/clips/<scene>.mp4) for every
     scene that introduces an asset; continuation scenes reuse the previous asset. Every new still
     draws on with a jittered ink reveal; every group gets a slow push-in or pull-out, with a small
     extra push at each continuation boundary so each planned change is visible.
  2. overlays: handwriting-font labels, numbers, cards and chapter titles from overlays.json, timed
     to the narration words (anchor phrases), written on left to right.
Audio: narration, a music bed ducked under the voice, pencil / page / sting effects at reveals and
section turns, then loudness-normalised. Captions are written as an SRT sidecar, never burned in.

Everything is driven by the word timings, so a new narration only needs faster-whisper re-run and
scene_plan_from_script.py; overlays retime themselves.
"""
from __future__ import annotations

import argparse
import json
import math
import random
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

PAPER = (0xF6, 0xF1, 0xE7)
INK = (0x2B, 0x2B, 0x2B)
COLORS = {"ink": INK, "rust": (0xB5, 0x53, 0x3C), "ochre": (0xD9, 0xA4, 0x41), "teal": (0x3A, 0x7D, 0x7B),
          "muted": (0x8A, 0x83, 0x78)}
FONT_CANDIDATES = [
    Path(__file__).resolve().parent.parent / "channel" / "fonts" / "PatrickHand-Regular.ttf",
    Path("/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf"),
]
PRESCALE = 1.16          # sources are kept this much larger than the frame so push-ins never upsample
REVEAL_SECONDS = 0.9
BOUNDARY_PUSH = 0.022    # extra zoom at each continuation boundary
BOUNDARY_EASE = 0.45
CLIP_RATE = 0.75         # hero clips play slower than real time (subtle motion reads better)
PENCIL_CLASSES = {"illustration", "diagram", "character"}


# ---------------------------------------------------------------- plan -> groups

@dataclass
class Group:
    scene_id: str
    start: float
    end: float
    klass: str
    boundaries: list[float] = field(default_factory=list)   # continuation scene starts inside the group
    still: Path | None = None
    clip: Path | None = None
    section: str = ""


def build_groups(plan: dict, stills: Path, clips: Path | None, until: float | None = None) -> list[Group]:
    """One group per scene that has an asset on disk; following scenes without one extend it."""
    classes = plan.get("metadata", {}).get("change_classes", {})
    groups: list[Group] = []
    for s in sorted(plan["scenes"], key=lambda x: x["start_seconds"]):
        if until is not None and s["start_seconds"] >= until:
            break
        end = min(s["end_seconds"], until) if until is not None else s["end_seconds"]
        still = stills / f"{s['id']}.png"
        clip = (clips / f"{s['id']}.mp4") if clips else None
        if still.exists():
            g = Group(s["id"], s["start_seconds"], end, classes.get(s["id"], "illustration"),
                      still=still, clip=clip if clip and clip.exists() else None,
                      section=s.get("script_section_id", ""))
            groups.append(g)
        elif groups:
            groups[-1].boundaries.append(s["start_seconds"])
            groups[-1].end = end
    return groups


# ---------------------------------------------------------------- words -> overlay timing

_norm_re = re.compile(r"[^a-z0-9$.]+")


def _norm(tok: str) -> str:
    return _norm_re.sub("", tok.lower()).strip(".")


def find_phrase(words: list[dict], phrase: str, not_before: float = 0.0) -> tuple[float, float] | None:
    """(start, end) of the first occurrence of phrase (as spoken tokens) at or after not_before."""
    target = [_norm(t) for t in phrase.split() if _norm(t)]
    if not target:
        return None
    toks = [_norm(w["word"]) for w in words]
    n = len(target)
    for i in range(len(words) - n + 1):
        if words[i]["start"] < not_before - 0.05:
            continue
        if toks[i:i + n] == target:
            return words[i]["start"], words[i + n - 1]["end"]
    return None


@dataclass
class Overlay:
    spec: dict
    start: float
    end: float
    image: Image.Image | None = None
    x: int = 0
    y: int = 0
    rot: float = 0.0


def resolve_overlays(specs: list[dict], words: list[dict], groups: list[Group], until: float | None) -> list[Overlay]:
    by_scene = {g.scene_id: g for g in groups}
    out: list[Overlay] = []
    for spec in specs:
        g = by_scene.get(spec.get("scene", ""))
        if g is None:
            continue
        t0 = g.start
        if "anchor" in spec:
            hit = find_phrase(words, spec["anchor"], not_before=g.start - 1.0)
            if hit is None:
                print(f"warn: anchor {spec['anchor']!r} not found for {spec.get('id', spec.get('text'))}; using scene start",
                      file=sys.stderr)
            else:
                t0 = hit[0] - float(spec.get("lead", 0.15))
        t0 += float(spec.get("offset", 0.0))
        t0 = max(t0, g.start)
        hold = spec.get("hold")
        t1 = g.end if hold in (None, "scene") else t0 + float(hold)
        if until is not None:
            t1 = min(t1, until)
        if t1 > t0:
            out.append(Overlay(spec, t0, t1))
    return out


# ---------------------------------------------------------------- overlay drawing

def load_font(size: int) -> ImageFont.FreeTypeFont:
    for p in FONT_CANDIDATES:
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def _wobbly_rect(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], color, width: int, rng: random.Random):
    x0, y0, x1, y1 = box
    pts = []
    for (ax, ay), (bx, by) in [((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))]:
        for k in range(8):
            f = k / 8
            pts.append((ax + (bx - ax) * f + rng.uniform(-2, 2), ay + (by - ay) * f + rng.uniform(-2, 2)))
    pts.append(pts[0])
    draw.line(pts, fill=color, width=width, joint="curve")


def render_overlay(spec: dict, W: int, H: int, rng: random.Random) -> Image.Image:
    kind = spec.get("kind", "label")
    color = COLORS.get(spec.get("color", "ink"), INK)
    scale = H / 1080
    size = int(spec.get("size", {"label": 68, "number": 150, "card": 60, "chapter": 48, "strike": 96}.get(kind, 68)) * scale)
    font = load_font(size)
    pad = int(18 * scale)
    text = spec.get("text", "")
    caption = spec.get("caption", "")
    cap_font = load_font(int(size * 0.42)) if caption else None

    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    tw, th = tmp.textbbox((0, 0), text, font=font)[2:]
    cw, ch = (tmp.textbbox((0, 0), caption, font=cap_font)[2:] if caption else (0, 0))
    w = max(tw, cw) + 2 * pad + (int(40 * scale) if kind == "chapter" else 0)
    h = th + (ch + int(6 * scale) if caption else 0) + 2 * pad
    img = Image.new("RGBA", (w + 8, h + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    halo = (*PAPER, 235)
    if kind == "card":
        d.rectangle((4, 4, w + 2, h + 2), fill=(*PAPER, 245))
        _wobbly_rect(d, (6, 6, w, h), (*color, 255), max(3, int(4 * scale)), rng)
    tx = pad + 4 + (int(40 * scale) if kind == "chapter" else 0)
    if kind == "chapter":
        d.line((pad + 2, pad + th // 2 + 4, pad + int(28 * scale), pad + th // 2 + 4), fill=(*COLORS["ochre"], 255),
               width=max(3, int(5 * scale)))
    d.text((tx, pad + 4), text, font=font, fill=(*color, 255), stroke_width=max(3, int(6 * scale)), stroke_fill=halo)
    if caption:
        d.text((tx, pad + 4 + th + int(6 * scale)), caption, font=cap_font, fill=(*COLORS["muted"], 255),
               stroke_width=max(2, int(4 * scale)), stroke_fill=halo)
    if kind == "strike":
        y = pad + 4 + th * 0.55
        pts = [(tx - 6 + k * (tw + 12) / 6, y + rng.uniform(-4, 4) * scale - (k - 3) * 2 * scale) for k in range(7)]
        d.line(pts, fill=(*COLORS["rust"], 255), width=max(4, int(7 * scale)), joint="curve")
    return img


def place_overlays(ovs: list[Overlay], W: int, H: int, seed: int = 7) -> None:
    rng = random.Random(seed)
    for ov in ovs:
        ov.image = render_overlay(ov.spec, W, H, rng)
        fx, fy = ov.spec.get("pos", [0.5, 0.12])
        ov.x = int(fx * W - ov.image.width / 2)
        ov.y = int(fy * H - ov.image.height / 2)
        ov.rot = rng.uniform(-1.6, 1.6)
        if ov.rot:
            ov.image = ov.image.rotate(ov.rot, resample=Image.BICUBIC, expand=True)


def overlay_alpha(ov: Overlay, t: float) -> tuple[float, float]:
    """(global alpha, write-on fraction) at time t."""
    kind = ov.spec.get("kind", "label")
    write = 0.35 if kind != "strike" else 0.25
    a_in = min(1.0, (t - ov.start) / 0.12) if t >= ov.start else 0.0
    a_out = min(1.0, (ov.end - t) / 0.25)
    frac = min(1.0, max(0.0, (t - ov.start) / write))
    return max(0.0, min(a_in, a_out)), _ease(frac)


def _ease(x: float) -> float:
    return x * x * (3 - 2 * x)


def composite(frame: np.ndarray, ov: Overlay, alpha: float, frac: float) -> None:
    im = ov.image
    H, W = frame.shape[:2]
    x0, y0 = ov.x, ov.y
    x1, y1 = min(W, x0 + im.width), min(H, y0 + im.height)
    sx, sy = max(0, -x0), max(0, -y0)
    x0, y0 = max(0, x0), max(0, y0)
    if x1 <= x0 or y1 <= y0:
        return
    arr = np.asarray(im, dtype=np.float32)[sy:sy + (y1 - y0), sx:sx + (x1 - x0)]
    a = arr[..., 3:4] / 255.0 * alpha
    if frac < 1.0:  # write-on: reveal left to right with a soft edge
        cols = np.arange(arr.shape[1], dtype=np.float32) / max(1, arr.shape[1] - 1)
        edge = np.clip((frac * 1.15 - cols) / 0.15, 0, 1)[None, :, None]
        a = a * edge
    region = frame[y0:y1, x0:x1].astype(np.float32)
    frame[y0:y1, x0:x1] = (region * (1 - a) + arr[..., :3] * a).astype(np.uint8)


# ---------------------------------------------------------------- base sources

def paper_color(img: np.ndarray) -> tuple[int, int, int]:
    border = np.concatenate([img[:8].reshape(-1, 3), img[-8:].reshape(-1, 3), img[:, :8].reshape(-1, 3), img[:, -8:].reshape(-1, 3)])
    return tuple(int(v) for v in np.median(border, axis=0))


def reveal_order(h: int, w: int, seed: int) -> np.ndarray:
    """Per-pixel reveal order in [0,1]: a diagonal sweep with blurred jitter, so ink appears like strokes."""
    rng = np.random.default_rng(seed)
    noise = rng.random((h // 24 + 2, w // 24 + 2)).astype(np.float32)
    noise = np.asarray(Image.fromarray((noise * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR), dtype=np.float32) / 255
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    order = 0.78 * xs / w + 0.22 * ys / h + 0.14 * noise
    order -= order.min()
    return order / order.max()


class Source:
    """Frames of a still or a hero clip, pre-scaled, with push-in and reveal applied on request."""

    def __init__(self, g: Group, W: int, H: int, scratch: Path, idx: int):
        self.g, self.W, self.H = g, W, H
        self.pw, self.ph = int(W * PRESCALE), int(H * PRESCALE)
        self.idx = idx
        self.frames: list[Path] = []
        if g.clip:
            d = scratch / f"clip_{g.scene_id}"
            d.mkdir(parents=True, exist_ok=True)
            if not any(d.glob("*.jpg")):
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(g.clip),
                                "-vf", f"scale={self.pw}:{self.ph}:force_original_aspect_ratio=increase,crop={self.pw}:{self.ph}",
                                "-q:v", "2", str(d / "%04d.jpg")], check=True)
            self.frames = sorted(d.glob("*.jpg"))
            self.clip_fps = _probe_fps(g.clip)
        self.still = Image.open(g.still).convert("RGB").resize((self.pw, self.ph), Image.LANCZOS)
        self.still_np = np.asarray(self.still)
        self.paper = paper_color(self.still_np)
        self.order = reveal_order(self.ph, self.pw, idx) if not g.clip else None
        self._cache: tuple[int, np.ndarray] | None = None

    def base(self, t: float) -> np.ndarray:
        if self.frames:
            k = int((t - self.g.start) * self.clip_fps * CLIP_RATE)
            k = min(k, len(self.frames) - 1)
            if self._cache and self._cache[0] == k:
                return self._cache[1]
            arr = np.asarray(Image.open(self.frames[k]).convert("RGB"))
            self._cache = (k, arr)
            return arr
        p = (t - self.g.start) / REVEAL_SECONDS
        if p >= 1.0:
            return self.still_np
        p = 0.06 + 0.94 * _ease(max(0.0, p))
        mask = (self.order < p)[..., None]
        return np.where(mask, self.still_np, np.array(self.paper, dtype=np.uint8))

    def zoom(self, t: float) -> tuple[float, float, float]:
        """(scale, pan_x, pan_y) in [1, PRESCALE] and fractions of the spare margin."""
        g = self.g
        dur = max(0.5, g.end - g.start)
        u = min(1.0, max(0.0, (t - g.start) / dur))
        base_in = self.idx % 2 == 0
        slow = 0.045 * u if base_in else 0.045 * (1 - u)
        push = 0.0
        for b in g.boundaries:
            if t >= b:
                push += BOUNDARY_PUSH * _ease(min(1.0, (t - b) / BOUNDARY_EASE))
        scale = min(PRESCALE - 0.005, 1.0 + slow + push)
        pan = 0.5 + (0.12 if self.idx % 3 == 0 else -0.12) * (u - 0.5)
        return scale, pan, 0.5

    def frame(self, t: float) -> np.ndarray:
        arr = self.base(t)
        scale, px, py = self.zoom(t)
        cw, ch = int(self.pw / scale), int(self.ph / scale)
        x0 = int((self.pw - cw) * px)
        y0 = int((self.ph - ch) * py)
        crop = Image.fromarray(arr[y0:y0 + ch, x0:x0 + cw])
        return np.array(crop.resize((self.W, self.H), Image.BILINEAR))


def _probe_fps(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True).stdout.strip()
    n, d = out.split("/")
    return float(n) / float(d)


# ---------------------------------------------------------------- audio

@dataclass
class Sfx:
    path: Path
    at: float
    gain_db: float = 0.0


def plan_sfx(groups: list[Group], overlays: list[Overlay], sfx_dir: Path, until: float | None) -> list[Sfx]:
    out: list[Sfx] = []
    pencil, page, sting = sfx_dir / "pencil.wav", sfx_dir / "page.wav", sfx_dir / "sting.wav"
    last_section = None
    for g in groups:
        if g.section != last_section and last_section is not None and page.exists():
            out.append(Sfx(page, g.start, -6))
        last_section = g.section
        if g.klass in PENCIL_CLASSES and not g.clip and pencil.exists():
            out.append(Sfx(pencil, g.start, -14))
    for ov in overlays:
        if ov.spec.get("sfx") == "sting" and sting.exists():
            out.append(Sfx(sting, ov.start, -8))
    return [s for s in out if until is None or s.at < until]


def mix_audio(narration: Path, music: list[Path], sfx: list[Sfx], total: float, out: Path, music_gain_db: float) -> None:
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(narration)]
    parts: list[str] = []
    mix_in = ["[nar]"]
    n = 1
    if music:
        for m in music:
            cmd += ["-stream_loop", "-1", "-i", str(m)]
        labels = []
        for k in range(len(music)):
            parts.append(f"[{n + k}:a]aformat=sample_rates=48000:channel_layouts=stereo[mu{k}]")
            labels.append(f"[mu{k}]")
        n += len(music)
        chain = "".join(labels) + (f"concat=n={len(labels)}:v=0:a=1" if len(labels) > 1 else "anull")
        parts.append(f"{chain},atrim=0:{total:.3f},volume={music_gain_db}dB,afade=t=in:d=1.5,afade=t=out:st={max(0, total - 3):.3f}:d=3[music]")
        parts.append(f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={total:.3f},asplit=2[nar][side]")
        parts.append("[music][side]sidechaincompress=threshold=0.015:ratio=5:attack=40:release=700:makeup=1[ducked]")
        mix_in.append("[ducked]")
    else:
        parts.append(f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={total:.3f}[nar]")
    for i, s in enumerate(sfx):
        cmd += ["-i", str(s.path)]
        ms = int(s.at * 1000)
        parts.append(f"[{n + i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={s.gain_db}dB,adelay={ms}|{ms}[sfx{i}]")
        mix_in.append(f"[sfx{i}]")
    parts.append("".join(mix_in) + f"amix=inputs={len(mix_in)}:duration=first:normalize=0,atrim=0:{total:.3f},loudnorm=I=-14:TP=-1.5:LRA=11[out]")
    cmd += ["-filter_complex", ";".join(parts), "-map", "[out]", "-c:a", "pcm_s16le", str(out)]
    subprocess.run(cmd, check=True)


# ---------------------------------------------------------------- captions

def srt_cues(words: list[dict], until: float | None = None, max_chars: int = 38, max_dur: float = 3.5) -> list[tuple[float, float, str]]:
    cues: list[tuple[float, float, str]] = []
    cur: list[dict] = []

    def flush():
        if cur:
            cues.append((cur[0]["start"], cur[-1]["end"], " ".join(w["word"] for w in cur)))

    for w in words:
        if until is not None and w["start"] >= until:
            break
        if cur:
            text_len = len(" ".join(x["word"] for x in cur)) + 1 + len(w["word"])
            gap = w["start"] - cur[-1]["end"]
            if text_len > max_chars or w["start"] - cur[0]["start"] > max_dur or gap > 0.8 or cur[-1]["word"].endswith((".", "?", "!")):
                flush()
                cur = []
        cur.append(w)
    flush()
    return cues


def write_srt(cues: list[tuple[float, float, str]], path: Path) -> None:
    def ts(t: float) -> str:
        ms = int(round(t * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    lines = []
    for i, (a, b, text) in enumerate(cues, 1):
        lines += [str(i), f"{ts(a)} --> {ts(max(b, a + 0.3))}", text, ""]
    path.write_text("\n".join(lines))


# ---------------------------------------------------------------- render

def render(video_dir: Path, *, narration: Path, words_path: Path, out: Path, until: float | None, width: int, height: int,
           fps: int, music: list[Path], music_gain_db: float, use_clips: bool, scratch: Path) -> dict:
    plan = json.loads((video_dir / "scene_plan.json").read_text())
    words = json.loads(words_path.read_text())
    stills = video_dir / "assets" / "stills"
    clips = video_dir / "assets" / "clips" if use_clips else None
    groups = build_groups(plan, stills, clips, until)
    if not groups:
        raise SystemExit("no scenes with stills")
    total = groups[-1].end if until is None else min(until, groups[-1].end)
    specs = json.loads((video_dir / "overlays.json").read_text()) if (video_dir / "overlays.json").exists() else []
    overlays = resolve_overlays(specs, words, groups, until)
    place_overlays(overlays, width, height)
    sfx = plan_sfx(groups, overlays, video_dir / "assets" / "sfx", until)

    scratch.mkdir(parents=True, exist_ok=True)
    sources = [Source(g, width, height, scratch, i) for i, g in enumerate(groups)]
    video_only = scratch / "video_only.mp4"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}",
           "-r", str(fps), "-i", "-", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "19", "-pix_fmt", "yuv420p",
           str(video_only)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    nframes = int(math.ceil(total * fps))
    gi = 0
    for f in range(nframes):
        t = f / fps
        while gi + 1 < len(groups) and t >= groups[gi + 1].start:
            gi += 1
        frame = sources[gi].frame(t).copy()
        for ov in overlays:
            if ov.start <= t < ov.end:
                a, frac = overlay_alpha(ov, t)
                if a > 0:
                    composite(frame, ov, a, frac)
        proc.stdin.write(frame.tobytes())
        if f % (fps * 10) == 0:
            print(f"  {t:6.1f}s / {total:.1f}s", file=sys.stderr)
    proc.stdin.close()
    if proc.wait() != 0:
        raise SystemExit("video encode failed")

    audio = scratch / "mix.wav"
    mix_audio(narration, music, sfx, total, audio, music_gain_db)
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video_only), "-i", str(audio), "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", str(out)], check=True)
    srt = video_dir / "captions" / (out.stem + ".srt")
    srt.parent.mkdir(parents=True, exist_ok=True)
    write_srt(srt_cues(words, until), srt)
    return {"out": str(out), "srt": str(srt), "seconds": total, "groups": len(groups),
            "clips": sum(1 for g in groups if g.clip), "overlays": len(overlays), "sfx": len(sfx)}


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("video_dir", type=Path)
    p.add_argument("--narration", type=Path, required=True)
    p.add_argument("--words", type=Path, required=True)
    p.add_argument("-o", "--out", type=Path, required=True)
    p.add_argument("--until", type=float, default=None)
    p.add_argument("--size", default="1920x1080")
    p.add_argument("--fps", type=int, default=30)
    p.add_argument("--music", type=Path, action="append", default=[], help="music cue(s), played in order and looped")
    p.add_argument("--music-gain-db", type=float, default=-24.0)
    p.add_argument("--no-clips", action="store_true", help="ignore assets/clips (stills only)")
    p.add_argument("--scratch", type=Path, default=Path(tempfile.gettempdir()) / "fc-compose")
    a = p.parse_args()
    w, h = (int(v) for v in a.size.split("x"))
    info = render(a.video_dir, narration=a.narration, words_path=a.words, out=a.out, until=a.until, width=w, height=h,
                  fps=a.fps, music=a.music, music_gain_db=a.music_gain_db, use_clips=not a.no_clips, scratch=a.scratch)
    print(json.dumps(info, indent=1))


if __name__ == "__main__":
    main()
