"""The 2041 morning train: a clean white carriage, teal seats facing the front, mustard poles, low sun through the
windows. Every passenger is a simple seated figure (black head, plain top) whose eyes are ringed in cyan and turned up
at nothing. You sit in the front row on the left aisle; the stranger (cast, crimson coat) stands at the far door.

Moods: morning (you hold the pale card of pump numbers), morning_handled (the card is gone: Echo took it).
Marks: you (your seat, for pose "sit"), you_stand, stranger (by the open far door), aisle, front."""
import random

import film3d as F
from sets3d import flat as FL

L0, L1 = -2.5, 12.5          # the carriage runs along +y
HW, H = 1.45, 2.35           # half width, height
ROWS = [0.4 + 1.05 * k for k in range(10)]
SEATS_X = (-1.16, -0.68, 0.68, 1.16)
YOU_SEAT = (-0.68, ROWS[0])
SEAT_Z = 0.5
MARKS = {"you": (YOU_SEAT[0], YOU_SEAT[1] - 0.02, 0.13), "you_stand": (-0.2, -0.6, 0.0), "stranger": (0.45, 11.1, 0.0),
         "aisle": (0.0, 4.0, 0.0), "front": (0.0, -1.6, 0.0)}
TOPS = ["#5D6B80", "#8C7BB0", "#4F7FA8", "#9AA5B1", "#6E9E64", "#3F4A5E", "#B07A8C", "#4FA3A0", "#C9B48A", "#7C8796", "#E58A2E"]
PANTS = ["#2E3440", "#3B4252", "#23272E", "#4C566A"]


def _shell():
    wall = F.M("train_wall", "#EEE8DE", "paint")
    floor = F.M("train_floor", "#5B6676", "rubber")
    trim = F.M("flat_trim", "#2B2F36", "satin")
    ln = L1 - L0
    cy = (L0 + L1) / 2
    F.rbox("t_floor", (2 * HW + 0.4, ln, 0.06), 0, floor, None, (0, cy, -0.03), ink=None)
    F.rbox("t_aisle", (0.5, ln, 0.008), 0, F.M("train_aisle", "#7D8A9A", "rubber"), None, (0, cy, 0.004), ink=None)
    F.rbox("t_ceiling", (2 * HW + 0.4, ln, 0.06), 0, wall, None, (0, cy, H), ink=None)
    F.rbox("t_light", (0.34, ln - 0.6, 0.03), 0.01, F.M_emit("train_light", "#FFF3DE", 3.0), None, (0, cy, H - 0.04), ink=None)
    for s in (-1, 1):
        x = s * (HW + 0.06)
        F.rbox(f"t_lower{s}", (0.12, ln, 0.86), 0, wall, None, (x, cy, 0.43), ink=None)
        F.rbox(f"t_upper{s}", (0.12, ln, 0.5), 0, wall, None, (x, cy, H - 0.25), ink=None)
        F.rbox(f"t_cove{s}", (0.4, ln, 0.18), 0.06, wall, None, (s * (HW - 0.12), cy, H - 0.12), rot=(0, s * 35, 0), ink=None)
        F.rbox(f"t_band{s}", (0.13, ln, 0.04), 0, F.M("train_band", F.PAL["teal"], "satin"), None, (x - s * 0.005, cy, 0.84), ink=None)
        for k in range(int(ln) + 1):
            F.rbox(f"t_mull{s}_{k}", (0.14, 0.09, 1.0), 0.02, trim, None, (x, L0 + k * 1.05, 1.36), ink=None)
        # overhead rail and the grab handles
        F.cyl(f"t_rail{s}", 0.02, ln, F.M("train_chrome", "#D7DCE2", "chrome"), None, (s * 0.95, cy, 1.98), rot=(90, 0, 0), segs=12, ink=None)
    F.rbox("t_end", (2 * HW + 0.4, 0.12, H), 0, wall, None, (0, L1, H / 2), ink=None)
    F.rbox("t_enddoor", (0.8, 0.13, 1.95), 0.04, F.M("train_door", "#C9D2DC", "metal"), None, (0, L1 - 0.01, 0.98), ink=0.004)
    F.rbox("t_enddoor_win", (0.5, 0.14, 0.7), 0.06, F.M_emit("train_endwin", "#FFE6C2", 2.0), None, (0, L1 - 0.01, 1.45), ink=None)
    # the far side door, open onto the platform: daylight pours in where the stranger steps off
    F.rbox("t_door_light", (0.03, 1.1, 2.0), 0, F.M_emit("train_daylight", "#FFE6C2", 2.6), None, (HW + 0.13, 10.9, 1.0), ink=None)
    for s in (-1, 1):
        F.rbox(f"t_door_leaf{s}", (0.05, 0.6, 2.0), 0.02, F.M("train_door", "#C9D2DC", "metal"), None, (HW - 0.02, 10.9 + s * 0.85, 1.0), ink=0.003)
    F.rbox("t_front", (2 * HW + 0.4, 0.12, H), 0, wall, None, (0, L0, H / 2), ink=None)


