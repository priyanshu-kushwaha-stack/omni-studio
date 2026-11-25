"""This film's character voices, free and local (Qwen3 VoiceDesign, nobody cloned).

The engine reads a channel-wide cast from voices.yaml; this film keeps its cast here instead, because the owner asked
for no changes to channel files in this session (2026-11-24, "Lets take this learning and not make any changes"). Run
it after every `story.py` and before `build.ts`:

    python core/engines/whatif/pipeline/story.py <video>   then   python <video>/cast.py

It replaces the stock voices story.py gave the names below with designed voices of their own, in voices.yaml's grammar
(gender and a voice type first, then age, texture and manner; every voice apart from the narrator's). The Boss keeps the
channel cast's Boss voice (voices.yaml), and the Kid the stock kid voice. The voice id hashes the name and the
description, as story.py's does, so each character's takes are cached and seeded apart. Gap recorded for the studio: a
per-video cast in story.py.
"""

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

CAST = {
    "Flatmate": "A relaxed male baritone: a man of about thirty in a dressing gown, your flatmate. Easy and warm, a little "
    "sleepy, unbothered, crisp clear diction, every word distinct, casual modern English.",
    "Leader": "A smooth, deep male baritone: a national politician in his sixties at a lectern. Practised and measured, "
    "every word polished and reassuring, crisp clear diction, every word distinct.",
    "Challenger": "A firm female alto: a politician in her fifties, the challenger. Dry and direct, a hint of amusement, "
    "crisp clear diction, every word distinct.",
    "Host": "A bright female mezzo: a television host in her thirties with a microphone. Quick, warm and theatrical, a "
    "showman's lift, crisp clear diction, every word distinct.",
    "Rival": "A pompous male baritone: a self-styled expert in his fifties in a white coat. Slow and grand, pleased with "
    "himself, crisp clear diction, every word distinct.",
    "Colleague": "A soft female mezzo: an office colleague in her thirties at the lift at five o'clock. Kind and a little "
    "worried, clear diction, every word distinct.",
    "Desk woman": "A brisk female alto: an office worker in her forties at a stand-up meeting. Breezy and quick, clear "
    "diction, every word distinct.",
    "Desk man": "A clipped male tenor-baritone: an office worker in his twenties. Casual and a little too quick, clear "
    "diction, every word distinct.",
    "Printer man": "A flat male bass: an office worker in his fifties. Bored and certain, short words, clear diction, "
    "every word distinct.",
    "Bus man": "A loud, cheerful male baritone: a man in his thirties on the phone at the back of a bus. Easy and "
    "breezy, warm, clear diction, every word distinct.",
    "Mechanic one": "A plain, gruff male baritone: a garage mechanic in his forties wiping his hands. Matter-of-fact and "
    "honest, clear diction, every word distinct.",
    "Mechanic two": "A smooth, gruff male baritone: a garage mechanic in his forties. Grave and confident, a salesman's "
    "sigh, clear diction, every word distinct.",
    "Landlord": "A hurried male baritone: a landlord in his sixties on the stairs with his keys. Brisk and evasive, "
    "already leaving, clear diction, every word distinct.",
    "Date": "A light male tenor: a man in his thirties on a first date. Eager and a little nervous, sitting up straight, "
    "clear diction, every word distinct.",
    "Woman diner": "A warm female mezzo: a woman in her thirties at a restaurant table, glass raised. Coy and playful, "
    "clear diction, every word distinct.",
    "Man diner": "A warm male baritone: a man in his thirties at a restaurant table. Quick and charming, clear diction, "
    "every word distinct.",
    "Player": "A low, steady male bass: a poker player in his forties pushing his chips in. Cool and slow, a "
    "deliberate bluff, clear diction, every word distinct.",
    "Guest": "A curious female mezzo: a party guest in her twenties holding up her phone. Bright and earnest, clear "
    "diction, every word distinct.",
    "Striker": "A loud male tenor: a footballer in his twenties on the ground. Outraged and theatrical, shouting, clear "
    "diction, every word distinct.",
}


def main() -> None:
    path = HERE / "story.json"
    story = json.loads(path.read_text(encoding="utf-8"))
    voices = story.setdefault("voices", {})
    done = []
    for name, describe in CAST.items():
        if name not in voices:
            continue
        describe = " ".join(describe.split())
        voices[name] = {
            "model": "local:qwen3-design",
            "voiceType": "design",
            "voiceId": hashlib.sha256(f"{name}\n{describe}".encode()).hexdigest()[:16],
            "describe": describe,
        }
        done.append(name)
    stock = sorted(set(voices) - set(done))
    path.write_text(json.dumps(story, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{path}: {len(done)} designed voices; kept from voices.yaml: {', '.join(stock)}")


if __name__ == "__main__":
    main()
