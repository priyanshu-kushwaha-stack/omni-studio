import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import timewarp  # noqa: E402


def _audio():
    """stitch needs soundfile, which lives in .venv-media only (the core .venv skips these tests)."""
    np = pytest.importorskip("numpy")
    sf = pytest.importorskip("soundfile")
    import stitch

    return np, sf, stitch


def tone(path: Path, secs: float) -> Path:
    np, sf, _ = _audio()
    t = np.arange(int(secs * 44100)) / 44100
    sf.write(path, 0.5 * np.sin(2 * np.pi * 220 * t), 44100)
    return path


def test_stitch_places_lines_with_gaps_and_fades(tmp_path):
    np, sf, stitch = _audio()
    takes = [("n1", tone(tmp_path / "a.wav", 1.0), 0.25), ("k1", tone(tmp_path / "b.wav", 0.5), 1.2)]
    cues = stitch.stitch(takes, tmp_path / "t.wav", tmp_path / "c.json")
    assert cues["cues"][0] == {"line": "n1", "start": 0.4, "end": 1.4}
    assert cues["cues"][1]["start"] == pytest.approx(1.65)
    y, sr = sf.read(tmp_path / "t.wav")
    assert sr == 44100 and abs(np.abs(y).max() - 10 ** (-1 / 20)) < 1e-3
    i = int(0.4 * sr)
    assert abs(y[i]) < 0.01  # faded edge, no click
    assert json.loads((tmp_path / "c.json").read_text()) == cues


def test_gap_after_defaults():
    _, _, stitch = _audio()
    assert stitch.gap_after("Hi.", "narrator", False) == 0.25
    assert stitch.gap_after("Hi.", "kenji", False) == 0.30
    assert stitch.gap_after("Well...", "kenji", False) == 0.6
    assert stitch.gap_after("End.", "narrator", True) == 1.2


def test_timewarp_maps_line_edges_both_ways():
    old = {"cues": [{"line": "a", "start": 0.4, "end": 3.5}, {"line": "b", "start": 3.8, "end": 4.6}]}
    new = {"cues": [{"line": "a", "start": 0.4, "end": 4.0}, {"line": "b", "start": 4.3, "end": 5.2}]}
    k = timewarp.knots(old, new, old_end=6.0)
    assert timewarp.warp(3.5, k) == pytest.approx(4.0)
    assert abs(timewarp.unwarp(timewarp.warp(2.0, k), k) - 2.0) < 1e-9
    assert timewarp.warp(6.0, k) == pytest.approx(5.2 + (6.0 - 4.6))
