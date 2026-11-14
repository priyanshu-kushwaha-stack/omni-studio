// Four in a Hundred in the classroom (kit `classroom`, script v3), the montage that turns at every use: your maths
// teacher writes the mock scores up (62; the board carries the ranked list in every shot, not the kit's growth graph); your face, set (64); week one: you stand and say the mock score, cards over every head,
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
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { interpolate } from "remotion";
import { headAt, Meter } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, PASTELS, ramp, TAEHO } from "../shared";
import { Deep } from "../sets/common";
import { FLOOR, KANG_POSE, KX, KY, MsKang, SEAT, seatY } from "./WhosCrimson.Class";
import { armTo, HeadIcon, SetShot } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";
import { MistakeMark } from "./Notebook.Parts";

const S = 1.15;
const CLASSMATE = { head: PASTELS[2], coat: "#5a6488" } as const;

/** A mock-score sheet for your hand: paper, ink lines, and your one wrong answer ringed in red (MistakeMark, the same
 *  mark his notebook copies later). No digits. */
const ScoreSheet: React.FC = () => (
  <g transform="rotate(8) translate(-50 -130)">
    <rect x={0} y={0} width={100} height={130} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={14} y1={24 + i * 20} x2={i === 3 ? 50 : 86} y2={24 + i * 20} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.5} />)}
    <MistakeMark x={58} y={106} scale={0.95} />
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
export const ROUND_TWO: RoomRound = { minjun: -86, classmate: -58, kang: 41, far: [-45, -30, 6, -60, -38, 0, -72, -25, -50] };
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

// ------------------------------------------------------------------------------------------------ the board

/** The mock scores on the whiteboard (outside review of v4.1: in place of the kit's generic growth graph): a ranked
 *  list, a head, a name bar and a score bar per row, the top four bracketed teal and a red line under the fourth; you
 *  fourth, your best friend fifth. With `from`/`to` the rows are written on one by one between those frames. */
