export interface Pause { from: number; to: number }

/** World time at a video frame: it stands still during a pause and resumes without jumping. */
export function worldClock(frame: number, pauses: Pause[]): number {
  let lost = 0;
  for (const { from, to } of pauses) {
    if (frame >= to) lost += to - from;
    else if (frame >= from) lost += frame - from;
  }
  return frame - lost;
}
