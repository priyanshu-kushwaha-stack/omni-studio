"""Your kitchen at night, Year 6: teal cabinets, an oak counter, a warm pendant over the sink, the city through the
window. The tap drips. Echo's card offers a plumber; you find a wrench in a drawer and do it yourself.

Moods (all night):
    night       the tap drips; Echo's card with a plumber's face hovers beside the sink
    drawer      the top drawer pulled out, the wrench among the clutter; the tap still drips
    under       you lie on your back under the sink, doors open, wrench up at the trap (built here: the runner has no
                lying pose); under_slip: the same, your face scared
    floor       you sit up on the floor in front of the open cabinet, wet sleeves; the drip has stopped;
                floor_joy: the same, your face delighted
    wrench      still life: the wrench on the counter beside the silent tap
Marks: "sink" (standing at the sink), "drawer" (standing at the drawer), "card" (the card's centre), "tap" (the spout),
"you_floor" (your head, when the set builds you)."""

import math

import bpy

import film3d as F

D2R = math.pi / 180.0
TOP = 0.82  # counter height (the cast is ~1.5 m)
SPOUT = (0.0, 0.69, 1.12)


def wrench(name, loc, rot, parent=None, s=1.0):
    """An adjustable wrench: crimson grip, chrome shank and jaws. The handle runs along local +X from the head."""
    root = F.empty(name, parent, loc, rot)
    root.scale = (s, s, s)
    chrome = F.M("wrench_chrome", "#D8DDE3", "chrome")
    grip = F.M("wrench_grip", F.PAL["crimson"], "rubber")
    F.rbox(f"{name}_shank", (0.22, 0.026, 0.01), 0.004, chrome, root, (0.11, 0, 0), ink=0.003)
    F.rbox(f"{name}_grip", (0.13, 0.034, 0.02), 0.008, grip, root, (0.16, 0, 0), ink=0.003)
    F.rbox(f"{name}_head", (0.05, 0.058, 0.014), 0.006, chrome, root, (-0.012, 0, 0), ink=0.003)
    for sy in (-1, 1):
        F.rbox(f"{name}_jaw{sy}", (0.03, 0.012, 0.014), 0.003, chrome, root, (-0.045, sy * 0.022, 0), ink=None)
    F.cyl(f"{name}_worm", 0.008, 0.03, chrome, root, (0.006, 0, 0.0), rot=(90, 0, 0), segs=12, ink=None)
    return root


def _room(m):
    F.rbox("k_floor", (8, 6, 0.04), 0, m["oak"], None, (0, -1.2, -0.02), ink=None)
    F.rbox("k_ceiling", (8, 6, 0.05), 0, m["wall"], None, (0, -1.2, 2.6), ink=None)
    # back wall with the window over the sink (x -0.55..0.55, z 1.05..1.95)
    F.rbox("k_wall_l", (3.45, 0.1, 2.6), 0, m["wall"], None, (-2.275, 1.0, 1.3), ink=None)
    F.rbox("k_wall_r", (3.45, 0.1, 2.6), 0, m["wall"], None, (2.275, 1.0, 1.3), ink=None)
    F.rbox("k_wall_lo", (1.1, 0.1, 1.05), 0, m["wall"], None, (0, 1.0, 0.525), ink=None)
    F.rbox("k_wall_hi", (1.1, 0.1, 0.65), 0, m["wall"], None, (0, 1.0, 2.275), ink=None)
    for sx in (-1, 1):
        F.rbox(f"k_splash{sx}", (1.85, 0.02, 0.5), 0, m["tile"], None, (sx * 1.475, 0.94, TOP + 0.25), ink=None)
    F.rbox("k_splash_mid", (1.1, 0.02, 1.05 - TOP), 0, m["tile"], None, (0, 0.94, (TOP + 1.05) / 2), ink=None)
    for x in (-0.55, 0.55):
        F.rbox(f"k_jamb{x}", (0.04, 0.12, 0.92), 0, m["trim"], None, (x, 0.98, 1.5), ink=None)
    F.rbox("k_mull_v", (0.03, 0.06, 0.9), 0, m["trim"], None, (0, 0.98, 1.5), ink=None)
    F.rbox("k_mull_h", (1.1, 0.06, 0.03), 0, m["trim"], None, (0, 0.98, 1.5), ink=None)
    F.rbox("k_sill", (1.2, 0.16, 0.03), 0, m["oak"], None, (0, 0.9, 1.04), ink=0.003)
    F.rbox("k_side", (0.1, 6, 2.6), 0, m["wall"], None, (-2.55, -1.2, 1.3), ink=None)


