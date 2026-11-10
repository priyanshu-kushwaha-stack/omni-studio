import pytest
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import compose  # noqa: E402

WORDS = [
    {"word": "Twenty", "start": 0.0, "end": 0.3},
    {"word": "nights,", "start": 0.3, "end": 0.6},
    {"word": "22", "start": 1.0, "end": 1.3},
    {"word": "people.", "start": 1.3, "end": 1.7},
    {"word": "The", "start": 2.0, "end": 2.1},
    {"word": "total", "start": 2.1, "end": 2.4},
    {"word": "came", "start": 2.4, "end": 2.6},
    {"word": "to", "start": 2.6, "end": 2.7},
    {"word": "18", "start": 2.8, "end": 3.0},
    {"word": "minutes.", "start": 3.0, "end": 3.5},
]


def test_find_phrase_ignores_case_and_punctuation():
    assert compose.find_phrase(WORDS, "22 people") == (1.0, 1.7)
    assert compose.find_phrase(WORDS, "twenty nights") == (0.0, 0.6)
    assert compose.find_phrase(WORDS, "18 minutes", not_before=2.0) == (2.8, 3.5)
    assert compose.find_phrase(WORDS, "18 minutes", not_before=3.0) is None


def _plan(tmp_path: Path):
    stills = tmp_path / "stills"
    stills.mkdir()
    for sid in ("s001", "s003"):
        Image.new("RGB", (64, 36), compose.PAPER).save(stills / f"{sid}.png")
    plan = {
        "metadata": {"change_classes": {"s001": "illustration", "s002": "motion", "s003": "card"}},
        "scenes": [
            {"id": "s001", "start_seconds": 0.0, "end_seconds": 2.0, "script_section_id": "a"},
            {"id": "s002", "start_seconds": 2.0, "end_seconds": 4.0, "script_section_id": "a"},
            {"id": "s003", "start_seconds": 4.0, "end_seconds": 6.0, "script_section_id": "b"},
        ],
    }
    return plan, stills


def test_build_groups_merges_continuations(tmp_path):
    plan, stills = _plan(tmp_path)
    groups = compose.build_groups(plan, stills, None)
    assert [(g.scene_id, g.start, g.end) for g in groups] == [("s001", 0.0, 4.0), ("s003", 4.0, 6.0)]
    assert groups[0].boundaries == [2.0]
    assert groups[1].klass == "card"


def test_build_groups_until_trims(tmp_path):
    plan, stills = _plan(tmp_path)
    groups = compose.build_groups(plan, stills, None, until=3.0)
    assert len(groups) == 1 and groups[0].end == 3.0


def test_resolve_overlays_times_to_anchor_and_scene_end(tmp_path):
    plan, stills = _plan(tmp_path)
    groups = compose.build_groups(plan, stills, None)
    specs = [
        {"id": "a", "scene": "s001", "anchor": "22 people", "text": "22", "lead": 0.2},
        {"id": "b", "scene": "s003", "text": "x", "hold": 1.0},
        {"id": "c", "scene": "s999", "text": "orphan"},
    ]
    ovs = compose.resolve_overlays(specs, WORDS, groups, None)
    assert [(o.spec["id"], round(o.start, 2), o.end) for o in ovs] == [("a", 0.8, 4.0), ("b", 4.0, 5.0)]


def test_overlay_composite_writes_on_left_to_right():
    ov = compose.Overlay({"kind": "label", "text": "hello"}, 0.0, 2.0)
    compose.place_overlays([ov], 640, 360)
    ov.x, ov.y = 100, 100
    frame = np.full((360, 640, 3), 255, dtype=np.uint8)
    half = frame.copy()
    compose.composite(half, ov, 1.0, 0.3)
    full = frame.copy()
    compose.composite(full, ov, 1.0, 1.0)
    changed_half = (half != 255).any(axis=2).sum()
    changed_full = (full != 255).any(axis=2).sum()
    assert 0 < changed_half < changed_full


def test_srt_cues_split_on_sentence_and_length():
    cues = compose.srt_cues(WORDS, max_chars=16)
    assert cues[0] == (0.0, 0.6, "Twenty nights,")
    assert cues[-1][2].endswith("minutes.")
    assert all(b >= a for a, b, _ in cues)


