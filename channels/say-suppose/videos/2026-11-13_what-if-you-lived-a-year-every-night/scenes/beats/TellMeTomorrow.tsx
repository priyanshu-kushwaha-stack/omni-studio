// Beat "Tell Me Tomorrow" (script.md, ## [00:00] Tell Me Tomorrow): the performed skit before the narrator speaks.
// The hall of sleep pods after close. Lines 0-2 are the boss ("Staff first.") and your flatmate ("So my brother,
// right..." / "...and then he dropped it."); everything else is the lead-in, the gaps and the stare hold after line 2.
//
//   frame 0   the hall wide, the crate's lid already tearing (snap.wav at once): your boss at the desk, you on the lip
//             of pod one, your flatmate with the mop, mid-story. The first frame is the autoplay preview.
//   line 0    close on the boss: he lifts a coil of teal cable to the lamp, grins, "Staff first.", and tosses it to you
//   line 1    the two of you: she leans on the mop, "So my brother, right..."; your hand up, flat, bubble "Tell me
//             tomorrow."; you swing in, the plug goes in, the door shuts; the counter flutters to 365 while the wall
//             clock ticks once
//   KEY       cut to the key shot, staged exactly as the thumbnail (sets/KeyShot.tsx at REF): the door swings up, you
//             half out of the pod, lids heavy, she has not moved, mouth open mid-word; on screen by 0:06
//   line 2    "...and then he dropped it."; the stare; she waits for the laugh, tilts her head; behind her the boss
//             counts the coils left in the crate on his fingers; the counter holds on 365
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, CounterSound, FLUTTER_FRAMES, Mop, TickSound } from "../parts";
import { KeyShot } from "../sets/KeyShot";
import { POD_ONE } from "../sets/PodHall";
import { REF } from "../sets/common";
import { blinking, camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Coil, Crate, DeskFront, HallStage, handAt, headOf, moodNow, onPods, Person, type Body, type Face } from "./TellMeTomorrow.Kit";

/** Every frame of the skit, from the three lines' clips. */
function times(clips: Clip[], to: number) {
  const s0 = clips[0].from, e0 = lineEnd(clips, 0);
  const s1 = clips[1].from, e1 = lineEnd(clips, 1);
  const s2 = clips[2].from, e2 = lineEnd(clips, 2);
  const s3 = clips[3]?.from ?? to;
  // Her line runs on under the whole move, so the key shot lands about 0:05 and its situation is on screen by 0:06:
  // your bubble cuts her off, you swing in while it is up, the door shuts, the counter runs, the door swings up.
  const shut = s1 + 30;
  const flutter = shut - 2;
  return {
    s0, e0, s1, e1, s2, e2, s3,
    tear: [0, 12] as const,
    lift: [10, Math.max(14, s0 - 2)] as const,
    toss: [e0 - 2, e0 + 12] as const,
    bubble: [s1 + 2, shut] as const,
    swing: [s1 + 12, s1 + 26] as const,
    shut,
    flutter,
    tick: flutter + 18,
    key: flutter + FLUTTER_FRAMES + 2,
    laugh: e2 + 6,
    hall: Math.round(e2 + (s3 - e2) * 0.5),
  };
}
type T = ReturnType<typeof times>;

const FLOOR = 960;
const YOU_S = 1.0;
const MATE: Body = { x: 1120, y: FLOOR, scale: 1.08, facing: -1, pose: STAND };
const BOSS_B: Body = { x: 340, y: 950, scale: 1.12, facing: 1, pose: STAND };

/** Pod one's lip in world units under this camera (the pods are a 0.85-deep layer). */
const lip = (cam: Camera) => ({ x: POD_ONE.x + 165 + (cam.x - REF.x) * 0.15, y: POD_ONE.y + POD_ONE.h + (cam.y - REF.y) * 0.15 });

/** The hall's actors at this frame: the boss behind the desk with the crate, you on the lip (until you swing in), and
 *  your flatmate with the mop. */