def _cabinets(m, mood):
    body = TOP - 0.04
    # counter in four pieces round the sink hole (x -0.31..0.31, y 0.43..0.85)
    for name, sx, x in (("l", 2.09, -1.355), ("r", 2.09, 1.355)):
        F.rbox(f"k_top_{name}", (sx, 0.66, 0.04), 0.008, m["oak"], None, (x, 0.64, TOP - 0.02), ink=0.003)
    F.rbox("k_top_f", (0.62, 0.11, 0.04), 0.008, m["oak"], None, (0, 0.365, TOP - 0.02), ink=0.003)
    F.rbox("k_top_b", (0.62, 0.12, 0.04), 0.008, m["oak"], None, (0, 0.91, TOP - 0.02), ink=0.003)
    F.rbox("k_plinth", (4.8, 0.05, 0.1), 0, m["trim"], None, (0, 0.4, 0.05), ink=None)
    # carcasses either side of the open sink bay
    for x0, x1 in ((-2.4, -0.3), (0.3, 2.4)):
        F.rbox(f"k_body{x0}", (x1 - x0, 0.56, body - 0.1), 0, m["teal"], None, ((x0 + x1) / 2, 0.68, 0.1 + (body - 0.1) / 2), ink=None)
    for sx in (-1, 1):
        F.rbox(f"k_bay_side{sx}", (0.02, 0.56, body), 0, m["teal_in"], None, (sx * 0.29, 0.68, body / 2), ink=None)
    F.rbox("k_bay_back", (0.6, 0.02, body), 0, m["teal_in"], None, (0, 0.95, body / 2), ink=None)
    # fronts: doors left, a drawer bank right of the sink, doors beyond
    for k, (x0, x1) in enumerate(((-2.4, -1.7), (-1.7, -1.0), (-1.0, -0.3), (0.9, 1.65), (1.65, 2.4))):
        F.rbox(f"k_door{k}", (x1 - x0 - 0.01, 0.02, body - 0.12), 0.006, m["teal"], None, ((x0 + x1) / 2, 0.39, 0.11 + (body - 0.12) / 2), ink=0.003)
        F.rbox(f"k_knob{k}", (0.012, 0.02, 0.14), 0.004, m["brass"], None, (x1 - 0.06 if k < 3 else x0 + 0.06, 0.37, body - 0.15), ink=None)
    for j, (z0, z1) in enumerate(((0.12, 0.38), (0.39, 0.6))):
        F.rbox(f"k_drw{j}", (0.59, 0.02, z1 - z0 - 0.01), 0.006, m["teal"], None, (0.6, 0.39, (z0 + z1) / 2), ink=0.003)
        F.rbox(f"k_drw_pull{j}", (0.2, 0.02, 0.014), 0.004, m["brass"], None, (0.6, 0.37, z1 - 0.05), ink=None)
    out = 0.45 if mood == "drawer" else 0.0
    dr = F.empty("k_top_drawer", None, (0.6, 0.39 - out, 0.0))
    F.rbox("k_drw2", (0.59, 0.02, 0.16), 0.006, m["teal"], dr, (0, 0, 0.69), ink=0.003)
    F.rbox("k_drw2_pull", (0.2, 0.02, 0.014), 0.004, m["brass"], dr, (0, -0.02, 0.72), ink=None)
    if out:
        box = F.M("k_drawer_box", "#EDE6DA", "paint")
        F.rbox("k_drw_bottom", (0.54, 0.46, 0.012), 0, box, dr, (0, 0.24, 0.62), ink=None)
        for sx in (-1, 1):
            F.rbox(f"k_drw_wall{sx}", (0.012, 0.46, 0.12), 0, box, dr, (sx * 0.27, 0.24, 0.68), ink=None)
        _clutter(dr)
    # sink doors: closed, or swung open on their outer hinges
    ang = 105 if mood.startswith(("under", "floor")) else 0
    for sx in (-1, 1):
        h = F.empty(f"k_hinge{sx}", None, (sx * 0.3, 0.39, 0.0), (0, 0, sx * ang))
        F.rbox(f"k_sinkdoor{sx}", (0.29, 0.02, body - 0.02), 0.006, m["teal"], h, (-sx * 0.15, 0, 0.01 + (body - 0.02) / 2), ink=0.003)
        F.rbox(f"k_sinkknob{sx}", (0.012, 0.02, 0.14), 0.004, m["brass"], h, (-sx * 0.27, -0.02, body - 0.15), ink=None)
    # upper cabinets with a warm strip underneath, the window between them
    for sx in (-1, 1):
        F.rbox(f"k_upper{sx}", (1.8, 0.34, 0.7), 0.01, m["cream"], None, (sx * 1.5, 0.78, 1.7), ink=0.003)
        F.rbox(f"k_upper_led{sx}", (1.7, 0.03, 0.012), 0, m["led"], None, (sx * 1.5, 0.66, 1.345), ink=None)


