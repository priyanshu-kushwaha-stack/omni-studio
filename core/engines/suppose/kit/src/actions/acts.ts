// The action library (W2): one function per act, giving the pose it reaches when fully on. poseAt (index.ts) eases
// each act in from its `at` and out after its `to`. Gestures live in hands, head and eyes; there is no lip-sync.
import type {PersonPose} from '../rig/Person';
import {faceFor, type Mood} from './moods';

export type Act = {act: string; at?: number; to?: number; mood?: Mood; prop?: string; dir?: 1 | -1; from?: [number, number]};
export type Rig = {torsoH: number; stride: number}; // torso piece height and screen px per walk cycle (strideAt)
export type ActOut = Partial<PersonPose> & {x?: number};
type Ctx = {base: Partial<PersonPose>; rig: Rig};
// len: seconds an act lasts when it has no `to` (unset = holds until replaced); fade: ease in/out seconds (0 = hard,
// for walks, whose phase must never blend); early: applies before `at` too (a walk-in waits off its mark).
export type ActDef = {fn: (t: number, a: Act, c: Ctx) => ActOut; len?: number; fade?: number; early?: boolean};

const TAU = Math.PI * 2;
const since = (t: number, a: Act) => Math.max(0, t - (a.at ?? 0));
const arm = (a: number, f: number) => ({a, f});

export const wave = (t: number, a: Act): ActOut => ({armR: arm(150, 160 + 18 * Math.sin(TAU * 3 * since(t, a)))});
export const point = (_t: number, a: Act): ActOut => ((a.dir ?? 1) > 0 ? {armR: arm(92, 96)} : {armL: arm(92, 96)});
export const talk = (t: number, a: Act): ActOut => {
  const d = since(t, a);
  return {armR: arm(24 + 9 * Math.sin(TAU * 0.7 * d), 62 + 16 * Math.sin(TAU * 0.7 * d + 1)), headTilt: 3 * Math.sin(TAU * 0.35 * d)};
};

// Walking. The body covers `stride` px per cycle and the phase is that distance in cycles, so feet never slide;
// it speeds up over `acc` s and settles over `dec` s inside the act's span.
const CADENCE = 0.9; // walk cycles per second
const travel = (tau: number, T: number, v: number, acc: number, dec: number) => {
  const k = acc + dec > T ? T / (acc + dec) : 1;
  const A = acc * k, D = dec * k;
  const total = v * (T - A / 2 - D / 2);
  if (tau >= T) return {dist: total, speed: 0};
  if (tau < A) return {dist: (v * tau * tau) / (2 * A), speed: tau / A};
  if (tau <= T - D) return {dist: v * (A / 2 + tau - A), speed: 1};
  const u = tau - (T - D);
  return {dist: v * (A / 2 + T - D - A + u - (u * u) / (2 * D)), speed: 1 - u / D};
};
const stroll = (t: number, a: Act, stride: number, x0: (total: number, dir: number) => number, acc: number, dec: number, cadence = CADENCE): ActOut => {
  const at = a.at ?? 0, dir = a.dir ?? 1;
  const T = (a.to ?? Infinity) - at;
  const v = stride * cadence;
  const {dist, speed} = travel(Math.min(T, Math.max(0, t - at)), T, v, acc, dec);
  const total = travel(T, T, v, acc, dec).dist;
  return {x: x0(total, dir) + dir * dist, phase: (dist / stride) * TAU, walk: t < at ? 0 : speed, dir};
};
// Walks in from `from` (or from off its mark, so it stops on it at `to`); settles over the last 0.35 s.
export const walkIn = (t: number, a: Act, stride: number) => stroll(t, {...a, to: a.to ?? (a.at ?? 0) + 2}, stride, (total, dir) => (a.from ? a.from[0] : -dir * total), 0, 0.35);
// Walks off from its mark (or `from`), gathering speed over 0.3 s; keeps going unless given a `to`.
export const walkOut = (t: number, a: Act, stride: number) => stroll(t, a, stride, () => a.from?.[0] ?? 0, 0.3, 0);
// A walk from `from` that starts and stops in place.
export const walk = (t: number, a: Act, stride: number) => stroll(t, a, stride, () => a.from?.[0] ?? 0, 0.3, 0.35);

