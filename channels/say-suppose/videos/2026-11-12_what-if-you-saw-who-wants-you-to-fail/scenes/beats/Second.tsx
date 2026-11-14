// Beat "Second" (script v7; lines 74-77), rebuilt on the outside review of v6 (sheets 29-30, top-15 #14):
//   74  "You climb. Fourth. Third. Second.": a vertical leaderboard, your head climbing one row per spoken rank
//       (Second.Board). "And the morning you hit second": the classroom, the rival walking in reading his paper; "the
//       rival": his shoe stops dead (low insert); "finally looks up": close, the paper freezes and his eyes come up.
//   75  "Weather?"; you stand, the paper beside your shoulder (off your face); bubble "Second place."; his card snaps
//       and its click lands on "seventy" of "Minus seventy-one" (word timings), then a cut in close on him.
//   76  "Two years of trash talk gave you minus six.": the sepia memory, him jabbing a finger, -6 landing on "six".
//       "One mock score gave you minus seventy-one.": split frame, THEN (-6, sepia) | NOW, the card re-snapping to -71
//       on the spoken number. "You're in his lane now.": he steps in and snaps his pencil (his first real anger).
//       "Your rival finally hates you.": close on you, chin up; a paper medal, MOST HATED, pops on your chest.
//       "The enemy you went looking for has finally arrived.": the face-off, both standing, lightning between your
//       eyes, warm light: a triumph, the rival as a worthy enemy.
//   77  "And your best friend?": close on him at the next desk, busy, writing; "Minus ninety-one" lands on "ninety-one";
//       without looking up he slides you half a chocolate bar (competitive, still kind). The room: the camera pans from
//       -71 to -91. "So what does first cost?": your face, the grin gone. Hands over to The Ladder.
import { AbsoluteFill } from "remotion";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { MoodName } from "@whatif/kit/stage/moods";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Bubble, Chocolate, headAt, Meter, MeterSound } from "../parts";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { moodAt, Pencil } from "./WhosCrimson.Common";
import { FLOOR, SEAT } from "./WhosCrimson.Class";
import { kangLooking, mh, Room, youAt } from "./FourSeats.Class";
import { BoardShot, Medal, Rival, RivalPaper, ShoeShot, SnappingPencil } from "./Second.Board";

function times(shot: Shot) {
  const c = shot.clips;
  const at = (i: number, p: number) => Math.round(c[i].from + c[i].frames * p);
  const tag71 = at(76, 0.05) - 22; // the click (snap + 22) on "seventy"
  return {
    climb: c[74].from,
    fourth: at(74, 0.15),
    third: at(74, 0.28),
    second: at(74, 0.37),
    mjUp: at(74, 0.44),
    morning: at(74, 0.49),
    shoe: at(74, 0.73),
    stop: at(74, 0.79),
    face: at(74, 0.86),
    lookUp: at(74, 0.9),
    weather: c[75].from,
    bubble: lineEnd(c, 75) + 4,
    tag71,
    seventy: tag71 + 22,
    six: at(76, 0.11),
    sixTag: at(76, 0.26) - 22, // lands on "six"
    mock: at(76, 0.33),
    mockTag: at(76, 0.46) - 22, // lands on the second "seventy-one"
    lane: at(76, 0.54),
    snap: at(76, 0.59),
    hates: at(76, 0.65),
    medal: at(76, 0.72),
    enemy: at(76, 0.79),
    mj: c[77].from,
    tag91: at(77, 0.2) - 22, // lands on "ninety-one"
    offer: at(77, 0.27),
    room: at(77, 0.34),
    cost: at(77, 0.8),
    end: shot.to,
  };
}
type K = ReturnType<typeof times>;

type View = "board" | "morning" | "shoe" | "face" | "weather" | "seventy" | "six" | "mock" | "lane" | "hates" | "enemy" | "mj" | "room" | "cost";

const RIVAL_NOW = -71;
const RIVAL_THEN = -6;
const FRIEND_NOW = -91;
const TX = 1200;
/** The rival a step closer for "You're in his lane now". */
const LANE_X = 1080;
/** Your paper held out beside your shoulder, not over your face (review of v6, 7:55). */
const BESIDE = 0.55;

const rivalHead = (x: number) => headAt(x, FLOOR, SEAT.scale, STAND, -1);

