"""The shopping street, Year 3, a grey-blue day: shops on both sides lit warm, doors open, shelves full, nobody inside.
A greeter robot outside one door bows and waves to an empty pavement.

The street runs along x. Near pavement y -1.5..3 with shop fronts at y=3 (facing -y, toward the road); the road
y -8..-1.5; the far pavement and its shops at y=-11 (facing +y). The robot stands at "robot" outside the open door
of the shop at x=2.2, facing the pavement (0). Someone facing it from the pavement stands at "you" (facing about 120).
Moods: day (grey-blue), dusk (lamps on, shops brighter)."""
import math

import film3d as F

SIGNS = [F.PAL["teal"], F.PAL["mustard"], F.PAL["crimson"], "#3E7FB8", F.PAL["teal_dark"], "#E07A3A"]
UPPER = ["#E7D7C1", "#D3DCE3", "#E8C9B4", "#CFD8C8", "#E3D9E6", "#DCCDB0"]
GOODS = [F.PAL["mustard"], F.PAL["teal"], F.PAL["crimson"], "#3E7FB8", "#F4F2EC", "#6E9E64"]


def shop(name, cx, y, facing, k, lit=1.0):
    """One shop front, built along local x with its front facing -y; interior 4 m deep behind it."""
    r = F.empty(name, None, (cx, y, 0), (0, 0, facing))
    sign = F.M(f"st_sign{k % 6}", SIGNS[k % 6], "satin")
    upper = F.M(f"st_upper{k % 6}", UPPER[k % 6], "paint")
    dark = F.M("st_dark", "#2B2F36", "satin")
    glass = F.M_glass("st_glass", "#D5E6EE", 0.08)
    warm = F.M_emit(f"st_back{k % 6}_{lit}", ["#FFE3B8", "#FFF0D8", "#FFE8CC"][k % 3], 0.9 * lit)
    F.rbox(f"{name}_pierL", (0.3, 0.45, 4.2), 0, upper, r, (-2.2, 0.0, 2.1), ink=None)
    F.rbox(f"{name}_pierR", (0.3, 0.45, 4.2), 0, upper, r, (2.2, 0.0, 2.1), ink=None)
    F.rbox(f"{name}_upper", (4.7, 0.4, 6.0), 0, upper, r, (0, 0.05, 7.2), ink=None)
    for row in range(2):
        for col in range(3):
            F.rbox(f"{name}_uw{row}{col}", (0.9, 0.06, 1.3), 0.02, F.M("st_upwin", "#5A7590", "glossy"), r, (-1.35 + 1.35 * col, -0.17, 5.6 + 2.2 * row), ink=None)
            F.rbox(f"{name}_uws{row}{col}", (1.0, 0.12, 0.06), 0.01, F.M("st_white", "#F4F2EC", "satin"), r, (-1.35 + 1.35 * col, -0.2, 4.92 + 2.2 * row), ink=None)
    F.rbox(f"{name}_sign", (4.1, 0.2, 0.65), 0.03, sign, r, (0, -0.1, 3.75), ink=0.004)
    F.cyl(f"{name}_logo", 0.2, 0.04, F.M_emit(f"st_logo{lit}", "#FFF6E4", 3.0 * lit), r, (-1.5, -0.22, 3.75), rot=(90, 0, 0), segs=24, ink=None)
    F.rbox(f"{name}_logobar", (1.8, 0.04, 0.1), 0.02, F.M_emit(f"st_logo{lit}", "#FFF6E4", 3.0 * lit), r, (0.2, -0.22, 3.75), ink=None)
    F.rbox(f"{name}_awning", (4.0, 1.0, 0.06), 0.02, sign, r, (0, -0.55, 3.1), rot=(-14, 0, 0), ink=0.004)
    F.rbox(f"{name}_awnhem", (4.0, 0.04, 0.2), 0.01, F.M("st_white", "#F4F2EC", "satin"), r, (0, -1.03, 2.95), ink=None)
    F.rbox(f"{name}_riser", (2.5, 0.3, 0.4), 0.02, dark, r, (-0.85, 0.0, 0.2), ink=None)
    F.rbox(f"{name}_win", (2.5, 0.03, 2.3), 0, glass, r, (-0.85, 0.0, 1.55), ink=None)
    F.rbox(f"{name}_transom", (4.1, 0.3, 0.4), 0, dark, r, (0, 0.0, 2.9), ink=None)
    F.rbox(f"{name}_mull", (0.08, 0.32, 2.7), 0, dark, r, (0.42, 0.0, 1.35), ink=None)
    # the open door: a glass leaf swung in on its hinge at x=1.95
    hinge = F.empty(f"{name}_hinge", r, (1.95, 0.05, 0), (0, 0, -78))
    F.rbox(f"{name}_leaf", (1.4, 0.04, 2.45), 0.01, glass, hinge, (-0.7, 0, 1.25), ink=None)
    F.rbox(f"{name}_leafframe", (1.4, 0.05, 0.08), 0.01, dark, hinge, (-0.7, 0, 0.06), ink=None)
    F.rbox(f"{name}_leafbar", (0.05, 0.06, 0.8), 0.01, F.M("st_chrome", "#D9DEE3", "chrome"), hinge, (-1.25, -0.04, 1.1), ink=None)
    # inside: floor, lit back wall, shelves of goods, a display table, a counter; nobody
    F.rbox(f"{name}_ifloor", (4.1, 4.0, 0.02), 0, F.M("st_ifloor", "#EDE6DA", "glossy"), r, (0, 2.0, 0.15), ink=None)
    F.rbox(f"{name}_iceil", (4.1, 4.0, 0.05), 0, F.M("st_iceil", "#F4F0E8", "paint"), r, (0, 2.0, 3.1), ink=None)
    F.rbox(f"{name}_ipanel", (2.6, 1.6, 0.02), 0, F.M_emit(f"st_ipanel{lit}", "#FFF4E2", 4.0 * lit), r, (0, 2.0, 3.07), ink=None)
    F.rbox(f"{name}_iback", (4.1, 0.05, 3.1), 0, warm, r, (0, 4.0, 1.55), ink=None)
    for side in (-1, 1):
        F.rbox(f"{name}_iside{side}", (0.05, 4.0, 3.1), 0, F.M("st_iside", "#F1E8DA", "paint"), r, (side * 2.05, 2.0, 1.55), ink=None)
    for shelf in range(3):
        z = 0.5 + 0.6 * shelf
        F.rbox(f"{name}_shelf{shelf}", (3.6, 0.4, 0.04), 0.01, F.M("st_shelf", "#FFFFFF", "glossy"), r, (0, 3.75, z), ink=None)
        for j in range(9):
            g = GOODS[(j + shelf + k) % 6]
            F.rbox(f"{name}_g{shelf}{j}", (0.28, 0.24, 0.3 + 0.08 * ((j + k) % 3)), 0.02, F.M(f"st_good{g}", g, "plastic"), r, (-1.6 + 0.4 * j, 3.72, z + 0.17 + 0.04 * ((j + k) % 3)), ink=None)
    F.rbox(f"{name}_table", (1.4, 0.8, 0.7), 0.03, F.M("st_table", "#C9A27A", "wood"), r, (-0.6, 1.8, 0.35), ink=0.003)
    for j in range(4):
        g = GOODS[(j + k + 2) % 6]
        F.cyl(f"{name}_t{j}", 0.11, 0.3, F.M(f"st_good{g}", g, "plastic"), r, (-1.05 + 0.3 * j, 1.8, 0.85), segs=16, ink=None)
    F.rbox(f"{name}_counter", (0.6, 1.4, 1.0), 0.03, sign, r, (1.55, 2.6, 0.5), ink=0.003)
    return r


