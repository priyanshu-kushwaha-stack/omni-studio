"""Section c: Year 6, The Split, and Year 10, The Handover (4:42-7:13), from "The city has quietly become two cities"
to "Count the screws". Offsets inside long lines come from the local narration's word timings
(assets/narration/*.words.json); the kitchen hold shots are offsets into "You: No." (its 5 s hold follows it)."""

ESC = "escalators"
SOFA = (-1.7, 2.15, -0.1)  # flat "sofa" mark, lowered so the hips sit on the cushion
YOU_HALL = (-4.21, 16.8, 3.2)  # voting_hall mark "you" (seat 37, row 16)
STRANGER = (11.23, 46.2, 8.8)  # voting_hall mark "stranger"


def you(**kw):
    c = {"who": "you", "at": "you", "pose": "pockets", "face": "happy", "lens": "cyan"}
    c.update(kw)
    return c


def dana(**kw):
    c = {"who": "dana", "at": "dana", "pose": "stand", "face": "happy", "lens": "cyan"}
    c.update(kw)
    return c


PASS = [dana(facing=70, gaze=(0.4, 0.0)), you(facing=-60, gaze=(-0.5, 0.0))]
APART = [dana(facing=180, face="happy", gaze=(0.0, 0.4)), you(facing=0, gaze=(0.0, -0.2))]
CARD_D = [("holo", {"name": "cd1", "loc": (-1.24, 1.5, 0.98), "rot": (10, 0, -14), "w": 0.36, "h": 0.22}),
          ("holo", {"name": "cd2", "loc": (-2.14, 1.62, 1.18), "rot": (6, 0, 16), "w": 0.3, "h": 0.2, "lines": 3})]
CARD_Y = [("holo", {"name": "cy1", "loc": (-2.12, 1.58, 1.16), "rot": (8, 0, 14), "w": 0.36, "h": 0.22}),
          ("holo", {"name": "cy2", "loc": (-1.27, 1.66, 1.24), "rot": (6, 0, -12), "w": 0.26, "h": 0.17, "lines": 2})]
FLAT_CAM = {"loc": (-1.5, -0.7, 1.15), "target": (-1.7, 2.1, 1.0), "lens": 40, "fstop": 4.0}
FLAT_CLOSE = {"loc": (-1.58, 0.45, 1.12), "target": (-1.7, 2.1, 1.06), "lens": 36, "fstop": 2.8}
HALL_YOU_CAM = {"loc": (-3.6, 14.6, 4.6), "target": (-4.21, 16.8, 4.35), "lens": 45, "fstop": 2.8, "focus": "you"}
MY_CARD = ("holo", {"name": "mycard", "loc": (-3.98, 16.36, 4.12), "rot": (12, 0, -18), "w": 0.34, "h": 0.21, "lines": 3})

