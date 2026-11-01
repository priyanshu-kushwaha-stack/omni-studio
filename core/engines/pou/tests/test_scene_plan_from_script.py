import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from scene_plan_from_script import build_plan, classify, parse_script  # noqa: E402
from scene_plan_check import check_scene_plan  # noqa: E402

SCRIPT = """# Script
template: mystery
target_minutes: 1
status: draft
hook: hooks/hook-1.md

## [00:00] Open
> VISUAL: a ring of twenty figures around a fire
one two three four five six.
> VISUAL: a bar card draws 5.7 to 7.1
seven eight nine *ten* (c01).

## [00:10] Body
> VISUAL: a map of Africa draws in
eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty.

## Chapters
00:00 Open
## Sources
- https://example.org
"""


def words(n, step=0.8):
    return [{"word": f"w{i}", "start": round(i * step, 2), "end": round(i * step + 0.5, 2)} for i in range(n)]


def test_parse_beats_and_words():
    beats = parse_script(SCRIPT)
    assert [b["section"] for b in beats] == ["Open", "Open", "Body"]
    assert len(beats[0]["words"]) == 6 and len(beats[1]["words"]) == 4 and len(beats[2]["words"]) == 10


def test_classify():
    assert classify("a bar card draws")[0] == "card"
    assert classify("a map of Africa")[0] == "illustration"
    assert classify('the "you" figure yawns')[0] == "character"
    assert classify("a candle burns")[0] == "illustration"


def test_plan_is_contiguous_classified_and_split():
    plan = build_plan(SCRIPT, words(20), hook_seconds=60, hook_hold=4.0, tail_seconds=0)
    scenes = plan["scenes"]
    assert scenes[0]["start_seconds"] == 0.0
    for a, b in zip(scenes, scenes[1:]):
        assert b["start_seconds"] == a["end_seconds"]
    # the 10-word body beat spans ~8 s and must be split into sub-scenes of <= 4 s (hook limit applies)
    assert all(s["end_seconds"] - s["start_seconds"] <= 4.0 + 1e-6 for s in scenes)
    classes = plan["metadata"]["change_classes"]
    assert set(classes.values()) <= {"motion", "card", "illustration", "character", "hero"}
    first_of = {sc["description"]: classes[sc["id"]] for sc in scenes if sc["required_assets"]}
    assert first_of["a ring of twenty figures around a fire"] == "character"
    assert first_of["a bar card draws 5.7 to 7.1"] == "card"
    assert any(v == "motion" for v in classes.values())
    findings = {f.rule: f.ok for f in check_scene_plan(plan)}
    assert findings["classified"] and findings["holds"] and findings["coverage"]


def test_tail_is_split_into_short_motion_scenes():
    plan = build_plan(SCRIPT, words(20), tail_seconds=12, body_hold=6.0)
    assert plan["metadata"]["minute_exceptions"][0]["minute"] == 1  # the tail's minute is exempt from density
    tail = [s for s in plan["scenes"] if s["description"].startswith("end-screen hold")]
    assert len(tail) == 2 and all(s["end_seconds"] - s["start_seconds"] <= 6.0 for s in tail)
    assert all(plan["metadata"]["change_classes"][s["id"]] == "motion" for s in tail)


def test_schema_fields_only(tmp_path: Path):
    plan = build_plan(SCRIPT, words(20))
    allowed = {"id", "type", "description", "start_seconds", "end_seconds", "script_section_id", "framing",
               "movement", "transition_in", "transition_out", "overlay_notes", "shot_language", "shot_intent",
               "narrative_role", "information_role", "hero_moment", "character_actions", "texture_keywords",
               "required_assets"}
    for s in plan["scenes"]:
        assert set(s) <= allowed
    json.dumps(plan)


def test_scene_ids_are_stable_across_narration_pace():
    """A faster or slower read changes how many continuation segments a beat needs, never the
    ids that stills, clips and overlays are keyed by."""
    slow = build_plan(SCRIPT, words(20, step=1.6), tail_seconds=12, body_hold=6.0)
    fast = build_plan(SCRIPT, words(20, step=0.4), tail_seconds=12, body_hold=6.0)
    firsts = lambda p: [s["id"] for s in p["scenes"] if s["required_assets"]]  # noqa: E731
    assert firsts(slow) == firsts(fast) == ["s001", "s002", "s003"]
    conts = [s["id"] for s in slow["scenes"] if s["id"].startswith("s003") and not s["required_assets"]]
    assert conts and conts[0] == "s003c1"
    assert all(s["id"].startswith("e") for s in fast["scenes"] if "end-screen" in s["description"])