// Stops a walk: slows from full stride to standing over 0.3 s from `at` (give `from` = where the walk had got to).
export const stop = (t: number, a: Act, stride: number) => stroll(t, {...a, to: (a.at ?? 0) + 0.3}, stride, () => a.from?.[0] ?? 0, 0, 0.3);
// A run: a walk with a faster cadence and a longer stride, leaning into it as it gathers speed.
const RUN = {stride: 1.35, cadence: 1.7, lean: 8};
export const run = (t: number, a: Act, stride: number): ActOut => {
  const w = stroll(t, a, stride * RUN.stride, () => a.from?.[0] ?? 0, 0.3, 0.35, RUN.cadence);
  return {...w, lean: RUN.lean * (w.walk ?? 0) * (a.dir ?? 1)};
};
const reachArm = (a: Act) => ((a.dir ?? 1) > 0 ? {armR: arm(112, 114)} : {armL: arm(112, 114)});
// One hand out then back over `len` s (a half sine), the other hanging; the prop rides the hand while it is out.
const HANDOFF_LEN = 1.6;
export const handOff = (t: number, a: Act): ActOut => {
  const len = a.to !== undefined ? a.to - (a.at ?? 0) : HANDOFF_LEN;
  const k = Math.sin(Math.PI * Math.min(1, since(t, a) / len));
  const out = arm(10 + 80 * k, 14 + 90 * k);
  return (a.dir ?? 1) > 0 ? {armR: out, armRFront: k > 0.05} : {armL: out};
};
const explainArm = (d: number, phase: number) => arm(32 + 9 * Math.sin(TAU * d + phase), 72 + 14 * Math.sin(TAU * d + phase + 0.8));
const look: ActDef = {fn: (_t, a) => ({pupil: [(a.dir ?? 1) * 0.7, 0], turn: (a.dir ?? 1) * 0.25})};

export const ACTS: Record<string, ActDef> = {
  idle: {fn: () => ({})}, // blink and breath: poseAt always runs them underneath
  react: {fn: (_t, a, c) => faceFor(a.mood ?? 'neutral', c.base), fade: 0.2},
  look,
  lookAt: look,
  turn: {fn: (_t, a) => ({turn: (a.dir ?? 1) * 0.8}), fade: 0.35},
  talk: {fn: talk},
  wave: {fn: wave, len: 2},
  point: {fn: point},
  nod: {fn: (t, a) => ({headDip: 9 * Math.max(0, Math.sin(TAU * 1.6 * since(t, a)))}), len: 1.2, fade: 0.15},
  shakeHead: {fn: (t, a) => ({turn: 0.35 * Math.sin(TAU * 2 * since(t, a))}), len: 1.2, fade: 0.15},
  shrug: {fn: () => ({armL: arm(28, 100), armR: arm(28, 100), headTilt: 6, browLift: 12}), len: 1.2},
  think: {fn: () => ({armR: arm(18, 165), armRFront: true, headTilt: -6, pupil: [0.6, -0.7]})},
  cheer: {fn: (t, a) => {
    const k = 6 * Math.sin(TAU * 1.5 * since(t, a));
    return {armL: arm(160 + k, 172), armR: arm(160 - k, 172)};
  }, len: 2},
  facepalm: {fn: () => ({armR: arm(30, 178), armRFront: true, headDip: 10})},
  cower: {fn: () => ({armL: arm(55, 150), armR: arm(55, 150), lean: -4, headDip: 8})},
  hold: {fn: () => ({armR: arm(20, 80), armRFront: true})}, // poseAt hands back `prop` for the shot to draw at the hand
  walkIn: {fn: (t, a, c) => walkIn(t, a, c.rig.stride), fade: 0, early: true},
  walkOut: {fn: (t, a, c) => walkOut(t, a, c.rig.stride), fade: 0},
  walk: {fn: (t, a, c) => walk(t, a, c.rig.stride), fade: 0, early: true},
  stop: {fn: (t, a, c) => stop(t, a, c.rig.stride), fade: 0},
  run: {fn: (t, a, c) => run(t, a, c.rig.stride), fade: 0, early: true},
  shout: {fn: (_t, a) => ({mouth: 0.9, open: 1.15, browLift: 24, smile: -0.3, lean: 5 * (a.dir ?? 1), headDip: -4, armL: arm(35, 42), armR: arm(35, 42)})},
  reach: {fn: (_t, a) => ({...reachArm(a), lean: 4 * (a.dir ?? 1)})},
  armsCrossed: {fn: () => ({armL: arm(22, 125), armR: arm(22, 125), armRFront: true, headDip: 2})},
  explain: {fn: (t, a) => ({armL: explainArm(since(t, a), Math.PI), armR: explainArm(since(t, a), 0), headTilt: 2 * Math.sin(TAU * 0.5 * since(t, a))})},
  handOff: {fn: handOff, len: HANDOFF_LEN, fade: 0.15},
};