def test_sfx_plan_pencil_on_drawings_page_on_section_turn(tmp_path):
    plan, stills = _plan(tmp_path)
    groups = compose.build_groups(plan, stills, None)
    sfx_dir = tmp_path / "sfx"
    sfx_dir.mkdir()
    for n in ("pencil.wav", "page.wav", "sting.wav"):
        (sfx_dir / n).write_bytes(b"")
    sfx = compose.plan_sfx(groups, [], sfx_dir, None)
    assert [(s.path.name, s.at) for s in sfx] == [("pencil.wav", 0.0), ("page.wav", 4.0)]


def test_mix_audio_pads_to_total_when_narration_is_shorter(tmp_path):
    """The end-screen tail runs past the narration; the mix must not stop with the voice."""
    import subprocess

    nar = tmp_path / "nar.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=440:duration=1",
            "-ar",
            "48000",
            str(nar),
        ],
        check=True,
    )
    out = tmp_path / "mix.wav"
    compose.mix_audio(nar, [], [], 3.0, out, -24.0)
    dur = float(
        subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    )
    assert abs(dur - 3.0) < 0.1


def test_find_phrase_matches_digits_and_split_numbers():
    words = [
        {"word": w, "start": i * 1.0, "end": i * 1.0 + 0.5}
        for i, w in enumerate(
            [
                "did",
                "not",
                "sleep",
                "8",
                "hours.",
                "more",
                "than",
                "2",
                ",000",
                "in",
                "6",
                ".5",
                "hours,",
                "10",
                "-30%.",
            ]
        )
    ]
    assert compose.find_phrase(words, "eight hours")[0] == 3.0  # spelled anchor, digit token
    assert compose.find_phrase(words, "than 2000")[0] == 6.0  # one anchor number, two tokens
    assert compose.find_phrase(words, "than 2,000")[0] == 6.0
    assert compose.find_phrase(words, "6 .5")[0] == 10.0  # whisper-style anchor still works
    assert compose.find_phrase(words, "6.5 hours")[0] == 10.0
    assert compose.find_phrase(words, "ten to thirty") is None  # words that are not spoken stay unmatched


def _inked_group(tmp_path: Path):
    from PIL import ImageDraw

    im = Image.new("RGB", (64, 36), compose.PAPER)
    ImageDraw.Draw(im).line((4, 30, 60, 6), fill=compose.INK, width=2)
    p = tmp_path / "s001.png"
    im.save(p)
    return compose.Group("s001", 0.0, 8.0, "illustration", still=p)


def test_source_applies_motion_after_the_reveal(tmp_path):
    g = _inked_group(tmp_path)
    plain = compose.Source(g, 64, 36, tmp_path / "scr", 0)
    moving = compose.Source(g, 64, 36, tmp_path / "scr", 0, motion_spec={"effect": "boil", "amp": 2.0})
    assert np.array_equal(plain.base(0.1), moving.base(0.1))  # reveal untouched
    a, b = moving.base(5.0), moving.base(5.2)
    assert not np.array_equal(a, b)  # ink boils after the reveal
    assert np.array_equal(moving.base(5.0), moving.base(5.02))  # same 0.1 s step, cached


def test_source_trace_uses_stroke_order_and_longer_reveal(tmp_path):
    g = _inked_group(tmp_path)
    tr = compose.Source(g, 64, 36, tmp_path / "scr", 0, motion_spec={"effect": "trace", "seconds": 2.0})
    assert tr.reveal_seconds == 2.0
    early = tr.base(0.5)
    ink_rows = (early != np.array(compose.PAPER)).any(axis=2)
    assert 0 < ink_rows.sum() < (tr.still_np != np.array(compose.PAPER)).any(axis=2).sum()


def test_source_reveal_zero_shows_the_drawing_at_once(tmp_path):
    # reaction shots (a double-take, a character popping in) must not ink in over 0.9 s
    g = _inked_group(tmp_path)
    snap = compose.Source(g, 64, 36, tmp_path / "scr", 0, motion_spec={"effect": "boil", "reveal": 0})
    assert snap.reveal_seconds == 0
    ink = lambda a: (a != np.array(snap.paper)).any(axis=2).sum()
    plain = compose.Source(g, 64, 36, tmp_path / "scr", 0)
    assert ink(snap.base(0.0)) >= 0.9 * ink(snap.still_np) > ink(plain.base(0.0))
    slow = compose.Source(g, 64, 36, tmp_path / "scr", 0, motion_spec={"effect": "boil", "reveal": 0.3})
    assert slow.reveal_seconds == 0.3


