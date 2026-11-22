"""Say Suppose 3D look test, round 2: redesigned cartoon characters, a detailed diner, four render styles.

Run headless:
    blender -b --factory-startup -P diner3d_r2.py -- --style toy --shot opening --out r2/a1-night.png

Arguments (after "--"):
    --style  toy | toon | clay | cine   A1 polished toy, A2 toon/cel, A3 clay/stop-motion, A4 cinematic
    --shot   opening | day | charsheet  the night opening, the day mid shot, or a character line-up for design checks
    --res    WxH (default 1280x720)     --samples N     --out file.png     --save file.blend

Everything is built in code from primitives and procedural shader nodes: no downloaded models, no image textures,
no AI images. Faces are held expressions (no lip-sync, no wobble). Round 1 (diner3d.py) is unchanged.
"""

import argparse
import math
import random
import sys
import warnings

import bmesh
import bpy
from mathutils import Euler, Vector

warnings.filterwarnings("ignore", category=DeprecationWarning)


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--style", default="toy", choices=["toy", "toon", "clay", "cine"])
    p.add_argument("--shot", default="opening", choices=["opening", "day", "charsheet"])
    p.add_argument("--res", default="1280x720")
    p.add_argument("--samples", type=int, default=64)
    p.add_argument("--out", required=True)
    p.add_argument("--save", default=None)
    return p.parse_args(argv)


ARGS = parse_args()
STYLE = ARGS.style
MOOD = "day" if ARGS.shot == "day" else "night"
D2R = math.pi / 180.0
random.seed(7)
COL = None

# ============================================================================ colour


def srgb(h):
    h = h.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i : i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (out[0], out[1], out[2], 1.0)


def scale_col(c, k):
    return (min(c[0] * k, 1.0), min(c[1] * k, 1.0), min(c[2] * k, 1.0), 1.0)


PAL = {
    "mustard": "#F2B132",
    "teal": "#16A394",
    "teal_dark": "#0D6B62",
    "crimson": "#D2333F",
    "cream": "#F3E7CF",
    "white": "#F6F3EC",
    "skin": "#17120F",
    "navy": "#26314B",
    "steel": "#B4BDC8",
    "steel_dark": "#59626E",
    "chrome": "#E2E6EA",
    "screen": "#0A1626",
    "cyan": "#5FE6FF",
    "bun": "#E39A3C",
    "patty": "#5B2E1B",
    "cheese": "#F9C22E",
    "lettuce": "#6BBE47",
    "tomato": "#E2453A",
    "cash": "#86CB7E",
    "cash_dark": "#3D8B4C",
    "ink": "#17131C",
}

# ============================================================================ materials (style-aware)

MATS = {}


def _nodes(m):
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    return nt, out


def _color_socket(nt, tex, color):
    """Base colour: a flat colour or a procedural pattern. Returns an output socket."""
    c = srgb(color)
    if tex is None:
        rgb = nt.nodes.new("ShaderNodeRGB")
        rgb.outputs[0].default_value = c
        sock = rgb.outputs[0]
    else:
        kind = tex[0]
        tc = nt.nodes.new("ShaderNodeTexCoord")
        co = tc.outputs["Object"]
        if kind == "checker":
            _, c2, scale = tex
            ck = nt.nodes.new("ShaderNodeTexChecker")
            ck.inputs["Scale"].default_value = scale
            ck.inputs["Color1"].default_value = c
            ck.inputs["Color2"].default_value = srgb(c2)
            nt.links.new(co, ck.inputs["Vector"])
            sock = _wear(nt, co, ck.outputs["Color"], 0.18)
        elif kind == "tile":
            _, grout, size = tex
            br = nt.nodes.new("ShaderNodeTexBrick")
            br.offset = 0.0
            br.inputs["Color1"].default_value = c
            br.inputs["Color2"].default_value = scale_col(c, 0.93)
            br.inputs["Mortar"].default_value = srgb(grout)
            br.inputs["Scale"].default_value = 1.0 / size
            br.inputs["Mortar Size"].default_value = 0.012
            br.inputs["Bias"].default_value = 0.0
            br.inputs["Brick Width"].default_value = 1.0
            br.inputs["Row Height"].default_value = 1.0
            mp = nt.nodes.new("ShaderNodeMapping")
            mp.inputs["Rotation"].default_value = (math.pi / 2, 0, 0)
            nt.links.new(co, mp.inputs["Vector"])
            nt.links.new(mp.outputs[0], br.inputs["Vector"])
            sock = br.outputs["Color"]
        elif kind == "wood":
            _, c2 = tex
            wv = nt.nodes.new("ShaderNodeTexWave")
            wv.wave_type = "BANDS"
            wv.inputs["Scale"].default_value = 3.0
            wv.inputs["Distortion"].default_value = 6.0
            wv.inputs["Detail"].default_value = 3.0
            mp = nt.nodes.new("ShaderNodeMapping")
            mp.inputs["Scale"].default_value = (0.25, 4.0, 4.0)
            nt.links.new(co, mp.inputs["Vector"])
            nt.links.new(mp.outputs[0], wv.inputs["Vector"])
            ramp = nt.nodes.new("ShaderNodeValToRGB")
            ramp.color_ramp.elements[0].color = srgb(c2)
            ramp.color_ramp.elements[1].color = c
            nt.links.new(wv.outputs["Fac"], ramp.inputs[0])
            sock = ramp.outputs[0]
        elif kind == "speckle":
            _, c2, density = tex
            vo = nt.nodes.new("ShaderNodeTexVoronoi")
            vo.inputs["Scale"].default_value = 60.0
            nt.links.new(co, vo.inputs["Vector"])
            ramp = nt.nodes.new("ShaderNodeValToRGB")
            ramp.color_ramp.interpolation = "CONSTANT"
            ramp.color_ramp.elements[0].color = srgb(c2)
            ramp.color_ramp.elements[1].position = density
            ramp.color_ramp.elements[1].color = c
            nt.links.new(vo.outputs["Distance"], ramp.inputs[0])
            sock = ramp.outputs[0]
        elif kind == "brushed":
            no = nt.nodes.new("ShaderNodeTexNoise")
            no.inputs["Scale"].default_value = 40.0
            mp = nt.nodes.new("ShaderNodeMapping")
            mp.inputs["Scale"].default_value = (0.05, 1.0, 1.0)
            nt.links.new(co, mp.inputs["Vector"])
            nt.links.new(mp.outputs[0], no.inputs["Vector"])
            ramp = nt.nodes.new("ShaderNodeValToRGB")
            ramp.color_ramp.elements[0].color = scale_col(c, 0.82)
            ramp.color_ramp.elements[1].color = c
            nt.links.new(no.outputs["Fac"], ramp.inputs[0])
            sock = ramp.outputs[0]
        elif kind == "brick":
            _, c2 = tex
            br = nt.nodes.new("ShaderNodeTexBrick")
            br.inputs["Color1"].default_value = c
            br.inputs["Color2"].default_value = srgb(c2)
            br.inputs["Mortar"].default_value = scale_col(c, 0.6)
            br.inputs["Scale"].default_value = 2.5
            br.inputs["Mortar Size"].default_value = 0.015
            mp = nt.nodes.new("ShaderNodeMapping")
            mp.inputs["Rotation"].default_value = (math.pi / 2, 0, 0)
            nt.links.new(co, mp.inputs["Vector"])
            nt.links.new(mp.outputs[0], br.inputs["Vector"])
            sock = br.outputs["Color"]
        else:
            raise ValueError(kind)
    if STYLE == "clay":
        sock = _wear(nt, None, sock, 0.07, scale=6.0)
    return sock


def _wear(nt, co, sock, amount, scale=3.0):
    no = nt.nodes.new("ShaderNodeTexNoise")
    no.inputs["Scale"].default_value = scale
    no.inputs["Detail"].default_value = 4.0
    if co is not None:
        nt.links.new(co, no.inputs["Vector"])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value = 1.0 - amount
    mr.inputs["To Max"].default_value = 1.0
    nt.links.new(no.outputs["Fac"], mr.inputs["Value"])
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    mx.blend_type = "MULTIPLY"
    mx.inputs[0].default_value = 1.0
    nt.links.new(sock, mx.inputs[6])
    nt.links.new(mr.outputs[0], mx.inputs[7])
    return mx.outputs[2]


KIND_PBR = {
    # kind: roughness, metallic, coat, sheen, subsurface, spec
    "skin": (0.42, 0.0, 0.0, 0.12, 0.12, 0.45),
    "cloth": (0.8, 0.0, 0.0, 0.3, 0.0, 0.3),
    "plastic": (0.32, 0.0, 0.25, 0.0, 0.0, 0.5),
    "satin": (0.45, 0.0, 0.1, 0.2, 0.0, 0.45),
    "metal": (0.3, 0.75, 0.25, 0.0, 0.0, 0.5),
    "chrome": (0.1, 1.0, 0.0, 0.0, 0.0, 0.5),
    "paint": (0.7, 0.0, 0.0, 0.0, 0.0, 0.35),
    "ceramic": (0.18, 0.0, 0.6, 0.0, 0.0, 0.5),
    "food": (0.55, 0.0, 0.15, 0.1, 0.05, 0.4),
    "paper": (0.9, 0.0, 0.0, 0.3, 0.0, 0.25),
    "rubber": (0.6, 0.0, 0.0, 0.0, 0.0, 0.3),
    "wood": (0.45, 0.0, 0.35, 0.0, 0.0, 0.4),
    "glossy": (0.15, 0.0, 0.8, 0.0, 0.0, 0.5),
}


def M(name, color, kind="plastic", tex=None, emit=0.0, emit_color=None, alpha=1.0):
    """Material by role. The look comes from STYLE: satin PBR (toy, cine), cel ramp (toon) or matte clay."""
    key = name
    if key in MATS:
        return MATS[key]
    m = bpy.data.materials.new(name)
    nt, out = _nodes(m)
    base = _color_socket(nt, tex, color)
    rough, metal, coat, sheen, sss, spec = KIND_PBR.get(kind, KIND_PBR["plastic"])
    if STYLE == "toon" and kind not in ("emit", "glass"):
        sh = _toon(nt, base, kind, emit, emit_color or color)
    else:
        b = nt.nodes.new("ShaderNodeBsdfPrincipled")
        nt.links.new(base, b.inputs["Base Color"])
        if STYLE == "clay" and kind not in ("chrome", "glass", "emit"):
            rough, coat, spec, metal = max(rough, 0.78), 0.0, 0.28, metal * 0.3
            sheen = max(sheen, 0.25)
            _clay_bump(nt, b)
        b.inputs["Roughness"].default_value = rough
        b.inputs["Metallic"].default_value = metal
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.12
        b.inputs["Specular IOR Level"].default_value = spec
        b.inputs["Sheen Weight"].default_value = sheen
        b.inputs["Sheen Roughness"].default_value = 0.45
        if sss > 0:
            b.inputs["Subsurface Weight"].default_value = sss
            b.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
            b.inputs["Subsurface Scale"].default_value = 0.02
        if emit > 0:
            b.inputs["Emission Color"].default_value = srgb(emit_color or color)
            b.inputs["Emission Strength"].default_value = emit
        if alpha < 1.0:
            b.inputs["Alpha"].default_value = alpha
            m.surface_render_method = "BLENDED"
        sh = b.outputs[0]
    nt.links.new(sh, out.inputs["Surface"])
    m.diffuse_color = srgb(color)
    MATS[key] = m
    return m


def _clay_bump(nt, b):
    """Fingerprints and thumb dents: fine noise plus a soft voronoi dimple, as bump only."""
    tc = nt.nodes.new("ShaderNodeTexCoord")
    no = nt.nodes.new("ShaderNodeTexNoise")
    no.inputs["Scale"].default_value = 22.0
    no.inputs["Detail"].default_value = 3.0
    vo = nt.nodes.new("ShaderNodeTexVoronoi")
    vo.inputs["Scale"].default_value = 9.0
    nt.links.new(tc.outputs["Object"], no.inputs["Vector"])
    nt.links.new(tc.outputs["Object"], vo.inputs["Vector"])
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    nt.links.new(no.outputs["Fac"], add.inputs[0])
    nt.links.new(vo.outputs["Distance"], add.inputs[1])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.3
    bump.inputs["Distance"].default_value = 0.004
    nt.links.new(add.outputs[0], bump.inputs["Height"])
    nt.links.new(bump.outputs[0], b.inputs["Normal"])


def _toon(nt, base, kind, emit, emit_color):
    """Cel shading: diffuse light quantised to three steps, times the base colour, plus a crisp rim band."""
    df = nt.nodes.new("ShaderNodeBsdfDiffuse")
    df.inputs["Color"].default_value = (1, 1, 1, 1)
    s2r = nt.nodes.new("ShaderNodeShaderToRGB")
    nt.links.new(df.outputs[0], s2r.inputs[0])
    bw = nt.nodes.new("ShaderNodeRGBToBW")
    nt.links.new(s2r.outputs["Color"], bw.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].position = 0.0
    cr.elements[0].color = (0.42, 0.42, 0.5, 1)
    cr.elements[1].position = 0.08
    cr.elements[1].color = (0.75, 0.74, 0.78, 1)
    e = cr.elements.new(0.32)
    e.color = (1.0, 1.0, 1.0, 1)
    e2 = cr.elements.new(0.9)
    e2.color = (1.18, 1.16, 1.12, 1)
    nt.links.new(bw.outputs[0], ramp.inputs[0])
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs[0].default_value = 1.0
    nt.links.new(base, mul.inputs[6])
    nt.links.new(ramp.outputs[0], mul.inputs[7])
    col = mul.outputs[2]
    # rim band
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    rr = nt.nodes.new("ShaderNodeValToRGB")
    rr.color_ramp.interpolation = "CONSTANT"
    rr.color_ramp.elements[0].color = (0, 0, 0, 1)
    rr.color_ramp.elements[1].position = 0.72
    rim_k = 0.55 if kind == "skin" else 0.22
    rr.color_ramp.elements[1].color = (0.55 * rim_k, 0.75 * rim_k, 1.0 * rim_k, 1)
    nt.links.new(lw.outputs["Facing"], rr.inputs[0])
    rim_mask = nt.nodes.new("ShaderNodeMix")
    rim_mask.data_type = "RGBA"
    rim_mask.blend_type = "MULTIPLY"
    rim_mask.inputs[0].default_value = 1.0
    nt.links.new(rr.outputs[0], rim_mask.inputs[6])
    nt.links.new(ramp.outputs[0], rim_mask.inputs[7])
    add = nt.nodes.new("ShaderNodeMix")
    add.data_type = "RGBA"
    add.blend_type = "ADD"
    add.inputs[0].default_value = 1.0
    nt.links.new(col, add.inputs[6])
    nt.links.new(rim_mask.outputs[2], add.inputs[7])
    col = add.outputs[2]
    if kind in ("chrome", "metal", "glossy", "ceramic"):
        gl = nt.nodes.new("ShaderNodeBsdfGlossy")
        gl.inputs["Roughness"].default_value = 0.25
        s2 = nt.nodes.new("ShaderNodeShaderToRGB")
        nt.links.new(gl.outputs[0], s2.inputs[0])
        bw2 = nt.nodes.new("ShaderNodeRGBToBW")
        nt.links.new(s2.outputs[0], bw2.inputs[0])
        sr = nt.nodes.new("ShaderNodeValToRGB")
        sr.color_ramp.interpolation = "CONSTANT"
        sr.color_ramp.elements[0].color = (0, 0, 0, 1)
        sr.color_ramp.elements[1].position = 0.55
        sr.color_ramp.elements[1].color = (0.6, 0.6, 0.6, 1)
        nt.links.new(bw2.outputs[0], sr.inputs[0])
        add2 = nt.nodes.new("ShaderNodeMix")
        add2.data_type = "RGBA"
        add2.blend_type = "ADD"
        add2.inputs[0].default_value = 1.0
        nt.links.new(col, add2.inputs[6])
        nt.links.new(sr.outputs[0], add2.inputs[7])
        col = add2.outputs[2]
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(col, em.inputs["Color"])
    if emit > 0:
        em2 = nt.nodes.new("ShaderNodeEmission")
        em2.inputs["Color"].default_value = srgb(emit_color)
        em2.inputs["Strength"].default_value = emit
        ad = nt.nodes.new("ShaderNodeAddShader")
        nt.links.new(em.outputs[0], ad.inputs[0])
        nt.links.new(em2.outputs[0], ad.inputs[1])
        return ad.outputs[0]
    return em.outputs[0]


