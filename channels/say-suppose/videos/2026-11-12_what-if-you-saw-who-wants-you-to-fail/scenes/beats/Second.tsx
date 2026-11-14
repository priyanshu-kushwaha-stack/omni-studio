// Beat "Second" (script v5, ## [05:50] Second; lines 74-77).
//   74  "You climb. Fourth. Third. Second.": the tally, 4 -> 3 -> 2 (FourSeats.Paper TallySheet); "And the morning you hit
//       second, the rival finally looks up": the classroom, the rival at the front with his paper, his eyes come up to you
//   75  "Weather?"; your bubble "Second place."; his card snaps open: -71
//   76  "Two years of trash talk gave you minus six.": a sepia memory, him jabbing a finger, -6; "One mock score gave you
//       minus seventy-one.": back, your mock paper up, his -71; "You're in his lane now.": the two of you face to face;
//       "Your rival finally hates you, and you've never been prouder.": close on your proud grin
//   77  "And your best friend? Minus ninety-one.": close on him at the next desk, his card -91; "the reddest card in the
//       room is at the next desk": the room, -71 at the front and -91 beside you; "So what does first cost?": your face,
//       the grin gone. Hands over to The Ladder.
import { AbsoluteFill } from "remotion";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { Bubble, Meter, MeterSound } from "../parts";
import { camAt, current, lineEnd, mix, ramp, TAEHO, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { Asker, ASKER_HEAD, kangLooking, mh, Room, youAt } from "./FourSeats.Class";
import { TallySheet } from "./FourSeats.Paper";

function times(shot: Shot) {
  const c = shot.clips;
  const at = (i: number, p: number) => Math.round(c[i].from + c[i].frames * p);
  return {
    climb: c[74].from,
    fourth2: at(74, 0.14),
    third: at(74, 0.25),
    second: at(74, 0.36),
    morning: at(74, 0.46),
    lookUp: at(74, 0.8),
    weather: c[75].from,
    bubble: lineEnd(c, 75) + 4,
    tag71: c[76].from - 10,
    six: at(76, 0.17),
    mock: at(76, 0.38),
    lane: at(76, 0.57),
    proud: at(76, 0.72),
    mj: c[77].from,
    tag91: at(77, 0.08),
    room: at(77, 0.38),
    cost: at(77, 0.76),
    end: shot.to,
  };
}

type View = "tally" | "morning" | "weather" | "six" | "mock" | "lane" | "proud" | "mj" | "room" | "cost";

const RIVAL_NOW = -71;
const RIVAL_THEN = -6;
const FRIEND_NOW = -91;
const TX = 1200;
/** The rival a step closer for "You're in his lane now". */
const LANE_X = 1080;

const SecondScene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const mood = moodAt(shot);
  const view = current<View>(frame, [[0, "tally"], [k.morning, "morning"], [k.weather, "weather"], [k.six, "six"], [k.mock, "mock"], [k.lane, "lane"],
    [k.proud, "proud"], [k.mj, "mj"], [k.room, "room"], [k.cost, "cost"]]);
  if (view === "tally") {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <TallySheet frame={frame} k={{ climb: k.climb, fourth2: k.fourth2, third: k.third, second: k.second, red: k.morning }} mood={mood} />
      </AbsoluteFill>
    );
  }
  const standing = view === "lane" || view === "mock" || view === "weather";
  const up = standing ? ramp(frame, view === "weather" ? k.bubble - 8 : k.mock - 6, view === "weather" ? k.bubble + 4 : k.mock + 6) : 0;
  const you = view === "weather" ? youAt(up, up) : view === "mock" ? youAt(1, 1) : view === "lane" ? youAt(1, 0) : youAt(0, 0);
  const tx = view === "lane" ? mix(TX, LANE_X, ramp(frame, k.lane, k.lane + 12)) : TX;
  const th = { ...ASKER_HEAD, x: ASKER_HEAD.x + (tx - TX) };
  const looked = frame >= k.lookUp;
  const rivalFace = view === "six"
    ? { brows: "raised" as const, lids: 0.2, mouth: Math.floor(frame / 5) % 2 ? "open" as const : "smirk" as const, eyes: 1, look: { x: 0.9, y: 0.2 } }
    : frame >= k.tag71 + 10
      ? { brows: "angry" as const, lids: 0.3, mouth: "frown" as const, eyes: 1, look: { x: 0.9, y: 0.25 } }
      : frame >= k.weather ? { brows: "flat" as const, lids: 0.2, mouth: frame < k.bubble ? "open" as const : "flat" as const, eyes: 1, look: { x: 0.9, y: 0.25 } }
      : { brows: "none" as const, lids: looked ? 0.1 : 0.5, mouth: "flat" as const, eyes: 1, look: looked ? { x: 0.9, y: 0.2 } : { x: 0.3, y: 0.9 } };
  const proudFace = { brows: "raised" as const, lids: 0.35, mouth: "smile" as const, eyes: 1, look: { x: 0.8, y: -0.1 } };
  const yourFace = view === "proud" ? proudFace
    : view === "cost" ? { brows: "worry" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: -0.9, y: 0.1 } }
    : view === "mj" || view === "room" ? { ...EXPRESSIONS.neutral, look: { x: -0.8, y: 0 } }
    : view === "six" ? { brows: "flat" as const, lids: 0.4, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: -0.2 } }
    : frame >= k.bubble ? { brows: "raised" as const, lids: 0.2, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0 } }
    : { brows: "none" as const, lids: 0.1, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0 } };
  const minjunFace = view === "mj" || view === "room" || view === "cost"
    ? { brows: "sad" as const, lids: 0.45, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0.4 } }
    : { ...EXPRESSIONS.neutral, look: { x: 1, y: -0.2 } };
  const yh = you.head;
  const cams: Record<Exclude<View, "tally">, Camera> = {
    morning: camAt(frame, [[k.morning, { x: 900, y: 580, zoom: 1.15 }], [k.lookUp, { x: 1050, y: 560, zoom: 1.5 }], [k.weather, { x: 1060, y: 560, zoom: 1.6 }]]),
    weather: camAt(frame, [[k.weather, { x: 1060, y: 560, zoom: 1.6 }], [k.six, { x: 1080, y: 540, zoom: 1.75 }]]),
    six: camAt(frame, [[k.six, closeUp(th.x - 60, th.y - 60, 2.3)], [k.mock, closeUp(th.x - 60, th.y - 60, 2.45)]]),
    mock: camAt(frame, [[k.mock, { x: 1060, y: 560, zoom: 1.55 }], [k.lane, { x: 1070, y: 550, zoom: 1.65 }]]),
    lane: camAt(frame, [[k.lane, { x: 1020, y: 560, zoom: 1.8 }], [k.proud, { x: 1010, y: 560, zoom: 1.95 }]]),
    proud: camAt(frame, [[k.proud, closeUp(yh.x + 30, yh.y, 2.7)], [k.mj, closeUp(yh.x + 30, yh.y, 2.95)]]),
    mj: camAt(frame, [[k.mj, closeUp(mh.x + 20, mh.y - 70, 2.3)], [k.room, closeUp(mh.x + 20, mh.y - 75, 2.45)]]),
    room: camAt(frame, [[k.room, { x: 900, y: 560, zoom: 1.35 }], [k.cost, { x: 880, y: 560, zoom: 1.2 }]]),
    cost: camAt(frame, [[k.cost, closeUp(yh.x + 30, yh.y, 2.6)], [k.end, closeUp(yh.x + 30, yh.y, 2.85)]]),
  };
  const v = view as Exclude<View, "tally">;
  const cam = drift(cams[v], frame, "second", 3);
  const cards = (
    <>
      {view === "six"
        ? <Meter frame={frame} at={k.six + 2} x={th.x} headY={th.y} r={th.r} value={RIVAL_THEN} until={k.mock} />
        : <Meter frame={frame} at={k.tag71} x={th.x} headY={th.y} r={th.r} value={RIVAL_NOW} until={k.end} />}
      <Meter frame={frame} at={k.tag91} x={mh.x + 20} headY={mh.y} r={mh.r} value={FRIEND_NOW} until={k.end} />
      <Bubble frame={frame} at={k.bubble} until={k.tag71 + 40} x={yh.x + 90} y={yh.y - yh.r - 100} text="Second place." size={30} side="right" />
    </>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Room frame={frame} cam={cam} mood={mood} you={you} youFace={yourFace}
        minjun={{ pose: view === "mj" || view === "room" || view === "cost" ? { ...SEATED, lean: 6, tilt: 6 } : undefined, face: minjunFace }}
        kang={view === "room" ? kangLooking : null}
        props={<Asker frame={frame} who={TAEHO} x={tx} point={view === "six" ? 0.45 : 0} face={rivalFace} />}
        cards={cards} />
      {view === "six" && <AbsoluteFill style={{ background: "#c79a5a", mixBlendMode: "multiply", opacity: 0.45 }} />}
      <MeterSound at={k.tag71} />
      <MeterSound at={k.six + 2} volume={0.5} />
      <MeterSound at={k.tag91} />
    </AbsoluteFill>
  );
};

export const second: Beat = { id: "Second", firstLine: 74, Component: SecondScene };
