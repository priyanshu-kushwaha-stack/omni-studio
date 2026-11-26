"""The city from a rooftop terrace at the flat's height. Moods:
storm: the cold open. Every light in the city off under a sky of green rays; in the foreground a delivery drone has
       settled into an open bin, tilted, its light out.
morning: the flip and the 2041 skyline at sunrise: drones in lanes, the tower being printed under its gantry, and
         signal masts on the rooftops pulsing thin cyan rings ("a signal in the air").
Marks: bin, roof (a place to stand by the rail), rail."""
import math

import bpy

import film3d as F
from sets3d import flat as FL

MARKS = {"bin": (0.6, 2.2, 0.0), "roof": (-1.2, 3.0, 0.0), "rail": (0.4, 6.6, 0.0)}
STORM_SKY41 = [(0.0, "#0C3A30"), (0.2, "#0E4A38"), (0.3, "#0A2A33"), (0.55, "#040814")]


def _roof(mood):
    deck = F.M("roof_deck", "#8C8478" if mood == "morning" else "#3A3F47", "paint")
    slat = F.M("roof_slat", "#B98E62", "wood", tex=("wood", "#9A7148"))
    trim = F.M("flat_trim", "#2B2F36", "satin")
    F.rbox("roof_floor", (18, 12, 0.1), 0, deck, None, (2.0, 2.0, -0.05), ink=None)
    for k in range(9):  # a timber deck strip under the bin and the bench
        F.rbox(f"deck_slat{k}", (4.2, 0.16, 0.03), 0.01, slat, None, (-0.6, 0.6 + k * 0.2, 0.015), ink=None)
    # the parapet and a glass rail with a mustard top bar
    F.rbox("parapet", (18, 0.3, 0.5), 0.04, F.M("parapet", "#D9D1C4" if mood == "morning" else "#2E333B", "paint"), None, (2.0, 7.0, 0.25), ink=None)
    F.rbox("rail_glass", (18, 0.03, 0.75), 0, F.M_glass("rail_glass", "#CFE8EE", 0.1), None, (2.0, 7.0, 0.88), ink=None)
    F.rbox("rail_bar", (18, 0.08, 0.06), 0.02, F.M("rail_bar", F.PAL["mustard"], "satin"), None, (2.0, 7.0, 1.28), ink=None)
    for x in range(-6, 11, 2):
        F.cyl(f"rail_post{x}", 0.025, 0.8, trim, None, (x, 7.0, 0.9), segs=12, ink=None)
    # rooftop kit: a vent box, a planter with a small tree, a bench
    F.rbox("vent", (1.2, 0.9, 0.8), 0.06, F.M("vent", "#AEB6BF", "metal"), None, (3.8, 4.2, 0.4), ink=0.004)
    for k in range(3):
        F.rbox(f"vent_fin{k}", (1.0, 0.92, 0.02), 0, trim, None, (3.8, 4.2, 0.55 + k * 0.08), ink=None)
    F.rbox("planter", (0.9, 0.9, 0.55), 0.05, F.M("planter", F.PAL["teal_dark"], "paint"), None, (-2.6, 5.2, 0.27), ink=0.004)
    leaf = F.M("leaf", "#4E9A4A", "satin")
    for k in range(7):
        a = k * 2.4
        F.sphere(f"tree_leaf{k}", 0.32, leaf, None, (-2.6 + 0.25 * math.cos(a), 5.2 + 0.25 * math.sin(a), 1.3 + 0.12 * (k % 3)), segs=16, ink=0.004)
    F.cyl("tree_trunk", 0.04, 0.8, F.M("trunk", "#6A4A30", "wood"), None, (-2.6, 5.2, 0.9), segs=10)
    F.rbox("bench", (1.6, 0.45, 0.06), 0.02, slat, None, (-1.6, 3.6, 0.45), ink=0.004)
    for sx in (-1, 1):
        F.rbox(f"bench_leg{sx}", (0.06, 0.4, 0.44), 0.01, trim, None, (-1.6 + sx * 0.7, 3.6, 0.22), ink=None)


