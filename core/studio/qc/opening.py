"""Opening check: the first seconds are never empty (owner, 2026-11-08: "First 2 seconds are empty ... the attention
span is so low these days").

Two limits:
- something a phone can play starts within MAX_QUIET_S. Sound is measured above HIGHPASS_HZ, because a phone speaker
  barely plays below it (a 4th-order high-pass stands in for its roll-off), so a bare low note reads as silence;
- the first word starts within MAX_FIRST_WORD_S, read from the narration's words.json. The pause-time edit v5 opened
  on a low note and spoke at 2.4 s.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from typing import Any, Optional

MAX_QUIET_S = 0.5
MAX_FIRST_WORD_S = 1.0
HIGHPASS_HZ = 250
AUDIBLE_DBFS = -40.0
WINDOW_S = 0.1
SCAN_S = 4.0


class OpeningError(Exception):
    """The file could not be measured."""


def first_sound(media: Path) -> Optional[float]:
    """Seconds to the first WINDOW_S window above AUDIBLE_DBFS once the lows are cut; None if the first SCAN_S is quiet."""
    proc = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-nostats",
            "-i",
            str(media),
            "-vn",
            "-t",
            str(SCAN_S),
            "-af",
            f"highpass=f={HIGHPASS_HZ},highpass=f={HIGHPASS_HZ},aresample=48000,asetnsamples={int(48000 * WINDOW_S)},"
            "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level",
            "-f",
            "null",
            "-",
        ],
        capture_output=True,
        text=True,
    )
    levels = re.findall(r"RMS_level=(-?inf|-?[\d.]+)", proc.stderr)
    if proc.returncode != 0 or not levels:
        tail = proc.stderr.strip().splitlines()[-1:] or ["no output"]
        raise OpeningError(f"ffmpeg could not measure {media}: {tail[0]}")
    for i, level in enumerate(levels):
        if float(level) > AUDIBLE_DBFS:
            return round(i * WINDOW_S, 2)
    return None


def first_word(words: Optional[Path]) -> Optional[float]:
    if not words or not Path(words).is_file():
        return None
    spoken = json.loads(Path(words).read_text(encoding="utf-8"))
    return round(float(spoken[0]["start"]), 2) if spoken else None


def check(media: Path, words: Optional[Path] = None) -> dict[str, Any]:
    try:
        sound = first_sound(media)
    except OpeningError as exc:
        return {"check": "opening", "ok": False, "problems": [str(exc)]}
    word = first_word(words)
    problems = []
    if sound is None:
        problems.append(
            f"nothing a phone can play in the first {SCAN_S:.0f} s (above {HIGHPASS_HZ} Hz); open on "
            "the voice or a clear sound"
        )
    elif sound > MAX_QUIET_S:
        problems.append(
            f"the first {sound:.1f} s are empty on a phone speaker (nothing above {HIGHPASS_HZ} Hz); "
            f"start a sound within {MAX_QUIET_S} s"
        )
    if words is None:
        problems.append("no words.json: pass --words so the first word can be timed")
    elif word is None:
        problems.append(f"{words} has no words")
    elif word > MAX_FIRST_WORD_S:
        problems.append(f"the first word comes at {word:.1f} s; start speaking within {MAX_FIRST_WORD_S} s")
    return {"check": "opening", "ok": not problems, "problems": problems, "first_sound_s": sound, "first_word_s": word}