def test_load_specs_accepts_list_and_dict(tmp_path):
    import motion

    (tmp_path / "a.json").write_text(json.dumps([{"scene": "s001", "effect": "boil"}]))
    (tmp_path / "b.json").write_text(json.dumps({"s002": {"effect": "flicker"}}))
    assert motion.load_specs(tmp_path / "a.json")["s001"]["effect"] == "boil"
    assert motion.load_specs(tmp_path / "b.json")["s002"] == {"effect": "flicker", "scene": "s002"}


# ---------------------------------------------------------------- 9:16 Shorts mode


def test_source_crops_a_wide_still_to_a_vertical_frame_without_squashing(tmp_path):
    im = Image.new("RGB", (160, 90), compose.PAPER)
    ImageDraw.Draw(im).rectangle((70, 35, 89, 54), fill=compose.INK)  # 20x20 square, centred
    p = tmp_path / "s001.png"
    im.save(p)
    src = compose.Source(compose.Group("s001", 0.0, 4.0, "illustration", still=p), 90, 160, tmp_path / "scr", 0)
    assert src.still_np.shape[:2] == (src.ph, src.pw)
    ys, xs = np.where((src.still_np < 100).all(axis=2))
    h, w = np.ptp(ys) + 1, np.ptp(xs) + 1
    assert abs(h - w) <= 2  # still a square, not a tall rectangle
    assert abs((xs.min() + xs.max()) / 2 - src.pw / 2) <= 2  # crop is centred


def test_overlay_text_is_larger_on_a_vertical_frame():
    # Shorts are watched on a phone: labels sized like 16:9 read too small (draft v1), so 9:16 gets 1.5x
    rng = lambda: compose.random.Random(1)
    wide = compose.render_overlay({"kind": "label", "text": "70 kg"}, 1920, 1080, rng())
    tall = compose.render_overlay({"kind": "label", "text": "70 kg"}, 1080, 1920, rng())
    assert 1.4 < tall.height / wide.height < 1.6


def test_caption_overlays_are_short_lines_in_the_lower_middle():
    ovs = compose.caption_overlays(WORDS, until=None)
    assert [o.spec["text"] for o in ovs][:2] == ["Twenty nights,", "22 people."]
    assert all(o.spec["kind"] == "caption" and o.spec["pos"][1] > 0.6 for o in ovs)
    assert all(len(o.spec["text"]) <= 24 for o in ovs)
    assert ovs[0].start == 0.0 and ovs[0].end >= 0.6


def test_captions_appear_at_once_without_write_on():
    ov = compose.Overlay({"kind": "caption", "text": "hi"}, 1.0, 2.0)
    a, frac = compose.overlay_alpha(ov, 1.0)
    assert a == 1.0 and frac == 1.0


def _clip_group(tmp_path: Path, seconds: float = 2.0):
    import subprocess

    g = _inked_group(tmp_path)
    clip = tmp_path / "s001.mp4"
    # frame n shows n on a counter, so the frame index read back is unambiguous
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            f"color=c=white:s=64x36:r=30:d={seconds}",
            "-vf",
            "geq=r='mod(N*4\\,256)':g='mod(N*4\\,256)':b='mod(N*4\\,256)'",
            "-pix_fmt",
            "yuv444p",
            "-c:v",
            "libx264",
            "-qp",
            "0",
            str(clip),
        ],
        check=True,
    )
    g.clip = clip
    return g


def test_clip_rate_defaults_to_clip_rate_and_motion_json_overrides_it(tmp_path):
    g = _clip_group(tmp_path)
    plain = compose.Source(g, 64, 36, tmp_path / "scr", 0)
    boiled = compose.Source(g, 64, 36, tmp_path / "scr", 0, motion_spec={"effect": "boil"})
    real = compose.Source(g, 64, 36, tmp_path / "scr", 0, motion_spec={"effect": "boil", "clip_rate": 1.0})
    assert plain.clip_rate == boiled.clip_rate == compose.CLIP_RATE == 0.75  # videos 1 and 2 unchanged
    assert real.clip_rate == 1.0
    lum = lambda a: float(a.mean())
    t = 1.0  # 30 frames in: frame 22 at 0.75x, frame 30 at 1.0x
    assert abs(lum(plain.base(t)) - 22 * 4) < 3
    assert abs(lum(real.base(t)) - 30 * 4) < 3