SHOTS = [
    # ---------------------------------------------------------------- Year 6: the escalators
    {"id": "c01", "set": ESC, "mood": "dusk", "anchor": "The city has quietly become two cities", "move": "push_in",
     "cast": [dana(facing=180), you(facing=0)],
     "cam": {"loc": (0.0, -7.8, 1.6), "target": (0.0, 4.2, 3.9), "lens": 22, "fstop": 8.0, "focus_dist": 10}},
    {"id": "c02", "set": ESC, "mood": "dusk", "anchor": "The city has quietly become two cities", "offset_s": 4.1, "move": "pan_right",
     "cast": [dana(facing=180), you(facing=0, gaze=(0.0, -0.3))],
     "cam": {"loc": (1.05, -1.5, 1.45), "target": (0.7, 4.2, 3.3), "lens": 50, "fstop": 2.8, "focus_dist": 4.2}},
    {"id": "c03", "set": ESC, "mood": "dusk", "anchor": "The city has quietly become two cities", "offset_s": 7.6, "move": "drift_up",
     "cast": [dana(facing=180), you(facing=0)],
     "cam": {"loc": (0.0, -8.5, 7.0), "target": (0.0, 8.0, 4.0), "lens": 24, "fstop": 8.0, "focus_dist": 9}},
    {"id": "c04", "set": ESC, "mood": "dusk", "anchor": "The city has quietly become two cities", "offset_s": 9.7, "move": "push_in",
     "cast": [dana(facing=180), you(facing=0, gaze=(0.0, -0.25))],
     "cam": {"loc": (1.15, 2.3, 3.3), "target": (0.75, 3.43, 3.2), "lens": 34, "fstop": 2.8, "focus": "you"}},
    {"id": "c05", "set": ESC, "mood": "dusk", "anchor": "Dana: Still signing?", "move": "hold",
     "cast": [dana(facing=70, gaze=(0.3, 0.0)), you(facing=-60, gaze=(-0.5, 0.0))],
     "cam": {"loc": (0.05, 2.0, 3.2), "target": (-0.75, 3.43, 3.32), "lens": 35, "fstop": 2.8, "focus": "dana"}},
    {"id": "c06", "set": ESC, "mood": "dusk", "anchor": "You: Still.", "move": "push_in",
     "cast": [dana(facing=70, gaze=(0.3, 0.0)), you(facing=-60, face="happy", gaze=(-0.3, 0.0))],
     "cam": {"loc": (-0.05, 2.0, 3.2), "target": (0.75, 3.43, 3.3), "lens": 35, "fstop": 2.8, "focus": "you"}},
    {"id": "c07", "set": ESC, "mood": "dusk", "anchor": "Dana: I argue with mine for an hour a night.", "move": "push_in",
     "cast": PASS, "cam": {"loc": (0.0, -0.6, 2.2), "target": (0.0, 3.43, 3.2), "lens": 38, "fstop": 4.0, "focus_dist": 4.1}},
    {"id": "c08", "set": ESC, "mood": "dusk", "anchor": "Dana: I argue with mine for an hour a night.", "offset_s": 2.6, "move": "hold",
     "cast": [dana(facing=70, face="joy", gaze=(0.3, 0.1)), you(facing=-60, gaze=(-0.5, 0.0))],
     "cam": {"loc": (0.05, 2.3, 3.3), "target": (-0.75, 3.43, 3.32), "lens": 50, "fstop": 2.8, "focus": "dana"}},
    # ---------------------------------------------------------------- the split screen: two identical flats at dusk
    {"id": "c09", "set": "flat", "mood": "dusk", "split": "left", "anchor": "Dana: No. Explain it again.", "move": "push_in",
     "cast": [dana(at=SOFA, facing=0, pose="sit", face="worried", gaze=(0.3, 0.2), look={"lean": 12})],
     "props": CARD_D, "cam": dict(FLAT_CAM, focus="dana")},
    {"id": "c10", "set": "flat", "mood": "dusk", "split": "right", "anchor": "Dana: No. Explain it again.", "move": "push_in",
     "cast": [you(at=SOFA, facing=0, pose="sit", face="happy", gaze=(-0.2, 0.3), look={"lean": -8})],
     "props": CARD_Y, "cam": dict(FLAT_CAM, focus="you")},
    {"id": "c11", "set": "flat", "mood": "dusk", "split": "left", "anchor": "Echo: You're the only person who argues with me.", "move": "hold",
     "cast": [dana(at=SOFA, facing=0, pose="sit", face="joy", gaze=(0.35, 0.25), look={"lean": 12})],
     "props": CARD_D, "cam": dict(FLAT_CLOSE, focus="dana")},
    {"id": "c12", "set": "flat", "mood": "dusk", "split": "right", "anchor": "Echo: You're the only person who argues with me.", "move": "hold",
     "cast": [you(at=SOFA, facing=0, pose="sit", face="happy", gaze=(-0.3, 0.35), look={"lean": -8})],
     "props": CARD_Y[:1], "cam": dict(FLAT_CLOSE, focus="you")},
    {"id": "c13", "set": "flat", "mood": "dusk", "split": "left", "anchor": "You: Thanks.", "move": "push_in",
     "cast": [dana(at=SOFA, facing=0, pose="sit", face="worried", gaze=(0.5, 0.05), look={"lean": 16})],
     "props": CARD_D, "cam": dict(FLAT_CAM, focus="dana")},
    {"id": "c14", "set": "flat", "mood": "dusk", "split": "right", "anchor": "You: Thanks.", "move": "push_in",
     "cast": [you(at=SOFA, facing=0, pose="sit", face="joy", gaze=(-0.3, 0.35), look={"lean": -8})],
     "props": CARD_Y[:1], "cam": dict(FLAT_CAM, focus="you")},
    {"id": "c15", "set": "flat", "mood": "dusk", "anchor": "You have never asked it a question.", "move": "push_in",
     "cast": [you(at=SOFA, facing=0, pose="sit", face="happy", gaze=(-0.25, 0.35), look={"lean": -8})],
     "props": CARD_Y, "cam": {"loc": (-1.6, 0.6, 1.15), "target": (-1.7, 2.1, 1.08), "lens": 42, "fstop": 2.8, "focus": "you"}},
    {"id": "c16", "set": "flat", "mood": "dusk", "anchor": "You'd bet the one who kept the job came out ahead.", "move": "pan_left",
     "cast": [you(at=SOFA, facing=10, pose="sit", face="happy", gaze=(0.3, 0.1), look={"lean": -10})],
     "cam": {"loc": (-0.4, -0.5, 1.3), "target": (-1.75, 2.1, 0.92), "lens": 32, "fstop": 4.0, "focus": "you"}},
    {"id": "c17", "set": "flat", "mood": "dusk", "anchor": "You'd bet the one who kept the job came out ahead.", "offset_s": 2.6, "move": "push_in",
     "cast": [dana(at="window", facing=-14, pose="point", face="happy", gaze=(0.4, 0.15))],
     "props": [("holo", {"name": "dcard", "loc": (0.62, -0.42, 1.36), "rot": (6, 0, -24), "w": 0.3, "h": 0.2, "lines": 3})],
     "cam": {"loc": (0.38, -1.75, 1.25), "target": (0.72, 3.4, 1.3), "lens": 34, "fstop": 4.0, "focus": "dana", "shift": (0, 0.03)}},
    # ---------------------------------------------------------------- the two models
    {"id": "c18", "kind": "card", "anchor": "An economist at Rutgers modelled a line", "move": "hold"},
    {"id": "c19", "set": ESC, "mood": "dusk_apart", "anchor": "An economist at Rutgers modelled a line", "offset_s": 2.7, "move": "push_in",
     "cast": APART, "cam": {"loc": (-0.75, 9.0, 7.2), "target": (-0.75, 5.46, 4.47), "lens": 45, "fstop": 2.8, "focus": "dana"}},
    {"id": "c20", "set": ESC, "mood": "dusk_apart", "anchor": "An economist at Rutgers modelled a line", "offset_s": 4.8, "move": "push_out",
     "cast": APART, "cam": {"loc": (0.75, -0.6, 4.3), "target": (0.75, 1.82, 2.2), "lens": 35, "fstop": 2.8, "focus": "you"}},
    {"id": "c21", "kind": "card", "anchor": "An economist at Rutgers modelled a line", "offset_s": 8.7, "move": "hold"},
    {"id": "c22", "set": ESC, "mood": "dusk_apart", "anchor": "An economist at Rutgers modelled a line", "offset_s": 14.4, "move": "pan_left",
     "cast": APART, "cam": {"loc": (4.6, 0.4, 2.6), "target": (-0.3, 3.8, 3.0), "lens": 26, "fstop": 5.6, "focus_dist": 5.5}},
    {"id": "c23", "set": ESC, "mood": "dusk_apart", "anchor": "An economist at Rutgers modelled a line", "offset_s": 18.5, "move": "pan_left",
     "cast": APART, "cam": {"loc": (0.0, -3.6, 1.9), "target": (0.0, 4.0, 3.5), "lens": 28, "fstop": 5.6, "focus_dist": 6}},
    # ---------------------------------------------------------------- the question
    {"id": "c24", "set": ESC, "mood": "dusk_end", "anchor": "Dana: Which one are you on?", "move": "push_in",
     "cast": [dana(facing=0, face="worried", gaze=(0.0, -0.35)), you(facing=0, face="stunned", gaze=(0.0, 0.6))],
     "cam": {"loc": (-0.7, 5.2, 4.25), "target": (-0.75, 8.02, 5.3), "lens": 40, "fstop": 2.8, "focus": "dana"}},
    {"id": "c25", "set": ESC, "mood": "dusk_end", "anchor": "Dana: Which one are you on?", "offset_s": 1.0, "move": "push_in",
     "cast": [dana(facing=0, face="worried", gaze=(0.0, -0.35)), you(facing=0, face="stunned", gaze=(0.0, 0.65))],
     "cam": {"loc": (0.8, -0.5, 1.5), "target": (0.75, 0.6, 1.78), "lens": 40, "fstop": 2.8, "focus": "you"}},
    {"id": "c26", "set": ESC, "mood": "dusk_end", "anchor": "You can't answer.", "move": "push_out",
     "cast": [dana(facing=0, face="worried", gaze=(0.0, -0.35)), you(facing=0, face="worried", gaze=(0.0, 0.7))],
     "cam": {"loc": (0.75, -0.9, 3.6), "target": (0.75, 0.9, 1.4), "lens": 35, "fstop": 4.0, "focus": "you"}},
    # ---------------------------------------------------------------- the tap
    {"id": "c27", "set": "kitchen", "mood": "night", "anchor": "Echo: I can call someone.", "move": "push_in",
     "cast": [you(at="sink", facing=90, pose="stand", face="worried", gaze=(0.5, 0.1))],
     "cam": {"loc": (1.3, -1.25, 1.45), "target": (0.2, 0.25, 1.1), "lens": 28, "fstop": 4.0, "focus": "you"}},
    {"id": "c28", "set": "kitchen", "mood": "night", "anchor": "You: No.", "move": "push_in",
     "cast": [you(at="sink", facing=60, pose="stand", face="happy", gaze=(0.35, 0.05))],
     "cam": {"loc": (0.9, -1.25, 1.3), "target": (-0.02, -0.12, 1.15), "lens": 35, "fstop": 2.8, "focus": "you"}},
    {"id": "c29", "set": "kitchen", "mood": "drawer", "anchor": "You: No.", "offset_s": 0.9, "move": "hold",
     "cast": [you(at="drawer", facing=160, pose="hold", face="worried", gaze=(0.0, -0.5), look={"nod": 20, "lean": 12})],
     "cam": {"loc": (1.4, -0.6, 1.5), "target": (0.55, 0.05, 0.7), "lens": 32, "fstop": 4.0, "focus": "you"}},
    {"id": "c30", "set": "kitchen", "mood": "under", "anchor": "You: No.", "offset_s": 2.1, "move": "pan_left",
     "cam": {"loc": (1.15, -1.45, 1.25), "target": (0.0, 0.05, 0.3), "lens": 30, "fstop": 4.0, "focus_dist": 2.0}},
    {"id": "c31", "set": "kitchen", "mood": "under_slip", "anchor": "You: No.", "offset_s": 3.2, "move": "push_in",
     "cam": {"loc": (0.14, -0.78, 0.62), "target": (0.0, 0.55, 0.34), "lens": 35, "fstop": 2.8, "focus_dist": 1.35}},
    {"id": "c32", "set": "kitchen", "mood": "floor", "anchor": "You: No.", "offset_s": 4.3, "move": "hold",
     "cam": {"loc": (0.22, 0.2, 1.04), "target": (0.0, 0.69, 1.12), "lens": 50, "fstop": 2.8, "focus_dist": 0.55}},
    {"id": "c33", "set": "kitchen", "mood": "floor", "anchor": "Echo: Handled?", "move": "hold",
     "props": [("holo", {"name": "ehandled", "loc": (0.44, -0.3, 0.9), "rot": (8, 0, -20), "w": 0.26, "h": 0.17, "lines": 2})],
     "cam": {"loc": (0.5, -1.6, 0.95), "target": (0.1, -0.05, 0.7), "lens": 35, "fstop": 2.8, "focus_dist": 1.65}},
    {"id": "c34", "set": "kitchen", "mood": "floor_joy", "anchor": "You: By me.", "move": "push_in",
     "cam": {"loc": (0.3, -1.35, 0.85), "target": (0.02, -0.06, 0.7), "lens": 38, "fstop": 2.8, "focus_dist": 1.3}},
    {"id": "c35", "set": ESC, "mood": "dusk_foot", "anchor": "One foot on her escalator.", "move": "push_in",
     "cast": [you(facing=180, pose="stand", face="happy", gaze=(0.0, 0.6))],
     "cam": {"loc": (-0.75, 2.3, 2.35), "target": (-0.75, -1.05, 1.25), "lens": 32, "fstop": 2.8, "focus": "you"}},
    {"id": "c36", "set": "voting_hall", "mood": "day", "anchor": "One foot on her escalator.", "offset_s": 3.6, "move": "drift_up",
     "cam": {"loc": (1.6, -4.0, 0.9), "target": (0.0, -9.0, 2.2), "lens": 30, "fstop": 5.6, "focus_dist": 5.3}},
    # ---------------------------------------------------------------- Year 10: the voting hall
    {"id": "c37", "kind": "tag", "text": "YEAR 10", "anchor": "A plan, for the whole city."},
    {"id": "c38", "set": "voting_hall", "mood": "day", "anchor": "A plan, for the whole city.", "offset_s": 1.3, "move": "push_in",
     "cast": [you(at="you", facing=0, pose="stand")],
     "cam": {"loc": (-4.0, 30.0, 11.0), "target": (0.0, -9.0, 2.0), "lens": 30, "fstop": 8.0, "focus_dist": 30}},
    {"id": "c39", "set": "voting_hall", "mood": "day", "anchor": "A plan, for the whole city.", "offset_s": 3.8, "move": "push_in",
     "cam": {"loc": (-1.4, 1.4, 1.6), "target": (0.0, -9.0, 1.95), "lens": 50, "fstop": 4.0, "focus_dist": 10.5}},
    {"id": "c40", "set": "voting_hall", "mood": "day", "anchor": "You read the title.", "move": "push_in",
     "cast": [you(at="you", facing=0, pose="hold", face="happy", gaze=(0.1, -0.2))],
     "props": [("holo", {"name": "title", "loc": (-4.1, 16.3, 4.02), "rot": (16, 0, -6), "w": 0.32, "h": 0.2, "lines": 1})],
     "cam": HALL_YOU_CAM},
    {"id": "c41", "set": "voting_hall", "mood": "day", "anchor": "Nine thousand people in one hall", "move": "push_out",
     "cast": [you(at="you", facing=0, pose="stand")],
     "cam": {"loc": (2.0, -6.5, 2.4), "target": (-2.0, 20.0, 5.5), "lens": 32, "fstop": 8.0, "focus_dist": 20}},
    {"id": "c42", "set": "voting_hall", "mood": "bloom", "anchor": "Nine thousand people in one hall", "offset_s": 5.9, "move": "drift_up",
     "cast": [you(at="you", facing=0, pose="stand", face="stunned")],
     "cam": {"loc": (0.0, -7.0, 4.5), "target": (0.0, 22.0, 5.0), "lens": 30, "fstop": 8.0, "focus_dist": 20}},
    {"id": "c43", "set": "voting_hall", "mood": "bloom", "anchor": "Echo: Yes. You'll like it.", "move": "push_in",
     "cast": [you(at="you", facing=0, pose="stand", face="joy", gaze=(0.25, -0.2))], "props": [MY_CARD],
     "cam": dict(HALL_YOU_CAM, lens=55)},
    {"id": "c44", "set": "voting_hall", "mood": "bloom", "anchor": "Somebody wrote it, you think.", "move": "hold",
     "cast": [you(at="you", facing=0, pose="stand", face="worried", gaze=(0.2, 0.45))], "props": [MY_CARD],
     "cam": {"loc": (-4.7, 15.4, 4.75), "target": (-4.21, 16.8, 4.45), "lens": 45, "fstop": 2.8, "focus": "you"}},
    {"id": "c45", "set": "voting_hall", "mood": "day", "anchor": "Somebody wrote it, you think.", "offset_s": 2.1, "move": "drift_up",
     "cam": {"loc": (0.8, -6.2, 0.6), "target": (0.0, -9.0, 2.6), "lens": 28, "fstop": 5.6, "focus_dist": 3.0}},
    {"id": "c46", "set": "voting_hall", "mood": "bloom", "anchor": "The plan was written by AIs too.", "move": "push_in",
     "cam": {"loc": (-3.2, -4.0, 1.6), "target": (0.0, -9.0, 2.1), "lens": 32, "fstop": 4.0, "focus_dist": 5.9}},
    {"id": "c47", "set": "voting_hall", "mood": "bloom", "anchor": "The plan was written by AIs too.", "offset_s": 2.3, "move": "pan_right",
     "cast": [you(at="you", facing=0, pose="stand")],
     "cam": {"loc": (30.0, 6.0, 20.0), "target": (0.0, 20.0, 4.0), "lens": 28, "fstop": 8.0, "focus_dist": 30}},
    {"id": "c48", "set": "voting_hall", "mood": "bloom", "anchor": "The plan was written by AIs too.", "offset_s": 6.2, "move": "push_in",
     "cast": [you(at="you", facing=-12, pose="point", face="happy", gaze=(0.1, -0.1))],
     "props": [("holo", {"name": "yes", "loc": (-4.12, 16.12, 4.08), "rot": (10, 0, -8), "w": 0.3, "h": 0.19, "lines": 2})],
     "cam": {"loc": (-3.55, 14.9, 4.7), "target": (-4.1, 16.5, 4.25), "lens": 45, "fstop": 2.8, "focus": "you"}},
    {"id": "c49", "set": "voting_hall", "mood": "bloom", "anchor": "The plan was written by AIs too.", "offset_s": 8.1, "move": "pan_right",
     "cast": [{"who": "stranger", "at": "stranger", "facing": 0, "pose": "stand", "face": "happy", "gaze": (0.0, 0.0), "lens": "off"}],
     "cam": {"loc": (10.3, 44.0, 10.3), "target": (11.23, 46.2, 9.95), "lens": 42, "fstop": 2.8, "focus": "stranger"}},
    # ---------------------------------------------------------------- the sign-off desk
    {"id": "c50", "set": "signoff", "mood": "day", "anchor": "Chief: Signing engineer.", "move": "push_in",
     "cast": [you(facing=8, pose="stand", face="happy", gaze=(0.3, 0.0)),
              {"who": "chief", "at": "chief", "facing": -35, "pose": "point", "face": "joy", "gaze": (-0.4, 0.0)}],
     "cam": {"loc": (0.0, -1.9, 1.3), "target": (0.05, 0.4, 1.12), "lens": 30, "fstop": 4.0, "focus": "you"}},
    {"id": "c51", "set": "signoff", "mood": "day", "anchor": "Echo: I've read it.", "move": "push_in",
     "cast": [you(facing=-20, pose="stand", face="happy", gaze=(-0.4, -0.1)),
              {"who": "chief", "at": "chief", "facing": -20, "pose": "stand", "face": "happy"}],
     "cam": {"loc": (-0.72, -0.98, 1.27), "target": (-0.84, -0.12, 1.16), "lens": 50, "fstop": 2.8, "focus_dist": 0.86}},
    {"id": "c52", "set": "signoff", "mood": "signed", "anchor": "Echo: I've read it.", "offset_s": 1.7, "move": "hold",
     "cast": [you(facing=-35, pose="point", face="happy", gaze=(-0.3, -0.1)),
              {"who": "chief", "at": "chief", "facing": -20, "pose": "stand", "face": "happy", "gaze": (-0.4, 0.0)}],
     "cam": {"loc": (-0.9, -1.6, 1.3), "target": (-0.55, 0.15, 1.15), "lens": 34, "fstop": 2.8, "focus": "you"}},
    {"id": "c53", "set": "signoff", "mood": "folded", "anchor": "Echo: Handled.", "move": "push_out",
     "cast": [you(facing=0, pose="stand", face="happy", gaze=(-0.3, 0.0)),
              {"who": "chief", "at": "chief", "facing": -20, "pose": "stand", "face": "joy", "gaze": (-0.4, 0.0)}],
     "cam": {"loc": (-0.25, -2.0, 1.35), "target": (-0.3, 0.2, 1.1), "lens": 32, "fstop": 4.0, "focus": "you"}},
    # ---------------------------------------------------------------- the screws
    {"id": "c54", "kind": "drawn", "picture": "wheel", "anchor": "Picture a steering wheel"},
    {"id": "c55", "kind": "card", "anchor": "A group of researchers argue", "move": "hold"},
    {"id": "c56", "set": "voting_hall", "mood": "bloom", "anchor": "A group of researchers argue", "offset_s": 5.3, "move": "drift_up",
     "cast": [you(at="you", facing=0, pose="stand")],
     "cam": {"loc": (0.0, 8.0, 24.0), "target": (0.0, 22.0, 4.0), "lens": 24, "fstop": 8.0, "focus_dist": 25}},
    {"id": "c57", "kind": "card", "anchor": "A group of researchers argue", "offset_s": 9.7, "move": "hold"},
    {"id": "c58", "set": "kitchen", "mood": "wrench", "anchor": "Count the screws", "move": "push_in",
     "cam": {"loc": (0.78, 0.08, 1.1), "target": (0.42, 0.55, 0.84), "lens": 45, "fstop": 2.8, "focus_dist": 0.65}},
    {"id": "c59", "set": "flat", "mood": "night", "anchor": "Count the screws", "offset_s": 2.3, "move": "push_in",
     "cast": [you(at=(1.6, 2.75, 0.0), facing=180, pose="stand", face="happy", gaze=(0.2, 0.3))],
     "cam": {"loc": (1.75, 4.6, 1.4), "target": (1.6, 2.75, 1.25), "lens": 40, "fstop": 2.8, "focus": "you"}},
]
