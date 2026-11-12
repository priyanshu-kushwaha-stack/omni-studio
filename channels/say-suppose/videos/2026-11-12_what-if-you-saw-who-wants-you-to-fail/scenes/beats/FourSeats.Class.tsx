// Four in a Hundred in the classroom (kit `classroom`), the montage that turns at every use (script v2.1): your maths
// teacher draws the curve (44); your face, set (46); you stand to say the mock score and cards snap open over every
// head, him -84 (47); you turn away from a red one; a hand out for your notes, you shake your head; the next score, him
// -88 (47); the room redder, him -91 (50, seen close at 52); the rank list with you first and the desk beside you empty
// (53). The card over your best friend is one reading at a time: each folds before the next opens.
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
import { blinking, camAt, current, HERO, MINJUN, mix, PASTELS, ramp } from "../shared";
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
export const ROUND_ONE: RoomRound = { minjun: -84, classmate: -44, kang: 41, far: [-12, 0, 8, -35, -5, 14, -52, 0, -20] };
export const ROUND_TWO: RoomRound = { minjun: -91, classmate: -58, kang: 41, far: [-45, -30, -12, -60, -38, -8, -72, -25, -50] };

/** When each card of a round snaps open: Min-jun's first, then the room, one after another. */
export function roomTags(at: number) {
  return { minjun: at, classmate: at + 5, kang: at + 9, far: FAR_ORDER.map((n) => at + 12 + n * 2) };
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

// ------------------------------------------------------------------------------------------------ 44 the curve

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

// ------------------------------------------------------------------------------------------------ 46 the weapon

export const WeaponShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const y = youAt(0, 0);
  const cam = drift(camAt(frame, [[k.weapon, closeUp(y.head.x + 30, y.head.y, 2.6)], [k.stand, closeUp(y.head.x + 30, y.head.y + 4, 2.95)]]), frame, "weapon", 2);
  const turn = ramp(frame, k.weapon + 18, k.weapon + 28);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} minjun={minjunPlain} kang={kangLooking}
      youFace={{ brows: "angry", lids: mix(0.1, 0.35, turn), mouth: "flat", eyes: 1, look: { x: mix(0.9, -0.8, turn), y: 0.05 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ 47 and 50 the rooms

type StandView = "stand" | "room" | "read";

/** Line 47: you stand and say it; every head's card snaps open (him -84); you read the room. */
export const StandShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<StandView>(frame, [[0, "stand"], [k.roomTag - 3, "room"], [k.read, "read"]]);
  const y = youAt(ramp(frame, k.up, k.up + 14), ramp(frame, k.up + 12, k.up + 22));
  const cams: Record<StandView, Camera> = {
    stand: camAt(frame, [[k.stand, { x: 960, y: 640, zoom: 1.75 }], [k.roomTag, { x: 960, y: 610, zoom: 1.85 }]]),
    room: camAt(frame, [[k.roomTag - 3, { x: 780, y: 545, zoom: 1.0 }], [k.read, { x: 790, y: 545, zoom: 1.06 }]]),
    read: camAt(frame, [[k.read, closeUp(y.head.x + 20, y.head.y - 20, 2.5)], [k.away, closeUp(y.head.x + 20, y.head.y - 20, 2.7)]]),
  };
  const cam = drift(cams[view], frame, "stand", 3);
  const scan = Math.sin((frame - k.read) / 9);
  const youFace = view === "read"
    ? { brows: "angry" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: mix(-0.9, 0.4, (scan + 1) / 2), y: 0.15 } }
    : { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.05, look: { x: 0.9, y: -0.1 } };
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} youFace={youFace} kang={kangLooking}
      minjun={{ face: { brows: "flat", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: -0.35 } } }}
      far={<FarCards frame={frame} cam={cam} at={k.roomTag} until={k.away} round={ROUND_ONE} />}
      cards={<NearCards frame={frame} at={k.roomTag} until={k.away} round={ROUND_ONE} />} />
  );
};

