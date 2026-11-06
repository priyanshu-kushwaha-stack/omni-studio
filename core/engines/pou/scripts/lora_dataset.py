#!/usr/bin/env python3
"""Build a style-LoRA dataset from the style refs and a video's approved stills.
Each image is copied (long side 1024) next to a caption file. Captions start with the style trigger
`pous_ink`, add `pous_you` when the recurring satchel figure is in the frame, then the content line and the
accent colour, so the LoRA learns the look without baking one colour in."""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

from PIL import Image

STYLE_TRIGGER = "pous_ink"
FIGURE_TRIGGER = "pous_you"
FIGURE_WORDS = re.compile(r"\"you\"|\byou figure\b|model sheet|model-sheet|satchel", re.I)
REF_NOTES = {
    "model-sheet-you": "model sheet of the recurring stick figure with a small satchel, front, side and walking poses",
}


def caption(desc: str, accent: str, figure: bool | None = None) -> str:
    desc = re.sub(r"\(.*?\)", "", desc).strip().rstrip(";").strip()
    desc = re.sub(r"\s+", " ", desc)
    if figure is None:
        figure = bool(FIGURE_WORDS.search(desc))
    parts = [STYLE_TRIGGER]
    if figure:
        parts.append(FIGURE_TRIGGER)
    parts.append(desc.replace('"', ""))
    parts.append(f"{accent} accents, black marker line on cream paper")
    return ", ".join(parts)


def _copy(src: Path, dst: Path, long_side: int = 1024) -> None:
    im = Image.open(src).convert("RGB")
    s = long_side / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(dst)


def build(refs: Path, stills: Path, plan: Path, out: Path, accent: str = "ochre") -> list[tuple[Path, str]]:
    out.mkdir(parents=True, exist_ok=True)
    descs = {s["id"]: s.get("description", "") for s in json.loads(Path(plan).read_text())["scenes"]}
    pairs: list[tuple[Path, str]] = []
    n = 0
    for src in sorted(Path(refs).glob("*.png")):
        n += 1
        note = REF_NOTES.get(src.stem, f"style reference {src.stem}: a hand-drawn scene in the channel look")
        cap = caption(note, accent, figure=src.stem in REF_NOTES)
        dst = out / f"{n:03d}.png"
        _copy(src, dst)
        dst.with_suffix(".txt").write_text(cap)
        pairs.append((dst, cap))
    for src in sorted(Path(stills).glob("s*.png")):
        if src.stem not in descs:
            continue
        n += 1
        cap = caption(descs[src.stem], accent)
        dst = out / f"{n:03d}.png"
        _copy(src, dst)
        dst.with_suffix(".txt").write_text(cap)
        pairs.append((dst, cap))
    return pairs


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--refs", type=Path, default=Path("channel/style_refs"))
    p.add_argument("--stills", type=Path, required=True)
    p.add_argument("--plan", type=Path, required=True)
    p.add_argument("--accent", default="ochre")
    p.add_argument("-o", "--out", type=Path, default=Path("channel/lora/dataset"))
    a = p.parse_args()
    pairs = build(a.refs, a.stills, a.plan, a.out, a.accent)
    print(f"{len(pairs)} images -> {a.out}")


if __name__ == "__main__":
    main()