def _clutter(dr):
    cols = [F.PAL["mustard"], "#3E7FB8", F.PAL["crimson"], "#4E9A4A", "#2B2F36"]
    for k in range(6):
        F.cyl(f"k_pen{k}", 0.009, 0.14, F.M(f"k_cl{k % 5}", cols[k % 5], "plastic"), dr, (-0.2 + k * 0.035, 0.1 + (k % 2) * 0.05, 0.635),
              rot=(0, 90, 15 * k), segs=10, ink=None)
    F.torus("k_tape", 0.045, 0.018, F.M("k_tape", "#B9B3A6", "paper"), dr, (0.12, 0.12, 0.645), ink=0.003)
    F.sphere("k_twine", 0.04, F.M("k_twine", "#C9A27A", "cloth"), dr, (0.19, 0.3, 0.665), segs=16, ink=0.003)
    F.rbox("k_batt", (0.05, 0.015, 0.015), 0.006, F.M("k_cl4", "#2B2F36", "plastic"), dr, (-0.15, 0.33, 0.635), ink=None)
    wrench("k_wrench", (-0.05, 0.28, 0.64), (0, 0, -20), dr, s=1.0)


def _sink(m, mood):
    st = m["steel"]
    F.rbox("k_basin_bottom", (0.6, 0.4, 0.015), 0, st, None, (0, 0.64, TOP - 0.22), ink=None)
    for name, size, loc in (("f", (0.6, 0.015, 0.22), (0, 0.445, TOP - 0.11)), ("b", (0.6, 0.015, 0.22), (0, 0.835, TOP - 0.11)),
                            ("l", (0.015, 0.4, 0.22), (-0.3, 0.64, TOP - 0.11)), ("r", (0.015, 0.4, 0.22), (0.3, 0.64, TOP - 0.11))):
        F.rbox(f"k_basin_{name}", size, 0, st, None, loc, ink=None)
    F.cyl("k_drain", 0.035, 0.01, F.M("k_drain", "#3A3F46", "metal"), None, (0, 0.69, TOP - 0.21), segs=24, ink=None)
    pipe = F.M("k_pipe", "#E8E6E0", "plastic")
    F.sweep("k_trap", [(0, 0.69, TOP - 0.22), (0, 0.69, 0.42), (0, 0.72, 0.34), (0, 0.8, 0.34), (0, 0.84, 0.42), (0, 0.86, 0.48), (0, 0.95, 0.48)],
            [0.022] * 7, pipe, segs=14, ink=0.003)
    F.cyl("k_valve", 0.025, 0.06, m["brass"], None, (-0.15, 0.92, 0.36), rot=(90, 0, 0), segs=14, ink=None)
    F.sweep("k_tap", [(0, 0.9, TOP), (0, 0.9, 1.08), (0, 0.88, 1.2), (0, 0.82, 1.25), (0, 0.75, 1.24), (0, 0.7, 1.19), SPOUT],
            [0.02, 0.02, 0.019, 0.018, 0.018, 0.017, 0.016], m["chrome"], segs=16, ink=0.003)
    F.cyl("k_tap_base", 0.032, 0.03, m["chrome"], None, (0, 0.9, TOP + 0.015), segs=24, ink=0.003)
    F.rbox("k_tap_lever", (0.012, 0.012, 0.09), 0.005, m["chrome"], None, (0.045, 0.9, TOP + 0.09), rot=(0, 20, 0), ink=None)
    if mood in ("night", "drawer", "under", "under_slip"):
        water = F.M("k_water", "#CDEFFF", "glossy", emit=0.6, emit_color="#BFE8FF", alpha=0.75)
        F.sphere("k_drip", 0.011, water, None, (SPOUT[0], SPOUT[1], SPOUT[2] - 0.08), scale=(1, 1, 1.5), segs=16, ink=None)
        F.sphere("k_drip2", 0.008, water, None, (SPOUT[0], SPOUT[1], SPOUT[2] - 0.25), scale=(1, 1, 1.3), segs=12, ink=None)
        F.torus("k_ripple", 0.03, 0.002, water, None, (SPOUT[0], SPOUT[1], TOP - 0.208), ink=None)


