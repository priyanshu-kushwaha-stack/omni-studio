/** On-screen text over the picture (script v4, owner on v3, 2026-11-13): a cast tag at each recurring character's first
 *  close-up ("we should introduce characters so people remember also else everything else might look the same"), and
 *  a card only where a fact or a turn has to be held ("If some text makes sense to emphasise on something then we can
 *  add that but only if it makes sense"). One at a time, in the lower left, inside the UI-safe area, off the drawing's
 *  faces, inside YouTube's safe area; the exam title sits upper left. Each is placed on a v5 line: [line, share of the line, seconds on screen]. */
import { interpolate } from "remotion";
import type { Clip } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { FPS, INK, PAPER, TEAL, CRIMSON } from "@whatif/kit/theme";
import { JIYOON, KANG, MINJUN, TAEHO } from "./shared";

type Item = { line: number; p: number; secs: number; kind: "cast" | "fact" | "title"; head?: string; top: string; sub: string; accent?: string; right?: boolean; high?: boolean };

const ITEMS: Item[] = [
  { line: 4, p: 0.05, secs: 4, kind: "cast", head: MINJUN.head, top: "MIN-JUN", sub: "best friend since age twelve", right: true }, // the left is his face in the close-up
  { line: 18, p: 0, secs: 2.6, kind: "cast", head: JIYOON.head, top: "JI-YOON", sub: "big sister · night shifts" },
  { line: 23, p: 0, secs: 4, kind: "cast", head: TAEHO.head, top: "TAE-HO", sub: "the rival" },
  { line: 29, p: 0, secs: 3.5, kind: "cast", head: KANG.head, top: "MS. KANG", sub: "maths teacher" },
  { line: 42, p: 0.2, secs: 5, kind: "fact", accent: CRIMSON, top: "PROBLEM 1", sub: "Only your race can hurt at your news.", high: true },
  // v7: { line: 51, p: 0, secs: 5, kind: "fact", accent: TEAL, top: "THE CURVE", sub: "Top 4% get the top grade", right: true },  (now drawn in the beat itself; outside review: say a fact once)
  // v7: { line: 67, p: 0, secs: 6.5, kind: "fact", accent: TEAL, top: "ONE NEIGHBOURHOOD IN SEOUL", sub: "about 1,000 academies · closed by 10 pm" },  (now drawn in the beat itself; outside review: say a fact once)
  { line: 81, p: 0, secs: 5.5, kind: "fact", accent: TEAL, top: "TWO KINDS OF ENVY", sub: "One makes you climb. One pulls them down." },
  { line: 84, p: 0.1, secs: 5, kind: "fact", accent: CRIMSON, top: "PROBLEM 2", sub: "The rival knows your trick.", high: true },
  { line: 92, p: 0, secs: 4, kind: "title", top: "EXAM MORNING", sub: "8:00 am" },
  { line: 95, p: 0.08, secs: 8, kind: "fact", accent: CRIMSON, top: "NOVEMBER 2025 · SOUTH KOREA", sub: "No takeoffs or landings for 35 minutes" },
  { line: 97, p: 0, secs: 3.5, kind: "title", top: "RESULTS DAY", sub: "one month later" },
];

const IN = 9;
const OUT = 10;

const Card: React.FC<{ item: Item; t: number; total: number }> = ({ item, t, total }) => {
  const shown = interpolate(t, [0, IN, total - OUT, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slide = interpolate(t, [0, IN], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const title = item.kind === "title";
  // Inside YouTube's safe area (outside review of v4.1, 2026-11-13): the player's controls cover about the bottom 12%
  // (130 px of 1080) and the title bar the top 10% (108 px), so cards sit 190 px up and titles 150 px down. `high`
  // puts a card upper left, where the picture's ground is busy (the Problem cards, over the steps and the class).
  const pos = title || item.high ? { left: 120, top: 150 } : item.right ? { right: 120, bottom: 190 } : { left: 120, bottom: 190 };
  return (
    <div style={{ position: "absolute", ...pos, opacity: shown, transform: `translateX(${slide}px) rotate(-1.5deg)`, display: "flex",
      alignItems: "center", gap: 22, background: PAPER, color: INK, fontFamily: FONT, padding: "18px 30px 18px 22px", borderRadius: 12,
      boxShadow: "0 8px 0 rgba(30,20,10,.28)", maxWidth: 1240 }}>
      {item.kind === "cast" && <div style={{ width: 76, height: 76, borderRadius: 38, background: item.head, border: `5px solid ${INK}`, flexShrink: 0 }} />}
      {item.kind === "fact" && <div style={{ width: 12, alignSelf: "stretch", borderRadius: 6, background: item.accent, flexShrink: 0 }} />}
      <div>
        <div style={{ fontWeight: 800, fontSize: title ? 72 : 60, letterSpacing: 3, lineHeight: 1.05 }}>{item.top}</div>
        <div style={{ fontWeight: 800, fontSize: title ? 46 : 46, opacity: 0.9, marginTop: 6, lineHeight: 1.2 }}>{item.sub}</div>
      </div>
    </div>
  );
};

export const Captions: React.FC<{ frame: number; clips: Clip[] }> = ({ frame, clips }) => (
  <>
    {ITEMS.map((item, i) => {
      const c = clips[item.line];
      if (!c) return null;
      const at = Math.round(c.from + c.frames * item.p);
      const total = Math.round(item.secs * FPS);
      return frame >= at && frame < at + total ? <Card key={i} item={item} t={frame - at} total={total} /> : null;
    })}
  </>
);
