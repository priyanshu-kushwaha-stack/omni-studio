"""Say Suppose 3D look test: the diner, built from primitives in Blender (Eevee).

Run headless:
    blender -b --factory-startup -P diner3d.py -- --look A --shot opening --out renders/look3d/a.png

Arguments (after "--"):
    --look   A | B          A: black heads and skin, identity in clothes. B: heads in the channel's colours.
    --shot   opening | day  opening: the thumbnail's moment at night. day: Marco and a robot at the grill.
    --mood   night | day    defaults to the shot's own mood.
    --frame  N              still frame (default: the shot's key frame).
    --frames A B            render an animation range as a PNG sequence into --out (a folder).
    --res    WxH            default 1280x720.
    --samples N             Eevee samples (default 64).
    --save   path.blend     also save the built scene.

Everything is code: no downloaded models, no image textures, no AI images. Faces are held expressions
(no lip-sync, no wobble). Figures are rigid toy parts on joint empties, posable by joint angles.
"""

import argparse
import warnings
import math
import sys

import bmesh
import bpy
from mathutils import Euler, Vector

warnings.filterwarnings("ignore", category=DeprecationWarning)

# ----------------------------------------------------------------------------- args


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--look", default="A", choices=["A", "B"])
    p.add_argument("--shot", default="opening", choices=["opening", "day"])
    p.add_argument("--mood", default=None, choices=[None, "night", "day"])
    p.add_argument("--frame", type=int, default=None)
    p.add_argument("--frames", type=int, nargs=2, default=None)
    p.add_argument("--res", default="1280x720")
    p.add_argument("--samples", type=int, default=64)
    p.add_argument("--out", required=True)
    p.add_argument("--save", default=None)
    a = p.parse_args(argv)
    if a.mood is None:
        a.mood = "night" if a.shot == "opening" else "day"
    return a


ARGS = parse_args()
D2R = math.pi / 180.0

# ----------------------------------------------------------------------------- colour + materials


def srgb(h):
    h = h.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i : i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (out[0], out[1], out[2], 1.0)


PAL = {
    "mustard": "#F2B132",
    "teal": "#17A091",
    "teal_dark": "#0E6E64",
    "crimson": "#D0343F",
    "cream": "#F1E6CF",
    "white": "#F4F1EA",
    "black": "#0B0B0D",
    "charcoal": "#2A2C33",
    "navy": "#253049",
    "pale_blue": "#9CC4E4",
    "peach": "#F4A987",
    "grey_blue": "#7F93B0",
    "sage": "#9FBF8A",
    "steel": "#AEB7C2",
    "steel_dark": "#5E6772",
    "chrome": "#D9DEE4",
    "screen": "#0C1A2A",
    "cyan": "#5FE3FF",
    "bun": "#E09A3E",
    "patty": "#5A2E1C",
    "cheese": "#F7C531",
    "lettuce": "#63B548",
    "tomato": "#E0473A",
    "cash": "#7FC77A",
    "cash_dark": "#3E8E4B",
    "rim": "#FFF4DE",
}

MATS = {}


def principled(node_tree):
    for n in node_tree.nodes:
        if n.type == "BSDF_PRINCIPLED":
            return n
    return node_tree.nodes.new("ShaderNodeBsdfPrincipled")


def mat(name, color, rough=0.45, metal=0.0, emit=None, emit_strength=0.0, coat=0.0, alpha=1.0, spec=0.5):
    key = name
    if key in MATS:
        return MATS[key]
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = principled(m.node_tree)
    col = srgb(color) if isinstance(color, str) else color
    b.inputs["Base Color"].default_value = col
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Specular IOR Level"].default_value = spec
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.15
    if emit is not None:
        ec = srgb(emit) if isinstance(emit, str) else emit
        b.inputs["Emission Color"].default_value = ec
        b.inputs["Emission Strength"].default_value = emit_strength
    if alpha < 1.0:
        b.inputs["Alpha"].default_value = alpha
        m.surface_render_method = "BLENDED"
    m.diffuse_color = col
    MATS[key] = m
    return m


