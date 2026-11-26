// Helpers for builder D's beats (The Notebook, The Country Holds Its Breath, A Text Would Open Nothing): timing from
// the clips, the mood of the line on screen, where a figure's hands are, a dissolve, and the reading room's lamp light.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, SEATED, type Pose } from "@whatif/kit/rig/pose";
import { LookContext, useLook } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import { lastIndex, PASTELS, type Shot } from "../shared";
import { READING, ReadingRoomBack, ReadingRoomMid, readingGlows, withGlows, type ReadingView } from "../sets/ReadingRoom";

/** People in the reading room are drawn at this scale. */
export const S = 1.1;

/** Frames from the narration: `from(i)` line i's first frame, `at(i, p)` p of the way through it, `end(i)` its last. */
export function timer(clips: Clip[]) {
  return {
    from: (i: number) => clips[i].from,
    at: (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p),
    end: (i: number) => clips[i].from + clips[i].frames,
  };
}

/** The mood of the line being spoken (Film lights by it; kit sets draw their windows by it). */
export function moodOf(shot: Shot): MoodName {
  const i = Math.max(0, lastIndex(shot.clips, (c) => shot.frame >= c.from));
  return (shot.lines[i]?.mood ?? "day") as MoodName;
}

/** A figure's placement, for finding its hands. */
export interface Body { x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }

export function shoulderAt(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
}

/** Where a hand is, in world units. */
export function handAt(b: Body, arm: "front" | "back" = "front") {
  const s = shoulderAt(b);
  const [u, f] = arm === "front" ? b.pose.armF : b.pose.armB;
  const a = dir(u), c = dir(u + f);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

/** The arm angles that put a hand on a world point (elbow bends forward). */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

/** A layer of the picture at an opacity (a dissolve is two of these). */
export const Fade: React.FC<{ opacity: number; children: React.ReactNode }> = ({ opacity, children }) =>
  opacity <= 0 ? null : <AbsoluteFill style={{ opacity: Math.min(1, opacity) }}>{children}</AbsoluteFill>;

/** The reading room's lamps glowing through the film's mood. */
export const LampLight: React.FC<{ cam: Camera; view: ReadingView; lit?: number[]; children: React.ReactNode }> = ({ cam, view, lit, children }) => {
  const look = useLook();
  return <LookContext.Provider value={withGlows(look, readingGlows(cam, view, lit))}>{children}</LookContext.Provider>;
};

/** A dark wash over the picture (to set a paper sheet or cards against). */
export const Dim: React.FC<{ amount: number }> = ({ amount }) => (
  <AbsoluteFill style={{ background: "#0d0e14", opacity: amount, pointerEvents: "none" }} />
);

/** Your hand from above: a closed fist with the index finger out, its tip at (x, y), the arm coming from below-right.
 *  `rotate` tilts it (negative leans the finger to the left). */
export const PointingHand: React.FC<{ x: number; y: number; scale?: number; rotate?: number }> = ({ x, y, scale = 1, rotate = -35 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <rect x={-6} y={210} width={104} height={320} fill="#3b3e47" stroke={INK} strokeWidth={5} />
    <rect x={-16} y={0} width={32} height={150} rx={16} fill={MUSTARD} stroke={INK} strokeWidth={5} />
    <rect x={-22} y={110} width={118} height={124} rx={44} fill={MUSTARD} stroke={INK} strokeWidth={5} />
    <path d="M30 128 q12 -8 24 0 M54 134 q12 -8 24 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
    <path d="M-20 150 Q-48 176 -30 214 Q-14 226 2 206 Q4 178 -4 156Z" fill="#e3a62a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-10} y={8} width={20} height={26} rx={9} fill="#f7cf6e" />
  </g>
);

/** Someone else studying at carrel i of the near row, head bent over the desk. */
export const Studier: React.FC<{ i: number; frame: number; head: string; coat: string }> = ({ i, frame, head, coat }) => {
  const c = READING.carrel(i);
  const pose: Pose = { ...SEATED, lean: 16, armF: [78, 22 + Math.sin(frame / 7) * 6], armB: [70, 30] };
  return <Figure x={c.chair} y={READING.seatY(S)} scale={S} pose={pose} head={head} coat={coat} lids={0.55} look={{ x: 0.7, y: 1 }} mouth="flat" time={frame} />;
};

/** The rows view: the room, anyone studying, the desks, and you. */
export const Rows: React.FC<{
  frame: number; cam: Camera; you: React.ReactNode; seated?: React.ReactNode; lit?: number[]; chairOut?: number[]; studiers?: boolean;
  farPeople?: number; notebook?: boolean; extra?: React.ReactNode;
}> = ({ frame, cam, you, seated, lit, chairOut, studiers = true, farPeople, notebook, extra }) => (
  <LampLight cam={cam} view="rows" lit={lit}>
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<ReadingRoomBack cam={cam} view="rows" lit={lit} chairOut={chairOut} farPeople={farPeople} />}
      actors={
        <>
          {studiers && <Studier i={5} frame={frame} head={PASTELS[5]} coat="#4a4f63" />}
          {studiers && <Studier i={0} frame={frame + 40} head={PASTELS[3]} coat="#5a4a63" />}
          {seated}
          <ReadingRoomMid lit={lit} notebook={notebook} extra={extra} />
          {you}
        </>
      } />
  </LampLight>
);

/** Your wrong answer as it was marked on your mock sheet (FourSeats.Class ScoreSheet): a hooked squiggle of an answer
 *  inside a red-pen ring with a tail, and a small red x. The same mark is copied into his notebook (outside review of
 *  v4.1: make one wrong-answer mark recognisably yours). Centred at (x, y); at scale 1 the ring is 52 x 36. */
export const MistakeMark: React.FC<{ x: number; y: number; scale?: number; ink?: string; ring?: number }> = ({ x, y, scale = 1, ink = INK, ring = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M-15 6 C-11 -9 -6 -9 -4 2 S3 11 7 -3 L13 -9" stroke={ink} strokeWidth={4} />
    <g opacity={ring}>
      <path d="M22 -10 A26 18 0 1 0 25 6 L33 13" stroke={CRIMSON} strokeWidth={5} />
      <path d="M29 -24 l9 9 m0 -9 l-9 9" stroke={CRIMSON} strokeWidth={4} />
    </g>
  </g>
);
