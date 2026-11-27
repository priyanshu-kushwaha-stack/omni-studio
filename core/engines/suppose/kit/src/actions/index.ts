// poseAt: a character's pose at time t from a list of acts. Later acts override earlier ones from their `at`; each
// eases in and out (walks are hard). Idle always runs underneath: a blink every 2.5-4 s from the seed and a breath.
import type {PersonPose} from '../rig/Person';
import {keys, IO} from '../rig/keys';
import {rnd} from '../film/Crowd';
import {ACTS, type Act, type ActDef} from './acts';
import {NEUTRAL_FACE} from './moods';

export * from './moods';
export * from './acts';

const REST_ARM = {a: 8, f: -5}; // Person's hanging arm when standing
const BLINK = {close: 0.06, hold: 0.05, open: 0.09}; // held shut a moment, so a 30 fps frame always catches it
const GAP = [2.55, 3.95]; // seconds between blinks: inside 2.5-4 with room for frame rounding
const BREATH = {hz: 0.25, frac: 0.008}; // a bob of 0.8% of torso height

export const blinkLid = (t: number, seed = 0) => {
  let b = 0.6 + rnd(seed * 31, 13) * 1.6;
  for (let i = 1; b <= t; i++) {
    const d = t - b;
    if (d < BLINK.close) return d / BLINK.close;
    if (d < BLINK.close + BLINK.hold) return 1;
    if (d < BLINK.close + BLINK.hold + BLINK.open) return 1 - (d - BLINK.close - BLINK.hold) / BLINK.open;
    b += GAP[0] + (GAP[1] - GAP[0]) * rnd(seed * 31 + i, 13);
  }
  return 0;
};

export const breath = (t: number, seed: number, torsoH: number) =>
  -BREATH.frac * torsoH * 0.5 * (1 - Math.cos(Math.PI * 2 * BREATH.hz * t + rnd(seed * 31, 17) * Math.PI * 2));

// How much of an act shows at t: 0 off, 1 fully on.
const weight = (def: ActDef, a: Act, t: number) => {
  const at = a.at ?? 0;
  if (t < at) return def.early ? 1 : 0;
  const fade = def.fade ?? 0.25;
  if (fade === 0) return 1;
  const to = a.to ?? (def.len === undefined ? Infinity : at + def.len);
  const out = to === Infinity ? 1 : keys(t, [[to, 1], [to + fade, 0, IO]]);
  return keys(t, [[at, 0], [at + fade, 1, IO]]) * out;
};

type Arm = {a: number; f: number};
const mix = (a: number, b: number, w: number) => (w >= 1 ? b : a + (b - a) * w);
const isArm = (v: unknown): v is Arm => typeof v === 'object' && v !== null && 'a' in v && 'f' in v;

const blend = (prev: PersonPose, out: Partial<PersonPose>, w: number): PersonPose => {
  const next: Record<string, unknown> = {...prev};
  const was = prev as Record<string, unknown>;
  const rest = NEUTRAL_FACE as Record<string, unknown>;
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === 'number') next[k] = mix((was[k] ?? rest[k] ?? 0) as number, v, w);
    else if (isArm(v)) {
      const p = (was[k] ?? REST_ARM) as Arm;
      next[k] = {a: mix(p.a, v.a, w), f: mix(p.f, v.f, w)};
    } else if (Array.isArray(v)) {
      const p = (was[k] ?? [0, 0]) as [number, number];
      next[k] = [mix(p[0], v[0], w), mix(p[1], v[1], w)];
    } else if (w >= 0.5) next[k] = v;
  }
  return next as PersonPose;
};

export const poseAt = (acts: Act[], t: number, base: Partial<PersonPose> = {}, seed = 0, rig: {torsoH?: number; stride?: number} = {}) => {
  const r = {torsoH: rig.torsoH ?? 600, stride: rig.stride ?? 120};
  let pose: PersonPose = {...base};
  let dx = 0;
  let prop: string | undefined;
  for (const a of acts) {
    const def = ACTS[a.act];
    if (!def) throw new Error(`unknown act "${a.act}" (known: ${Object.keys(ACTS).join(', ')})`);
    const w = a.act === 'idle' ? 0 : weight(def, a, t);
    if (w <= 0) continue;
    const {x, ...out} = def.fn(t, a, {base, rig: r});
    if (x !== undefined) dx = x;
    pose = blend(pose, out, w);
    if (a.prop && w >= 0.5) prop = a.prop;
  }
  pose.lid = Math.max(pose.lid ?? 0, blinkLid(t, seed));
  pose.bob = (pose.bob ?? 0) + breath(t, seed, r.torsoH);
  return {pose, dx, prop};
};
