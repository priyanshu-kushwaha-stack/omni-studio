"""The plant office, a little too perfect: a long room of identical white desks and mustard chairs, a small plant on
every desk, tall windows on the left throwing light shafts through haze, and on the right a full glass wall onto the
pump hall (a row of blue pumps under a teal header). A wall clock on the back wall at five to eleven.
Away from it (x around 30) the meeting room: a long table, teal chairs, the chief's seat at the head, your report on
the wall screen above him.

Office: x -5..5, y -2..14, ceiling 3.4. Everyone at a desk faces the glass wall (+x, facing 90). Seated marks
("desk", "dana_desk", "m_*") already sit a person on the chair: use pose "sit".
Meeting room marks: m_head (chief's seat, facing 0), m_you and m_dana (right side, facing -90), m_l1..m_l3 (left side,
facing 90), m_r3 (right, facing -90), m_head_stand, m_screen (the screen's centre), meeting (the table's centre).
Moods: day (warm sun), grey (the same room flatter and colder, Year 3 on)."""
import film3d as F
from sets3d.allhands import SHIRTS, clock, figure
from sets3d.pump_hall import haze, mats, pump

SEAT_Z = -0.2
DESK_XS = (-2.2, 1.6)
ROW_YS = (0.5, 2.5, 4.5, 6.5, 8.5, 10.5, 12.5)
MX = 30.0


def desk(name, x, y, mt, plant=True):
    white = F.M("of_desk", "#F7F5F0", "glossy")
    F.rbox(f"{name}_top", (0.8, 1.5, 0.04), 0.015, white, None, (x, y, 0.55), ink=0.004)
    for sy in (-1, 1):
        F.rbox(f"{name}_leg{sy}", (0.7, 0.04, 0.53), 0.01, white, None, (x, y + sy * 0.7, 0.265), ink=None)
    F.rbox(f"{name}_modesty", (0.03, 1.36, 0.3), 0.01, F.M("of_modesty", "#E2DED5", "satin"), None, (x + 0.36, y, 0.38), ink=None)
    if plant:
        F.lathe(f"{name}_pot", F.smooth_prof([(0.0, 0.0), (0.05, 0.0), (0.06, 0.07), (0.0, 0.07)], 2), F.M("of_pot", "#FFFFFF", "ceramic"), None, (x + 0.25, y + 0.55, 0.57), segs=16, ink=None)
        for k in range(5):
            F.sphere(f"{name}_leaf{k}", 0.045, F.M("of_leaf", "#3E9A55", "satin"), None, (x + 0.25 + 0.03 * ((k % 3) - 1), y + 0.55 + 0.03 * ((k % 2) * 2 - 1), 0.68 + 0.025 * k), scale=(1, 0.5, 1.4), rot=(0, 0, 72 * k), segs=10, ink=None)
    chair(f"{name}_chair", x - 0.68, y, 90, F.M("of_chair", F.PAL["mustard"], "plastic"))


def chair(name, x, y, facing, mat):
    """A low swivel chair; seat top at 0.27, back behind (facing = the sitter's facing)."""
    r = F.empty(name, None, (x, y, 0), (0, 0, facing))
    F.rbox(f"{name}_seat", (0.46, 0.46, 0.07), 0.03, mat, r, (0, 0, 0.235), ink=0.004)
    F.rbox(f"{name}_back", (0.44, 0.06, 0.42), 0.03, mat, r, (0, 0.25, 0.5), rot=(-8, 0, 0), ink=0.004)
    dark = F.M("of_chair_dark", "#2E333A", "satin")
    F.cyl(f"{name}_stem", 0.025, 0.18, dark, r, (0, 0, 0.11), segs=10, ink=None)
    F.cyl(f"{name}_base", 0.2, 0.025, dark, r, (0, 0, 0.02), segs=5, ink=None)
    return r


