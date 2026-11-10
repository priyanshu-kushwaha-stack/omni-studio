import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from short_rigs import cued_in  # noqa: E402

WORDS = [
    {"word": "Four.", "start": 1.0, "end": 1.4},
    {"word": "random", "start": 2.0, "end": 2.4},
    {"word": "Noise", "start": 5.0, "end": 5.3},
]


def test_cue_inside_the_scene_window_applies():
    assert cued_in(WORDS, "random", 0.0, 4.0)


def test_cue_spoken_before_a_continuation_is_dropped():
    # a continuation scene starting at 4.0 inherits "random" (spoken at 2.0): not its cue
    assert not cued_in(WORDS, "random", 4.0, 8.0)


def test_cue_spoken_after_the_scene_is_dropped():
    assert not cued_in(WORDS, "Noise", 0.0, 4.0)
    assert not cued_in(WORDS, "absent", 0.0, 9.0)


def test_continuations_without_a_still_extend_the_previous_span(tmp_path):
    from short_rigs import spans

    (tmp_path / "s001.png").write_bytes(b"")
    (tmp_path / "s002.png").write_bytes(b"")
    plan = [
        {"id": "s001", "start_seconds": 0.0, "end_seconds": 2.0},
        {"id": "s001c1", "start_seconds": 2.0, "end_seconds": 4.0},
        {"id": "s002", "start_seconds": 4.0, "end_seconds": 6.0},
        {"id": "s002c1", "start_seconds": 6.0, "end_seconds": 7.5},
    ]
    assert spans(plan, tmp_path, {}) == [("s001", 0.0, 4.0), ("s002", 4.0, 7.5)]


def test_a_copied_continuation_keeps_its_own_span(tmp_path):
    from short_rigs import spans

    (tmp_path / "s001.png").write_bytes(b"")
    plan = [
        {"id": "s001", "start_seconds": 0.0, "end_seconds": 2.0},
        {"id": "s001c1", "start_seconds": 2.0, "end_seconds": 4.0},
    ]
    assert spans(plan, tmp_path, {"s001c1": "s001"}) == [("s001", 0.0, 2.0), ("s001c1", 2.0, 4.0)]


def test_dialogue_speaker_talks_and_the_listener_looks_at_them(tmp_path):
    from short_rigs import cast_of, dialogue_actions

    cast = cast_of(
        [
            {"name": "you", "speaker": "YOU", "eyes": [[400, 300, 20]], "mouth": [400, 360, 40]},
            {"name": "oog", "speaker": "OOG", "eyes": [[1400, 320, 20]], "mouth": [1400, 380, 40]},
        ],
        "s001",
    )
    lines = [
        {"speaker": "YOU", "start": 1.0, "end": 2.0, "file": "l01.wav"},
        {"speaker": "OOG", "start": 2.5, "end": 3.2, "file": "l02.wav"},
        {"speaker": "YOU", "start": 9.0, "end": 9.5, "file": "l03.wav"},
    ]  # outside the scene
    acts = dialogue_actions(cast, "v5", lines, 0.0, 5.0, tmp_path)
    talks = [(a["talk"], a["at"]) for a in acts if "talk" in a]
    assert talks == [("v5.s001youMouth", 1.0), ("v5.s001oogMouth", 2.5)]
    looks = {(a["pose"], a["at"]): a["to"]["px"] for a in acts if "pose" in a}
    assert looks[("v5.s001oogEye0", 1.0)] == -4  # Oog (right) looks left at YOU while YOU speaks
    assert looks[("v5.s001youEye0", 2.5)] == 4  # YOU looks right at Oog while Oog speaks
