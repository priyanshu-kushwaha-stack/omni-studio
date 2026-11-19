"""The what-if engine's narration mix: where a take is cut (core/engines/whatif/pipeline/mix_narration.py)."""

from __future__ import annotations

import array
import importlib.util
import json
import math
import subprocess
import wave
from pathlib import Path

REAL_ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location("whatif_mix", REAL_ROOT / "core/engines/whatif/pipeline/mix_narration.py")
mix = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mix)

RATE = 48000
# "plasma.": the word, a short gap, then a soft unstressed "a" that Whisper leaves out of the word's time.
WORD = (0.0, 1.0, 0.5)
VOWEL = (1.18, 1.40, 0.1)  # -20 dB, well above silencedetect's -40 dB
WHISPER_END = 1.0
LENGTH = 2.0


def _take(path: Path) -> None:
    samples = array.array("h", [0] * int(LENGTH * RATE))
    for start, end, amp in (WORD, VOWEL):
        for n in range(int(start * RATE), int(end * RATE)):
            samples[n] = int(amp * 32767 * math.sin(2 * math.pi * 220 * n / RATE))
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(samples.tobytes())


def _video(tmp_path: Path) -> Path:
    takes = tmp_path / "assets" / "narration"
    takes.mkdir(parents=True)
    _take(takes / "take0.wav")
    (takes / "take0.wav.words.json").write_text(json.dumps([{"word": "plasma.", "start": 0.0, "end": WHISPER_END}]))
    clips = [{"file": "narration/take0.wav", "from": 0}]
    props = {"lines": [{"text": "plasma."}], "timeline": {"clips": clips, "totalFrames": int(LENGTH * mix.FPS)}}
    (takes / "props.json").write_text(json.dumps(props))
    return tmp_path


def _rms(wav: Path, start: float, end: float) -> float:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(wav), "-f", "s16le", "-ac", "1", "-ar", str(RATE), "-"],
        capture_output=True,
        check=True,
    ).stdout
    samples = array.array("h", raw)[int(start * RATE) : int(end * RATE)]
    return math.sqrt(sum(s * s for s in samples) / len(samples)) / 32767


def test_a_soft_last_vowel_past_whispers_word_end_is_kept(tmp_path):
    wav, _ = mix.mix(_video(tmp_path))
    vowel = _rms(wav, VOWEL[0] + 0.02, VOWEL[1] - 0.02)
    assert vowel > 0.5 * VOWEL[2] / math.sqrt(2)  # the "a" is there, at about its own level, not cut or faded
    assert _rms(wav, VOWEL[1] + mix.TAIL + 0.05, LENGTH) == 0  # and the take still ends after its tail


def test_the_cut_falls_after_the_voice_stops_not_at_whispers_word_end(tmp_path):
    take = _video(tmp_path) / "assets" / "narration" / "take0.wav"
    end = mix.cut_at(take, WHISPER_END, LENGTH)
    assert VOWEL[1] + mix.TAIL - 0.01 <= end <= VOWEL[1] + mix.TAIL + 0.05


def test_without_a_trailing_silence_the_cut_is_capped_at_the_take(tmp_path):
    take = tmp_path / "t.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "sine=f=220:d=0.5", "-ar", str(RATE), str(take)], check=True
    )
    assert mix.cut_at(take, 0.2, 0.5) == 0.5


def test_when_silencedetect_cannot_read_the_take_the_cut_falls_back_to_whisper(tmp_path):
    assert mix.cut_at(tmp_path / "missing.wav", 1.0, 2.0) == 1.0 + mix.TAIL
