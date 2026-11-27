"""The studio-suppose pipeline (Say Suppose film kit): five owner gates, its skills and checks."""

from pathlib import Path

import yaml

from lib.pipeline_loader import load_pipeline_readonly
from studio import checks

REAL_ROOT = Path(__file__).resolve().parents[3]
OM = REAL_ROOT / "core" / "openmontage"
STAGES = ["proposal", "story_script", "final_edit", "final_watch", "publish_prep"]
SKILLS = ["proposal", "script", "edit", "final-watch", "publish"]


def test_five_owner_gates_and_skills():
    m = load_pipeline_readonly("studio-suppose")
    assert [s["name"] for s in m["stages"]] == STAGES
    assert all(s["human_approval_default"] is True and s["checkpoint_required"] is True for s in m["stages"])
    assert [s["skill"] for s in m["stages"]] == [f"studio/studio-suppose-{s}" for s in SKILLS]
    for skill in m["required_skills"]:
        assert (OM / "skills" / f"{skill}.md").is_file(), skill


def test_checks_match_studio_whatif():
    for stage in STAGES:
        assert checks.stage_checks("studio-suppose", stage) == checks.stage_checks("studio-whatif", stage)
        assert checks.stage_warnings("studio-suppose", stage) == checks.stage_warnings("studio-whatif", stage)


def test_story_numbers_in_words_need_no_claim_id(tmp_path, monkeypatch):
    """Film scripts write every number in words (scriptcheck) and invent premise numbers, as what-if stories do."""
    from studio import claims

    class Report:
        def __init__(self, number_words):
            self.number_words = number_words

        def as_dict(self):
            return {"number_words": self.number_words}

    monkeypatch.setattr(checks.channels, "video_dir", lambda ch, vid: tmp_path)
    monkeypatch.setattr(claims, "check", lambda folder, number_words=True: Report(number_words))
    for pipeline in ("studio-whatif", "studio-suppose"):
        assert checks.run_check("claims", object(), "v", "film", pipeline, None, None) == {"number_words": False}
    assert checks.run_check("claims", object(), "v", "dialogue", "studio-dialogue", None, None)["number_words"]


def test_channel_has_the_film_format_at_minus_16():
    ch = yaml.safe_load((REAL_ROOT / "channels" / "say-suppose" / "channel.yaml").read_text())
    assert ch["formats"]["film"] == "studio-suppose"
    assert ch["formats"]["story"] == "studio-whatif"
    assert ch["loudness"]["film"] == {
        "integrated_lufs": -16,
        "tolerance_lu": 1,
        "true_peak_dbtp_max": -1.5,
        "lra_lu_max": 11,
    }


def test_stage_skills_name_their_prompts_and_tools():
    text = {s: (OM / "skills" / "studio" / f"studio-suppose-{s}.md").read_text() for s in SKILLS}
    assert "prompts/outline.md" in text["proposal"] and "say-suppose-thumbnails" in text["proposal"]
    assert "outline.md" in text["proposal"] and "art.yaml" in text["proposal"]
    assert all(
        k in text["script"]
        for k in ["prompts/script.md", "scriptcheck.py", "cast-pass.md", "sheetcheck.py", "voices.py", "cold open"]
    )
    assert "registerFilm" in text["script"] and "--queue render" in text["script"]
    assert "prompts/narration.md" in text["edit"] and "timewarp" in text["edit"]
    for name, body in text.items():
        assert "awaiting_human" in body and "only the owner passes" in body, name
        assert "omni approve" in body, name
