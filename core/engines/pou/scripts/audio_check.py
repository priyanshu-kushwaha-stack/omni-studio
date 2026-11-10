#!/usr/bin/env python3
"""Scan a render's audio for the faults the owner hears as noise, and check a Short's ending.
  bursts  an isolated burst of 80 ms or less, at least 15 dB above the 40 ms on both sides (a TTS end-of-take
          pop, or a click at a hard cut into silence). With --words, a burst inside a spoken word (within 60 ms)
          is a consonant to listen to (WARN); a burst between words fails.
  steps   a sample-to-sample jump larger than 8x the p99 jump of the track's loud audio (and above 0.05):
          a cut that lands mid-wave, or a volume change with no ramp.
  tail    Shorts (--words given with --short): at least 2.4 s from the last spoken word to the end, and the last
          0.2 s at least 20 dB below the level at the last word, so the music fades out instead of stopping.
Exit 1 when anything fails. Prints one line per finding and a JSON summary."""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

SR = 48000
BURST_MAX = 0.08
BURST_RISE_DB = 15.0
BURST_SIDE = 0.04
STEP_FACTOR = 8.0
STEP_MIN = 0.05
SHORT_TAIL = 2.4
TAIL_DROP_DB = 20.0


def load(path: Path, sr: int = SR) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def _db(x: np.ndarray) -> float:
    return float(20 * np.log10(max(float(np.sqrt(np.mean(np.square(x, dtype=np.float64)))) if x.size else 0.0, 1e-9)))


def frame_db(x: np.ndarray, sr: int, hop: float = 0.005) -> np.ndarray:
    n = int(sr * hop)
    frames = x[: len(x) // n * n].reshape(-1, n).astype(np.float64)
    return 20 * np.log10(np.maximum(np.sqrt(np.mean(frames**2, axis=1)), 1e-9))


def bursts(x: np.ndarray, sr: int = SR, hop: float = 0.005) -> list[dict]:
    """Isolated short bursts: a run of frames no longer than BURST_MAX whose peak is BURST_RISE_DB above the mean
    level of the BURST_SIDE window on each side."""
    db = frame_db(x, sr, hop)
    side, longest = int(round(BURST_SIDE / hop)), int(round(BURST_MAX / hop))
    found: list[dict] = []
    i = side
    while i < len(db) - side:
        before = _db_mean(db[i - side : i])
        if db[i] - before < BURST_RISE_DB:
            i += 1
            continue
        j = i
        while j < len(db) and j - i < longest + 1 and db[j] - before >= BURST_RISE_DB - 6:
            j += 1
        if j - i <= longest and j + side <= len(db):
            peak = float(db[i:j].max())
            after = _db_mean(db[j : j + side])
            if peak - after >= BURST_RISE_DB:
                found.append(
                    {
                        "t": round(i * hop, 3),
                        "dur": round((j - i) * hop, 3),
                        "peak_db": round(peak, 1),
                        "rise_db": round(peak - max(before, after), 1),
                    }
                )
        i = j + 1
    return found


def _db_mean(db: np.ndarray) -> float:
    return float(10 * np.log10(np.mean(10 ** (db / 10)))) if db.size else -180.0


def steps(x: np.ndarray, sr: int = SR) -> tuple[list[dict], float]:
    d = np.abs(np.diff(x.astype(np.float64)))
    loud = np.repeat(frame_db(x, sr, 0.01) > -40, int(sr * 0.01))[: len(d)]
    p99 = float(np.percentile(d[: len(loud)][loud], 99)) if loud.any() else float(np.percentile(d, 99))
    limit = max(STEP_FACTOR * p99, STEP_MIN)
    idx = np.flatnonzero(d > limit)
    found, last = [], -1.0
    for k in idx:
        t = k / sr
        if t - last > 0.05:
            found.append({"t": round(t, 3), "jump": round(float(d[k]), 4), "limit": round(limit, 4)})
        last = t
    return found, p99


def tail(x: np.ndarray, words: list[dict], sr: int = SR) -> dict:
    duration = len(x) / sr
    last_word = max((float(w["end"]) for w in words), default=0.0)
    at_word = _db(x[max(0, int((last_word - 0.5) * sr)) : int(last_word * sr)])
    end = _db(x[max(0, len(x) - int(0.2 * sr)) :])
    return {
        "last_word_end": round(last_word, 3),
        "duration": round(duration, 3),
        "tail_s": round(duration - last_word, 3),
        "level_at_last_word_db": round(at_word, 1),
        "end_db": round(end, 1),
        "ok": duration - last_word >= SHORT_TAIL - 0.02 and at_word - end >= TAIL_DROP_DB,
    }


IN_WORD_SLACK = 0.06


def in_word(t: float, dur: float, words: list[dict]) -> bool:
    return any(float(w["start"]) - IN_WORD_SLACK <= t + dur and t <= float(w["end"]) + IN_WORD_SLACK for w in words)


def check(media: Path, words: Path | None = None, short: bool = False) -> dict:
    x = load(media)
    spoken = json.loads(words.read_text()) if words is not None else []
    found = bursts(x)
    b = [f for f in found if not in_word(f["t"], f["dur"], spoken)]
    consonants = [f for f in found if in_word(f["t"], f["dur"], spoken)]
    s, p99 = steps(x)
    report = {
        "media": str(media),
        "seconds": round(len(x) / SR, 3),
        "bursts": b,
        "in_word_bursts": consonants,
        "steps": s,
        "p99_jump": round(p99, 5),
    }
    if short and spoken:
        report["tail"] = tail(x, spoken)
    report["ok"] = not b and not s and report.get("tail", {"ok": True})["ok"]
    return report


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("media", type=Path, help="a render (mp4) or an audio file")
    p.add_argument("--words", type=Path, default=None, help="narration words.json, for the Short ending check")
    p.add_argument("--short", action="store_true", help="also check the Short's 2.4 s fade-out tail")
    a = p.parse_args()
    r = check(a.media, a.words, a.short)
    for f in r["bursts"]:
        print(f"[FAIL] {f['t']:7.3f}s burst {f['dur'] * 1000:.0f} ms, {f['rise_db']} dB above its surroundings")
    for f in r["in_word_bursts"]:
        print(f"[WARN] {f['t']:7.3f}s burst {f['dur'] * 1000:.0f} ms inside a word (a consonant?); listen")
    for f in r["steps"]:
        print(f"[FAIL] {f['t']:7.3f}s step {f['jump']} > {f['limit']}")
    if "tail" in r:
        t = r["tail"]
        print(
            f"[{'ok' if t['ok'] else 'FAIL'}] tail {t['tail_s']} s after the last word, end {t['end_db']} dB "
            f"vs {t['level_at_last_word_db']} dB at the last word"
        )
    print(
        json.dumps(
            {k: r[k] for k in ("media", "seconds", "p99_jump", "ok")}
            | {"bursts": len(r["bursts"]), "in_word_bursts": len(r["in_word_bursts"]), "steps": len(r["steps"])}
        )
    )
    return 0 if r["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
