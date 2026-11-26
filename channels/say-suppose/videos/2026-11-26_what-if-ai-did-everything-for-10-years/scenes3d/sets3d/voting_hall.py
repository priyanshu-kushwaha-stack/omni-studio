"""The voting hall, Year 10: a vast raked hall in cold flat light, thousands of black figures in rows facing the front,
every face ringed cyan, nobody talking. The plan floats at the front: a stack of pages taller than a person.
Moods: day (the hall waiting), bloom (every figure's card opens at once, the hall goes brighter).

The crowd is one low-detail figure mesh per coat colour, instanced on the seat points (vertex instancing), so thousands
of figures cost a few meshes. `crowd_mesh` and `set_world` are shared with the escalators set.
Marks: "you" (a gap in the middle rows), "stranger" (one row behind the last), "aisle" (the centre aisle, mid rows),
"front" (the floor before the stack), "stack" (the stack's centre)."""

import math
import random

import bmesh
import bpy
from mathutils import Matrix

import film3d as F

D2R = math.pi / 180.0

# ---------------------------------------------------------------- shared: a low-detail figure and the world colour

TOP, PANTS, SKIN, RING, WHITE, PUPIL, CARD, INK = range(8)


def _tag(res, idx):
    for f in {f for v in res["verts"] for f in v.link_faces}:
        f.material_index = idx


def _cone(bm, r1, r2, depth, loc, idx, seg=12, scale=(1, 1, 1), rot=None):
    m = Matrix.Translation(loc) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((*scale, 1.0))
    _tag(bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=depth, matrix=m), idx)


def _ball(bm, r, loc, idx, u=12, v=8, scale=(1, 1, 1)):
    m = Matrix.Translation(loc) @ Matrix.Diagonal((*scale, 1.0))
    _tag(bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r, matrix=m), idx)


def _box(bm, size, loc, idx, rot=None):
    m = Matrix.Translation(loc) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((*size, 1.0))
    _tag(bmesh.ops.create_cube(bm, size=1.0, matrix=m), idx)


def _ring(bm, c, r0, r1, idx, n=18, sz=1.18):
    ring = []
    for i in range(n):
        a = 2 * math.pi * i / n
        ring.append((bm.verts.new((c[0] + r1 * math.cos(a), c[1], c[2] + r1 * sz * math.sin(a))),
                     bm.verts.new((c[0] + r0 * math.cos(a), c[1], c[2] + r0 * sz * math.sin(a)))))
    for i in range(n):
        (o0, i0), (o1, i1) = ring[i], ring[(i + 1) % n]
        bm.faces.new((o0, o1, i1, i0)).material_index = idx


def crowd_mesh(name, top, pants="#2E3440", card=False, ring="#38DDF5"):
    """One ~1.5 m figure facing -Y, feet at z=0, head centre at 1.19 (the cast's proportions): black head, white eyes,
    a glowing lens ring round each eye; `card` adds Echo's card floating at chest height in front."""
    bm = bmesh.new()
    for sx in (1, -1):
        _cone(bm, 0.075, 0.064, 0.56, (sx * 0.085, 0, 0.30), PANTS, seg=10)
        _ball(bm, 0.07, (sx * 0.085, -0.04, 0.04), PANTS, scale=(1, 1.5, 0.6))
        _cone(bm, 0.058, 0.05, 0.48, (sx * 0.215, 0, 0.75), TOP, seg=10)
        _ball(bm, 0.05, (sx * 0.215, 0, 0.5), SKIN, u=8, v=6)
        _ball(bm, 0.052, (sx * 0.082, -0.226, 1.19), WHITE, u=10, v=6, scale=(1, 0.35, 1.15))
        _ball(bm, 0.026, (sx * 0.078, -0.245, 1.185), PUPIL, u=8, v=5, scale=(1, 0.3, 1.2))
        _ring(bm, (sx * 0.082, -0.25, 1.19), 0.058, 0.072, RING)
    _cone(bm, 0.2, 0.15, 0.44, (0, 0, 0.8), TOP, seg=16, scale=(1, 0.78, 1))
    _ball(bm, 0.165, (0, 0, 0.98), TOP, scale=(1.12, 0.78, 0.42))
    _cone(bm, 0.07, 0.07, 0.1, (0, 0, 1.03), SKIN, seg=10)
    _ball(bm, 0.245, (0, 0, 1.19), SKIN, u=18, v=12, scale=(1.04, 0.96, 0.98))
    if card:
        tilt = Matrix.Rotation(-22 * D2R, 4, "X")
        _box(bm, (0.30, 0.006, 0.19), (0.1, -0.42, 1.0), CARD, tilt)
        for k in range(3):
            _box(bm, (0.2 - 0.05 * (k % 2), 0.008, 0.012), (0.08, -0.425, 1.05 - k * 0.045), INK, tilt)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    mats = [F.M(f"crowd_top_{top}", top, "cloth"), F.M(f"crowd_pants_{pants}", pants, "cloth"), F.M("skin", F.SKIN, "skin"),
            F.M_emit("crowd_ring" + ring, ring, 2.2), F.M_flat("crowd_eye", "#F4F1EA", 0.3), F.M_flat("crowd_pupil", "#1C1612", 0.0),
            F.M("holo_card", "#5FE6FF", "glass", emit=1.2, emit_color="#5FE6FF", alpha=0.16), F.M_emit("holo_ink", "#9FF7FF", 6.0)]
    for m in mats:
        me.materials.append(m)
    return me


