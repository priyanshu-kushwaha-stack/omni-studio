"""Phase 4: near-duplicate content across channels (and recent videos of the same channel) fails."""

from __future__ import annotations

from datetime import date
from pathlib import Path

import numpy as np
import pytest
import yaml
from PIL import Image

from studio import channels, cli, similarity

WORDS = (
    "tails apes embryo week sixth body gene jumping mice spine price tripod coccyx muscle sitting bone "
    "million years ago scientists found suspect twist loop cells cleared family tree branch"
).split()


def _script(seed: int, n=120) -> str:
    rng = np.random.default_rng(seed)
    body = " ".join(rng.choice(WORDS, n))
    return f"# Short\n\n## [00:00] Hook\nPROF: {body}\n> VISUAL: a drawing\n"


def _thumb(path: Path, seed: int, brighten: int = 0):
    rng = np.random.default_rng(seed)
    small = rng.integers(0, 255, (9, 16), dtype=np.uint8)
    img = Image.fromarray(np.clip(small.astype(int) + brighten, 0, 255).astype(np.uint8)).resize((320, 180))
    img.save(path)


def _video(channel, title, script, thumb_seed, pattern, media, brighten=0, day=6):
    folder = channels.new_video(channel, title, "short", on=date(2026, 11, day))
    (folder / "script.md").write_text(script)
    _thumb(folder / "thumbnail.png", thumb_seed, brighten)
    render, _ = media("good", container="mp4", pattern=pattern, folder=folder / "renders")
    (folder / "upload.yaml").write_text(yaml.safe_dump({"file": f"renders/{render.name}", "title": title}))
    return folder.name


@pytest.fixture()
def two_channels(studio_root, media):
    alpha, beta = studio_root("alpha"), studio_root("beta")
    original = _video(alpha, "You Had a Tail. Here's Where It Went.", _script(1), 7, "testsrc2", media)
    return alpha, beta, original


def test_planted_near_duplicate_across_two_channels_fails(two_channels, media, capsys):
    alpha, beta, _ = two_channels
    script = _script(1).replace("tails", "tail", 3)
    copy = _video(beta, "You Had a Tail! Here's Where It Went", script, 7, "testsrc2", media, brighten=6)
    report = similarity.check("beta", copy)
    assert not report["ok"]
    text = "\n".join(report["problems"])
    assert "near-duplicate of alpha/" in text and "(other channel)" in text
    for metric in ("title", "script 5-word shingle Jaccard", "thumbnail dHash distance", "frames"):
        assert metric in text, metric
    assert cli.main(["similar", "beta", copy]) == 1
    assert "[FAIL] near-duplicate of alpha/" in capsys.readouterr().out


@pytest.mark.slow  # fingerprints two media files with ffmpeg
def test_distinct_video_on_another_channel_passes(two_channels, media):
    alpha, beta, _ = two_channels
    other = _video(beta, "Why Do We Dream at All?", _script(99), 42, "mandelbrot", media)
    report = similarity.check("beta", other)
    assert report["ok"], report["problems"]
    assert report["compared"] == 1 and report["features"]["frames"] > 5


def test_same_channel_recent_reuse_fails(two_channels, media):
    alpha, _, _ = two_channels
    again = _video(alpha, "Where Did Your Tail Go?", _script(1), 7, "testsrc2", media, day=7)
    report = similarity.check("alpha", again)
    assert any("(same channel)" in p for p in report["problems"])


def test_same_channel_window_is_configurable(two_channels, media):
    alpha, _, _ = two_channels
    again = _video(alpha, "Where Did Your Tail Go?", _script(1), 7, "testsrc2", media, day=7)
    cfg = {**similarity.load_config(), "same_channel_recent": 0}
    assert similarity.check("alpha", again, cfg=cfg)["compared"] == 0


def test_thresholds_live_in_config():
    cfg = similarity.load_config()
    assert 0 < cfg["script_jaccard"] < 1 and 0 < cfg["title_ratio"] <= 1 and cfg["thumbnail_hamming"] < 64


def test_variation_checker_is_not_a_cross_video_check():
    # Reuse decision recorded in similarity.py: OpenMontage's checker scores one scene plan, not two videos.
    from lib.variation_checker import check_scene_variation

    assert "variation_checker" in similarity.__doc__
    assert check_scene_variation([])["verdict"] == "fail"


def test_unreadable_render_elsewhere_is_skipped_not_fatal(two_channels, media):
    alpha, beta, original = two_channels
    broken = channels.new_video(alpha, "Broken Render", "short", on=date(2026, 11, 5))
    (broken / "renders" / "x.mp4").write_bytes(b"\x00")
    copy = _video(beta, "You Had a Tail! Here's Where It Went", _script(1), 7, "testsrc2", media)
    report = similarity.check("beta", copy)
    assert any("render frames unreadable" in s for s in report["skipped"])
    assert any(f"alpha/{original}" in p for p in report["problems"])


def test_unreadable_render_of_the_checked_video_fails(studio_root):
    channel = studio_root("alpha")
    folder = channels.new_video(channel, "Broken", "short", on=date(2026, 11, 6))
    (folder / "renders" / "x.mp4").write_bytes(b"\x00")
    report = similarity.check("alpha", folder.name)
    assert not report["ok"] and "cannot read this video's render frames" in report["problems"][0]
