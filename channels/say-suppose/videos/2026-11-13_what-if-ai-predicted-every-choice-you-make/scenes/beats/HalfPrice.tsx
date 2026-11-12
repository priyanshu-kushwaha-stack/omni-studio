// Beat "Half Price" (script.md, ## [00:12] Half Price; narration lines 4-7). The narrator arrives over the court at
// closing: the lamp, your face, the title question over the two of you; three other nights at the same counter, the
// lamp warmer each time and no tags; tonight's two teal ticks; the coffee board on 1.50; the rate board under the teal
// lamp, YOUR RATE 100; the heads in the court tilting up at their cards one after another. The title card ident the
// script asks for after line 7 is not drawn: the beat cuts on the last word (Film.tsx owns the ident, if any).
//
//   4    "Closing time.": insert, the teal lamp on the pillar, pulsing; "A food court in Singapore.": your face, lit from
//        below, eyes on the card over his head
//   5    the title question over the counter two-shot: he looks up at his own tag, then at you, and points at it with the
//        cup
//   6    "Every night you count the box": another night, coins into the open box, no tags, the lamp warm; "he holds out
//        his hand": another night, his open palm; "you pocket the key": another night, your hand and the key going down;
//        "The oldest joke": tonight, the two teal ticks, you both grin; "Tonight it came with a number": insert, your 91
//   7    "your rent halves": the coffee board on 1.50 and the iced coffee in his hand; "Don't": the pillar, the lamp, then
//        the board, YOUR RATE 100; "every head in the court turns": the wide, heads tilting up one after another;
//        "It's right ninety-nine times in a hundred": a pan across the cards; "About everybody.": the two of you, looking up
import { AbsoluteFill } from "remotion";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip as LineClip } from "@whatif/kit/timeline";
import type { BoardKey, TagKey } from "../device";
import { aimArm, lineAt, moodNow } from "../kit";
import { camAt, current, mix, ramp, type Beat, type Shot } from "../shared";
import { COURT, Key } from "../sets/FoodCourt";
import {
  CL, CloseShot, Coin, CourtShot, EXTRAS, friendBody, IcedCoffee, Palm, pillarBoard, pillarLamp, youBody, youHead,
  type CourtTags, type Face, type Mood,
} from "./TheLamp.Court";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: LineClip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    lamp: from(4), // "Closing time."
    face: at(4, 0.38), // "A food court in Singapore."
    two: from(5), // the title question
    upAt: at(5, 0.05), // he looks up at his own tag
    atYou: at(5, 0.4), // then at you
    point: at(5, 0.55), // and points at it with the cup
    n1: from(6), // "Every night you count the box."
    n2: at(6, 0.21), // "Every night he holds out his hand."
    n3: at(6, 0.43), // "Every night you pocket the key."
    joke: at(6, 0.63), // "The oldest joke you two have.": tonight
    number: at(6, 0.82), // "Tonight it came with a number."
    coffee: from(7), // "Do what the tag says, and your rent halves."
    pillar: at(7, 0.27), // "Don't,": the lamp, then the board
    toBoard: at(7, 0.31),
    wave: at(7, 0.36), // "and every head in the court turns,"
    right: at(7, 0.64), // "It's right ninety-nine times in a hundred."
    everybody: at(7, 0.9), // "About everybody."
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the tags, already teal

const held = (text: string, pct: number): TagKey[] => [{ at: -10000, text, pct, state: "tick" }];

const TONIGHT: CourtTags = {
  you: held("POCKETS KEY", 91),
  friend: held("PAYS", 97),
  seller: held("SERVES", 98),
  ...Object.fromEntries(EXTRAS.map((e) => [e.id, held(e.text, e.pct)])),
};

const RATE: BoardKey[] = [{ at: -10000, value: "100" }];
const HALF: BoardKey[] = [{ at: -10000, value: "1.50" }];

// ------------------------------------------------------------------------------------------------ the close

const CLOSE: Camera = { x: 960, y: 540, zoom: 1 };
const COFFEE_HELD = <IcedCoffee x={6} y={-8} scale={1} />;

