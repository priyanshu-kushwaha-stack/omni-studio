"""Upstream's playbook contracts, applied to every channel playbook through its real path.

The upstream run hides channel links (studio/pytest_upstream.py) because its tests read styles/<name>.yaml
directly; these are the same checks (tests/contracts/test_remotion_theme_playbook_keys.py and
test_theme_text_contrast_contract.py), so the channel playbooks are not left unchecked.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from studio import channels
from studio.pytest_upstream import channel_link_names
from styles.playbook_loader import STYLES_DIR, validate_contrast
from tools.video.video_compose import VideoCompose

SLUGS = channels.list_slugs()

# Upstream's theme derivation gives every light background other than three near-whites a dark caption bar
# (rgba(15, 23, 42, 0.75)), so dark text on a cream paper reads at 1.7:1. That bar is used only by Remotion
# captions through video_compose. professor-of-us renders with its own engine (render_runtime external) and
# its Shorts burn no captions, so the failure is recorded here, strict, rather than hidden.
KNOWN_CAPTION_CONTRAST = {"professor-of-us": "upstream caption bar on cream paper; channel renders externally"}


def _raw(slug: str) -> dict:
    return yaml.safe_load((channels.channels_dir() / slug / "playbook.yaml").read_text(encoding="utf-8"))


def _theme(slug: str) -> dict:
    theme = VideoCompose()._build_theme_from_playbook(slug, {})
    assert theme, f"{slug} yields no theme"
    return theme


def _composite(foreground: str, backdrop: str) -> str:
    def rgba(c: str):
        c = c.strip()
        if c.startswith("rgba"):
            r, g, b, a = (float(v) for v in c[c.index("(") + 1:c.index(")")].split(","))
            return r, g, b, a
        c = c.lstrip("#")
        return int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), 1.0
    fr, fg, fb, a = rgba(foreground)
    br, bg, bb, _ = rgba(backdrop)
    return "#" + "".join(f"{round(a * f + (1 - a) * b):02X}" for f, b in ((fr, br), (fg, bg), (fb, bb)))


def test_every_channel_has_a_playbook_link_the_upstream_run_hides():
    assert set(SLUGS) <= channel_link_names(Path(STYLES_DIR))


@pytest.mark.parametrize("slug", SLUGS)
def test_theme_reads_the_channel_playbook(slug):
    raw, theme = _raw(slug), _theme(slug)
    palette = raw["visual_language"]["color_palette"]
    first = lambda v: v[0] if isinstance(v, list) else v  # noqa: E731
    assert theme["headingFont"] == raw["typography"]["headings"]["font"]
    assert theme["primaryColor"] == first(palette["primary"])
    assert theme["accentColor"] == first(palette["accent"])
    assert theme["backgroundColor"] == palette["background"]
    assert theme["textColor"] == palette["text"]
    if "muted" in palette:
        assert theme["mutedTextColor"] == palette["muted"]
    if raw["identity"]["pace"] == "fast":
        assert theme["transitionDuration"] < 0.4


@pytest.mark.parametrize("slug", SLUGS)
def test_caption_contrast(slug, request):
    if slug in KNOWN_CAPTION_CONTRAST:
        request.applymarker(pytest.mark.xfail(strict=True, reason=KNOWN_CAPTION_CONTRAST[slug]))
    theme = _theme(slug)
    bar = _composite(theme["captionBackgroundColor"], theme["backgroundColor"])
    assert validate_contrast(theme["textColor"], bar)["ratio"] >= 4.5
