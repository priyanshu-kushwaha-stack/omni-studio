// Who's Red in the classroom (kit `classroom`, script v5): your maths teacher marking at her lectern, +41, never
// looking up (29-31); then why the enemy doesn't care (39-42): the ladder sheet, the rival far off with his head down
// (over your shoulder), your best friend at the next desk looking straight at you, your face, and the lanes. The board
// carries ordinary maths (MathsBoard), not the kit's rising curve, which would show the curve long before it matters
// (outside review of v4.1, 2:27). The desks and the track (37, 39) are in WhosCrimson.Track.tsx. No names on screen.
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, TEAL } from "@whatif/kit/theme";
import { Chocolate, Glasses, headAt, Letter, Meter, Sheet, YourShoulder } from "../parts";
import { blinking, camAt, current, HERO, KANG, MINJUN, mix, PASTELS, ramp, TAEHO } from "../shared";
import { Deep } from "../sets/common";
import { FlatShot, HeadIcon, onLayer, RedPen, SetShot, WoodTop } from "./WhosCrimson.Common";
import type { CrimsonTimes } from "./WhosCrimson.Times";

export const FLOOR = 960;
/** The classroom set's seats (kit Classroom.tsx): bench top 850, seats at x 380, 640, 900; desks over the laps. */
export const SEAT = { top: 850, scale: 1.05, x: [380, 640, 900] } as const;
export const seatY = seatedY(SEAT.top, SEAT.scale);
/** Ms. Kang on the teacher's platform, facing the class. */
export const KX = 1530;
export const KY = FLOOR - 60;
const S = 1.15;
/** Ms. Kang: red pen at her chest, back hand on the board behind her (a raised BACK arm, off her face). */
export const KANG_POSE: Pose = { ...STAND, armF: [36, 58], armB: [-118, -12] };

/** Ms. Kang with her glasses and her red pen. */
export const MsKang: React.FC<{ frame: number; face: object; x?: number; y?: number; pose?: Pose }> = ({ frame, face, x = KX, y = KY, pose = KANG_POSE }) => (
  <>
    <Figure {...KANG} x={x} y={y} scale={S} facing={-1} pose={pose} {...face} blink={blinking(frame, 6)} time={frame} held={<RedPen />} />
    <Glasses x={x} y={y} scale={S} pose={pose} facing={-1} />
  </>
);

/** The classroom set's whiteboard (kit Classroom.tsx: x 1300, y 180, 620 x 360, on a Deep layer at 0.92). */
const BOARD = { x: 1300, y: 180, w: 620, h: 360, depth: 0.92 } as const;

/**
 * An ordinary maths board over the kit's blank one (pass the set `board: "blank"` and this as SetShot's `far`): a right
 * triangle with its right angle and one angle marked, three lines of working, and a boxed answer with a red tick. Ink
 * drawings, no words.
 */
