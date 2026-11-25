// Helpers shared by the opening beats (Frame, Click, Rule, Zeros, Floor): where a figure's head and hands are, the
// counter placed over a head, a speech bubble and a stamped paper tag in screen space, the click sound under every
// tick, and this film's recurring people. No AI images.
import { Audio, interpolate, Sequence, spring, staticFile } from "remotion";
import { Figure, type FigureProps, type Mouth } from "@whatif/kit/rig/Figure";
import { dir, HEAD_R, joints, LIMB, reach, type Pose } from "@whatif/kit/rig/pose";
import { toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Counter } from "./Counter";

/** Your flatmate: pale-blue head, a dressing gown. */
export const FLATMATE = { head: "#a9cdea", coat: "#8a6a9a" } as const;
/** The man at the back of the bus: mint head, headphones, on the phone. */
export const BUS_MAN = { head: "#9fe0c4", coat: "#4a5a6a" } as const;

/** A figure as drawn: feet at (x, y), its scale, which way it faces and its pose. */
export interface Placed { x: number; y: number; scale: number; facing: 1 | -1; pose: Pose; rotate?: number }

/** A figure-local point (feet at 0,0, facing right, unscaled) in world units, through the Figure's own transform. */
export function toWorld(f: Placed, p: { x: number; y: number }) {
  const hipY = joints(f.pose).hip.y * f.scale;
  const sx = p.x * f.scale * f.facing;
  const sy = p.y * f.scale - hipY;
  const a = ((f.rotate ?? 0) * Math.PI) / 180;
  return { x: f.x + sx * Math.cos(a) - sy * Math.sin(a), y: f.y + hipY + sx * Math.sin(a) + sy * Math.cos(a) };
}

function toLocal(f: Placed, w: { x: number; y: number }) {
  const hipY = joints(f.pose).hip.y * f.scale;
  const a = (-(f.rotate ?? 0) * Math.PI) / 180;
  const dx = w.x - f.x;
  const dy = w.y - f.y - hipY;
  return { x: (dx * Math.cos(a) - dy * Math.sin(a)) / (f.scale * f.facing), y: (dx * Math.sin(a) + dy * Math.cos(a) + hipY) / f.scale };
}

export function handWorld(f: Placed, arm: "armF" | "armB" = "armF") {
  const j = joints(f.pose);
  const [u, v] = f.pose[arm];
  const a = dir(u);
  const b = dir(u + v);
  return toWorld(f, { x: j.shoulder.x + (a.x + b.x) * LIMB, y: j.shoulder.y + (a.y + b.y) * LIMB });
}

/** The head's centre and radius in world units. */
export function headWorld(f: Placed) {
  const c = toWorld(f, joints(f.pose).head);
  return { ...c, r: HEAD_R * f.scale };
}

/** The arm angles that put a hand on a world point (as far as the arm reaches). */
export function aim(f: Placed, target: { x: number; y: number }): [number, number] {
  const l = toLocal(f, target);
  const s = joints(f.pose).shoulder;
  return reach(l.x - s.x, l.y - s.y);
}

/** A mouth that moves while a line plays (open, o, open, flat), never lip-sync; `rest` outside it. */
export function talk(frame: number, from: number, to: number, rest: Mouth = "flat"): Mouth {
  if (frame < from || frame >= to) return rest;
  return (["open", "o", "open", "flat"] as const)[Math.floor((frame - from) / 5) % 4];
}

/** Where a counter of digit height `size` floats over a figure's head. */
export function counterOver(f: Placed, size: number) {
  const h = headWorld(f);
  return { x: h.x, y: h.y - h.r - size * 0.78 };
}

/** A figure with its lie counter over its head. `count` omitted: no counter (you never see your own). */
export const Person: React.FC<{
  f: Placed; who: Partial<FigureProps> & { head: string }; frame: number; id: string;
  count?: { base: number; ticks?: number[]; size?: number; on?: number; dim?: boolean };
}> = ({ f, who, frame, id, count }) => {
  const size = count?.size ?? 34 * f.scale;
  const at = counterOver(f, size);
  return (
    <g>
      <Figure x={f.x} y={f.y} scale={f.scale} facing={f.facing} pose={f.pose} rotate={f.rotate} time={frame} {...who} />
      {count && (
        <g opacity={count.dim ? 0.62 : 1}>
          <Counter x={at.x} y={at.y} base={count.base} ticks={count.ticks} frame={frame} size={size} on={count.on} id={id} />
        </g>
      )}
    </g>
  );
};

/** Spring pop from 0 to 1 starting at `at`. */
export const popAt = (frame: number, at: number, stiffness = 220) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: 30, config: { damping: 12, stiffness, mass: 0.7 } });

