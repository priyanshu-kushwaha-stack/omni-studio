// The film's rule device (packaging.md, "The rule device"): the forecast TAG, a cream stamped card on a thread from the
// nearest teal lamp, a forecast line over split-flap digits; teal with a tick when it comes true, crimson when it is
// broken or forecasts a crime, blank once in the film (the peak). Under it, on lampposts, pillars and tills, the RATE
// BOARD: a split-flap price that flaps down with every tick and up with every red. And the city's small TEAL LAMP.
//
// Pictures (<Tag>, <RateBoard>, <TealLamp>) are drawn in WORLD coordinates inside a <Stage> slot. Their sounds
// (<TagSounds>, <BoardSounds>) are <Audio> and go OUTSIDE <Stage> (kit/sound.ts), like the pause-time film's beats.
//
//   <Tag frame={f} x={head.x} headY={head.y} r={head.r} keys={[
//     { at: k.drop, text: "POCKETS KEY", pct: 91, state: "new" },
//     { at: k.tick, text: "POCKETS KEY", pct: 91, state: "tick" },
//   ]} />
//   ...outside the Stage: <TagSounds keys={sameKeys} />
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { pop } from "./kit";

/** new: just dropped, crimson type on cream, digits running. tick: came true, teal with a tick. crimson: broken, or a
 *  crime forecast, buzzing. blank: no forecast at all (the peak, the kid's card). */
export type TagState = "new" | "tick" | "crimson" | "blank";

/** One state of a tag from frame `at`. `pct` null shows no digits (UNPREDICTABLE). */
export interface TagKey { at: number; text: string; pct: number | null; state: TagState }

/** Frames the digits take to run to their number after a change. */
export const FLAP = 14;
const TEAL_INK = "#0f6f66";

/** The key on at `frame`, the one before it, and the frame it came on. */
function keyAt(keys: TagKey[], frame: number) {
  let i = -1;
  for (let k = 0; k < keys.length; k++) if (frame >= keys[k].at) i = k;
  return { key: i >= 0 ? keys[i] : null, prev: i > 0 ? keys[i - 1] : null };
}