def _office(mt, grey):
    oak = F.M("of_floor", "#CFAE86", "wood", tex=("wood", "#B48E66"))
    wall = F.M("of_wall", "#F2EEE6", "paint")
    trim = F.M("of_trim", "#2B2F36", "satin")
    F.rbox("of_floor", (10, 16, 0.04), 0, oak, None, (0, 6, -0.02), ink=None)
    F.rbox("of_ceiling", (10, 16, 0.08), 0, wall, None, (0, 6, 3.44), ink=None)
    for k in range(4):
        F.rbox(f"of_strip{k}", (0.1, 14, 0.03), 0, F.M_emit("of_strip_g" if grey else "of_strip", "#E6EEF6" if grey else "#FFF2DE", 3.0), None, (-3.0 + 2.0 * k, 6, 3.38), ink=None)
    # left wall: tall windows between piers, sill at 0.6
    F.rbox("of_lw_sill", (0.25, 16, 0.6), 0, wall, None, (-5.0, 6, 0.3), ink=None)
    F.rbox("of_lw_head", (0.25, 16, 0.4), 0, wall, None, (-5.0, 6, 3.2), ink=None)
    for k in range(7):
        F.rbox(f"of_lw_pier{k}", (0.25, 0.5, 2.4), 0, wall, None, (-5.0, -2.0 + 2.6 * k, 1.8), ink=None)
    F.rbox("of_lw_glass", (0.03, 16, 2.4), 0, F.M_glass("of_glass", "#D8E8F0", 0.06), None, (-4.95, 6, 1.8), ink=None)
    F.rbox("of_sky", (0.1, 40, 12), 0, F.M_emit("of_sky_g" if grey else "of_sky", "#AFC2D4" if grey else "#CFE4F4", 1.6), None, (-9, 6, 3), ink=None).visible_shadow = False
    # back wall with the clock, front wall with the door
    F.rbox("of_bw", (10, 0.25, 3.4), 0, wall, None, (0, 14.0, 1.7), ink=None)
    F.rbox("of_bw_accent", (4.0, 0.27, 3.4), 0, F.M("of_accent", F.PAL["teal"], "paint"), None, (-1.0, 14.0, 1.7), ink=None)
    clock("of_clock", (-1.0, 13.85, 2.3), 0, 10, 55)
    F.rbox("of_fw", (10, 0.25, 3.4), 0, wall, None, (0, -2.0, 1.7), ink=None)
    F.rbox("of_door", (1.1, 0.06, 2.3), 0.02, F.M("of_doorcol", "#B9C4CC", "satin"), None, (-3.5, -1.86, 1.15), ink=0.004)
    # the glass wall onto the pump hall
    F.rbox("of_gw_sill", (0.2, 16, 0.1), 0, trim, None, (5.0, 6, 0.05), ink=None)
    F.rbox("of_gw_head", (0.2, 16, 0.12), 0, trim, None, (5.0, 6, 3.38), ink=None)
    for k in range(9):
        F.rbox(f"of_gw_mull{k}", (0.08, 0.06, 3.4), 0, trim, None, (5.0, -2.0 + 2.0 * k, 1.7), ink=None)
    F.rbox("of_gw_glass", (0.03, 16, 3.3), 0, F.M_glass("of_glass", "#D8E8F0", 0.06), None, (4.98, 6, 1.7), ink=None)
    for i, x in enumerate(DESK_XS):
        for y in ROW_YS:
            desk(f"of_d{i}_{y}", x, y, mt)
    # the lunch box on your desk
    F.rbox("of_lunch", (0.2, 0.28, 0.07), 0.02, F.M("of_lunch", F.PAL["crimson"], "plastic"), None, (1.42, 4.3, 0.605), ink=0.003)
    F.rbox("of_lunchlid", (0.21, 0.29, 0.015), 0.006, F.M("of_lunchlid", "#F4F0E6", "plastic"), None, (1.62, 4.05, 0.62), rot=(0, 0, 25), ink=None)
    for k, (dy, col) in enumerate(((-0.07, "#F6F3EC"), (0.0, "#6BBE47"), (0.07, F.PAL["mustard"]))):
        F.sphere(f"of_food{k}", 0.045, F.M(f"of_food{col}", col, "food"), None, (1.42, 4.3 + dy, 0.64), scale=(1.3, 0.8, 0.5), segs=12, ink=None)
    # a few colleagues at the far desks (low-detail)
    for k, (x, y) in enumerate(((-2.88, 8.5), (-2.88, 12.5), (0.92, 10.5), (-2.88, 2.5), (0.92, 12.5))):
        figure(f"of_col{k}", (x, y, -0.12), 90, vest=None, shirt=SHIRTS[k + 1], seated=True)


