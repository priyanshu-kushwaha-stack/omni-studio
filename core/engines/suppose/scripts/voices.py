"""Free local voices for a film: voice B narration (a Qwen3 clone) and each character's own designed voice
(Qwen3 VoiceDesign, one seed per character), through the what-if engine's local_tts.py. All local, no paid call.

python voices.py <video_dir>   (reads cast-pass.yaml; writes audio/takes/, audio/narration.wav, cues and words)
python voices.py --to-maps <video_dir> <library_dir>
    at G3: writes each <video_dir>/voices.yaml entry into <library_dir>/cast/maps/<id>.yaml as `voice: {desc, seed}`
    (rig.py then carries it into cast.json).
python voices.py --sweep <video_dir> <id> [seed seed seed]
    three takes of the character's first cast-pass line (or a stock line), one per seed (default 11 23 37), to
    audio/sweep/<id>_seed<N>.wav, from the `desc` in <video_dir>/voices.yaml; pick one by ear and write its `seed`.

A character's voice is `{desc, seed}`: from the library cast (cast.json `voice`, carried from the map file's `voice:`
by rig.py), overlaid by <video_dir>/voices.yaml (`{<id>: {desc, seed}}`, the video's entry wins). At G3 the
voices.yaml entries move into the cast map files (studio-suppose-final-watch step 0).
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import yaml

from library import Library, main_checkout

REPO = Path(__file__).resolve().parents[4]
WHATIF = REPO / "core" / "engines" / "whatif" / "pipeline"
VOICE_DIR = Path("channels") / "say-suppose" / "brand" / "voice"
SWEEP_SEEDS = (11, 23, 37)
STOCK_LINE = "Wait. You mean every single one of them? Okay. Okay, I can live with that."


def voice_table(cast: dict, video: Path) -> dict[str, dict]:
    """{id: {desc, seed}}: the cast library's voices, overlaid by the video's voices.yaml (its entry wins)."""
    table = {cid: c["voice"] for cid, c in cast.items() if c.get("voice")}
    p = Path(video) / "voices.yaml"
    local = (yaml.safe_load(p.read_text(encoding="utf-8")) or {}) if p.is_file() else {}
    if not isinstance(local, dict):
        raise SystemExit(f"{p}: expected a mapping of character id -> {{desc, seed}}")
    table.update(local)
    return table


def _voice(voices: dict, who: str, need_seed: bool = True) -> dict:
    v = voices.get(who) or {}
    if not v.get("desc") or (need_seed and v.get("seed") is None):
        raise SystemExit(
            f"{who} has no voice: add `{who}: {{desc: ..., seed: N}}` to <video>/voices.yaml (desc from"
            " prompts/character-voice.md, seed from `voices.py --sweep`)"
        )
    return v


def jobs(lines: list[dict], voices: dict, narrator_ref: Path, narrator_text: str, out_dir: Path) -> dict:
    """The local_tts.py spec: qwen3 clone for narrator lines, qwen3-design (instruct + seed) for characters.
    `voices` is voice_table's {id: {desc, seed}}."""
    out = []
    for ln in lines:
        path = str(Path(out_dir) / f"{ln['n']:03d}_{ln['speaker']}.wav")
        if ln["speaker"] == "narrator":
            out.append(
                {
                    "engine": "qwen3",
                    "text": ln["text"],
                    "out": path,
                    "ref": str(narrator_ref),
                    "ref_text": narrator_text,
                }
            )
            continue
        voice = _voice(voices, ln["speaker"])
        out.append(
            {
                "engine": "qwen3-design",
                "text": ln["text"],
                "out": path,
                "instruct": voice["desc"],
                "seed": voice["seed"],
            }
        )
    return {"jobs": out}


def sweep_jobs(who: str, voices: dict, text: str, seeds, out_dir: Path) -> dict:
    """Three (or more) qwen3-design takes of one line, one per seed, for picking a character's seed by ear."""
    desc = _voice(voices, who, need_seed=False)["desc"]
    return {
        "jobs": [
            {
                "engine": "qwen3-design",
                "text": text,
                "out": str(Path(out_dir) / f"{who}_seed{int(s)}.wav"),
                "instruct": desc,
                "seed": int(s),
            }
            for s in seeds
        ]
    }


