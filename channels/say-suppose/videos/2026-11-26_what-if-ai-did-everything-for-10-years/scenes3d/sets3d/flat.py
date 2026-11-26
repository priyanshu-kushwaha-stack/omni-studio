"""Your flat in 2041: warm white walls, light oak, the teal sofa, a cove light, one long window onto the city.
Moods: morning (a warm sunrise, the city waking), day, dusk, night, storm (the green sky, the city's lights out; the
lighting of the owner's G1 thumbnail, picture 3, film3d.build_thumb4).

Also the shared sky and haze helpers the other 2041 sets import (set_ramp, sky_world, recolor_sky41, tune_haze, sun_disc).
Marks (other sections use these names): window, sofa, table, door, kitchen, centre."""
import bpy

import film3d as F

MARKS = {"window": (0.0, 0.0, 0.0), "sofa": (-1.7, 2.1, 0.15), "table": (-1.2, 1.4, 0.0), "door": (-2.6, -0.5, 0.0),
         "kitchen": (2.6, -0.4, 0.0), "centre": (0.4, 0.8, 0.0)}

# sky gradients, bottom to top, as (position, colour); positions are the sky41 plane's height (0 = 40 m below the eye,
# about 0.2 = eye level) or, for sky_world, the view direction's height (0 = horizon, 1 = straight up)
SUNRISE41 = [(0.0, "#FF8A4C"), (0.17, "#FFA65E"), (0.22, "#FFC982"), (0.28, "#FFDDB0"), (0.36, "#F7C0B0"), (0.5, "#9CC3EC")]
DAY41 = [(0.0, "#CFE4F4"), (0.22, "#DCEBF6"), (0.4, "#8FBFEA"), (0.6, "#4E90D6")]
DUSK41 = [(0.0, "#E86A4A"), (0.19, "#F59A62"), (0.25, "#E7787A"), (0.33, "#8A5C9C"), (0.5, "#2E3470")]
SUNRISE_WORLD = [(0.0, "#FFB06A"), (0.05, "#FFCB8E"), (0.14, "#FFE2BC"), (0.3, "#BCD6EE"), (0.7, "#6FA6DC")]
STORM_WORLD = [(0.0, "#06221C"), (0.08, "#0B3A2A"), (0.3, "#071A2A"), (0.8, "#03060F")]


def set_ramp(ramp, stops):
    cr = ramp.color_ramp
    while len(cr.elements) > 1:
        cr.elements.remove(cr.elements[-1])
    cr.elements[0].position, cr.elements[0].color = stops[0][0], F.srgb(stops[0][1])
    for pos, col in stops[1:]:
        cr.elements.new(pos).color = F.srgb(col)


def sky_world(stops, strength=1.0):
    """A gradient sky on the world itself (seen through every window, from every angle), lighting the set softly."""
    w = bpy.context.scene.world
    nt = w.node_tree
    bg = [n for n in nt.nodes if n.type == "BACKGROUND"][0]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    set_ramp(ramp, stops)
    nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength


def recolor_sky41(stops, strength=None):
    """film3d.city41's backdrop is a grey mix at eye level in the morning: give it a real gradient."""
    ob = bpy.data.objects.get("sky41")
    if ob is None:
        return
    nt = ob.data.materials[0].node_tree
    set_ramp(next(n for n in nt.nodes if n.bl_idname == "ShaderNodeValToRGB"), stops)
    if strength is not None:
        next(n for n in nt.nodes if n.bl_idname == "ShaderNodeEmission").inputs["Strength"].default_value = strength


def tune_haze(color, amount):
    """The compositor's mist mix: in day moods film3d adds 30% blue-grey to everything far, which greys a sunrise."""
    tree = bpy.context.scene.compositing_node_group
    for n in tree.nodes:
        if n.bl_idname == "ShaderNodeMath" and n.operation == "MULTIPLY":
            n.inputs[1].default_value = amount
        elif n.bl_idname == "ShaderNodeMix" and n.blend_type == "MIX":
            [s for s in n.inputs if s.enabled][2].default_value = F.srgb(color)


def sun_disc(loc, r, color="#FFF1C8", strength=12.0, halo="#FFC27A"):
    """A low sun and its glow, for the window views."""
    F.sphere("sun_disc", r, F.M_emit("sun_disc_" + color, color, strength), None, loc, segs=32, ink=None).visible_shadow = False
    glow = F.M("sun_halo_" + halo, halo, "glass", emit=2.0, emit_color=halo, alpha=0.18)
    for k, s in enumerate((2.2, 3.6)):
        h = F.cyl(f"sun_halo{k}", r * s, 0.1, glow, None, (loc[0], loc[1] + 2 + k, loc[2]), rot=(90, 0, 0), segs=48, ink=None)
        h.visible_shadow = False


