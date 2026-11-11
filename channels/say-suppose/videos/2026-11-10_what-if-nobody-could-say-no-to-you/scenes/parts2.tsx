// More shared parts (parts.tsx is closed to edits): a seated pose, the phone (a top-down insert and a small one for a
// hand), the fine slip and its torn pieces, the expired ticket, and a flat layer of walking commuters. World
// coordinates, for a <Stage> slot, like parts.tsx. No sound here.
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { MOTHER, BOSS, noise, PASTELS } from "./shared";

/** Sitting on a chair or bench: thighs forward, shins down. Put the figure at y = seatedY(seat top, scale). */
export const CHAIR_SIT: Pose = { ...STAND, armB: [10, 25], armF: [25, 35], legB: [88, -88], legF: [92, -92] };
/** The figure y that puts a CHAIR_SIT hip on a seat top at `seatTop` (the feet then hang 56 x scale below it). */
export const seatedY = (seatTop: number, scale = 1) => seatTop + 112 * scale;

// ------------------------------------------------------------------------------------------------ bodies

/** Where a figure stands and how: the same numbers you pass to <Figure>. */
export interface Body { x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }

/** A figure's shoulder in world coordinates (both arms hang from it). */
export function shoulderAt(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
}

/** A figure's front (or back) hand in world coordinates. */
export function handAt(b: Body, arm: "front" | "back" = "front") {
  const s = shoulderAt(b);
  const [u, f] = arm === "front" ? b.pose.armF : b.pose.armB;
  const a = dir(u), c = dir(u + f);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

/** Arm angles that put a hand on a world point (as far as the arm reaches). Use as pose.armF or pose.armB. */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

/** A peaked cap that sits ABOVE the eyes (the kit's `cap` covers them and reads as sunglasses at close range). Draw
 *  it AFTER the <Figure>, with the same x, y, scale, pose and facing; do not pass the Figure a `cap`. */
export const PeakCap: React.FC<Body & { color: string }> = ({ x, y, scale, pose, facing, color }) => {
  const j = joints(pose);
  const hx = x + j.head.x * scale * facing, hy = y + j.head.y * scale;
  return (
    <g transform={`translate(${hx} ${hy}) rotate(${pose.tilt * facing}) scale(${scale * facing} ${scale})`}>
      <path d="M-44 -24 Q-40 -58 0 -60 Q40 -58 44 -24 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M30 -28 Q58 -30 72 -22 Q56 -16 30 -20 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-44} y={-30} width={78} height={8} rx={3} fill="#e8c23a" />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the phone

export type PhoneMode = "message" | "call" | "off";

/** Ink bars standing for typed words (no letters on screen). `n` bars across `w`, cut at `shown` 0..1. */
const InkBars: React.FC<{ x: number; y: number; w: number; shown: number; seed?: number; h?: number; color?: string }> = ({
  x, y, w, shown, seed = 0, h = 18, color = INK,
}) => {
  const widths = Array.from({ length: 6 }, (_, i) => 0.08 + noise(seed + i) * 0.14);
  const total = widths.reduce((a, b) => a + b, 0) + 0.04 * widths.length;
  let at = 0;
  const end = shown * total;
  return (
    <g>
      {widths.map((wi, i) => {
        const from = at;
        at += wi + 0.04;
        const vis = Math.max(0, Math.min(wi, end - from));
        return vis > 0 ? <rect key={i} x={x + (from / total) * w} y={y} width={(vis / total) * w} height={h} rx={h / 2} fill={color} /> : null;
      })}
    </g>
  );
};

/** The bun-and-shawl icon: your mother's avatar, centred, radius r. */
export const MomIcon: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#3a3550" />
    <circle cx={x - r * 0.3} cy={y - r * 0.45} r={r * 0.22} fill={MOTHER.bun} />
    <circle cx={x} cy={y - r * 0.15} r={r * 0.36} fill={MOTHER.head} />
    <path d={`M${x - r * 0.62} ${y + r * 0.75} Q${x} ${y + r * 0.05} ${x + r * 0.62} ${y + r * 0.75} Z`} fill={MOTHER.shawl} stroke={PAPER} strokeWidth={r * 0.06} />
  </g>
);

/** The boss's avatar: lilac head and a crimson tie. */
const BossIcon: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#3a3550" />
    <circle cx={x} cy={y - r * 0.15} r={r * 0.38} fill={BOSS.head} />
    <path d={`M${x} ${y + r * 0.3} l${r * 0.14} ${r * 0.18} l${-r * 0.14} ${r * 0.45} l${-r * 0.14} ${-r * 0.45}Z`} fill={BOSS.tie} />
  </g>
);

/**
 * The phone seen from straight above, big, for an insert (about 380 x 720 at scale 1), centred at (x, y), held in your
 * mustard hand with the thumb at `thumb` (0..1 across the keyboard; null tucks it at the side).
 *   message: the chat with the boss. `typed` 0..1 is the draft in the box (ink bars, no letters); `sent` puts a sent
 *            message above it with `ticks` (1 or 2); `reply` 0..1 a reply's bars; `dots` three pulsing dots.
 *   call:    an incoming call from your mother (the bun-and-shawl icon), rings pulsing on `frame`.
 */
export const PhoneTop: React.FC<{
  x: number; y: number; scale?: number; frame: number; mode?: PhoneMode; typed?: number; seed?: number; sent?: boolean;
  ticks?: 1 | 2; reply?: number; dots?: boolean; thumb?: { x: number; y: number } | null; cursor?: boolean;
}> = ({ x, y, scale = 1, frame, mode = "message", typed = 0, seed = 0, sent, ticks = 1, reply = 0, dots, thumb = null, cursor = true }) => {
  const W = 380, H = 720, sx = -W / 2 + 22, sw = W - 44, top = -H / 2 + 40, bottom = H / 2 - 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* the hand under the phone */}
      <ellipse cx={-30} cy={H / 2 - 40} rx={W * 0.62} ry={170} fill={MUSTARD} stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={W / 2 - 34} y={-60 + i * 70} width={70} height={46} rx={23} fill={MUSTARD} stroke={INK} strokeWidth={5} />)}
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={46} fill="#1b1d24" stroke={INK} strokeWidth={6} />
      <rect x={sx} y={top} width={sw} height={bottom - top} rx={18} fill={mode === "off" ? "#262a36" : mode === "call" ? "#2f3550" : "#eef1f4"} />
      {mode === "message" && (
        <g>
          <rect x={sx} y={top} width={sw} height={74} rx={18} fill="#d9dee6" />
          <BossIcon x={sx + 46} y={top + 38} r={26} />
          <rect x={sx + 90} y={top + 26} width={110} height={16} rx={8} fill={INK} opacity={0.6} />
          {sent && (
            <g>
              <rect x={sx + sw - 250} y={top + 120} width={230} height={70} rx={20} fill="#bfe6d6" />
              <InkBars x={sx + sw - 232} y={top + 138} w={190} shown={1} seed={seed} h={14} />
              <path d={`M${sx + sw - 70} ${top + 176} l8 8 l14 -16`} fill="none" stroke="#2f7a5a" strokeWidth={4} strokeLinecap="round" />
              {ticks === 2 && <path d={`M${sx + sw - 58} ${top + 176} l8 8 l14 -16`} fill="none" stroke="#2f7a5a" strokeWidth={4} strokeLinecap="round" />}
            </g>
          )}
          {reply > 0 && (
            <g>
              <rect x={sx + 20} y={top + 220} width={170} height={56} rx={20} fill="#ffffff" stroke="#d9dee6" strokeWidth={3} />
              <InkBars x={sx + 36} y={top + 240} w={130} shown={reply} seed={seed + 40} h={14} />
            </g>
          )}
          {dots && (
            <g>
              <rect x={sx + 20} y={top + 220} width={110} height={56} rx={20} fill="#ffffff" stroke="#d9dee6" strokeWidth={3} />
              {[0, 1, 2].map((i) => <circle key={i} cx={sx + 48 + i * 27} cy={top + 248} r={8} fill={INK} opacity={0.3 + 0.6 * Math.max(0, Math.sin(frame / 5 - i * 0.9))} />)}
            </g>
          )}
          {/* the draft box, the send arrow and the keyboard */}
          <rect x={sx + 12} y={bottom - 300} width={sw - 90} height={56} rx={28} fill="#fff" stroke="#c7ccd6" strokeWidth={4} />
          <InkBars x={sx + 34} y={bottom - 281} w={sw - 150} shown={typed} seed={seed} />
          {cursor && Math.floor(frame / 12) % 2 === 0 && <rect x={sx + 36 + (sw - 150) * typed} y={bottom - 288} width={4} height={32} fill={CRIMSON} />}
          <circle cx={sx + sw - 38} cy={bottom - 272} r={28} fill={typed > 0 ? "#1d9a8f" : "#c7ccd6"} />
          <path d={`M${sx + sw - 50} ${bottom - 272} h22 m-9 -9 l9 9 l-9 9`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={sx} y={bottom - 230} width={sw} height={230} rx={18} fill="#d4d8df" />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={sx + 10 + (i % 10) * ((sw - 20) / 10)} y={bottom - 218 + Math.floor(i / 10) * 66} width={(sw - 20) / 10 - 6} height={54} rx={8} fill="#fff" />
          ))}
        </g>
      )}
      {mode === "call" && (
        <g>
          {[0, 1, 2].map((i) => {
            const p = ((frame / 30 + i / 3) % 1);
            return <circle key={i} cx={0} cy={-120} r={90 + p * 110} fill="none" stroke={PAPER} strokeWidth={6} opacity={0.6 * (1 - p)} />;
          })}
          <MomIcon x={0} y={-120} r={90} />
          <circle cx={-90} cy={bottom - 110} r={44} fill={CRIMSON} />
          <circle cx={90} cy={bottom - 110} r={44} fill="#3fbf7f" />
          <path d={`M72 ${bottom - 116} q18 22 36 0`} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          <path d={`M-108 ${bottom - 104} q18 -22 36 0`} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
      {thumb && (
        <g transform={`translate(${sx + thumb.x * sw} ${bottom - 230 + thumb.y * 230})`}>
          <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={12} cy={6} rx={16} ry={22} fill="#f7cf6e" />
        </g>
      )}
    </g>
  );
};

