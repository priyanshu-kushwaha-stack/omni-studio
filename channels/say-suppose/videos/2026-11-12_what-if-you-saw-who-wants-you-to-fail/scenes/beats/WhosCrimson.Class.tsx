// Who's Red in the classroom (kit `classroom`): your maths teacher at the board, +41 (lines 20-22); then why the
// enemy doesn't care (23-27): a top-down insert of two desks and the two halves of a chocolate bar, two paper sheets
// (the ladder of people near your level; two runners from one start line), the rival far off with his head down, your
// best friend at the next desk looking straight at you, your face, and the lanes. No names on screen.
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { INK, TEAL } from "@whatif/kit/theme";
import { Glasses, headAt, Letter, Meter, Sheet } from "../parts";
import { blinking, camAt, current, HERO, KANG, MINJUN, mix, PASTELS, ramp, TAEHO } from "../shared";
import { Deep } from "../sets/common";
import { FlatShot, HeadIcon, onLayer, RedPen, SetShot, TwoDesksTop, WoodTop } from "./WhosCrimson.Common";
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

// ------------------------------------------------------------------------------------------------ 20-22 Ms. Kang

const YX = 1190;
const LETTER_UP: [number, number] = [126, 16];

type KangView = "kang" | "good" | "you" | "two";

