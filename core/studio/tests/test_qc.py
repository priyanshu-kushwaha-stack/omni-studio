"""Phase 4: loudness and click/pop checks, with planted faults."""

from __future__ import annotations

import json

import pytest

from studio.qc import clicks, loudness

SHORT = {"integrated_lufs": -14, "tolerance_lu": 1, "true_peak_dbtp_max": -1, "lra_lu_max": 8}


def test_a_mix_on_target_passes(media):
    wav, _ = media("good")
    report = loudness.check(wav, SHORT)
    assert report["ok"], report
    assert abs(report["measured"]["integrated_lufs"] + 14) < 0.5


def test_planted_too_loud_mix_fails_with_a_clear_message(media):
    wav, _ = media("loud")
    report = loudness.check(wav, SHORT)
    assert not report["ok"]
    assert any(p.startswith("too loud: integrated") and "turn the mix down" in p for p in report["problems"])
    assert any("true peak" in p for p in report["problems"])


@pytest.mark.parametrize(
    "measured,needle",
    [
        ({"integrated_lufs": -20.0, "true_peak_dbtp": -3.0, "lra_lu": 3.0}, "too quiet"),
        ({"integrated_lufs": -14.0, "true_peak_dbtp": -0.2, "lra_lu": 3.0}, "true peak -0.20 dBTP"),
        ({"integrated_lufs": -14.0, "true_peak_dbtp": -2.0, "lra_lu": 12.0}, "loudness range 12.0 LU"),
        ({"integrated_lufs": float("-inf"), "true_peak_dbtp": float("-inf"), "lra_lu": 0.0}, "silent"),
    ],
)
def test_each_target_is_enforced(measured, needle):
    assert any(needle in p for p in loudness.evaluate(measured, SHORT))


def test_unmeasurable_file_raises(tmp_path):
    bad = tmp_path / "x.wav"
    bad.write_bytes(b"not audio")
    with pytest.raises(loudness.LoudnessError):
        loudness.measure(bad)


def test_clean_track_has_no_clicks_and_a_short_tail(media):
    mp4, words = media("good", container="mp4")
    report = clicks.check(mp4, words, short=True)
    assert report["ok"], report["problems"]
    assert report["tail"]["tail_s"] >= 2.4


def test_planted_click_between_words_fails(media):
    wav, words = media("click")
    report = clicks.check(wav, words)
    assert not report["ok"]
    assert any(p.startswith("click/pop at") and "between words" in p for p in report["problems"]), report


def test_short_that_stops_instead_of_fading_fails(media):
    wav, words = media("abrupt")
    report = clicks.check(wav, words, short=True)
    assert not report["ok"]
    assert any("it stops instead of fading out" in p for p in report["problems"])


def test_short_without_words_cannot_check_its_tail(media, tmp_path):
    wav, _ = media("good")
    report = clicks.check(wav, tmp_path / "missing.json", short=True)
    assert not report["ok"] and "words.json" in report["problems"][0]


# ------------------------------------------------------------------------------------------------- opening


def _opening_wav(path, parts):
    """parts: [(seconds, kind)] with kind "silence", "low" (80 Hz, which a phone barely plays) or "voice" (1 kHz)."""
    import wave

    import numpy as np

    sr, chunks = 48000, []
    for seconds, kind in parts:
        t = np.arange(int(seconds * sr)) / sr
        hz = {"low": 80, "voice": 1000}.get(kind)
        chunks.append(np.zeros_like(t) if hz is None else 0.3 * np.sin(2 * np.pi * hz * t))
    pcm = (np.concatenate(chunks) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1), w.setsampwidth(2), w.setframerate(sr), w.writeframes(pcm.tobytes())
    return path


def _words(path, start):
    path.write_text(json.dumps([{"word": "On", "start": start, "end": start + 0.2}]))
    return path


def test_opening_that_speaks_at_once_passes(tmp_path):
    from studio.qc import opening

    wav = _opening_wav(tmp_path / "a.wav", [(0.4, "low"), (2.0, "voice")])
    report = opening.check(wav, _words(tmp_path / "w.json", 0.4))
    assert report["ok"], report["problems"]
    assert report["first_sound_s"] <= 0.5


def test_low_note_then_late_voice_fails_as_empty_on_a_phone(tmp_path):
    from studio.qc import opening

    wav = _opening_wav(tmp_path / "v5.wav", [(2.4, "low"), (2.0, "voice")])  # the pause-time edit v5 opening
    report = opening.check(wav, _words(tmp_path / "w.json", 2.4))
    assert not report["ok"]
    assert any("empty on a phone speaker" in p for p in report["problems"]), report
    assert any("first word comes at 2.4 s" in p for p in report["problems"]), report


def test_opening_without_words_cannot_time_the_first_word(tmp_path):
    from studio.qc import opening

    report = opening.check(_opening_wav(tmp_path / "a.wav", [(1.0, "voice")]))
    assert not report["ok"]
    assert any("no words.json" in p for p in report["problems"])
