// Line 91 of "The Country Holds Its Breath" (HoldsBreath.tsx; script v5): the night before the exam, the classroom at
// dusk. You come in with your own notebook and set it on his desk; insert from above: the notebook, then half a
// chocolate bar dropped on top; close on you, a small smile ("he can have the good wood"); you walk out.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Chocolate, headAt } from "../parts";
import { blinking, camAt, HERO, linear, mix, ramp } from "../shared";
import type { HoldsTimes as T } from "./HoldsBreath";
import { DeskTopBack, MistakeBook, MistakeBookSide } from "./HoldsBreath.Parts";
import { aimArm, S, type Body } from "./Notebook.Parts";

const ROOM_OPTS = { ...classroom.defaults, board: "blank" as const, drawn: 0, farRow: false };
/** His desk (the classroom's third bench desk) and yours (the second): where the notebook lies. */
const HIS_DESK = { x: 1010, y: 765, tilt: -7.6 };
/** Where you stand for the choice: between the two desks, at his seat. */
const AISLE = 900;

export const Classroom: React.FC<{ frame: number; cam: Camera; you: React.ReactNode; behind?: React.ReactNode; book?: React.ReactNode; onDesk?: boolean }> = ({
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

// ------------------------------------------------------------------------------------------------ 91: in, and the desk

/** You walk in along the desks with your notebook and lay it on his desk. */
export const PlaceShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const arrive = k.leave - 26;
  const walk = linear(frame, k.place, arrive);
  const x = mix(260, AISLE, walk);
  const down = ramp(frame, arrive + 2, k.leave - 6);
  const body: Body = { x, y: 960, scale: S, facing: 1, pose: walk < 1 ? walkPose(frame * 0.3) : STAND };
  const bookAt = { x: mix(x + 60, HIS_DESK.x, down), y: mix(800, HIS_DESK.y, down) };
  if (walk >= 1) body.pose = { ...STAND, lean: 8, armF: aimArm(body, { x: bookAt.x - 30, y: bookAt.y - 10 }) };
  const cam = drift(camAt(frame, [[k.place, { x: 760, y: 640, zoom: 1.2 }], [arrive, { x: 930, y: 680, zoom: 1.6 }]]), frame, "place", 2);
  return (
    <Classroom frame={frame} cam={cam}
      book={<MistakeBookSide x={bookAt.x} y={bookAt.y} tilt={mix(0, HIS_DESK.tilt, down)} scale={0.9} />}
      you={<Figure {...HERO} {...body} brows="flat" mouth="flat" lids={0.2} look={{ x: 0.8, y: 0.5 }} blink={blinking(frame, 2)} time={frame} />} />
  );
};

/** "If he's building a ladder, he can have the good wood.": close on you over his desk, a small smile. */
export const SmileShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const body: Body = { x: AISLE, y: 960, scale: S, facing: 1, pose: STAND };
  const head = headAt(body.x, body.y, S, body.pose, 1);
  const smile = frame >= k.smile + 24;
  const cam = camAt(frame, [[k.smile, closeUp(head.x + 60, head.y + 20, 2.4)], [k.go, closeUp(head.x + 60, head.y + 20, 2.6)]]);
  return (
    <Classroom frame={frame} cam={drift(cam, frame, "smile", 2)} onDesk
      you={<Figure {...HERO} {...body} brows="flat" lids={smile ? 0.35 : 0.2} mouth={smile ? "smile" : "flat"} eyes={1} look={{ x: 0.8, y: 0.7 }}
        blink={blinking(frame, 2)} time={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 91: the insert, and out

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
