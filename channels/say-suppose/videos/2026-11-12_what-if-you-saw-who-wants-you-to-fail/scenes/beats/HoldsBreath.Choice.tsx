// Lines 98-100 of "The Country Holds Its Breath" (HoldsBreath.tsx): the night before the exam, the classroom at dusk.
// Outside review of v4.1 (2026-11-13): "a tiny figure holds a notebook in an empty classroom with almost no visual
// change. The choice and stakes are carried entirely by narration." Now, on the words:
//   98  the classroom: you sit at your desk and open your notebook ("you open your own notebook"); then three inserts
//       of its pages from above: every mistake ringed and crossed in red ("every mistake you made this year"), each fix
//       written in teal and ticked ("and how you fixed it"), the pages riffling under coloured tabs ("the best study
//       guide in your class").
//   99  the two desks, yours and his, with you standing between them: 1st over yours, 2nd over his. You move the
//       notebook onto his desk ("Give it to him"), the tags swap ("he might pass you"); you take it back to yours ("Keep
//       it"), they swap back ("first place stays yours"). Close on you deciding.
//   100 the notebook onto his desk from above, half a chocolate bar on top; you walk out.
import { FONT } from "@whatif/kit/fonts";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Chocolate, headAt } from "../parts";
import { blinking, camAt, HERO, linear, mix, noise, ramp } from "../shared";
import { ArmOver } from "./HerBack.Sister";
import type { HoldsTimes as T } from "./HoldsBreath";
import { DeskTopBack, MistakeBook, MistakeBookSide } from "./HoldsBreath.Parts";
import { aimArm, S, type Body } from "./Notebook.Parts";
import { Stroke } from "./SayItAgain.Pages";

const ROOM_OPTS = { ...classroom.defaults, board: "blank" as const, drawn: 0, farRow: false };
/** His desk (the classroom's third bench desk) and yours (the second): where the notebook lies. */
const HIS_DESK = { x: 1010, y: 765, tilt: -7.6 };
const MY_DESK = { x: 790, y: 769, tilt: -7.6 };
/** Where you stand for the choice: between the two desks, at his seat. */
const AISLE = 900;

const Classroom: React.FC<{ frame: number; cam: Camera; you: React.ReactNode; behind?: React.ReactNode; book?: React.ReactNode; onDesk?: boolean }> = ({
  frame, cam, you, behind, book, onDesk,
}) => {
  const props = { cam, mood: "dusk" as const, frame, options: ROOM_OPTS };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={classroom.Back(props)}
      actors={
        <>
          {behind}
          {classroom.Mid?.(props)}
          {onDesk && (
            <g>
              <MistakeBookSide x={HIS_DESK.x} y={HIS_DESK.y} tilt={HIS_DESK.tilt} />
              <Chocolate x={HIS_DESK.x + 4} y={HIS_DESK.y - 22} scale={0.55} half="left" tilt={HIS_DESK.tilt} />
            </g>
          )}
          {book}
          {you}
        </>
      }
      front={classroom.Front?.(props)} />
  );
};

// ------------------------------------------------------------------------------------------------ 98: the wide

