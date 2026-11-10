from pathlib import Path
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from import_assets import import_asset  # noqa: E402

HEADER = "file,kind,source,model,license,credits,usd,note\n"


def setup(tmp_path):
    video = tmp_path / "video"
    (video / "assets").mkdir(parents=True)
    (video / "assets" / "provenance.csv").write_text(HEADER)
    om = tmp_path / "om"
    src = tmp_path / "clip.mp4"
    src.write_bytes(b"\x00\x01")
    return video, om, src


def test_copies_into_kind_folder_and_logs(tmp_path):
    video, om, src = setup(tmp_path)
    dest = import_asset(
        src,
        video,
        om,
        kind="video",
        source="higgsfield",
        model="kling3_0",
        license="generated",
        credits=10,
        usd=0.55,
        note="hero 1",
    )
    assert dest == om / "assets" / "video" / "clip.mp4"
    assert dest.read_bytes() == b"\x00\x01"
    rows = (video / "assets" / "provenance.csv").read_text().splitlines()
    assert rows[0] == HEADER.strip()
    assert rows[1] == "assets/video/clip.mp4,video,higgsfield,kling3_0,generated,10,0.55,hero 1"


def test_rejects_unknown_kind(tmp_path):
    video, om, src = setup(tmp_path)
    with pytest.raises(ValueError):
        import_asset(src, video, om, kind="gif", source="x", model="y", license="z", credits=0, usd=0)


def test_refuses_overwrite(tmp_path):
    video, om, src = setup(tmp_path)
    import_asset(src, video, om, kind="image", source="x", model="y", license="z", credits=0, usd=0)
    with pytest.raises(FileExistsError):
        import_asset(src, video, om, kind="image", source="x", model="y", license="z", credits=0, usd=0)