def test_clip_cache_follows_the_clip_file(tmp_path):
    import os

    g = _clip_group(tmp_path, 1.0)
    compose.Source(g, 64, 36, tmp_path / "scr", 0)
    first = sorted((tmp_path / "scr").glob("clip_s001*"))
    os.utime(g.clip, (1, 1))  # the clip was re-rendered: its frames must be extracted again
    compose.Source(g, 64, 36, tmp_path / "scr", 0)
    assert len(sorted((tmp_path / "scr").glob("clip_s001*"))) == len(first) + 1


def _sfx_dir(tmp_path):
    d = tmp_path / "sfx"
    d.mkdir()
    for n in ("pencil", "page", "sting"):
        (d / f"{n}.wav").write_bytes(b"")
    return d


def test_short_sfx_are_sparse_and_quiet(tmp_path):
    # Shorts cut every 2-3 s; a pencil at every drawing and a page at every section was "a lot of noise"
    d = _sfx_dir(tmp_path)
    groups = [
        compose.Group(f"s{i:03d}", i * 2.5, i * 2.5 + 2.5, "illustration", section=f"sec{i // 2}") for i in range(12)
    ]
    long_form = compose.plan_sfx(groups, [], d, None)
    short = compose.plan_sfx(groups, [], d, None, short=True)
    assert len(short) <= 6 < len(long_form)
    assert not any(s.path.name == "page.wav" for s in short)
    starts = sorted(s.at for s in short)
    assert all(b - a >= 5.0 for a, b in zip(starts, starts[1:]))
    assert max(s.gain_db for s in short) <= -24


def test_caption_layout_sets_width_x_and_per_scene_height(tmp_path):
    # layout written by overlay_check --fix: shorter lines, nudged left of the Shorts buttons, a height per shot
    groups = [compose.Group("s001", 0.0, 1.0, "illustration"), compose.Group("s002", 1.0, 3.0, "illustration")]
    layout = {"max_chars": 16, "x": 0.45, "y": {"s001": 0.62, "s002": 0.74}}
    ovs = compose.caption_overlays(WORDS, None, layout=layout, groups=groups)
    assert all(len(o.spec["text"]) <= 16 and o.spec["pos"][0] == 0.45 for o in ovs)
    assert ovs[0].spec["pos"][1] == 0.62
    assert any(o.spec["pos"][1] == 0.74 for o in ovs if o.start >= 1.0)


