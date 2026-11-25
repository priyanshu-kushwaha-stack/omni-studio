// Beat "The Rule" (script.md ## [00:30] The Rule), look C.
//   - the title card (ident C, brand/IdentC.tsx): the kitchen frame with the flatmate's 1 shrinks into a print under
//     the question, flips, and its back is the flat;
//   - the flat (plate kitchen-morning): close on your flatmate at the table with his 1, a paper diagram beside him
//     (parts/RuleDiagram.tsx): a head, a counter, a clock; "clicks" ticks the digit, "since midnight" sweeps the hand;
//     page two marks jokes, mistakes, spoken, typed, written; "Remember that" rings SPOKEN;
//   - the hallway (plate hallway-morning): you pass your flatmate; three close inserts of your face, tags FINE,
//     NEARLY THERE, LOVE IT; close on him with his 1; close on you looking up;
//   - the painted mirror (nothing over your head), the painted kettle (your nose enormous), the mirror close on your
//     eyes, a glint; the walk to the front door; your hand on the knob, the lanyard swinging, the door opens on light.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { C_FRAMES, Hi, IdentC } from "../../../../brand/IdentC";
import { camAt, current, findLine, HERO, linear, makeShot, ramp, type Beat, type Shot } from "../shared";
import { Counter } from "../parts/Counter";
import { aim, Clicks, counterOver, FLATMATE, headWorld, Lanyard, PaperTag, type Placed } from "../parts/FrameKit";
import { aimAt, inPlate } from "../parts/FrameLook";
import { Bowl, KitchenScene, KP, MATE_HEAD, MateAtTable, MateCount, mateLight, Radio, type KitchenState } from "../parts/ClickKitchen";
import { Diagram } from "../parts/RuleDiagram";
import { wordAt } from "../parts/RivalParts";
import { HALL, HallScene, KettleScene, MirrorScene } from "../sets/RuleFlat";
import { ClickPicture } from "./Click";

function times(shot: Shot) {
  const open = shot.from + C_FRAMES;
  const L = (p: string, s = 0) => shot.at(p, s);
  const W = (p: string, w: string) => wordAt(shot, p, w);
  const own = L("Your own? The mirror");
  return {
    ident: shot.from, open,
    over: Math.max(open + 4, L("Over every head")), midnight: W("Over every head", "since midnight"),
    clicks: W("It clicks the instant", "clicks"), page2: W("It clicks the instant", "Jokes"), joke: W("It clicks the instant", "Jokes"),
    wrong: W("It clicks the instant", "mistakes"),
    spoken: W("It counts what's spoken", "spoken"), typed: W("It counts what's spoken", "typed"), written: W("It counts what's spoken", "written"),
    remember: W("It counts what's spoken", "Remember"),
    hall: L("You say three things"), fine: W("You say three things", "Fine."), nearly: W("You say three things", "Nearly there"),
    love: W("You say three things", "Love it"), never: W("You say three things", "You've never"),
    own, mirror: W("Your own? The mirror", "The mirror"), kettle: W("Your own? The mirror", "The kettle"), nose: W("Your own? The mirror", "very large"),
    eyes: L("It isn't on your head"), glint: W("It isn't on your head", "in your eyes"),
    know: L("You don't need to see"), door: L("You step outside"), swing: L("You step outside", 0.45),
    end: shot.to,
  };
}
type T = ReturnType<typeof times>;

const INSERT = 14;
const HR = 46 * HALL.scale;

/** The flat: your flatmate at the table with his 1, eating; you are already in the hall. */
function flatState(frame: number): KitchenState {
  return {
    mate: { brows: "none", lids: 0.25, mouth: Math.floor(frame / 7) % 2 ? "o" : "flat", look: { x: 0.8, y: 0.5 }, blink: (frame + 5) % 83 < 4 },
    spoon: Math.min(1, (frame % 64) / 32), count: { base: 1 }, you: { mouth: "flat" }, youHere: false,
  };
}

const Flat: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const page1 = aimAt(MATE_HEAD, { x: 470, y: 620 }, 1.9);
  const page2 = aimAt(MATE_HEAD, { x: 430, y: 640 }, 2.05);
  const c = frame < k.page2 ? camAt(frame, [[k.open, page1], [k.page2, { ...page1, zoom: 2.0 }]])
    : camAt(frame, [[k.page2, page2], [k.hall, { ...page2, zoom: 2.2 }]]);
  const s = flatState(frame);
  return (
    <KitchenScene frame={frame} cam={inPlate(drift(c, frame, "flat", 2))} r={46 * KP.seat.scale} lights={[mateLight()]}
      far={<Radio waves={0} frame={frame} />} seated={<MateAtTable frame={frame} s={s} />}
      onTable={<><Bowl /><MateCount frame={frame} count={s.count!} /></>} />
  );
};

