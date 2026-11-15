// The Rule's small parts (builder a): the paper music notes your best friend hums, a card hung from the nearest
// walkway lamp, the torn card in his hand (TEARS OFF TAG: he rips his card off its thread), and stamped digits.
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { Tag, type TagKey } from "../device";
import { lampAt, nearestLamp } from "../sets/CoveredWalkway";

export type Face = Partial<{ brows: "none" | "raised" | "worry" | "sad" | "angry" | "flat"; lids: number; mouth: "none" | "smile" | "smirk" | "o" | "flat" | "open" | "frown"; eyes: number; look: { x: number; y: number } }>;

/** The walkers' cards are drawn at this size against the head. */
export const TAG_SCALE = 0.6;

/** A small paper music note floating up from a hummer's mouth. */
const Note: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={11} ry={8} fill={PAPER} stroke={INK} strokeWidth={3} transform="rotate(-20)" />
    <line x1={9} y1={-2} x2={9} y2={-42} stroke={PAPER} strokeWidth={5} />
    <path d="M9 -42 q16 6 14 22" fill="none" stroke={PAPER} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** Notes rising from a mouth, one every 14 frames between `from` and `to`. */
export const Notes: React.FC<{ frame: number; mouth: { x: number; y: number }; dir: 1 | -1; from: number; to: number; size: number }> = ({ frame, mouth, dir, from, to, size }) => (
  <g>
    {Array.from({ length: 6 }, (_, i) => {
      const born = Math.floor((frame - from) / 14) * 14 + from - i * 14;
      if (born < from || born >= to) return null;
      const age = (frame - born) / 60;
      if (age < 0 || age > 1) return null;
      return <Note key={born} x={mouth.x + dir * (30 + age * 120)} y={mouth.y - 20 - age * 170 + Math.sin(age * 9) * 10} s={size * (0.7 + age * 0.4)} o={1 - age} />;
    })}
  </g>
);

/** A card hanging from the lamp you're under: the thread from the lamp to the card, then the card. */
export const HungTag: React.FC<{ frame: number; x: number; h: { x: number; y: number; r: number }; keys: TagKey[]; until?: number }> = ({ frame, x, h, keys, until }) => {
  if (frame < keys[0].at || (until !== undefined && frame >= until)) return null;
  const hh = h.r * 0.95 * TAG_SCALE;
  const top = h.y - h.r - hh * 2.1;
  const lamp = lampAt(nearestLamp(x));
  return (
    <g>
      <line x1={lamp.x} y1={lamp.y + 12} x2={h.x} y2={top} stroke={PAPER} strokeWidth={3} opacity={0.6} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} keys={keys} scale={TAG_SCALE} threadTop={top} until={until} />
    </g>
  );
};

/** The card he tore off: HUMS 99% in teal, a ragged top where the thread was. (x, y) its centre; `size` its height. */
export const TornCard: React.FC<{ x: number; y: number; size: number; tilt?: number }> = ({ x, y, size, tilt = 0 }) => {
  const h = size;
  const w = h * 1.5;
  const rag = Array.from({ length: 9 }, (_, i) => `L${-w / 2 + (w * (i + 1)) / 9} ${-h / 2 + (i % 2 ? h * 0.07 : 0)}`).join(" ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <path d={`M${-w / 2} ${-h / 2} ${rag} L${w / 2} ${h / 2} L${-w / 2} ${h / 2}Z`} fill="#e3f2ee" stroke={INK} strokeWidth={Math.max(2, h * 0.05)} strokeLinejoin="round" />
      <text x={0} y={-h * 0.06} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.28} fill="#0f6f66">HUMS</text>
      {["9", "9", "%"].map((ch, i) => (
        <g key={i} transform={`translate(${(i - 1) * h * 0.3} ${h * 0.27})`}>
          <rect x={-h * 0.13} y={-h * 0.15} width={h * 0.26} height={h * 0.3} rx={h * 0.04} fill={TEAL} stroke={INK} strokeWidth={Math.max(1.5, h * 0.03)} />
          <text x={0} y={h * 0.1} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.25} fill={PAPER}>{ch}</text>
        </g>
      ))}
    </g>
  );
};

/** Stamped split-flap digits on the paper, the narrator's number. */
export const Stamp: React.FC<{ x: number; y: number; text: string; size: number; color: string }> = ({ x, y, text, size, color }) => (
  <g transform={`translate(${x} ${y})`}>
    {text.split("").map((ch, i, all) => (
      <g key={i} transform={`translate(${(i - (all.length - 1) / 2) * size * 0.66} 0)`}>
        <rect x={-size * 0.3} y={-size * 0.44} width={size * 0.6} height={size * 0.88} rx={size * 0.08} fill={color} stroke={INK} strokeWidth={4} />
        <text x={0} y={size * 0.27} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.68} fill={PAPER}>{ch}</text>
      </g>
    ))}
  </g>
);