export const MathsBoard: React.FC<{ cam: Camera }> = ({ cam }) => {
  const { x, y } = BOARD;
  const scrawl = (sx: number, sy: number, n: number) =>
    `M${sx} ${sy}` + Array.from({ length: n }, (_, i) => ` q9 ${i % 2 ? 12 : -14} 18 0`).join("");
  return (
    <Deep cam={cam} depth={BOARD.depth}>
      <g fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${x + 70} ${y + 300} V${y + 80} L${x + 270} ${y + 300}Z`} />
        <path d={`M${x + 70} ${y + 270} h30 v30`} strokeWidth={4} />
        <path d={`M${x + 228} ${y + 300} A42 42 0 0 0 ${x + 242} ${y + 268}`} stroke={TEAL} strokeWidth={5} />
        <path d={scrawl(x + 330, y + 90, 9)} strokeWidth={5} />
        <path d={`M${x + 510} ${y + 84} h26 M${x + 510} ${y + 98} h26`} strokeWidth={5} />
        <path d={scrawl(x + 330, y + 150, 7)} strokeWidth={5} />
        <path d={scrawl(x + 360, y + 210, 6)} strokeWidth={5} />
        <rect x={x + 350} y={y + 250} width={140} height={60} rx={6} strokeWidth={5} />
        <path d={scrawl(x + 372, y + 282, 5)} strokeWidth={5} />
        <path d={`M${x + 510} ${y + 276} l16 20 l34 -44`} stroke={CRIMSON} strokeWidth={7} />
      </g>
    </Deep>
  );
};

// ------------------------------------------------------------------------------------------------ 29-31 your maths teacher, marking

const YX = 1190;
const LETTER_UP: [number, number] = [126, 16];

type KangView = "kang" | "good" | "you" | "two";

/** Marking at her lectern: the red pen down on the paper; the back hand stays on the board. */
const MARKING: Pose = { ...KANG_POSE, lean: 8, armF: [62, 34] };

/** Her lectern, in front of her on the platform, with a stack of papers being marked. */
const Lectern: React.FC = () => (
  <g>
    <path d="M1310 782 L1450 770 L1450 792 L1310 804Z" fill="#a87c52" stroke={INK} strokeWidth={4} />
    <rect x={1360} y={792} width={40} height={KY - 792} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
    {[0, 1, 2].map((i) => <rect key={i} x={1330 + i * 3} y={764 - i * 5} width={90} height={10} rx={2} fill="#f3e9d7" stroke={INK} strokeWidth={2} transform={`rotate(-5 1375 ${770 - i * 5})`} />)}
  </g>
);

export const KangShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<KangView>(frame, [[0, "kang"], [k.good, "good"], [k.youKang, "you"], [k.kangTwo, "two"]]);
  const kh = headAt(KX, KY, S, MARKING, -1);
  const lower = ramp(frame, k.kangTwo + 6, k.kangTwo + 20);
  const yPose: Pose = { ...STAND, armF: [mix(LETTER_UP[0], 20, lower), mix(LETTER_UP[1], 30, lower)] };
  const yh = headAt(YX, FLOOR, S, yPose);
  // she never looks up from the marking; "Good." comes with the smallest smile
  const kangFace = view === "good"
    ? { brows: "none" as const, lids: 0.45, mouth: "smile" as const, eyes: 1, look: { x: 0.35, y: 0.9 } }
    : { brows: "flat" as const, lids: 0.45, mouth: "flat" as const, eyes: 1, look: { x: 0.35, y: 0.9 } };
  const smile = ramp(frame, k.youKang + 30, k.youKang + 40);
  const youFace = view === "kang"
    ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.9, y: -0.1 } }
    : view === "you"
      ? { brows: "raised" as const, lids: 0, mouth: smile > 0.5 ? "smile" as const : "o" as const, eyes: mix(1.25, 1.05, smile), look: { x: 0.75, y: -0.7 } }
      : { ...EXPRESSIONS.happy, look: { x: 0.8, y: -0.6 } };
  const cams: Record<KangView, Camera> = {
    kang: camAt(frame, [[k.kang, { x: 1360, y: 610, zoom: 1.45 }], [k.good, { x: 1370, y: 600, zoom: 1.55 }]]),
    // framed high so your head (lower left) clears the MS. KANG tag
    good: camAt(frame, [[k.good, closeUp(kh.x - 30, kh.y + 30, 2.3)], [k.youKang, closeUp(kh.x - 30, kh.y + 30, 2.45)]]),
    you: camAt(frame, [[k.youKang, closeUp(yh.x + 40, yh.y - 20, 2.5)], [k.kangTwo, closeUp(yh.x + 40, yh.y - 25, 2.7)]]),
    two: camAt(frame, [[k.kangTwo, { x: 1360, y: 600, zoom: 1.6 }], [k.mirror, { x: 1350, y: 610, zoom: 1.5 }]]),
  };
  const cam = drift(cams[view], frame, "kang", 3);
  return (
    <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "blank", drawn: 1 }} far={<MathsBoard cam={cam} />}
      behind={
        <>
          <Figure head={PASTELS[2]} coat="#5a6488" x={SEAT.x[0]} y={seatY} scale={SEAT.scale} pose={SEATED} {...EXPRESSIONS.neutral} look={{ x: 1, y: -0.2 }} blink={blinking(frame, 8)} time={frame} />
          <Figure {...MINJUN} x={SEAT.x[1]} y={seatY} scale={SEAT.scale} pose={SEATED} {...EXPRESSIONS.neutral} look={{ x: 1, y: -0.3 }} blink={blinking(frame, 2)} time={frame} />
        </>
      }
      actors={
        <>
          <MsKang frame={frame} face={kangFace} pose={MARKING} />
          <Lectern />
          <Meter frame={frame} at={k.kangTag} x={kh.x} headY={kh.y} r={kh.r} value={41} until={k.mirror} />
          <Figure {...HERO} x={YX} y={FLOOR} scale={S} pose={yPose} {...youFace} blink={blinking(frame, 1)} time={frame}
            held={<Letter x={0} y={8} scale={0.42} tilt={6} />} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the bar on the two desks

/** The halves of one chocolate bar on the two desks, each at the near end of its desk top (the slanted tops of kit
 *  Classroom.tsx's bench desks run from (seat + 70, 770) up to (seat + 220, 750)). */
export const DeskHalves: React.FC = () => (
  <>
    <Chocolate x={SEAT.x[1] + 196} y={741} scale={0.62} half="right" tilt={-8} />
    <Chocolate x={SEAT.x[2] + 92} y={755} scale={0.62} half="left" tilt={-8} />
  </>
);

// ------------------------------------------------------------------------------------------------ 39 the ladder sheet

/** The ladder: seven people on its rungs, you in the middle; the two nearest you are bracketed, the far ones fade. */
export const LadderSheet: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 900, H = 760, step = 92;
  const fade = ramp(frame, k.ladder + 40, k.ladder + 70);
  const heads = [PASTELS[5], PASTELS[1], MINJUN.head, HERO.head, PASTELS[3], PASTELS[7], PASTELS[0]];
  const cam = drift(camAt(frame, [[k.ladder, insert(960, 540, 1.1)], [k.race, insert(960, 540, 1.22)]]), frame, "ladder", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop />} actors={
      <Sheet frame={frame} at={k.ladder - 4} x={960} y={540} w={W} h={H}>
        <line x1={330} y1={30} x2={330} y2={H - 30} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <line x1={570} y1={30} x2={570} y2={H - 30} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        {heads.map((c, i) => {
          const ry = 90 + i * step;
          const near = i >= 2 && i <= 4;
          return (
            <g key={i}>
              <line x1={330} y1={ry} x2={570} y2={ry} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              <HeadIcon x={450} y={ry - 32} r={28} color={c} tuft={i === 3} mouth={i === 3 ? "flat" : undefined} dim={near ? 1 : mix(1, 0.25, fade)} />
            </g>
          );
        })}
        <DrawLine d={`M610 ${90 + 2 * step - 72} h40 V${90 + 4 * step + 8} h-40`} from={k.ladder + 14} to={k.ladder + 40} color={TEAL} width={9} />
        <DrawLine d={`M290 ${90 + 2 * step - 72} h-40 V${90 + 4 * step + 8} h40`} from={k.ladder + 14} to={k.ladder + 40} color={TEAL} width={9} />
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 41-42 the rival, your best friend, your face

/** Tae-ho on a far bench (a Deep layer behind the near desks), head down over his own book. */
const TAEHO_FAR = { x: 1180, seat: 820, scale: 0.9, depth: 0.85 } as const;
const HEAD_DOWN: Pose = { ...SEATED, lean: 18, tilt: 16, armF: [60, 60], armB: [50, 70] };

const FarTaeho: React.FC<{ frame: number; cam: Camera }> = ({ frame, cam }) => {
  const y = seatedY(TAEHO_FAR.seat, TAEHO_FAR.scale);
  return (
    <Deep cam={cam} depth={TAEHO_FAR.depth}>
      <rect x={TAEHO_FAR.x - 120} y={TAEHO_FAR.seat} width={260} height={16} rx={5} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <Figure {...TAEHO} x={TAEHO_FAR.x} y={y} scale={TAEHO_FAR.scale} pose={HEAD_DOWN} brows="flat" lids={0.6} mouth="flat" eyes={1}
        look={{ x: 0.3, y: 0.9 }} blink={blinking(frame, 5)} time={frame} />
      <path d={`M${TAEHO_FAR.x + 60} 735 L${TAEHO_FAR.x + 200} 718 L${TAEHO_FAR.x + 200} 736 L${TAEHO_FAR.x + 60} 752Z`} fill="#a87c52" stroke={INK} strokeWidth={4} />
      <rect x={TAEHO_FAR.x + 180} y={736} width={14} height={110} fill="#6a4630" />
    </Deep>
  );
};

type WhyView = "taeho" | "minjun" | "you";

/** Seated in class: Tae-ho far off, head down; Min-jun at the next desk looking straight at you; your face. */
export const ClassWhy: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<WhyView>(frame, [[0, "taeho"], [k.minjun, "minjun"], [k.youLane, "you"]]);
  const th = headAt(TAEHO_FAR.x, seatedY(TAEHO_FAR.seat, TAEHO_FAR.scale), TAEHO_FAR.scale, HEAD_DOWN);
  const mh = headAt(SEAT.x[1], seatY, SEAT.scale, SEATED);
  const yh = headAt(SEAT.x[2], seatY, SEAT.scale, SEATED);
  const turn = ramp(frame, k.minjun + 20, k.minjun + 30);
  const cams: Record<WhyView, Camera> = {
    taeho: camAt(frame, [[k.taehoFar, onLayer(th.x, th.y + 30, TAEHO_FAR.depth, 2.2)], [k.minjun, onLayer(th.x, th.y + 30, TAEHO_FAR.depth, 2.4)]]),
    minjun: camAt(frame, [[k.minjun, { x: 790, y: 720, zoom: 1.9 }], [k.sameBar, closeUp(mh.x + 60, mh.y + 10, 2.3)]]),
    you: camAt(frame, [[k.youLane, closeUp(yh.x + 30, yh.y, 2.6)], [k.lanes, closeUp(yh.x + 30, yh.y + 5, 2.85)]]),
  };
  const cam = drift(cams[view], frame, "why", 3);
  const youFace = view === "you"
    ? { ...EXPRESSIONS.worried, look: { x: 0.2, y: 0.5 } }
    : { brows: turn > 0.5 ? "raised" as const : "none" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: mix(0.9, -0.9, turn), y: -0.1 } };
  const showNear = view !== "taeho";
  return (
    <>
      <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "blank", drawn: 1 }}
        far={<><MathsBoard cam={cam} />{view === "taeho" && <FarTaeho frame={frame} cam={cam} />}</>}
        behind={showNear ? (
          <>
            <Figure {...MINJUN} x={SEAT.x[1]} y={seatY} scale={SEAT.scale} pose={SEATED} brows="flat" lids={0.1} mouth="flat" eyes={1.05}
              look={{ x: 1, y: -0.05 }} blink={blinking(frame, 2)} time={frame} />
            <Figure {...HERO} x={SEAT.x[2]} y={seatY} scale={SEAT.scale} pose={SEATED} {...youFace} blink={blinking(frame, 1)} time={frame} />
          </>
        ) : null} />
      {/* over your shoulder at him: the edge of your own head and scarf, not the kit's anonymous black head */}
      {view === "taeho" && <YourShoulder side="left" />}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ 42 the lanes

/** Five lanes from above: you and Min-jun neck and neck in two lanes side by side, bracketed in teal; Tae-ho far
 *  back in the outside lane. */
const LaneSheet: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1200, H = 620, lane = 100, top = 60;
  const go = interpolate(frame, [k.lanes, k.stepsIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // the sheet sits lower right: PROBLEM 1 is upper left from 20% into line 42
  const cam = drift(camAt(frame, [[k.lanes, { x: 770, y: 430, zoom: 0.94 }], [k.friends, { x: 760, y: 420, zoom: 1.0 }], [k.stepsIn, { x: 740, y: 410, zoom: 1.08 }]]), frame, "lanes", 2);
  const grey = ramp(frame, k.strangers, k.strangers + 8);
  const red = ramp(frame, k.friends, k.friends + 8);
  const icons: [number, number, string, boolean][] = [[0, 380, PASTELS[0], false], [1, 640, MINJUN.head, true], [2, 660, HERO.head, true], [3, 470, PASTELS[4], false], [4, 230, TAEHO.head, false]];
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={1} />} actors={
      <>
        <Sheet frame={frame} at={k.lanes - 4} x={960} y={540} w={W} h={H} tilt={-1}>
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={60} y1={top + i * lane} x2={W - 60} y2={top + i * lane} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
          ))}
          {icons.map(([l, x, c, near]) => (
            <HeadIcon key={l} x={x + go * (near ? 120 : 40)} y={top + l * lane + lane / 2} r={34} color={c} tuft={c === HERO.head} mouth="flat"
              dim={near ? 1 : 0.4} />
          ))}
          <DrawLine d={`M520 ${top + lane + 4} H940 V${top + 3 * lane - 4} H520 Z`} from={k.lanes + 18} to={k.lanes + 50} color={red > 0.5 ? CRIMSON : TEAL} width={10} />
          {/* "useless on strangers": grey zeros on the far lanes; "lethal on friends": the lane beside you, crimson */}
          {icons.map(([l, x, , near]) => {
            const v = near ? (l === 1 ? red : 0) : grey;
            if (v <= 0 || (near && l !== 1)) return null;
            const cx = x + go * (near ? 120 : 40) + 54, cy = top + l * lane + lane / 2 - 22;
            return (
              <g key={`tag${l}`} transform={`translate(${cx} ${cy}) scale(${(0.6 + 0.4 * v) * 1.5})`} opacity={v}>
                <rect x={0} y={-20} width={near ? 96 : 60} height={40} rx={8} fill={near ? CRIMSON : "#9aa0a8"} stroke={INK} strokeWidth={4} />
                <text x={near ? 48 : 30} y={11} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={28} fill="#fff">{near ? "-84" : "0"}</text>
              </g>
            );
          })}
        </Sheet>
      </>
    } />
  );
};

export const LanesPaper = LaneSheet;