/** You at your own desk the night before, opening the notebook on "open". */
export const EveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const seat = classroom.spots.seat2;
  const body: Body = { x: seat.x, y: seat.y, scale: seat.scale, facing: 1, pose: { ...SEATED, lean: 18 } };
  const open = ramp(frame, k.open, k.open + 10);
  const at = { x: MY_DESK.x - 30, y: MY_DESK.y - 14 };
  body.pose = { ...body.pose, armF: aimArm(body, { x: at.x + mix(10, 60, open), y: at.y - 10 * Math.sin(Math.PI * open) }), armB: aimArm(body, { x: at.x - 20, y: at.y + 2 }) };
  const head = headAt(body.x, body.y, body.scale, body.pose);
  const cam = camAt(frame, [[k.eve, { x: 860, y: 640, zoom: 1.3 }], [k.page1, { x: head.x + 120, y: head.y + 60, zoom: 1.85 }]]);
  const face = { ...EXPRESSIONS.sceptical, lids: 0.3, look: { x: 0.6, y: 0.9 } };
  const book = open < 1
    ? <MistakeBookSide x={MY_DESK.x} y={MY_DESK.y} tilt={MY_DESK.tilt} scale={0.9} />
    : (
      <g transform={`translate(${MY_DESK.x} ${MY_DESK.y}) rotate(${MY_DESK.tilt})`}>
        <rect x={-120} y={-8} width={240} height={8} rx={2} fill={TEAL} stroke={INK} strokeWidth={3} />
        <path d="M-116 -8 Q-60 -18 0 -9 Q60 -18 116 -8 L116 -4 L-116 -4Z" fill={PAPER} stroke={INK} strokeWidth={3} />
      </g>
    );
  return (
    <Classroom frame={frame} cam={drift(cam, frame, "eve", 3)}
      behind={<Figure {...HERO} {...body} {...face} blink={blinking(frame, 2)} time={frame} />}
      book={<>{book}<ArmOver body={body} hand={MUSTARD} /></>} you={null} />
  );
};

// ------------------------------------------------------------------------------------------------ 98: the pages

const line = (x: number, y: number, w: number, color = INK, o = 0.55) => <rect x={x} y={y} width={w} height={12} rx={6} fill={color} opacity={o} />;

/** The open notebook from above on your desk: five worked problems on the left with red marks, the teal fixes on the
 *  right, then pages riffling under coloured tabs. */
const OpenBook: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const riffle = frame >= k.page3 ? Math.floor((frame - k.page3) / 5) : -1;
  const turn = frame >= k.page3 ? ((frame - k.page3) % 5) / 5 : 0;
  const tabs = ["#e8792f", TEAL, MUSTARD, CRIMSON, "#7fa0c4", TEAL, MUSTARD, "#e6a0a0"];
  return (
    <g>
      {/* the page edges under the book: it is thick */}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={392 - i * 4} y={150 + i * 6} width={1136 + i * 8} height={770} rx={14} fill={i === 3 ? "#157a71" : "#e8dfcb"} stroke={INK} strokeWidth={3} />)}
      <rect x={400} y={140} width={560} height={770} rx={10} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={960} y={140} width={560} height={770} rx={10} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={950} y={140} width={20} height={770} fill="#000" opacity={0.1} />
      {/* left: five problems, each marked in red */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          {line(450, 190 + i * 140, 360)}
          {line(450, 222 + i * 140, 220 + noise(i) * 80)}
          {i % 2 === 0
            ? <Stroke d={`M${830} ${190 + i * 140} l52 52 m0 -52 l-52 52`} frame={frame} at={k.page1 + 4 + i * 7} len={5} color={CRIMSON} width={10} />
            : <Stroke d={`M${700} ${206 + i * 140} m-140 0 a140 34 0 1 0 280 0 a140 34 0 1 0 -280 0`} frame={frame} at={k.page1 + 4 + i * 7} len={6} color={CRIMSON} width={7} />}
        </g>
      ))}
      {/* right: the fixes, in teal, each ticked */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Stroke d={`M1010 ${196 + i * 140} h${300 + noise(i + 9) * 80}`} frame={frame} at={k.page2 + i * 5} len={6} color={TEAL} width={12} />
          <Stroke d={`M1010 ${228 + i * 140} h${180 + noise(i + 3) * 90}`} frame={frame} at={k.page2 + i * 5 + 3} len={6} color={TEAL} width={12} />
          <Stroke d={`M1420 ${206 + i * 140} l18 20 l36 -42`} frame={frame} at={k.page2 + i * 5 + 6} len={4} color={TEAL} width={10} />
        </g>
      ))}
      {/* the riffle: a page sweeping over the spine every 5 frames, and the tabs stuck along the edges */}
      {riffle >= 0 && (
        <g transform={`translate(960 0) scale(${Math.cos(Math.PI * turn)} 1) translate(-960 0)`}>
          <rect x={960} y={140} width={560} height={770} rx={10} fill={turn < 0.5 ? PAPER : "#efe6d2"} stroke={INK} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => line(1010, 196 + i * 120, 260 + noise(i + riffle * 7) * 120, riffle % 2 ? TEAL : INK, 0.45))}
        </g>
      )}
      {tabs.map((c, i) => {
        const on = ramp(frame, k.page3 + i * 3, k.page3 + i * 3 + 4);
        if (on <= 0) return null;
        const right = i % 2 === 0;
        const x = right ? 1520 : 520 + i * 110;
        const y = right ? 200 + i * 80 : 140;
        return <rect key={i} x={right ? x - 6 : x} y={right ? y : y - 46 * on} width={right ? 46 * on + 6 : 70} height={right ? 64 : 52} rx={6} fill={c} stroke={INK} strokeWidth={4} />;
      })}
    </g>
  );
};

