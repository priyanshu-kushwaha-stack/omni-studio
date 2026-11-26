"""The G2 story reel's stills: one 3D frame per shot, in the owner's look (film3d.py, the round-2 thumbnail settings:
matte black heads, saturated cloth, Cycles). Remotion adds the camera moves and the cuts on the narration.

    blender -b -noaudio --python reel3d.py -- --out <dir> [--only s01,s02] [--section a] [--res 1600x900]
                                               [--samples 96] [--engine cycles|eevee] [--list]

A shot is a dict in shots/<section>.py (SHOTS = [...]):
    {"id": "a03", "set": "flat", "mood": "morning",
     "cast": [{"who": "you", "at": "window", "facing": -20, "pose": "stand", "face": "joy", "gaze": (0.3, 0.1),
               "lens": "cyan"}],
     "props": [("drone", {"loc": (0.5, -0.3, 1.4), "carry": "mug"})],
     "cam": {"loc": (0.4, -1.8, 1.25), "target": (0.7, 3.4, 1.3), "lens": 34, "fstop": 4.0, "focus": "you"}}
"at" is a mark the set returns (a name) or an (x, y, z) tuple. Faces: stunned, joy, happy, worried, sly, scared.
Lens: "cyan", "grey", "red" (left cyan, right red), "off". Poses: see POSES. Everything is built in code from
primitives: no downloaded models, no AI images; faces hold expressions (no lip-sync).
"""

import argparse
import importlib
import math
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

_argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
_ap = argparse.ArgumentParser()
_ap.add_argument("--out", required=True)
_ap.add_argument("--only", default=None)
_ap.add_argument("--section", default=None)
_ap.add_argument("--res", default="1600x900")
_ap.add_argument("--samples", type=int, default=96)
_ap.add_argument("--engine", default="cycles", choices=["cycles", "eevee"])
_ap.add_argument("--list", action="store_true")
RA = _ap.parse_args(_argv)

# film3d reads its own arguments at import: give it the round-2 thumbnail look the owner accepted.
sys.argv = [sys.argv[0], "--", "--shot", "thumb2", "--engine", RA.engine, "--res", RA.res, "--samples", str(RA.samples)]
import film3d as F  # noqa: E402

D2R = math.pi / 180.0
SECTIONS = ["a", "b", "c", "d"]

# ---------------------------------------------------------------- cast

DANA = dict(top="#3E7FB8", cuff="#2F6696", pants="#2E3440", shoes="#2B2B2B", collar=True, hair="bob_bun", pencil=True)
CHIEF = dict(top="#D9E021", cuff="#B8BE12", pants="#3B4252", shoes="#3A2E26", collar=True)
CREW = [dict(top="#E58A2E", cuff="#C47320", pants="#3B3F4A", shoes="#222222", beanie="#2B2F36"),
        dict(top="#6E9E64", cuff="#5A8752", pants="#2E3440", shoes="#5A3B2A", cap=F.PAL["crimson"]),
        dict(top="#8C7BB0", cuff="#73649A", pants="#3B4252", shoes="#2B2B2B", collar=True)]
STRANGER = dict(top="#9E1B2C", cuff="#7E1422", pants="#1E1E24", shoes="#1E1E24", collar=True)
SPECS = {"you": F.YOU41, "dana": DANA, "chief": CHIEF, "stranger": STRANGER,
         "crew1": CREW[0], "crew2": CREW[1], "crew3": CREW[2]}
IRIS = {"you": "#6A4530", "dana": "#4D6F92", "chief": "#5E7E3A", "stranger": "#2A2A2A"}
LENS = {"cyan": ("#7FF3FF", "#7FF3FF"), "grey": ("#8A949C", "#8A949C"), "red": ("#7FF3FF", "#FF3B4E")}

# ---------------------------------------------------------------- poses (joint angles on film3d's rig)


def _hands(J, curl=0.3):
    for s in ("L", "R"):
        F.pose_hand(J, s, curl, curl)


def p_stand(J):
    F.arm(J, "L", abduct=12, flex=8, elbow=15)
    F.arm(J, "R", abduct=12, flex=8, elbow=15)
    _hands(J, 0.35)


def p_pockets(J):
    F.arm(J, "L", abduct=8, flex=-12, elbow=35, twist=10)
    F.arm(J, "R", abduct=8, flex=-12, elbow=35, twist=10)
    _hands(J, 0.8)


def p_temple(J):
    F.arm(J, "R", abduct=30, flex=95, elbow=125, elbow_up=10, wrist=(0, -20, 0))
    F.pose_hand(J, "R", 0.35, 0.3, spread=0.7)
    F.arm(J, "L", abduct=22, flex=20, elbow=35, wrist=(0, 10, 0))
    F.pose_hand(J, "L", 0.3, 0.3)


def p_arms_up(J):
    F.arm(J, "L", abduct=128, flex=18, elbow=28, elbow_up=22, wrist=(0, 10, 0))
    F.arm(J, "R", abduct=132, flex=14, elbow=22, elbow_up=25, wrist=(0, 10, 0))
    _hands(J, 0.2)


def p_point(J):
    F.arm(J, "R", abduct=20, flex=80, elbow=10)
    F.pose_hand(J, "R", 0.7, 0.6, spread=0.5)
    F.arm(J, "L", abduct=12, flex=8, elbow=15)
    F.pose_hand(J, "L", 0.35, 0.3)


