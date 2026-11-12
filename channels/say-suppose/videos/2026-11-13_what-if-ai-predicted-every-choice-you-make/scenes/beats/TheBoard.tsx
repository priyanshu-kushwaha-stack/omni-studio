// Beat "The Board" (script.md, ## [08:37] The Board; narration lines 90-99). Night, outside the court
// (sets/CourtLamppost): the two of you under the lamppost, the open box on the ground between you, two crimson cards,
// the CITY SCORE board under the teal lamp, the worker's ladder still against the post.
//
//   90    the lamppost wide; the two of you under it; on "No." a close-up of your face looking up at the board; the
//         board at 99.5
//   91    paper diagram pinned on the post: a car with a teal-lit box on its dashboard, a brake pedal; a tally of hard
//         brakes, then six months on, a fifth shorter
//   92    the diagram: a smooth curve, a hand pressing down on it, the curve breaking under the hand (1975)
//   93    your best friend reaches up and spins the split-flaps backwards: 99.5, 93, 84, 71 on the spoken numbers; the
//         teal lamp dims a shade with each flap; your faces lit less each time
//   94    the diagram: a hundred and sixty desks with mountains of paper, one desk with four cards, two bars almost level
//   95-96 the board at 71; the worker's ladder; your own crimson card, and you not looking at it
//   97-98 the diagram: a man pointing at a bank and the queue that makes it true (1948); a comet on a dotted orbit, a
//         figure pointing, the comet not moving; then a person under a card, who moves when pointed at
//   99    the city at night from above: teal lights to the horizon, a thousand ticks like rain, two crimson dots by the
//         food court
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { BoardSounds, RateBoard, Tag, TealLamp, type BoardKey, type TagKey } from "../device";
import { aimArm, headAt, lineAt } from "../kit";
import { blinking, camAt, current, FRIEND, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { REF } from "../sets/common";
import { CashBox } from "../sets/FoodCourt";
import { Lamppost, LamppostBack, lamppostLights, LAMPPOST } from "../sets/CourtLamppost";
import { CityNight, CRIMSON_DOTS, CurveSheet, DesksSheet, DriveSheet, ProphetSheet } from "./TheBoard.Paper";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    at,
    start: from(90), // "It knows you. Ninety-nine times in a hundred, it knows you."
    two: at(90, 0.3),
    no: at(90, 0.56), // "No."
    board90: at(90, 0.78), // "And did what it said."
    drive: from(91),
    curve: from(92),
    spin: from(93), // "Run the board backwards."
    touch: at(93, 0.17), // "Ninety-nine."
    f93: at(93, 0.29), // "Ninety-three."
    f84: at(93, 0.41), // "Eighty-four."
    f71: at(93, 0.51), // "Seventy-one."
    faces: at(93, 0.6), // "The night it started, it was right seven times in ten."
    board71: at(93, 0.8),
    desks: from(94),
    b71: from(95), // "Machines are bad at people."
    ladder: at(95, 0.5), // "Until people get simple."
    card: from(96), // "It never got better at seeing you. You got better at being seen."
    bank: from(97),
    comet: from(98),
    city: from(99),
    end: to,
  };
}

/** The board's values: 99.5 until he spins it backwards on the spoken numbers. */
const boardKeys = (k: T): BoardKey[] => [
  { at: k.start - 400, value: "99.5" }, { at: k.f93, value: "93" }, { at: k.f84, value: "84" }, { at: k.f71, value: "71" },
];
/** The teal lamp dims a shade with each flap back. */
const dimAt = (frame: number, k: T) =>
  frame < k.f93 ? 1 : mix(frame < k.f84 ? 1 : frame < k.f71 ? 0.78 : 0.6, frame < k.f84 ? 0.78 : frame < k.f71 ? 0.6 : 0.42,
    ramp(frame, frame < k.f84 ? k.f93 : frame < k.f71 ? k.f84 : k.f71, (frame < k.f84 ? k.f93 : frame < k.f71 ? k.f84 : k.f71) + 10));

const CRIMSON_CARD = (k: T): TagKey[] => [{ at: k.start - 400, text: "UNPREDICTABLE", pct: null, state: "crimson" }];

// ------------------------------------------------------------------------------------------------ under the lamppost

const S = LAMPPOST.scale;
const TILE_Y = LAMPPOST.board.y + 60 * 0.42 + 60 * 0.68;

