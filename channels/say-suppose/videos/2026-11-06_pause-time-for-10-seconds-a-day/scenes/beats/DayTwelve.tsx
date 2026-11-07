import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, lerpPose, reach, runPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext, useLook, type Glow } from "@whatif/kit/stage/Look";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { FastMove } from "@whatif/kit/stage/motion";
import { CRIMSON, INK } from "@whatif/kit/theme";
import type { Clip } from "@whatif/kit/timeline";
import { Tag } from "@whatif/kit/ui/Tag";
import { Counter, type Tick } from "../parts";
import { Ball, Bus, BUS_STOP_X, KID_FEET, LIGHT_X, Pigeon, SKY, StreetBack } from "../sets/Street";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, MOTHER, noise, ramp, STRANGER, type Beat, type Shot } from "../shared";

/** Beat 3, "Day twelve" (script v7, lines 22 to 34): the walk home, the bus through the red light, the kid in the
 *  road, the 23 m tape riding ahead of the moving bus, the pause, the rescue, the bus through the empty crossing, the
 *  mother, and you walking away. Frozen things (bus, kid, ball, crowd, pigeons) run on world time; you run on `frame`.
 *  From the `kid` cue to `pause` the world runs in slow motion (SLOW), so the bus is close enough for its 23 m tape to
 *  reach past the kid, and it still meets the Opening's tableau when time stops. */

type Cues = Record<string, number>;
type Pt = { x: number; y: number };
interface Actor { x: number; y: number; s: number; facing: 1 | -1; pose: Pose }
interface Face { mouth: Mouth; brows: Brows; eyes: number; lids: number; look: Pt; blink: boolean }

/** The bus, as in the sample: 11 world units a frame, its front at BUS_STOP_X when time stops. */
const BUS_SPEED = 11;
/** World speed between the `kid` cue and `pause`: the moment stretches. */
const SLOW = 0.28;
/** Braking after the pause: from BUS_SPEED to rest. */
const BRAKE = 0.06;
const BRAKE_FRAMES = BUS_SPEED / BRAKE;
const BRAKE_DIST = (BUS_SPEED * BUS_SPEED) / (2 * BRAKE);
const BUS_REST = BUS_STOP_X - BRAKE_DIST;
/** Bus geometry (sets/Street Bus): front wheel and rear wheel offsets from the front, wheel contact line. */
const FRONT_WHEEL = 150;
const REAR_WHEEL = 610;
const WHEEL_GROUND = 890;
/** 23 m in world units (a 12 m bus is 760 units long). */
const TAPE_23 = 1450;

/** The stranger: far back on the far pavement, still, facing away from the crossing. */
const STRANGER_AT = { x: 1700, y: 704, s: 0.6 };

/** Where things happen on the ground. */
const GRAB = { x: 1085, y: 885 };
const SET = { x: 1180, y: 995 };
const KERB = { x: 1040, y: 1012 };
const BACK = { x: 920, y: 1012 };
const MOTHER_AT = 1372;

/** Actors further down the frame are nearer and bigger: adult scale 1 on the road at y 885, 1.3 on the near pavement. */
const depthScale = (y: number) => 1 + (y - 885) * 0.0024;
const KID_RATIO = 0.762;

const easeOut = (u: number, p = 2) => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), p);
const clamp01 = (u: number) => Math.min(1, Math.max(0, u));

function shoulderOf(a: Actor) {
  return joints(a.pose).shoulder;
}
function headOf(a: Actor): Pt {
  const j = joints(a.pose);
  return { x: a.x + j.head.x * a.s * a.facing, y: a.y + j.head.y * a.s };
}
function handOf(a: Actor, arm: "armF" | "armB" = "armF"): Pt {
  const sh = shoulderOf(a);
  const [u, f] = a.pose[arm];
  const d1 = dir(u);
  const d2 = dir(u + f);
  return { x: a.x + (sh.x + (d1.x + d2.x) * LIMB) * a.s * a.facing, y: a.y + (sh.y + (d1.y + d2.y) * LIMB) * a.s };
}
/** Arm angles that put an actor's hand on a world point. */
function armTo(a: Actor, target: Pt): [number, number] {
  const sh = shoulderOf(a);
  return reach(((target.x - a.x) / a.s) * a.facing - sh.x, (target.y - a.y) / a.s - sh.y);
}
/** The middle of a figure's torso, local units. */
function torsoLocal(pose: Pose): Pt {
  const j = joints(pose);
  return { x: (j.hip.x + j.neck.x) / 2, y: (j.hip.y + j.neck.y) / 2 };
}
/** The arm angles of a hand resting on a local point. */
const armAt = (pose: Pose, p: Pt): [number, number] => {
  const sh = joints(pose).shoulder;
  return reach(p.x - sh.x, p.y - sh.y);
};

/** A small, slow tremor in an arm (pose only: the drawing never moves on its own). Degrees. */
const tremor = (f: number, k: number, amount = 1) =>
  (Math.sin(f * 0.95 + k) * 2.4 + Math.sin(f * 1.63 + k * 2.1) * 1.3) * amount;

const CROUCH: Pose = { lean: 26, tilt: 8, drop: 22, armF: [60, 20], armB: [50, 20], legF: [40, -70], legB: [-20, -40] };
const CARRY: Pose = { lean: -6, tilt: -3, drop: 4, armF: [60, 40], armB: [50, 40], legF: [8, -4], legB: [-8, -3] };
const HANDS_ON_KNEES: Pose = (() => {
  const base: Pose = { lean: 30, tilt: 12, drop: 12, armF: [0, 0], armB: [0, 0], legF: [22, -28], legB: [-12, -18] };
  const hip = joints(base).hip;
  const knee = (a: number) => ({ x: hip.x + dir(a).x * LIMB, y: hip.y + dir(a).y * LIMB });
  return { ...base, armF: armAt(base, knee(22)), armB: armAt(base, { x: knee(22).x - 8, y: knee(22).y - 4 }) };
})();
const KNEEL: Pose = { lean: 14, tilt: 6, drop: 45, armF: [70, 40], armB: [60, 40], legF: [85, -85], legB: [-5, -85] };