def _hall_beyond(mt):
    F.rbox("of_hall_floor", (11, 20, 0.04), 0, mt["floor"], None, (10.5, 6, -0.03), ink=None)
    F.rbox("of_hall_back", (0.3, 20, 7), 0, mt["wall"], None, (16.0, 6, 3.5), ink=None)
    F.rbox("of_hall_dado", (0.32, 20, 1.0), 0, mt["dado"], None, (15.9, 6, 0.5), ink=None)
    for k in range(5):
        F.rbox(f"of_hall_win{k}", (0.05, 2.6, 1.8), 0, F.M_emit("of_hall_win", "#E9F3FB", 2.0), None, (15.82, -1 + 3.6 * k, 5.0), ink=None)
    F.rbox("of_hall_roof", (11, 20, 0.2), 0, mt["steel_d"], None, (10.5, 6, 7.1), ink=None)
    F.cyl("of_hall_header", 0.24, 20, mt["teal"], None, (8.95, 6, 4.0), rot=(90, 0, 0), segs=28)
    for y in (0.0, 2.6, 5.2, 7.8, 10.4, 13.0):
        pump(f"of_p{y}", (9.5, y, 0), 180, top=4.0, mt=mt)


def _meeting(grey):
    wall = F.M("mr_wall", "#F3EFE8", "paint")
    F.rbox("mr_floor", (8.4, 9.0, 0.04), 0, F.M("mr_floor", "#5B6B7A", "cloth"), None, (MX, 3.3, -0.02), ink=None)
    F.rbox("mr_ceiling", (8.4, 9.0, 0.08), 0, wall, None, (MX, 3.3, 3.04), ink=None)
    F.rbox("mr_light", (1.2, 4.6, 0.04), 0.02, F.M_emit("mr_light", "#FFF2DE", 4.0), None, (MX, 3.0, 2.98), ink=None)
    F.rbox("mr_bw", (8.4, 0.2, 3.0), 0, F.M("mr_accent", F.PAL["teal"], "paint"), None, (MX, 7.7, 1.5), ink=None)
    F.rbox("mr_fw", (8.4, 0.2, 3.0), 0, wall, None, (MX, -1.1, 1.5), ink=None)
    F.rbox("mr_rw", (0.2, 9.0, 3.0), 0, wall, None, (MX + 4.1, 3.3, 1.5), ink=None)
    for k, (yy, col) in enumerate(((1.2, F.PAL["mustard"]), (3.4, F.PAL["crimson"]), (5.6, "#3E7FB8"))):
        F.rbox(f"mr_art{k}", (0.04, 1.2, 0.8), 0.02, F.M(f"mr_art{k}", col, "satin"), None, (MX + 3.98, yy, 1.7), ink=0.003)
        F.cyl(f"mr_artdot{k}", 0.2, 0.03, F.M("mr_artdot", "#F4F2EC", "satin"), None, (MX + 3.95, yy + 0.2, 1.75), rot=(0, 90, 0), segs=24, ink=None)
    # left wall: a window band onto the day
    F.rbox("mr_lw_low", (0.2, 9.0, 0.8), 0, wall, None, (MX - 4.1, 3.3, 0.4), ink=None)
    F.rbox("mr_lw_top", (0.2, 9.0, 0.5), 0, wall, None, (MX - 4.1, 3.3, 2.75), ink=None)
    F.rbox("mr_lw_glass", (0.03, 9.0, 1.7), 0, F.M_glass("of_glass", "#D8E8F0", 0.06), None, (MX - 4.05, 3.3, 1.65), ink=None)
    for k in range(5):
        F.rbox(f"mr_lw_mull{k}", (0.08, 0.06, 1.7), 0, F.M("of_trim", "#2B2F36", "satin"), None, (MX - 4.05, -0.9 + 2.2 * k, 1.65), ink=None)
    F.rbox("mr_sky", (0.1, 20, 8), 0, F.M_emit("of_sky_g" if grey else "of_sky", "#AFC2D4" if grey else "#CFE4F4", 1.6), None, (MX - 9, 3.3, 2), ink=None).visible_shadow = False
    # the table and chairs
    F.rbox("mr_table", (1.5, 5.2, 0.05), 0.02, F.M("mr_table", "#F7F5F0", "glossy"), None, (MX, 3.0, 0.55), ink=0.004)
    F.rbox("mr_table_edge", (1.52, 5.22, 0.02), 0.01, F.M("of_floor", "#CFAE86", "wood"), None, (MX, 3.0, 0.52), ink=None)
    for sy in (-1, 1):
        F.rbox(f"mr_tleg{sy}", (0.9, 0.08, 0.52), 0.02, F.M("of_chair_dark", "#2E333A", "satin"), None, (MX, 3.0 + sy * 1.9, 0.26), ink=None)
    teal = F.M("mr_chair", F.PAL["teal"], "plastic")
    for yy in (1.0, 2.2, 3.4, 4.6):
        chair(f"mr_cl{yy}", MX - 1.15, yy, 90, teal)
        chair(f"mr_cr{yy}", MX + 1.15, yy, -90, teal)
    chair("mr_chead", MX, 6.0, 0, teal)
    # your report on the screen: a teal header, a bar chart, a pump diagram, a line; no words
    F.rbox("mr_screen_bezel", (2.8, 0.06, 1.6), 0.03, F.M("mr_bezel", "#22272E", "satin"), None, (MX, 7.57, 1.95), ink=None)
    F.rbox("mr_screen", (2.66, 0.02, 1.46), 0.02, F.M_emit("mr_screen", "#F2F7FA", 1.4), None, (MX, 7.53, 1.95), ink=None)
    F.rbox("mr_scr_head", (2.4, 0.01, 0.16), 0.01, F.M_emit("mr_scr_teal", "#16A394", 2.0), None, (MX, 7.515, 2.5), ink=None)
    for k, hgt in enumerate((0.3, 0.45, 0.38, 0.62, 0.72)):
        F.rbox(f"mr_bar{k}", (0.14, 0.01, hgt), 0.01, F.M_emit("mr_scr_bar", "#F2A81E", 2.0), None, (MX - 1.05 + 0.2 * k, 7.515, 1.35 + hgt / 2), ink=None)
    F.torus("mr_pumpring", 0.28, 0.035, F.M_emit("mr_scr_blue", "#1F5FCF", 2.2), None, (MX + 0.55, 7.515, 1.85), rot=(90, 0, 0), nu=32, nv=6, ink=None)
    F.rbox("mr_pumpbody", (0.5, 0.01, 0.22), 0.02, F.M_emit("mr_scr_blue", "#1F5FCF", 2.2), None, (MX + 0.95, 7.515, 1.85), ink=None)
    F.sweep("mr_line", [(MX + 0.2, 7.512, 1.35), (MX + 0.5, 7.512, 1.45), (MX + 0.8, 7.512, 1.4), (MX + 1.1, 7.512, 1.62)], 0.012, F.M_emit("mr_scr_red", "#D2333F", 3.0), None, segs=6, ink=None)
    F.rbox("mr_door", (1.0, 0.06, 2.3), 0.02, F.M("of_doorcol", "#B9C4CC", "satin"), None, (MX + 2.6, -0.98, 1.15), ink=0.004)