def crowd_figure(name, mesh, loc, facing=0.0):
    ob = F.link(bpy.data.objects.new(name, mesh))
    ob.location = loc
    ob.rotation_euler = (0, 0, facing * D2R)
    return ob


def crowd_field(name, mesh, points):
    """Instance `mesh` on every point (vertex instancing): thousands of figures for the cost of one."""
    pm = bpy.data.meshes.new(name + "_pts")
    pm.from_pydata([tuple(p) for p in points], [], [])
    par = F.link(bpy.data.objects.new(name + "_pts", pm))
    par.instance_type = "VERTS"
    child = F.link(bpy.data.objects.new(name, mesh))
    child.parent = par
    return par


def set_world(color, strength):
    """The runner picks a day or night world from the mood name; sets with their own moods set it here."""
    w = bpy.context.scene.world
    bg = [n for n in w.node_tree.nodes if n.type == "BACKGROUND"][0]
    bg.inputs["Color"].default_value = F.srgb(color)
    bg.inputs["Strength"].default_value = strength


# ---------------------------------------------------------------- the hall

COLS, ROWS, DX, DY, RISE = 84, 44, 0.78, 1.05, 0.2
COATS = ["#5D6B7C", "#7B828C", "#4F7473", "#8C8467", "#6B6380", "#3F4A5A"]