def M_emit(name, color, strength):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    nt, out = _nodes(m)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = srgb(color)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    MATS[name] = m
    return m


def M_flat(name, color, emit=0.25):
    """Face decals: flat colour that stays clean in every style (lit a little, never muddy)."""
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    nt, out = _nodes(m)
    if STYLE == "toon":
        em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = srgb(color)
        em.inputs["Strength"].default_value = 1.0
        nt.links.new(em.outputs[0], out.inputs["Surface"])
    else:
        b = nt.nodes.new("ShaderNodeBsdfPrincipled")
        b.inputs["Base Color"].default_value = srgb(color)
        b.inputs["Roughness"].default_value = 0.75 if STYLE == "clay" else 0.3
        b.inputs["Coat Weight"].default_value = 0.0 if STYLE == "clay" else 0.6
        b.inputs["Emission Color"].default_value = srgb(color)
        b.inputs["Emission Strength"].default_value = emit
        nt.links.new(b.outputs[0], out.inputs["Surface"])
    MATS[name] = m
    return m


def M_glass(name, tint="#BFD8E2", alpha=0.08):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    nt, out = _nodes(m)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = srgb(tint)
    b.inputs["Roughness"].default_value = 0.04
    b.inputs["Alpha"].default_value = alpha
    b.inputs["Specular IOR Level"].default_value = 0.9
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    m.surface_render_method = "BLENDED"
    MATS[name] = m
    return m


def M_ink(thickness_color=PAL["ink"]):
    """Inverted-hull outline material (toon): back-face culled, no shadow."""
    name = "ink"
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    nt, out = _nodes(m)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = srgb(thickness_color)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    lp = nt.nodes.new("ShaderNodeLightPath")
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Shadow Ray"], mx.inputs[0])
    nt.links.new(em.outputs[0], mx.inputs[1])
    nt.links.new(tr.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs["Surface"])
    m.use_backface_culling = True
    MATS[name] = m
    return m


# ============================================================================ geometry


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


def mesh_obj(name, bm, material=None, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), smooth=True, ink=None):
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
    if ink is not None:
        ob["ink"] = ink
    return link(ob)


def sphere(name, r, material, parent=None, loc=(0, 0, 0), scale=(1, 1, 1), rot=(0, 0, 0), segs=40, ink=0.006):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=max(segs // 2, 6), radius=r)
    return mesh_obj(name, bm, material, parent, loc, rot, scale, ink=ink)


def rbox(name, size, radius, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), segments=4, ink=0.006):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
    ob = mesh_obj(name, bm, material, parent, loc, rot, ink=ink)
    if radius > 0:
        md = ob.modifiers.new("bevel", "BEVEL")
        md.width = min(radius, min(size) * 0.49)
        md.segments = segments
        md.limit_method = "NONE"
        md.harden_normals = True
    return ob


def cyl(name, r, depth, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), r2=None, segs=40, bevel=0.0, ink=0.006):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    ob = mesh_obj(name, bm, material, parent, loc, rot, ink=ink)
    if bevel > 0:
        md = ob.modifiers.new("bevel", "BEVEL")
        md.width = bevel
        md.segments = 3
        md.limit_method = "ANGLE"
        md.angle_limit = 40 * D2R
        md.harden_normals = True
    return ob


