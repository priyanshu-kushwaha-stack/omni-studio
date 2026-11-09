import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from rough_cut import plan_segments  # noqa: E402


def test_segments_reuse_last_still_and_trim(tmp_path: Path):
    (tmp_path / "s001.png").write_bytes(b"x")
    (tmp_path / "s003.png").write_bytes(b"x")
    plan = {
        "scenes": [
            {"id": "s001", "start_seconds": 0, "end_seconds": 4},
            {"id": "s002", "start_seconds": 4, "end_seconds": 8},
            {"id": "s003", "start_seconds": 8, "end_seconds": 14},
            {"id": "s004", "start_seconds": 14, "end_seconds": 20},
        ]
    }
    segs = plan_segments(plan, tmp_path, until=None)
    assert [(p.name, h) for p, h in segs] == [("s001.png", 4), ("s001.png", 4), ("s003.png", 6), ("s003.png", 6)]
    segs = plan_segments(plan, tmp_path, until=10)
    assert [(p.name, h) for p, h in segs] == [("s001.png", 4), ("s001.png", 4), ("s003.png", 2)]