/** A speech bubble over a head in screen space: (x, y) is the tail's tip in output pixels. You never speak aloud. */
export const Bubble: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; text: string; size?: number; side?: "left" | "right" }> = ({
  frame, at, until, x, y, text, size = 52, side = "right",
}) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = popAt(frame, at);
  const fade = until === undefined ? 1 : interpolate(frame, [until - 6, until], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const w = Math.max(size * 3.2, text.length * size * 0.6 + size * 1.3);
  const h = size * 1.9;
  // keep the bubble inside the safe area (120 px each side, 130 top)
  const left = Math.min(1920 - 120 - w, Math.max(120, side === "right" ? x + size * 0.3 : x - w - size * 0.3));
  const top = Math.max(130, y - h - size * 0.8);
  const tail = `M${x} ${y} L${Math.min(Math.max(x + (side === "right" ? 0.4 : -0.4) * size, left + 30), left + w - 30)} ${top + h - 4} L${Math.min(Math.max(x + (side === "right" ? 1.4 : -1.4) * size, left + 30), left + w - 30)} ${top + h - 4}Z`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: fade, transformOrigin: `${x}px ${y}px`, transform: `scale(${s})` }}>
      <path d={tail} fill={PAPER} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={left} y={top} width={w} height={h} rx={h * 0.45} fill={PAPER} stroke={INK} strokeWidth={6} />
      <path d={tail} fill={PAPER} />
      <text x={left + w / 2} y={top + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={INK}>{text}</text>
    </svg>
  );
};

/** A stamped paper tag in screen space (a `> TAG:` line). (x, y) is its top-left corner. */
export const PaperTag: React.FC<{ frame: number; at: number; until?: number; text: string; x: number; y: number; size?: number; tilt?: number; dark?: boolean }> = ({
  frame, at, until, text, x, y, size = 72, tilt = -3, dark,
}) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = popAt(frame, at, 260);
  const fade = until === undefined ? 1 : interpolate(frame, [until - 6, until], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `rotate(${tilt}deg) scale(${mixScale(s)})`, transformOrigin: "left center", opacity: fade,
      background: dark ? INK : PAPER, color: dark ? MUSTARD : INK, border: dark ? `6px solid ${PAPER}` : undefined, fontFamily: FONT,
      fontWeight: 800, fontSize: size, letterSpacing: 2, padding: `${size * 0.14}px ${size * 0.34}px`, borderRadius: 14,
      boxShadow: "0 10px 0 rgba(30,20,10,.3)", whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

/** A stamp lands big and settles. */
const mixScale = (s: number) => 1.6 - 0.6 * s;

/** The soft click under every tick (outside the Stage, so the sound pass keeps it). */
export const Clicks: React.FC<{ at: number[]; volume?: number; file?: string }> = ({ at, volume = 0.5, file = "sfx/click.wav" }) => (
  <>
    {at.filter((f) => f >= 0).map((f, i) => (
      <Sequence key={`${f}-${i}`} from={Math.round(f)} durationInFrames={20}><Audio src={staticFile(file)} volume={volume} /></Sequence>
    ))}
  </>
);

/** A world point on screen through a camera (for bubbles and tags). */
export const onScreen = (cam: Camera, p: { x: number; y: number }) => toScreen(cam, p.x, p.y);

/** Your mug: teal, a wisp of steam. Drawn at the hand, `scale` 1 for a figure of scale 1. */
export const HeroMug: React.FC<{ x: number; y: number; scale: number; tilt?: number; steam?: boolean }> = ({ x, y, scale, tilt = -10, steam = true }) => (
  <g transform={`translate(${x} ${y}) scale(${scale / 4.4}) rotate(${tilt})`}>
    <rect x={-70} y={-90} width={130} height={150} rx={18} fill="#1d9a8f" stroke={INK} strokeWidth={8} />
    <path d="M60 -55 q55 10 0 70" fill="none" stroke={INK} strokeWidth={14} />
    <path d="M60 -55 q55 10 0 70" fill="none" stroke="#1d9a8f" strokeWidth={6} />
    {steam && <path d="M-30 -110 q-20 -30 0 -60 q20 -30 0 -60" fill="none" stroke={PAPER} strokeWidth={8} opacity={0.5} strokeLinecap="round" />}
  </g>
);

/** Your lanyard: a cord round the neck and a card on the chest, in figure-local units. */
export const Lanyard: React.FC<{ f: Placed; swing?: number }> = ({ f, swing = 0 }) => {
  const j = joints(f.pose);
  const top = toWorld(f, { x: j.neck.x, y: j.neck.y + 4 });
  const card = toWorld(f, { x: j.neck.x + 6 + swing * 10, y: j.neck.y + 56 });
  const s = f.scale;
  return (
    <g>
      <path d={`M${top.x - 12 * s} ${top.y} L${card.x} ${card.y - 10 * s} L${top.x + 12 * s} ${top.y}`} fill="none" stroke="#d8344f" strokeWidth={3.5 * s} />
      <rect x={card.x - 11 * s} y={card.y - 10 * s} width={22 * s} height={28 * s} rx={3 * s} fill={PAPER} stroke={INK} strokeWidth={2.5 * s}
        transform={`rotate(${swing * 12} ${card.x} ${card.y - 10 * s})`} />
    </g>
  );
};
