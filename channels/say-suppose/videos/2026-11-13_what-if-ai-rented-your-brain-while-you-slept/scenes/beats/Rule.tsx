// Beat "The Rule" (script.md v3 ## [01:05] The Rule; v3 lines 15-26). Times come from shot.v3 (v3 numbering); phrase
// shares (p) are from the takes' word timings. The kitchen (the library `kitchen`, morning): the jar on the table, the
// leaflet, your brother with his cereal.
//
//   15  the title card (ident C, channels/say-suppose/brand/IdentC.tsx) plays first: Night One's last frame shrinks to a
//       paper print under the question, flips, and opens on the kitchen. "The band came with a leaflet": the leaflet
//       unfolds (at once if the card is still up, then as soon as it opens). "It sets out the deal."
//   16  "Wear the band to bed": page one, the sleeper and the band; "the company runs its work on your brain": the
//       dotted thread and the pale second you at its desk.
//   17  "And every morning, the band pays you, by the hour.": coins into a jar on "pays you", a clock on "by the hour".
//   18  "You won't feel a thing." close on you. "One company can link many bands": one laptop, three sleepers threaded
//       to it.
//   19  "each brain stays separate": a ring round each head; "One brain, one band, one jar": stamps BRAIN, BAND, JAR.
//   20  "And you won't remember the work. Only small leftovers." the table, two-shot. "The leaflet calls them crumbs":
//       the crumbs page; a taste, a word, a face drawn on it as each is named.
//   21  "It says they're harmless.": a tick.
//   22  "Why would anyone want a sleeping brain?" you turn the page, he looks over. "The leaflet explains that too.":
//       page two, a paper you.
//   23  "Your brain": its head shaded in; "about twenty watts": a bulb glows beside it; "the leaflet calls that unused
//       power": the bulb dims.
//   24  page three: a dish of cells wired to a bat-and-ball game; the bat starts hitting back ("began to get better");
//       "So a whole brain for eight hours is a bargain": you and the jar.
//   25  your brother, the leaflet upside down over his cereal, chewing: "Still a scam."
//   26  "He reads the leaflet upside down": the two-shot; "And by Saturday he's wearing one": close on him, his eyes on
//       the band on the table.
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile } from "remotion";
import type { Mouth } from "@whatif/kit/rig/Figure";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { C_FRAMES, Hi, IdentC } from "../../../../brand/IdentC";
import { camAt, current, lineEnd, type Beat, type Shot } from "../shared";
import { lineAt, talk } from "./Chair.Rig";
import { NightOnePicture } from "./NightOne";
import { BRO_HEAD, KitchenTable, YOU_HEAD, type KitchenState } from "./Rule.Kitchen";
import { LeafletInsert, LinkStamps, PageCrumbs, PageLink, PageOne, PageThree, PageTwo } from "./Rule.Leaflet";

type T = ReturnType<typeof times>;

/** The beat opens 6 frames after line 14 ends: the title card has a 4.1 s gap of its own before "The band came with a
 *  leaflet" (owner, 2026-11-13: "More clarity around leaflet says and band.. Around 1:00"). v3 numbering. */
const ruleOpen = (v3: Clip[]) => v3[14].from + v3[14].frames + 6;

