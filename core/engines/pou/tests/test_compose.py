import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import compose  # noqa: E402

WORDS = [{"word": "Twenty", "start": 0.0, "end": 0.3}, {"word": "nights,", "start": 0.3, "end": 0.6},
         {"word": "22", "start": 1.0, "end": 1.3}, {"word": "people.", "start": 1.3, "end": 1.7},
         {"word": "The", "start": 2.0, "end": 2.1}, {"word": "total", "start": 2.1, "end": 2.4},
         {"word": "came", "start": 2.4, "end": 2.6}, {"word": "to", "start": 2.6, "end": 2.7},
         {"word": "18", "start": 2.8, "end": 3.0}, {"word": "minutes.", "start": 3.0, "end": 3.5}]


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
    plan = {"metadata": {"change_classes": {"s001": "illustration", "s002": "motion", "s003": "card"}},
            "scenes": [{"id": "s001", "start_seconds": 0.0, "end_seconds": 2.0, "script_section_id": "a"},
                       {"id": "s002", "start_seconds": 2.0, "end_seconds": 4.0, "script_section_id": "a"},
                       {"id": "s003", "start_seconds": 4.0, "end_seconds": 6.0, "script_section_id": "b"}]}
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
    specs = [{"id": "a", "scene": "s001", "anchor": "22 people", "text": "22", "lead": 0.2},
             {"id": "b", "scene": "s003", "text": "x", "hold": 1.0},
             {"id": "c", "scene": "s999", "text": "orphan"}]
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
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
                    "-ar", "48000", str(nar)], check=True)
    out = tmp_path / "mix.wav"
    compose.mix_audio(nar, [], [], 3.0, out, -24.0)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
                               capture_output=True, text=True, check=True).stdout.strip())
    assert abs(dur - 3.0) < 0.1


def test_find_phrase_matches_digits_and_split_numbers():
    words = [{"word": w, "start": i * 1.0, "end": i * 1.0 + 0.5} for i, w in
             enumerate(["did", "not", "sleep", "8", "hours.", "more", "than", "2", ",000", "in", "6", ".5", "hours,", "10", "-30%."])]
    assert compose.find_phrase(words, "eight hours")[0] == 3.0       # spelled anchor, digit token
    assert compose.find_phrase(words, "than 2000")[0] == 6.0         # one anchor number, two tokens
    assert compose.find_phrase(words, "than 2,000")[0] == 6.0
    assert compose.find_phrase(words, "6 .5")[0] == 10.0             # whisper-style anchor still works
    assert compose.find_phrase(words, "6.5 hours")[0] == 10.0
    assert compose.find_phrase(words, "ten to thirty") is None       # words that are not spoken stay unmatched


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
    assert np.array_equal(plain.base(0.1), moving.base(0.1))          # reveal untouched
    a, b = moving.base(5.0), moving.base(5.2)
    assert not np.array_equal(a, b)                                      # ink boils after the reveal
    assert np.array_equal(moving.base(5.0), moving.base(5.02))          # same 0.1 s step, cached


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
    ImageDraw.Draw(im).rectangle((70, 35, 89, 54), fill=compose.INK)      # 20x20 square, centred
    p = tmp_path / "s001.png"
    im.save(p)
    src = compose.Source(compose.Group("s001", 0.0, 4.0, "illustration", still=p), 90, 160, tmp_path / "scr", 0)
    assert src.still_np.shape[:2] == (src.ph, src.pw)
    ys, xs = np.where((src.still_np < 100).all(axis=2))
    h, w = np.ptp(ys) + 1, np.ptp(xs) + 1
    assert abs(h - w) <= 2                                                # still a square, not a tall rectangle
    assert abs((xs.min() + xs.max()) / 2 - src.pw / 2) <= 2               # crop is centred


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
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"color=c=white:s=64x36:r=30:d={seconds}",
                    "-vf", "geq=r='mod(N*4\\,256)':g='mod(N*4\\,256)':b='mod(N*4\\,256)'", "-pix_fmt", "yuv444p",
                    "-c:v", "libx264", "-qp", "0", str(clip)], check=True)
    g.clip = clip
    return g


def test_clip_rate_defaults_to_clip_rate_and_motion_json_overrides_it(tmp_path):
    g = _clip_group(tmp_path)
    plain = compose.Source(g, 64, 36, tmp_path / "scr", 0)
    boiled = compose.Source(g, 64, 36, tmp_path / "scr", 0, motion_spec={"effect": "boil"})
    real = compose.Source(g, 64, 36, tmp_path / "scr", 0, motion_spec={"effect": "boil", "clip_rate": 1.0})
    assert plain.clip_rate == boiled.clip_rate == compose.CLIP_RATE == 0.75   # videos 1 and 2 unchanged
    assert real.clip_rate == 1.0
    lum = lambda a: float(a.mean())
    t = 1.0   # 30 frames in: frame 22 at 0.75x, frame 30 at 1.0x
    assert abs(lum(plain.base(t)) - 22 * 4) < 3
    assert abs(lum(real.base(t)) - 30 * 4) < 3


def test_clip_cache_follows_the_clip_file(tmp_path):
    import os
    g = _clip_group(tmp_path, 1.0)
    compose.Source(g, 64, 36, tmp_path / "scr", 0)
    first = sorted((tmp_path / "scr").glob("clip_s001*"))
    os.utime(g.clip, (1, 1))   # the clip was re-rendered: its frames must be extracted again
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
    groups = [compose.Group(f"s{i:03d}", i * 2.5, i * 2.5 + 2.5, "illustration", section=f"sec{i // 2}") for i in range(12)]
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
    corner_band = a[a.shape[0] // 2, 8]            # left edge, mid-height: backing, not text
    assert 150 <= corner_band < 255


def test_captions_rejoin_split_words():
    words = [{"word": "about", "start": 0.0, "end": 0.2}, {"word": "twenty", "start": 0.2, "end": 0.4},
             {"word": "-five", "start": 0.4, "end": 0.6}, {"word": "called", "start": 1.0, "end": 1.2},
             {"word": "T", "start": 1.2, "end": 1.3}, {"word": "B", "start": 1.3, "end": 1.4},
             {"word": "X", "start": 1.4, "end": 1.5}, {"word": "T.", "start": 1.5, "end": 1.6}]
    text = " ".join(o.spec["text"] for o in compose.caption_overlays(words, None))
    assert "twenty-five" in text and "TBXT." in text
