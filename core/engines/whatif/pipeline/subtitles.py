"""Subtitles (SRT) from the script, not from speech recognition, so the words are exactly what was written.

    python subtitles.py <video folder> en                       -> <video>/subtitles/en.srt
    python subtitles.py <video folder> <lang> <dub script.md>   -> <video>/subtitles/<lang>.srt

English: the narration lines in assets/narration/props.json, timed by the clips, with each sentence's start and end
taken from narration/words.json (the words that fall inside the clip, split in proportion to the sentence's length).
A dub language: the lines of its script (`N | room | [direction] text`), timed by dub/<lang>/placed.json
(dub_narration.py); its sentences share the line's time in proportion to their length, because Whisper's word times
are unreliable for Hindi. Lines named in the dub script's countdown reuse the English text.

A cue holds as many whole sentences of one line as fit in MAX_LINES lines of MAX_CHARS characters (short sentences
flashing by on their own read badly); a longer sentence is split at a comma or between words into several cues. Every cue lasts at least MIN_CUE seconds where the next cue allows.
"""

from __future__ import annotations

import json
import re
import sys
import textwrap
from pathlib import Path

FPS = 30
MAX_CHARS = 42
MAX_LINES = 2
MIN_CUE = 1.0
SENTENCE = re.compile(r"(?<=[.!?।])\s+")


def stamp(seconds: float) -> str:
    ms = round(seconds * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def fits(text: str) -> bool:
    return len(textwrap.wrap(text, MAX_CHARS)) <= MAX_LINES


def chunks(sentence: str) -> list[str]:
    """A sentence as cue texts of at most MAX_LINES wrapped lines each, split at a comma when one fits."""
    if fits(sentence):
        return [sentence]
    parts = re.split(r"(?<=,)\s+", sentence)
    if len(parts) > 1 and all(fits(p) for p in parts):
        out, cur = [], ""
        for p in parts:
            if cur and not fits(f"{cur} {p}"):
                out.append(cur)
                cur = p
            else:
                cur = f"{cur} {p}".strip()
        return out + [cur]
    lines = textwrap.wrap(sentence, MAX_CHARS)
    return [" ".join(lines[i:i + MAX_LINES]) for i in range(0, len(lines), MAX_LINES)]


def cues_for_line(text: str, start: float, end: float, word_times: list[tuple[float, float]] | None = None):
    """(start, end, text) per cue. With word_times, cue edges follow the spoken words; otherwise by length."""
    pieces = []
    for c in (c for s in SENTENCE.split(text.strip()) if s for c in chunks(s)):
        if pieces and fits(f"{pieces[-1]} {c}"):
            pieces[-1] = f"{pieces[-1]} {c}"
        else:
            pieces.append(c)
    total = sum(len(p) for p in pieces) or 1
    out, done = [], 0
    for p in pieces:
        a_frac, b_frac = done / total, (done + len(p)) / total
        done += len(p)
        if word_times:
            n = len(word_times)
            first, last = min(n - 1, int(a_frac * n)), max(0, min(n - 1, round(b_frac * n) - 1))
            a, b = word_times[first][0], word_times[max(first, last)][1]
        else:
            a, b = start + a_frac * (end - start), start + b_frac * (end - start)
        out.append((a, b, p))
    return out


def to_srt(cues: list[tuple[float, float, str]]) -> str:
    cues = sorted(cues)
    blocks = []
    for i, (a, b, text) in enumerate(cues):
        nxt = cues[i + 1][0] if i + 1 < len(cues) else b + MIN_CUE
        b = min(max(b, a + MIN_CUE), nxt - 0.02) if nxt > a else b
        wrapped = "\n".join(textwrap.wrap(text, MAX_CHARS))
        blocks.append(f"{i + 1}\n{stamp(a)} --> {stamp(b)}\n{wrapped}\n")
    return "\n".join(blocks)


def english(video: Path) -> str:
    props = json.loads((video / "assets" / "narration" / "props.json").read_text(encoding="utf-8"))
    words = json.loads((video / "narration" / "words.json").read_text(encoding="utf-8"))
    cues = []
    for clip, line in zip(props["timeline"]["clips"], props["lines"]):
        a, b = clip["from"] / FPS, (clip["from"] + clip["frames"]) / FPS
        inside = [(w["start"], w["end"]) for w in words if a - 0.05 <= w["start"] < b + 0.05]
        cues += cues_for_line(line["text"], a, b, inside or None)
    return to_srt(cues)


def dub(video: Path, lang: str, script: Path) -> str:
    placed = {p["line"]: p for p in json.loads((video / "dub" / lang / "placed.json").read_text(encoding="utf-8"))}
    props = json.loads((video / "assets" / "narration" / "props.json").read_text(encoding="utf-8"))
    cues = []
    for raw in script.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^(\d+) \| [\d.]+ s \| (?:\[[^\]]*\]\s*)?(.+)$", raw)
        if not m or int(m.group(1)) not in placed:
            continue
        n, text = int(m.group(1)), m.group(2).replace("...", "…")
        if not re.search(r"[ऀ-ॿ]", text):      # a line the dub keeps in English (the countdown)
            text = props["lines"][n]["text"]
        cues += cues_for_line(text, placed[n]["start"], placed[n]["end"])
    return to_srt(cues)


if __name__ == "__main__":
    folder, lang = Path(sys.argv[1]), sys.argv[2]
    srt = english(folder) if lang == "en" else dub(folder, lang, Path(sys.argv[3]))
    out = folder / "subtitles" / f"{lang}.srt"
    out.parent.mkdir(exist_ok=True)
    out.write_text(srt, encoding="utf-8")
    print(out, srt.count(" --> "), "cues")
