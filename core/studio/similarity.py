"""Similarity check: catch reused or near-duplicate content across channels and within a channel.

A video is compared against every video of every other channel and the channel's own most recent videos, on:
- title     difflib ratio and word Jaccard of the normalised titles;
- script    Jaccard of 5-word shingles of the spoken text (cues, headings and claim ids removed);
- thumbnail 64-bit difference hash (dHash), Hamming distance;
- frames    one frame every `frame_every_s` seconds, dHash each; the share of this video's frames that have a
            near match in the other video.
Thresholds are in core/studio/config/similarity.yaml.

OpenMontage's lib/variation_checker.py scores repetition *inside one scene plan* (shot sizes, camera moves,
generic phrases); it has no notion of comparing two videos, so it is not reused here.
"""

from __future__ import annotations

import difflib
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import yaml

from studio import channels
from studio.claims import CITE_RE, spoken_lines

CONFIG = Path(__file__).resolve().parent / "config" / "similarity.yaml"
THUMB_NAMES = ("thumbnail.png", "thumbnail.jpg", "thumbnail.jpeg", "thumbnail.webp")


def load_config(path: Path = CONFIG) -> dict[str, Any]:
    data = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    need = {"same_channel_recent", "frame_every_s", "max_frames", "title_ratio", "script_jaccard",
            "thumbnail_hamming", "frame_hamming", "frame_match_share"}
    missing = need - set(data or {})
    if missing:
        raise ValueError(f"{path}: missing {sorted(missing)}")
    return data


# --- features ---


@dataclass
class Features:
    channel: str
    video: str
    title: Optional[str]
    shingles: set[tuple[str, ...]]
    thumbnail: Optional[int]
    frames: list[int]


def _norm_words(text: str) -> list[str]:
    return re.findall(r"[a-z0-9']+", text.lower())


def title_of(video_dir: Path) -> Optional[str]:
    upload = video_dir / "upload.yaml"
    if upload.is_file():
        data = yaml.safe_load(upload.read_text(encoding="utf-8")) or {}
        if data.get("title"):
            return str(data["title"])
    publish = video_dir / "publish.md"
    if publish.is_file():
        m = re.search(r"^title:\s*(.+)$", publish.read_text(encoding="utf-8"), re.M)
        if m:
            return m.group(1).strip()
    marker = video_dir / "project.json"
    if marker.is_file():
        import json

        return json.loads(marker.read_text(encoding="utf-8")).get("title")
    return None


def shingles(script_text: str, n: int = 5) -> set[tuple[str, ...]]:
    words = _norm_words(" ".join(CITE_RE.sub("", t) for _, t in spoken_lines(script_text)))
    return {tuple(words[i:i + n]) for i in range(max(0, len(words) - n + 1))}


def _dhash_gray(pixels: bytes) -> int:
    """dHash of a 9x8 greyscale image: 64 bits, one per horizontal neighbour pair."""
    bits = 0
    for row in range(8):
        for col in range(8):
            bits = (bits << 1) | (pixels[row * 9 + col] > pixels[row * 9 + col + 1])
    return bits


def image_hash(path: Path) -> int:
    from PIL import Image

    with Image.open(path) as img:
        return _dhash_gray(img.convert("L").resize((9, 8), Image.LANCZOS).tobytes())


def frame_hashes(media: Path, every_s: float, max_frames: int) -> list[int]:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(media), "-vf", f"fps=1/{every_s},scale=9:8,format=gray",
         "-frames:v", str(max_frames), "-f", "rawvideo", "-"],
        capture_output=True, check=True,
    ).stdout
    return [_dhash_gray(raw[i:i + 72]) for i in range(0, len(raw) - 71, 72)]


def render_of(video_dir: Path) -> Optional[Path]:
    upload = video_dir / "upload.yaml"
    if upload.is_file():
        data = yaml.safe_load(upload.read_text(encoding="utf-8")) or {}
        if data.get("file") and (video_dir / data["file"]).is_file():
            return video_dir / data["file"]
    renders = sorted((video_dir / "renders").glob("*.mp4"), key=lambda p: p.stat().st_mtime)
    return renders[-1] if renders else None


