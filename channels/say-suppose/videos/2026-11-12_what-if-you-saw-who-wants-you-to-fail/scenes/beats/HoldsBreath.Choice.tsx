// Line 91 of "The Country Holds Its Breath" (HoldsBreath.tsx; v7, outside review of v6): the night before the exam, the
// classroom at dusk. In three beats you come in and set your notebook on his desk; from above it opens on a corrected
// page (the mistake struck in red, the fix in teal) and shuts; you snap a chocolate bar, set the SMALLER half on top,
// hesitate, and swap it for the bigger one ("The bigger half."); close on you eating the small half ("You're
// competitive, not a monster."); your hand rests on the notebook and lets go ("You leave it anyway."); the bigger half
// stands upright and its segments become a ladder's rungs ("he can have the good wood"); a small smile; you walk out.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Chocolate, headAt } from "../parts";
import { blinking, camAt, HERO, linear, mix, ramp } from "../shared";
import type { HoldsTimes as T } from "./HoldsBreath";
import { Bar, Crumbs, LadderInk, OpenBook, SEG, TopHand } from "./HoldsBreath.Choc";
import { DeskTopBack, MistakeBookSide } from "./HoldsBreath.Parts";
import { aimArm, S, type Body } from "./Notebook.Parts";

const ROOM_OPTS = { ...classroom.defaults, board: "blank" as const, drawn: 0, farRow: false };
/** His desk (the classroom's third bench desk): where the notebook lies. */
const HIS_DESK = { x: 1010, y: 765, tilt: -7.6 };
/** Where you stand for the choice: at his seat. */
const AISLE = 900;
/** The notebook on the desk from above: its spine (the cover then lies centred on 960). */
const BOOK = { x: 750, y: 560 };

export const Classroom: React.FC<{ frame: number; cam: Camera; you: React.ReactNode; book?: React.ReactNode; onDesk?: boolean }> = ({
  frame, cam, you, book, onDesk,
}) => {
  const props = { cam, mood: "dusk" as const, frame, options: ROOM_OPTS };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={classroom.Back(props)}
      actors={
        <>
          {classroom.Mid?.(props)}
          {onDesk && (
            <g>
              <MistakeBookSide x={HIS_DESK.x} y={HIS_DESK.y} tilt={HIS_DESK.tilt} />
              <Chocolate x={HIS_DESK.x + 4} y={HIS_DESK.y - 22} scale={0.62} tilt={HIS_DESK.tilt} />
            </g>
          )}
          {book}
          {you}
        </>
      }
      front={classroom.Front?.(props)} />
  );
};

const Desk: React.FC<{ cam: Camera; children: React.ReactNode }> = ({ cam, children }) => (
  <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<DeskTopBack cam={cam} />} actors={<>{children}</>} />
);

// ------------------------------------------------------------------------------------------------ in, and the notebook

/** "The night before, you leave your own notebook on his desk.": in, along the desks, and down it goes. */
export const PlaceShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const arrive = Math.round(mix(k.place, k.open, 0.5));
  const walk = linear(frame, k.place, arrive);
  const x = mix(560, AISLE, walk);
  const down = ramp(frame, arrive + 2, k.open - 10);
  const body: Body = { x, y: 960, scale: S, facing: 1, pose: walk < 1 ? walkPose(frame * 0.3) : STAND };
  const bookAt = { x: mix(x + 60, HIS_DESK.x, down), y: mix(800, HIS_DESK.y, down) };
  if (walk >= 1) body.pose = { ...STAND, lean: 8, armF: aimArm(body, { x: bookAt.x - 30, y: bookAt.y - 10 }) };
  const cam = drift(camAt(frame, [[k.place, { x: 820, y: 660, zoom: 1.45 }], [arrive, { x: 950, y: 690, zoom: 1.7 }]]), frame, "place", 2);
  return (
    <Classroom frame={frame} cam={cam}
      book={<MistakeBookSide x={bookAt.x} y={bookAt.y} tilt={mix(0, HIS_DESK.tilt, down)} scale={0.9} />}
      you={<Figure {...HERO} {...body} brows="flat" mouth="flat" lids={0.2} look={{ x: 0.8, y: 0.5 }} blink={blinking(frame, 2)} time={frame} />} />
  );
};

/** "Every mistake you made this year, and the fix.": from above, the notebook opens, a year of pages riffles past and
 *  lands on one mistake and its fix; the tick draws on "fix"; it shuts. */