/** The lamppost scene: you, him, the open box, the cards, the board, the teal lamp (dimmed), the ladder. */
const Post: React.FC<{ frame: number; k: T; cam: Camera; youLook: { x: number; y: number }; spin?: boolean; sheet?: React.ReactNode }> = ({
  frame, k, cam, youLook, spin = false, sheet,
}) => {
  const dim = dimAt(frame, k);
  const you = { x: LAMPPOST.you.x, y: LAMPPOST.floor };
  const him = { x: LAMPPOST.friend.x, y: LAMPPOST.floor };
  let hisPose: Pose = { ...STAND, armF: [20, 30] };
  let hisFacing: 1 | -1 = -1;
  let hisLook = { x: 0.8, y: 0.2 };
  if (spin && frame >= k.spin) {
    hisFacing = 1;
    const flick = [k.f93, k.f84, k.f71].map((f) => ramp(frame, f - 8, f + 2) - ramp(frame, f + 2, f + 10)).reduce((a, b) => a + b, 0);
    const reachUp = ramp(frame, k.spin + 4, k.touch);
    const target = { x: LAMPPOST.pole - 30, y: mix(600, TILE_Y - 20 + flick * 40, reachUp) };
    hisPose = { ...STAND, lean: -4, armF: aimArm({ x: him.x, y: him.y, scale: S, pose: { ...STAND, lean: -4 }, facing: 1 }, target) };
    hisLook = { x: 0.6, y: -0.9 };
  }
  const yh = headAt(you.x, you.y, S, STAND, 1);
  const hh = headAt(him.x, him.y, S, hisPose, hisFacing);
  const actors = (
    <>
      <Lamppost />
      <TealLamp frame={frame} x={LAMPPOST.lamp.x} y={LAMPPOST.lamp.y} size={34} dim={dim} />
      <RateBoard frame={frame} x={LAMPPOST.board.x} y={LAMPPOST.board.y} size={60} label="CITY SCORE" keys={boardKeys(k)} />
      <CashBox x={LAMPPOST.box.x} y={LAMPPOST.floor} w={190} h={88} open={1} />
      <Figure x={you.x} y={you.y} scale={S} facing={1} pose={STAND} {...HERO} brows={youLook.y < -0.4 ? "raised" : "flat"} lids={youLook.y < -0.4 ? 0 : 0.25}
        mouth="flat" eyes={1} look={youLook} time={frame} blink={blinking(frame, 1)} />
      <Figure x={him.x} y={him.y} scale={S} facing={hisFacing} pose={hisPose} head={FRIEND.head} coat={FRIEND.coat} brows="flat" lids={0.2}
        mouth={spin && frame >= k.touch ? "smirk" : "flat"} eyes={1} look={hisLook} time={frame} blink={blinking(frame, 2)} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.6} keys={CRIMSON_CARD(k)} />
      <Tag frame={frame} x={hh.x} headY={hh.y} r={hh.r} scale={0.6} keys={CRIMSON_CARD(k)} />
      {sheet}
    </>
  );
  const shade = <rect x={-2000} y={-2000} width={6000} height={6000} fill="#05060c" opacity={sheet ? 0.55 : (1 - dim) * 0.5} />;
  return (
    <LookContext.Provider value={setLook(lamppostLights(dim), "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<LamppostBack cam={cam} frame={frame} />} actors={actors}
        front={sheet ? undefined : shade} />
    </LookContext.Provider>
  );
};

/** A diagram pinned over the lamppost: the scene behind it, darkened, then the sheet. */
const Pinned: React.FC<{ frame: number; k: T; cam: Camera; children: React.ReactNode }> = ({ frame, k, cam, children }) => {
  const actors = (
    <>
      <Lamppost />
      <TealLamp frame={frame} x={LAMPPOST.lamp.x} y={LAMPPOST.lamp.y} size={34} dim={dimAt(frame, k)} />
      <rect x={-2000} y={-2000} width={6000} height={6000} fill="#05060c" opacity={0.5} />
      {children}
    </>
  );
  return (
    <LookContext.Provider value={setLook(lamppostLights(dimAt(frame, k)), "night", cam, { dof: 0 })}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<LamppostBack cam={cam} frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

type ShotName = "wide" | "two" | "no" | "board90" | "drive" | "curve" | "spin" | "flaps" | "faces" | "board71" | "desks" | "b71" | "ladder"
  | "card" | "bank" | "comet" | "city";

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const on = current<ShotName>(frame, [[0, "wide"], [k.two, "two"], [k.no, "no"], [k.board90, "board90"], [k.drive, "drive"], [k.curve, "curve"],
    [k.spin, "spin"], [k.touch + 10, "flaps"], [k.faces, "faces"], [k.board71, "board71"], [k.desks, "desks"], [k.b71, "b71"], [k.ladder, "ladder"],
    [k.card, "card"], [k.bank, "bank"], [k.city, "city"]]);
  const yh = headAt(LAMPPOST.you.x, LAMPPOST.floor, S, STAND, 1);
  const B = LAMPPOST.board;
  const t = (i: number) => (p: number) => k.at(i, p);
  const cams: Record<ShotName, Camera> = {
    wide: camAt(frame, [[k.start, { x: 1000, y: 520, zoom: 1.0 }], [k.two, { x: 1010, y: 530, zoom: 1.08 }]]),
    two: camAt(frame, [[k.two, { x: 1000, y: 560, zoom: 1.45 }], [k.no, { x: 990, y: 560, zoom: 1.55 }]]),
    no: camAt(frame, [[k.no, closeUp(yh.x + 40, yh.y - 20, 2.6)], [k.board90, closeUp(yh.x + 40, yh.y - 20, 2.8)]]),
    board90: camAt(frame, [[k.board90, insert(B.x, B.y + 20, 3.0)], [k.drive, insert(B.x, B.y + 30, 3.3)]]),
    drive: camAt(frame, [[k.drive, { x: 620, y: 600, zoom: 1.45 }], [k.at(91, 0.36), { x: 640, y: 600, zoom: 1.5 }], [k.at(91, 0.42), { x: 1250, y: 520, zoom: 1.4 }], [k.curve, { x: 1150, y: 540, zoom: 1.15 }]]),
    curve: camAt(frame, [[k.curve, { x: 960, y: 540, zoom: 1.05 }], [k.at(92, 0.5), { x: 900, y: 520, zoom: 1.3 }], [k.spin, { x: 960, y: 540, zoom: 1.15 }]]),
    spin: camAt(frame, [[k.spin, { x: 1080, y: 560, zoom: 1.35 }], [k.touch + 10, { x: 1110, y: 520, zoom: 1.5 }]]),
    flaps: camAt(frame, [[k.touch + 10, insert(B.x - 60, B.y + 90, 2.4)], [k.faces, insert(B.x - 60, B.y + 90, 2.6)]]),
    faces: camAt(frame, [[k.faces, { x: 955, y: 420, zoom: 1.9 }], [k.board71, { x: 955, y: 425, zoom: 2.05 }]]),
    board71: camAt(frame, [[k.board71, insert(B.x, B.y + 20, 3.0)], [k.desks, insert(B.x, B.y + 30, 3.3)]]),
    desks: camAt(frame, [[k.desks, { x: 960, y: 540, zoom: 1.0 }], [k.at(94, 0.3), { x: 960, y: 540, zoom: 1.04 }], [k.at(94, 0.36), { x: 680, y: 640, zoom: 1.5 }],
      [k.at(94, 0.55), { x: 760, y: 620, zoom: 1.55 }], [k.at(94, 0.6), { x: 1430, y: 660, zoom: 1.7 }], [k.at(94, 0.72), { x: 1400, y: 640, zoom: 1.7 }],
      [k.at(94, 0.8), { x: 960, y: 520, zoom: 1.0 }], [k.b71, { x: 960, y: 520, zoom: 1.04 }]]),
    b71: camAt(frame, [[k.b71, insert(B.x, B.y + 20, 2.8)], [k.ladder, insert(B.x, B.y + 30, 3.1)]]),
    ladder: camAt(frame, [[k.ladder, { x: 1420, y: 800, zoom: 2.0 }], [k.card, { x: 1330, y: 420, zoom: 2.0 }]]),
    card: camAt(frame, [[k.card, { x: yh.x + 60, y: 330, zoom: 2.0 }], [k.bank, { x: yh.x + 60, y: 340, zoom: 2.2 }]]),
    bank: camAt(frame, [[k.bank, { x: 900, y: 1000, zoom: 1.25 }], [k.at(97, 0.55), { x: 820, y: 980, zoom: 1.35 }], [k.at(97, 0.62), { x: 900, y: 600, zoom: 1.15 }],
      [k.comet, { x: 880, y: 520, zoom: 1.2 }], [k.at(98, 0.5), { x: 960, y: 500, zoom: 1.25 }], [k.city, { x: 1080, y: 470, zoom: 1.45 }]]),
    comet: REF,
    city: camAt(frame, [[k.city, { x: 960, y: 500, zoom: 1.0 }], [k.at(99, 0.45), { x: 960, y: 560, zoom: 1.15 }],
      [k.end, { x: CRIMSON_DOTS.x, y: CRIMSON_DOTS.y - 20, zoom: 1.8 }]]),
  };
  const cam = drift(cams[on], frame, `board-${on}`, on === "city" ? 2 : 3);
  let picture: React.ReactNode;
  if (on === "drive") picture = <Pinned frame={frame} k={k} cam={cam}><DriveSheet frame={frame} t={t(91)} /></Pinned>;
  else if (on === "curve") picture = <Pinned frame={frame} k={k} cam={cam}><CurveSheet frame={frame} t={t(92)} /></Pinned>;
  else if (on === "desks") picture = <Pinned frame={frame} k={k} cam={cam}><DesksSheet frame={frame} t={t(94)} /></Pinned>;
  else if (on === "bank" || on === "comet") picture = <Pinned frame={frame} k={k} cam={cam}><ProphetSheet frame={frame} t={t(97)} u={t(98)} /></Pinned>;
  else if (on === "city") {
    picture = (
      <LookContext.Provider value={setLook([], "night", cam, { dof: 0 })}>
        <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<CityNight cam={cam} frame={frame} />} actors={null} />
      </LookContext.Provider>
    );
  } else {
    const looking = on === "no" || on === "board90" ? { x: 0.7, y: -0.85 } : on === "card" ? { x: 0.9, y: 0.15 } : { x: 0.9, y: 0.05 };
    picture = <Post frame={frame} k={k} cam={cam} youLook={looking} spin={frame >= k.spin && frame < k.desks} />;
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <BoardSounds keys={boardKeys(k)} volume={0.7} />
    </AbsoluteFill>
  );
};

export const theBoard: Beat = { id: "theBoard", firstLine: 90, Component: Scene };
