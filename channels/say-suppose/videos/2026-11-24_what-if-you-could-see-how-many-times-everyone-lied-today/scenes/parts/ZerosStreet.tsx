// Your street in look C (Zeros): the painted plate `street-day`, a quiet high street in one-point perspective (the
// road vanishes at about (750, 690)). Figures stand on the ground plane: a figure with its feet at y is scaled
// 0.0065 x (y - 690), so the near ones are big and the far ones small. A postman coming toward you, a jogger crossing,
// a woman with a pram on the far pavement and a few walkers far off, each with a dim 0; the jogger's 1. You stand
// close to the lens at the left. Plate world units. No AI images.
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import { runPose, STAND, walkPose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { HERO, PASTELS } from "../shared";
import { ActorLayer, dof } from "./FrameLook";
import { Lanyard, Person, type Placed } from "./FrameKit";
import { PlateScene } from "./Plate";

/** Scale for feet at y on the street's ground plane. */
export const groundScale = (y: number) => Math.max(0.12, 0.0065 * (y - 690));
const on = (x: number, y: number, facing: 1 | -1, pose = STAND): Placed => ({ x, y, scale: groundScale(y), facing, pose });
/** A counter's digit height for a figure: small and dim in a crowd. */
const countSize = (f: Placed) => Math.max(14, Math.min(40, 26 * f.scale));

/** You, close to the lens at the left. */
export const YOU_ST: Placed = { x: 430, y: 1150, scale: 2.95, facing: 1, pose: STAND };

/** Where everyone is `t` frames into the street. */
export function streetPeople(frame: number, t: number) {
  return {
    post: on(760 - t * 0.9, 820 + t * 0.55, -1, walkPose(frame * 0.17)),
    jog: on(300 + t * 6.5, 862, 1, runPose(frame * 0.32)),
    pram: on(1520 - t * 0.7, 752, -1, { ...walkPose(frame * 0.15), armF: [70, 20] }),
    far: [[880, 712, 1], [640, 708, -1], [1180, 716, -1], [1300, 724, 1], [520, 714, 1]].map(([x, y, f], i) =>
      on(x + ((t * 0.5 * f) % 120), y, f as 1 | -1, walkPose(frame * 0.18 + i * 1.7))),
  };
}

export interface YouFace { brows: Brows; mouth: Mouth; eyes?: number; lids?: number }

export const StreetScene: React.FC<{ frame: number; t: number; cam: Camera; r: number; you: YouFace; showYou?: boolean }> = ({ frame, t, cam, r, you, showYou = true }) => {
  const p = streetPeople(frame, t);
  const dim = (f: Placed, base = 0) => ({ base, size: countSize(f), dim: base === 0 });
  return (
    <>
      <PlateScene plate="street-day" cam={cam} mood="day" blur={dof(cam, r)} rimFrom="right"
        actors={
          <>
            {p.far.map((f, i) => <Person key={i} f={f} who={{ head: PASTELS[(i * 3) % PASTELS.length], mouth: "flat" }} frame={frame} id={`far${i}`} count={dim(f)} />)}
            <Person f={p.pram} who={{ head: "#e6a0a0", coat: "#b58fc7", mouth: "smile" }} frame={frame} id="pram" count={dim(p.pram)} />
            <g transform={`translate(${p.pram.x - 150 * p.pram.scale} ${p.pram.y}) scale(${p.pram.scale})`}>
              <path d="M0 -60 h70 q20 0 20 30 v10 h-90Z" fill="#7fa0c4" stroke={INK} strokeWidth={3} />
              <path d="M0 -60 q-10 -30 20 -36 l30 36Z" fill="#5a6488" stroke={INK} strokeWidth={3} />
              {[10, 75].map((w) => <circle key={w} cx={w} cy={-6} r={8} fill={INK} />)}
            </g>
            <Person f={p.jog} who={{ head: "#7fc29b", mouth: "open", look: { x: 1, y: 0 } }} frame={frame} id="jog" count={{ base: 1, size: countSize(p.jog) }} />
            <Person f={p.post} who={{ head: "#d9c26a", coat: "#c0392b", cap: "#2f3a55", mouth: "flat" }} frame={frame} id="post" count={dim(p.post)} />
            <rect x={p.post.x - 75 * p.post.scale} y={p.post.y - 150 * p.post.scale} width={46 * p.post.scale} height={52 * p.post.scale} rx={6 * p.post.scale}
              fill="#8a5c3b" stroke={INK} strokeWidth={3 * p.post.scale} />
          </>
        } />
      {showYou && (
        <ActorLayer cam={cam} mood="day" rimFrom="right">
          <Figure x={YOU_ST.x} y={YOU_ST.y} scale={YOU_ST.scale} pose={YOU_ST.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame} flow={0.3}
            look={{ x: 0.9, y: -0.15 }} {...you} />
          <Lanyard f={YOU_ST} />
        </ActorLayer>
      )}
    </>
  );
};