/* ------------------------------------------------------------------------------------------------ timing */

interface Plan {
  from: number;
  walkEnd: number;
  stopX: number;
  /** World time: the kid leaves the far kerb, and the moment time stops. */
  k0: number;
  P: number;
  /** World time in this beat: the film's clock, slowed from the kid cue until the pause. */
  warp: (t: number) => number;
  lift: [number, number];
  carry: [number, number];
  lower: [number, number];
  stepBack: [number, number];
  pant: number;
  thanks: number;
  backAway: [number, number];
  walkAway: number;
  cuts: [number, ShotName][];
}

type ShotName =
  | "establish" | "walking" | "redlight" | "kid" | "face" | "neither" | "snap" | "tableau" | "sprint" | "grab"
  | "carry" | "ballInsert" | "setDown" | "kerb" | "brake" | "crush" | "kidDoes" | "stakes" | "busPunch" | "mother" | "driver"
  | "mother2" | "walkAway";

function planOf(c: Cues, clips: Clip[], from: number, wc: (f: number) => number): Plan {
  const walkEnd = c.kid + 10;
  const thanks = c.mother + 77;
  const setDownCut = c.five + 16;
  const S = wc(c.kid);
  const Pt = wc(c.pause);
  const warp = (t: number) => (t <= S ? t : t <= Pt ? S + SLOW * (t - S) : S + SLOW * (Pt - S) + (t - Pt));
  return {
    from,
    walkEnd,
    stopX: 170 + 2 * (walkEnd - from),
    k0: warp(wc(c.kid)) - 14,
    P: warp(Pt),
    warp,
    lift: [c.eight - 4, c.eight + 16],
    carry: [c.seven, setDownCut],
    lower: [setDownCut, c.four],
    stepBack: [c.three, c.two + 10],
    pant: c.two + 10,
    thanks,
    backAway: [c.ball + 40, c.ball + 82],
    walkAway: lineEnd(clips, 34),
    cuts: [
      [from, "establish"],
      [c.walk, "walking"],
      [clips[23].from, "redlight"],
      [clips[24].from, "kid"],
      [clips[25].from, "stakes"],
      [lineEnd(clips, 25) - 38, "busPunch"],
      [clips[26].from, "face"],
      [c.neither, "neither"],
      [clips[28].from, "snap"],
      [lineEnd(clips, 28), "tableau"],
      [c.run, "sprint"],
      [c.nine, "grab"],
      [c.seven, "carry"],
      [c.six, "ballInsert"],
      [setDownCut, "setDown"],
      [c.three, "kerb"],
      [c.resume, "brake"],
      [c.ball - 12, "crush"],
      [c.ball + 28, "kidDoes"],
      [clips[34].from, "mother"],
      [thanks, "driver"],
      [thanks + 34, "mother2"],
      [lineEnd(clips, 34), "walkAway"],
    ],
  };
}

/* ------------------------------------------------------------------------------------------------ the bus */

/** Distance braked since time came back (world frames since the resume). */
const braked = (tau: number) => {
  const u = Math.min(Math.max(0, tau), BRAKE_FRAMES);
  return BUS_SPEED * u - (BRAKE * u * u) / 2;
};

function busOf(name: ShotName, f: number, t: number, c: Cues, plan: Plan) {
  const tau = t - plan.P;
  // Shot "redlight" is its own angle up the road: the bus runs the light on the cue word.
  const x = name === "redlight" ? LIGHT_X - 20 + (c.red - f) * 14 : tau <= 0 ? BUS_STOP_X - tau * BUS_SPEED : BUS_STOP_X - braked(tau);
  const braking = tau > 0 && tau < BRAKE_FRAMES + 4;
  const after = tau - BRAKE_FRAMES;
  const dip = tau <= 0 ? 0 : tau < BRAKE_FRAMES ? 1.3 * Math.min(1, tau / 6) : 1.3 * Math.exp(-after / 7) * Math.cos(after * 0.32);
  return { x, tau, braking, moving: tau <= 0 || tau < BRAKE_FRAMES - 30, dip, odometer: (9000 - x) / BUS_SPEED };
}

/** Where the front wheel rolls onto the ball, and the ball's run in front of the bus once the bumper punts it. */
function ballOf(t: number, plan: Plan, crushTau: number) {
  const tau = t - plan.P;
  const crushX = BUS_STOP_X + FRONT_WHEEL - braked(crushTau);
  if (tau <= 3) {
    // Chasing: off the far kerb into the lane, slowing as it rolls; the sample's bounce. 1359 when time stops.
    const u = clamp01((t - plan.k0) / (plan.P - plan.k0));
    if (t < plan.k0) {
      // Dribbled on the far pavement.
      return { x: 994, y: 716 - 26 - Math.abs(Math.sin(t * 0.19)) * 62, spin: 0, squash: 1 };
    }
    const ground = mix(716, KID_FEET, clamp01(u * 4));
    const h = mix(70, 42, u);
    return { x: mix(1000, 1359, easeOut(u, 2.2)), y: ground - 26 - Math.abs(Math.sin(t * 0.22)) * h, spin: t * 9, squash: 1 };
  }
  if (tau < crushTau) {
    const T = 25;
    const R = (1360 - crushX) / (1 - Math.exp(-(crushTau - 3) / T));
    const k = tau - 3;
    const ground = mix(KID_FEET, WHEEL_GROUND, clamp01(k / 30));
    const h = 52 * Math.exp(-k / 16) * Math.abs(Math.sin(k * 0.28));
    return { x: 1360 - R * (1 - Math.exp(-k / T)), y: ground - 26 - h, spin: t * 9 + k * 14, squash: 1 };
  }
  const squash = Math.max(0.2, 1 - ((tau - crushTau) / 3) * 0.8);
  return { x: crushX, y: WHEEL_GROUND - 26 * squash, spin: 0, squash };
}

/* ------------------------------------------------------------------------------------------------ you */