def test_caption_has_a_soft_paper_backing():
    # captions cross busy drawings in Shorts (owner: text placement); a translucent paper pill keeps them legible
    im = compose.render_overlay({"kind": "caption", "text": "Argentavis,"}, 1080, 1920, compose.random.Random(1))
    a = np.asarray(im)[..., 3]
    corner_band = a[a.shape[0] // 2, 8]  # left edge, mid-height: backing, not text
    assert 150 <= corner_band < 255


def test_captions_rejoin_split_words():
    words = [
        {"word": "about", "start": 0.0, "end": 0.2},
        {"word": "twenty", "start": 0.2, "end": 0.4},
        {"word": "-five", "start": 0.4, "end": 0.6},
        {"word": "called", "start": 1.0, "end": 1.2},
        {"word": "T", "start": 1.2, "end": 1.3},
        {"word": "B", "start": 1.3, "end": 1.4},
        {"word": "X", "start": 1.4, "end": 1.5},
        {"word": "T.", "start": 1.5, "end": 1.6},
    ]
    text = " ".join(o.spec["text"] for o in compose.caption_overlays(words, None))
    assert "twenty-five" in text and "TBXT." in text


QUIZ = {
    "id": "q2",
    "kind": "quiz",
    "scene": "s001",
    "board": [0.5, 0.1, 0.9, 0.6],
    "cards": ["15", "~35", "55"],
    "answer": 1,
    "fade": [2],
    "note": "+ diet",
}


def test_quiz_parts_pop_cards_then_ring_then_reveal():
    parts = compose.quiz_parts(QUIZ, ask_end=10.0, reveal=14.5, end=20.0)
    kinds = [p[0]["kind"] for p in parts]
    assert kinds.count("card") == 3 and kinds.count("ring") == 1 and kinds.count("number") == 3
    cards = [p for p in parts if p[0]["kind"] == "card"]
    assert [round(c[1], 2) for c in cards] == [10.1, 10.4, 10.7]  # pop one after another
    ring = next(p for p in parts if p[0]["kind"] == "ring")
    d0 = 10.1 + 2 * compose.QUIZ_POP_GAP + 0.15
    assert ring[1] == pytest.approx(d0) and ring[2] == pytest.approx(d0 + compose.QUIZ_RING_SECONDS)
    digits = [p for p in parts if p[0]["kind"] == "number"]
    assert [d[0]["text"] for d in digits] == ["3", "2", "1"] and all(d[0]["sfx"] == "tick" for d in digits)
    circle = next(p for p in parts if p[0]["kind"] == "circle")
    assert circle[1] == 14.5 and circle[0]["sfx"] == "sting"
    crosses = [p for p in parts if p[0]["kind"] == "cross"]
    assert len(crosses) == 1  # card 0 struck; card 2 fades instead
    assert cards[2][2] < 15.5 and cards[1][2] == 20.0 and cards[0][2] == 20.0
    note = next(p for p in parts if p[0]["kind"] == "label")
    assert note[0]["text"] == "+ diet" and note[1] >= 14.5
    assert all(p[0]["quiz"] == "q2" and p[0]["scene"] == "s001" for p in parts)


def test_quiz_cards_sit_inside_the_board_left_to_right():
    parts = compose.quiz_parts(QUIZ, 10.0, 14.5, 20.0)
    xs = [p[0]["pos"][0] for p in parts if p[0]["kind"] == "card"]
    assert xs == sorted(xs) and 0.5 < xs[0] and xs[-1] < 0.9
    assert all(0.1 < p[0]["pos"][1] < 0.6 for p in parts)


def test_quiz_ring_can_sit_off_the_board_and_the_note_clears_the_cards():
    # video 5: the ring under the board covered You's face; it moves to empty paper beside the board
    parts = compose.quiz_parts(dict(QUIZ, ring_pos=[0.19, 0.28]), 10.0, 14.5, 20.0)
    ring = next(p for p in parts if p[0]["kind"] == "ring")
    digits = [p for p in parts if p[0]["kind"] == "number"]
    assert ring[0]["pos"] == [0.19, 0.28] and all(d[0]["pos"] == [0.19, 0.28] for d in digits)
    card_y = next(p for p in parts if p[0]["kind"] == "card")[0]["pos"][1]
    note_y = next(p for p in parts if p[0]["kind"] == "label")[0]["pos"][1]
    assert note_y - card_y >= 0.35 * (QUIZ["board"][3] - QUIZ["board"][1])  # well below the card row


def test_resolve_overlays_expands_a_quiz_from_its_anchors():
    words = [
        {"word": w, "start": i * 0.5, "end": i * 0.5 + 0.4}
        for i, w in enumerate("what's the average fifty five um um um um roughly thirty five".split())
    ]
    g = compose.Group("s001", 0.0, 10.0, "illustration")
    spec = dict(QUIZ, ask_anchor="what's the average", reveal_anchor="roughly thirty five")
    ovs = compose.resolve_overlays([spec], words, [g], None)
    circle = next(o for o in ovs if o.spec["kind"] == "circle")
    assert abs(circle.start - 4.5) < 0.2  # "roughly" starts at 4.5 s
    first_card = min(o.start for o in ovs if o.spec["kind"] == "card")
    assert abs(first_card - (1.4 + 0.1)) < 1e-6  # "average" ends at 1.4 s


def test_ring_and_circle_draw_on_around_the_clock():
    rng = compose.random.Random(1)
    for kind in ("ring", "circle"):
        img = compose.render_overlay({"kind": kind, "w": 200, "h": 200, "text": "35"}, 1920, 1080, rng)
        a = np.asarray(img)[..., 3]
        assert a.sum() > 0 and a[a.shape[0] // 2, a.shape[1] // 2] == 0  # hollow
    frame = np.full((300, 300, 3), 250, np.uint8)
    ov = compose.Overlay({"kind": "ring", "w": 200, "h": 200}, 0, 3)
    ov.image = compose.render_overlay(ov.spec, 1920, 1080, rng)
    compose.composite(frame, ov, 1.0, 0.25)
    drawn = frame < 200
    h = ov.image.height
    assert drawn[: h // 2].any() and not drawn[h // 2 + 10 : h].any()  # first quarter only: top-right arc


def _sfx_files(tmp_path, names=("pencil", "page", "sting", "pop", "tick", "whoosh")):
    d = tmp_path / "sfx_all"
    d.mkdir(exist_ok=True)
    for n in names:
        (d / f"{n}.wav").write_bytes(b"")
    return d


def test_long_form_pencils_at_most_one_per_4s(tmp_path):
    d = _sfx_files(tmp_path)
    groups = [compose.Group(f"s{i:03d}", i * 1.5, i * 1.5 + 1.5, "illustration", section="a") for i in range(10)]
    starts = [s.at for s in compose.plan_sfx(groups, [], d, None) if s.path.name == "pencil.wav"]
    assert all(b - a >= 4.0 for a, b in zip(starts, starts[1:])) and starts[0] == 0.0


def test_quiz_parts_carry_their_sfx_and_quiz_plates_whoosh_sparingly(tmp_path):
    d = _sfx_files(tmp_path)
    groups = [
        compose.Group("a", 0, 5, "quiz"),
        compose.Group("b", 5, 6, "character"),
        compose.Group("c", 6, 12, "quiz"),
        compose.Group("d", 14, 20, "quiz"),
    ]
    ovs = [
        compose.Overlay({"kind": "card", "sfx": "pop"}, 1.0, 4.0),
        compose.Overlay({"kind": "number", "sfx": "tick"}, 1.1, 2.0),
        compose.Overlay({"kind": "circle", "sfx": "sting"}, 3.5, 5.0),
    ]
    sfx = compose.plan_sfx(groups, ovs, d, None)
    names = [(s.path.name, s.at) for s in sfx]
    assert ("pop.wav", 1.0) in names and ("tick.wav", 1.1) in names and ("sting.wav", 3.5) in names
    whooshes = [at for n, at in names if n == "whoosh.wav"]
    assert whooshes == [0, 14]  # the plate at 6 s is within 8 s of the one at 0 s
    assert next(s for s in sfx if s.path.name == "pop.wav").gain_db == compose.SFX_GAIN["pop"]


def test_volume_expr_is_unity_outside_windows():
    e = compose.volume_expr([(1.0, 2.0, -10.0)])
    assert e.startswith("if(") and "lt(t," in e
    assert compose.volume_expr([]) == "1"


ADJ = [(10.0, 14.2, -10.0), (14.2, 14.5, -60.0), (20.0, 25.0, -10.0)]


def _eval_expr(expr, t):
    """Tiny evaluator for the nested if(lt(t,x),a,b) / numeric expressions volume_expr emits."""
    import re

    py = re.sub(r"\blt\(", "_lt(", expr)
    py = re.sub(r"\bif\(", "_if(", py)
    return eval(py, {"_lt": lambda a, b: a < b, "_if": lambda c, a, b: a if c else b, "t": t})


def test_duck_gain_is_continuous_and_matches_windows():
    r = compose.DUCK_RAMP
    g = lambda t: compose.duck_gain(ADJ, t)
    assert g(5.0) == 1.0 and g(17.0) == 1.0 and g(30.0) == 1.0
    assert g(12.0) == pytest.approx(10 ** (-10 / 20)) and g(22.0) == pytest.approx(10 ** (-10 / 20))
    assert g(14.35) == pytest.approx(10 ** (-60 / 20))
    max_step = (1.0 / r) * 0.001 * 1.01  # steepest ramp: full unity swing over DUCK_RAMP, per 1 ms
    prev = g(0.0)
    for k in range(1, 30001):
        cur = g(k * 0.001)
        assert abs(cur - prev) <= max_step
        prev = cur
    # at the shared edge it goes -10 dB -> -60 dB without rising back toward unity
    hi = 10 ** (-10 / 20)
    assert all(g(14.2 + d / 1000) <= hi + 1e-9 for d in range(-60, 61))


def test_volume_expr_matches_duck_gain():
    e = compose.volume_expr(ADJ)
    for k in range(0, 3000):
        t = k * 0.01
        assert _eval_expr(e, t) == pytest.approx(compose.duck_gain(ADJ, t), abs=1e-3)


def test_mix_audio_duck_edges_do_not_click(tmp_path):
    import subprocess

    nar = tmp_path / "nar.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "6", str(nar)],
        check=True,
    )
    mus = tmp_path / "mus.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=330:duration=6",
            "-ar",
            "48000",
            str(mus),
        ],
        check=True,
    )
    out = tmp_path / "mix.wav"
    compose.mix_audio(nar, [mus], [], 6.0, out, -12.0, duck=[(2.0, 3.5, -10.0), (3.5, 4.0, -60.0)])
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(out), "-f", "f32le", "-ac", "1", "-ar", "48000", "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(raw, np.float32)
    d = np.abs(np.diff(x))
    ref = float(np.median(d[int(1.6 * 48000) : int(1.9 * 48000)]))  # steady, un-ducked, past the fade-in
    for edge in (2.0, 3.5, 4.0):
        seg = d[int((edge - 0.1) * 48000) : int((edge + 0.1) * 48000)]
        assert seg.max() < 3 * ref, f"click at {edge}s: {seg.max():.5f} vs median {ref:.5f}"


