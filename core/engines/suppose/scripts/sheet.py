"""The Say Suppose shot sheet: the format, its vocabularies and the loader.

```yaml
film: <video id>
fps: 30
size: [1280, 720]
audio: audio/mix.wav            # the mix the cut plays
beats: [{at: 23.2, name: list}]  # story beats; readout changes should sit on one (L5.2)
shots:
  - id: s01
    from: 0.0                   # seconds on the narration timeline
    to: 3.77
    type: wide                  # one of SHOT_TYPES
    set: station                # library set id (not needed for data, blueprint, title, end)
    angle: high                 # an angle of that set
    camera: {move: push, z: [1.0, 1.3], focus: [640, 420]}
    mood: warm                  # warm | cool | void | blueprint (W7)
    cast:
      - {who: scarf, at: [640, 470], acts: [{act: idle}, {act: react, mood: worried, at: 2.1}]}
    crowd: [{band: back, n: 22, speed: 95, seed: 0}]
    lines: [{who: kenji, at: 37.2}]           # character lines in this shot; the speaker must be in cast
    labels: [{kind: data, text: "≈ 3,500,000", says: "three and a half million", at: 6.0, to: 9.6}]
    readout: {text: "99 / 100", at: 23.2}
    sfx: [{name: whoosh, at: 23.2, gain: 0.06}]
    letterbox: scope            # optional (W7)
    hold: "the joke lands"      # required reason for a shot whose longest unchanged stretch is over 5 s
    custom: S2                  # optional: a hand-built shot exported from custom/*.tsx
```
"""

from pathlib import Path

import yaml

SHOT_TYPES = (
    "wide", "two", "ots", "face", "insert", "top", "freeze", "data", "blueprint", "title", "end", "custom",
)  # fmt: skip
MIX = {"wide": 0.10, "two": 0.25, "ots": 0.10, "face": 0.125, "insert": 0.10, "top": 0.05}  # W1 shares
MOVES = ("push", "pull", "drift", "pan", "roll", "shake", "crane", "track", "still")
ACTS = (
    "idle", "walkIn", "walkOut", "stop", "wave", "point", "shout", "lookAt", "react", "hold", "turn", "run",
    "reach", "shrug", "cheer", "armsCrossed", "explain", "handOff",
)  # fmt: skip
MOODS = (
    "neutral", "smile", "happy", "joy", "surprised", "shocked", "scared", "worried", "nervous", "angry",
    "determined", "sad", "cry", "smirk", "sleepy", "thinking", "confused", "awe",
)  # fmt: skip
NUMBER_WORDS = {
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "thirty", "forty",
    "fifty", "sixty", "seventy", "eighty", "ninety", "hundred", "thousand", "million", "billion", "half", "quarter",
}  # fmt: skip
NO_SET = {"data", "blueprint", "title", "end", "custom"}
EPS = 0.02


def load_sheet(path: Path) -> dict:
    return yaml.safe_load(Path(path).read_text(encoding="utf-8"))
