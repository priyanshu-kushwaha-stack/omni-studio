"""The metro station at dusk, Year 6: the film's signature picture. A glass barrel roof with the sky going from
orange to violet, warm stone walls, and two identical escalators side by side, lit the same: the left one rising, the
right one falling. Black figures stand on both, every eye ringed cyan (figures going up face away from the bottom).

Moods (all dusk; the suffix says where Dana and you stand, so the crowd leaves your steps free):
    dusk        you pass each other halfway: "dana" on the up escalator, "you" on the down one, the same step
    dusk_apart  Dana high on the up escalator, you low on the down one
    dusk_end    Dana on the top landing, turning back; you near the bottom
    dusk_foot   you at the foot of the up escalator (Dana not in the picture)
Marks: "dana", "you" (for the mood), "top" (the upper landing, centre), "bottom" (the concourse before the steps)."""

import math
import random

import bmesh
import bpy

import film3d as F
from sets3d.voting_hall import crowd_figure, crowd_mesh, set_world

D2R = math.pi / 180.0
S30, C30, T30 = 0.5, math.cos(30 * D2R), math.tan(30 * D2R)
H, NST = 4.2, 18
RS = H / NST  # riser
TR = RS / T30  # tread
RUN = NST * TR
XL, XR = -0.75, 0.75
BAL = (-1.31, -0.19, 0.19, 1.31)
SPAN = (-10.0, 18.0)


def on_step(x, i):
    return (x, (i + 0.5) * TR, (i + 1) * RS)


def incline(name, x, w, d, off, mat, y0=0.0, y1=RUN, ink=None):
    """A box laid on the 30-degree line, `off` metres above it (perpendicular)."""
    ym = (y0 + y1) / 2
    zm = ym * T30 + RS * 0.5
    loc = (x, ym - S30 * off, zm + C30 * off)
    return F.rbox(name, (w, (y1 - y0) / C30, d), 0.008, mat, None, loc, rot=(30, 0, 0), ink=ink)


def _escalator(tag, x, mats):
    metal, edge, comb = mats["step"], mats["edge"], mats["comb"]
    for i in range(NST):
        F.rbox(f"{tag}_step{i}", (1.0, TR, RS), 0, metal, None, (x, (i + 0.5) * TR, (i + 0.5) * RS), ink=None)
        F.rbox(f"{tag}_edge{i}", (1.0, 0.045, 0.012), 0, edge, None, (x, i * TR + 0.025, (i + 1) * RS + 0.004), ink=None)
        for sx in (-1, 1):
            F.rbox(f"{tag}_side{i}{sx}", (0.04, TR, 0.012), 0, edge, None, (x + sx * 0.47, (i + 0.5) * TR, (i + 1) * RS + 0.004), ink=None)
    F.rbox(f"{tag}_comb_lo", (1.0, 1.4, 0.04), 0.01, comb, None, (x, -0.7, 0.0), ink=None)
    F.rbox(f"{tag}_comb_hi", (1.0, 1.4, 0.04), 0.01, comb, None, (x, RUN + 0.7, H), ink=None)


def _balustrade(tag, x, mats):
    glass, rail, led = mats["glass"], mats["rail"], mats["led"]
    incline(f"{tag}_glass", x, 0.025, 0.7, 0.47, glass).visible_shadow = False
    incline(f"{tag}_deck", x, 0.13, 0.14, 0.1, mats["deck"])
    incline(f"{tag}_rail", x, 0.09, 0.055, 0.85, rail)
    incline(f"{tag}_led", x, 0.035, 0.012, 0.81, led)
    for y0, y1, z0 in ((-1.4, 0.0, 0.0), (RUN, RUN + 1.4, H)):
        g = F.rbox(f"{tag}_glass_f{z0}", (0.025, y1 - y0, 0.7), 0, glass, None, (x, (y0 + y1) / 2, z0 + 0.47), ink=None)
        g.visible_shadow = False
        F.rbox(f"{tag}_deck_f{z0}", (0.13, y1 - y0, 0.14), 0.008, mats["deck"], None, (x, (y0 + y1) / 2, z0 + 0.1), ink=None)
        F.rbox(f"{tag}_rail_f{z0}", (0.09, y1 - y0, 0.055), 0.008, rail, None, (x, (y0 + y1) / 2, z0 + 0.86), ink=None)
        F.rbox(f"{tag}_led_f{z0}", (0.035, y1 - y0, 0.012), 0, led, None, (x, (y0 + y1) / 2, z0 + 0.82), ink=None)
    # the rounded newel ends
    F.torus(f"{tag}_newel_lo", 0.27, 0.028, rail, None, (x, -1.4, 0.59), rot=(0, 90, 180), arc_deg=180, ink=None)
    F.torus(f"{tag}_newel_hi", 0.27, 0.028, rail, None, (x, RUN + 1.4, H + 0.59), rot=(0, 90, 0), arc_deg=180, ink=None)