def test_quiz_audio_ducks_under_the_countdown_and_silences_before_the_reveal():
    ovs = [
        compose.Overlay({"kind": "ring", "quiz": "q"}, 10.0, 13.0),
        compose.Overlay({"kind": "circle", "quiz": "q"}, 14.5, 20),
    ]
    duck, cues = compose.quiz_audio(ovs)
    assert (10.0, 14.2, -10.0) in duck and (14.2, 14.5, -60.0) in duck
    assert cues == [(10.0, 14.2)]


def test_mix_audio_with_a_duck_window_is_quieter_inside_it(tmp_path):
    import subprocess

    nar = tmp_path / "nar.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "4", str(nar)],
        check=True,
    )
    mus = tmp_path / "mus.wav"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=330:duration=4",
            "-ar",
            "48000",
            str(mus),
        ],
        check=True,
    )
    out = tmp_path / "mix.wav"
    compose.mix_audio(nar, [mus], [], 4.0, out, -12.0, duck=[(2.0, 3.0, -40.0)])
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(out), "-f", "f32le", "-ac", "1", "-ar", "8000", "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(raw, np.float32)
    rms = lambda a, b: float(np.sqrt(np.mean(x[int(a * 8000) : int(b * 8000)] ** 2)))
    assert rms(2.2, 2.8) < 0.1 * rms(1.6, 1.9)


