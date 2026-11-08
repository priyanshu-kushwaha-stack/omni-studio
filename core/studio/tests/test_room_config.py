"""room.yaml: seats by role, one model each, family rules, a cap derived from the panel."""

from __future__ import annotations

from pathlib import Path

import pytest

from studio.room import config as C

REAL_ROOT = Path(__file__).resolve().parents[3]
POU = REAL_ROOT / "channels" / "professor-of-us"

BASE = """\
writer: claude-opus-5-5
judge: gpt-5.6-sol-high
rounds: 3
daily_cap: 80
adopted: null
pitch_clip: after_g2
seats:
  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}
  - {name: story editor, role: story, model: gpt-5.6-sol-high, brief: "shared:story"}
  - {name: fact reviewer, role: fact, model: gemini-3.7-flash-high, brief: "shared:fact"}
format: {wpm: 155}
linters: []
sources: []
"""


def _cfg(tmp_path, text=BASE):
    (tmp_path / "room.yaml").write_text(text)
    return C.load_room(tmp_path / "room.yaml")


def test_the_professor_of_us_room_is_valid():
    cfg = C.load_room(POU / "room.yaml")
    assert C.validate(cfg) == []
    assert {s.role for s in cfg.seats} >= {"viewer", "story", "fact"}


def test_derived_cap(tmp_path):
    cfg = _cfg(tmp_path)
    assert C.derived_cap(cfg) == 3 * (3 + 2) + 3 * 3 + 3 + 2  # 29


def test_a_missing_mandatory_role_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("role: fact", "role: craft"))
    assert any("missing mandatory role" in p for p in C.validate(cfg))


def test_a_story_seat_on_the_writer_family_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("role: story, model: gpt-5.6-sol-high", "role: story, model: claude-sonnet-5-5"))
    assert any("story editor" in p and "writer's family" in p for p in C.validate(cfg))


def test_a_judge_on_the_writer_family_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("judge: gpt-5.6-sol-high", "judge: claude-sonnet-5-5"))
    assert any("judge" in p and "is the writer's family" in p for p in C.validate(cfg))


def _with_seat(line):
    return BASE.replace("format:", line + "\nformat:", 1)


def test_a_duplicate_seat_name_fails(tmp_path):
    cfg = _cfg(tmp_path, _with_seat('  - {name: cold viewer, role: viewer, model: grok-4.7-high, brief: "shared:viewer"}'))
    assert any("appears twice" in p for p in C.validate(cfg))


def test_an_unknown_role_fails(tmp_path):
    cfg = _cfg(tmp_path, _with_seat('  - {name: copy editor, role: editor, model: grok-4.7-high, brief: "shared:viewer"}'))
    assert any("unknown role" in p for p in C.validate(cfg))


def test_a_neutrality_seat_on_the_writer_family_fails(tmp_path):
    cfg = _cfg(tmp_path, _with_seat('  - {name: neutrality A, role: neutrality, model: claude-sonnet-5-5, brief: "shared:fact"}'))
    assert any("neutrality A" in p and "writer's family" in p for p in C.validate(cfg))


def test_rounds_out_of_range_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("rounds: 3", "rounds: 9"))
    assert any("rounds must be 1 to 5" in p for p in C.validate(cfg))


def test_an_invalid_pitch_clip_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("pitch_clip: after_g2", "pitch_clip: always"))
    assert any("pitch_clip must be one of" in p for p in C.validate(cfg))


def test_pre_g2_local_with_an_empty_voices_file_fails(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("pitch_clip: after_g2", "pitch_clip: pre_g2_local"))
    (tmp_path / "voices.yaml").write_text("voices:\n")
    assert any("non-empty voices.yaml" in p for p in C.validate(cfg))


def test_pre_g2_local_with_an_unparseable_voices_file_is_a_problem(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("pitch_clip: after_g2", "pitch_clip: pre_g2_local"))
    (tmp_path / "voices.yaml").write_text("voices: [unclosed\n")
    assert any("voices.yaml" in p and "not valid YAML" in p for p in C.validate(cfg))


def test_invalid_yaml_is_a_config_error(tmp_path):
    with pytest.raises(C.RoomConfigError, match="invalid YAML"):
        _cfg(tmp_path, "writer: [unclosed\n")


@pytest.mark.parametrize("text", ["- a\n- b\n", "42\n"])
def test_a_top_level_that_is_not_a_mapping_is_a_config_error(tmp_path, text):
    with pytest.raises(C.RoomConfigError, match="must be a mapping"):
        _cfg(tmp_path, text)


def test_non_integer_rounds_is_a_config_error(tmp_path):
    with pytest.raises(C.RoomConfigError, match="rounds"):
        _cfg(tmp_path, BASE.replace("rounds: 3", "rounds: three"))


def test_non_integer_daily_cap_is_a_config_error(tmp_path):
    with pytest.raises(C.RoomConfigError, match="daily_cap"):
        _cfg(tmp_path, BASE.replace("daily_cap: 80", "daily_cap: lots"))


