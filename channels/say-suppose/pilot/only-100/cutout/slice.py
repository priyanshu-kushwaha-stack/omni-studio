"""Cut a GPT Image parts sheet into separate transparent PNG pieces.

Usage: python slice.py <sheet.png> <out_dir> <prefix>

White-background sheets are keyed by distance from white; sheets that already carry alpha keep it, with the faint
glow halo (alpha < 100) dropped. Each connected blob bigger than 2000 px becomes <prefix>_<n>.png, numbered in reading
order (top row left to right, then the next row). pieces.json records each piece's crop box in sheet pixels.
"""

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


def alpha_of(img: Image.Image) -> np.ndarray:
    a = np.array(img.convert("RGBA")).astype(np.float32)
    if a[..., 3].min() < 250:  # the sheet already has transparency
        al = a[..., 3]
        al[al < 100] = 0
        return al
    dist = 255 - a[..., :3].min(axis=2)  # 0 on pure white
    return np.clip((dist - 12) * 8, 0, 255)


def main(sheet: str, out_dir: str, prefix: str) -> None:
    img = Image.open(sheet).convert("RGBA")
    al = alpha_of(img)
    mask = ndimage.binary_opening(al > 128, iterations=2)
    labels, n = ndimage.label(mask)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(labels), start=1):
        if (labels[sl] == i).sum() < 2000:
            continue
        boxes.append((sl, i))
    rows = sorted(boxes, key=lambda b: (b[0][0].start // 300, b[0][1].start))
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    rgba = np.array(img)
    meta = []
    for k, (sl, i) in enumerate(rows):
        y0, y1 = max(sl[0].start - 6, 0), sl[0].stop + 6
        x0, x1 = max(sl[1].start - 6, 0), sl[1].stop + 6
        piece = rgba[y0:y1, x0:x1].copy()
        keep = ndimage.binary_dilation(labels[y0:y1, x0:x1] == i, iterations=3)
        piece[..., 3] = (al[y0:y1, x0:x1] * keep).astype(np.uint8)
        name = f"{prefix}_{k}.png"
        Image.fromarray(piece).save(out / name)
        meta.append({"name": name, "box": [int(x0), int(y0), int(x1), int(y1)]})
    (out / f"{prefix}_pieces.json").write_text(json.dumps(meta, indent=1))
    print(f"{len(meta)} pieces -> {out}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
