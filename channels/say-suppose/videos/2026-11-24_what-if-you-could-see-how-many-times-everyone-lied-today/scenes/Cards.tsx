// The script's `> CARD:` lines on screen (cardData.ts, made from script.md by make_cards.py): each on its cue words, one at
// a time. Look C (owner, 2026-11-25: "show it as a card in the bottom very short"): a fact is a short dark tag centred at
// the bottom inside YouTube's safe area (core/studio/rules/text-placement.md), off the faces; a "PROBLEM n" card is a
// small pill upper left, the way Ifverse keeps one small HUD in a corner.
import { interpolate } from "remotion";
import type { Clip, ScriptLine } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, PAPER, TEAL } from "@whatif/kit/theme";
import { CARDS, type CardItem } from "./cardData";
import { findLine } from "./shared";

const IN = 9;
const OUT = 10;

const Card: React.FC<{ item: CardItem; t: number; total: number }> = ({ item, t, total }) => {
  const shown = interpolate(t, [0, IN, total - OUT, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = interpolate(t, [0, IN], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const problem = /^PROBLEM|^THE RULE|^LIMIT/.test(item.top);
  const box: React.CSSProperties = { position: "absolute", opacity: shown, fontFamily: FONT, color: PAPER, fontWeight: 800,
    background: "rgba(14,12,10,.78)", borderRadius: 12, whiteSpace: "nowrap" };
  if (problem) {
    return (
      <div style={{ ...box, left: 110, top: 110, transform: `translateY(${-rise}px)`, padding: "10px 24px", fontSize: 34, letterSpacing: 2,
        border: `3px solid ${CRIMSON}` }}>
        {item.top}{item.sub ? <span style={{ opacity: 0.85, letterSpacing: 1 }}>{` · ${item.sub}`}</span> : null}
      </div>
    );
  }
  return (
    <div style={{ ...box, left: "50%", bottom: 120, transform: `translate(-50%, ${rise}px)`, padding: "12px 30px", fontSize: 40,
      letterSpacing: 2, borderBottom: `4px solid ${TEAL}` }}>
      {item.top}
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
