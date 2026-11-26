"""The pump hall: two rows of blue pumps down a long hall, teal headers overhead, high windows, steel trusses.
On the left wall, the old bypass loop with its big rusty wheel, and the thick paper manual hanging on a chain.
Moods: day (sun through the high windows, haze shafts, lamps on) and night (every lamp off: one red alarm beacon
and the aurora's green coming in through the high windows).

Hall: x -6.5..6.5 (left wall at x=-6.5), y -3..16 (front wall with the office glass at y=-3, back wall y=16), roof z=8.
A person facing -90 stands at "wheel" or "manual" facing the left wall; facing 0 looks back down the hall (-y).
Shared helpers (pump, haze, rust) are used by office.py too."""
import math

import bpy

import film3d as F

X0, X1, Y0, Y1, H = -6.5, 6.5, -3.0, 16.0, 8.0
PUMP_YS = [1.5 + 2.5 * k for k in range(6)]
WHEEL_C = (-5.42, 4.0, 1.32)


def mats():
    return dict(
        blue=F.M("ph_blue", "#1F5FCF", "plastic"),
        blue_d=F.M("ph_blue_d", "#17479E", "plastic"),
        teal=F.M("ph_teal", F.PAL["teal"], "satin"),
        steel=F.M("ph_steel", "#8C97A3", "metal", tex=("brushed",)),
        steel_d=F.M("ph_steel_d", "#47505B", "satin"),
        mustard=F.M("ph_mustard", F.PAL["mustard"], "plastic"),
        crimson=F.M("ph_crimson", F.PAL["crimson"], "plastic"),
        white=F.M("ph_white", "#F4F2EC", "ceramic"),
        wall=F.M("ph_wall", "#E6E0D3", "paint"),
        dado=F.M("ph_dado", "#2C7F86", "paint"),
        floor=F.M("ph_floor", "#B9C2C0", "satin", tex=("speckle", "#A3ADAB", 0.9)),
        rust=F.M("ph_rust", "#9C5124", "paint", tex=("speckle", "#5A2A12", 0.72)),
        oldpipe=F.M("ph_oldpipe", "#6E7B6F", "paint", tex=("speckle", "#8C4A22", 0.18)),
        glass=F.M_glass("ph_glass", "#CFE3EC", 0.1),
    )


def haze(name, size, center, density):
    m = bpy.data.materials.new(name)
    nt, out = F._nodes(m)
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Density"].default_value = density
    vol.inputs["Anisotropy"].default_value = 0.55
    nt.links.new(vol.outputs[0], out.inputs["Volume"])
    b = F.rbox(name, size, 0, m, None, center, ink=None)
    b.visible_shadow = False
    return b


