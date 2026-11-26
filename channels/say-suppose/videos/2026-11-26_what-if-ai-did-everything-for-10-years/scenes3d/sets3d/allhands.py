"""The all-hands floor: the whole plant staff standing in hi-vis vests, the chief on a low step at the front, a tall
window band behind him with the light draining toward grey-blue. Cyan rings in every eye.

Floor x -10..10, y -4..11. The step is at y 8.6 (the chief's mark "chief" stands on it, facing 0 = toward the crowd).
The crowd faces the step (facing 180). Moods:
  day    the crowd listening, the clock at five past ten
  list   every head tilted up at the list floating over the crowd, one line (your name) brighter, halfway down
  after  the crowd broken into knots, people hugging, a few leaving; the clock at eleven; Dana's bag on a table
  door   the floor nearly empty; Dana in the right-hand doorway (mark "door_dana", facing -90) with her bag on her
         shoulder, you facing her ("door_you", facing 90)
`figure()` is the low-detail standing (or seated) worker used here and in office.py."""
import math
import random

import film3d as F

VESTS = ["#D9E021", "#F28C28", "#D9E021", "#E8F03A", "#F28C28", "#D9E021"]
SHIRTS = ["#2E3A52", "#59626E", "#E9E4DA", "#8E2A33", "#1E6B66", "#3B4252", "#6F5A8C", "#A55A2A"]
MARKS = {"chief": (0.0, 8.55, 0.45), "you": (0.9, 4.2, 0.0), "dana": (-1.0, 4.0, 0.0), "dana_after": (-2.2, 3.2, 0.0),
         "door_dana": (9.25, 2.0, 0.0), "door_you": (8.0, 2.35, 0.0), "clock": (-9.8, 4.0, 3.1), "centre": (0.0, 3.5, 0.0),
         "front": (0.0, 7.2, 0.0), "you_after": (0.9, 4.2, 0.0)}


def figure(name, loc, facing=180.0, vest="#D9E021", shirt="#2E3A52", nod=0.0, lean=0.0, seated=False, ring=True,
           arms=0.0, turn=0.0):
    """A simple worker: capsule legs, a shirt with a hi-vis vest and two reflective bands, hanging arms, a round black
    head with two white eyes and cyan lens rings. Faces -y at facing 0, like film3d.person. `arms` raises both arms
    forward (degrees) for a hug; `nod` < 0 tilts the head up."""
    sk = F.M("skin", F.SKIN, "skin")
    pants = F.M("fig_pants", "#2B303A", "cloth")
    r = F.empty(name, None, loc, (0, 0, facing))
    body = F.empty(f"{name}_b", r, (0, 0, 0.0), (lean, 0, 0))
    if seated:
        for sx in (1, -1):
            F.cyl(f"{name}_th{sx}", 0.075, 0.42, pants, body, (sx * 0.09, -0.18, 0.45), rot=(90, 0, 0), segs=14, ink=None)
            F.cyl(f"{name}_sh{sx}", 0.065, 0.45, pants, body, (sx * 0.09, -0.4, 0.225), segs=14, ink=None)
        z0 = 0.45
    else:
        for sx in (1, -1):
            F.cyl(f"{name}_leg{sx}", 0.075, 0.6, pants, body, (sx * 0.09, 0, 0.3), r2=0.068, segs=14, ink=None)
            F.sphere(f"{name}_shoe{sx}", 0.075, F.M("fig_shoe", "#1E1E22", "satin"), body, (sx * 0.09, -0.04, 0.04), scale=(1, 1.4, 0.6), segs=12, ink=None)
        z0 = 0.58
    top = F.M(f"fig_shirt{shirt}", shirt, "cloth")
    F.lathe(f"{name}_torso", F.smooth_prof([(0.0, 0.0), (0.16, 0.02), (0.19, 0.12), (0.18, 0.3), (0.13, 0.42), (0.0, 0.45)], 3), top, body, (0, 0, z0), sy=0.8, segs=20, ink=None)
    if vest:
        vm = F.M(f"fig_vest{vest}", vest, "cloth")
        F.lathe(f"{name}_vest", F.smooth_prof([(0.0, 0.05), (0.2, 0.06), (0.2, 0.2), (0.188, 0.33), (0.14, 0.39), (0.0, 0.4)], 3), vm, body, (0, 0, z0), sy=0.82, segs=20, ink=None)
        band = F.M("fig_band", "#E4E8EC", "satin")
        for zz in (0.14, 0.25):
            F.torus(f"{name}_band{zz}", 1.0, 0.012, band, body, (0, 0, z0 + zz), scale=(0.203, 0.168, 1), nu=24, nv=6, ink=None)
    for sx in (1, -1):
        sh = F.empty(f"{name}_sh{sx}", body, (sx * 0.2, 0, z0 + 0.36), (-arms, sx * (-8 if not arms else 12), 0))
        F.limb(f"{name}_arm{sx}", 0.058, 0.05, 0.4, top, sh, segs=14, ink=None)
        F.sphere(f"{name}_hand{sx}", 0.05, sk, sh, (0, 0, -0.43), segs=12, ink=None)
    hd = F.empty(f"{name}_hj", body, (0, 0, z0 + 0.42), (nod, 0, turn))
    R = 0.22
    F.sphere(f"{name}_head", R, sk, hd, (0, 0, R - 0.02), segs=24, ink=None)
    white = F.M_flat("fig_eye", "#F6F3EC", 0.35)
    pupil = F.M_flat("fig_pupil", "#111111", 0.0)
    glow = F.M_emit("lens_glow#7FF3FF", "#7FF3FF", 3.0)
    for sx in (1, -1):
        ex, ez = sx * 0.075, R + 0.0
        ey = -math.sqrt(max(R * R - ex * ex - 0.0004, 0.0)) + 0.012
        F.sphere(f"{name}_eye{sx}", 0.052, white, hd, (ex, ey, ez), scale=(1, 0.45, 1.2), segs=16, ink=None)
        F.sphere(f"{name}_pup{sx}", 0.022, pupil, hd, (ex, ey - 0.02, ez - 0.005), scale=(1, 0.4, 1.2), segs=10, ink=None)
        if ring:
            F.torus(f"{name}_ring{sx}", 0.066, 0.008, glow, hd, (ex, ey - 0.012, ez), rot=(90, 0, sx * -18), scale=(1, 1.2, 1), nu=24, nv=6, ink=None)
    return r


