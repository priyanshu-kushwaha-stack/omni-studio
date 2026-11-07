import { spring, useCurrentFrame } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { Flip } from "@whatif/kit/ui/Flip";

export interface Tick { at: number; n: number }

/** Eleven ticks, 10 down to 0, spread evenly across a pause. */
export const evenTicks = (from: number, to: number): Tick[] =>
  Array.from({ length: 11 }, (_, i) => ({ at: Math.round(from + ((to - from) * i) / 10), n: 10 - i }));

/** The paper countdown: a split-flap number that shows the latest tick at or before this frame. Screen pixels,
 *  top-right by default, below the pause bars and clear of faces. Hidden before the first tick and after `until`. */
export const Counter: React.FC<{ ticks: Tick[]; until?: number; x?: number; y?: number; scale?: number }> = ({
  ticks, until = Infinity, x = 1670, y = 92, scale = 0.85,
}) => {
  const frame = useCurrentFrame();
  const i = ticks.reduce((on, k, j) => (frame >= k.at ? j : on), -1);
  if (i < 0 || frame >= until) return null;
  const pop = spring({ frame: frame - ticks[0].at, fps: 30, config: { damping: 12, stiffness: 170 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale * pop})`, transformOrigin: "top left" }}>
      <Flip value={String(ticks[i].n)} previous={String(ticks[Math.max(0, i - 1)].n)} changedAt={ticks[i].at} />
    </div>
  );
};

/** A paper speech bubble that pops in at `at` and goes at `until`. Screen pixels; the tail points down-left or
 *  down-right towards the speaker. Keep it off faces. */
export const Bubble: React.FC<{ at: number; until?: number; text: string; x: number; y: number; tail?: "left" | "right"; size?: number }> = ({
  at, until = Infinity, text, x, y, tail = "left", size = 48,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= until) return null;
  const s = spring({ frame: frame - at, fps: 30, config: { damping: 11, stiffness: 200, mass: 0.6 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, transformOrigin: tail === "left" ? "bottom left" : "bottom right" }}>
      <div style={{ position: "relative", background: PAPER, color: INK, fontFamily: FONT, fontWeight: 800, fontSize: size,
        padding: `${size * 0.35}px ${size * 0.55}px`, borderRadius: size * 0.6, border: `6px solid ${INK}`, whiteSpace: "nowrap",
        boxShadow: "0 8px 0 rgba(30,20,10,.28)" }}>
        {text}
        <svg width={60} height={50} style={{ position: "absolute", top: "100%", marginTop: -6, [tail]: size * 0.8 } as React.CSSProperties}>
          <path d={tail === "left" ? "M4 0 L12 44 L44 0" : "M56 0 L48 44 L16 0"} fill={PAPER} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <rect x={6} y={0} width={46} height={6} fill={PAPER} />
        </svg>
      </div>
    </div>
  );
};
