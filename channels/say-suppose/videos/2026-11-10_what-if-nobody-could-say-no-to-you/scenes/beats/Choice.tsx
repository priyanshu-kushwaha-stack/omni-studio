// Beat "The choice" (script.md, ## [10:20] The choice; narration lines 96-104). Same pattern as Change.tsx: `times()`
// from the clips, one component per shot, the beat picks by frame. The backstage corridor (Hall view "corridor").
//
//   96    the exit door opens, Dev comes down the corridor holding the envelope out; close on his face: not smiling.
//   97    Dev: "That was bad. Really bad." Two-shot; you take the envelope.
//   98    over your shoulder on Dev, the first face all week that isn't the smile; close on you.
//   99    Dev: "I'm pulling my sign-off. Monday."
//   100   insert, the meeting page: a crimson line draws through Dev's signature; the tangled sketch folds flat.
//   101   Dev: "I'm done. I'm going." He shoulders his bag and turns for the exit.
//   102   close on you, one word away; Dev walks away down the corridor; your eyes drop to the flyer stack; closer.
//   103   you grab a flyer, tear a strip; insert, you write DO YOU WANT TO STAY? on its back with the pen from your scarf.
//   104   you hold it out at arm's length; Dev stops at the door and turns.
//   then  the wordless peak (PaperBeat.Peak.tsx), which starts in this beat's frames.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { headAt, Sheet } from "../parts";
import { aimArm, handAt, type Body } from "../parts2";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { HallBack, HALL_CORRIDOR } from "../sets/Hall";
import { CORRIDOR, Dev, Envelope, MEETING_PAGE, MeetingPage, Pen, Strip, STRIP, talking } from "./Choice.Props";
import { PaperPeak, peakTimes } from "./PaperBeat.Peak";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[]) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    enter: from(96), // the door opens; Dev walks in with the envelope out
    arrive: at(96, 0.4), // he stops in front of you
    noSmile: at(96, 0.44), // close on his face: "He isn't smiling."
    bad: from(97) - 3, // "That was bad. Really bad."
    badTo: lineEnd(clips, 97),
    take: lineEnd(clips, 97) - 4, // you take the envelope
    face: from(98) + 16, // over your shoulder on him
    you: at(98, 0.55), // close on you
    pull: from(99) - 3, // "I'm pulling my sign-off. Monday."
    pullTo: lineEnd(clips, 99),
    page: from(100) - 3, // insert: the meeting page
    strike: at(100, 0.16),
    strikeTo: at(100, 0.34),
    fold: at(100, 0.58),
    foldTo: at(100, 0.78),
    going: from(101) - 4, // "I'm done. I'm going.": the bag, the turn
    goingTo: lineEnd(clips, 101),
    turn: from(101) + 14,
    word: from(102), // close on you, one word away
    open: at(102, 0.1),
    away: at(102, 0.27), // wide: he walks away down the corridor
    door: at(102, 0.5), // medium: his back, the door ahead
    flyers: at(102, 0.72), // close: your eyes drop to the flyers
    power: at(102, 0.88), // "The power, or the person?"
    grab: from(103) - 4, // you grab a flyer and tear a strip
    writeIn: at(103, 0.42), // insert: you write
    writeTo: from(104) + 8,
    hold: from(104) + 10, // you hold it out; he stops at the door
    stops: at(104, 0.3),
    turns: at(104, 0.6),
    peak: peakTimes(clips),
  };
}

// ------------------------------------------------------------------------------------------------ the corridor

const { floor: F, s: S } = CORRIDOR;
const youHead = headAt(CORRIDOR.you, F, S, STAND);

/** Where Dev is and which way he faces: in from the door, stopped in front of you, away to the door, turning back. */
function devAt(frame: number, k: T): { x: number; facing: 1 | -1; walking: boolean } {
  if (frame < k.turn) {
    const p = linear(frame, k.enter + 10, k.arrive);
    return { x: mix(HALL_CORRIDOR.door.x - 40, CORRIDOR.devStop, Math.sin((p * Math.PI) / 2)), facing: -1, walking: p > 0 && p < 1 };
  }
  const p = linear(frame, k.turn + 6, k.stops);
  return { x: mix(CORRIDOR.devStop, CORRIDOR.door, p), facing: frame >= k.turns ? -1 : 1, walking: p > 0 && p < 1 };
}

/** The door: open as he comes in, shut behind him, open again as he reaches it. */
const doorAt = (frame: number, k: T) => ramp(frame, k.enter - 4, k.enter + 10) * (1 - ramp(frame, k.arrive - 10, k.arrive + 10)) + ramp(frame, k.stops - 16, k.stops) * 0.55;