def pump(name, loc, facing=0.0, top=4.6, on=True, mt=None):
    """One horizontal pump set, axis along local x: motor at -x, volute at +x, discharge rising to `top`."""
    mt = mt or mats()
    r = F.empty(name, None, loc, (0, 0, facing))
    F.rbox(f"{name}_base", (2.1, 0.95, 0.22), 0.03, mt["steel_d"], r, (-0.1, 0, 0.11), ink=0.004)
    F.cyl(f"{name}_motor", 0.34, 1.0, mt["blue"], r, (-0.5, 0, 0.64), rot=(0, 90, 0), bevel=0.04)
    for k in range(6):
        F.torus(f"{name}_fin{k}", 0.34, 0.022, mt["blue_d"], r, (-0.95 + 0.17 * k, 0, 0.64), rot=(0, 90, 0), nu=32, nv=8, ink=None)
    F.sphere(f"{name}_cap", 0.34, mt["blue_d"], r, (-1.0, 0, 0.64), scale=(0.3, 1, 1), segs=32)
    F.rbox(f"{name}_feet", (1.0, 0.6, 0.14), 0.02, mt["blue_d"], r, (-0.5, 0, 0.29), ink=None)
    F.rbox(f"{name}_guard", (0.32, 0.44, 0.42), 0.06, mt["mustard"], r, (0.17, 0, 0.64))
    F.cyl(f"{name}_volute", 0.42, 0.36, mt["blue"], r, (0.55, 0, 0.68), rot=(0, 90, 0), bevel=0.07)
    F.cyl(f"{name}_flange", 0.2, 0.05, mt["steel"], r, (0.76, 0, 0.68), rot=(0, 90, 0), segs=24)
    F.cyl(f"{name}_suction", 0.14, 0.3, mt["steel"], r, (0.9, 0, 0.68), rot=(0, 90, 0), segs=24)
    F.sphere(f"{name}_elbow", 0.14, mt["steel"], r, (1.05, 0, 0.68), segs=20)
    F.cyl(f"{name}_down", 0.14, 0.68, mt["steel"], r, (1.05, 0, 0.34), segs=24)
    F.cyl(f"{name}_floorflange", 0.22, 0.04, mt["steel_d"], r, (1.05, 0, 0.02), segs=24)
    F.cyl(f"{name}_disch", 0.13, top - 1.05, mt["teal"], r, (0.55, 0, 1.05 + (top - 1.05) / 2), segs=24)
    F.cyl(f"{name}_dflange", 0.19, 0.05, mt["steel"], r, (0.55, 0, 1.12), segs=24)
    F.cyl(f"{name}_gauge", 0.085, 0.04, mt["white"], r, (0.55, -0.16, 1.55), rot=(90, 0, 0), segs=24)
    F.torus(f"{name}_gaugerim", 0.085, 0.012, mt["steel_d"], r, (0.55, -0.18, 1.55), rot=(90, 0, 0), nu=24, nv=6, ink=None)
    F.rbox(f"{name}_needle", (0.008, 0.006, 0.06), 0, mt["crimson"], r, (0.565, -0.185, 1.565), rot=(0, 35, 0), ink=None)
    lamp = F.M_emit("ph_ok", "#5BFF8A", 6.0) if on else F.M("ph_off", "#20262C", "satin")
    F.sphere(f"{name}_status", 0.035, lamp, r, (0.17, -0.23, 0.9), segs=12, ink=None)
    return r