def _counter_props():
    F.lathe("k_kettle", F.smooth_prof([(0.0, 0.0), (0.09, 0.0), (0.1, 0.08), (0.08, 0.17), (0.03, 0.2), (0.0, 0.21)], 3),
            F.M("k_kettle", F.PAL["mustard"], "glossy"), None, (-1.25, 0.7, TOP), segs=28)
    F.lathe("k_bowl", F.smooth_prof([(0.0, 0.0), (0.06, 0.0), (0.15, 0.06), (0.16, 0.08), (0.0, 0.03)], 3),
            F.M("k_bowl", "#F2ECE2", "ceramic"), None, (1.35, 0.68, TOP), segs=28)
    for k, (x, y) in enumerate(((1.3, 0.66), (1.4, 0.7), (1.35, 0.6))):
        F.sphere(f"k_apple{k}", 0.045, F.M("k_apple", F.PAL["crimson"], "glossy"), None, (x, y, TOP + 0.08), segs=16, ink=0.003)
    F.lathe("k_pot", F.smooth_prof([(0.0, 0.0), (0.07, 0.0), (0.08, 0.1), (0.0, 0.1)], 3), F.M("k_pot", "#E9E1D2", "ceramic"),
            None, (0.42, 0.92, 1.06), segs=20)
    for k in range(5):
        F.sphere(f"k_herb{k}", 0.05, F.M("leaf", "#4E9A4A", "satin"), None, (0.42 + 0.03 * math.cos(k * 1.3), 0.92 + 0.02 * math.sin(k * 1.3), 1.2 + 0.03 * k),
                 scale=(1, 0.5, 0.7), rot=(0, 0, k * 70), segs=12, ink=0.003)
    shade = F.M("k_shade", "#1F2328", "satin")
    F.cyl("k_cord", 0.005, 0.7, shade, None, (0, 0.35, 2.25), segs=8, ink=None)
    F.lathe("k_pendant", F.smooth_prof([(0.0, 0.2), (0.03, 0.2), (0.06, 0.14), (0.14, 0.0), (0.13, 0.0)], 3), shade, None, (0, 0.35, 1.7), segs=32)
    F.sphere("k_bulb", 0.04, F.M_emit("k_bulb", "#FFE0B0", 12.0), None, (0, 0.35, 1.72), segs=16, ink=None)