def clock(name, loc, facing, hour, minute):
    """A plain round wall clock (ticks, no numbers). Faces -y at facing 0."""
    r = F.empty(name, None, loc, (90, 0, facing))
    F.cyl(f"{name}_rim", 0.36, 0.06, F.M("clk_rim", "#2B2F36", "satin"), r, (0, 0, 0), segs=40)
    F.cyl(f"{name}_face", 0.32, 0.065, F.M("clk_face", "#FAF8F2", "ceramic"), r, (0, 0, 0.003), segs=40, ink=None)
    ink = F.M("clk_ink", "#1C1C20", "satin")
    for k in range(12):
        a = k * 30 * math.pi / 180
        F.rbox(f"{name}_tick{k}", (0.02, 0.06 if k % 3 == 0 else 0.035, 0.01), 0, ink, r, (0.27 * math.sin(a), 0.27 * math.cos(a), 0.037), rot=(0, 0, -k * 30), ink=None)
    for nm, ang, ln, w in (("h", (hour % 12 + minute / 60) * 30, 0.17, 0.03), ("m", minute * 6, 0.25, 0.02)):
        a = ang * math.pi / 180
        F.rbox(f"{name}_{nm}", (w, ln, 0.008), 0.004, ink, r, (0.5 * ln * math.sin(a), 0.5 * ln * math.cos(a), 0.042 + (0.005 if nm == "m" else 0)), rot=(0, 0, -ang), ink=None)
    F.cyl(f"{name}_pin", 0.02, 0.02, F.M("clk_pin", F.PAL["crimson"], "plastic"), r, (0, 0, 0.05), segs=12, ink=None)
    return r


