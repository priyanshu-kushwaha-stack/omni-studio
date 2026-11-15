// Beat "Tell Me Tomorrow" (script.md v7, ## [00:00] Tell Me Tomorrow): the performed skit before the narrator speaks.
// The hall of sleep pods after close. Lines 0-2 are the boss ("Staff first.") and your flatmate ("So my brother,
// right..." / "...and then he dropped it."); everything else is the lead-in, the gaps and the hold after line 2.
//
//   frame 0   the hall wide, the crate's lid tearing (snap.wav at once): your boss lifts a tangle of three teal coils
//             and drops it in your lap; your flatmate leans in on the mop, mid-story. The autoplay preview.
//   line 0    close on the boss, grinning: "Staff first."
//   line 1    the two of you: "So my brother, right..."; you look at the coils, then at her; bubble "Tell me
//             tomorrow."; you swing in, the door shuts; the counter flutters to 365 while the wall clock ticks once
//   KEY       the door swings up on you juggling the three coils, lids heavy, a sly grin; her face still mid-word; her
//             jaw drops and the mop starts to slide; the thumbnail's frame, locked about 0:06 (TAG 365)
//   line 2    "...and then he dropped it." in a daze; on "dropped" the mop clatters to the floor; you catch all three
//             coils in one hand without looking
//   hold      your boss counts the coils on his fingers, stops, counts again, and looks at the three in your hand
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { Bubble, CounterSound, FLUTTER_FRAMES, Mop, TickSound } from "../parts";
import { POD_ONE } from "../sets/PodHall";
import { REF } from "../sets/common";
import { BOSS, blinking, camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { atText, Crate, DeskFront, HallStage, handAt, headOf, moodNow, onPods, Overlay, Person, TagLabel, type Body, type Face } from "./TellMeTomorrow.Kit";
import { KeyCatch, Tangle } from "./TellMeTomorrow.Key";

/** Every frame of the skit, from the three lines' clips. */
function times(shot: Shot) {
  const { clips, to } = shot;
  const s0 = clips[0].from, e0 = lineEnd(clips, 0);
  const s1 = clips[1].from, e1 = lineEnd(clips, 1);
  const s2 = clips[2].from, e2 = lineEnd(clips, 2);
  const s3 = clips[3]?.from ?? to;
  // Your bubble cuts her off a few words in and her line runs on under the whole move (she hasn't stopped talking
  // when the door comes back up), so the key shot is up about 0:05 and locks on the thumbnail's frame about 0:06.
  const bubble = Math.min(s1 + 10, Math.max(s1 + 4, e1 - 40));
  const shut = bubble + 28;
  const flutter = shut - 2;
  const key = flutter + FLUTTER_FRAMES + 2;
  const lock = Math.max(key + 16, Math.min(s2 - 6, key + 20));
  const drop = Math.max(s2 + 6, atText(shot, 2, "dropped", 4));
  const caught = drop + 16;
  const boss = Math.min(s3 - 40, Math.max(caught + 14, e2 + 10));
  return {
    s0, e0, s1, e1, s2, e2, s3,
    tear: [0, 12] as const,
    lift: [6, 16] as const,
    toss: [14, Math.max(30, Math.min(s0 + 4, 40))] as const,
    bubble,
    swing: [bubble + 12, bubble + 26] as const,
    shut, flutter, tick: flutter + 18, key, lock, unlock: Math.min(s2 - 1, lock + 18),
    drop, caught, boss, recount: boss + Math.round((s3 - boss) * 0.42), look: boss + Math.round((s3 - boss) * 0.74),
  };
}
type T = ReturnType<typeof times>;

const FLOOR = 960;
const YOU_S = 1.0;
const MATE: Body = { x: 1120, y: FLOOR, scale: 1.08, facing: -1, pose: STAND };
const BOSS_B: Body = { x: 340, y: 950, scale: 1.12, facing: 1, pose: STAND };

/** Pod one's lip in world units under this camera (the pods are a 0.85-deep layer). */
const lip = (cam: Camera) => ({ x: POD_ONE.x + 165 + (cam.x - REF.x) * 0.15, y: POD_ONE.y + POD_ONE.h + (cam.y - REF.y) * 0.15 });

/** The hall's actors before the key shot: the boss behind the desk with the crate, you on the lip (until you swing
 *  in), and your flatmate leaning on the mop. */
function hallActors(frame: number, cam: Camera, k: T) {
  // the boss: lifts the tangle, drops it in your lap, then grins through "Staff first."
  const up = ramp(frame, k.lift[0], k.lift[1]) * (1 - ramp(frame, k.toss[0], k.toss[0] + 6));
  const bossPose: Pose = lerpPose({ ...STAND, lean: 10, armF: [60, 40], armB: [30, 40] }, { ...STAND, lean: -4, tilt: -8, armF: [140, 20], armB: [20, 30] }, up);
  const talking = frame >= k.s0 && frame < k.e0 + 4;
  const boss: Body = { ...BOSS_B, pose: talking ? { ...STAND, lean: -2, tilt: -6, armF: [80, 70], armB: [20, 40] } : bossPose };
  const bossFace: Face = talking ? { brows: "raised", lids: 0.1, mouth: "open", eyes: 1.05, look: { x: 0.9, y: 0.1 } }
    : up > 0.3 ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.8, y: -0.2 } }
    : { brows: "none", lids: 0.25, mouth: "smirk", look: { x: 0.9, y: 0.2 } };
  const bossHand = handAt({ ...BOSS_B, pose: bossPose }, "front");

  // you: on the lip, looking at the coils, then at her; your hand up for the bubble; then swinging in
  const L = lip(cam);
  const swing = ramp(frame, k.swing[0], k.swing[1]);
  const hand = frame >= k.bubble && frame < k.swing[0] ? ramp(frame, k.bubble, k.bubble + 6) : 0;
  const youPose: Pose = lerpPose({ ...SEATED, lean: 8, armF: [40, 60], armB: [20, 50] }, { ...SEATED, lean: 4, armF: [80, 10], armB: [20, 50] }, hand);
  const you: Body = { x: L.x + swing * 60, y: seatedY(L.y, YOU_S) - swing * 40, scale: YOU_S * (1 - swing * 0.25), facing: 1, pose: youPose };
  const youFace: Face = frame < k.toss[1] + 4
    ? { brows: "raised", lids: 0.2, mouth: "o", look: { x: -0.8, y: -0.2 } }
    : frame < k.s1 + 14 ? { brows: "raised", lids: 0.1, mouth: "smirk", look: { x: 0.2, y: 0.9 } }
    : { brows: "flat", lids: 0.45, mouth: hand > 0 ? "smirk" : "flat", look: { x: 0.9, y: 0.1 } };
  const youHead = headOf(you);

  // the tangle: in the boss's hand, flying, in your lap (it goes in with you)
  const fly = linear(frame, k.toss[0], k.toss[1]);
  const lap = { x: you.x + 64 * you.scale, y: L.y - 20 - swing * 40 };
  const tangle = frame < k.toss[0]
    ? (up > 0.05 ? { x: bossHand.x, y: bossHand.y, spin: 0 } : null)
    : frame < k.swing[1] ? { x: mix(bossHand.x, lap.x, Math.min(1, fly)), y: mix(bossHand.y, lap.y, Math.min(1, fly)) - Math.sin(Math.min(1, fly) * Math.PI) * 170, spin: (1 - Math.min(1, fly)) * 300 } : null;

  // your flatmate: leaning in on the mop, mid-story
  const telling = frame >= k.s1 && frame < k.e1;
  const matePose: Pose = { ...STAND, lean: -8, tilt: -6, armF: telling ? [72 + Math.sin(frame / 6) * 10, 60] : [50, 70], armB: [25, 95] };
  const mate: Body = { ...MATE, pose: matePose };
  const mateFace: Face = { brows: "raised", lids: 0, mouth: telling || frame < k.s0 ? (Math.floor(frame / 5) % 2 ? "open" : "smile") : "open", eyes: 1.05, look: { x: 0.9, y: frame < k.toss[1] ? -0.2 : 0.2 } };
  const mop = handAt(mate, "back");

  return (
    <>
      <Person who="boss" b={boss} face={bossFace} frame={frame} seed={3} />
      <DeskFront />
      <Crate torn={ramp(frame, k.tear[0], k.tear[1])} coils={frame < k.toss[0] ? 4 : 1} />
      {frame < k.swing[1] && <g opacity={1 - ramp(frame, k.swing[1] - 6, k.swing[1])}><Person who="you" b={you} face={youFace} frame={frame} seed={0} /></g>}
      {tangle && <Tangle x={tangle.x} y={tangle.y} spin={tangle.spin} s={0.75 * (frame < k.swing[0] ? 1 : you.scale)} />}
      <Person who="mate" b={mate} face={mateFace} frame={frame} seed={5} />
      <Mop x={mop.x} y={mop.y} reach={FLOOR - mop.y - 30} scale={1.08} />
      <Bubble frame={frame} at={k.bubble} until={k.shut} x={youHead.x + 40} y={youHead.y - 50} text="Tell me tomorrow." size={40} side="right" />
    </>
  );
}

