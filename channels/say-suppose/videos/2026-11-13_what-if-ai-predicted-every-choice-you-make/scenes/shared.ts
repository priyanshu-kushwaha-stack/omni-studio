import { Easing, interpolate } from "remotion";
import type { Clip, ScriptLine } from "@whatif/kit/timeline";
import { MUSTARD, TEAL } from "@whatif/kit/theme";
import type { Pause } from "@whatif/kit/world/clock";
import type { Camera } from "@whatif/kit/stage/Stage";

/** You: mustard head with a tuft, teal scarf, a brown apron at the stall (channels/say-suppose/cast.md). */
export const HERO = { head: MUSTARD, scarf: TEAL, tuft: true } as const;
/** The stranger: crimson head, long dark coat. */
export const STRANGER = { head: "#D8344F", coat: "#3f3346" } as const;
/** Your best friend, who runs the stall with you: peach head, a brown apron over a dark shirt (the thumbnail's). */
export const FRIEND = { head: "#f4b393", coat: "#6b4f3a" } as const;
/** The coffee seller next door: sage head, a cream top, a paper cap (draw with <PaperCap>). */
export const COFFEE = { head: "#a8c99a", coat: "#d9cfb8", cap: "#f3e9d7" } as const;
/** The landlord: grey head, a dark suit and a tie. */
export const LANDLORD = { head: "#9a9ca3", coat: "#2f3340", tie: "#7a2f3a" } as const;
/** The kid with the cap: pale-blue head, a red cap. */
export const KID = { head: "#9fd3e6", coat: "#4a6a8a", cap: "#c0392b" } as const;
/** The street magician: lilac head, a black waistcoat. */
export const MAGICIAN = { head: "#c9a0d6", coat: "#1f1f28" } as const;
/** The pickpocket: grey head, a dark hood. */
export const PICKPOCKET = { head: "#8e9198", coat: "#2b2e38" } as const;
/** The coach who sells boring: grey-green head, a cream sandwich board with no lettering. */
export const COACH = { head: "#9fb59a", coat: "#5a6b7a" } as const;
/** The couple on a date: her lilac, him sage. */
export const DATE_HER = { head: "#c9a0d6", coat: "#7a3b46" } as const;
export const DATE_HIM = { head: "#a8c99a", coat: "#2f5f63" } as const;
/** The man with the same lunch: pale-blue head, a white shirt and a tie. */
export const SAME_LUNCH = { head: "#9fc0e0", coat: "#e8e4da", tie: "#3d4a78" } as const;
/** The city worker on the ladder: orange-brown head, an orange work vest. */
export const WORKER = { head: "#c96f2d", coat: "#e8792f" } as const;
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
