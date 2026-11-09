"""Boil is opt-in only (owner ban), and the CLIs refuse argv that a pre-run check could misread."""

import sys
from pathlib import Path

import numpy as np
import pytest
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import cli_args  # noqa: E402
import motion  # noqa: E402
import puppet_render  # noqa: E402

PAPER = (0xF6, 0xF1, 0xE7)
INK = (0x2B, 0x2B, 0x2B)
OCHRE = (0xD9, 0xA4, 0x41)


def _still():
    im = Image.new("RGB", (160, 90), PAPER)
    d = ImageDraw.Draw(im)
    d.line((10, 80, 150, 10), fill=INK, width=3)
    d.ellipse((60, 30, 90, 60), fill=OCHRE)
    return np.asarray(im)


# --- boil defaults ---


@pytest.mark.parametrize(
    "spec, expected",
    [
        ({}, None),  # omitted: was {"amp": 1.0}, i.e. boiled
        ({"boil": False}, None),
        ({"boil": None}, None),
        ({"boil": True}, {}),
        ({"boil": {"amp": 2.0, "seed": 3}}, {"amp": 2.0, "seed": 3}),
    ],
)
def test_puppet_scene_boil_is_opt_in(spec, expected):
    assert puppet_render.boil_settings(spec) == expected


def test_flicker_without_a_boil_key_does_not_boil_the_ink():
    f = _still()
    ink, acc = motion.masks(f, PAPER)
    out = motion.apply({"effect": "flicker"}, f, 0.3, PAPER, {})
    assert np.array_equal(out, motion.flicker(f, acc, 0.3))  # flicker only
    assert np.array_equal(out[ink], f[ink])  # ink untouched
    boiled = motion.apply({"effect": "flicker", "boil": True}, f, 0.3, PAPER, {})
    assert not np.array_equal(boiled[ink], f[ink])  # explicit opt-in still works


@pytest.mark.parametrize(
    "spec, boils",
    [
        ({"effect": "boil"}, True),
        ({"effect": "flicker"}, False),
        ({"effect": "flicker", "boil": False}, False),
        ({"effect": "flicker", "boil": True}, True),
        ({"effect": "flicker", "boil": {"amp": 1}}, True),
        ({"effect": "none"}, False),
        ({"effect": "sprite", "boil": True}, False),  # sprite never reads boil
        ({"clip_rate": 1.0}, False),
    ],
)
def test_boil_effective_matches_apply(spec, boils):
    assert motion.boil_effective(spec) is boils
    f = _still()
    ink, _ = motion.masks(f, PAPER)
    if spec.get("effect") in ("boil", "flicker"):
        out = motion.apply(spec, f, 0.3, PAPER, {})
        assert (not np.array_equal(out[ink], f[ink])) is boils


# --- argv ---


def test_tts_refuses_abbreviated_and_repeated_engine(capsys):
    p = cli_args.tts_parser()
    with pytest.raises(SystemExit):
        p.parse_args(["t.txt", "--eng", "eleven", "-o", "x.wav"])
    with pytest.raises(SystemExit):
        p.parse_args(["t.txt", "--engine", "qwen3", "--engine", "eleven", "-o", "x.wav"])
    with pytest.raises(SystemExit):
        p.parse_args(["t.txt", "--engine=qwen3", "--engine=eleven", "-o", "x.wav"])
    assert "more than once" in capsys.readouterr().err
    assert p.parse_args(["t.txt", "--engine=eleven", "-o", "x.wav"]).engine == "eleven"


@pytest.mark.parametrize(
    "argv, expected",
    [
        (["v", "--motion"], Path("v/motion.json")),
        (["v", "--motion", "m.json"], Path("m.json")),
        (["v", "--motion=m.json"], Path("m.json")),
        (["v"], None),
    ],
)
def test_compose_motion_path_is_what_compose_reads(argv, expected):
    a = cli_args.compose_parser().parse_args([*argv, "--narration", "n", "--words", "w", "-o", "o"])
    assert cli_args.compose_motion_path(a) == expected


def test_compose_refuses_abbreviated_and_repeated_motion():
    p = cli_args.compose_parser()
    base = ["v", "--narration", "n", "--words", "w", "-o", "o"]
    with pytest.raises(SystemExit):
        p.parse_args([*base, "--mot", "m.json"])
    with pytest.raises(SystemExit):
        p.parse_args([*base, "--motion", "a.json", "--motion=b.json"])


@pytest.mark.parametrize(
    "argv",
    [
        ["render", "--workers", "2", "stage.json", "-o", "x.mp4"],
        ["clips", "--workers", "2", "stage.json"],
        ["clips", "stage.json", "--only", "s1"],
        ["frames", "--dir", "d", "stage.json", "1.0"],
    ],
)
def test_puppet_stage_is_found_wherever_it_sits(argv):
    assert cli_args.puppet_render_parser().parse_args(argv).stage == Path("stage.json")
