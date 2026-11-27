"""One place that turns a wav array from scipy.io.wavfile into floats at its true level, by dtype."""

from __future__ import annotations

import numpy as np


def to_float(x: np.ndarray) -> np.ndarray:
    """int16 / 32768, int32 / 2**31, uint8 (x-128)/128, floats as they are. Never guesses from the peak."""
    if x.dtype.kind == "f":
        return x.astype("float64")
    info = np.iinfo(x.dtype)
    mid = 0 if x.dtype.kind == "i" else (info.max + 1) / 2
    return (x.astype("float64") - mid) / (info.max + 1 - mid)
