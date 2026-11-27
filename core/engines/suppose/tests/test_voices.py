import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import voices  # noqa: E402

import yaml  # noqa: E402

VOICES = {"kenji": {"desc": "A young man's voice: warm, quick.", "seed": 4242}}


def test_jobs_route_narrator_and_characters(tmp_path):
    lines = [{"n": 1, "text": "You run.", "speaker": "narrator"}, {"n": 2, "text": "You're late!", "speaker": "kenji"}]
    spec = voices.jobs(lines, VOICES, Path("/ref.wav"), "ref text", tmp_path)
    a, b = spec["jobs"]
    assert a["engine"] == "qwen3" and a["ref"] == "/ref.wav" and a["ref_text"] == "ref text"
    assert a["out"].endswith("001_narrator.wav")
    assert b["engine"] == "qwen3-design" and b["seed"] == 4242 and b["instruct"].startswith("A young man")
    assert b["out"].endswith("002_kenji.wav")


def test_a_character_without_a_voice_is_refused(tmp_path):
    with pytest.raises(SystemExit, match="kenji"):
        voices.jobs([{"n": 1, "text": "Hi.", "speaker": "kenji"}], {"kenji": {}}, Path("/r.wav"), "t", tmp_path)


def test_words_converted_to_sheetcheck_shape(tmp_path):
    wav = tmp_path / "narration.wav"
    Path(f"{wav}.words.json").write_text(json.dumps([{"word": "Hi", "start": 0.5, "end": 0.9, "x": 1}]))
    out = tmp_path / "narration.words.json"
    voices.write_words(wav, out)
    assert json.loads(out.read_text()) == [{"word": "Hi", "start": 0.5, "end": 0.9}]


def test_main_checkout_prefers_env(monkeypatch):
    monkeypatch.setenv("OMNI_MAIN", "/some/main")
    assert voices.main_checkout() == Path("/some/main")


def test_voice_table_layers_the_video_voices_over_the_library(tmp_path):
    cast = {
        "kenji": {"voice": {"desc": "lib", "seed": 1}},
        "gran": {"voice": None},
        "okada": {"voice": {"desc": "o", "seed": 2}},
    }
    (tmp_path / "voices.yaml").write_text(
        yaml.safe_dump({"kenji": {"desc": "video", "seed": 9}, "mia": {"desc": "m", "seed": 3}})
    )
    table = voices.voice_table(cast, tmp_path)
    assert table == {
        "kenji": {"desc": "video", "seed": 9},
        "okada": {"desc": "o", "seed": 2},
        "mia": {"desc": "m", "seed": 3},
    }
    assert voices.voice_table(cast, tmp_path / "none") == {
        "kenji": {"desc": "lib", "seed": 1},
        "okada": {"desc": "o", "seed": 2},
    }


def test_a_voice_needs_desc_and_seed(tmp_path):
    with pytest.raises(SystemExit, match="voices.yaml"):
        voices.jobs([{"n": 1, "text": "Hi.", "speaker": "mia"}], {"mia": {"desc": "m"}}, Path("/r.wav"), "t", tmp_path)


def test_sweep_makes_one_design_take_per_seed(tmp_path):
    spec = voices.sweep_jobs(
        "mia", {"mia": {"desc": "A low, warm female voice"}}, "Hello there.", (11, 23, 37), tmp_path
    )
    assert [j["seed"] for j in spec["jobs"]] == [11, 23, 37]
    assert {j["engine"] for j in spec["jobs"]} == {"qwen3-design"}
    assert spec["jobs"][0]["out"].endswith("mia_seed11.wav") and spec["jobs"][2]["instruct"].startswith("A low")


def test_to_maps_writes_the_voice_and_keeps_the_rest_of_the_map(tmp_path):
    maps = tmp_path / "lib" / "cast" / "maps"
    maps.mkdir(parents=True)
    (maps / "mia.yaml").write_text("id: mia\nsheet: mia\n# a comment\nvoice:\n  desc: old\n  seed: 1\nhip: 0.5\n")
    video = tmp_path / "v"
    video.mkdir()
    (video / "voices.yaml").write_text(yaml.safe_dump({"mia": {"desc": "A low, warm female voice: a: b", "seed": 23}}))
    voices.to_maps(str(video), str(tmp_path / "lib"))
    text = (maps / "mia.yaml").read_text()
    m = yaml.safe_load(text)
    assert m["voice"] == {"desc": "A low, warm female voice: a: b", "seed": 23} and m["hip"] == 0.5
    assert "# a comment" in text and "old" not in text
    (video / "voices.yaml").write_text(yaml.safe_dump({"zed": {"desc": "z", "seed": 1}}))
    with pytest.raises(SystemExit, match="zed"):
        voices.to_maps(str(video), str(tmp_path / "lib"))