def _street(mood):
    pave = F.M("st_pave", "#C8CBC8", "satin", tex=("tile", "#A9ADAB", 0.6))
    road = F.M("st_road", "#3E434B", "satin", tex=("speckle", "#4A5058", 0.5))
    F.rbox("st_pave_n", (40, 4.5, 0.15), 0, pave, None, (0, 0.75, 0.075), ink=None)
    F.rbox("st_pave_f", (40, 3.0, 0.15), 0, pave, None, (0, -9.5, 0.075), ink=None)
    F.rbox("st_kerb_n", (40, 0.2, 0.17), 0.02, F.M("st_kerb", "#9CA1A4", "satin"), None, (0, -1.5, 0.085), ink=None)
    F.rbox("st_kerb_f", (40, 0.2, 0.17), 0.02, F.M("st_kerb", "#9CA1A4", "satin"), None, (0, -8.0, 0.085), ink=None)
    F.rbox("st_road", (40, 6.5, 0.04), 0, road, None, (0, -4.75, -0.02), ink=None)
    for k in range(10):
        F.rbox(f"st_dash{k}", (1.6, 0.12, 0.005), 0, F.M("st_dashcol", "#E9E6DC", "paint"), None, (-18 + 4 * k, -4.75, 0.002), ink=None)
    for k, cx in enumerate((-11.0, -6.6, -2.2, 2.2, 6.6, 11.0)):
        shop(f"st_n{k}", cx, 3.0, 0, k, 1.3 if mood == "dusk" else 1.0)
        shop(f"st_f{k}", cx + 1.1, -11.0, 180, k + 3, 1.3 if mood == "dusk" else 1.0)
    pole = F.M("st_pole", "#3A414B", "satin")
    lamp = F.M_emit("st_lamp_on", "#FFE2B0", 8.0) if mood == "dusk" else F.M("st_lamp_off", "#E9EEF2", "glossy")
    for k, x in enumerate((-10.5, -3.5, 3.5, 10.5)):
        F.cyl(f"st_pole{k}", 0.06, 4.6, pole, None, (x + 1.5, -1.05, 2.3), segs=12, ink=None)
        F.rbox(f"st_arm{k}", (0.06, 0.8, 0.06), 0.02, pole, None, (x + 1.5, -1.4, 4.55), ink=None)
        F.rbox(f"st_lamp{k}", (0.2, 0.45, 0.1), 0.04, lamp, None, (x + 1.5, -1.75, 4.5), ink=None)
    leaf = F.M("st_leaf", "#4E9A4A", "satin")
    for k, x in enumerate((-12.5, -7.5, -1.0, 5.5, 12.5)):
        F.rbox(f"st_planter{k}", (1.0, 1.0, 0.5), 0.05, F.M("st_planter", "#E2DCD0", "ceramic"), None, (x, -0.65, 0.4), ink=0.004)
        F.cyl(f"st_trunk{k}", 0.06, 1.4, F.M("st_trunk", "#6A4A32", "wood"), None, (x, -0.65, 1.2), segs=10, ink=None)
        for j in range(5):
            a = j * 72 * math.pi / 180
            F.sphere(f"st_crown{k}{j}", 0.45, leaf, None, (x + 0.3 * math.cos(a), -0.65 + 0.3 * math.sin(a), 2.2 + 0.15 * (j % 2)), segs=16, ink=0.004)
        F.sphere(f"st_crowntop{k}", 0.5, leaf, None, (x, -0.65, 2.55), segs=16, ink=0.004)
    F.rbox("st_bench", (1.6, 0.45, 0.06), 0.02, F.M("st_bench", "#C9A27A", "wood"), None, (-4.6, -0.7, 0.6), ink=0.003)
    F.rbox("st_benchback", (1.6, 0.06, 0.4), 0.02, F.M("st_bench", "#C9A27A", "wood"), None, (-4.6, -0.48, 0.85), ink=0.003)
    for sx in (-1, 1):
        F.rbox(f"st_benchleg{sx}", (0.06, 0.4, 0.45), 0.01, pole, None, (-4.6 + sx * 0.7, -0.7, 0.37), ink=None)


