"""The what-if engine's local voice runner (core/engines/whatif/pipeline/local_tts.py), without loading a model."""

from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

REAL_ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location(
    "whatif_local_tts", REAL_ROOT / "core/engines/whatif/pipeline/local_tts.py"
)
local_tts = importlib.util.module_from_spec(spec)
spec.loader.exec_module(local_tts)


def test_jobs_are_grouped_by_engine_so_each_model_loads_once():
    jobs = [{"engine": "qwen3", "n": 1}, {"engine": "qwen3-design", "n": 2}, {"engine": "qwen3", "n": 3}]
    groups = local_tts.by_engine(jobs)
    assert list(groups) == ["qwen3", "qwen3-design"]
    assert [j["n"] for j in groups["qwen3"]] == [1, 3]


def test_an_unknown_engine_is_refused_before_any_model_loads():
    with pytest.raises(SystemExit, match="unknown local engine"):
        local_tts.by_engine([{"engine": "qwen3"}, {"engine": "h3"}])


def test_a_character_gets_an_instruction_and_the_narrator_its_clip():
    assert local_tts.voice_args({"instruct": "A baker. Delivery: deadpan."}) == {
        "instruct": "A baker. Delivery: deadpan.",
        "lang_code": "english",
    }
    assert local_tts.voice_args({"ref": "/r.wav", "ref_text": "Hi."}) == {"ref_audio": "/r.wav", "ref_text": "Hi."}


def test_the_engines_are_the_pinned_models_in_the_lock():
    assert local_tts.MODELS["qwen3"][0] == "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16"
    assert local_tts.MODELS["qwen3-design"][0] == "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16"
    assert all(len(revision) == 40 for _, revision in local_tts.MODELS.values())  # a commit, never a branch
