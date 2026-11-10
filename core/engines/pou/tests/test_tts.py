import sys
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import tts  # noqa: E402

TEXT = ("One. " * 150 + "Two two two. " * 120 + "Three. " * 200).strip()


def test_chunk_splits_at_sentence_ends_under_the_limit():
    chunks = tts.chunk(TEXT, max_words=400)
    assert len(chunks) >= 2
    assert all(len(c.split()) <= 400 for c in chunks)
    assert all(c.endswith(".") for c in chunks)
    assert " ".join(chunks).split() == TEXT.split()


def _fake_backend(sr=48000):
    def run(jobs, voice_ref: Path, voice_text=None):
        outs = []
        for text, out in jobs:
            n = len(text.split())
            with wave.open(str(out), "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(sr)
                w.writeframes(b"\x00\x00" * int(sr * 0.05 * n))  # 50 ms per word
            outs.append(out)
        return outs

    return run


def test_read_writes_chunks_and_joins_with_gaps(tmp_path):
    out = tts.read(
        "A b c. D e f. G h i.",
        engine="fake",
        out=tmp_path / "n.wav",
        voice_ref=tmp_path / "v.wav",
        backend=_fake_backend(),
        max_words=4,
        gap=0.35,
    )
    parts = sorted(tmp_path.glob("n.part*.wav"))
    assert len(parts) == 3  # three sentences, at most 4 words per chunk
    with wave.open(str(out)) as w:
        dur = w.getnframes() / w.getframerate()
    assert abs(dur - (9 * 0.05 + 2 * 0.35)) < 0.02


def test_wer_counts_substitutions_insertions_deletions():
    assert tts.wer("the cat sat on the mat", "the cat sat on the mat") == 0.0
    assert abs(tts.wer("the cat sat on the mat", "the cat sat the mat") - 1 / 6) < 1e-9
    assert abs(tts.wer("the cat sat on the mat", "the big cat sat on a mat") - 2 / 6) < 1e-9


def test_engine_default_chunk_size_keeps_chatterbox_short():
    text = " ".join(f"Sentence number {i} is here." for i in range(60))  # 300 words
    assert tts.ENGINE_MAX_WORDS["chatterbox"] <= 60
    assert all(
        len(c.split()) <= tts.ENGINE_MAX_WORDS["chatterbox"]
        for c in tts.chunk(text, tts.ENGINE_MAX_WORDS["chatterbox"])
    )


def test_join_accepts_float_wavs(tmp_path):
    import subprocess

    f = tmp_path / "f.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=440:duration=0.2",
            "-ar",
            "24000",
            "-c:a",
            "pcm_f32le",
            str(f),
        ],
        check=True,
    )
    out = tts.join([f, f], tmp_path / "j.wav", gap=0.1)
    with wave.open(str(out)) as w:
        assert w.getsampwidth() == 2
        assert abs(w.getnframes() / w.getframerate() - 0.5) < 0.02


def test_eleven_backend_writes_pcm16_wavs_and_counts_credits(tmp_path, monkeypatch):
    sent = []

    def fake_post(text: str) -> bytes:
        sent.append(text)
        return b"\x00\x00" * 2400  # 0.1 s of silence at 24 kHz

    jobs = [("Hello there.", tmp_path / "a.part01.wav"), ("Second chunk.", tmp_path / "a.part02.wav")]
    outs = tts._eleven(jobs, tmp_path / "unused.wav", None, post=fake_post)
    assert sent == ["Hello there.", "Second chunk."] and [o.name for o in outs] == ["a.part01.wav", "a.part02.wav"]
    with wave.open(str(outs[0])) as w:
        assert (w.getframerate(), w.getsampwidth(), w.getnchannels(), w.getnframes()) == (24000, 2, 1, 2400)
    assert tts.eleven_credits("x" * 9398) == 4699  # video 1 narration at Turbo rates


def test_eleven_backend_refuses_without_keys(tmp_path, monkeypatch):
    monkeypatch.delenv("ELEVENLABS_API_KEY", raising=False)
    monkeypatch.delenv("ELEVEN_VOICE_ID", raising=False)
    monkeypatch.setattr(tts, "_load_env_local", lambda: None)
    import pytest

    with pytest.raises(SystemExit):
        tts._eleven([("hi", tmp_path / "x.wav")], tmp_path / "v.wav", None)
