import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import audio_check  # noqa: E402
import overlay_check  # noqa: E402

SR = audio_check.SR


def _tone(seconds: float, db: float = -20.0, hz: float = 220.0) -> np.ndarray:
    t = np.arange(int(seconds * SR)) / SR
    return (10 ** (db / 20) * np.sqrt(2) * np.sin(2 * np.pi * hz * t)).astype(np.float32)


def _ramp(x: np.ndarray, s: float = 0.02) -> np.ndarray:
    n = int(s * SR)
    w = np.ones(len(x), dtype=np.float32)
    w[:n] = np.linspace(0, 1, n)
    w[-n:] = np.linspace(1, 0, n)
    return x * w


def test_isolated_pop_in_silence_is_a_burst():
    x = np.zeros(SR, dtype=np.float32)
    x[int(0.5 * SR) : int(0.52 * SR)] = _tone(0.02, db=-12, hz=2000)
    found = audio_check.bursts(x)
    assert len(found) == 1 and abs(found[0]["t"] - 0.5) < 0.01


def test_faded_speech_like_tone_is_not_a_burst():
    x = np.concatenate([np.zeros(SR // 2, np.float32), _ramp(_tone(0.6)), np.zeros(SR // 2, np.float32)])
    assert audio_check.bursts(x) == []
    assert audio_check.steps(x)[0] == []


def test_hard_cut_mid_wave_is_a_step():
    x = np.concatenate([_ramp(_tone(0.5, db=-30)), np.zeros(100, np.float32) + 0.4, np.zeros(SR // 2, np.float32)])
    found, _ = audio_check.steps(x)
    assert found and abs(found[0]["t"] - 0.5) < 0.01


def test_burst_inside_a_word_only_warns(tmp_path):
    x = np.zeros(SR, dtype=np.float32)
    x[int(0.5 * SR) : int(0.52 * SR)] = _tone(0.02, db=-12, hz=2000)
    wav = tmp_path / "a.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", str(wav)],
        input=x.tobytes(),
        check=True,
    )
    gap = tmp_path / "gap.json"
    gap.write_text(json.dumps([{"word": "a", "start": 0.1, "end": 0.2}]))
    word = tmp_path / "word.json"
    word.write_text(json.dumps([{"word": "sixth", "start": 0.45, "end": 0.6}]))
    assert audio_check.check(wav, gap)["ok"] is False
    r = audio_check.check(wav, word)
    assert r["ok"] is True and len(r["in_word_bursts"]) == 1


def test_short_tail_needs_2_4_s_and_a_fade():
    words = [{"word": "end", "start": 0.5, "end": 1.0}]
    voice = _tone(1.0)
    fading = _tone(2.5, db=-25) * np.linspace(1, 0, int(2.5 * SR), dtype=np.float32) ** 3
    assert audio_check.tail(np.concatenate([voice, fading]), words)["ok"] is True
    abrupt = _tone(2.5, db=-25)
    assert audio_check.tail(np.concatenate([voice, abrupt]), words)["ok"] is False
    short = fading[: int(1.0 * SR)]
    assert audio_check.tail(np.concatenate([voice, short]), words)["ok"] is False


def test_short_is_found_by_anim_json_outside_shorts(tmp_path):
    video = tmp_path / "videos" / "2026-10-31_tails"
    video.mkdir(parents=True)
    assert overlay_check.is_short(video) is False
    (video / "anim.json").write_text("{}")
    assert overlay_check.is_short(video) is True
    assert overlay_check.is_short(tmp_path / "shorts" / "x") is True
