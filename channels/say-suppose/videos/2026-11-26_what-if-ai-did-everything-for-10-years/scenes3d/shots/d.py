"""Section d: The Blackout, The Way Out and Close (7:13 to the end).

Sets: flat (section a's: morning, dusk, storm), run (the blackout run, storm), plant_gate (section a's, storm), pump_hall
(section b's, night), roof (dawn, morning). The rings: cyan until the blackout, "red" on its first second (the thumbnail's
frame), "off" after, a thin cyan back on the roof once Echo returns. Mouths never move; faces hold.
"""
import math

ROOF_STAFF = [  # cups are built in the roof set for exactly these facings with pose "hold"
    {"who": "chief", "at": "chief", "facing": 18, "pose": "hold", "face": "happy", "gaze": (-0.4, 0.0), "lens": "off"},
    {"who": "crew1", "at": "crew1", "facing": -12, "pose": "hold", "face": "happy", "gaze": (0.4, 0.0), "lens": "off"},
    {"who": "crew2", "at": "crew2", "facing": 24, "pose": "hold", "face": "happy", "gaze": (-0.5, 0.0), "lens": "off"},
]


def staff(**over):
    """The roof crew, with per-person changes: staff(chief={"look": {"turn": -25}})."""
    out = []
    for c in ROOF_STAFF:
        d = dict(c)
        d.update(over.get(c["who"], {}))
        out.append(d)
    return out


def you(at, facing=0, pose="stand", face="happy", gaze=(0, 0), lens="off", **kw):
    d = {"who": "you", "at": at, "facing": facing, "pose": pose, "face": face, "gaze": gaze, "lens": lens}
    d.update(kw)
    return d


def facing_to(pos, cam):
    """The facing that turns a person at pos towards cam (facing 0 looks down -y)."""
    dx, dy = cam[0] - pos[0], cam[1] - pos[1]
    return round(math.degrees(math.atan2(dx, -dy)), 1)


# the pump hall's twelve: the chief, ten crew (three looks, repeated), and you
HALL_CREW = [("crew2", (-5.2, 7.9)), ("crew3", (-4.4, 7.6)), ("crew1", (-5.9, 8.5)), ("crew2", (-4.85, 8.9)),
             ("crew3", (-4.1, 9.4)), ("crew1", (-5.5, 9.9)), ("crew2", (-3.35, 7.75)), ("crew1", (-2.6, 8.0)),
             ("crew3", (-3.3, 10.2)), ("crew2", (-4.6, 10.7))]
MANUAL_AT = (-5.65, 6.95, 0.0)  # in front of the hanging manual; facing -30 puts a "wheel" hand on the book, face to -y
MANUAL_CREW = {"who": "crew1", "at": MANUAL_AT, "facing": -30, "pose": "wheel", "face": "worried", "gaze": (-0.3, 0.3), "lens": "off"}


def hall_crowd(look_at, face="worried", skip=(), lens="off"):
    out = []
    for k, (who, (x, y)) in enumerate(HALL_CREW):
        if k in skip:
            continue
        out.append({"who": who, "name": f"{who}_{k}", "at": (x, y, 0.0), "facing": facing_to((x, y), look_at), "pose": "stand",
                    "face": face, "gaze": (0.0, 0.05), "lens": lens})
    return out


FLAT_CAM = {"loc": (0.38, -1.75, 1.25), "target": (0.72, 3.4, 1.3), "lens": 34, "fstop": 4.0, "focus": "you", "shift": (0, 0.03)}
ROOF_WIDE = {"loc": (1.3, -3.2, 1.25), "target": (0.3, 2.0, 0.9), "lens": 30, "fstop": 5.6, "focus": "you"}
ROOF_CARD = {"loc": (0.75, -1.35, 0.98), "target": (-0.2, -0.15, 0.8), "lens": 40, "fstop": 4.0, "focus": "you"}
HOLOS = [("holo", {"name": "h1", "loc": (0.82, 0.05, 1.62), "rot": (0, 0, -18), "w": 0.38, "h": 0.24}),
         ("holo", {"name": "h2", "loc": (1.2, 0.6, 1.2), "rot": (0, 0, -24), "w": 0.3, "h": 0.18, "lines": 3})]