/** The rival's expression and pose for a view. */
function rivalFor(view: View, frame: number, k: K) {
  const looked = ramp(frame, k.lookUp, k.lookUp + 6);
  const gab = Math.floor(frame / 5) % 2 === 0;
  if (view === "morning") {
    return { x: mix(1560, TX, ramp(frame, k.morning, k.shoe)), pose: { ...walkPose(frame * 0.3), armF: [40, 50] as [number, number] },
      face: { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.3, y: 0.9 } }, held: <RivalPaper /> };
  }
  if (view === "face" || view === "board" || view === "shoe") {
    return { x: TX, pose: { ...STAND, armF: [mix(40, 30, looked), 50] as [number, number] },
      face: { brows: "none", lids: mix(0.45, 0.05, looked), mouth: "flat", eyes: mix(1, 1.1, looked), look: { x: mix(0.3, 0.9, looked), y: mix(0.9, 0.15, looked) } },
      held: <RivalPaper /> };
  }
  if (view === "weather") {
    return { x: TX, pose: { ...STAND, armF: [30, 50] as [number, number] },
      face: { brows: frame >= k.tag71 ? "raised" : "flat", lids: 0.15, mouth: frame < k.bubble ? "open" : "flat", eyes: 1, look: { x: 0.9, y: 0.2 } }, held: <RivalPaper /> };
  }
  if (view === "six") {
    return { x: TX, pose: { ...STAND, lean: -2, armF: [mix(90, 105, Math.abs(Math.sin(frame / 4))), 10] as [number, number] },
      face: { brows: "raised", lids: 0.2, mouth: gab ? "open" : "smirk", eyes: 1, look: { x: 0.9, y: 0.2 } } };
  }
  if (view === "lane") {
    return { x: mix(TX, LANE_X, ramp(frame, k.lane, k.lane + 12)), pose: { ...STAND, lean: -6, armF: [100, 70] as [number, number] },
      face: { brows: "angry", lids: 0.25, mouth: frame >= k.snap ? "frown" : "flat", eyes: 1, look: { x: 0.9, y: 0.2 } },
      held: <SnappingPencil frame={frame} at={k.snap} /> };
  }
  if (view === "enemy" || view === "hates") {
    return { x: LANE_X, pose: { ...STAND, lean: -8, armF: [20, 30] as [number, number] }, face: { brows: "angry", lids: 0.3, mouth: "frown", eyes: 1, look: { x: 0.9, y: 0.15 } } };
  }
  // seventy, mock, mj, room, cost
  const angry = frame >= k.seventy + 10;
  return { x: TX, pose: { ...STAND, armF: [30, 50] as [number, number] },
    face: { brows: angry ? "angry" : "raised", lids: angry ? 0.3 : 0, mouth: angry ? "frown" : "o", eyes: angry ? 1 : 1.15, look: { x: 0.9, y: 0.2 } },
    held: view === "mj" || view === "room" || view === "cost" ? undefined : <RivalPaper /> };
}

/** You: seated, standing with the paper beside your shoulder, or (hates/enemy) standing chin up. */
function youFor(view: View, frame: number, k: K) {
  if (view === "weather") {
    const up = ramp(frame, k.bubble - 8, k.bubble + 4);
    return youAt(up, up * BESIDE);
  }
  if (view === "mock") return youAt(1, BESIDE);
  if (view === "lane") return youAt(1, 0.1);
  if (view === "hates" || view === "enemy") {
    const y = youAt(1, view === "hates" ? 0.3 : 0);
    return { ...y, pose: { ...y.pose, tilt: view === "hates" ? -10 : -4, lean: -3 } };
  }
  return youAt(0, 0);
}

function yourFaceFor(view: View, frame: number, k: K) {
  if (view === "hates") return { brows: "raised" as const, lids: 0.4, mouth: "smile" as const, eyes: 1, look: { x: 0.7, y: -0.4 } };
  if (view === "enemy") return { brows: "angry" as const, lids: 0.2, mouth: "smile" as const, eyes: 1, look: { x: 0.95, y: 0 } };
  if (view === "cost") return { brows: "worry" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: -0.9, y: 0.35 } };
  if (view === "mj") return { brows: "raised" as const, lids: 0.1, mouth: "flat" as const, eyes: 1, look: { x: -0.9, y: 0.3 } };
  if (view === "room") return { ...EXPRESSIONS.neutral, look: { x: -0.8, y: 0.1 } };
  if (view === "six") return { brows: "flat" as const, lids: 0.4, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: -0.2 } };
  if (view === "mock" || view === "lane") return { brows: "raised" as const, lids: 0.25, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0 } };
  if (frame >= k.bubble) return { brows: "raised" as const, lids: 0.2, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0 } };
  return { brows: "none" as const, lids: 0.1, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0 } };
}

/** Your best friend: plain, or (77) writing fast, then sliding you half a chocolate bar without looking up. */
function minjunFor(view: View, frame: number, k: K) {
  if (view !== "mj" && view !== "room" && view !== "cost") return { face: { ...EXPRESSIONS.neutral, look: { x: 1, y: -0.2 } } };
  const offer = ramp(frame, k.offer, k.offer + 10);
  const scribble = Math.sin(frame / 1.6) * 8;
  return {
    pose: { ...SEATED, lean: 12, armB: [70 + scribble, 40] as [number, number], armF: [mix(55, 88, offer), mix(45, 4, offer)] as [number, number] },
    face: {
      brows: "flat", lids: 0.35, mouth: offer > 0.5 ? "smile" : "flat", eyes: 1, look: { x: 0.5, y: 0.9 },
      held: offer > 0 ? <Chocolate x={30} y={-6} scale={0.8} half="right" /> : <g transform="rotate(30)"><Pencil x={0} y={0} angle={-60} scale={0.35} /></g>,
    },
  };
}

