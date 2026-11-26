"""This film's narrator: voice B, cloned, so it stays one voice from line to line (owner, 2026-11-13, on the options:
"B. Looks fine but in that sample voice also its different in differnt sentecnes.").

The engine takes one narrator per channel (voices.yaml narrator, Arthur's clone); this film uses its own, so run this
after every `story.py` and before `build.ts`:

    python core/engines/whatif/pipeline/story.py <video>   then   python <video>/narrator.py

It points story.json's narrator at a clone of voice B's cool read (assets/voice/narrator-cool.wav), and the lines from
Midnight on at a clone of B's warm read (narrator-warm.wav): cool sci-fi until the lesson, warmth only at the end
("Emotional part should come only at the end where it is teaching a lesson"). A clone takes no per-line direction, so
the delivery lives in the reference read; the stresses come from the line breaks and timing.yaml's air.

The reference clips are git-ignored. To remake them on a new machine: Qwen3 VoiceDesign (core/lock.yaml local_voices
qwen3-design), seed 4101, voice "A calm, precise male baritone: a narrator in his forties for a science-fiction film.
Cool, even and exact, crisp clear diction, every word distinct, curious rather than warm, a measured pace with clean
pauses." reading COOL_TEXT with the delivery "cool and plain / precise, presenting it / even and exact" (one take per
sentence group, 0.5 s apart), and WARM_TEXT with "slower, warm and moved for the first time, the last sentence soft
and certain". Gap recorded with `omni fix` (a per-video narrator in story.py).
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
COOL_TEXT = ("Twice a week, you sell your plasma, the pale part of your blood. It's the most the law allows. That's the "
             "band. A thin strip you wear across your forehead. While you sleep, it lends your brain to a company. And "
             "it pays you, by the hour.")
WARM_TEXT = "Tonight you'll lie down, and you'll be clocking in. You always were. The shift is yours."
END_FROM = "Eleven fifty-eight"


def clone(name: str, ref: str, text: str) -> dict:
    return {"model": "local:qwen3", "voiceType": "local", "voiceId": f"ai-rents-{name}-b4101", "ref": ref, "refText": text}


def main() -> None:
    path = HERE / "story.json"
    story = json.loads(path.read_text(encoding="utf-8"))
    for f in ("narrator-cool.wav", "narrator-warm.wav"):
        if not (HERE / "assets" / "voice" / f).is_file():
            raise SystemExit(f"missing assets/voice/{f}: remake it (see this file's docstring)")
    story["voice"] = clone("cool", "assets/voice/narrator-cool.wav", COOL_TEXT)
    story.setdefault("voices", {})["Narrator end"] = clone("warm", "assets/voice/narrator-warm.wav", WARM_TEXT)
    end = next(i for i, line in enumerate(story["lines"]) if line["text"].startswith(END_FROM))
    warm = 0
    for line in story["lines"][end:]:
        if line["speaker"] == "narrator":
            line["speaker"] = "Narrator end"
            warm += 1
    path.write_text(json.dumps(story, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{path}: narrator = voice B cool clone; {warm} lines from {END_FROM!r} on = voice B warm clone")


if __name__ == "__main__":
    main()
