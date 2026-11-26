"""The plant's sign-off desk, Year 10: a control room in the voting hall's cold flat light, a long window onto the
pump hall (teal pumps, big pipes, yellow rails), the desk, and Echo's card hovering over it: the water section, a
line for a signature.

Moods: day (the card waits, the line blank), signed (a signature on the line), folded (the card folding away).
Marks: "you" (behind the desk), "chief" (beside you, a half step back), "card" (the card's centre)."""

import math

import film3d as F
from sets3d.voting_hall import set_world

D2R = math.pi / 180.0
CARD = (-0.88, -0.12, 1.16)


def _room(m):
    F.rbox("so_floor", (12, 10, 0.04), 0, m["floor"], None, (0, 0, -0.02), ink=None)
    F.rbox("so_ceiling", (12, 10, 0.05), 0, m["wall"], None, (0, 0, 2.9), ink=None)
    # back wall with a long window, x -3.2..3.2, z 0.95..2.6
    F.rbox("so_wall_l", (3.0, 0.15, 2.9), 0, m["wall"], None, (-4.7, 2.6, 1.45), ink=None)
    F.rbox("so_wall_r", (3.0, 0.15, 2.9), 0, m["wall"], None, (4.7, 2.6, 1.45), ink=None)
    F.rbox("so_wall_lo", (6.4, 0.15, 0.95), 0, m["wall"], None, (0, 2.6, 0.475), ink=None)
    F.rbox("so_wall_hi", (6.4, 0.15, 0.3), 0, m["wall"], None, (0, 2.6, 2.75), ink=None)
    for x in (-3.2, -1.6, 0.0, 1.6, 3.2):
        F.rbox(f"so_mull{x}", (0.06, 0.1, 1.65), 0, m["trim"], None, (x, 2.6, 1.775), ink=None)
    F.rbox("so_side", (0.15, 10, 2.9), 0, m["wall"], None, (-3.4, 0, 1.45), ink=None)
    for k in range(3):
        F.rbox(f"so_panel{k}", (2.6, 0.5, 0.04), 0, m["panel"], None, (-1.8 + k * 1.8, -0.6 + (k % 2) * 1.6, 2.86), ink=None)


def _plant(m):
    """Behind the glass: the pump hall, two floors down, cold and orderly."""
    F.rbox("ph_floor", (30, 16, 0.1), 0, F.M("ph_floor", "#6F7A84", "paint"), None, (0, 11, -3.0), ink=None)
    F.rbox("ph_back", (30, 0.3, 14), 0, F.M("ph_back", "#AEB8C2", "paint"), None, (0, 18.5, 3.0), ink=None)
    pump, pipe, rail = m["pump"], m["pipe"], m["rail"]
    for k in range(5):
        x = -6 + k * 3.0
        F.cyl(f"ph_pump{k}", 0.7, 1.8, pump, None, (x, 8.0, -2.05), segs=32, bevel=0.05, ink=None)
        F.cyl(f"ph_motor{k}", 0.45, 1.1, F.M("ph_motor", "#5E6973", "metal"), None, (x, 8.0, -0.6), segs=28, bevel=0.04, ink=None)
        F.cyl(f"ph_riser{k}", 0.28, 3.4, pipe, None, (x, 9.4, -0.5), segs=24, ink=None)
    F.cyl("ph_header", 0.5, 18, pipe, None, (0, 9.4, 1.4), rot=(0, 90, 0), segs=32, ink=None)
    F.cyl("ph_header2", 0.36, 18, pipe, None, (0, 12.5, 0.2), rot=(0, 90, 0), segs=28, ink=None)
    for k in range(2):
        F.cyl(f"ph_tank{k}", 1.8, 6, F.M("ph_tank", "#C9D2DA", "metal"), None, (-4 + k * 8, 15.5, 0.0), segs=40, bevel=0.1, ink=None)
    F.rbox("ph_walkway", (24, 1.0, 0.08), 0, F.M("ph_grate", "#59626E", "metal"), None, (0, 5.5, 0.6), ink=None)
    for y in (5.0, 6.0):
        F.rbox(f"ph_rail{y}", (24, 0.05, 0.05), 0, rail, None, (0, y, 1.6), ink=None)
    for k in range(13):
        F.rbox(f"ph_post{k}", (0.05, 0.05, 1.0), 0, rail, None, (-12 + k * 2.0, 5.0, 1.1), ink=None)
    for k in range(4):
        F.rbox(f"ph_strip{k}", (12, 0.3, 0.05), 0, F.M_emit("ph_strip", "#E6F0F8", 5.0), None, (0, 6 + k * 3.5, 8.0), ink=None)
    F.add_light("ph_fill", "AREA", (0, 10, 7.5), 3000, "#E2ECF5", 12.0, target=(0, 10, -3), shadow=False)


def _desk(m):
    F.rbox("so_desk_top", (3.4, 0.9, 0.05), 0.015, m["desk"], None, (0, -0.35, 0.74), ink=0.003)
    F.rbox("so_desk_body", (3.3, 0.7, 0.7), 0.01, m["desk_body"], None, (0, -0.3, 0.36), ink=None)
    F.rbox("so_desk_edge", (3.4, 0.02, 0.02), 0, F.M_emit("so_edge", "#9FE8F5", 2.0), None, (0, -0.8, 0.71), ink=None)
    glass = F.M("so_screen", "#0E1A26", "glossy")
    lines = F.M_emit("so_schematic", "#3FC9B8", 2.5)
    for k, x in enumerate((0.9, 1.45)):
        root = F.empty(f"so_screen{k}", None, (x, -0.15, 0.95), (-12, 0, 8 * (k - 0.5)))
        F.rbox(f"so_screen_g{k}", (0.5, 0.025, 0.32), 0.01, glass, root, ink=0.003)
        F.rbox(f"so_screen_l{k}", (0.36, 0.03, 0.01), 0, lines, root, (0, -0.002, 0.04), ink=None)
        F.rbox(f"so_screen_v{k}", (0.01, 0.03, 0.18), 0, lines, root, (-0.1, -0.002, 0.0), ink=None)
        F.cyl(f"so_screen_c{k}", 0.03, 0.03, lines, root, (0.08, -0.002, -0.05), rot=(90, 0, 0), segs=20, ink=None)
    F.lathe("so_mug", F.smooth_prof([(0.0, 0.0), (0.045, 0.0), (0.05, 0.05), (0.05, 0.1), (0.0, 0.1)], 3),
            F.M("so_mug", "#E9E1D2", "ceramic"), None, (-1.4, -0.45, 0.765), segs=24)


