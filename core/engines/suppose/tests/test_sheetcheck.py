import json
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
    assert warns == []


def test_renderer_only_optional_fields_pass_silently():
    extras = {
        "labels": [{"kind": "callout", "text": "x", "at": 1, "x": 1, "y": 2, "x2": 3, "y2": 4, "lx": 5, "ly": 6}],
        "rim": True,
        "atmosphere": "dust",
        "letterbox": "scope",
        "mood": "cool",
        "badge": "FREEZE",
        "text": "hello",
    }
    s = sheet(shot(1, 0, 3, **extras), shot(2, 3, 6, type="freeze", badge="B"), shot(3, 6, 9, type="title", text="T"))
    assert chk.check(s, LIB, []) == ([], [])


def test_unknown_references_fail():
    bad = [
        (shot(1, 0, 3, set="moon"), "unknown set"),
        (shot(1, 0, 3, angle="low"), "no angle"),
        (shot(1, 0, 3, type="dolly"), "unknown type"),
        (shot(1, 0, 3, cast=[{"who": "bob", "at": [0, 0], "acts": [{"act": "idle"}]}]), "unknown character"),
        (shot(1, 0, 3, cast=[{"who": "scarf", "at": [0, 0], "acts": [{"act": "flip"}]}]), "unknown action"),
        (
            shot(1, 0, 3, cast=[{"who": "scarf", "at": [0, 0], "acts": [{"act": "react", "mood": "meh"}]}]),
            "unknown mood",
        ),
        (shot(1, 0, 3, custom="S9"), "unknown custom"),
    ]
    for b, msg in bad:
        fails, _ = chk.check(sheet(b), LIB, [])
        assert any(msg in f for f in fails), (b, fails)


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


def test_any_type_with_a_custom_name_needs_no_set():
    s = sheet({"id": "s1", "from": 0, "to": 3, "type": "wide", "custom": "S2"})
    assert chk.check(s, LIB, [], customs={"S2"})[0] == []


def test_custom_type_without_a_name_fails():
    s = sheet({"id": "s1", "from": 0, "to": 3, "type": "custom"})
    assert any("custom" in f for f in chk.check(s, LIB, [])[0])


def test_structural_fails_never_crash():
    ok = shot(1, 0, 3)

    def only(s, text):
        fails, warns = chk.check(s, LIB, [])
        assert fails
        assert any(text in f for f in fails), (text, fails)
        assert warns == []

    for key in ("film", "fps", "size"):
        s = sheet(ok)
        del s[key]
        only(s, key)
    only(sheet(), "shots")
    for key in ("id", "from", "to"):
        bad = {k: v for k, v in ok.items() if k != key}
        only(sheet(bad), key)
    only(sheet(shot(1, 3, 3)), "s1")
    only(sheet(shot(1, 0, 3, lines=[{"at": 1.0}])), "who")
    only(sheet(shot(1, 3, 6), shot(2, 0, 3)), "order")


def test_emit_writes_exactly_the_key_set(tmp_path):
    lib = SimpleNamespace(
        cast={"scarf": {}, "kenji": {}, "pal": {"roles": ["crowd"]}},
        sets=LIB.sets,
        props=LIB.props,
    )
    s = sheet(shot(1, 0, 3))
    del s["beats"]
    out = chk.emit(s, lib, tmp_path / "film.json")
    data = json.loads(out.read_text())
    assert set(data) == {"film", "fps", "size", "beats", "shots", "audio", "duration", "cast", "crowd", "sets", "props"}
    assert data["beats"] == []
    assert set(data["crowd"]) == {"pal"}
    assert set(data["cast"]) == {"scarf"}


def test_a_data_shot_with_no_cast_passes():
    s = sheet({"id": "s1", "from": 0, "to": 3, "type": "data"})
    assert chk.check(s, LIB, []) == ([], [])


def test_more_than_four_in_focus_warns():
    cast = [{"who": "scarf", "at": [0, 0], "acts": [{"act": "idle"}]} for _ in range(5)]
    warns = chk.check(sheet(shot(1, 0, 3, cast=cast)), LIB, [])[1]
    assert any("more than four" in w for w in warns)


def test_shot_mix_warns_on_a_long_all_wide_sheet():
    shots = [shot(i, i * 10, i * 10 + 10, type="wide") for i in range(13)]
    shots = [s | {"camera": {"move": "drift"}} for s in shots]
    warns = chk.check(sheet(*shots), LIB, [])[1]
    assert any("shot mix" in w for w in warns)


def test_hyphenated_spoken_number_counts():
    words = [{"word": " twenty-five", "start": 6.1, "end": 6.5}]
    s = sheet(shot(1, 0, 4), shot(2, 4, 8, type="face"))
    assert any("twenty" in w for w in chk.check(s, LIB, words)[1])


def test_cli_reports_missing_and_malformed_inputs(tmp_path, capsys):
    assert chk.main([str(tmp_path)]) == 2
    assert "shots.yaml" in capsys.readouterr().err
    (tmp_path / "shots.yaml").write_text("film: t\n")
    (tmp_path / "audio").mkdir()
    (tmp_path / "audio" / "narration.words.json").write_text("{nope")
    assert chk.main([str(tmp_path)]) == 2
    assert "narration.words.json" in capsys.readouterr().err


def test_emit_on_empty_shots_does_not_crash(tmp_path):
    out = chk.emit({"film": "t", "fps": 30, "size": [1280, 720], "shots": []}, LIB, tmp_path / "f.json")
    assert '"duration": 0' in out.read_text()
