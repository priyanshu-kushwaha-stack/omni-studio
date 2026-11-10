import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import motion  # noqa: E402

PAPER = (0xF6, 0xF1, 0xE7)
INK = (0x2B, 0x2B, 0x2B)
OCHRE = (0xD9, 0xA4, 0x41)


def _still():
    im = Image.new("RGB", (160, 90), PAPER)
    d = ImageDraw.Draw(im)
    d.line((10, 80, 150, 10), fill=INK, width=3)  # an ink stroke
    d.ellipse((60, 30, 90, 60), fill=OCHRE)  # an accent blob (fire)
    return np.asarray(im)


def test_masks_separate_ink_and_accent():
    f = _still()
    ink, acc = motion.masks(f, PAPER)
    assert ink[80, 10] or ink[79, 11]
    assert acc[45, 75] and not ink[45, 75]
    assert not ink[5, 5] and not acc[5, 5]


def test_boil_moves_ink_but_keeps_paper_and_changes_on_threes():
    f = _still()
    ink, _ = motion.masks(f, PAPER)
    a = motion.boil(f, ink, t=0.00)
    b = motion.boil(f, ink, t=0.05)  # same step
    c = motion.boil(f, ink, t=0.12)  # next step
    assert np.array_equal(a, b)
    assert not np.array_equal(a, c)
    assert tuple(a[5, 5]) == PAPER
    changed = (a != f).any(axis=2)
    assert 0 < changed.sum() < ink.sum() * 4  # displacement stays local to the stroke
    assert tuple(a[45, 75]) == OCHRE  # accent untouched


def test_flicker_changes_only_accent_pixels():
    f = _still()
    ink, acc = motion.masks(f, PAPER)
    g = motion.flicker(f, acc, t=0.3)
    changed = (g != f).any(axis=2)
    assert changed[acc].mean() > 0.5
    far = ~acc & ~ink
    far[25:65, 55:95] = False  # allow the 1 px breathing ring around the blob
    assert not changed[far].any()


def test_sprite_moves_the_cutout_and_leaves_paper_behind():
    f = _still()
    g = motion.sprite(f, box=(5, 70, 25, 85), path=[(0, 0), (100, -50)], t=1.0, duration=1.0, paper=PAPER)
    assert tuple(g[80, 10]) == PAPER  # origin is paper now
    assert (g[20:40, 100:130] != np.array(PAPER)).any()  # ink landed near the end of the path


def test_trace_order_runs_along_the_stroke():
    f = _still()
    ink, _ = motion.masks(f, PAPER)
    order = motion.trace_order(ink)
    assert order.shape == ink.shape and order[~ink].min() == 1.0
    on = order[ink]
    assert on.min() < 0.05 and on.max() > 0.95
