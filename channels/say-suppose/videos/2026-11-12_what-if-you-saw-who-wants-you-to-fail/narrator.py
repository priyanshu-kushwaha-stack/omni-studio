"""This film's narrator: voice B, the AI-rents-your-brain film's narrator, cloned so it stays one voice from line to line
(owner, 2026-11-15, on four narrator samples: "B (AI-rents voice)"; earlier: "I like Film: What If AI Rented Your Brain
While You Slept? the one used in this one better because we have more control over it right ?").

The engine takes one narrator per channel (voices.yaml narrator, Arthur's clone); this film uses its own, so run this
after every `story.py` (whatif_story) and before `build.ts` (whatif_narration):

    python core/engines/whatif/pipeline/story.py <video>   then   python <video>/narrator.py

It points story.json's narrator at a clone of voice B's cool read (assets/voice/narrator-cool.wav), the same clip and
text as the AI-rents film. A clone takes no per-line direction, so the delivery lives in the reference read; the
stresses come from the line breaks and timing.yaml's air. Characters keep their own designed voices.

The reference clip is git-ignored. It is a copy of
channels/say-suppose/videos/2026-11-13_what-if-ai-rented-your-brain-while-you-slept/assets/voice/narrator-cool.wav;
to remake it, see that film's narrator.py (Qwen3 VoiceDesign, seed 4101, "A calm, precise male baritone ...").
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
REF = "assets/voice/narrator-cool.wav"
COOL_TEXT = ("Twice a week, you sell your plasma, the pale part of your blood. It's the most the law allows. That's the "
             "band. A thin strip you wear across your forehead. While you sleep, it lends your brain to a company. And "
             "it pays you, by the hour.")


def main() -> None:
    path = HERE / "story.json"
    if not (HERE / REF).is_file():
        raise SystemExit(f"missing {REF}: copy it from the AI-rents film (see this file's docstring)")
    story = json.loads(path.read_text(encoding="utf-8"))
    story["voice"] = {"model": "local:qwen3", "voiceType": "local", "voiceId": "wants-you-to-fail-b4101-cool",
                      "ref": REF, "refText": COOL_TEXT}
    path.write_text(json.dumps(story, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    n = sum(1 for line in story["lines"] if line["speaker"] == "narrator")
    print(f"{path}: narrator = voice B cool clone ({n} lines)")


if __name__ == "__main__":
    main()
