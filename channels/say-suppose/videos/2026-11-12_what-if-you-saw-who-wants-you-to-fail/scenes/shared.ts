import { Easing, interpolate } from "remotion";
import type { Clip, ScriptLine } from "@whatif/kit/timeline";
import { MUSTARD, TEAL } from "@whatif/kit/theme";
import type { Pause } from "@whatif/kit/world/clock";
import type { Camera } from "@whatif/kit/stage/Stage";

/** You: mustard head with a tuft, teal scarf (channels/say-suppose/cast.md). */
export const HERO = { head: MUSTARD, scarf: TEAL, tuft: true } as const;
/** The stranger: crimson head, long dark coat. */
export const STRANGER = { head: "#D8344F", coat: "#3f3346" } as const;
/** Min-jun, your best friend: pale-blue head, a navy hoodie (the thumbnail's). */
export const MINJUN = { head: "#9fd3e6", coat: "#3b4a6b" } as const;
/** Ji-yoon, your older sister: peach head, dark hair tied back (draw with <Ponytail>), the orange warehouse vest
 *  (draw with <Vest>) over a grey top. Off duty (Say It Again, Two Letters): no vest, hair down (<HairDown>). */
export const JIYOON = { head: "#f0a98e", coat: "#6b6f7a", vest: "#e8792f", hair: "#3a2a2a" } as const;
/** Tae-ho, the rival: sage head, a black school jacket. */
export const TAEHO = { head: "#a8c99a", coat: "#2a2d36" } as const;
/** Ms. Kang, the maths teacher: lilac head, glasses (draw with <Glasses>), a grey cardigan, a red pen. */
export const KANG = { head: "#c9a0d6", coat: "#7a7f8c" } as const;
/** Everyone else: pastel heads on ink bodies. Pick by index. */
export const PASTELS = ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f"] as const;

/** Everything a beat needs to know about where it is. */
export interface Shot {
  frame: number;
  /** World time: stands still during pauses. */
  t: number;
  wc: (frame: number) => number;
  /** Cue name -> frame (timing.yaml). */
  cues: Record<string, number>;
  clips: Clip[];
  lines: ScriptLine[];
  pauses: Pause[];
  /** The frame this beat starts on. */
  from: number;
  /** The frame the next beat starts on. */
  to: number;
  /** The same clips as `clips` (v5: one numbering, story.json's); kept so older beat code still reads. */
  v4: Clip[];
}

/** A beat: its component and the pauses (time stopped) it contains, in whole-film frames. */
export interface Beat {
  id: string;
  /** Index of the first narration line in this beat (0-based, into props.json lines and clips). */
  firstLine: number;
  Component: React.FC<{ shot: Shot }>;
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

/** The end frame of a narration line. */
export const lineEnd = (clips: Clip[], i: number) => clips[i].from + clips[i].frames;

/** Which of a list of shots is on at this frame: shots are [startFrame, name] in order. */
export function current<T extends string>(frame: number, shots: [number, T][]): T {
  let on = shots[0][1];
  for (const [at, name] of shots) if (frame >= at) on = name;
  return on;
}

/** Index of the last item that passes, or -1. */
export function lastIndex<T>(items: T[], pass: (item: T) => boolean): number {
  for (let i = items.length - 1; i >= 0; i--) if (pass(items[i])) return i;
  return -1;
}

/** The camera between keyframes [frame, camera], eased linearly and held at both ends. */
export function camAt(frame: number, rawKeys: [number, Camera][]): Camera {
  if (rawKeys.length === 1) return rawKeys[0][1];
  // interpolate() needs strictly increasing frames; a key that lands on or before the previous one moves a frame later.
  const keys: [number, Camera][] = [];
  for (const [f, c] of rawKeys) keys.push([keys.length ? Math.max(f, keys[keys.length - 1][0] + 1) : f, c]);
  const at = (pick: (c: Camera) => number) =>
    interpolate(frame, keys.map((k) => k[0]), keys.map((k) => pick(k[1])), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { x: at((c) => c.x), y: at((c) => c.y), zoom: at((c) => c.zoom) };
}

/** A hard cut list of cameras: [startFrame, camera], the last one at or before the frame wins. */
export function cutAt(frame: number, shots: [number, Camera][]): Camera {
  let on = shots[0][1];
  for (const [at, cam] of shots) if (frame >= at) on = cam;
  return on;
}
