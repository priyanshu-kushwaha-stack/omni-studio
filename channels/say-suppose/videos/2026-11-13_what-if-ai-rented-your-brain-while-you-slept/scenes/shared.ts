import { Easing, interpolate } from "remotion";
import type { Clip, ScriptLine } from "@whatif/kit/timeline";
import { MUSTARD, TEAL } from "@whatif/kit/theme";
import type { Pause } from "@whatif/kit/world/clock";
import type { Camera } from "@whatif/kit/stage/Stage";

/** You: mustard head with a tuft, teal scarf (channels/say-suppose/cast.md). */
export const HERO = { head: MUSTARD, scarf: TEAL, tuft: true } as const;
/** The stranger: crimson head, long dark coat. Hidden once, under a lamp in the hundred-window street (More Hours). */
export const STRANGER = { head: "#D8344F", coat: "#3f3346" } as const;
/** Your brother: peach head, a red cap (worn backwards indoors), a grey hoodie. Top bunk. */
export const BROTHER = { head: "#f0a98e", cap: "#c0392b", coat: "#5d6470" } as const;
/** The nurse: sage head, a white paper cap (draw with <PaperCap>), pale-blue scrubs. */
export const NURSE = { head: "#a8c99a", coat: "#8fb8d8" } as const;
/** The man in the grey suit, the broker: grey head, a grey suit and a dark tie, a shoebox of bands under his arm. */
export const BROKER = { head: "#b9bcc2", coat: "#6f737c", tie: "#2a2d36" } as const;
/** Your boss: lilac-blue head, a tie. */
export const BOSS = { head: "#9fb3e0", coat: "#3d4a66", tie: "#d8a13a" } as const;
/** The grandmother next door: lilac head, a shawl colour for her cardigan. */
export const GRANDMOTHER = { head: "#c9a0d6", coat: "#8a6a7f" } as const;
/** The warehouse clerk: sand head, a hi-vis vest colour for his coat, a clipboard. */
export const CLERK = { head: "#d9c26a", coat: "#e8792f" } as const;
/** The woman at the bridge: grey head, a shopping bag. */
export const BRIDGE_WOMAN = { head: "#c8c2b8", coat: "#7a6a5a" } as const;
/** The pale second you, the ghost that works while you sleep (the rule device). */
export const GHOST = { head: "#c9f3f6", scarf: "#9fd9dc", light: "#7ff0e6" } as const;
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
  /** v3's clips in v3 numbering (remap.ts), for a beat rebuilt on v3 lines. */
  v3: Clip[];
}

/** A beat: its component and the pauses (time stopped) it contains, in whole-film frames. */
export interface Beat {
  id: string;
  /** Index of the first narration line in this beat (0-based, into props.json lines and clips). */
  firstLine: number;
  Component: React.FC<{ shot: Shot }>;
  /** When the beat opens before its first line (a title card in the gap before it): its start frame, from v3 clips. */
  openAt?: (v3: Clip[]) => number;
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
export function camAt(frame: number, keys: [number, Camera][]): Camera {
  if (keys.length === 1) return keys[0][1];
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
