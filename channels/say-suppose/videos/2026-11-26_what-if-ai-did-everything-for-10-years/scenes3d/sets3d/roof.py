"""The plant roof at dawn, after the blackout: a concrete deck, a low parapet, a galvanised vent to sit on, a teal pipe
run, a stack and a water tank; below and beyond, the city with its lights coming back in patches, drones lifting off the
rooftops, the printed tower catching the sun. One small cyan card floats by the vent with two buttons: OLD SETTING and
a blank one. Mood: morning (dawn). Cast marks:
    vent      you, sitting (pose "sit"); facing 0 points the right hand ("point") at OLD SETTING, facing 28 at the blank
    chief, crew1, crew2   standing at the parapet; with pose "hold" and the facing in FACING their paper cup sits in the
              right hand (cups are built here, so keep those facings; turn heads with "look" instead)
    card      the card's centre (a camera target), parapet_c (the parapet's middle), city (a target in the city)."""
import math
import random

import bpy

import film3d as F
from sets3d import flat as FL

D2R = math.pi / 180.0
VENT = (0.0, 0.4, -0.13)
FACING = {"chief": 18.0, "crew1": -12.0, "crew2": 24.0}
STAND = {"chief": (1.35, 1.9, 0.0), "crew1": (-1.45, 1.95, 0.0), "crew2": (2.45, 1.85, 0.0)}
CARD = (VENT[0] - 0.16, VENT[1] - 0.6, 0.73)
PY = 2.35  # the parapet's inner face
PH = 0.8  # parapet height


def _deck():
    conc = F.M("roof_conc", "#B8ADA0", "paint")
    cap = F.M("roof_cap", "#D8CFC2", "paint")
    F.rbox("roof_deck", (16, 9, 0.2), 0, conc, None, (0, -1.0, -0.1), ink=None)
    # deck joints: thin darker strips
    joint = F.M("roof_joint", "#8E8477", "paint")
    for x in range(-7, 8, 2):
        F.rbox(f"roof_jx{x}", (0.03, 9, 0.004), 0, joint, None, (x, -1.0, 0.002), ink=None)
    for y in (-3.0, -1.0, 1.0):
        F.rbox(f"roof_jy{y}", (16, 0.03, 0.004), 0, joint, None, (0, y, 0.002), ink=None)
    # the parapet with a pale coping, and a short return wall at the left
    F.rbox("parapet", (16, 0.25, PH), 0.02, conc, None, (0, PY + 0.125, PH / 2), ink=0.004)
    F.rbox("parapet_cap", (16.1, 0.36, 0.07), 0.02, cap, None, (0, PY + 0.125, PH + 0.035), ink=0.004)
    F.rbox("parapet_ret", (0.25, 4.0, PH), 0.02, conc, None, (-5.2, PY - 2.0, PH / 2), ink=0.004)
    F.rbox("parapet_retcap", (0.36, 4.1, 0.07), 0.02, cap, None, (-5.2, PY - 2.0, PH + 0.035), ink=0.004)


def _vent():
    galv = F.M("roof_galv", "#9AA3AC", "metal")
    dark = F.M("roof_galv_dark", "#5B636C", "metal")
    vx, vy = VENT[0], VENT[1] + 0.21
    F.rbox("vent_box", (0.95, 0.62, 0.34), 0.03, galv, None, (vx, vy, 0.17), ink=0.004)
    for k in range(5):
        F.rbox(f"vent_slat{k}", (0.8, 0.012, 0.025), 0.004, dark, None, (vx, vy - 0.313, 0.08 + k * 0.05), ink=None)
    F.rbox("vent_lid", (1.0, 0.67, 0.03), 0.01, galv, None, (vx, vy, 0.35), ink=0.003)
    # a mushroom vent and a roof hatch behind, for depth
    F.cyl("mush_stem", 0.12, 0.6, galv, None, (-2.6, 0.9, 0.3), segs=24)
    F.lathe("mush_cap", F.smooth_prof([(0.0, 0.0), (0.3, 0.0), (0.26, 0.12), (0.0, 0.2)], 3), galv, None, (-2.6, 0.9, 0.6), segs=32)
    F.rbox("hatch", (0.9, 0.9, 0.35), 0.03, F.M("hatch", "#D2333F", "paint"), None, (3.6, -0.6, 0.175), ink=0.004)


