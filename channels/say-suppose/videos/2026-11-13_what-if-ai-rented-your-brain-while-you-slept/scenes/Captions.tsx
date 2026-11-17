/** On-screen text over the picture (script v7; first built for v3, the owner on the first cut, 2026-11-13: "Text on the Screen if needed",
 *  and from the fail film: "we should introduce characters so people remember"). A role tag at each character's first
 *  close-up (roles, no names), and a card for each new concept as it is defined, each numbered problem and each
 *  "it's true" fact. One at a time, lower left, inside the UI-safe area. Generated from the script's `> CARD:` lines:
 *  [v7 line, share of the line where the phrase starts, seconds on screen]. A card that would overlap the one before
 *  waits for it to clear. */
import { interpolate } from "remotion";
import type { Clip } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { FPS, INK, PAPER, TEAL, CRIMSON, MUSTARD } from "@whatif/kit/theme";
import { BOSS, BRIDGE_WOMAN, BROTHER, CLERK, GRANDMOTHER, NURSE } from "./shared";

type Item = { line: number; p: number; secs: number; kind: "cast" | "fact"; head?: string; top: string; sub: string; accent?: string };

// Script v7 (2026-11-17): v5's cards in v7 numbering (v5 line n is v7 line n - 1 from v5 line 25), at v6's larger size.
// Not the grey-suit tag (owner, G3: "not needed", and he isn't the subject while it's up) or the brain-cells IT'S TRUE
// card (its line is cut). The plasma fact sits on "It's true" (v7 86) and the 2020 card on "In 2020" (v7 112).
const ITEMS: Item[] = [
  { line: 0, p: 0.05, secs: 3.5, kind: "cast", head: NURSE.head, top: "THE NURSE", sub: "takes your plasma, twice a week" },
  { line: 3, p: 0.74, secs: 4.5, kind: "fact", accent: TEAL, top: "SELLING PLASMA", sub: "twice a week" },
  { line: 6, p: 0.0, secs: 4.5, kind: "fact", accent: TEAL, top: "THE BAND", sub: "rents out your brain while you sleep" },
  { line: 11, p: 0.0, secs: 3.5, kind: "cast", head: BROTHER.head, top: "YOUR BROTHER", sub: "last year of school · keeps score" },
  { line: 15, p: 0.59, secs: 4.5, kind: "fact", accent: TEAL, top: "THE LEAFLET", sub: "the deal, in writing" },
  { line: 20, p: 0.61, secs: 4.5, kind: "fact", accent: TEAL, top: "CRUMBS", sub: "a taste, a word, a face that isn't yours" },
  { line: 39, p: 0.0, secs: 3.5, kind: "cast", head: BRIDGE_WOMAN.head, top: "THE WOMAN AT THE BRIDGE", sub: "crosses twice a week to sell plasma" },
  { line: 44, p: 0.6, secs: 4.5, kind: "fact", accent: TEAL, top: "ONE BRAIN, ONE BAND", sub: "a second band pays nothing" },
  { line: 47, p: 0.56, secs: 4.5, kind: "fact", accent: MUSTARD, top: "IT'S TRUE", sub: "a Nobel Prize experiment, first dreamt" },
  { line: 49, p: 0.26, secs: 4.5, kind: "fact", accent: CRIMSON, top: "PROBLEM 1", sub: "ninety dollars for eight hours" },
  { line: 52, p: 0.0, secs: 3.5, kind: "cast", head: BOSS.head, top: "YOUR BOSS", sub: "opens a nap room, with a till" },
  { line: 55, p: 0.0, secs: 3.5, kind: "cast", head: GRANDMOTHER.head, top: "THE GRANDMOTHER NEXT DOOR", sub: "sleeps eleven hours a night" },
  { line: 67, p: 0.18, secs: 4.5, kind: "fact", accent: TEAL, top: "A THIRD OF YOUR LIFE", sub: "asleep" },
  { line: 75, p: 0.29, secs: 4.5, kind: "fact", accent: CRIMSON, top: "PROBLEM 2", sub: "whatever you lose, you lose alone" },
  { line: 84, p: 0.22, secs: 4.5, kind: "fact", accent: CRIMSON, top: "PROBLEM 3", sub: "the price is about to fall" },
  { line: 86, p: 0.05, secs: 5.5, kind: "fact", accent: MUSTARD, top: "IT'S TRUE", sub: "the US supplies about two thirds of the world's plasma" },
  { line: 97, p: 0.0, secs: 3.5, kind: "cast", head: CLERK.head, top: "THE CLERK", sub: "picks who sleeps in the warehouse" },
  { line: 112, p: 0.06, secs: 5.5, kind: "fact", accent: MUSTARD, top: "2020", sub: "a million home computers, linked into one" },
  { line: 118, p: 0.46, secs: 5.5, kind: "fact", accent: TEAL, top: "THE JOB", sub: "design the thing that never needs sleepers" },
];

const IN = 9;
const OUT = 10;
const GAP = 6;

const Card: React.FC<{ item: Item; t: number; total: number }> = ({ item, t, total }) => {
  const shown = interpolate(t, [0, IN, total - OUT, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slide = interpolate(t, [0, IN], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 110, bottom: 120, opacity: shown, transform: `translateX(${slide}px) rotate(-1.5deg)`,
      display: "flex", alignItems: "center", gap: 22, background: PAPER, color: INK, fontFamily: FONT, padding: "18px 30px 18px 22px",
      borderRadius: 12, boxShadow: "0 8px 0 rgba(30,20,10,.28)", maxWidth: 1100 }}>
      {item.kind === "cast" && <div style={{ width: 80, height: 80, borderRadius: 40, background: item.head, border: `5px solid ${INK}`, flexShrink: 0 }} />}
      {item.kind === "fact" && <div style={{ width: 12, alignSelf: "stretch", borderRadius: 6, background: item.accent, flexShrink: 0 }} />}
      <div>
        <div style={{ fontWeight: 800, fontSize: 64, letterSpacing: 3, lineHeight: 1.05 }}>{item.top}</div>
        <div style={{ fontWeight: 800, fontSize: 46, opacity: 0.88, marginTop: 6, lineHeight: 1.2 }}>{item.sub}</div>
      </div>
    </div>
  );
};

/** Each item's start frame; one waits for the one before to clear. */
function starts(clips: Clip[]): number[] {
  const out: number[] = [];
  let free = 0;
  for (const item of ITEMS) {
    const c = clips[item.line];
    const at = c ? Math.max(free, Math.round(c.from + c.frames * item.p)) : Infinity;
    out.push(at);
    if (c) free = at + Math.round(item.secs * FPS) + GAP;
  }
  return out;
}

export const Captions: React.FC<{ frame: number; clips: Clip[] }> = ({ frame, clips }) => {
  const at = starts(clips);
  return (
    <>
      {ITEMS.map((item, i) => {
        const total = Math.round(item.secs * FPS);
        return frame >= at[i] && frame < at[i] + total ? <Card key={i} item={item} t={frame - at[i]} total={total} /> : null;
      })}
    </>
  );
};