def sweep(video_dir: str, who: str, seeds: list[str]) -> Path:
    video = Path(video_dir).resolve()
    voices = voice_table(Library.for_channel("say-suppose", video).cast, video)
    cp = video / "cast-pass.yaml"
    lines = (yaml.safe_load(cp.read_text()) or {}).get("lines", []) if cp.is_file() else []
    text = next((ln["text"] for ln in lines if ln.get("speaker") == who), STOCK_LINE)
    out_dir = video / "audio" / "sweep"
    out_dir.mkdir(parents=True, exist_ok=True)
    spec = sweep_jobs(who, voices, text, [int(s) for s in seeds] or SWEEP_SEEDS, out_dir)
    (out_dir / f"{who}_spec.json").write_text(json.dumps(spec, indent=1))
    run(out_dir / f"{who}_spec.json")
    return out_dir


def set_map_voice(map_path: Path, voice: dict) -> None:
    """Replace (or add) the map file's top-level `voice:` with {desc, seed}; every other line, comments too, stays."""
    keep, skipping = [], False
    for line in Path(map_path).read_text(encoding="utf-8").splitlines():
        if line.startswith("voice:"):
            skipping = True
            continue
        if skipping and line[:1] in (" ", "\t"):
            continue
        skipping = False
        keep.append(line)
    flow = yaml.safe_dump(
        {"voice": {"desc": voice["desc"], "seed": int(voice["seed"])}}, default_flow_style=None, width=1000
    )
    Path(map_path).write_text("\n".join([*keep, flow.strip()]) + "\n", encoding="utf-8")


def to_maps(video_dir: str, library_dir: str) -> list[Path]:
    video, maps = Path(video_dir), Path(library_dir) / "cast" / "maps"
    local = voice_table({}, video)
    missing = [cid for cid in local if not (maps / f"{cid}.yaml").is_file()]
    if missing:
        raise SystemExit(f"no cast map for {', '.join(missing)} in {maps}; move the video's maps in first")
    done = []
    for cid in local:
        set_map_voice(maps / f"{cid}.yaml", _voice(local, cid))
        done.append(maps / f"{cid}.yaml")
    return done


def _media_py() -> str:
    return str(main_checkout() / ".venv-media" / "bin" / "python")


def run(spec_path: Path) -> None:
    subprocess.run([_media_py(), str(WHATIF / "local_tts.py"), str(spec_path)], check=True)


def words(paths: list[Path]) -> None:
    """transcribe.py writes <path>.words.json next to each wav."""
    subprocess.run([_media_py(), str(WHATIF / "transcribe.py"), *map(str, paths)], check=True)


def convert_words(raw: object) -> list[dict]:
    """transcribe.py's word list as sheetcheck reads it: [{"word", "start", "end"}]."""
    return [{"word": str(w["word"]), "start": float(w["start"]), "end": float(w["end"])} for w in raw]  # type: ignore[attr-defined]


def write_words(wav: Path, out: Path) -> None:
    raw = json.loads(Path(f"{wav}.words.json").read_text(encoding="utf-8"))
    out.write_text(json.dumps(convert_words(raw), ensure_ascii=False), encoding="utf-8")


def main(video_dir: str) -> None:
    from stitch import gap_after, stitch

    video = Path(video_dir).resolve()
    voice = main_checkout() / VOICE_DIR
    ref_txt = voice / "narrator-b-cool.txt"
    if not ref_txt.exists():
        raise SystemExit(
            f"missing {ref_txt}: write voice B's reference read text there (narrator.py COOL_TEXT, tag say-suppose-v1)"
        )
    lines = yaml.safe_load((video / "cast-pass.yaml").read_text())["lines"]
    takes_dir = video / "audio" / "takes"
    takes_dir.mkdir(parents=True, exist_ok=True)
    voices = voice_table(Library.for_channel("say-suppose", video).cast, video)
    spec = jobs(lines, voices, voice / "narrator-b-cool.wav", ref_txt.read_text().strip(), takes_dir)
    (takes_dir / "spec.json").write_text(json.dumps(spec, indent=1))
    run(takes_dir / "spec.json")
    takes = [
        (
            f"{ln['n']:03d}_{ln['speaker']}",
            Path(j["out"]),
            gap_after(ln["text"], ln["speaker"], i == len(lines) - 1),
        )
        for i, (ln, j) in enumerate(zip(lines, spec["jobs"], strict=True))
    ]
    wav = video / "audio" / "narration.wav"
    stitch(takes, wav, video / "audio" / "cues_b.json")
    words([wav])
    write_words(wav, video / "audio" / "narration.words.json")
    print(wav)


if __name__ == "__main__":
    if sys.argv[1] == "--to-maps":
        print("\n".join(map(str, to_maps(sys.argv[2], sys.argv[3]))))
    elif sys.argv[1] == "--sweep":
        print(sweep(sys.argv[2], sys.argv[3], sys.argv[4:]))
    else:
        main(sys.argv[1])
