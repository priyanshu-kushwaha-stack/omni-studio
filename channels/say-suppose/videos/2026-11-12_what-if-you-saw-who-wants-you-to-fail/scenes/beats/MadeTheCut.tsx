// Beat "Made the Cut" (script.md v3, ## [00:11] Made the Cut; narration lines 1-6). After the platform skit: lines 1-2
// in the morning (MadeTheCut.Morning.tsx: your hand comes down, the letter close, the classroom insert); then the
// academy street at ten, the thumbnail's frame (AcademyStreet view "thumb", camera REF): you big at the left holding up
// the letter, your best friend at the right grinning, fist up, reaching for the hug.
//
//   1      close on you on the empty platform, your hand coming down; the letter close: the crest, the teal seal
//   2      your face; ONE insert: the classroom, him talking at you, your hand flat on the letter in your jacket
//   3      "Ten o'clock. The academy doors open. There he is.": the thumbnail's frame; close on your face; his grin;
//          back to the two of you: "I made it." and the card snaps open over him, the flaps running down the red side
//   hold   PERFORMED (the 4 s after line 3, narrator silent): the card close as the flaps stop on -84; he never looks up
//          at it; his fist pumps once; he steps in, his near arm hooks round your neck and pulls you in, eyes shut,
//          grin wide; close on you: your eyes stay open on the card over his shoulder; his free hand thumps your back
//          twice; the three of you, held
//   4      on him in the hug; "And that's minus eighty-four": push to the card
//   5      "Knew it. Knew it." (his own voice): close on him laughing, the fist pumping
//   6      the card close: it folds shut with a click; over his shoulder, your eyes on the empty air
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { lerpPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { Bubble, headAt, Letter, Meter, MeterSound } from "../parts";
import { blinking, camAt, current, HERO, lineEnd, MINJUN, mix, ramp, type Beat, type Shot } from "../shared";
import { REF } from "../sets/common";
import { ACADEMY, AcademyStreetBack, academyLights, TOWER_DEPTH } from "../sets/AcademyStreet";
import { CHEER, handAt, lineAt, lookFor, moodNow, Shade, shoulderAt, SHOW, Strollers, type Body } from "./MadeTheCut.parts";
import { Morning } from "./MadeTheCut.Morning";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips. */
function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const gap0 = lineEnd(clips, 3), gap1 = from(4);
  const hp = (p: number) => Math.round(gap0 + (gap1 - gap0) * p);
  return {
    // lines 1-2, the morning (MadeTheCut.Morning.tsx)
    down: from(1), // your hand comes down on the empty platform
    letter: at(1, 0.38), // the letter close
    think: from(2), // your face: "So what if every piece of good news ..."
    classroom: at(2, 0.55), // the classroom insert: "You tell nobody all day."
    // line 3, the thumbnail's frame
    t0: from(3), // "Ten o'clock. The academy doors open. There he is."
    face: at(3, 0.34), // close on your face
    grin: at(3, 0.6), // his grin
    two: at(3, 0.8), // back to the two of you
    bubble: at(3, 0.84), // "I made it."
    meter: at(3, 0.9), // the card snaps open over him
    // the performed hold, staged in the gap between line 3 and line 4
    hold: lineEnd(clips, 3), // the card close: the flaps stop on -84
    twoShot: hp(0.14), // the two of you; he never looks up at it
    pump: hp(0.18), // his fist pumps once
    hug: hp(0.3), // he steps in, the near arm hooks round your neck, eyes shut
    you: hp(0.46), // close on you: eyes open on the card, over his shoulder
    thump1: hp(0.58), // his free hand thumps your back
    thump2: hp(0.72), // twice
    three: hp(0.84), // the three of you, held
    q: from(4), // "Because that's your best friend."
    friend: from(4),
    number: at(4, 0.5), // "And that's minus eighty-four."
    knew: from(5) - 3, // "Knew it. Knew it."
    cardCU: from(6) - 3, // "Sixty seconds."
    fold: at(6, 0.28), // "The card folds shut."
    ots: at(6, 0.48), // "His arm stays. So does the number."
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the two of you

const T0 = ACADEMY.thumb;
/** You in the hug: leaning into him, head tipped his way, the letter lowered to your side in the front hand (no arm
 *  crosses your face). */
const HUGGED: Pose = { ...SHOW, lean: 4, tilt: 8, armF: [30, 60] };
/** Where he stands in the hug: just behind your shoulder (he is drawn behind you; his hooking arm is drawn over you). */
const HUG_X = 880;

/** A pulse 0..1..0 over `len` frames from `at`. */
const pulse = (frame: number, at: number, len = 8) => (frame < at || frame > at + len ? 0 : Math.sin(((frame - at) / len) * Math.PI));

function youAt(frame: number, k: T): Body {
  const p = ramp(frame, k.hug, k.hug + 14);
  return { x: T0.hero.x, y: T0.hero.y, scale: T0.hero.scale, facing: 1, pose: lerpPose(SHOW, HUGGED, p) };
}

function minjunAt(frame: number, k: T): Body {
  const p = ramp(frame, k.hug, k.hug + 14);
  // One fist pump (the far arm drops and punches back up), then, in the hug, the far hand comes down to your back and
  // thumps it twice. "Knew it" pumps the fist again.
  const pumpOnce = pulse(frame, k.pump, 12);
  const thump = pulse(frame, k.thump1) + pulse(frame, k.thump2);
  const knew = frame >= k.knew && frame < k.cardCU ? Math.sin((frame - k.knew) / 2.6) * 16 : 0;
  const up: [number, number] = [CHEER.armB[0] + 55 * pumpOnce + knew, CHEER.armB[1] - 40 * pumpOnce];
  const back: [number, number] = [mix(55, 85, thump), mix(50, 20, thump)];
  const armB: [number, number] = frame >= k.thump1 - 10 && frame < k.knew ? back : up;
  const pose: Pose = { ...CHEER, lean: mix(-6, 7, p), tilt: mix(-10, 6, p), armF: p > 0 ? [80, 30] : CHEER.armF, armB };
  return { x: mix(T0.friend.x, HUG_X, p), y: T0.friend.y, scale: T0.friend.scale, facing: -1, pose };
}

/** His near arm hooked round your neck, drawn over you: from his shoulder, over your shoulder, to the back of your
 *  neck. `from` overrides the start (over his shoulder, he is off frame). */
const HookArm: React.FC<{ you: Body; him: Body; amount: number; from?: { x: number; y: number } }> = ({ you, him, amount, from }) => {
  if (amount <= 0) return null;
  const a = from ?? shoulderAt(him);
  const n = shoulderAt(you);
  const end = { x: mix(a.x, n.x - 40, amount), y: mix(a.y, n.y - 30, amount) };
  const mid = { x: (a.x + end.x) / 2 + 20, y: Math.min(a.y, end.y) - 90 * amount };
  return (
    <g>
      <path d={`M${a.x} ${a.y} Q${mid.x} ${mid.y} ${end.x} ${end.y}`} fill="none" stroke={INK} strokeWidth={13 * him.scale} strokeLinecap="round" />
      <circle cx={end.x} cy={end.y} r={9 * him.scale} fill={MINJUN.head} />
    </g>
  );
};

type Face = Partial<Expression>;

/** Your face for the shot on. */
function yourFace(shot: string, frame: number, k: T): Face {
  switch (shot) {
    case "wide": return { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.75, y: -0.55 } };
    case "face": return { brows: "raised", lids: 0, mouth: "open", eyes: 1.2, look: { x: 0.8, y: -0.6 } };
    case "two": return { brows: "raised", lids: 0, mouth: frame < k.meter ? "open" : "o", eyes: 1.2, look: frame < k.meter ? { x: 0.8, y: 0.1 } : { x: 0.75, y: -0.6 } };
    case "cardHold": case "hold": return frame < k.hug ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.8, y: -0.6 } }
      : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: { x: 0.7, y: -0.7 } };
    case "holdYou": return { brows: "raised", lids: 0, mouth: frame < k.thump2 ? "smile" : "flat", eyes: 1.2, look: { x: 0.75, y: -0.75 } };
    case "holdThree": return { brows: "worry", lids: 0.05, mouth: "flat", eyes: 1.15, look: { x: 0.75, y: -0.75 } };
    case "friend": case "number": case "knew": return { brows: "worry", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: -0.2 } };
    case "ots": case "cardCU": return { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.7, y: -0.8 } };
    default: return { brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: { x: 0.7, y: -0.6 } };
  }
}