/** Line 4: the lamp on the pillar, pulsing; your face lit from below, eyes on his card. */
const Opening: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  if (frame < k.face) {
    const c0: Camera = { x: 150, y: 290, zoom: 3.2 };
    const lamp = pillarLamp(c0);
    const cam = drift(camAt(frame, [[k.lamp, insert(lamp.x + 40, lamp.y + 70, 3.2)], [k.face, insert(lamp.x + 40, lamp.y + 90, 3.45)]]), frame, "lamp-ins", 1.5);
    return (
      <CourtShot frame={frame} cam={cam} mood={mood} tags={TONIGHT} pillarKeys={RATE} lampDim={0.75 + 0.25 * Math.sin(frame / 3.5)}
        you={{ face: {} }} friend={{ face: {} }} seller={{ face: {} }} />
    );
  }
  const h = youHead({ ...STAND, lean: 4 });
  const cam = drift(camAt(frame, [[k.face, closeUp(h.x + 120, h.y - 30, 1.45)], [k.two, closeUp(h.x + 120, h.y - 40, 1.55)]]), frame, "face", 2);
  return (
    <CloseShot frame={frame} cam={cam} mood={mood} teal={-1000} glowFace={1}
      you={{ pose: { ...STAND, lean: 4, tilt: -4, armF: [6, 14] }, face: { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1.05, look: { x: 1, y: -0.55 } } }}
      friend={{ pose: STAND, face: {}, held: COFFEE_HELD }}
      tags={{ you: TONIGHT.you, friend: TONIGHT.friend }} />
  );
};

/** Line 5, the title question: he looks up at his tag, then at you, and points at it with the cup. */
const POINT: Pose = { ...STAND, lean: 4, armF: [100, 75] };
const TitleTwo: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.two, CLOSE], [k.n1, { x: 980, y: 540, zoom: 1.06 }]]), frame, "title", 2);
  const point = ramp(frame, k.point, k.point + 10);
  const rest: Pose = { ...STAND, lean: 4, armF: [40, 60] };
  const fPose: Pose = { ...rest, tilt: frame < k.atYou ? -14 : -4, armF: [mix(rest.armF[0], POINT.armF[0], point), mix(rest.armF[1], POINT.armF[1], point)] };
  const fFace: Face = frame < k.upAt ? { brows: "none", mouth: "smile", eyes: 1, look: { x: 0.8, y: 0.2 } }
    : frame < k.atYou ? { brows: "raised", mouth: "flat", eyes: 1.1, look: { x: 0.2, y: -1 } }
    : { brows: "raised", lids: 0, mouth: point > 0.5 ? "smirk" : "smile", eyes: 1.1, look: { x: 1, y: 0.05 } };
  const youFace: Face = frame >= k.point + 6
    ? { brows: "raised", lids: 0, mouth: "smirk", eyes: 1.05, look: { x: 1, y: -0.4 } }
    : { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };
  return (
    <CloseShot frame={frame} cam={cam} mood={mood} teal={-1000}
      you={{ pose: { ...STAND, lean: 4, tilt: 3, armF: [6, 14] }, face: youFace }}
      friend={{ pose: fPose, face: fFace, held: COFFEE_HELD }}
      tags={{ you: TONIGHT.you, friend: TONIGHT.friend }} />
  );
};

