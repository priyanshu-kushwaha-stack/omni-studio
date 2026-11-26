"""The city water plant's gate. The road runs in through an open sliding gate (y = 0) towards a low hall of pipes
(y = 14); the plant's water towers rise behind the hall; a guard booth on the left; the city far behind.
Moods: morning (2041, low warm sun, long shadows, everything clean), storm (the cold open: every light off under the
green sky). Marks: gate (in the gateway), road (halfway in), hall (in front of the pipes), booth, outside (before the gate)."""
import math

import film3d as F
from sets3d import flat as FL

DIM = {F.PAL["crimson"]: "#5A2228", F.PAL["teal"]: "#14453F", F.PAL["mustard"]: "#5E4A22", "#3E7FB8": "#22384E"}
MARKS = {"gate": (0.0, 0.6, 0.0), "road": (0.2, 5.5, 0.0), "hall": (0.0, 10.8, 0.0), "booth": (-5.2, 2.6, 0.0),
         "outside": (0.0, -3.0, 0.0)}


def _ground(storm):
    F.rbox("pg_ground", (220, 220, 0.1), 0, F.M("pg_concrete", "#6D6A66" if storm else "#C9C0B0", "paint"), None, (0, 30, -0.05), ink=None)
    F.rbox("pg_road", (6.0, 60, 0.02), 0, F.M("pg_asphalt", "#2E3238" if storm else "#4A4F57", "paint"), None, (0, 5, 0.01), ink=None)
    line = F.M("pg_line", "#8A8A70" if storm else "#F2D06B", "paint")
    for k in range(10):
        F.rbox(f"pg_dash{k}", (0.14, 1.4, 0.006), 0, line, None, (0, -18 + k * 3.2, 0.025), ink=None)
    grass = F.M("pg_grass", "#2E4A2C" if storm else "#7FAF5A", "cloth")
    for s in (-1, 1):
        F.rbox(f"pg_verge{s}", (2.0, 22, 0.08), 0.03, grass, None, (s * 4.4, 4.5, 0.04), ink=None)


def _gate(storm):
    pillar = F.M("pg_pillar", "#E9E2D4" if not storm else "#4A4A4E", "paint")
    cap = F.M("pg_cap", F.PAL["teal"], "satin")
    steel = F.M("pg_steel", "#B9C2CC" if not storm else "#4C535C", "metal")
    for s in (-1, 1):
        F.rbox(f"pg_pillar{s}", (0.7, 0.7, 2.8), 0.05, pillar, None, (s * 3.4, 0, 1.4), ink=0.004)
        F.rbox(f"pg_cap{s}", (0.82, 0.82, 0.16), 0.04, cap, None, (s * 3.4, 0, 2.86), ink=None)
        F.sphere(f"pg_lamp{s}", 0.16, F.M_emit("pg_lamp", "#FFE6B8", 0.0 if storm else 3.0) if not storm else F.M("pg_lamp_off", "#3A3F47", "glossy"),
                 None, (s * 3.4, 0, 3.08), segs=16, ink=None)
    # the sliding gate, open: drawn back along the fence to the right
    for k in range(13):
        F.cyl(f"pg_bar{k}", 0.035, 2.0, steel, None, (3.9 + k * 0.42, -0.25, 1.05), segs=10, ink=None)
    for z in (0.15, 1.05, 2.0):
        F.rbox(f"pg_rail{z}", (5.4, 0.08, 0.08), 0.02, steel, None, (6.4, -0.25, z), ink=None)
    # the fence, both ways
    for s in (-1, 1):
        for k in range(14):
            x = s * (4.0 + k * 1.6) if s < 0 else 9.4 + k * 1.6
            F.cyl(f"pg_post{s}_{k}", 0.05, 2.2, steel, None, (x, 0.05, 1.1), segs=10, ink=None)
        x0 = -15.2 if s < 0 else 20.6
        for z in (0.3, 1.2, 2.1):
            F.rbox(f"pg_fr{s}{z}", (22.4, 0.05, 0.05), 0, steel, None, (x0, 0.05, z), ink=None)
    # the plant's emblem on the left pillar: a crimson plaque with a white drop (no lettering)
    F.rbox("pg_plaque", (0.56, 0.06, 0.7), 0.06, F.M("pg_plaque", F.PAL["crimson"], "satin"), None, (-3.4, -0.37, 1.85), ink=0.003)
    F.sphere("pg_drop", 0.12, F.M("pg_drop", "#F6F3EC", "glossy"), None, (-3.4, -0.41, 1.78), scale=(1, 0.3, 1), segs=20, ink=None)
    F.cyl("pg_drop_tip", 0.11, 0.18, F.M("pg_drop", "#F6F3EC", "glossy"), None, (-3.4, -0.41, 1.93), r2=0.0, segs=20, ink=None)
    # the guard booth
    F.rbox("pg_booth", (1.8, 1.6, 2.4), 0.08, pillar, None, (-5.4, 2.4, 1.2), ink=0.004)
    F.rbox("pg_booth_roof", (2.2, 2.0, 0.14), 0.04, cap, None, (-5.4, 2.4, 2.47), ink=None)
    win = F.M_emit("pg_booth_win", "#FFE9C8", 1.4) if not storm else F.M("pg_booth_dark", "#141A22", "glossy")
    F.rbox("pg_booth_win", (1.82, 1.2, 0.8), 0.04, win, None, (-5.4, 2.4, 1.55), ink=None)


