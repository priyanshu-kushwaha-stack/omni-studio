// Beat "Night Thirty" (script.md, ## [05:34]; story lines 57-64). The inside town at dusk and the count.
//   57   the town at dusk, lit windows, the sky counter blurring; the camera comes down from it into a street of thousands.
//   58   TAG NIGHT 30; the tally sheet (c03), no digits since the line says none: a thin night strip against a wall
//        of a year; a month of both; a hundred squares, ninety-nine of them in there ("almost every hour").
//   59   three cuts: you and two friends grey at the temples on your bench; the street worn smooth where you walk; a small
//        grave with a paper flower.      60  the flat's kitchen far away through a window, her shape at the table.
//   61   the post office: a letter in, a book out.      62  a parade of hats changing under one blurred sun; a
//        grandparent's word and a child's eye-roll.      63  you deep in friends inside; her alone at the kitchen table.
//   64   the kitchen calendar: a date circled in her pen, a drawn cake; your eyes on it from the doorway.
import { AbsoluteFill } from "remotion";
import { SEATED, seatedY, STAND, walkPose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { Tag } from "@whatif/kit/ui/Tag";
import { Sheet } from "../parts";
import { TOWN_FLOOR, TownBack, townLights } from "../sets/InsideTown";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage } from "@whatif/kit/stage/Stage";
import { camAt, current, FLATMATE, HERO, linear, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { clock, head, InkBubble, OwnSet, Person, type Body } from "./CityPlugsIn.Kit";
import { FLAT, Flat } from "./ColdApology.Flat";
import { Desk } from "./ColdApology.Inserts";
import { Bench, Crowd, FarWindow, Grave, PostOffice, Tally, WornStreet } from "./NightThirty.Parts";

const FLOOR = TOWN_FLOOR - 60;
const GRANNY = { head: "#cfcac0", coat: "#8a4a5a" } as const;
const CHILD = { head: PASTELS[2], coat: "#3d6fb0" } as const;

function times(clips: Clip[], start: number, endOfBeat: number) {
  const { from, at } = clock(clips);
  return {
    start, endOfBeat,
    tag: from(58), tally: at(58, 0.12), thin: at(58, 0.17), wall: at(58, 0.26), month: at(58, 0.38), monthEnd: at(58, 0.58), grid: at(58, 0.62),
    friends: from(59), street: at(59, 0.38), grave: at(59, 0.7),
    window: from(60),
    post: from(61), letter: at(61, 0.3), book: at(61, 0.74),
    parade: from(62), word: at(62, 0.52), roll: at(62, 0.78),
    deep: from(63), behind: at(63, 0.56),
    calendar: from(64), circle: [at(64, 0.08), at(64, 0.4)] as const, eyes: at(64, 0.55),
  };
}
type T = ReturnType<typeof times>;

/** The inside town on its Stage: the set behind, `children` in front, lit by dusk and the street lamps. */
const Town: React.FC<{ frame: number; cam: Camera; children?: React.ReactNode; back?: React.ReactNode }> = ({ frame, cam, children, back }) => (
  <LookContext.Provider value={setLook(townLights(), "dusk", cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<><TownBack cam={cam} frame={frame} lit />{back}</>} actors={<>{children}</>} />
  </LookContext.Provider>
);

/** 57: down from the sky counter into the street of thousands. */
const Street: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.start, { x: 960, y: 230, zoom: 1.9 }], [k.start + 50, { x: 960, y: 260, zoom: 1.8 }], [k.tag - 20, { x: 960, y: 600, zoom: 1.05 }]]), frame, "nt-st", 4);
  return <Town frame={frame} cam={cam}><Crowd frame={frame} n={16} rows={3} speed={2.2} /></Town>;
};

/** 59a: you and two friends of twenty years on your bench, grey at the temples, laughing at an old joke. */
const Friends: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.friends, { x: 960, y: 680, zoom: 1.5 }], [k.street, { x: 960, y: 690, zoom: 1.65 }]]), frame, "nt-fr", 4);
  const top = 840;
  const y = seatedY(top, 1.05);
  const laugh = Math.floor((frame - k.friends) / 14) % 3;
  const bodies: Body[] = [760, 960, 1160].map((x, i) => ({ x, y, scale: 1.05, facing: i === 2 ? -1 : 1, pose: { ...SEATED, lean: laugh === i ? -8 : 2, tilt: laugh === i ? -10 : 0 } }));
  return (
    <Town frame={frame} cam={cam}>
      <Bench x={960} top={top} w={620} />
      <Person body={bodies[0]} frame={frame} seed={1} temples who={{ head: PASTELS[0], coat: "#3f4a5c", mouth: laugh === 0 ? "open" : "smile", lids: 0.2, look: { x: 1, y: 0 } }} />
      <Person body={bodies[1]} frame={frame} seed={2} temples who={{ ...HERO, mouth: laugh === 1 ? "open" : "smile", lids: 0.25, look: { x: laugh === 2 ? 1 : -1, y: 0 } }} />
      <Person body={bodies[2]} frame={frame} seed={3} temples who={{ head: PASTELS[3], coat: "#5c3f4a", mouth: laugh === 2 ? "open" : "smile", lids: 0.2, look: { x: 1, y: 0 } }} />
    </Town>
  );
};