def torus(name, R, r, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), nu=40, nv=14, arc_deg=360.0, ink=0.005):
    bm = bmesh.new()
    closed = arc_deg >= 359.9
    n_u = nu if closed else nu + 1
    rings = []
    for i in range(n_u):
        a = (2 * math.pi * i / nu) if closed else (arc_deg * D2R * i / nu)
        ring = []
        for j in range(nv):
            b = 2 * math.pi * j / nv
            ring.append(bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
        rings.append(ring)
    last = nu if closed else nu
    for i in range(last):
        A, B = rings[i], rings[(i + 1) % n_u]
        for j in range(nv):
            bm.faces.new((A[j], B[j], B[(j + 1) % nv], A[(j + 1) % nv]))
    return mesh_obj(name, bm, material, parent, loc, rot, scale, ink=ink)


def lathe(name, prof, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), segs=36, sx=1.0, sy=1.0, ripple=None, ink=0.006):
    """Revolve a profile [(r, z), ...] (bottom to top) around z. r=0 makes a closed pole."""
    bm = bmesh.new()
    rings = []
    for r, z in prof:
        if r <= 1e-6:
            rings.append([bm.verts.new((0, 0, z))])
        else:
            ring = []
            for k in range(segs):
                a = 2 * math.pi * k / segs
                rr = r * (1 + (ripple[0] * math.sin(ripple[1] * a) if ripple else 0))
                ring.append(bm.verts.new((rr * sx * math.cos(a), rr * sy * math.sin(a), z)))
            rings.append(ring)
    for A, B in zip(rings[:-1], rings[1:]):
        if len(A) == 1 and len(B) == 1:
            continue
        if len(A) == 1:
            for k in range(segs):
                bm.faces.new((A[0], B[(k + 1) % segs], B[k]))
        elif len(B) == 1:
            for k in range(segs):
                bm.faces.new((A[k], A[(k + 1) % segs], B[0]))
        else:
            for k in range(segs):
                bm.faces.new((A[k], A[(k + 1) % segs], B[(k + 1) % segs], B[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_obj(name, bm, material, parent, loc, rot, ink=ink)


def smooth_prof(ctrl, n=6):
    """Catmull-Rom through control points (r, z)."""
    pts = [ctrl[0]] + list(ctrl) + [ctrl[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(ctrl[-1])
    return out


def limb_prof(r_top, r_bot, length, n=8):
    """Tapered capsule: top sphere centre at z=0, bottom sphere centre at z=-length (bottom to top)."""
    prof = []
    for k in range(n + 1):
        a = -math.pi / 2 + (math.pi / 2) * k / n
        prof.append((r_bot * math.cos(a), -length + r_bot * math.sin(a)))
    for k in range(1, n + 1):
        a = (math.pi / 2) * k / n
        prof.append((r_top * math.cos(a), r_top * math.sin(a)))
    prof[0] = (0.0, prof[0][1])
    prof[-1] = (0.0, prof[-1][1])
    return prof


def limb(name, r_top, r_bot, length, material, parent, loc=(0, 0, 0), rot=(0, 0, 0), ink=0.006, segs=28):
    return lathe(name, limb_prof(r_top, r_bot, length), material, parent, loc, rot, segs=segs, ink=ink)


def sweep(name, pts, radii, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), segs=16, flat=1.0, up=(0, 0, 1), ink=0.005, caps=True):
    """A tube along a path, radius per point, cross-section squashed by `flat` along the binormal."""
    P = [Vector(p) for p in pts]
    n = len(P)
    if not hasattr(radii, "__len__"):
        radii = [radii] * n
    T = [(P[min(i + 1, n - 1)] - P[max(i - 1, 0)]).normalized() for i in range(n)]
    ref = Vector(up)
    if abs(ref.dot(T[0])) > 0.95:
        ref = Vector((1, 0, 0))
    N = []
    prev = (ref - ref.dot(T[0]) * T[0]).normalized()
    for i in range(n):
        nn = prev - prev.dot(T[i]) * T[i]
        if nn.length < 1e-6:
            nn = T[i].orthogonal()
        nn.normalize()
        N.append(nn)
        prev = nn
    Bn = [T[i].cross(N[i]) for i in range(n)]
    bm = bmesh.new()
    rings = []
    for i in range(n):
        ring = []
        for k in range(segs):
            a = 2 * math.pi * k / segs
            ring.append(bm.verts.new(P[i] + N[i] * (math.cos(a) * radii[i] * flat) + Bn[i] * (math.sin(a) * radii[i])))
        rings.append(ring)
    for i in range(n - 1):
        for k in range(segs):
            bm.faces.new((rings[i][k], rings[i][(k + 1) % segs], rings[i + 1][(k + 1) % segs], rings[i + 1][k]))
    if caps:
        c0 = bm.verts.new(P[0] - T[0] * radii[0] * 0.5)
        c1 = bm.verts.new(P[-1] + T[-1] * radii[-1] * 0.5)
        for k in range(segs):
            bm.faces.new((rings[0][(k + 1) % segs], rings[0][k], c0))
            bm.faces.new((rings[-1][k], rings[-1][(k + 1) % segs], c1))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_obj(name, bm, material, parent, loc, rot, ink=ink)


def ellipse_path(rx, ry, z, n=40, a0=0.0, a1=360.0, wob=0.0):
    return [(rx * math.cos((a0 + (a1 - a0) * i / n) * D2R), ry * math.sin((a0 + (a1 - a0) * i / n) * D2R), z + wob * math.sin(i * 0.7)) for i in range(n + 1)]


def body_panel(name, rfun, sy, z0, z1, a0, a1, thick, material, parent, nz=14, na=24, ink=0.004):
    """A curved panel hugging a lathe body: r(z) from rfun, angles in degrees (front is -90)."""
    bm = bmesh.new()
    grid = []
    for iz in range(nz + 1):
        z = z0 + (z1 - z0) * iz / nz
        row = []
        for ia in range(na + 1):
            a = (a0 + (a1 - a0) * ia / na) * D2R
            r = rfun(z)
            row.append(bm.verts.new((r * math.cos(a), r * sy * math.sin(a), z)))
        grid.append(row)
    for iz in range(nz):
        for ia in range(na):
            bm.faces.new((grid[iz][ia], grid[iz][ia + 1], grid[iz + 1][ia + 1], grid[iz + 1][ia]))
    ob = mesh_obj(name, bm, material, parent, ink=ink)
    s = ob.modifiers.new("thick", "SOLIDIFY")
    s.thickness = thick
    s.offset = 1.0
    s.use_even_offset = True
    bv = ob.modifiers.new("bevel", "BEVEL")
    bv.width = thick * 0.45
    bv.segments = 2
    bv.limit_method = "ANGLE"
    return ob


# ============================================================================ flat 2D shapes (faces, screens, lettering)


def ellipse_outline(c, a, b, rot=0.0, clips=(), segs=40):
    cu, cv = c
    cr, sr = math.cos(rot), math.sin(rot)
    pts = []
    for k in range(segs):
        th = 2 * math.pi * k / segs
        dx, dy = math.cos(th), math.sin(th)
        lx, ly = dx * cr + dy * sr, -dx * sr + dy * cr
        t = 1.0 / math.sqrt((lx / a) ** 2 + (ly / b) ** 2)
        for nx, ny, cc in clips:
            nd = nx * dx + ny * dy
            if nd > 1e-6:
                t = min(t, cc / nd)
        pts.append((cu + dx * t, cv + dy * t))
    return pts


def fan2d(outline, center, rings=5):
    verts = [center]
    n = len(outline)
    for ri in range(1, rings + 1):
        f = ri / rings
        for x, y in outline:
            verts.append((center[0] + (x - center[0]) * f, center[1] + (y - center[1]) * f))
    faces = [(0, 1 + k, 1 + (k + 1) % n) for k in range(n)]
    for ri in range(1, rings):
        b0, b1 = 1 + (ri - 1) * n, 1 + ri * n
        for k in range(n):
            k1 = (k + 1) % n
            faces.append((b0 + k, b1 + k, b1 + k1, b0 + k1))
    return verts, faces


def ribbon2d(points, widths, caps=True):
    n = len(points)
    if not hasattr(widths, "__len__"):
        widths = [widths] * n
    verts, faces = [], []
    for i, (x, y) in enumerate(points):
        i0, i1 = max(i - 1, 0), min(i + 1, n - 1)
        tx, ty = points[i1][0] - points[i0][0], points[i1][1] - points[i0][1]
        ln = math.hypot(tx, ty) or 1.0
        nx, ny = -ty / ln, tx / ln
        w = widths[i] * 0.5
        verts.append((x + nx * w, y + ny * w))
        verts.append((x - nx * w, y - ny * w))
    for i in range(n - 1):
        faces.append((2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2))
    if caps:
        for i in (0, n - 1):
            w = widths[i] * 0.5
            cv, cf = fan2d(ellipse_outline(points[i], w, w, segs=16), points[i], rings=1)
            off = len(verts)
            verts.extend(cv)
            faces.extend([tuple(off + j for j in f) for f in cf])
    return verts, faces


def taper(n, w0, w1, mid=None):
    out = []
    for i in range(n):
        t = i / (n - 1)
        w = w0 + (w1 - w0) * t
        if mid is not None:
            w += (mid - (w0 + w1) / 2) * math.sin(math.pi * t)
        out.append(w)
    return out


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
    return mesh_obj(name, bm, material, parent, smooth=True, ink=None)


def hdef(p, R):
    """Head shape: a slightly wider cranium, a flatter face plane, a touch shorter. Decals use the same map."""
    x, y, z = p
    k = max(-1.0, min(1.0, z / R))
    return (x * (1.05 + 0.04 * k), y * (0.9 if y < 0 else 1.0) * (1.0 + 0.02 * k), z * 0.96)


def head_mapper(R, off, dome=None, bulge=0.0):
    """u, v in head-radius units on the front of a sphere; an optional dome lifts eyes off the surface."""

    def m(u, v):
        o = off
        if dome is not None:
            cu, cv, a, b = dome
            d = ((u - cu) / a) ** 2 + ((v - cv) / b) ** 2
            o += bulge * max(0.0, 1.0 - d)
        uu, vv = u * R, v * R
        rr = (R + o) ** 2 - uu * uu - vv * vv
        p = (uu, -math.sqrt(max(rr, 1e-6)), vv)
        d = hdef(p, R)
        if o > 0:
            # keep the decal's lift along the deformed surface
            base = hdef((uu * R / (R + o), p[1] * R / (R + o), vv * R / (R + o)), R)
            n = Vector(d) - Vector(base)
            return tuple(Vector(base) + n)
        return d

    return m


# ============================================================================ faces

IRIS = {"you": "#6A4530", "marco": "#4D6F92", "waitress": "#5E7E3A", "cust1": "#6A4530", "cust2": "#4D6F92"}


def face_features(expr, gaze=(0.0, 0.0), iris_col="#6A4530"):
    """Held expressions. Units: head radius; u = viewer's right, v = up. Returns feature dicts."""
    F = []
    gx, gy = gaze
    E = 0.335

    def eye(side, a, b, cv=0.0, clips=(), iris=0.135, pupil=0.075, tilt=0.0):
        ce = (side * E, cv)
        dome = (ce[0], ce[1], a * 1.02, b * 1.02)
        F.append(dict(kind="poly", out=ellipse_outline(ce, a, b, side * tilt, clips), c=ce, col="eye_white", layer=0, dome=dome))
        ci = (ce[0] + gx * (a - iris) * 0.85, ce[1] + gy * (b - iris) * 0.8)

        def tclip(c):
            return [(nx, ny, cc - (nx * (c[0] - ce[0]) + ny * (c[1] - ce[1]))) for nx, ny, cc in clips]

        F.append(dict(kind="poly", out=ellipse_outline(ci, iris, iris * 1.06, 0, tclip(ci)), c=ci, col="iris_ring", layer=1, dome=dome))
        F.append(dict(kind="poly", out=ellipse_outline(ci, iris * 0.8, iris * 0.85, 0, tclip(ci)), c=ci, col=iris_col, layer=2, dome=dome))
        F.append(dict(kind="poly", out=ellipse_outline(ci, pupil, pupil * 1.05, 0, tclip(ci)), c=ci, col="pupil", layer=3, dome=dome))
        h1 = (ci[0] + iris * 0.38, ci[1] + iris * 0.42)
        F.append(dict(kind="poly", out=ellipse_outline(h1, iris * 0.3, iris * 0.32, 0, tclip(h1)), c=h1, col="highlight", layer=4, dome=dome))
        h2 = (ci[0] - iris * 0.4, ci[1] - iris * 0.38)
        F.append(dict(kind="poly", out=ellipse_outline(h2, iris * 0.13, iris * 0.13, 0, tclip(h2)), c=h2, col="highlight", layer=4, dome=dome))

    def brow(side, pts, w0=0.085, w1=0.035):
        pts = [(side * u, v) for u, v in pts]
        F.append(dict(kind="ribbon", pts=pts, w=taper(len(pts), w0, w1, mid=(w0 + w1) / 2 + 0.012), col="brow", layer=0))

    def mouth_open(w, top_v, curve, depth, teeth=0.05, tongue=True, skew=0.0):
        n = 22
        top = [(u, top_v + curve * (u / w) ** 2 + skew * (u / w)) for u in [-w + 2 * w * i / (n - 1) for i in range(n)]]
        cy_l, cy_r = top[0][1], top[-1][1]
        bot = []
        for i in range(1, n - 1):
            a = math.pi * i / (n - 1)
            u = w * math.cos(a)
            base = cy_r + (cy_l - cy_r) * i / (n - 1)
            bot.append((u, base - depth * math.sin(a)))
        outline = top + bot
        c = (0.0, top_v + curve * 0.2 - depth * 0.45)
        F.append(dict(kind="poly", out=outline, c=c, col="mouth", layer=0))
        if teeth > 0:
            tp = [(u, v - teeth * 0.55) for (u, v) in top[3:-3]]
            F.append(dict(kind="ribbon", pts=tp, w=[teeth] * len(tp), col="teeth", layer=1, caps=False))
        if tongue:
            tc = (0.0, top_v - depth * 0.78 + 0.02)
            F.append(dict(kind="poly", out=ellipse_outline(tc, w * 0.46, depth * 0.3, 0, [(0, -1, depth * 0.24)]), c=tc, col="tongue", layer=1))

    def mouth_line(pts, w=0.05):
        F.append(dict(kind="ribbon", pts=pts, w=taper(len(pts), w * 0.6, w * 0.6, mid=w), col="lip", layer=0))

    if expr == "stunned":
        for s in (1, -1):
            eye(s, 0.245, 0.3, cv=-0.02, iris=0.15, pupil=0.08)
            brow(s, [(0.16, 0.42), (0.32, 0.5), (0.47, 0.46)], 0.085, 0.04)
        mouth_open(0.23, -0.4, 0.08, 0.25, teeth=0.05)
    elif expr == "joy":
        for s in (1, -1):
            eye(s, 0.23, 0.28, cv=-0.02, clips=[(0, -1, 0.17)], iris=0.16, pupil=0.085)
            brow(s, [(0.16, 0.37), (0.32, 0.43), (0.48, 0.39)], 0.085, 0.035)
        mouth_open(0.25, -0.38, 0.09, 0.22, teeth=0.055)
    elif expr == "happy":
        for s in (1, -1):
            eye(s, 0.21, 0.26, cv=-0.03, clips=[(0, -1, 0.15)], iris=0.155, pupil=0.082)
            brow(s, [(0.16, 0.33), (0.31, 0.38), (0.46, 0.34)], 0.08, 0.035)
        mouth_open(0.19, -0.4, 0.07, 0.13, teeth=0.045, tongue=False)
    elif expr == "worried":
        n1 = (0.35, 1.0)
        ln = math.hypot(*n1)
        for s in (1, -1):
            cl = [(s * n1[0] / ln, n1[1] / ln, 0.2)]
            eye(s, 0.22, 0.28, cv=-0.03, clips=cl, iris=0.155, pupil=0.082)
            brow(s, [(0.13, 0.44), (0.29, 0.4), (0.46, 0.31)], 0.09, 0.035)
        mouth_open(0.14, -0.44, -0.02, 0.085, teeth=0.055, tongue=False)
    elif expr == "sly":
        n1 = (0.12, 1.0)
        ln = math.hypot(*n1)
        for s in (1, -1):
            cl = [(s * n1[0] / ln, n1[1] / ln, 0.07), (0, -1, 0.2)]
            eye(s, 0.22, 0.27, cv=-0.03, clips=cl, iris=0.16, pupil=0.085)
        brow(-1, [(0.14, 0.31), (0.31, 0.4), (0.47, 0.37)], 0.085, 0.035)
        brow(1, [(0.14, 0.27), (0.31, 0.28), (0.47, 0.25)], 0.085, 0.035)
        pts = [(-0.18 + 0.38 * i / 15, -0.42 + 0.12 * ((-0.18 + 0.38 * i / 15 - 0.02) / 0.2) ** 2 * (1 if i > 7 else 0.4) - 0.02 * (i / 15)) for i in range(16)]
        mouth_line(pts, 0.055)
        F.append(dict(kind="ribbon", pts=[(0.21, -0.28), (0.24, -0.32)], w=[0.03, 0.02], col="lip", layer=0))
    return F


FACE_COLS = {
    "eye_white": ("#FFFFFF", 0.22),
    "iris_ring": ("#1D1411", 0.0),
    "pupil": ("#050505", 0.0),
    "highlight": ("#FFFFFF", 1.2),
    "brow": ("#D9D2C8", 0.12),
    "mouth": ("#8C2433", 0.05),
    "teeth": ("#FFFFFF", 0.2),
    "tongue": ("#EE7C86", 0.08),
    "lip": ("#E8E0D6", 0.12),
}


def build_face(head, R, expr, gaze=(0, 0), iris="#6A4530"):
    for i, f in enumerate(face_features(expr, gaze, iris)):
        col = f["col"]
        if col in FACE_COLS:
            hexc, em = FACE_COLS[col]
        else:
            hexc, em = col, 0.05
        mat = M_flat("face_" + hexc, hexc, em)
        dome = f.get("dome")
        mapper = head_mapper(R, 0.0025 + 0.0018 * f["layer"], dome, 0.035 * R if dome else 0.0)
        if f["kind"] == "poly":
            vs, fs = fan2d(f["out"], f["c"], rings=5)
        else:
            vs, fs = ribbon2d(f["pts"], f["w"], caps=f.get("caps", True))
        shape_mesh(f"face_{head.name}_{i}", vs, fs, mapper, mat, head)


# ============================================================================ people

SKIN = PAL["skin"]


def person(name, spec, loc=(0, 0, 0), facing=0.0):
    """A cartoon figure on joint empties (~1.52 m; head a third of the height).
    Joints: hips, spine, neck, head, sh/el/wr_L/R, f{0,1,2}{a,b}_L/R, th{a,b}_L/R, hip/kn/an_L/R."""
    sk = M("skin", SKIN, "skin")
    top = M(f"top_{spec['top']}", spec["top"], "cloth")
    pants = M(f"pants_{spec['pants']}", spec["pants"], "cloth")
    J = {"spec": spec}
    root = J["root"] = empty(name, loc=loc, rot=(0, 0, facing))
    hips = J["hips"] = empty(f"{name}_hips", root, (0, 0, 0.60))
    spine = J["spine"] = empty(f"{name}_spine", hips, (0, 0, 0.0))
    # soft pear torso (the garment), elliptical section
    tp = [(0.0, -0.075), (0.13, -0.06), (0.185, -0.02), (0.2, 0.05), (0.19, 0.15), (0.172, 0.25), (0.15, 0.31), (0.1, 0.355), (0.0, 0.37)]
    tprof = smooth_prof(tp, 5)
    J["torso_prof"] = tprof
    SY = 0.8

    def torso_r(z):
        best = tprof[0][0]
        for (r0, z0), (r1, z1) in zip(tprof[:-1], tprof[1:]):
            if z0 <= z <= z1 and z1 > z0:
                return r0 + (r1 - r0) * (z - z0) / (z1 - z0)
            if z > z1:
                best = r1
        return best

    J["torso_r"] = torso_r
    lathe(f"{name}_torso", tprof, top, spine, sy=SY, segs=40)
    # pants top below the garment hem
    lathe(f"{name}_pantstop", smooth_prof([(0.0, -0.085), (0.14, -0.07), (0.19, -0.03), (0.197, 0.02), (0.0, 0.021)], 4), pants, spine, sy=SY + 0.02, segs=40)
    # soft neck, flaring into the shoulders
    lathe(f"{name}_neck", [(0.12, 0.3), (0.095, 0.34), (0.088, 0.38), (0.085, 0.41), (0.0, 0.42)], sk, spine, segs=28)
    neck = J["neck"] = empty(f"{name}_neckj", spine, (0, 0, 0.35))
    hj = J["head"] = empty(f"{name}_headj", neck, (0, 0, 0.03))
    R = 0.245
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=R)
    for v in bm.verts:
        v.co = hdef(tuple(v.co), R)
    head = mesh_obj(f"{name}_head", bm, sk, hj, (0, 0, R - 0.035), ink=0.006)
    for sx in (1, -1):
        sphere(f"{name}_ear{sx}", 0.05, sk, head, (sx * R * 1.0, 0.01, -0.01), scale=(0.45, 0.8, 1.0), segs=24, ink=0.004)
    J["headmesh"], J["R"] = head, R
    long_sleeves = spec.get("sleeves", "long") == "long"
    arm_mat = top if long_sleeves else sk
    for side, sx in (("L", 1), ("R", -1)):
        sh = J["sh_" + side] = empty(f"{name}_sh_{side}", spine, (sx * 0.165, 0, 0.27), mode="YXZ")
        sphere(f"{name}_shoulder_{side}", 0.066, top, sh, segs=28)
        limb(f"{name}_uarm_{side}", 0.066, 0.056, 0.2, arm_mat, sh)
        if not long_sleeves:
            lathe(f"{name}_sleeve_{side}", [(0.0, 0.03), (0.08, 0.02), (0.078, -0.06), (0.072, -0.1), (0.0, -0.101)], top, sh, segs=28)
            torus(f"{name}_sleevecuff_{side}", 0.07, 0.016, top, sh, (0, 0, -0.1))
        el = J["el_" + side] = empty(f"{name}_el_{side}", sh, (0, 0, -0.205), mode="YXZ")
        sphere(f"{name}_elbow_{side}", 0.056, arm_mat, el, segs=24)
        limb(f"{name}_farm_{side}", 0.056, 0.048, 0.17, arm_mat, el)
        if long_sleeves:
            cuffm = M(f"cuff_{spec.get('cuff', spec['top'])}", spec.get("cuff", spec["top"]), "cloth")
            torus(f"{name}_cuff_{side}", 0.052, 0.019, cuffm, el, (0, 0, -0.16), scale=(1, 1, 1.3))
        wr = J["wr_" + side] = empty(f"{name}_wr_{side}", el, (0, 0, -0.19), mode="YXZ")
        hand(J, name, side, sk, wr)
        hp = J["hip_" + side] = empty(f"{name}_hip_{side}", hips, (sx * 0.095, 0, -0.03), mode="YXZ")
        limb(f"{name}_thigh_{side}", 0.088, 0.072, 0.23, pants, hp)
        kn = J["kn_" + side] = empty(f"{name}_kn_{side}", hp, (0, 0, -0.235))
        limb(f"{name}_shin_{side}", 0.072, 0.06, 0.2, pants, kn)
        torus(f"{name}_hem_{side}", 0.063, 0.013, pants, kn, (0, 0, -0.2))
        an = J["an_" + side] = empty(f"{name}_an_{side}", kn, (0, 0, -0.235))
        shoe(f"{name}_shoe_{side}", spec, an)
    dress(J, name, spec, top, sk)
    return J


def hand(J, name, side, sk, wr):
    """Cartoon hand: a soft palm, three fingers and a thumb, two segments each, curlable."""
    s = 1 if side == "L" else -1
    wr = empty(f"{name}_handroot_{side}", wr, (0, 0, 0))
    wr.scale = (1.4, 1.4, 1.4)
    sphere(f"{name}_palm_{side}", 0.045, sk, wr, (0, 0, -0.045), scale=(0.7, 1.0, 1.05), segs=28, ink=0.004)
    for i, y in enumerate((-0.022, 0.0, 0.022)):
        fa = J[f"f{i}a_{side}"] = empty(f"{name}_f{i}a_{side}", wr, (0, y, -0.083), (0, 0, 0), mode="YXZ")
        L1 = 0.03 if i != 1 else 0.034
        limb(f"{name}_f{i}1_{side}", 0.0175, 0.0165, L1, sk, fa, ink=0.003, segs=16)
        fb = J[f"f{i}b_{side}"] = empty(f"{name}_f{i}b_{side}", fa, (0, 0, -L1), mode="YXZ")
        limb(f"{name}_f{i}2_{side}", 0.0165, 0.0145, 0.024, sk, fb, ink=0.003, segs=16)
    ta = J[f"tha_{side}"] = empty(f"{name}_tha_{side}", wr, (-s * 0.012, -0.036, -0.03), (0, 0, 0), mode="YXZ")
    limb(f"{name}_th1_{side}", 0.017, 0.015, 0.028, sk, ta, ink=0.003, segs=16)
    tb = J[f"thb_{side}"] = empty(f"{name}_thb_{side}", ta, (0, 0, -0.028), mode="YXZ")
    limb(f"{name}_th2_{side}", 0.015, 0.012, 0.022, sk, tb, ink=0.003, segs=16)
    J["grip_" + side] = empty(f"{name}_grip_{side}", wr, (-s * 0.035, 0, -0.085))
    pose_hand(J, side, 0.25, 0.2)


def pose_hand(J, side, curl=0.2, thumb=0.2, spread=1.0):
    s = 1 if side == "L" else -1
    for i in range(3):
        J[f"f{i}a_{side}"].rotation_euler = Euler((0, s * 55 * curl * D2R, (i - 1) * 8 * spread * D2R))
        J[f"f{i}b_{side}"].rotation_euler = Euler((0, s * 70 * curl * D2R, 0))
    J[f"tha_{side}"].rotation_euler = Euler((-38 * D2R, s * (25 + 35 * thumb) * D2R, 0))
    J[f"thb_{side}"].rotation_euler = Euler((0, s * 40 * thumb * D2R, 0))


def shoe(name, spec, an):
    sole = M("sole", "#EFE6D6", "rubber")
    up = M(f"shoe_{spec['shoes']}", spec["shoes"], "satin")
    rbox(f"{name}_sole", (0.13, 0.25, 0.04), 0.018, sole, an, (0, -0.045, -0.06), ink=0.004)
    sphere(f"{name}_upper", 0.062, up, an, (0, -0.045, -0.03), scale=(1.0, 1.85, 0.95), segs=28, ink=0.004)
    sphere(f"{name}_toe", 0.056, up, an, (0, -0.12, -0.04), scale=(1.05, 1.1, 0.78), segs=24, ink=0.004)
    torus(f"{name}_collar", 0.058, 0.012, up, an, (0, 0.0, 0.0), scale=(1, 1.2, 1))
    for k in range(3):
        rbox(f"{name}_lace{k}", (0.05, 0.012, 0.008), 0.003, M("lace", "#F4F0E6", "cloth"), an, (0, -0.07 - 0.025 * k, 0.012 - 0.012 * k), rot=(-25, 0, 0), ink=None)


def dress(J, name, spec, top, sk):
    spine = J["spine"]
    head = J["headmesh"]
    R = J["R"]
    tr = J["torso_r"]
    SY = 0.8
    # garment hem and collar
    hem_col = M(f"hem_{spec.get('cuff', spec['top'])}", spec.get("cuff", spec["top"]), "cloth")
    torus(f"{name}_hemring", 1.0, 0.017, hem_col, spine, (0, 0, 0.03), scale=(tr(0.03) + 0.004, (tr(0.03) + 0.004) * SY, 1), nv=10)
    if spec.get("hood"):
        torus(f"{name}_hoodroll", 0.118, 0.04, top, spine, (0, 0.015, 0.345), scale=(1.0, 0.95, 1.0))
        sphere(f"{name}_hood", 0.15, top, spine, (0, 0.12, 0.35), scale=(1.1, 0.6, 0.62), segs=32)
        for sx in (1, -1):
            sweep(f"{name}_string{sx}", [(sx * 0.045, -0.14, 0.33), (sx * 0.05, -0.16, 0.25), (sx * 0.048, -0.165, 0.2)], 0.007, M("string", "#F4F0E6", "cloth"), spine)
    if spec.get("collar"):
        torus(f"{name}_collar", 0.105, 0.022, top, spine, (0, 0, 0.35), scale=(1, 0.9, 1))
    if spec.get("apron"):
        am = M("apron", "#F7F4EE", "cloth")
        tie = M("apron_tie", "#E9E3D8", "cloth")

        def rbib(z):
            return tr(min(z, 0.3)) + 0.012

        body_panel(f"{name}_apronbib", rbib, SY, 0.1, 0.27, -90 - 33, -90 + 33, 0.012, am, spine)

        def rskirt(z):
            zc = max(z, 0.0)
            return tr(min(zc, 0.12)) + 0.014 + 0.22 * max(0.0, 0.02 - z)

        body_panel(f"{name}_apronskirt", rskirt, SY, -0.25, 0.11, -90 - 58, -90 + 58, 0.012, am, spine)
        body_panel(f"{name}_apronpocket", lambda z: rskirt(z) + 0.012, SY, -0.08, 0.02, -90 - 22, -90 + 22, 0.008, am, spine)
        # waist tie around the back with a bow, neck strap
        torus(f"{name}_apronwaist", 1.0, 0.011, tie, spine, (0, 0, 0.1), scale=(tr(0.1) + 0.018, (tr(0.1) + 0.018) * SY, 1.2), nv=8)
        by = (tr(0.1) + 0.02) * SY
        for sx in (1, -1):
            torus(f"{name}_bow{sx}", 0.035, 0.01, tie, spine, (sx * 0.035, by + 0.005, 0.1), rot=(90, 0, sx * 20), scale=(1.0, 0.55, 1.0), nv=8)
            sweep(f"{name}_bowtail{sx}", [(sx * 0.01, by + 0.01, 0.095), (sx * 0.03, by + 0.025, 0.03), (sx * 0.04, by + 0.03, -0.04)], [0.012, 0.011, 0.009], tie, spine, flat=0.4)
            sweep(f"{name}_strap{sx}", [(sx * 0.065, -tr(0.27) * SY - 0.01, 0.27), (sx * 0.07, -0.09, 0.34), (sx * 0.06, 0.0, 0.38), (0.0, 0.07, 0.4)], 0.009, tie, spine, flat=0.5)
    if spec.get("waist_apron"):
        am = M("apron", "#F7F4EE", "cloth")

        def rw(z):
            return tr(max(min(z, 0.1), 0.0)) + 0.014 + 0.2 * max(0.0, 0.0 - z)

        body_panel(f"{name}_wapron", rw, SY, -0.2, 0.08, -90 - 50, -90 + 50, 0.01, am, spine)
        torus(f"{name}_wtie", 1.0, 0.01, am, spine, (0, 0, 0.075), scale=(tr(0.075) + 0.016, (tr(0.075) + 0.016) * SY, 1), nv=8)
    if spec.get("skirt"):
        skm = M(f"skirt_{spec['skirt']}", spec["skirt"], "cloth")
        lathe(f"{name}_skirt", smooth_prof([(0.0, 0.05), (0.2, 0.05), (0.215, 0.0), (0.24, -0.1), (0.265, -0.2), (0.25, -0.215), (0.0, -0.215)], 4), skm, spine, sy=0.85, segs=44)
    if spec.get("scarf"):
        sc = M(f"scarf_{spec['scarf']}", spec["scarf"], "cloth")
        sc2 = M(f"scarf2_{spec['scarf']}", "#118A7E", "cloth")
        torus(f"{name}_scarf1", 0.108, 0.046, sc, spine, (0, 0.0, 0.345), rot=(-8, 4, 0), scale=(1.0, 0.92, 1.0), nv=16)
        torus(f"{name}_scarf2", 0.1, 0.04, sc2, spine, (0, 0.01, 0.39), rot=(6, -5, 20), scale=(1.0, 0.92, 1.0), nv=16)
        sphere(f"{name}_scarfknot", 0.05, sc, spine, (0.06, -0.105, 0.33), scale=(1.0, 0.75, 1.0), segs=24)
        sweep(f"{name}_scarftail1", [(0.06, -0.12, 0.32), (0.075, -0.17, 0.24), (0.08, -0.18, 0.15), (0.075, -0.18, 0.08)], [0.045, 0.048, 0.05, 0.048], sc, spine, flat=0.32)
        sweep(f"{name}_scarftail2", [(0.065, -0.11, 0.32), (0.11, -0.15, 0.25), (0.13, -0.155, 0.19)], [0.04, 0.043, 0.042], sc2, spine, flat=0.32)
        for k in range(4):
            sweep(f"{name}_fringe{k}", [(0.052 + 0.016 * k, -0.18, 0.06), (0.054 + 0.016 * k, -0.182, 0.035)], 0.006, sc, spine, ink=None)
    hd = spec.get("hair")
    if hd == "tuft":
        hm = M("hair_dark", "#1E1612", "satin")
        pts = [(0.0, 0.06, R * 0.9), (0.0, 0.02, R * 1.0), (0.0, -0.04, R * 1.06), (0.0, -0.1, R * 1.02), (0.0, -0.135, R * 0.9), (0.0, -0.12, R * 0.78), (0.0, -0.085, R * 0.78), (0.0, -0.075, R * 0.85)]
        rad = [0.06, 0.06, 0.055, 0.046, 0.036, 0.026, 0.018, 0.01]
        sweep(f"{name}_tuft", pts, rad, hm, head, flat=0.85)
        sweep(f"{name}_tuft2", [(0.05, 0.08, R * 0.85), (0.08, 0.04, R * 0.95), (0.11, 0.0, R * 0.93)], [0.04, 0.028, 0.01], hm, head, flat=0.7)
    if hd == "bob_bun":
        hm = M(f"hair_{spec.get('hair_col', '#6E3524')}", spec.get("hair_col", "#6E3524"), "satin")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=R * 1.08)
        kill = [v for v in bm.verts if v.co.y < -R * 0.2 and v.co.z < R * 0.5]
        bmesh.ops.delete(bm, geom=kill, context="VERTS")
        hob = mesh_obj(f"{name}_bob", bm, hm, head, (0, 0.025, 0.02), ink=0.005)
        sv = hob.modifiers.new("thick", "SOLIDIFY")
        sv.thickness = 0.02
        sweep(f"{name}_lock", [(0.1, -R * 0.5, R * 0.95), (0.19, -R * 0.62, R * 0.72), (0.24, -R * 0.55, R * 0.45), (0.25, -R * 0.45, R * 0.25)], [0.04, 0.045, 0.035, 0.01], hm, head, flat=0.5)
        sphere(f"{name}_bun", 0.085, hm, head, (0, 0.11, R + 0.06), segs=32)
        torus(f"{name}_scrunchie", 0.068, 0.018, M("scrunchie", PAL["crimson"], "cloth"), head, (0, 0.085, R + 0.0), rot=(-35, 0, 0), nv=10)
    if spec.get("paper_hat"):
        pm = M("paper", "#FBF9F4", "paper")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=1.0)
        kill = [v for v in bm.verts if v.co.z < -0.02]
        bmesh.ops.delete(bm, geom=kill, context="VERTS")
        for v in bm.verts:
            z = max(v.co.z, 0.0)
            v.co.y *= (1.0 - z) ** 0.8
            v.co.x *= 0.21 * (1.0 - 0.55 * z)
            v.co.y *= 0.145
            v.co.z *= 0.22
        hat = mesh_obj(f"{name}_paperhat", bm, pm, head, (0.02, 0.01, R * 0.8), rot=(0, -14, 0), ink=0.005)
        hs = hat.modifiers.new("thick", "SOLIDIFY")
        hs.thickness = 0.008
        torus(f"{name}_hatband", 1.0, 0.017, pm, hat, (0, 0, 0.015), scale=(0.2, 0.145, 1.3), nv=8)
        sphere(f"{name}_hatdot", 0.02, M("hatdot", PAL["crimson"], "paper"), hat, (0.0, -0.075, 0.06), scale=(1, 0.4, 1), ink=None)
    if spec.get("cap"):
        cm = M(f"cap_{spec['cap']}", spec["cap"], "cloth")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=R * 1.06)
        kill = [v for v in bm.verts if v.co.z < R * 0.12]
        bmesh.ops.delete(bm, geom=kill, context="VERTS")
        cap = mesh_obj(f"{name}_cap", bm, cm, head, (0, 0.01, 0.02), ink=0.005)
        cap.modifiers.new("thick", "SOLIDIFY").thickness = 0.012
        sphere(f"{name}_capbutton", 0.018, cm, head, (0, 0.01, R * 1.08))
        lathe(f"{name}_capbill", [(0.0, 0.0), (0.15, 0.0), (0.155, 0.012), (0.0, 0.014)], cm, head, (0, -R * 0.92, R * 0.28), rot=(-12, 0, 0), sx=1.0, sy=0.7, segs=40)
    if spec.get("beanie"):
        bmn = M(f"beanie_{spec['beanie']}", spec["beanie"], "cloth")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=R * 1.07)
        kill = [v for v in bm.verts if v.co.z < R * 0.2]
        bmesh.ops.delete(bm, geom=kill, context="VERTS")
        b = mesh_obj(f"{name}_beanie", bm, bmn, head, (0, 0.01, 0.02), ink=0.005)
        b.modifiers.new("thick", "SOLIDIFY").thickness = 0.014
        torus(f"{name}_beaniefold", R * 0.98, 0.035, bmn, head, (0, 0.01, R * 0.27), nv=12)
        sphere(f"{name}_pom", 0.055, bmn, head, (0, 0.02, R * 1.13), segs=24)
    if spec.get("pencil"):
        pen = empty(f"{name}_pencilj", head, (-R * 1.0, 0.02, R * 0.32), (55, 30, 0))
        cyl(f"{name}_pencil", 0.013, 0.2, M("pencil", "#F6C531", "plastic"), pen, segs=6, ink=0.003)
        cyl(f"{name}_pencilwood", 0.013, 0.03, M("pencilwood", "#E9C99A", "wood"), pen, (0, 0, 0.115), r2=0.004, segs=6, ink=0.003)
        cyl(f"{name}_pencillead", 0.004, 0.012, M("lead", "#2A2A2A", "plastic"), pen, (0, 0, 0.134), r2=0.0005, segs=6, ink=None)
        cyl(f"{name}_ferrule", 0.0135, 0.018, M("chrome", PAL["chrome"], "chrome"), pen, (0, 0, -0.108), segs=12, ink=None)
        sphere(f"{name}_eraser", 0.0135, M("eraser", "#F08CA0", "rubber"), pen, (0, 0, -0.12), scale=(1, 1, 1.0), segs=12, ink=None)


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


