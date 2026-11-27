"""Rig a character from its sliced parts sheet into the channel's cast library (the pilot's rig4.py, generalised:
a map file per character replaces the hard-coded cast). Faces and shoulders are measured, never overridden: on the
pilot's sheets the measurement reproduces castV4.ts exactly (test_seeded_cast_matches_the_pilot).

python rig.py <library_dir>   (maps in <library_dir>/cast/maps/*.yaml, pieces in <library_dir>/cast/pieces/)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import yaml
from PIL import Image

NAMES = ["head", "torso", "uarmL", "farmL", "uarmR", "farmR", "thighL", "shinL", "thighR", "shinR"]


def face(head: Image.Image) -> list[float]:
    """Face centre (x, y as fractions of the head) and width fraction, from the skin colour of the neck."""
    a = np.array(head.convert("RGBA")).astype(float)
    h, w = a.shape[:2]
    neck = a[int(h * 0.9) : int(h * 0.97), int(w * 0.42) : int(w * 0.58)]
    neck = neck[neck[..., 3] > 200][:, :3]
    if not len(neck):
        return [0.5, 0.6, 0.5]
    d = np.abs(a[..., :3] - np.median(neck, axis=0)).sum(axis=2)
    m = (d < 60) & (a[..., 3] > 200)
    m[int(h * 0.8) :] = False
    ys, xs = np.nonzero(m)
    if not len(xs):
        return [0.5, 0.6, 0.5]
    return [
        round(xs.mean() / w, 3),
        round(ys.mean() / h, 3),
        round((np.percentile(xs, 95) - np.percentile(xs, 5)) / w, 3),
    ]


def shoulders(torso: Image.Image) -> list[float]:
    al = np.array(torso.convert("RGBA"))[..., 3]
    h, w = al.shape
    row = np.nonzero(al[int(h * 0.2)] > 128)[0]
    return [round(row.min() / w, 3), round(row.max() / w, 3)] if len(row) else [0.13, 0.87]


def piece(pieces: Path, prefix: str, ref, char: str, part: str) -> tuple[str, Image.Image]:
    if isinstance(ref, int):
        return f"cast/pieces/{prefix}_{ref}.png", Image.open(pieces / f"{prefix}_{ref}.png")
    k = int("".join(c for c in str(ref) if c.isdigit()))
    im = Image.open(pieces / f"{prefix}_{k}.png")
    im = (
        im.crop((0, 0, im.width, int(im.height * 0.52)))
        if str(ref).endswith("top")
        else im.transpose(Image.FLIP_LEFT_RIGHT)
    )
    name = f"{char}_{part}.png"
    im.save(pieces / name)
    return f"cast/pieces/{name}", im


def rig_character(map_path: Path, pieces: Path) -> dict:
    m = yaml.safe_load(Path(map_path).read_text(encoding="utf-8"))
    entry: dict = {}
    ims: dict[str, Image.Image] = {}
    for part, ref in zip(NAMES, m["pieces"], strict=True):
        src, im = piece(pieces, m["sheet"], ref, m["id"], part)
        ims[part] = im
        entry[part] = {"src": src, "w": im.width, "h": im.height}
    hip = float(m["hip"])
    entry.update(
        hip=hip,
        sh=shoulders(ims["torso"]),
        face=face(ims["head"]),
        roles=m.get("roles", []),
        signature=m.get("signature", ""),
        voice=m.get("voice"),
    )
    entry["height"] = (
        entry["thighL"]["h"] * 0.86 + entry["shinL"]["h"] * 0.95 + entry["torso"]["h"] * hip + entry["head"]["h"] * 0.95
    )
    return entry


def main(library_dir: str) -> None:
    lib = Path(library_dir)
    cast = {}
    for mp in sorted((lib / "cast" / "maps").glob("*.yaml")):
        cid = yaml.safe_load(mp.read_text())["id"]
        cast[cid] = rig_character(mp, lib / "cast" / "pieces")
    (lib / "cast" / "cast.json").write_text(json.dumps(cast, indent=1) + "\n")
    print(f"{len(cast)} characters -> {lib / 'cast' / 'cast.json'}")


if __name__ == "__main__":
    main(sys.argv[1])