def _card(mood):
    card = F.M("holo_card", "#5FE6FF", "glass", emit=1.2, emit_color="#5FE6FF", alpha=0.16)
    ink = F.M_emit("holo_ink", "#9FF7FF", 6.0)
    sig = F.M_emit("so_sig", "#E8FDFF", 9.0)
    root = F.empty("so_card", None, CARD, (8, 0, 18))
    w, h = 0.46, 0.32
    if mood == "folded":
        root.scale = (0.95, 0.95, 0.95)
        root.location = (CARD[0] + 0.05, CARD[1], CARD[2] - 0.08)
        root.rotation_euler = (8 * D2R, 0, 42 * D2R)
        lo = F.empty("so_card_lo", root, (0, 0, 0))
        hi = F.empty("so_card_hi", root, (0, 0, 0), (-72, 0, 0))
        F.rbox("so_card_lo_p", (w, 0.004, h / 2), 0.015, card, lo, (0, 0, -h / 4), ink=None)
        F.rbox("so_card_hi_p", (w, 0.004, h / 2), 0.015, card, hi, (0, 0, h / 4), ink=None)
        F.rbox("so_fold", (w, 0.006, 0.006), 0, sig, root, ink=None)
        for k in range(2):
            F.rbox(f"so_lo_line{k}", (w * (0.6 - 0.15 * k), 0.006, 0.01), 0.003, ink, lo, (-0.05, -0.004, -0.05 - k * 0.04), ink=None)
        F.rbox("so_hi_line", (w * 0.5, 0.006, 0.01), 0.003, ink, hi, (-0.08, -0.004, 0.08), ink=None)
        return
    F.rbox("so_card_p", (w, 0.004, h), 0.02, card, root, ink=None)
    # header: a water drop and a bar
    F.sphere("so_drop", 0.022, ink, root, (-0.18, -0.005, 0.105), scale=(1, 0.3, 1), segs=16, ink=None)
    F.cyl("so_drop_tip", 0.019, 0.03, ink, root, (-0.18, -0.005, 0.13), r2=0.0, segs=16, ink=None)
    F.rbox("so_head", (0.22, 0.006, 0.022), 0.005, ink, root, (-0.02, -0.005, 0.11), ink=None)
    for k, ww in enumerate((0.34, 0.28, 0.31)):
        F.rbox(f"so_line{k}", (ww, 0.006, 0.009), 0.003, ink, root, (-0.2 + ww / 2, -0.005, 0.055 - k * 0.035), ink=None)
    # the signature line, with its little cross
    F.rbox("so_sigline", (0.3, 0.006, 0.006), 0, sig, root, (0.02, -0.006, -0.1), ink=None)
    for a in (45, -45):
        F.rbox(f"so_x{a}", (0.03, 0.006, 0.005), 0, sig, root, (-0.16, -0.006, -0.085), rot=(0, a, 0), ink=None)
    if mood == "signed":
        pts = [(-0.1 + 0.25 * t / 20, -0.008, -0.075 + 0.025 * math.sin(t * 0.9) * (1 - t / 26)) for t in range(21)]
        F.sweep("so_signature", pts, [0.0035] * len(pts), sig, root, segs=8, ink=None)


def build(mood):
    set_world("#C9D6E2", 0.85)
    m = {"wall": F.M("so_wall", "#C3CCD5", "paint"), "floor": F.M("so_floor", "#7E8A95", "satin"), "trim": F.M("flat_trim", "#2B2F36", "satin"),
         "panel": F.M_emit("so_panel", "#EEF5FB", 5.0), "desk": F.M("so_desk", "#E9EDF0", "satin"), "desk_body": F.M("so_desk_body", "#4A535D", "satin"),
         "pump": F.M("ph_pump", "#2E8C84", "metal"), "pipe": F.M("ph_pipe", "#4B7C9C", "metal"), "rail": F.M("ph_rail", "#D9B23A", "paint")}
    _room(m)
    _plant(m)
    _desk(m)
    _card(mood)
    F.add_light("so_sun", "SUN", (0, -5, 10), 2.0, "#E9F1F8", 0.6, target=(0.3, 0.5, 0), shadow=False)
    F.add_light("so_top", "AREA", (0, -0.3, 2.8), 260, "#EAF2F8", 4.0, target=(0, -0.3, 0))
    you, chief = (-0.35, 0.32, 0.0), (0.45, 0.52, 0.0)
    for who, p in (("you", you), ("chief", chief)):
        head = (p[0], p[1], 1.2)
        F.add_light(f"{who}_key", "AREA", (head[0] - 0.9, head[1] - 1.8, head[2] + 0.9), 110, "#F2F6FA", 1.4, target=head)
        F.add_light(f"{who}_rim", "AREA", (head[0] + 0.8, head[1] + 1.2, head[2] + 0.5), 90, "#CFE6FF", 0.5, target=head, shadow=False)
    return {"you": you, "chief": chief, "card": CARD}