export const KangShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<KangView>(frame, [[0, "kang"], [k.good, "good"], [k.youKang, "you"], [k.kangTwo, "two"]]);
  const kh = headAt(KX, KY, S, KANG_POSE, -1);
  const lower = ramp(frame, k.kangTwo + 6, k.kangTwo + 20);
  const yPose: Pose = { ...STAND, armF: [mix(LETTER_UP[0], 20, lower), mix(LETTER_UP[1], 30, lower)] };
  const yh = headAt(YX, FLOOR, S, yPose);
  const kangFace = view === "kang"
    ? { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.95, y: 0.1 } }
    : view === "two"
      ? { brows: "none" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: 0.4, y: 0.6 } }
      : { brows: "none" as const, lids: 0.35, mouth: "smile" as const, eyes: 1, look: { x: 0.95, y: 0.05 } };
  const smile = ramp(frame, k.youKang + 30, k.youKang + 40);
  const youFace = view === "kang"
    ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.9, y: -0.1 } }
    : view === "you"
      ? { brows: "raised" as const, lids: 0, mouth: smile > 0.5 ? "smile" as const : "o" as const, eyes: mix(1.25, 1.05, smile), look: { x: 0.75, y: -0.7 } }
      : { ...EXPRESSIONS.happy, look: { x: 0.8, y: -0.6 } };
  const cams: Record<KangView, Camera> = {
    kang: camAt(frame, [[k.kang, { x: 1360, y: 610, zoom: 1.45 }], [k.good, { x: 1370, y: 600, zoom: 1.55 }]]),
    good: camAt(frame, [[k.good, closeUp(kh.x - 30, kh.y - 70, 2.3)], [k.youKang, closeUp(kh.x - 30, kh.y - 70, 2.45)]]),
    you: camAt(frame, [[k.youKang, closeUp(yh.x + 40, yh.y - 20, 2.5)], [k.kangTwo, closeUp(yh.x + 40, yh.y - 25, 2.7)]]),
    two: camAt(frame, [[k.kangTwo, { x: 1360, y: 600, zoom: 1.6 }], [k.desks, { x: 1350, y: 610, zoom: 1.5 }]]),
  };
  const cam = drift(cams[view], frame, "kang", 3);
  return (
    <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "graph", drawn: 1 }}
      behind={
        <>
          <Figure head={PASTELS[2]} coat="#5a6488" x={SEAT.x[0]} y={seatY} scale={SEAT.scale} pose={SEATED} {...EXPRESSIONS.neutral} look={{ x: 1, y: -0.2 }} blink={blinking(frame, 8)} time={frame} />
          <Figure {...MINJUN} x={SEAT.x[1]} y={seatY} scale={SEAT.scale} pose={SEATED} {...EXPRESSIONS.neutral} look={{ x: 1, y: -0.3 }} blink={blinking(frame, 2)} time={frame} />
        </>
      }
      actors={
        <>
          <MsKang frame={frame} face={kangFace} />
          <Meter frame={frame} at={k.kangTag} x={kh.x} headY={kh.y} r={kh.r} value={41} until={k.desks} />
          <Figure {...HERO} x={YX} y={FLOOR} scale={S} pose={yPose} {...youFace} blink={blinking(frame, 1)} time={frame}
            held={<Letter x={0} y={8} scale={0.42} tilt={6} />} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ 23 the desks

export const DesksInsert: React.FC<{ frame: number; from: number; to: number; mood: MoodName; emptyRight?: boolean; halves?: boolean }> = ({ frame, from, to, mood, emptyRight, halves = true }) => {
  const cam = drift(camAt(frame, [[from, insert(960, 540, 1.22)], [to, insert(960, 550, 1.4)]]), frame, "desks", 2);
  return <FlatShot cam={cam} mood={mood} back={<rect x={-1400} y={-800} width={4800} height={2600} fill="#a9a08e" />}
    actors={<TwoDesksTop x={960} y={540} emptyRight={emptyRight} halves={halves} />} />;
};

// ------------------------------------------------------------------------------------------------ 24-25 paper sheets

/** The ladder: seven people on its rungs, you in the middle; the two nearest you are bracketed, the far ones fade. */
const LadderSheet: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
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

/** Two runners from one start line, you and Min-jun neck and neck toward one seat; a third (Tae-ho) far off on a line
 *  of his own, grey. */
const RaceSheet: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1100, H = 640;
  const run = interpolate(frame, [k.race + 10, k.race + 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const far = interpolate(frame, [k.race + 70, k.race + 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cam = drift(camAt(frame, [[k.race, insert(960, 540, 1.15)], [k.taehoFar, insert(990, 520, 1.3)]]), frame, "race", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={2} />} actors={
      <>
        <Sheet frame={frame} at={k.race - 4} x={960} y={540} w={W} h={H} tilt={1.5}>
          <line x1={130} y1={110} x2={130} y2={420} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <DrawLine d="M170 250 H800" from={k.race + 10} to={k.race + 80} color={INK} width={6} />
          <DrawLine d="M170 360 H785" from={k.race + 10} to={k.race + 80} color={INK} width={6} />
          {/* the seat both want, at the end of the two lines */}
          <g transform="translate(930 260)">
            <rect x={-46} y={-8} width={92} height={18} rx={6} fill={TEAL} stroke={INK} strokeWidth={5} />
            <rect x={-46} y={-96} width={16} height={92} rx={6} fill={TEAL} stroke={INK} strokeWidth={5} />
            <line x1={-36} y1={10} x2={-38} y2={60} stroke={INK} strokeWidth={8} strokeLinecap="round" />
            <line x1={36} y1={10} x2={38} y2={60} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          </g>
          <HeadIcon x={mix(170, 760, run)} y={210} r={34} color={HERO.head} tuft mouth="flat" />
          <HeadIcon x={mix(170, 745, run)} y={320} r={34} color={MINJUN.head} mouth="flat" />
          <g opacity={far}>
            <line x1={260} y1={560} x2={520} y2={560} stroke={INK} strokeWidth={6} strokeLinecap="round" strokeDasharray="4 18" opacity={0.6} />
            <HeadIcon x={300} y={520} r={30} color={TAEHO.head} dim={0.55} mouth="flat" />
          </g>
        </Sheet>
      </>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 26 the rival, your best friend

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
  const turn = ramp(frame, k.minjun + 30, k.minjun + 40);
  const cams: Record<WhyView, Camera> = {
    taeho: camAt(frame, [[k.taehoFar, onLayer(th.x, th.y + 30, TAEHO_FAR.depth, 2.2)], [k.minjun, onLayer(th.x, th.y + 30, TAEHO_FAR.depth, 2.4)]]),
    minjun: camAt(frame, [[k.minjun, { x: 790, y: 720, zoom: 1.9 }], [Math.round(mix(k.minjun, k.youLane, 0.5)), closeUp(mh.x + 60, mh.y + 10, 2.5)], [k.youLane, closeUp(mh.x + 60, mh.y + 10, 2.6)]]),
    you: camAt(frame, [[k.youLane, closeUp(yh.x + 30, yh.y, 2.6)], [k.lanes, closeUp(yh.x + 30, yh.y + 5, 2.85)]]),
  };
  const cam = drift(cams[view], frame, "why", 3);
  const youFace = view === "you"
    ? { ...EXPRESSIONS.worried, look: { x: 0.2, y: 0.5 } }
    : { brows: turn > 0.5 ? "raised" as const : "none" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: mix(0.9, -0.9, turn), y: -0.1 } };
  const showNear = view !== "taeho";
  return (
    <>
      <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "diagram", drawn: 1 }}
        far={view === "taeho" ? <FarTaeho frame={frame} cam={cam} /> : null}
        behind={showNear ? (
          <>
            <Figure {...MINJUN} x={SEAT.x[1]} y={seatY} scale={SEAT.scale} pose={SEATED} brows="flat" lids={0.1} mouth="flat" eyes={1.05}
              look={{ x: 1, y: -0.05 }} blink={blinking(frame, 2)} time={frame} />
            <Figure {...HERO} x={SEAT.x[2]} y={seatY} scale={SEAT.scale} pose={SEATED} {...youFace} blink={blinking(frame, 1)} time={frame} />
          </>
        ) : null} />
      {view === "taeho" && <ForegroundHead x={1740} side="right" blur={18} />}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ 27 the lanes

/** Five lanes from above: you and Min-jun neck and neck in two lanes side by side, bracketed in teal; Tae-ho far
 *  back in the outside lane. */
const LaneSheet: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1200, H = 620, lane = 100, top = 60;
  const go = interpolate(frame, [k.lanes, k.steps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cam = drift(camAt(frame, [[k.lanes, insert(960, 540, 1.12)], [k.steps, insert(1000, 520, 1.3)]]), frame, "lanes", 2);
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
          <DrawLine d={`M520 ${top + lane + 4} H940 V${top + 3 * lane - 4} H520 Z`} from={k.lanes + 18} to={k.lanes + 50} color={TEAL} width={10} />
        </Sheet>
      </>
    } />
  );
};

type PaperView = "desks" | "ladder" | "race";

/** Lines 23-25: the desks from above, then the two sheets. */
export const WhyPaper: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<PaperView>(frame, [[0, "desks"], [k.ladder, "ladder"], [k.race, "race"]]);
  if (view === "desks") return <DesksInsert frame={frame} from={k.desks} to={k.ladder} mood={mood} />;
  if (view === "ladder") return <LadderSheet frame={frame} k={k} mood={mood} />;
  return <RaceSheet frame={frame} k={k} mood={mood} />;
};

export const LanesPaper = LaneSheet;