def look(J, nod=0, tilt=0, turn=0, lean=0, lean_side=0):
    J["head"].rotation_euler = Euler((nod * D2R, tilt * D2R, turn * D2R))
    J["spine"].rotation_euler = Euler((lean * D2R, lean_side * D2R, 0))


def sit(J):
    for s in ("L", "R"):
        leg(J, s, flex=85, abduct=8, knee=88, ankle=-5)


# ============================================================================ props

CHROME = None


def burger(name, parent=None, loc=(0, 0, 0), s=1.0, rot=(0, 0, 0)):
    root = empty(name, parent, loc, rot)
    bun = M("bun", PAL["bun"], "food")
    bunb = M("bun_base", "#D88B34", "food")
    lathe(f"{name}_bunbot", [(0.0, 0.0), (0.075 * s, 0.002 * s), (0.085 * s, 0.014 * s), (0.083 * s, 0.026 * s), (0.0, 0.027 * s)], bunb, root, segs=32, ink=0.003)
    lathe(f"{name}_patty", [(0.0, 0.026 * s), (0.088 * s, 0.027 * s), (0.094 * s, 0.04 * s), (0.089 * s, 0.054 * s), (0.0, 0.055 * s)], M("patty", PAL["patty"], "food"), root, segs=32, ripple=(0.03, 9), ink=0.003)
    ch = rbox(f"{name}_cheese", (0.145 * s, 0.145 * s, 0.007 * s), 0.003, M("cheese", PAL["cheese"], "food"), root, (0, 0, 0.058 * s), rot=(0, 0, 45), ink=0.002)
    ch.modifiers.new("drape", "SIMPLE_DEFORM").deform_method = "BEND"
    lathe(f"{name}_lettuce", [(0.0, 0.06 * s), (0.104 * s, 0.062 * s), (0.1 * s, 0.072 * s), (0.0, 0.07 * s)], M("lettuce", PAL["lettuce"], "food"), root, segs=48, ripple=(0.07, 11), ink=0.002)
    lathe(f"{name}_tomato", [(0.0, 0.07 * s), (0.08 * s, 0.071 * s), (0.08 * s, 0.081 * s), (0.0, 0.082 * s)], M("tomato", PAL["tomato"], "food"), root, segs=32, ink=0.002)
    lathe(f"{name}_buntop", smooth_prof([(0.0, 0.08 * s), (0.086 * s, 0.081 * s), (0.09 * s, 0.1 * s), (0.075 * s, 0.13 * s), (0.04 * s, 0.145 * s), (0.0, 0.148 * s)], 4), bun, root, segs=36, ink=0.003)
    seed = M("seed", "#FFF3D2", "food")
    rnd = random.Random(hash(name) & 0xFFFF)
    for i in range(9):
        a = rnd.uniform(0, 2 * math.pi)
        rr = rnd.uniform(0.15, 0.75)
        x, y = rr * 0.07 * s * math.cos(a), rr * 0.07 * s * math.sin(a)
        z = 0.08 * s + 0.066 * s * math.sqrt(max(0.0, 1 - (rr * 0.85) ** 2))
        sphere(f"{name}_seed{i}", 0.006 * s, seed, root, (x, y, z), scale=(1.5, 0.7, 0.6), rot=(0, 0, a / D2R), segs=8, ink=None)
    return root