def test_punch_env_rises_fast_and_settles():
    assert compose.punch_env(-0.1) == 0 and compose.punch_env(1.2) == 0
    assert compose.punch_env(0.15) == pytest.approx(1.0, abs=0.05)
    assert 0 < compose.punch_env(0.6) < 1


def test_punch_never_exceeds_prescale_even_on_top_of_drift_and_pushes(tmp_path):
    still = tmp_path / "a.png"
    Image.new("RGB", (192, 108), compose.PAPER).save(still)
    g = compose.Group("a", 0.0, 6.0, "illustration", boundaries=[1.0, 2.0, 3.0], still=still)
    g.punches = [(3.1, None)]
    src = compose.Source(g, 192, 108, tmp_path, 0)
    peak = src.zoom(3.25)[0]
    assert peak < compose.PRESCALE and peak > src.zoom(2.9)[0] + 0.03


def test_attach_punches_from_reveal_circles_and_punch_items():
    g = compose.Group("a", 0, 10, "illustration")
    ovs = [
        compose.Overlay({"kind": "circle", "quiz": "q"}, 4.0, 9.0),
        compose.Overlay({"kind": "punch", "focus": [0.3, 0.4]}, 7.0, 7.1),
        compose.Overlay({"kind": "card"}, 1.0, 9.0),
    ]
    kept = compose.attach_punches([g], ovs)
    assert [o.spec["kind"] for o in kept] == ["circle", "card"]
    assert g.punches == [(4.0, None), (7.0, [0.3, 0.4])]


# ---- final-fix review findings


def test_short_or_broken_quiz_warns_and_is_skipped(capsys):
    words = [
        {"word": w, "start": i * 0.5, "end": i * 0.5 + 0.4}
        for i, w in enumerate("what's the average fifty five roughly thirty five".split())
    ]
    g = compose.Group("s001", 0.0, 10.0, "illustration")
    missing = dict(QUIZ, ask_anchor="what's the average")  # no reveal_anchor key
    assert compose.resolve_overlays([missing], words, [g], None) == []
    assert "quiz q2" in capsys.readouterr().err
    short = dict(QUIZ, ask_anchor="what's the average", reveal_anchor="fifty five")  # reveal 0.9 s after ask end
    assert compose.resolve_overlays([short], words, [g], None) == []
    assert "warn" in capsys.readouterr().err


