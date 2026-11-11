/** Joint angles in degrees. 0 points straight down, 90 points forward (the way the figure faces), 180 points up. */
export interface Pose {
  lean: number;
  tilt: number;
  armB: [number, number];
  armF: [number, number];
  legB: [number, number];
  legF: [number, number];
  drop: number;
}

export const HEAD_R = 46;
export const TORSO = 112;
export const LIMB = 56;

const rad = (d: number) => (d * Math.PI) / 180;
export const dir = (angle: number) => ({ x: Math.sin(rad(angle)), y: Math.cos(rad(angle)) });

export const STAND: Pose = { lean: 0, tilt: 0, armB: [-7, 8], armF: [9, 10], legB: [-5, -2], legF: [6, -3], drop: 0 };
export const SIT: Pose = { lean: 0, tilt: 0, armB: [10, 15], armF: [20, 20], legB: [90, -2], legF: [90, -2], drop: 0 };
/** Sitting on a chair, bench or cot: thighs forward, shins down (Nobody Could Say No, CHAIR_SIT). */
export const SEATED: Pose = { ...STAND, armB: [10, 25], armF: [25, 35], legB: [88, -88], legF: [92, -92] };
export const SNAP: Pose = { lean: -4, tilt: -6, armB: [-20, 20], armF: [125, 45], legB: [-14, -3], legF: [16, -4], drop: 4 };

/** The figure y that puts a SEATED figure's hips on a seat top at `seatTop` (the hips sit two limbs above the feet). */
export const seatedY = (seatTop: number, scale = 1) => seatTop + 2 * LIMB * scale;

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const n = (x: number, y: number) => x + (y - x) * t;
  const p = (x: [number, number], y: [number, number]): [number, number] => [n(x[0], y[0]), n(x[1], y[1])];
  return {
    lean: n(a.lean, b.lean), tilt: n(a.tilt, b.tilt), drop: n(a.drop, b.drop),
    armB: p(a.armB, b.armB), armF: p(a.armF, b.armF), legB: p(a.legB, b.legB), legF: p(a.legF, b.legF),
  };
}

const gait = (ph: number, swing: number, base: number, knee: number, kneeBase: number): [number, number] => [
  base + swing * Math.sin(ph),
  -(kneeBase + knee * (0.5 + 0.5 * Math.cos(ph))),
];

export function runPose(phase: number): Pose {
  const arm = (ph: number): [number, number] => [12 - 58 * Math.sin(ph), 92];
  return {
    lean: 15, tilt: -5, drop: 7 + 7 * Math.abs(Math.cos(phase)),
    armF: arm(phase), armB: arm(phase + Math.PI),
    legF: gait(phase, 46, 18, 78, 16), legB: gait(phase + Math.PI, 46, 18, 78, 16),
  };
}

export function walkPose(phase: number): Pose {
  const arm = (ph: number): [number, number] => [3 - 22 * Math.sin(ph), 16];
  return {
    lean: 3, tilt: 0, drop: 2 + 3 * Math.abs(Math.cos(phase)),
    armF: arm(phase), armB: arm(phase + Math.PI),
    legF: gait(phase, 24, 2, 34, 4), legB: gait(phase + Math.PI, 24, 2, 34, 4),
  };
}

/** Sneaking: bent knees, arms held up and tucked. */
export function tiptoePose(phase: number): Pose {
  const walk = walkPose(phase);
  return { ...walk, lean: 11, drop: 16, armF: [68, 95], armB: [50, 100] };
}

export interface Joints {
  hip: { x: number; y: number };
  neck: { x: number; y: number };
  shoulder: { x: number; y: number };
  head: { x: number; y: number };
}

export function joints(pose: Pose, torso = TORSO): Joints {
  const hip = { x: 0, y: -LIMB * 2 + pose.drop };
  const up = dir(pose.lean);
  const neck = { x: hip.x + up.x * torso, y: hip.y - up.y * torso };
  return {
    hip,
    neck,
    shoulder: { x: neck.x - up.x * 12, y: neck.y + up.y * 12 },
    head: { x: neck.x + up.x * (HEAD_R - 6), y: neck.y - up.y * (HEAD_R - 6) },
  };
}

/** Two-bone IK: the arm angles that put the hand on a target given relative to the shoulder. Elbows bend forward. */
export function reach(dx: number, dy: number): [number, number] {
  const max = LIMB * 2 - 0.5;
  const dist = Math.min(max, Math.max(1, Math.hypot(dx, dy)));
  const toTarget = (Math.atan2(dx, dy) * 180) / Math.PI;
  const bend = (Math.acos((dist * dist) / (2 * LIMB * dist)) * 180) / Math.PI;
  return [toTarget - bend, bend * 2];
}
