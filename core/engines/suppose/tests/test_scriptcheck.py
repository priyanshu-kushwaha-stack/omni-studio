import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import scriptcheck as sc  # noqa: E402

BEAT = "You catch it... in time. How? Your hand moves first. "


def script_of(words_target: int, beat: str = BEAT) -> str:
    out = []
    while len(" ".join(out).split()) < words_target:
        out.append(beat.strip())
    return " ".join(out)


def test_extract_takes_the_paragraph_after_script():
    assert sc.extract("TOPIC: What If X? SCRIPT: You run. Fast.") == "You run. Fast."


def test_metrics_count_the_voice_targets():
    m = sc.metrics("You run... fast. Why? Your legs, mate. In 2007 you ran 100 metres.")
    assert m["ellipses"] == 1
    assert m["questions"] == 1
    assert m["digits"] == ["100"]
    assert m["sentences"] == 4


def test_word_count_outside_800_to_1100_fails():
    fails, _ = sc.check(script_of(700))
    assert any("words" in f for f in fails)
    fails, _ = sc.check(script_of(1000))
    assert not any("words" in f for f in fails)


def test_format_breaks_fail():
    base = script_of(950)
    for bad in ["NARRATOR: You run.", '"Hey," she says.', "[camera pushes in]", "## Act one", "*You run*"]:
        fails, _ = sc.check(base + " " + bad)
        assert fails, bad


def test_digits_and_a_named_hero_fail():
    fails, _ = sc.check(script_of(950) + " You ran 42 laps.")
    assert any("numbers" in f for f in fails)
    fails, _ = sc.check(script_of(950) + " Your name is Max.", hero_names=("Max",))
    assert any("named" in f for f in fails)


def test_voice_targets_only_warn():
    flat = script_of(950, "The man walks to the shop and buys some bread for his lunch today. ")
    fails, warns = sc.check(flat)
    assert not fails
    assert any("ellipses" in w for w in warns) and any("questions" in w for w in warns)


def test_years_before_punctuation_are_not_digits():
    for line in ["It happened in 2007.", "Born in 1999, you ran."]:
        fails, _ = sc.check(script_of(950) + " " + line)
        assert not any("numbers" in f for f in fails), line
    for line in ["You ran 42 laps.", "It cost 3,500 yen."]:
        fails, _ = sc.check(script_of(950) + " " + line)
        assert any("numbers" in f for f in fails), line


def test_hero_name_as_direct_address_fails():
    for line in ["Max! Your door hates me!", "Max, look."]:
        fails, _ = sc.check(script_of(950) + " " + line, hero_names=("Max",))
        assert any("named" in f for f in fails), line
    fails, _ = sc.check(script_of(950), hero_names=("Max",))
    assert not fails


def test_cli_hero_flag(tmp_path):
    p = tmp_path / "s.md"
    p.write_text("SCRIPT: " + script_of(950) + " Max, look.", encoding="utf-8")
    assert sc.main([str(p), "--hero", "Max"]) == 1
    assert sc.main([str(p)]) == 0


def test_stage_directions_need_a_direction_word():
    fails, _ = sc.check(script_of(950) + " It is (a scene you know).")
    assert not fails
    fails, _ = sc.check(script_of(950) + " You run (camera pushes in).")
    assert any("stage direction" in f for f in fails)