def plate(name, parent=None, loc=(0, 0, 0)):
    return lathe(name, [(0.0, 0.0), (0.1, 0.0), (0.125, 0.012), (0.155, 0.018), (0.158, 0.024), (0.15, 0.024), (0.12, 0.016), (0.0, 0.012)], M("plate", "#FCFBF7", "ceramic"), parent, loc, segs=48, ink=0.003)


def cash_fan(name, parent, loc, rot, s=1.0, n=6, spread=15):
    root = empty(name, parent, loc, rot)
    for i in range(n):
        a = (i - (n - 1) / 2) * spread
        piv = empty(f"{name}_piv{i}", root, (0, 0.0025 * i, 0), (0, a, 0))
        rbox(f"{name}_bill{i}", (0.075 * s, 0.002, 0.17 * s), 0.003, M("cash" if i % 2 else "cash_b", PAL["cash"] if i % 2 else "#A6DB98", "paper"), piv, (0, 0, 0.075 * s), ink=0.002)
        for sy in (-1, 1):
            rbox(f"{name}_inset{i}{sy}", (0.058 * s, 0.001, 0.14 * s), 0.002, M("cash_dark", PAL["cash_dark"], "paper"), piv, (0, sy * 0.0015, 0.075 * s), ink=None)
        cyl(f"{name}_oval{i}", 0.019 * s, 0.001, M("cash_light", "#B9E2AE", "paper"), piv, (0, -0.0025, 0.075 * s), rot=(90, 0, 0), segs=20, ink=None)
        for k in (-1, 1):
            rbox(f"{name}_num{i}{k}", (0.012 * s, 0.001, 0.016 * s), 0.002, M("cash_light", "#B9E2AE", "paper"), piv, (0.017 * s * k, -0.0025, 0.075 * s + 0.055 * s * k), ink=None)
    return root


def spatula(name, parent, loc=(0, 0, 0), rot=(0, 0, 0)):
    root = empty(name, parent, loc, rot)
    lathe(f"{name}_handle", smooth_prof([(0.0, -0.06), (0.014, -0.058), (0.017, 0.0), (0.015, 0.07), (0.012, 0.1), (0.0, 0.102)], 3), M("handle_wood", "#8A5A36", "wood", tex=("wood", "#5E3A20")), root, segs=16, ink=0.003)
    cyl(f"{name}_ferrule", 0.013, 0.03, M("chrome", PAL["chrome"], "chrome"), root, (0, 0, -0.075), segs=16, ink=0.003)
    rbox(f"{name}_neck", (0.012, 0.006, 0.07), 0.003, M("chrome", PAL["chrome"], "chrome"), root, (0, 0, -0.12), ink=0.002)
    bl = empty(f"{name}_bladej", root, (0, 0, -0.15), (-25, 0, 0))
    rbox(f"{name}_blade", (0.11, 0.005, 0.13), 0.01, M("chrome", PAL["chrome"], "chrome"), bl, (0, 0, -0.06), ink=0.003)
    for k in (-1, 0, 1):
        rbox(f"{name}_slot{k}", (0.008, 0.007, 0.06), 0.003, M("slot", "#3A3F46", "metal"), bl, (0.03 * k, 0, -0.06), ink=None)
    return root, bl


# ============================================================================ robots


def robot(name, loc=(0, 0, 0), facing=0.0):
    steel = M("robot_steel", PAL["steel"], "metal", tex=("brushed",))
    dark = M("robot_dark", PAL["steel_dark"], "metal")
    trim = M("robot_trim", "#2F343B", "satin")
    scr = M("robot_screen", PAL["screen"], "glossy", emit=0.5, emit_color="#0F2C44")
    cyan = M_emit("robot_cyan", PAL["cyan"], 7.0)
    bulb = M_emit("robot_bulb", PAL["mustard"], 5.0)
    J = {}
    root = J["root"] = empty(name, loc=loc, rot=(0, 0, facing))
    for sx in (1, -1):
        limb(f"{name}_leg{sx}", 0.07, 0.06, 0.26, dark, root, (sx * 0.12, 0, 0.36))
        sphere(f"{name}_foot{sx}", 0.08, dark, root, (sx * 0.12, -0.04, 0.05), scale=(1.0, 1.4, 0.65))
    body = J["body"] = empty(f"{name}_bodyj", root, (0, 0, 0.36))
    lathe(f"{name}_body", smooth_prof([(0.0, 0.0), (0.2, 0.01), (0.255, 0.08), (0.265, 0.3), (0.25, 0.5), (0.17, 0.585), (0.0, 0.6)], 5), steel, body, sy=0.82, segs=48)
    torus(f"{name}_waistband", 0.262, 0.016, trim, body, (0, 0, 0.12), scale=(1, 0.82, 1))
    rbox(f"{name}_chest", (0.24, 0.04, 0.16), 0.05, scr, body, (0, -0.205, 0.33))
    sphere(f"{name}_chestlight", 0.03, cyan, body, (-0.05, -0.226, 0.34), scale=(1, 0.5, 1), ink=None)
    for k in range(3):
        sphere(f"{name}_dot{k}", 0.012, M_emit(f"dot{k}", ["#FF5A5A", "#FFC83A", "#5FE6FF"][k], 4.0), body, (0.03 + 0.03 * k, -0.226, 0.34), scale=(1, 0.5, 1), ink=None)
    cyl(f"{name}_neck", 0.055, 0.08, trim, body, (0, 0, 0.62))
    head = J["head"] = empty(f"{name}_headj", body, (0, 0, 0.64))
    rbox(f"{name}_headbox", (0.5, 0.36, 0.38), 0.12, steel, head, (0, 0, 0.2))
    rbox(f"{name}_bezel", (0.43, 0.03, 0.3), 0.09, trim, head, (0, -0.175, 0.2))
    rbox(f"{name}_screen", (0.39, 0.03, 0.26), 0.08, scr, head, (0, -0.185, 0.2))
    yf = -0.2005

    def mp(u, v):
        return (u, yf - 0.001, 0.2 + v)

    for s in (1, -1):
        vs, fs = ribbon2d(arc((s * 0.085, -0.03), 0.055, 15, 165, n=20), taper(20, 0.026, 0.026, mid=0.034))
        shape_mesh(f"face_{name}_arc{s}", vs, fs, mp, cyan, head)
    vs, fs = fan2d(ellipse_outline((0, -0.085), 0.028, 0.016, clips=[(0, 1, 0.0)]), (0, -0.092), rings=2)
    shape_mesh(f"face_{name}_smile", vs, fs, mp, cyan, head)
    for sx in (1, -1):
        cyl(f"{name}_ear{sx}", 0.06, 0.05, dark, head, (sx * 0.27, 0, 0.2), rot=(0, 90, 0), bevel=0.012)
        cyl(f"{name}_earlight{sx}", 0.025, 0.01, cyan, head, (sx * 0.298, 0, 0.2), rot=(0, 90, 0), ink=None)
    cyl(f"{name}_antenna", 0.01, 0.14, dark, head, (0.08, 0, 0.44), rot=(0, 8, 0))
    sphere(f"{name}_bulb", 0.03, bulb, head, (0.09, 0, 0.52), ink=None)
    for side, sx in (("L", 1), ("R", -1)):
        sh = J["sh_" + side] = empty(f"{name}_sh_{side}", body, (sx * 0.29, 0, 0.45), mode="YXZ")
        sphere(f"{name}_shball_{side}", 0.065, dark, sh)
        limb(f"{name}_uarm_{side}", 0.048, 0.042, 0.22, steel, sh)
        el = J["el_" + side] = empty(f"{name}_el_{side}", sh, (0, 0, -0.23), mode="YXZ")
        sphere(f"{name}_elball_{side}", 0.05, dark, el)
        limb(f"{name}_farm_{side}", 0.042, 0.038, 0.2, steel, el)
        wr = J["wr_" + side] = empty(f"{name}_wr_{side}", el, (0, 0, -0.22), mode="YXZ")
        sphere(f"{name}_wrball_{side}", 0.04, dark, wr)
        cyl(f"{name}_palm_{side}", 0.045, 0.03, trim, wr, (0, 0, -0.035))
        for k in range(3):
            a = k * 120 * D2R
            cx, cy = 0.032 * math.cos(a), 0.032 * math.sin(a)
            sweep(f"{name}_claw{side}{k}", [(cx, cy, -0.045), (cx * 1.4, cy * 1.4, -0.075), (cx * 0.9, cy * 0.9, -0.105)], [0.013, 0.011, 0.008], dark, wr)
        J["grip_" + side] = empty(f"{name}_grip_{side}", wr, (0, 0, -0.085))
    return J


# ============================================================================ the diner and the plant