function heroOf(f: number, c: Cues, plan: Plan, kidTorso: Pt): Actor & Face & { flow: number } {
  const stand = (x: number, y: number): Actor => ({ x, y, s: depthScale(y), facing: 1, pose: STAND });
  let a: Actor;
  let face: Face = { mouth: "smile", brows: "none", eyes: 1, lids: 0, look: { x: 0.6, y: 0 }, blink: blinking(f, 3) };
  let flow = 0;

  if (f < plan.walkEnd) {
    a = { x: 170 + 2 * (f - plan.from), y: 1010, s: 1.3, facing: 1, pose: walkPose(f * 0.16) };
    flow = 0.25;
    if (f >= c.bus && f < c.kid) face = { ...face, mouth: "flat", look: { x: 1, y: -0.1 } };
    if (f >= c.kid) face = { mouth: "o", brows: "raised", eyes: 1.3, lids: 0, look: { x: 1, y: 0.1 }, blink: false };
  } else if (f < c.pause - 9) {
    a = { ...stand(plan.stopX, 1010), s: 1.3 };
    const lunge = ramp(f, c.shout + 30, c.shout + 44);
    a.pose = lerpPose(lerpPose(walkPose(plan.walkEnd * 0.16), STAND, ramp(f, plan.walkEnd - 2, plan.walkEnd + 8)),
      { ...STAND, lean: 7, armF: [38, 46], armB: [-14, 22], legF: [14, -6] }, lunge);
    face = { mouth: f < c.shout + 26 ? "o" : "flat", brows: "raised", eyes: 1.36, lids: 0, look: { x: 1, y: 0.15 }, blink: false };
    if (f >= c.shout + 30) face = { ...face, look: { x: 1, y: 0.05 }, brows: "worry" };
    if (f >= c.neither) face = { mouth: "wobble", brows: "worry", eyes: 1.2, lids: 0.1, look: { x: 1, y: 0 }, blink: false };
  } else if (f < c.run) {
    a = { ...stand(plan.stopX, 1010), s: 1.3 };
    const lunge: Pose = { ...STAND, lean: 7, armF: [38, 46], armB: [-14, 22], legF: [14, -6] };
    const snap = ramp(f, c.pause - 9, c.pause + 1);
    const lower = ramp(f, c.run - 26, c.run - 6);
    a.pose = lerpPose(lerpPose(lunge, SNAP, snap), { ...STAND, lean: 10, drop: 8, armF: [-20, 60], armB: [30, 60], legF: [20, -20] }, lower);
    face = { mouth: "flat", brows: "angry", eyes: 1.05, lids: 0.2, look: { x: 1, y: 0 }, blink: false };
  } else if (f < c.nine) {
    const u = linear(f, c.run, c.nine);
    const e = easeOut(u, 1.35);
    const y = mix(1010, GRAB.y, e);
    a = { x: mix(plan.stopX, GRAB.x, e), y, s: depthScale(y), facing: 1, pose: runPose((f - c.run) * 0.5) };
    a.pose = lerpPose(a.pose, CROUCH, ramp(f, c.nine - 6, c.nine + 2));
    flow = 1;
    face = { mouth: "open", brows: "angry", eyes: 1, lids: 0.15, look: { x: 1, y: 0.2 }, blink: false };
  } else if (f < plan.carry[0]) {
    a = { x: GRAB.x, y: GRAB.y, s: depthScale(GRAB.y), facing: 1, pose: CROUCH };
    const up = ramp(f, plan.lift[0], plan.lift[1]);
    a.pose = lerpPose(lerpPose(runPose((c.nine - c.run) * 0.5), CROUCH, ramp(f, c.nine - 6, c.nine + 8)), CARRY, up);
    a.pose = { ...a.pose, armF: armTo(a, kidTorso), armB: armTo(a, { x: kidTorso.x - 14, y: kidTorso.y + 8 }) };
    face = { mouth: "flat", brows: "angry", eyes: 1, lids: 0.15, look: { x: 0.7, y: up < 1 ? 0.35 : 0 }, blink: false };
    // Holding the kid, a glance at the bus a metre away.
    if (f >= plan.lift[1] + 4) face = { ...face, look: { x: 1, y: -0.1 }, eyes: 1.2, brows: "worry" };
  } else if (f < plan.lower[1]) {
    const u = ramp(f, plan.carry[0], plan.carry[1]);
    const y = mix(GRAB.y, SET.y, u);
    a = { x: mix(GRAB.x, SET.x, u), y, s: depthScale(y), facing: 1, pose: CARRY };
    const walking = f < plan.carry[1];
    const down = ramp(f, plan.lower[0], plan.lower[1]);
    const legs = walking ? walkPose((f - plan.carry[0]) * 0.24) : walkPose((plan.carry[1] - plan.carry[0]) * 0.24);
    a.pose = lerpPose({ ...CARRY, legF: legs.legF, legB: legs.legB, drop: CARRY.drop + legs.drop }, CROUCH, down * 0.85);
    a.pose = { ...a.pose, armF: armTo(a, kidTorso), armB: armTo(a, { x: kidTorso.x - 14, y: kidTorso.y + 8 }) };
    face = { mouth: "flat", brows: "angry", eyes: 1, lids: 0.2, look: { x: 0.6, y: 0.25 }, blink: false };
  } else if (f < c.resume) {
    // Release, step back onto the kerb, hands on knees, breathing hard; on "one" look up at the bus.
    const u = ramp(f, plan.stepBack[0], plan.stepBack[1]);
    const y = mix(SET.y, KERB.y, u);
    a = { x: mix(SET.x, KERB.x, u), y, s: depthScale(y), facing: 1, pose: STAND };
    const release = lerpPose(lerpPose(CROUCH, CARRY, 0.15), { ...STAND, lean: 4, armF: [20, 30], armB: [-10, 20] }, ramp(f, c.four + 2, c.four + 18));
    const back = f >= plan.stepBack[0] && f < plan.stepBack[1] ? walkPose(-(f - plan.stepBack[0]) * 0.26) : null;
    let pose = back ? { ...release, legF: back.legF, legB: back.legB, drop: back.drop, lean: -3 } : release;
    const breath = Math.sin(f * 0.33);
    pose = lerpPose(pose, { ...HANDS_ON_KNEES, drop: HANDS_ON_KNEES.drop + breath * 2.5, lean: HANDS_ON_KNEES.lean + breath * 2 }, ramp(f, plan.pant, plan.pant + 10));
    const lookUp = ramp(f, c.one + 4, c.one + 18);
    pose = lerpPose(pose, { ...STAND, lean: 6 + breath * 1.5, drop: 6 + breath * 2, armF: [24, 40], armB: [-6, 30] }, lookUp);
    a.pose = pose;
    face = { mouth: Math.floor(f / 9) % 2 ? "open" : "o", brows: "worry", eyes: 1, lids: 0.3, look: { x: 0.5, y: 0.3 }, blink: false };
    if (lookUp > 0.5) face = { ...face, look: { x: 1, y: -0.25 }, lids: 0.1, eyes: 1.15 };
  } else {
    // Time is back. Flinch as the bus goes by, then stand, shaken; drift back out of the scene; walk away.
    const backU = ramp(f, plan.backAway[0], plan.backAway[1]);
    const x = mix(KERB.x, BACK.x, backU);
    a = { x, y: KERB.y, s: depthScale(KERB.y), facing: 1, pose: STAND };
    const flinch = ramp(f, c.resume, c.resume + 6) * (1 - ramp(f, c.resume + 30, c.resume + 60));
    const breath = Math.sin(f * 0.2) * (1 - ramp(f, c.ball, c.ball + 120));
    let pose: Pose = lerpPose({ ...STAND, lean: 6 + breath, drop: 6 + breath * 2, armF: [24, 40], armB: [-6, 30] },
      { ...STAND, lean: -9, armF: [40, 70], armB: [30, 70], legF: [10, -6], legB: [-16, -4] }, flinch);
    if (f >= plan.backAway[0] && f < plan.backAway[1]) {
      const legs = walkPose(-(f - plan.backAway[0]) * 0.2);
      pose = { ...pose, legF: legs.legF, legB: legs.legB };
    }
    const shake = ramp(f, c.nobody - 20, c.nobody + 10);
    pose = { ...pose, armF: [pose.armF[0] + tremor(f, 0, shake), pose.armF[1] + tremor(f, 1.3, shake)], armB: [pose.armB[0] + tremor(f, 2.1, shake), pose.armB[1]] };
    face = { mouth: "o", brows: "raised", eyes: 1.35, lids: 0, look: { x: 1 - 2 * ramp(f, c.resume + 6, c.resume + 50), y: -0.1 }, blink: false };
    if (f >= c.ball + 28) face = { mouth: "wobble", brows: "worry", eyes: 1.1, lids: 0.15, look: { x: 0.8, y: 0.3 }, blink: blinking(f, 5) };
    if (f >= c.ball + 70) face = { mouth: "flat", brows: "worry", eyes: 1, lids: 0.3, look: { x: 0.7, y: 0.2 }, blink: blinking(f, 5) };
    if (f >= c.mother) face = { mouth: "flat", brows: "sad", eyes: 1, lids: 0.4, look: { x: 0.9, y: 0.2 }, blink: blinking(f, 5) };
    if (f >= c.nobody) face = { mouth: "flat", brows: "sad", eyes: 1, lids: 0.55, look: { x: 0.4, y: 0.6 }, blink: blinking(f, 5) };
    if (f >= plan.walkAway) {
      // Turn, and walk away along the pavement, hands held in front of you, shaking.
      const w = f - (plan.walkAway + 8);
      a = { ...a, x: BACK.x - Math.max(0, w) * 1.35, facing: f >= plan.walkAway + 6 ? -1 : 1 };
      const legs = w > 0 ? walkPose(w * 0.15) : STAND;
      pose = {
        ...legs, lean: 6, tilt: 8,
        armF: [16 + tremor(f, 0, 1.2), 100 + tremor(f, 1.1, 1.5)],
        armB: [8 + tremor(f, 2.4, 1.2), 106 + tremor(f, 3.2, 1.5)],
      };
      face = { mouth: "flat", brows: "sad", eyes: 1, lids: 0.5, look: { x: 0.5, y: 0.75 }, blink: blinking(f, 5) };
    }
    a.pose = pose;
  }
  return { ...a, ...face, flow };
}

