import json
from pathlib import Path

import numpy as np
from PIL import Image

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import compose  # noqa: E402

WORDS = [{"word": "Twenty", "start": 0.0, "end": 0.3}, {"word": "nights,", "start": 0.3, "end": 0.6},
         {"word": "22", "start": 1.0, "end": 1.3}, {"word": "people.", "start": 1.3, "end": 1.7},
         {"word": "The", "start": 2.0, "end": 2.1}, {"word": "total", "start": 2.1, "end": 2.4},
         {"word": "came", "start": 2.4, "end": 2.6}, {"word": "to", "start": 2.6, "end": 2.7},
         {"word": "18", "start": 2.8, "end": 3.0}, {"word": "minutes.", "start": 3.0, "end": 3.5}]


def test_find_phrase_ignores_case_and_punctuation():
    assert compose.find_phrase(WORDS, "22 people") == (1.0, 1.7)
    assert compose.find_phrase(WORDS, "twenty nights") == (0.0, 0.6)
    assert compose.find_phrase(WORDS, "18 minutes", not_before=2.0) == (2.8, 3.5)
    assert compose.find_phrase(WORDS, "18 minutes", not_before=3.0) is None


def _plan(tmp_path: Path):
    stills = tmp_path / "stills"
    stills.mkdir()
    for sid in ("s001", "s003"):
        Image.new("RGB", (64, 36), compose.PAPER).save(stills / f"{sid}.png")
    plan = {"metadata": {"change_classes": {"s001": "illustration", "s002": "motion", "s003": "card"}},
            "scenes": [{"id": "s001", "start_seconds": 0.0, "end_seconds": 2.0, "script_section_id": "a"},
                       {"id": "s002", "start_seconds": 2.0, "end_seconds": 4.0, "script_section_id": "a"},
                       {"id": "s003", "start_seconds": 4.0, "end_seconds": 6.0, "script_section_id": "b"}]}
    return plan, stills


def test_build_groups_merges_continuations(tmp_path):
    plan, stills = _plan(tmp_path)
    groups = compose.build_groups(plan, stills, None)
    assert [(g.scene_id, g.start, g.end) for g in groups] == [("s001", 0.0, 4.0), ("s003", 4.0, 6.0)]
    assert groups[0].boundaries == [2.0]
    assert groups[1].klass == "card"


def test_build_groups_until_trims(tmp_path):
    plan, stills = _plan(tmp_path)
    groups = compose.build_groups(plan, stills, None, until=3.0)
    assert len(groups) == 1 and groups[0].end == 3.0


def test_resolve_overlays_times_to_anchor_and_scene_end(tmp_path):
    plan, stills = _plan(tmp_path)
    groups = compose.build_groups(plan, stills, None)
    specs = [{"id": "a", "scene": "s001", "anchor": "22 people", "text": "22", "lead": 0.2},
             {"id": "b", "scene": "s003", "text": "x", "hold": 1.0},
             {"id": "c", "scene": "s999", "text": "orphan"}]
    ovs = compose.resolve_overlays(specs, WORDS, groups, None)
    assert [(o.spec["id"], round(o.start, 2), o.end) for o in ovs] == [("a", 0.8, 4.0), ("b", 4.0, 5.0)]


def test_overlay_composite_writes_on_left_to_right():
    ov = compose.Overlay({"kind": "label", "text": "hello"}, 0.0, 2.0)
    compose.place_overlays([ov], 640, 360)
    ov.x, ov.y = 100, 100
    frame = np.full((360, 640, 3), 255, dtype=np.uint8)
    half = frame.copy()
    compose.composite(half, ov, 1.0, 0.3)
    full = frame.copy()
    compose.composite(full, ov, 1.0, 1.0)
    changed_half = (half != 255).any(axis=2).sum()
    changed_full = (full != 255).any(axis=2).sum()
    assert 0 < changed_half < changed_full


def test_srt_cues_split_on_sentence_and_length():
    cues = compose.srt_cues(WORDS, max_chars=16)
    assert cues[0] == (0.0, 0.6, "Twenty nights,")
    assert cues[-1][2].endswith("minutes.")
    assert all(b >= a for a, b, _ in cues)


def test_sfx_plan_pencil_on_drawings_page_on_section_turn(tmp_path):
    plan, stills = _plan(tmp_path)
    groups = compose.build_groups(plan, stills, None)
    sfx_dir = tmp_path / "sfx"
    sfx_dir.mkdir()
    for n in ("pencil.wav", "page.wav", "sting.wav"):
        (sfx_dir / n).write_bytes(b"")
    sfx = compose.plan_sfx(groups, [], sfx_dir, None)
    assert [(s.path.name, s.at) for s in sfx] == [("pencil.wav", 0.0), ("page.wav", 4.0)]


def test_mix_audio_pads_to_total_when_narration_is_shorter(tmp_path):
    """The end-screen tail runs past the narration; the mix must not stop with the voice."""
    import subprocess
    nar = tmp_path / "nar.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
                    "-ar", "48000", str(nar)], check=True)
    out = tmp_path / "mix.wav"
    compose.mix_audio(nar, [], [], 3.0, out, -24.0)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
                               capture_output=True, text=True, check=True).stdout.strip())
    assert abs(dur - 3.0) < 0.1


def test_find_phrase_matches_digits_and_split_numbers():
    words = [{"word": w, "start": i * 1.0, "end": i * 1.0 + 0.5} for i, w in
             enumerate(["did", "not", "sleep", "8", "hours.", "more", "than", "2", ",000", "in", "6", ".5", "hours,", "10", "-30%."])]
    assert compose.find_phrase(words, "eight hours")[0] == 3.0       # spelled anchor, digit token
    assert compose.find_phrase(words, "than 2000")[0] == 6.0         # one anchor number, two tokens
    assert compose.find_phrase(words, "than 2,000")[0] == 6.0
    assert compose.find_phrase(words, "6 .5")[0] == 10.0             # whisper-style anchor still works
    assert compose.find_phrase(words, "6.5 hours")[0] == 10.0
    assert compose.find_phrase(words, "ten to thirty") is None       # words that are not spoken stay unmatched