def build_set(day):
    teal = M("teal", PAL["teal"], "plastic")
    teal_d = M("teal_dark", PAL["teal_dark"], "plastic")
    chrome = M("chrome", PAL["chrome"], "chrome")
    tile = M("wall_tile", "#F1ECE1", "ceramic", tex=("tile", "#B9B1A3", 0.15))
    tile_teal = M("wall_tile_teal", "#2FA597", "ceramic", tex=("tile", "#1C6E66", 0.15))
    paint = M("wall_paint", "#E9D3A8" if day else "#C9A66E", "paint", tex=("speckle", "#D8BE8E" if day else "#B8955E", 0.92))
    wood = M("wood_edge", "#B7773F", "wood", tex=("wood", "#7E4A22"))
    lam = M("laminate", "#F4EEE2", "glossy", tex=("speckle", "#D9CDB8", 0.88))
    steel = M("back_steel", "#A7B0BA", "metal", tex=("brushed",))
    floor = M("floor", "#F1E8D6", "glossy", tex=("checker", "#202229", 1.6))
    ceil = M("ceiling", "#2E2A2C" if not day else "#E8E2D6", "paint")

    rbox("floor", (30, 30, 0.02), 0, floor, None, (0, -6, -0.01), ink=None)
    # counter
    x0, x1 = -4.5, 5.0
    w = x1 - x0
    cx = (x0 + x1) / 2
    rbox("counter_body", (w, 0.6, 0.84), 0.01, teal_d, None, (cx, 0.0, 0.47), ink=0.01)
    rbox("counter_kick", (w, 0.6, 0.08), 0.01, chrome, None, (cx, -0.015, 0.04), ink=None)
    rbox("counter_top", (w + 0.05, 0.78, 0.05), 0.012, lam, None, (cx, -0.08, 0.925), ink=0.01)
    rbox("counter_wood", (w + 0.08, 0.05, 0.065), 0.02, wood, None, (cx, -0.47, 0.92), ink=0.006)
    rbox("counter_trim", (w + 0.08, 0.03, 0.016), 0.006, chrome, None, (cx, -0.47, 0.88), ink=None)
    n = int(w / 0.75)
    pw = w / n
    for i in range(n):
        x = x0 + pw * (i + 0.5)
        rbox(f"counter_panel{i}", (pw - 0.06, 0.03, 0.68), 0.02, teal, None, (x, -0.31, 0.48), ink=0.004)
        for k in range(3):
            cyl(f"counter_rib{i}_{k}", 0.012, 0.6, teal_d, None, (x - pw * 0.25 + pw * 0.25 * k, -0.33, 0.48), segs=12, ink=None)
        rbox(f"counter_div{i}", (0.022, 0.035, 0.72), 0.008, chrome, None, (x0 + pw * i, -0.315, 0.48), ink=None)
    # stools
    seat = M("stool_seat", PAL["teal"], "satin")
    for i, x in enumerate([-3.2, -2.4, -1.6, -0.8, 0.0, 0.8, 1.6, 2.4, 3.2, 4.0]):
        lathe(f"stool_base{i}", [(0.0, 0.0), (0.2, 0.0), (0.2, 0.012), (0.12, 0.04), (0.05, 0.06), (0.0, 0.065)], chrome, None, (x, -0.85, 0), segs=40, ink=0.004)
        cyl(f"stool_pole{i}", 0.03, 0.55, chrome, None, (x, -0.85, 0.33), segs=20, ink=0.004)
        lathe(f"stool_cup{i}", [(0.0, 0.58), (0.05, 0.585), (0.17, 0.605), (0.19, 0.615), (0.0, 0.616)], chrome, None, (x, -0.85, 0), segs=40, ink=0.004)
        lathe(f"stool_seat{i}", smooth_prof([(0.0, 0.61), (0.19, 0.612), (0.205, 0.64), (0.2, 0.675), (0.15, 0.69), (0.0, 0.693)], 4), seat, None, (x, -0.85, 0), segs=40, ink=0.005)
        torus(f"stool_piping{i}", 0.2, 0.008, chrome, None, (x, -0.85, 0.645), ink=None)
    # back counter, grill, coffee machine
    rbox("back_counter", (9.6, 0.6, 0.9), 0.015, steel, None, (0.3, 2.25, 0.45), ink=0.008)
    rbox("grill_top", (2.0, 0.5, 0.025), 0.008, M("grill", "#1C1C1F", "metal"), None, (1.3, 2.22, 0.912), ink=None)
    for i in range(4):
        lathe(f"grill_patty{i}", [(0.0, 0.0), (0.07, 0.0), (0.075, 0.012), (0.07, 0.022), (0.0, 0.023)], M("patty", PAL["patty"], "food"), None, (0.6 + 0.45 * i, 2.22, 0.925), segs=24, ripple=(0.04, 8), ink=None)
    cm = M("coffee_body", "#C9312E", "plastic")
    rbox("coffee_machine", (0.5, 0.4, 0.55), 0.06, cm, None, (-1.8, 2.3, 1.175), ink=0.006)
    rbox("coffee_panel", (0.4, 0.02, 0.14), 0.02, M("coffee_panel", "#1D1D20", "glossy"), None, (-1.8, 2.09, 1.33), ink=None)
    for k in range(2):
        sphere(f"coffee_light{k}", 0.014, M_emit(f"coffee_led{k}", ["#FF6A3A", "#7CFF8A"][k], 6), None, (-1.92 + 0.08 * k, 2.075, 1.33), ink=None)
        x = -1.92 + 0.24 * k
        lathe(f"carafe{k}", smooth_prof([(0.0, 0.0), (0.07, 0.005), (0.085, 0.06), (0.06, 0.14), (0.045, 0.17), (0.05, 0.19), (0.0, 0.19)], 3), M_glass("carafe_glass", "#E6F0F2", 0.25), None, (x, 2.13, 0.9), segs=28, ink=None)
        lathe(f"coffee{k}", [(0.0, 0.006), (0.072, 0.008), (0.08, 0.06), (0.0, 0.062)], M("coffee", "#3A1F12", "glossy"), None, (x, 2.13, 0.9), segs=24, ink=None)
    # steam over the carafes (soft, held)
    steam = M("steam", "#FFFFFF", "paper", alpha=0.22)
    for k in range(2):
        x = -1.92 + 0.24 * k
        sweep(f"steam{k}", [(x, 2.13, 1.12), (x + 0.03, 2.12, 1.22), (x - 0.02, 2.11, 1.32), (x + 0.02, 2.1, 1.42)], [0.02, 0.03, 0.035, 0.012], steam, None, ink=None)
    # back wall: teal tiles low, white tiles to the window, painted above
    wy = 2.62
    rbox("wall_low", (16, 0.1, 0.9), 0, tile_teal, None, (0, wy, 0.45), ink=None)
    rbox("wall_mid", (16, 0.1, 0.2), 0, tile, None, (0, wy, 1.0), ink=None)
    rbox("wall_high", (16, 0.1, 0.65), 0, paint, None, (0, wy, 3.625), ink=None)
    rbox("wall_left", (4.4, 0.1, 2.2), 0, paint, None, (-5.8, wy, 2.2), ink=None)
    rbox("wall_right", (4.4, 0.1, 2.2), 0, paint, None, (5.8, wy, 2.2), ink=None)
    rbox("wall_stripe", (16, 0.13, 0.1), 0.01, teal, None, (0, wy - 0.01, 3.36), ink=None)
    rbox("wall_stripe2", (16, 0.13, 0.04), 0.01, chrome, None, (0, wy - 0.01, 3.3), ink=None)
    for x in (-3.6, -1.8, 0.0, 1.8, 3.6):
        rbox(f"mullion{x}", (0.08, 0.14, 2.2), 0.02, chrome, None, (x, wy - 0.02, 2.2), ink=0.004)
    rbox("sill", (7.4, 0.26, 0.06), 0.02, chrome, None, (0, wy - 0.07, 1.1), ink=0.004)
    rbox("lintel", (7.4, 0.16, 0.06), 0.02, chrome, None, (0, wy - 0.03, 3.29), ink=None)
    rbox("glass", (7.2, 0.01, 2.18), 0, M_glass("glass", "#CFE3EA", 0.05), None, (0, wy, 2.2), ink=None).visible_shadow = False
    # door with porthole on the right wall section
    rbox("door", (0.95, 0.07, 2.25), 0.03, M("door", PAL["teal"], "plastic"), None, (4.55, wy - 0.07, 1.125), ink=0.006)
    cyl("door_window", 0.22, 0.02, M("door_glass", "#BFDCE8" if day else "#1E3446", "glossy"), None, (4.55, wy - 0.115, 1.6), rot=(90, 0, 0), segs=40, ink=None)
    torus("door_porthole", 0.22, 0.025, chrome, None, (4.55, wy - 0.12, 1.6), rot=(90, 0, 0))
    rbox("door_handle", (0.035, 0.06, 0.28), 0.015, chrome, None, (4.18, wy - 0.14, 1.05))
    # clock
    lathe("clock_face", [(0.0, 0.0), (0.24, 0.0), (0.24, 0.03), (0.0, 0.03)], M("clock_face", "#FFFDF4", "ceramic", emit=0.1 if not day else 0.0, emit_color="#FFF6E2"), None, (4.55, wy - 0.06, 3.0), rot=(90, 0, 0), segs=48, ink=None)
    torus("clock_rim", 0.245, 0.03, M("clock_rim", PAL["crimson"], "plastic"), None, (4.55, wy - 0.09, 3.0), rot=(90, 0, 0))
    hand_m = M("clock_hand", "#1A1A1A", "plastic")
    for k in range(12):
        a = k * 30 * D2R
        rbox(f"clock_tick{k}", (0.012, 0.005, 0.03 if k % 3 else 0.045), 0.002, hand_m, None, (4.55 + 0.2 * math.sin(a), wy - 0.095, 3.0 + 0.2 * math.cos(a)), rot=(0, -k * 30, 0), ink=None)
    rbox("clock_hour", (0.022, 0.006, 0.12), 0.006, hand_m, None, (4.55 + 0.045, wy - 0.1, 3.03), rot=(0, -60 if not day else -330, 0), ink=None)
    rbox("clock_min", (0.016, 0.006, 0.18), 0.006, hand_m, None, (4.55, wy - 0.105, 3.08), ink=None)
    # menu board with lettering shapes
    rbox("menu_frame", (1.6, 0.05, 1.05), 0.03, wood, None, (-4.6, wy - 0.06, 2.35))
    rbox("menu_board", (1.48, 0.03, 0.93), 0.02, M("menu_board", "#1F2329", "paint"), None, (-4.6, wy - 0.09, 2.35), ink=None)
    ink_c = M("menu_chalk", "#F3EEE2", "paint", emit=0.25 if not day else 0.0)
    ink_m = M("menu_mustard", PAL["mustard"], "paint", emit=0.25 if not day else 0.0)
    rnd = random.Random(3)
    rbox("menu_title", (0.7, 0.005, 0.09), 0.02, ink_m, None, (-4.6, wy - 0.108, 2.72), ink=None)
    for row in range(6):
        z = 2.55 - row * 0.1
        x = -5.22
        words = rnd.randint(2, 3)
        for wd in range(words):
            letters = rnd.randint(3, 6)
            for le in range(letters):
                lw = rnd.choice((0.018, 0.022, 0.026))
                lh = rnd.choice((0.035, 0.045, 0.045, 0.055))
                rbox(f"menu_l{row}_{wd}_{le}", (lw, 0.004, lh), 0.005, ink_c, None, (x + lw / 2, wy - 0.108, z + (lh - 0.045) / 2), ink=None)
                x += lw + 0.008
            x += 0.03
        for k in range(3):
            rbox(f"menu_price{row}_{k}", (0.022, 0.004, 0.045), 0.005, ink_m, None, (-4.08 + k * 0.03, wy - 0.108, z), ink=None)
    # ceiling, side walls
    rbox("ceiling", (16, 14, 0.1), 0, ceil, None, (0, -3, 3.95), ink=None)
    rbox("side_left", (0.1, 14, 4.0), 0, paint, None, (-8, -3, 2.0), ink=None)
    rbox("side_right", (0.1, 14, 4.0), 0, paint, None, (8, -3, 2.0), ink=None)
    # pendant lamps
    shade = M("lamp_shade", PAL["teal"], "glossy")
    bulbm = M_emit("lamp_bulb", "#FFD9A0", 30.0 if not day else 6.0)
    lamps = []
    for i, x in enumerate([-2.6, -0.3, 1.65, 3.5]):
        cyl(f"lamp_cord{i}", 0.007, 1.0, M("cord", "#111111", "rubber"), None, (x, -0.05, 3.45), segs=8, ink=None)
        lathe(f"lamp_shade{i}", smooth_prof([(0.0, 0.32), (0.05, 0.32), (0.07, 0.25), (0.16, 0.12), (0.26, 0.02), (0.27, 0.0)], 4), shade, None, (x, -0.05, 2.62), segs=48, ink=0.005).modifiers.new("solid", "SOLIDIFY").thickness = 0.008
        cyl(f"lamp_cap{i}", 0.05, 0.05, chrome, None, (x, -0.05, 2.96), segs=24, ink=None)
        sphere(f"lamp_bulb{i}", 0.06, bulbm, None, (x, -0.05, 2.66), segs=20, ink=None)
        lamps.append((x, -0.05, 2.6))
    # counter props: napkin dispenser, ketchup, mustard, salt and pepper, sugar
    for i, x in enumerate([-2.6, 0.45, 3.7]):
        rbox(f"napkin_box{i}", (0.12, 0.09, 0.13), 0.02, chrome, None, (x, -0.33, 1.015))
        rbox(f"napkin{i}", (0.09, 0.03, 0.05), 0.005, M("napkin", "#FFFFFF", "paper"), None, (x, -0.33, 1.09), ink=None)
        lathe(f"ketchup{i}", smooth_prof([(0.0, 0.0), (0.03, 0.0), (0.032, 0.1), (0.02, 0.14), (0.008, 0.17), (0.0, 0.175)], 3), M("ketchup", "#D62A2A", "glossy"), None, (x + 0.13, -0.3, 0.95), segs=20, ink=0.003)
        lathe(f"mustardb{i}", smooth_prof([(0.0, 0.0), (0.03, 0.0), (0.032, 0.1), (0.02, 0.14), (0.008, 0.17), (0.0, 0.175)], 3), M("mustard_bottle", "#F2C12E", "glossy"), None, (x + 0.2, -0.28, 0.95), segs=20, ink=0.003)
        for k, c in enumerate(("#FFFFFF", "#2A2A2A")):
            lathe(f"shaker{i}{k}", [(0.0, 0.0), (0.022, 0.0), (0.022, 0.07), (0.016, 0.085), (0.0, 0.088)], M_glass("shaker_glass", "#FFFFFF", 0.35), None, (x - 0.13 - 0.05 * k, -0.32, 0.95), segs=16, ink=None)
            cyl(f"shakerfill{i}{k}", 0.019, 0.05, M(f"salt{k}", c, "food"), None, (x - 0.13 - 0.05 * k, -0.32, 0.98), segs=16, ink=None)
            cyl(f"shakertop{i}{k}", 0.017, 0.02, chrome, None, (x - 0.13 - 0.05 * k, -0.32, 1.035), r2=0.01, segs=16, ink=None)
    return lamps


def build_outside(day):
    hz = "#9FB7CE" if day else "#4B4F86"
    sky = bpy.data.materials.new("sky")
    nt, out = _nodes(sky)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position = 0.47
    cr.elements[0].color = srgb("#F4E6CF" if day else "#8C5E86")
    cr.elements[1].position = 0.75
    cr.elements[1].color = srgb("#6FA8DC" if day else "#16204A")
    e = cr.elements.new(0.55)
    e.color = srgb("#BFDDF2" if day else "#3E4A8C")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 1.3 if day else 1.0
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], em.inputs[0])
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    dome = lathe("sky_dome", [(0.0, -40), (150, -40), (150, 80), (0.0, 80)], sky, None, (0, 20, 0), segs=48, ink=None)
    dome.visible_shadow = False
    ground = M("ground", "#B5AA92" if day else "#22262E", "paint")
    road = M("road", "#5F5E5B" if day else "#191B20", "paint", tex=("speckle", "#4A4946" if day else "#121418", 0.9))
    side = M("sidewalk", "#CFC6B4" if day else "#3A3D45", "paint", tex=("tile", "#A9A190" if day else "#2A2C32", 1.2))
    rbox("ground_out", (160, 120, 0.1), 0, ground, None, (0, 60, -0.06), ink=None)
    rbox("sidewalk", (160, 3.0, 0.12), 0, side, None, (0, 4.6, 0.0), ink=None)
    rbox("road", (160, 8, 0.02), 0, road, None, (0, 10, 0.0), ink=None)
    dash = M("dash", "#E9D27C", "paint", emit=0.4 if not day else 0.0)
    for i in range(-12, 13):
        rbox(f"dash{i}", (1.6, 0.16, 0.01), 0, dash, None, (i * 4.0, 10, 0.016), ink=None)
    # parked cars
    for i, (x, col) in enumerate([(-4.5, "#2E7FB8"), (3.2, "#E0B23A")]):
        car(f"car{i}", (x, 7.4, 0), col, day)
    # street lamps
    for i, x in enumerate([-8.0, -1.0, 6.0]):
        cyl(f"slamp_post{i}", 0.07, 4.4, M("lamp_post", "#2A2D33", "metal"), None, (x, 5.6, 2.2), segs=12, ink=None)
        sweep(f"slamp_arm{i}", [(x, 5.6, 4.35), (x, 6.0, 4.6), (x, 6.5, 4.55)], 0.05, M("lamp_post", "#2A2D33", "metal"), None, ink=None)
        sphere(f"slamp_head{i}", 0.2, M_emit("street_bulb", "#FFD58A", 12.0) if not day else M("street_bulb_off", "#EDEAE0", "glossy"), None, (x, 6.5, 4.45), scale=(1.4, 1, 0.6), segs=16, ink=None)
        if not day:
            add_light(f"streetlight{i}", "POINT", (x, 6.5, 4.2), 700, "#FFC77A", 0.3, shadow=False)
    # fence along the plant
    post = M("fence", "#6B717A" if day else "#3A3F48", "metal")
    for i in range(-30, 31):
        cyl(f"fpost{i}", 0.04, 1.8, post, None, (i * 0.8, 15.0, 0.9), segs=8, ink=None)
    for z in (0.3, 1.0, 1.7):
        cyl(f"frail{z}", 0.02, 48, post, None, (0, 15.0, z), rot=(0, 90, 0), segs=8, ink=None)
    # plant in three depths
    wall_n = M("shed_near", "#C88E62" if day else "#6A5049", "paint", tex=("brick", "#B77E55" if day else "#5D4540"))
    wall_m = M("shed_mid", "#BE9A7C" if day else "#4F4252", "paint")
    wall_f = M("shed_far", "#B7AAA0" if day else "#3A3650", "paint")
    roofm = M("shed_roof", "#8E6448" if day else "#352B2E", "paint")
    win_on = M_emit("win_on", "#FFC062", 9.0)
    win_cool = M_emit("win_cool", "#BFE0FF", 6.0)
    win_day = M("win_day", "#3F4D5C", "glossy")
    layers = [
        (wall_n, 18.0, [(-11.0, 7.5, 5.2), (-3.0, 7.0, 5.8), (4.6, 6.5, 4.8), (11.5, 7.0, 5.5)], 1.0),
        (wall_m, 30.0, [(-14.0, 9.0, 7.5), (-4.5, 8.0, 8.2), (5.0, 9.0, 7.2), (14.5, 8.0, 8.0)], 0.8),
        (wall_f, 46.0, [(-18.0, 12.0, 10.0), (-4.0, 12.0, 11.0), (10.0, 12.0, 9.5)], 0.6),
    ]
    for li, (wm, y, sheds, lit) in enumerate(layers):
        for si, (x, w, h) in enumerate(sheds):
            nm = f"shed{li}_{si}"
            rbox(nm, (w, 8, h), 0.05, wm, None, (x, y + 4, h / 2), ink=None)
            nt_ = 4
            for t in range(nt_):
                bm = bmesh.new()
                v = [bm.verts.new(p) for p in [(0, 0, 0), (w / nt_, 0, 0), (0, 0, 1.4), (0, 8, 0), (w / nt_, 8, 0), (0, 8, 1.4)]]
                bm.faces.new((v[0], v[1], v[2]))
                bm.faces.new((v[3], v[5], v[4]))
                bm.faces.new((v[0], v[3], v[4], v[1]))
                bm.faces.new((v[1], v[4], v[5], v[2]))
                bm.faces.new((v[2], v[5], v[3], v[0]))
                mesh_obj(f"{nm}_tooth{t}", bm, roofm, None, (x - w / 2 + t * w / nt_, y, h), smooth=False, ink=None)
                rbox(f"{nm}_sky{t}", (0.04, 7.6, 1.05), 0, win_on if not day else win_day, None, (x - w / 2 + t * w / nt_ + 0.06, y + 4, h + 0.62), ink=None)
            rows = max(2, int(h / 1.4))
            cols = int(w / 1.0)
            for r in range(rows):
                for c in range(cols):
                    on = (si * 7 + r * 3 + c * 5 + li) % 5 != 0
                    m_ = (win_on if (c + r + si) % 4 else win_cool) if (not day and on) else win_day
                    rbox(f"{nm}_w{r}_{c}", (0.6, 0.05, 0.62), 0.02, m_, None, (x - w / 2 + 0.6 + c * (w - 1.2) / max(cols - 1, 1), y - 0.03, 1.0 + r * (h - 1.6) / max(rows - 1, 1)), ink=None)
    rbox("gate_beam", (4.0, 0.4, 0.5), 0.05, M("gate_beam", PAL["mustard"], "paint", emit=0.0 if day else 1.0), None, (0.5, 15.2, 2.6), ink=None)
    for sx in (-1, 1):
        rbox(f"gate_post{sx}", (0.35, 0.35, 2.8), 0.04, roofm, None, (0.5 + sx * 1.9, 15.2, 1.4), ink=None)
    # chimneys with smoke
    chm = M("chimney", "#A76A58" if day else "#6E4A44", "paint", tex=("brick", "#8E5646" if day else "#5A3C38"))
    band = M("chimney_band", "#ECE6DA", "paint")
    smoke = M("smoke", "#F1F0EE" if day else "#9A9BB5", "paper", alpha=0.6, emit=0.0 if day else 0.5, emit_color="#7E80A2")
    for ci, (x, y, h) in enumerate([(7.0, 24.0, 9.0), (-6.5, 34.0, 12.0), (15.0, 44.0, 14.0)]):
        cyl(f"chimney{ci}", 0.75, h, chm, None, (x, y, h / 2), r2=0.55, segs=28, ink=None)
        for k in range(2):
            cyl(f"chimneyband{ci}{k}", 0.62 - 0.03 * k, 0.35, band, None, (x, y, h * 0.6 + k * 1.2), r2=0.6 - 0.03 * k, segs=28, ink=None)
        sphere(f"chimneylight{ci}", 0.1, M_emit("red_light", "#FF2A2A", 14.0), None, (x, y - 0.6, h + 0.1), segs=10, ink=None)
        rnd = random.Random(ci)
        for k in range(9):
            t = k / 8
            p = (x + 3.5 * t + rnd.uniform(-0.3, 0.3), y + 0.6 * t, h + 0.6 + 4.5 * t ** 0.8)
            s = 0.55 + 1.6 * t ** 0.7
            sphere(f"smoke{ci}_{k}", 1.0, smoke, None, p, scale=(s, s * 0.85, s * 0.75), segs=18, ink=None).visible_shadow = False
    if not day:
        sphere("moon", 1.7, M_emit("moon", "#F5EFD8", 4.0), None, (-17, 70, 15), segs=24, ink=None)
        rnd = random.Random(11)
        star = M_emit("star", "#FFFFFF", 6.0)
        for k in range(70):
            sphere(f"star{k}", rnd.uniform(0.04, 0.09), star, None, (rnd.uniform(-60, 60), 110, rnd.uniform(12, 55)), segs=6, ink=None)