def outline_mat(color="rim", strength=1.4):
    """Inverted-hull rim: emissive, back-face culled, invisible to shadow rays."""
    key = "outline_" + color
    if key in MATS:
        return MATS[key]
    m = bpy.data.materials.new(key)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = [n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"][0]
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = srgb(PAL[color])
    em.inputs["Strength"].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    lp = nt.nodes.new("ShaderNodeLightPath")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Shadow Ray"], mix.inputs["Fac"])
    nt.links.new(em.outputs[0], mix.inputs[1])
    nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    m.use_backface_culling = True
    m.use_backface_culling_shadow = True if hasattr(m, "use_backface_culling_shadow") else False
    MATS[key] = m
    return m


def checker_mat(name, c1, c2, scale):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    b = principled(nt)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    ck = nt.nodes.new("ShaderNodeTexChecker")
    ck.inputs["Scale"].default_value = scale
    ck.inputs["Color1"].default_value = srgb(c1)
    ck.inputs["Color2"].default_value = srgb(c2)
    nt.links.new(tc.outputs["Object"], ck.inputs["Vector"])
    nt.links.new(ck.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.28
    b.inputs["Coat Weight"].default_value = 0.3
    return m


def gradient_sky_mat(name, top, bottom, strength):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = [n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"][0]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = srgb(bottom)
    ramp.color_ramp.elements[1].color = srgb(top)
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[1].position = 0.6
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = strength
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    return m


# ----------------------------------------------------------------------------- mesh helpers

COL = None


def link(ob):
    COL.objects.link(ob)
    return ob


def empty(name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), mode="XYZ"):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_size = 0.05
    ob.parent = parent
    ob.location = loc
    ob.rotation_mode = mode
    ob.rotation_euler = Euler([r * D2R for r in rot], "XYZ")
    return link(ob)


def mesh_obj(name, bm, material=None, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), smooth=True):
    me = bpy.data.meshes.new(name)
    for f in bm.faces:
        f.smooth = smooth
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    if material is not None:
        me.materials.append(material)
    ob.parent = parent
    ob.location = loc
    ob.rotation_euler = Euler([r * D2R for r in rot], "XYZ")
    ob.scale = scale
    return link(ob)


def sphere(name, r, material, parent=None, loc=(0, 0, 0), scale=(1, 1, 1), rot=(0, 0, 0), segs=40):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=segs // 2, radius=r)
    return mesh_obj(name, bm, material, parent, loc, rot, scale)


def capsule(name, r, length, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), segs=28):
    """Top sphere centre at the origin (the joint), bottom sphere centre at z=-length."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=16, radius=r)
    for v in bm.verts:
        if v.co.z < -1e-6:
            v.co.z -= length
    return mesh_obj(name, bm, material, parent, loc, rot, scale)


def cyl(name, r, depth, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), r2=None, segs=40, bevel=0.0, smooth=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    ob = mesh_obj(name, bm, material, parent, loc, rot, smooth=smooth)
    if bevel > 0:
        add_bevel(ob, bevel, 3)
    return ob


def add_bevel(ob, width, segments=4):
    m = ob.modifiers.new("bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = 40 * D2R
    m.harden_normals = True
    return m


def rbox(name, size, radius, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), segments=4):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
    ob = mesh_obj(name, bm, material, parent, loc, rot)
    if radius > 0:
        m = ob.modifiers.new("bevel", "BEVEL")
        m.width = min(radius, min(size) * 0.49)
        m.segments = segments
        m.limit_method = "NONE"
        m.harden_normals = True
    return ob


def torus(name, R, r, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), nu=40, nv=16):
    bm = bmesh.new()
    rings = []
    for i in range(nu):
        a = 2 * math.pi * i / nu
        ring = []
        for j in range(nv):
            b = 2 * math.pi * j / nv
            x = (R + r * math.cos(b)) * math.cos(a)
            y = (R + r * math.cos(b)) * math.sin(a)
            z = r * math.sin(b)
            ring.append(bm.verts.new((x, y, z)))
        rings.append(ring)
    for i in range(nu):
        for j in range(nv):
            a, b = rings[i][j], rings[(i + 1) % nu][j]
            c, d = rings[(i + 1) % nu][(j + 1) % nv], rings[i][(j + 1) % nv]
            bm.faces.new((a, b, c, d))
    return mesh_obj(name, bm, material, parent, loc, rot, scale)


def add_outline(ob, thickness, color="rim", strength=1.4):
    if ob.type != "MESH":
        return
    me = ob.data
    me.materials.append(outline_mat(color, strength))
    s = ob.modifiers.new("outline", "SOLIDIFY")
    s.thickness = thickness
    s.offset = 1.0
    s.use_flip_normals = True
    s.use_rim = False
    s.use_even_offset = True
    s.material_offset = len(me.materials) - 1


def outline_tree(root, thickness, color="rim", skip=("face_",), strength=1.4):
    for ob in [root] + list(root.children_recursive):
        if ob.type == "MESH" and not any(ob.name.startswith(s) or ("." + s) in ob.name or ("/" + s) in ob.name for s in skip):
            if ob.get("no_outline"):
                continue
            add_outline(ob, thickness, color, strength)


# ----------------------------------------------------------------------------- flat 2D shapes (faces, screens)


def convex2d(c, a, b, rot=0.0, clips=(), rings=5, segs=40):
    """Ellipse (centre c, radii a, b, rotated) cut by half-planes n.(p-c) <= cc. Returns verts, faces."""
    cu, cv = c
    cr, sr = math.cos(rot), math.sin(rot)
    radii = []
    for k in range(segs):
        th = 2 * math.pi * k / segs
        dx, dy = math.cos(th), math.sin(th)
        lx, ly = dx * cr + dy * sr, -dx * sr + dy * cr
        t = 1.0 / math.sqrt((lx / a) ** 2 + (ly / b) ** 2)
        for nx, ny, cc in clips:
            nd = nx * dx + ny * dy
            if nd > 1e-6:
                t = min(t, cc / nd)
        radii.append((dx, dy, t))
    verts = [(cu, cv)]
    for ri in range(1, rings + 1):
        f = ri / rings
        for dx, dy, t in radii:
            verts.append((cu + dx * t * f, cv + dy * t * f))
    faces = []
    for k in range(segs):
        faces.append((0, 1 + k, 1 + (k + 1) % segs))
    for ri in range(1, rings):
        b0, b1 = 1 + (ri - 1) * segs, 1 + ri * segs
        for k in range(segs):
            k1 = (k + 1) % segs
            faces.append((b0 + k, b1 + k, b1 + k1, b0 + k1))
    return verts, faces


def ribbon2d(points, width, taper=0.55):
    verts, faces = [], []
    n = len(points)
    for i, (x, y) in enumerate(points):
        if i == 0:
            tx, ty = points[1][0] - x, points[1][1] - y
        elif i == n - 1:
            tx, ty = x - points[i - 1][0], y - points[i - 1][1]
        else:
            tx, ty = points[i + 1][0] - points[i - 1][0], points[i + 1][1] - points[i - 1][1]
        ln = math.hypot(tx, ty) or 1.0
        nx, ny = -ty / ln, tx / ln
        s = i / (n - 1)
        w = width * 0.5 * (taper + (1 - taper) * math.sin(math.pi * s) ** 0.5)
        verts.append((x + nx * w, y + ny * w))
        verts.append((x - nx * w, y - ny * w))
    for i in range(n - 1):
        faces.append((2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2))
    # round caps
    for i in (0, n - 1):
        x, y = points[i]
        w = math.dist(verts[2 * i], verts[2 * i + 1]) * 0.5
        cv, cf = convex2d((x, y), w, w, rings=1, segs=16)
        off = len(verts)
        verts.extend(cv)
        faces.extend([tuple(off + j for j in f) for f in cf])
    return verts, faces


def arc(c, r, a0, a1, n=24, sy=1.0):
    return [(c[0] + r * math.cos((a0 + (a1 - a0) * i / (n - 1)) * D2R), c[1] + sy * r * math.sin((a0 + (a1 - a0) * i / (n - 1)) * D2R)) for i in range(n)]


def shape_mesh(name, verts2d, faces, mapper, material, parent):
    bm = bmesh.new()
    bv = [bm.verts.new(mapper(u, v)) for (u, v) in verts2d]
    for f in faces:
        try:
            bm.faces.new([bv[i] for i in f])
        except ValueError:
            pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = mesh_obj(name, bm, material, parent, smooth=True)
    ob["no_outline"] = True
    return ob


def sphere_mapper(R, off):
    def m(u, v):
        u, v = u * R, v * R
        rr = (R + off) ** 2 - u * u - v * v
        return (u, -math.sqrt(max(rr, 1e-6)), v)

    return m


# ----------------------------------------------------------------------------- faces


def expression(name, gaze=(0.0, 0.0)):
    """Features in head-radius units, u = viewer's right, v = up. Returns list of (kind, role, layer, data)."""
    f = []
    gx, gy = gaze
    E = 0.34  # eye spacing

    def eyes(a, b, clipsL=(), clipsR=(), cv=0.08, pupil=0.085, rot=0.0):
        for side, clips in ((1, clipsL), (-1, clipsR)):
            ce = (side * E, cv)
            f.append(("convex", "eye", 0, dict(c=ce, a=a, b=b, rot=side * rot, clips=clips)))
            cp = (ce[0] + gx * (a - pupil) * 0.8, ce[1] + gy * (b - pupil) * 0.8)
            pc = [(nx, ny, cc - (nx * (cp[0] - ce[0]) + ny * (cp[1] - ce[1]))) for nx, ny, cc in clips]
            f.append(("convex", "pupil", 1, dict(c=cp, a=pupil, b=pupil * 1.08, clips=pc)))
            cg = (cp[0] + pupil * 0.38, cp[1] + pupil * 0.42)
            f.append(("convex", "glint", 2, dict(c=cg, a=pupil * 0.32, b=pupil * 0.32, clips=())))

    if name == "stunned":
        eyes(0.205, 0.265, pupil=0.088)
        for s in (1, -1):
            f.append(("ribbon", "brow", 0, dict(pts=arc((s * 0.36, 0.30), 0.16, 60 if s > 0 else 120, 120 if s > 0 else 60), w=0.075)))
        f.append(("convex", "mouth", 0, dict(c=(0, -0.34), a=0.25, b=0.24, clips=[(0, 1, 0.035)])))
        f.append(("convex", "tongue", 1, dict(c=(0, -0.50), a=0.13, b=0.07, clips=[])))
    elif name == "happy":
        cl = [(0, -1, 0.10)]
        eyes(0.17, 0.215, clipsL=cl, clipsR=cl, pupil=0.08)
        for s in (1, -1):
            f.append(("ribbon", "brow", 0, dict(pts=arc((s * 0.34, 0.26), 0.15, 65 if s > 0 else 115, 115 if s > 0 else 65), w=0.07)))
        f.append(("ribbon", "mouth", 0, dict(pts=arc((0, -0.12), 0.27, 215, 325), w=0.085)))
    elif name == "worried":
        eyes(0.18, 0.23, pupil=0.082, cv=0.06)
        for s in (1, -1):
            f.append(("ribbon", "brow", 0, dict(pts=[(s * 0.18, 0.43), (s * 0.34, 0.39), (s * 0.50, 0.31)], w=0.075)))
        pts = [(-0.17 + 0.34 * i / 23, -0.40 + 0.025 * math.sin(i / 23 * 2 * math.pi * 1.5)) for i in range(24)]
        f.append(("ribbon", "mouth", 0, dict(pts=pts, w=0.07)))
    elif name == "sly":
        n = (0.18, 1.0)
        ln = math.hypot(*n)
        clL = [(n[0] / ln, n[1] / ln, 0.035)]
        clR = [(-n[0] / ln, n[1] / ln, 0.035)]
        eyes(0.18, 0.22, clipsL=clL, clipsR=clR, pupil=0.08)
        f.append(("ribbon", "brow", 0, dict(pts=arc((-0.36, 0.22), 0.17, 60, 125), w=0.075)))
        f.append(("ribbon", "brow", 0, dict(pts=[(0.20, 0.30), (0.36, 0.31), (0.52, 0.27)], w=0.075)))
        f.append(("ribbon", "mouth", 0, dict(pts=arc((0.10, -0.20), 0.22, 230, 300), w=0.075)))
    return f


def build_face(head_obj, R, expr, look, gaze=(0, 0)):
    if look == "A":
        roles = {"eye": "face_white", "pupil": "face_black", "glint": "face_white", "brow": "face_white", "mouth": "face_white", "tongue": None}
    else:
        roles = {"eye": "face_black", "pupil": None, "glint": "face_white", "brow": "face_black", "mouth": "face_black", "tongue": "face_tongue"}
    mats = {
        "face_white": mat("face_white", "#FFFFFF", rough=0.6, emit="#FFFFFF", emit_strength=0.55),
        "face_black": mat("face_black", "#08080A", rough=0.5),
        "face_tongue": mat("face_tongue", "#E8707A", rough=0.5),
    }
    for i, (kind, role, layer, d) in enumerate(expression(expr, gaze)):
        mname = roles.get(role)
        if mname is None:
            continue
        if look == "B" and role == "glint":
            layer = 1
        mapper = sphere_mapper(R, 0.0025 + 0.0022 * layer)
        if kind == "convex":
            vs, fs = convex2d(d["c"], d["a"], d["b"], d.get("rot", 0.0), d.get("clips", ()))
        else:
            vs, fs = ribbon2d(d["pts"], d["w"])
        shape_mesh(f"face_{head_obj.name}_{i}_{role}", vs, fs, mapper, mats[mname], head_obj)


# ----------------------------------------------------------------------------- people

LOOK = ARGS.look
SKIN_A = "#0A0A0C"


def skin_of(spec):
    return SKIN_A if LOOK == "A" else spec["head"]