/** A small phone for a hand (Figure `held`), screen toward the face. `lit` lights the screen; `ringing` shakes it. */
export const HandPhone: React.FC<{ frame: number; lit?: boolean; ringing?: boolean; scale?: number }> = ({ frame, lit = true, ringing, scale = 1 }) => (
  <g transform={`scale(${scale}) rotate(${ringing ? Math.sin(frame * 2.2) * 8 : -8}) translate(-6 -40)`}>
    <rect x={-14} y={-4} width={30} height={52} rx={6} fill="#1b1d24" />
    <rect x={-11} y={0} width={24} height={42} rx={3} fill={lit ? "#cfe9f4" : "#3a4150"} />
    {ringing && [0, 1].map((i) => <path key={i} d={`M${22 + i * 10} ${8 - i * 4} q8 14 0 28`} fill="none" stroke={PAPER} strokeWidth={4} strokeLinecap="round" />)}
  </g>
);

// ------------------------------------------------------------------------------------------------ paper

/** The fine slip: a cream paper with ink bars and a crimson stamp ring, centred, tilted. `pieces` 1, 2 or 4 tears it:
 *  the parts drift apart by `spread` (world px). */
export const FineSlip: React.FC<{ x: number; y: number; scale?: number; tilt?: number; pieces?: 1 | 2 | 4; spread?: number }> = ({
  x, y, scale = 1, tilt = 0, pieces = 1, spread = 0,
}) => {
  const W = 120, H = 80;
  const parts = pieces === 1 ? [[0, 0, 1, 1]] : pieces === 2 ? [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] : [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]];
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
      {parts.map(([px, py, pw, ph], i) => {
        const dx = (px + pw / 2 - 0.5) * spread * 2, dy = (py + ph / 2 - 0.5) * spread * 2;
        const rot = pieces === 1 ? 0 : (noise(i + 7) - 0.5) * 24 * Math.min(1, spread / 20);
        const id = `slip-${pieces}-${i}`;
        return (
          <g key={i} transform={`translate(${dx} ${dy}) rotate(${rot} ${(px + pw / 2 - 0.5) * W} ${(py + ph / 2 - 0.5) * H})`}>
            <clipPath id={id}><rect x={-W / 2 + px * W} y={-H / 2 + py * H} width={pw * W} height={ph * H} /></clipPath>
            <g clipPath={`url(#${id})`}>
              <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
              {[0, 1, 2].map((r) => <rect key={r} x={-W / 2 + 12} y={-H / 2 + 14 + r * 18} width={60 - r * 12} height={8} rx={4} fill={INK} opacity={0.6} />)}
              <circle cx={W / 2 - 26} cy={H / 2 - 24} r={16} fill="none" stroke={CRIMSON} strokeWidth={5} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

/** Yesterday's ticket: a small blue card with a crimson cross stamped over its day box. */
export const OldTicket: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-50} y={-30} width={100} height={60} rx={8} fill="#7fa0c4" stroke={INK} strokeWidth={4} />
    <rect x={-40} y={-20} width={36} height={40} rx={4} fill={PAPER} />
    <path d="M-36 -16 L-8 16 M-8 -16 L-36 16" stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />
    <rect x={4} y={-16} width={36} height={8} rx={4} fill={INK} opacity={0.6} />
    <rect x={4} y={0} width={26} height={8} rx={4} fill={INK} opacity={0.6} />
  </g>
);

// ------------------------------------------------------------------------------------------------ people

/** A flat layer of commuters walking across, both ways, wrapping around a span of x. For a crowd that "moves around
 *  you as a flat layer": draw it in the actors' slot (in front of you for near walkers, behind for far ones). */
export const Walkers: React.FC<{
  frame: number; y: number; scale: number; count?: number; seed?: number; speed?: number; from?: number; span?: number;
  smile?: boolean; skip?: (i: number) => boolean;
}> = ({ frame, y, scale, count = 7, seed = 0, speed = 3, from = -400, span = 2700, smile, skip }) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      if (skip?.(i)) return null;
      const dir = (noise(seed + i) > 0.5 ? 1 : -1) as 1 | -1;
      const v = speed * (0.8 + noise(seed + i + 50) * 0.5);
      const x = ((noise(seed + i + 20) * span + dir * frame * v) % span + span) % span + from;
      return (
        <Figure key={i} x={x} y={y + (i % 2) * 10 * scale} scale={scale} facing={dir} pose={walkPose(frame * 0.17 * (v / speed) + i * 1.3)}
          head={PASTELS[(seed + i) % PASTELS.length]} coat={i % 3 === 0 ? "#3f4a5c" : undefined} look={{ x: 0.7, y: 0 }}
          mouth={smile ? "smile" : "flat"} time={frame} />
      );
    })}
  </g>
);
