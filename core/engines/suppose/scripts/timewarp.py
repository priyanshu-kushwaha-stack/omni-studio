"""Film time on the voice B timeline <-> film time on the final narration (pilot timewarp.ts, in Python)."""

from __future__ import annotations

import numpy as np


def knots(old: dict, new: dict, old_end: float) -> tuple[list[float], list[float]]:
    o, n = [0.0], [0.0]
    for a, b in zip(old["cues"], new["cues"], strict=True):
        o += [a["start"], a["end"]]
        n += [b["start"], b["end"]]
    o.append(old_end)
    n.append(new["cues"][-1]["end"] + (old_end - old["cues"][-1]["end"]))
    return o, n


def warp(t: float, k: tuple[list[float], list[float]]) -> float:
    return float(np.interp(t, k[0], k[1]))


def unwarp(t: float, k: tuple[list[float], list[float]]) -> float:
    return float(np.interp(t, k[1], k[0]))