def _plant():
    teal = F.M("pipe_teal", F.PAL["teal"], "satin")
    mustard = F.M("roof_mustard", F.PAL["mustard"], "paint")
    galv = F.M("roof_galv", "#9AA3AC", "metal")
    # a teal pipe run along the deck on little stands, with a mustard valve wheel
    F.cyl("pipe_run", 0.07, 12, teal, None, (0, 2.12, 0.2), rot=(0, 90, 0), segs=24)
    for x in (-5, -3, -1, 1, 3, 5):
        F.rbox(f"pipe_stand{x}", (0.06, 0.2, 0.13), 0.01, galv, None, (x, 2.12, 0.065), ink=None)
    F.torus("roof_wheel", 0.13, 0.018, mustard, None, (-3.9, 1.97, 0.42), rot=(90, 0, 0))
    F.cyl("roof_wheel_stem", 0.02, 0.2, galv, None, (-3.9, 2.05, 0.31), segs=12)
    # the stack and a water tank on legs, left of frame
    F.cyl("stack", 0.45, 9, F.M("stack", "#C9BFB3", "paint"), None, (-4.4, 3.6, 3.5), segs=40)
    for z in (6.0, 7.6):
        F.torus(f"stack_band{z}", 0.46, 0.035, F.M("stack_band", F.PAL["crimson"], "paint"), None, (-4.4, 3.6, z))
    F.cyl("tank", 0.8, 1.4, F.M("tank", "#E6DED2", "paint"), None, (4.8, 1.0, 1.55), segs=40, bevel=0.04)
    for k in range(4):
        a = (45 + 90 * k) * D2R
        F.cyl(f"tank_leg{k}", 0.04, 0.85, galv, None, (4.8 + 0.6 * math.cos(a), 1.0 + 0.6 * math.sin(a), 0.42), segs=12)


def _cups():
    cup = F.M("paper_cup", "#F1EADC", "paper")
    sleeve = F.M("cup_sleeve", "#B9874E", "paper")
    lid = F.M("cup_lid", "#2B2F36", "satin")
    prof = F.smooth_prof([(0.0, 0.0), (0.032, 0.0), (0.042, 0.11), (0.0, 0.11)], 2)
    for who, (x, y, _z) in STAND.items():
        f = FACING[who] * D2R
        lx, ly, lz = -0.2, -0.43, 0.86  # the right hand's grip with the "hold" pose, person-local
        wx = x + lx * math.cos(f) - ly * math.sin(f)
        wy = y + lx * math.sin(f) + ly * math.cos(f)
        F.lathe(f"cup_{who}", prof, cup, None, (wx, wy, lz), segs=24)
        F.cyl(f"cup_{who}_sleeve", 0.041, 0.04, sleeve, None, (wx, wy, lz + 0.06), r2=0.043, segs=24, ink=None)
        F.cyl(f"cup_{who}_lid", 0.044, 0.014, lid, None, (wx, wy, lz + 0.115), segs=24, ink=None)
    # a spare cup on the coping
    F.lathe("cup_spare", prof, cup, None, (0.55, PY + 0.1, PH + 0.07), segs=24)


def _card():
    """Echo, back: a small cyan card with two buttons. The left reads OLD SETTING; the right is blank."""
    glass = F.M("holo_card", "#5FE6FF", "glass", emit=1.2, emit_color="#5FE6FF", alpha=0.16)
    ink = F.M_emit("holo_ink", "#9FF7FF", 6.0)
    btn = F.M("roof_btn", "#5FE6FF", "glass", emit=2.0, emit_color="#7FF3FF", alpha=0.3)
    root = F.empty("roof_card", None, CARD, (0, 0, 0))
    F.rbox("roof_card_glass", (0.6, 0.004, 0.3), 0.03, glass, root, ink=None)
    F.rbox("roof_card_bar", (0.36, 0.006, 0.014), 0.004, ink, root, (-0.05, -0.004, 0.1), ink=None)
    F.cyl("roof_card_dot", 0.02, 0.006, ink, root, (0.21, -0.004, 0.1), rot=(90, 0, 0), segs=24, ink=None)
    for k, x in enumerate((-0.135, 0.135)):
        F.rbox(f"roof_btn{k}", (0.22, 0.012, 0.095), 0.035, btn, root, (x, -0.006, -0.035), ink=None)
        F.torus(f"roof_btn_edge{k}", 1.0, 0.004, ink, root, (x, -0.013, -0.035), rot=(90, 0, 0), scale=(0.108, 0.046, 1.0), nv=8)
    cu = bpy.data.curves.new("roof_old_setting", "FONT")
    cu.body = "OLD SETTING"
    cu.size = 0.03
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.extrude = 0.001
    ob = bpy.data.objects.new("roof_old_setting", cu)
    ob.data.materials.append(ink)
    ob.parent = root
    ob.location = (-0.135, -0.016, -0.035)
    ob.rotation_euler = (90 * D2R, 0, 0)
    F.link(ob)