def test_mandatory_seats_need_two_other_families(tmp_path):
    text = BASE.replace("grok-4.7-high", "gpt-5.6-sol-high").replace("gemini-3.7-flash-high", "gpt-5.6-sol-high")
    assert any("two or more families" in p for p in C.validate(_cfg(tmp_path, text)))


def test_an_unknown_model_and_a_missing_brief_fail(tmp_path):
    text = BASE.replace("grok-4.7-high", "mystery-1").replace('"shared:fact"', "room/seats/nope.md")
    problems = C.validate(_cfg(tmp_path, text))
    assert any("mystery-1" in p for p in problems) and any("nope.md" in p for p in problems)


def test_a_daily_cap_below_one_script_fails(tmp_path):
    assert any("daily cap" in p for p in C.validate(_cfg(tmp_path, BASE.replace("daily_cap: 80", "daily_cap: 10"))))


def test_pre_g2_local_needs_only_local_voices(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("pitch_clip: after_g2", "pitch_clip: pre_g2_local"))
    assert any("voices.yaml" in p for p in C.validate(cfg))
    (tmp_path / "voices.yaml").write_text("voices:\n  narrator: {tool: qwen3}\n  citizen: {tool: chatterbox}\n")
    assert C.validate(cfg) == []
    (tmp_path / "voices.yaml").write_text("voices:\n  narrator: {tool: higgsfield elevenlabs_v4}\n")
    assert any("not a free local engine" in p for p in C.validate(cfg))


def test_a_missing_key_is_a_config_error(tmp_path):
    with pytest.raises(C.RoomConfigError, match="seats"):
        _cfg(tmp_path, "writer: claude-opus-5-5\njudge: gpt-5.6-sol-high\nrounds: 3\n")


@pytest.mark.parametrize("brief", ["../outside.md", "/etc/hosts", "shared:../../../../README"])
def test_a_brief_outside_the_channel_and_seats_dir_is_refused(tmp_path, brief):
    (tmp_path / "outside.md").write_text("x")
    channel = tmp_path / "ch"
    channel.mkdir()
    text = BASE.replace('"shared:viewer"', brief)
    (channel / "room.yaml").write_text(text)
    with pytest.raises(C.RoomConfigError, match="brief"):
        C.load_room(channel / "room.yaml")


def test_a_brief_symlink_out_of_the_channel_is_refused(tmp_path):
    channel = tmp_path / "ch"
    channel.mkdir()
    (tmp_path / "secret.md").write_text("x")
    (channel / "link.md").symlink_to(tmp_path / "secret.md")
    (channel / "room.yaml").write_text(BASE.replace('"shared:viewer"', "link.md"))
    with pytest.raises(C.RoomConfigError, match="brief"):
        C.load_room(channel / "room.yaml")


def test_a_brief_inside_the_channel_dir_is_fine(tmp_path):
    (tmp_path / "room").mkdir()
    (tmp_path / "room" / "mine.md").write_text("x")
    cfg = _cfg(tmp_path, BASE.replace('"shared:viewer"', "room/mine.md"))
    assert cfg.seats[0].brief.name == "mine.md"


@pytest.mark.parametrize("name", ["!!!", "Meta", "JUDGE", " "])
def test_reserved_or_empty_seat_slugs_are_refused(tmp_path, name):
    with pytest.raises(C.RoomConfigError, match="file name"):
        _cfg(tmp_path, BASE.replace("name: cold viewer", f'name: "{name}"'))


def test_a_channel_daily_cap_above_the_studio_ceiling_does_not_hide_a_small_ceiling(tmp_path, monkeypatch):
    from studio.room import ledger
    limits = tmp_path / "limits.yaml"
    limits.write_text("daily_cap: 10\n")
    monkeypatch.setattr(ledger, "LIMITS", limits)
    assert any("daily cap" in p for p in C.validate(_cfg(tmp_path)))


@pytest.mark.parametrize("old,new", [("format: {wpm: 155}", "format: [wpm]"), ("format: {wpm: 155}", "format: 7"),
                                     ("linters: []", "linters: not-a-list"), ("linters: []", "linters: {a: b}"),
                                     ("sources: []", "sources: some.md")])
def test_wrong_shaped_format_linters_or_sources_are_config_errors(tmp_path, old, new):
    with pytest.raises(C.RoomConfigError):
        _cfg(tmp_path, BASE.replace(old, new))


def test_a_voices_file_whose_voices_is_not_a_mapping_is_a_problem(tmp_path):
    cfg = _cfg(tmp_path, BASE.replace("pitch_clip: after_g2", "pitch_clip: pre_g2_local"))
    (tmp_path / "voices.yaml").write_text("voices: [qwen3]\n")
    assert any("voices" in p for p in C.validate(cfg))
    (tmp_path / "voices.yaml").write_text("voices: qwen3\n")
    assert any("voices" in p for p in C.validate(cfg))
