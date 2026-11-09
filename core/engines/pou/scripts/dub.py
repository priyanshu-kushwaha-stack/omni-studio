#!/usr/bin/env python3
"""Dub track for a finished edit: a second-language narration fitted to the English timeline.

The video (scenes, overlays, SFX) is driven by the English word timings and stays as rendered. The dub
script (script_hi.md) mirrors script.md beat for beat: same sections, the same `> VISUAL:` lines in the
same order, each followed by that beat's spoken lines in the target language. Each beat is read as one
TTS request and fitted into the English beat's time window, so a dub never retimes the picture.

  manifest  pair the beats, take each beat's window from scene_plan.json (sNNN start = beat start),
            merge units whose window is shorter than --min-window into the next beat, write units JSON
            [{id, beats, text, start, end}] whose text goes to generate_audio_batch one unit per request
  fit       trim silence off each unit clip (<clips>/<id>.mp3), speed it up with atempo (at most
            --max-speed) when it runs past its window minus the gap, place it at the window start,
            write one narration wav and a fit report; units still over the window are listed as OVER

The result (narration-hi.wav) goes through compose.py --video-in for the music bed, ducking and SFX.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from narration_text import clean  # noqa: E402

SR = 48000
STOP = ("## Chapters", "## Sources")


@dataclass
class Beat:
    section: str
    desc: str
    lines: list[str]

    @property
    def text(self) -> str:
        return " ".join(clean(ln) for ln in self.lines).strip()


def beats(text: str) -> list[Beat]:
    """The `> VISUAL:` beats of a script in order, each with the spoken lines that follow it."""
    out: list[Beat] = []
    section = ""
    for line in text.splitlines():
        if line.startswith(STOP):
            break
        if line.startswith("## "):
            section = line[3:].strip()
        elif line.startswith("> VISUAL:"):
            out.append(Beat(section, line[len("> VISUAL:") :].strip(), []))
        elif line.startswith(">") or line.startswith("#") or not line.strip() or not out:
            continue
        else:
            out[-1].lines.append(line)
    return out


def pair(source: list[Beat], dub: list[Beat]) -> list[str]:
    """Problems that make the dub script not a beat-for-beat mirror of the source (empty = fine)."""
    problems = []
    if len(source) != len(dub):
        problems.append(f"beat count differs: source {len(source)}, dub {len(dub)}")
    for i, (s, d) in enumerate(zip(source, dub), 1):
        if s.desc != d.desc:
            problems.append(f"beat {i}: VISUAL line differs ({s.desc[:40]!r} vs {d.desc[:40]!r})")
        if s.section != d.section:
            problems.append(f"beat {i}: section differs ({s.section!r} vs {d.section!r})")
        if not d.text:
            problems.append(f"beat {i}: no spoken lines in the dub")
        refs_s = set(re.findall(r"\(c\d+(?:,\s*c\d+)*\)", " ".join(s.lines)))
        refs_d = set(re.findall(r"\(c\d+(?:,\s*c\d+)*\)", " ".join(d.lines)))
        if refs_s != refs_d:
            problems.append(f"beat {i}: claim refs differ (source {sorted(refs_s)}, dub {sorted(refs_d)})")
    return problems


def windows(plan: dict, n: int) -> list[tuple[float, float]]:
    """(start, end) of beats 1..n from the plan's sNNN scene starts; the last beat runs to the plan's end."""
    starts = {}
    for s in plan["scenes"]:
        m = re.fullmatch(r"s(\d{3})", s["id"])
        if m:
            starts[int(m.group(1))] = float(s["start_seconds"])
    missing = [i for i in range(1, n + 1) if i not in starts]
    if missing:
        raise SystemExit(f"scene plan has no sNNN scene for beats {missing}")
    total = float(plan["scenes"][-1]["end_seconds"])
    return [(starts[i], starts[i + 1] if i < n else total) for i in range(1, n + 1)]


def units(dub: list[Beat], wins: list[tuple[float, float]], min_window: float) -> list[dict]:
    """One TTS unit per beat, except that beats with a window under min_window join the next beat."""
    out: list[dict] = []
    carry: list[int] = []
    carry_text: list[str] = []
    carry_start: float | None = None
    for i, (b, (st, en)) in enumerate(zip(dub, wins), 1):
        carry.append(i)
        carry_text.append(b.text)
        carry_start = st if carry_start is None else carry_start
        if en - carry_start < min_window and i < len(dub):
            continue
        out.append(
            {"id": f"u{carry[0]:03d}", "beats": carry, "text": " ".join(carry_text), "start": carry_start, "end": en}
        )
        carry, carry_text, carry_start = [], [], None
    return out


# ---------------------------------------------------------------- fit


def decode(path: Path) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def trim(x: np.ndarray, threshold_db: float = -45.0, keep: float = 0.08, frame: float = 0.01) -> np.ndarray:
    """Cut leading and trailing silence, keeping `keep` seconds of room on each side."""
    n = max(1, int(frame * SR))
    nf = len(x) // n
    if nf == 0:
        return x
    rms = np.sqrt(np.mean(x[: nf * n].reshape(nf, n) ** 2, axis=1) + 1e-12)
    loud = np.flatnonzero(20 * np.log10(rms) > threshold_db)
    if len(loud) == 0:
        return x
    a = max(0, loud[0] * n - int(keep * SR))
    b = min(len(x), (loud[-1] + 1) * n + int(keep * SR))
    return x[a:b]


def stretch(x: np.ndarray, speed: float) -> np.ndarray:
    if abs(speed - 1.0) < 1e-3:
        return x
    raw = subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-f",
            "f32le",
            "-ac",
            "1",
            "-ar",
            str(SR),
            "-i",
            "-",
            "-af",
            f"atempo={speed:.4f}",
            "-f",
            "f32le",
            "-",
        ],
        input=x.astype(np.float32).tobytes(),
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def plan_fit(units_: list[dict], durations: list[float], gap: float, max_speed: float) -> list[dict]:
    """Per unit: the speed to apply, where it lands, and whether it still overruns its window.

    A unit that overruns even at max_speed pushes the next unit's start back (speech never overlaps);
    the report shows the drift so the text can be shortened.
    """
    out = []
    cursor = 0.0
    for u, d in zip(units_, durations):
        start = max(u["start"], cursor)
        avail = u["end"] - start - gap
        speed = 1.0 if d <= avail else d / max(avail, 0.05)
        clamped = min(speed, max_speed)
        fitted = d / clamped
        end = start + fitted
        over = max(0.0, end + gap - u["end"])
        out.append(
            {
                "id": u["id"],
                "window": [u["start"], u["end"]],
                "raw": round(d, 2),
                "speed": round(clamped, 3),
                "placed": [round(start, 2), round(end, 2)],
                "over": round(over, 2),
                "slack": round(u["end"] - end - gap, 2),
                "status": "OVER" if over > 0.05 else ("fast" if clamped > 1.0 else "ok"),
            }
        )
        cursor = end + (gap if over > 0.05 else 0.0)
    return out


def fit(units_: list[dict], clips: Path, out: Path, total: float, gap: float, max_speed: float) -> list[dict]:
    audio = [trim(decode(clips / f"{u['id']}.mp3")) for u in units_]
    rows = plan_fit(units_, [len(a) / SR for a in audio], gap, max_speed)
    track = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for a, r in zip(audio, rows):
        y = stretch(a, r["speed"])
        i = int(r["placed"][0] * SR)
        track[i : i + len(y)] += y[: max(0, len(track) - i)]
    track = track[: int(total * SR)]
    peak = float(np.max(np.abs(track))) or 1.0
    if peak > 0.89:
        track = track * (0.89 / peak)
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-f",
            "f32le",
            "-ac",
            "1",
            "-ar",
            str(SR),
            "-i",
            "-",
            "-c:a",
            "pcm_s16le",
            str(out),
        ],
        input=track.tobytes(),
        check=True,
    )
    return rows


def report(rows: list[dict]) -> str:
    lines = ["| unit | window | raw s | speed | placed | slack s | status |", "|---|---|---|---|---|---|---|"]
    for r in rows:
        lines.append(
            f"| {r['id']} | {r['window'][0]:.1f}-{r['window'][1]:.1f} | {r['raw']:.2f} | {r['speed']:.2f} | "
            f"{r['placed'][0]:.1f}-{r['placed'][1]:.1f} | {r['slack']:.2f} | {r['status']} |"
        )
    n_over = sum(r["status"] == "OVER" for r in rows)
    n_fast = sum(r["status"] == "fast" for r in rows)
    lines.append(f"\n{len(rows)} units, {n_fast} sped up, {n_over} OVER (shorten these lines and re-read them).")
    return "\n".join(lines)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    m = sub.add_parser("manifest")
    m.add_argument("video_dir", type=Path)
    m.add_argument("--dub-script", default="script_hi.md")
    m.add_argument("--min-window", type=float, default=3.5)
    m.add_argument("-o", "--out", type=Path, required=True)
    f = sub.add_parser("fit")
    f.add_argument("--manifest", type=Path, required=True)
    f.add_argument("--clips", type=Path, required=True)
    f.add_argument("-o", "--out", type=Path, required=True)
    f.add_argument("--report", type=Path, default=None)
    f.add_argument("--gap", type=float, default=0.35, help="silence to leave before the next window")
    f.add_argument("--max-speed", type=float, default=1.12)
    a = p.parse_args()
    if a.cmd == "manifest":
        src = beats((a.video_dir / "script.md").read_text())
        dub = beats((a.video_dir / a.dub_script).read_text())
        problems = pair(src, dub)
        if problems:
            raise SystemExit("dub script is not beat-for-beat:\n  " + "\n  ".join(problems))
        plan = json.loads((a.video_dir / "scene_plan.json").read_text())
        wins = windows(plan, len(src))
        us = units(dub, wins, a.min_window)
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(
            json.dumps({"total": float(plan["scenes"][-1]["end_seconds"]), "units": us}, ensure_ascii=False, indent=1)
        )
        print(f"{len(us)} units from {len(src)} beats, {sum(len(u['text']) for u in us)} chars -> {a.out}")
    else:
        man = json.loads(a.manifest.read_text())
        rows = fit(man["units"], a.clips, a.out, man["total"], a.gap, a.max_speed)
        text = report(rows)
        if a.report:
            a.report.write_text(text)
        print(text)


if __name__ == "__main__":
    main()