def car(name, loc, color, day):
    root = empty(name, None, loc)
    body = M(f"car_{color}", color, "glossy")
    rbox(f"{name}_body", (3.9, 1.7, 0.6), 0.25, body, root, (0, 0, 0.6), ink=None)
    rbox(f"{name}_cabin", (2.2, 1.5, 0.55), 0.3, body, root, (-0.2, 0, 1.08), ink=None)
    rbox(f"{name}_glass", (2.0, 1.52, 0.38), 0.2, M("car_glass", "#26313D", "glossy"), root, (-0.2, 0, 1.12), ink=None)
    for sx in (-1.25, 1.25):
        for sy in (-0.82, 0.82):
            cyl(f"{name}_wheel{sx}{sy}", 0.34, 0.22, M("tyre", "#1A1A1A", "rubber"), root, (sx, sy, 0.34), rot=(90, 0, 0), bevel=0.06, ink=None)
    if not day:
        for sy in (-0.55, 0.55):
            sphere(f"{name}_tail{sy}", 0.07, M_emit("taillight", "#FF3A3A", 3.0), root, (-1.96, sy, 0.7), ink=None)


# ============================================================================ lights, camera, compositor


def add_light(name, kind, loc, energy, color="#FFFFFF", size=0.5, target=None, spot=None, shadow=True, volume=1.0):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = srgb(color)[:3]
    ld.use_shadow = shadow
    try:
        ld.volume_factor = (0.0 if volume == 1.0 else volume) if STYLE == "cine" else volume
    except Exception:
        pass
    if kind == "AREA":
        ld.size = size
    elif kind == "SUN":
        ld.angle = size
    else:
        ld.shadow_soft_size = size
    if kind == "SPOT" and spot:
        ld.spot_size = spot * D2R
        ld.spot_blend = 0.5
    ob = link(bpy.data.objects.new(name, ld))
    ob.location = loc
    if target is not None:
        ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob


def camera(loc, target, lens, fstop=None, focus=None, shift=(0, 0)):
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_width = 36
    cd.shift_x, cd.shift_y = shift
    cd.clip_start = 0.05
    cd.clip_end = 400
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.aperture_blades = 7
        if isinstance(focus, bpy.types.Object):
            cd.dof.focus_object = focus
        else:
            cd.dof.focus_distance = focus
    ob = link(bpy.data.objects.new("cam", cd))
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = ob
    return ob


def setup_render():
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    w, h = (int(x) for x in ARGS.res.split("x"))
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    ee = sc.eevee
    ee.taa_render_samples = ARGS.samples
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
    vs = sc.view_settings
    vs.view_transform = "AgX"
    vs.look = "AgX - Punchy" if STYLE in ("toy", "clay") else ("AgX - Base Contrast" if STYLE == "cine" else "None")
    if STYLE == "toon":
        vs.view_transform = "Standard"
        vs.look = "None"
    vs.exposure = (-0.6 if STYLE == "cine" else -0.35) if MOOD == "day" and STYLE != "toon" else 0.0
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    world = bpy.data.worlds.new("world")
    sc.world = world
    try:
        world.use_nodes = True
    except Exception:
        pass
    bg = [n for n in world.node_tree.nodes if n.type == "BACKGROUND"][0]
    bg.inputs["Color"].default_value = srgb("#C9DDF0") if MOOD == "day" else srgb("#26305A")
    bg.inputs["Strength"].default_value = 0.8 if MOOD == "day" else 0.35
    world.mist_settings.start = 9.0
    world.mist_settings.depth = 45.0
    world.mist_settings.falloff = "QUADRATIC"
    sc.view_layers[0].use_pass_mist = True
    if STYLE == "cine":
        ee.volumetric_tile_size = "2"
        ee.volumetric_samples = 64
        ee.use_volumetric_shadows = True
        ee.volumetric_shadow_samples = 32
        ee.volumetric_end = 25.0
        ee.volumetric_light_clamp = 0.0
    compositor()


def _mix(tree, blend, fac, a, b):
    mx = tree.nodes.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    mx.blend_type = blend
    ins = [s for s in mx.inputs if s.enabled]
    if isinstance(fac, float):
        ins[0].default_value = fac
    else:
        tree.links.new(fac, ins[0])
    if isinstance(a, tuple):
        ins[1].default_value = a
    else:
        tree.links.new(a, ins[1])
    if isinstance(b, tuple):
        ins[2].default_value = b
    else:
        tree.links.new(b, ins[2])
    return [s for s in mx.outputs if s.enabled][0]


def compositor():
    sc = bpy.context.scene
    tree = bpy.data.node_groups.new("comp", "CompositorNodeTree")
    sc.compositing_node_group = tree
    rl = tree.nodes.new("CompositorNodeRLayers")
    img = rl.outputs["Image"]
    # haze on the far plant (mist pass: the diner interior is nearer than the mist start)
    haze = srgb("#C8D6E4") if MOOD == "day" else srgb("#4E5288")
    mf = tree.nodes.new("ShaderNodeMath")
    mf.operation = "MULTIPLY"
    mf.inputs[1].default_value = 0.55 if MOOD == "day" else 0.45
    tree.links.new(rl.outputs["Mist"], mf.inputs[0])
    img = _mix(tree, "MIX", mf.outputs[0], img, haze)
    gl = tree.nodes.new("CompositorNodeGlare")
    try:
        gl.inputs["Type"].default_value = "Bloom"
    except Exception:
        pass
    gl.inputs["Threshold"].default_value = 1.4 if STYLE != "toon" else 1.8
    gl.inputs["Strength"].default_value = {"toy": 0.45, "toon": 0.25, "clay": 0.35, "cine": 0.7}[STYLE] * (1.0 if MOOD == "night" else 0.6)
    gl.inputs["Size"].default_value = 0.7
    tree.links.new(img, gl.inputs["Image"])
    img = gl.outputs["Image"]
    if STYLE == "cine":
        cb = tree.nodes.new("CompositorNodeColorBalance")
        cols = [s for s in cb.inputs if s.type == "RGBA" and s.name != "Image"]
        tree.links.new(img, cb.inputs["Image"])
        # lift towards teal, gain towards warm
        named = {s.name: s for s in cols}
        if "Lift" in named:
            named["Lift"].default_value = (0.9, 1.0, 1.08, 1)
        if "Gain" in named:
            named["Gain"].default_value = (1.12, 1.0, 0.86, 1)
        img = [s for s in cb.outputs if s.enabled][0]
    hs = tree.nodes.new("CompositorNodeHueSat")
    hs.inputs["Saturation"].default_value = {"toy": 1.12, "toon": 1.08, "clay": 1.2, "cine": 1.0}[STYLE]
    tree.links.new(img, hs.inputs["Image"])
    img = hs.outputs["Image"]
    # vignette
    el = tree.nodes.new("CompositorNodeEllipseMask")
    try:
        el.inputs["Size"].default_value = (0.9, 0.85)
    except Exception:
        pass
    bl = tree.nodes.new("CompositorNodeBlur")
    try:
        bl.inputs["Size"].default_value = (220, 220)
    except Exception:
        pass
    tree.links.new(el.outputs[0], bl.inputs["Image"])
    vk = {"toy": 0.25, "toon": 0.12, "clay": 0.3, "cine": 0.45}[STYLE]
    mr = tree.nodes.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value = 1.0 - vk
    tree.links.new(bl.outputs[0], mr.inputs["Value"])
    img = _mix(tree, "MULTIPLY", 1.0, img, mr.outputs[0])
    out = tree.nodes.new("NodeGroupOutput")
    tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    tree.links.new(img, out.inputs[0])


def clay_lumps():
    """Clay only: a faint, static hand-made unevenness on characters and props (never animated)."""
    if STYLE != "clay":
        return
    tex = bpy.data.textures.new("lumps", "CLOUDS")
    tex.noise_scale = 0.06
    for ob in list(bpy.data.objects):
        if ob.type != "MESH" or not ob.get("ink") or ob.name.startswith("face_"):
            continue
        if len(ob.data.vertices) < 200:
            continue
        d = ob.modifiers.new("lumps", "DISPLACE")
        d.texture = tex
        d.texture_coords = "GLOBAL"
        d.strength = 0.006
        d.mid_level = 0.5


def haze_box():
    """Cine: a volume of haze filling the diner only, so window light and lamp cones become shafts."""
    m = bpy.data.materials.new("haze")
    nt, out = _nodes(m)
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Density"].default_value = 0.09 if MOOD == "night" else 0.035
    vol.inputs["Anisotropy"].default_value = 0.55
    vol.inputs["Color"].default_value = (1, 1, 1, 1)
    nt.links.new(vol.outputs[0], out.inputs["Volume"])
    if MOOD == "night":
        b = rbox("haze_box", (15.8, 9.0, 3.85), 0, m, None, (0, -1.9, 1.95), ink=None)
    else:
        b = rbox("haze_box", (15.8, 2.4, 3.85), 0, m, None, (0, 1.4, 1.95), ink=None)
    b.visible_shadow = False


def ink_pass():
    """Toon only: an inverted-hull ink outline on every object that asked for one."""
    if STYLE != "toon":
        return
    ink = M_ink()
    for ob in list(bpy.data.objects):
        t = ob.get("ink")
        if ob.type != "MESH" or not t:
            continue
        ob.data.materials.append(ink)
        s = ob.modifiers.new("ink", "SOLIDIFY")
        s.thickness = t * 1.25
        s.offset = 1.0
        s.use_flip_normals = True
        s.use_rim = False
        s.material_offset = len(ob.data.materials) - 1


# ============================================================================ casts and shots

YOU = dict(top="#F5C42C", cuff="#DDA51A", pants=PAL["navy"], shoes=PAL["crimson"], hood=True, apron=True, scarf=PAL["teal"], hair="tuft")
MARCO = dict(top="#6F8FB3", cuff="#5C7A9C", pants="#3B4252", shoes="#2B2B2B", sleeves="short", collar=True, apron=True, paper_hat=True)
WAITRESS = dict(top=PAL["peach"] if "peach" in PAL else "#F4A987", pants="#3A2E3A", shoes=PAL["crimson"], sleeves="short", collar=True, skirt=PAL["crimson"], waist_apron=True, hair="bob_bun", pencil=True)
CUST1 = dict(top="#7F93B0", cuff="#6B7E99", pants="#2E3440", shoes="#5A3B2A", collar=True, cap=PAL["crimson"])
CUST2 = dict(top="#6E9E64", cuff="#5A8752", pants="#3B3F4A", shoes="#222222", beanie="#EDE6D6")
WAITRESS["top"] = "#F4A987"


def lights_common(day, key_target, rim_target):
    """Three-point light per style; colours carry the mood."""
    if STYLE == "toon":
        add_light("key", "SUN", (0, 0, 10), 3.2 if day else 2.4, "#FFF1DE" if day else "#FFD6A8", 0.05, target=(key_target[0] + 0.6, key_target[1] + 0.8, key_target[2] - 1.0))
        add_light("fill", "AREA", (key_target[0] + 3, key_target[1] - 4, 2.0), 180, "#C9D8FF", 4, target=key_target, shadow=False)
        return
    warm = "#FFE2C2"
    rimc = "#7FD8FF" if not day else "#FFE7C2"
    if STYLE == "clay":
        rimc = "#FFC58A"
    add_light("key", "AREA", (key_target[0] - 1.8, key_target[1] - 2.2, key_target[2] + 1.6), 150 if not day else 170, warm, 2.2, target=key_target)
    add_light("fill", "AREA", (key_target[0] + 2.4, key_target[1] - 2.6, key_target[2] + 0.3), 70, "#B8C8FF" if not day else "#FFFFFF", 3.0, target=key_target, shadow=False)
    add_light("rim", "AREA", (rim_target[0] + 0.8, rim_target[1] + 1.6, rim_target[2] + 1.3), 260 if STYLE != "clay" else 160, rimc, 1.2, target=rim_target, shadow=False)
    add_light("rim2", "AREA", (rim_target[0] - 1.0, rim_target[1] + 1.4, rim_target[2] + 0.9), 160 if STYLE != "clay" else 100, rimc, 1.0, target=rim_target, shadow=False)
    add_light("bounce", "AREA", (key_target[0], key_target[1] - 0.6, 0.3), 70, "#FFD6A8", 2.0, target=(key_target[0], key_target[1], key_target[2] + 0.5), shadow=False)


