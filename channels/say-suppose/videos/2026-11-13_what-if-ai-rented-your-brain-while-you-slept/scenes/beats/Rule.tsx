// Beat "The Rule" (script.md ## [00:53] The Rule; narration lines 10-16). The kitchen (the library `kitchen`,
// morning): the jar on the table, the leaflet, your brother with his cereal.
//
//   10  the title card (ident C, channels/say-suppose/brand/IdentC.tsx) plays first, 4 s: Night One's last frame
//       shrinks to a paper print under the question, flips, and opens on the kitchen. "...your brain runs whatever
//       they've rented it for": the leaflet unfolds top-down and its page one draws itself (the sleeper, the band, the
//       dotted thread, the pale second you at its desk, coins into a jar, a clock: "pays you by the hour").
//   11  "You feel nothing." close on you. "One job can link many bands": one laptop, three sleepers threaded to it;
//       "each brain stays its own": a ring round each head; "One brain, one band, one jar": stamps BRAIN, BAND, JAR.
//   12  "And you remember nothing." the table, two-shot. "Except the crumbs": a taste, a word, a face drawn on the
//       leaflet; "harmless": a tick. "Remember that.": close on you.
//   13  "Why would anyone want a sleeping brain? The leaflet again.": you turn the page, he looks over. Page two: a
//       paper you, a slice of the head shaded (2%), a bar a fifth full (20% of the energy), a bulb (20 watts) that dims
//       on "nobody's using them".
//   14  page three: a dish of cells wired to a bat-and-ball game; the bat starts hitting back ("within five
//       minutes"); "So a whole brain for eight hours is a bargain": you and the jar.
//   15  your brother, the leaflet upside down over his cereal, chewing: "Still a scam."
//   16  "He reads the leaflet upside down": the two-shot; "And by Saturday he's wearing one": close on him, his eyes on
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

function times(clips: Clip[]) {
  const at = (i: number, p: number) => lineAt(clips, i, p);
  const from = (i: number) => clips[i].from;
  const ident = from(10);
  return {
    ident,
    open: ident + C_FRAMES, // the card has opened on the kitchen
    page1: Math.max(ident + C_FRAMES + 24, at(10, 0.6)), // "...whatever they've rented it for"
    feel: from(11) - 2, // "You feel nothing."
    link: at(11, 0.13), // "One job can link many bands"
    rings: at(11, 0.38), // "but the leaflet says each brain stays its own"
    stamps: [at(11, 0.73), at(11, 0.84), at(11, 0.93)] as const, // "One brain, one band, one jar."
    remember: from(12) - 2, // "And you remember nothing."
    crumbs: at(12, 0.17), // "Except the crumbs"
    taste: at(12, 0.31),
    word: at(12, 0.4),
    face: at(12, 0.47),
    tick: at(12, 0.78), // "harmless"
    that: at(12, 0.86), // "Remember that."
    why: from(13) - 2, // "Why would anyone want a sleeping brain? The leaflet again."
    page2: at(13, 0.31),
    slice: at(13, 0.41), // "about two per cent of you"
    bar: at(13, 0.53), // "burns about twenty per cent of your energy"
    bulb: at(13, 0.72), // "about twenty watts"
    dim: at(13, 0.88), // "And tonight nobody's using them."
    page3: from(14) - 2, // "Brain cells in a dish..."
    better: at(14, 0.47), // "began to get better at it"
    bargain: at(14, 0.72), // "So a whole brain for eight hours is a bargain."
    upside: lineEnd(clips, 14) + 2, // the leaflet upside down over his cereal
    scam: [from(15), lineEnd(clips, 15)] as const, // "Still a scam."
    reads: from(16) - 2, // "He reads the leaflet upside down."
    saturday: at(16, 0.5), // "And by Saturday he's wearing one."
    end: from(17),
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
  const you = frame >= k.that && frame < k.why
    ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.1, look: { x: 0.25, y: -0.05 } }
    : frame >= k.bargain && frame < k.upside
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
    case "that": return camAt(frame, [[k.that, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y, 2.7)], [k.why, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y, 2.95)]]);
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
    case "page1": return camAt(frame, [[k.page1, S(960, 560, 1.12)], [k.feel, S(900, 520, 1.3)]]);
    case "link": return camAt(frame, [[k.link, S(960, 520, 1.15)], [k.rings, S(950, 540, 1.3)], [k.stamps[0] - 4, S(960, 560, 1.12)], [k.remember, S(960, 570, 1.18)]]);
    case "crumbs": return camAt(frame, [[k.crumbs, S(960, 520, 1.2)], [k.that, S(940, 540, 1.38)]]);
    case "page2": return camAt(frame, [[k.page2, S(900, 540, 1.15)], [k.bar, S(800, 520, 1.35)], [k.bulb, S(1150, 500, 1.5)], [k.page3, S(1180, 480, 1.7)]]);
    default: return camAt(frame, [[k.page3, S(960, 480, 1.2)], [k.better, S(960, 440, 1.5)], [k.bargain, S(960, 430, 1.62)]]);
  }
}