def _greeter():
    J = F.robot("greeter", (3.35, 2.3, 0.15), 0)
    J["body"].rotation_euler = (28 * math.pi / 180, 0, 0)
    J["head"].rotation_euler = (8 * math.pi / 180, 0, 0)
    F.arm(J, "R", abduct=115, flex=25, elbow=55, elbow_up=10)
    F.arm(J, "L", abduct=10, flex=20, elbow=60)
    return J


def build(mood="day"):
    F.city41("day" if mood == "day" else "dusk")
    _street(mood)
    _greeter()
    F.add_light("st_sun", "SUN", (-6, -14, 20), 2.2 if mood == "day" else 0.6, "#DCE6F2" if mood == "day" else "#F0A070", 0.05, target=(2, 2, 0))
    F.add_light("st_sky", "AREA", (0, -3, 9), 2600, "#C9D8EA", 22.0, target=(0, -3, 0), shadow=False)
    for k, cx in enumerate((-11.0, -6.6, -2.2, 2.2, 6.6, 11.0)):
        F.add_light(f"st_in_n{k}", "AREA", (cx, 5.0, 2.9), 260, "#FFE6C4", 3.0, target=(cx, 1.0, 0.0))
        F.add_light(f"st_in_f{k}", "AREA", (cx + 1.1, -13.0, 2.9), 200, "#FFE6C4", 3.0, target=(cx + 1.1, -9.0, 0.0))
    F.add_light("st_key_robot", "AREA", (1.5, -0.8, 2.6), 120, "#FFF2E2", 1.8, target=(3.35, 2.3, 1.1))
    F.add_light("st_key_you", "AREA", (2.2, -1.2, 2.4), 110, "#FFF2E2", 1.8, target=(0.4, 0.4, 1.35))
    return {"robot": (3.35, 2.3, 0.15), "door": (3.4, 3.4, 0.0), "you": (0.4, 0.4, 0.15), "pavement": (-2.0, 0.8, 0.15),
            "far": (-8.0, 0.6, 0.15), "centre": (0.0, 0.5, 0.15), "kerb": (1.0, -1.0, 0.15), "road": (2.0, -4.5, 0.0)}