/** THEN | NOW: the sepia memory frozen on the left (-6), now on the right with the card re-snapping to -71. */
const SplitShot: React.FC<{ frame: number; k: K; mood: MoodName }> = ({ frame, k, mood }) => {
  const then = k.mock - 1;
  const th = rivalHead(TX);
  const yh = youAt(1, BESIDE).head;
  const left: Camera = { x: th.x - 120 + 480 / 1.9, y: th.y + 20, zoom: 1.9 };
  const mid = (yh.x + th.x) / 2;
  const right: Camera = drift({ x: mid - 480 / 1.55, y: th.y + 30, zoom: 1.55 }, frame, "now", 2);
  const r0 = rivalFor("six", then, k), r1 = rivalFor("mock", frame, k);
  const label = (x: number, text: string) => (
    <div style={{ position: "absolute", left: x - 200, top: 128, width: 400, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 92,
      color: INK, WebkitTextStroke: `3px ${PAPER}`, letterSpacing: 4, textShadow: `0 0 10px ${PAPER}` }}>{text}</div>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>
        <Room frame={then} cam={left} mood={mood} you={youAt(0, 0)} youFace={yourFaceFor("six", then, k)} minjun={minjunFor("six", then, k)}
          props={<Rival frame={then} x={r0.x} pose={r0.pose} face={r0.face} />}
          cards={<Meter frame={then} at={k.sixTag} x={th.x} headY={th.y} r={th.r} value={RIVAL_THEN} />} />
        <AbsoluteFill style={{ background: "#c79a5a", mixBlendMode: "multiply", opacity: 0.5 }} />
        {label(480, "THEN")}
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>
        <Room frame={frame} cam={right} mood={mood} you={youAt(1, BESIDE)} youFace={yourFaceFor("mock", frame, k)} minjun={minjunFor("mock", frame, k)}
          props={<Rival frame={frame} x={r1.x} pose={r1.pose} face={r1.face} held={r1.held} />}
          cards={<Meter frame={frame} at={k.mockTag} x={th.x} headY={th.y} r={th.r} value={RIVAL_NOW} />} />
        {label(1440, "NOW")}
      </AbsoluteFill>
      {/* a torn paper edge down the middle */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={`M952 0 ${Array.from({ length: 28 }, (_, i) => `L${i % 2 ? 968 : 950} ${(i + 1) * 40}`).join(" ")} L968 1080 L976 1080 L976 0Z`} fill={PAPER} stroke={INK} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

/** Lightning between two faces (the rivals' glare), flickering. From (x1, y) to (x2, y). */
const Glare: React.FC<{ frame: number; at: number; x1: number; x2: number; y: number }> = ({ frame, at, x1, x2, y }) => {
  if (frame < at) return null;
  const n = 7;
  const seed = Math.floor(frame / 3);
  const pts = Array.from({ length: n + 1 }, (_, i) => `${mix(x1, x2, i / n)} ${i === 0 || i === n ? y : y + (((seed * 7 + i * 13) % 5) - 2) * 9}`);
  return (
    <g>
      <polyline points={pts.join(" ")} fill="none" stroke={INK} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={pts.join(" ")} fill="none" stroke={seed % 2 ? MUSTARD : CRIMSON} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};

const SecondScene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const mood = moodAt(shot);
  const view = current<View>(frame, [[0, "board"], [k.morning, "morning"], [k.shoe, "shoe"], [k.face, "face"], [k.weather, "weather"],
    [k.seventy, "seventy"], [k.six, "six"], [k.mock, "mock"], [k.lane, "lane"], [k.hates, "hates"], [k.enemy, "enemy"], [k.mj, "mj"],
    [k.room, "room"], [k.cost, "cost"]]);
  const sounds = (
    <>
      <MeterSound at={k.tag71} />
      <MeterSound at={k.sixTag} volume={0.5} />
      <MeterSound at={k.mockTag} />
      <MeterSound at={k.tag91} />
    </>
  );
  if (view === "board") {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <BoardShot frame={frame} k={{ at: k.climb, fourth: k.fourth, third: k.third, second: k.second, mj: k.mjUp, end: k.morning }} />
      </AbsoluteFill>
    );
  }
  if (view === "shoe") {
    return <AbsoluteFill style={{ background: "#000" }}><ShoeShot frame={frame} at={k.shoe} stop={k.stop} end={k.face} /></AbsoluteFill>;
  }
  if (view === "mock") {
    return <AbsoluteFill style={{ background: "#000" }}><SplitShot frame={frame} k={k} mood={mood} />{sounds}</AbsoluteFill>;
  }
  const r = rivalFor(view, frame, k);
  const th = rivalHead(r.x);
  const you = youFor(view, frame, k);
  const yh = you.head;
  const cams: Record<Exclude<View, "board" | "shoe" | "mock">, Camera> = {
    morning: camAt(frame, [[k.morning, { x: 1000, y: 580, zoom: 1.12 }], [k.shoe, { x: 1080, y: 570, zoom: 1.3 }]]),
    face: camAt(frame, [[k.face, closeUp(th.x - 40, th.y + 40, 2.4)], [k.weather, closeUp(th.x - 40, th.y + 30, 2.6)]]),
    weather: camAt(frame, [[k.weather, { x: 1050, y: 560, zoom: 1.6 }], [k.seventy, { x: 1070, y: 545, zoom: 1.7 }]]),
    seventy: camAt(frame, [[k.seventy, closeUp(th.x - 50, th.y - 50, 2.3)], [k.six, closeUp(th.x - 50, th.y - 55, 2.45)]]),
    six: camAt(frame, [[k.six, closeUp(th.x - 60, th.y - 60, 2.3)], [k.mock, closeUp(th.x - 60, th.y - 60, 2.45)]]),
    lane: camAt(frame, [[k.lane, { x: 1010, y: 560, zoom: 1.75 }], [k.hates, { x: 1000, y: 565, zoom: 1.9 }]]),
    hates: camAt(frame, [[k.hates, closeUp(yh.x + 20, yh.y + 40, 2.5)], [k.enemy, closeUp(yh.x + 20, yh.y + 50, 2.7)]]),
    enemy: camAt(frame, [[k.enemy, { x: (yh.x + th.x) / 2, y: yh.y + 90, zoom: 1.8 }], [k.mj, { x: (yh.x + th.x) / 2, y: yh.y + 60, zoom: 2.25 }]]),
    mj: camAt(frame, [[k.mj, closeUp(mh.x + 40, mh.y - 70, 2.3)], [k.room, closeUp(mh.x + 50, mh.y - 75, 2.45)]]),
    room: camAt(frame, [[k.room, { x: 1120, y: 560, zoom: 1.45 }], [k.cost - 10, { x: 780, y: 575, zoom: 1.45 }]]),
    cost: camAt(frame, [[k.cost, closeUp(yh.x + 30, yh.y, 2.6)], [k.end, closeUp(yh.x + 30, yh.y, 2.85)]]),
  };
  const cam = drift(cams[view], frame, "second", 3);
  const showRival71 = view !== "six" && view !== "morning" && view !== "face";
  const cards = (
    <>
      {view === "six" && <Meter frame={frame} at={k.sixTag} x={th.x} headY={th.y} r={th.r} value={RIVAL_THEN} until={k.mock} />}
      {showRival71 && <Meter frame={frame} at={view === "weather" || view === "seventy" ? k.tag71 : k.mockTag} x={th.x} headY={th.y} r={th.r} value={RIVAL_NOW} until={k.end} />}
      <Meter frame={frame} at={k.tag91} x={mh.x + 20} headY={mh.y} r={mh.r} value={FRIEND_NOW} until={k.end} />
      {(view === "weather" || view === "seventy") && (
        <Bubble frame={frame} at={k.bubble} until={k.seventy + 30} x={yh.x + 70} y={yh.y - yh.r - 70} text="Second place." size={30} side="right" />
      )}
      {(view === "hates" || view === "enemy") && <Medal frame={frame} at={view === "hates" ? k.medal : k.medal - 30} x={yh.x - 6} y={yh.y + yh.r + 62} scale={0.75} />}
      {view === "enemy" && <Glare frame={frame} at={k.enemy + 10} x1={yh.x + yh.r + 6} x2={th.x - th.r - 6} y={yh.y - 30} />}
    </>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Room frame={frame} cam={cam} mood={mood} you={you} youFace={yourFaceFor(view, frame, k)} minjun={minjunFor(view, frame, k)}
        kang={view === "room" ? kangLooking : null}
        props={<Rival frame={frame} x={r.x} pose={r.pose} face={r.face} held={r.held} />}
        cards={cards} />
      {view === "six" && <AbsoluteFill style={{ background: "#c79a5a", mixBlendMode: "multiply", opacity: 0.45 }} />}
      {view === "enemy" && (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,214,140,0.55), rgba(255,170,90,0.0) 60%)", mixBlendMode: "screen" }} />
      )}
      {sounds}
    </AbsoluteFill>
  );
};

export const second: Beat = { id: "Second", firstLine: 74, Component: SecondScene };