def _walls(mt, night):
    F.rbox("ph_floor", (X1 - X0, Y1 - Y0, 0.04), 0, mt["floor"], None, ((X0 + X1) / 2, (Y0 + Y1) / 2, -0.02), ink=None)
    F.rbox("ph_roof", (X1 - X0 + 0.6, Y1 - Y0 + 0.6, 0.2), 0, mt["steel_d"], None, (0, (Y0 + Y1) / 2, H + 0.1), ink=None)
    for sx in (-1, 1):
        F.rbox(f"ph_line{sx}", (0.09, Y1 - Y0 - 1, 0.004), 0, mt["mustard"], None, (sx * 1.55, (Y0 + Y1) / 2, 0.002), ink=None)
    wins = [(-1.5 + 3.0 * k) for k in range(6)]
    # left wall: solid below 4.3 (teal dado to 1.0), a band of high windows 4.3..6.6, solid above
    x = X0
    F.rbox("ph_lw_low", (0.3, Y1 - Y0, 4.3), 0, mt["wall"], None, (x, (Y0 + Y1) / 2, 2.15), ink=None)
    F.rbox("ph_lw_dado", (0.32, Y1 - Y0, 1.0), 0, mt["dado"], None, (x, (Y0 + Y1) / 2, 0.5), ink=None)
    F.rbox("ph_lw_top", (0.3, Y1 - Y0, H - 6.6), 0, mt["wall"], None, (x, (Y0 + Y1) / 2, (6.6 + H) / 2), ink=None)
    for k in range(7):
        F.rbox(f"ph_lw_pier{k}", (0.3, 0.5, 2.3), 0, mt["wall"], None, (x, -3.0 + 3.0 * k, 5.45), ink=None)
    for y in wins:
        F.rbox(f"ph_lw_glass{y}", (0.04, 2.5, 2.3), 0, mt["glass"], None, (x + 0.05, y, 5.45), ink=None)
        F.rbox(f"ph_lw_mull{y}", (0.06, 0.05, 2.3), 0, mt["steel_d"], None, (x + 0.08, y, 5.45), ink=None)
    # back wall: same band of high windows
    y = Y1
    F.rbox("ph_bw_low", (X1 - X0, 0.3, 4.3), 0, mt["wall"], None, (0, y, 2.15), ink=None)
    F.rbox("ph_bw_dado", (X1 - X0, 0.32, 1.0), 0, mt["dado"], None, (0, y, 0.5), ink=None)
    F.rbox("ph_bw_top", (X1 - X0, 0.3, H - 6.6), 0, mt["wall"], None, (0, y, (6.6 + H) / 2), ink=None)
    for k, xx in enumerate((-6.5, -3.25, 0.0, 3.25, 6.5)):
        F.rbox(f"ph_bw_pier{k}", (0.5, 0.3, 2.3), 0, mt["wall"], None, (xx, y, 5.45), ink=None)
    for xx in (-4.875, -1.625, 1.625, 4.875):
        F.rbox(f"ph_bw_glass{xx}", (2.75, 0.04, 2.3), 0, mt["glass"], None, (xx, y - 0.05, 5.45), ink=None)
    # right wall with the door at y=1.0
    x = X1
    F.rbox("ph_rw_a", (0.3, 1.0 - 0.8 - Y0, H), 0, mt["wall"], None, (x, (Y0 + 0.2) / 2, H / 2), ink=None)
    F.rbox("ph_rw_b", (0.3, Y1 - 1.8, H), 0, mt["wall"], None, (x, (1.8 + Y1) / 2, H / 2), ink=None)
    F.rbox("ph_rw_c", (0.3, 1.6, H - 2.6), 0, mt["wall"], None, (x, 1.0, (2.6 + H) / 2), ink=None)
    F.rbox("ph_rw_dado", (0.32, Y1 - Y0, 1.0), 0, mt["dado"], None, (x, (Y0 + Y1) / 2, 0.5), ink=None)
    F.rbox("ph_door", (0.08, 1.5, 2.55), 0.02, mt["steel"], None, (x - 0.12, 1.0, 1.28), ink=0.004)
    F.rbox("ph_door_win", (0.09, 0.25, 0.9), 0.02, (F.M_emit("ph_doorwin_d", "#E8F2FF", 1.5) if not night else F.M("ph_off", "#20262C", "satin")), None, (x - 0.14, 1.35, 1.6), ink=None)
    F.rbox("ph_exit", (0.06, 0.5, 0.18), 0.02, (F.M_emit("ph_exit_d", "#3DFF7A", 5.0) if not night else F.M_emit("ph_exit_n", "#3DFF7A", 0.4)), None, (x - 0.16, 1.0, 2.85), ink=None)
    # front wall: the office glass band, warm behind
    y = Y0
    F.rbox("ph_fw_low", (X1 - X0, 0.3, 1.0), 0, mt["dado"], None, (0, y, 0.5), ink=None)
    F.rbox("ph_fw_top", (X1 - X0, 0.3, H - 2.7), 0, mt["wall"], None, (0, y, (2.7 + H) / 2), ink=None)
    F.rbox("ph_fw_glass", (X1 - X0, 0.04, 1.7), 0, mt["glass"], None, (0, y + 0.05, 1.85), ink=None)
    F.rbox("ph_fw_office", (X1 - X0, 0.05, 1.7), 0, (F.M_emit("ph_officeglow_d", "#FFE5C2", 1.2) if not night else F.M("ph_off", "#20262C", "satin")), None, (0, y - 0.9, 1.85), ink=None)
    for k in range(7):
        F.rbox(f"ph_fw_mull{k}", (0.07, 0.08, 1.7), 0, mt["steel_d"], None, (-6.0 + 2.0 * k, y + 0.08, 1.85), ink=None)
    # columns and roof trusses
    for yy in (0.0, 5.0, 10.0, 15.0):
        for sx in (-1, 1):
            F.rbox(f"ph_col{yy}{sx}", (0.32, 0.32, H), 0.02, mt["steel_d"], None, (sx * 6.15, yy, H / 2), ink=None)
    for k in range(7):
        yy = -1.5 + 2.9 * k
        F.rbox(f"ph_truss{k}", (X1 - X0, 0.2, 0.55), 0, mt["steel_d"], None, (0, yy, 7.35), ink=None)
        for sx in (-1, 1):
            F.cyl(f"ph_lamp{k}{sx}", 0.38, 0.32, mt["steel_d"], None, (sx * 2.4, yy, 6.7), r2=0.16, segs=24, ink=None)
            lm = F.M("ph_lamp_off", "#1A1E24", "satin") if night else F.M_emit("ph_lamp_on", "#FFF1D6", 9.0)
            F.cyl(f"ph_lampface{k}{sx}", 0.34, 0.02, lm, None, (sx * 2.4, yy, 6.53), segs=24, ink=None)


