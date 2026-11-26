// The Weapon in the classroom (kit `classroom`, script v7), the montage that turns at every use: the two real desks,
// yours fourth and his fifth (52); your face, set (53); you stand and say the mock score, the paper beside your head:
// his card first (-84), your eyes on it; two rows back the rival (-6) sees where you looked; then the room, three red
// (54); her "Sit down." (55); week two's cards over the room, your eyes on his first again, everyone following your
// eyeline up, then a knowing look (57); the rival's "Weatherman. Cloudy today?" and the cloud on "Cloudy" (58). Also
// the shared Room (Second uses it) and Five Hundred's "Up." (UpShot).
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { FONT } from "@whatif/kit/fonts";
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
import { HeadIcon, onLayer, SetShot } from "./WhosCrimson.Common";
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
/** The rival sits in the far row, seat 4 (two rows back); the calculator girl (lilac) in seat 6. */
export const RIVAL_SEAT = 4;
/** Week one: three red (him, the classmate, the rival's -6 at the back). */
export const ROUND_ONE: RoomRound = { minjun: -84, classmate: -44, kang: 41, far: [12, 0, 8, 0, -6, 14, 0, 0, 3] };
/** Week two: nine red (the girl at the back now -30, as on the street). */
export const ROUND_TWO: RoomRound = { minjun: -86, classmate: -58, kang: 41, far: [-45, -22, 6, -60, -6, 0, -30, -25, -50] };
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

/** The rival's face over the kit's far-row head in his seat (same layer, same bob): sage, eyes that move, brows that
 *  come down. `look` -1..1 (left..right), `narrow` 0..1. */
export const RivalFace: React.FC<{ frame: number; cam: Camera; look: number; narrow: number }> = ({ frame, cam, look, narrow }) => {
  const x = FAR.x(RIVAL_SEAT), y = FAR.y + Math.sin(frame / 50 + RIVAL_SEAT) * 2, r = FAR.r + 1;
  const ex = look * r * 0.16;
  return (
    <Deep cam={cam} depth={FAR.depth} flat>
      <circle cx={x} cy={y} r={r} fill={TAEHO.head} stroke={INK} strokeWidth={3} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={x + d * r * 0.34 + ex} cy={y - r * 0.05} rx={r * 0.12} ry={r * mix(0.18, 0.1, narrow)} fill={INK} />
          <line x1={x + d * r * 0.52 + ex * 0.5} y1={y - r * mix(0.42, 0.34, narrow)} x2={x + d * r * 0.16 + ex * 0.5} y2={y - r * mix(0.42, 0.24, narrow)}
            stroke={INK} strokeWidth={r * 0.09} strokeLinecap="round" />
        </g>
      ))}
      <path d={`M${x - r * 0.22} ${y + r * 0.4} H${x + r * 0.22}`} stroke={INK} strokeWidth={r * 0.08} strokeLinecap="round" />
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

/** You at your desk (seat 3): seated, or standing with the score sheet up (`up` 0..1), held out beside your head, never
 *  over your face (outside review of v6, sheets 21 and 29). */
export function youAt(up: number, sheet: number) {
  const pose = lerpPose(SEATED, { ...STAND, armF: [mix(20, 98, sheet), mix(30, 26, sheet)] }, up);
  const y = mix(seatY, FLOOR, up);
  return { pose, y, head: headAt(SEAT.x[2], y, SEAT.scale, pose) };
}

