"""Loudness check: integrated LUFS, true peak and loudness range against the channel's per-format targets.

Measured with ffmpeg's ebur128 meter (EBU R128 / ITU-R BS.1770, true peak oversampled). ffmpeg's loudnorm
analysis was tried first, but its LRA reads far too high on short files (8.9 LU vs 1.2 LU from ebur128). Targets live in channel.yaml
under `loudness.<format>` (see `channels.LoudnessTarget`). No new dependency: OpenMontage's audio_energy tool
uses ffmpeg's ebur128 for momentary loudness only, and visual_qa's audio_levels is volumedetect (dBFS, not LUFS).
"""

from __future__ import annotations

import math
import re
import subprocess
from pathlib import Path
from typing import Any


class LoudnessError(Exception):
    """The file could not be measured."""


def measure(media: Path) -> dict[str, float]:
    """{integrated_lufs, true_peak_dbtp, lra_lu} from the summary of ffmpeg's ebur128 meter (peak=true)."""
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", str(media), "-vn", "-af", "ebur128=peak=true",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    summary = proc.stderr.rsplit("Summary:", 1)[-1] if "Summary:" in proc.stderr else ""
    found = {key: re.search(rf"{label}:\s+(-?inf|-?[\d.]+)", summary)
             for key, label in (("integrated_lufs", "I"), ("lra_lu", "LRA"), ("true_peak_dbtp", "Peak"))}
    if proc.returncode != 0 or not all(found.values()):
        tail = proc.stderr.strip().splitlines()[-1:] or ["no output"]
        raise LoudnessError(f"ffmpeg could not measure {media}: {tail[0]}")
    # float() reads "-inf" for silence. ebur128 prints true peak in dBFS of the oversampled signal, i.e. dBTP.
    return {key: float(m.group(1)) for key, m in found.items()}


def evaluate(measured: dict[str, float], target: dict[str, Any]) -> list[str]:
    """Plain-language failures; empty when the mix is inside every target."""
    problems = []
    i, tp, lra = measured["integrated_lufs"], measured["true_peak_dbtp"], measured["lra_lu"]
    lo = target["integrated_lufs"] - target["tolerance_lu"]
    hi = target["integrated_lufs"] + target["tolerance_lu"]
    if not math.isfinite(i):
        problems.append("integrated loudness is -inf: the audio is silent")
    elif i > hi:
        problems.append(f"too loud: integrated {i:.1f} LUFS is above {hi:.1f} "
                        f"(target {target['integrated_lufs']} ±{target['tolerance_lu']} LU); turn the mix down")
    elif i < lo:
        problems.append(f"too quiet: integrated {i:.1f} LUFS is below {lo:.1f} "
                        f"(target {target['integrated_lufs']} ±{target['tolerance_lu']} LU); turn the mix up")
    if tp > target["true_peak_dbtp_max"]:
        problems.append(f"true peak {tp:.2f} dBTP is above the {target['true_peak_dbtp_max']} dBTP ceiling; limit it")
    if lra > target["lra_lu_max"]:
        problems.append(f"loudness range {lra:.1f} LU is above {target['lra_lu_max']} LU; compress or ride the mix")
    return problems


def check(media: Path, target: dict[str, Any]) -> dict[str, Any]:
    measured = measure(media)
    problems = evaluate(measured, target)
    return {"check": "loudness", "ok": not problems, "measured": measured, "target": dict(target),
            "problems": problems}