def p_hold(J):
    """Both hands forward at chest height, holding a page or a card."""
    F.arm(J, "L", abduct=18, flex=50, elbow=75)
    F.arm(J, "R", abduct=18, flex=50, elbow=75)
    _hands(J, 0.55)


def p_shrug(J):
    F.arm(J, "L", abduct=35, flex=25, elbow=95, elbow_up=-20)
    F.arm(J, "R", abduct=35, flex=25, elbow=95, elbow_up=-20)
    _hands(J, 0.1)


def p_wheel(J):
    """Both hands up and forward on a wheel at head height."""
    F.arm(J, "L", abduct=25, flex=105, elbow=40)
    F.arm(J, "R", abduct=25, flex=105, elbow=40)
    _hands(J, 0.7)


def p_sit(J):
    F.sit(J)
    F.arm(J, "L", abduct=15, flex=35, elbow=60)
    F.arm(J, "R", abduct=15, flex=35, elbow=60)
    _hands(J, 0.4)


def p_wave(J):
    F.arm(J, "R", abduct=110, flex=20, elbow=60, elbow_up=10)
    F.pose_hand(J, "R", 0.1, 0.1, spread=1.0)
    F.arm(J, "L", abduct=12, flex=8, elbow=15)
    F.pose_hand(J, "L", 0.35, 0.3)


def p_punch(J):
    F.arm(J, "R", abduct=150, flex=10, elbow=20, elbow_up=10)
    F.pose_hand(J, "R", 0.95, 0.9)
    F.arm(J, "L", abduct=20, flex=30, elbow=60)
    F.pose_hand(J, "L", 0.6, 0.5)


POSES = {"stand": p_stand, "pockets": p_pockets, "temple": p_temple, "arms_up": p_arms_up, "point": p_point,
         "hold": p_hold, "shrug": p_shrug, "wheel": p_wheel, "sit": p_sit, "wave": p_wave, "punch": p_punch}


def place(c, marks):
    who = c["who"]
    spec = SPECS[who]
    at = c.get("at", (0, 0, 0))
    loc = marks[at] if isinstance(at, str) else at
    J = F.person(c.get("name", who), spec, loc=tuple(loc), facing=c.get("facing", 0.0))
    POSES[c.get("pose", "stand")](J)
    if c.get("look"):
        F.look(J, **c["look"])
    F.build_face(J["headmesh"], J["R"], c.get("face", "happy"), gaze=tuple(c.get("gaze", (0, 0))), iris=IRIS.get(who, "#6A4530"))
    lens = c.get("lens", "cyan")
    if lens in LENS:
        F.lens_rings(J["headmesh"], J["R"], colors=LENS[lens])
    return J


# ---------------------------------------------------------------- props


def prop(kind, kw):
    if kind == "drone":
        return F.drone(kw.get("name", f"drone{id(kw)}"), kw["loc"], kw.get("rot", (0, 0, 0)), kw.get("s", 1.0), kw.get("carry"))
    if kind == "holo":
        return F.holo_panel(kw.get("name", f"holo{id(kw)}"), kw["loc"], kw.get("rot", (0, 0, 0)), kw.get("w", 0.36), kw.get("h", 0.22), kw.get("lines", 4))
    raise ValueError(kind)


# ---------------------------------------------------------------- runner


def reset():
    for coll in (bpy.data.objects, bpy.data.meshes, bpy.data.lights, bpy.data.cameras, bpy.data.node_groups):
        for b in list(coll):
            try:
                coll.remove(b)
            except Exception:
                pass
    F.COL = bpy.context.scene.collection


def build_set(name, mood):
    mod = importlib.import_module(f"sets3d.{name}")
    return mod.build(mood) or {}


def render_shot(shot, out_dir):
    reset()
    mood = shot.get("mood", "day")
    F.MOOD = "day" if mood in ("morning", "day") else "night"
    F.setup_render()
    marks = build_set(shot["set"], mood)
    js = {}
    for c in shot.get("cast", []):
        js[c.get("name", c["who"])] = place(c, marks)
    for kind, kw in shot.get("props", []):
        prop(kind, kw)
    cam = shot["cam"]
    focus = cam.get("focus")
    focus_ob = js[focus]["headmesh"] if focus in js else cam.get("focus_dist", 3.0)
    F.camera(tuple(cam["loc"]), tuple(cam["target"]), lens=cam.get("lens", 32), fstop=cam.get("fstop", 4.0), focus=focus_ob,
             shift=tuple(cam.get("shift", (0, 0))))
    sc = bpy.context.scene
    sc.frame_set(1)
    sc.render.filepath = os.path.join(out_dir, f"{shot['id']}.png")
    bpy.ops.render.render(write_still=True)
    print("SHOT", shot["id"], sc.render.filepath)


def all_shots():
    out = []
    for sec in SECTIONS:
        try:
            mod = importlib.import_module(f"shots.{sec}")
        except ModuleNotFoundError:
            continue
        for s in mod.SHOTS:
            out.append((sec, s))
    return out


def main():
    os.makedirs(RA.out, exist_ok=True)
    only = set(RA.only.split(",")) if RA.only else None
    shots = [(sec, s) for sec, s in all_shots() if (not RA.section or sec == RA.section) and (not only or s["id"] in only)]
    if RA.list:
        for sec, s in shots:
            print(sec, s["id"], s["set"], s.get("mood"))
        return
    for _sec, s in shots:
        render_shot(s, RA.out)
    print("DONE", len(shots))


main()
