import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import timewarp  # noqa: E402


def _audio():
    """numpy, scipy's wavfile and the stitch module (all in the core .venv)."""
    import numpy as np
    from scipy.io import wavfile

    import stitch

    return np, wavfile, stitch


def tone(path: Path, secs: float) -> Path:
    np, wavfile, _ = _audio()
    t = np.arange(int(secs * 44100)) / 44100
    wavfile.write(path, 44100, (0.5 * np.sin(2 * np.pi * 220 * t)).astype("float32"))
    return path


def test_stitch_places_lines_with_gaps_and_fades(tmp_path):
    np, wavfile, stitch = _audio()
    takes = [("n1", tone(tmp_path / "a.wav", 1.0), 0.25), ("k1", tone(tmp_path / "b.wav", 0.5), 1.2)]
    cues = stitch.stitch(takes, tmp_path / "t.wav", tmp_path / "c.json")
    assert cues["cues"][0] == {"line": "n1", "start": 0.4, "end": 1.4}
    assert cues["cues"][1]["start"] == pytest.approx(1.65)
    sr, y = wavfile.read(tmp_path / "t.wav")
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


def small_film() -> dict:
    return {
        "film": "x",
        "duration": 6.0,
        "beats": [{"at": 3.5, "name": "turn"}],
        "shots": [
            {
                "id": "s1",
                "from": 0.0,
                "to": 3.5,
                "cast": [{"who": "a", "at": [1, 2], "acts": [{"act": "walk", "at": 0.4, "to": 3.5, "from": [0, 0]}]}],
                "labels": [{"kind": "data", "text": "t", "at": 3.5, "to": 3.8}],
                "lines": [{"who": "k", "at": 0.4}],
                "sfx": [{"name": "whoosh", "at": 3.8, "gain": 0.1}],
            },
            {"id": "s2", "from": 3.5, "to": 6.0, "readout": {"text": "9", "at": 4.6}},
        ],
    }


CUES_B = {"cues": [{"line": "a", "start": 0.4, "end": 3.5}, {"line": "b", "start": 3.8, "end": 4.6}]}
CUES_LUC = {"cues": [{"line": "a", "start": 0.4, "end": 4.0}, {"line": "b", "start": 4.3, "end": 5.2}]}


def test_warp_film_maps_every_time_field_and_leaves_the_rest():
    film = small_film()
    out = timewarp.warp_film(film, timewarp.knots(CUES_B, CUES_LUC, 6.0))
    s1, s2 = out["shots"]
    assert (s1["from"], s1["to"], s2["from"], s2["to"]) == pytest.approx((0.0, 4.0, 4.0, 6.6))
    assert s1["cast"][0]["acts"][0]["at"] == pytest.approx(0.4) and s1["cast"][0]["acts"][0]["to"] == pytest.approx(4.0)
    assert s1["cast"][0]["acts"][0]["from"] == [0, 0] and s1["cast"][0]["at"] == [1, 2]  # positions are not times
    assert s1["labels"][0]["at"] == pytest.approx(4.0) and s1["labels"][0]["to"] == pytest.approx(4.3)
    assert s1["lines"][0]["at"] == pytest.approx(0.4) and s1["sfx"][0]["at"] == pytest.approx(4.3)
    assert s2["readout"]["at"] == pytest.approx(5.2) and out["beats"][0]["at"] == pytest.approx(4.0)
    assert out["duration"] == pytest.approx(6.6) and s1["sfx"][0]["gain"] == 0.1
    assert film["duration"] == 6.0  # the input is not changed


def test_timewarp_cli_writes_film_luc_json(tmp_path):
    video = tmp_path / "v"
    (video / "audio").mkdir(parents=True)
    (video / "film.json").write_text(json.dumps(small_film()))
    (video / "audio" / "cues_b.json").write_text(json.dumps(CUES_B))
    (video / "audio" / "cues_luc.json").write_text(json.dumps(CUES_LUC))
    out = timewarp.main([str(video), "--from", "audio/cues_b.json", "--to", "audio/cues_luc.json"])
    assert out == video / "film-luc.json"
    assert json.loads(out.read_text())["shots"][0]["to"] == pytest.approx(4.0)
    assert json.loads((video / "film.json").read_text())["duration"] == 6.0


def test_warp_film_moves_the_shake_impact():
    old = {"cues": [{"line": "a", "start": 0.4, "end": 3.5}]}
    new = {"cues": [{"line": "a", "start": 0.4, "end": 4.0}]}
    k = timewarp.knots(old, new, old_end=5.0)
    film = {"duration": 5.0, "beats": [], "shots": [{"from": 0, "to": 5.0, "camera": {"move": "shake", "at": 3.5}}]}
    assert timewarp.warp_film(film, k)["shots"][0]["camera"]["at"] == 4.0
