from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from script_lint import hard_failures, lint_script, narration_words, re_engage_windows  # noqa: E402


def make_script(words_per_section=None, greeting=False, ending_lang=False, sources=6,
                re_engage=("Two", "Three", "Four", "Five"), first_digit=True, visuals=True, emphasis=True):
    # 14-minute target => 2100 words = 813 s at 155 wpm. Section starts in words:
    # Hook 0, One 120, Two 465, Three 930, Four 1395, Five 1860, Ending 2010.
    # At 155 wpm "Two" starts at 180 s, "Three" at 360 s, "Four" at 540 s, "Five" at 720 s,
    # which is where the RE-ENGAGE cues must land (every ~3 min through the back half).
    words_per_section = words_per_section or [120, 345, 465, 465, 465, 150, 90]
    filler = "the river turns and *every* step costs something new " if emphasis else "the river turns and every step costs something new "
    out = ["# Script", "template: mystery", "target_minutes: 14", "status: draft", ""]
    titles = ["Hook", "One", "Two", "Three", "Four", "Five", "Ending"]
    for i, (t, n) in enumerate(zip(titles, words_per_section)):
        out.append(f"## [{i*2:02d}:00] {t}")
        if visuals:
            # one beat per 10 s of estimated narration, plus one
            out += [f"> VISUAL: beat {k}" for k in range(int(n / 155 * 60 // 10) + 1)]
        if t in re_engage:
            out.append("> RE-ENGAGE: tease")
        body = (filler * (n // 9 + 1)).split()[:n]
        if i == 0:
            if greeting:
                body = ["Hey", "guys,", "welcome", "back."] + body
            if first_digit:
                body[5] = "40,000"
        if ending_lang and i == 2:
            body[10] = "in"; body[11] = "conclusion,"
        out.append(" ".join(body))
        out.append("")
    out += ["## Chapters", "00:00 Hook", "", "## Sources"]
    out += [f"- https://example.org/{k}" for k in range(sources)]
    return "\n".join(out)


def by_item(findings):
    return {f.item: f for f in findings}


def test_counts_only_narration_words():
    text = make_script()
    n = narration_words(text)
    assert 2050 <= n <= 2150


def test_re_engage_windows_cover_the_back_half():
    assert re_engage_windows(600) == [180, 360, 540]
    assert re_engage_windows(813) == [180, 360, 540, 720]


def test_short_scripts_get_one_midpoint_re_engagement():
    # 5-min format: 3:00 would sit on the take-home, so the cue goes at the midpoint.
    assert re_engage_windows(300) == [150]
    assert re_engage_windows(270) == [135]
    assert re_engage_windows(360) == [180]
    assert re_engage_windows(200) == []


def test_clean_script_passes_everything():
    f = by_item(lint_script(make_script(), target_minutes=14))
    assert all(x.ok for x in f.values()), [x for x in f.values() if not x.ok]


def test_word_budget_fail():
    f = by_item(lint_script(make_script([100] * 7), target_minutes=14))
    assert not f[18].ok and f[18].level == "fail"


def test_greeting_fail():
    f = by_item(lint_script(make_script(greeting=True), target_minutes=14))
    assert not f[5].ok


def test_ending_language_fail():
    f = by_item(lint_script(make_script(ending_lang=True), target_minutes=14))
    assert not f[21].ok


def test_missing_re_engagement_fail():
    f = by_item(lint_script(make_script(re_engage=()), target_minutes=14))
    assert not f[10].ok


def test_back_half_without_re_engagement_fails():
    f = by_item(lint_script(make_script(re_engage=("Two", "Three")), target_minutes=14))
    assert not f[10].ok
    assert "540" in f[10].detail and "720" in f[10].detail


def test_too_few_sources_fail():
    f = by_item(lint_script(make_script(sources=3), target_minutes=14))
    assert not f[22].ok


def test_no_number_in_first_30s_is_advisory():
    f = by_item(lint_script(make_script(first_digit=False), target_minutes=14))
    assert not f[7].ok and f[7].level == "advisory"


def test_visual_beat_density_fail():
    f = by_item(lint_script(make_script(visuals=False), target_minutes=14))
    assert not f[26].ok and f[26].level == "fail"


def test_emphasis_is_advisory():
    f = by_item(lint_script(make_script(emphasis=False), target_minutes=14))
    assert not f[20].ok and f[20].level == "advisory"


def test_advisory_findings_never_block():
    findings = lint_script(make_script(first_digit=False, emphasis=False), target_minutes=14)
    assert hard_failures(findings) == []
    assert hard_failures(lint_script(make_script(sources=1), target_minutes=14))


def test_speaker_labels_are_not_counted_as_words():
    """Dialogue lines ('OOG: I am old.') are spoken without the label (channel/cast.md format)."""
    from script_lint import narration_words
    text = "## [00:00] A\n> VISUAL: x\nOOG: I am old.\nYOU: No way.\nPROF: Yes.\nPlain narration here.\n"
    assert narration_words(text) == 3 + 2 + 1 + 3


def _quiz_script(quiz_lines):
    base = make_script()
    return base.replace("## [02:00] One", "## [02:00] One\n" + "\n".join(quiz_lines), 1)


def test_quiz_after_ask_with_one_answer_passes():
    f = by_item(lint_script(_quiz_script(["> ASK: Guess?", "> QUIZ: 15 | *35 | 55"]), 14))
    assert f[27].ok


def test_quiz_needs_ask_before_it_and_exactly_one_answer():
    assert not by_item(lint_script(_quiz_script(["> QUIZ: 15 | *35 | 55"]), 14))[27].ok
    assert not by_item(lint_script(_quiz_script(["> ASK: Guess?", "> QUIZ: 15 | 35 | 55"]), 14))[27].ok
    assert not by_item(lint_script(_quiz_script(["> ASK: Guess?", "> QUIZ: *15 | *35"]), 14))[27].ok
    assert not by_item(lint_script(_quiz_script(["> ASK: Guess?", "> QUIZ: *15 | 2 | 3 | 4"]), 14))[27].ok


def test_no_quiz_lines_passes():
    assert by_item(lint_script(make_script(), 14))[27].ok
