import type { Look } from "./Look";

/** The six moods a script names with `> MOOD:` (channels/say-suppose/style.md). Glows are per scene: add them on top. */
export type MoodName = "morning" | "day" | "dusk" | "night" | "lamp" | "frozen";

export const MOODS: Record<MoodName, Look> = {
  morning: {
    dof: 6, focus: 1, rim: { color: "#fff0c2", dx: -5, dy: -2 },
    film: "contrast(1.12) saturate(1.2)", grade: { top: "#fff0d0", bottom: "#b77a58", opacity: 0.8 }, vignette: 0.55,
  },
  day: {
    dof: 4, focus: 1, rim: { color: "#fff8e6", dx: -3, dy: -2 }, film: "contrast(1.06)", vignette: 0.35,
  },
  dusk: {
    dof: 7, focus: 1, rim: { color: "#ffd9a0", dx: -6, dy: -4 },
    film: "contrast(1.18) saturate(1.3) brightness(0.92)", grade: { top: "#ff9a62", bottom: "#352a66", opacity: 0.9 },
    vignette: 0.75,
  },
  night: {
    dof: 6, focus: 1, rim: { color: "#9fd0ff", dx: -4, dy: -3 },
    film: "contrast(1.2) saturate(1.1)", grade: { top: "#3d4396", bottom: "#0d0d26", opacity: 0.95 }, vignette: 0.8,
  },
  lamp: {
    dof: 7, focus: 1, rim: { color: "#ffc98a", dx: 5, dy: -4 },
    film: "contrast(1.25) saturate(1.15) brightness(0.88)", grade: { top: "#7a4a3a", bottom: "#1c1220", opacity: 0.9 },
    vignette: 0.85,
  },
  frozen: {
    dof: 9, focus: 1, rim: { color: "#fff3c4", dx: -5, dy: -4 },
    film: "contrast(1.12)", grade: { top: "#dfe6ff", bottom: "#6d76a6", opacity: 0.85 }, vignette: 0.6,
  },
};

/** A mood's look, with scene-specific additions (glows, a different focus) merged on top. */
export function moodLook(name: MoodName, extra: Partial<Look> = {}): Look {
  const base = MOODS[name];
  if (!base) throw new Error(`unknown mood ${JSON.stringify(name)}: use one of ${Object.keys(MOODS).join(", ")}`);
  return { ...base, ...extra, glows: [...(base.glows ?? []), ...(extra.glows ?? [])] };
}