/** The beat's picture at a frame (no sound). */
const Picture: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.ident, "open"], [k.page1, "page1"], [k.feel, "feel"], [k.link, "link"], [k.remember, "remember"],
    [k.crumbs, "crumbs"], [k.that, "that"], [k.why, "why"], [k.page2, "page2"], [k.page3, "page3"], [k.bargain, "bargain"],
    [k.upside, "upside"], [k.reads, "reads"], [k.saturday, "saturday"]] as [number, string][]);
  if (shot === "page1" || shot === "link" || shot === "crumbs" || shot === "page2" || shot === "page3") {
    const cam = drift(sheetCam(frame, k, shot), frame, "leaflet", 2);
    const at = { page1: k.page1, link: k.link, crumbs: k.crumbs, page2: k.page2, page3: k.page3 }[shot];
    return (
      <LeafletInsert frame={frame} at={at} cam={cam} tilt={shot === "page2" ? 1.5 : -2}
        over={shot === "link" ? <LinkStamps frame={frame} at={k.stamps} /> : undefined}>
        {shot === "page1" && <PageOne frame={frame} a={k.page1 + 8} />}
        {shot === "link" && <PageLink frame={frame} a={k.link + 4} ringAt={k.rings} />}
        {shot === "crumbs" && <PageCrumbs frame={frame} taste={k.taste} word={k.word} face={k.face} tick={k.tick} />}
        {shot === "page2" && <PageTwo frame={frame} a={k.page2 + 8} slice={k.slice} bar={k.bar} bulb={k.bulb} dim={k.dim} />}
        {shot === "page3" && <PageThree frame={frame} a={k.page3 + 8} better={k.better} />}
      </LeafletInsert>
    );
  }
  return <KitchenTable frame={frame} cam={drift(kitchenCam(frame, k, shot), frame, "rule", 3)} s={kitchenState(frame, k)} />;
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips);
  const sheets = [k.page1, k.link, k.crumbs, k.page2, k.page3];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture frame={frame} k={k} />
      {/* The title card: Night One's last frame shrinks into a print under the question, flips, opens on the kitchen. */}
      <Sequence from={k.ident} durationInFrames={C_FRAMES}>
        <IdentC
          front={<Freeze frame={k.ident - 1}><AbsoluteFill style={{ background: "#000" }}><NightOnePicture frame={k.ident - 1} clips={clips} /></AbsoluteFill></Freeze>}
          back={<Freeze frame={k.open}><AbsoluteFill style={{ background: "#000" }}><Picture frame={k.open} k={k} /></AbsoluteFill></Freeze>}
          title={["What if AI rented", <>your brain <Hi>while you slept?</Hi></>]}
        />
      </Sequence>
      {sheets.map((f) => <Sequence key={f} from={f} durationInFrames={24}><Audio src={staticFile("sfx/paper.wav")} volume={0.35} /></Sequence>)}
      {k.stamps.map((f) => <Sequence key={f} from={f} durationInFrames={20}><Audio src={staticFile("sfx/stamp.wav")} volume={0.45} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "rule", firstLine: 10, Component: Scene };


