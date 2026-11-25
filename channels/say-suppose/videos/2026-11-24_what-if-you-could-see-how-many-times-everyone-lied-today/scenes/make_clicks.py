"""script.md's clicks -> scenes/clickData.ts: the counter's sound (the rule device, rules/sound.md #8), placed where the
script says a counter clicks, so picture and sound agree with no hand copying.

    python scenes/make_clicks.py

A `> HOLD: N s. Performed. ...` line that says "click" (not "no click", not "nothing clicks") clicks after the spoken
line before it: as many times as it says "click" ("Click, click, click" is three; "four click" is four), the first
0.2 s into the hold, spread over the hold's first half; a lone click said late in the hold text ("... the fourth shakes
his, click, and ...") lands that far into the hold. The wordless peak clicks once per lie line it shows (thirteen,
from one to fourteen). A narrator line "Click. ..." clicks as it starts.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE.parent / "script.md"
TIMED = re.compile(r"^## \[\d{2}:\d{2}\]")
HOLD = re.compile(r"^> HOLD:\s*([\d.]+)\s*s\.\s*(.*)$")
CITE = re.compile(r"\s*\((?:c\d{2,3})(?:\s*,\s*c\d{2,3})*\)")
WORDS = {"two": 2, "three": 3, "four": 4, "five": 5}


def main() -> None:
    lines = SCRIPT.read_text(encoding="utf-8").splitlines()
    out, last, on = [], None, False
    for raw in lines:
        s = raw.strip()
        if s.startswith("## "):
            on = bool(TIMED.match(s))
            continue
        if not on or not s:
            continue
        m = HOLD.match(s)
        if m and last:
            secs, text = float(m.group(1)), m.group(2)
            low = text.lower()
            if "wordless peak" in low:
                out.append({"after": last[:60], "at": [round(0.4 + k * (secs - 1.2) / 12, 2) for k in range(13)]})
                continue
            low = low.replace("no click", "").replace("nothing clicks", "")
            n = len(re.findall(r"\bclick\b", low))
            if not n:
                continue
            said = re.search(r"\b(two|three|four|five) click\b", low)
            if said:
                n = WORDS[said.group(1)]
            first = low.find("click")
            if n == 1 and first > 40:
                at = [round(min(secs - 0.4, secs * first / max(1, len(low))), 2)]
            else:
                gap = min(0.45, (secs * 0.5) / max(1, n)) if n > 1 else 0
                gap = max(gap, 0.3) if n > 1 and n <= 3 else (secs * 0.7 / n if n > 3 else gap)
                at = [round(0.2 + k * gap, 2) for k in range(n)]
            out.append({"after": last[:60], "at": at, "soft": "soft click" in low})
            continue
        if s.startswith((">", "#", "|", "-")):
            continue
        text = CITE.sub("", s)
        if text.startswith("Click."):
            out.append({"on": text[:60], "at": [0.0]})
        last = text
    (HERE / "clickData.ts").write_text(
        "// Made by make_clicks.py from script.md. Do not edit by hand.\n"
        "export type ClickItem = { after?: string; on?: string; at: number[]; soft?: boolean };\n"
        f"export const CLICKS: ClickItem[] = {json.dumps(out, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"{sum(len(c['at']) for c in out)} clicks in {len(out)} places -> {HERE / 'clickData.ts'}")


if __name__ == "__main__":
    main()