/** The hallway: you walk left toward the front door; your flatmate comes the other way with his 1. */
function hallPeople(frame: number, k: T) {
  const walk = linear(frame, k.hall, k.own);
  const you: Placed = { x: 1500 - walk * 520, y: HALL.floor, scale: HALL.scale, facing: -1, pose: frame < k.own ? walkPose(frame * 0.2) : { ...STAND, armB: [-165, 15] } };
  // he waits by the front door through your three words, then passes you on the way to the kitchen
  const go = k.love + INSERT;
  const mate: Placed = { x: 300 + linear(frame, go, k.own + 10) * 1600, y: HALL.floor - 70, scale: HALL.scale * 0.88, facing: 1,
    pose: frame < go ? STAND : walkPose(frame * 0.18 + 1) };
  return { you, mate };
}

const Hallway: React.FC<{ frame: number; k: T; cam: Camera; blur: number }> = ({ frame, k, cam, blur }) => {
  const { you, mate } = hallPeople(frame, k);
  const insert = [k.fine, k.nearly, k.love].some((t) => frame >= t && frame < t + INSERT);
  const lookUp = frame >= k.own;
  const c = counterOver(mate, 38);
  return (
    <HallScene cam={cam} blur={blur} actors={
      <>
        <Figure x={mate.x} y={mate.y} scale={mate.scale} facing={1} pose={mate.pose} head={FLATMATE.head} coat={FLATMATE.coat} time={frame}
          mouth="smile" look={{ x: 0.8, y: 0 }} />
        <Counter x={c.x} y={c.y} base={1} frame={frame} size={38} id="hall-mate" />
        <Figure x={you.x} y={you.y} scale={you.scale} facing={-1} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame} flow={0.2}
          brows={lookUp ? "raised" : "none"} mouth={insert ? (frame % 10 < 5 ? "open" : "smile") : "smile"} look={lookUp ? { x: 0.1, y: -1 } : { x: 0.8, y: 0 }} />
        <Lanyard f={you} swing={Math.sin(frame * 0.3) * 0.6} />
      </>
    } />
  );
};

function hallCam(frame: number, k: T): { c: Camera; blur: number } {
  const { you, mate } = hallPeople(frame, k);
  const h = headWorld(you);
  const ins = [k.fine, k.nearly, k.love].find((t) => frame >= t && frame < t + INSERT);
  const close = (z: number, at: { x: number; y: number }, sx: number, sy: number) => {
    const c = aimAt(at, { x: sx, y: sy }, z);
    return { c, blur: Math.min(18, (2 * HR * z / 1080 - 0.12) * 42) };
  };
  if (ins !== undefined) return close(3.0, h, 760, 600);
  if (frame >= k.own) return close(2.3 + 0.2 * linear(frame, k.own, k.mirror), h, 900, 680);
  if (frame >= k.love + INSERT + 40) return close(2.0, h, 1000, 620);
  if (frame >= k.love + INSERT) return close(2.1, headWorld(mate), 900, 620);
  if (frame >= k.fine + INSERT) return close(1.9, h, 980, 600);
  return { c: camAt(frame, [[k.hall, { x: 1000, y: 560, zoom: 1.12 }], [k.fine, { x: 1020, y: 560, zoom: 1.3 }]]), blur: 0 };
}

const FrontDoor: React.FC<{ frame: number; k: T; cam: Camera; blur: number }> = ({ frame, k, cam, blur }) => {
  const open = ramp(frame, k.swing, k.swing + 18);
  const walk = linear(frame, k.know, k.door);
  const base: Placed = { x: 1050 - walk * 480, y: HALL.floor, scale: HALL.scale, facing: -1, pose: frame < k.door ? walkPose(frame * 0.2) : STAND };
  const knob = { x: HALL.hinge + (HALL.knob.x - HALL.hinge) * (1 - 0.82 * open), y: HALL.knob.y };
  const you: Placed = frame >= k.door ? { ...base, pose: { ...STAND, armF: aim(base, knob), lean: 4 } } : base;
  const swing = Math.sin(frame * 0.35) * Math.max(0.2, 1 - linear(frame, k.door, k.door + 60));
  return (
    <HallScene cam={cam} blur={blur} open={open} actors={
      <>
        <Figure x={you.x} y={you.y} scale={you.scale} facing={-1} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame} flow={0.2}
          brows={open > 0 ? "raised" : "none"} mouth={open > 0 ? "o" : "smirk"} eyes={open > 0 ? 1.2 : 1} look={{ x: 0.9, y: -0.1 }} />
        <Lanyard f={you} swing={swing} />
      </>
    } />
  );
};

