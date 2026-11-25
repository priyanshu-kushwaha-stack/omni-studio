// Shared helpers for "What If You Saw How Many Lies Everyone Told?" (G2 first cut, 2026-11-25). Beats find their
// lines by the start of the script text, never by index, so a revised script re-times every beat without a remap.
import { Easing, interpolate } from "remotion";
import type { Clip, ScriptLine } from "@whatif/kit/timeline";
import { MUSTARD, TEAL } from "@whatif/kit/theme";
import type { Camera } from "@whatif/kit/stage/Stage";

/** You: mustard head with a tuft, teal scarf (channels/say-suppose/cast.md). */
export const HERO = { head: MUSTARD, scarf: TEAL, tuft: true } as const;
/** The crimson stranger, the channel's running figure (cast.md). */
export const STRANGER = { head: "#D8344F", coat: "#3f3346" } as const;
/** Your boss: steel-blue head, navy suit, red tie (the thumbnail's boss). */
export const BOSS = { head: "#7d93bb", coat: "#2f3a55", tie: "#b8323e" } as const;
/** Everyone else: pastel heads on ink bodies. Pick by index. */
export const PASTELS = ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f"] as const;
/** The counter's light (the thumbnail's GLOW). */
export const GLOW = "#ffcf5a";

/** Everything a beat needs to know about where it is. */
export interface Shot {
  frame: number;
  clips: Clip[];
  lines: ScriptLine[];
  /** The frame this beat starts on, and the frame the next one starts on. */
  from: number;
  to: number;
  /** Start frame of the first line whose script text starts with `prefix` (case-insensitive, at or after this beat's
   *  start), plus `share` of that line's length. Throws on a typo, so a revised script fails loudly. */
  at: (prefix: string, share?: number) => number;
  /** End frame of that line. */
  end: (prefix: string) => number;
}

/** A beat: its component and the start of the script text of its first spoken line. */
export interface Beat {
  id: string;
  first: string;
  /** Seconds the beat opens before its first line (a wordless hold before it belongs to this beat). */
  lead?: number;
  Component: React.FC<{ shot: Shot }>;
}

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

/** Index of the first line at or after `from` whose text starts with `prefix`. */
export function findLine(lines: ScriptLine[], prefix: string, from = 0): number {
  const p = norm(prefix);
  for (let i = from; i < lines.length; i++) if (norm(lines[i].text).startsWith(p)) return i;
  for (let i = 0; i < from; i++) if (norm(lines[i].text).startsWith(p)) return i;
  throw new Error(`no script line starts with ${JSON.stringify(prefix)}`);
}

export function makeShot(frame: number, clips: Clip[], lines: ScriptLine[], from: number, to: number, firstLine: number): Shot {
  const at = (prefix: string, share = 0) => {
    const i = findLine(lines, prefix, firstLine);
    return Math.round(clips[i].from + clips[i].frames * share);
  };
  const end = (prefix: string) => {
    const i = findLine(lines, prefix, firstLine);
    return clips[i].from + clips[i].frames;
  };
  return { frame, clips, lines, from, to, at, end };
}

/** Eased progress from 0 to 1 across a frame range. */
export const ramp = (frame: number, from: number, to: number) =>
  to <= from ? (frame >= from ? 1 : 0)
    : interpolate(frame, [from, to], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Unsmoothed progress from 0 to 1 across a frame range. */
export const linear = (frame: number, from: number, to: number) =>
  to <= from ? (frame >= from ? 1 : 0) : interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Short natural blinks, offset per figure. */
export const blinking = (frame: number, seed = 0) => (frame + seed * 37) % 97 < 4;

/** A repeatable pseudo-random number in 0..1 for scattering props. */
export const noise = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

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

/** The camera between keyframes [frame, camera], eased and held at both ends. Keys must rise. */
export function camAt(frame: number, keys: [number, Camera][]): Camera {
  if (keys.length === 1) return keys[0][1];
  const xs = keys.map((k) => k[0]);
  for (let i = 1; i < xs.length; i++) if (xs[i] <= xs[i - 1]) xs[i] = xs[i - 1] + 1;
  const at = (pick: (c: Camera) => number) =>
    interpolate(frame, xs, keys.map((k) => pick(k[1])), { easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { x: at((c) => c.x), y: at((c) => c.y), zoom: at((c) => c.zoom) };
}

/** A hard cut list of cameras: [startFrame, camera], the last one at or before the frame wins. */
export function cutAt(frame: number, shots: [number, Camera][]): Camera {
  let on = shots[0][1];
  for (const [at, cam] of shots) if (frame >= at) on = cam;
  return on;
}