SHOTS = [
    # ------------------------------------------------------------ The Blackout: the morning after the vote
    {"id": "d01", "set": "flat", "mood": "morning", "anchor": "Echo: Good morning. The plan passed", "move": "push_in",
     "cast": [you("window", -14, "temple", "joy", (0.6, 0.35), "cyan", look={"nod": -6, "tilt": 6, "turn": 10, "lean": -3})],
     "props": HOLOS + [("drone", {"name": "dt", "loc": (1.7, 1.8, 1.95), "rot": (8, 0, 30), "s": 0.9, "carry": "toast"})],
     "cam": FLAT_CAM},
    {"id": "d02", "set": "flat", "mood": "morning", "anchor": "Echo: Good morning. The plan passed", "offset_s": 1.8, "move": "pan_left",
     "cast": [you("window", 22, "hold", "happy", (0.5, -0.35), "cyan", look={"nod": 8, "turn": 10})],
     "props": [("holo", {"name": "vote", "loc": (0.42, -0.62, 0.98), "rot": (12, 0, 38), "w": 0.44, "h": 0.26, "lines": 2})],
     "cam": {"loc": (1.15, -1.6, 1.3), "target": (0.2, 0.0, 1.1), "lens": 36, "fstop": 4.0, "focus": "you"}},
    {"id": "d03", "set": "flat", "mood": "morning", "anchor": "Echo: Good morning. The plan passed", "offset_s": 4.4, "move": "push_out",
     "cast": [you("window", -18, "punch", "joy", (0.2, 0.6), "cyan", look={"nod": -10})],
     "props": [("holo", {"name": "f1", "loc": (-0.55, -0.2, 1.75), "rot": (0, 30, 20), "w": 0.2, "h": 0.12, "lines": 2}),
               ("holo", {"name": "f2", "loc": (0.75, 0.2, 1.9), "rot": (0, -25, -20), "w": 0.16, "h": 0.1, "lines": 2})],
     "cam": {"loc": (1.1, -2.7, 1.15), "target": (0.3, 1.2, 1.3), "lens": 28, "fstop": 5.6, "focus": "you"}},
    {"id": "d04", "set": "flat", "mood": "morning", "anchor": "Echo: I've cleared your afternoon.", "move": "pan_right",
     "cast": [you((-1.7, 2.15, -0.02), 18, "sit", "happy", (0.5, 0.35), "cyan", look={"nod": -6, "lean": -6})],
     "props": [("holo", {"name": "cal", "loc": (-1.05, 1.7, 1.3), "rot": (0, 0, 15), "w": 0.36, "h": 0.22, "lines": 4})],
     "cam": {"loc": (-0.45, -0.5, 1.15), "target": (-1.5, 2.2, 0.95), "lens": 34, "fstop": 4.0, "focus": "you"}},
    {"id": "d05", "set": "flat", "mood": "morning", "anchor": "Echo: I've cleared your afternoon.", "offset_s": 1.8, "move": "hold",
     "cast": [you((-1.7, 2.15, -0.02), 18, "sit", "joy", (0.2, 0.5), "cyan", look={"nod": -10, "lean": -8})],
     "props": [("holo", {"name": "cal", "loc": (-1.2, 1.75, 1.35), "rot": (0, 0, 15), "w": 0.3, "h": 0.18, "lines": 3})],
     "cam": {"loc": (-1.05, 0.85, 1.1), "target": (-1.7, 2.25, 1.02), "lens": 45, "fstop": 2.8, "focus": "you"}},
    {"id": "d06", "set": "flat", "mood": "morning", "anchor": "You don't look up.", "move": "push_in",
     "cast": [you("window", -14, "hold", "happy", (0.0, -0.6), "cyan", look={"nod": 16})],
     "props": [("holo", {"name": "lap", "loc": (0.12, -0.46, 0.86), "rot": (40, 0, -14), "w": 0.32, "h": 0.2, "lines": 4})],
     "cam": {"loc": (0.5, -1.9, 1.05), "target": (0.75, 3.4, 1.75), "lens": 30, "fstop": 4.0, "focus": "you", "shift": (0, 0.02)}},
    # ------------------------------------------------------------ dusk: the chime cuts mid-word
    {"id": "d07", "set": "flat", "mood": "dusk", "anchor": "Echo: Pump four's bearing", "move": "push_in",
     "cast": [you("window", -14, "temple", "happy", (0.6, 0.3), "cyan", look={"nod": -6, "tilt": 6, "turn": 10, "lean": -3})],
     "props": [("drone", {"name": "dm", "loc": (0.55, -0.35, 1.38), "rot": (0, 0, -20), "carry": "mug"}),
               ("holo", {"name": "h1", "loc": (0.85, 0.1, 1.68), "rot": (0, 0, -18), "w": 0.36, "h": 0.22})],
     "cam": FLAT_CAM},
    {"id": "d08", "set": "flat", "mood": "storm", "anchor": "Echo: Pump four's bearing", "offset_s": 1.4, "move": "hold",
     "note": "The thumbnail's frame (picture 3, film3d.build_thumb4): the 3 s planned silence.",
     "cast": [you("window", -10, "temple", "scared", (0.0, 0.1), "red", look={"nod": -2, "tilt": -5, "turn": -4, "lean": 2})],
     "props": [("drone", {"name": "drone_fall", "loc": (1.1, 1.8, 1.55), "rot": (35, 20, 60), "carry": "mug"})],
     "cam": {"loc": (0.32, -1.8, 1.22), "target": (0.68, 3.4, 1.3), "lens": 36, "fstop": 3.2, "focus": "you", "shift": (0, 0.03)}},
    {"id": "d09", "set": "flat", "mood": "storm", "anchor": "Echo: Pump four's bearing", "offset_s": 4.4, "move": "push_in",
     "note": "Both rings to plain glass, every card gone.",
     "cast": [you("window", -6, "stand", "worried", (0.35, 0.15), "off", look={"turn": 10})],
     "cam": {"loc": (0.3, -1.25, 1.24), "target": (0.1, 1.2, 1.22), "lens": 42, "fstop": 2.8, "focus": "you"}},
    {"id": "d10", "set": "flat", "mood": "storm", "anchor": "Echo: Pump four's bearing", "offset_s": 5.8, "move": "hold",
     "note": "The coffee drone down under the window, its mug spilt; the city dark under the green sky.",
     "props": [("drone", {"name": "down", "loc": (1.25, 3.0, 0.11), "rot": (0, 105, 35), "carry": "mug"})],
     "cam": {"loc": (0.35, 1.55, 0.42), "target": (1.4, 3.3, 0.55), "lens": 30, "fstop": 4.0, "focus_dist": 2.0}},
    {"id": "d11", "set": "flat", "mood": "storm", "anchor": "You: Echo?", "move": "push_in",
     "cast": [you("window", -24, "shrug", "worried", (0.25, 0.4), "off", look={"nod": -8, "turn": 8})],
     "cam": {"loc": (0.95, -2.2, 1.2), "target": (0.25, 1.4, 1.3), "lens": 30, "fstop": 4.0, "focus": "you"}},
    {"id": "d12", "set": "flat", "mood": "storm", "anchor": "A storm from the Sun.", "move": "push_in",
     "cast": [you((0.9, 2.5, 0.0), 168, "stand", "worried", (0, 0.3), "off", look={"nod": -8})],
     "cam": {"loc": (-0.7, -1.8, 1.35), "target": (1.6, 3.4, 1.9), "lens": 24, "fstop": 5.6, "focus_dist": 3.6}},
    {"id": "d13", "set": "flat", "mood": "storm", "anchor": "A storm from the Sun.", "offset_s": 0.8, "move": "drift_up",
     "note": "Out of the window: no glow anywhere, drones settling on the rooftops.",
     "cam": {"loc": (2.6, 2.7, 1.45), "target": (7.0, 40.0, 1.5), "lens": 26, "fstop": 8.0, "focus_dist": 30.0}},
    {"id": "d14", "set": "flat", "mood": "storm", "anchor": "A storm from the Sun.", "offset_s": 1.6, "move": "push_in",
     "cast": [you("window", -42, "stand", "scared", (-0.3, 0.05), "off", look={"turn": -8})],
     "cam": {"loc": (-1.0, -1.2, 1.25), "target": (-0.05, 0.3, 1.2), "lens": 38, "fstop": 2.8, "focus": "you"}},
    # ------------------------------------------------------------ the run (handheld; no narration over it)
    {"id": "d15", "set": "run", "mood": "storm", "anchor": "A storm from the Sun.", "offset_s": 2.3, "move": "pan_left",
     "cast": [you("stair_mid", 4, "hold", "scared", (0, -0.2), "off", look={"lean": 14, "nod": 6})],
     "cam": {"loc": (29.6, -1.3, 0.9), "target": (29.4, 3.0, 2.0), "lens": 24, "fstop": 4.0, "focus": "you"}},
    {"id": "d16", "set": "run", "mood": "storm", "anchor": "A storm from the Sun.", "offset_s": 3.0, "move": "push_in",
     "cast": [you("stair_top", 8, "hold", "worried", (0.1, -0.4), "off", look={"lean": 14, "nod": 10})],
     "cam": {"loc": (29.55, 2.05, 2.75), "target": (29.35, 3.4, 3.0), "lens": 32, "fstop": 2.8, "focus": "you"}},
    {"id": "d17", "set": "run", "mood": "storm", "anchor": "A storm from the Sun.", "offset_s": 3.7, "move": "pan_right",
     "cast": [you((-0.2, 3.4, 0.0), -6, "hold", "scared", (0, 0), "off", look={"lean": 16})],
     "cam": {"loc": (0.45, 1.25, 0.3), "target": (-0.2, 5.0, 1.05), "lens": 22, "fstop": 4.0, "focus": "you"}},
    {"id": "d18", "set": "run", "mood": "storm", "anchor": "A storm from the Sun.", "offset_s": 4.3, "move": "push_in",
     "cast": [you((0.9, 9.4, 0.0), 12, "hold", "worried", (-0.3, 0.0), "off", look={"lean": 14, "turn": -10})],
     "cam": {"loc": (0.2, 7.0, 1.2), "target": (0.95, 9.6, 1.25), "lens": 32, "fstop": 2.8, "focus": "you"}},
    {"id": "d19", "set": "plant_gate", "mood": "storm", "anchor": "A storm from the Sun.", "offset_s": 4.9, "move": "push_in",
     "note": "The dark plant gate, as in the cold open.",
     "cast": [you("outside", 180, "stand", "worried", (0, 0.2), "off", look={"nod": -6})],
     "cam": {"loc": (0.9, -7.5, 1.5), "target": (0.0, 4.0, 2.2), "lens": 28, "fstop": 5.6, "focus": "you"}},
    # ------------------------------------------------------------ the pump hall at night (the strip between the left wall
    # and the left pump row: the wheel on the wall at y=4, the manual at y=6.8; most cameras stand in the strip)
    {"id": "d20", "set": "pump_hall", "mood": "night", "anchor": "Chief: Does anyone remember paper?", "move": "push_in",
     "cast": [{"who": "chief", "at": (-4.75, 5.5, 0.0), "facing": -4, "pose": "shrug", "face": "worried", "gaze": (0.0, 0.1), "lens": "off"},
              MANUAL_CREW, you((-3.95, 4.3, 0.0), -140, "stand", "worried", (0, 0))] + hall_crowd((-4.8, 3.0)),
     "cam": {"loc": (-4.85, 1.5, 1.75), "target": (-4.8, 7.4, 1.15), "lens": 28, "fstop": 4.0, "focus": "chief"}},
    {"id": "d21", "set": "pump_hall", "mood": "night", "anchor": "Chief: Does anyone remember paper?", "offset_s": 2.2, "move": "push_in",
     "note": "A crew member takes the manual off the wall and turns it the wrong way up (the manual stays on its chain here).",
     "cast": [dict(MANUAL_CREW, look={"nod": -6, "tilt": 14})],
     "cam": {"loc": (-6.1, 5.5, 1.42), "target": (-5.8, 6.95, 1.32), "lens": 35, "fstop": 2.8, "focus": "crew1"}},
    {"id": "d22", "set": "pump_hall", "mood": "night", "anchor": "Crew: Which way is the front?", "move": "hold",
     "cast": [dict(MANUAL_CREW, facing=-20, face="worried", gaze=(0.35, 0.1), look={"tilt": -12})],
     "cam": {"loc": (-6.15, 5.3, 1.3), "target": (-5.62, 6.95, 1.22), "lens": 40, "fstop": 2.4, "focus": "crew1"}},
    {"id": "d23", "set": "pump_hall", "mood": "night", "anchor": "Chief: Generators are up.", "move": "push_in",
     "cast": [{"who": "chief", "at": (-4.75, 5.5, 0.0), "facing": 8, "pose": "point", "face": "worried", "gaze": (0.2, 0.0), "lens": "off"}]
     + hall_crowd((-4.75, 5.5)),
     "cam": {"loc": (-4.3, 3.6, 1.4), "target": (-4.75, 5.5, 1.2), "lens": 35, "fstop": 2.8, "focus": "chief"}},
    {"id": "d24", "set": "pump_hall", "mood": "night", "anchor": "Chief: Generators are up.", "offset_s": 4.5, "move": "drift_up",
     "note": "Every valve waited for Echo: the pump rows under the red beacon.",
     "cam": {"loc": (0.3, -1.6, 1.6), "target": (-1.0, 10.0, 2.2), "lens": 24, "fstop": 5.6, "focus_dist": 6.0}},
    {"id": "d25", "set": "pump_hall", "mood": "night", "anchor": "Chief: Generators are up.", "offset_s": 8.0, "move": "push_in",
     "note": "Pump four, pushing into a shut gate.",
     "cam": {"loc": (-0.9, 7.4, 1.05), "target": (-2.7, 9.0, 0.8), "lens": 30, "fstop": 4.0, "focus_dist": 2.3}},
    {"id": "d26", "set": "pump_hall", "mood": "night", "anchor": "Chief: Generators are up.", "offset_s": 11.0, "move": "hold",
     "cast": [you((-4.3, 4.9, 0.0), 10, "stand", "worried", (0.3, 0.05))],
     "cam": {"loc": (-4.0, 3.65, 1.3), "target": (-4.3, 4.9, 1.18), "lens": 45, "fstop": 2.4, "focus": "you"}},
    {"id": "d27", "set": "pump_hall", "mood": "night", "anchor": "Problem two.", "move": "push_in",
     "cast": [{"who": "chief", "at": (-4.75, 5.5, 0.0), "facing": -4, "pose": "stand", "face": "worried", "gaze": (0, 0.3), "lens": "off"},
              MANUAL_CREW, you((-4.1, 4.5, 0.0), -10, "stand", "worried", (0.0, 0.3))] + hall_crowd((-4.6, 1.0)),
     "cam": {"loc": (-4.6, 1.0, 3.4), "target": (-4.9, 7.0, 0.9), "lens": 26, "fstop": 5.6, "focus": "chief"}},
    # the silent fifteen seconds: the manual, the finger, the pipe
    {"id": "d28", "set": "pump_hall", "mood": "night", "anchor": "Problem two.", "offset_s": 3.8, "move": "push_in",
     "cast": [you(MANUAL_AT, -30, "wheel", "worried", (-0.4, 0.3), look={"nod": -6}),
              {"who": "crew1", "at": (-5.0, 7.75, 0.0), "facing": -40, "pose": "stand", "face": "worried", "gaze": (-0.4, 0.0), "lens": "off"}],
     "cam": {"loc": (-6.1, 5.45, 1.45), "target": (-5.75, 7.0, 1.35), "lens": 32, "fstop": 2.8, "focus": "you"}},
    {"id": "d29", "set": "pump_hall", "mood": "night", "anchor": "Problem two.", "offset_s": 6.4, "move": "push_in",
     "note": "Your finger finds the line (read on your face: the manual hangs closed on its chain in this set).",
     "cast": [you(MANUAL_AT, -30, "wheel", "worried", (-0.5, -0.3), look={"nod": 12, "turn": -12})],
     "cam": {"loc": (-6.15, 5.65, 1.35), "target": (-5.75, 6.95, 1.25), "lens": 40, "fstop": 2.4, "focus": "you"}},
    {"id": "d30", "set": "pump_hall", "mood": "night", "anchor": "Problem two.", "offset_s": 8.4, "move": "push_in",
     "note": "You look up from the page and along the old pipe.",
     "cast": [you((-5.55, 6.55, 0.0), -20, "wheel", "stunned", (0.3, 0.6), look={"nod": -14})],
     "cam": {"loc": (-6.0, 5.5, 1.0), "target": (-5.55, 6.55, 1.5), "lens": 30, "fstop": 2.8, "focus": "you"}},
    {"id": "d31", "set": "pump_hall", "mood": "night", "anchor": "Problem two.", "offset_s": 10.2, "move": "pan_left",
     "note": "Your eyes follow the old pipe to the big rusty wheel.",
     "cam": {"loc": (-5.35, 7.3, 1.6), "target": (-5.6, 4.0, 1.25), "lens": 35, "fstop": 4.0, "focus_dist": 3.3}},
    {"id": "d32", "set": "pump_hall", "mood": "night", "anchor": "Chief: That's decoration.", "move": "hold",
     "cast": [{"who": "chief", "at": (-4.6, 5.9, 0.0), "facing": 25, "pose": "pockets", "face": "happy", "gaze": (-0.4, 0.0), "lens": "off"}],
     "cam": {"loc": (-3.55, 4.5, 1.3), "target": (-4.6, 5.9, 1.2), "lens": 45, "fstop": 2.4, "focus": "chief"}},
    {"id": "d33", "set": "pump_hall", "mood": "night", "anchor": "You: It's a valve.", "move": "push_in",
     "cast": [you((-5.3, 6.4, 0.0), 40, "stand", "happy", (0.5, 0.0), look={"turn": 10})],
     "cam": {"loc": (-4.15, 5.3, 1.25), "target": (-5.3, 6.4, 1.2), "lens": 45, "fstop": 2.4, "focus": "you"}},
    # the wordless peak at the wheel (10 s)
    {"id": "d34", "set": "pump_hall", "mood": "night", "anchor": "You: It's a valve.", "offset_s": 1.6, "move": "push_in",
     "note": "Your hands on the rusty wheel. It doesn't move.",
     "cast": [you((-5.02, 3.85, 0.0), -70, "wheel", "worried", (0.3, 0.1), look={"lean": 8})],
     "cam": {"loc": (-4.15, 3.1, 1.62), "target": (-5.42, 4.0, 1.28), "lens": 32, "fstop": 2.8, "focus": "you"}},
    {"id": "d35", "set": "pump_hall", "mood": "night", "anchor": "You: It's a valve.", "offset_s": 3.8, "move": "hold",
     "note": "The chief's hands join yours.",
     "cast": [you((-5.02, 3.85, 0.0), -70, "wheel", "worried", (-0.4, 0.1), look={"lean": 10}),
              {"who": "chief", "at": (-4.95, 4.55, 0.0), "facing": -115, "pose": "wheel", "face": "worried", "gaze": (0.2, 0.1), "lens": "off",
               "look": {"lean": 10}}],
     "cam": {"loc": (-5.5, 5.6, 1.45), "target": (-5.05, 4.2, 1.22), "lens": 28, "fstop": 2.8, "focus": "chief"}},
    {"id": "d36", "set": "pump_hall", "mood": "night", "anchor": "You: It's a valve.", "offset_s": 6.0, "move": "push_in",
     "note": "Then it does: a quarter turn, water in the pipe.",
     "cast": [you((-5.02, 3.85, 0.0), -70, "wheel", "stunned", (0.3, 0.2), look={"lean": 6}),
              {"who": "chief", "at": (-4.95, 4.55, 0.0), "facing": -115, "pose": "wheel", "face": "stunned", "gaze": (0.0, 0.1), "lens": "off"}],
     "cam": {"loc": (-5.85, 2.75, 0.9), "target": (-5.2, 4.1, 1.3), "lens": 26, "fstop": 2.8, "focus": "you"}},
    {"id": "d37", "set": "pump_hall", "mood": "night", "anchor": "You: It's a valve.", "offset_s": 8.2, "move": "push_out",
     "note": "Twelve pairs of white eyes in the aurora light, turned to the wheel.",
     "cast": [{"who": "chief", "at": (-4.6, 5.3, 0.0), "facing": facing_to((-4.6, 5.3), (-5.7, 3.3)), "pose": "stand", "face": "stunned",
               "gaze": (0, 0), "lens": "off"}, dict(MANUAL_CREW, facing=facing_to(MANUAL_AT, (-5.7, 3.3)), pose="stand", face="stunned")]
     + hall_crowd((-5.7, 3.3), face="stunned"),
     "cam": {"loc": (-5.75, 3.25, 1.6), "target": (-4.3, 8.0, 1.15), "lens": 24, "fstop": 4.0, "focus": "chief"}},
    {"id": "d38", "set": "pump_hall", "mood": "night", "anchor": "You: It's a valve.", "offset_s": 10.6, "move": "hold",
     "note": "You step back from the wheel, rust on both palms.",
     "cast": [you((-4.55, 3.9, 0.0), 20, "shrug", "stunned", (0.0, -0.4), look={"nod": 14})],
     "cam": {"loc": (-3.95, 2.55, 1.35), "target": (-4.6, 4.0, 1.12), "lens": 40, "fstop": 2.8, "focus": "you"}},
    {"id": "d39", "set": "pump_hall", "mood": "night", "anchor": "You: Handled.", "move": "push_in",
     "cast": [you((-4.55, 3.9, 0.0), 20, "shrug", "happy", (0.0, -0.3), look={"nod": 8})],
     "cam": {"loc": (-4.05, 2.75, 1.3), "target": (-4.58, 3.95, 1.15), "lens": 38, "fstop": 2.4, "focus": "you"}},
    # ------------------------------------------------------------ The Way Out: the plant roof at dawn
    {"id": "d40", "set": "roof", "mood": "morning", "anchor": "Forty-seven minutes later", "move": "drift_up",
     "note": "The city's lights coming back in patches.",
     "cast": [you("vent", 0, "sit", "happy", (0.2, 0.2))] + staff(),
     "cam": {"loc": (-2.2, -4.4, 3.6), "target": (2.0, 22.0, -1.0), "lens": 24, "fstop": 8.0, "focus_dist": 6.0}},
    {"id": "d41", "set": "roof", "mood": "morning", "anchor": "Echo: Hello. What did I miss?", "move": "push_in",
     "note": "A thin cyan ring flickers back on.",
     "cast": [you("vent", 4, "sit", "stunned", (-0.3, -0.2), "cyan", look={"nod": 6})] + staff(),
     "cam": {"loc": (0.95, -1.55, 1.05), "target": (-0.1, 0.1, 0.88), "lens": 35, "fstop": 3.2, "focus": "you"}},
    {"id": "d42", "set": "roof", "mood": "morning", "anchor": "You: Forty-seven minutes.", "move": "hold",
     "cast": [you("vent", 8, "sit", "happy", (-0.3, -0.1), "cyan", look={"nod": 4, "tilt": 6})] + staff(),
     "cam": {"loc": (0.6, -0.95, 1.05), "target": (0.06, 0.42, 1.02), "lens": 40, "fstop": 2.4, "focus": "you"}},
    {"id": "d43", "set": "roof", "mood": "morning", "anchor": "Echo: That's a long time for me.", "move": "pan_right",
     "cast": [you("vent", 8, "sit", "happy", (-0.3, -0.1), "cyan")]
     + staff(chief={"face": "joy", "look": {"turn": -20}}, crew1={"face": "joy"}, crew2={"face": "joy", "look": {"turn": -15}}),
     "cam": {"loc": (0.35, -0.7, 1.25), "target": (1.7, 1.9, 1.1), "lens": 30, "fstop": 4.0, "focus": "chief"}},
    {"id": "d44", "set": "roof", "mood": "morning", "anchor": "You could go straight back.", "move": "push_out",
     "cast": [you("vent", 0, "sit", "happy", (0.0, 0.1), "cyan")] + staff(),
     "cam": ROOF_WIDE},
    {"id": "d45", "set": "roof", "mood": "morning", "anchor": "You could go straight back.", "offset_s": 3.2, "move": "hold",
     "cast": [you("vent", 10, "sit", "worried", (-0.3, -0.3), "cyan", look={"nod": 8})] + staff(),
     "cam": {"loc": (1.0, -0.95, 1.1), "target": (0.0, 0.35, 1.0), "lens": 45, "fstop": 2.4, "focus": "you"}},
    {"id": "d46", "kind": "card", "anchor": "Fifty-two programmers", "move": "hold",
     "text": "\"How AI Impacts Skill Formation\", Shen and Tamkin, Anthropic, 2026. One small experiment, a preprint. (c15)"},
    {"id": "d47", "set": "roof", "mood": "morning", "anchor": "Fifty-two programmers", "offset_s": 5.0, "move": "push_in",
     "note": "Your hand drifts toward OLD SETTING.",
     "cast": [you("vent", 0, "point", "happy", (-0.4, -0.5), "cyan", look={"nod": 10})] + staff(),
     "cam": ROOF_CARD},
    {"id": "d48", "set": "roof", "mood": "morning", "anchor": "On the test afterwards", "move": "hold",
     "note": "Your hand stops.",
     "cast": [you("vent", 2, "point", "worried", (-0.4, -0.5), "cyan", look={"nod": 10})] + staff(),
     "cam": {"loc": (0.6, -1.15, 0.95), "target": (-0.12, -0.02, 0.86), "lens": 45, "fstop": 2.8, "focus": "you"}},
    {"id": "d49", "set": "roof", "mood": "morning", "anchor": "The group without it", "move": "push_in",
     "cast": [you("vent", 2, "point", "worried", (-0.2, -0.3), "cyan", look={"nod": 6})]
     + staff(chief={"face": "worried", "look": {"turn": -25}}),
     "cam": {"loc": (1.9, -1.1, 1.2), "target": (0.6, 1.2, 1.0), "lens": 28, "fstop": 4.0, "focus": "you"}},
    {"id": "d50", "set": "roof", "mood": "morning", "anchor": "But it wasn't the AI.", "move": "pan_left",
     "cast": [you("vent", 6, "sit", "happy", (-0.3, -0.2), "cyan")] + staff(chief={"look": {"turn": -20}}),
     "cam": {"loc": (1.6, -1.7, 1.15), "target": (0.5, 1.0, 1.0), "lens": 30, "fstop": 4.0, "focus": "you"}},
    {"id": "d51", "set": "roof", "mood": "morning", "anchor": "The ones who handed over the coding", "move": "push_in",
     "note": "Your hand moves off OLD SETTING to the blank button.",
     "cast": [you("vent", 28, "point", "happy", (-0.2, -0.5), "cyan", look={"nod": 10})] + staff(),
     "cam": ROOF_CARD},
    {"id": "d52", "set": "roof", "mood": "morning", "anchor": "A crutch and a coach", "move": "drift_up",
     "cam": {"loc": (1.0, 1.7, 1.5), "target": (8.0, 30.0, -0.5), "lens": 26, "fstop": 8.0, "focus_dist": 20.0}},
    {"id": "d53", "set": "roof", "mood": "morning", "anchor": "The trap has a door.", "move": "push_in",
     "note": "You look at the rust on your palm.",
     "cast": [you("vent", 8, "shrug", "worried", (0.0, -0.6), "cyan", look={"nod": 16})] + staff(),
     "cam": {"loc": (0.8, -1.0, 1.05), "target": (0.0, 0.35, 0.92), "lens": 42, "fstop": 2.8, "focus": "you"}},
    {"id": "d54", "set": "roof", "mood": "morning", "anchor": "The trap has a door.", "offset_s": 2.0, "move": "hold",
     "note": "Then up at the one small card floating in the dawn, waiting.",
     "cast": [you("vent", 4, "sit", "happy", (-0.4, -0.2), "cyan", look={"nod": 4})] + staff(),
     "cam": {"loc": (0.95, -1.55, 1.05), "target": (-0.1, 0.1, 0.88), "lens": 35, "fstop": 3.2, "focus": "you"}},
    {"id": "d55", "set": "roof", "mood": "morning", "anchor": "You: New setting, Echo.", "move": "push_in",
     "cast": [you("vent", 6, "sit", "happy", (-0.4, -0.2), "cyan", look={"nod": 2, "tilt": -4})] + staff(),
     "cam": {"loc": (0.6, -0.9, 1.05), "target": (0.0, 0.38, 1.0), "lens": 50, "fstop": 2.4, "focus": "you"}},
    {"id": "d56", "set": "roof", "mood": "morning", "anchor": "You: New setting, Echo.", "offset_s": 3.4, "move": "pan_right",
     "note": "The card holds. No chime. The chief glances over.",
     "cast": [you("vent", 6, "sit", "happy", (-0.4, -0.2), "cyan")]
     + staff(chief={"face": "stunned", "gaze": (-0.6, 0.0), "look": {"turn": -28}}),
     "cam": {"loc": (0.25, -0.9, 1.3), "target": (1.35, 1.9, 1.15), "lens": 36, "fstop": 2.8, "focus": "chief"}},
    {"id": "d57", "set": "roof", "mood": "morning", "anchor": "Echo: Okay. What do you think?", "move": "hold",
     "cast": [you("vent", 4, "sit", "joy", (-0.4, -0.3), "cyan", look={"nod": 6})] + staff(),
     "cam": {"loc": (0.45, -1.55, 0.9), "target": (-0.15, 0.0, 0.85), "lens": 42, "fstop": 4.0, "focus": "you"}},
    # ------------------------------------------------------------ Close
    {"id": "d58", "set": "roof", "mood": "morning", "anchor": "Tomorrow, when something's hard", "move": "push_out",
     "note": "A slow pull back from the roof over the lit city.",
     "cast": [you("vent", 4, "sit", "happy", (0.0, 0.2), "cyan")] + staff(),
     "cam": {"loc": (2.6, -6.2, 4.6), "target": (0.5, 8.0, -0.2), "lens": 24, "fstop": 8.0, "focus_dist": 8.0}},
    {"id": "d59", "set": "roof", "mood": "morning", "anchor": "Tomorrow, when something's hard", "offset_s": 2.6, "move": "drift_up",
     "note": "Drones lifting off the rooftops one by one; the printed tower catches the sun.",
     "cam": {"loc": (1.2, 2.0, 1.55), "target": (11.0, 24.0, 1.0), "lens": 32, "fstop": 8.0, "focus_dist": 20.0}},
    {"id": "d60", "set": "roof", "mood": "morning", "anchor": "Echo: Your old setting is still here.", "move": "hold",
     "cast": [you("vent", 4, "sit", "worried", (-0.4, -0.3), "cyan")] + staff(),
     "cam": {"loc": (0.2, -1.05, 0.8), "target": (-0.3, -0.18, 0.73), "lens": 55, "fstop": 2.8, "focus_dist": 0.95}},
    {"id": "d61", "set": "roof", "mood": "morning", "anchor": "Echo: Your old setting is still here.", "offset_s": 3.2, "move": "push_in",
     "note": "You look at the rust on your palm. You open your mouth. Cut before you answer.",
     "cast": [you("vent", 6, "shrug", "stunned", (0.0, -0.5), "cyan", look={"nod": 12})] + staff(),
     "cam": {"loc": (0.6, -0.85, 1.0), "target": (0.0, 0.38, 0.96), "lens": 55, "fstop": 2.4, "focus": "you"}},
    {"id": "d62", "set": "roof", "mood": "morning", "anchor": "So, what's the one thing", "move": "push_out",
     "note": "The last image: your hand on the parapet over the lit city.",
     "cast": [you((0.3, 1.92, 0.0), 180, "hold", "happy", (0, 0.2), "cyan")],
     "cam": {"loc": (1.0, 1.55, 1.08), "target": (0.4, 2.7, 0.88), "lens": 32, "fstop": 4.0, "focus_dist": 0.95}},
    {"id": "d63", "kind": "card", "anchor": "So, what's the one thing", "offset_s": 9.0, "move": "hold",
     "note": "End card (4 s): like, subscribe and comment tags in the left two-thirds; the right third quiet.",
     "text": "This was a suppose story. The studies on the cards are real; links in the description."},
]