const ScoreBoard: React.FC<{ cam: Camera; frame: number; from?: number; to?: number }> = ({ cam, frame, from, to }) => {
  const rows = [PASTELS[0], PASTELS[5], PASTELS[3], HERO.head, MINJUN.head, PASTELS[6]];
  const x0 = 1300, y0 = 232, step = 50;
  const n = rows.length;
  const drawn = (i: number) => (from === undefined || to === undefined ? 1
    : interpolate(frame, [mix(from, to, i / n), mix(from, to, (i + 1) / n)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const bracket = drawn(3);
  return (
    <Deep cam={cam} depth={0.92}>
      {rows.map((c, i) => {
        const d = drawn(i);
        const y = y0 + i * step;
        return (
          <g key={i} opacity={d > 0 ? 1 : 0}>
            <HeadIcon x={x0 + 86} y={y} r={17} color={c} tuft={i === 3} />
            <rect x={x0 + 120} y={y - 6} width={130 * d} height={12} rx={6} fill={INK} opacity={0.5} />
            <rect x={x0 + 280} y={y - 9} width={(270 - i * 30) * d} height={18} rx={6} fill={i < 4 ? TEAL : "#9a9a94"} />
          </g>
        );
      })}
      <g opacity={bracket}>
        <path d={`M${x0 + 58} ${y0 - 22} h-18 V${y0 + 3 * step + 22} h18`} fill="none" stroke={TEAL} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <line x1={x0 + 40} y1={y0 + 3.5 * step} x2={x0 + 580} y2={y0 + 3.5 * step} stroke={CRIMSON} strokeWidth={5} strokeDasharray="16 10" />
      </g>
    </Deep>
  );
};

// ------------------------------------------------------------------------------------------------ the class

export const mh = headAt(SEAT.x[1], seatY, SEAT.scale, SEATED);
const ch = headAt(SEAT.x[0], seatY, SEAT.scale, SEATED);
const kh = headAt(KX, KY, S, KANG_POSE, -1);

/** You at your desk (seat 3): seated, or standing with the score sheet up (`up` 0..1). */
export function youAt(up: number, sheet: number) {
  const pose = lerpPose(SEATED, { ...STAND, armF: [mix(20, 132, sheet), mix(30, 10, sheet)] }, up);
  const y = mix(seatY, FLOOR, up);
  return { pose, y, head: headAt(SEAT.x[2], y, SEAT.scale, pose) };
}

/** The classroom with the three of you on the bench and Ms. Kang; every option a shot needs. */
export const Room: React.FC<{
  frame: number; cam: Camera; mood: MoodName; board?: "graph" | "diagram" | "blank"; you: ReturnType<typeof youAt>; youFace: object;
  minjun?: { pose?: Pose; face: object } | null; kang?: { pose?: Pose; face: object } | null; far?: React.ReactNode; cards?: React.ReactNode;
  props?: React.ReactNode; classmateFace?: object; classmate?: boolean; scores?: React.ReactNode | false;
}> = ({ frame, cam, mood, board = "blank", you, youFace, minjun, kang, far, cards, props, classmateFace, classmate = true, scores }) => (
  <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board, drawn: 1 }}
    far={<>{scores === false ? null : scores ?? <ScoreBoard cam={cam} frame={frame} />}{far}</>}
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

export const kangLooking = { face: { brows: "none" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0.1 } } };
const minjunPlain = { face: { ...EXPRESSIONS.neutral, look: { x: 1, y: -0.25 } } };

// ------------------------------------------------------------------------------------------------ 62 the mock scores

/** "The exam grades on a curve.": your maths teacher at the board, the mock scores going up row by row (no bell curve:
 *  outside review of v4.1); the camera pushes in on the list, and the cut goes to a hundred heads on paper. */
export const CurveShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const mid = Math.round((k.curve + k.pct) / 2);
  const cam = drift(camAt(frame, [[k.curve, { x: 1000, y: 580, zoom: 1.08 }], [mid, { x: 1150, y: 520, zoom: 1.3 }], [k.pct, { x: 1560, y: 400, zoom: 1.85 }]]), frame, "curve", 3);
  return (
    <Room frame={frame} cam={cam} mood={mood} board="blank" you={youAt(0, 0)} youFace={{ ...EXPRESSIONS.neutral, look: { x: 1, y: -0.3 } }}
      minjun={minjunPlain} kang={{ face: { ...kangLooking.face, look: { x: -0.6, y: -0.2 } } }}
      scores={<ScoreBoard cam={cam} frame={frame} from={k.curve + 4} to={mid + 10} />} />
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

// ------------------------------------------------------------------------------------------------ 57-58 people notice

/** Someone standing in front of your desk, facing you (-1). `point` 0..1 raises the front arm to the ceiling. */
export const Asker: React.FC<{ frame: number; who: { head: string; coat: string }; point?: number; face: object; x?: number }> = ({ frame, who, point = 0, face, x = 1200 }) => (
  <Figure {...who} x={x} y={FLOOR} scale={SEAT.scale} facing={-1} pose={{ ...STAND, lean: -4 * point, armF: [mix(15, 128, point), mix(25, 34, point)] }}
    {...face} blink={blinking(frame, 9)} time={frame} />
);
export const ASKER_HEAD = headAt(1200, FLOOR, SEAT.scale, STAND, -1);

/** A little chalk cloud doodle with three drops (the nickname), centred at (x, y), popping in at `at`. Bobs gently. */
export const Cloud: React.FC<{ frame: number; at: number; x: number; y: number; scale?: number }> = ({ frame, at, x, y, scale = 1 }) => {
  if (frame < at) return null;
  const s = scale * Math.min(1, (frame - at) / 6) * (1 + 0.15 * Math.max(0, 1 - (frame - at) / 10));
  const bob = Math.sin((frame - at) / 11) * 5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <path d="M-60 20 Q-84 20 -84 -2 Q-84 -26 -56 -26 Q-52 -56 -18 -56 Q8 -74 34 -50 Q70 -54 72 -20 Q94 -14 88 8 Q84 22 62 20Z"
        fill="#eef1f4" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[-40, 0, 40].map((d, i) => {
        const fall = ((frame - at + i * 9) % 30) / 30;
        return <path key={d} d={`M${d} ${34 + fall * 40} q-8 14 0 18 q8 -4 0 -18z`} fill="#7fb6d8" stroke={INK} strokeWidth={3} opacity={1 - fall} />;
      })}
    </g>
  );
};

/** Line 57: "But people notice. You brag, and you stare at the air above their heads." You on your feet with the sheet,
 *  mouth going, eyes up at the air over everyone; the classmate and your best friend trade a look; Ms. Kang's brows go up. */
