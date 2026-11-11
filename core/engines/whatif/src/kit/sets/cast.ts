// Stock people for the sets' examples and for crowds. A film keeps its own characters; these are stand-ins in the
// channel's colours (style.md): you are mustard with the teal scarf, everyone else a pastel or a role colour.
import { CRIMSON, MUSTARD, TEAL } from "../theme";

export const HERO = { head: MUSTARD, scarf: TEAL, tuft: true } as const;
export const MOTHER = { head: "#e0a070", coat: "#b58fc7" } as const;
export const FATHER = { head: "#c98a5a", coat: "#6d7f8f" } as const;
export const ELDER = { head: "#e8c9a0", coat: "#efe9dc" } as const;
export const FRIEND = { head: "#9fd8a8", coat: "#3d5a6c" } as const;
export const SIBLING = { head: "#e6a0a0", coat: "#d9c26a" } as const;
export const BOSS = { head: "#b58fc7", tie: CRIMSON, coat: "#2f3242" } as const;
export const TEACHER = { head: "#7fa0c4", coat: "#6b4b3a" } as const;
export const VENDOR = { head: "#c96f2d", coat: "#efe9dc" } as const;
export const CONDUCTOR = { head: "#8fb4d9", coat: "#7a6a58", cap: "#4a5262" } as const;

/** Heads for extras and crowds. */
export const PASTELS = ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f"] as const;
