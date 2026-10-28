#!/usr/bin/env python3
"""Narration from open TTS engines with the owner's cloned voice, behind one engine switch.
Long scripts are read in chunks at sentence ends (open models fail on long text: Chatterbox Turbo degenerates
into babble past ~40 s, so its chunks are ~50 words; Qwen3 holds ~200), the engine is loaded once per run, the
result is checked against the text with faster-whisper (WER), and the chunks are joined with short gaps into
one 16-bit narration wav that the rest of the pipeline reads as before.
Engines: qwen3 (mlx-audio, Qwen3-TTS 1.7B Base), chatterbox (chatterbox-tts), eleven (the existing Higgsfield
read, used only as the control in the blind test, not generated here)."""
from __future__ import annotations
import argparse
import json
import re
import subprocess
import sys
import wave
from pathlib import Path
from typing import Callable

MEDIA_PY = Path(__file__).resolve().parent.parent / ".venv-media" / "bin" / "python"
WHISPER_PY = Path.home() / "Exploration" / "sandbox" / "openmontage" / ".venv" / "bin" / "python"

Backend = Callable[[list[tuple[str, Path]], Path], list[Path]]   # (jobs of (text, out), voice_ref) -> outs
ENGINE_MAX_WORDS = {"qwen3": 200, "chatterbox": 50}


def chunk(text: str, max_words: int = 400) -> list[str]:
    sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s.strip()]
    out: list[str] = []
    cur: list[str] = []
    n = 0
    for s in sents:
        k = len(s.split())
        if cur and n + k > max_words:
            out.append(" ".join(cur))
            cur, n = [], 0
        cur.append(s)
        n += k
    if cur:
        out.append(" ".join(cur))
    return out


def _wav_frames(p: Path) -> tuple[bytes, int, int, int]:
    try:
        with wave.open(str(p)) as w:
            return w.readframes(w.getnframes()), w.getframerate(), w.getnchannels(), w.getsampwidth()
    except wave.Error:  # float wav (torchaudio default): rewrite as 16-bit PCM in place, then read it
        tmp = p.with_suffix(".pcm16.wav")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(p), "-c:a", "pcm_s16le", str(tmp)], check=True)
        tmp.replace(p)
        with wave.open(str(p)) as w:
            return w.readframes(w.getnframes()), w.getframerate(), w.getnchannels(), w.getsampwidth()


def join(parts: list[Path], out: Path, gap: float) -> Path:
    frames, sr, ch, sw = _wav_frames(parts[0])
    silence = b"\x00" * int(sr * gap) * ch * sw
    with wave.open(str(out), "wb") as w:
        w.setnchannels(ch); w.setsampwidth(sw); w.setframerate(sr)
        for i, p in enumerate(parts):
            f, sr2, ch2, sw2 = _wav_frames(p)
            if (sr2, ch2, sw2) != (sr, ch, sw):
                raise SystemExit(f"{p}: format differs from {parts[0]}")
            if i:
                w.writeframes(silence)
            w.writeframes(f)
    return out


def read(text: str, engine: str, out: Path, voice_ref: Path, backend: Backend | None = None,
         max_words: int | None = None, gap: float = 0.35) -> Path:
    backend = backend or BACKENDS[engine]
    max_words = max_words or ENGINE_MAX_WORDS.get(engine, 200)
    out.parent.mkdir(parents=True, exist_ok=True)
    jobs = [(c, out.with_name(f"{out.stem}.part{i:02d}.wav")) for i, c in enumerate(chunk(text, max_words), 1)]
    parts = backend(jobs, voice_ref)
    return join(parts, out, gap)


def _norm(s: str) -> list[str]:
    return re.sub(r"[^a-z0-9' ]+", " ", s.lower()).split()


def wer(ref: str, hyp: str) -> float:
    r, h = _norm(ref), _norm(hyp)
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            cur = d[j]
            d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1]))
            prev = cur
    return d[len(h)] / max(len(r), 1)


