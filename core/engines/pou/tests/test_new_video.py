import datetime as dt
from pathlib import Path
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from new_video import create_video_dir  # noqa: E402


def test_creates_expected_layout(tmp_path):
    d = create_video_dir(tmp_path, "ancient-sleep", dt.date(2026, 11, 3))
    assert d == tmp_path / "2026-11-03_ancient-sleep"
    for rel in [
        "packaging.md",
        "research.md",
        "claims.md",
        "script.md",
        "qc.md",
        "costs.md",
        "assets/provenance.csv",
        "thumbs/context",
        "hooks",
        "narration",
        "renders",
        "captions",
        "metrics",
    ]:
        assert (d / rel).exists(), rel
    header = (d / "assets/provenance.csv").read_text().splitlines()[0]
    assert header == "file,kind,source,model,license,credits,usd,note"


def test_script_template_has_required_sections(tmp_path):
    d = create_video_dir(tmp_path, "x", dt.date(2026, 1, 1))
    text = (d / "script.md").read_text()
    assert "template: mystery" in text
    assert "## [00:00]" in text
    assert "target_minutes: 5" in text
    assert text.count("> RE-ENGAGE:") == 1  # 5-min format: one midpoint cue
    assert "## [04:20] Take-home" in text
    assert "> VISUAL:" in text
    assert "## Sources" in text


def test_claims_template_has_ledger_columns(tmp_path):
    d = create_video_dir(tmp_path, "x", dt.date(2026, 1, 1))
    text = (d / "claims.md").read_text()
    assert "| id | claim as it will be spoken | source URL | verbatim quote from the source | status |" in text
    assert "## Contested claims" in text


def test_refuses_existing_folder(tmp_path):
    create_video_dir(tmp_path, "dup", dt.date(2026, 1, 1))
    with pytest.raises(FileExistsError):
        create_video_dir(tmp_path, "dup", dt.date(2026, 1, 1))


def test_rejects_bad_slug(tmp_path):
    with pytest.raises(ValueError):
        create_video_dir(tmp_path, "Bad Slug!", dt.date(2026, 1, 1))
