// Beat "The Timeline" (script.md, ## [07:06] The Timeline; lines 70-75). The hall at dawn, a wedge of light from the
// high window. Night 123: the paper portrait of the oldest verified life beside a tally of years, yours climbing past
// hers and off the paper; the rent envelope on the desk. Then a paper timeline unrolls along the hall floor from your
// pod, under both tiers of hatches, the counters fluttering, the camera walking it: a stamped page of old squiggly
// letters at about a thousand years, older pages, and off into the dark. Two paper cut-outs of you, one at each end,
// mouths open, no bubble. Then your flatmate, small, at the near end: the only point on it she can reach.
//
//   70  hatch: the NIGHT 123 tag, you stretching at your hatch (counter on 365) / the portrait sheet, your tally passes
//       hers, 122 stamps in / the desk: the rent envelope drops onto it, you look at it
//   71  you at the start of the strip with the roll; on "Unroll it" it rolls away along the floor, the camera follows
//   72  the stamp at a thousand years: a page of old letters stands up; push in
//   73  the camera walks on past older pages (wedges, dots) into the dark
//   74  wide: the paper you at the near end, the dim shape of you at the far end, both mouths open
//   75  push in on your flatmate with her mop at the start of the strip, then pull back until she is small
//   the gap after 75 is Her Offer's 4 s performed hold: from there this beat draws Her Offer (HerOffer.tsx).
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, STAND, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Tag } from "@whatif/kit/ui/Tag";
import { PAPER } from "@whatif/kit/theme";
import { Mop } from "../parts";
import { FLOOR, PODHALL, PodHallBack, podHallLights } from "../sets/PodHall";
import { camAt, current, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { HerOfferScene } from "./HerOffer";
import { Envelope, handAt, headOf, lineTimes, Mate, moodAt, You, type Body, type Face } from "./Timeline.Cast";
import { Dark, OldPage, PaperYou, PortraitSheet, Strip, STRIP, yearX } from "./Timeline.Strip";

const FIRST = 70;
type T = ReturnType<typeof times>;

function times(shot: Shot) {
  const L = lineTimes(shot.clips, FIRST);
  return {
    start: shot.from,
    tag: L.from(0) + 6,
    sheet: L.at(0, 0.17), // "You've lived longer than anyone..."
    climb: [L.at(0, 0.22), L.at(0, 0.5)] as [number, number],
    name: L.at(0, 0.56), // "Jeanne Calment, 122 years..."
    rent: L.at(0, 0.79), // "And you still pay rent on the same flat."
    drop: L.at(0, 0.81),
    l71: L.from(1),
    unroll: L.at(1, 0.7), // "Unroll it."
    l72: L.from(2),
    stamp: L.at(2, 0.06), // "About a thousand years back"
    unread: L.at(2, 0.55), // "No English speaker today can read it"
    l73: L.from(3), // "Keep going."
    page2: L.at(3, 0.3),
    page3: L.at(3, 0.7),
    l74: L.from(4),
    near: L.at(4, 0.06),
    far: L.at(4, 0.3),
    worry: L.at(4, 0.72), // "You wouldn't understand you."
    l75: L.from(5),
    her: L.at(5, 0.05),
    back: L.at(5, 0.55), // "And you're losing her by arithmetic."
    offer: L.end(5) + 4,
  };
}

/** How far the strip has unrolled (world x of its front). */
function frontAt(frame: number, k: T): number {
  const stop = yearX(1000) + 140;
  if (frame < k.l73) return mix(STRIP.start, stop, ramp(frame, k.unroll, k.stamp - 2));
  return mix(stop, STRIP.end, linear(frame, k.l73, k.l74 - 4));
}

const YOU_X = 720;
const MATE = { x: 540, y: FLOOR, scale: 0.82 };

const Hall: React.FC<{ frame: number; k: T; mood: MoodName }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.start, "hatch"], [k.rent, "rent"], [k.l71, "roll"], [k.unroll, "walk"], [k.l72, "page"],
    [k.l73, "walk2"], [k.l74, "wide"], [k.l75, "her"]] as [number, string][]);
  const front = frontAt(frame, k);

  // you: stretching at your hatch; at the desk with the envelope; at the strip with the roll
  const stretch = Math.sin(Math.PI * linear(frame, k.start + 8, k.sheet - 4));
  let you: Body = { x: YOU_X, y: FLOOR, scale: 1.1, facing: 1, pose: lerpPose(STAND, { ...STAND, armF: [168, 10], armB: [158, 14], lean: -4, tilt: -8 }, stretch) };
  let face: Face = { brows: "flat", lids: 0.55, mouth: stretch > 0.5 ? "o" : "flat", eyes: 1, look: { x: 0.6, y: -0.2 } };
  let held: React.ReactNode;
  if (frame >= k.rent && frame < k.l71) {
    you = { x: 640, y: FLOOR, scale: 1.1, facing: -1, pose: { ...STAND, lean: 6, armF: [40, 30] } };
    face = { brows: "flat", lids: 0.45, mouth: frame > k.drop + 20 ? "frown" : "flat", eyes: 1, look: { x: 0.8, y: 0.6 } };
  } else if (frame >= k.l71) {
    const drop = ramp(frame, k.unroll - 6, k.unroll + 4);
    you = { x: YOU_X, y: FLOOR, scale: 1.1, facing: 1, pose: lerpPose({ ...STAND, armF: [60, 50], armB: [40, 60] }, { ...STAND, lean: 10, armF: [30, 20] }, drop) };
    face = frame < k.unroll
      ? { brows: "raised", lids: 0.15, mouth: "flat", eyes: 1.05, look: { x: 0.7, y: 0.5 } }
      : { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 1, y: 0.3 } };
    if (drop < 0.5) held = <g transform="rotate(80)"><rect x={-18} y={-40} width={36} height={80} rx={14} fill={PAPER} stroke="#b9a989" strokeWidth={4} /></g>;
  }
  const yh = headOf(you);
  const envY = mix(560, 760, ramp(frame, k.drop, k.drop + 10));

  // your flatmate, small, with her mop, at the start of the strip
  const mate: Body = { ...MATE, facing: 1, pose: { ...STAND, armB: [30, 40], armF: [20, 30] } };
  const mopHand = handAt(mate, "back");
  const mateFace: Face = frame < k.back
    ? { brows: "none", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 1, y: 0.4 } }
    : { brows: "worry", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 1, y: 0.2 } };
  const mh = headOf(mate);

  const walkCam = (f: number): Camera => ({ x: Math.max(760, Math.min(2900, frontAt(f, k) - 260)), y: 640, zoom: 1.12 });
  const cams: Record<string, Camera> = {
    hatch: camAt(frame, [[k.start, { x: 620, y: 690, zoom: 1.8 }], [k.rent, { x: 640, y: 680, zoom: 2.0 }]]),
    rent: camAt(frame, [[k.rent, { x: 420, y: 680, zoom: 1.7 }], [k.l71, { x: 440, y: 690, zoom: 1.9 }]]),
    roll: camAt(frame, [[k.l71, closeUp(yh.x + 60, yh.y + 90, 1.9)], [k.unroll, { x: 820, y: 720, zoom: 1.5 }]]),
    walk: walkCam(frame),
    page: camAt(frame, [[k.l72, { x: yearX(1000), y: 700, zoom: 1.5 }], [k.unread, { x: yearX(1000), y: 690, zoom: 1.85 }], [k.l73, { x: yearX(1000) + 20, y: 690, zoom: 1.95 }]]),
    walk2: camAt(frame, [[k.l73, { x: yearX(1000) + 20, y: 690, zoom: 1.6 }], [k.l73 + 24, walkCam(k.l73 + 24)], [k.l74, walkCam(k.l74)]]),
    wide: camAt(frame, [[k.l74, { x: 2300, y: 680, zoom: 0.9 }], [k.far, { x: 2000, y: 660, zoom: 0.62 }], [k.l75, { x: 1950, y: 660, zoom: 0.6 }]]),
    her: camAt(frame, [[k.l75, { x: 1200, y: 700, zoom: 0.9 }], [k.her, closeUp(mh.x + 80, mh.y + 40, 1.9)], [k.back, closeUp(mh.x + 100, mh.y + 30, 2.0)], [k.offer, { x: 1700, y: 660, zoom: 0.62 }]]),
  };
  const cam = drift(cams[on], frame, "timeline", 3);

  const youVisible = frame < k.l74;
  const actors = (
    <>
      <Strip front={front} />
      <OldPage frame={frame} at={k.stamp} x={yearX(1000)} kind={0} />
      <OldPage frame={frame} at={k.page2} x={yearX(2000)} kind={1} scale={0.9} fade={0.9} />
      <OldPage frame={frame} at={k.page3} x={yearX(2900)} kind={2} scale={0.8} fade={0.8} />
      <PaperYou frame={frame} at={k.near} x={STRIP.start + 170} scale={0.8} facing={1} worry={frame >= k.worry} />
      {frame >= k.rent && <Envelope x={330} y={envY} rotate={mix(-30, -4, ramp(frame, k.drop, k.drop + 10))} scale={0.8} />}
      {youVisible && <You body={you} face={face} frame={frame} held={held} />}
      {frame >= k.l75 && (
        <>
          <Mate body={mate} face={mateFace} frame={frame} />
          <Mop x={mopHand.x} y={mopHand.y} reach={150} scale={0.8} />
        </>
      )}
      <Dark />
      <PaperYou frame={frame} at={k.far} x={3180} scale={0.8} facing={-1} shape />
    </>
  );
  return (
    <LookContext.Provider value={setLook(podHallLights(), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<PodHallBack cam={cam} frame={frame} door={0} counter={{ value: "365" }} wedge minutes={52}
          flutterAll={frame >= k.unroll && frame < k.l74} />}
        actors={actors} />
    </LookContext.Provider>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot);
  const { frame } = shot;
  if (frame >= k.offer) return <HerOfferScene shot={shot} />;
  const mood = moodAt(shot, "morning");
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Hall frame={frame} k={k} mood={mood} />
      {frame >= k.sheet - 2 && frame < k.rent && (
        <PortraitSheet frame={frame} at={k.sheet} until={k.rent} climb={k.climb} name={k.name} x={960} y={520} />
      )}
      {frame < k.sheet && <Tag at={k.tag} text="NIGHT 123" x={150} y={110} size={60} />}
      <Sequence from={k.unroll} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.stamp} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.8} /></Sequence>
    </AbsoluteFill>
  );
};

export const timeline: Beat = { id: "Timeline", firstLine: FIRST, Component: Scene };
