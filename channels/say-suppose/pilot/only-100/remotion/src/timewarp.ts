// Film-time warp from the voice B timeline (the shots were timed to it) to the Luc narration (owner, 2026-11-27).
// Knots are each line's start and end in both cue sheets (audio/cues_a.json -> audio/cues_luc.json).
const OLD = [0.0, 0.4, 3.52, 3.77, 4.65, 4.95, 10.15, 10.5, 16.66, 17.06, 19.3, 19.55, 23.71, 24.11, 31.87, 32.12, 32.84, 33.14, 38.5, 39.2, 42.4, 42.95, 50.55, 50.85, 53.57, 53.87, 56.75, 59.5];
const NEW = [0.0, 0.4, 4.062, 4.312, 5.192, 5.492, 11.839, 12.189, 19.944, 20.344, 23.078, 23.328, 28.349, 28.749, 38.875, 39.125, 39.845, 40.145, 46.605, 47.305, 50.796, 51.346, 59.594, 59.894, 62.614, 62.914, 67.089, 69.839];
export const FILM_SECONDS = NEW[NEW.length - 1];
export const toOld = (t: number): number => {
  if (t <= 0) return t;
  for (let i = 1; i < NEW.length; i++) {
    if (t <= NEW[i]) return OLD[i - 1] + ((t - NEW[i - 1]) / (NEW[i] - NEW[i - 1])) * (OLD[i] - OLD[i - 1]);
  }
  return OLD[OLD.length - 1] + (t - NEW[NEW.length - 1]);
};
export const toNew = (t: number): number => {
  for (let i = 1; i < OLD.length; i++) {
    if (t <= OLD[i]) return NEW[i - 1] + ((t - OLD[i - 1]) / (OLD[i] - OLD[i - 1])) * (NEW[i] - NEW[i - 1]);
  }
  return NEW[NEW.length - 1] + (t - OLD[OLD.length - 1]);
};
