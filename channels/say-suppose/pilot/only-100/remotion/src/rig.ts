// Keyframes and two-bone arms for the motion pass: every change eases, settles, and can overshoot.
import {Easing} from 'remotion';

export type Ease = (x: number) => number;
export const IO: Ease = Easing.inOut(Easing.cubic);
export const OUT: Ease = Easing.out(Easing.cubic);
export const BACK: Ease = Easing.out(Easing.back(1.7));
export const LIN: Ease = (x) => x;

// keys(t, [[time, value, easeIntoThisKey?], ...]) holds the first and last value outside the range.
export type Key = [number, number, Ease?];
export const keys = (t: number, ks: Key[]): number => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, v1, e] = ks[i];
    const [t0, v0] = ks[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * (e ?? IO)((t - t0) / (t1 - t0));
  }
  return ks[ks.length - 1][1];
};

// Two-bone limb. a: upper bone angle in degrees from straight down, positive = away from the body.
// f: lower bone's absolute angle, same convention. side: -1 for the screen-left limb, +1 for screen-right.
export const limb = (sx: number, sy: number, a: number, f: number, l1: number, l2: number, side: -1 | 1) => {
  const r = Math.PI / 180;
  const ex = sx + Math.sin(a * r) * l1 * side;
  const ey = sy + Math.cos(a * r) * l1;
  const hx = ex + Math.sin(f * r) * l2 * side;
  const hy = ey + Math.cos(f * r) * l2;
  return {ex, ey, hx, hy, d: `M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`};
};

// Smooth handheld drift (sum of slow sines, no jitter).
export const drift = (t: number, amp: number, seed = 0) =>
  amp * (0.6 * Math.sin(t * 0.83 + seed) + 0.4 * Math.sin(t * 1.71 + seed * 2.3));

// A blink that closes and opens over 0.14 s at each listed time; returns lid closure 0..1.
export const blinkAt = (t: number, times: number[]) => {
  for (const b of times) {
    const d = t - b;
    if (d >= 0 && d < 0.14) return d < 0.05 ? d / 0.05 : 1 - (d - 0.05) / 0.09;
  }
  return 0;
};
