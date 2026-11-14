// Helpers for builder A's beats (Made the Cut, The Rule, A Thousand Tags): where a figure's hands are, arm angles that
// put a hand on a point, the thumbnail's two poses, the timing helper, a pool of shade behind a head, a few far
// walkers on a set layer, and the set's look for the current line's mood. World coordinates, like parts.tsx.
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook, type SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { lastIndex, noise, PASTELS, type Shot } from "../shared";
import { Deep } from "../sets/common";

/** Where a figure stands and how: the numbers you pass to <Figure>. */
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

/** Arm angles that put a hand on a world point (as far as the arm reaches). */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

/** The thumbnail's poses (brand/thumbs/envy): you, chin up, the letter held high in the front hand; Min-jun cheering,
 *  the far fist up, the near arm reaching to pull you into a hug. */
export const SHOW: Pose = { ...STAND, lean: -2, tilt: -6, armF: [78, 74], armB: [-14, 16] };
export const CHEER: Pose = { ...STAND, lean: -6, tilt: -10, armF: [96, 18], armB: [-150, -20] };

/** `at(i, p)`: the frame p of the way through narration line i. */
export const lineAt = (clips: Clip[]) => (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);

/** The mood of the line being spoken. */
export const moodNow = (shot: Shot): MoodName => {
  const i = Math.max(0, lastIndex(shot.clips, (c) => shot.frame >= c.from));
  return (shot.lines[i]?.mood ?? "night") as MoodName;
};

/** The look for a set's lights in the current line's mood. */
export const lookFor = (shot: Shot, lights: SetLight[], cam: Camera) => setLook(lights, moodNow(shot), cam);

