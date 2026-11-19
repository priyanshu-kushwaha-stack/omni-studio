// The Window (v7, outside review of v6): the card drawn the way parts.tsx's Meter draws it (cream paper, the stamped
// scale, split-flap digits; teal plus, crimson minus, grey zero), but with two things the review asked for that the
// Meter cannot do: the flaps can run from any reading to any other (the teal wave: red through zero to teal; Min-jun's
// riffle back to -84), and while they run the digits are a smear (ghosted, off-register glyphs), so the only crisp
// number on screen is the one the narrator says. `mirror` draws it the wrong way round, as it hangs in the glass.
// Every snap of one of these still gets its <MeterSound> in the beat. World coordinates, like the Meter.
import { interpolate, spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { FLAP_FRAMES } from "../parts";
import { noise } from "../shared";

const GREY = "#9a9a94";

/** What the flaps show at a frame: the number, and whether they are still running (a smear) or stopped (crisp). */
export interface Reading { v: number; moving: boolean }

/** Flaps that start running at `start` from `from` and stop on `to` after `frames` (through zero when the sign changes). */
export function flap(frame: number, start: number, from: number, to: number, frames = FLAP_FRAMES): Reading {
  if (frame < start) return { v: from, moving: false };
  if (frame >= start + frames) return { v: to, moving: false };
  const t = (frame - start) / frames;
  const v = from * to < 0
    ? (t < 0.5 ? from * (1 - t * 2) : to * (t * 2 - 1))
    : from + (to - from) * t;
  return { v: Math.round(v), moving: true };
}

/** A card that snaps open at `at` and whose flaps land on `value` at at + 4 + FLAP_FRAMES (the Meter's timing). */
export const opened = (frame: number, at: number, value: number): Reading => flap(frame, at + 4, 0, value);

/** The frame to snap a card at so its flaps land on a spoken number at `land`. */
export const snapFor = (land: number) => land - 4 - FLAP_FRAMES;

const pop = (frame: number, at: number) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 10, stiffness: 210, mass: 0.6 } });

export const FlapCard: React.FC<{
  frame: number; at: number; x: number; headY: number; r: number; read: Reading; until?: number; tilt?: number; mirror?: boolean;
  /** 0..1 how much the card shows (the night glass dims a reflection a little). */
  opacity?: number;
}> = ({ frame, at, x, headY, r, read, until, tilt = -3, mirror = false, opacity = 1 }) => {
  if (frame < at || (until !== undefined && frame >= until + 8)) return null;
  const open = pop(frame, at);
  const close = until !== undefined && frame >= until ? interpolate(frame, [until, until + 8], [1, 0], { extrapolateRight: "clamp" }) : 1;
  const h = r * 1.05;
  const w = h * 2.5;
  const top = headY - r - h * 1.5;
  const { v, moving } = read;
  const colour = v === 0 ? GREY : v < 0 ? CRIMSON : TEAL;
  const text = `${v > 0 ? "+" : v < 0 ? "-" : ""}${Math.abs(v)}%`;
  const chars = text.split("");
  const tw = h * 0.46;
  const sway = Math.sin((frame - at) / 9) * 2 * Math.max(0, 1 - (frame - at) / 60);
  const marker = 0.5 - Math.max(-100, Math.min(100, v)) / 200;
  const sw = Math.max(0.8, r * 0.055);
  const glyph = (ch: string, i: number, dy: number, o: number, key: string) => (
    <text key={key} x={0} y={h * 0.19 + dy} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.52} fill={PAPER} opacity={o}>
      {moving && /[0-9]/.test(ch) ? String(Math.floor(noise(i * 13 + Math.floor(frame / 2) * 7) * 10)) : ch}
    </text>
  );
  return (
    <g opacity={opacity} transform={`translate(${x} ${top}) rotate(${(mirror ? -1 : 1) * (tilt + sway)}) scale(${mirror ? -1 : 1} ${Math.max(0.001, open * close)})`}>
      <rect x={-w / 2 + h * 0.06} y={h * 0.08} width={w} height={h} rx={h * 0.14} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={0} width={w} height={h} rx={h * 0.14} fill={PAPER} stroke={INK} strokeWidth={sw * 1.2} />
      <rect x={-w / 2 + h * 0.1} y={h * 0.1} width={h * 0.09} height={h * 0.4} fill={TEAL} />
      <rect x={-w / 2 + h * 0.1} y={h * 0.5} width={h * 0.09} height={h * 0.4} fill={CRIMSON} />
      <rect x={-w / 2 + h * 0.07} y={h * 0.48} width={h * 0.15} height={h * 0.04} fill={GREY} />
      <path d={`M${-w / 2 + h * 0.21} ${h * 0.1 + h * 0.8 * marker} l${h * 0.1} ${-h * 0.07} v${h * 0.14}z`} fill={INK} />
      {chars.map((ch, i) => {
        const cx = (i - (chars.length - 1) / 2) * tw * 1.08;
        return (
          <g key={i} transform={`translate(${cx} ${h * 0.4})`}>
            <rect x={-tw / 2} y={-h * 0.3} width={tw} height={h * 0.6} rx={h * 0.06} fill={colour} stroke={INK} strokeWidth={sw} />
            {moving ? (
              <g>
                {/* the flaps mid-run: a smear of glyphs and the flap edges flicking, nothing readable */}
                {glyph(ch, i, -h * 0.2, 0.22, "a")}
                {glyph(ch, i + 5, 0, 0.4, "b")}
                {glyph(ch, i + 9, h * 0.2, 0.22, "c")}
                {[-0.18, 0, 0.18].map((d) => <line key={d} x1={-tw / 2} y1={h * d} x2={tw / 2} y2={h * d} stroke={INK} strokeWidth={sw * 0.8} opacity={0.5} />)}
              </g>
            ) : (
              <g>
                <line x1={-tw / 2} y1={0} x2={tw / 2} y2={0} stroke={INK} strokeWidth={sw * 0.7} opacity={0.6} />
                {glyph(ch, i, 0, 1, "c")}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
