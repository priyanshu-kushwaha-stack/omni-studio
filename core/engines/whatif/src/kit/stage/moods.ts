import type { Look } from "./Look";

/** The six moods a script names with `> MOOD:` (channels/say-suppose/style.md). Glows are per scene: add them on top. */
export type MoodName = "morning" | "day" | "dusk" | "night" | "lamp" | "frozen";

// Lifted after the colour review of 2026-11-07 (a colourist and an art director, both 5/10): lighter grades, vignettes
// no darker than 0.45 for phones, and a neutral grey freeze like the owner's sample instead of lavender.
export const MOODS: Record<MoodName, Look> = {
  morning: {
    dof: 6, focus: 1, rim: { color: "#fff0c2", dx: -5, dy: -2 },
    film: "contrast(1.08) saturate(1.05)", grade: { top: "#fff0d0", bottom: "#e0bc92", opacity: 0.5 }, vignette: 0.35,
  },
  day: {
    dof: 4, focus: 1, rim: { color: "#fff8e6", dx: -3, dy: -2 }, film: "contrast(1.06)", vignette: 0.35,
  },
  dusk: {
    dof: 7, focus: 1, rim: { color: "#ffd9a0", dx: -6, dy: -4 },
    film: "contrast(1.12) saturate(1.1) brightness(0.98)", grade: { top: "#ffb98a", bottom: "#5b4f8c", opacity: 0.55 },
    vignette: 0.45,
  },
  night: {
    dof: 6, focus: 1, rim: { color: "#9fd0ff", dx: -4, dy: -3 },
    film: "contrast(1.2) saturate(1.05)", grade: { top: "#5a64b8", bottom: "#2a2c58", opacity: 0.65 }, vignette: 0.45,
  },
  lamp: {
    dof: 7, focus: 1, rim: { color: "#ffc98a", dx: 5, dy: -4 },
    film: "contrast(1.08) saturate(1.1)", grade: { top: "#e8c29a", bottom: "#6e4c52", opacity: 0.5 }, vignette: 0.45,
  },
  frozen: {
    dof: 6, focus: 1, rim: { color: "#fff3c4", dx: -5, dy: -4 },
    film: "contrast(1.1)", grade: { top: "#f2f0ea", bottom: "#aaa69f", opacity: 0.45 }, vignette: 0.4,
  },
};

/** A mood's look, with scene-specific additions (glows, a different focus) merged on top. */
export function moodLook(name: MoodName, extra: Partial<Look> = {}): Look {
  const base = MOODS[name];
  if (!base) throw new Error(`unknown mood ${JSON.stringify(name)}: use one of ${Object.keys(MOODS).join(", ")}`);
  return { ...base, ...extra, glows: [...(base.glows ?? []), ...(extra.glows ?? [])] };
}