/** Line 6: three other nights, the lamp warmer each time, no city lamp and no tags; then tonight; then your 91. */
const Nights: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.n1, "coins"], [k.n2, "hand"], [k.n3, "pocket"], [k.joke, "tonight"], [k.number, "number"]]);
  if (on === "coins") {
    // another night: the box open, coins dropping from your hand one by one
    const cam = drift(camAt(frame, [[k.n1, insert(CL.box.x - 40, 840, 2.1)], [k.n2, insert(CL.box.x - 40, 840, 2.25)]]), frame, "n1", 2);
    const t = (frame - k.n1) % 16;
    const over = { x: CL.box.x - 20, y: 790 };
    const down = { x: 690, y: 1030 };
    const p = t < 5 ? 0 : t < 10 ? ramp(t, 5, 10) : 1 - ramp(t, 10, 16);
    const hand = { x: mix(over.x, down.x, p), y: mix(over.y, down.y, p) };
    const falling = t < 5 ? [{ x: over.x + 20, y: mix(over.y + 40, CL.top - 70, t / 5) }] : [];
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} warm={1}
        you={{ pose: { ...STAND, lean: 6, armF: aimArm(youBody(STAND), hand) }, face: { lids: 0.35, mouth: "flat", look: { x: 0.8, y: 0.7 } }, held: t >= 10 ? <Coin x={4} y={-2} r={4.5} /> : undefined }}
        friend={{ pose: { ...STAND, lean: 10, armF: aimArm(friendBody({ ...STAND, lean: 10 }), { x: 1290 + Math.sin(frame / 4) * 50, y: CL.top - 8 }) }, face: { lids: 0.3, look: { x: 0.5, y: 0.8 } } }}
        box={{ open: 1, key: null, coinsIn: 3 + Math.floor((frame - k.n1) / 16) }} coins={falling} />
    );
  }
  if (on === "hand") {
    // another night: his open hand slides out, palm up, the grin
    const out = ramp(frame, k.n2, k.n2 + 12);
    const palm = { x: mix(1320, 1200, out), y: mix(950, 865, out) };
    const cam = drift(camAt(frame, [[k.n2, insert(1250, 760, 1.9)], [k.n3, insert(1240, 760, 2.02)]]), frame, "n2", 2);
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} warm={2}
        you={{ pose: { ...STAND, lean: 6 }, face: { mouth: "smile", look: { x: 1, y: 0.2 } } }}
        friend={{ pose: { ...STAND, lean: 10, tilt: -6, armF: aimArm(friendBody({ ...STAND, lean: 10 }), palm) }, face: { brows: "raised", mouth: "smile", eyes: 1.05, look: { x: 1, y: 0.1 } }, held: <Palm color="#f4b393" /> }} />
    );
  }
  if (on === "pocket") {
    // another night: your hand, the key, going down to your pocket
    const down = ramp(frame, k.n3 + 4, k.joke - 4);
    const hand = { x: mix(780, 560, down), y: mix(790, 1110, down) };
    const cam = drift(camAt(frame, [[k.n3, insert(700, 820, 1.8)], [k.joke, insert(680, 860, 1.9)]]), frame, "n3", 2);
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} warm={3}
        you={{ pose: { ...STAND, lean: 6, tilt: 6, armF: aimArm(youBody(STAND), hand) }, face: { brows: "raised", mouth: "smirk", look: { x: 1, y: 0.1 } }, held: <Key x={10} y={-4} scale={0.17} rotate={-24} glint /> }}
        friend={{ pose: { ...STAND, lean: 10, tilt: -6, armF: aimArm(friendBody({ ...STAND, lean: 10 }), { x: 1200, y: 865 }) }, face: { brows: "raised", mouth: "smile", look: { x: 0.9, y: 0.5 } }, held: <Palm color="#f4b393" /> }} />
    );
  }
  if (on === "tonight") {
    // tonight: the two teal ticks, a grin across the box
    const cam = drift(camAt(frame, [[k.joke, { x: 960, y: 520, zoom: 1.0 }], [k.number, { x: 960, y: 500, zoom: 1.05 }]]), frame, "tonight", 2);
    const grin = frame >= k.joke + 14;
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} teal={-1000}
        you={{ pose: { ...STAND, lean: 4, tilt: grin ? 6 : -6, armF: [6, 14] }, face: grin ? { brows: "raised", mouth: "smile", eyes: 1, look: { x: 1, y: 0.05 } } : { brows: "raised", mouth: "flat", eyes: 1.05, look: { x: 0.25, y: -1 } } }}
        friend={{ pose: { ...STAND, lean: 4, tilt: grin ? 6 : -10, armF: [40, 60] }, face: grin ? { brows: "raised", mouth: "smile", eyes: 1, look: { x: 1, y: 0.05 } } : { brows: "raised", mouth: "flat", eyes: 1.05, look: { x: 0.25, y: -1 } }, held: COFFEE_HELD }}
        tags={{ you: TONIGHT.you, friend: TONIGHT.friend }} />
    );
  }
  // the number: insert on your card's 91
  const h = youHead({ ...STAND, lean: 4 });
  const cardY = h.y - h.r - h.r * 0.95 * 0.5 * 2.1;
  const cam = drift(camAt(frame, [[k.number, insert(h.x + 20, cardY + 90, 3.0)], [k.coffee, insert(h.x + 20, cardY + 90, 3.3)]]), frame, "num", 1.5);
  return (
    <CloseShot frame={frame} cam={cam} mood={mood} teal={-1000}
      you={{ pose: { ...STAND, lean: 4, armF: [6, 14] }, face: { brows: "raised", look: { x: 0.25, y: -1 } } }}
      friend={{ pose: STAND, face: {}, held: COFFEE_HELD }}
      tags={{ you: TONIGHT.you, friend: TONIGHT.friend }} />
  );
};

// ------------------------------------------------------------------------------------------------ the court

const HIM_AT = 1345;

