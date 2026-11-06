import type { Pause } from "../world/clock";

/** Letterbox bar height in output px. Bars mean "time is stopped": they slide in when a pause starts and out as it
 *  ends, and never show otherwise (style.md: no permanent letterbox). */
export const BARS_FULL = 70;
export const BARS_SLIDE = 8;

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export function barHeight(frame: number, pauses: Pause[]): number {
  for (const { from, to } of pauses) {
    if (frame < from || frame >= to) continue;
    const t = Math.min((frame - from) / BARS_SLIDE, (to - frame) / BARS_SLIDE);
    return Math.round(BARS_FULL * ease(t));
  }
  return 0;
}