def _bin(name, loc, lid_open=True):
    """A street bin: four walls, a floor, a hinged lid and a ring of lime light round the rim."""
    body = F.M("bin_body", F.PAL["teal"], "plastic")
    dark = F.M("bin_dark", "#1E2A2E", "satin")
    x, y, z = loc
    w, h, t = 0.56, 0.82, 0.04
    F.rbox(f"{name}_floor", (w, w, t), 0.01, dark, None, (x, y, z + 0.05), ink=None)
    for k, (dx, dy, sx, sy) in enumerate(((0, -w / 2, w, t), (0, w / 2, w, t), (-w / 2, 0, t, w), (w / 2, 0, t, w))):
        F.rbox(f"{name}_wall{k}", (sx, sy, h), 0.02, body, None, (x + dx, y + dy, z + h / 2), ink=0.004)
    F.rbox(f"{name}_inside", (w - 0.1, w - 0.1, 0.02), 0, dark, None, (x, y, z + h - 0.25), ink=None)
    F.rbox(f"{name}_rim", (w + 0.04, w + 0.04, 0.05), 0.02, F.M("bin_rim", "#0D6B62", "plastic"), None, (x, y, z + h), ink=None)
    F.rbox(f"{name}_inner_rim", (w - 0.08, w - 0.08, 0.06), 0.0, dark, None, (x, y, z + h - 0.01), ink=None)
    lid = F.empty(f"{name}_lid", None, (x, y + w / 2 + 0.02, z + h + 0.02), (-70 if lid_open else 0, 0, 0))
    F.rbox(f"{name}_lidp", (w + 0.06, w + 0.04, 0.05), 0.02, body, lid, (0, -(w + 0.04) / 2, 0), ink=0.004)
    F.rbox(f"{name}_badge", (0.18, 0.012, 0.18), 0.03, F.M("bin_badge", F.PAL["mustard"], "plastic"), None, (x, y - w / 2 - 0.02, z + h * 0.62), ink=None)
    for sx in (-1, 1):
        F.cyl(f"{name}_wheel{sx}", 0.08, 0.05, dark, None, (x + sx * 0.3, y + 0.32, z + 0.08), rot=(0, 90, 0), segs=20, ink=None)


def _dead_drone(loc):
    """The drone in the bin: tilted, one rotor arm over the rim, its band and eye gone dark."""
    root = F.drone("bin_drone", loc, rot=(32, -22, 35), s=1.45)
    dead = F.M("drone_dead_band", "#1C2A30", "satin")
    for o in bpy.data.objects:
        if o.parent is root and o.data and o.data.materials and o.data.materials[0].name.startswith(("drone_band", "drone_eye")):
            o.data.materials[0] = dead
    return root


def _signal_masts():
    """Masts on the rooftops, each with three thin cyan rings spreading from its tip."""
    mast = F.M("mast", "#C9D2DC", "metal")
    tip = F.M_emit("mast_tip", "#FF5A5A", 10.0)
    ring = F.M("signal_ring", "#7FF3FF", "glass", emit=3.5, emit_color="#7FF3FF", alpha=0.35)
    for k, (x, y, z) in enumerate(((4.0, 34.0, 4.0), (19.0, 46.0, 6.5), (-3.0, 52.0, 3.0), (30.0, 40.0, 5.0))):
        F.cyl(f"mast{k}", 0.12, 20.0, mast, None, (x, y, z - 5.0), segs=12, ink=None)
        F.sphere(f"mast_tip{k}", 0.22, tip, None, (x, y, z + 5.1), segs=12, ink=None)
        for j, R in enumerate((1.6, 3.4, 5.6)):
            o = F.torus(f"sig{k}_{j}", R, 0.05 + 0.02 * j, ring, None, (x, y, z + 5.0 - 0.3 * j), rot=(0, 0, 0), nu=64, nv=8, ink=None)
            o.visible_shadow = False


def build(mood):
    _roof(mood)
    if mood == "storm":
        F.city41("night")
        F.vivid_aurora()
        F.city_lights_out(1.0)
        for o in [o for o in bpy.data.objects if o.name.startswith(("drone0_", "drone1_", "gantry"))]:
            bpy.data.objects.remove(o, do_unlink=True)  # the drone lanes and the print gantry go dark with the city
        FL.recolor_sky41(STORM_SKY41, 0.8)
        FL.sky_world(FL.STORM_WORLD, 0.4)
        _bin("bin", MARKS["bin"], lid_open=True)
        _dead_drone((MARKS["bin"][0] + 0.04, MARKS["bin"][1] - 0.02, 0.9))
        head = (0.6, 2.2, 1.0)
        F.add_light("aurora_rim", "AREA", (3.0, 9.0, 4.0), 900, "#7DFFB0", 6.0, target=head, shadow=True)
        F.add_light("cold_key", "AREA", (-2.0, -1.5, 2.2), 70, "#9FB8D8", 2.5, target=head)
        F.add_light("green_fill", "AREA", (2.5, 0.0, 1.0), 40, "#5CFF9A", 2.0, target=head, shadow=False)
        FL.tune_haze("#0E3A30", 0.06)
        return dict(MARKS)
    # morning: the flip, the city waking at sunrise
    F.city41("morning")
    FL.recolor_sky41(FL.SUNRISE41, 2.2)
    FL.tint_towers("#6B6F8E")
    FL.sun_disc((14.0, 150.0, 6.0), 7.0)
    FL.sky_world(FL.SUNRISE_WORLD, 0.8)
    FL.tune_haze("#FFD2A6", 0.1)
    _bin("bin", MARKS["bin"], lid_open=False)
    _signal_masts()
    F.add_light("sun", "SUN", (5, 40, 6), 4.0, "#FFC98A", 0.03, target=(0.0, 0.0, 0.0))
    F.add_light("sky_fill", "AREA", (0.0, -3.0, 4.0), 150, "#CFE2F5", 8.0, target=(0.5, 3.0, 0.5), shadow=False)
    return dict(MARKS)