/** The whole corridor at a camera. `you` false leaves you out (over your shoulder); `face`, `devFace` set the faces. */
const Corridor: React.FC<{ frame: number; k: T; cam: Camera; face: object; devFace: object; you?: boolean }> = ({ frame, k, cam, face, devFace, you = true }) => {
  const d = devAt(frame, k);
  const dev: Body = { x: d.x, y: F, scale: S, facing: d.facing, pose: d.walking ? walkPose(frame * (frame < k.turn ? 0.3 : 0.16)) : STAND };
  const hero: Body = { x: CORRIDOR.you, y: F, scale: S, facing: 1, pose: STAND };

  // The envelope: held out by Dev, then in your hand from the take until you tuck it away as he turns.
  const offer = ramp(frame, k.enter + 20, k.arrive) * (1 - ramp(frame, k.take, k.take + 12));
  const taken = frame >= k.take + 10;
  const reachOut = ramp(frame, k.take - 8, k.take + 4) * (1 - ramp(frame, k.take + 10, k.take + 24));
  const handoff = { x: (CORRIDOR.you + CORRIDOR.devStop) / 2, y: F - 200 * S };
  if (!d.walking || frame < k.arrive) {
    dev.pose = { ...dev.pose, armF: offer > 0 ? aimArm(dev, { x: mix(d.x - 60, handoff.x + 10, offer), y: mix(F - 140 * S, handoff.y, offer) }) : dev.pose.armF };
  }
  // You: the envelope, then later the flyer grab with the back hand (behind you, to the stack) and the strip held out.
  const grab = ramp(frame, k.grab, k.grab + 10) * (1 - ramp(frame, k.grab + 14, k.grab + 26));
  const holdOut = ramp(frame, k.hold, k.hold + 14);
  const chest = { x: CORRIDOR.you + 60, y: F - 190 * S };
  const front = holdOut > 0
    ? { x: mix(chest.x, CORRIDOR.you + 120, holdOut), y: mix(chest.y, F - 214 * S, holdOut) }
    : reachOut > 0 ? { x: mix(chest.x, handoff.x - 10, reachOut), y: mix(chest.y, handoff.y, reachOut) }
      : frame >= k.grab + 14 ? chest : { x: CORRIDOR.you + 40, y: F - 150 * S };
  hero.pose = { ...STAND, armF: aimArm(hero, front),
    armB: grab > 0 ? aimArm(hero, { x: mix(CORRIDOR.you - 40, HALL_CORRIDOR.flyers.x + 30, grab), y: mix(F - 150 * S, HALL_CORRIDOR.flyers.y + 10, grab) }) : STAND.armB };
  const tucked = frame >= k.turn;
  const heroHeld = frame >= k.grab + 14
    ? <Strip id="held" x={44} y={-6} scale={0.42} tilt={-4} side="back" written={frame >= k.hold ? 1 : 0} />
    : taken && !tucked ? <Envelope x={10} y={-8} scale={0.7} /> : null;
  const devHeld = offer > 0 && !taken ? <Envelope x={14} y={-6} scale={0.7} /> : null;
  const back = <HallBack cam={cam} view="corridor" frame={frame} doorOpen={doorAt(frame, k)} />;
  const hand = handAt(hero, "back");
  const actors = (
    <>
      {grab > 0.7 && <Strip id="torn" x={hand.x} y={hand.y} scale={0.3} tilt={20} side="front" />}
      <Dev {...dev} {...devFace} blink={blinking(frame, 6)} time={frame} held={devHeld} bag={ramp(frame, k.going, k.going + 22)} />
      {you && <Figure {...HERO} {...hero} {...face} blink={blinking(frame, 1)} time={frame} held={heroHeld} />}
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

// Dev's faces: not the smile. Flat, then upset as he talks, then decided.
const DEV_FLAT = { brows: "flat" as const, lids: 0.25, mouth: "frown" as const, eyes: 1, look: { x: 0.9, y: 0.15 } };
const devTalk = (frame: number, from: number, to: number, brows: "sad" | "angry") =>
  ({ brows, lids: brows === "angry" ? 0.3 : 0.15, eyes: 1, mouth: talking(frame, from, to) ? "o" as const : "frown" as const, look: { x: 0.9, y: 0.15 } });

// ------------------------------------------------------------------------------------------------ lines 96-99

const MeetShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.enter, "enter"], [k.noSmile, "noSmile"], [k.bad, "bad"], [k.face, "face"], [k.you, "you"], [k.pull, "pull"]]);
  const devHead = headAt(devAt(frame, k).x, F, S, STAND, -1);
  const two = (CORRIDOR.you + CORRIDOR.devStop) / 2;
  const cams: Record<typeof shot, Camera> = {
    enter: camAt(frame, [[k.enter, { x: 1180, y: 620, zoom: 1.1 }], [k.noSmile, { x: 1000, y: 640, zoom: 1.25 }]]),
    noSmile: camAt(frame, [[k.noSmile, closeUp(devHead.x + 20, devHead.y, 2.6)], [k.bad, closeUp(devHead.x + 20, devHead.y, 2.9)]]),
    bad: camAt(frame, [[k.bad, { x: two, y: 660, zoom: 1.8 }], [k.face, { x: two, y: 660, zoom: 1.9 }]]),
    face: camAt(frame, [[k.face, closeUp(devHead.x - 60, devHead.y, 2.5)], [k.you, closeUp(devHead.x - 50, devHead.y, 2.7)]]),
    you: camAt(frame, [[k.you, closeUp(youHead.x + 40, youHead.y, 2.6)], [k.pull, closeUp(youHead.x + 40, youHead.y, 2.85)]]),
    pull: camAt(frame, [[k.pull, closeUp(devHead.x - 30, devHead.y, 2.5)], [k.page, closeUp(devHead.x - 30, devHead.y + 6, 2.8)]]),
  };
  const youFaces = {
    enter: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.9, y: 0.1 } },
    noSmile: EXPRESSIONS.worried,
    bad: frame < k.badTo ? { ...EXPRESSIONS.shocked, mouth: "flat" as const, eyes: 1.15, look: { x: 0.9, y: 0.1 } } : { ...EXPRESSIONS.worried, look: { x: 0.9, y: 0.3 } },
    face: EXPRESSIONS.worried,
    // The one face that isn't the smile: a strange relief.
    you: { brows: "raised" as const, lids: mix(0, 0.2, ramp(frame, k.you + 20, k.you + 50)), eyes: 1.12, mouth: "flat" as const, look: { x: 0.9, y: 0.1 } },
    pull: EXPRESSIONS.shocked,
  };
  const devFaces = {
    enter: DEV_FLAT,
    noSmile: { ...DEV_FLAT, look: { x: 0.85, y: 0.3 } },
    bad: devTalk(frame, k.bad + 3, k.badTo, "sad"),
    face: { ...DEV_FLAT, brows: "sad" as const, lids: 0.35 },
    you: DEV_FLAT,
    pull: devTalk(frame, k.pull + 3, k.pullTo, "angry"),
  };
  const cam = drift(cams[shot], frame, "meet", 3);
  return (
    <>
      <Corridor frame={frame} k={k} cam={cam} face={youFaces[shot]} devFace={devFaces[shot]} you={shot !== "face"} />
      {shot === "face" && <ForegroundHead x={240} side="left" blur={16} />}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ line 100: the page

const PageShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.page, insert(960, 560, 0.95)], [k.fold - 10, insert(900, 720, 1.25)], [k.fold, insert(960, 420, 1.2)], [k.going, insert(960, 430, 1.3)]]), frame, "page", 2);
  const back = <rect x={-1400} y={-800} width={4800} height={2800} fill="#3a3340" />;
  const actors = (
    <Sheet frame={frame} at={k.page - 8} x={960} y={560} w={MEETING_PAGE.w} h={MEETING_PAGE.h} tilt={-3}>
      <MeetingPage frame={frame} foldFrom={k.fold} foldTo={k.foldTo} strikeFrom={k.strike} strikeTo={k.strikeTo} />
    </Sheet>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ lines 101-102

const GoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.going, "going"], [k.word, "word"], [k.away, "away"], [k.door, "door"], [k.flyers, "flyers"], [k.power, "power"]]);
  const d = devAt(frame, k);
  const cams: Record<typeof shot, Camera> = {
    going: camAt(frame, [[k.going, { x: 900, y: 650, zoom: 1.7 }], [k.word, { x: 960, y: 650, zoom: 1.6 }]]),
    word: camAt(frame, [[k.word, closeUp(youHead.x + 40, youHead.y, 2.6)], [k.away, closeUp(youHead.x + 40, youHead.y, 2.9)]]),
    away: camAt(frame, [[k.away, { x: 1000, y: 600, zoom: 1.08 }], [k.door, { x: 1060, y: 600, zoom: 1.14 }]]),
    door: camAt(frame, [[k.door, { x: d.x + 60, y: 640, zoom: 1.75 }], [k.flyers, { x: d.x + 80, y: 640, zoom: 1.8 }]]),
    flyers: camAt(frame, [[k.flyers, closeUp(youHead.x, youHead.y + 20, 2.5)], [k.power, closeUp(youHead.x, youHead.y + 10, 2.7)]]),
    power: camAt(frame, [[k.power, closeUp(youHead.x + 20, youHead.y, 3.1)], [k.grab, closeUp(youHead.x + 20, youHead.y, 3.4)]]),
  };
  const opening = ramp(frame, k.open, k.open + 12);
  const youFaces = {
    going: { ...EXPRESSIONS.worried, look: { x: 0.95, y: 0 } },
    word: { ...EXPRESSIONS.worried, mouth: opening > 0.5 ? "o" as const : "flat" as const, eyes: 1.1, look: { x: 0.95, y: 0 } },
    away: { ...EXPRESSIONS.worried, mouth: "o" as const, look: { x: 0.95, y: 0 } },
    door: EXPRESSIONS.worried,
    flyers: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: -0.7, y: 0.85 } },
    power: { ...EXPRESSIONS.determined, look: { x: 0.95, y: 0.1 } },
  };
  const devFace = shot === "going" ? devTalk(frame, k.going + 4, k.goingTo, "sad") : { ...DEV_FLAT, lids: 0.45, look: { x: 0.9, y: 0.4 } };
  const cam = drift(cams[shot], frame, "go", 3);
  return <Corridor frame={frame} k={k} cam={cam} face={youFaces[shot]} devFace={devFace} />;
};