def _city():
    """city41's skyline at dawn, darkened in patches (the power coming back), plus nearer low blocks below the roof
    with drones on their roofs, some lifting off."""
    F.city41("morning")
    # city41 is cut for a flat high up; from the plant roof the skyline stands higher, beyond the low blocks
    for o in bpy.data.objects:
        if o.name.startswith(("tower", "print_base", "lat_", "gantry", "drone0_", "drone1_")):
            o.location.z += 6.0
    # the flat's sunrise (sections a and b use the same sky): a real gradient, slate towers, a low sun, warm haze
    FL.recolor_sky41(FL.SUNRISE41, 2.0)
    FL.tint_towers("#6B6F8E")
    FL.sun_disc((-16.0, 150.0, 7.0), 6.0)
    FL.tune_haze("#FFD2A6", 0.1)
    FL.sky_world(FL.SUNRISE_WORLD, 0.7)
    win = bpy.data.materials.get("tower_windows")
    off = F.M("tower_off", "#2A3040", "satin")
    rnd = random.Random(927)
    for o in [o for o in bpy.data.objects if o.name.startswith("tower")]:
        if rnd.random() < 0.4:
            o.data.materials.clear()
            o.data.materials.append(off)
    roofm = F.M("block_roof", "#8C8478", "paint")
    for i in range(18):
        x = -14 + i * 1.9 + rnd.uniform(-0.4, 0.4)
        y = rnd.uniform(9, 22)
        h = rnd.uniform(6, 14)
        w, d = rnd.uniform(2.0, 3.4), rnd.uniform(2.0, 3.4)
        top = 1.5 - rnd.uniform(0, 3.5)
        F.rbox(f"block{i}", (w, d, h), 0.1, win if rnd.random() < 0.6 else off, None, (x, y, top - h / 2), ink=None)
        F.rbox(f"block{i}_roof", (w + 0.1, d + 0.1, 0.12), 0.03, roofm, None, (x, y, top + 0.06), ink=None)
        if i % 3 == 0:
            lift = rnd.random() < 0.6
            F.drone(f"rdrone{i}", (x + 0.3, y, top + (0.9 + rnd.uniform(0, 1.6) if lift else 0.12)), (0, 0, rnd.uniform(0, 90)), s=1.6)


def _lights():
    head = (VENT[0], VENT[1], 1.05)
    F._thumb_lights(head, key_energy=300)
    # dawn: a low warm sun from the far side of the city, a soft sky fill from above
    F.add_light("dawn_sun", "SUN", (10, 60, 6), 2.6, "#FFC98A", 0.03, target=(0, 0, 0))
    F.add_light("dawn_sky", "AREA", (0.5, 0.0, 6.0), 260, "#FFE4C6", 10.0, target=(0.5, 0.5, 0.0), shadow=False)
    F.add_light("crew_fill", "AREA", (1.0, -0.8, 2.4), 140, "#FFE9D2", 4.0, target=(1.0, 1.9, 1.0), shadow=False)


def build(mood="morning"):
    _deck()
    _vent()
    _plant()
    _cups()
    _card()
    _city()
    _lights()
    marks = {"vent": VENT, "card": CARD, "parapet_c": (0.0, PY, 1.0), "city": (6.0, 40.0, -2.0)}
    marks.update(STAND)
    return marks