function hallActors(frame: number, cam: Camera, k: T, after: boolean) {
  // the boss: lifts a coil to the lamp, grins, tosses; later counts the coils on his fingers
  const up = ramp(frame, k.lift[0], k.lift[1]) * (1 - ramp(frame, k.toss[0], k.toss[0] + 6));
  const counting = after ? Math.floor(frame / 9) % 2 : 0;
  const bossPose: Pose = after
    ? { ...STAND, lean: 6, tilt: 8, armF: [60 + counting * 10, 80], armB: [40, 90] }
    : lerpPose({ ...STAND, lean: 10, armF: [60, 40], armB: [30, 40] }, { ...STAND, lean: -4, tilt: -8, armF: [140, 20], armB: [20, 30] }, up);
  const boss: Body = { ...BOSS_B, pose: bossPose };
  const bossFace: Face = after
    ? { brows: "none", lids: 0.3, mouth: "flat", look: { x: 0.4, y: 0.8 } }
    : frame >= k.s0 && frame < k.e0 + 4 ? { brows: "raised", lids: 0.1, mouth: "open", eyes: 1.05, look: { x: 0.9, y: 0.1 } }
    : up > 0.5 ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.6, y: -0.6 } }
    : { brows: "none", lids: 0.2, mouth: "smirk", look: { x: 0.3, y: 0.7 } };
  const bossHand = handAt(boss, "front");

  // you: on the lip, then swinging in
  const L = lip(cam);
  const swing = ramp(frame, k.swing[0], k.swing[1]);
  const hand = frame >= k.bubble[0] && frame < k.swing[0] ? ramp(frame, k.bubble[0], k.bubble[0] + 6) : 0;
  const youPose: Pose = lerpPose({ ...SEATED, lean: 6, armF: [30, 50], armB: [10, 40] }, { ...SEATED, lean: 4, armF: [80, 10], armB: [10, 40] }, hand);
  const you: Body = { x: L.x + swing * 60, y: seatedY(L.y, YOU_S) - swing * 40, scale: YOU_S * (1 - swing * 0.25), facing: 1, pose: youPose };
  const youFace: Face = frame < k.toss[1]
    ? { brows: "none", lids: 0.35, mouth: "flat", look: { x: -0.7, y: 0.2 } }
    : { brows: "flat", lids: 0.45, mouth: "flat", look: { x: 0.2, y: 0.9 } };
  const youHead = headOf(you);

  // the coil: in the boss's hand, in the air, in your lap
  const fly = linear(frame, k.toss[0], k.toss[1]);
  const lap = { x: you.x + 60 * YOU_S, y: L.y - 18 };
  const coil = frame < k.toss[0]
    ? (up > 0.05 ? { x: bossHand.x, y: bossHand.y, s: 0.9 } : null)
    : frame < k.swing[0] ? { x: mix(bossHand.x, lap.x, fly), y: mix(bossHand.y, lap.y, fly) - Math.sin(fly * Math.PI) * 160, s: 0.9 } : null;

  // your flatmate: leaning on the mop, mid-story; after, waiting for the laugh, then tilting her head
  const talking = frame >= k.s1 && frame < k.e1;
  const tilt = after ? ramp(frame, k.hall + 6, k.hall + 20) : 0;
  const matePose: Pose = { ...STAND, lean: -4 - tilt * 2, tilt: -4 + tilt * 16, armF: talking ? [70 + Math.sin(frame / 7) * 8, 60] : [45, 70], armB: [25, 95] };
  const mate: Body = { ...MATE, pose: matePose };
  const mateFace: Face = after
    ? { brows: tilt > 0.5 ? "worry" : "raised", lids: 0, mouth: tilt > 0.5 ? "flat" : "smile", eyes: 1.05, look: { x: 0.9, y: 0.1 } }
    : { brows: "raised", lids: 0, mouth: "open", eyes: 1.05, look: { x: 0.9, y: frame < k.toss[1] ? -0.2 : 0.2 } };
  const mop = handAt(mate, "back");

  return (
    <>
      <Person who="boss" b={boss} face={bossFace} frame={frame} seed={3} />
      <DeskFront />
      <Crate torn={ramp(frame, k.tear[0], k.tear[1])} coils={after ? 3 : 4} />
      {frame < k.swing[1] && <g opacity={1 - ramp(frame, k.swing[1] - 6, k.swing[1])}><Person who="you" b={you} face={youFace} frame={frame} seed={0} /></g>}
      {after && <Person who="you" b={{ ...you, x: L.x, y: seatedY(L.y, YOU_S), scale: YOU_S, pose: { ...SEATED, lean: 4, tilt: 6, armF: [28, 40] } }}
        face={{ brows: "flat", lids: 0.62, mouth: "flat", look: { x: 0.95, y: 0.05 } }} frame={frame} />}
      {coil && <g transform={`translate(${coil.x} ${coil.y})`}><Coil s={coil.s} /></g>}
      <Person who="mate" b={mate} face={mateFace} frame={frame} seed={5} />
      <Mop x={mop.x} y={mop.y} reach={FLOOR - mop.y - 30} scale={1.08} />
      <Bubble frame={frame} at={k.bubble[0]} until={k.bubble[1]} x={youHead.x + 40} y={youHead.y - 50} text="Tell me tomorrow." size={40} side="right" />
    </>
  );
}

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const on = current(frame, [[0, "wide"], [k.s0 - 6, "desk"], [k.e0 + 6, "two"], [k.swing[0] + 4, "pod"], [k.tick - 3, "clock"], [k.tick + 9, "pod"], [k.key, "key"], [k.hall, "hall"]]);

  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[0, { x: 720, y: 690, zoom: 1.5 }], [k.s0, { x: 680, y: 690, zoom: 1.58 }]]),
    desk: camAt(frame, [[k.s0 - 6, closeUp(340, 640, 1.9)], [k.e0 + 6, closeUp(360, 640, 2.0)]]),
    two: camAt(frame, [[k.e0 + 6, { x: 840, y: 700, zoom: 1.42 }], [k.swing[0], { x: 800, y: 700, zoom: 1.5 }]]),
    pod: camAt(frame, [[k.swing[0] + 4, { ...onPods(690, 700), zoom: 2.2 }], [k.key, { ...onPods(700, 690), zoom: 2.4 }]]),
    clock: { ...onPods(300, 250), zoom: 3.2 },
    key: camAt(frame, [[k.key, REF], [k.s2, REF], [k.e2, { x: 900, y: 545, zoom: 1.07 }], [k.hall, { x: 700, y: 560, zoom: 1.28 }]]),
    hall: camAt(frame, [[k.hall, { x: 780, y: 690, zoom: 1.32 }], [k.s3, { x: 760, y: 680, zoom: 1.4 }]]),
  };
  const cam = on === "key" ? cams.key : drift(cams[on], frame, "tmt", 3);

  let picture: React.ReactNode;
  if (on === "key") {
    const door = ramp(frame, k.key, k.key + 10);
    const mateMouth = frame < k.laugh ? "open" : "smile";
    picture = (
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null}
        actors={<KeyShot frame={frame} door={door} you={door > 0.55} counter={{ value: "365" }} lids={0.62} brows="flat" mouth="flat"
          mateMouth={mateMouth} mateBrows="raised" blink={blinking(frame, 2)} />} />
    );
  } else {
    const after = on === "hall";
    const door = after ? 1 : 1 - ramp(frame, k.shut - 8, k.shut);
    picture = (
      <HallStage frame={frame} cam={cam} mood={mood}
        hall={{ door, counter: after ? { value: "365" } : frame >= k.flutter ? { at: k.flutter } : { dark: true }, minutes: frame >= k.tick ? 11 : 10 }}
        actors={hallActors(frame, cam, k, after)} />
    );
  }

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {/* the crate's lid tearing: a sound inside the first half second */}
      <Sequence from={0} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} /></Sequence>
      <Sequence from={k.shut - 8} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.8} /></Sequence>
      <CounterSound at={k.flutter} />
      <TickSound at={k.tick} />
      <Sequence from={k.key} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} /></Sequence>
    </AbsoluteFill>
  );
};

export const tellMeTomorrow: Beat = { id: "TellMeTomorrow", firstLine: 0, Component: Scene };