def _poles():
    mus = F.M("train_pole", F.PAL["mustard"], "satin")
    for k, y in enumerate(ROWS[::2]):
        for s in (-1, 1):
            if k == 0 and s < 0:
                continue  # no pole in front of your seat
            F.cyl(f"t_pole{k}{s}", 0.022, H, mus, None, (s * 0.44, y - 0.38, H / 2), segs=14, ink=None)


def _seat(name, x, y):
    teal = F.M("train_seat", F.PAL["teal"], "cloth")
    dark = F.M("train_seat_dark", F.PAL["teal_dark"], "cloth")
    F.rbox(f"{name}_c", (0.44, 0.46, 0.12), 0.05, teal, None, (x, y - 0.02, SEAT_Z - 0.05), ink=0.003)
    F.rbox(f"{name}_b", (0.44, 0.1, 0.62), 0.05, teal, None, (x, y + 0.24, SEAT_Z + 0.3), rot=(-8, 0, 0), ink=0.003)
    F.rbox(f"{name}_h", (0.3, 0.1, 0.12), 0.04, F.M("train_head", F.PAL["crimson"], "cloth"), None, (x, y + 0.29, SEAT_Z + 0.66), ink=None)
    F.rbox(f"{name}_base", (0.4, 0.4, SEAT_Z - 0.1), 0.02, dark, None, (x, y + 0.02, (SEAT_Z - 0.1) / 2), ink=None)


def _passenger(name, x, y, rnd):
    """A low-detail seated figure facing the front, head tipped back, eyes up and ringed in cyan."""
    skin = F.M("skin", F.PAL["skin"], "skin")
    top = F.M("pax_top" + (c := rnd.choice(TOPS)), c, "cloth")
    pants = F.M("pax_pants" + (p := rnd.choice(PANTS)), p, "cloth")
    white = F.M("pax_eye", "#F6F3EC", "glossy")
    pupil = F.M("pax_pupil", "#2A1A12", "glossy")
    ring = F.M_emit("pax_ring", "#7FF3FF", 4.0)
    F.rbox(f"{name}_lap", (0.36, 0.44, 0.17), 0.07, pants, None, (x, y - 0.14, SEAT_Z + 0.08), ink=0.003)
    for s in (-1, 1):
        F.rbox(f"{name}_shin{s}", (0.13, 0.14, 0.47), 0.05, pants, None, (x + s * 0.09, y - 0.36, 0.25), ink=0.003)
        F.rbox(f"{name}_shoe{s}", (0.13, 0.22, 0.08), 0.04, F.M("pax_shoe", "#22262C", "satin"), None, (x + s * 0.09, y - 0.42, 0.04), ink=None)
    lean = rnd.uniform(-6, 2)
    F.rbox(f"{name}_torso", (0.38, 0.26, 0.48), 0.12, top, None, (x, y + 0.08, SEAT_Z + 0.36), rot=(lean, 0, 0), ink=0.003)
    for s in (-1, 1):
        F.rbox(f"{name}_arm{s}", (0.1, 0.1, 0.34), 0.05, top, None, (x + s * 0.22, y - 0.02, SEAT_Z + 0.3), rot=(38, 0, 0), ink=0.003)
        F.sphere(f"{name}_hand{s}", 0.045, skin, None, (x + s * 0.18, y - 0.2, SEAT_Z + 0.16), segs=12, ink=None)
    neck = F.empty(f"{name}_neck", None, (x, y + 0.08, SEAT_Z + 0.6), (rnd.uniform(-24, -14), rnd.uniform(-5, 5), rnd.uniform(-12, 12)))
    F.sphere(f"{name}_head", 0.21, skin, neck, (0, 0, 0.2), scale=(1.0, 0.96, 0.98), segs=28, ink=0.004)
    for s in (-1, 1):
        F.sphere(f"{name}_eye{s}", 0.056, white, neck, (s * 0.075, -0.188, 0.22), scale=(1.0, 0.4, 1.15), segs=16, ink=None)
        F.sphere(f"{name}_pupil{s}", 0.022, pupil, neck, (s * 0.075 + 0.005 * s, -0.207, 0.25), scale=(1, 0.5, 1), segs=12, ink=None)
        F.torus(f"{name}_ring{s}", 0.071, 0.0075, ring, neck, (s * 0.075, -0.198, 0.22), rot=(90, 0, 0), nu=28, nv=6, ink=None)
    hair = rnd.random()
    if hair < 0.35:
        F.sphere(f"{name}_bun", 0.08, skin, neck, (0, 0.12, 0.36), segs=14, ink=None)
    elif hair < 0.6:
        F.sphere(f"{name}_cap", 0.215, F.M("pax_cap" + c, c, "cloth"), neck,
                 (0, 0.02, 0.24), scale=(1.02, 1.02, 0.7), segs=20, ink=None)


