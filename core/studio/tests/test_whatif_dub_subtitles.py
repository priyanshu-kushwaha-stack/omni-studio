"""The what-if engine's dub fitting and subtitles (core/engines/whatif/pipeline/dub_narration.py, subtitles.py)."""

from __future__ import annotations

import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

REAL_ROOT = Path(__file__).resolve().parents[3]
PIPELINE = REAL_ROOT / "core/engines/whatif/pipeline"
# dub_narration imports mix_narration as a sibling, as it does when run as a script from its folder.
if str(PIPELINE) not in sys.path:
    sys.path.insert(0, str(PIPELINE))


def _load(name):
    spec = importlib.util.spec_from_file_location(name, PIPELINE / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


dub = _load("dub_narration")
mix = importlib.import_module("mix_narration")  # the instance dub_narration imported
subs = _load("subtitles")


def test_a_take_that_fits_starts_on_its_english_line():
    assert dub.plan([0.0, 5.0, 10.0], [4.0, 4.0, 4.0], 15.0) == [(0.0, 1.0), (5.0, 1.0), (10.0, 1.0)]


def test_a_long_take_borrows_the_gap_before_it_then_speeds_up_at_most_the_cap():
    placed = dub.plan([0.0, 5.0, 8.0], [3.0, 3.6, 2.0], 12.0)
    assert placed[1] == (4.4, 1.0)  # starts 0.6 s early, into the gap the first take left
    tight = dub.plan([0.0, 3.0, 4.0], [2.8, 3.0, 1.0], 6.0)
    assert tight[1][1] == dub.MAX_SPEEDUP  # still runs over: sped up, never past the cap
    assert tight[1][0] >= 2.8 + dub.GAP  # and never before the previous take has finished


def test_a_dub_take_with_trailing_silence_is_cut_tail_after_its_voice_not_at_its_file_end(tmp_path):
    # ffmpeg 8 closes a take's trailing silence with a silence_end at the file's end; the dub's own copy of
    # voice_end took that as "no trailing silence" and kept every Hindi take to its file end.
    video, takes = tmp_path / "v", tmp_path / "takes"
    (video / "assets" / "narration").mkdir(parents=True)
    takes.mkdir()
    voice, length = 1.0, 2.5
    subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "lavfi", "-i", f"sine=f=220:d={voice}", "-af", f"apad=whole_dur={length}"]
        + ["-ar", "48000", str(takes / "t0.wav")],
        check=True,
    )
    (takes / "t0.wav.words.json").write_text(json.dumps([{"word": "नमस्ते", "start": 0.0, "end": 0.6}]))
    (takes / "props.json").write_text(json.dumps({"timeline": {"clips": [{"file": "narration/t0.wav"}]}}))
    en = {"timeline": {"clips": [{"from": 0}], "totalFrames": 4 * dub.FPS}}
    (video / "assets" / "narration" / "props.json").write_text(json.dumps(en))
    dub.main(video, takes, "hi", set())
    end = json.loads((video / "dub" / "hi" / "placed.json").read_text())[0]["end"]
    assert voice + mix.TAIL - 0.01 <= end <= voice + mix.TAIL + 0.05 < length


def _cues(srt):
    blocks = [b.split("\n") for b in srt.strip().split("\n\n")]
    return [(b[1], b[2:]) for b in blocks]


def test_short_sentences_share_a_cue_and_nothing_is_dropped():
    text = "Ten seconds. Once a day. Everyone and everything stops. Except you."
    srt = subs.to_srt(subs.cues_for_line(text, 1.0, 7.0))
    cues = _cues(srt)
    assert len(cues) == 1 and " ".join(cues[0][1]) == text
    assert all(len(line) <= subs.MAX_CHARS for _, lines in cues for line in lines)


def test_a_long_line_splits_into_cues_of_two_lines_and_keeps_every_word():
    text = (
        "The bigger cost is the watching. A whole life spent ten seconds at a time, on strangers who'll never "
        "know your name, in a city that never stops for anyone but you."
    )
    cues = _cues(subs.to_srt(subs.cues_for_line(text, 0.0, 10.0)))
    assert len(cues) > 1 and all(len(lines) <= subs.MAX_LINES for _, lines in cues)
    assert " ".join(" ".join(lines) for _, lines in cues).split() == text.split()


def test_cues_never_overlap_and_last_at_least_a_second_when_there_is_room():
    srt = subs.to_srt([(0.0, 0.3, "Vanish."), (2.0, 4.0, "Of course not.")])
    times = [re.findall(r"(\d\d):(\d\d):(\d\d),(\d\d\d)", t) for t, _ in _cues(srt)]
    sec = lambda h, m, s, ms: int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000
    (a0, b0), (a1, _) = [(sec(*t[0]), sec(*t[1])) for t in times]
    assert b0 - a0 >= subs.MIN_CUE and b0 <= a1


def test_dub_subtitles_use_the_dub_script_and_its_placement(tmp_path):
    video = tmp_path / "v"
    (video / "assets" / "narration").mkdir(parents=True)
    (video / "dub" / "hi").mkdir(parents=True)
    (video / "assets" / "narration" / "props.json").write_text(
        json.dumps({"lines": [{"text": "Hello there."}, {"text": "Nine. Eight. Seven."}]})
    )
    (video / "dub" / "hi" / "placed.json").write_text(
        json.dumps([{"line": 0, "start": 0.6, "end": 3.0}, {"line": 1, "start": 4.0, "end": 6.0}])
    )
    script = video / "dub" / "hi" / "script.md"
    script.write_text(
        "0 | 3.0 s | [warm] नमस्ते दोस्तों।\n1 | 2.0 s | [breathless] Nine. Eight. Seven.\n", encoding="utf-8"
    )
    cues = _cues(subs.dub(video, "hi", script))
    assert cues[0][1] == ["नमस्ते दोस्तों।"] and cues[0][0].startswith("00:00:00,600")
    assert cues[1][1] == ["Nine. Eight. Seven."]
