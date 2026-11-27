import json
import re
import sys
from pathlib import Path

import numpy as np
import yaml
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import review  # noqa: E402


def video(tmp_path: Path) -> Path:
    v = tmp_path / "2026-12-01_what-if-x"
    (v / "audio").mkdir(parents=True)
    (v / "review").mkdir()
    (v / "script.md").write_text("TOPIC: What If X? SCRIPT: You run... fast. Why?")
    (v / "audio" / "cues_b.json").write_text(json.dumps({"cues": [{"line": "001_narrator", "start": 0.4, "end": 1.2}]}))
    (v / "cast-pass.yaml").write_text(
        yaml.safe_dump({"lines": [{"n": 1, "text": "You run... fast.", "speaker": "narrator"}]})
    )
    (v / "review" / "notes.md").write_text("- make the crowd slower\n")
    return v


def test_story_script_page_has_script_times_checklists_and_notes(tmp_path):
    html = review.build(video(tmp_path), "story_script").read_text()
    for must in ["You run... fast.", "0:00.4", "light with a visible source", "make the crowd slower", "W1"]:
        assert must.lower() in html.lower(), must


def test_fresh_folder_does_not_crash_and_unknown_stage_is_refused(tmp_path):
    v = tmp_path / "v"
    v.mkdir()
    assert review.build(v, "final_watch").is_file()
    try:
        review.build(v, "nope")
    except ValueError as e:
        assert "nope" in str(e)
    else:
        raise AssertionError("no error")


OUTLINE_MD = """TITLE: What If You Could Run 100 mph?
ALT TITLES:
- What If You Ran 100 Miles Per Hour?
- What If Your Legs Hit 100 mph?
SYNOPSIS: You wake up fast. The cost is heat.
CHARACTERS:
  coach | new | green whistle | cap <b>bold</b>
  rival | cast_07 | red stopwatch | none
RULE: Every sprint burns a day of sleep.
OUTLINE:
  1 cold open on the track
  2 baseline, rule and title question
  3 consequence montage
    3.1 the commute, 12 minutes to 40 seconds
    3.2 the heat, 4000 kcal per hour
  4 hidden cost
PLANTED: a loose lace in step 5 pays off in step 7
CHOICE: stop running or keep your friends
FACTS:
  - A sprinter peaks near 28 mph (World Athletics)
  - Muscle is about 25 percent efficient
"""


def test_proposal_reads_the_g1_outline_answer(tmp_path):
    v = video(tmp_path)
    (v / "outline.md").write_text(OUTLINE_MD)
    html = review.build(v, "proposal").read_text()
    assert "<title>What If You Could Run 100 mph?</title>" in html
    for must in [
        "What If You Ran 100 Miles Per Hour?",
        "You wake up fast. The cost is heat.",
        "<td>coach</td><td>new</td><td>green whistle</td><td>cap &lt;b&gt;bold&lt;/b&gt;</td>",
        "Every sprint burns a day of sleep.",
        "cold open on the track",
        "a loose lace in step 5",
        "stop running or keep your friends",
        "Muscle is about 25 percent efficient",
    ]:
        assert must in html, must
    assert "<b>bold</b>" not in html
    assert re.search(
        r"<li>[^<]*3[^<]*consequence montage<ul[^>]*><li>[^<]*the commute.*?</li><li>[^<]*the heat", html, re.S
    )


def test_title_falls_back_to_script_topic_without_outline(tmp_path):
    assert "<title>What If X?</title>" in review.build(video(tmp_path), "proposal").read_text()


def test_malformed_cast_lines_and_list_cues_are_skipped(tmp_path):
    v = video(tmp_path)
    (v / "cast-pass.yaml").write_text(
        yaml.safe_dump({"lines": ["junk", {"n": "x", "text": "bad n"}, {"n": 1, "text": "ok line", "speaker": "a"}]})
    )
    (v / "audio" / "cues_b.json").write_text("[1, 2]")
    html = review.build(v, "story_script").read_text()
    assert "ok line" in html and "bad n" not in html


def test_channel_comes_from_the_video_path(tmp_path):
    v = tmp_path / "channels" / "other-show" / "videos" / "v1"
    v.mkdir(parents=True)
    assert review.channel_of(v) == "other-show"
    assert review.channel_of(tmp_path / "x") == "say-suppose"


def test_report_says_render_time_is_unavailable(tmp_path):
    assert "render time per film minute: not available" in review.build(video(tmp_path), "final_watch").read_text()


def test_user_strings_are_escaped_and_proposal_embeds_small_thumbs(tmp_path):
    v = video(tmp_path)
    (v / "outline.md").write_text("TITLE: <script>alert(1)</script>\nSYNOPSIS: s\n")
    (v / "art.yaml").write_text(yaml.safe_dump({"items": ["a set"], "quote": "4 credits"}))
    (v / "art").mkdir()
    Image.fromarray(np.zeros((720, 1280, 3), np.uint8)).save(v / "art" / "thumb_1.png")
    (v / "qc").mkdir()
    report = {
        "checks": [
            {"check": "loudness", "ok": True, "measured": {"integrated_lufs": -16.1, "true_peak_dbtp": -1.5}},
            {"check": "clicks", "ok": False, "problems": ["click/pop at 1.2 s"], "in_word_bursts": 0},
        ]
    }
    (v / "qc" / "proposal.json").write_text(json.dumps(report))
    out = review.build(v, "proposal")
    html = out.read_text()
    assert "<script>alert" not in html and "&lt;script&gt;" in html
    assert "data:image/jpeg;base64," in html and "4 credits" in html and "-16.1" in html and "-1.5" in html
    assert "click/pop at 1.2 s" in html
    assert out.stat().st_size < 60_000
    assert "No credit quote" not in html


def test_proposal_warns_when_the_art_quote_is_missing(tmp_path):
    v = video(tmp_path)
    (v / "outline.md").write_text("TITLE: T\n")
    assert "No credit quote" in review.build(v, "proposal").read_text()
    (v / "art.yaml").write_text(yaml.safe_dump({"sets": ["cellar"], "total_credits": 4}))
    assert "No credit quote" in review.build(v, "proposal").read_text()
    assert "data:image/jpeg" not in review.build(v, "story_script").read_text()
