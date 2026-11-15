/** On-screen text over the picture (script v6; first built for v3, the owner on the first cut, 2026-11-13: "Text on the Screen if needed",
 *  and from the fail film: "we should introduce characters so people remember"). A role tag at each character's first
 *  close-up (roles, no names), and a card for each new concept as it is defined, each numbered problem and each
 *  "it's true" fact. One at a time, lower left, inside the UI-safe area. Generated from the script's `> CARD:` lines:
 *  [v6 line, share of the line where the phrase starts, seconds on screen]. A card that would overlap the one before
 *  waits for it to clear. */
import { interpolate } from "remotion";
import type { Clip } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { FPS, INK, PAPER, TEAL, CRIMSON, MUSTARD } from "@whatif/kit/theme";
import { BROKER, BROTHER, CLERK } from "./shared";

type Item = { line: number; p: number; secs: number; kind: "cast" | "fact"; head?: string; top: string; sub: string; accent?: string };

// Script v6 (2026-11-15, review-cursor-v5.md): half the cards, twice the size, none that only repeats the voice; the
// clerk's tag at his first appearance; the problems say what each one is.
const ITEMS: Item[] = [
  // G3: from the coin close (line 0 at 0.5), so the card never sits over your face in the ghost shot before it
  { line: 0, p: 0.5, secs: 3.0, kind: "cast", head: BROKER.head, top: "THE MAN IN THE GREY SUIT", sub: "sells the bands" },
  { line: 6, p: 0.0, secs: 4.0, kind: "fact", accent: TEAL, top: "THE BAND", sub: "rents out your brain while you sleep" },
  { line: 9, p: 0.0, secs: 3.0, kind: "cast", head: BROTHER.head, top: "YOUR BROTHER", sub: "keeps score" },
  { line: 17, p: 0.25, secs: 4.5, kind: "fact", accent: MUSTARD, top: "IT'S TRUE", sub: "2022: brain cells in a dish got better at a video game" },
  { line: 38, p: 0.0, secs: 4.0, kind: "fact", accent: CRIMSON, top: "PROBLEM 1", sub: "everyone can count" },
  { line: 42, p: 0.72, secs: 3.0, kind: "cast", head: CLERK.head, top: "THE CLERK", sub: "picks who sleeps in the warehouse" },
  { line: 48, p: 0.0, secs: 4.0, kind: "fact", accent: CRIMSON, top: "PROBLEM 2", sub: "twelve hours cost something" },
  { line: 66, p: 0.0, secs: 4.0, kind: "fact", accent: CRIMSON, top: "PROBLEM 3", sub: "everyone read the small print" },
  { line: 93, p: 0.0, secs: 4.5, kind: "fact", accent: TEAL, top: "THE JOB", sub: "a band for your days" },
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
