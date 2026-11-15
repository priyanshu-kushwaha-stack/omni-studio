// Beat "The Rule" (script.md v7, ## [00:11] The Rule; lines 3-10). The narrator's first words over the key shot, a
// lifetime of skills in quick cuts, then the rule, once, drawn in the hall of pods, and the title card.
//
//   3   close on your grin; the counter; wide: on "learning to juggle" you flick the three coils back up into the
//       cascade, her jaw still on the floor
//   4   the wall clock: one tick; her open mouth; the key shot wide for the title question
//   5   quick cuts at the night desk: a drawn violin, an omelette flip, a bow to a guest in a hat; between each her jaw a
//       notch lower; on "What you lose" the boss's hand closes the crate's lid and pats it
//   6   the hall wide; on "a thousand times faster" every hatch counter flutters once, a ripple left to right; on "A
//       night out here" pod one's counter runs to 365 while the clock's hands sweep
//   7   a paper circle over the pods: the inside town, the sky counter blurring, four seasons in four cuts; on "Your
//       body ages one night" the clock ticks once
//   8   the flagged limit: a paper you walks out of the town with a suitcase and a newspaper; at the hatch lip they turn
//       to ash, only your head crosses, glowing; a bolt slides across, an alarm clock is stamped beside it
//   9   the fact sheet: the economist's guess (x1,000), the 8,760 strip folding into one night by the clock
//   10  back to the two of you: she picks up the mop without taking her eyes off you, you look at the clock; title card
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { CounterSound, FLUTTER_FRAMES, headAt, Mop, TickSound } from "../parts";
import { KEY_COUNTER, KEY_HERO, KEY_MATE, STUN } from "../sets/KeyShot";
import { POD_ONE_COUNTER } from "../sets/PodHall";
import { REF } from "../sets/common";
import { blinking, camAt, current, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { FactSheet, TitleCard, TownInset } from "./Rule.Inserts";
import { BowCut, CrateClose, FloorMop, OmeletteCut, Ripple, StaringMate, ViolinCut } from "./Rule.Cuts";
import { LimitSheet } from "./Rule.Limit";
import { atText, BossAtDesk, handAt, HallStage, moodNow, onPods, Overlay, Person, YouOnLip, type Body, type Face } from "./TellMeTomorrow.Kit";
import { CATCH_POSE, KeyCatch, Tangle } from "./TellMeTomorrow.Key";

function times(shot: Shot) {
  const c: Clip[] = shot.clips;
  const f = (i: number) => c[i].from;
  const e = (i: number) => c[i].from + c[i].frames;
  const t = (i: number, p: string | string[], n = -3) => atText(shot, i, p, n);
  // The title card (C) wants 3 s after line 10; with no room it takes the last second of the beat.
  // line 5's quick cuts: each skill at least a second, each jaw at least half a second, on their phrases when there's room
  const jaw1 = Math.max(f(5) + 40, t(5, "Every morning", -12));
  const omelette = jaw1 + 16;
  const jaw2 = Math.max(omelette + 34, t(5, "a face like"));
  const bow = Math.max(jaw2 + 16, t(5, "That's what"));
  const jaw3 = Math.max(bow + 32, t(5, "you win", 8));
  const crate = Math.max(jaw3 + 20, t(5, "What you lose"));
  const cuts = { jaw1, omelette, jaw2, bow, jaw3, crate, pat: Math.max(crate + 24, t(5, "the day anyone")) };
  const title = Math.min(shot.to - 30, Math.max(e(10) + 2, shot.to - 90));
  return {
    face: f(3), counter: t(3, "One year"), wide: t(3, "And you spent"), toss: t(3, "juggle", -8),
    clock: f(4) - 2, tick: f(4) + 6, mouth: f(4) + 18, thumb: t(4, "every night", -4),
    violin: f(5) - 2, ...cuts,
    hall: f(6) - 2, fast: t(6, "a thousand", -4), eight: t(6, ["A night out", "Eight hours"], -4),
    town: f(7) - 2, seasons: t(7, "four seasons"), body: t(7, "Your body", -2),
    limit: f(8) - 2, ash: t(8, "No things", -2), bolt: t(8, "stay till", -2), alarm: t(8, "the alarm", 2), remember: t(8, "Remember"),
    sheet: f(9) - 2, guess: t(9, "a thousand times human", 0), strip: t(9, "A year is", -2), fold: t(9, "At a thousand", -2),
    work: f(10) - 2, title, end: shot.to,
  };
}
type T = ReturnType<typeof times>;

const HERO_HEAD = headAt(KEY_HERO.x, KEY_HERO.y, KEY_HERO.scale, CATCH_POSE, 1);
const MATE_HEAD = headAt(KEY_MATE.x, KEY_MATE.y, KEY_MATE.scale, STUN, -1);
const CLOCK = onPods(300, 250);
const POD = onPods(POD_ONE_COUNTER.x, POD_ONE_COUNTER.y + 80);
const MID = { x: (CLOCK.x + POD.x) / 2, y: (CLOCK.y + POD.y) / 2 };

/** The key-shot pictures of lines 3-4: you holding the coils (or juggling again after the toss), her jaw dropped. */
function keyPicture(frame: number, k: T, on: string) {
  const cams: Record<string, Camera> = {
    face: camAt(frame, [[k.face, closeUp(HERO_HEAD.x + 80, HERO_HEAD.y + 20, 2.0)], [k.counter, closeUp(HERO_HEAD.x + 80, HERO_HEAD.y + 10, 2.2)]]),
    counter: camAt(frame, [[k.counter, insert(KEY_COUNTER.x - 60, KEY_COUNTER.y + 60, 2.2)], [k.wide, insert(KEY_COUNTER.x - 80, KEY_COUNTER.y + 70, 2.4)]]),
    wide: camAt(frame, [[k.wide, { x: 900, y: 560, zoom: 1.12 }], [k.clock, { x: 960, y: 545, zoom: 1.02 }]]),
    mouth: camAt(frame, [[k.mouth, closeUp(MATE_HEAD.x - 40, MATE_HEAD.y, 2.1)], [k.thumb, closeUp(MATE_HEAD.x - 40, MATE_HEAD.y - 10, 2.3)]]),
    thumb: camAt(frame, [[k.thumb, REF], [k.violin, { x: 940, y: 545, zoom: 1.05 }]]),
  };
  const catchP = 1 - ramp(frame, k.toss, k.toss + 10);
  const face = on === "face" ? { mouth: "smirk" as const, lids: mix(0.62, 0.7, linear(frame, k.face, k.counter)), brows: "flat" as const }
    : { mouth: "smirk" as const, lids: 0.62, brows: "flat" as const };
  return (
    <Stage cam={on === "thumb" ? cams.thumb : drift(cams[on], frame, "rule-key", 2)} radius={0} origin={{ x: 960, y: 540 }} back={null}
      actors={<KeyCatch frame={frame} catchP={catchP} stun={1} mopDrop={1} blink={blinking(frame, 2)} {...face} />} />
  );
}

/** The quick cuts of line 5: a skill at the desk, her jaw a notch lower, the crate closing. */
function cutsPicture(frame: number, cam: Camera, mood: ReturnType<typeof moodNow>, k: T, on: string) {
  const jaw = on === "jaw1" ? 8 : on === "jaw2" ? 20 : 34;
  const actors = on === "violin" ? <ViolinCut frame={frame} />
    : on === "omelette" ? <OmeletteCut frame={frame} from={k.omelette} />
    : on === "bow" ? <BowCut frame={frame} from={k.bow} />
    : on === "crate" || on === "pat" ? <CrateClose frame={frame} close={ramp(frame, k.crate + 2, k.crate + 14)} pat={on === "pat"} />
    : <><StaringMate frame={frame} drop={jaw} eyes={1.1 + jaw * 0.01} /><FloorMop /></>;
  return <HallStage frame={frame} cam={cam} mood={mood} hall={{ door: 1, counter: { value: "365" }, minutes: 12 }} actors={actors} />;
}

/** The hall wide for the rule: the boss at the desk, you on the lip with the coils, her still staring, mop on the
 *  floor; the ripple of counters; pod one's counter and the clock for "A night out here"; the clock's tick. */
function hallPicture(frame: number, cam: Camera, mood: ReturnType<typeof moodNow>, k: T, on: string) {
  const counter = on === "eight" ? { at: k.eight + 4 } : { value: "365" };
  const minutes = on === "eight" ? 12 + 480 * ramp(frame, k.eight + 4, k.eight + 4 + FLUTTER_FRAMES) : on === "body" && frame >= k.body + 4 ? 13 : 12;
  const work = on === "work";
  // line 10: she bends for the mop, eyes on you all the while, and straightens up with it
  const pick = work ? ramp(frame, k.work + 4, k.work + 20) : 0;
  const bend = Math.sin(pick * Math.PI);
  const mateB: Body = { x: 1120, y: 960, scale: 1.08, facing: -1, pose: { ...STAND, lean: 4 + bend * 46, tilt: -bend * 30, armF: [24 + bend * 30, 20], armB: [16 + bend * 40, 20 + (pick > 0.5 ? 75 : 0)] } };
  const holding = pick > 0.5;
  const mopHand = handAt(mateB, "back");
  const youFace: Face = work && frame > k.work + 10 ? { brows: "raised", lids: 0.5, mouth: "smirk", look: { x: -0.7, y: -0.9 } }
    : { brows: "flat", lids: 0.6, mouth: "smirk", look: { x: 0.9, y: 0.05 } };
  const youPose: Pose = { ...SEATED, lean: 4, tilt: work && frame > k.work + 10 ? -10 : 4, armF: [60, 70], armB: [20, 40] };
  return (
    <HallStage frame={frame} cam={cam} mood={mood} hall={{ door: 1, counter, minutes, wedge: false }}
      actors={
        <>
          <Ripple frame={frame} at={k.fast} cam={cam} />
          <BossAtDesk frame={frame} coils={1} pose={{ ...STAND, lean: 6, armF: [50, 70], armB: [30, 80] }}
            face={{ brows: "raised", lids: 0.3, mouth: "flat", look: { x: 0.9, y: 0.2 } }} />
          <YouOnLip frame={frame} cam={cam} face={youFace} pose={youPose} />
          <Tangle x={655 + (cam.x - 960) * 0.15} y={820 + (cam.y - 540) * 0.15} s={0.55} />
          {!holding && <FloorMop />}
          {work ? (
            <>
              <Person who="mate" b={mateB} face={{ brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: bend > 0.3 ? -0.6 : 0.05 } }} frame={frame} seed={5} />
              {holding && <Mop x={mopHand.x} y={mopHand.y} reach={960 - mopHand.y - 30} scale={1.08} />}
            </>
          ) : <StaringMate frame={frame} drop={22} />}
        </>
      } />
  );
}

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const mood = moodNow(shot);
  const on = current(frame, [
    [0, "face"], [k.counter, "counter"], [k.wide, "wide"], [k.clock, "clock"], [k.mouth, "mouth"], [k.thumb, "thumb"],
    [k.violin, "violin"], [k.jaw1, "jaw1"], [k.omelette, "omelette"], [k.jaw2, "jaw2"], [k.bow, "bow"], [k.jaw3, "jaw3"], [k.crate, "crate"], [k.pat, "pat"],
    [k.hall, "hall"], [k.fast, "fast"], [k.eight, "eight"], [k.town, "town"], [k.body, "body"], [k.limit, "limit"], [k.sheet, "sheet"], [k.work, "work"],
  ]);

  const desk = (z: number) => closeUp(400, 640, z);
  const jawCam = (z: number) => closeUp(1090, 735, z);
  const cams: Record<string, Camera> = {
    clock: camAt(frame, [[k.clock, insert(CLOCK.x, CLOCK.y, 3.4)], [k.mouth, insert(CLOCK.x, CLOCK.y, 3.0)]]),
    violin: camAt(frame, [[k.violin, desk(1.7)], [k.jaw1, desk(1.85)]]),
    jaw1: jawCam(2.2), jaw2: jawCam(2.5), jaw3: camAt(frame, [[k.jaw3, jawCam(2.7)], [k.crate, jawCam(3.0)]]),
    omelette: camAt(frame, [[k.omelette, { x: 430, y: 600, zoom: 1.7 }], [k.jaw2, { x: 440, y: 590, zoom: 1.8 }]]),
    bow: camAt(frame, [[k.bow, { x: 540, y: 660, zoom: 1.5 }], [k.jaw3, { x: 560, y: 660, zoom: 1.6 }]]),
    crate: insert(250, 700, 2.4), pat: camAt(frame, [[k.pat, { x: 330, y: 660, zoom: 1.9 }], [k.hall, { x: 340, y: 650, zoom: 2.0 }]]),
    hall: camAt(frame, [[k.hall, { x: 900, y: 600, zoom: 1.12 }], [k.fast, { x: 960, y: 560, zoom: 1.0 }]]),
    fast: camAt(frame, [[k.fast, { x: 960, y: 560, zoom: 1.0 }], [k.eight, { x: 960, y: 540, zoom: 1.04 }]]),
    eight: camAt(frame, [[k.eight, { ...MID, zoom: 1.5 }], [k.town, { ...MID, zoom: 1.6 }]]),
    town: camAt(frame, [[k.town, { x: 960, y: 560, zoom: 1.0 }], [k.body, { x: 960, y: 540, zoom: 1.05 }]]),
    body: camAt(frame, [[k.body, { ...MID, zoom: 1.6 }], [k.limit, { ...MID, zoom: 1.7 }]]),
    limit: { x: 960, y: 560, zoom: 1.0 }, sheet: { x: 960, y: 560, zoom: 1.0 },
    work: camAt(frame, [[k.work, { x: 860, y: 680, zoom: 1.35 }], [k.title, { x: 880, y: 670, zoom: 1.45 }]]),
  };

  let picture: React.ReactNode;
  if (["face", "counter", "wide", "mouth", "thumb"].includes(on)) picture = keyPicture(frame, k, on);
  else if (["violin", "jaw1", "omelette", "jaw2", "bow", "jaw3", "crate", "pat"].includes(on)) picture = cutsPicture(frame, drift(cams[on], frame, `rule-${on}`, 2), mood, k, on);
  else picture = hallPicture(frame, drift(cams[on], frame, `rule-${on}`, 3), mood, k, on);

  const season = frame < k.seasons ? -1 : Math.min(3, Math.floor((frame - k.seasons) / Math.max(14, (k.body - k.seasons) / 4)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {on === "town" && <Overlay dim={0.35}><TownInset frame={frame} at={k.town + 4} until={k.body} season={season} /></Overlay>}
      {on === "limit" && <Overlay dim={0.5}><LimitSheet frame={frame} at={k.limit + 2} until={k.sheet}
        t={{ walk: k.limit + 8, ash: k.ash, bolt: k.bolt, alarm: k.alarm, remember: k.remember }} /></Overlay>}
      {on === "sheet" && <Overlay dim={0.45}><FactSheet frame={frame} at={k.sheet + 2} until={k.work} guess={k.guess} strip={k.strip} fold={k.fold} /></Overlay>}
      {frame >= k.title && <Overlay><TitleCard frame={frame} at={k.title} /></Overlay>}
      <Sequence from={k.toss} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.5} /></Sequence>
      <TickSound at={k.tick} />
      <Sequence from={k.crate + 12} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.fast} durationInFrames={FLUTTER_FRAMES + 6}><Audio src={staticFile("sfx/flutter.wav")} volume={0.9} /></Sequence>
      <CounterSound at={k.eight + 4} />
      <TickSound at={k.body + 4} />
      <Sequence from={k.ash} durationInFrames={20}><Audio src={staticFile("sfx/flutter.wav")} volume={0.4} /></Sequence>
      <Sequence from={k.bolt + 8} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
      <Sequence from={k.alarm} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.title} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "Rule", firstLine: 3, Component: Scene };
