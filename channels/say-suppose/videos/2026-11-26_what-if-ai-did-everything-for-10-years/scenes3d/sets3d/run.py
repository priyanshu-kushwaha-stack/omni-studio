"""The blackout run, the first handheld scene: (1) your building's concrete stairwell, no power, lit only by the green
storm sky through one tall slot window; (2) the street outside, every light dead, drones lying where they fell, a pod
car stopped with its doors open, puddles holding the aurora; at the far end the dark plant gate. Mood: storm.
Marks: stair_top, stair_mid, stair_low (on the flight, z on the treads), landing; street, street_near, street_far,
gate (in front of the gate), drone_mug (the drone that fell with its mug)."""
import math
import random

import bpy

import film3d as F
from sets3d import flat as FL

D2R = math.pi / 180.0
SX = 30.0  # the stairwell sits away from the street, its window facing the aurora (+Y)
RISE, RUN, NSTEP = 0.17, 0.28, 12


def _night_sky():
    sky = bpy.data.materials.new("run_sky")
    nt, out = F._nodes(sky)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sp = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sp.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position, ramp.color_ramp.elements[0].color = 0.0, F.srgb("#0E3A34")
    ramp.color_ramp.elements[1].position, ramp.color_ramp.elements[1].color = 0.55, F.srgb("#050916")
    nt.links.new(sp.outputs["Z"], ramp.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(ramp.outputs[0], em.inputs[0])
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    bd = F.rbox("run_sky", (600, 1, 220), 0, sky, None, (20, 170, 60), ink=None)
    bd.visible_shadow = False
    back = F.rbox("run_sky_back", (600, 1, 220), 0, sky, None, (20, -150, 60), ink=None)
    back.visible_shadow = False
    F.vivid_aurora()
    FL.sky_world(FL.STORM_WORLD, 0.5)
    FL.tune_haze("#0E3A30", 0.05)


def _stairwell():
    conc = F.M("stair_conc", "#6E747C", "paint")
    tread = F.M("stair_tread", "#8A8F96", "paint")
    nose = F.M("stair_nose", F.PAL["mustard"], "paint")
    rail = F.M("stair_rail", "#2E3440", "metal")
    x0, w = SX, 1.3
    # walls: left, right (with the slot window), back, ceiling far up
    F.rbox("sw_left", (0.2, 9, 9), 0, conc, None, (x0 - w - 0.1, 2.5, 3.0), ink=None)
    F.rbox("sw_back", (2 * w + 0.4, 0.2, 9), 0, conc, None, (x0, -2.0, 3.0), ink=None)
    # the far wall, with a tall slot window onto the storm (x0-0.5..x0+0.5, z 2.4..5.6)
    yw = 6.9
    F.rbox("sw_far_l", (w - 0.4, 0.2, 9), 0, conc, None, (x0 - 0.5 - (w - 0.4) / 2, yw, 3.0), ink=None)
    F.rbox("sw_far_r", (w - 0.4, 0.2, 9), 0, conc, None, (x0 + 0.5 + (w - 0.4) / 2, yw, 3.0), ink=None)
    F.rbox("sw_far_lo", (1.0, 0.2, 2.4 + 1.5), 0, conc, None, (x0, yw, (2.4 - 1.5) / 2), ink=None)
    F.rbox("sw_far_hi", (1.0, 0.2, 2.0), 0, conc, None, (x0, yw, 6.6), ink=None)
    F.rbox("sw_mullion", (0.04, 0.06, 3.2), 0, rail, None, (x0, yw, 4.0), ink=None)
    F.rbox("sw_right", (0.2, 9, 9), 0, conc, None, (x0 + w + 0.1, 2.5, 3.0), ink=None)
    F.rbox("sw_floor", (2 * w + 0.2, 9, 0.2), 0, conc, None, (x0, 2.5, -0.1), ink=None)
    # a straight flight up the left half, a landing at the far end; a flight down on the right
    for k in range(NSTEP):
        y = 0.6 + k * RUN
        F.rbox(f"sw_step{k}", (w - 0.05, RUN, RISE * (k + 1)), 0.005, tread, None, (x0 - w / 2, y, RISE * (k + 1) / 2), ink=None)
        F.rbox(f"sw_nose{k}", (w - 0.08, 0.04, 0.012), 0.004, nose, None, (x0 - w / 2, y - RUN / 2 + 0.03, RISE * (k + 1) + 0.006), ink=None)
    top = RISE * NSTEP
    yl = 0.6 + NSTEP * RUN
    F.rbox("sw_landing", (2 * w, yw - yl + 0.1, top), 0, tread, None, (x0, (yl + yw) / 2 - 0.15, top / 2), ink=None)
    # the handrail up the flight, and a guard rail along the landing edge
    p0 = (x0 + 0.02, 0.45, 0.95)
    p1 = (x0 + 0.02, yl - 0.15, top + 0.95)
    F.sweep("sw_rail", [p0, p1, (x0 + 0.02, yl + 0.3, top + 0.95)], 0.025, rail, None)
    for k in range(0, NSTEP, 2):
        y = 0.6 + k * RUN
        F.cyl(f"sw_baluster{k}", 0.012, 0.95, rail, None, (x0 + 0.02, y, RISE * (k + 1) + 0.475), segs=8, ink=None)
    # a dead exit sign and a dead wall lamp
    F.rbox("sw_exit", (0.32, 0.04, 0.14), 0.01, F.M("sw_exit", "#2F4A3A", "plastic"), None, (x0 - 0.3, -1.88, 2.4), ink=None)
    F.rbox("sw_lamp", (0.3, 0.1, 0.1), 0.03, F.M("sw_lamp", "#C8CDD3", "plastic"), None, (x0 - w + 0.02, 3.5, top + 2.0), rot=(0, 0, 90), ink=None)
    # light: only the sky. A green wash through the slot window, and its bounce off the treads.
    F.add_light("sw_sky", "AREA", (x0, yw + 0.4, 4.0), 900, "#7DFFB0", 1.2, target=(x0 - 0.4, 2.0, 1.4))
    F.add_light("sw_bounce", "AREA", (x0 - 0.3, 3.0, top + 2.5), 70, "#3FBF8F", 3.0, target=(x0 - 0.3, 2.0, 0.0), shadow=False)
    F.add_light("sw_rim", "AREA", (x0 + 0.9, 5.0, top + 1.4), 120, "#B8FFE0", 0.6, target=(x0 - 0.6, 2.4, 1.6), shadow=False)
    F.add_light("sw_face", "AREA", (x0 + 0.4, -0.8, 2.2), 70, "#BFE8FF", 1.0, target=(x0 - 0.6, 2.4, 2.2), shadow=False)


def _street():
    asph = F.M("run_asphalt", "#1E2228", "paint")
    walk = F.M("run_walk", "#3A3F47", "paint")
    curb = F.M("run_curb", "#5A6068", "paint")
    wet = F.M("run_puddle", "#0C1014", "glossy")
    F.rbox("st_road", (8, 70, 0.1), 0, asph, None, (0, 20, -0.05), ink=None)
    for sx in (-1, 1):
        F.rbox(f"st_walk{sx}", (3, 70, 0.16), 0.01, walk, None, (sx * 5.5, 20, 0.0), ink=None)
        F.rbox(f"st_curb{sx}", (0.15, 70, 0.17), 0.01, curb, None, (sx * 4.05, 20, 0.0), ink=None)
    for k, (x, y, sx, sy) in enumerate(((0.8, 3.0, 1.6, 0.9), (-1.4, 8.0, 2.2, 1.1), (1.2, 15.0, 1.8, 0.8))):
        F.cyl(f"st_puddle{k}", 1.0, 0.004, wet, None, (x, y, 0.003), segs=32, ink=None).scale = (sx, sy, 1)
    # lane marks
    lane = F.M("run_lane", "#8E8A7A", "paint")
    for y in range(-6, 50, 4):
        F.rbox(f"st_lane{y}", (0.12, 1.6, 0.004), 0, lane, None, (0, y, 0.002), ink=None)
    # buildings both sides: dark facades with dark window grids
    rnd = random.Random(73)
    fac = bpy.data.materials.new("run_facade")
    nt, out = F._nodes(fac)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Scale"].default_value = 0.7
    br.inputs["Mortar Size"].default_value = 0.035
    br.inputs["Bias"].default_value = 0.0
    br.inputs["Color1"].default_value = F.srgb("#070A0F")
    br.inputs["Color2"].default_value = F.srgb("#0E141B")
    br.inputs["Mortar"].default_value = F.srgb("#3E444C")
    sp = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sp.inputs[0])
    ad = nt.nodes.new("ShaderNodeMath")
    nt.links.new(sp.outputs["X"], ad.inputs[0])
    nt.links.new(sp.outputs["Y"], ad.inputs[1])
    cb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(ad.outputs[0], cb.inputs["X"])
    nt.links.new(sp.outputs["Z"], cb.inputs["Y"])
    nt.links.new(cb.outputs[0], br.inputs["Vector"])
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Roughness"].default_value = 0.22
    nt.links.new(br.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(b.outputs[0], out.inputs["Surface"])
    for sx in (-1, 1):
        y = -8.0
        while y < 30:
            d = rnd.uniform(4, 8)
            h = rnd.uniform(9, 24)
            F.rbox(f"st_bld{sx}_{int(y)}", (6, d - 0.3, h), 0.1, fac, None, (sx * 10.0, y + d / 2, h / 2), ink=None)
            y += d
    # dead street lamps, a stopped pod car with a door open, drones lying where they fell
    pole = F.M("run_pole", "#2E3440", "metal")
    for k, y in enumerate((0.0, 9.0, 18.0, 27.0)):
        sx = 1 if k % 2 else -1
        F.cyl(f"st_pole{k}", 0.06, 5.0, pole, None, (sx * 4.4, y, 2.5), segs=12)
        F.rbox(f"st_lamphead{k}", (0.9, 0.22, 0.1), 0.04, pole, None, (sx * 4.0, y, 5.0), ink=None)
    podm = F.M("run_pod", "#E8E4DC", "glossy")
    glass = F.M("run_podglass", "#1A242E", "glossy")
    F.rbox("st_pod", (1.7, 3.2, 1.2), 0.5, podm, None, (2.6, 11.0, 0.75), rot=(0, 0, 8), ink=0.004)
    F.rbox("st_podglass", (1.72, 1.6, 0.5), 0.25, glass, None, (2.6, 10.8, 1.15), rot=(0, 0, 8), ink=None)
    F.rbox("st_poddoor", (0.08, 1.2, 0.9), 0.04, podm, None, (1.45, 10.2, 0.85), rot=(0, 0, -40), ink=0.004)
    for k in range(4):
        F.cyl(f"st_wheel{k}", 0.3, 0.2, F.M("run_tyre", "#15171A", "rubber"), None,
              (2.6 + (0.85 if k % 2 else -0.85), 11.0 + (1.0 if k < 2 else -1.0), 0.3), rot=(0, 90, 8), segs=24, ink=None)
    rnd2 = random.Random(5)
    for k, (x, y) in enumerate(((-1.6, 2.2), (1.0, 5.5), (-2.6, 9.5), (0.4, 13.5), (-0.9, 19.0), (2.2, 23.0), (-5.0, 4.0), (5.2, 7.0))):
        rot = (rnd2.uniform(150, 200) if k % 3 == 0 else rnd2.uniform(-25, 25), rnd2.uniform(-30, 30), rnd2.uniform(0, 360))
        F.drone(f"st_drone{k}", (x, y, 0.07 if abs(x) < 4 else 0.16), rot, s=1.5)
    F.drone("st_drone_mug", (-0.6, 0.6, 0.1), (20, -12, 30), s=1.5, carry="mug")
    dead = F.M("drone_dead", "#1C2A30", "glossy")
    for o in bpy.data.objects:
        if o.name.startswith("st_drone") and (o.name.endswith("_band") or o.name.endswith("_eye")):
            o.data.materials.clear()
            o.data.materials.append(dead)
    # the plant gate at the far end: two pillars, a barred sliding gate, the plant's dark hall and stack behind
    gate_y = 32.0
    pil = F.M("gate_pillar", "#4A4F57", "paint")
    bar = F.M("gate_bar", "#262B33", "metal")
    for sx in (-1, 1):
        F.rbox(f"gate_pillar{sx}", (0.7, 0.7, 3.2), 0.04, pil, None, (sx * 4.2, gate_y, 1.6), ink=None)
    for k in range(29):
        F.cyl(f"gate_bar{k}", 0.03, 2.6, bar, None, (-3.6 + k * 0.26, gate_y, 1.35), segs=8, ink=None)
    for z in (0.2, 1.35, 2.55):
        F.rbox(f"gate_rail{z}", (7.6, 0.08, 0.08), 0.01, bar, None, (0, gate_y, z), ink=None)
    F.rbox("gate_sign", (1.6, 0.06, 0.5), 0.02, F.M("gate_sign", "#1E5E57", "paint"), None, (0, gate_y - 0.05, 2.95), ink=None)
    F.rbox("gate_redlamp", (0.12, 0.12, 0.12), 0.04, F.M_emit("gate_red", "#FF3B4E", 4.0), None, (4.2, gate_y - 0.4, 3.3), ink=None)
    F.rbox("plant_hall", (24, 14, 5), 0.2, fac, None, (0, gate_y + 12, 2.5), ink=None)
    F.cyl("plant_stack", 1.2, 26, F.M("plant_stack", "#3A3F47", "paint"), None, (6, gate_y + 16, 13), segs=32, ink=None)
    # light: the aurora's green from up the street, a cold sky fill, a rim from behind the runner
    F.add_light("st_sky", "AREA", (0, 40, 22), 4500, "#6CFFA0", 30.0, target=(0, 4, 0))
    F.add_light("st_fill", "AREA", (0, -6, 12), 300, "#7FA8FF", 20.0, target=(0, 6, 0), shadow=False)
    F.add_light("st_rim", "AREA", (1.5, 9.0, 2.6), 260, "#A8FFD0", 1.0, target=(0, 2.0, 1.2), shadow=False)
    F.add_light("st_face", "AREA", (-0.6, 1.2, 2.0), 160, "#BFE8FF", 1.2, target=(0, 3.5, 1.2), shadow=False)


def build(mood="storm"):
    _night_sky()
    _stairwell()
    _street()
    yl = 0.6 + NSTEP * RUN
    return {"stair_low": (SX - 0.65, 0.6 + 2 * RUN, 3 * RISE), "stair_mid": (SX - 0.65, 0.6 + 6 * RUN, 7 * RISE),
            "stair_top": (SX - 0.65, 0.6 + 10 * RUN, 11 * RISE), "landing": (SX - 0.2, yl + 0.8, RISE * NSTEP),
            "street": (0.0, 3.5, 0.0), "street_near": (0.2, 0.0, 0.0), "street_far": (0.0, 18.0, 0.0),
            "gate": (0.0, 30.0, 0.0), "drone_mug": (-0.6, 0.6, 0.1)}
