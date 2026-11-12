// Four in a Hundred in the classroom (kit `classroom`, script v3), the montage that turns at every use: your maths
// teacher draws the curve (62); your face, set (64); week one: you stand and say the mock score, cards over every head,
// three red, him -84 (65); her "Sit down." (66); no notes, no help: a hand out, you shake your head and turn your back
// (67); week one's three red, then week two's nine, him -88 (68); the rival's "What's with you?", still -6 (69-70);
// the room redder, him -91 (76, close at 78); second place, the desk beside you empty (79). The card over your best
// friend is one reading at a time: each folds before the next opens.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { spring } from "remotion";
import { headAt, Meter } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, PASTELS, ramp, TAEHO } from "../shared";
import { Deep } from "../sets/common";
import { FLOOR, KANG_POSE, KX, KY, MsKang, SEAT, seatY } from "./WhosCrimson.Class";
import { armTo, HeadIcon, SetShot } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

const S = 1.15;
const CLASSMATE = { head: PASTELS[2], coat: "#5a6488" } as const;

/** A mock-score sheet for your hand: paper, ink lines, a big red ring. No digits. */
const ScoreSheet: React.FC = () => (
  <g transform="rotate(8) translate(-50 -130)">
    <rect x={0} y={0} width={100} height={130} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={14} y1={24 + i * 20} x2={i === 3 ? 50 : 86} y2={24 + i * 20} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.5} />)}
    <ellipse cx={66} cy={104} rx={26} ry={18} fill="none" stroke={CRIMSON} strokeWidth={6} />
  </g>
);

// ------------------------------------------------------------------------------------------------ the room's cards

/** The far row of heads drawn by the kit classroom (Classroom.tsx): nine at x -100 + 150 i, head centre y 604, on the
 *  depth 0.7 layer. */
const FAR = { depth: 0.7, y: 604, r: 30, x: (i: number) => -100 + i * 150 } as const;

export interface RoomRound { minjun: number; classmate: number; kang: number; far: number[] }
/** Week one: three red (him, the classmate, one at the back). */
export const ROUND_ONE: RoomRound = { minjun: -84, classmate: -44, kang: 41, far: [12, 0, 8, 0, 5, 14, -52, 0, 3] };
/** Week two: nine red. */
export const ROUND_TWO: RoomRound = { minjun: -88, classmate: -58, kang: 41, far: [-45, -30, 6, -60, -38, 0, -72, -25, -50] };
/** The last mock score: the room redder still. */
export const ROUND_THREE: RoomRound = { minjun: -91, classmate: -66, kang: 41, far: [-52, -41, -18, -70, -44, -9, -80, -36, -61] };
/** The rival's reading, from the week-two announcement. */
export const RIVAL_VALUE = -6;

/** When each card of a round snaps open: Min-jun's first, then the room, one after another. */
export function roomTags(at: number) {
  return { minjun: at, classmate: at + 5, kang: at + 9, rival: at + 7, far: FAR_ORDER.map((n) => at + 12 + n * 2) };
}
const FAR_ORDER = [4, 1, 7, 0, 5, 2, 8, 3, 6];

/** The far row's cards, on the far row's own layer (the `far` slot). */
const FarCards: React.FC<{ frame: number; cam: Camera; at: number; until: number; round: RoomRound }> = ({ frame, cam, at, until, round }) => {
  const tags = roomTags(at);
  return (
    <Deep cam={cam} depth={FAR.depth} flat>
      {round.far.map((v, i) => (
        <Meter key={i} frame={frame} at={tags.far[i]} x={FAR.x(i)} headY={FAR.y} r={FAR.r} value={v} until={until} scale={1.15} tilt={i % 2 ? 3 : -3} />
      ))}
    </Deep>
  );
};

// ------------------------------------------------------------------------------------------------ the class

const mh = headAt(SEAT.x[1], seatY, SEAT.scale, SEATED);
const ch = headAt(SEAT.x[0], seatY, SEAT.scale, SEATED);
const kh = headAt(KX, KY, S, KANG_POSE, -1);

/** You at your desk (seat 3): seated, or standing with the score sheet up (`up` 0..1). */
function youAt(up: number, sheet: number) {
  const pose = lerpPose(SEATED, { ...STAND, armF: [mix(20, 132, sheet), mix(30, 10, sheet)] }, up);
  const y = mix(seatY, FLOOR, up);
  return { pose, y, head: headAt(SEAT.x[2], y, SEAT.scale, pose) };
}

