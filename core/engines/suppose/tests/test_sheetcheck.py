import sys
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import sheetcheck as chk  # noqa: E402

LIB = SimpleNamespace(
    cast={"scarf": {}, "kenji": {}},
    sets={"station": {"angles": {"wide": {"bounds": {"zmax": 2.0}}, "high": {"bounds": {"zmax": 2.0}}}}},
    props={"rice": {}},
)
WORDS = [{"word": " three", "start": 6.1, "end": 6.3}, {"word": " million", "start": 6.4, "end": 6.7}]


def shot(i, a, b, **kw):
    base = {
        "id": f"s{i}",
        "from": a,
        "to": b,
        "type": "wide",
        "set": "station",
        "angle": "wide",
        "camera": {"move": "drift"},
        "cast": [{"who": "scarf", "at": [640, 600], "acts": [{"act": "idle"}]}],
    }
    base.update(kw)
    return base


def sheet(*shots, beats=()):
    return {"film": "t", "fps": 30, "size": [1280, 720], "beats": list(beats), "shots": list(shots)}


def test_a_clean_sheet_passes():
    s = sheet(shot(1, 0, 3, type="wide"), shot(2, 3, 6, type="face"))
    fails, warns = chk.check(s, LIB, [])
    assert fails == []


def test_unknown_references_fail():
    bad = [
        shot(1, 0, 3, set="moon"),
        shot(1, 0, 3, angle="low"),
        shot(1, 0, 3, type="dolly"),
        shot(1, 0, 3, cast=[{"who": "bob", "at": [0, 0], "acts": [{"act": "idle"}]}]),
        shot(1, 0, 3, cast=[{"who": "scarf", "at": [0, 0], "acts": [{"act": "flip"}]}]),
        shot(1, 0, 3, cast=[{"who": "scarf", "at": [0, 0], "acts": [{"act": "react", "mood": "meh"}]}]),
        shot(1, 0, 3, custom="S9"),
    ]
    for b in bad:
        fails, _ = chk.check(sheet(b), LIB, [])
        assert fails, b


def test_gaps_overlaps_and_no_acting_fail():
    assert chk.check(sheet(shot(1, 0, 3), shot(2, 3.5, 6)), LIB, [])[0]
    assert chk.check(sheet(shot(1, 0, 3), shot(2, 2.5, 6)), LIB, [])[0]
    assert chk.check(sheet(shot(1, 0, 3, cast=[])), LIB, [])[0]


def test_speaker_must_be_in_frame():
    s = sheet(shot(1, 0, 3, lines=[{"who": "kenji", "at": 1.0}]))
    fails, _ = chk.check(s, LIB, [])
    assert any("kenji" in f for f in fails)


def test_warnings_hold_repeat_readout_and_spoken_number():
    long_hold = sheet(shot(1, 0, 7))
    assert any("hold" in w for w in chk.check(long_hold, LIB, [])[1])
    assert not any("hold" in w for w in chk.check(sheet(shot(1, 0, 7, hold="joke")), LIB, [])[1])
    twice = sheet(shot(1, 0, 3), shot(2, 3, 6))
    assert any("same type" in w for w in chk.check(twice, LIB, [])[1])
    off_beat = sheet(shot(1, 0, 3, readout={"text": "99", "at": 1.0}), beats=[{"at": 2.5, "name": "x"}])
    assert any("readout" in w for w in chk.check(off_beat, LIB, [])[1])
    unseen = sheet(shot(1, 0, 4, type="wide"), shot(2, 4, 8, type="face"))
    assert any("three" in w for w in chk.check(unseen, LIB, WORDS)[1])


def test_custom_shots_need_no_set_and_known_customs_pass():
    s = sheet({"id": "s1", "from": 0, "to": 3, "type": "custom", "custom": "S2"})
    assert chk.check(s, LIB, [], customs={"S2"})[0] == []