/** His face. In the hug his eyes are shut and his grin wide; he never looks up at the card. */
function hisFace(shot: string, frame: number, k: T): Face & { blink?: boolean } {
  if (frame >= k.hug && frame < k.q) return { brows: "raised", lids: 0, mouth: "open", eyes: 1, blink: true };
  if (shot === "knew") return { brows: "raised", lids: 0.35, mouth: "open", eyes: 1.05, look: { x: 0.9, y: 0.3 } };
  return { ...EXPRESSIONS.happy, mouth: "open", eyes: 1.1, look: { x: 0.9, y: 0.15 } };
}

// ------------------------------------------------------------------------------------------------ the shot

const Street: React.FC<{ frame: number; k: T; cam: Camera; shot: string; you?: boolean; him?: boolean }> = ({ frame, k, cam, shot, you = true, him = true }) => {
  const yb = youAt(frame, k);
  const mb = minjunAt(frame, k);
  const yh = headAt(yb.x, yb.y, yb.scale, yb.pose, 1);
  const mh = headAt(mb.x, mb.y, mb.scale, mb.pose, -1);
  const hook = ramp(frame, k.hug + 4, k.hug + 16);
  const hand = handAt(yb, "front");
  const face = hisFace(shot, frame, k);
  const actors = (
    <>
      <Shade id="you" x={yh.x} y={yh.y} r={yh.r} />
      {him && <Figure {...mb} head={MINJUN.head} coat={MINJUN.coat} {...face} blink={face.blink ?? blinking(frame, 2)} time={frame} />}
      {you && <Figure {...yb} {...HERO} flow={0.15} time={3 + frame * 0.4} {...yourFace(shot, frame, k)} blink={shot !== "wide" && blinking(frame, 0)} />}
      {you && <Letter x={hand.x - 10} y={hand.y + 40} scale={2.07} tilt={mix(8, -6, hook)} />}
      {/* his near arm round your neck; over his shoulder it comes in from the right edge */}
      <HookArm you={yb} him={mb} amount={hook} from={him ? undefined : { x: shoulderAt(yb).x + 900, y: shoulderAt(yb).y + 160 }} />
      {him && <Meter frame={frame} at={k.meter} x={mh.x} headY={mh.y} r={mh.r} value={-84} until={k.fold} />}
      <Bubble frame={frame} at={k.bubble} until={k.twoShot} x={yh.x - 40} y={yh.y - yh.r - 18} text="I made it." size={56} side="right" />
    </>
  );
  const back = (
    <>
      <AcademyStreetBack cam={cam} mood="night" frame={frame} view="thumb" />
      <Strollers cam={cam} depth={TOWER_DEPTH} frame={frame} y={ACADEMY.thumb.pavement + 70} scale={0.34} count={7} seed={3} from={30} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} />;
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  if (frame < k.t0) return <AbsoluteFill style={{ background: "#000" }}><Morning frame={frame} t={{ down: k.down, letter: k.letter, think: k.think, classroom: k.classroom, end: k.t0 }} mood={moodNow(shot)} /></AbsoluteFill>;
  const on = current(frame, [
    [k.t0, "wide"], [k.face, "face"], [k.grin, "grin"], [k.two, "two"], [k.hold, "cardHold"], [k.twoShot, "hold"], [k.you, "holdYou"], [k.three, "holdThree"],
    [k.q, "friend"], [k.number, "number"], [k.knew, "knew"], [k.cardCU, "cardCU"], [k.ots, "ots"],
  ]);
  const yb = youAt(frame, k), mb = minjunAt(frame, k);
  const yh = headAt(yb.x, yb.y, yb.scale, yb.pose, 1);
  const mh = headAt(mb.x, mb.y, mb.scale, mb.pose, -1);
  const card = { x: mh.x, y: mh.y - mh.r - mh.r * 1.05 }; // the card's middle
  const bump = (pulse(frame, k.thump1) + pulse(frame, k.thump2)) * 5;
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.t0, REF], [k.face, { x: 980, y: 560, zoom: 1.04 }]]),
    face: camAt(frame, [[k.face, closeUp(yh.x + 150, yh.y + 40, 1.5)], [k.grin, closeUp(yh.x + 160, yh.y + 40, 1.6)]]),
    grin: camAt(frame, [[k.grin, closeUp(mh.x - 40, mh.y - 70, 1.55)], [k.two, closeUp(mh.x - 40, mh.y - 80, 1.62)]]),
    two: camAt(frame, [[k.two, REF], [k.hold, { x: 1000, y: 560, zoom: 1.04 }]]),
    cardHold: camAt(frame, [[k.hold, insert(card.x - 20, card.y + 40, 1.9)], [k.twoShot, insert(card.x - 20, card.y + 40, 2.05)]]),
    hold: camAt(frame, [[k.twoShot, { x: 960, y: 560, zoom: 1.0 }], [k.hug, { x: 900, y: 570, zoom: 1.04 }], [k.you, { x: 760, y: 600, zoom: 1.14 }]]),
    holdYou: camAt(frame, [[k.you, { x: yh.x + 230, y: yh.y - 60 + bump, zoom: 1.4 }], [k.three, { x: yh.x + 240, y: yh.y - 60 + bump, zoom: 1.5 }]]),
    holdThree: camAt(frame, [[k.three, { x: 820, y: 580, zoom: 1.08 }], [k.q, { x: 820, y: 580, zoom: 1.1 }]]),
    friend: camAt(frame, [[k.friend, closeUp(mh.x - 30, mh.y - 110, 1.5)], [k.number, closeUp(mh.x - 30, mh.y - 120, 1.58)]]),
    number: camAt(frame, [[k.number, insert(card.x, card.y + 30, 2.0)], [k.knew, insert(card.x, card.y + 30, 2.25)]]),
    knew: camAt(frame, [[k.knew, closeUp(mh.x - 50, mh.y - 90, 1.45)], [k.cardCU, closeUp(mh.x - 50, mh.y - 90, 1.52)]]),
    cardCU: camAt(frame, [[k.cardCU, insert(card.x, card.y + 20, 2.3)], [k.ots, insert(card.x, card.y + 10, 2.45)]]),
    ots: camAt(frame, [[k.ots, closeUp(yh.x + 210, yh.y - 10, 1.45)], [k.end, closeUp(yh.x + 210, yh.y - 20, 1.55)]]),
  };
  // the first frames of line 3 are the thumbnail's frame exactly
  const cam = on === "wide" && frame < k.t0 + 2 ? REF : drift(cams[on], frame, "cut", on === "wide" ? 2 : 3);
  const lightCam = cam;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={lookFor(shot, academyLights("thumb"), lightCam)}>
        <Street frame={frame} k={k} cam={cam} shot={on} him={on !== "ots"} />
      </LookContext.Provider>
      {on === "ots" && <ForegroundHead x={1760} side="right" blur={18} />}
      <MeterSound at={k.meter} />
      <Sequence from={k.fold} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
    </AbsoluteFill>
  );
};

export const madeTheCut: Beat = { id: "MadeTheCut", firstLine: 1, Component: Scene };
