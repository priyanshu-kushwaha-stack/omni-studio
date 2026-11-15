// Beat "The Rule" (script.md v6 ## [01:07] The Rule; v6 lines 13-20). No title card (v6): the beat opens on the kitchen
// right after line 12. Times come from shot.v6 (story.json numbering). Every leaflet page is drawn on the cut's first
// frame and adds to itself as the lines go. The kitchen (the library `kitchen`, morning): the jar on the table, the
// leaflet, your brother with his cereal.
//
//   13  "The band came with a leaflet. Three rules." the kitchen; page one: the sleeper, the band, the thread and the
//       pale second you, the coins into the jar, the clock.
//   14  "One. You won't feel a thing." close on you.
//   15  "Two. Every brain stays separate": the link page, a ring round each head; "One brain, one band, one jar": stamps
//       BRAIN, BAND, JAR.
//   16  "Three. You won't remember the work." the table, two-shot. "Only crumbs": the crumbs page; a taste, a word, a
//       face as each is named; "Harmless, it says.": a tick.
//   17  "Why rent a brain?" you turn the page, he looks over. Page three: a dish of cells wired to a bat-and-ball game;
//       the bat starts hitting back ("began to get better"); "A whole brain for eight hours is a bargain": you and the jar.
//   18  page four: the wardrobe computer, its plug, its meter; "Computers cost money to run": the meter spins; "You're
//       already lying there": a paper you, lying flat, its meter at nothing.
//   19  your brother, the leaflet upside down over his cereal, chewing: "Still a scam."
//   20  "He reads the leaflet upside down": the two-shot; "And by Saturday he's wearing one": close on him, his eyes on
//       the band on the table.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { Mouth } from "@whatif/kit/rig/Figure";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { camAt, current, lineEnd, type Beat, type Shot } from "../shared";
import { lineAt, talk } from "./Chair.Rig";
import { BRO_HEAD, KitchenTable, YOU_HEAD, type KitchenState } from "./Rule.Kitchen";
import { LeafletInsert, LinkStamps, PageCrumbs, PageFour, PageLink, PageOne, PageThree } from "./Rule.Leaflet";

type T = ReturnType<typeof times>;

/** Every frame of the beat, from v6's clips. */
function times(clips: Clip[]) {
  const at = (i: number, p: number) => lineAt(clips, i, p);
  const from = (i: number) => clips[i].from;
  const page1 = at(13, 0.42); // "...a leaflet": page one, drawn
  const link = from(15) - 2; // "Two. Every brain stays separate."
  const crumbs = at(16, 0.36); // "Only crumbs"
  const page3 = at(17, 0.12); // "In 2022, brain cells in a dish..."
  const page4 = from(18) - 2; // "So why doesn't the AI just use a computer?"
  return {
    open: from(13) - 2,
    page1,
    feel: from(14) - 2, // "One. You won't feel a thing."
    link,
    rings: at(15, 0.22), // "Every brain stays separate"
    stamps: [at(15, 0.6), at(15, 0.74), at(15, 0.88)] as const, // "One brain, one band, one jar."
    remember: from(16) - 2, // "Three. You won't remember the work."
    crumbs,
    taste: crumbs - 12, // drawn on the cut's first frame
    word: at(16, 0.55),
    face: at(16, 0.64),
    tick: at(16, 0.86), // "Harmless, it says."
    why: from(17) - 2, // "Why rent a brain?"
    page3,
    better: at(17, 0.5), // "began to get better at it"
    bargain: at(17, 0.8), // "A whole brain for eight hours is a bargain."
    page4,
    cost: at(18, 0.58), // "Computers cost money to run."
    lying: at(18, 0.8), // "You're already lying there."
    upside: lineEnd(clips, 18) + 2, // the leaflet upside down over his cereal
    scam: [from(19), lineEnd(clips, 19)] as const, // "Still a scam."
    reads: from(20) - 2, // "He reads the leaflet upside down."
    saturday: at(20, 0.55), // "And by Saturday he's wearing one."
    end: from(21),
  };
}

/** Your faces and his, and what the two of you are doing, by the moment. */
function kitchenState(frame: number, k: T): KitchenState {
  const chew: Mouth = Math.floor(frame / 8) % 2 ? "o" : "flat";
  const spoon = ((frame - k.open) % 70) / 34;
  const reading = frame >= k.upside;
  const bro = reading
    ? { brows: "flat" as const, lids: 0.4, mouth: frame >= k.scam[0] - 2 ? talk(frame, k.scam[0], k.scam[1], chew) : chew, eyes: 1,
      look: frame >= k.saturday ? { x: 0.6, y: 0.75 } : { x: 0.3, y: 0.15 } }
    : frame >= k.why && frame < k.page3 ? { brows: "raised" as const, lids: 0.1, mouth: chew, eyes: 1.05, look: { x: 0.9, y: 0.5 } }
      : { brows: "flat" as const, lids: 0.45, mouth: chew, eyes: 1, look: { x: 0.8, y: 0.4 } };
  const you = frame >= k.bargain && frame < k.upside
      ? { brows: "raised" as const, lids: 0.1, mouth: "smile" as const, eyes: 1.05, look: { x: 0.9, y: 0.45 } }
      : frame >= k.upside
        ? { brows: "flat" as const, lids: 0.3, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0 } }
        : frame >= k.feel && frame < k.link ? { brows: "none" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: 0.4, y: -0.3 } }
          : { brows: "flat" as const, lids: 0.25, mouth: "flat" as const, eyes: 1, look: { x: 0.7, y: 0.6 } };
  return { you, bro, spoon: reading ? 0 : Math.min(1, spoon), reading, leafletOnTable: !reading, youBack: frame >= k.upside ? 1 : 0 };
}

