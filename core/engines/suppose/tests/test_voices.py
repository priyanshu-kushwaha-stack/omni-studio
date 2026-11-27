import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import voices  # noqa: E402

CAST = {"kenji": {"voice": {"desc": "A young man's voice: warm, quick.", "seed": 4242}}}


def test_jobs_route_narrator_and_characters(tmp_path):
    lines = [{"n": 1, "text": "You run.", "speaker": "narrator"}, {"n": 2, "text": "You're late!", "speaker": "kenji"}]
    spec = voices.jobs(lines, CAST, Path("/ref.wav"), "ref text", tmp_path)
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
