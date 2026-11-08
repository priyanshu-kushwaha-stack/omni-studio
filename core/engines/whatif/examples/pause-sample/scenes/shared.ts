import { Easing, interpolate } from "remotion";
import type { Timeline } from "@whatif/kit/timeline";
import { MUSTARD, TEAL } from "@whatif/kit/theme";
import { worldClock, type Pause } from "@whatif/kit/world/clock";

export const HERO = { head: MUSTARD, scarf: TEAL, tuft: true } as const;

export interface Shot {
  frame: number;
  /** World time: stands still during pauses. */
  t: number;
  wc: (frame: number) => number;
  cues: Timeline["cues"];
  clips: Timeline["clips"];
  pauses: Pause[];
}

export function makeShot(frame: number, timeline: Timeline, pauses: Pause[]): Shot {
  const wc = (f: number) => worldClock(f, pauses);
  return { frame, t: wc(frame), wc, cues: timeline.cues, clips: timeline.clips, pauses };
}

/** Eased progress from 0 to 1 across a frame range. */
export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Unsmoothed progress from 0 to 1 across a frame range. */
export const linear = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Short natural blinks, offset per figure. */
export const blinking = (frame: number, seed = 0) => (frame + seed * 37) % 97 < 4;

/** A repeatable pseudo-random number in 0..1 for scattering props. */
export const noise = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
