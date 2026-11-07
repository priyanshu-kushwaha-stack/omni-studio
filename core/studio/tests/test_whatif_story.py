"""The what-if engine's story builder: script.md -> story.json (core/engines/whatif/pipeline/story.py)."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

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
    assert [l["text"] for l in out["lines"]] == ["On day twelve, a bus.", "A car needs about 23 metres to stop.", "Nobody knows."]
    assert [l["mood"] for l in out["lines"]] == ["frozen", "dusk", "dusk"]
    assert [l["claims"] for l in out["lines"]] == [[], ["c14"], []]
    assert out["leadInSec"] == pytest.approx(story.LEAD_IN + 2)
    assert out["lines"][1]["gapAfterSec"] == pytest.approx(4)
    assert out["lines"][0]["gapAfterSec"] == pytest.approx(story.GAP)
    assert out["sources"] == {"c14": "https://example.gov.uk/stopping.pdf"}
    assert out["voice"] == {"model": "elevenlabs_v4", "voiceType": "preset", "voiceId": "30fc8796-ceb6-4a66-b3a7-4a145ef7f346"}


def test_say_overrides_spell_numbers_and_direct_delivery(tmp_path):
    say = 'A car needs about 23 metres to stop.: "A car needs about twenty-three metres to stop."\nNobody knows.: "[whispers] Nobody knows."\n'
    out = story.build(_video(tmp_path, say))
    assert [l["say"] for l in out["lines"]] == [
        "On day twelve, a bus.", "A car needs about twenty-three metres to stop.", "[whispers] Nobody knows."]


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


mix_spec = importlib.util.spec_from_file_location("whatif_mix", REAL_ROOT / "core/engines/whatif/pipeline/mix_narration.py")
mix = importlib.util.module_from_spec(mix_spec)
mix_spec.loader.exec_module(mix)


def test_mutes_measured_at_normal_speed_follow_a_faster_take():
    lines = [{"text": "a"}, {"text": "b", "tempo": 1.25}]
    assert mix.at_tempo([(0, 1.0, 0.1), (1, 2.5, 0.05)], lines, 1.1) == [
        (0, pytest.approx(1.0 / 1.1), pytest.approx(0.1 / 1.1)), (1, pytest.approx(2.0), pytest.approx(0.04))]