/* ------------------------------------------------------------------------------------------------ the kid */

function kidOf(f: number, t: number, c: Cues, plan: Plan, heroAt: (f: number) => Actor) {
  // In the road: the frozen tableau is kid at 1225 on KID_FEET, scale 0.72, when time stops.
  const u = clamp01((t - plan.k0) / (plan.P - plan.k0));
  const chaseX = mix(960, 1225, easeOut(u, 1.8));
  const roadY = mix(716, KID_FEET, clamp01(u * 3));
  const chaseScale = mix(0.62, 0.72, clamp01(u * 3));
  const frozenPose = walkPose((chaseX - 960) * 0.066 + (t - plan.k0) * 0.05);
  let kid: Actor = { x: chaseX, y: roadY, s: chaseScale, facing: 1, pose: frozenPose };
  let face: Face = { mouth: "smile", brows: "none", eyes: 1, lids: 0, look: { x: 0.8, y: 0.3 }, blink: false };

  if (t < plan.k0) {
    // Bouncing the ball on the far pavement.
    const bounce = Math.abs(Math.sin(t * 0.19));
    kid = { x: 960, y: 716, s: 0.62, facing: 1, pose: { ...STAND, armF: [55 - bounce * 25, 25] } };
    face = { ...face, look: { x: 0.6, y: 0.6 }, blink: blinking(f, 8) };
  }

  const carried = (h: Actor): Pt => ({ x: h.x + h.facing * 92 * h.s, y: h.y - 205 * h.s });
  const torsoL = torsoLocal(frozenPose);
  const fromTorso = (p: Pt, s: number): Actor => ({ x: p.x - torsoL.x * s, y: p.y - torsoL.y * s, s, facing: 1, pose: frozenPose });
  const roadTorso = { x: kid.x + torsoL.x * kid.s, y: kid.y + torsoL.y * kid.s };
  const groundS = KID_RATIO * depthScale(SET.y);
  const setKid: Pt = { x: SET.x + 92 * depthScale(SET.y), y: SET.y };
  const groundTorso = { x: setKid.x + torsoL.x * groundS, y: setKid.y + torsoL.y * groundS };

  let torso = roadTorso;
  if (f >= plan.lift[0] && f < plan.lower[1]) {
    const h = heroAt(f);
    const up = ramp(f, plan.lift[0], plan.lift[1]);
    const down = ramp(f, plan.lower[0], plan.lower[1]);
    const s = mix(0.72, KID_RATIO * h.s, up);
    torso = { x: mix(roadTorso.x, carried(h).x, up), y: mix(roadTorso.y, carried(h).y, up) };
    torso = { x: mix(torso.x, groundTorso.x, down), y: mix(torso.y, groundTorso.y, down) };
    kid = fromTorso(torso, mix(s, groundS, down));
  } else if (f >= plan.lower[1]) {
    kid = { x: setKid.x, y: setKid.y, s: groundS, facing: 1, pose: frozenPose };
    torso = groundTorso;
    if (f >= c.resume) {
      // Time back: the kid finds the world changed, on the pavement. Blinks on "the kid does".
      const settle = ramp(f, c.resume, c.resume + 8);
      kid.pose = lerpPose(frozenPose, STAND, settle);
      face = { mouth: "o", brows: "raised", eyes: 1.2, lids: 0, look: { x: -0.4 + 0.9 * ramp(f, c.resume + 10, c.resume + 40), y: -0.2 }, blink: false };
      const blinkAt = c.ball + 36;
      if ((f >= blinkAt && f < blinkAt + 4) || (f >= blinkAt + 11 && f < blinkAt + 14)) face.blink = true;
      if (f >= c.ball + 28) face = { ...face, look: { x: 0.2, y: 0.5 } };
      if (f >= c.mother + 20) face = { ...face, mouth: "wobble", brows: "worry", look: { x: 0.9, y: -0.1 }, eyes: 1.1 };
      if (f >= c.mother + 44) kid.pose = { ...STAND, armF: [70, 40], armB: [60, 40] };
      if (f >= plan.thanks) kid.pose = { ...STAND, armF: [30, 20] };
      if (f >= c.resume + 60) face.blink = face.blink || blinking(f, 9);
    }
  }
  return { ...kid, ...face, torso, carriedBy: f >= plan.lift[0] && f < plan.lower[1] };
}