/** Line 50: a later mock score, the room redder; him -91. The camera pulls back from you to the whole room. */
export const RedShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const y = youAt(1, 1);
  const cam = drift(camAt(frame, [[k.red, { x: 940, y: 620, zoom: 1.55 }], [k.redTag + 20, { x: 780, y: 545, zoom: 1.0 }], [k.cuts, { x: 760, y: 560, zoom: 1.08 }]]), frame, "red", 3);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} youFace={{ brows: "angry", lids: 0.25, mouth: "flat", eyes: 1, look: { x: -0.7, y: 0.1 } }}
      kang={kangLooking} minjun={{ face: { brows: "sad", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 1, y: -0.3 } } }}
      classmateFace={{ ...EXPRESSIONS.sceptical, look: { x: 1, y: -0.3 } }}
      far={<FarCards frame={frame} cam={cam} at={k.redTag} until={k.cuts} round={ROUND_TWO} />}
      cards={<NearCards frame={frame} at={k.redTag} until={k.cuts} round={ROUND_TWO} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 47 the two weeks

/** Someone standing in front of your desk, facing you (-1), the front hand held out (for help, for your notes). */
const Asker: React.FC<{ frame: number; who: { head: string; coat: string }; out: number; face: object }> = ({ frame, who, out, face }) => (
  <Figure {...who} x={1200} y={FLOOR} scale={SEAT.scale} facing={-1} pose={{ ...STAND, lean: 6 * out, armF: [mix(15, 84, out), mix(25, 6, out)] }}
    {...face} blink={blinking(frame, 9)} time={frame} />
);
const ASKER_HEAD = headAt(1200, FLOOR, SEAT.scale, { ...STAND, lean: 6 }, -1);

/** "Anyone who goes red, you stop helping.": the red classmate at your desk with a worksheet, his card still open from
 *  the announcement; you turn your back on him. */
export const AwayShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const turned = frame >= k.away + 16;
  const y = { pose: turned ? { ...SEATED, armF: [55, 95] as [number, number], armB: [40, 100] as [number, number] } : SEATED, y: seatY, head: headAt(SEAT.x[2], seatY, SEAT.scale, SEATED) };
  const cam = drift(camAt(frame, [[k.away, { x: 1060, y: 660, zoom: 1.8 }], [k.notes, { x: 1070, y: 670, zoom: 1.95 }]]), frame, "away", 3);
  const tag = roomTags(k.roomTag).classmate;
  return (
    <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "graph", drawn: 1 }}
      behind={<Figure {...HERO} x={SEAT.x[2]} y={seatY} scale={SEAT.scale} facing={turned ? -1 : 1} pose={y.pose}
        brows={turned ? "angry" : "none"} lids={turned ? 0.35 : 0} mouth="flat" eyes={1} look={turned ? { x: 0.4, y: 0.4 } : { x: 0.9, y: -0.2 }}
        blink={blinking(frame, 1)} time={frame} />}
      actors={
        <>
          <Asker frame={frame} who={CLASSMATE} out={ramp(frame, k.away - 4, k.away + 8)}
            face={turned ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.3 } } : { ...EXPRESSIONS.happy, look: { x: 0.95, y: 0.2 } }} />
          <Meter frame={frame} at={tag} x={ASKER_HEAD.x} headY={ASKER_HEAD.y} r={ASKER_HEAD.r} value={ROUND_ONE.classmate} until={k.notes} tilt={3} />
        </>
      } />
  );
};