def _room(mood):
    floor = F.M("ah_floor", "#B4B8B6", "satin", tex=("speckle", "#A2A7A6", 0.88))
    wall = F.M("ah_wall", "#DCDDDA", "paint")
    dado = F.M("ah_dado", "#2C7F86", "paint")
    dark = F.M("ah_dark", "#3A414B", "satin")
    F.rbox("ah_floor", (20, 16, 0.04), 0, floor, None, (0, 3.5, -0.02), ink=None)
    F.rbox("ah_ceiling", (20, 16, 0.1), 0, F.M("ah_ceil", "#C9CCCF", "paint"), None, (0, 3.5, 6.05), ink=None)
    for k in range(5):
        F.rbox(f"ah_strip{k}", (16, 0.12, 0.03), 0, F.M_emit("ah_strip", "#DDE8F4", 3.0), None, (0, -2.0 + 3.0 * k, 5.98), ink=None)
    # front wall: a tall window band behind the step, grey-blue sky
    F.rbox("ah_fw_low", (20, 0.3, 1.2), 0, dado, None, (0, 11.0, 0.6), ink=None)
    F.rbox("ah_fw_top", (20, 0.3, 1.0), 0, wall, None, (0, 11.0, 5.5), ink=None)
    F.rbox("ah_sky", (24, 0.1, 6), 0, F.M_emit("ah_sky", "#9FB4C8", 1.4), None, (0, 14.0, 3.0), ink=None).visible_shadow = False
    for k in range(9):
        F.rbox(f"ah_mull{k}", (0.12, 0.2, 3.8), 0, dark, None, (-10 + 2.5 * k, 11.0, 3.1), ink=None)
    F.rbox("ah_glass", (20, 0.03, 3.8), 0, F.M_glass("ah_glass", "#CFDDE8", 0.12), None, (0, 10.95, 3.1), ink=None)
    F.rbox("ah_panel", (3.6, 0.1, 2.2), 0.03, F.M("ah_panel", F.PAL["teal"], "satin"), None, (0, 10.8, 2.3), ink=None)
    # the low step
    F.rbox("ah_step", (4.2, 1.5, 0.45), 0.03, F.M("ah_step", "#4A525C", "satin"), None, (0, 8.6, 0.225), ink=0.004)
    F.rbox("ah_step_edge", (4.22, 0.06, 0.05), 0, F.M("ah_edge", F.PAL["mustard"], "plastic"), None, (0, 7.85, 0.43), ink=None)
    # side walls; the clock on the left, the door on the right at y=2
    F.rbox("ah_lw", (0.3, 16, 6), 0, wall, None, (-10, 3.5, 3), ink=None)
    F.rbox("ah_lw_dado", (0.32, 16, 1.2), 0, dado, None, (-10, 3.5, 0.6), ink=None)
    F.rbox("ah_rw_a2", (0.3, 5.35, 6), 0, wall, None, (10, -1.325, 3), ink=None)
    F.rbox("ah_rw_b", (0.3, 8.3, 6), 0, wall, None, (10, 6.85, 3), ink=None)
    F.rbox("ah_rw_c", (0.3, 1.4, 3.6), 0, wall, None, (10, 2.0, 4.2), ink=None)
    F.rbox("ah_rw_dado1", (0.32, 5.3, 1.2), 0, dado, None, (10, -1.35, 0.6), ink=None)
    F.rbox("ah_rw_dado2", (0.32, 8.3, 1.2), 0, dado, None, (10, 6.85, 0.6), ink=None)
    F.rbox("ah_corridor", (0.1, 3.0, 2.6), 0, F.M_emit("ah_corr", "#CFDCEA", 1.2), None, (11.6, 2.0, 1.3), ink=None)
    F.rbox("ah_doorleaf", (0.06, 1.3, 2.35), 0.02, F.M("ah_door", "#8C97A3", "metal"), None, (10.55, 1.35, 1.18), rot=(0, 0, 70), ink=0.004)
    F.rbox("ah_exit", (0.06, 0.5, 0.18), 0.02, F.M_emit("ah_exit", "#3DFF7A", 4.0), None, (9.82, 2.0, 2.75), ink=None)
    F.rbox("ah_bw", (20, 0.3, 6), 0, wall, None, (0, -4.0, 3), ink=None)
    F.rbox("ah_bw_dado", (20, 0.32, 1.2), 0, dado, None, (0, -4.0, 0.6), ink=None)
    for k in range(16):
        col = [F.PAL["mustard"], F.PAL["teal"], "#3E7FB8", F.PAL["crimson"]][k % 4]
        F.rbox(f"ah_locker{k}", (0.55, 0.45, 1.9), 0.02, F.M(f"ah_locker{col}", col, "satin"), None, (-6.6 + 0.6 * k + (1.2 if k > 7 else 0), -3.6, 0.95), ink=0.004)
        F.rbox(f"ah_lockvent{k}", (0.3, 0.01, 0.12), 0.01, F.M("ah_dark", "#3A414B", "satin"), None, (-6.6 + 0.6 * k + (1.2 if k > 7 else 0), -3.37, 1.6), ink=None)
    after = mood in ("after", "door")
    clock("ah_clock", (-9.82, 4.0, 3.1), 90, 11 if after else 10, 0 if after else 5)
    for k, yy in enumerate((-2.0, 0.5, 6.5, 9.0)):
        F.rbox(f"ah_sign{k}", (0.04, 1.2, 0.7), 0.02, F.M(f"ah_sign{k}", [F.PAL["teal"], F.PAL["mustard"], "#3E7FB8", F.PAL["crimson"]][k], "satin"), None, (-9.83, yy, 2.4), ink=None)