export const BookShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const slide = ramp(frame, k.open, k.open + 12);
  const opening = ramp(frame, k.cover, k.cover + 12) - ramp(frame, k.fold, k.fold + 8);
  const riffle = 3 * linear(frame, k.riffle, k.riffle + 30);
  const tick = ramp(frame, k.tick, k.tick + 10);
  const camOpen = insert(BOOK.x, BOOK.y, 1.28);
  const camShut = insert(BOOK.x + 210, BOOK.y, 1.2);
  const cam = drift(camAt(frame, [[k.open, camShut], [k.cover, camShut], [k.cover + 12, camOpen], [k.fold, camOpen], [k.fold + 8, camShut]]), frame, "book", 2);
  return (
    <Desk cam={cam}>
      <OpenBook x={BOOK.x} y={mix(1500, BOOK.y, slide)} open={opening} riffle={frame >= k.fold ? 3 : riffle} leaves={3} tick={tick} />
    </Desk>
  );
};

// ------------------------------------------------------------------------------------------------ the bar: the bigger half

/** "Half a chocolate bar on top. The bigger half.": you snap the bar, set the smaller half on the notebook, hesitate
 *  with the bigger one over it, then swap: the small half comes away, the big half goes down. */
export const ChocShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const enter = ramp(frame, k.brk, k.brk + 10);
  const split = ramp(frame, k.snap, k.snap + 6);
  const down = ramp(frame, k.small - 12, k.small);
  const dither = Math.sin(Math.PI * linear(frame, k.small + 6, k.swap - 4));
  const swap = ramp(frame, k.swap, k.swap + 16);
  const away = ramp(frame, k.swap + 18, k.eat);
  // the small half: in your left hand, onto the cover, then lifted away
  const sm = {
    x: mix(mix(mix(832, 790, split), 930, down), 640, swap), y: mix(mix(mix(1200, 720, enter), 560, down), 930, swap),
    s: mix(mix(1.12, 1.0, down), 1.15, swap), tilt: mix(mix(0, -8, split), -2, down),
  };
  // the big half: in your right hand, hovering, then down where the small one was
  const bg = {
    x: mix(mix(1024, 1080, split) - 90 * dither, 960, swap), y: mix(mix(mix(1200, 720, enter), 690 - 50 * dither, split), 560, swap),
    s: mix(1.12, 1.0, swap), tilt: mix(mix(0, 6, split), -6, swap),
  };
  const leftHand = { x: sm.x - SEG * sm.s - 14, y: sm.y + 10 };
  const rightHand = { x: mix(bg.x + 2 * SEG * bg.s + 14, 1500, away), y: mix(bg.y + 10, 1300, away) };
  const cam = drift(camAt(frame, [[k.brk, insert(960, 600, 1.15)], [k.swap, insert(960, 580, 1.3)], [k.eat, insert(960, 570, 1.38)]]), frame, "choc", 2);
  return (
    <Desk cam={cam}>
      <OpenBook x={BOOK.x} y={BOOK.y} open={0} riffle={0} leaves={3} tick={0} />
      {frame < k.snap ? (
        <Bar x={960} y={sm.y} cols={6} scale={1.12} wrap="right" />
      ) : (
        <>
          <Bar x={sm.x} y={sm.y} cols={2} scale={sm.s} tilt={sm.tilt} />
          <Bar x={bg.x} y={bg.y} cols={4} scale={bg.s} tilt={bg.tilt} wrap="right" />
        </>
      )}
      <Crumbs x={895} y={720} t={linear(frame, k.snap, k.snap + 14)} />
      <TopHand x={frame < k.snap ? 960 - 3 * SEG * 1.12 - 14 : leftHand.x} y={frame < k.snap ? sm.y + 10 : leftHand.y} from={{ x: 520, y: 1400 }} />
      <TopHand x={frame < k.snap ? 960 + 3 * SEG * 1.12 + 14 : rightHand.x} y={frame < k.snap ? sm.y + 10 : rightHand.y} from={{ x: 1420, y: 1400 }} />
    </Desk>
  );
};

// ------------------------------------------------------------------------------------------------ the small half, eaten

const standing = (): Body => ({ x: AISLE, y: 960, scale: S, facing: 1, pose: STAND });