def _hall(storm):
    wall = F.M("pg_hall", "#EFE7D8" if not storm else "#3C3E44", "paint")
    band = F.M("pg_band", F.PAL["teal"], "satin")
    F.rbox("pg_hall", (34, 9, 4.2), 0.1, wall, None, (0, 18.5, 2.1), ink=None)
    F.rbox("pg_hall_band", (34.05, 9.05, 0.35), 0.05, band, None, (0, 18.5, 3.7), ink=None)
    win = F.M_emit("pg_hall_win", "#FFE2B0", 1.2) if not storm else F.M("pg_hall_dark", "#10161E", "glossy")
    for k in range(12):
        F.rbox(f"pg_hw{k}", (1.6, 0.06, 0.9), 0.03, win, None, (-15 + k * 2.7, 13.98, 2.7), ink=None)
    F.rbox("pg_hall_door", (3.2, 0.08, 3.0), 0.05, F.M("pg_hall_door", "#B9C2CC" if not storm else "#3A4048", "metal"), None, (0, 13.97, 1.5), ink=0.003)
    # the pipe rack in front of the hall: four big pipes on stands, dropping into the hall through elbows
    cols = [F.PAL["crimson"], F.PAL["teal"], F.PAL["mustard"], "#3E7FB8"]
    stand = F.M("pg_stand", "#59626E", "metal")
    for k, col in enumerate(cols):
        col = DIM.get(col, col) if storm else col
        m = F.M("pg_pipe" + col, col, "satin")
        r = 0.42 - 0.05 * k
        z = 0.75 + k * 0.95
        y = 12.0 + (k % 2) * 0.6
        for side in (-1, 1):
            x0, x1 = side * 2.4, side * 16.0
            F.cyl(f"pg_pipe{k}{side}", r, abs(x1 - x0), m, None, ((x0 + x1) / 2, y, z), rot=(0, 90, 0), segs=28, ink=0.004)
            F.cyl(f"pg_riser{k}{side}", r, 14.0 - y, m, None, (x0, (y + 14.0) / 2, z), rot=(90, 0, 0), segs=28, ink=None)
            F.sphere(f"pg_knee{k}{side}", r, m, None, (x0, y, z), segs=28, ink=None)
            for j in range(4):
                xf = side * (4.5 + j * 3.4)
                F.torus(f"pg_flange{k}{side}{j}", r + 0.04, 0.05, m, None, (xf, y, z), rot=(0, 90, 0), nu=28, nv=8, ink=None)
                if k == 0:
                    F.rbox(f"pg_stand{side}{j}", (0.14, 0.14, 4.4), 0.02, stand, None, (xf + side * 0.6, 12.3, 2.2), ink=None)
    # a big crimson handwheel on the lowest pipe, by the door
    hw = F.M("pg_wheel", F.PAL["crimson"], "satin")
    F.torus("pg_wheel", 0.42, 0.04, hw, None, (-3.2, 11.45, 1.45), rot=(90, 0, 0), nu=36, nv=10, ink=0.003)
    for k in range(3):
        F.rbox(f"pg_spoke{k}", (0.82, 0.03, 0.04), 0.01, hw, None, (-3.2, 11.45, 1.45), rot=(0, k * 60, 0), ink=None)
    F.cyl("pg_wheel_stem", 0.05, 0.7, stand, None, (-3.2, 11.8, 1.45), rot=(90, 0, 0), segs=12, ink=None)