def _vault(glass, rib):
    r, z0 = 6.0, 8.5
    y = SPAN[0]
    while y <= SPAN[1] + 0.01:
        F.torus(f"rib{y:.0f}", r, 0.085, rib, None, (0, y, z0), rot=(90, 0, 0), nu=48, nv=8, arc_deg=180, ink=None)
        y += 2.0
    for k in range(1, 12):
        a = k * 15 * D2R
        F.rbox(f"purlin{k}", (0.07, SPAN[1] - SPAN[0], 0.07), 0, rib, None, (r * math.cos(a), sum(SPAN) / 2, z0 + r * math.sin(a)),
               rot=(0, 90 - k * 15, 0), ink=None)
    bm = bmesh.new()
    rows = []
    for j in range(2):
        yy = SPAN[j]
        rows.append([bm.verts.new((5.97 * math.cos(math.pi * i / 36), yy, z0 + 5.97 * math.sin(math.pi * i / 36))) for i in range(37)])
    for i in range(36):
        bm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    F.mesh_obj("roof_glass", bm, glass).visible_shadow = False
    # glazed ends, with mullions
    for yy in SPAN:
        bm = bmesh.new()
        c = bm.verts.new((0, yy, z0))
        ring = [bm.verts.new((6 * math.cos(math.pi * i / 36), yy, z0 + 6 * math.sin(math.pi * i / 36))) for i in range(37)]
        for i in range(36):
            bm.faces.new((c, ring[i], ring[i + 1]))
        F.mesh_obj(f"end_glass{yy:.0f}", bm, glass).visible_shadow = False
        for k in range(-4, 5):
            hgt = math.sqrt(max(36 - (k * 1.4) ** 2, 0))
            F.rbox(f"mullion{yy:.0f}{k}", (0.06, 0.08, hgt + z0 - H), 0, rib, None, (k * 1.4, yy, H + (hgt + z0 - H) / 2), ink=None)
        F.rbox(f"end_glass_lo{yy:.0f}", (12, 0.03, z0 - H), 0, glass, None, (0, yy, (z0 + H) / 2), ink=None).visible_shadow = False


def _hall(mats):
    stone, pil, floor = mats["stone"], mats["pilaster"], mats["floor"]
    F.rbox("floor_lo", (12, SPAN[1] - SPAN[0], 0.1), 0, floor, None, (0, sum(SPAN) / 2, -0.05), ink=None)
    F.rbox("slab", (12, SPAN[1] - RUN, 0.45), 0, mats["slab"], None, (0, (RUN + SPAN[1]) / 2, H - 0.225), ink=None)
    F.rbox("slab_top", (12, SPAN[1] - RUN, 0.02), 0, floor, None, (0, (RUN + SPAN[1]) / 2, H + 0.0), ink=None)
    F.rbox("slab_light", (12, 0.05, 0.03), 0, mats["led"], None, (0, RUN - 0.03, H - 0.44), ink=None)
    for sx in (-1, 1):
        F.rbox(f"slab_glass{sx}", (4.6, 0.025, 0.95), 0, mats["glass"], None, (sx * 3.65, RUN + 0.05, H + 0.5), ink=None).visible_shadow = False
        F.rbox(f"slab_rail{sx}", (4.6, 0.07, 0.05), 0.01, mats["steel"], None, (sx * 3.65, RUN + 0.05, H + 1.0), ink=None)
        F.rbox(f"wall{sx}", (0.3, SPAN[1] - SPAN[0], 8.5), 0, stone, None, (sx * 6.1, sum(SPAN) / 2, 4.25), ink=None)
        y = SPAN[0]
        while y <= SPAN[1] + 0.01:
            F.rbox(f"pil{sx}{y:.0f}", (0.36, 0.5, 8.5), 0.02, pil, None, (sx * 5.85, y, 4.25), ink=None)
            F.rbox(f"pil_glow{sx}{y:.0f}", (0.04, 0.16, 2.2), 0, mats["sconce"], None, (sx * 5.66, y, 3.0), ink=None)
            y += 2.0
    # the near end: a stone wall with two warm doorways onto the street
    F.rbox("near_wall", (12, 0.3, H), 0, stone, None, (0, SPAN[0], H / 2), ink=None)
    for sx in (-1, 1):
        F.rbox(f"near_door{sx}", (2.2, 0.1, 2.8), 0, F.M_emit("near_door", "#FFC88A", 1.4), None, (sx * 3.0, SPAN[0] + 0.16, 1.4), ink=None)
    # the lower concourse runs on under the slab: a warm glazed gallery at its far end
    F.rbox("gallery", (12, 0.2, H - 0.45), 0, F.M_emit("gallery", "#F3C890", 0.7), None, (0, RUN + 6.0, (H - 0.45) / 2), ink=None)
    for k in range(-5, 6):
        F.rbox(f"gallery_m{k}", (0.08, 0.1, H - 0.45), 0, mats["pilaster"], None, (k * 1.1, RUN + 5.85, (H - 0.45) / 2), ink=None)
    # truss under the escalators: white cladding
    incline("truss", 0.0, 2.9, 1.1, -0.72, mats["clad"])
    incline("mid_deck", 0.0, 0.26, 0.07, 0.12, F.M("esc_mid2", "#2E3238", "rubber"))
    for k in range(7):
        yy = 0.6 + k * 1.05
        F.cyl(f"mid_lamp{k}", 0.03, 0.16, F.M_emit("esc_lamp", "#FFD9A8", 2.5), None, (0, yy, yy * T30 + RS * 0.5 + 0.25), segs=12, ink=None)


