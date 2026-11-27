import json
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


def test_user_strings_are_escaped_and_proposal_embeds_small_thumbs(tmp_path):
    v = video(tmp_path)
    (v / "packaging.yaml").write_text(yaml.safe_dump({"title": "<script>alert(1)</script>", "synopsis": "s"}))
    (v / "art.yaml").write_text(yaml.safe_dump({"items": ["a set"], "quote": "4 credits"}))
    (v / "art").mkdir()
    Image.fromarray(np.zeros((720, 1280, 3), np.uint8)).save(v / "art" / "thumb_1.png")
    (v / "qc").mkdir()
    (v / "qc" / "proposal.json").write_text(
        json.dumps({"loudness": {"integrated_lufs": -16.1, "true_peak_dbtp": -1.5}, "clicks": []})
    )
    out = review.build(v, "proposal")
    html = out.read_text()
    assert "<script>alert" not in html and "&lt;script&gt;" in html
    assert "data:image/jpeg;base64," in html and "4 credits" in html and "-16.1" in html
    assert out.stat().st_size < 60_000
    assert "data:image/jpeg" not in review.build(v, "story_script").read_text()