def _card():
    """Echo's offer: a cyan card with a plumber's face (round head, cap, smile) and two lines of read-out."""
    card = F.M("holo_card", "#5FE6FF", "glass", emit=1.2, emit_color="#5FE6FF", alpha=0.16)
    ink = F.M_emit("holo_ink", "#9FF7FF", 6.0)
    root = F.empty("plumber_card", None, (0.52, 0.5, 1.22), (8, 0, -12))
    F.rbox("pc_card", (0.38, 0.004, 0.24), 0.02, card, root, ink=None)
    F.torus("pc_head", 0.05, 0.005, ink, root, (-0.1, -0.005, -0.01), rot=(90, 0, 0), ink=None)
    for sx in (-1, 1):
        F.sphere(f"pc_eye{sx}", 0.007, ink, root, (-0.1 + sx * 0.018, -0.006, 0.0), segs=8, ink=None)
    F.torus("pc_smile", 0.02, 0.003, ink, root, (-0.1, -0.006, -0.012), rot=(90, 0, 180), arc_deg=180, ink=None)
    F.rbox("pc_cap", (0.09, 0.005, 0.03), 0.012, ink, root, (-0.1, -0.006, 0.052), ink=None)
    F.rbox("pc_brim", (0.075, 0.005, 0.008), 0.003, ink, root, (-0.07, -0.006, 0.036), ink=None)
    for k, w in enumerate((0.14, 0.1, 0.12)):
        F.rbox(f"pc_line{k}", (w, 0.006, 0.01), 0.003, ink, root, (0.03 + w / 2, -0.006, 0.04 - k * 0.04), ink=None)
    F.cyl("pc_call", 0.022, 0.006, ink, root, (0.13, -0.006, -0.08), rot=(90, 0, 0), segs=24, ink=None)


def _lying(mood):
    """You on your back, head and shoulders under the sink, both hands up at the trap, the wrench in the right."""
    J = F.person("you", F.YOU41, loc=(0.0, -0.58, 0.17), facing=0)
    J["root"].rotation_euler = (-90 * D2R, 0, 0)
    F.arm(J, "R", abduct=10, flex=95, elbow=55)
    F.arm(J, "L", abduct=18, flex=80, elbow=70)
    F.pose_hand(J, "R", 0.85, 0.7)
    F.pose_hand(J, "L", 0.5, 0.4)
    F.leg(J, "L", flex=55, knee=105)
    F.leg(J, "R", flex=22, knee=42)
    F.look(J, nod=48)
    F.build_face(J["headmesh"], J["R"], "scared" if mood == "under_slip" else "worried", gaze=(0.0, 0.4), iris="#6A4530")
    F.lens_rings(J["headmesh"], J["R"])
    wrench("k_wrench_hand", (0.0, 0.0, -0.1), (90, 0, 90), J["wr_R"], s=1.1)
    F.rbox("k_phone", (0.07, 0.14, 0.01), 0.008, F.M("k_phone", "#1A1C20", "glossy"), None, (0.38, 0.18, 0.006), rot=(0, 0, 20), ink=None)
    F.add_light("k_torch", "SPOT", (0.38, 0.18, 0.05), 25, "#F4F8FF", 0.05, target=(0.0, 0.62, 0.55), spot=70)
    F.add_light("k_under_fill", "POINT", (0.12, 0.3, 0.3), 6, "#FFE6C8", 0.2)


