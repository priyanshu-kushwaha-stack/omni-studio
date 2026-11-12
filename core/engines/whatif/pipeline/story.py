"""script.md -> story.json for the what-if engine.

    python story.py <video folder>          writes <video folder>/story.json

A video folder is channels/<slug>/videos/<id>/. Reads its script.md (the owner-approved script), claims.md (the
source of every cited id), say.yaml (optional: the text the voice speaks for a line, when numbers need
spelling out or the delivery needs a direction such as "[whispers]"), timing.yaml (optional, the rough cut's:
"extra" seconds of action after a line, named "cues" as [line, word], "tempo" for every take and "tempo_lines" as
{line: tempo} exceptions) and the channel's voices.yaml. Without a timing.yaml, cues already in story.json are kept.

Script rules (channels/say-suppose/cast.md): bare lines under "## [mm:ss]" headings are spoken by the narrator;
"Name: text" is spoken by that character in their own voice (voices.yaml characters), without the name;
"> MOOD: x" sets the light for the lines after it; "> HOLD: N s" is a wordless gap of N seconds after the previous line; other "> " lines
are directions. The first "## " heading without a time ends the spoken script.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from pathlib import Path

import yaml

LEAD_IN = 0.4
GAP = 0.35
TAIL = 2.4
MOODS = ("morning", "day", "dusk", "night", "lamp", "frozen")
CITE_RE = re.compile(r"\s*\(((?:c\d{2,3})(?:\s*,\s*c\d{2,3})*)\)")
TIMED_HEADING = re.compile(r"^## \[\d{2}:\d{2}\]")
SKIP_PREFIXES = ("#", "|", "-", "format:", "status:", "claims:")
# "Lotte: ...", "Bank man: ...": a name of one to three words, capitalised, then a colon (cast.md).
SPEAKER_RE = re.compile(r"^([A-Z][\w'’-]*(?: [A-Za-z][\w'’-]*){0,2}):\s+(\S.*)$")
NARRATOR = "narrator"


def _ledger(text: str) -> dict[str, tuple[str, str]]:
    """id -> (source URL, status) from the first table with id, source and status columns."""
    rows: dict[str, tuple[str, str]] = {}
    header: list[str] | None = None
    for line in text.splitlines():
        if not line.lstrip().startswith("|"):
            header = None
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if header is None:
            header = [c.lower() for c in cells]
            continue
        if set("".join(cells)) <= set("-: "):
            continue
        col = {
            name: next((i for i, h in enumerate(header) if h.startswith(name)), None)
            for name in ("id", "source", "status")
        }
        if None in col.values():
            continue
        url = re.search(r"https?://\S+", cells[col["source"]])
        rows[cells[col["id"]]] = (url.group(0) if url else "", cells[col["status"]].lower())
    return rows


LOCAL_ENGINES = ("qwen3",)
DESIGN_ENGINES = ("qwen3-design",)


def _local_voice(channel: Path, narrator: dict) -> dict:
    """The free local narrator: a voice cloned on this Mac from a reference clip (voices.yaml narrator.local)."""
    local = narrator.get("local")
    if not isinstance(local, dict) or local.get("engine") not in LOCAL_ENGINES or not local.get("ref"):
        raise ValueError(f"voices.yaml narrator has use: local but no local entry with engine {LOCAL_ENGINES} and ref")
    ref = channel / str(local["ref"])
    return {
        "model": f"local:{local['engine']}",
        "voiceType": "local",
        "voiceId": hashlib.sha256(ref.read_bytes()).hexdigest()[:16],
        # Relative to the video folder, where story.json lives, so the same clip hashes the same in every checkout.
        "ref": str(Path("..", "..", local["ref"])),
        "refText": str(local.get("ref_text") or ""),
    }


def _voice(channel: Path, voices: dict) -> dict:
    narrator = voices["narrator"]
    # WHATIF_VOICE=paid|local overrides voices.yaml for one build: the final voice A/B (spec 2026-11-10, section 2).
    if (os.environ.get("WHATIF_VOICE") or narrator.get("use", "paid")) == "local":
        return _local_voice(channel, narrator)
    model = narrator["tool"].split()[-1]
    voice = {"model": model, "voiceType": narrator["voice_type"], "voiceId": narrator["voice_id"]}
    if narrator.get("variant"):
        voice["variant"] = narrator["variant"]
    return voice


def _character_voice(characters: dict, name: str) -> dict:
    """A character's free local voice, designed from a written description (voices.yaml characters): nobody is cloned.
    A name missing from the cast takes the stock voice of the first role word in its name (Bank man -> man), else
    anyone's, and is told so: never the narrator. The name goes into the voice id, which seeds the take, so two
    unlisted characters on one stock voice still sound apart."""
    engine = characters.get("engine")
    if engine not in DESIGN_ENGINES:
        raise ValueError(f"voices.yaml characters needs an engine from {DESIGN_ENGINES}, not {engine!r}")
    cast, stock = characters.get("cast") or {}, characters.get("stock") or {}
    describe = cast.get(name)
    if describe is None:
        role = next((w for w in name.lower().split() if w in stock), "anyone")
        if role not in stock:
            raise ValueError(f"voices.yaml characters has no voice for {name!r} and no stock voice {role!r}")
        print(f"voices.yaml: no voice for {name!r}; using the stock {role} voice", file=sys.stderr)
        describe = stock[role]
    describe = " ".join(str(describe).split())
    return {
        "model": f"local:{engine}",
        "voiceType": "design",
        "voiceId": hashlib.sha256(f"{name}\n{describe}".encode()).hexdigest()[:16],
        "describe": describe,
    }


def _voices(channel: Path, lines: list[dict]) -> tuple[dict, dict]:
    """The narrator's voice, and each speaking character's (name -> voice). Characters are always local and free."""
    data = yaml.safe_load((channel / "voices.yaml").read_text(encoding="utf-8"))["voices"]
    names = dict.fromkeys(l["speaker"] for l in lines if l["speaker"] != NARRATOR)
    if names and not isinstance(data.get("characters"), dict):
        raise ValueError(f"script.md has character lines ({', '.join(names)}) but voices.yaml has no characters entry")
    return _voice(channel, data), {n: _character_voice(data["characters"], n) for n in names}


def _spoken(line: str) -> tuple[str, str]:
    """(speaker, words spoken): "Lotte: One cent." is Lotte's "One cent."; a bare line is the narrator's."""
    m = SPEAKER_RE.match(line)
    return (m.group(1), m.group(2)) if m else (NARRATOR, line)


def _timing(video: Path, lines: list[dict], cues: dict) -> tuple[float | None, dict]:
    """timing.yaml: tempo, per-line tempo, extra action seconds after a line and word cues. Returns (tempo, cues)."""
    timing_path = video / "timing.yaml"
    if not timing_path.is_file():
        return None, cues
    timing = yaml.safe_load(timing_path.read_text(encoding="utf-8")) or {}
    tempo = float(timing["tempo"]) if timing.get("tempo") is not None else None
    for index, line_tempo in (timing.get("tempo_lines") or {}).items():
        lines[int(index)]["tempo"] = float(line_tempo)
    for index, seconds in (timing.get("extra") or {}).items():
        lines[int(index)]["gapAfterSec"] = round(lines[int(index)]["gapAfterSec"] + float(seconds), 3)
    cues = {}
    for name, (index, word) in (timing.get("cues") or {}).items():
        spoken = [re.sub(r"[^a-z0-9']", "", w.lower()) for w in lines[int(index)]["text"].split()]
        if re.sub(r"[^a-z0-9']", "", str(word).lower()) not in spoken:
            raise ValueError(
                f"timing.yaml cue {name}: {word!r} is not a word of line {index}: {lines[int(index)]['text']}"
            )
        cues[name] = {"line": int(index), "word": str(word)}
    return tempo, cues


def build(video: Path) -> dict:
    video = Path(video)
    ledger = _ledger((video / "claims.md").read_text(encoding="utf-8"))
    say_path = video / "say.yaml"
    say = yaml.safe_load(say_path.read_text(encoding="utf-8")) or {} if say_path.is_file() else {}

    lines: list[dict] = []
    lead_in = LEAD_IN
    mood = "day"
    in_script = False
    for raw in (video / "script.md").read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("## "):
            if TIMED_HEADING.match(line):
                in_script = True
                continue
            if in_script:
                break
        if not in_script or not line:
            continue
        if line.startswith(">"):
            body = line[1:].strip()
            if body.startswith("MOOD:"):
                mood = body[5:].strip().split()[0].lower()
                if mood not in MOODS:
                    raise ValueError(f"unknown mood {mood!r} in {raw!r}: use one of {', '.join(MOODS)}")
            elif body.startswith("HOLD:"):
                seconds = float(re.match(r"HOLD:\s*([\d.]+)\s*s", body).group(1))
                if lines:
                    # The first hold after a line replaces its normal gap; a second hold adds to it.
                    held = lines[-1].pop("_held", False)
                    lines[-1]["gapAfterSec"] = lines[-1]["gapAfterSec"] + seconds if held else seconds
                    lines[-1]["_held"] = True
                else:
                    lead_in += seconds
            continue
        if line.startswith(SKIP_PREFIXES):
            continue
        claims = [c.strip() for group in CITE_RE.findall(line) for c in group.split(",")]
        for cid in claims:
            if cid not in ledger:
                raise ValueError(f"script cites {cid}, which has no row in claims.md")
            if ledger[cid][1] == "dropped":
                raise ValueError(f"script cites {cid}, which claims.md marks dropped")
        text = CITE_RE.sub("", line).strip()
        speaker, words = _spoken(text)
        lines.append(
            {"text": text, "say": words, "speaker": speaker, "gapAfterSec": GAP, "mood": mood, "claims": claims}
        )

    for l in lines:
        l.pop("_held", None)
    by_text = {l["text"]: l for l in lines}
    for key, spoken in say.items():
        key = str(key).strip()
        if key not in by_text:
            raise ValueError(f"say.yaml: {key!r} is not a spoken line of script.md")
        by_text[key]["say"] = str(spoken)

    old = video / "story.json"
    cues = json.loads(old.read_text(encoding="utf-8")).get("cues", {}) if old.is_file() else {}
    tempo, cues = _timing(video, lines, cues)
    cited = [c for l in lines for c in l["claims"]]
    narrator, characters = _voices(video.parent.parent, lines)
    story = {
        "id": video.name,
        "voice": narrator,
        "voices": characters,
        "leadInSec": lead_in,
        "tailSec": TAIL,
        "lines": lines,
        "sources": {cid: ledger[cid][0] for cid in dict.fromkeys(cited)},
        "cues": cues,
    }
    if tempo is not None:
        story["tempo"] = tempo
    return story


if __name__ == "__main__":
    folder = Path(sys.argv[1])
    data = build(folder)
    (folder / "story.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{folder / 'story.json'}: {len(data['lines'])} lines, lead-in {data['leadInSec']:.1f} s")