/** The classroom with the three of you on the bench and Ms. Kang; every option a shot needs. */
const Room: React.FC<{
  frame: number; cam: Camera; mood: MoodName; board?: "graph" | "diagram" | "blank"; you: ReturnType<typeof youAt>; youFace: object;
  minjun?: { pose?: Pose; face: object } | null; kang?: { pose?: Pose; face: object } | null; far?: React.ReactNode; cards?: React.ReactNode;
  props?: React.ReactNode; classmateFace?: object; classmate?: boolean;
}> = ({ frame, cam, mood, board = "graph", you, youFace, minjun, kang, far, cards, props, classmateFace, classmate = true }) => (
  <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board, drawn: 1 }} far={far}
    behind={
      <>
        {classmate && <Figure {...CLASSMATE} x={SEAT.x[0]} y={seatY} scale={SEAT.scale} pose={SEATED} {...(classmateFace ?? EXPRESSIONS.neutral)}
          look={{ x: 1, y: -0.2 }} blink={blinking(frame, 8)} time={frame} />}
        {minjun && <Figure {...MINJUN} x={SEAT.x[1]} y={seatY} scale={SEAT.scale} pose={minjun.pose ?? SEATED} {...minjun.face} blink={blinking(frame, 2)} time={frame} />}
        {you.y > seatY - 1 && <Figure {...HERO} x={SEAT.x[2]} y={you.y} scale={SEAT.scale} pose={you.pose} {...youFace} blink={blinking(frame, 1)} time={frame} />}
      </>
    }
    actors={
      <>
        {kang && <MsKang frame={frame} face={kang.face} pose={kang.pose} />}
        {props}
        {you.y <= seatY - 1 && <Figure {...HERO} x={SEAT.x[2]} y={you.y} scale={SEAT.scale} pose={you.pose} {...youFace} blink={blinking(frame, 1)} time={frame}
          held={<ScoreSheet />} />}
        {cards}
      </>
    } />
);

/** The near cards of a round: the classmate, your best friend, your maths teacher. */
const NearCards: React.FC<{ frame: number; at: number; until: number; round: RoomRound }> = ({ frame, at, until, round }) => {
  const t = roomTags(at);
  return (
    <>
      <Meter frame={frame} at={t.classmate} x={ch.x - 40} headY={ch.y} r={ch.r} value={round.classmate} until={until} tilt={3} />
      <Meter frame={frame} at={t.minjun} x={mh.x + 30} headY={mh.y} r={mh.r} value={round.minjun} until={until} />
      <Meter frame={frame} at={t.kang} x={kh.x} headY={kh.y} r={kh.r} value={round.kang} until={until} />
    </>
  );
};

const kangLooking = { face: { brows: "none" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0.1 } } };
const minjunPlain = { face: { ...EXPRESSIONS.neutral, look: { x: 1, y: -0.25 } } };

// ------------------------------------------------------------------------------------------------ 62 the curve

const CURVE = "M1350 500 C1480 500 1520 230 1610 230 S1740 500 1870 500";

export const CurveShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const mid = Math.round((k.curve + k.pct) / 2);
  const cam = drift(camAt(frame, [[k.curve, { x: 1000, y: 580, zoom: 1.08 }], [mid, { x: 1150, y: 520, zoom: 1.3 }], [k.pct, { x: 1560, y: 400, zoom: 1.85 }]]), frame, "curve", 3);
  return (
    <Room frame={frame} cam={cam} mood={mood} board="blank" you={youAt(0, 0)} youFace={{ ...EXPRESSIONS.neutral, look: { x: 1, y: -0.3 } }}
      minjun={minjunPlain} kang={{ face: { ...kangLooking.face, look: { x: -0.6, y: -0.2 } } }}
      far={<Deep cam={cam} depth={0.92}><DrawLine d={CURVE} from={k.curve + 6} to={mid + 6} color={INK} width={9} /></Deep>} />
  );
};

// ------------------------------------------------------------------------------------------------ 64 the weapon