def test_quiz_audio_skips_a_quiz_with_no_room_for_the_countdown():
    ovs = [
        compose.Overlay({"kind": "ring", "quiz": "q"}, 10.0, 10.1),
        compose.Overlay({"kind": "circle", "quiz": "q"}, 10.2, 20),
    ]
    assert compose.quiz_audio(ovs) == ([], [])


def test_punch_settles_back_even_after_many_boundaries(tmp_path):
    still = tmp_path / "a.png"
    Image.new("RGB", (192, 108), compose.PAPER).save(still)
    g = compose.Group("a", 0.0, 10.0, "illustration", boundaries=[0.5, 1.0, 1.5, 2.0, 2.5], still=still)
    nopunch = compose.Source(g, 192, 108, tmp_path, 0)
    plain = [nopunch.zoom(t)[0] for t in (3.25, 3.4, 3.6, 3.8, 4.8)]
    g2 = compose.Group("a", 0.0, 10.0, "illustration", boundaries=g.boundaries, still=still)
    g2.punches = [(3.1, None)]
    src = compose.Source(g2, 192, 108, tmp_path, 0)
    assert src.zoom(3.25)[0] > src.zoom(3.09)[0] + 0.005  # peak above the pre-punch zoom
    decay = [src.zoom(t)[0] for t in (3.25, 3.4, 3.6, 3.8)]
    assert all(a > b for a, b in zip(decay, decay[1:]))  # no plateau at the clamp
    assert src.zoom(4.3)[0] == pytest.approx(nopunch.zoom(4.3)[0])  # 1.2 s on: settled


def test_countdown_ring_sweeps_linearly():
    ov = compose.Overlay({"kind": "ring"}, 10.0, 13.0)
    assert compose.overlay_alpha(ov, 11.0)[1] == pytest.approx(1 / 3, abs=1e-6)
    lab = compose.Overlay({"kind": "label"}, 0.0, 5.0)
    assert compose.overlay_alpha(lab, 0.175)[1] == pytest.approx(compose._ease(0.5))


def test_countdown_digits_start_after_the_last_card_pop():
    parts = compose.quiz_parts(QUIZ, 10.0, 14.5, 20.0)
    digits = [p for p in parts if p[0]["kind"] == "number"]
    last_pop = 10.1 + 2 * compose.QUIZ_POP_GAP
    ring = next(p for p in parts if p[0]["kind"] == "ring")
    assert digits[0][1] == pytest.approx(last_pop + 0.15) and digits[-1][2] == pytest.approx(ring[2])
    assert ring[1] == pytest.approx(digits[0][1])  # G5 note: ring and 3-2-1 start together


def test_countdown_ring_shortens_when_the_reveal_comes_early():
    parts = compose.quiz_parts(QUIZ, 10.0, 12.5, 20.0)
    ring = next(p for p in parts if p[0]["kind"] == "ring")
    assert ring[2] == pytest.approx(12.2) and ring[1] == pytest.approx(10.85)


def test_reveal_circle_focuses_its_own_card():
    parts = compose.quiz_parts(QUIZ, 10.0, 14.5, 20.0)
    circle = next(p[0] for p in parts if p[0]["kind"] == "circle")
    assert circle["focus"] == circle["pos"]


def test_overlay_sfx_outside_the_allowlist_is_ignored(tmp_path):
    d = _sfx_files(tmp_path)
    ovs = [
        compose.Overlay({"kind": "label", "sfx": "pencil"}, 3.0, 5.0),
        compose.Overlay({"kind": "label", "sfx": "pop"}, 4.0, 5.0),
    ]
    out = compose.plan_sfx([], ovs, d, None)
    assert [s.path.stem for s in out] == ["pop"]


def test_quiz_note_pos_override():
    parts = compose.quiz_parts({**QUIZ, "note_pos": [0.7, 0.5]}, 10.0, 14.5, 20.0)
    note = next(p for p in parts if p[0]["kind"] == "label")
    assert note[0]["pos"] == [0.7, 0.5]