function times(clips: Clip[]) {
  const at = (i: number, p: number) => lineAt(clips, i, p);
  const from = (i: number) => clips[i].from;
  const ident = ruleOpen(clips); // the card plays in its own silence after line 14 (timing.yaml), not over line 15
  const open = ident + C_FRAMES; // the card has opened on the kitchen
  return {
    ident,
    open,
    page1: Math.max(open + 6, at(15, 0.02)), // "The band came with a leaflet": it unfolds
    sleeper: Math.max(open + 22, from(16)), // "Wear the band to bed"
    work: at(16, 0.56), // "the company runs its work on your brain"
    pays: at(17, 0.48), // "the band pays you"
    hour: at(17, 0.69), // "by the hour"
    feel: from(18) - 2, // "You won't feel a thing."
    link: at(18, 0.29), // "One company can link many bands"
    rings: at(19, 0.2), // "each brain stays separate"
    stamps: [at(19, 0.57), at(19, 0.73), at(19, 0.87)] as const, // "One brain, one band, one jar."
    remember: from(20) - 2, // "And you won't remember the work."
    crumbs: at(20, 0.44), // "The leaflet calls them crumbs"
    taste: at(20, 0.68),
    word: at(20, 0.74),
    face: at(20, 0.8),
    tick: at(21, 0.46), // "It says they're harmless."
    why: from(22) - 2, // "Why would anyone want a sleeping brain?"
    page2: at(22, 0.55), // "The leaflet explains that too."
    head: from(23), // "Your brain"
    bulb: at(23, 0.19), // "about twenty watts"
    dim: at(23, 0.78), // "the leaflet calls that unused power"
    page3: from(24) - 2, // "It's true. In 2022, brain cells in a dish..."
    better: at(24, 0.5), // "began to get better at it"
    bargain: at(24, 0.76), // "So a whole brain for eight hours is a bargain."
    upside: lineEnd(clips, 24) + 2, // the leaflet upside down over his cereal
    scam: [from(25), lineEnd(clips, 25)] as const, // "Still a scam."
    reads: from(26) - 2, // "He reads the leaflet upside down."
    saturday: at(26, 0.55), // "And by Saturday he's wearing one."
    end: from(27),
  };
}

/** Your faces and his, and what the two of you are doing, by the moment. */
function kitchenState(frame: number, k: T): KitchenState {
  const chew: Mouth = Math.floor(frame / 8) % 2 ? "o" : "flat";
  const spoon = ((frame - k.ident) % 70) / 34;
  const reading = frame >= k.upside;
  const bro = reading
    ? { brows: "flat" as const, lids: 0.4, mouth: frame >= k.scam[0] - 2 ? talk(frame, k.scam[0], k.scam[1], chew) : chew, eyes: 1,
      look: frame >= k.saturday ? { x: 0.6, y: 0.75 } : { x: 0.3, y: 0.15 } }
    : frame >= k.why && frame < k.page2 ? { brows: "raised" as const, lids: 0.1, mouth: chew, eyes: 1.05, look: { x: 0.9, y: 0.5 } }
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
    case "open": return camAt(frame, [[k.ident, { x: 960, y: 620, zoom: 1.08 }], [k.page1, { x: 930, y: 640, zoom: 1.18 }]]);
    case "feel": return camAt(frame, [[k.feel, closeUp(YOU_HEAD.x + 60, YOU_HEAD.y, 2.6)], [k.link, closeUp(YOU_HEAD.x + 60, YOU_HEAD.y, 2.8)]]);
    case "remember": return camAt(frame, [[k.remember, { x: 930, y: 640, zoom: 1.4 }], [k.crumbs, { x: 920, y: 645, zoom: 1.5 }]]);
    case "why": return camAt(frame, [[k.why, { x: 960, y: 650, zoom: 1.3 }], [k.page2, { x: 1000, y: 650, zoom: 1.42 }]]);
    case "bargain": return camAt(frame, [[k.bargain, { x: 720, y: 680, zoom: 1.9 }], [k.upside, { x: 760, y: 690, zoom: 2.1 }]]);
    case "upside": return camAt(frame, [[k.upside, closeUp(BRO_HEAD.x - 90, BRO_HEAD.y, 2.3)], [k.reads, closeUp(BRO_HEAD.x - 90, BRO_HEAD.y, 2.45)]]);
    case "reads": return camAt(frame, [[k.reads, { x: 960, y: 640, zoom: 1.25 }], [k.saturday, { x: 1000, y: 640, zoom: 1.35 }]]);
    default: return camAt(frame, [[k.saturday, closeUp(BRO_HEAD.x - 120, BRO_HEAD.y + 40, 2.2)], [k.end, closeUp(BRO_HEAD.x - 120, BRO_HEAD.y + 40, 2.7)]]);
  }
}