def _crowd(mood):
    rnd = random.Random(31)
    keep = [MARKS["you"], MARKS["dana"]]
    n = 0
    if mood in ("day", "list"):
        nod = -24 if mood == "list" else 0
        for row in range(6):
            y = 1.0 + row * 1.05
            for col in range(11):
                x = -6.0 + col * 1.2 + (0.6 if row % 2 else 0) + rnd.uniform(-0.18, 0.18)
                yy = y + rnd.uniform(-0.15, 0.15)
                if any((x - k[0]) ** 2 + (yy - k[1]) ** 2 < rad ** 2 for k, rad in zip(keep, (1.0, 0.6))):
                    continue
                figure(f"crowd{n}", (x, yy, 0), 180 + rnd.uniform(-12, 12), rnd.choice(VESTS), rnd.choice(SHIRTS), nod=nod + rnd.uniform(-4, 4), turn=rnd.uniform(-8, 8))
                n += 1
        return
    if mood == "after":
        # knots of people, a few hugging, a few walking out toward the door
        pairs = [(-4.5, 2.0, 30), (3.4, 5.6, -50), (-1.0, 6.6, 80), (4.6, 2.4, 10), (-5.6, 5.6, -20), (2.15, 4.9, 40),
                 (-0.25, 5.3, -30), (2.1, 3.0, 70)]
        for k, (x, y, a) in enumerate(pairs):
            ca, sa = math.cos(a * math.pi / 180), math.sin(a * math.pi / 180)
            for s in (1, -1):
                figure(f"hug{k}{s}", (x + s * 0.17 * sa, y - s * 0.17 * ca, 0), a + (180 if s == 1 else 0), rnd.choice(VESTS), rnd.choice(SHIRTS), lean=9, arms=78, nod=8, turn=s * 25)
        for k, (x, y, f) in enumerate(((-2.8, 5.0, 150), (-3.3, 5.6, 200), (-2.4, 5.7, 120), (2.6, 7.2, 190), (2.0, 6.9, 160),
                                       (5.6, 4.0, 100), (6.4, 3.3, 95), (7.2, 2.6, 92), (-6.8, 3.0, 60), (1.9, 2.2, 230))):
            figure(f"after{k}", (x, y, 0), f, rnd.choice(VESTS), rnd.choice(SHIRTS), nod=rnd.uniform(-6, 12))
        table = F.M("ah_table", "#E9E6DF", "plastic")
        tx, ty = MARKS["dana_after"][0] + 0.0, MARKS["dana_after"][1] - 0.55
        F.rbox("ah_table", (0.9, 0.5, 0.04), 0.02, table, None, (tx, ty, 0.62), ink=0.004)
        for sx in (-1, 1):
            F.cyl(f"ah_tleg{sx}", 0.02, 0.6, F.M("ah_tleg", "#3A414B", "satin"), None, (tx + sx * 0.38, ty, 0.3), segs=10, ink=None)
        bag(f"ah_bag", (tx + 0.15, ty, 0.64), 0)
        return
    if mood == "door":
        for k, (x, y, f) in enumerate(((-5.0, 6.0, 170), (-5.5, 6.5, 200), (3.0, 7.5, 180), (-7.0, 2.0, 70))):
            figure(f"strag{k}", (x, y, 0), f, rnd.choice(VESTS), rnd.choice(SHIRTS))
        dx, dy, _ = MARKS["door_dana"]
        # Dana faces -90 there: her left side points -y. The bag hangs at her left hip, the strap over her left shoulder.
        bag("ah_bag", (dx + 0.02, dy - 0.33, 0.5), 90)
        strap = F.M("bag_strap", "#2B2F36", "cloth")
        F.sweep("ah_strap", [(dx - 0.1, dy - 0.3, 0.8), (dx - 0.07, dy - 0.2, 1.0), (dx + 0.08, dy - 0.2, 1.0), (dx + 0.12, dy - 0.3, 0.8)], 0.014, strap, None, segs=8, flat=0.4)


