"""Rig a character from its sliced parts sheet into the channel's cast library (the pilot's rig4.py, generalised:
a map file per character replaces the hard-coded cast). Faces and shoulders are measured, never overridden: on the
pilot's sheets the measurement reproduces castV4.ts exactly (test_seeded_cast_matches_the_pilot).

python rig.py <library_dir> [--pieces <dir>]
    maps in <library_dir>/cast/maps/*.yaml, pieces in <library_dir>/cast/pieces/ unless --pieces names another folder
    (the channel library's pieces live in the main checkout: `library.media_root(slug)/cast/pieces`). Each map's
    optional `voice: {desc, seed}` is carried into cast.json.
python rig.py --check <library_or_art_dir> <id> <out.png>
    one PNG: the character's ten pieces with their names, and an assembled rest pose (every piece at its joint, as
    the kit's Person.tsx places it) to look at before animating. The dir holds cast/cast.json and cast/pieces/.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import yaml
from PIL import Image, ImageDraw

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


CELL_W, CELL_H, CHECK_W, POSE_H = 132, 220, 1320, 640
CHECK_H = CELL_H + POSE_H


def _paste(canvas: Image.Image, im: Image.Image, size: tuple[float, float], pivot, at, scale: float, org) -> tuple:
    """Draw `im` (resized to `size`) so its pivot sits at `at` in its parent's frame (parent top-left `org`).
    Returns this piece's top-left, the origin for its children."""
    w, h = max(1, round(size[0] * scale)), max(1, round(size[1] * scale))
    left, top = org[0] + (at[0] - pivot[0]) * scale, org[1] + (at[1] - pivot[1]) * scale
    canvas.alpha_composite(im.convert("RGBA").resize((w, h)), (round(left), round(top)))
    return left, top


def _rest_pose(canvas: Image.Image, e: dict, ims: dict, scale: float, org: tuple) -> None:
    """The kit's joints (Person.tsx `joints`, rest pose: no rotation), pieces drawn back to front."""
    sz = {n: (e[n]["w"], e[n]["h"]) for n in NAMES}
    tw, th = sz["torso"]
    hy, off = th * e["hip"], sz["thighL"][0] * 0.5
    hip_y = hy - sz["thighL"][1] * 0.06
    reach = (hy - sz["thighL"][1] * 0.06 + sz["thighL"][1] * 0.12 - th * 0.16) * 1.44
    k = min(1.25, reach / (sz["uarmL"][1] * 0.86 + sz["farmL"][1] * 0.93))
    kw = min(1.0, max(k, 0.8))
    for side, x in (("R", tw / 2 + off), ("L", tw / 2 - off)):
        t, s = f"thigh{side}", f"shin{side}"
        tl = _paste(canvas, ims[t], sz[t], (sz[t][0] / 2, sz[t][1] * 0.08), (x, hip_y), scale, org)
        _paste(canvas, ims[s], sz[s], (sz[s][0] * 0.5, sz[s][1] * 0.05), (sz[t][0] / 2, sz[t][1] * 0.93), scale, tl)
    _paste(canvas, ims["torso"], sz["torso"], (0, 0), (0, 0), scale, org)
    for side, sx in (
        ("L", tw * e["sh"][0] + sz["uarmL"][0] * kw * 0.32),
        ("R", tw * e["sh"][1] - sz["uarmR"][0] * kw * 0.32),
    ):
        u, f = f"uarm{side}", f"farm{side}"
        ua = (sz[u][0] * kw, sz[u][1] * k)
        fa = (sz[f][0] * kw, sz[f][1] * k)
        tl = _paste(canvas, ims[u], ua, (ua[0] / 2, ua[1] * 0.12), (sx, th * 0.16), scale, org)
        _paste(canvas, ims[f], fa, (fa[0] / 2, fa[1] * 0.07), (ua[0] / 2, ua[1] * 0.86), scale, tl)
    hw, hh = sz["head"]
    _paste(canvas, ims["head"], sz["head"], (hw / 2, hh * 0.95), (tw / 2, th * 0.05), scale, org)


def check_sheet(root: Path, char: str, out: Path) -> Path:
    """Ten pieces with names above an assembled rest pose, on one PNG of CHECK_W x CHECK_H."""
    root = Path(root)
    cast = json.loads((root / "cast" / "cast.json").read_text())
    if char not in cast:
        raise SystemExit(f"no character {char!r} in {root / 'cast' / 'cast.json'} (have {sorted(cast)})")
    e = cast[char]
    ims = {n: Image.open(root / e[n]["src"]).convert("RGBA") for n in NAMES}
    canvas = Image.new("RGBA", (CHECK_W, CHECK_H), (245, 242, 235, 255))
    draw = ImageDraw.Draw(canvas)
    for i, n in enumerate(NAMES):
        im = ims[n]
        r = min((CELL_W - 12) / im.width, (CELL_H - 36) / im.height)
        thumb = im.resize((max(1, round(im.width * r)), max(1, round(im.height * r))))
        canvas.alpha_composite(thumb, (i * CELL_W + (CELL_W - thumb.width) // 2, 28))
        draw.text((i * CELL_W + 6, 8), n, fill=(30, 30, 30, 255))
    height = e["thighL"]["h"] * 0.86 + e["shinL"]["h"] * 0.95 + e["torso"]["h"] * e["hip"] + e["head"]["h"] * 0.95
    scale = (POSE_H - 40) / (height * 1.1)
    org = (CHECK_W / 2 - e["torso"]["w"] * scale / 2, CELL_H + 20 + e["head"]["h"] * 0.95 * scale)
    _rest_pose(canvas, e, ims, scale, org)
    draw.text((8, CELL_H + 6), f"{char}: rest pose", fill=(30, 30, 30, 255))
    canvas.convert("RGB").save(out)
    return Path(out)


def main(library_dir: str, pieces_dir: str | None = None) -> None:
    lib = Path(library_dir)
    pieces = Path(pieces_dir) if pieces_dir else lib / "cast" / "pieces"
    cast = {}
    for mp in sorted((lib / "cast" / "maps").glob("*.yaml")):
        cid = yaml.safe_load(mp.read_text())["id"]
        cast[cid] = rig_character(mp, pieces)
    (lib / "cast" / "cast.json").write_text(json.dumps(cast, indent=1) + "\n")
    print(f"{len(cast)} characters -> {lib / 'cast' / 'cast.json'}")


if __name__ == "__main__":
    if sys.argv[1] == "--check":
        print(check_sheet(Path(sys.argv[2]), sys.argv[3], Path(sys.argv[4])))
    else:
        main(sys.argv[1], sys.argv[sys.argv.index("--pieces") + 1] if "--pieces" in sys.argv else None)
