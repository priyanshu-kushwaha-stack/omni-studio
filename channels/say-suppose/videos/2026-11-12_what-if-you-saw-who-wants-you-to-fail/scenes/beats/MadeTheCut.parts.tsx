// Helpers for builder A's beats (Made the Cut, The Rule, A Thousand Tags): where a figure's hands are, arm angles that
// put a hand on a point, the thumbnail's two poses, the timing helper, a pool of shade behind a head, a few far
// walkers on a set layer, and the set's look for the current line's mood. World coordinates, like parts.tsx.
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook, type SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
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