/** The leaflet inserts' cameras: a slow push, closer on what the line is about. */
function sheetCam(frame: number, k: T, shot: string): Camera {
  const S = (x: number, y: number, zoom: number) => ({ x, y, zoom });
  switch (shot) {
    // page one: the leaflet card (line 15) is up at first, lower left: the sheet sits high until it has gone
    case "page1": return camAt(frame, [[k.page1, S(960, 600, 1.05)], [k.work, S(930, 560, 1.15)], [k.pays, S(980, 540, 1.2)], [k.feel, S(990, 520, 1.28)]]);
    case "link": return camAt(frame, [[k.link, S(960, 520, 1.15)], [k.rings, S(950, 540, 1.3)], [k.stamps[0] - 4, S(960, 560, 1.12)], [k.remember, S(960, 570, 1.18)]]);
    // the crumbs card (line 20) is up from "crumbs" to the tick: the drawings stay in the upper half
    case "crumbs": return camAt(frame, [[k.crumbs, S(960, 560, 1.12)], [k.why, S(960, 540, 1.24)]]);
    case "page2": return camAt(frame, [[k.page2, S(900, 540, 1.15)], [k.head, S(820, 520, 1.3)], [k.bulb, S(980, 510, 1.32)], [k.page3, S(1000, 500, 1.4)]]);
    // page three: the IT'S TRUE card (line 24) is up for its first 5.5 s: the dish stays above it
    default: return camAt(frame, [[k.page3, S(960, 600, 1.0)], [k.better, S(960, 590, 1.06)], [k.bargain, S(960, 580, 1.1)]]);
  }
}

/** The beat's picture at a frame (no sound). */
const Picture: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.ident, "open"], [k.page1, "page1"], [k.feel, "feel"], [k.link, "link"], [k.remember, "remember"],
    [k.crumbs, "crumbs"], [k.why, "why"], [k.page2, "page2"], [k.page3, "page3"], [k.bargain, "bargain"],
    [k.upside, "upside"], [k.reads, "reads"], [k.saturday, "saturday"]] as [number, string][]);
  if (shot === "page1" || shot === "link" || shot === "crumbs" || shot === "page2" || shot === "page3") {
    const cam = drift(sheetCam(frame, k, shot), frame, "leaflet", 2);
    const at = { page1: k.page1, link: k.link, crumbs: k.crumbs, page2: k.page2, page3: k.page3 }[shot];
    return (
      <LeafletInsert frame={frame} at={at} cam={cam} tilt={shot === "page2" ? 1.5 : -2}
        over={shot === "link" ? <LinkStamps frame={frame} at={k.stamps} /> : undefined}>
        {shot === "page1" && <PageOne frame={frame} a={k.sleeper} work={k.work} pays={k.pays} hour={k.hour} />}
        {shot === "link" && <PageLink frame={frame} a={k.link + 4} ringAt={k.rings} />}
        {shot === "crumbs" && <PageCrumbs frame={frame} taste={k.taste} word={k.word} face={k.face} tick={k.tick} />}
        {shot === "page2" && <PageTwo frame={frame} a={k.page2 + 8} head={k.head} bulb={k.bulb} dim={k.dim} />}
        {shot === "page3" && <PageThree frame={frame} a={k.page3 + 8} better={k.better} />}
      </LeafletInsert>
    );
  }
  return <KitchenTable frame={frame} cam={drift(kitchenCam(frame, k, shot), frame, "rule", 3)} s={kitchenState(frame, k)} />;
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, v3 } = shot;
  const k = times(v3);
  const sheets = [k.page1, k.link, k.crumbs, k.page2, k.page3];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture frame={frame} k={k} />
      {/* The title card: Night One's last frame shrinks into a print under the question, flips, opens on the kitchen. */}
      <Sequence from={k.ident} durationInFrames={C_FRAMES}>
        <IdentC
          front={<Freeze frame={k.ident - 1}><AbsoluteFill style={{ background: "#000" }}><NightOnePicture frame={k.ident - 1} clips={v3} /></AbsoluteFill></Freeze>}
          back={<Freeze frame={k.open}><AbsoluteFill style={{ background: "#000" }}><Picture frame={k.open} k={k} /></AbsoluteFill></Freeze>}
          title={["What if AI rented", <>your brain <Hi>while you slept?</Hi></>]}
        />
      </Sequence>
      {sheets.map((f) => <Sequence key={f} from={f} durationInFrames={24}><Audio src={staticFile("sfx/paper.wav")} volume={0.35} /></Sequence>)}
      {k.stamps.map((f) => <Sequence key={f} from={f} durationInFrames={20}><Audio src={staticFile("sfx/stamp.wav")} volume={0.45} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "rule", firstLine: 10, Component: Scene, openAt: ruleOpen };


