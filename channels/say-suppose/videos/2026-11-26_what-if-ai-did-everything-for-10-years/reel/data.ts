// The reel's shot list (assets/reel/shots.json, written by scenes3d/export_shots.py from shots/a.py..d.py) and its
// slots: one picture from each shot's start to the next shot's start. A shot starts at its anchor line's first frame in
// the narration's timeline plus offset_s, so the cuts re-time with the voice. A `split` left/right pair at the same
// start is one slot; cards, drawn pictures and tags sit over the last 3D slot before them.
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { FPS } from "@whatif/kit/theme";
import raw from "../assets/reel/shots.json";

export type Move = "push_in" | "push_out" | "pan_left" | "pan_right" | "drift_up" | "hold";
export interface Study { title: string; authors: string; year: string; evidence: string }
export interface Shot {
  id: string;
  section: string;
  kind: "3d" | "card" | "drawn" | "tag";
  anchor: string;
  offset_s: number;
  line: number;
  move: Move;
  split: "left" | "right" | null;
  picture: string | null;
  text: string | null;
  still: string;
  exists: boolean;
  card?: Study[];
  /** The script's cast tag for a character's first close-up ("YOU: shift engineer at the city's water plant."). */
  cast_tag?: string | null;
}

export type ReelProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string>; tempo?: number };

export const SHOTS: Shot[] = (raw as unknown as { shots: Shot[] }).shots;

/** Frames of the cross-dissolve between two slots. */
export const DISSOLVE = 6;

export interface Slot {
  kind: "3d" | "split" | "card" | "drawn" | "tag";
  /** One shot, or a split pair as [left, right] (a missing half is null). */
  shots: (Shot | null)[];
  start: number;
  end: number;
  /** The slot an overlay (card, drawn, tag) sits on: the last 3D or split slot before it, or -1. */
  bg: number;
}

const startOf = (s: Shot, clips: Timeline["clips"]) => clips[s.line].from + Math.round(s.offset_s * FPS);

function pairAt(i: number, starts: number[]): boolean {
  const a = SHOTS[i];
  const b = SHOTS[i + 1];
  return !!(a.split && b && b.split && b.split !== a.split && Math.abs(starts[i + 1] - starts[i]) <= 2);
}

export function buildSlots(clips: Timeline["clips"], total: number): Slot[] {
  if (!clips.length) return [];
  const starts = SHOTS.map((s) => startOf(s, clips));
  const slots: Slot[] = [];
  for (let i = 0; i < SHOTS.length; i++) {
    const s = SHOTS[i];
    let shots: (Shot | null)[] = [s];
    let kind: Slot["kind"] = s.kind;
    if (s.split) {
      kind = "split";
      const other = pairAt(i, starts) ? SHOTS[++i] : null;
      shots = s.split === "left" ? [s, other] : [other, s];
    }
    slots.push({ kind, shots, start: slots.length ? starts[SHOTS.indexOf(s)] : 0, end: total, bg: -1 });
  }
  let lastPicture = -1;
  slots.forEach((sl, k) => {
    sl.end = slots[k + 1]?.start ?? total;
    if (sl.kind === "3d" || sl.kind === "split") lastPicture = k;
    else sl.bg = lastPicture;
  });
  return slots;
}

/** The slot under frame f. */
export function slotAt(slots: Slot[], f: number): number {
  let i = 0;
  for (let k = 0; k < slots.length; k++) if (f >= slots[k].start) i = k;
  return i;
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(t));
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