/** 59b: the street worn smooth where you walk; you walking it without looking. */
const Worn: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const p = linear(frame, k.street, k.grave);
  const body: Body = { x: mix(500, 1300, p), y: TOWN_FLOOR + 10, scale: 1.0, facing: 1, pose: walkPose(frame * 0.3) };
  const cam = drift({ x: mix(700, 1150, p), y: 640, zoom: 1.4 }, frame, "nt-wr", 3);
  return (
    <Town frame={frame} cam={cam}>
      <WornStreet />
      <Person body={body} frame={frame} seed={4} temples who={{ ...HERO, lids: 0.35, mouth: "flat", look: { x: 1, y: 0.2 } }} />
    </Town>
  );
};

/** 59c: a small grave with a paper flower; you stand over it, head bowed. */
const GraveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.grave, { x: 1000, y: 700, zoom: 1.7 }], [k.window, { x: 1020, y: 700, zoom: 1.85 }]]), frame, "nt-gr", 3);
  const body: Body = { x: 760, y: TOWN_FLOOR - 50, scale: 1.05, facing: 1, pose: { ...STAND, lean: 10, tilt: 14, armF: [20, 30], armB: [10, 30] } };
  return (
    <Town frame={frame} cam={cam}>
      <Grave x={1080} frame={frame} />
      <Person body={body} frame={frame} seed={5} temples who={{ ...HERO, brows: "sad", lids: 0.6, mouth: "flat", look: { x: 0.6, y: 0.8 } }} />
    </Town>
  );
};

/** 62: the hats change a dozen times across one blurred sun; then a grandparent's word and a child's eye-roll. */
const Parade: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  if (frame < k.word) {
    const cam = drift({ x: 960, y: mix(380, 520, linear(frame, k.parade, k.word)), zoom: 1.15 }, frame, "nt-pa", 3);
    return <Town frame={frame} cam={cam}><Crowd frame={frame} n={9} rows={2} speed={1.4} seed={4} hats /></Town>;
  }
  const g: Body = { x: 820, y: TOWN_FLOOR - 50, scale: 1.1, facing: 1, pose: { ...STAND, lean: 6, armF: [70, 40] } };
  const c: Body = { x: 1080, y: TOWN_FLOOR - 50, scale: 0.8, facing: -1, pose: { ...STAND, armF: [10, 10], armB: [-10, 10] } };
  const rolled = frame >= k.roll;
  const gh = head(g);
  const cam = drift(camAt(frame, [[k.word, { x: 950, y: 690, zoom: 1.9 }], [k.deep, { x: 970, y: 700, zoom: 2.05 }]]), frame, "nt-wd", 3);
  return (
    <Town frame={frame} cam={cam}>
      <Person body={g} frame={frame} seed={6} who={{ ...GRANNY, lids: 0.3, mouth: frame < k.roll ? "open" : "smile", brows: "raised", look: { x: 1, y: 0.3 } }} />
      <Person body={c} frame={frame} seed={8} who={{ ...CHILD, lids: rolled ? 0.35 : 0, mouth: rolled ? "smirk" : "flat", look: rolled ? { x: -0.3, y: -1 } : { x: 1, y: -0.2 }, brows: rolled ? "flat" : "none" }} />
      <InkBubble frame={frame} at={k.word + 6} until={k.deep} x={gh.x + 40} y={gh.y - 50} size={0.9} />
    </Town>
  );
};

/** 63a: you twenty years deep in people: friends all round you on the street, all talking to you. */
const Deep: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.deep, { x: 960, y: 640, zoom: 1.25 }], [k.behind, { x: 960, y: 650, zoom: 1.45 }]]), frame, "nt-dp", 3);
  const ring = [600, 720, 840, 1080, 1200, 1320];
  return (
    <Town frame={frame} cam={cam}>
      {ring.map((x, i) => (
        <Person key={i} body={{ x, y: TOWN_FLOOR - 70 - (i % 2) * 10, scale: 0.95, facing: x < 960 ? 1 : -1, pose: { ...STAND, armF: Math.floor(frame / 12 + i) % 3 === 0 ? [80, 30] : [10, 10] } }}
          frame={frame} seed={i + 10} temples={i % 2 === 0}
          who={{ head: PASTELS[(i * 3) % PASTELS.length], coat: ["#3f4a5c", "#5c3f4a", "#4a5c3f"][i % 3], mouth: Math.floor(frame / 10 + i) % 2 ? "smile" : "open", look: { x: 1, y: 0 } }} />
      ))}
      <Person body={{ x: 960, y: TOWN_FLOOR - 50, scale: 1.05, facing: 1, pose: STAND }} frame={frame} seed={20} temples
        who={{ ...HERO, mouth: "smile", lids: 0.2, look: { x: Math.sin(frame / 14), y: 0 } }} />
    </Town>
  );
};

