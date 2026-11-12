"""The what-if engine's story builder: script.md -> story.json (core/engines/whatif/pipeline/story.py)."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest
import yaml

REAL_ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location("whatif_story", REAL_ROOT / "core/engines/whatif/pipeline/story.py")
story = importlib.util.module_from_spec(spec)
spec.loader.exec_module(story)

SCRIPT = """# Script: Test

format: story
status: draft
claims: claims.md

## [00:00] The change
> MOOD: frozen
> SCENE: A frozen street.
> HOLD: 2 s. One low note.
On day twelve, a bus.
> MOOD: dusk
A car needs about 23 metres to stop (c14).
> HOLD: 4 s. You walk away.
Nobody knows.

## Word count
5 words.
"""
CLAIMS = """| id | claim | source URL | quote | status | note |
|----|----|----|----|----|----|
| c14 | A car needs 23 m. | https://example.gov.uk/stopping.pdf | "23 metres" | sourced | |
| c15 | Dropped. | https://example.org/x | "x" | dropped | |
"""
VOICES = """voices:
  narrator:
    label: NARR
    tool: higgsfield elevenlabs_v4
    voice_type: preset
    voice_id: 30fc8796-ceb6-4a66-b3a7-4a145ef7f346
"""


def _video(tmp_path: Path, say: str | None = None) -> Path:
    channel = tmp_path / "chan"
    video = channel / "videos" / "2026-11-06_test"
    video.mkdir(parents=True)
    (video / "script.md").write_text(SCRIPT)
    (video / "claims.md").write_text(CLAIMS)
    (channel / "voices.yaml").write_text(VOICES)
    if say is not None:
        (video / "say.yaml").write_text(say)
    return video


def test_spoken_lines_holds_moods_and_claims(tmp_path):
    out = story.build(_video(tmp_path))
    assert [l["text"] for l in out["lines"]] == [
        "On day twelve, a bus.",
        "A car needs about 23 metres to stop.",
        "Nobody knows.",
    ]
    assert [l["mood"] for l in out["lines"]] == ["frozen", "dusk", "dusk"]
    assert [l["claims"] for l in out["lines"]] == [[], ["c14"], []]
    assert out["leadInSec"] == pytest.approx(story.LEAD_IN + 2)
    assert out["lines"][1]["gapAfterSec"] == pytest.approx(4)
    assert out["lines"][0]["gapAfterSec"] == pytest.approx(story.GAP)
    assert out["sources"] == {"c14": "https://example.gov.uk/stopping.pdf"}
    assert out["voice"] == {
        "model": "elevenlabs_v4",
        "voiceType": "preset",
        "voiceId": "30fc8796-ceb6-4a66-b3a7-4a145ef7f346",
    }


def test_say_overrides_spell_numbers_and_direct_delivery(tmp_path):
    say = 'A car needs about 23 metres to stop.: "A car needs about twenty-three metres to stop."\nNobody knows.: "[whispers] Nobody knows."\n'
    out = story.build(_video(tmp_path, say))
    assert [l["say"] for l in out["lines"]] == [
        "On day twelve, a bus.",
        "A car needs about twenty-three metres to stop.",
        "[whispers] Nobody knows.",
    ]


def test_say_override_for_a_line_that_is_not_in_the_script_is_refused(tmp_path):
    with pytest.raises(ValueError, match="not a spoken line"):
        story.build(_video(tmp_path, '"Somebody knows.": "[whispers] Somebody knows."\n'))


def test_a_cited_id_missing_from_the_ledger_is_refused(tmp_path):
    video = _video(tmp_path)
    (video / "script.md").write_text(SCRIPT.replace("(c14)", "(c99)"))
    with pytest.raises(ValueError, match="c99"):
        story.build(video)


def test_cues_already_in_story_json_are_kept(tmp_path):
    video = _video(tmp_path)
    (video / "story.json").write_text(json.dumps({"cues": {"bus": {"line": 0, "word": "bus"}}}))
    out = story.build(video)
    assert out["cues"] == {"bus": {"line": 0, "word": "bus"}}


def test_the_pause_time_script_builds(tmp_path):
    video = REAL_ROOT / "channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day"
    out = story.build(video)
    assert len(out["lines"]) > 60
    assert {l["mood"] for l in out["lines"]} <= set(story.MOODS)
    assert all(set(l["claims"]) <= set(out["sources"]) for l in out["lines"])


def test_timing_adds_action_time_and_cues(tmp_path):
    video = _video(tmp_path)
    (video / "timing.yaml").write_text("extra: {0: 1.5}\ncues:\n  bus: [0, bus]\n  stop: [1, stop]\n")
    out = story.build(video)
    assert out["lines"][0]["gapAfterSec"] == pytest.approx(story.GAP + 1.5)
    assert out["cues"] == {"bus": {"line": 0, "word": "bus"}, "stop": {"line": 1, "word": "stop"}}


def test_a_cue_word_missing_from_its_line_is_refused(tmp_path):
    video = _video(tmp_path)
    (video / "timing.yaml").write_text("cues:\n  oops: [0, tram]\n")
    with pytest.raises(ValueError, match="tram"):
        story.build(video)


def test_timing_sets_a_tempo_with_per_line_exceptions(tmp_path):
    video = _video(tmp_path)
    (video / "timing.yaml").write_text("tempo: 1.1\ntempo_lines: {2: 1.0}\n")
    out = story.build(video)
    assert out["tempo"] == pytest.approx(1.1)
    assert "tempo" not in out["lines"][0]
    assert out["lines"][2]["tempo"] == pytest.approx(1.0)


def test_no_tempo_leaves_the_story_at_normal_speed(tmp_path):
    out = story.build(_video(tmp_path))
    assert "tempo" not in out
    assert all("tempo" not in l for l in out["lines"])


mix_spec = importlib.util.spec_from_file_location(
    "whatif_mix", REAL_ROOT / "core/engines/whatif/pipeline/mix_narration.py"
)
mix = importlib.util.module_from_spec(mix_spec)
mix_spec.loader.exec_module(mix)


def test_mutes_measured_at_normal_speed_follow_a_faster_take():
    lines = [{"text": "a"}, {"text": "b", "tempo": 1.25}]
    assert mix.at_tempo([(0, 1.0, 0.1), (1, 2.5, 0.05)], lines, 1.1) == [
        (0, pytest.approx(1.0 / 1.1), pytest.approx(0.1 / 1.1)),
        (1, pytest.approx(2.0), pytest.approx(0.04)),
    ]


LOCAL = (
    VOICES
    + """    use: local
    local: {engine: qwen3, ref: brand/voice/ref.wav, ref_text: "Hello there."}
