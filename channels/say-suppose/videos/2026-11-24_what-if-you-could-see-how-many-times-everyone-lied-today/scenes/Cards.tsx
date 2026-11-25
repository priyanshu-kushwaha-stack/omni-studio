// The script's `> CARD:` lines on screen (cardData.ts, made from script.md by make_cards.py): each on its cue words, one at
// a time, in the lower left inside YouTube's safe area (core/studio/rules/text-placement.md), off the faces. A card
// whose top line is "PROBLEM n" or "THE RULE" sits upper left, where the lower picture is busy.
import { interpolate } from "remotion";
import type { Clip, ScriptLine } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { CARDS, type CardItem } from "./cardData";
import { findLine } from "./shared";

const IN = 9;
const OUT = 10;

const Card: React.FC<{ item: CardItem; t: number; total: number }> = ({ item, t, total }) => {
  const shown = interpolate(t, [0, IN, total - OUT, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slide = interpolate(t, [0, IN], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const problem = /^PROBLEM|^THE RULE|^LIMIT/.test(item.top);
  const pos = problem ? { left: 120, top: 150 } : { left: 120, bottom: 190 };
  return (
    <div style={{ position: "absolute", ...pos, opacity: shown, transform: `translateX(${slide}px) rotate(-1.5deg)`, display: "flex",
      alignItems: "center", gap: 22, background: PAPER, color: INK, fontFamily: FONT, padding: "18px 30px 18px 22px", borderRadius: 12,
      boxShadow: "0 8px 0 rgba(30,20,10,.28)", maxWidth: 1240 }}>
      <div style={{ width: 12, alignSelf: "stretch", borderRadius: 6, background: problem ? CRIMSON : TEAL, flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 800, fontSize: item.sub ? 60 : 68, letterSpacing: 3, lineHeight: 1.05 }}>{item.top}</div>
        {item.sub && <div style={{ fontWeight: 800, fontSize: 46, opacity: 0.9, marginTop: 6, lineHeight: 1.2 }}>{item.sub}</div>}
      </div>
    </div>
  );
};

export const Cards: React.FC<{ frame: number; clips: Clip[]; lines: ScriptLine[] }> = ({ frame, clips, lines }) => {
  let from = 0;
  const placed = CARDS.map((item) => {
    let i: number;
    try { i = findLine(lines, item.line, from); } catch { return null; }
    from = i;
    const text = lines[i].text.toLowerCase();
    const k = item.cue ? text.indexOf(item.cue.toLowerCase()) : 0;
    const share = k > 0 ? k / text.length : 0;
    return { item, at: Math.round(clips[i].from + clips[i].frames * share) };
  }).filter((p): p is { item: CardItem; at: number } => p !== null);
  // One at a time: a card ends where the next begins.
  return (
    <>
      {placed.map(({ item, at }, n) => {
        const next = placed[n + 1]?.at ?? Infinity;
        const total = Math.min(Math.round(item.secs * FPS), next - at);
        return frame >= at && frame < at + total ? <Card key={n} item={item} t={frame - at} total={total} /> : null;
      })}
    </>
  );
};