/** A soft pool of shadow on the set behind a head, so a bright head stands off a bright set (the thumbnail's Shade). */
export const Shade: React.FC<{ id: string; x: number; y: number; r: number; strength?: number }> = ({ id, x, y, r, strength = 0.9 }) => (
  <g>
    <defs>
      <radialGradient id={`shade-${id}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.4" stopColor="#07080d" stopOpacity={strength} />
        <stop offset="1" stopColor="#07080d" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r * 1.9} fill={`url(#shade-${id})`} />
  </g>
);

/** A few small people walking both ways along a far pavement on a set layer of `depth` (authored at REF): students
 *  going home. `from` is the first frame they show. */
export const Strollers: React.FC<{ cam: Camera; depth: number; frame: number; y: number; scale: number; count?: number; seed?: number; from?: number }> = ({
  cam, depth, frame, y, scale, count = 6, seed = 0, from = 0,
}) => {
  if (frame < from) return null;
  const span = 4200;
  return (
    <Deep cam={cam} depth={depth} flat>
      {Array.from({ length: count }, (_, i) => {
        const facing = (noise(seed + i) > 0.5 ? 1 : -1) as 1 | -1;
        const v = 1.6 + noise(seed + i + 9) * 1.2;
        const x = (((noise(seed + i + 20) * span + facing * (frame - from) * v) % span) + span) % span - 1100;
        return (
          <Figure key={i} x={x} y={y + (i % 3) * 6} scale={scale} facing={facing} pose={walkPose(frame * 0.2 + i * 1.7)}
            head={PASTELS[(seed + i) % PASTELS.length]} coat={i % 2 ? "#2a2d36" : "#3b4a6b"} look={{ x: 0.7, y: 0 }} mouth="flat" time={frame} />
        );
      })}
    </Deep>
  );
};

/** The card's sixty seconds, drawn: a small paper dial whose teal wedge sweeps clockwise from twelve as `p` runs 0..1
 *  (outside review of v4.1: "a visible 60-second fold"). (x, y) is its centre, r its radius, in world units. It is a
 *  prop beside the card, never text. Hidden once `p` passes 1 by more than `linger` (the card has folded). */
export const SixtyDial: React.FC<{ x: number; y: number; r: number; p: number; opacity?: number }> = ({ x, y, r, p, opacity = 1 }) => {
  if (p <= 0 || opacity <= 0) return null;
  const a = Math.min(1, p) * Math.PI * 2;
  const ex = x + r * 0.86 * Math.sin(a), ey = y - r * 0.86 * Math.cos(a);
  const wedge = p >= 0.999
    ? <circle cx={x} cy={y} r={r * 0.86} fill={TEAL} />
    : <path d={`M${x} ${y} L${x} ${y - r * 0.86} A${r * 0.86} ${r * 0.86} 0 ${a > Math.PI ? 1 : 0} 1 ${ex} ${ey}Z`} fill={TEAL} />;
  return (
    <g opacity={opacity}>
      <circle cx={x + r * 0.08} cy={y + r * 0.12} r={r} fill="#000" opacity={0.3} />
      <circle cx={x} cy={y} r={r} fill={PAPER} stroke={INK} strokeWidth={Math.max(3, r * 0.09)} />
      {wedge}
      {[0, 1, 2, 3].map((i) => {
        const t = (i * Math.PI) / 2;
        return <line key={i} x1={x + r * 0.7 * Math.sin(t)} y1={y - r * 0.7 * Math.cos(t)} x2={x + r * 0.95 * Math.sin(t)} y2={y - r * 0.95 * Math.cos(t)}
          stroke={INK} strokeWidth={Math.max(2, r * 0.07)} strokeLinecap="round" />;
      })}
      <line x1={x} y1={y} x2={ex} y2={ey} stroke={INK} strokeWidth={Math.max(2, r * 0.08)} strokeLinecap="round" />
      <circle cx={x} cy={y} r={r * 0.1} fill={INK} />
    </g>
  );
};

/** A paper snap, drawn: short ink strokes flicking out from a point for eight frames from `at` (the card opening, the
 *  bar breaking). World units; `r` is the inner radius the strokes start at. */
export const SnapLines: React.FC<{ frame: number; at: number; x: number; y: number; r: number; count?: number; tilt?: number }> = ({
  frame, at, x, y, r, count = 6, tilt = 0,
}) => {
  const t = (frame - at) / 8;
  if (t < 0 || t > 1) return null;
  return (
    <g opacity={1 - t * t}>
      {Array.from({ length: count }, (_, i) => {
        const a = ((tilt + (i * 360) / count) * Math.PI) / 180;
        const r0 = r * (1 + 0.5 * t), r1 = r * (1.35 + 0.6 * t);
        return <line key={i} x1={x + r0 * Math.cos(a)} y1={y + r0 * Math.sin(a)} x2={x + r1 * Math.cos(a)} y2={y + r1 * Math.sin(a)}
          stroke={INK} strokeWidth={Math.max(3, r * 0.08)} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** v7 (outside review of v6, "intermediate split-flap values are readable as results"): the flaps' run smeared
 *  vertically from `from` to `to`, then crisp on the click at `to` with a small scale punch about (x, y) and a soft rim
 *  of `rim` colour behind the card. Wrap a <Meter> in it (world units). */
export const FlapFx: React.FC<{ id: string; frame: number; from: number; to: number; x: number; y: number; r: number; rim?: string; children: React.ReactNode }> = ({
  id, frame, from, to, x, y, r, rim, children,
}) => {
  const running = frame >= from && frame < to;
  const blur = running ? 7 * Math.min(1, (frame - from + 2) / 4) : 0;
  const d = frame - to;
  const punch = d >= 0 && d < 8 ? 1 + 0.16 * Math.sin(((8 - d) / 8) * Math.PI * 0.5) : 1;
  const glow = rim && frame >= to ? Math.max(0.3, 0.75 - d * 0.03) : 0;
  return (
    <g>
      {blur > 0 && (
        <defs>
          <filter id={`flapfx-${id}`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation={`0.5 ${blur}`} /></filter>
        </defs>
      )}
      {glow > 0 && (
        <>
          <defs>
            <radialGradient id={`flaprim-${id}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.35" stopColor={rim} stopOpacity={1} />
              <stop offset="1" stopColor={rim} stopOpacity={0} />
            </radialGradient>
          </defs>
          <ellipse cx={x} cy={y} rx={r * 2.4} ry={r * 1.2} fill={`url(#flaprim-${id})`} opacity={glow} />
        </>
      )}
      <g filter={blur > 0 ? `url(#flapfx-${id})` : undefined} transform={`translate(${x} ${y}) scale(${punch}) translate(${-x} ${-y})`}>{children}</g>
    </g>
  );
};

/** v7 ("the floating clock can look like literal time"): the card's sixty seconds as a paper strip hung from the card's
 *  bottom edge, its teal bar shrinking to nothing at `end`, folding shut with the card. Same geometry as <Meter>
 *  (x, headY, r, scale); shown from `start`. */
export const TimerStrip: React.FC<{ frame: number; start: number; end: number; p0?: number; x: number; headY: number; r: number; scale?: number; tilt?: number }> = ({
  frame, start, end, p0 = 0.75, x, headY, r, scale = 1, tilt = -3,
}) => {
  if (frame < start || frame >= end + 8) return null;
  const h = r * 1.05 * scale;
  const w = h * 2.5;
  const top = headY - r - h * 1.5;
  const drop = Math.min(1, (frame - start) / 6);
  const close = frame >= end ? 1 - (frame - end) / 8 : 1;
  const left = 1 - (p0 + (1 - p0) * Math.min(1, (frame - start) / Math.max(1, end - start)));
  const y0 = h * 1.02, sh = h * 0.26;
  return (
    <g transform={`translate(${x} ${top}) rotate(${tilt}) scale(1 ${Math.max(0.001, close)})`}>
      <g transform={`translate(0 ${y0}) scale(1 ${drop}) translate(0 ${-y0})`}>
        <rect x={-w * 0.46} y={y0} width={w * 0.92} height={sh} rx={sh * 0.3} fill={PAPER} stroke={INK} strokeWidth={Math.max(3, r * 0.045)} />
        <rect x={-w * 0.46 + sh * 0.2} y={y0 + sh * 0.2} width={Math.max(0, (w * 0.92 - sh * 0.4) * left)} height={sh * 0.6} rx={sh * 0.2} fill={TEAL} />
      </g>
    </g>
  );
};

/** v7 (round 19, the hug gag): a brown square of chocolate smudged on a cheek, with two drag streaks. World units;
 *  (x, y) its centre, s its size. */
export const ChocSmudge: React.FC<{ x: number; y: number; s: number; tilt?: number }> = ({ x, y, s, tilt = -12 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`} opacity={0.9}>
    <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.12} fill="#5a3422" />
    <line x1={-s * 0.1} y1={-s * 0.5} x2={-s * 0.1} y2={s * 0.5} stroke="#3e2216" strokeWidth={s * 0.08} />
    <line x1={-s / 2} y1={s * 0.05} x2={s / 2} y2={s * 0.05} stroke="#3e2216" strokeWidth={s * 0.08} />
    <path d={`M${s / 2} ${-s * 0.3} q${s * 0.35} ${s * 0.05} ${s * 0.5} ${-s * 0.02}`} fill="none" stroke="#5a3422" strokeWidth={s * 0.14} strokeLinecap="round" />
    <path d={`M${s / 2} ${s * 0.25} q${s * 0.25} ${s * 0.04} ${s * 0.38} 0`} fill="none" stroke="#5a3422" strokeWidth={s * 0.1} strokeLinecap="round" />
  </g>
);