def tint_towers(color):
    """Give the towers' walls a colour (the windows keep their glow): slate at sunrise, not black."""
    for o in bpy.data.objects:
        if o.name.startswith("tower") and o.data and o.data.materials:
            m = o.data.materials[0]
            b = next((n for n in m.node_tree.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
            if b is not None and m.name.startswith("tower_windows"):
                b.inputs["Base Color"].default_value = F.srgb(color)
                break


def _morning_props():
    """A breakfast corner by the window: a stool, a little round table, a bowl of fruit, a second plant."""
    oak = F.M("flat_oak", "#C9A27A", "wood", tex=("wood", "#A97E55"))
    trim = F.M("flat_trim", "#2B2F36", "satin")
    F.cyl("bk_table", 0.32, 0.04, oak, None, (2.3, 2.4, 0.74), segs=40, ink=0.004)
    F.cyl("bk_leg", 0.03, 0.72, trim, None, (2.3, 2.4, 0.37), segs=12)
    F.cyl("bk_foot", 0.2, 0.02, trim, None, (2.3, 2.4, 0.01), segs=24)
    F.lathe("bk_bowl", F.smooth_prof([(0.0, 0.0), (0.09, 0.0), (0.15, 0.06), (0.16, 0.09), (0.0, 0.09)], 3),
            F.M("bowl", "#16A394", "ceramic"), None, (2.25, 2.45, 0.76), segs=32)
    for k, (dx, dy, col) in enumerate(((0.0, 0.0, "#F2B132"), (0.07, 0.04, "#D2333F"), (-0.06, 0.05, "#F2B132"), (0.02, -0.06, "#E86A2E"))):
        F.sphere(f"fruit{k}", 0.05, F.M("fruit" + col, col, "glossy"), None, (2.25 + dx, 2.45 + dy, 0.86), segs=20, ink=0.003)
    F.rbox("rug", (3.2, 2.0, 0.012), 0.2, F.M("rug", "#E9C27A", "cloth"), None, (-1.0, 1.7, 0.006), ink=None)
    F.rbox("art", (0.9, 0.04, 0.6), 0.02, F.M("art", "#16A394", "paint"), None, (-2.2, 3.29, 2.0), ink=0.004)
    F.sphere("art_sun", 0.16, F.M("art_sun", "#F2B132", "paint"), None, (-2.0, 3.26, 2.08), scale=(1, 0.1, 1), ink=None)
    F.rbox("art_hill", (0.8, 0.03, 0.2), 0.08, F.M("art_hill", "#D2333F", "paint"), None, (-2.2, 3.26, 1.8), ink=None)


def _close_room(cut_floor):
    """flat41 is open on the right and the front: add those walls, a kitchen island (mark "kitchen") and the front
    door (mark "door"). Outside moods also lose the slab beyond the window, so the view drops straight to the city."""
    wall = F.M("flat_wall", "#F2ECE2", "paint")
    oak = F.M("flat_oak", "#C9A27A", "wood", tex=("wood", "#A97E55"))
    F.rbox("wall_right", (0.2, 9.0, 3.0), 0, wall, None, (7.5, -1.0, 1.5), ink=None)
    F.rbox("wall_front", (11.0, 0.2, 3.0), 0, wall, None, (2.2, -4.6, 1.5), ink=None)
    # the kitchen island, white with an oak top, two mustard stools, a pendant over it
    F.rbox("island", (0.8, 1.8, 0.88), 0.04, F.M("island", "#F7F4EE", "satin"), None, (3.45, -0.4, 0.44), ink=0.004)
    F.rbox("island_top", (0.95, 1.95, 0.05), 0.02, oak, None, (3.45, -0.4, 0.905), ink=0.004)
    for k, dy in enumerate((-0.5, 0.3)):
        F.cyl(f"stool{k}", 0.17, 0.05, F.M("stool", F.PAL["mustard"], "satin"), None, (4.15, -0.4 + dy, 0.66), segs=24, ink=0.003)
        F.cyl(f"stool_leg{k}", 0.025, 0.64, F.M("flat_trim", "#2B2F36", "satin"), None, (4.15, -0.4 + dy, 0.32), segs=10, ink=None)
    F.lathe("pendant", F.smooth_prof([(0.0, 0.0), (0.16, 0.0), (0.12, 0.14), (0.02, 0.2), (0.0, 0.2)], 3), F.M("pendant", F.PAL["teal"], "satin"),
            None, (3.45, -0.4, 2.2), segs=28)
    F.sphere("pendant_bulb", 0.06, F.M_emit("pendant_bulb", "#FFE1B8", 6.0), None, (3.45, -0.4, 2.2), segs=12, ink=None)
    F.cyl("pendant_cord", 0.006, 0.6, F.M("flat_trim", "#2B2F36", "satin"), None, (3.45, -0.4, 2.7), segs=6, ink=None)
    F.rbox("counter_back", (0.65, 3.2, 0.9), 0.03, F.M("island", "#F7F4EE", "satin"), None, (7.05, -0.6, 0.45), ink=None)
    F.rbox("counter_top", (0.7, 3.25, 0.05), 0.02, oak, None, (7.05, -0.6, 0.92), ink=None)
    F.rbox("backsplash", (0.03, 3.2, 0.6), 0.0, F.M("splash", F.PAL["teal"], "ceramic"), None, (7.38, -0.6, 1.25), ink=None)
    # the front door on the side wall, crimson
    F.rbox("door", (0.06, 0.95, 2.1), 0.02, F.M("door", F.PAL["crimson"], "satin"), None, (-3.08, -0.5, 1.05), ink=0.004)
    F.sphere("door_knob", 0.035, F.M("knob", "#E2E6EA", "chrome"), None, (-3.03, -0.15, 1.0), segs=12, ink=None)
    if cut_floor:
        for name in ("flat_floor", "flat_ceiling"):
            o = bpy.data.objects.get(name)
            if o is not None:
                o.scale.y = 8.6 / 12.0
                o.location.y = -0.8


def build(mood):
    F.flat41()
    _close_room(cut_floor=mood != "storm")
    head = (0.0, 0.0, 1.2)
    if mood == "storm":
        # the thumbnail's frame (picture 3): the same city, aurora, lights and key as film3d.build_thumb4
        F.city41("night")
        F.vivid_aurora()
        F.city_lights_out(0.7)
        F._thumb_lights(head, key_energy=260)
        return dict(MARKS)
    _morning_props()
    F.city41("night" if mood == "night" else ("dusk" if mood == "dusk" else ("day" if mood == "day" else "morning")))
    if mood == "morning":
        recolor_sky41(SUNRISE41, 2.2)
        tint_towers("#6B6F8E")
        sun_disc((14.0, 150.0, 6.0), 6.5)
        tune_haze("#FFD2A6", 0.1)
        sky_world(SUNRISE_WORLD, 0.7)
        F._thumb_lights(head, key_energy=300)
        # low sun straight through the long window: warm patches on the floor and the wall
        F.add_light("sun_in", "SUN", (5, 40, 4), 4.5, "#FFC98A", 0.03, target=(-0.5, -1.0, 0.0))
        F.add_light("sun_bounce", "AREA", (1.5, 2.5, 0.3), 80, "#FFB878", 3.0, target=(0.0, 0.0, 1.2), shadow=False)
    elif mood == "day":
        recolor_sky41(DAY41, 2.4)
        tint_towers("#8A95A8")
        tune_haze("#DCE8F2", 0.12)
        F._thumb_lights(head, key_energy=320)
        F.add_light("sun_in", "SUN", (5, 40, 8), 3.0, "#FFF4E2", 0.02, target=(-1.0, -1.0, 0.0))
    elif mood == "dusk":
        recolor_sky41(DUSK41, 1.6)
        sun_disc((30.0, 150.0, -2.0), 6.0, "#FFD08A", 8.0, "#F08E64")
        tune_haze("#C77A6A", 0.08)
        F._thumb_lights(head, key_energy=280)
        F.add_light("dusk_in", "AREA", (2.5, 3.0, 1.8), 120, "#FF9E6A", 4.0, target=(0.0, 0.0, 1.0), shadow=False)
        F.add_light("lamp_glow", "POINT", (-2.4, 1.6, 1.3), 90, "#FFB870", 0.3, shadow=False)
    else:  # night: lit windows over the city, the room on its lamps
        F._thumb_lights(head, key_energy=240)
        F.add_light("lamp_glow", "POINT", (-2.4, 1.6, 1.3), 140, "#FFB870", 0.3, shadow=False)
    return dict(MARKS)