def person(name, spec, loc=(0, 0, 0), facing=0.0):
    """A toy figure on joint empties. Joints: hips, spine, neck, head, sh_L/R, el_L/R, wr_L/R, hip_L/R, kn_L/R."""
    sk = mat(f"skin_{name}", skin_of(spec), rough=0.38, coat=0.35, spec=0.6)
    top = mat(f"top_{name}", spec["top"], rough=0.7)
    sleeve = top
    pants = mat(f"pants_{name}", spec.get("pants", PAL["navy"]), rough=0.75)
    shoes = mat(f"shoes_{name}", spec.get("shoes", PAL["crimson"]), rough=0.45, coat=0.4)
    J = {}
    root = empty(name, loc=loc, rot=(0, 0, facing))
    J["root"] = root
    J["hips"] = hips = empty(f"{name}_hips", root, (0, 0, 0.82))
    rbox(f"{name}_pelvis", (0.40, 0.27, 0.20), 0.09, pants, hips, (0, 0, -0.02))
    J["spine"] = spine = empty(f"{name}_spine", hips, (0, 0, 0.06))
    rbox(f"{name}_torso", (0.46, 0.30, 0.50), 0.12, top, spine, (0, 0, 0.24))
    J["neck"] = neck = empty(f"{name}_neck", spine, (0, 0, 0.50))
    cyl(f"{name}_neckcyl", 0.075, 0.12, sk, neck, (0, 0, 0.03))
    J["head"] = hj = empty(f"{name}_headj", neck, (0, 0, 0.05))
    R = 0.30
    head = sphere(f"{name}_head", R, sk, hj, (0, 0, R - 0.02), segs=48)
    J["headmesh"] = head
    for side, sx in (("L", 1), ("R", -1)):
        sh = J["sh_" + side] = empty(f"{name}_sh_{side}", spine, (sx * 0.27, 0, 0.42), mode="YXZ")
        sphere(f"{name}_shoulder_{side}", 0.085, sleeve, sh)
        capsule(f"{name}_uarm_{side}", 0.074, 0.27, sleeve, sh)
        el = J["el_" + side] = empty(f"{name}_el_{side}", sh, (0, 0, -0.28), mode="YXZ")
        capsule(f"{name}_farm_{side}", 0.066 if spec.get("long_sleeves", True) else 0.06, 0.22, sleeve if spec.get("long_sleeves", True) else sk, el)
        if spec.get("long_sleeves", True):
            cyl(f"{name}_cuff_{side}", 0.072, 0.05, mat(f"cuff_{name}", spec.get("cuff", spec["top"]), rough=0.75), el, (0, 0, -0.22))
        wr = J["wr_" + side] = empty(f"{name}_wr_{side}", el, (0, 0, -0.25), mode="YXZ")
        hand(f"{name}_hand_{side}", sk, wr, sx)
        hp = J["hip_" + side] = empty(f"{name}_hip_{side}", hips, (sx * 0.11, 0, -0.06), mode="YXZ")
        capsule(f"{name}_thigh_{side}", 0.088, 0.33, pants, hp)
        kn = J["kn_" + side] = empty(f"{name}_kn_{side}", hp, (0, 0, -0.35))
        capsule(f"{name}_shin_{side}", 0.078, 0.30, pants, kn)
        an = J["an_" + side] = empty(f"{name}_an_{side}", kn, (0, 0, -0.33))
        rbox(f"{name}_shoe_{side}", (0.15, 0.27, 0.11), 0.05, shoes, an, (0, -0.045, -0.025))
    # clothing extras
    if spec.get("hood"):
        sphere(f"{name}_hood", 0.2, top, spine, (0, 0.16, 0.52), scale=(1.05, 0.55, 0.55))
    if spec.get("apron"):
        am = mat(f"apron_{name}", spec.get("apron_color", PAL["white"]), rough=0.75)
        rbox(f"{name}_apronbib", (0.27, 0.035, 0.30), 0.04, am, spine, (0, -0.158, 0.27))
        rbox(f"{name}_apron", (0.42, 0.035, 0.44), 0.04, am, spine, (0, -0.162, -0.05))
        rbox(f"{name}_apronpocket", (0.22, 0.02, 0.11), 0.02, am, spine, (0, -0.182, 0.0))
        torus(f"{name}_apronstrap", 0.155, 0.012, am, spine, (0, -0.02, 0.47), rot=(-12, 0, 0))
    if spec.get("waist_apron"):
        am = mat(f"wapron_{name}", spec.get("apron_color", PAL["white"]), rough=0.75)
        rbox(f"{name}_wapron", (0.38, 0.03, 0.30), 0.03, am, spine, (0, -0.16, -0.08))
    if spec.get("skirt"):
        sm = mat(f"skirt_{name}", spec["skirt"], rough=0.7)
        cyl(f"{name}_skirt", 0.25, 0.30, sm, hips, (0, 0, -0.12), r2=0.21, bevel=0.03)
    if spec.get("scarf"):
        scm = mat(f"scarf_{name}", spec["scarf"], rough=0.8)
        torus(f"{name}_scarf", 0.15, 0.065, scm, spine, (0, 0, 0.50), scale=(1.0, 0.85, 1.0))
        rbox(f"{name}_scarftail", (0.11, 0.05, 0.42), 0.04, scm, spine, (0.13, -0.17, 0.26), rot=(6, 0, -4))
    if spec.get("tuft"):
        hm = mat(f"hair_{name}", spec.get("hair", PAL["black"]), rough=0.5, coat=0.3)
        for i in range(5):
            t = i / 4
            sphere(f"{name}_tuft{i}", 0.07 * (1 - 0.6 * t), hm, head, (0.02 - 0.04 * t, 0.0, R + 0.03 + 0.11 * t - 0.05 * t * t), segs=24)
    if spec.get("bun"):
        hm = mat(f"hair_{name}", spec.get("hair", "#6B3A2A"), rough=0.6, coat=0.2)
        sphere(f"{name}_bob", R * 1.04, hm, head, (0, 0.05, 0.03), scale=(1.0, 0.9, 1.0))
        sphere(f"{name}_bun", 0.11, hm, head, (0, 0.12, R + 0.02))
    if spec.get("paper_hat"):
        pm = mat("paper", PAL["white"], rough=0.85)
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=3, radius1=0.19, radius2=0.19, depth=0.46)
        hat = mesh_obj(f"{name}_paperhat", bm, pm, head, (0.0, 0.0, R - 0.02), rot=(0, 90, 0), scale=(1, 0.42, 1), smooth=False)
        hat.rotation_euler = Euler((math.radians(-90), 0, math.radians(14)), "XYZ")
        hat.location = (0.03, 0.0, R + 0.03)
        cyl(f"{name}_hatband", R * 0.86, 0.06, pm, head, (0, 0, R * 0.62), bevel=0.01)
    if spec.get("cap"):
        cm = mat(f"cap_{name}", spec["cap"], rough=0.6)
        sphere(f"{name}_cap", R * 1.03, cm, head, (0, 0.0, 0.05), scale=(1, 1, 0.75))
        rbox(f"{name}_capbill", (0.26, 0.2, 0.03), 0.015, cm, head, (0, -0.30, R * 0.55), rot=(-8, 0, 0))
    if spec.get("pencil"):
        pe = mat("pencil", "#F5C431", rough=0.5)
        pen = cyl(f"{name}_pencil", 0.02, 0.34, pe, head, (-R * 0.93, -0.04, 0.12), segs=6)
        pen.rotation_euler = Euler((math.radians(62), math.radians(28), 0), "XYZ")
        tip = mat("pencil_tip", "#2A2A2A", rough=0.5)
        cyl(f"{name}_pencil_tip", 0.02, 0.05, tip, pen, (0, 0, 0.19), r2=0.002, segs=6)
        sphere(f"{name}_eraser", 0.021, mat("eraser", "#F08CA0", rough=0.6), pen, (0, 0, -0.17), segs=12)
    if spec.get("collar"):
        torus(f"{name}_collar", 0.13, 0.04, top, spine, (0, 0, 0.50))
    J["R"] = R
    return J


def hand(name, sk, wr, sx):
    palm = sphere(name, 0.07, sk, wr, (0, 0, -0.07), scale=(1.0, 0.72, 1.15), segs=28)
    for i in range(4):
        x = -0.042 + 0.028 * i
        capsule(f"{name}_f{i}", 0.02, 0.035 + 0.01 * (1.5 - abs(i - 1.5)), sk, wr, (x, -0.005, -0.12))
    capsule(f"{name}_thumb", 0.022, 0.05, sk, wr, (sx * -0.05, -0.03, -0.05), rot=(20, sx * 40, 0))
    return palm


def arm(J, side, abduct=0, flex=0, twist=0, elbow=0, elbow_up=0, wrist=(0, 0, 0)):
    s = 1 if side == "L" else -1
    J["sh_" + side].rotation_euler = Euler((-flex * D2R, -s * abduct * D2R, s * twist * D2R))
    J["el_" + side].rotation_euler = Euler((-elbow * D2R, -s * elbow_up * D2R, 0))
    J["wr_" + side].rotation_euler = Euler((wrist[0] * D2R, -s * wrist[1] * D2R, s * wrist[2] * D2R))


def leg(J, side, flex=0, abduct=0, knee=0, ankle=0):
    s = 1 if side == "L" else -1
    J["hip_" + side].rotation_euler = Euler((-flex * D2R, -s * abduct * D2R, 0))
    J["kn_" + side].rotation_euler = Euler((knee * D2R, 0, 0))
    J["an_" + side].rotation_euler = Euler((ankle * D2R, 0, 0))


def key_joints(J, frame, names):
    for n in names:
        J[n].keyframe_insert("rotation_euler", frame=frame)


ARM_JOINTS = ["sh_L", "el_L", "wr_L", "sh_R", "el_R", "wr_R"]


def sit(J):
    for s in ("L", "R"):
        leg(J, s, flex=88, abduct=6, knee=92)


# ----------------------------------------------------------------------------- robots, food, cash

ROBOT_BODY = None


