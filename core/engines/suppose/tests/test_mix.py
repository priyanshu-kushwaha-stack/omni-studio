import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import pytest
from scipy.io import wavfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import mix  # noqa: E402
import sfx  # noqa: E402


def test_place_fades_both_edges():
    bus = np.zeros(sfx.SR)
    sfx.place(bus, np.ones(4800), 0.1, 1.0)
    i = int(0.1 * sfx.SR)
    assert bus[i] == 0 and bus[i + 2400] == 1.0 and bus[i + 4799] < 0.01


def test_every_sheet_sfx_name_has_a_synth():
    for name in ["tick", "thump", "glide", "whoosh", "blip"]:
        assert name in sfx.SYNTHS


def film(seconds: float = 4.0) -> dict:
    return {
        "duration": seconds,
        "sets": {"station": {"ambience": "murmur"}},
        "shots": [
            {
                "id": "s1",
                "from": 0,
                "to": seconds,
                "type": "wide",
                "set": "station",
                "sfx": [{"name": "thump", "at": 1.0, "gain": 0.3}],
                "labels": [{"kind": "data", "text": "3", "at": 2.0, "to": 3.0}],
            }
        ],
    }


def voice(tmp_path: Path, seconds: float) -> Path:
    t = np.arange(int(seconds * 44100)) / 44100
    wavfile.write(tmp_path / "n.wav", 44100, (0.3 * np.sin(2 * np.pi * 180 * t) * (t > 0.5) * 32767).astype(np.int16))
    return tmp_path / "n.wav"


def test_raw_bus_has_voice_events_and_no_clipping(tmp_path):
    bus = mix.raw_bus(voice(tmp_path, 4.0), None, film(), warp_k=None)
    assert len(bus) == 4 * sfx.SR
    assert np.abs(bus).max() <= 0.89 + 1e-9
    i = int(1.0 * sfx.SR)
    assert np.abs(bus[i : i + 2000]).max() > np.abs(bus[i - 2000 : i]).max()


@pytest.mark.parametrize("dtype", ["int32", "float32", "int16", "uint8"])
def test_load_reads_every_wav_dtype_at_its_true_level(tmp_path, dtype):
    t = np.arange(48000) / 48000
    x = 0.3 * np.sin(2 * np.pi * 220 * t)
    data = {
        "int32": (x * 2**31).astype(np.int32),
        "float32": x.astype(np.float32),
        "int16": (x * 32767).astype(np.int16),
        "uint8": (x * 127 + 128).astype(np.uint8),
    }[dtype]
    wavfile.write(tmp_path / "a.wav", 48000, data)
    peak = np.abs(mix._load(tmp_path / "a.wav", 48000)).max()
    assert peak == pytest.approx(0.3, abs=0.02)


def test_load_keeps_a_quiet_int16_clip_quiet(tmp_path):
    wavfile.write(tmp_path / "q.wav", 48000, (np.sin(np.arange(4800) / 7) * 1.5).astype(np.int16))
    assert np.abs(mix._load(tmp_path / "q.wav", 4800)).max() < 0.001


def speech(tmp_path: Path, seconds: float) -> Path:
    t = np.arange(int(seconds * 44100)) / 44100
    bursts = ((t % 1.0) < 0.6) * (t > 0.3)
    wavfile.write(tmp_path / "n.wav", 44100, (0.3 * np.sin(2 * np.pi * 180 * t) * bursts * 32767).astype(np.int16))
    return tmp_path / "n.wav"