def bag(name, loc, facing):
    """A teal canvas work bag with a mustard flap; its base at loc."""
    r = F.empty(name, None, loc, (0, 0, facing))
    F.rbox(f"{name}_body", (0.38, 0.14, 0.3), 0.05, F.M("bag_body", F.PAL["teal"], "cloth"), r, (0, 0, 0.15), ink=0.004)
    F.rbox(f"{name}_flap", (0.39, 0.03, 0.14), 0.03, F.M("bag_flap", F.PAL["mustard"], "cloth"), r, (0, -0.075, 0.24), ink=0.003)
    F.torus(f"{name}_handle", 0.1, 0.012, F.M("bag_strap", "#2B2F36", "cloth"), r, (0, 0, 0.3), rot=(90, 0, 0), arc_deg=180, nu=16, nv=6, ink=None)
    return r


def list_card(name, loc, w=3.2, h=2.2, rows=11, mine=5):
    """The layoff list: a tall cyan card, rows of name strokes, one (yours) brighter and longer."""
    card = F.M("holo_card", "#5FE6FF", "glass", emit=1.2, emit_color="#5FE6FF", alpha=0.16)
    ink = F.M_emit("holo_ink", "#9FF7FF", 6.0)
    hot = F.M_emit("holo_hot", "#E8FFFF", 16.0)
    r = F.empty(name, None, loc, (0, 0, 0))
    F.rbox(f"{name}_card", (w, 0.004, h), 0.04, card, r, ink=None)
    F.rbox(f"{name}_head", (w * 0.8, 0.006, h * 0.06), 0.006, ink, r, (0, -0.004, h * 0.42), ink=None)
    for k in range(rows):
        z = h * 0.3 - k * (h * 0.7 / rows)
        lw = w * (0.55 + 0.25 * ((k * 7) % 5) / 5)
        if k == mine:
            F.rbox(f"{name}_mine_bg", (w * 0.92, 0.005, h * 0.06), 0.008, F.M("holo_card", "#5FE6FF", "glass"), r, (0, -0.003, z), ink=None)
        F.rbox(f"{name}_row{k}", (lw if k != mine else w * 0.8, 0.006, h * 0.028), 0.004, hot if k == mine else ink, r, (-(w * 0.85 - lw) * 0.5 if k != mine else 0, -0.005, z), ink=None)
    return r


def build(mood="day"):
    _room(mood)
    _crowd(mood)
    if mood == "list":
        list_card("ah_list", (0.0, 7.9, 3.75))
    cool = mood != "day"
    F.add_light("ah_window", "AREA", (0, 12.5, 3.5), 2600, "#B9CDE6", 12.0, target=(0, 3.0, 1.0))
    F.add_light("ah_room", "AREA", (0, 3.5, 5.8), 1500 if not cool else 1300, "#E8EEF4" if not cool else "#C8D6E8", 14.0, target=(0, 3.5, 0))
    F.add_light("ah_chief_key", "AREA", (-1.6, 5.6, 3.0), 220, "#FFF1E0", 1.8, target=(0, 8.55, 1.7))
    F.add_light("ah_chief_rim", "AREA", (1.4, 10.2, 2.6), 160, "#DDE8F4", 1.0, target=(0, 8.55, 1.7), shadow=False)
    F.add_light("ah_you_key", "AREA", (2.6, 6.2, 2.4), 110, "#FFF1E0", 1.6, target=(0.9, 4.2, 1.2))
    F.add_light("ah_back_key", "AREA", (1.5, -2.5, 3.0), 300, "#E6EEF8", 4.0, target=(0, 4.0, 1.2), shadow=False)
    if mood == "list":
        F.add_light("ah_list_glow", "AREA", (0, 7.2, 3.6), 260, "#7FF3FF", 3.0, target=(0, 3.0, 1.3), shadow=False)
    if mood == "door":
        F.add_light("ah_door_key", "AREA", (7.0, 0.6, 2.4), 120, "#FFF1E0", 1.6, target=(9.25, 2.0, 1.2))
        F.add_light("ah_door_rim", "AREA", (11.4, 2.0, 2.2), 200, "#DDE8F4", 1.2, target=(9.0, 2.0, 1.2), shadow=False)
    if mood == "after":
        F.add_light("ah_dana_key", "AREA", (-0.6, 1.4, 2.4), 110, "#FFF1E0", 1.6, target=(-2.2, 3.2, 1.2))
    return dict(MARKS)