def _headers(mt):
    for sx in (-1, 1):
        F.cyl(f"ph_header{sx}", 0.24, Y1 - Y0, mt["teal"], None, (sx * 2.35, (Y0 + Y1) / 2, 4.6), rot=(90, 0, 0), segs=32)
        for yy in PUMP_YS:
            F.cyl(f"ph_hcollar{sx}{yy}", 0.29, 0.08, mt["steel"], None, (sx * 2.35, yy, 4.6), rot=(90, 0, 0), segs=24, ink=None)
        F.rbox(f"ph_tray{sx}", (0.5, Y1 - Y0, 0.08), 0.01, mt["steel_d"], None, (sx * 4.6, (Y0 + Y1) / 2, 5.6), ink=None)


def _bypass(mt):
    """The old bypass loop on the left wall, y 3..5, and its rusty wheel facing the room."""
    x, z = -5.98, 1.32
    for yy in (3.0, 5.0):
        F.cyl(f"bp_riser{yy}", 0.2, z, mt["oldpipe"], None, (x, yy, z / 2), segs=24)
        F.sphere(f"bp_elbow{yy}", 0.2, mt["oldpipe"], None, (x, yy, z), segs=24)
        F.cyl(f"bp_foot{yy}", 0.3, 0.06, mt["rust"], None, (x, yy, 0.03), segs=24)
    F.cyl("bp_run", 0.2, 2.0, mt["oldpipe"], None, (x, 4.0, z), rot=(90, 0, 0), segs=24)
    F.cyl("bp_body", 0.31, 0.5, mt["rust"], None, (x, 4.0, z), rot=(90, 0, 0), bevel=0.05)
    for yy in (3.72, 4.28):
        F.cyl(f"bp_flange{yy}", 0.3, 0.06, mt["rust"], None, (x, yy, z), rot=(90, 0, 0), segs=28)
        for k in range(6):
            a = k * 60 * math.pi / 180
            F.sphere(f"bp_bolt{yy}{k}", 0.025, mt["steel_d"], None, (x + 0.24 * math.cos(a), yy, z + 0.24 * math.sin(a)), segs=8, ink=None)
    F.cyl("bp_bonnet", 0.13, 0.38, mt["rust"], None, (x + 0.33, 4.0, z), rot=(0, 90, 0), segs=24)
    F.cyl("bp_stem", 0.035, 0.24, mt["rust"], None, (WHEEL_C[0] - 0.02, 4.0, z), rot=(0, 90, 0), segs=12)
    wx = WHEEL_C[0]
    F.torus("bp_wheel", 0.44, 0.042, mt["rust"], None, (wx, 4.0, z), rot=(0, 90, 0), nu=48, nv=12)
    for k in range(5):
        a = (90 + 72 * k) * math.pi / 180
        p0 = (wx, 4.0 + 0.06 * math.cos(a), z + 0.06 * math.sin(a))
        p1 = (wx, 4.0 + 0.42 * math.cos(a), z + 0.42 * math.sin(a))
        F.sweep(f"bp_spoke{k}", [p0, p1], [0.026, 0.022], mt["rust"], None, segs=10)
    F.cyl("bp_hub", 0.08, 0.1, mt["rust"], None, (wx, 4.0, z), rot=(0, 90, 0), segs=20)
    # rust flakes on the floor under the wheel, and a faded tag on the pipe
    for k, (dy, dx) in enumerate(((-0.1, 0.1), (0.15, 0.02), (0.05, 0.25), (-0.22, 0.18))):
        F.rbox(f"bp_flake{k}", (0.03, 0.025, 0.004), 0, mt["rust"], None, (wx + dx, 4.0 + dy, 0.004), rot=(0, 0, 30 * k), ink=None)
    F.rbox("bp_tag", (0.01, 0.16, 0.1), 0.005, F.M("bp_tagcol", "#D8C79A", "paper"), None, (x + 0.21, 3.45, z), ink=None)