/** Line 7: the coffee board and the cup; the pillar and its rate board; the wave of heads; the pan; the two of you. */
const Rule: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.coffee, "coffee"], [k.pillar, "pillar"], [k.wave, "wave"], [k.right, "right"], [k.everybody, "everybody"]]);
  if (on === "everybody") {
    const cam = drift(camAt(frame, [[k.everybody, CLOSE], [k.end, { x: 960, y: 520, zoom: 1.04 }]]), frame, "everybody", 2);
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} teal={-1000}
        you={{ pose: { ...STAND, lean: 4, tilt: -12, armF: [6, 14] }, face: { brows: "raised", mouth: "flat", eyes: 1.05, look: { x: 0.2, y: -1 } } }}
        friend={{ pose: { ...STAND, lean: 4, tilt: -12, armF: [40, 60] }, face: { brows: "raised", mouth: "flat", eyes: 1.05, look: { x: 0.2, y: -1 } }, held: COFFEE_HELD }}
        tags={{ you: TONIGHT.you, friend: TONIGHT.friend }} />
    );
  }
  let cam: Camera;
  if (on === "coffee") cam = drift(camAt(frame, [[k.coffee, { x: 1620, y: 430, zoom: 1.45 }], [k.pillar, { x: 1640, y: 420, zoom: 1.55 }]]), frame, "board", 2);
  else if (on === "pillar") {
    const lamp = pillarLamp({ x: 200, y: 300, zoom: 2.4 });
    const board = pillarBoard({ x: 200, y: 300, zoom: 2.4 });
    cam = drift(camAt(frame, [[k.pillar, insert(lamp.x + 60, lamp.y + 40, 2.6)], [k.toBoard + 2, insert(lamp.x + 60, lamp.y + 40, 2.6)], [k.wave - 4, insert(board.x + 40, board.y + 50, 2.6)]]), frame, "pillar", 1.5);
  } else if (on === "wave") cam = drift(camAt(frame, [[k.wave, { x: 960, y: 560, zoom: 1.0 }], [k.right, { x: 960, y: 540, zoom: 1.08 }]]), frame, "wave", 3);
  else cam = drift(camAt(frame, [[k.right, { x: 700, y: 470, zoom: 1.4 }], [k.everybody, { x: 1300, y: 470, zoom: 1.4 }]]), frame, "pan", 2);
  // the wave: heads tilt up at their own cards one after another, left to right
  const order = [...EXTRAS.map((e) => ({ id: e.id, x: e.x })), { id: "you", x: COURT.you.x }, { id: "friend", x: COURT.friend.x }, { id: "seller", x: COURT.coffee.seller.x }]
    .sort((a, b) => a.x - b.x);
  const up: Record<string, number> = {};
  order.forEach((o, i) => { up[o.id] = on === "coffee" || on === "pillar" ? 0 : ramp(frame, k.wave + 4 + i * 6, k.wave + 16 + i * 6); });
  const lookUp = (u: number, down: { x: number; y: number }): Face => ({ brows: u > 0.5 ? "raised" : "none", mouth: "flat", eyes: 1 + 0.08 * u, look: { x: mix(down.x, 0.2, u), y: mix(down.y, -1, u) } });
  const fB = { x: HIM_AT, y: COURT.floor, scale: COURT.scale, pose: STAND, facing: 1 as const };
  const raise = aimArm(fB, { x: HIM_AT + 120, y: 640 });
  return (
    <CourtShot frame={frame} cam={cam} mood={mood} tags={on === "coffee" ? { you: TONIGHT.you, friend: TONIGHT.friend, seller: TONIGHT.seller } : TONIGHT} up={up} pillarKeys={RATE} priceKeys={HALF} lampOn={-1000}
      you={{ pose: { ...STAND, tilt: -12 * up.you, armF: [8, 20] }, face: lookUp(up.you, { x: 1, y: 0.2 }) }}
      friend={{ x: HIM_AT, facing: 1, pose: { ...STAND, tilt: -12 * up.friend, armF: raise }, face: lookUp(up.friend, { x: 0.6, y: 0.3 }), held: COFFEE_HELD }}
      seller={{ pose: { ...STAND, tilt: -12 * up.seller }, face: { ...lookUp(up.seller, { x: 0.3, y: 0.7 }), lids: 0.3 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const part = current(frame, [[0, "open"], [k.two, "two"], [k.n1, "nights"], [k.coffee, "rule"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "open" && <Opening frame={frame} k={k} mood={mood} />}
      {part === "two" && <TitleTwo frame={frame} k={k} mood={mood} />}
      {part === "nights" && <Nights frame={frame} k={k} mood={mood} />}
      {part === "rule" && <Rule frame={frame} k={k} mood={mood} />}
    </AbsoluteFill>
  );
};

export const halfPrice: Beat = { id: "halfPrice", firstLine: 4, Component: Scene };