def robot(name, loc=(0, 0, 0), facing=0.0):
    steel = mat("robot_steel", PAL["steel"], rough=0.32, metal=0.65, coat=0.3)
    dark = mat("robot_dark", PAL["steel_dark"], rough=0.4, metal=0.6)
    scr = mat("robot_screen", PAL["screen"], rough=0.2, emit="#10283F", emit_strength=0.6, coat=0.8)
    cyan = mat("robot_cyan", PAL["cyan"], rough=0.3, emit=PAL["cyan"], emit_strength=9.0)
    bulb = mat("robot_bulb", PAL["mustard"], rough=0.3, emit=PAL["mustard"], emit_strength=6.0)
    J = {}
    root = J["root"] = empty(name, loc=loc, rot=(0, 0, facing))
    for sx in (1, -1):
        capsule(f"{name}_leg{sx}", 0.075, 0.42, dark, root, (sx * 0.14, 0, 0.55))
        rbox(f"{name}_foot{sx}", (0.17, 0.26, 0.09), 0.04, dark, root, (sx * 0.14, -0.04, 0.05))
    body = J["body"] = empty(f"{name}_bodyj", root, (0, 0, 0.62))
    rbox(f"{name}_body", (0.58, 0.42, 0.62), 0.14, steel, body, (0, 0, 0.31))
    rbox(f"{name}_chest", (0.30, 0.03, 0.15), 0.04, scr, body, (0, -0.21, 0.36))
    sphere(f"{name}_chestlight", 0.035, cyan, body, (0, -0.225, 0.36), scale=(1, 0.5, 1))
    cyl(f"{name}_neck", 0.06, 0.1, dark, body, (0, 0, 0.66))
    head = J["head"] = empty(f"{name}_headj", body, (0, 0, 0.70))
    rbox(f"{name}_headbox", (0.56, 0.38, 0.42), 0.12, steel, head, (0, 0, 0.21))
    rbox(f"{name}_screen", (0.44, 0.04, 0.30), 0.08, scr, head, (0, -0.18, 0.21))
    yfront = -0.2005

    def mp(u, v):
        return (u, yfront - 0.001, 0.21 + v)

    for s in (1, -1):
        vs, fs = ribbon2d(arc((s * 0.095, -0.035), 0.06, 20, 160, n=20), 0.034, taper=0.8)
        shape_mesh(f"face_{name}_arc{s}", vs, fs, mp, cyan, head)
    for sx in (1, -1):
        cyl(f"{name}_ear{sx}", 0.06, 0.05, dark, head, (sx * 0.29, 0, 0.21), rot=(0, 90, 0), bevel=0.01)
    cyl(f"{name}_antenna", 0.012, 0.16, dark, head, (0, 0, 0.48))
    sphere(f"{name}_bulb", 0.035, bulb, head, (0, 0, 0.57))
    for side, sx in (("L", 1), ("R", -1)):
        sh = J["sh_" + side] = empty(f"{name}_sh_{side}", body, (sx * 0.33, 0, 0.48), mode="YXZ")
        sphere(f"{name}_shball_{side}", 0.07, dark, sh)
        capsule(f"{name}_uarm_{side}", 0.05, 0.28, steel, sh)
        el = J["el_" + side] = empty(f"{name}_el_{side}", sh, (0, 0, -0.29), mode="YXZ")
        sphere(f"{name}_elball_{side}", 0.055, dark, el)
        capsule(f"{name}_farm_{side}", 0.046, 0.25, steel, el)
        wr = J["wr_" + side] = empty(f"{name}_wr_{side}", el, (0, 0, -0.27), mode="YXZ")
        sphere(f"{name}_grip_{side}", 0.06, dark, wr, (0, 0, -0.03), scale=(1, 0.8, 1))
    # spatula in the left hand (viewer's right)
    sp = J["spatula"] = empty(f"{name}_spatula", J["wr_L"], (0, 0, -0.05), rot=(0, 0, 0))
    chrome = mat("chrome", PAL["chrome"], rough=0.15, metal=1.0)
    cyl(f"{name}_sphandle", 0.016, 0.22, mat("handle", "#2B2B2B", rough=0.5), sp, (0, 0, -0.08))
    rbox(f"{name}_spblade", (0.17, 0.2, 0.012), 0.006, chrome, sp, (0, -0.10, -0.2), rot=(0, 0, 0))
    J["blade"] = empty(f"{name}_bladetop", sp, (0, -0.10, -0.19))
    return J


def robot_arm(J, side, abduct=0, flex=0, elbow=0, elbow_up=0, wrist=(0, 0, 0)):
    arm(J, side, abduct, flex, 0, elbow, elbow_up, wrist)


def burger(name, parent=None, loc=(0, 0, 0), s=1.0):
    root = empty(name, parent, loc)
    bun = mat("bun", PAL["bun"], rough=0.55, coat=0.25)
    cyl(f"{name}_bunbot", 0.085 * s, 0.03 * s, bun, root, (0, 0, 0.015 * s), bevel=0.012 * s)
    cyl(f"{name}_patty", 0.092 * s, 0.032 * s, mat("patty", PAL["patty"], rough=0.8), root, (0, 0, 0.045 * s), bevel=0.012 * s)
    rbox(f"{name}_cheese", (0.15 * s, 0.15 * s, 0.008 * s), 0.004, mat("cheese", PAL["cheese"], rough=0.5), root, (0, 0, 0.064 * s), rot=(0, 0, 45))
    cyl(f"{name}_lettuce", 0.098 * s, 0.012 * s, mat("lettuce", PAL["lettuce"], rough=0.6), root, (0, 0, 0.073 * s), segs=14, bevel=0.004)
    cyl(f"{name}_tomato", 0.08 * s, 0.012 * s, mat("tomato", PAL["tomato"], rough=0.45), root, (0, 0, 0.083 * s), bevel=0.004)
    top = sphere(f"{name}_buntop", 0.088 * s, bun, root, (0, 0, 0.088 * s), scale=(1, 1, 0.62))
    seed = mat("seed", "#FFF2D0", rough=0.6)
    for i, (a, rr) in enumerate([(10, 0.4), (80, 0.55), (150, 0.35), (210, 0.6), (290, 0.45), (340, 0.2)]):
        x, y = rr * 0.075 * s * math.cos(a * D2R), rr * 0.075 * s * math.sin(a * D2R)
        z = 0.088 * s + 0.62 * math.sqrt(max((0.088 * s) ** 2 - x * x - y * y, 0))
        sphere(f"{name}_seed{i}", 0.008 * s, seed, root, (x, y, z), scale=(1.4, 0.7, 0.6), rot=(0, 0, a), segs=10)
    return root


def plate(name, parent=None, loc=(0, 0, 0)):
    return cyl(name, 0.16, 0.022, mat("plate", "#FBFAF5", rough=0.25, coat=0.5), parent, loc, r2=0.125, bevel=0.006)


def cash_fan(name, parent, loc, rot):
    root = empty(name, parent, loc, rot)
    bills = []
    for i in range(5):
        piv = empty(f"{name}_piv{i}", root, (0, 0.004 * i, 0))
        b = rbox(f"{name}_bill{i}", (0.085, 0.003, 0.19), 0.004, mat("cash", PAL["cash"], rough=0.7), piv, (0, 0, 0.085))
        rbox(f"{name}_inset{i}", (0.064, 0.002, 0.15), 0.003, mat("cash_dark", PAL["cash_dark"], rough=0.7), piv, (0, -0.002, 0.085))
        cyl(f"{name}_seal{i}", 0.022, 0.002, mat("cash", PAL["cash"], rough=0.7), piv, (0, -0.0035, 0.085), rot=(90, 0, 0), segs=20)
        b["no_outline"] = True
        bills.append(piv)
    return root, bills


def set_fan(bills, amount):
    n = len(bills)
    for i, p in enumerate(bills):
        a = (i - (n - 1) / 2) * 17 * amount
        p.rotation_euler = Euler((0, a * D2R, 0))


# ----------------------------------------------------------------------------- the diner

TEAL = None