def _sitting(mood):
    J = F.person("you", F.YOU41, loc=(0.02, -0.06, -0.47), facing=0)
    for s in ("L", "R"):
        F.leg(J, s, flex=82, abduct=10, knee=35 if s == "L" else 15)
    F.arm(J, "L", abduct=18, flex=38, elbow=55)
    F.arm(J, "R", abduct=18, flex=30, elbow=40)
    F.pose_hand(J, "L", 0.4, 0.3)
    F.pose_hand(J, "R", 0.4, 0.3)
    F.look(J, nod=-8, tilt=-6)
    F.build_face(J["headmesh"], J["R"], "joy" if mood == "floor_joy" else "happy", gaze=(0.35, 0.45), iris="#6A4530")
    F.lens_rings(J["headmesh"], J["R"])
    bpy.context.view_layer.update()
    water = F.M("k_water", "#CDEFFF", "glossy", emit=0.6, emit_color="#BFE8FF", alpha=0.75)
    wet = F.M("k_wet", "#7A5A00", "cloth")
    for s in ("L", "R"):
        p = J["wr_" + s].matrix_world.translation
        F.sphere(f"k_wetdrop{s}", 0.012, water, None, (p.x, p.y - 0.02, p.z - 0.1), scale=(1, 1, 1.4), segs=12, ink=None)
        F.torus(f"k_wetcuff{s}", 0.057, 0.022, wet, J["el_" + s], (0, 0, -0.13), scale=(1, 1, 1.4), ink=None)
    wrench("k_wrench_floor", (0.42, -0.25, 0.012), (0, 0, 35))
    F.add_light("k_floor_key", "AREA", (-0.9, -1.6, 1.3), 70, "#FFF0DE", 1.2, target=(0.0, -0.1, 0.72))


def build(mood):
    from sets3d.voting_hall import set_world

    set_world("#1C2444", 0.35)
    m = {"wall": F.M("flat_wall", "#F2ECE2", "paint"), "oak": F.M("flat_oak", "#C9A27A", "wood", tex=("wood", "#A97E55")),
         "trim": F.M("flat_trim", "#2B2F36", "satin"), "teal": F.M("k_teal", "#18877C", "satin"), "teal_in": F.M("k_teal_in", "#0F5E57", "paint"),
         "cream": F.M("k_cream", "#EFE7D8", "satin"), "brass": F.M("k_brass", "#D9A441", "metal"), "steel": F.M("k_steel", "#C3C9D0", "metal"),
         "chrome": F.M("wrench_chrome", "#D8DDE3", "chrome"), "led": F.M_emit("k_led", "#FFD9A8", 7.0),
         "tile": F.M("k_tile", "#EDE5D6", "ceramic", tex=("checker", "#E2D7C3", 22.0))}
    _room(m)
    _cabinets(m, mood)
    _sink(m, mood)
    _counter_props()
    F.city41("night")
    if mood == "night":
        _card()
    if mood.startswith("under"):
        _lying(mood)
    elif mood.startswith("floor"):
        _sitting(mood)
    elif mood == "wrench":
        wrench("k_wrench_top", (0.42, 0.55, TOP + 0.007), (0, 0, 160), s=1.15)
    # night light: the pendant's warm pool, warm strips under the cabinets, cool city light through the window
    F.add_light("k_pendant_light", "POINT", (0, 0.35, 1.66), 60, "#FFD7A0", 0.15)
    F.add_light("k_pool", "SPOT", (0, 0.35, 1.68), 120, "#FFDDB0", 0.1, target=(0, 0.2, 0), spot=85)
    for sx in (-1, 1):
        F.add_light(f"k_strip{sx}", "AREA", (sx * 1.5, 0.66, 1.32), 40, "#FFD9A8", 1.6, target=(sx * 1.5, 0.66, 0.0))
    F.add_light("k_window", "AREA", (0, 1.6, 1.5), 90, "#7FA0FF", 1.2, target=(0, -1.0, 1.0), shadow=False)
    F.add_light("k_key", "AREA", (-1.0, -1.6, 1.9), 90, "#FFF0DE", 1.4, target=(0.0, -0.1, 1.15))
    F.add_light("k_rim", "AREA", (1.1, 0.5, 1.8), 70, "#9FC2FF", 0.6, target=(0.0, -0.1, 1.15), shadow=False)
    return {"sink": (-0.02, -0.12, 0.0), "drawer": (0.6, -0.42, 0.0), "card": (0.52, 0.5, 1.22), "tap": SPOUT,
            "you_floor": (0.02, -0.06, 0.72), "you_under": (0.0, 0.62, 0.25)}