def _towers(storm):
    white = F.M("pg_tank", "#F1EEE8" if not storm else "#3A3D44", "paint")
    band = F.M("pg_tank_band", F.PAL["teal"] if not storm else "#1F4A46", "satin")
    for k, (x, y, r, h) in enumerate(((-11, 30, 3.2, 17), (-3.5, 34, 3.6, 21), (6.5, 31, 3.0, 15))):
        F.cyl(f"pg_tank{k}", r, h, white, None, (x, y, h / 2), segs=48, ink=None)
        F.cyl(f"pg_tank_top{k}", r, 1.2, white, None, (x, y, h + 0.6), r2=r * 0.4, segs=48, ink=None)
        for j in range(2):
            F.cyl(f"pg_tank_band{k}{j}", r + 0.03, 0.6, band, None, (x, y, h * (0.45 + 0.35 * j)), segs=48, ink=None)
        F.sphere(f"pg_tank_light{k}", 0.25, F.M_emit("pg_red", "#FF5A5A", 8.0) if not storm else F.M("pg_lamp_off", "#3A3F47", "glossy"),
                 None, (x, y, h + 1.3), segs=12, ink=None)
    # the elevated tank on its legs, to the right
    x, y = 15.0, 28.0
    F.sphere("pg_ball", 4.0, white, None, (x, y, 20.0), scale=(1, 1, 0.8), segs=40, ink=None)
    for k in range(4):
        a = (45 + 90 * k) * math.pi / 180
        F.cyl(f"pg_leg{k}", 0.25, 18, F.M("pg_stand", "#59626E", "metal"), None, (x + 2.6 * math.cos(a), y + 2.6 * math.sin(a), 9.0), segs=12, ink=None)
    F.cyl("pg_ball_band", 4.02, 0.8, band, None, (x, y, 20.0), segs=48, ink=None)
    # the city, far off
    city = F.M("pg_city", "#C9B9C8" if not storm else "#121822", "paint")
    for k in range(18):
        h = 10 + (k * 37 % 23)
        F.rbox(f"pg_city{k}", (5, 5, h), 0.2, city, None, (-60 + k * 7.5, 95 + (k * 13 % 20), h / 2), ink=None)


def build(mood):
    storm = mood == "storm"
    _ground(storm)
    _gate(storm)
    _hall(storm)
    _towers(storm)
    if storm:
        F.vivid_aurora()
        FL.sky_world(FL.STORM_WORLD, 0.5)
        FL.tune_haze("#0E3A30", 0.05)
        F.add_light("aurora_rim", "AREA", (4.0, 40.0, 25.0), 30000, "#7DFFB0", 30.0, target=(0, 8, 0), shadow=True)
        F.add_light("cold_fill", "AREA", (-6.0, -10.0, 6.0), 900, "#8FA6C8", 8.0, target=(0, 6, 1), shadow=False)
        F.add_light("cold_key", "AREA", (-3.0, -4.0, 3.0), 120, "#A8C0E0", 2.0, target=(0, 0.6, 1.1))
        return dict(MARKS)
    FL.sky_world(FL.SUNRISE_WORLD, 1.0)
    FL.sun_disc((60.0, 150.0, 5.0), 7.0)
    FL.tune_haze("#FFD9B0", 0.12)
    F.add_light("sun", "SUN", (25, -35, 12), 5.5, "#FFC98A", 0.02, target=(0, 0, 0))
    F.add_light("sky_fill", "AREA", (-6.0, -8.0, 8.0), 1500, "#CFE2F5", 12.0, target=(0, 4, 0), shadow=False)
    return dict(MARKS)