export const PagesShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.page1, { x: 700, y: 520, zoom: 1.45 }], [k.page2 - 1, { x: 720, y: 530, zoom: 1.5 }], [k.page2, { x: 1220, y: 520, zoom: 1.45 }],
    [k.page3 - 1, { x: 1230, y: 530, zoom: 1.5 }], [k.page3, { x: 980, y: 540, zoom: 1.2 }], [k.choose, { x: 960, y: 540, zoom: 1.0 }]]);
  return <Stage cam={drift(cam, frame, "pages", 3)} radius={0} origin={{ x: 0, y: 0 }} back={<DeskTopBack cam={cam} />} actors={<OpenBook frame={frame} k={k} />} />;
};

// ------------------------------------------------------------------------------------------------ 99: the choice

/** A paper place tag over a desk: 1st (teal) or 2nd (grey). `flip` 0..1 turns it over, showing `next` after halfway. */
const PlaceTag: React.FC<{ x: number; y: number; label: string; next: string; flip: number; pop: number }> = ({ x, y, label, next, flip, pop }) => {
  const text = flip < 0.5 ? label : next;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.abs(Math.cos(Math.PI * flip)) * pop} ${pop})`}>
      <rect x={-62} y={-34} width={130} height={76} rx={12} fill="#000" opacity={0.25} />
      <rect x={-66} y={-38} width={132} height={76} rx={12} fill={PAPER} stroke={INK} strokeWidth={5} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={text === "1st" ? TEAL : "#8a8478"}>{text}</text>
    </g>
  );
};

/** Where the notebook is: on your desk, carried to his on "Give it to him", back to yours on "Keep it". */
function bookAt(frame: number, k: T) {
  const give = ramp(frame, k.choose + 2, k.choose + 16);
  const keep = ramp(frame, k.keep, k.keep + 14);
  const t = give * (1 - keep);
  const lift = Math.sin(Math.PI * (frame < k.keep ? give : keep)) * 70;
  return { x: mix(MY_DESK.x, HIS_DESK.x, t), y: mix(MY_DESK.y, HIS_DESK.y, t) - lift, moving: (give > 0 && give < 1) || (keep > 0 && keep < 1) };
}

export const ChoiceShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const book = bookAt(frame, k);
  const facing: 1 | -1 = book.x >= AISLE ? 1 : -1;
  const body: Body = { x: AISLE, y: 960, scale: S, facing, pose: STAND };
  const near = frame < k.choose + 26 || (frame >= k.keep - 4 && frame < k.keep + 24);
  body.pose = near ? { ...STAND, lean: 6, armF: aimArm(body, { x: book.x - facing * 30, y: book.y - 12 }) } : { ...STAND, armF: [30, 50], armB: [20, 40] };
  // the tags swap on "he might pass you" and swap back on "first place stays yours"
  const inA = frame >= k.pass && frame < k.pass + 10;
  const inB = frame >= k.first && frame < k.first + 10;
  const swapped = (frame >= k.pass + 10 && frame < k.first) || inB; // the state before the flip under way
  const flip = inA ? ramp(frame, k.pass, k.pass + 10) : inB ? ramp(frame, k.first, k.first + 10) : 0;
  const mine = swapped ? "2nd" : "1st", his = swapped ? "1st" : "2nd";
  const pop = ramp(frame, k.choose + 6, k.choose + 14);
  const face = frame < k.keep
    ? { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, eyes: 1.05, look: { x: 0.8, y: 0.6 } }
    : { brows: "flat" as const, lids: 0.25, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.7 } };
  const cam = camAt(frame, [[k.choose, { x: 905, y: 690, zoom: 1.85 }], [k.decide, { x: 905, y: 680, zoom: 2.05 }]]);
  return (
    <Classroom frame={frame} cam={drift(cam, frame, "choice", 3)}
      book={
        <g>
          <MistakeBookSide x={book.x} y={book.y} tilt={MY_DESK.tilt} scale={0.9} />
          {pop > 0 && <PlaceTag x={MY_DESK.x - 20} y={588} label={mine} next={his} flip={flip} pop={pop} />}
          {pop > 0 && <PlaceTag x={HIS_DESK.x + 40} y={588} label={his} next={mine} flip={flip} pop={pop} />}
        </g>
      }
      you={<Figure {...HERO} {...body} {...face} blink={blinking(frame, 2)} time={frame} />} />
  );
};

/** Close on you, the notebook back on your desk: the decision. */
export const DecideShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body: Body = { x: AISLE, y: 960, scale: S, facing: -1, pose: { ...STAND, armF: [30, 50], armB: [20, 40] } };
  const head = headAt(body.x, body.y, S, body.pose, -1);
  const decided = frame >= k.decide + 14;
  const face = decided
    ? { brows: "flat" as const, lids: 0.15, mouth: "flat" as const, eyes: 1.05, look: { x: -0.9, y: 0.2 } }
    : { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.6, y: 0.8 } };
  const cam = camAt(frame, [[k.decide, closeUp(head.x + 30, head.y, 2.6)], [k.leave, closeUp(head.x + 30, head.y, 2.85)]]);
  return (
    <Classroom frame={frame} cam={drift(cam, frame, "decide", 3)}
      book={<MistakeBookSide x={MY_DESK.x} y={MY_DESK.y} tilt={MY_DESK.tilt} scale={0.9} />}
      you={<Figure {...HERO} {...body} {...face} blink={blinking(frame, 2)} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 100

export const LeaveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const slide = ramp(frame, k.leave, k.leave + 18);
  const drop = ramp(frame, k.choc, k.choc + 8);
  const cam = drift(camAt(frame, [[k.leave, insert(960, 560, 1.0)], [k.go, insert(980, 540, 1.12)]]), frame, "leave", 2);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<DeskTopBack cam={cam} />}
      actors={
        <>
          <MistakeBook x={mix(900, 960, slide)} y={mix(1500, 560, slide)} tilt={mix(-14, -4, slide)} />
          {frame >= k.choc && <Chocolate x={1000} y={mix(380, 470, drop)} scale={mix(4.6, 3.8, drop)} half="left" tilt={-16} />}
        </>
      } />
  );
};

export const GoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const walk = linear(frame, k.go, k.gate + 4);
  const x = mix(1175, 640, walk);
  const cam = drift(camAt(frame, [[k.go, { x: 960, y: 620, zoom: 1.15 }], [k.gate, { x: 1000, y: 680, zoom: 1.4 }]]), frame, "go", 2);
  return (
    <Classroom frame={frame} cam={cam} onDesk
      you={<Figure {...HERO} x={x} y={960} scale={S} facing={-1} pose={walkPose(frame * 0.3)} brows="flat" mouth="flat" lids={0.2} look={{ x: 0.8, y: 0.1 }} time={frame} flow={0.2} />} />
  );
};