def test_align_tolerates_transcriber_token_splits():
    """Whisper writes '5.7' as '5' '.7' and 'eight-hour' as '8' '-hour'; the beat after such a
    split must still start where its own first word is spoken, not one token late per split."""
    from scene_plan_from_script import align

    beats = parse_script(SCRIPT)  # 6 + 4 + 10 words
    # transcript: first beat's six words, then the second beat with its number split into 3 tokens
    spoken = ["one", "two", "three", "four", "five", "six", "7", ".5", "8", "nine", "ten"]
    spoken += [f"w{i}" for i in range(10)]  # third beat, words transcribed differently
    toks = [{"word": w, "start": i * 1.0, "end": i * 1.0 + 0.5} for i, w in enumerate(spoken)]
    toks[11]["word"] = "eleven"  # one anchor word in the third beat matches
    spans = align(beats, toks)
    assert spans[0][0] == 0.0
    assert spans[1][0] == 6.0           # "seven" (transcribed "7") at t=6
    assert spans[2][0] == 11.0          # "eleven" at t=11, despite the extra token before it


def test_parse_strips_grouped_claim_refs_from_word_counts():
    beats = parse_script(SCRIPT.replace("seven eight nine *ten* (c01).", "seven eight nine *ten* (c01, c05)."))
    assert len(beats[1]["words"]) == 4


def test_short_tail_for_a_trailer():
    plan = build_plan(SCRIPT, words(20), tail_seconds=3, body_hold=6.0)
    tail = [s for s in plan["scenes"] if s["id"].startswith("e")]
    assert len(tail) == 1 and abs(tail[0]["end_seconds"] - tail[0]["start_seconds"] - 3.0) < 0.01


def test_align_number_words_start_on_the_numeral_not_the_word_before():
    """'two hundred and five people' is transcribed '205 people': four unmatched script words face
    one spoken token. The beat must start on '205', not snap back to the previous beat's word."""
    from scene_plan_from_script import align

    beats = parse_script("## [00:00] A\n> VISUAL: x\nThey resist less.\n"
                         "> VISUAL: y\nLess.\n"
                         "> VISUAL: z\nTwo hundred and five people. Beepers.\n")
    spoken = ["They", "resist", "less.", "Less.", "205", "people.", "Beepers."]
    toks = [{"word": w, "start": i * 1.0, "end": i * 1.0 + 0.5} for i, w in enumerate(spoken)]
    spans = align(beats, toks)
    assert [s for s, _ in spans] == [0.0, 3.0, 4.0]


def test_ask_lines_are_spoken_and_start_their_beat():
    """`> ASK:` lines are read aloud (a direct question to the viewer), so a beat that opens on one
    starts when the question is asked, not at the previous beat."""
    from scene_plan_from_script import align

    beats = parse_script("## [00:00] A\n> VISUAL: x\nOne two.\n"
                         "> VISUAL: y\n> ASK: Guess which animal?\nThe platypus.\n")
    assert beats[1]["words"] == ["guess", "which", "animal", "the", "platypus"]
    spoken = ["One", "two.", "Guess", "which", "animal?", "The", "platypus."]
    toks = [{"word": w, "start": i * 1.0, "end": i * 1.0 + 0.5} for i, w in enumerate(spoken)]
    assert [s for s, _ in align(beats, toks)] == [0.0, 2.0]


def test_wordless_beat_starts_after_the_previous_beats_last_word():
    """A beat with no narration of its own (a visual gag in a pause) fills the pause after the
    previous beat's last word, instead of a 0.5 s blip at the previous beat's start."""
    from scene_plan_from_script import align

    beats = parse_script("## [00:00] A\n> VISUAL: x\nCase closed?\n"
                         "> VISUAL: rip\n"
                         "> VISUAL: jars\nWake people.\n")
    toks = [{"word": "Case", "start": 0.0, "end": 0.4}, {"word": "closed?", "start": 0.5, "end": 1.0},
            {"word": "Wake", "start": 3.0, "end": 3.3}, {"word": "people.", "start": 3.4, "end": 3.8}]
    spans = align(beats, toks)
    assert spans[0] == (0.0, 1.2)
    assert spans[1] == (1.2, 3.0)
    assert spans[2][0] == 3.0