def _sky():
    m = bpy.data.materials.new("dusk_dome")
    nt, out = F._nodes(m)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sp = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sp.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position, cr.elements[0].color = 0.49, F.srgb("#FFB070")
    cr.elements[1].position, cr.elements[1].color = 0.82, F.srgb("#1E2A5C")
    for pos, col in ((0.53, "#F48A68"), (0.6, "#C8668A"), (0.7, "#5A4A90")):
        cr.elements.new(pos).color = F.srgb(col)
    nt.links.new(sp.outputs["Z"], ramp.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 1.3
    nt.links.new(ramp.outputs[0], em.inputs[0])
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    F.sphere("dusk_dome", 380, m, None, (0, 0, 0), segs=48, ink=None).visible_shadow = False


def _city():
    before = set(bpy.data.objects.keys())
    F.city41("dusk")
    for name in set(bpy.data.objects.keys()) - before:
        ob = bpy.data.objects[name]
        if name == "sky41":
            bpy.data.objects.remove(ob)
            continue
        ob.location = (ob.location.x - 13, ob.location.y + 22, ob.location.z + 22)


PLACES = {
    "dusk": {"dana": ("L", 8), "you": ("R", 8)},
    "dusk_apart": {"dana": ("L", 13), "you": ("R", 4)},
    "dusk_end": {"dana": ("L", "top"), "you": ("R", 1)},
    "dusk_foot": {"you": ("L", "foot")},
}
COATS = ["#C98A3E", "#4F7FA8", "#7FA06C", "#B65A50", "#76709A", "#D9CCB4", "#3E6E86"]


def _place(side, step):
    x = XL if side == "L" else XR
    if step == "top":
        return (x, RUN + 0.75, H)
    if step == "foot":
        return (x, -1.05, 0.02)
    return on_step(x, step)


def _crowd(places):
    meshes = [crowd_mesh(f"esc_fig{k}", c) for k, c in enumerate(COATS)]
    rnd = random.Random(6)
    taken = {"L": set(), "R": set()}
    for side, step in places.values():
        if isinstance(step, int):
            taken[side] |= {step - 1, step, step + 1}
        elif step == "top":
            taken[side] |= set(range(NST - 7, NST + 1))
        else:
            taken[side] |= set(range(-1, 8))
    if places.get("dana") == ("L", "top"):
        taken["R"] |= set(range(0, 6))
    if places.get("dana") == ("L", 13):
        taken["L"] |= set(range(12, NST + 1))
    if any(step == "top" for _s, step in places.values()):
        taken["L"].add(NST)
        taken["R"].add(NST)
    n = 0
    for side, x, face in (("L", XL, 180), ("R", XR, 0)):
        i = rnd.randrange(2) - 1
        while i <= NST:
            if i not in taken[side]:
                loc = on_step(x, i) if 0 <= i < NST else ((x, -0.7, 0.02) if i < 0 else (x, RUN + 0.7, H))
                crowd_figure(f"esc_c{n}", meshes[rnd.randrange(len(meshes))], (loc[0] + rnd.uniform(-0.2, 0.2), loc[1], loc[2]),
                             face + rnd.uniform(-12, 12))
                n += 1
            i += rnd.choice((2, 2, 3))
    # people on the concourse and the landing
    for k, (x, y, z, f) in enumerate(((-3.4, -2.5, 0, 160), (-4.6, 1.0, 0, 70), (3.6, -1.8, 0, -150), (4.4, 2.6, 0, -95),
                                      (2.6, -4.6, 0, 20), (-2.2, -5.4, 0, -10), (-3.2, RUN + 2.6, H, 30), (3.0, RUN + 3.4, H, -40),
                                      (4.2, RUN + 1.8, H, 200), (-4.4, RUN + 4.6, H, 120))):
        crowd_figure(f"esc_p{k}", meshes[(k * 3) % len(meshes)], (x, y, z), f)


def _bag(loc):
    leather = F.M("dana_bag", "#8A4B2E", "satin")
    F.rbox("dana_bag", (0.34, 0.13, 0.27), 0.04, leather, None, (loc[0] + 0.36, loc[1] - 0.04, loc[2] + 0.15), ink=0.004)
    F.torus("dana_bag_handle", 0.1, 0.012, leather, None, (loc[0] + 0.36, loc[1] - 0.04, loc[2] + 0.29), rot=(90, 0, 0), arc_deg=180, ink=None)


def build(mood):
    places = PLACES.get(mood, PLACES["dusk"])
    set_world("#3A3E70", 0.45)
    mats = {"step": F.M("esc_step", "#3E434B", "metal"), "edge": F.M("esc_edge", F.PAL["mustard"], "paint"),
            "comb": F.M("esc_comb", "#8E959E", "metal"), "glass": F.M_glass("esc_glass2", "#DCEFF4", 0.05), "deck": F.M("esc_deck", "#7D848D", "satin"),
            "rail": F.M("esc_rail", "#1E2026", "rubber"), "steel": F.M("esc_steel", "#C9CED6", "chrome"),
            "led": F.M_emit("esc_led", "#FFE2B8", 9.0), "stone": F.M("st_stone", "#D8C8B2", "paint"),
            "pilaster": F.M("st_pilaster", "#B9A68E", "satin"), "floor": F.M("st_floor", "#6E6660", "ceramic"),
            "slab": F.M("st_slab", "#ECE6DC", "paint"), "clad": F.M("esc_clad", "#EFEBE4", "satin"),
            "sconce": F.M_emit("st_sconce", "#FFC98A", 6.0)}
    _escalator("escL", XL, mats)
    _escalator("escR", XR, mats)
    for k, x in enumerate(BAL):
        _balustrade(f"bal{k}", x, mats)
    _hall(mats)
    _vault(F.M_glass("roof_glass", "#BFD8E2", 0.07), F.M("roof_rib", "#2C3038", "metal"))
    _sky()
    _city()
    _crowd(places)
    # light: the low sun through the roof, the two escalators lit the same, a rim from the top, a soft front fill
    F.add_light("sun", "SUN", (-30, 6, 16), 3.2, "#FFB27A", 0.03, target=(0, 3, 0))
    for x in (XL, XR):
        F.add_light(f"esc_top{x}", "AREA", (x, RUN / 2, H + 4.5), 700, "#FFD6A6", 3.0, target=(x, RUN / 2, H / 2))
    F.add_light("rim_top", "AREA", (0, RUN + 3.0, H + 3.0), 900, "#C9DCFF", 5.0, target=(0, 1.0, 1.4), shadow=False)
    F.add_light("fill_front", "AREA", (0, -6.5, 3.2), 380, "#FFE8D0", 6.0, target=(0, 3, 2.2), shadow=False)
    for sx in (-1, 1):
        F.add_light(f"concourse{sx}", "AREA", (sx * 4, -3, 7), 220, "#FFE0BF", 4.0, target=(sx * 4, -3, 0))
    marks = {"top": (0.0, RUN + 1.8, H), "bottom": (0.0, -2.6, 0.0)}
    for who, (side, step) in places.items():
        loc = _place(side, step)
        marks[who] = loc
        head = (loc[0], loc[1], loc[2] + 1.2)
        kx = -1.0 if side == "L" else 1.0
        F.add_light(f"{who}_key", "AREA", (head[0] + kx * 0.6, head[1] - 1.5, head[2] + 0.9), 75, "#FFF2E2", 1.2, target=head)
        F.add_light(f"{who}_rim", "AREA", (head[0] - kx * 0.8, head[1] + 1.2, head[2] + 0.6), 90, "#BFD6FF", 0.5, target=head, shadow=False)
        if who == "dana":
            _bag(loc)
    return marks