/* ------------------------------------------------------------------------------------------------ the mother */

function motherOf(f: number, c: Cues, plan: Plan, kidTorso: Pt): (Actor & Face) | null {
  if (f < c.mother) return null;
  const arrive = c.mother + 44;
  const s = 1.22;
  const y = 1002;
  let a: Actor;
  let face: Face = { mouth: "open", brows: "worry", eyes: 1.25, lids: 0, look: { x: 1, y: 0.2 }, blink: false };
  if (f < arrive) {
    const u = easeOut(linear(f, c.mother, arrive), 1.6);
    a = { x: mix(2620, MOTHER_AT, u), y, s, facing: -1, pose: runPose((f - c.mother) * 0.48) };
    a.pose = lerpPose(a.pose, KNEEL, ramp(f, arrive - 6, arrive));
  } else if (f < plan.thanks - 6) {
    a = { x: MOTHER_AT, y, s, facing: -1, pose: KNEEL };
    a.pose = { ...KNEEL, armF: armTo({ ...a }, { x: kidTorso.x - 18, y: kidTorso.y - 6 }), armB: armTo({ ...a }, { x: kidTorso.x - 8, y: kidTorso.y + 10 }) };
    a.pose = { ...a.pose, armF: [a.pose.armF[0] + tremor(f, 0.4, 0.8), a.pose.armF[1]] };
    face = { mouth: "wobble", brows: "sad", eyes: 1, lids: 0.55, look: { x: 0.6, y: 0.3 }, blink: false };
  } else {
    // Stand, a hand on the kid, the other hand to the chest; thank the driver, bowing a little, twice.
    a = { x: MOTHER_AT + 8, y, s, facing: -1, pose: STAND };
    const up = ramp(f, plan.thanks - 6, plan.thanks + 6);
    const bow = Math.max(0, Math.sin((f - plan.thanks) * 0.09)) * 8 * ramp(f, plan.thanks + 30, plan.thanks + 40);
    const p: Pose = { ...STAND, lean: bow, tilt: bow * 0.6 };
    const stood: Actor = { ...a, pose: p };
    const chest = { x: stood.x - 26 * s, y: y - 190 * s };
    const onKid = { x: kidTorso.x + 6, y: kidTorso.y - 24 };
    a.pose = lerpPose(KNEEL, { ...p, armF: armTo(stood, chest), armB: armTo(stood, onKid) }, up);
    face = { mouth: "wobble", brows: "worry", eyes: 1.05, lids: 0.25, look: { x: 1, y: -0.2 }, blink: blinking(f, 11) };
  }
  return { ...a, ...face };
}

/* ------------------------------------------------------------------------------------------------ crowd */

const HEADS = ["#c96f2d", "#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a"];
const CROWD = Array.from({ length: 11 }, (_, i) => ({
  base: noise(i + 3) * 3600,
  dir: (i % 3 === 0 ? -1 : 1) as 1 | -1,
  speed: 0.7 + noise(i + 9) * 0.5,
  head: HEADS[i % 6],
  s: 0.6 + noise(i) * 0.07,
  y: 712 + (i % 2) * 9,
}));

const Crowd: React.FC<{ cam: Camera; t: number; frame: number; paused: boolean; stranger: boolean; soft: boolean }> = ({ cam, t, frame, paused, stranger, soft }) => (
  <g filter={soft ? "url(#dof-12)" : undefined}>
  <Layer cam={cam} depth={1}>
    {stranger && (
      <Figure x={STRANGER_AT.x} y={STRANGER_AT.y} scale={STRANGER_AT.s} facing={1} pose={STAND} head={STRANGER.head} coat={STRANGER.coat}
        look={{ x: 0.5, y: 0 }} mouth="none" />
    )}
    {CROWD.map((p, i) => {
      const x = ((((p.base + p.dir * p.speed * t) % 3600) + 3600) % 3600) - 700;
      return (
        <Figure key={i} x={x} y={p.y} scale={p.s} facing={p.dir} pose={walkPose(t * 0.17 * p.speed + i * 1.7)} head={p.head}
          look={{ x: 0.6, y: 0 }} mouth={i % 3 === 0 ? "smile" : "flat"} blink={!paused && blinking(frame, i)} />
      );
    })}
  </Layer>
  </g>
);