def build_diner(mood):
    teal = mat("teal", PAL["teal"], rough=0.35, coat=0.5)
    teal_d = mat("teal_dark", PAL["teal_dark"], rough=0.4, coat=0.3)
    chrome = mat("chrome", PAL["chrome"], rough=0.15, metal=1.0)
    counter_top = mat("counter_top", "#E8ECEE", rough=0.2, coat=0.6)
    cream = mat("wall_cream", "#EADCC0" if mood == "day" else "#D9C9A8", rough=0.8)
    tile = mat("wall_tile", "#F3EFE6", rough=0.3, coat=0.4)
    ceiling = mat("ceiling", "#2C2A2E", rough=0.9)
    steel = mat("grill_steel", "#9AA3AD", rough=0.3, metal=0.8)

    floor = cyl("floor", 1, 1, checker_mat("checker", "#EFE7D6", "#1F2026", 1.0), loc=(0, 0, 0), segs=4)
    floor.scale = (9, 9, 0.001)
    floor.rotation_euler = Euler((0, 0, 45 * D2R))
    floor.location = (0, -2, -0.0005)
    floor.data.materials[0] = checker_mat("checker2", "#EFE7D6", "#1F2026", 1.6)

    # counter: x -4.6..5, y -0.35..0.35
    x0, x1 = -4.6, 5.2
    w = x1 - x0
    cx = (x0 + x1) / 2
    rbox("counter_body", (w, 0.62, 0.92), 0.02, teal_d, None, (cx, 0.0, 0.52))
    rbox("counter_kick", (w, 0.62, 0.1), 0.01, chrome, None, (cx, -0.02, 0.05))
    rbox("counter_top", (w + 0.1, 0.82, 0.07), 0.025, counter_top, None, (cx, -0.08, 1.04))
    rbox("counter_edge", (w + 0.12, 0.05, 0.06), 0.02, chrome, None, (cx, -0.48, 1.02))
    n = int(w / 0.6)
    pw = w / n
    for i in range(n):
        rbox(f"counter_panel{i}", (pw - 0.05, 0.03, 0.78), 0.012, teal, None, (x0 + pw * (i + 0.5), -0.315, 0.53))
    # stools
    for i, x in enumerate([-3.3, -2.2, -1.1, 0.0, 1.1, 2.2, 3.3, 4.4]):
        cyl(f"stool_base{i}", 0.2, 0.03, chrome, None, (x, -0.95, 0.015), bevel=0.01)
        cyl(f"stool_pole{i}", 0.032, 0.66, chrome, None, (x, -0.95, 0.36))
        cyl(f"stool_ring{i}", 0.2, 0.04, chrome, None, (x, -0.95, 0.70), bevel=0.01)
        cyl(f"stool_seat{i}", 0.21, 0.1, teal, None, (x, -0.95, 0.77), bevel=0.04)
    # back counter / grill
    rbox("back_counter", (9.6, 0.7, 0.95), 0.02, steel, None, (0.3, 2.25, 0.475))
    rbox("grill_top", (2.4, 0.55, 0.03), 0.01, mat("grill_black", "#1A1A1C", rough=0.4, metal=0.5), None, (1.9, 2.22, 0.965))
    glow = mat("grill_glow", "#FF7A2A", rough=0.5, emit="#FF6A1A", emit_strength=1.2 if mood == "night" else 0.4)
    rbox("grill_glowstrip", (2.3, 0.02, 0.03), 0.005, glow, None, (1.9, 1.92, 0.93))
    for i in range(4):
        cyl(f"grill_patty{i}", 0.085, 0.025, mat("patty", PAL["patty"], rough=0.8), None, (1.1 + 0.55 * i, 2.22, 0.99), bevel=0.01)
    # back wall with window opening x -3.6..3.6, z 1.55..3.15, wall plane y=2.7
    wy = 2.72
    rbox("wall_low", (16, 0.12, 1.55), 0, tile, None, (0, wy, 0.775))
    rbox("wall_high", (16, 0.12, 0.75), 0, cream, None, (0, wy, 4.075))
    rbox("wall_left", (4.4, 0.12, 2.17), 0, cream, None, (-5.8, wy, 2.625))
    rbox("wall_right", (4.4, 0.12, 2.17), 0, cream, None, (5.8, wy, 2.625))
    rbox("wall_stripe", (16, 0.14, 0.12), 0, teal, None, (0, wy - 0.01, 3.8))
    rbox("wall_stripe2", (16, 0.14, 0.06), 0, teal, None, (0, wy - 0.01, 1.52))
    # window frame + mullions
    for x in (-3.6, -1.8, 0.0, 1.8, 3.6):
        rbox(f"mullion{x}", (0.09, 0.16, 2.17), 0.02, chrome, None, (x, wy - 0.02, 2.625))
    rbox("sill", (7.4, 0.25, 0.07), 0.02, chrome, None, (0, wy - 0.06, 1.56))
    rbox("lintel", (7.4, 0.18, 0.07), 0.02, chrome, None, (0, wy - 0.03, 3.7))
    glass = mat("glass", "#9FC6D6", rough=0.05, alpha=0.06, spec=0.8)
    g = rbox("glass", (7.2, 0.01, 2.15), 0, glass, None, (0, wy, 2.625))
    g.visible_shadow = False
    # door on the right
    door = mat("door", PAL["teal"], rough=0.4, coat=0.5)
    rbox("door", (1.0, 0.08, 2.3), 0.03, door, None, (4.55, wy - 0.07, 1.15))
    cyl("door_window", 0.24, 0.02, mat("door_glass", "#1D2F3A" if mood == "night" else "#BFDCE8", rough=0.1, coat=1.0), None, (4.55, wy - 0.12, 1.65), rot=(90, 0, 0), segs=32)
    torus("door_porthole", 0.24, 0.025, chrome, None, (4.55, wy - 0.125, 1.65), rot=(90, 0, 0))
    rbox("door_handle", (0.04, 0.06, 0.3), 0.015, chrome, None, (4.17, wy - 0.15, 1.1))
    # clock above the door
    cyl("clock_face", 0.26, 0.04, mat("clock_face", "#FFFDF5", rough=0.4, emit="#FFF6E0", emit_strength=0.25), None, (4.55, wy - 0.1, 3.7), rot=(90, 0, 0), segs=40)
    torus("clock_rim", 0.26, 0.03, mat("clock_rim", PAL["crimson"], rough=0.4, coat=0.4), None, (4.55, wy - 0.12, 3.7), rot=(90, 0, 0))
    hand_m = mat("clock_hand", "#1A1A1A", rough=0.5)
    rbox("clock_hour", (0.025, 0.01, 0.14), 0.005, hand_m, None, (4.55 + 0.05, wy - 0.135, 3.7 + 0.04), rot=(0, -50 if mood == "night" else 0, 0))
    rbox("clock_min", (0.018, 0.01, 0.2), 0.005, hand_m, None, (4.55, wy - 0.14, 3.7 + 0.09), rot=(0, 0, 0))
    # menu board on the left
    rbox("menu_board", (1.5, 0.05, 1.0), 0.03, mat("menu_board", "#1E2228", rough=0.6), None, (-4.6, wy - 0.07, 2.45))
    rbox("menu_frame", (1.6, 0.04, 1.1), 0.03, mat("menu_frame", "#6B4A2E", rough=0.6), None, (-4.6, wy - 0.05, 2.45))
    cols = ["#F2B132", "#F4F1EA", "#F4F1EA", "#D0343F", "#F4F1EA", "#17A091"]
    for i, c in enumerate(cols):
        ln = 0.75 if i % 2 else 0.95
        rbox(f"menu_line{i}", (ln, 0.02, 0.06), 0.02, mat(f"menu_ink{i}", c, rough=0.5, emit=c, emit_strength=0.5), None, (-4.75 + (0.95 - ln) / 2, wy - 0.1, 2.8 - i * 0.13))
        sphere(f"menu_dot{i}", 0.03, mat(f"menu_ink{i}", c), None, (-4.0, wy - 0.1, 2.8 - i * 0.13), segs=12)
    # neon coffee cup hanging in the window (a warm practical, night only)
    neon = mat("neon", PAL["crimson"], rough=0.4, emit="#FF4A5A", emit_strength=14.0 if mood == "night" else 3.0)
    ny = wy - 0.2

    def nmap(u, v):
        return (u, ny, v)

    cup = [(-0.32, 0.25), (-0.27, -0.18), (-0.2, -0.27), (0.2, -0.27), (0.27, -0.18), (0.32, 0.25)]
    cup_d = []
    for (ax, ay), (bx, by) in zip(cup[:-1], cup[1:]):
        for k in range(6):
            t = k / 6
            cup_d.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    cup_d.append(cup[-1])
    nx0, nz0 = -1.3, 3.05
    pieces = [cup_d, arc((0.36, 0.04), 0.11, -80, 90, n=14), [(-0.38, 0.25), (0.38, 0.25)]]
    for k in range(3):
        pieces.append([(-0.12 + 0.12 * k + 0.035 * math.sin(i / 7 * 2 * math.pi), 0.36 + 0.05 * i) for i in range(8)])
    for k, pts in enumerate(pieces if mood == "night" else []):
        vs, fs = ribbon2d([(nx0 + u, nz0 + v) for u, v in pts], 0.04, taper=0.9)
        shape_mesh(f"neon_{k}", vs, fs, nmap, neon, None)
    if mood == "night":
        add_light("neon_glow", "POINT", (nx0, ny - 0.3, nz0), energy=40, color="#FF4A5A", size=0.4, shadow=False)
    # ceiling + side walls
    rbox("ceiling", (16, 14, 0.1), 0, ceiling, None, (0, -3, 4.45))
    rbox("side_left", (0.12, 14, 4.5), 0, cream, None, (-8, -3, 2.25))
    rbox("side_right", (0.12, 14, 4.5), 0, cream, None, (8, -3, 2.25))
    # pendant lamps over the counter
    shade = mat("lamp_shade", PAL["teal"], rough=0.35, coat=0.6)
    bulbm = mat("lamp_bulb", "#FFE2B0", rough=0.3, emit="#FFD08A", emit_strength=25.0 if mood == "night" else 6.0)
    lamps = []
    for i, x in enumerate([-1.5, 0.3, 2.1, 3.9, 5.7]):
        cyl(f"lamp_cord{i}", 0.008, 1.1, mat("cord", "#111111"), None, (x, -0.1, 3.9))
        cyl(f"lamp_shade{i}", 0.06, 0.28, shade, None, (x, -0.1, 3.25), r2=0.06, segs=32)
        cone = cyl(f"lamp_cone{i}", 0.3, 0.22, shade, None, (x, -0.1, 3.05), r2=0.07, segs=40, bevel=0.01)
        cone.modifiers.new("solid", "SOLIDIFY").thickness = 0.01
        sphere(f"lamp_bulb{i}", 0.07, bulbm, None, (x, -0.1, 2.97), segs=20)
        lamps.append((x, -0.1, 2.9))
    # pile of plated burgers along the counter, napkin holder, ketchup
    return lamps


