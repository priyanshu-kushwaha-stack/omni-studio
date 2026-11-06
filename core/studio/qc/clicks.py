"""Click/pop check: the engine's audio_check.py (bursts between words, sample steps, and the Short's 2.4 s tail).

The engine module is loaded by file under a private name, as tools/studio/studio_pou_tools.py does, so the
engine's sibling imports never leak into the studio's import path.
"""

from __future__ import annotations

import importlib.util
from functools import lru_cache
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
AUDIO_CHECK = ROOT / "core" / "engines" / "pou" / "scripts" / "audio_check.py"


@lru_cache(maxsize=1)
def _engine():
    spec = importlib.util.spec_from_file_location("studio_qc_audio_check", AUDIO_CHECK)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def check(media: Path, words: Path | None = None, short: bool = False) -> dict[str, Any]:
    if short and (words is None or not Path(words).is_file()):
        return {"check": "clicks", "ok": False, "problems": [
            f"a Short needs narration words.json for the 2.4 s fade-out tail check (looked for {words})"]}
    report = _engine().check(Path(media), Path(words) if words and Path(words).is_file() else None, short)
    problems = [f"click/pop at {b['t']:.3f} s: {b['dur'] * 1000:.0f} ms burst {b['rise_db']} dB above its "
                f"surroundings, between words (fade the line edge or mute the end-of-take pop)"
                for b in report["bursts"]]
    problems += [f"step at {s['t']:.3f} s: sample jump {s['jump']} > {s['limit']} (a cut mid-wave or an "
                 f"unramped volume change)" for s in report["steps"]]
    tail = report.get("tail")
    if tail and not tail["ok"]:
        problems.append(f"Short ending: {tail['tail_s']} s after the last word (want >= 2.4 s) and the end is "
                        f"{tail['end_db']} dB vs {tail['level_at_last_word_db']} dB at the last word "
                        f"(want >= 20 dB lower): it stops instead of fading out")
    return {"check": "clicks", "ok": not problems, "problems": problems,
            "in_word_bursts": report["in_word_bursts"], "seconds": report["seconds"], "tail": tail}