def _cabinets(mt, night):
    """Electrical cabinets down the left wall and a control desk on the right wall, so the walls are not bare."""
    cab = F.M("ph_cab", "#C9CFD4", "satin")
    for k, yy in enumerate((9.2, 10.3, 11.4, 12.5)):
        F.rbox(f"ph_cab{k}", (0.5, 1.0, 2.1), 0.02, cab, None, (-6.08, yy, 1.05), ink=0.004)
        F.rbox(f"ph_cabseam{k}", (0.51, 0.015, 1.9), 0, mt["steel_d"], None, (-6.08, yy, 1.08), ink=None)
        for j, col in enumerate(("#5BFF8A", "#FFC23A", "#5BFF8A")):
            lm = F.M("ph_off", "#20262C", "satin") if night else F.M_emit(f"ph_cabled{col}", col, 6.0)
            F.sphere(f"ph_cabled{k}{j}", 0.022, lm, None, (-5.82, yy - 0.3 + 0.08 * j, 1.75), segs=10, ink=None)
        F.rbox(f"ph_cabstripe{k}", (0.51, 1.0, 0.06), 0, mt["mustard"], None, (-6.08, yy, 2.05), ink=None)
    desk = F.M("ph_console", "#3A424C", "satin")
    F.rbox("ph_console", (0.8, 3.6, 0.95), 0.04, desk, None, (5.95, 7.6, 0.475), ink=0.004)
    F.rbox("ph_console_top", (0.85, 3.65, 0.05), 0.02, mt["white"], None, (5.92, 7.6, 0.97), rot=(0, -12, 0), ink=None)
    scr = F.M("ph_scr_off", "#0B1018", "glossy") if night else F.M_emit("ph_scr", "#7FE6E0", 1.6)
    for k in range(3):
        F.rbox(f"ph_scr{k}", (0.05, 1.0, 0.6), 0.02, F.M("ph_bezel", "#22272E", "satin"), None, (6.28, 6.45 + 1.15 * k, 1.75), ink=None)
        F.rbox(f"ph_scrf{k}", (0.02, 0.9, 0.5), 0.01, scr, None, (6.25, 6.45 + 1.15 * k, 1.75), ink=None)


def manual(name, loc, mt):
    """A thick ring-bound paper manual hanging from a wall hook on a chain; loc is the hook on the wall face."""
    hx, hy, hz = loc
    F.rbox(f"{name}_hook", (0.06, 0.06, 0.08), 0.01, mt["steel_d"], None, (hx + 0.02, hy, hz), ink=None)
    chain = F.M("man_chain", "#B9C0C6", "chrome")
    for k in range(8):
        F.torus(f"{name}_link{k}", 0.018, 0.005, chain, None, (hx + 0.06, hy, hz - 0.035 - 0.03 * k), rot=(90, 0, 90 * (k % 2)), nu=16, nv=6, ink=None)
    bz = hz - 0.27 - 0.22
    cover = F.M("man_cover", "#B7303B", "plastic")
    F.rbox(f"{name}_back", (0.012, 0.32, 0.42), 0.005, cover, None, (hx + 0.03, hy, bz), ink=0.003)
    F.rbox(f"{name}_front", (0.012, 0.32, 0.42), 0.005, cover, None, (hx + 0.15, hy, bz), ink=0.003)
    F.rbox(f"{name}_spine", (0.13, 0.03, 0.42), 0.01, cover, None, (hx + 0.09, hy + 0.15, bz), ink=0.003)
    F.rbox(f"{name}_pages", (0.11, 0.3, 0.4), 0.004, F.M("man_pages", "#F1E9D6", "paper"), None, (hx + 0.09, hy - 0.005, bz), ink=0.002)
    F.rbox(f"{name}_label", (0.006, 0.18, 0.1), 0.004, mt["mustard"], None, (hx + 0.158, hy - 0.01, bz + 0.09), ink=None)
    for k in range(4):
        F.rbox(f"{name}_tab{k}", (0.03, 0.02, 0.04), 0.004, F.M(f"man_tab{k}", ["#16A394", "#F2B132", "#5FB0FF", "#F4F2EC"][k], "plastic"), None, (hx + 0.09, hy - 0.16, bz + 0.12 - 0.08 * k), ink=None)


