// Beat "Night Thirty" (script.md v7, ## [06:33]; story lines 58-63). The town has the whole city in it now; then three
// in the morning at the night desk, the film's one tender beat, warm and funny, and the turn: your eyes on the leads.
//   58   the inside town at dusk from the sky down: the NIGHT 30 tag; a paper tally draws itself on the sky (a night's
//        thin crimson line beside a year's teal wall, thirty times, no digits); down into a street of thousands at market
//        speed, a bride, a surgeon and kids among them (the city is in it now)
//   59   the post office: a letter in, the clerk thinks a year (a beard grows), a fat book out; the sender buckles under
//        it / the hat parade, a dozen hats under one blurred sun / a teenager says the word, smug; a grandparent beams and
//        says it too, with a sparkle; the teenager rolls their eyes
//   60   the night desk, one lamp, 3 a.m. on the clock: you chin on hand, NO NAPS on your chair; she comes in with two
//        mugs, puts one in front of you and sits on the desk
//   61   "So. My brother." she leans in; your lids come up
//   hold (4 s) she tells it, hands going, the mop propped beside her; you laugh once; she points at you: told you
//   62   two-shot / you grinning and wincing at the terrible part / her, mid-story / you sip, sheepish, the clock on
//   63   she mimes the kettle; your eyes slide: the lamp's cord, the kettle's lead, the taped socket; a small smile
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Tag } from "@whatif/kit/ui/Tag";
import { TOWN_FLOOR, TownBack, townLights } from "../sets/InsideTown";
import { Deep } from "../sets/common";
import { camAt, current, PASTELS, type Beat, type Shot } from "../shared";
import { Extra } from "./NightThirty.Hall";
import { DeskScene } from "./NightThirty.Desk";
import { Crowd, FatBook, InkBubble, PostOffice, SkyTally } from "./NightThirty.Parts";
import { handAt, headOf, lineTimes, type Body } from "./Timeline.Cast";

const FIRST = 58;

export function times(shot: Shot) {
  const L = lineTimes(shot.clips, FIRST);
  const hold = L.end(3);
  const g = L.from(4) - hold;
  return {
    start: shot.from, end: shot.to,
    tag: L.from(0) + 6, tally: [L.at(0, 0.06), L.at(0, 0.5)] as [number, number], down: [L.at(0, 0.58), L.at(0, 0.9)] as [number, number],
    post: L.from(1), letter: L.at(1, 0.03), think: [L.at(1, 0.12), L.at(1, 0.3)] as [number, number], book: L.at(1, 0.31),
    parade: L.at(1, 0.44), word: L.at(1, 0.63), teen: L.at(1, 0.66), gran: L.at(1, 0.83), roll: L.at(1, 0.92),
    desk: L.from(2), walk: [L.from(2), L.at(2, 0.5)] as [number, number], set: L.at(2, 0.55), sit: [L.at(2, 0.62), L.at(2, 0.84)] as [number, number],
    l61: L.from(3), l61End: L.end(3), hold, laugh: Math.round(hold + g * 0.5), point: Math.round(hold + g * 0.66),
    l62: L.from(4), terrible: L.at(4, 0.23), four: L.at(4, 0.41), thirty: L.at(4, 0.59), l62End: L.end(4),
    l63: L.from(5), cord: L.at(5, 0.17), kettle: L.at(5, 0.34), socket: L.at(5, 0.55), smile: L.at(5, 0.76),
  };
}
export type NT = ReturnType<typeof times>;

/** The inside town at dusk on its Stage: the set, `sky` in a far layer, `children` in front. */
const Town: React.FC<{ frame: number; cam: Camera; sky?: React.ReactNode; children?: React.ReactNode }> = ({ frame, cam, sky, children }) => (
  <LookContext.Provider value={setLook(townLights(), "dusk", cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={<><TownBack cam={cam} frame={frame} lit />{sky && <Deep cam={cam} depth={0.5} flat>{sky}</Deep>}</>} actors={<>{children}</>} />
  </LookContext.Provider>
);

const STREET = TOWN_FLOOR - 50;
const GRANNY = { head: "#cfcac0", coat: "#8a4a5a" };
const TEEN = { head: PASTELS[2], coat: "#3d6fb0", cap: "#1d9a8f" };

/** 59a: the post office: a letter in, a year's thought, a fat book out, and the sender buckling under it. */
const Post: React.FC<{ frame: number; k: NT }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.post, { x: 1040, y: 560, zoom: 1.2 }], [k.book, { x: 1100, y: 600, zoom: 1.4 }], [k.parade, { x: 1140, y: 610, zoom: 1.5 }]]), frame, "nt-po", 3);
  const caught = frame >= k.book + 12;
  const sag = caught ? Math.min(1, (frame - k.book - 12) / 6) : 0;
  const sender: Body = { x: 1470, y: STREET + 10, scale: 1.0, facing: -1,
    pose: caught ? { ...STAND, drop: 22 * sag, lean: 14 * sag, armF: [70, 40], armB: [60, 50], legF: [16, -30 * sag], legB: [-12, -30 * sag] }
      : { ...STAND, armF: frame < k.letter + 10 ? [100, 10] : [10, 10] } };
  const hand = handAt(sender);
  return (
    <Town frame={frame} cam={cam}>
      <PostOffice frame={frame} letter={k.letter} book={k.book} think={k.think} />
      <Extra body={sender} frame={frame} seed={9} head={PASTELS[5]} coat="#4a5c3f"
        mouth={caught ? "o" : frame > k.think[0] ? "flat" : "smile"} brows={caught ? "raised" : frame > k.think[0] ? "flat" : "none"}
        eyes={caught ? 1.3 : 1} lids={!caught && frame > k.think[0] + 20 ? 0.4 : 0} look={caught ? { x: 0.2, y: 0.9 } : { x: 1, y: 0.1 }} />
      {caught && <FatBook x={hand.x - 10} y={hand.y + 20} scale={0.8} rotate={-6} />}
    </Town>
  );
};