/* ------------------------------------------------------------------------------------------------ cameras */

function cameraOf(name: ShotName, f: number, c: Cues, clips: Clip[], plan: Plan, hero: Actor, bus: { x: number }, crushX: number): Camera {
  const end28 = lineEnd(clips, 28);
  const heroHead = { x: plan.stopX, y: 1010 - 264 * 1.3 };
  switch (name) {
    case "establish":
      return camAt(f, [[plan.from, { x: 920, y: 610, zoom: 1.0 }], [c.walk, { x: 860, y: 625, zoom: 1.08 }]]);
    case "walking":
      return { x: hero.x + 160, y: 760, zoom: 1.5 };
    case "redlight":
      return camAt(f, [[clips[23].from, { x: 2560, y: 600, zoom: 1.12 }], [clips[24].from, { x: 2300, y: 612, zoom: 1.18 }]]);
    case "kid":
      return camAt(f, [[clips[24].from, { x: 1240, y: 770, zoom: 1.6 }], [clips[25].from, { x: 1265, y: 772, zoom: 1.74 }]]);
    case "stakes":
      return camAt(f, [[clips[25].from, { x: 1930, y: 650, zoom: 0.82 }], [lineEnd(clips, 25) - 38, { x: 1830, y: 655, zoom: 0.86 }]]);
    case "busPunch":
      return { x: bus.x + 300, y: 730, zoom: mix(1.7, 2.15, linear(f, lineEnd(clips, 25) - 38, clips[26].from)) };
    case "face":
      return camAt(f, [[clips[26].from, { x: heroHead.x + 95, y: heroHead.y + 30, zoom: 2.6 }], [c.neither, { x: heroHead.x + 100, y: heroHead.y + 28, zoom: 2.95 }]]);
    case "neither":
      return camAt(f, [[c.neither, { x: 1150, y: 690, zoom: 1.0 }], [clips[28].from, { x: 1135, y: 698, zoom: 1.06 }]]);
    case "snap":
      return camAt(f, [[clips[28].from, { x: 1000, y: 760, zoom: 1.28 }], [end28, { x: 1000, y: 755, zoom: 1.34 }]]);
    case "tableau":
      return camAt(f, [[end28, { x: 1090, y: 640, zoom: 1.04 }], [c.run, { x: 1080, y: 650, zoom: 1.1 }]]);
    case "sprint":
      return { x: hero.x + 130, y: mix(800, 760, linear(f, c.run, c.nine)), zoom: 1.35 };
    case "grab":
      return camAt(f, [[c.nine, { x: 1200, y: 745, zoom: 1.75 }], [c.seven, { x: 1195, y: 745, zoom: 1.9 }]]);
    case "carry":
      return camAt(f, [[c.seven, { x: 1160, y: 790, zoom: 1.45 }], [c.six, { x: 1175, y: 800, zoom: 1.52 }]]);
    case "ballInsert":
      return camAt(f, [[c.six, { x: 1405, y: 772, zoom: 3.0 }], [plan.lower[0], { x: 1400, y: 770, zoom: 3.25 }]]);
    case "setDown":
      return camAt(f, [[plan.lower[0], { x: 1190, y: 800, zoom: 1.5 }], [c.three, { x: 1185, y: 800, zoom: 1.58 }]]);
    case "kerb":
      return camAt(f, [[c.three, { x: 1160, y: 780, zoom: 1.75 }], [c.resume, { x: 1135, y: 772, zoom: 2.0 }]]);
    case "brake":
      return camAt(f, [[c.resume, { x: 1100, y: 700, zoom: 1.04 }], [c.ball - 12, { x: 1050, y: 706, zoom: 1.09 }]]);
    case "crush":
      return camAt(f, [[c.ball - 12, { x: crushX + 20, y: 858, zoom: 3.1 }], [c.ball + 28, { x: crushX - 10, y: 860, zoom: 3.25 }]]);
    case "kidDoes":
      return camAt(f, [[c.ball + 28, { x: 1170, y: 800, zoom: 1.75 }], [clips[34].from, { x: 1160, y: 805, zoom: 1.9 }]]);
    case "mother":
      return drift({ x: 1624, y: 760, zoom: 1.15 }, f, "mother", 5);
    case "driver":
      return camAt(f, [[plan.thanks, { x: BUS_REST + 90, y: 702, zoom: 3.2 }], [plan.thanks + 34, { x: BUS_REST + 86, y: 700, zoom: 3.4 }]]);
    case "mother2":
      return drift(camAt(f, [[plan.thanks + 34, { x: 1624, y: 760, zoom: 1.15 }], [c.nobody, { x: 1610, y: 758, zoom: 1.17 }], [plan.walkAway, { x: 1520, y: 742, zoom: 1.35 }]]), f, "mother", 5);
    case "walkAway":
      return { x: Math.min(BACK.x - 70, hero.x - 70), y: 772, zoom: camAt(f, [[plan.walkAway, { x: 0, y: 0, zoom: 1.85 }], [plan.walkAway + 120, { x: 0, y: 0, zoom: 1.7 }]]).zoom };
  }
}

/* ------------------------------------------------------------------------------------------------ the scene */