const NightThirty: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = shot.frame;
  const k = times(shot.clips, shot.from, shot.to);
  const view = current(frame, [[0, "street"], [k.tally, "tally"], [k.friends, "friends"], [k.street, "worn"], [k.grave, "grave"], [k.window, "window"],
    [k.post, "post"], [k.parade, "parade"], [k.deep, "deep"], [k.behind, "behind"], [k.calendar, "calendar"], [k.eyes, "eyes"]] as [number, string][]);
  let picture: React.ReactNode = null;
  if (view === "street") picture = <Street frame={frame} k={k} />;
  if (view === "tally") {
    const cam = drift({ x: 960, y: 560, zoom: mix(1.0, 1.08, linear(frame, k.tally, k.friends)) }, frame, "nt-ta", 4);
    picture = (
      <OwnSet mood="dusk" cam={cam} back={<Desk />}>
        <Sheet frame={frame} at={k.tally} x={960} y={560} w={1300} h={760} tilt={-1}>
          <Tally frame={frame} thin={k.thin} wall={k.wall} month={k.month} monthEnd={k.monthEnd} grid={k.grid} />
        </Sheet>
      </OwnSet>
    );
  }
  if (view === "friends") picture = <Friends frame={frame} k={k} />;
  if (view === "worn") picture = <Worn frame={frame} k={k} />;
  if (view === "grave") picture = <GraveShot frame={frame} k={k} />;
  if (view === "window") {
    const cam = drift(camAt(frame, [[k.window, { x: 960, y: 500, zoom: 1.0 }], [k.post, { x: 960, y: 500, zoom: 1.6 }]]), frame, "nt-wi", 3);
    picture = <OwnSet mood="dusk" cam={cam} back={<FarWindow frame={frame} />} />;
  }
  if (view === "post") {
    const cam = drift(camAt(frame, [[k.post, { x: 1000, y: 560, zoom: 1.2 }], [k.book, { x: 980, y: 600, zoom: 1.45 }]]), frame, "nt-po", 3);
    const sender: Body = { x: 1480, y: FLOOR + 10, scale: 1.0, facing: -1, pose: { ...STAND, armF: frame < k.letter + 10 ? [100, 10] : [10, 10] } };
    picture = (
      <Town frame={frame} cam={cam} back={<></>}>
        <PostOffice frame={frame} letter={k.letter} book={k.book} />
        <Person body={sender} frame={frame} seed={9} who={{ head: PASTELS[5], coat: "#4a5c3f", mouth: frame >= k.book ? "o" : "flat", brows: frame >= k.book ? "raised" : "none", eyes: frame >= k.book ? 1.2 : 1, look: { x: 1, y: 0.2 } }} />
      </Town>
    );
  }
  if (view === "parade") picture = <Parade frame={frame} k={k} />;
  if (view === "deep") picture = <Deep frame={frame} k={k} />;
  if (view === "behind" || view === "calendar" || view === "eyes") {
    const her: Body = { x: FLAT.herChair.x, y: seatedY(FLAT.herChair.top, 1.12), scale: 1.12, facing: 1, pose: { ...SEATED, lean: 8, armF: [60, 60], armB: [40, 80] } };
    const you: Body = { x: FLAT.door.x + 95, y: FLAT.floor, scale: 1.12, facing: -1, pose: STAND };
    const yh = head(you);
    const cam = view === "behind"
      ? camAt(frame, [[k.behind, { x: 1050, y: 640, zoom: 1.35 }], [k.calendar, { x: 1050, y: 650, zoom: 1.5 }]])
      : view === "calendar"
        ? camAt(frame, [[k.calendar, FLAT.cameras.calendar], [k.eyes, { ...FLAT.cameras.calendar, zoom: 4.6 }]])
        : camAt(frame, [[k.eyes, closeUp(yh.x - 40, yh.y, 2.6)], [k.endOfBeat, closeUp(yh.x - 40, yh.y, 2.9)]]);
    picture = (
      <Flat cam={drift(cam, frame, "nt-fl", 3)} frame={frame} mood="dusk" circle={ramp(frame, k.circle[0], k.circle[1])}>
        {view === "behind" && <Person body={her} frame={frame} seed={3} who={{ ...FLATMATE, brows: "sad", lids: 0.45, mouth: "flat", look: { x: 1, y: 0.4 } }} />}
        {view === "eyes" && <Person body={you} frame={frame} seed={7} who={{ ...HERO, brows: "worry", lids: 0.1, mouth: "flat", look: { x: 1, y: 0.35 } }} />}
      </Flat>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {frame >= k.tag && frame < k.friends && <Tag at={k.tag} text="NIGHT 30" x={110} y={80} size={70} />}
    </AbsoluteFill>
  );
};

export const nightThirty: Beat = { id: "NightThirty", firstLine: 57, Component: NightThirty };