/** The classroom with the three of you on the bench and Ms. Kang; every option a shot needs. */
export const Room: React.FC<{
  frame: number; cam: Camera; mood: MoodName; board?: "graph" | "diagram" | "blank"; you: ReturnType<typeof youAt>; youFace: object;
  minjun?: { pose?: Pose; face: object } | null; kang?: { pose?: Pose; face: object } | null; far?: React.ReactNode; cards?: React.ReactNode;
  props?: React.ReactNode; classmateFace?: object; classmate?: boolean; scores?: React.ReactNode | false;
  rival?: { look: number; narrow: number };
}> = ({ frame, cam, mood, board = "blank", you, youFace, minjun, kang, far, cards, props, classmateFace, classmate = true, scores, rival }) => (
  <SetShot set={classroom} mood={mood} frame={frame} cam={cam} options={{ board, drawn: 1 }}
    far={<>{scores === false ? null : scores ?? <ScoreBoard cam={cam} frame={frame} />}{rival && <RivalFace frame={frame} cam={cam} {...rival} />}{far}</>}
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

// ------------------------------------------------------------------------------------------------ 52 the two desks

/** A folded paper tent on a desk with a big place number. */
const Tent: React.FC<{ x: number; y: number; n: string; color: string; frame: number; at: number }> = ({ x, y, n, color, frame, at }) => {
  if (frame < at) return null;
  const up = ramp(frame, at, at + 6);
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${up})`}>
      <path d="M-46 0 L-36 -78 H36 L46 0Z" fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <text x={0} y={-16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={color}>{n}</text>
    </g>
  );
};

/** Line 52's end (outside review of v6, sheet 20: from the hundred heads to the actual adjacent desks): you and your best
 *  friend side by side, a 4 on your desk and a 5 on his; you glance at him, he grins at the board. */
export const DesksShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const y = youAt(0, 0);
  const cam = drift(camAt(frame, [[k.desks, { x: 800, y: mh.y + 40, zoom: 2.15 }], [k.weapon, { x: 810, y: mh.y + 30, zoom: 2.3 }]]), frame, "desks", 2);
  const glance = ramp(frame, k.desks + 6, k.desks + 12);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} kang={null}
      youFace={{ brows: "flat", lids: 0.25, mouth: "flat", eyes: 1, look: { x: mix(0.9, -0.95, glance), y: 0.05 } }}
      minjun={{ face: { ...EXPRESSIONS.happy, look: { x: 1, y: -0.35 } } }}
      props={<>
        <Tent x={SEAT.x[2] + 170} y={748} n="4" color={TEAL} frame={frame} at={k.desks} />
        <Tent x={SEAT.x[1] + 170} y={748} n="5" color={INK} frame={frame} at={k.desks + 4} />
      </>} />
  );
};

// ------------------------------------------------------------------------------------------------ 53 the weapon

export const WeaponShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const y = youAt(0, 0);
  const cam = drift(camAt(frame, [[k.weapon, closeUp(y.head.x + 30, y.head.y, 2.6)], [k.ammo, closeUp(y.head.x + 30, y.head.y + 4, 2.95)]]), frame, "weapon", 2);
  const turn = ramp(frame, k.weapon + 18, k.weapon + 28);
  const grin = frame >= k.weapon + 40;
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} minjun={minjunPlain} kang={kangLooking}
      youFace={{ brows: grin ? "raised" : "angry", lids: mix(0.1, 0.35, turn), mouth: grin ? "smirk" : "flat", eyes: 1, look: { x: mix(0.9, -0.8, turn), y: 0.05 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ 54 week one

type StandView = "stand" | "friend" | "rival" | "room";

/**
 * Line 54: you stand ("stand up") and say it, the paper beside your head; his card snaps open first and your eyes go to
 * it (-84); two rows back the rival (-6) sees where you looked, eyes from you to him, brows down; then the room, three
 * red, and you read it (outside review of v6, sheet 21: three reactions isolated before the wide).
 */
export const StandShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const t = k.roomTag;
  const view = current<StandView>(frame, [[0, "stand"], [t - 3, "friend"], [t + 24, "rival"], [t + 50, "room"]]);
  const y = youAt(ramp(frame, k.up, k.up + 12), ramp(frame, k.up + 8, k.up + 18));
  const cams: Record<StandView, Camera> = {
    stand: camAt(frame, [[k.stand, { x: 960, y: 640, zoom: 1.75 }], [t, { x: 940, y: 600, zoom: 1.9 }]]),
    friend: camAt(frame, [[t - 3, { x: 780, y: mh.y - 110, zoom: 2.2 }], [t + 24, { x: 770, y: mh.y - 115, zoom: 2.35 }]]),
    rival: camAt(frame, [[t + 24, onLayer(FAR.x(RIVAL_SEAT) + 40, FAR.y - 90, FAR.depth, 3.0)], [t + 50, onLayer(FAR.x(RIVAL_SEAT) + 40, FAR.y - 90, FAR.depth, 3.2)]]),
    room: camAt(frame, [[t + 50, { x: 780, y: 545, zoom: 1.0 }], [k.sit, { x: 790, y: 545, zoom: 1.06 }]]),
  };
  const cam = drift(cams[view], frame, "stand", 3);
  const scan = Math.sin((frame - t - 50) / 9);
  const youFace = view === "room"
    ? { brows: "angry" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: mix(-0.9, 0.4, (scan + 1) / 2), y: 0.15 } }
    : frame >= t - 3 ? { brows: "flat" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: -0.95, y: -0.15 } }
    : { brows: "raised" as const, lids: 0, mouth: Math.floor(frame / 5) % 2 ? "open" as const : "smile" as const, eyes: 1.05, look: { x: 0.9, y: -0.1 } };
  // the rival: on you, then (where you're looking) on him, brows coming down
  const rt = ramp(frame, t + 30, t + 38);
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y} youFace={youFace} kang={kangLooking}
      minjun={{ face: { brows: "flat", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: -0.35 } } }}
      rival={{ look: mix(0.9, 0.2, rt), narrow: ramp(frame, t + 34, t + 44) }}
      far={<FarCards frame={frame} cam={cam} at={t} until={k.sit + 30} round={ROUND_ONE} />}
      cards={view === "rival" ? null : <NearCards frame={frame} at={t} until={k.sit + 30} round={ROUND_ONE} />} />
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

/**
 * Line 57: "But people notice. You brag, and you stare at the air above their heads." Week two (outside review of v6,
 * sheet 22): you on your feet, week two's cards snap open over the room, your eyes on his first (-86), then up at the
 * air over everyone; the faces near you follow your eyeline up, then the classmate and your best friend trade a look,
 * Ms. Kang's brows go up, the rival at the back is watching you; you lower the paper, your eyes still on the air.
 */
export const NoticeShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const mid = Math.round(mix(k.notice, k.nickname, 0.42));
  const wide = frame >= mid;
  const lower = ramp(frame, mid + 30, mid + 44);
  const y = youAt(ramp(frame, k.notice - 4, k.notice + 6), 1 - lower);
  const follow = ramp(frame, k.notice + 30, k.notice + 40);
  const trade = frame >= mid + 14;
  const cam = drift(wide
    ? camAt(frame, [[mid, { x: 780, y: 560, zoom: 1.05 }], [k.nickname, { x: 760, y: 570, zoom: 1.14 }]])
    : camAt(frame, [[k.notice, { x: 800, y: mh.y - 80, zoom: 1.85 }], [mid, { x: 820, y: mh.y - 90, zoom: 1.95 }]]), frame, "notice", 3);
  const gab = Math.floor(frame / 5) % 2 === 0;
  const scan = Math.sin((frame - k.notice) / 10);
  const first = frame < k.week2Tag + 26;
  return (
    <Room frame={frame} cam={cam} mood={mood} you={y}
      youFace={{ brows: "raised", lids: 0, mouth: lower > 0.5 ? "flat" : gab ? "open" : "smirk", eyes: 1, look: first ? { x: -0.95, y: -0.2 } : { x: scan * 0.8, y: -0.95 } }}
      kang={{ face: { brows: trade ? "raised" : "none", lids: 0.1, mouth: "flat", eyes: 1, look: trade ? { x: 0.9, y: 0 } : { x: 0.7, y: -0.8 * follow } } }}
      minjun={{ face: { brows: "sad", lids: 0.35, mouth: trade ? "smirk" : "flat", eyes: 1, look: trade ? { x: -1, y: 0 } : { x: 1, y: mix(-0.3, -0.95, follow) } } }}
      classmateFace={{ brows: "raised", lids: 0.2, mouth: trade ? "smirk" : "flat", eyes: 1, look: trade ? { x: 1, y: 0 } : { x: 1, y: mix(-0.2, -0.95, follow) } }}
      rival={{ look: 0.9, narrow: 0.6 }}
      far={<FarCards frame={frame} cam={cam} at={k.week2Tag} until={k.nickname} round={ROUND_TWO} />}
      cards={<NearCards frame={frame} at={k.week2Tag} until={k.nickname} round={ROUND_TWO} />}
      />
  );
};

/** Line 58: the rival at your desk, pointing at the ceiling with a grin: "Weatherman. Cloudy today?" On "Cloudy" a
 *  chalk cloud pops over your head; the classmate and your best friend snicker into their hands; you, deadpan. */
export const TaeShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const point = ramp(frame, k.tae - 4, k.tae + 8);
  const cloudAt = k.cloudy;
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