/** Close shots: the far crowd goes soft so faces and props read. */
const CLOSE: ShotName[] = ["face", "ballInsert", "crush", "driver", "kidDoes", "kerb", "walkAway"];

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { cues: c, clips } = shot;
  const plan = planOf(c, clips, shot.from, shot.wc);
  const t = plan.warp(shot.wc(frame));
  const pause = { from: c.pause, to: c.resume };
  const paused = frame >= pause.from && frame < pause.to;
  const name = current(frame, plan.cuts);
  const look = useLook();

  // Kid and you lean on each other (the carried kid follows your hands, your hands follow the kid).
  const kidRough = (f: number) => kidOf(f, plan.warp(shot.wc(f)), c, plan, (g) => heroOf(g, c, plan, { x: GRAB.x + 80, y: GRAB.y - 190 }));
  const heroAt = (f: number) => heroOf(f, c, plan, kidRough(f).torso);
  const kid = kidOf(frame, t, c, plan, heroAt);
  const hero = heroOf(frame, c, plan, kid.torso);
  const mother = motherOf(frame, c, plan, kid.torso);

  const crushTau = c.ball - c.resume;
  const bus = busOf(name, frame, t, c, plan);
  const cam = cameraOf(name, frame, c, clips, plan, hero, bus, BUS_STOP_X + FRONT_WHEEL - braked(crushTau));
  const ball = ballOf(t, plan, crushTau);
  const tauBall = t - plan.P - crushTau;
  // The bumper punts the ball (behind the bus for that moment); after that it rolls in the near wheels' lane.
  const ballBehind = bus.tau >= 0 && bus.tau < 12;
  const tapeOut = linear(frame, c.tape23 - 22, c.tape23 + 8);
  const hand = handOf(hero);
  const origin = toScreen(cam, hand.x, hand.y);

  // Dusk light: the low sun, the red lamp, the bus's headlamp and brake lights. Off while time is stopped.
  const glows: Glow[] = [];
  if (!paused) {
    const sun = toScreen(cam, 700 + cam.x * 0.75, 250 + cam.y * 0.75);
    glows.push({ x: sun.x, y: sun.y, r: 520, color: "rgba(255,170,96,0.75)", strength: 0.55 });
    if (name === "redlight") {
      const lamp = toScreen(cam, LIGHT_X, 330);
      glows.push({ x: lamp.x, y: lamp.y, r: 210, color: "rgba(255,40,70,0.9)", strength: 0.55 + Math.sin(frame * 0.5) * 0.1 });
    }
    if (bus.tau <= 0) {
      const lamp = toScreen(cam, bus.x + 12, 806);
      glows.push({ x: lamp.x, y: lamp.y, r: 150 * cam.zoom, color: "rgba(255,236,170,0.9)", strength: 0.6 });
    }
    if (bus.braking) {
      const rear = toScreen(cam, bus.x + 754, 790);
      glows.push({ x: rear.x, y: rear.y, r: 110 * cam.zoom, color: "rgba(255,40,40,0.9)", strength: 0.7 });
    }
  }

  const strangerOn = frame >= c.neither && frame < c.resume;
  const busVisible = name !== "establish" && name !== "walking" && name !== "kid" && name !== "face";
  const driverOn = bus.tau > 0;
  const winClip = `M${bus.x + 14} 636 H${bus.x + 104} V735 H${bus.x + 6} V650 Q${bus.x + 6} 636 ${bus.x + 14} 636Z`;
  const nod = Math.sin((frame - plan.thanks) * 0.22) * 6 * ramp(frame, plan.thanks + 4, plan.thanks + 10);

  const back = (
    <>
      <StreetBack cam={cam} frame={frame} t={t} red={frame >= c.bus - 40} paused={paused} />
      <Crowd cam={cam} t={t} frame={frame} paused={paused} stranger={strangerOn} soft={CLOSE.includes(name)} />
      {Array.from({ length: 6 }, (_, i) => {
        const x = 500 + i * 180 + ((t * (2 + noise(i) * 2)) % 700);
        const y = 180 + noise(i + 20) * 170 - (t % 300) * 0.25;
        return <Pigeon key={i} x={x} y={y} flap={Math.sin(t * 0.8 + i)} />;
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const x = 1400 + noise(i) * 420 + Math.sin(t / 15 + i) * 30;
        const y = 420 + ((noise(i + 30) * 320 + t * (1.5 + noise(i + 7))) % 320);
        return <ellipse key={i} cx={x} cy={y} rx={13} ry={6.5} fill={i % 3 ? "#c9872f" : "#4c9a76"} transform={`rotate(${t * 5 + i * 40} ${x} ${y})`} />;
      })}
      {/* Skid marks from where time came back. */}
      {bus.tau > 0 && [FRONT_WHEEL, REAR_WHEEL].map((w) => (
        <rect key={w} x={bus.x + w} y={WHEEL_GROUND - 6} width={BUS_STOP_X + w - (bus.x + w)} height={7} rx={3} fill={INK} opacity={0.32} />
      ))}
      {/* The kid on the road side of the bus while chasing; the ball always runs under the bus. */}
      {!kid.carriedBy && frame < plan.lower[1] && <KidFigure kid={kid} t={t} />}
      {ballBehind && <Ball x={ball.x} y={ball.y} spin={ball.spin} squash={ball.squash} />}
      {tauBall >= 0 && tauBall < 10 && Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI - Math.PI;
        const r = 30 + tauBall * 7;
        return <line key={i} x1={ball.x + Math.cos(a) * r} y1={WHEEL_GROUND - 10 + Math.sin(a) * r * 0.6} x2={ball.x + Math.cos(a) * (r + 22)} y2={WHEEL_GROUND - 10 + Math.sin(a) * (r + 22) * 0.6}
          stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={1 - tauBall / 10} />;
      })}
      {busVisible && (
        <g transform={`rotate(${-bus.dip} ${bus.x} ${WHEEL_GROUND})`}>
          <Bus x={bus.x} t={bus.odometer} moving={!paused && bus.moving} />
          {bus.braking && <rect x={bus.x + 748} y={772} width={14} height={34} rx={4} fill={CRIMSON} stroke={INK} strokeWidth={4} />}
          {driverOn && (
            <>
              <clipPath id="d12-win"><path d={winClip} /></clipPath>
              <g clipPath="url(#d12-win)">
                <rect x={bus.x} y={630} width={110} height={110} fill="#bfe6ee" />
                <Figure x={bus.x + 58} y={842} scale={0.56} facing={1} head="#d9c26a" pose={{ ...STAND, tilt: nod, armF: frame >= plan.thanks + 6 ? [150, 28] : [20, 60] }}
                  mouth="wobble" brows="worry" eyes={1.2} look={{ x: 0.8, y: 0.1 }} blink={blinking(frame, 13)} />
              </g>
            </>
          )}
          {bus.tau > 0 && bus.tau < 45 && Math.floor(bus.tau / 5) % 2 === 0 && (
            <path d={`M${bus.x - 24} 676 l-46 -24 M${bus.x - 30} 712 l-56 0 M${bus.x - 24} 748 l-46 24`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          )}
        </g>
      )}
      {!ballBehind && <Ball x={ball.x} y={ball.y} spin={ball.spin} squash={ball.squash} />}
      {mother && (
        <Figure x={mother.x} y={mother.y} scale={mother.s} facing={mother.facing} pose={mother.pose} head={MOTHER.head} coat={MOTHER.coat}
          mouth={mother.mouth} brows={mother.brows} eyes={mother.eyes} lids={mother.lids} look={mother.look} blink={mother.blink} />
      )}
      {(kid.carriedBy || frame >= plan.lower[1]) && name !== "ballInsert" && <KidFigure kid={kid} t={t} />}
      {/* Line 25: a paper tape from the moving bus's bumper, 23 m ahead of it, already past the kid. */}
      {(name === "stakes" || name === "busPunch") && tapeOut > 0 && (
        <>
          <line x1={bus.x - 4} y1={906} x2={bus.x - 4 - TAPE_23 * tapeOut} y2={906} stroke="#ffd84a" strokeWidth={16} strokeLinecap="round" />
          {tapeOut >= 1 && <line x1={bus.x - 4} y1={906} x2={bus.x - 4 - TAPE_23} y2={906} stroke="#fff" strokeWidth={5} strokeDasharray="12 18" opacity={0.6} />}
          {tapeOut >= 1 && <line x1={bus.x - 4 - TAPE_23} y1={884} x2={bus.x - 4 - TAPE_23} y2={928} stroke={INK} strokeWidth={6} strokeLinecap="round" />}
          <rect x={bus.x - 30} y={884} width={34} height={40} rx={8} fill="#ffd84a" stroke={INK} strokeWidth={5} />
        </>
      )}
    </>
  );

  const actors = name === "crush" || name === "driver" || name === "ballInsert" ? null : (
    <Figure
      {...HERO}
      x={hero.x} y={hero.y} scale={hero.s} facing={hero.facing} pose={hero.pose}
      flow={hero.flow} time={frame}
      mouth={hero.mouth} brows={hero.brows} eyes={hero.eyes} lids={hero.lids} look={hero.look} blink={hero.blink}
    />
  );

  return (
    <LookContext.Provider value={{ ...look, glows: [...(look.glows ?? []), ...glows] }}>
      <Stage cam={cam} radius={waveRadius(frame, pause)} origin={origin} sky={SKY} back={back} actors={actors} />
    </LookContext.Provider>
  );
};

