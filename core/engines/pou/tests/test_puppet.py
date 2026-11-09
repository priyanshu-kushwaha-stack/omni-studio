import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import puppet as pp  # noqa: E402

WORDS = [
    {"word": "This", "start": 1.0, "end": 1.2},
    {"word": "is", "start": 1.2, "end": 1.3},
    {"word": "Oog,", "start": 1.30, "end": 1.6},
    {"word": "oog", "start": 3.0, "end": 3.2},
]


def test_spring_overshoots_then_settles():
    ys = [pp.spring(t / 100, 170, 12) for t in range(0, 300)]
    assert ys[0] == 0.0
    assert max(ys) > 1.1  # underdamped: visible overshoot
    assert abs(ys[-1] - 1.0) < 0.01


def test_critically_damped_spring_never_overshoots():
    assert max(pp.spring(t / 100, 400, 40) for t in range(300)) <= 1.0 + 1e-9


def test_stepped_holds_on_twos_from_the_action_start():
    start = 1.30
    vals = [pp.stepped(n / 30, start) for n in range(38, 44)]
    assert vals[0] == -1.0  # frame 38 is before the word
    assert vals[1] == 0.0 and vals[2] == 0.0  # frames 39 (on the word) and 40 share a pose
    assert vals[3] == vals[4] > 0  # then the next pose is held for two frames


def test_word_time_ignores_case_and_punctuation_and_respects_after():
    assert pp.word_time(WORDS, "oog") == 1.30
    assert pp.word_time(WORDS, "Oog,", after=2.0) == 3.0
    assert pp.resolve_at({"word": "Oog,", "offset": 0.25}, WORDS, 0.0) == 1.55


def test_action_starts_on_its_word_frame():
    keys = pp.expand([{"pose": "head", "at": {"word": "Oog,"}, "to": {"rot": 10}, "ease": "snap"}], WORDS, 0.0)
    first = next(n for n in range(200) if pp.channel_state(keys, n / 30, {}).get("head", {}).get("rot", 0) != 0)
    assert abs(first / 30 - 1.30) <= 2 / 30


def test_blink_closes_then_reopens():
    keys = pp.expand([{"blink": ["eye"], "at": 1.0}], WORDS, 0.0)
    lid = [pp.channel_state(keys, t, {}).get("eye", {}).get("lid", 0.0) for t in (0.95, 1.0, 1.05, 1.15)]
    assert lid == [0.0, 1.0, 1.0, 0.0]


def test_paper_fill_removes_ink_inside_the_hole():
    rng = np.random.default_rng(0)
    img = (np.full((120, 160, 3), 235) + rng.integers(-4, 5, (120, 160, 1))).astype(np.uint8)
    img[40:80, 60:100] = 20
    hole = np.zeros((120, 160), bool)
    hole[36:84, 56:104] = True
    out = pp.paper_fill(img, hole, img[:30, :50])
    assert out[45:75, 65:95].min() > 200


def test_affine_rotates_about_the_pivot():
    M = pp.affine(10, 10, rot=90)
    assert np.allclose(M @ [10, 10, 1], [10, 10, 1])
    assert np.allclose(M @ [20, 10, 1], [10, 20, 1])  # clockwise on screen (y down)


def test_affine_shear_leans_from_the_pivot_row():
    M = pp.affine(10, 100, kx=0.05)
    assert np.allclose(M @ [30, 100, 1], [30, 100, 1])  # the feet row stays put
    assert np.allclose(M @ [10, 0, 1], [15, 0, 1])  # 100 px up moves 5 px right


def test_idle_breathes_on_the_chosen_channel():
    out = pp.idle({"a": {"amp": 1.5, "period": 1.6}, "b": {"amp": 0.004, "period": 1.6, "ch": "sy"}}, 0.4)
    assert set(out["a"]) == {"y"} and abs(out["a"]["y"] - 1.5) < 1e-6
    assert set(out["b"]) == {"sy"} and abs(out["b"]["sy"] - 0.004) < 1e-9


def test_jitter_is_zero_outside_its_window_and_starts_on_the_first_frame():
    spec = {"x": 3, "rot": 2}
    assert pp.jitter(spec, 0.99, 1.0, 2.0) == {} and pp.jitter(spec, 2.0, 1.0, 2.0) == {}
    first = pp.jitter(spec, 1.0, 1.0, 2.0, seed=1)
    assert abs(first["x"]) <= 3 and abs(first["rot"]) <= 2 and first != {}
    assert pp.jitter(spec, 1.01, 1.0, 2.0, seed=1) == first  # held for the step
    grow = pp.jitter({"sy": 0.1, "grow": True}, 1.5, 1.0, 2.0)
    assert 0 <= grow["sy"] <= 0.1  # a flame only grows


def test_wipe_in_draws_on_in_order_and_out_erases():
    order = np.linspace(0, 1, 11)[None, :]
    a0, a_half, a1 = (pp.wipe_alpha(order, "in", p) for p in (0.0, 0.5, 1.0))
    assert a0.max() == 0 and a1.min() == 1
    assert a_half[0, 0] == 1 and a_half[0, -1] == 0
    assert np.allclose(pp.wipe_alpha(order, "out", 0.5), 1 - a_half)


def test_component_waves_thin_a_crowd_from_the_edges_in():
    m = np.zeros((20, 100), bool)
    for x in (5, 25, 45, 65, 85):
        m[5:15, x : x + 4] = True
    w = pp.component_waves(m, (47, 10), 3, link=1)
    assert w[10, 6] == 0 and w[10, 86] == 0  # outermost go first
    assert w[10, 46] == 2  # the centre goes last
    assert w[0, 0] == -1
    a = pp.wave_alpha(w, "out", 1.0, [1.0, 2.0, 3.0], 0.3)
    assert a[10, 6] < 1 and a[10, 46] == 1  # wave 0 has started fading on its word, wave 2 has not


def test_envelope_steps_follow_loudness():
    sr = 48000
    t = np.arange(int(sr * 1.0)) / sr
    sig = np.sin(2 * np.pi * 200 * t)
    sig[: sr // 2] *= 0.0  # first half silent, second half loud
    env = pp.mouth_envelope(sig.astype(np.float32), sr, hz=15)
    assert len(env) == 15
    assert env[:7].max() < 0.01 and env[-5:].min() > 0.5


def test_talk_keys_open_on_loud_steps_and_close_at_the_end():
    env = np.array([0.0, 0.2, 1.0, 1.0, 0.5, 0.0, 0.9])
    keys = pp.talk_keys("you.mouth", env, t0=2.0, hz=10)
    shapes = [(round(k.start, 2), k.to["shape"]) for k in keys]
    # changes only: closed at 2.0, small at 2.1, open at 2.2, small at 2.4, closed at 2.5, open at 2.6, closed after
    assert shapes == [
        (2.0, "closed"),
        (2.1, "small"),
        (2.2, "open"),
        (2.4, "small"),
        (2.5, "closed"),
        (2.6, "open"),
        (2.7, "closed"),
    ]
    assert all(k.ease == "snap" and k.target == "you.mouth" for k in keys)


def test_mouth_shapes_have_the_four_poses():
    sh = pp.mouth_shapes(40)
    assert set(sh) == {"closed", "small", "open", "o"}
    assert all(isinstance(s, list) and s for s in sh.values())
    xs = [p[0] for s in sh["closed"] for p in s]
    assert min(xs) == -20 and max(xs) == 20