type View = "flat" | "hall" | "mirror" | "kettle" | "eyes" | "know" | "door";

const MIRROR = { x: HALL.glass.x + HALL.glass.w / 2, y: HALL.glass.y + HALL.glass.h * 0.5 };

const Picture: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const view = current<View>(frame, [[k.ident, "flat"], [k.hall, "hall"], [k.mirror, "mirror"], [k.kettle, "kettle"],
    [k.eyes, "eyes"], [k.know, "know"], [k.door, "door"]]);
  const d = (c: Camera, seed: string, amt = 2) => inPlate(drift(c, frame, seed, amt));
  switch (view) {
    case "flat": return <Flat frame={frame} k={k} />;
    case "hall": { const { c, blur } = hallCam(frame, k); return <Hallway frame={frame} k={k} cam={d(c, "hall")} blur={blur} />; }
    case "mirror": return <MirrorScene frame={frame} look={{ x: 0.1, y: -1 }} cam={d(camAt(frame, [[k.mirror, { ...MIRROR, zoom: 3.2 }], [k.kettle, { ...MIRROR, zoom: 3.45 }]]), "m", 1)} />;
    case "kettle": return <KettleScene frame={frame} nose={1 + ramp(frame, k.nose, k.nose + 10) * 1.4} cam={d(camAt(frame, [[k.kettle, { x: 1653, y: 486, zoom: 7 }], [k.eyes, { x: 1653, y: 490, zoom: 7.6 }]]), "k", 0.5)} />;
    case "eyes": return <MirrorScene frame={frame} look={{ x: 0, y: 0 }} glint={ramp(frame, k.glint, k.glint + 8)} cam={camAt(frame, [[k.eyes, { x: MIRROR.x, y: 316, zoom: 5.2 }], [k.know, { x: MIRROR.x, y: 318, zoom: 6.2 }]])} />;
    case "know": return <FrontDoor frame={frame} k={k} blur={4} cam={d(camAt(frame, [[k.know, { x: 900, y: 600, zoom: 1.35 }], [k.door, { x: 720, y: 590, zoom: 1.5 }]]), "kn")} />;
    default: return <FrontDoor frame={frame} k={k} blur={9} cam={d(camAt(frame, [[k.door, { x: 470, y: 470, zoom: 2.0 }], [k.swing, { x: 460, y: 465, zoom: 2.15 }], [k.end, { x: 430, y: 470, zoom: 2.4 }]]), "door")} />;
  }
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const first = findLine(shot.lines, "Leader: And I have never");
  const clickShot = makeShot(k.ident - 1, shot.clips, shot.lines, shot.clips[first].from - 36, shot.from, first);
  const tags: [string, number, number][] = [["FINE", k.fine, 170], ["NEARLY THERE", k.nearly, 300], ["LOVE IT", k.love, 430]];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture frame={frame} k={k} />
      <Diagram frame={frame} k={k} />
      {tags.map(([t, at, y], i) => <PaperTag key={t} frame={frame} at={at} until={k.own} text={t} x={1150 + (i % 2) * 40} y={y} size={64} tilt={i % 2 ? 3 : -3} />)}
      <Sequence from={k.ident} durationInFrames={C_FRAMES}>
        <IdentC
          front={<AbsoluteFill style={{ background: "#000" }}><ClickPicture frame={k.ident - 1} shot={clickShot} /></AbsoluteFill>}
          back={<AbsoluteFill style={{ background: "#000" }}><Picture frame={k.open} k={k} /></AbsoluteFill>}
          title={["What If You Saw", <>How Many Lies <Hi>Everyone Told?</Hi></>]}
        />
      </Sequence>
      <Clicks at={[k.clicks]} volume={0.45} />
      <Clicks at={[k.midnight]} volume={0.35} file="sfx/tick.wav" />
      {[k.over, k.page2].map((f) => <Sequence key={f} from={f} durationInFrames={24}><Audio src={staticFile("sfx/paper.wav")} volume={0.35} /></Sequence>)}
      {[k.fine, k.nearly, k.love].map((f) => <Sequence key={f} from={f} durationInFrames={20}><Audio src={staticFile("sfx/stamp.wav")} volume={0.45} /></Sequence>)}
      <Sequence from={k.swing} durationInFrames={40}><Audio src={staticFile("sfx/knock.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "Rule", first: "Over every head", lead: 4.2, Component: Scene };