"""
)


def _local_video(tmp_path: Path, voices: str = LOCAL) -> Path:
    video = _video(tmp_path)
    channel = video.parent.parent
    (channel / "voices.yaml").write_text(voices)
    (channel / "brand" / "voice").mkdir(parents=True)
    (channel / "brand" / "voice" / "ref.wav").write_bytes(b"RIFF-not-really-a-wav")
    return video


def test_a_local_narrator_gives_a_free_local_voice(tmp_path, monkeypatch):
    monkeypatch.delenv("WHATIF_VOICE", raising=False)
    video = _local_video(tmp_path)
    voice = story.build(video)["voice"]
    assert voice["model"] == "local:qwen3" and voice["voiceType"] == "local"
    assert voice["ref"] == "../../brand/voice/ref.wav"  # relative to the video folder, where story.json lives
    assert voice["refText"] == "Hello there."
    assert voice["voiceId"] == story.build(video)["voice"]["voiceId"]  # a hash of the clip, stable


def test_whatif_voice_paid_picks_the_paid_narrator_for_the_ab(tmp_path, monkeypatch):
    monkeypatch.setenv("WHATIF_VOICE", "paid")
    voice = story.build(_local_video(tmp_path))["voice"]
    assert voice == {"model": "elevenlabs_v4", "voiceType": "preset", "voiceId": "30fc8796-ceb6-4a66-b3a7-4a145ef7f346"}


def test_use_local_without_a_local_entry_is_refused(tmp_path, monkeypatch):
    monkeypatch.delenv("WHATIF_VOICE", raising=False)
    with pytest.raises(ValueError, match="narrator"):
        story.build(_local_video(tmp_path, VOICES + "    use: local\n"))


CAST = """  characters:
    engine: qwen3-design
    cast:
      Lotte: A baker in her fifties.
    stock:
      man: A man in his forties.
      anyone: An adult.