def transcribe(wav: Path, whisper_python: Path = WHISPER_PY) -> str:
    code = ("import sys,json\nfrom faster_whisper import WhisperModel\nm=WhisperModel('small')\n"
            "segs,_=m.transcribe(sys.argv[1])\nprint(json.dumps(' '.join(s.text for s in segs)))")
    r = subprocess.run([str(whisper_python), "-c", code, str(wav)], capture_output=True, text=True, check=True)
    return json.loads(r.stdout.strip().splitlines()[-1])


def check(wav: Path, text: str, whisper_python: Path = WHISPER_PY) -> float:
    return wer(text, transcribe(wav, whisper_python))


# ---------------------------------------------------------------- real engines (run in .venv-media)

def _run_media(code: str, jobs: list[tuple[str, Path]], voice_ref: Path) -> list[Path]:
    """Run `code` once in .venv-media with JOBS (list of [text, out]) and VOICE on stdin, so the model loads once."""
    payload = json.dumps({"voice": str(voice_ref), "jobs": [[t, str(o)] for t, o in jobs]})
    subprocess.run([str(MEDIA_PY), "-c", code], input=payload, text=True, check=True)
    missing = [o for _, o in jobs if not o.exists()]
    if missing:
        raise SystemExit(f"engine produced no wav for {missing[0]}")
    return [o for _, o in jobs]


_QWEN3 = """import sys, json, shutil
from pathlib import Path
from mlx_audio.tts.generate import generate_audio
spec = json.load(sys.stdin)
for text, out in spec["jobs"]:
    out = Path(out); prefix = out.with_suffix("")
    generate_audio(text=text, model_path="mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16", ref_audio=spec["voice"],
                   file_prefix=str(prefix), audio_format="wav", join_audio=True, verbose=False)
    for c in (out, out.with_name(out.stem + "_000.wav")):
        if c.exists() and c != out:
            shutil.move(c, out)
"""

_CHATTERBOX = """import sys, json, torchaudio as ta
from chatterbox.tts_turbo import ChatterboxTurboTTS
spec = json.load(sys.stdin)
m = ChatterboxTurboTTS.from_pretrained(device="cpu")
for text, out in spec["jobs"]:
    w = m.generate(text, audio_prompt_path=spec["voice"])
    ta.save(out, w, m.sr, encoding="PCM_S", bits_per_sample=16)
    print(out, round(w.shape[-1] / m.sr, 1), "s", flush=True)
"""


def _qwen3(jobs: list[tuple[str, Path]], voice_ref: Path) -> list[Path]:
    return _run_media(_QWEN3, jobs, voice_ref)


def _chatterbox(jobs: list[tuple[str, Path]], voice_ref: Path) -> list[Path]:
    return _run_media(_CHATTERBOX, jobs, voice_ref)


BACKENDS: dict[str, Backend] = {"qwen3": _qwen3, "chatterbox": _chatterbox}


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("text", type=Path, help="plain text file (output of narration_text.py, one part)")
    p.add_argument("--engine", choices=sorted(BACKENDS), required=True)
    p.add_argument("--voice-ref", type=Path, required=True, help="clean wav of the owner's voice (10 s to 3 min)")
    p.add_argument("-o", "--out", type=Path, required=True)
    p.add_argument("--max-words", type=int, default=None, help="chunk size; default per engine (qwen3 200, chatterbox 50)")
    p.add_argument("--gap", type=float, default=0.35)
    p.add_argument("--check", action="store_true", help="transcribe the result and print the word error rate")
    a = p.parse_args()
    text = a.text.read_text().strip()
    out = read(text, a.engine, a.out, a.voice_ref, max_words=a.max_words, gap=a.gap)
    info = {"out": str(out), "chunks": len(chunk(text, a.max_words or ENGINE_MAX_WORDS.get(a.engine, 200)))}
    if a.check:
        info["wer"] = round(check(out, text), 4)
    print(json.dumps(info))


if __name__ == "__main__":
    main()