const KidFigure: React.FC<{ kid: ReturnType<typeof kidOf>; t: number }> = ({ kid, t }) => (
  <Figure x={kid.x} y={kid.y} scale={kid.s} facing={kid.facing} pose={kid.pose} head="#e0a070" cap="#2c6fbb"
    look={kid.look} mouth={kid.mouth} brows={kid.brows} eyes={kid.eyes} lids={kid.lids} blink={kid.blink} time={t} />
);

/* ------------------------------------------------------------------------------------------------ the beat */

const Sfx: React.FC<{ at: number; name: string; volume: number; frames?: number }> = ({ at, name, volume, frames }) => (
  <Sequence from={Math.round(at)} durationInFrames={frames}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Screen spot for the 23 M tag in the stakes wide: above the tape's middle, clear of the kid and the source tag. */
const TAG_23 = { x: 700, y: 520 };

const DayTwelve: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, cues: c, clips } = shot;
  const ticks: Tick[] = [
    { at: c.pause, n: 10 }, { at: c.nine, n: 9 }, { at: c.eight, n: 8 }, { at: c.seven, n: 7 }, { at: c.six, n: 6 },
    { at: c.five, n: 5 }, { at: c.four, n: 4 }, { at: c.three, n: 3 }, { at: c.two, n: 2 }, { at: c.one, n: 1 }, { at: c.resume, n: 0 },
  ];
  const sprint = frame >= c.run && frame < c.nine;
  return (
    <AbsoluteFill>
      <FastMove on={sprint}>
        <Scene shot={shot} />
      </FastMove>
      {frame < clips[23].from && <Tag at={clips[22].from + 10} text="DAY 12" x={70} y={60} size={78} />}
      <Counter ticks={ticks} until={c.resume + 40} />
      {frame >= clips[25].from && frame < lineEnd(clips, 25) - 38 && <Tag at={c.tape23} text="23 M" x={TAG_23.x} y={TAG_23.y} size={76} />}

      <Sfx at={shot.from} name="street" volume={0.22} frames={c.pause - shot.from + 4} />
      <Sfx at={c.bus - 6} name="bus" volume={0.42} frames={c.pause - c.bus + 10} />
      <Sfx at={c.pause} name="timestop" volume={0.5} />
      <Sfx at={c.run} name="whoosh" volume={0.3} />
      {ticks.slice(1, -1).map((k) => <Sfx key={k.n} at={k.at} name="flip" volume={0.22} />)}
      <Sfx at={c.resume} name="resume" volume={0.5} />
      <Sfx at={c.resume} name="bus" volume={0.4} frames={c.ball - c.resume + 40} />
      <Sfx at={c.ball} name="pop" volume={0.55} />
      <Sfx at={c.resume} name="street" volume={0.2} frames={Math.min(740, shot.to - c.resume)} />
    </AbsoluteFill>
  );
};

export const dayTwelve: Beat = {
  id: "dayTwelve",
  firstLine: 22,
  Component: DayTwelve,
  pauses: (cues) => [{ from: cues.pause, to: cues.resume }],
};
