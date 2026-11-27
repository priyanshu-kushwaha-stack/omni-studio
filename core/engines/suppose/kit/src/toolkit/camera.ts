// Camera moves for one shot (W3: the camera is never fully still). camAt gives the View props at a point in the shot:
// l runs 0..1 through the shot (the planned move), t is film time in seconds (drift and impacts).
import {IO, LIN, drift} from '../rig/keys';
import {W, H} from '../film/Cam';

export type CameraSpec = {
  move: string;
  z?: [number, number]; // zoom at the start and end of the move (push runs z[0] -> z[1], pull the other way)
  focus?: [number, number]; // the framed point at the start
  to?: [number, number]; // where pan, track and crane end
  amount?: number; // drift px, roll degrees or shake px
  at?: number; // shake: film time of the impact
};
export type CamState = {z: number; fx: number; fy: number; roll: number};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const STILL_PX = 2; // every move carries this handheld drift, so even `still` breathes
const SHAKE_S = 0.3; // an impact settles within this long

type Ctx = {z0: number; z1: number; f: [number, number]; to: [number, number]; l: number; t: number; amount?: number};
const MOVES: Record<string, (c: Ctx) => Partial<CamState>> = {
  still: () => ({}),
  push: ({z0, z1, l}) => ({z: lerp(z0, z1, IO(l))}),
  pull: ({z0, z1, l}) => ({z: lerp(z1, z0, IO(l))}),
  drift: ({f, t, amount = 14}) => ({fx: f[0] + drift(t, amount, 0.7), fy: f[1] + drift(t, amount * 0.4, 2.1)}),
  pan: ({f, to, l}) => ({fx: lerp(f[0], to[0], IO(l)), fy: lerp(f[1], to[1], IO(l))}),
  track: ({f, to, l}) => ({fx: lerp(f[0], to[0], LIN(l)), fy: lerp(f[1], to[1], LIN(l))}), // even speed, to follow a walker
  crane: ({z0, z1, f, to, l}) => ({z: lerp(z0, lerp(z0, z1, 0.5), IO(l)), fy: lerp(f[1], to[1] === f[1] ? f[1] - 120 : to[1], IO(l))}),
  roll: ({l, amount = 2.5}) => ({roll: amount * IO(l)}), // a slow lean of the horizon, for unease
  shake: () => ({}), // the impact is added in camAt from `at`
};

// One damped jolt after the impact: a few fast swings that die out by SHAKE_S, then nothing.
const jolt = (t: number, at: number, amp: number) => {
  const d = t - at;
  if (d <= 0 || d >= SHAKE_S) return {x: 0, y: 0, r: 0};
  const k = (1 - d / SHAKE_S) ** 2 * amp;
  const w = d * Math.PI * 2 * 11;
  return {x: Math.sin(w) * k, y: Math.cos(w * 1.3) * k * 0.6, r: Math.sin(w * 0.7) * k * 0.08};
};

export const camAt = (spec: CameraSpec, l: number, t: number): CamState => {
  const fn = MOVES[spec.move];
  if (!fn) throw new Error(`unknown camera move "${spec.move}" (known: ${Object.keys(MOVES).join(', ')})`);
  const [z0, z1] = spec.z ?? [1, 1.15];
  const f = spec.focus ?? [W / 2, H / 2];
  const to = spec.to ?? f;
  const lc = Math.min(1, Math.max(0, l));
  const m = fn({z0, z1, f, to, l: lc, t, amount: spec.amount});
  const j = spec.move === 'shake' ? jolt(t, spec.at ?? 0, spec.amount ?? 10) : {x: 0, y: 0, r: 0};
  return {
    z: m.z ?? z0,
    fx: (m.fx ?? f[0]) + drift(t, STILL_PX, 0.3) + j.x,
    fy: (m.fy ?? f[1]) + drift(t, STILL_PX, 1.9) + j.y,
    roll: (m.roll ?? 0) + j.r,
  };
};