/** Raised fingers at a hand (figure-local units), for the boss counting coils. */
const Fingers: React.FC<{ n: number }> = ({ n }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = ((-36 + i * 24) * Math.PI) / 180;
      return <g key={i}><line x1={0} y1={0} x2={Math.sin(a) * 34} y2={-Math.cos(a) * 34} stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin(a) * 34} y2={-Math.cos(a) * 34} stroke={BOSS.head} strokeWidth={8} strokeLinecap="round" /></g>;
    })}
    <circle r={14} fill={BOSS.head} stroke={INK} strokeWidth={3} />
  </g>
);

/** The hold after the catch: close on the boss at the desk, counting the coils on his fingers (1, 2, 3...), stopping,
 *  counting again, then looking across at the three in your hand. */
function bossCount(frame: number, k: T, mood: ReturnType<typeof moodNow>) {
  const first = Math.min(4, 1 + Math.floor((frame - k.boss) / 9));
  const again = Math.min(4, 1 + Math.floor((frame - k.recount) / 7));
  const n = frame < k.recount - 8 ? first : frame < k.recount ? 0 : frame < k.look ? again : 3;
  const looking = frame >= k.look;
  const pose: Pose = { ...STAND, lean: looking ? -2 : 6, tilt: looking ? -10 : 6, armF: [128, 60], armB: [40, 90] };
  const face: Face = looking ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.95, y: -0.1 } }
    : frame >= k.recount - 8 && frame < k.recount ? { brows: "worry", lids: 0.2, mouth: "flat", look: { x: 0.3, y: 0.9 } }
    : { brows: "flat", lids: 0.35, mouth: "wobble", look: { x: 0.5, y: 0.6 } };
  const cam = camAt(frame, [[k.boss, closeUp(380, 640, 2.1)], [k.look, closeUp(390, 640, 2.3)], [k.s3, closeUp(400, 636, 2.45)]]);
  return (
    <HallStage frame={frame} cam={drift(cam, frame, "tmt-boss", 2)} mood={mood} hall={{ door: 1, counter: { value: "365" }, minutes: 11 }}
      actors={
        <>
          <Person who="boss" b={{ ...BOSS_B, pose }} face={face} frame={frame} seed={3} held={n > 0 ? <Fingers n={n} /> : undefined} />
          <DeskFront />
          <Crate torn={1} coils={1} />
        </>
      } />
  );
}

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const mood = moodNow(shot);
  const on = current(frame, [[0, "wide"], [k.s0 - 4, "desk"], [k.e0 + 6, "two"], [k.swing[0] + 4, "pod"], [k.tick - 3, "clock"], [k.tick + 9, "pod"], [k.key, "key"], [k.boss, "boss"]]);

  let picture: React.ReactNode;
  if (on === "key") {
    const door = ramp(frame, k.key, k.key + 10);
    const stun = ramp(frame, k.key + 10, k.lock);
    const slide = 0.12 * ramp(frame, k.lock - 6, k.lock) + 0.06 * linear(frame, k.unlock, k.drop);
    const fall = linear(frame, k.drop, k.drop + 7);
    const frozen = frame >= k.lock && frame < k.unlock;
    const catchP = ramp(frame, k.drop + 6, k.caught);
    // the thumbnail's frame is the camera at REF exactly; after it a slow push as she finishes her line
    const cam = frozen || frame < k.lock ? REF : camAt(frame, [[k.unlock, REF], [k.boss, { x: 920, y: 548, zoom: 1.06 }]]);
    picture = (
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null}
        actors={<KeyCatch frame={frame} catchP={catchP} door={door} frozen={frozen} stun={stun} mopDrop={Math.max(slide, fall * fall)}
          mateMouth="open" mateBrows="raised" lids={0.62} brows="flat" mouth="smirk" blink={!frozen && blinking(frame, 2)} />} />
    );
  } else if (on === "boss") {
    picture = bossCount(frame, k, mood);
  } else {
    const cams: Record<string, Camera> = {
      wide: camAt(frame, [[0, { x: 720, y: 690, zoom: 1.5 }], [k.s0, { x: 680, y: 690, zoom: 1.58 }]]),
      desk: camAt(frame, [[k.s0 - 4, closeUp(360, 640, 1.9)], [k.e0 + 6, closeUp(380, 640, 2.0)]]),
      two: camAt(frame, [[k.e0 + 6, { x: 840, y: 700, zoom: 1.42 }], [k.swing[0], { x: 800, y: 700, zoom: 1.5 }]]),
      pod: camAt(frame, [[k.swing[0] + 4, { ...onPods(690, 700), zoom: 2.2 }], [k.key, { ...onPods(700, 690), zoom: 2.4 }]]),
      clock: { ...onPods(300, 250), zoom: 3.2 },
    };
    const cam = drift(cams[on], frame, "tmt", 3);
    const door = 1 - ramp(frame, k.shut - 8, k.shut);
    picture = (
      <HallStage frame={frame} cam={cam} mood={mood}
        hall={{ door, counter: frame >= k.flutter ? { at: k.flutter } : { dark: true }, minutes: frame >= k.tick ? 11 : 10 }}
        actors={hallActors(frame, cam, k)} />
    );
  }

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <Overlay><TagLabel text="365" frame={frame} at={k.lock} until={k.boss} /></Overlay>
      {/* the crate's lid tearing: a sound inside the first half second */}
      <Sequence from={0} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} /></Sequence>
      <Sequence from={k.shut - 8} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.8} /></Sequence>
      <CounterSound at={k.flutter} />
      <TickSound at={k.tick} />
      <Sequence from={k.key} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} /></Sequence>
      {/* the mop clattering on the floor, then the coils slapping into your palm */}
      <Sequence from={k.drop + 7} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.9} /></Sequence>
      <Sequence from={k.drop + 10} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.7} /></Sequence>
      <Sequence from={k.caught - 2} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};

export const tellMeTomorrow: Beat = { id: "TellMeTomorrow", firstLine: 0, Component: Scene };