def _card(loc):
    """The pale card of pump numbers, tilted up to your face; a few dark rows, no legible text."""
    paper = F.M("pump_card", "#F4F1E6", "paper")
    ink = F.M("pump_ink", "#3B4252", "paint")
    root = F.empty("pump_card", None, loc, (-58, 0, 6))
    F.rbox("pump_card_p", (0.24, 0.006, 0.17), 0.006, paper, root, ink=0.002)
    for k in range(6):
        F.rbox(f"pump_row{k}", (0.07, 0.008, 0.009), 0, ink, root, (-0.06, -0.004, 0.06 - k * 0.024), ink=None)
        F.rbox(f"pump_val{k}", (0.04, 0.008, 0.009), 0, F.M("pump_teal", F.PAL["teal"], "paint") if k != 3 else ink, root,
               (0.06, -0.004, 0.06 - k * 0.024), ink=None)


def _outside():
    """The city passing in morning light on both sides, soft with distance."""
    rnd = random.Random(9)
    for s in (-1, 1):
        for k in range(14):
            h = rnd.uniform(6, 26)
            w = rnd.uniform(3, 7)
            x = s * rnd.uniform(26, 60)
            y = -10 + k * 4.5 + rnd.uniform(-1, 1)
            col = rnd.choice(["#E9D6C0", "#C7D3E0", "#F2C9A0", "#B9C6D6", "#E6B8A2"])
            F.rbox(f"out{s}_{k}", (w, w, h), 0.3, F.M("out_bld" + col, col, "paint"), None, (x, y, -6 + h / 2), ink=None)
    F.rbox("out_ground", (200, 200, 0.1), 0, F.M("out_ground", "#B8A88E", "paint"), None, (0, 0, -6), ink=None)


def build(mood):
    _shell()
    _poles()
    _outside()
    rnd = random.Random(2041)
    for r, y in enumerate(ROWS):
        for i, x in enumerate(SEATS_X):
            _seat(f"seat{r}_{i}", x, y)
            if (x, y) == YOU_SEAT:
                continue
            if r == 0 and x > 0:
                continue  # leave the front right pair empty so the camera can stand in the aisle
            if rnd.random() < 0.82:
                _passenger(f"pax{r}_{i}", x, y, rnd)
    if mood != "morning_handled":
        _card((YOU_SEAT[0] + 0.0, YOU_SEAT[1] - 0.36, 0.86))
    FL.sky_world(FL.SUNRISE_WORLD, 1.0)
    FL.tune_haze("#FFE2C0", 0.05)
    # low sun from the right, through the windows: warm bars across the seats and the floor
    F.add_light("sun", "SUN", (10, -3, 3), 5.0, "#FFC98A", 0.02, target=(0.0, 1.0, 0.0))
    F.add_light("ceiling_fill", "AREA", (0, 4.0, H - 0.1), 400, "#FFF1DE", 1.0, target=(0, 4.0, 0), shadow=False)
    F.add_light("aisle_fill", "AREA", (0.0, -2.2, 1.6), 140, "#FFF4E6", 3.0, target=(0, 6.0, 1.0), shadow=False)
    F._thumb_lights((YOU_SEAT[0], YOU_SEAT[1], 1.05), key_energy=240)
    F.add_light("door_glow", "AREA", (1.6, 10.9, 1.2), 300, "#FFD9A8", 1.2, target=(0.6, 10.9, 1.0), shadow=False)
    return dict(MARKS)
