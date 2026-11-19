// Who's Red, line 42, "Problem one" in the real classroom (outside review of v6, top 15 #11 and 4:24-4:31: the tiny lanes
// diagram is gone). Five people, big: a stranger on your bench, three strangers in the row behind, and the two of you.
//   "Problem one: ... the ones in your lane.": the class, PROBLEM 1 upper left on the wall (Captions.tsx); you and your
//        best friend side by side, both glancing at each other
//   "the card is useless on strangers,": cards snap open over the four strangers, all grey zeros, and the strangers
//        fade grey
//   "and lethal on friends.": close on the two of you: his card snaps open, -84, while he holds out the bigger half of
//        the bar to you, and as your hand gets there he swaps it for the smaller one and bites the big one, grinning
//        (the laugh: the review's "steal the visibly larger half while his crimson card hangs above him")
import { interpolateColors } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import { Deep } from "../sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { Chocolate, headAt, Meter } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, PASTELS, ramp } from "../shared";
import { MathsBoard, SEAT, seatY } from "./WhosCrimson.Class";
import { armTo, SetShot } from "./WhosCrimson.Common";
import { handAt } from "./WhosCrimson.More";
import type { CrimsonTimes } from "./WhosCrimson.Times";

const GREY = "#c3c5ca";
/** The strangers: one on your bench (seat 0), three in the row behind (a Deep layer). */
const ROW = { depth: 0.84, y: 640, xs: [300, 560, 820], r: 42 } as const;
const ROW_COLOURS = [PASTELS[1], PASTELS[4], PASTELS[7]];

/** When stranger i's card snaps open (0: the one on your bench; 1-3 the row behind). */
export const strangerTagAt = (k: CrimsonTimes, i: number) => k.strangers + 2 + i * 5;
/** When your best friend's card snaps open: -84 lands on "friends". */
export const friendTagAt = (k: CrimsonTimes) => k.friends + 2;