def build_opening():
    lamps = build_set(False)
    build_outside(False)
    neon_cup()
    ctop = 0.955
    xs = [1.0, 1.75, 2.5, 3.25]
    robots = []
    for i, x in enumerate(xs):
        r = robot(f"robot{i}", (x, 0.85, 0.0), facing=-6 + 4 * i)
        r["root"].scale = (1.18, 1.18, 1.18)
        robots.append(r)
        # arm up with spatula, burger flipped high
        arm(r, "L", abduct=14, flex=150, elbow=25, wrist=(-30, 0, 0))
        arm(r, "R", abduct=12, flex=40, elbow=60)
        r["head"].rotation_euler = Euler((-8 * D2R, 0, (-6 + 3 * i) * D2R))
        sp, bl = spatula(f"spat{i}", r["grip_L"], (0, 0, 0), (180, 0, 0))
        bpy.context.view_layer.update()
        bp = bl.matrix_world.translation
        burger(f"fly{i}", None, (bp.x + 0.02, bp.y - 0.02, bp.z + 0.38 + 0.07 * (i % 2)), rot=(-28 + 18 * i, 12 * (i - 1.5), 0))
    rnd = random.Random(5)
    for i, x in enumerate(xs + [0.25]):
        for j, (dx, dy) in enumerate(((-0.22, -0.2), (0.2, -0.12))):
            if x == 0.25 and j > 0:
                continue
            plate(f"plate{i}_{j}", None, (x + dx, dy, ctop))
            burger(f"pile{i}_{j}", None, (x + dx, dy, ctop + 0.012), rot=(0, 0, rnd.uniform(0, 360)))
            if (i + j) % 3 == 1:
                burger(f"pile{i}_{j}b", None, (x + dx, dy, ctop + 0.012 + 0.135), s=0.96, rot=(0, 0, rnd.uniform(0, 360)))
    you = person("you", YOU, loc=(0.4, -2.2, 0.0), facing=8)
    build_face(you["headmesh"], you["R"], "stunned", gaze=(0.05, 0.15), iris=IRIS["you"])
    arm(you, "L", abduct=128, flex=18, elbow=28, elbow_up=22, wrist=(0, 10, 0))
    arm(you, "R", abduct=132, flex=14, elbow=22, elbow_up=25, wrist=(0, 10, 0))
    pose_hand(you, "L", 0.65, 0.65)
    pose_hand(you, "R", 0.18, 0.15, spread=1.1)
    look(you, nod=-6, tilt=-4, lean=-5)
    leg(you, "L", abduct=5)
    leg(you, "R", abduct=5)
    cash_fan("cash", you["grip_L"], (0.0, -0.01, 0.0), (0, 0, 180), s=1.25, spread=20)
    lights_common(False, (0.4, -2.2, 1.3), (0.4, -2.2, 1.2))
    for i, (x, y, z) in enumerate(lamps):
        add_light(f"pendant{i}", "SPOT", (x, y, z), 380 if STYLE != "clay" else 460, "#FFDDB0", 0.06, target=(x, y + 0.1, 0), spot=70 if STYLE == "cine" else 80, volume=1.2 if STYLE == "cine" else 1.0)
    add_light("robot_rim", "AREA", (2.1, 2.0, 2.4), 260, "#7FA8FF", 5.0, target=(2.1, 0.85, 1.4), shadow=False)
    add_light("grill_glow", "AREA", (1.3, 1.9, 0.75), 50, "#FF8A3A", 2.2, target=(1.3, 0.5, 1.5), shadow=False)
    add_light("counter_wash", "AREA", (1.5, -1.2, 3.7), 160, "#FFD9A8", 6, target=(1.5, -0.3, 0.0))
    if STYLE == "cine":
        add_light("moon_shafts", "SUN", (0, 30, 20), 2.2, "#8FB0FF", 0.005, target=(-0.8, -3.5, -1.0), volume=2.5)
    fstop = {"toy": 2.8, "toon": None, "clay": 0.9, "cine": 1.8}[STYLE]
    camera((1.05, -4.35, 1.2), (1.25, 1.0, 1.42), lens=30, fstop=fstop, focus=you["headmesh"], shift=(0.0, 0.0))
    return you


def neon_cup():
    neon = M_emit("neon", "#FF4B5C", 12.0)
    ny = 2.42

    def nmap(u, v):
        return (u, ny, v)

    cup = [(-0.3, 0.24), (-0.25, -0.17), (-0.19, -0.25), (0.19, -0.25), (0.25, -0.17), (0.3, 0.24)]
    pts = []
    for (ax, ay), (bx, by) in zip(cup[:-1], cup[1:]):
        for k in range(6):
            t = k / 6
            pts.append((ax + (bx - ax) * t, ay + (by - ay) * t))
    pts.append(cup[-1])
    x0, z0 = -1.15, 2.85
    pieces = [pts, arc((0.34, 0.03), 0.1, -80, 90, n=14), [(-0.36, 0.24), (0.36, 0.24)]]
    for k in range(3):
        pieces.append([(-0.11 + 0.11 * k + 0.035 * math.sin(i / 7 * 2 * math.pi), 0.34 + 0.05 * i) for i in range(8)])
    for k, ps in enumerate(pieces):
        sweep(f"neon_{k}", [(x0 + u, ny, z0 + v) for u, v in ps], 0.018, neon, None, segs=10, ink=None)
    add_light("neon_glow", "POINT", (x0, ny - 0.3, z0), 35, "#FF4A5A", 0.4, shadow=False)
    del nmap


def build_day():
    build_set(True)
    build_outside(True)
    ctop = 0.955
    marco = person("marco", MARCO, loc=(0.45, 1.35, 0.0), facing=62)
    build_face(marco["headmesh"], marco["R"], "worried", gaze=(0.55, 0.2), iris=IRIS["marco"])
    arm(marco, "L", abduct=18, flex=55, elbow=70, wrist=(0, 0, 0))
    arm(marco, "R", abduct=28, flex=35, elbow=90, elbow_up=20)
    pose_hand(marco, "L", 0.8, 0.7)
    pose_hand(marco, "R", 0.15, 0.1, spread=1.6)
    look(marco, nod=-4, tilt=8, turn=0, lean=4)
    spatula("marco_spat", marco["grip_L"], (0, 0, 0), (180, 0, 0))
    rb = robot("robot_day", (1.45, 1.4, 0.0), facing=-48)
    arm(rb, "L", abduct=18, flex=120, elbow=30, wrist=(-25, 0, 0))
    arm(rb, "R", abduct=10, flex=40, elbow=55)
    rb["head"].rotation_euler = Euler((-5 * D2R, 0, 0))
    sp, bl = spatula("robot_spat", rb["grip_L"], (0, 0, 0), (180, 0, 0))
    bpy.context.view_layer.update()
    bp = bl.matrix_world.translation
    burger("robot_burger", None, (bp.x + 0.1, bp.y - 0.05, bp.z + 0.42), rot=(-35, 10, 0))
    wt = person("waitress", WAITRESS, loc=(-0.45, 0.85, 0.0), facing=40)
    build_face(wt["headmesh"], wt["R"], "sly", gaze=(0.75, 0.05), iris=IRIS["waitress"])
    arm(wt, "L", abduct=14, flex=45, elbow=85, twist=10)
    arm(wt, "R", abduct=20, flex=15, elbow=40)
    pose_hand(wt, "L", 0.75, 0.6)
    pose_hand(wt, "R", 0.5, 0.4)
    look(wt, nod=-3, tilt=-6, turn=12)
    pad = empty("notepad", wt["grip_L"], (0, 0, 0), (0, 0, 90))
    rbox("notepad_paper", (0.1, 0.012, 0.13), 0.006, M("notepad", "#FFFDF2", "paper"), pad, (0, -0.01, -0.03), ink=0.003)
    rbox("notepad_bind", (0.104, 0.016, 0.02), 0.006, M("notepad_bind", PAL["crimson"], "plastic"), pad, (0, -0.01, 0.04), ink=0.003)
    # pass shelf with heat lamps behind the waitress
    chrome = M("chrome", PAL["chrome"], "chrome")
    rbox("pass_shelf", (1.1, 0.36, 0.035), 0.01, chrome, None, (-1.75, 0.1, 1.45))
    for sx in (-2.25, -1.25):
        cyl(f"pass_post{sx}", 0.018, 0.5, chrome, None, (sx, 0.1, 1.2), segs=12)
    for hx in (-2.0, -1.5):
        lathe(f"heat_lamp{hx}", [(0.0, 0.0), (0.1, 0.0), (0.06, 0.1), (0.0, 0.11)], M("heat_lamp", "#C62C2C", "glossy"), None, (hx, 0.1, 1.78), segs=24)
        sphere(f"heat_bulb{hx}", 0.04, M_emit("heat_bulb", "#FF6A3A", 8.0), None, (hx, 0.1, 1.79), ink=None)
        cyl(f"heat_cord{hx}", 0.006, 1.5, M("cord", "#111111", "rubber"), None, (hx, 0.1, 2.6), segs=8, ink=None)
        plate(f"shelf_plate{hx}", None, (hx, 0.1, 1.47))
        burger(f"shelf_burger{hx}", None, (hx, 0.1, 1.482))
    # customers: one over the shoulder, turned to the robot (cheek and eye visible); one eating, mid-ground
    c1 = person("cust1", CUST1, loc=(2.4, -0.88, 0.1), facing=172)
    sit(c1)
    arm(c1, "L", abduct=10, flex=48, elbow=50)
    arm(c1, "R", abduct=12, flex=40, elbow=55)
    pose_hand(c1, "L", 0.4, 0.3)
    pose_hand(c1, "R", 0.4, 0.3)
    look(c1, turn=82, nod=-4, lean=6)
    build_face(c1["headmesh"], c1["R"], "joy", gaze=(0.5, 0.15), iris=IRIS["cust1"])
    c2 = person("cust2", CUST2, loc=(0.0, -0.88, 0.1), facing=185)
    sit(c2)
    arm(c2, "L", abduct=10, flex=70, elbow=95)
    arm(c2, "R", abduct=10, flex=50, elbow=60)
    pose_hand(c2, "L", 0.7, 0.6)
    look(c2, turn=-80, nod=-4)
    build_face(c2["headmesh"], c2["R"], "happy", gaze=(-0.5, 0.1), iris=IRIS["cust2"])
    burger("cust2_burger", c2["grip_L"], (0, 0.0, -0.02), rot=(90, 0, 0), s=0.9)
    for x, y in ((2.4, -0.18), (0.0, -0.18)):
        plate(f"cust_plate{x}", None, (x, y, ctop))
    burger("cust1_burger", None, (2.4, -0.18, ctop + 0.012))
    lathe("coffee_cup", smooth_prof([(0.0, 0.0), (0.035, 0.0), (0.045, 0.04), (0.05, 0.09), (0.0, 0.09)], 3), M("cup", "#FCFBF7", "ceramic"), None, (2.1, -0.25, ctop), segs=24)
    torus("cup_handle", 0.025, 0.007, M("cup", "#FCFBF7", "ceramic"), None, (2.155, -0.25, ctop + 0.05), rot=(90, 0, 0))
    lights_common(True, (0.8, 1.2, 1.25), (0.9, 1.3, 1.2))
    if STYLE == "cine":
        add_light("sun", "SUN", (-20, 30, 12), 7.0, "#FFE2B0", 0.01, target=(1.5, -2.0, 0.2), volume=1.4)
    else:
        add_light("sun", "SUN", (0, 30, 20), 4.0, "#FFEBCC", 0.02, target=(-2.5, -0.5, -1.5))
    add_light("window_sky", "AREA", (0.5, 2.4, 2.3), 240 if STYLE != "cine" else 150, "#DDEBFF", 7, target=(0.5, -1.0, 1.0), shadow=False)
    add_light("ceiling_wash", "AREA", (0.5, -0.5, 3.8), 220 if STYLE != "cine" else 90, "#FFF2DC", 7, target=(0.5, -0.5, 0))
    fstop = {"toy": 1.8, "toon": None, "clay": 0.7, "cine": 1.5}[STYLE]
    camera((1.85, -2.95, 1.42), (0.62, 1.2, 1.3), lens=42, fstop=fstop, focus=marco["headmesh"])


def build_charsheet():
    """A design line-up: the four people and a robot, neutral studio light."""
    floor = M("studio_floor", "#E9E4DA", "paint")
    rbox("studio", (20, 20, 0.02), 0, floor, None, (0, 0, -0.01), ink=None)
    rbox("studio_back", (20, 0.1, 8), 0, M("studio_back", "#5E7D96", "paint"), None, (0, 3, 4), ink=None)
    you = person("you", YOU, (-1.6, 0, 0), 10)
    build_face(you["headmesh"], you["R"], "stunned", gaze=(0, 0.1), iris=IRIS["you"])
    arm(you, "L", abduct=128, flex=18, elbow=28, elbow_up=22, wrist=(0, 10, 0))
    arm(you, "R", abduct=132, flex=14, elbow=22, elbow_up=25, wrist=(0, 10, 0))
    pose_hand(you, "L", 0.65, 0.65)
    pose_hand(you, "R", 0.1, 0.05, spread=2.2)
    look(you, nod=-6, tilt=-4, lean=-5)
    cash_fan("cash", you["grip_L"], (0, -0.01, 0), (0, 0, 180), s=1.25, spread=20)
    mc = person("marco", MARCO, (-0.55, 0, 0), 0)
    build_face(mc["headmesh"], mc["R"], "worried", gaze=(0.3, 0.1), iris=IRIS["marco"])
    arm(mc, "L", abduct=15, flex=50, elbow=70)
    arm(mc, "R", abduct=20, flex=10, elbow=20)
    pose_hand(mc, "L", 0.8, 0.7)
    spatula("mspat", mc["grip_L"], (0, 0, 0), (180, 0, 0))
    wt = person("waitress", WAITRESS, (0.45, 0, 0), -10)
    build_face(wt["headmesh"], wt["R"], "sly", gaze=(0.6, 0.0), iris=IRIS["waitress"])
    arm(wt, "L", abduct=14, flex=45, elbow=85, twist=10)
    arm(wt, "R", abduct=20, flex=10, elbow=30)
    pose_hand(wt, "L", 0.75, 0.6)
    c1 = person("cust1", CUST1, (1.4, 0, 0), -15)
    build_face(c1["headmesh"], c1["R"], "joy", gaze=(-0.2, 0.1), iris=IRIS["cust1"])
    arm(c1, "L", abduct=20, flex=10, elbow=15)
    arm(c1, "R", abduct=20, flex=10, elbow=15)
    rb = robot("robot", (2.45, 0.1, 0), -15)
    arm(rb, "L", abduct=14, flex=150, elbow=25, wrist=(-30, 0, 0))
    spatula("rspat", rb["grip_L"], (0, 0, 0), (180, 0, 0))
    lights_common(False, (0.3, 0, 1.2), (0.3, 0, 1.2))
    add_light("top", "AREA", (0.3, -1, 4), 250, "#FFFFFF", 6, target=(0.3, 0, 0))
    camera((0.35, -5.2, 1.15), (0.35, 0, 1.0), lens=38, fstop=None)


def main():
    global COL
    sc = bpy.context.scene
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    COL = sc.collection
    setup_render()
    if ARGS.shot == "opening":
        build_opening()
    elif ARGS.shot == "day":
        build_day()
    else:
        build_charsheet()
    if STYLE == "cine":
        haze_box()
    clay_lumps()
    ink_pass()
    if ARGS.save:
        bpy.ops.wm.save_as_mainfile(filepath=ARGS.save)
    sc.frame_set(1)
    sc.render.filepath = ARGS.out
    bpy.ops.render.render(write_still=True)
    print("DONE", ARGS.out)


main()