export const NoticeShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const y = youAt(1, 1);
  const trade = frame >= Math.round(mix(k.notice, k.nickname, 0.45));
  const cam = drift(camAt(frame, [[k.notice, { x: 760, y: 600, zoom: 1.25 }], [k.nickname, { x: 720, y: 610, zoom: 1.4 }]]), frame, "notice", 3);
  const gab = Math.floor(frame / 5) % 2 === 0;
  const scan = Math.sin((frame - k.notice) / 12);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y}
      youFace={{ brows: "raised", lids: 0, mouth: gab ? "open" : "smirk", eyes: 1, look: { x: scan * 0.8, y: -0.95 } }}
      kang={{ face: { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0 } } }}
      minjun={{ face: { brows: "flat", lids: 0.35, mouth: "flat", eyes: 1, look: trade ? { x: -1, y: 0 } : { x: 1, y: -0.5 } } }}
      classmateFace={{ brows: "raised", lids: 0.2, mouth: trade ? "smirk" : "flat", eyes: 1, look: trade ? { x: 1, y: 0 } : { x: 1, y: -0.4 } }} />
  );
};

/** Line 58: the rival at your desk, pointing at the ceiling with a grin: "Weatherman. Cloudy today?" A chalk cloud
 *  pops over your head; the classmate and your best friend snicker into their hands; you, deadpan. */
export const TaeShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const point = ramp(frame, k.tae - 4, k.tae + 8);
  const cloudAt = Math.round(mix(k.tae, k.taeEnd, 0.55));
  const laugh = frame >= cloudAt + 4;
  const shake = laugh ? Math.sin(frame / 2.2) * 5 : 0;
  const yh = headAt(SEAT.x[2], seatY, SEAT.scale, SEATED);
  const cam = drift(camAt(frame, [[k.tae, { x: 900, y: 600, zoom: 1.5 }], [k.store, { x: 860, y: 610, zoom: 1.38 }]]), frame, "tae", 2);
  const snicker = { brows: "raised" as const, lids: 0.5, mouth: (Math.floor(frame / 4) % 2 ? "open" : "smile") as "open" | "smile", eyes: 1, look: { x: 1, y: -0.2 } };
  return (
    <Room frame={frame} cam={cam} mood={mood} you={youAt(0, 0)}
      youFace={{ brows: "flat", lids: 0.5, mouth: "flat", eyes: 1, look: { x: 0.9, y: -0.2 } }}
      minjun={{ pose: { ...SEATED, tilt: shake * 0.6, armF: laugh ? [150, 30] : SEATED.armF }, face: laugh ? snicker : minjunPlain.face }}
      classmateFace={laugh ? snicker : { ...EXPRESSIONS.neutral, look: { x: 1, y: -0.2 } }}
      props={<Asker frame={frame} who={TAEHO} point={point}
        face={{ brows: "raised", lids: 0.15, mouth: frame < k.taeEnd ? (Math.floor(frame / 5) % 2 ? "open" : "smirk") : "smile", eyes: 1, look: { x: 0.9, y: 0.2 } }} />}
      cards={<Cloud frame={frame} at={cloudAt} x={yh.x - 10} y={yh.y - yh.r - 110} scale={1.1} />} />
  );
};

// ------------------------------------------------------------------------------------------------ Five Hundred, 62-63

/** Line 62: "Then your maths teacher does the worst thing a teacher can do." Ms. Kang at her platform slowly turns her
 *  eyes on you; you sink in your seat. Line 63 "Up.": close on her, the red pen jabbing up. */
export const UpShot: React.FC<{ frame: number; from: number; up: number; to: number; mood: MoodName }> = ({ frame, from, up, to, mood }) => {
  const turn = ramp(frame, from + 20, from + 50);
  const sink = ramp(frame, from + 50, from + 70);
  const close = frame >= up;
  const jab = close ? ramp(frame, up, up + 6) : 0;
  const pose: Pose = { ...KANG_POSE, armF: [mix(36, 125, jab), mix(58, 40, jab)] };
  const cam = drift(close
    ? camAt(frame, [[up, closeUp(kh.x - 60, kh.y - 40, 2.6)], [to, closeUp(kh.x - 60, kh.y - 40, 2.8)]])
    : camAt(frame, [[from, { x: 1150, y: 600, zoom: 1.1 }], [up, { x: 1300, y: 560, zoom: 1.6 }]]), frame, "up", 2);
  const you = youAt(0, 0);
  const youSunk = { ...you, y: you.y + 18 * sink };
  return (
    <Room frame={frame} cam={cam} mood={mood} you={youSunk} youFace={{ brows: "worry", lids: 0.1, mouth: sink > 0.5 ? "wobble" : "flat", eyes: 1.1, look: { x: 1, y: -0.2 } }}
      minjun={minjunPlain}
      kang={{ pose, face: { brows: close ? "flat" : "none", lids: mix(0, 0.35, turn), mouth: close && frame < up + 16 ? "open" : "smirk", eyes: 1, look: { x: mix(-0.6, 0.95, turn), y: 0.1 } } }} />
  );
};