def build_outside(mood):
    night = mood == "night"
    ground = mat("ground", "#1C2129" if night else "#B9AE98", rough=0.9)
    road = mat("road", "#15171C" if night else "#6E6C68", rough=0.85)
    dash = mat("dash", "#E9D58A", rough=0.6, emit="#E9D58A", emit_strength=0.3 if night else 0)
    rbox("ground_out", (120, 80, 0.1), 0, ground, None, (0, 45, -0.06))
    rbox("road", (120, 7, 0.02), 0, road, None, (0, 8, 0.0))
    for i in range(-10, 11):
        rbox(f"road_dash{i}", (1.6, 0.18, 0.01), 0, dash, None, (i * 4.0, 8, 0.015))
    sky = gradient_sky_mat("sky", "#0B1230" if night else "#7FB6E6", "#3A3060" if night else "#E9F2F7", 1.0 if night else 1.6)
    s = cyl("sky_dome", 90, 60, sky, None, (0, 30, 20), segs=48)
    s.visible_shadow = False
    s.data.materials[0] = sky
    # plant sheds with sawtooth roofs
    wall = mat("shed_wall", "#5B4C46" if night else "#C98E5E", rough=0.85)
    roofm = mat("shed_roof", "#3D3434" if night else "#9C6B48", rough=0.8)
    win_on = mat("shed_window", "#FFC66B", rough=0.4, emit="#FFC062", emit_strength=14.0 if night else 0.0)
    win_cool = mat("shed_window_cool", "#CDE6FF", rough=0.4, emit="#BFE0FF", emit_strength=9.0 if night else 0.0)
    win_day = mat("shed_window_day", "#46505C", rough=0.2, coat=0.8)
    sheds = [(-9.5, 22, 7.5, 4.6), (-2.0, 24, 7.0, 5.2), (5.5, 21.5, 6.5, 4.2), (12.5, 23, 7.0, 5.0)]
    for si, (x, y, w, h) in enumerate(sheds):
        rbox(f"shed{si}", (w, 8, h), 0.05, wall, None, (x, y + 4, h / 2))
        nteeth = 4
        for t in range(nteeth):
            bm = bmesh.new()
            v = [bm.verts.new(p) for p in [(0, 0, 0), (w / nteeth, 0, 0), (0, 0, 1.3), (0, 8, 0), (w / nteeth, 8, 0), (0, 8, 1.3)]]
            bm.faces.new((v[0], v[1], v[2]))
            bm.faces.new((v[3], v[5], v[4]))
            bm.faces.new((v[0], v[3], v[4], v[1]))
            bm.faces.new((v[1], v[4], v[5], v[2]))
            bm.faces.new((v[2], v[5], v[3], v[0]))
            mesh_obj(f"shed{si}_tooth{t}", bm, roofm, None, (x - w / 2 + t * w / nteeth, y, h), smooth=False)
            rbox(f"shed{si}_skylight{t}", (0.04, 7.6, 1.0), 0, win_on if night else win_day, None, (x - w / 2 + t * w / nteeth + 0.05, y + 4, h + 0.6))
        rows = 3
        cols = int(w / 0.9)
        for r in range(rows):
            for c in range(cols):
                on = (si * 7 + r * 3 + c * 5) % 6 != 0
                m_ = (win_on if (c + r + si) % 4 else win_cool) if (night and on) else win_day
                rbox(f"shed{si}_win{r}_{c}", (0.55, 0.05, 0.6), 0.02, m_, None, (x - w / 2 + 0.6 + c * (w - 1.2) / max(cols - 1, 1), y - 0.02, 1.4 + r * 1.05))
    # gate
    rbox("gate_post_l", (0.35, 0.35, 3.2), 0.05, roofm, None, (1.6, 19.5, 1.6))
    rbox("gate_post_r", (0.35, 0.35, 3.2), 0.05, roofm, None, (4.4, 19.5, 1.6))
    rbox("gate_beam", (3.4, 0.35, 0.45), 0.05, mat("gate_beam", PAL["mustard"], rough=0.5, emit=PAL["mustard"], emit_strength=0.8 if night else 0), None, (3.0, 19.5, 3.3))
    # chimney
    ch = mat("chimney", "#A56E5E" if night else "#B0624A", rough=0.8)
    band = mat("chimney_band", "#E8E2D8", rough=0.7)
    cyl("chimney", 0.9, 9, ch, None, (8.5, 30, 4.5), r2=0.65, segs=32)
    for i in range(2):
        cyl(f"chimney_band{i}", 0.78 - 0.08 * i, 0.4, band, None, (8.5, 30, 6.0 + 1.6 * i), r2=0.76 - 0.08 * i, segs=32)
    sphere("chimney_light", 0.12, mat("chimney_light", "#FF3030", emit="#FF2020", emit_strength=12 if night else 2), None, (8.5, 29.3, 9.1), segs=12)
    if night:
        add_light("chimney_flood", "SPOT", (8.5, 24.5, 0.5), energy=6000, color="#FFB070", size=0.5, target=(8.5, 30, 6.5), spot=40, shadow=False)
    # street lamps
    for i, x in enumerate([-7, 0.5, 8]):
        cyl(f"streetlamp{i}", 0.06, 4.5, mat("lamp_post", "#2A2D33", rough=0.5, metal=0.5), None, (x, 12, 2.25))
        sphere(f"streetlamp_bulb{i}", 0.22, mat("street_bulb", "#FFE3A8", emit="#FFD58A", emit_strength=10 if night else 0), None, (x, 12, 4.55), segs=16)
        if night:
            add_light(f"streetlight{i}", "POINT", (x, 12, 4.4), energy=900, color="#FFC77A", size=0.3, shadow=False)
    if night:
        add_light("moonlight", "SUN", (0, 40, 30), energy=0.35, color="#9DB4FF", target=(0, 20, 0))
        sphere("moon", 1.6, mat("moon", "#F5F0DC", emit="#F5F0DC", emit_strength=4.0), None, (-16, 60, 17), segs=24)
    # smoke puffs
    smoke = mat("smoke", "#B9B5C4" if night else "#EDEDED", rough=0.9, alpha=0.6, emit="#8C8FA8" if night else "#FFFFFF", emit_strength=0.9 if night else 0.2)
    puffs = []
    for i in range(14):
        p = sphere(f"smoke{i}", 1.0, smoke, None, (8.5, 30, 11.5), segs=20)
        p.visible_shadow = False
        puffs.append(p)
    return puffs


def animate_smoke(puffs, f0, f1):
    base = Vector((8.5, 30.0, 9.3))
    life = 150.0
    for f in range(f0, f1 + 1):
        for i, p in enumerate(puffs):
            age = ((f + i * life / len(puffs)) % life) / life
            drift = Vector((5.5 * age + 0.6 * math.sin(i * 1.7 + age * 3), 1.2 * age, 6.0 * age**0.8))
            p.location = base + drift
            sc = 0.5 + 2.1 * age**0.7
            if age > 0.85:
                sc *= max(0.0, (1 - age) / 0.15)
            p.scale = (sc, sc * 0.9, sc * 0.8)
            p.keyframe_insert("location", frame=f)
            p.keyframe_insert("scale", frame=f)


# ----------------------------------------------------------------------------- lights, camera, render


def add_light(name, kind, loc, energy, color="#FFFFFF", size=0.5, target=None, spot=None, shadow=True):
    ld = bpy.data.lights.new(name, kind)
    ld.use_shadow = shadow
    ld.energy = energy
    ld.color = srgb(color)[:3]
    if kind == "AREA":
        ld.size = size
    else:
        ld.shadow_soft_size = size
    if kind == "SPOT" and spot:
        ld.spot_size = spot * D2R
        ld.spot_blend = 0.6
    ob = link(bpy.data.objects.new(name, ld))
    ob.location = loc
    if target is not None:
        d = Vector(target) - Vector(loc)
        ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return ob


def camera(loc, target, lens, fstop=None, focus=None, shift=(0, 0)):
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_width = 36
    cd.shift_x, cd.shift_y = shift
    cd.clip_start = 0.1
    cd.clip_end = 300
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        if isinstance(focus, bpy.types.Object):
            cd.dof.focus_object = focus
        else:
            cd.dof.focus_distance = focus
    ob = link(bpy.data.objects.new("cam", cd))
    aim(ob, loc, target)
    bpy.context.scene.camera = ob
    return ob


def aim(ob, loc, target):
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()


def setup_render(res, samples, mood):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    w, h = (int(x) for x in res.split("x"))
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    sc.render.fps = 30
    sc.render.film_transparent = False
    ee = sc.eevee
    ee.taa_render_samples = samples
    ee.use_raytracing = True
    ee.ray_tracing_method = "SCREEN"
    ee.use_shadows = True
    ee.shadow_ray_count = 2
    ee.shadow_step_count = 8
    ee.use_fast_gi = True
    try:
        ee.shadow_pool_size = "1024"
    except Exception:
        pass
    ee.fast_gi_method = "GLOBAL_ILLUMINATION"
    try:
        ee.ray_tracing_options.resolution_scale = "2"
    except Exception:
        pass
    vs = sc.view_settings
    vs.view_transform = "AgX"
    vs.look = "AgX - Punchy"
    vs.exposure = 0.0 if mood == "night" else -0.2
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    # world ambient
    world = bpy.data.worlds.new("world")
    sc.world = world
    try:
        world.use_nodes = True
    except Exception:
        pass
    bg = [n for n in world.node_tree.nodes if n.type == "BACKGROUND"][0]
    bg.inputs["Color"].default_value = srgb("#1A2446") if mood == "night" else srgb("#BFD8EE")
    bg.inputs["Strength"].default_value = 0.35 if mood == "night" else 0.9
    # compositor: bloom + a touch of saturation + vignette
    tree = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    sc.compositing_node_group = tree
    rl = tree.nodes.new("CompositorNodeRLayers")
    gl = tree.nodes.new("CompositorNodeGlare")
    try:
        gl.inputs["Type"].default_value = "Bloom"
    except Exception:
        pass
    gl.inputs["Threshold"].default_value = 1.0
    gl.inputs["Strength"].default_value = 0.6 if mood == "night" else 0.3
    gl.inputs["Size"].default_value = 0.6
    hs = tree.nodes.new("CompositorNodeHueSat")
    hs.inputs["Saturation"].default_value = 1.12
    el = tree.nodes.new("CompositorNodeEllipseMask")
    try:
        el.inputs["Size"].default_value = (0.95, 0.85)
    except Exception:
        pass
    bl = tree.nodes.new("CompositorNodeBlur")
    try:
        bl.inputs["Size"].default_value = (180, 180)
    except Exception:
        pass
    mix = tree.nodes.new("ShaderNodeMix") if False else None
    out = tree.nodes.new("NodeGroupOutput")
    tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    tree.links.new(rl.outputs["Image"], gl.inputs["Image"])
    tree.links.new(gl.outputs["Image"], hs.inputs["Image"])
    tree.links.new(hs.outputs["Image"], out.inputs[0])
    del mix, el, bl