/** The row behind: three busts over a long desk, heads greying with `grey`, their zero cards. */
const StrangerRow: React.FC<{ frame: number; k: CrimsonTimes; cam: Camera; grey: number }> = ({ frame, k, cam, grey }) => (
  <Deep cam={cam} depth={ROW.depth}>
    {ROW.xs.map((x, i) => (
      <g key={i}>
        <rect x={x - 34} y={ROW.y + 24} width={68} height={110} rx={24} fill="#3b3e47" />
        <circle cx={x} cy={ROW.y} r={ROW.r} fill={interpolateColors(grey, [0, 1], [ROW_COLOURS[i], GREY])} stroke={INK} strokeWidth={4} />
        <ellipse cx={x - 13} cy={ROW.y - 4} rx={5} ry={7} fill={INK} />
        <ellipse cx={x + 13} cy={ROW.y - 4} rx={5} ry={7} fill={INK} />
        <path d={`M${x - 10} ${ROW.y + 18} H${x + 10}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Meter frame={frame} at={strangerTagAt(k, i + 1)} x={x} headY={ROW.y} r={ROW.r} value={0} until={k.stepsIn} tilt={i % 2 ? 2 : -2} />
      </g>
    ))}
    <rect x={160} y={ROW.y + 70} width={820} height={30} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
  </Deep>
);

type View = "class" | "strangers" | "friends";

export const ProblemShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<View>(frame, [[0, "class"], [k.strangers, "strangers"], [k.friends, "friends"]]);
  const grey = ramp(frame, k.strangers + 22, k.strangers + 34);
  const f = frame - k.friends;
  const close = view === "friends";
  // the offer and the swap (friends only): out (0-8), held (8-14), the big half yanked back and the small one pushed
  // out (14-20), yours from 22, his bite from 26
  const out = ramp(f, 0, 8) * (1 - ramp(f, 14, 20));
  const swap = ramp(f, 14, 20);
  const yours = f >= 22;
  const mBase: Pose = { ...SEATED, lean: 14 * out };
  const yBase: Pose = { ...SEATED, lean: close ? 10 : 0 };
  const yFacing = 1 as const;
  const mShoulder = headAt(SEAT.x[1], seatY, SEAT.scale, mBase, 1);
  const offer = { x: (SEAT.x[1] + SEAT.x[2]) / 2 + 10, y: mShoulder.y + mShoulder.r + 80 };
  const mouth = { x: mShoulder.x + 30, y: mShoulder.y + 20 };
  const front = armTo(SEAT.x[1], seatY, SEAT.scale, mBase, 1, { x: mix(mouth.x, offer.x - 16, out), y: mix(mouth.y, offer.y, out) });
  const back = armTo(SEAT.x[1], seatY, SEAT.scale, mBase, 1, { x: mix(mShoulder.x + 40, offer.x - 10, swap * (yours ? 0 : 1)), y: mix(mShoulder.y + 150, offer.y + 6, swap * (yours ? 0 : 1)) });
  const mPose: Pose = close ? { ...mBase, armF: front, armB: back } : SEATED;
  const reach = close ? ramp(f, 4, 12) * (1 - ramp(f, 26, 34)) : 0;
  const yArm = armTo(SEAT.x[2], seatY, SEAT.scale, yBase, yFacing, { x: offer.x + 14, y: offer.y + 4 });
  // your near (back) arm reaches across to him; you stay facing the board
  const yPose: Pose = close ? { ...yBase, lean: 0, armB: [mix(SEATED.armB[0], yArm[0], reach), mix(SEATED.armB[1], yArm[1], reach)] } : SEATED;
  const mh = headAt(SEAT.x[1], seatY, SEAT.scale, mPose, 1);
  const yh = headAt(SEAT.x[2], seatY, SEAT.scale, yPose, yFacing);
  const s0 = headAt(SEAT.x[0], seatY, SEAT.scale, SEATED, 1);
  const cams: Record<View, Camera> = {
    class: camAt(frame, [[k.lanes, { x: 780, y: 690, zoom: 1.55 }], [k.strangers, { x: 800, y: 680, zoom: 1.7 }]]),
    strangers: camAt(frame, [[k.strangers, { x: 700, y: 650, zoom: 1.5 }], [k.friends, { x: 710, y: 650, zoom: 1.56 }]]),
    friends: camAt(frame, [[k.friends, closeUp((mh.x + yh.x) / 2, mh.y - 50, 2.15)], [k.stepsIn, closeUp((mh.x + yh.x) / 2, mh.y - 50, 2.3)]]),
  };
  const cam = drift(cams[view], frame, "problem", 2);
  const glance = view === "class" ? ramp(frame, k.lanes + 30, k.lanes + 40) * (1 - ramp(frame, k.lanes + 80, k.lanes + 90)) : 0;
  const mFace = close
    ? f < 14 ? { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: 1, y: 0 } }
      : f < 26 ? { brows: "flat" as const, lids: 0.3, mouth: "smirk" as const, eyes: 1, look: { x: 1, y: 0.2 } }
        : { brows: "raised" as const, lids: 0.2, mouth: f < 34 ? "open" as const : "smile" as const, eyes: 1.05, look: { x: 0.9, y: 0 } }
    : { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: mix(0.95, 1, glance), y: mix(-0.3, 0, glance) } };
  const yFace = close
    ? f < 22 ? { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: -0.9, y: 0.3 } }
      : { brows: "flat" as const, lids: 0.5, mouth: "flat" as const, eyes: 1, look: { x: -0.95, y: 0 } }
    : { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: mix(0.95, -0.95, glance), y: -0.2 } };
  const big = <Chocolate x={0} y={-4} scale={0.85} half="right" tilt={-30} />;
  const mBack = handAt(SEAT.x[1], seatY, SEAT.scale, mPose, 1, "back");
  const yHand = handAt(SEAT.x[2], seatY, SEAT.scale, yPose, yFacing, "back");
  return (
    <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "blank", drawn: 1, farRow: false }}
      far={<><MathsBoard cam={cam} /><StrangerRow frame={frame} k={k} cam={cam} grey={grey} /></>}
      behind={
        <>
          <Figure head={interpolateColors(grey, [0, 1], [PASTELS[2], GREY])} coat="#5a6488" x={SEAT.x[0]} y={seatY} scale={SEAT.scale} pose={SEATED}
            brows="none" lids={0.1} mouth="flat" eyes={1} look={{ x: 1, y: -0.2 }} blink={blinking(frame, 8)} time={frame} />
          <Figure {...MINJUN} x={SEAT.x[1]} y={seatY} scale={SEAT.scale} pose={mPose} {...mFace} blink={blinking(frame, 2)} time={frame}
            held={close ? big : undefined} />
          <Figure {...HERO} x={SEAT.x[2]} y={seatY} scale={SEAT.scale} facing={yFacing} pose={yPose} {...yFace} blink={blinking(frame, 1)} time={frame} />
        </>
      }
      actors={
        <>
          {/* the small half: his back hand pushes it out, then it is yours */}
          {close && swap > 0 && <Chocolate x={yours ? yHand.x : mBack.x} y={(yours ? yHand.y : mBack.y) - 4} scale={0.42} half="left" tilt={20} />}
          <Meter frame={frame} at={strangerTagAt(k, 0)} x={s0.x} headY={s0.y} r={s0.r} value={0} until={k.stepsIn} />
          <Meter frame={frame} at={friendTagAt(k)} x={mh.x} headY={mh.y} r={mh.r} value={-84} until={k.stepsIn + 30} />
        </>
      } />
  );
};