"""
DIALOGUE = SCRIPT.replace(
    "Nobody knows.\n", "Nobody knows.\nLotte: One cent. Counted?\nBank man: Mine. Right.\nDriver: Free today.\n"
)


def _cast_video(tmp_path: Path, say: str | None = None, voices: str = VOICES + CAST) -> Path:
    video = _video(tmp_path, say)
    (video / "script.md").write_text(DIALOGUE)
    (video.parent.parent / "voices.yaml").write_text(voices)
    return video


def test_each_line_carries_its_speaker_and_a_character_name_is_not_spoken(tmp_path):
    lines = story.build(_cast_video(tmp_path))["lines"]
    assert [l["speaker"] for l in lines] == ["narrator", "narrator", "narrator", "Lotte", "Bank man", "Driver"]
    assert lines[3]["text"] == "Lotte: One cent. Counted?"  # as written: say.yaml keys and cues read it
    assert lines[3]["say"] == "One cent. Counted?"


def test_say_yaml_keys_a_character_line_by_its_written_text(tmp_path):
    say = '"Lotte: One cent. Counted?": "[brisk, palm out] One cent. Counted?"\n'
    assert story.build(_cast_video(tmp_path, say))["lines"][3]["say"] == "[brisk, palm out] One cent. Counted?"


def test_a_cast_character_gets_a_designed_voice_of_its_own(tmp_path):
    voices = story.build(_cast_video(tmp_path))["voices"]
    assert voices["Lotte"]["model"] == "local:qwen3-design"
    assert voices["Lotte"]["voiceType"] == "design"
    assert voices["Lotte"]["describe"] == "A baker in her fifties."
    assert "ref" not in voices["Lotte"]  # nobody is cloned


def test_an_unlisted_character_takes_a_stock_role_voice_never_the_narrator(tmp_path, capsys):
    out = story.build(_cast_video(tmp_path))
    voices = out["voices"]
    assert voices["Bank man"]["describe"] == "A man in his forties."
    assert voices["Driver"]["describe"] == "An adult."
    assert out["voice"] not in voices.values()
    assert "no voice for 'Bank man'" in capsys.readouterr().err


def test_two_characters_on_one_stock_voice_still_sound_apart(tmp_path):
    voices = story.build(
        _cast_video(tmp_path, voices=VOICES + CAST.replace("anyone: An adult.", "anyone: A man in his forties."))
    )["voices"]
    assert voices["Bank man"]["describe"] == voices["Driver"]["describe"]
    assert voices["Bank man"]["voiceId"] != voices["Driver"]["voiceId"]  # the id seeds the take


def test_character_lines_without_a_characters_entry_are_refused(tmp_path):
    with pytest.raises(ValueError, match="no characters entry"):
        story.build(_cast_video(tmp_path, voices=VOICES))


def test_a_bare_line_with_a_number_before_a_colon_stays_the_narrators(tmp_path):
    assert story._spoken("Day 31: the spill.") == ("narrator", "Day 31: the spill.")
    assert story._spoken("Lotte: Day-old. Free.") == ("Lotte", "Day-old. Free.")


def test_a_script_without_characters_has_no_character_voices(tmp_path):
    assert story.build(_video(tmp_path))["voices"] == {}


def test_the_say_suppose_cast_is_voiced(tmp_path):
    voices = yaml.safe_load((REAL_ROOT / "channels/say-suppose/voices.yaml").read_text())["voices"]
    descriptions = [story._character_voice(voices["characters"], n)["describe"] for n in voices["characters"]["cast"]]
    assert len(set(descriptions)) == len(descriptions)
