"""Every reviewed draft is kept, named by the sha256 of its bytes."""

from __future__ import annotations

import pytest

from studio.room import snapshot as s


def test_save_and_load_a_draft(tmp_path):
    src = tmp_path / "script.md"
    src.write_text("PROF: Hello.\n", encoding="utf-8")
    sha = s.save_draft(tmp_path / "video", src)
    assert sha == s.sha256_file(src)
    assert (tmp_path / "video" / "room" / "drafts" / f"{sha}.md").is_file()
    assert s.load_draft(tmp_path / "video", sha) == "PROF: Hello.\n"
    assert s.save_draft(tmp_path / "video", src) == sha  # idempotent


def test_an_edited_snapshot_is_refused(tmp_path):
    src = tmp_path / "script.md"
    src.write_text("a\n")
    sha = s.save_draft(tmp_path, src)
    (s.drafts_dir(tmp_path) / f"{sha}.md").write_text("b\n")
    with pytest.raises(ValueError, match="edited"):
        s.load_draft(tmp_path, sha)