// ------------------------------------------------------------------------------------------------ lines 103-104

/** Insert: your two hands, the strip held flat in one, the pen writing across it in the other. */
const WriteShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const written = linear(frame, k.writeIn + 2, k.writeTo);
  const SC = 2.2;
  const left = 960 - (STRIP.w * SC) / 2;
  const tip = { x: left + 40 * SC + written * (STRIP.w - 80) * SC, y: 540 + 20 + Math.sin(frame * 1.4) * 8 };
  const cam = drift(camAt(frame, [[k.writeIn, insert(960, 560, 1.0)], [k.writeTo, insert(1000, 560, 1.12)]]), frame, "write", 2);
  const back = <rect x={-1400} y={-800} width={4800} height={2800} fill="#6a6058" />;
  const actors = (
    <>
      <Strip id="writing" x={960} y={540} scale={SC} side="back" written={written} tilt={-2} />
      {/* the holding hand at the strip's torn end */}
      <ellipse cx={left - 30} cy={590} rx={120} ry={80} fill={MUSTARD} stroke={INK} strokeWidth={6} />
      <rect x={left - 20} y={480} width={90} height={56} rx={28} fill={MUSTARD} stroke={INK} strokeWidth={6} />
      {/* the writing hand with the pen */}
      <Pen x={tip.x} y={tip.y} scale={2.4} />
      <ellipse cx={tip.x + 240} cy={tip.y - 150} rx={120} ry={90} fill={MUSTARD} stroke={INK} strokeWidth={6} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

const GrabShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.grab, { x: 640, y: 660, zoom: 1.8 }], [k.writeIn, { x: 620, y: 670, zoom: 1.95 }]]), frame, "grab", 3);
  const face = { ...EXPRESSIONS.determined, look: { x: -0.6, y: 0.7 } };
  return <Corridor frame={frame} k={k} cam={cam} face={face} devFace={DEV_FLAT} />;
};

const HoldShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.hold, { x: 1060, y: 620, zoom: 1.12 }], [k.peak.take, { x: 1060, y: 630, zoom: 1.2 }]]), frame, "hold", 2);
  const face = { ...EXPRESSIONS.worried, mouth: "flat" as const, eyes: 1.1, look: { x: 0.95, y: 0 } };
  const devFace = frame >= k.turns ? { ...DEV_FLAT, brows: "raised" as const, lids: 0.1, mouth: "flat" as const, look: { x: 0.9, y: 0.1 } } : DEV_FLAT;
  return <Corridor frame={frame} k={k} cam={cam} face={face} devFace={devFace} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const Choice: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips);
  const scene = current(frame, [[0, "meet"], [k.page, "page"], [k.going, "go"], [k.grab, "grab"], [k.writeIn, "write"], [k.hold, "hold"], [k.peak.take, "peak"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "meet" && <MeetShot frame={frame} k={k} />}
      {scene === "page" && <PageShot frame={frame} k={k} />}
      {scene === "go" && <GoShot frame={frame} k={k} />}
      {scene === "grab" && <GrabShot frame={frame} k={k} />}
      {scene === "write" && <WriteShot frame={frame} k={k} />}
      {scene === "hold" && <HoldShot frame={frame} k={k} />}
      {scene === "peak" && <PaperPeak frame={frame} p={k.peak} />}
    </AbsoluteFill>
  );
};

export const choice: Beat = { id: "choice", firstLine: 96, Component: Choice };
