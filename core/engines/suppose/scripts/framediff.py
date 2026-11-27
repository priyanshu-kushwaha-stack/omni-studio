"""Mean absolute difference between same-named PNG frames (spec: rebuilding the pilot in the kit).

python framediff.py <a_dir> <b_dir> <threshold>   -> prints each frame's number, exit 1 above threshold, 2 on a size mismatch
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image


class SizeMismatch(ValueError):
    pass


def load_rgb(p: Path) -> Image.Image:
    """RGB image; transparency is composited onto neutral mid-grey so it never reads as black."""
    im = Image.open(p)
    if im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
        base = Image.new("RGBA", im.size, (128, 128, 128, 255))
        return Image.alpha_composite(base, im).convert("RGB")
    return im.convert("RGB")


def _load(p: Path) -> np.ndarray:
    return np.asarray(load_rgb(p), dtype=np.float64)


def mean_abs_diff(a: Path, b: Path) -> float:
    """Mean absolute RGB difference on a 0-255 scale; the two frames must be the same size."""
    x, y = _load(a), _load(b)
    if x.shape != y.shape:
        raise SizeMismatch(
            f"{Path(a).name} is {x.shape[1]}x{x.shape[0]} but {Path(b).name} is {y.shape[1]}x{y.shape[0]}"
        )
    return float(np.abs(x - y).mean())


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: framediff.py <a_dir> <b_dir> <threshold>", file=sys.stderr)
        return 2
    a_dir, b_dir, threshold = Path(argv[0]), Path(argv[1]), float(argv[2])
    names = sorted(p.name for p in a_dir.glob("*.png") if (b_dir / p.name).is_file())
    if not names:
        print("framediff: no same-named PNG frames in both folders", file=sys.stderr)
        return 2
    worst = 0.0
    for name in names:
        try:
            d = mean_abs_diff(a_dir / name, b_dir / name)
        except SizeMismatch as e:
            print(f"framediff: frame sizes differ, refusing to compare: {e}", file=sys.stderr)
            return 2
        worst = max(worst, d)
        print(f"{name}: {d:.3f}{'  OVER' if d > threshold else ''}")
    print(f"worst {worst:.3f} (threshold {threshold})")
    return 1 if worst > threshold else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