# ----------------------------------------------------------------------------- casts

YOU_A = dict(head=PAL["mustard"], top=PAL["mustard"], cuff="#D99A22", pants=PAL["navy"], shoes=PAL["crimson"], hood=True, apron=True, scarf=PAL["teal"], tuft=True)
YOU_B = dict(YOU_A, head="#FFCC3A", top=PAL["charcoal"], cuff="#1E2026", hair=PAL["black"])
MARCO = dict(head=PAL["pale_blue"], top="#6F8FB3", cuff="#C9D0D8", pants="#3B4252", shoes="#2B2B2B", apron=True, paper_hat=True, long_sleeves=False, collar=True)
WAITRESS = dict(head=PAL["peach"], top=PAL["peach"], pants="#3A2E3A", shoes=PAL["crimson"], long_sleeves=False, waist_apron=True, skirt=PAL["crimson"], bun=True, pencil=True, hair="#7A3E2A")
CUST1 = dict(head=PAL["grey_blue"], top=PAL["grey_blue"], cuff="#6B7E99", pants="#2E3440", shoes="#5A3B2A", cap=PAL["crimson"])
CUST2 = dict(head=PAL["sage"], top="#6E9E64", cuff="#5A8752", pants="#3B3F4A", shoes="#222222", cap="#E8E2D2")

KEY_FRAME = {"opening": 52, "day": 1}
CAM0, CAM1, CAM_TGT = (1.28, -4.55, 1.62), (1.3, -4.15, 1.6), (1.35, 1.0, 1.72)


def build_opening(mood):
    lamps = build_diner(mood)
    puffs = build_outside(mood)
    # robots behind the counter
    robots = []
    xs = [0.75, 1.65, 2.55, 3.45]
    for i, x in enumerate(xs):
        r = robot(f"robot{i}", (x, 0.95, 0.0), facing=0)
        robots.append(r)
    # plates and burgers along the counter (the pile), and a landing plate per robot
    ctop = 1.075
    landing = []
    for i, x in enumerate(xs):
        for j, (dx, dy) in enumerate(((-0.28, -0.08), (0.0, 0.02))):
            plate(f"plate{i}_{j}", None, (x + dx, dy, ctop + 0.011))
            burger(f"pile{i}_{j}", None, (x + dx, dy, ctop + 0.022))
        if i % 2 == 0:
            burger(f"pile{i}_top", None, (x - 0.28, -0.08, ctop + 0.022 + 0.112), s=0.95)
        plate(f"land{i}", None, (x + 0.24, -0.24, ctop + 0.011))
        landing.append(Vector((x + 0.24, -0.24, ctop + 0.022)))
    plate("plate_extra", None, (-0.75, -0.15, ctop + 0.011))
    burger("pile_extra", None, (-0.75, -0.15, ctop + 0.022))
    # you
    spec = YOU_A if LOOK == "A" else YOU_B
    you = person("you", spec, loc=(0.42, -1.9, 0.0), facing=10)
    build_face(you["headmesh"], you["R"], "stunned", LOOK, gaze=(0.15, 0.1))
    fan_root, bills = cash_fan("cash", you["wr_L"], (0.0, -0.02, -0.12), (0, 0, 0))
    fan_root.rotation_euler = Euler((math.radians(180), 0, 0))
    # outlines
    outline_tree(you["root"], 0.0065, "rim", strength=1.6)
    for r in robots:
        outline_tree(r["root"], 0.008, "rim", strength=0.9)
    # lights
    night = mood == "night"
    for i, (x, y, z) in enumerate(lamps):
        add_light(f"pendant{i}", "SPOT", (x, y, z), energy=420 if night else 80, color="#FFC27A", size=0.15, target=(x, y + 0.2, 0), spot=110)
    add_light("key_you", "AREA", (-1.6, -4.2, 3.0), energy=260 if night else 160, color="#FFD3A0", size=2.0, target=(0.4, -1.9, 1.6))
    add_light("rim_you", "AREA", (-1.4, 0.2, 2.8), energy=220, color="#8FB8FF" if night else "#FFFFFF", size=1.5, target=(0.4, -1.9, 1.6))
    add_light("rim_robots", "AREA", (1.7, 2.3, 3.0), energy=320 if night else 120, color="#7FA8FF" if night else "#FFF2DD", size=6, target=(1.7, 0.9, 1.4))
    add_light("fill_cam", "AREA", (1.3, -5.5, 2.0), energy=90, color="#B9C8FF" if night else "#FFFFFF", size=4, target=(1.0, 0, 1.4))
    add_light("grill_glow", "AREA", (1.9, 2.0, 0.8), energy=60 if night else 0, color="#FF8A3A", size=2.2, target=(1.9, 0.5, 1.5))
    add_light("counter_wash", "AREA", (1.0, -1.5, 4.2), energy=300 if night else 150, color="#FFD9A8", size=7, target=(1.0, -0.5, 0.0))
    if not night:
        add_light("sun", "SUN", (0, 30, 20), energy=3.5, color="#FFF1D8", target=(-1, 0, 0))
    # camera with a slow push-in
    cam = camera(CAM0, CAM_TGT, lens=32, fstop=2.8, focus=you["headmesh"], shift=(0.0, 0.06))
    return dict(you=you, robots=robots, bills=bills, landing=landing, puffs=puffs, cam=cam)


def animate_opening(S, f0=1, f1=150):
    sc = bpy.context.scene
    you, robots, bills = S["you"], S["robots"], S["bills"]
    # you: arms rise, cash fans open
    def you_pose(t):
        e = t
        arm(you, "L", abduct=70 + 68 * e, flex=25 - 10 * e, elbow=35 - 20 * e, elbow_up=10 + 10 * e, wrist=(0, 0, 0))
        arm(you, "R", abduct=55 + 60 * e, flex=15, elbow=30 - 10 * e, elbow_up=10 + 15 * e)
        you["spine"].rotation_euler = Euler((-6 * e * D2R, 0, 0))
        you["head"].rotation_euler = Euler((-5 * e * D2R, -4 * e * D2R, 0))

    for f, t in ((f0, 0.0), (40, 1.0), (f1, 1.08)):
        you_pose(t)
        key_joints(you, f, ARM_JOINTS + ["spine", "head"])
    for f, a in ((f0, 0.05), (14, 0.15), (44, 1.0), (f1, 1.05)):
        set_fan(bills, a)
        for b in bills:
            b.keyframe_insert("rotation_euler", frame=f)
    for s in ("L", "R"):
        leg(you, s, abduct=6)
    # robots: rest, flick, hold, lower; burgers ride the blade then fly to the plates
    def rest(r):
        robot_arm(r, "L", abduct=12, flex=62, elbow=28, wrist=(18, 0, 0))
        robot_arm(r, "R", abduct=10, flex=35, elbow=55)

    def up(r):
        robot_arm(r, "L", abduct=8, flex=165, elbow=8, wrist=(-25, 0, 0))
        robot_arm(r, "R", abduct=14, flex=40, elbow=60)

    flights = []
    for i, r in enumerate(robots):
        fl = 20 + 5 * i
        fl2 = 108 + 5 * i
        keys = [(f0, rest), (fl, rest), (fl + 6, up), (fl + 30, up), (fl + 48, rest), (fl2, rest), (fl2 + 6, up), (f1, up)]
        for f, fn in keys:
            if f > f1:
                continue
            fn(r)
            key_joints(r, f, ARM_JOINTS)
            r["head"].rotation_euler = Euler((0, 0, 0))
        # head bob of joy on the flick (small, held)
        for f, a in ((fl, 0), (fl + 6, -8), (fl + 40, 0)):
            r["head"].rotation_euler = Euler((a * D2R, 0, 0))
            r["head"].keyframe_insert("rotation_euler", frame=f)
        flights.append((fl + 6, fl2 + 6))
    bpy.context.view_layer.update()
    burgers = []
    for i, r in enumerate(robots):
        b1 = burger(f"fly{i}", None, (0, 0, 0))
        b2 = burger(f"fly{i}b", None, (0, 0, 0))
        burgers.append((b1, b2))
    for i, r in enumerate(robots):
        b1, b2 = burgers[i]
        t1, t2 = flights[i]
        land = S["landing"][i]
        dur = 50
        # sample blade positions
        blade_pos = {}
        for f in range(f0, f1 + 1):
            sc.frame_set(f)
            blade_pos[f] = r["blade"].matrix_world.translation.copy()
        p_launch = blade_pos[t1]
        peak = 2.62 + 0.07 * (i % 2)
        for f in range(f0, f1 + 1):
            if f <= t1:
                pos = blade_pos[f] + Vector((0, 0, 0.012))
                rot = 0.0
                sq = 1.0
            elif f <= t1 + dur:
                t = (f - t1) / dur
                pos = p_launch.lerp(land, t)
                base_z = p_launch.z + (land.z - p_launch.z) * t
                h = peak - max(p_launch.z, land.z)
                pos.z = base_z + 4 * h * t * (1 - t) + (peak - base_z - h) * 0  # parabola
                rot = 360.0 * (t * t * (3 - 2 * t))
                sq = 1.0
            else:
                pos = land.copy()
                rot = 360.0
                k = f - (t1 + dur)
                sq = 1.0 - 0.18 * math.exp(-k / 2.5) * math.cos(k * 0.9)
            b1.location = pos
            b1.rotation_euler = Euler((rot * D2R, 0, 0))
            b1.scale = (1 / math.sqrt(sq), 1 / math.sqrt(sq), sq)
            for prop in ("location", "rotation_euler", "scale"):
                b1.keyframe_insert(prop, frame=f)
        # second burger appears on the blade, flips at the end
        land2 = land + Vector((0, 0, 0.112))
        p2 = blade_pos.get(t2, blade_pos[f1])
        for f in range(f0, f1 + 1):
            vis = f >= t1 + dur + 8
            b2.hide_render = not vis
            b2.hide_viewport = not vis
            b2.keyframe_insert("hide_render", frame=f)
            if f <= t2:
                pos = blade_pos[f] + Vector((0, 0, 0.012))
                rot = 0.0
            else:
                t = (f - t2) / dur
                pos = p2.lerp(land2, t)
                pos.z = p2.z + (land2.z - p2.z) * t + 4 * (peak - max(p2.z, land2.z)) * t * (1 - t)
                rot = 360.0 * (t * t * (3 - 2 * t))
            b2.location = pos
            b2.rotation_euler = Euler((rot * D2R, 0, 0))
            b2.keyframe_insert("location", frame=f)
            b2.keyframe_insert("rotation_euler", frame=f)
        for ch in b2.children_recursive:
            for f in range(f0, f1 + 1):
                vis = f >= t1 + dur + 8
                ch.hide_render = not vis
                ch.keyframe_insert("hide_render", frame=f)
    # camera push
    cam = S["cam"]
    p0, p1 = Vector(CAM0), Vector(CAM1)
    tgt = Vector(CAM_TGT)
    for f in range(f0, f1 + 1):
        t = (f - f0) / (f1 - f0)
        e = t * t * (3 - 2 * t) * 0.6 + t * 0.4
        aim(cam, p0.lerp(p1, e), tgt)
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)
    animate_smoke(S["puffs"], f0, f1)


