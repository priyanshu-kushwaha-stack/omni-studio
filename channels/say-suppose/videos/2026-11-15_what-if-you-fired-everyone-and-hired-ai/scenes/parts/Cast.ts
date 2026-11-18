// The fired-everyone film's cast (packaging.md, "## Cast"), as looks for the kit's Figure plus what the rig cannot draw
// (`wear`: a paper hat, a hard hat, a pencil behind the ear, glasses, a sash, a toolbelt, an apron bib, a long coat, a
// painter's mask, a microphone in the hand). Plain data, no JSX: `Dressed` (parts/Wear.tsx) draws a Person, and `on()`
// (parts/Places.tsx) puts one on a set spot. Roles, not names, except Marco (named once, at 0:12).
import type { FigureProps } from "@whatif/kit/rig/Figure";
import { CRIMSON, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";

/** Something worn or carried that the kit's Figure does not draw. `color` overrides the default colour; `tilt` turns a
 *  hat (degrees, positive tips it back). Hand-held kinds (mic, wrench, hammer) go in the front hand. */
export interface WearItem {
  kind: "paperHat" | "hardHat" | "pencil" | "glasses" | "sash" | "toolbelt" | "apron" | "longCoat" | "mask" | "mic" | "wrench" | "hammer" | "badge";
  color?: string;
  tilt?: number;
}

/** A cast member's look: Figure props (head colour, coat, tie, cap, scarf) plus what they wear. */
export interface Person extends Partial<FigureProps> {
  head: string;
  wear?: WearItem[];
}

/** You: mustard head, the teal scarf, the white apron (the thumbnail's paper coat). */
export const YOU: Person = { head: MUSTARD, scarf: TEAL, tuft: true, coat: PAPER };

/** Your cook, Marco: pale-blue head, a paper hat worn sideways, a short cook's jacket. Late every Monday. */
export const MARCO: Person = { head: "#a9d4ec", coat: "#e6ecef", wear: [{ kind: "paperHat", tilt: 28 }] };
/** Marco in his street coat (the morning he is fired: coat still on). */
export const MARCO_COAT: Person = { head: "#a9d4ec", coat: "#6d7f8f", wear: [{ kind: "paperHat", tilt: 28 }] };
/** Marco at the plant: brand-new blue overalls, a hard hat worn sideways. */
export const MARCO_OVERALLS: Person = { head: "#a9d4ec", coat: "#3d6fb0", wear: [{ kind: "hardHat", tilt: 26 }] };
/** Marco at the front of the crowd, with a wrench. */
export const MARCO_WRENCH: Person = { head: "#a9d4ec", coat: "#3d6fb0", wear: [{ kind: "paperHat", tilt: 28 }, { kind: "wrench" }] };

/** Your waitress: peach head, a pencil behind her ear, a diner-pink uniform. */
export const WAITRESS: Person = { head: "#f6c09a", coat: "#e58f9a", wear: [{ kind: "pencil" }, { kind: "apron", color: PAPER }] };

/** The plant boss: grey-blue head, a tie, a dark suit. */
export const BOSS: Person = { head: "#8fa3b8", coat: "#2f3242", tie: CRIMSON };

/** The banker: lavender head, glasses. */
export const BANKER: Person = { head: "#c3b1e1", coat: "#4a4a6a", tie: "#7fa0c4", wear: [{ kind: "glasses" }] };

/** The mayor: sage head, a sash. */
export const MAYOR: Person = { head: "#a9c4a0", coat: "#3b4a5a", wear: [{ kind: "sash" }] };

/** The rival diner owner: mint head, her own apron (striped red, so it is not yours). */
export const RIVAL: Person = { head: "#a8e6cf", coat: "#3d5a6c", wear: [{ kind: "apron", color: "#e85f6f" }] };

/** The plumber: lilac head, a toolbelt, work shirt. */
export const PLUMBER: Person = { head: "#c8a2e8", coat: "#4f6d8a", cap: "#d8344f", wear: [{ kind: "toolbelt" }] };

/** The reporter: pink head, a microphone. */
export const REPORTER: Person = { head: "#f4a6c0", coat: "#2f3a4f", wear: [{ kind: "mic" }] };

/** The stranger: crimson head, a long coat, holding nothing. Seen once. */
export const STRANGER: Person = { head: CRIMSON, coat: "#3f3346", wear: [{ kind: "longCoat", color: "#3f3346" }] };

/** A plant worker in overalls (the whistle crowd), head from the pastels by index. */
export const WORKER_HEADS = ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f", "#e0a070", "#8fb8b4"] as const;
export const OVERALLS = "#3d6fb0";
export const worker = (i: number, extra: WearItem[] = []): Person => ({ head: WORKER_HEADS[i % WORKER_HEADS.length], coat: OVERALLS, wear: extra });

/** A human painter at the plant: overalls, a painter's mask. */
export const painter = (i: number): Person => ({ head: WORKER_HEADS[(i + 3) % WORKER_HEADS.length], coat: "#e6ecef", wear: [{ kind: "mask" }] });

/** A teller, a shelf-stacker, a mechanic: townsfolk for crowds (hammer or wrench up at the meeting). */
export const townsfolk = (i: number, tool?: "hammer" | "wrench"): Person => ({
  head: WORKER_HEADS[(i * 3 + 1) % WORKER_HEADS.length],
  coat: ["#6d7f8f", "#7a6a58", "#4f5f4a", "#5a4a7a", "#8a6b5a"][i % 5],
  wear: tool ? [{ kind: tool }] : [],
});

/** Every named cast member, in order of appearance, for the cast sheet. */
export const CAST: { name: string; who: Person }[] = [
  { name: "YOU", who: YOU },
  { name: "WAITRESS", who: WAITRESS },
  { name: "MARCO", who: MARCO },
  { name: "BOSS", who: BOSS },
  { name: "BANKER", who: BANKER },
  { name: "MAYOR", who: MAYOR },
  { name: "RIVAL", who: RIVAL },
  { name: "PLUMBER", who: PLUMBER },
  { name: "REPORTER", who: REPORTER },
  { name: "STRANGER", who: STRANGER },
];