/** The digits shown: running from the previous number (or zero) to this one over FLAP frames. */
function shown(frame: number, key: TagKey, prev: TagKey | null) {
  if (key.pct === null) return null;
  const from = prev?.pct ?? 0;
  const t = interpolate(frame, [key.at + 3, key.at + 3 + FLAP], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.round(from + (key.pct - from) * t);
}

/**
 * A forecast tag hanging over a head at (x, headY) with radius r: it drops on its thread at the first key, then flips
 * through the rest. `scale` sizes the card against the head (1 = about two heads wide). `threadTop` is where the thread
 * goes up to (default: well above the frame). `until` takes it away.
 */
export const Tag: React.FC<{
  frame: number; x: number; headY: number; r: number; keys: TagKey[]; scale?: number; threadTop?: number; until?: number;
  tilt?: number;
}> = ({ frame, x, headY, r, keys, scale = 1, threadTop, until, tilt = -2 }) => {
  const { key, prev } = keyAt(keys, frame);
  if (!key || (until !== undefined && frame >= until)) return null;
  const first = keys[0].at;
  const drop = pop(frame, first, 170);
  const flip = frame - key.at < 6 && key !== keys[0] ? Math.abs(Math.cos(((frame - key.at) / 6) * Math.PI)) : 1;
  const buzz = key.state === "crimson" && frame - key.at < 10 ? Math.sin((frame - key.at) * 2.4) * 4 : 0;
  const h = r * 0.95 * scale;
  const label = key.state === "blank" ? "" : key.text;
  const v = shown(frame, key, prev);
  const digits = v === null || key.state === "blank" ? "" : `${v}%`;
  const textW = Math.max(label.length * h * 0.3, digits.length * h * 0.42, h * 1.6);
  const w = textW + h * 0.7 + (key.state === "tick" ? h * 0.5 : 0);
  const cardTop = headY - r - h * 2.1 - (1 - drop) * h * 3;
  const top = threadTop ?? cardTop - 2400;
  const sway = Math.sin((frame - first) / 11) * 2.2 * Math.max(0, 1 - (frame - first) / 70);
  const face = key.state === "tick" ? "#e3f2ee" : key.state === "crimson" ? "#f6dcdc" : PAPER;
  const ink = key.state === "tick" ? TEAL_INK : key.state === "crimson" ? CRIMSON : key.state === "blank" ? PAPER : CRIMSON;
  const tile = key.state === "tick" ? TEAL : CRIMSON;
  const hasDigits = digits.length > 0;
  const cardH = hasDigits ? h * 1.75 : h * 1.05;
  return (
    <g opacity={drop}>
      <line x1={x} y1={top} x2={x + buzz} y2={cardTop} stroke={PAPER} strokeWidth={Math.max(2, r * 0.035)} opacity={0.75} />
      <g transform={`translate(${x + buzz} ${cardTop}) rotate(${tilt + sway}) scale(1 ${Math.max(0.02, flip)})`}>
        <rect x={-w / 2 + h * 0.06} y={h * 0.08} width={w} height={cardH} rx={h * 0.12} fill="#000" opacity={0.3} />
        <rect x={-w / 2} y={0} width={w} height={cardH} rx={h * 0.12} fill={face} stroke={INK} strokeWidth={Math.max(3, r * 0.05)} />
        {label && (
          <text x={key.state === "tick" ? -h * 0.25 : 0} y={h * 0.42} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={h * 0.36} fill={ink} letterSpacing={1}>{label}</text>
        )}
        {key.state === "tick" && (
          <path d={`M${w / 2 - h * 0.62} ${h * 0.3} l${h * 0.14} ${h * 0.16} l${h * 0.28} ${-h * 0.3}`} fill="none" stroke={TEAL}
            strokeWidth={h * 0.1} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {hasDigits && digits.split("").map((ch, i, all) => {
          const tw = h * 0.42;
          const cx = (i - (all.length - 1) / 2) * tw * 1.08;
          return (
            <g key={i} transform={`translate(${cx} ${h * 1.12})`}>
              <rect x={-tw / 2} y={-h * 0.3} width={tw} height={h * 0.6} rx={h * 0.06} fill={tile} stroke={INK} strokeWidth={Math.max(2, r * 0.03)} />
              <line x1={-tw / 2} y1={0} x2={tw / 2} y2={0} stroke={INK} strokeWidth={Math.max(1.5, r * 0.02)} opacity={0.55} />
              <text x={0} y={h * 0.19} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.52} fill={PAPER}>{ch}</text>
            </g>
          );
        })}
      </g>
    </g>
  );
};

/** The sounds for a tag's keys: a paper flap and the digits' flutter on the drop and every change, a soft tick when it
 *  comes true, a dull buzz when it goes crimson, and nothing at all for blank. Place OUTSIDE <Stage>. */
export const TagSounds: React.FC<{ keys: TagKey[]; volume?: number }> = ({ keys, volume = 1 }) => (
  <>
    {keys.map((k, i) => (
      <Sequence key={i} from={k.at} durationInFrames={FLAP + 14}>
        {k.state !== "blank" && <Audio src={staticFile("sfx/flap.wav")} volume={0.8 * volume} />}
        {k.state === "tick" && <Sequence from={FLAP}><Audio src={staticFile("sfx/tick.wav")} volume={volume} /></Sequence>}
        {k.state === "crimson" && <Sequence from={4}><Audio src={staticFile("sfx/buzz.wav")} volume={0.7 * volume} /></Sequence>}
      </Sequence>
    ))}
  </>
);

/** One keyframe of a rate board: from `at`, it shows `value` (a number like 100 or 99.5, or a price like "1.50"). */
export interface BoardKey { at: number; value: string }

/**
 * A split-flap rate board: a dark plate with a short label in small caps ("YOUR RATE", "CITY SCORE", "HIS RATE") and
 * its value in split-flap tiles that flutter on each change. (x, y) is its top centre; `size` is a tile's height.
 */
export const RateBoard: React.FC<{ frame: number; x: number; y: number; size?: number; label?: string; keys: BoardKey[] }> = ({
  frame, x, y, size = 60, label, keys,
}) => {
  let k = keys[0];
  for (const key of keys) if (frame >= key.at) k = key;
  const changing = frame - k.at >= 0 && frame - k.at < 8 && k !== keys[0];
  const chars = k.value.split("");
  const tw = size * 0.7;
  const w = Math.max(chars.length * tw * 1.06 + size * 0.5, label ? label.length * size * 0.24 + size * 0.5 : 0);
  const lh = label ? size * 0.42 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={0} width={w} height={size * 1.35 + lh} rx={size * 0.12} fill="#1b1e29" stroke={INK} strokeWidth={Math.max(3, size * 0.06)} />
      {label && <text x={0} y={lh * 0.9} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.3} fill={PAPER} opacity={0.85} letterSpacing={1}>{label}</text>}
      {chars.map((ch, i) => {
        const cx = (i - (chars.length - 1) / 2) * tw * 1.06;
        const squash = changing ? Math.abs(Math.cos(((frame - k.at + i) / 8) * Math.PI)) : 1;
        return (
          <g key={i} transform={`translate(${cx} ${lh + size * 0.68}) scale(1 ${Math.max(0.05, squash)})`}>
            <rect x={-tw / 2} y={-size * 0.5} width={tw} height={size} rx={size * 0.08} fill="#2c3040" stroke={INK} strokeWidth={Math.max(2, size * 0.04)} />
            <line x1={-tw / 2} y1={0} x2={tw / 2} y2={0} stroke={INK} strokeWidth={Math.max(1.5, size * 0.03)} />
            <text x={0} y={size * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.78} fill={PAPER}>{ch}</text>
          </g>
        );
      })}
    </g>
  );
};