export const WeaponShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const y = youAt(0, 0);
  const cam = drift(camAt(frame, [[k.weapon, closeUp(y.head.x + 30, y.head.y, 2.6)], [k.stand, closeUp(y.head.x + 30, y.head.y + 4, 2.95)]]), frame, "weapon", 2);
  const turn = ramp(frame, k.weapon + 18, k.weapon + 28);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} minjun={minjunPlain} kang={kangLooking}
      youFace={{ brows: "angry", lids: mix(0.1, 0.35, turn), mouth: "flat", eyes: 1, look: { x: mix(0.9, -0.8, turn), y: 0.05 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ 65-68 the rooms

type StandView = "stand" | "room" | "read";

/** Line 65: week one. You stand and say it; every head's card snaps open (three red, him -84); you read the room. */
export const StandShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<StandView>(frame, [[0, "stand"], [k.roomTag - 3, "room"], [k.read, "read"]]);
  const y = youAt(ramp(frame, k.up, k.up + 14), ramp(frame, k.up + 12, k.up + 22));
  const cams: Record<StandView, Camera> = {
    stand: camAt(frame, [[k.stand, { x: 960, y: 640, zoom: 1.75 }], [k.roomTag, { x: 960, y: 610, zoom: 1.85 }]]),
    room: camAt(frame, [[k.roomTag - 3, { x: 780, y: 545, zoom: 1.0 }], [k.read, { x: 790, y: 545, zoom: 1.06 }]]),
    read: camAt(frame, [[k.read, closeUp(y.head.x + 20, y.head.y - 20, 2.5)], [k.sit, closeUp(y.head.x + 20, y.head.y - 20, 2.7)]]),
  };
  const cam = drift(cams[view], frame, "stand", 3);
  const scan = Math.sin((frame - k.read) / 9);
  const youFace = view === "read"
    ? { brows: "angry" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: mix(-0.9, 0.4, (scan + 1) / 2), y: 0.15 } }
    : { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.05, look: { x: 0.9, y: -0.1 } };
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} youFace={youFace} kang={kangLooking}
      minjun={{ face: { brows: "flat", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: -0.35 } } }}
      far={<FarCards frame={frame} cam={cam} at={k.roomTag} until={k.week2Tag} round={ROUND_ONE} />}
      cards={<NearCards frame={frame} at={k.roomTag} until={k.week2Tag} round={ROUND_ONE} />} />
  );
};

/** Line 66: your maths teacher, close, her +41 still open: "Sit down." You sit. */
export const SitShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const sit = ramp(frame, k.sit + 12, k.sit + 26);
  const cam = drift(camAt(frame, [[k.sit, closeUp(kh.x - 140, kh.y - 60, 2.0)], [k.chat, closeUp(kh.x - 160, kh.y - 50, 2.1)]]), frame, "sit", 2);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={youAt(1 - sit, 1 - sit)} youFace={{ brows: "raised", lids: 0, mouth: "flat", eyes: 1, look: { x: 0.9, y: -0.1 } }}
      minjun={minjunPlain} kang={{ face: { brows: "angry", lids: 0.2, mouth: frame < k.sit + 24 ? "open" : "flat", eyes: 1, look: { x: 0.95, y: 0.15 } } }}
      cards={<Meter frame={frame} at={roomTags(k.roomTag).kang} x={kh.x} headY={kh.y} r={kh.r} value={ROUND_ONE.kang} until={k.chat} />} />
  );
};

/** Line 68: "Week one, three red." The room with week one's cards still open; then "Week two, nine.": you stand
 *  again, and week two's cards snap open, nine red, him -88. */
export const WeeksShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const two = frame >= k.weekTwo;
  const y = two ? youAt(ramp(frame, k.weekTwo, k.weekTwo + 8), 1) : youAt(0, 0);
  const cam = drift(two
    ? camAt(frame, [[k.weekTwo, { x: 800, y: 560, zoom: 1.08 }], [k.rival, { x: 760, y: 550, zoom: 1.02 }]])
    : camAt(frame, [[k.weekOne, { x: 760, y: 550, zoom: 1.0 }], [k.weekTwo, { x: 770, y: 548, zoom: 1.05 }]]), frame, "weeks", 3);
  const round = two ? ROUND_TWO : ROUND_ONE;
  const at = two ? k.week2Tag : k.roomTag;
  const until = two ? k.redTag : k.week2Tag;
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} youFace={{ brows: "angry", lids: 0.25, mouth: two ? "open" : "flat", eyes: 1, look: { x: -0.6, y: 0.1 } }}
      kang={kangLooking} minjun={{ face: two ? { brows: "sad", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 1, y: -0.3 } } : minjunPlain.face }}
      far={<FarCards frame={frame} cam={cam} at={at} until={until} round={round} />}
      cards={<NearCards frame={frame} at={at} until={until} round={round} />} />
  );
};

