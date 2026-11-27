// The 15 s cold-open test, timed to voice B track A (../audio/cues_a.json). Seconds.
export const FPS = 30;
export const W = 1280;
export const H = 720;
export const TEST_SECONDS = 17;

export const CUE = {
  n01: [0.4, 3.52], // "You're standing in the middle of the busiest train station on Earth."
  hello: [3.77, 4.65], // YOU: "Hello?!"
  n02: [4.95, 10.15], // "About three and a half million people pass through here every day. Not one turns around."
  n03: [10.5, 16.66], // "A man stops so close his rice ball brushes your nose. ... Straight through your face."
} as const;

// Shots shared by every look. Beats inside n03: the man stops ~10.9, rice ball ~12.0, board ~13.4, "through your face" ~15.0.
export const SHOT = {
  wide: [0, 3.77],
  shout: [3.77, 4.95],
  river: [4.95, 10.5],
  close: [10.5, 17],
} as const;

export const sec = (s: number) => Math.round(s * FPS);
export const inShot = (t: number, s: readonly [number, number]) => t >= s[0] && t < s[1];
