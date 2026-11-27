"""Film time on the voice B timeline <-> film time on the final narration (pilot timewarp.ts, in Python).

python timewarp.py <video_dir> --from cues_b.json --to cues_luc.json
    writes <video_dir>/film-luc.json: film.json with every time mapped from the --from cues to the --to cues.
    Cue paths are relative to <video_dir> unless absolute (e.g. audio/cues_b.json).
"""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

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


def _shot_times(shot: dict, w) -> None:
    for key in ("from", "to"):
        shot[key] = round(w(shot[key]), 4)
    for cast in shot.get("cast", []):
        for act in cast.get("acts", []):
            for key in ("at", "to"):
                if key in act:
                    act[key] = round(w(act[key]), 4)
    for group, keys in (("labels", ("at", "to")), ("lines", ("at",)), ("sfx", ("at",))):
        for item in shot.get(group, []):
            for key in keys:
                if key in item:
                    item[key] = round(w(item[key]), 4)
    if shot.get("readout"):
        shot["readout"]["at"] = round(w(shot["readout"]["at"]), 4)


def warp_film(film: dict, k: tuple[list[float], list[float]]) -> dict:
    """A copy of film.json with every time warped: shot from/to, act at/to, label at/to, line, sfx and readout at,
    beats and the duration. Positions (`at: [x, y]`, act `from: [x, y]`) are not times and stay."""
    out = copy.deepcopy(film)

    def w(t: float) -> float:
        return warp(t, k)

    for shot in out["shots"]:
        _shot_times(shot, w)
    for beat in out.get("beats", []):
        beat["at"] = round(w(beat["at"]), 4)
    out["duration"] = round(w(out["duration"]), 4)
    return out


def main(argv: list[str]) -> Path:
    video = Path(argv[0]).resolve()
    opts = dict(zip(argv[1::2], argv[2::2], strict=False))

    def cues(name: str) -> dict:
        p = Path(opts[name])
        return json.loads((p if p.is_absolute() else video / p).read_text())

    film = json.loads((video / "film.json").read_text())
    out = video / "film-luc.json"
    k = knots(cues("--from"), cues("--to"), film["duration"])
    out.write_text(json.dumps(warp_film(film, k), indent=1), encoding="utf-8")
    return out


if __name__ == "__main__":
    print(main(sys.argv[1:]))