def build(mood="day"):
    grey = mood not in ("day", "morning")
    mt = mats()
    _office(mt, grey)
    _hall_beyond(mt)
    _meeting(grey)
    warm = "#FFE7C4" if not grey else "#DCE6F2"
    F.add_light("of_sun", "SUN", (-14, -1.0, 9.0), 6.0 if not grey else 2.0, warm, 0.015, target=(0, 4.5, 0))
    F.add_light("of_room", "AREA", (0, 6, 3.3), 900, "#FFF4E4" if not grey else "#E4ECF6", 10.0, target=(0, 6, 0))
    F.add_light("of_hall", "AREA", (10.5, 6, 6.8), 2200, "#FFF1DC", 10.0, target=(10.5, 6, 0))
    F.add_light("of_key_desk", "AREA", (3.4, 3.0, 2.2), 90, "#FFF5E8", 1.6, target=(0.95, 4.5, 0.95))
    F.add_light("of_key_dana", "AREA", (3.4, 7.8, 2.2), 70, "#FFF5E8", 1.6, target=(0.95, 6.5, 0.95))
    F.add_light("of_key_shoulder", "AREA", (2.8, 2.2, 2.6), 60, "#FFF5E8", 1.4, target=(0.3, 3.8, 1.25))
    F.add_light("of_key_glass", "AREA", (1.5, 4.0, 2.4), 60, "#FFF5E8", 1.6, target=(4.2, 5.0, 1.2))
    haze("of_haze", (9.6, 15.6, 3.3), (0, 6, 1.7), 0.045 if not grey else 0.02)
    # meeting room
    F.add_light("mr_top", "AREA", (MX, 3.0, 2.9), 420, "#FFF4E6", 4.5, target=(MX, 3.0, 0))
    F.add_light("mr_key_r", "AREA", (MX - 2.6, 3.4, 2.0), 110, "#FFF5E8", 2.0, target=(MX + 1.15, 3.8, 0.95))
    F.add_light("mr_key_l", "AREA", (MX + 2.6, 2.6, 2.0), 90, "#FFF5E8", 2.0, target=(MX - 1.15, 3.4, 0.95))
    F.add_light("mr_key_head", "AREA", (MX + 0.8, 3.2, 2.0), 90, "#FFF5E8", 1.6, target=(MX, 6.0, 1.0))
    F.add_light("mr_screen_glow", "AREA", (MX, 7.3, 1.95), 120, "#E8F4FF", 2.4, target=(MX, 3.0, 1.0), shadow=False)
    s = SEAT_Z
    return {"desk": (0.92, 4.5, s), "dana_desk": (0.92, 6.5, s), "desk_shoulder": (0.35, 3.75, 0.0),
            "desk_behind": (-0.2, 4.6, 0.0), "glass": (4.35, 5.4, 0.0), "aisle": (-0.4, 7.5, 0.0),
            "across_room": (-1.2, 10.0, 0.0), "door": (-3.5, -1.2, 0.0), "centre": (0.0, 6.0, 0.0),
            "m_head": (MX, 6.0, s), "m_head_stand": (MX + 0.5, 6.3, 0.0), "m_you": (MX + 1.15, 4.6, s),
            "m_dana": (MX + 1.15, 3.4, s), "m_r3": (MX + 1.15, 2.2, s), "m_l1": (MX - 1.15, 4.6, s),
            "m_l2": (MX - 1.15, 3.4, s), "m_l3": (MX - 1.15, 2.2, s), "m_screen": (MX, 7.5, 1.95),
            "meeting": (MX, 3.0, 0.0), "m_door": (MX + 2.6, -0.6, 0.0)}