def build_day():
    mood = "day"
    lamps = build_diner(mood)
    puffs = build_outside(mood)
    ctop = 1.075
    # Marco at the grill, facing the robot
    marco = person("marco", MARCO, loc=(0.5, 1.45, 0.0), facing=48)
    build_face(marco["headmesh"], marco["R"], "worried", LOOK, gaze=(0.5, 0.15))
    arm(marco, "L", abduct=15, flex=55, elbow=60)
    arm(marco, "R", abduct=25, flex=20, elbow=95, elbow_up=10)
    marco["head"].rotation_euler = Euler((0, 6 * D2R, 0))
    spat_m = empty("marco_spat", marco["wr_L"], (0, 0, -0.08))
    cyl("marco_sphandle", 0.016, 0.22, mat("handle", "#2B2B2B", rough=0.5), spat_m, (0, 0, -0.06))
    rbox("marco_spblade", (0.17, 0.2, 0.012), 0.006, mat("chrome", PAL["chrome"], rough=0.15, metal=1.0), spat_m, (0, -0.1, -0.18))
    # the robot, facing Marco, flipping with ease
    rb = robot("robot_day", (1.65, 1.5, 0.0), facing=-42)
    robot_arm(rb, "L", abduct=20, flex=120, elbow=30, wrist=(-15, 0, 0))
    robot_arm(rb, "R", abduct=10, flex=40, elbow=50)
    bpy.context.view_layer.update()
    bp = rb["blade"].matrix_world.translation
    burger("robot_burger", None, (bp.x, bp.y, bp.z + 0.32)).rotation_euler = Euler((math.radians(-35), 0, 0))
    # waitress at the pass (counter's floor side, left)
    wt = person("waitress", WAITRESS, loc=(-0.75, 0.85, 0.0), facing=24)
    build_face(wt["headmesh"], wt["R"], "sly", LOOK, gaze=(0.7, 0.0))
    arm(wt, "L", abduct=12, flex=40, elbow=80)
    arm(wt, "R", abduct=18, flex=10, elbow=20)
    wt["head"].rotation_euler = Euler((0, 0, -10 * D2R))
    # notepad in her hand
    rbox("notepad", (0.14, 0.02, 0.18), 0.01, mat("notepad", "#FFFDF2", rough=0.7), wt["wr_L"], (0, -0.03, -0.12))
    # customers on stools, backs to us
    c1 = person("cust1", CUST1, loc=(-1.1, -0.98, 0.06), facing=168)
    sit(c1)
    arm(c1, "L", abduct=8, flex=40, elbow=45)
    arm(c1, "R", abduct=8, flex=40, elbow=45)
    build_face(c1["headmesh"], c1["R"], "happy", LOOK)
    c2 = person("cust2", CUST2, loc=(2.2, -0.98, 0.06), facing=200)
    sit(c2)
    arm(c2, "L", abduct=8, flex=40, elbow=45)
    arm(c2, "R", abduct=8, flex=40, elbow=45)
    build_face(c2["headmesh"], c2["R"], "happy", LOOK)
    for x, y in ((-1.1, -0.15), (2.2, -0.15)):
        plate(f"cust_plate{x}", None, (x, y, ctop + 0.011))
        burger(f"cust_burger{x}", None, (x, y, ctop + 0.022))
    for x in (0.4, 0.7):
        plate(f"pass_plate{x}", None, (x, 0.0, ctop + 0.011))
        burger(f"pass_burger{x}", None, (x, 0.0, ctop + 0.022))
    chrome = mat("chrome", PAL["chrome"], rough=0.15, metal=1.0)
    rbox("pass_shelf", (1.2, 0.4, 0.04), 0.01, chrome, None, (-1.35, 0.15, 1.6))
    for sx in (-1.9, -0.8):
        cyl(f"pass_post{sx}", 0.02, 0.5, chrome, None, (sx, 0.15, 1.33))
    heat = mat("heat_lamp", "#FF6A3A", rough=0.4, emit="#FF5A2A", emit_strength=6.0)
    for hx in (-1.65, -1.05):
        cyl(f"heat_lamp{hx}", 0.09, 0.1, heat, None, (hx, 0.15, 1.95), r2=0.05)
        cyl(f"heat_cord{hx}", 0.006, 0.4, mat("cord", "#111111"), None, (hx, 0.15, 2.2))
    for hx in (-1.65, -1.1):
        plate(f"shelf_plate{hx}", None, (hx, 0.15, 1.635))
        burger(f"shelf_burger{hx}", None, (hx, 0.15, 1.645))
    cyl("coffee_cup", 0.05, 0.09, mat("cup", "#FBFAF5", rough=0.3, coat=0.5), None, (-1.7, -0.15, ctop + 0.045), r2=0.06, bevel=0.01)
    for J in (marco, wt, c1, c2):
        outline_tree(J["root"], 0.0065, "rim", strength=1.4)
    outline_tree(rb["root"], 0.007, "rim", strength=0.8)
    # light: daylight through the window
    add_light("sun", "SUN", (0, 30, 20), energy=4.0, color="#FFEFD2", target=(-1.5, 0, 0))
    add_light("window_bounce", "AREA", (1.0, 2.5, 2.6), energy=420, color="#DDEBFF", size=7, target=(1.0, -1.0, 1.2))
    add_light("key_front", "AREA", (-1.5, -4.5, 3.2), energy=420, color="#FFE6C8", size=4, target=(1.2, 0.8, 1.5))
    add_light("fill", "AREA", (3.5, -3.5, 2.0), energy=150, color="#FFFFFF", size=3, target=(1.0, 0.5, 1.3))
    add_light("ceiling_wash", "AREA", (0.5, -0.5, 4.3), energy=320, color="#FFF4E0", size=8, target=(0.5, -0.5, 0))
    for i, (x, y, z) in enumerate(lamps):
        add_light(f"pendant{i}", "SPOT", (x, y, z), energy=90, color="#FFC27A", size=0.15, target=(x, y + 0.2, 0), spot=110)
    camera((0.75, -4.1, 2.05), (0.85, 1.4, 1.45), lens=32, fstop=3.5, focus=marco["headmesh"], shift=(0, 0.0))
    return dict(puffs=puffs)


# ----------------------------------------------------------------------------- main


def main():
    global COL
    sc = bpy.context.scene
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    COL = sc.collection
    setup_render(ARGS.res, ARGS.samples, ARGS.mood)
    if ARGS.shot == "opening":
        S = build_opening(ARGS.mood)
        animate_opening(S, 1, 150)
    else:
        S = build_day()
        animate_smoke(S["puffs"], 1, 150)
    sc.frame_start, sc.frame_end = 1, 150
    if ARGS.save:
        bpy.ops.wm.save_as_mainfile(filepath=ARGS.save)
    if ARGS.frames:
        sc.frame_start, sc.frame_end = ARGS.frames
        sc.render.filepath = ARGS.out.rstrip("/") + "/f####"
        sc.render.use_motion_blur = True
        sc.render.motion_blur_shutter = 0.5
        bpy.ops.render.render(animation=True)
    else:
        f = ARGS.frame if ARGS.frame is not None else KEY_FRAME[ARGS.shot]
        sc.frame_set(f)
        sc.render.filepath = ARGS.out
        bpy.ops.render.render(write_still=True)
    print("DONE", ARGS.out)


main()