def measure_lufs(path: Path) -> float:
    r = subprocess.run(
        ["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True
    )
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


@pytest.mark.slow
def test_mix_measures_minus_16_lufs_within_one_lu(tmp_path):
    out = mix.mix(speech(tmp_path, 12.0), None, film(12.0), tmp_path / "m.wav")
    sr, y = wavfile.read(out)
    assert sr == 48000 and y.ndim == 2
    assert measure_lufs(out) == pytest.approx(-16, abs=1.0)
    assert not list(tmp_path.glob("*.raw.wav"))


def test_mix_removes_raw_file_when_ffmpeg_fails(tmp_path, monkeypatch):
    def boom(*a, **k):
        raise subprocess.CalledProcessError(1, "ffmpeg")

    monkeypatch.setattr(mix.subprocess, "run", boom)
    with pytest.raises(subprocess.CalledProcessError):
        mix.mix(voice(tmp_path, 4.0), None, film(), tmp_path / "m.wav")
    assert not list(tmp_path.glob("*.raw.wav"))


def test_raw_bus_edges_are_faded(tmp_path):
    f = film()
    f["sets"] = {}
    f["shots"][0]["sfx"] = []
    f["shots"][0]["labels"] = []
    t = np.arange(4 * 44100) / 44100
    wavfile.write(tmp_path / "c.wav", 44100, np.full(len(t), 20000, np.int16))
    bus = mix.raw_bus(tmp_path / "c.wav", None, f)
    assert bus[0] == 0 and abs(bus[-1]) < 0.01 and bus[sfx.SR] > 0.5


def test_place_clips_negative_start_and_fades_truncated_end():
    bus = np.zeros(4800)
    sfx.place(bus, np.ones(2400), -0.02, 1.0)
    assert bus[: int(0.04 * sfx.SR)].max() > 0
    bus = np.zeros(4800)
    sfx.place(bus, np.ones(9600), 0.0, 1.0)
    assert bus[-1] < 0.01 and bus[2400] == 1.0


def _tone_voice(tmp_path: Path, amp: float, seconds: float) -> Path:
    t = np.arange(int(seconds * 44100)) / 44100
    wavfile.write(tmp_path / "v.wav", 44100, (amp * np.sin(2 * np.pi * 180 * t) * 32767).astype(np.int16))
    return tmp_path / "v.wav"


def _score(tmp_path: Path, seconds: float) -> Path:
    t = np.arange(int(seconds * 48000)) / 48000
    wavfile.write(tmp_path / "s.wav", 48000, (0.5 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16))
    return tmp_path / "s.wav"


def _bare_film(seconds: float) -> dict:
    return {"duration": seconds, "shots": [{"id": "s", "from": 0, "to": seconds, "type": "wide"}]}


def _rms(x: np.ndarray) -> float:
    return float(np.sqrt(np.mean(x**2)))


def test_score_ducks_to_about_four_tenths_under_loud_voice(tmp_path):
    sec = 8.0
    score = _score(tmp_path, sec)
    f = _bare_film(sec)
    voice_path = _tone_voice(tmp_path, 0.5, sec)
    ducked = mix.raw_bus(voice_path, score, f) - mix.raw_bus(voice_path, None, f)
    free = mix.raw_bus(_tone_voice(tmp_path, 0.0, sec), score, f)
    w = slice(int(6 * sfx.SR), int(7.5 * sfx.SR))
    assert _rms(ducked[w]) / _rms(free[w]) == pytest.approx(0.4, abs=0.1)


def test_label_blip_adds_energy_after_its_time(tmp_path):
    f = film()
    f["sets"] = {}
    f["shots"][0]["sfx"] = []
    wavfile.write(tmp_path / "z.wav", 44100, np.zeros(4 * 44100, np.int16))
    bus = mix.raw_bus(tmp_path / "z.wav", None, f)
    i, n = 2 * sfx.SR, int(0.04 * sfx.SR)
    assert _rms(bus[i : i + n]) > 0.003 and _rms(bus[i - n : i]) < 1e-6


def test_insert_shot_has_less_ambience_than_the_wide_shot_before(tmp_path):
    f = {
        "duration": 8.0,
        "sets": {"station": {"ambience": "murmur"}},
        "shots": [
            {"id": "a", "from": 0, "to": 4.0, "type": "wide", "set": "station"},
            {"id": "b", "from": 4.0, "to": 8.0, "type": "insert", "set": "station"},
        ],
    }
    wavfile.write(tmp_path / "z.wav", 44100, np.zeros(8 * 44100, np.int16))
    bus = mix.raw_bus(tmp_path / "z.wav", None, f)
    wide = np.sqrt(np.mean(bus[int(1 * sfx.SR) : int(3 * sfx.SR)] ** 2))
    insert = np.sqrt(np.mean(bus[int(5 * sfx.SR) : int(7 * sfx.SR)] ** 2))
    assert wide > 0 and insert < 0.6 * wide


def test_raw_bus_survives_data_shot_without_set(tmp_path):
    f = film()
    f["shots"].append({"id": "s2", "from": 3.0, "to": 4.0, "type": "data", "labels": []})
    f["shots"][0]["to"] = 3.0
    f["sets"] = {}
    bus = mix.raw_bus(voice(tmp_path, 4.0), None, f, warp_k=None)
    assert len(bus) == 4 * sfx.SR


def test_cli_luc_reads_the_warped_film_and_luc_narration(tmp_path, monkeypatch):
    (tmp_path / "film.json").write_text('{"duration": 1}')
    (tmp_path / "film-luc.json").write_text('{"duration": 2}')
    seen = []
    monkeypatch.setattr(mix, "mix", lambda narr, score, film, out, warp_k=None: seen.append((narr.name, film)) or out)
    mix.main([str(tmp_path), "--luc"])
    mix.main([str(tmp_path)])
    assert seen == [("narration_luc.wav", {"duration": 2}), ("narration.wav", {"duration": 1})]