/** "You're competitive, not a monster.": close on you with the smaller half; on "not a monster" it goes in, whole. */
export const EatShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = standing();
  const head = headAt(body.x, body.y, S, STAND, 1);
  const mouth = { x: head.x + 22, y: head.y + 22 };
  const lift = ramp(frame, k.pop - 14, k.pop);
  const rest = { x: head.x + 70, y: head.y + 120 };
  const hand = { x: mix(rest.x, mouth.x + 18, lift), y: mix(rest.y, mouth.y + 6, lift) };
  const eaten = frame >= k.pop;
  const drop = ramp(frame, k.pop + 6, k.pop + 20);
  body.pose = { ...STAND, armF: eaten ? [mix(aimArm(body, hand)[0], STAND.armF[0], drop), mix(aimArm(body, hand)[1], STAND.armF[1], drop)] : aimArm(body, hand) };
  const chew = eaten && frame < k.pop + 54 && Math.floor((frame - k.pop) / 5) % 2 === 0;
  const face = eaten
    ? { brows: "raised" as const, lids: 0.55, mouth: (chew ? "o" : "flat") as "o" | "flat", eyes: 1, look: { x: 0.4, y: 0 } }
    : { brows: (frame >= k.pop - 22 ? "angry" : "flat") as "angry" | "flat", lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.7, y: 0.6 } };
  const cam = camAt(frame, [[k.eat, closeUp(head.x + 50, head.y + 30, 2.3)], [k.cost, closeUp(head.x + 40, head.y + 26, 2.55)]]);
  return (
    <Classroom frame={frame} cam={drift(cam, frame, "eat", 2)} onDesk
      you={<Figure {...HERO} {...body} {...face} blink={!eaten && blinking(frame, 2)} time={frame}
        held={eaten ? undefined : <Chocolate x={6} y={-6} scale={0.62} half="left" tilt={-20} />} />} />
  );
};

// ------------------------------------------------------------------------------------------------ the cost, and the ladder

/** "It might cost you first place.": you at his desk, your hand resting on the notebook, looking at it. */
export const CostShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = standing();
  body.pose = { ...STAND, lean: 10, armF: aimArm({ ...body, pose: { ...STAND, lean: 10 } }, { x: HIS_DESK.x - 10, y: HIS_DESK.y - 22 }) };
  const cam = drift(camAt(frame, [[k.cost, { x: 960, y: 720, zoom: 1.55 }], [k.hand, { x: 990, y: 730, zoom: 1.8 }]]), frame, "cost", 2);
  return (
    <Classroom frame={frame} cam={cam} onDesk
      you={<Figure {...HERO} {...body} brows="worry" mouth="flat" lids={0.4} eyes={1} look={{ x: 0.7, y: 0.9 }} blink={blinking(frame, 4)} time={frame} />} />
  );
};

/** From above: your hand on the cover beside the bigger half lets go ("You leave it anyway."); the half stands upright
 *  and the ink carries its segment lines on up the page into a ladder ("If he's building a ladder..."). */
export const LadderShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const off = ramp(frame, k.lift, k.lift + 16);
  const turn = ramp(frame, k.ladder, k.ladder + 14);
  const ink = linear(frame, k.ladder + 10, k.smile - 6);
  const hand = { x: mix(760, 820, off), y: mix(640, 1320, off) };
  const cam = drift(camAt(frame, [[k.hand, insert(930, 600, 1.3)], [k.ladder, insert(960, 560, 1.25)], [k.smile, insert(960, 380, 1.05)]]), frame, "ladder", 2);
  return (
    <Desk cam={cam}>
      <OpenBook x={BOOK.x} y={BOOK.y} open={0} riffle={0} leaves={3} tick={0} />
      <LadderInk x={960} y={560} t={ink} />
      <Bar x={960} y={560} cols={4} tilt={mix(-6, 90, turn)} wrap="right" />
      {off < 1 && <TopHand x={hand.x} y={hand.y} from={{ x: 560, y: 1400 }} />}
    </Desk>
  );
};

// ------------------------------------------------------------------------------------------------ the smile, and out

/** "...he can have the good wood.": close on you over his desk, a small smile. */
export const SmileShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body = standing();
  const head = headAt(body.x, body.y, S, body.pose, 1);
  const smile = frame >= k.smile + 8;
  const cam = camAt(frame, [[k.smile, closeUp(head.x + 60, head.y + 20, 2.4)], [k.go, closeUp(head.x + 60, head.y + 20, 2.6)]]);
  return (
    <Classroom frame={frame} cam={drift(cam, frame, "smile", 2)} onDesk
      you={<Figure {...HERO} {...body} brows="flat" lids={smile ? 0.35 : 0.2} mouth={smile ? "smile" : "flat"} eyes={1} look={{ x: 0.8, y: 0.7 }}
        blink={blinking(frame, 2)} time={frame} />} />
  );
};

export const GoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const walk = linear(frame, k.go, k.gate + 4);
  const x = mix(AISLE - 30, 560, walk);
  const pose: Pose = walkPose(frame * 0.3);
  const cam = drift(camAt(frame, [[k.go, { x: 940, y: 660, zoom: 1.5 }], [k.gate, { x: 900, y: 670, zoom: 1.55 }]]), frame, "go", 2);
  return (
    <Classroom frame={frame} cam={cam} onDesk
      you={<Figure {...HERO} x={x} y={960} scale={S} facing={-1} pose={pose} brows="flat" mouth="smile" lids={0.3} look={{ x: 0.8, y: 0.1 }} time={frame} flow={0.2} />} />
  );
};
