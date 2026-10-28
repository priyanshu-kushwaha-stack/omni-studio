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
    def run(text: str, out: Path, voice_ref: Path) -> Path:
        n = len(text.split())
        with wave.open(str(out), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes(b"\x00\x00" * int(sr * 0.05 * n))   # 50 ms per word
        return out
    return run


def test_read_writes_chunks_and_joins_with_gaps(tmp_path):
    out = tts.read("A b c. D e f. G h i.", engine="fake", out=tmp_path / "n.wav", voice_ref=tmp_path / "v.wav",
                   backend=_fake_backend(), max_words=4, gap=0.35)
    parts = sorted(tmp_path.glob("n.part*.wav"))
    assert len(parts) == 3                      # three sentences, at most 4 words per chunk
    with wave.open(str(out)) as w:
        dur = w.getnframes() / w.getframerate()
    assert abs(dur - (9 * 0.05 + 2 * 0.35)) < 0.02


def test_wer_counts_substitutions_insertions_deletions():
    assert tts.wer("the cat sat on the mat", "the cat sat on the mat") == 0.0
    assert abs(tts.wer("the cat sat on the mat", "the cat sat the mat") - 1 / 6) < 1e-9
    assert abs(tts.wer("the cat sat on the mat", "the big cat sat on a mat") - 2 / 6) < 1e-9