/** 59c: a teenager says the word, smug; a grandparent beams and says it too; the teenager's eyes roll. */
const Word: React.FC<{ frame: number; k: NT }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.word, { x: 950, y: 650, zoom: 1.8 }], [k.gran, { x: 930, y: 650, zoom: 1.9 }], [k.desk, { x: 940, y: 660, zoom: 2.0 }]]), frame, "nt-wd", 3);
  const granSays = frame >= k.gran;
  const rolled = frame >= k.roll;
  const teen: Body = { x: 1100, y: STREET, scale: 0.86, facing: -1, pose: granSays ? { ...STAND, armF: [10, 10], armB: [-10, 10] } : { ...STAND, lean: -4, armF: [95, -10] } };
  const gran: Body = { x: 800, y: STREET, scale: 1.08, facing: 1, pose: granSays ? { ...STAND, lean: -3, armF: [140, 20], armB: [120, 30] } : { ...STAND, lean: 4 } };
  const th = headOf(teen), gh = headOf(gran);
  return (
    <Town frame={frame} cam={cam}>
      <Extra body={gran} frame={frame} seed={6} head={GRANNY.head} coat={GRANNY.coat} lids={0.25}
        mouth={granSays ? (Math.floor((frame - k.gran) / 6) % 2 ? "open" : "smile") : "smile"} brows="raised" look={{ x: 1, y: granSays ? -0.2 : 0.1 }} />
      <Extra body={teen} frame={frame} seed={8} head={TEEN.head} coat={TEEN.coat} cap={TEEN.cap}
        lids={rolled ? 0.45 : granSays ? 0 : 0.3} mouth={rolled ? "flat" : granSays ? "o" : "smirk"} brows={rolled ? "flat" : granSays ? "raised" : "none"}
        eyes={granSays && !rolled ? 1.2 : 1} look={rolled ? { x: -0.2, y: -1 } : { x: 1, y: 0 }} />
      <InkBubble frame={frame} at={k.teen} until={k.gran - 4} x={th.x - 30} y={th.y - th.r - 10} side={-1} size={0.8} />
      <InkBubble frame={frame} at={k.gran + 2} until={k.desk} x={gh.x + 30} y={gh.y - gh.r - 10} size={0.9} sparkle />
    </Town>
  );
};

const NightThirty: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const view = current(frame, [[0, "town"], [k.post, "post"], [k.parade, "parade"], [k.word, "word"], [k.desk, "desk"]] as [number, string][]);
  let picture: React.ReactNode;
  if (view === "town") {
    const cam = drift(camAt(frame, [[k.start, { x: 960, y: 200, zoom: 1.25 }], [k.down[0], { x: 960, y: 230, zoom: 1.2 }], [k.down[1], { x: 960, y: 620, zoom: 1.05 }]]), frame, "nt-st", 4);
    picture = (
      <Town frame={frame} cam={cam} sky={<SkyTally frame={frame} from={k.tally[0]} to={k.tally[1]} />}>
        <Crowd frame={frame} n={16} rows={3} speed={2.2} city />
      </Town>
    );
  } else if (view === "post") picture = <Post frame={frame} k={k} />;
  else if (view === "parade") {
    const cam = drift(camAt(frame, [[k.parade, { x: 900, y: 420, zoom: 1.15 }], [k.word, { x: 1040, y: 540, zoom: 1.2 }]]), frame, "nt-pa", 3);
    picture = <Town frame={frame} cam={cam}><Crowd frame={frame} n={10} rows={2} speed={1.4} seed={4} hats /></Town>;
  } else if (view === "word") picture = <Word frame={frame} k={k} />;
  else picture = <DeskScene frame={frame} k={k} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {frame < k.post && <Tag at={k.tag} text="NIGHT 30" x={110} y={80} size={70} />}
      <Sequence from={k.book} durationInFrames={14}><Audio src={staticFile("sfx/snap.wav")} volume={0.45} /></Sequence>
      <Sequence from={k.set} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

export const nightThirty: Beat = { id: "NightThirty", firstLine: FIRST, Component: NightThirty };