/** The kitchen shots' cameras. */
function kitchenCam(frame: number, k: T, shot: string): Camera {
  switch (shot) {
    case "open": return camAt(frame, [[k.open, { x: 960, y: 620, zoom: 1.08 }], [k.page1, { x: 930, y: 640, zoom: 1.2 }]]);
    case "feel": return camAt(frame, [[k.feel, closeUp(YOU_HEAD.x + 60, YOU_HEAD.y, 2.6)], [k.link, closeUp(YOU_HEAD.x + 60, YOU_HEAD.y, 2.8)]]);
    case "remember": return camAt(frame, [[k.remember, { x: 930, y: 640, zoom: 1.4 }], [k.crumbs, { x: 920, y: 645, zoom: 1.5 }]]);
    case "why": return camAt(frame, [[k.why, { x: 960, y: 650, zoom: 1.3 }], [k.page3, { x: 1000, y: 650, zoom: 1.42 }]]);
    case "bargain": return camAt(frame, [[k.bargain, { x: 720, y: 680, zoom: 1.9 }], [k.page4, { x: 760, y: 690, zoom: 2.1 }]]);
    case "upside": return camAt(frame, [[k.upside, closeUp(BRO_HEAD.x - 90, BRO_HEAD.y, 2.3)], [k.reads, closeUp(BRO_HEAD.x - 90, BRO_HEAD.y, 2.45)]]);
    case "reads": return camAt(frame, [[k.reads, { x: 960, y: 640, zoom: 1.25 }], [k.saturday, { x: 1000, y: 640, zoom: 1.35 }]]);
    default: return camAt(frame, [[k.saturday, closeUp(BRO_HEAD.x - 120, BRO_HEAD.y + 40, 2.2)], [k.end, closeUp(BRO_HEAD.x - 120, BRO_HEAD.y + 40, 2.7)]]);
  }
}

/** The leaflet inserts' cameras: a slow push, closer on what the line is about. */
function sheetCam(frame: number, k: T, shot: string): Camera {
  const S = (x: number, y: number, zoom: number) => ({ x, y, zoom });
  switch (shot) {
    case "page1": return camAt(frame, [[k.page1, S(960, 580, 1.08)], [k.feel, S(980, 530, 1.25)]]);
    case "link": return camAt(frame, [[k.link, S(960, 520, 1.15)], [k.rings, S(950, 540, 1.3)], [k.stamps[0] - 4, S(960, 560, 1.12)], [k.remember, S(960, 570, 1.18)]]);
    case "crumbs": return camAt(frame, [[k.crumbs, S(960, 560, 1.12)], [k.tick, S(980, 540, 1.24)], [k.why, S(990, 540, 1.28)]]);
    case "page4": return camAt(frame, [[k.page4, S(760, 520, 1.3)], [k.cost, S(740, 470, 1.45)], [k.lying, S(960, 540, 1.08)], [k.upside, S(980, 540, 1.14)]]);
    // page three: the dish, then the game as the bat starts hitting back
    default: return camAt(frame, [[k.page3, S(960, 600, 1.0)], [k.better, S(950, 520, 1.3)], [k.bargain, S(950, 500, 1.42)]]);
  }
}

/** The beat's picture at a frame (no sound). */
const Picture: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.open, "open"], [k.page1, "page1"], [k.feel, "feel"], [k.link, "link"], [k.remember, "remember"],
    [k.crumbs, "crumbs"], [k.why, "why"], [k.page3, "page3"], [k.bargain, "bargain"], [k.page4, "page4"],
    [k.upside, "upside"], [k.reads, "reads"], [k.saturday, "saturday"]] as [number, string][]);
  if (shot === "page1" || shot === "link" || shot === "crumbs" || shot === "page3" || shot === "page4") {
    const cam = drift(sheetCam(frame, k, shot), frame, "leaflet", 2);
    const at = { page1: k.page1, link: k.link, crumbs: k.crumbs, page3: k.page3, page4: k.page4 }[shot];
    // every page is already drawn on the cut's first frame (its ink started before the cut)
    const pre = at - 40;
    return (
      <LeafletInsert frame={frame} at={at} cam={cam} tilt={shot === "page4" ? 1.5 : -2}
        over={shot === "link" ? <LinkStamps frame={frame} at={k.stamps} /> : undefined}>
        {shot === "page1" && <PageOne frame={frame} a={pre} work={pre} pays={pre} hour={pre} />}
        {shot === "link" && <PageLink frame={frame} a={pre} ringAt={k.rings} />}
        {shot === "crumbs" && <PageCrumbs frame={frame} taste={k.taste} word={k.word} face={k.face} tick={k.tick} />}
        {shot === "page3" && <PageThree frame={frame} a={pre} better={k.better} />}
        {shot === "page4" && <PageFour frame={frame} a={pre} cost={k.cost} lying={k.lying} />}
      </LeafletInsert>
    );
  }
  return <KitchenTable frame={frame} cam={drift(kitchenCam(frame, k, shot), frame, "rule", 3)} s={kitchenState(frame, k)} />;
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, v6 } = shot;
  const k = times(v6);
  const sheets = [k.page1, k.link, k.crumbs, k.page3, k.page4];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture frame={frame} k={k} />
      {sheets.map((f) => <Sequence key={f} from={f} durationInFrames={24}><Audio src={staticFile("sfx/paper.wav")} volume={0.35} /></Sequence>)}
      {k.stamps.map((f) => <Sequence key={f} from={f} durationInFrames={20}><Audio src={staticFile("sfx/stamp.wav")} volume={0.45} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "rule", firstLine: 10, Component: Scene };
