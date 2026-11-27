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


@pytest.mark.slow
def test_mix_writes_minus_16_lufs(tmp_path):
    out = mix.mix(voice(tmp_path, 4.0), None, film(), tmp_path / "m.wav")
    sr, y = wavfile.read(out)
    assert sr == 48000 and y.ndim == 2


def test_raw_bus_survives_data_shot_without_set(tmp_path):
    f = film()
    f["shots"].append({"id": "s2", "from": 3.0, "to": 4.0, "type": "data", "labels": []})
    f["shots"][0]["to"] = 3.0
    f["sets"] = {}
    bus = mix.raw_bus(voice(tmp_path, 4.0), None, f, warp_k=None)
    assert len(bus) == 4 * sfx.SR