/** A rate board's flutter on every change after the first. Place OUTSIDE <Stage>. */
export const BoardSounds: React.FC<{ keys: BoardKey[]; volume?: number }> = ({ keys, volume = 0.6 }) => (
  <>
    {keys.slice(1).map((k, i) => (
      <Sequence key={i} from={k.at} durationInFrames={16}><Audio src={staticFile("sfx/flutter.wav")} volume={volume} /></Sequence>
    ))}
  </>
);

/** The city's small teal lamp, clipped to a lamppost or a ceiling: a dark clip, a teal bulb and its glow. `on` is the
 *  frame it switches on (blinks twice first); before it, the bulb is dark. */
export const TealLamp: React.FC<{ frame: number; x: number; y: number; size?: number; on?: number; dim?: number }> = ({
  frame, x, y, size = 30, on = -1000, dim = 1,
}) => {
  const t = frame - on;
  const lit = t < 0 ? 0 : t < 8 ? 1 : t < 14 ? 0 : t < 20 ? 1 : t < 24 ? 0.3 : 1;
  const glow = lit * dim;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={size * 3.2} fill={TEAL} opacity={0.18 * glow} />
      <circle r={size * 1.8} fill={TEAL} opacity={0.25 * glow} />
      <rect x={-size * 0.7} y={-size * 1.3} width={size * 1.4} height={size * 0.8} rx={size * 0.2} fill="#2c3040" stroke={INK} strokeWidth={Math.max(2, size * 0.12)} />
      <circle r={size * 0.62} fill={glow > 0 ? "#7fe0d4" : "#1d3d3a"} stroke={INK} strokeWidth={Math.max(2, size * 0.12)} />
    </g>
  );
};

/** The lamp's click on, and its two blinks. Place OUTSIDE <Stage>. */
export const LampSound: React.FC<{ on: number }> = ({ on }) => (
  <>
    {[0, 14, 20].map((d) => (
      <Sequence key={d} from={on + d} durationInFrames={10}><Audio src={staticFile("sfx/tick.wav")} volume={0.5} /></Sequence>
    ))}
  </>
);
