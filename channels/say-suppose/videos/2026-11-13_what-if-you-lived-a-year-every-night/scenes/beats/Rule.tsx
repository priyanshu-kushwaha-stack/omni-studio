// Beat "The Rule" (script.md, ## [00:10] The Rule; lines 3-11). The narrator's first words over the key shot, then the
// rule, once, drawn in the hall of pods.
//
//   3   close on your face, the lids; the counter under your hand; her open mouth
//   4   the wall clock: one tick; the key shot again, wide, for the title question
//   5   she mops at one speed; pod one's counter flutters on "Every year you gain"; the camera pulls away from her
//   6   inside the pod: your hand pushes the plug in; on "a thousand times faster" every hatch counter in the hall
//       flutters; on "Eight hours out here" pod one's counter runs to 365 while the clock's hands sweep
//   7   a paper circle over the pods: the inside town, the sky counter blurring, sleepers walking, four seasons in four
//       cuts; on "Your body ages one night" the clock ticks once
//   8   the door shuts on you, the counter runs; she glances at the shut door and mops on; push in on the door
//   9   in there: you stroll the inside town under the blurring sky counter
//   10  the fact sheet: the economist and his guess (x1,000), the 8,760 strip folding into one night by the clock
//   11  back to the two of you: she shrugs and goes back to the floor, you look at the clock; the title card
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { CounterSound, FLUTTER_FRAMES, headAt, TickSound } from "../parts";
import { TownBack, townLights } from "../sets/InsideTown";
import { KEY_COUNTER, KEY_HERO, KEY_MATE, KEY_POSE, KeyShot, TALK } from "../sets/KeyShot";
import { POD_ONE_COUNTER } from "../sets/PodHall";
import { REF } from "../sets/common";
import { blinking, camAt, current, linear, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { FactSheet, TitleCard, TownInset } from "./Rule.Inserts";
import { at, atText, BigHand, BossAtDesk, HallStage, LyingYou, MateMop, moodNow, onPods, Overlay, Person, PodInside, YouOnLip, type Face } from "./TellMeTomorrow.Kit";

function times(shot: Shot) {
  const c: Clip[] = shot.clips;
  const f = (i: number) => c[i].from;
  const e = (i: number) => c[i].from + c[i].frames;
  const title = Math.min(shot.to - 45, Math.max(e(11) - 6, shot.to - 90));
  return {
    face: f(3), counter: at(c, 3, 0.36), mouth: at(c, 3, 0.68),
    clock: f(4) - 2, tick: f(4) + 8, thumb: at(c, 4, 0.42),
    mop: f(5) - 2, gain: atText(shot, 5, "Every year"),
    plug: f(6) - 2, plugIn: atText(shot, 6, "Plug in", 14), fast: atText(shot, 6, "a thousand", -4), eight: atText(shot, 6, ["A night out", "Eight hours"], -4),
    town: f(7) - 2, seasons: atText(shot, 7, "four seasons"), body: atText(shot, 7, "Your body", -2),
    starts: f(8) - 2, nobody: atText(shot, 8, "And nobody", -2), remember: atText(shot, 8, "Remember that", -2),
    inThere: f(9) - 2,
    sheet: f(10) - 2, guess: atText(shot, 10, "a thousand"), strip: atText(shot, 10, "A year is", -2), fold: atText(shot, 10, "At a thousand", -2),
    work: f(11) - 2, e11: e(11), title, end: shot.to,
  };
}
type T = ReturnType<typeof times>;

const FLOOR = 960;
const HERO_HEAD = headAt(KEY_HERO.x, KEY_HERO.y, KEY_HERO.scale, KEY_POSE, 1);
const MATE_HEAD = headAt(KEY_MATE.x, KEY_MATE.y, KEY_MATE.scale, TALK, -1);
const CLOCK = onPods(300, 250);
const POD = onPods(POD_ONE_COUNTER.x, POD_ONE_COUNTER.y + 80);

/** Your flatmate mopping at one even speed (the mop sweeps with her arms). */
const mopPose = (frame: number): Pose => {
  const s = Math.sin(frame / 9);
  return { ...STAND, lean: 8, tilt: 4, armF: [40 + s * 14, 50], armB: [30 + s * 14, 60] };
};

/** The hall pictures: her mopping, the door shut, pod one's counter, every hatch fluttering, the two of you. */
function hall(frame: number, cam: Camera, mood: ReturnType<typeof moodNow>, k: T, on: string) {
  const mateX = on === "work" ? mix(1120, 1500, ramp(frame, at2(k, 0.55), k.title)) : 1120;
  const walking = on === "work" && frame > at2(k, 0.55) && frame < k.title;
  const shrug = on === "work" ? Math.sin(Math.min(1, linear(frame, k.work, at2(k, 0.45))) * Math.PI) : 0;
  const matePose: Pose = on === "work"
    ? (walking ? walkPose(frame * 0.3) : lerpPose({ ...STAND, armF: [20, 40], armB: [25, 95] }, { ...STAND, tilt: -8, armF: [70, 110], armB: [60, 120], drop: -4 }, shrug))
    : mopPose(frame);
  const glance = on === "nobody" && frame < k.remember;
  const mateFace: Face = on === "work"
    ? { brows: shrug > 0.3 ? "raised" : "none", lids: 0.1, mouth: shrug > 0.3 ? "smirk" : "flat", look: { x: walking ? -0.9 : 0.9, y: 0 } }
    : glance ? { brows: "worry", lids: 0, mouth: "flat", eyes: 1.05, look: { x: 0.9, y: -0.2 } }
    : { brows: "none", lids: 0.3, mouth: "smile", look: { x: 0.4, y: 0.8 } };
  const door = on === "work" ? 1 : on === "starts" ? 1 - ramp(frame, k.starts + 6, k.starts + 14) : 0;
  const counter = on === "fast" ? { value: "365" }
    : on === "mop" ? { at: k.gain }
    : on === "eight" ? { at: k.eight + 4 }
    : on === "starts" ? { at: k.starts + 14 }
    : { value: "365" };
  const flutterAll = on === "fast" && frame < k.fast + FLUTTER_FRAMES + 6;
  // the clock: eight hours sweep by while pod one's counter runs to 365; one tick on "Your body ages one night"
  const minutes = on === "eight" ? 12 + 480 * ramp(frame, k.eight + 4, k.eight + 4 + FLUTTER_FRAMES) : on === "body" && frame >= k.body + 4 ? 13 : 12;
  const actors = (
    <>
      <BossAtDesk frame={frame} pose={{ ...STAND, lean: 8, armF: [50, 70], armB: [30, 80] }} face={{ lids: 0.4, mouth: "flat", look: { x: 0.5, y: 0.7 } }} />
      {on === "work" && <YouOnLip frame={frame} cam={cam}
        face={{ brows: "flat", lids: 0.55, mouth: "flat", look: frame > at2(k, 0.6) ? { x: -0.8, y: -0.9 } : { x: 0.9, y: 0 } }} />}
      <MateMop frame={frame} b={{ x: mateX, y: FLOOR, scale: 1.08, facing: on === "work" && walking ? 1 : -1, pose: matePose }} face={mateFace} />
    </>
  );
  return (
    <HallStage frame={frame} cam={cam} mood={mood} hall={{ door, counter, flutterAll, minutes, wedge: false }}
      actors={actors} />
  );
}
const at2 = (k: T, p: number) => Math.round(k.work + (k.title - k.work) * p);

/** Inside the pod: you lying with the lamp on; your hand pushes the plug into the socket at `plugIn`. */
function plugInsert(frame: number, k: T) {
  const reach = ramp(frame, k.plug + 4, k.plugIn);
  const hand = { x: mix(1300, 1640, reach), y: mix(760, 500, reach) };
  return (
    <LookContext.Provider value={setLook([{ x: 420, y: 200, r: 500, color: "#ffd98a", strength: 0.45, moods: ["night", "lamp", "dusk", "morning", "day", "frozen"] }], "lamp", REF)}>
      <Stage cam={drift(camAt(frame, [[k.plug, { x: 960, y: 560, zoom: 1.0 }], [k.fast, { x: 1000, y: 560, zoom: 1.08 }]]), frame, "plug", 3)} radius={0}
        origin={{ x: 960, y: 540 }} back={<PodInside cable={frame >= k.plugIn} />}
        actors={
          <>
            <LyingYou frame={frame} x={900} y={640} s={2.6} face={{ brows: "none", lids: frame >= k.plugIn ? 0.75 : 0.3, mouth: "flat", look: { x: 0.2, y: -0.8 } }} armF={[150, 20]} />
            {frame < k.plugIn && <path d={`M470 650 C 800 640, 1100 700, ${hand.x} ${hand.y}`} fill="none" stroke="#1D9A8F" strokeWidth={14} />}
            <BigHand from={{ x: hand.x + 220, y: hand.y + 520 }} x={hand.x} y={hand.y} r={46} />
          </>
        } />
    </LookContext.Provider>
  );
}

/** In there: you stroll the inside town under the blurring sky counter. */
function strollIn(frame: number, k: T) {
  const p = linear(frame, k.inThere, k.sheet);
  const x = mix(420, 1350, p);
  const cam = drift({ x: mix(700, 1150, p), y: 520, zoom: 1.12 }, frame, "stroll", 4);
  return (
    <LookContext.Provider value={setLook(townLights(), "day", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<TownBack cam={cam} frame={frame} />}
        actors={
          <>
            {[0, 1, 2].map((i) => (
              <Person key={i} who={{ head: PASTELS[i + 2] }} b={{ x: 1700 - i * 500 - (frame - k.inThere) * 1.6, y: 905, scale: 0.95, facing: -1, pose: walkPose(frame * 0.25 + i) }}
                face={{ mouth: "smile", look: { x: 0.6, y: 0 } }} frame={frame} seed={i + 7} />
            ))}
            <Person who="you" b={{ x, y: 910, scale: 1.1, facing: 1, pose: walkPose(frame * 0.24) }} face={{ brows: "raised", lids: 0, mouth: "smile", look: { x: 0.5, y: -0.6 } }} frame={frame} />
          </>
        } />
    </LookContext.Provider>
  );
}

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const mood = moodNow(shot);
  const on = current(frame, [
    [0, "face"], [k.counter, "counter"], [k.mouth, "mouth"], [k.clock, "clock"], [k.thumb, "thumb"], [k.mop, "mop"], [k.plug, "plug"],
    [k.fast, "fast"], [k.eight, "eight"], [k.town, "town"], [k.body, "body"], [k.starts, "starts"], [k.nobody, "nobody"], [k.inThere, "inThere"],
    [k.sheet, "sheet"], [k.work, "work"],
  ]);

  const cams: Record<string, Camera> = {
    face: camAt(frame, [[k.face, closeUp(HERO_HEAD.x + 60, HERO_HEAD.y + 10, 2.0)], [k.counter, closeUp(HERO_HEAD.x + 60, HERO_HEAD.y, 2.2)]]),
    counter: camAt(frame, [[k.counter, insert(KEY_COUNTER.x - 60, KEY_COUNTER.y + 60, 2.2)], [k.mouth, insert(KEY_COUNTER.x - 80, KEY_COUNTER.y + 70, 2.4)]]),
    mouth: camAt(frame, [[k.mouth, closeUp(MATE_HEAD.x - 40, MATE_HEAD.y, 2.1)], [k.clock, closeUp(MATE_HEAD.x - 40, MATE_HEAD.y - 10, 2.3)]]),
    clock: camAt(frame, [[k.clock, insert(CLOCK.x, CLOCK.y, 3.4)], [k.thumb, insert(CLOCK.x, CLOCK.y, 3.0)]]),
    thumb: camAt(frame, [[k.thumb, REF], [k.mop, { x: 900, y: 545, zoom: 1.06 }]]),
    mop: camAt(frame, [[k.mop, closeUp(1100, 700, 2.0)], [k.gain, { x: 960, y: 640, zoom: 1.5 }], [k.plug, { x: 960, y: 560, zoom: 1.0 }]]),
    fast: camAt(frame, [[k.fast, { x: 960, y: 560, zoom: 1.0 }], [k.eight, { x: 960, y: 540, zoom: 1.04 }]]),
    eight: camAt(frame, [[k.eight, { x: (CLOCK.x + POD.x) / 2, y: (CLOCK.y + POD.y) / 2, zoom: 1.5 }], [k.town, { x: (CLOCK.x + POD.x) / 2, y: (CLOCK.y + POD.y) / 2, zoom: 1.6 }]]),
    town: camAt(frame, [[k.town, { x: 960, y: 560, zoom: 1.0 }], [k.body, { x: 960, y: 540, zoom: 1.05 }]]),
    body: camAt(frame, [[k.body, { x: (CLOCK.x + POD.x) / 2, y: (CLOCK.y + POD.y) / 2, zoom: 1.6 }], [k.starts, { x: (CLOCK.x + POD.x) / 2, y: (CLOCK.y + POD.y) / 2, zoom: 1.7 }]]),
    starts: camAt(frame, [[k.starts, insert(POD.x, POD.y - 20, 2.0)], [k.nobody, insert(POD.x, POD.y - 20, 2.2)]]),
    nobody: camAt(frame, [[k.nobody, { x: 820, y: 660, zoom: 1.3 }], [k.remember, { x: 760, y: 660, zoom: 1.35 }], [k.inThere, insert(POD.x, POD.y - 30, 2.4)]]),
    sheet: { x: 960, y: 560, zoom: 1.0 },
    work: camAt(frame, [[k.work, { x: 820, y: 680, zoom: 1.35 }], [k.title, { x: 840, y: 670, zoom: 1.42 }]]),
  };

  let picture: React.ReactNode;
  if (on === "face" || on === "counter" || on === "mouth" || on === "thumb") {
    picture = (
      <Stage cam={on === "thumb" ? cams.thumb : drift(cams[on], frame, "rule-key", 2)} radius={0} origin={{ x: 960, y: 540 }} back={null}
        actors={<KeyShot frame={frame} counter={{ value: "365" }} mateMouth="open" blink={blinking(frame, 2)}
          lids={on === "face" ? mix(0.62, 0.7, linear(frame, k.face, k.counter)) : 0.62} />} />
    );
  } else if (on === "plug") picture = plugInsert(frame, k);
  else if (on === "inThere") picture = strollIn(frame, k);
  else picture = hall(frame, drift(cams[on], frame, `rule-${on}`, 3), mood, k, on);

  const season = frame < k.seasons ? -1 : Math.min(3, Math.floor((frame - k.seasons) / Math.max(14, (k.body - k.seasons) / 4)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {on === "town" && <Overlay dim={0.35}><TownInset frame={frame} at={k.town + 4} until={k.body} season={season} /></Overlay>}
      {on === "sheet" && <Overlay dim={0.45}><FactSheet frame={frame} at={k.sheet + 2} until={k.work} guess={k.guess} strip={k.strip} fold={k.fold} /></Overlay>}
      {frame >= k.title && <Overlay><TitleCard frame={frame} at={k.title} /></Overlay>}
      <TickSound at={k.tick} />
      <CounterSound at={k.gain} volume={0.8} />
      <Sequence from={k.plugIn} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
      <Sequence from={k.fast} durationInFrames={FLUTTER_FRAMES + 6}><Audio src={staticFile("sfx/flutter.wav")} volume={0.9} /></Sequence>
      <CounterSound at={k.eight + 4} />
      <TickSound at={k.body + 4} />
      <Sequence from={k.starts + 6} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.8} /></Sequence>
      <CounterSound at={k.starts + 14} volume={0.8} />
      <Sequence from={k.title} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "Rule", firstLine: 3, Component: Scene };