def _lights(night):
    if not night:
        F.add_light("ph_sun", "SUN", (-20, 0.5, 16), 4.5, "#FFE6C2", 0.015, target=(0, 4.0, 0))
        F.add_light("ph_room", "AREA", (0, 6.5, 6.9), 2400, "#FFF0DC", 11.0, target=(0, 6.5, 0))
        F.add_light("ph_room2", "AREA", (0, 0.0, 6.9), 900, "#FFF0DC", 8.0, target=(0, 0.0, 0))
        for nm, head, off in (("wheel", (-4.9, 4.0, 1.2), (2.2, -1.6, 1.2)), ("manual", (-5.5, 6.8, 1.2), (2.0, -1.2, 1.1)),
                              ("centre", (0.0, 4.0, 1.2), (-1.2, -2.0, 1.0)), ("pumps", (-1.4, 7.75, 1.2), (1.3, -1.8, 1.0))):
            F.add_light(f"ph_key_{nm}", "AREA", (head[0] + off[0], head[1] + off[1], head[2] + off[2]), 90, "#FFF5E8", 1.6, target=head)
        F.add_light("ph_rim", "AREA", (-1.5, 12.0, 3.0), 300, "#CFE8FF", 3.0, target=(-2.0, 4.0, 1.2), shadow=False)
        haze("ph_haze", (X1 - X0 - 0.4, Y1 - Y0 - 0.4, H - 0.3), (0, (Y0 + Y1) / 2, H / 2 - 0.1), 0.012)
        return
    # night: one red beacon over the door wall, the aurora's green through the high windows, nothing else
    red = F.M_emit("ph_beacon", "#FF2A3A", 25.0)
    F.cyl("ph_beacon_base", 0.12, 0.1, F.M("ph_beacon_b", "#2B2F36", "satin"), None, (6.2, 7.0, 3.35), rot=(0, 90, 0), segs=20)
    F.sphere("ph_beacon", 0.12, red, None, (6.05, 7.0, 3.35), scale=(0.8, 1, 1), segs=20, ink=None)
    F.add_light("ph_red", "POINT", (5.85, 7.0, 3.35), 700, "#FF2236", 0.12)
    F.add_light("ph_red_beam", "SPOT", (5.9, 7.0, 3.3), 3500, "#FF2236", 0.05, target=(-5.0, 4.5, 0.8), spot=34)
    sky = F.M_emit("ph_aurora_sky", "#2BFF9A", 1.6)
    F.rbox("ph_sky_l", (0.1, 40, 14), 0, sky, None, (-16, 6.5, 6), ink=None).visible_shadow = False
    F.rbox("ph_sky_b", (40, 0.1, 14), 0, F.M_emit("ph_aurora_sky2", "#1FD6A0", 1.2), None, (0, 26, 6), ink=None).visible_shadow = False
    for y in (1.5, 7.5, 13.5):
        F.add_light(f"ph_aur_l{y}", "AREA", (-8.8, y - 1.0, 8.2), 1800, "#52FFA8", 2.4, target=(-2.5, y + 0.5, 0.0))
    for x in (-4.875, 1.625):
        F.add_light(f"ph_aur_b{x}", "AREA", (x, 18.5, 8.2), 900, "#3CF0B0", 2.4, target=(x * 0.6, 9.0, 0.0))
    F.add_light("ph_moonfill", "AREA", (0, 4.0, 6.5), 120, "#4A6BB0", 10.0, target=(0, 4.0, 0), shadow=False)
    for nm, head in (("wheel", (-4.9, 4.0, 1.2)), ("manual", (-5.5, 6.8, 1.2)), ("centre", (0.0, 4.0, 1.2))):
        F.add_light(f"ph_nrim_{nm}", "AREA", (head[0] + 1.2, head[1] + 1.6, head[2] + 1.0), 45, "#7DFFC4", 0.6, target=head, shadow=False)
    haze("ph_haze", (X1 - X0 - 0.4, Y1 - Y0 - 0.4, H - 0.3), (0, (Y0 + Y1) / 2, H / 2 - 0.1), 0.03)


def build(mood="day"):
    night = mood not in ("day", "morning")
    mt = mats()
    _walls(mt, night)
    _headers(mt)
    for yy in PUMP_YS:
        pump(f"pl{yy}", (-2.9, yy, 0), 0, on=not night, mt=mt)
        pump(f"pr{yy}", (2.9, yy, 0), 180, on=not night, mt=mt)
    _bypass(mt)
    _cabinets(mt, night)
    manual("man", (-6.34, 6.8, 1.95), mt)
    _lights(night)
    return {"wheel": (-4.92, 4.0, 0.0), "wheel_center": WHEEL_C, "manual": (-5.5, 6.8, 0.0), "manual_book": (-6.25, 6.8, 1.46),
            "pumps": (-1.4, 7.75, 0.0), "door": (5.6, 1.0, 0.0), "centre": (0.0, 4.0, 0.0), "aisle_far": (0.0, 11.0, 0.0),
            "walk": (-4.6, 2.2, 0.0), "chief_wheel": (-4.75, 4.85, 0.0)}