def seat(col, row):
    x = (col - (COLS - 1) / 2) * DX + (col // 21 - 1.5) * 1.4
    return (x, row * DY, row * RISE)


def _tiers(mat, edge):
    for r in range(ROWS + 2):
        top = r * RISE
        F.rbox(f"tier{r}", (74, DY, top + 0.6), 0, mat, None, (0, r * DY, (top - 0.6) / 2), ink=None)
        F.rbox(f"tier_edge{r}", (74, 0.03, 0.025), 0, edge, None, (0, r * DY - DY / 2 + 0.02, top - 0.02), ink=None)


def _hall(wall, fin, panel):
    back = (ROWS + 3) * DY
    F.rbox("hall_floor", (80, 30, 0.1), 0, M_floor(), None, (0, -14, -0.05), ink=None)
    for sx in (-1, 1):
        F.rbox(f"hall_wall{sx}", (0.4, back + 30, 30), 0, wall, None, (sx * 38, back / 2 - 14, 15), ink=None)
        for k in range(16):
            F.rbox(f"hall_fin{sx}_{k}", (1.2, 0.5, 30), 0, fin, None, (sx * 37.4, -26 + k * 5.2, 15), ink=None)
    F.rbox("hall_back", (80, 0.4, 30), 0, wall, None, (0, back, 15), ink=None)
    F.rbox("hall_front", (80, 0.4, 30), 0, wall, None, (0, -28, 15), ink=None)
    F.rbox("hall_ceiling", (80, back + 30, 0.4), 0, wall, None, (0, back / 2 - 14, 28), ink=None)
    for ix in range(-4, 5):
        for iy in range(9):
            F.rbox(f"ceil_panel{ix}_{iy}", (5.0, 1.0, 0.06), 0, panel, None, (ix * 7.5, -22 + iy * 8.0, 27.75), ink=None)
    # the front: a tall recessed panel behind the stage, lit from its edges
    F.rbox("front_recess", (22, 0.3, 18), 0, fin, None, (0, -27.6, 10), ink=None)
    for sx in (-1, 1):
        F.rbox(f"front_slot{sx}", (0.18, 0.2, 18), 0, panel, None, (sx * 11.2, -27.4, 10), ink=None)


def M_floor():
    return F.M("hall_floor", "#7D8792", "paint")


def _stack(glow):
    """Nine hundred pages: a floating stack taller than a person, cyan light underneath."""
    paper = F.M("plan_paper", "#F3F1EA", "paper")
    edge = F.M("plan_edge", "#D9D6CC", "paper")
    rnd = random.Random(900)
    z = 0.95
    root = F.empty("plan_stack", None, (0, -9.0, 0))
    for k in range(64):
        t = 0.034
        F.rbox(f"page{k}", (1.25, 0.92, t), 0.004, paper if k % 7 else edge, root,
               (rnd.uniform(-0.025, 0.025), rnd.uniform(-0.02, 0.02), z + t / 2), rot=(0, 0, rnd.uniform(-1.6, 1.6)), ink=None)
        z += t + 0.002
    F.rbox("dais", (7.0, 4.6, 0.36), 0.04, F.M("dais", "#AEB7C2", "satin"), None, (0, -9.0, 0.18), ink=None)
    F.torus("stack_glow", 0.9, 0.035, glow, None, (0, -9.0, 0.4), ink=None)
    F.cyl("stack_pool", 0.85, 0.01, F.M_emit("stack_pool", "#3FC9E6", 1.2), None, (0, -9.0, 0.37), ink=None)
    frame = F.M_emit("stack_frame", "#7FF3FF", 3.0)
    for name, size, loc in (("l", (0.08, 0.1, 4.4), (-1.8, -11.6, 2.6)), ("r", (0.08, 0.1, 4.4), (1.8, -11.6, 2.6)),
                            ("t", (3.68, 0.1, 0.08), (0, -11.6, 4.8)), ("b", (3.68, 0.1, 0.08), (0, -11.6, 0.4))):
        F.rbox(f"stack_frame_{name}", size, 0, frame, None, loc, ink=None)
    F.add_light("stack_under", "POINT", (0, -9.0, 0.7), 260, "#7FF3FF", 0.4)
    F.add_light("stack_key", "AREA", (-3.5, -3.0, 6.0), 900, "#E8F0F8", 3.0, target=(0, -9.0, 2.0))
    return z


def build(mood):
    bloom = mood == "bloom"
    set_world("#C9D6E2" if not bloom else "#D6E6F2", 0.9 if not bloom else 1.25)
    conc = F.M("hall_tier", "#98A2AD", "paint")
    edge = F.M_emit("tier_edge", "#D6E8F5", 1.6 if not bloom else 2.4)
    wall = F.M("hall_wall", "#B9C3CD", "paint")
    fin = F.M("hall_fin", "#A3ADB8", "satin")
    panel = F.M_emit("hall_panel", "#EEF5FB", 6.0 if not bloom else 8.0)
    _tiers(conc, edge)
    _hall(wall, fin, panel)
    top = _stack(F.M_emit("stack_glow", "#7FF3FF", 8.0))
    you_seat, stranger_seat = (37, 16), (55, ROWS)
    rnd = random.Random(10)
    fields = [[] for _ in COATS]
    for r in range(ROWS):
        for c in range(COLS):
            if (c, r) == you_seat:
                continue
            x, y, z = seat(c, r)
            fields[rnd.randrange(len(COATS))].append((x + rnd.uniform(-0.06, 0.06), y + rnd.uniform(-0.08, 0.08), z))
    for k, (coat, pts) in enumerate(zip(COATS, fields, strict=True)):
        crowd_field(f"crowd{k}", crowd_mesh(f"crowd_fig{k}", coat, card=bloom), pts)
    # cold flat light: a soft sun with no shadows, and broad panels overhead
    F.add_light("hall_sun", "SUN", (0, 0, 40), 2.2 if not bloom else 3.0, "#E9F1F8", 0.6, target=(0.3, 2.0, 0), shadow=False)
    F.add_light("hall_front_fill", "AREA", (0, -14, 14), 8000, "#E2ECF5", 30.0, target=(0, 20, 2), shadow=False)
    you = seat(*you_seat)
    head = (you[0], you[1], you[2] + 1.2)
    F.add_light("you_key", "AREA", (head[0] - 1.1, head[1] - 1.7, head[2] + 1.0), 140, "#F2F6FA", 1.4, target=head)
    F.add_light("you_rim", "AREA", (head[0] + 0.9, head[1] + 1.3, head[2] + 0.5), 110, "#BFE6FF", 0.5, target=head, shadow=False)
    st = seat(*stranger_seat)
    sh = (st[0], st[1], st[2] + 1.2)
    F.add_light("stranger_rim", "AREA", (sh[0] - 0.8, sh[1] + 1.4, sh[2] + 0.8), 120, "#DDE8F2", 0.6, target=sh, shadow=False)
    F.add_light("stranger_key", "AREA", (sh[0] + 1.6, sh[1] - 1.2, sh[2] + 0.6), 70, "#E8EEF4", 1.2, target=sh)
    a, b = seat(41, 22), seat(42, 22)
    return {"you": you, "stranger": st, "aisle": ((a[0] + b[0]) / 2, a[1], a[2]), "front": (0.0, -5.5, 0.0),
            "stack": (0.0, -9.0, (0.95 + top) / 2), "stack_top": (0.0, -9.0, top)}