/** A small notebook flat on your desk (side on), its bottom-left at (x, y). */
const Notebook: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-7)`}>
    <rect x={0} y={-16} width={110} height={16} rx={3} fill={TEAL} stroke={INK} strokeWidth={4} />
    <rect x={6} y={-12} width={98} height={6} fill={PAPER} />
  </g>
);

/** "Stop lending notes.": a hand out for your notes; your hand flat on them; you shake your head. */
export const NotesShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const shake = Math.sin((frame - k.notes) / 2.6) * (1 - ramp(frame, k.notes + 30, k.notes + 40)) * (frame >= k.notes + 6 ? 1 : 0);
  const book = { x: 990, y: 764 };
  const yBase: Pose = { ...SEATED, lean: 10, tilt: shake * 9 };
  const yPose: Pose = { ...yBase, armF: armTo(SEAT.x[2], seatY, SEAT.scale, yBase, 1, { x: book.x + 40, y: book.y - 26 }) };
  const cam = drift(camAt(frame, [[k.notes, { x: 1080, y: 690, zoom: 2.1 }], [k.second, { x: 1080, y: 690, zoom: 2.25 }]]), frame, "notes", 2);
  return (
    <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board: "graph", drawn: 1 }}
      behind={<Figure {...HERO} x={SEAT.x[2]} y={seatY} scale={SEAT.scale} pose={yPose} brows="flat" lids={0.3} mouth="flat" eyes={1}
        look={{ x: 0.7 + shake * 0.3, y: 0.1 }} blink={blinking(frame, 1)} time={frame} />}
      actors={
        <>
          <Notebook x={book.x} y={book.y} />
          <Asker frame={frame} who={{ head: PASTELS[5], coat: "#6d7f8f" }} out={ramp(frame, k.notes - 6, k.notes + 6) * (1 - ramp(frame, k.second - 14, k.second - 4))}
            face={frame >= k.notes + 24 ? { brows: "sad", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.3 } } : { brows: "raised", lids: 0, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0.2 } }} />
        </>
      } />
  );
};

/** The next mock score: close on your best friend; the card snaps open on -88 (the first has long folded). */
export const SecondShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.second - 4, closeUp(mh.x + 50, mh.y - 70, 2.3)], [k.store, closeUp(mh.x + 50, mh.y - 74, 2.5)]]), frame, "second", 2);
  const fall = ramp(frame, k.second + 20, k.second + 30);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={youAt(1, 1)} youFace={{ ...EXPRESSIONS.determined, look: { x: -0.5, y: 0.1 } }} kang={kangLooking}
      minjun={{ face: { brows: fall > 0.5 ? "sad" : "raised", lids: mix(0, 0.4, fall), mouth: fall > 0.5 ? "flat" : "smile", eyes: 1, look: { x: 1, y: -0.3 } } }}
      cards={<Meter frame={frame} at={k.second} x={mh.x} headY={mh.y} r={mh.r} value={-88} until={k.store} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 52 him at -91, still open

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

// ------------------------------------------------------------------------------------------------ 53 the top

/** The rank list pinned to the board: rows of names as ink bars; you first, with a stamped 1. */
const RankList: React.FC<{ frame: number; at: number; cam: Camera }> = ({ frame, at, cam }) => {
  const thump = frame < at ? 0 : spring({ frame: frame - at, fps: 30, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  return (
    <Deep cam={cam} depth={0.92}>
      <rect x={1352} y={208} width={300} height={316} rx={4} fill="#000" opacity={0.2} />
      <rect x={1340} y={198} width={300} height={316} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, r) => (
        <g key={r}>
          {r === 0
            ? <HeadIcon x={1430} y={248} r={22} color={HERO.head} tuft mouth="flat" />
            : <circle cx={1430} cy={248 + r * 48} r={14} fill="#c9c2b0" />}
          <rect x={1466} y={240 + r * 48} width={r === 0 ? 150 : 110 + ((r * 37) % 40)} height={14} rx={7} fill={INK} opacity={r === 0 ? 0.8 : 0.4} />
        </g>
      ))}
      <g transform={`translate(1378 248) rotate(-12) scale(${mix(1.8, 1, Math.min(1, thump))})`} opacity={Math.min(1, thump * 1.5)}>
        <circle r={26} fill="none" stroke={CRIMSON} strokeWidth={6} />
        <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={CRIMSON}>1</text>
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