/** Line 76: the last mock score, the room redder; him -91. The camera pulls back from you to the whole room. */
export const RedShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const y = youAt(1, 1);
  const cam = drift(camAt(frame, [[k.red, { x: 940, y: 620, zoom: 1.55 }], [k.redTag + 20, { x: 780, y: 545, zoom: 1.0 }], [k.cuts, { x: 760, y: 560, zoom: 1.08 }]]), frame, "red", 3);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} youFace={{ brows: "angry", lids: 0.25, mouth: "flat", eyes: 1, look: { x: -0.7, y: 0.1 } }}
      kang={kangLooking} minjun={{ face: { brows: "sad", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 1, y: -0.3 } } }}
      classmateFace={{ ...EXPRESSIONS.sceptical, look: { x: 1, y: -0.3 } }}
      far={<FarCards frame={frame} cam={cam} at={k.redTag} until={k.cuts} round={ROUND_THREE} />}
      cards={<NearCards frame={frame} at={k.redTag} until={k.cuts} round={ROUND_THREE} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 67, 69-70 at your desk

/** Someone standing in front of your desk, facing you (-1), the front hand held out (for help, for your notes). */
const Asker: React.FC<{ frame: number; who: { head: string; coat: string }; out: number; face: object }> = ({ frame, who, out, face }) => (
  <Figure {...who} x={1200} y={FLOOR} scale={SEAT.scale} facing={-1} pose={{ ...STAND, lean: 6 * out, armF: [mix(15, 84, out), mix(25, 6, out)] }}
    {...face} blink={blinking(frame, 9)} time={frame} />
);
const ASKER_HEAD = headAt(1200, FLOOR, SEAT.scale, { ...STAND, lean: 6 }, -1);

/** A small notebook flat on your desk (side on), its bottom-left at (x, y). */
const Notebook: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-7)`}>
    <rect x={0} y={-16} width={110} height={16} rx={3} fill={TEAL} stroke={INK} strokeWidth={4} />
    <rect x={6} y={-12} width={98} height={6} fill={PAPER} />
  </g>
);

/** "No notes. No help.": the red classmate at your desk, hand out for your notes, week one's -44 still over him. Your
 *  hand flat on the notebook, you shake your head; then you turn your back on him. */
export const HelpShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const turnAt = Math.round(mix(k.notes, k.weekOne, 0.55));
  const turned = frame >= turnAt;
  const shake = turned ? 0 : Math.sin((frame - k.notes) / 2.6) * (frame >= k.notes + 4 ? 1 : 0);
  const book = { x: 990, y: 764 };
  const yBase: Pose = { ...SEATED, lean: 10, tilt: shake * 9 };
  const yPose: Pose = turned
    ? { ...SEATED, armF: [55, 95], armB: [40, 100] }
    : { ...yBase, armF: armTo(SEAT.x[2], seatY, SEAT.scale, yBase, 1, { x: book.x + 40, y: book.y - 26 }) };
  const cam = drift(camAt(frame, [[k.notes, { x: 1080, y: 680, zoom: 1.95 }], [k.weekOne, { x: 1070, y: 675, zoom: 2.1 }]]), frame, "help", 2);
  return (
    <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "graph", drawn: 1 }}
      behind={<Figure {...HERO} x={SEAT.x[2]} y={seatY} scale={SEAT.scale} facing={turned ? -1 : 1} pose={yPose} brows={turned ? "angry" : "flat"}
        lids={0.3} mouth="flat" eyes={1} look={turned ? { x: 0.4, y: 0.4 } : { x: 0.7 + shake * 0.3, y: 0.1 }} blink={blinking(frame, 1)} time={frame} />}
      actors={
        <>
          <Notebook x={book.x} y={book.y} />
          <Asker frame={frame} who={CLASSMATE} out={ramp(frame, k.notes - 6, k.notes + 4)}
            face={turned ? { brows: "sad", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.3 } } : { brows: "raised", lids: 0, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0.2 } }} />
          <Meter frame={frame} at={roomTags(k.roomTag).classmate} x={ASKER_HEAD.x} headY={ASKER_HEAD.y} r={ASKER_HEAD.r} value={ROUND_ONE.classmate} until={k.weekOne} tilt={3} />
        </>
      } />
  );
};

type RivalView = "asks" | "you" | "card";

/** The rival at your desk: "What's with you?"; your face; his week-two card, still -6. */
export const RivalShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<RivalView>(frame, [[0, "asks"], [k.still6, "you"], [Math.round(mix(k.still6, k.store, 0.5)), "card"]]);
  const yh = headAt(SEAT.x[2], seatY, SEAT.scale, SEATED);
  const cams: Record<RivalView, Camera> = {
    asks: camAt(frame, [[k.rival, { x: 1080, y: 640, zoom: 1.9 }], [k.still6, { x: 1100, y: 630, zoom: 2.0 }]]),
    you: closeUp(yh.x + 40, yh.y, 2.7),
    card: camAt(frame, [[Math.round(mix(k.still6, k.store, 0.5)), closeUp(ASKER_HEAD.x, ASKER_HEAD.y - 70, 2.4)], [k.store, closeUp(ASKER_HEAD.x, ASKER_HEAD.y - 75, 2.55)]]),
  };
  const cam = drift(cams[view], frame, "rival", 2);
  const asking = frame < k.still6;
  return (
    <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "graph", drawn: 1 }}
      behind={<Figure {...HERO} x={SEAT.x[2]} y={seatY} scale={SEAT.scale} pose={SEATED} brows={asking ? "raised" : "flat"} lids={asking ? 0 : 0.3} mouth="flat"
        eyes={1} look={{ x: 0.9, y: -0.35 }} blink={blinking(frame, 1)} time={frame} />}
      actors={
        <>
          <Asker frame={frame} who={TAEHO} out={0}
            face={{ brows: "flat", lids: 0.25, mouth: asking ? "open" : "flat", eyes: 1, look: { x: 0.9, y: 0.25 } }} />
          <Meter frame={frame} at={roomTags(k.week2Tag).rival} x={ASKER_HEAD.x} headY={ASKER_HEAD.y} r={ASKER_HEAD.r} value={RIVAL_VALUE} until={k.store} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ 78 him at -91, still open

export const DownShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const slump: Pose = { ...SEATED, lean: 8, tilt: 10, armF: [30, 50] };
  const h = headAt(SEAT.x[1], seatY, SEAT.scale, slump);
  const cam = drift(camAt(frame, [[k.down, closeUp(h.x + 50, h.y - 70, 2.35)], [k.top, closeUp(h.x + 50, h.y - 75, 2.6)]]), frame, "down", 2);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={youAt(1, 1)} youFace={{ ...EXPRESSIONS.determined, look: { x: -0.5, y: 0.1 } }} kang={kangLooking}
      minjun={{ pose: slump, face: { brows: "sad", lids: 0.55, mouth: "frown", eyes: 1, look: { x: 0.6, y: 0.75 } } }}
      cards={<Meter frame={frame} at={roomTags(k.redTag).minjun} x={h.x} headY={h.y} r={h.r} value={-91} until={k.top} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 79 second place

/** The rank list pinned to the board: rows of names as ink bars; you second, with a stamped 2. */
const RankList: React.FC<{ frame: number; at: number; cam: Camera }> = ({ frame, at, cam }) => {
  const thump = frame < at ? 0 : spring({ frame: frame - at, fps: 30, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  return (
    <Deep cam={cam} depth={0.92}>
      <rect x={1352} y={208} width={300} height={316} rx={4} fill="#000" opacity={0.2} />
      <rect x={1340} y={198} width={300} height={316} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, r) => (
        <g key={r}>
          {r === 1
            ? <HeadIcon x={1430} y={248 + 48} r={22} color={HERO.head} tuft mouth="flat" />
            : <circle cx={1430} cy={248 + r * 48} r={14} fill="#c9c2b0" />}
          <rect x={1466} y={240 + r * 48} width={r === 1 ? 150 : 110 + ((r * 37) % 40)} height={14} rx={7} fill={INK} opacity={r === 1 ? 0.8 : 0.4} />
        </g>
      ))}
      <g transform={`translate(1378 296) rotate(-12) scale(${mix(1.8, 1, Math.min(1, thump))})`} opacity={Math.min(1, thump * 1.5)}>
        <circle r={26} fill="none" stroke={CRIMSON} strokeWidth={6} />
        <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={CRIMSON}>2</text>
      </g>
      <circle cx={1490} cy={206} r={9} fill={TEAL} stroke={INK} strokeWidth={3} />
    </Deep>
  );
};

export const TopShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.top, { x: 1500, y: 360, zoom: 2.3 }], [k.pull, { x: 1440, y: 400, zoom: 1.9 }], [k.pull + 40, { x: 900, y: 560, zoom: 1.12 }], [k.end, { x: 880, y: 570, zoom: 1.08 }]]), frame, "top", 3);
  const look = ramp(frame, k.pull + 30, k.pull + 42);
  return (
    <Room frame={frame} cam={cam} mood={mood} board="blank" you={youAt(0, 0)} minjun={null} kang={null}
      youFace={{ brows: look > 0.5 ? "sad" : "none", lids: mix(0.1, 0.4, look), mouth: "flat", eyes: 1, look: { x: mix(0.9, -0.9, look), y: mix(-0.5, 0.3, look) } }}
      far={<RankList frame={frame} at={k.top + 8} cam={cam} />} />
  );
};