def features(channel: str, video_dir: Path, cfg: dict[str, Any], media: Optional[Path] = None) -> Features:
    script = video_dir / "script.md"
    thumb = next((video_dir / n for n in THUMB_NAMES if (video_dir / n).is_file()), None)
    media = media or render_of(video_dir)
    return Features(
        channel=channel,
        video=video_dir.name,
        title=title_of(video_dir),
        shingles=shingles(script.read_text(encoding="utf-8")) if script.is_file() else set(),
        thumbnail=image_hash(thumb) if thumb else None,
        frames=frame_hashes(media, cfg["frame_every_s"], cfg["max_frames"]) if media else [],
    )


# --- comparison ---


def _hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def compare(a: Features, b: Features, cfg: dict[str, Any]) -> list[str]:
    hits = []
    if a.title and b.title:
        wa, wb = set(_norm_words(a.title)), set(_norm_words(b.title))
        ratio = difflib.SequenceMatcher(None, " ".join(_norm_words(a.title)), " ".join(_norm_words(b.title))).ratio()
        jac = len(wa & wb) / len(wa | wb) if wa | wb else 0.0
        if max(ratio, jac) >= cfg["title_ratio"]:
            hits.append(f"title {max(ratio, jac):.2f} >= {cfg['title_ratio']}: {a.title!r} vs {b.title!r}")
    if a.shingles and b.shingles:
        jac = len(a.shingles & b.shingles) / len(a.shingles | b.shingles)
        if jac >= cfg["script_jaccard"]:
            hits.append(f"script 5-word shingle Jaccard {jac:.2f} >= {cfg['script_jaccard']}")
    if a.thumbnail is not None and b.thumbnail is not None:
        d = _hamming(a.thumbnail, b.thumbnail)
        if d <= cfg["thumbnail_hamming"]:
            hits.append(f"thumbnail dHash distance {d} <= {cfg['thumbnail_hamming']}")
    if a.frames and b.frames:
        matched = sum(1 for h in a.frames if min(_hamming(h, o) for o in b.frames) <= cfg["frame_hamming"])
        share = matched / len(a.frames)
        if share >= cfg["frame_match_share"]:
            hits.append(f"frames {matched}/{len(a.frames)} ({share:.0%}) have a near match "
                        f"(dHash <= {cfg['frame_hamming']}); want < {cfg['frame_match_share']:.0%}")
    return hits


def corpus(channel_slug: str, video_id: str, cfg: dict[str, Any]) -> list[tuple[str, Path]]:
    """Every video of every other channel, plus this channel's `same_channel_recent` latest others."""
    out = []
    for slug in channels.list_slugs():
        folder = channels.channels_dir() / slug / "videos"
        if not folder.is_dir():
            continue
        videos = sorted((p for p in folder.iterdir() if p.is_dir() and channels.VIDEO_ID_RE.fullmatch(p.name)),
                        key=lambda p: p.name)
        if slug == channel_slug:
            others = [p for p in videos if p.name != video_id]
            keep = max(0, int(cfg["same_channel_recent"]))
            videos = others[len(others) - keep:] if keep else []
        out += [(slug, p) for p in videos]
    return out


def check(channel_slug: str, video_id: str, media: Optional[Path] = None,
          cfg: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    cfg = cfg or load_config()
    channel = channels.load_channel(channel_slug)
    mine = features(channel_slug, channels.video_dir(channel, video_id), cfg, media)
    problems, compared = [], 0
    for slug, other_dir in corpus(channel_slug, video_id, cfg):
        compared += 1
        for hit in compare(mine, features(slug, other_dir, cfg), cfg):
            scope = "same channel" if slug == channel_slug else "other channel"
            problems.append(f"near-duplicate of {slug}/{other_dir.name} ({scope}): {hit}")
    return {"check": "similarity", "ok": not problems, "compared": compared, "problems": problems,
            "features": {"title": mine.title, "shingles": len(mine.shingles),
                         "thumbnail": mine.thumbnail is not None, "frames": len(mine.frames)}}
