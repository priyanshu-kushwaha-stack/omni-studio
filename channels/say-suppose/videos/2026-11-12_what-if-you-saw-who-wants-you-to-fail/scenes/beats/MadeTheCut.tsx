// Beat "Made the Cut" (script.md v2.1, ## [00:00] Made the Cut; narration lines 0-6). The academy street at ten, the
// thumbnail's frame (AcademyStreet view "thumb", camera REF): you big at the left holding up the letter, your best
// friend at the right grinning, fist up, reaching for the hug. The bubble "I made it." pops at once and his card snaps
// open at frame 3, its flaps running to -84 inside the first second.
//
//   0      the thumbnail's frame; the bubble; the card snaps and runs to -84
//   0      close on your face, then the card, then his grin
//   hold   PERFORMED (the 4 s after line 0, narrator silent): he never looks up at the card; his fist pumps once; he
//          steps in, his near arm hooks round your neck and pulls you in, eyes shut, grin wide; close on you: your eyes
//          stay open on the card over his shoulder; his free hand thumps your back twice; the three of you, held
//   1      slow push in on the three
//   2      on him in the hug; "And that's minus eighty-four": push to the card
//   3      insert: the letter; "You've told no one all day": your face, the smile going
//   4      the two of you; "He always has": his fond face
//   5      "Knew it. Knew it.": close on him laughing, the fist pumping
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
import { CHEER, handAt, lineAt, lookFor, Shade, shoulderAt, SHOW, Strollers, type Body } from "./MadeTheCut.parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips. */
function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const gap0 = lineEnd(clips, 0), gap1 = from(1);
  const hp = (p: number) => Math.round(gap0 + (gap1 - gap0) * p);
  return {
    meter: 3, // the card snaps open over him
    face: at(0, 0.36), // close on your face
    card: at(0, 0.6), // the card
    grin: at(0, 0.8), // his grin
    // the performed hold, staged in the gap between line 0 and line 1
    hold: lineEnd(clips, 0) + 1, // the two of you, the card at -84; he never looks up at it
    pump: hp(0.08), // his fist pumps once
    hug: hp(0.24), // he steps in, the near arm hooks round your neck, eyes shut
    you: hp(0.44), // close on you: eyes open on the card, over his shoulder
    thump1: hp(0.56), // his free hand thumps your back
    thump2: hp(0.7), // twice
    three: hp(0.84), // the three of you, held
    q: from(1), // "What if you could see who wants you to fail?"
    friend: from(2), // "Because that's your best friend."
    number: at(2, 0.5), // "And that's minus eighty-four."
    letter: from(3), // "Since this morning, a card opens ..."
    told: at(3, 0.6), // "You've told no one all day."
    always: from(4), // "Not because of the cards."
    fond: at(4, 0.62), // "He always has."
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
  const fade = ramp(frame, k.told + 6, k.told + 30);
  switch (shot) {
    case "wide": return { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.75, y: -0.55 } };
    case "face": return { brows: "raised", lids: 0, mouth: "open", eyes: 1.2, look: { x: 0.8, y: -0.6 } };
    case "hold": return frame < k.hug ? { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 0.8, y: -0.5 } }
      : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: { x: 0.7, y: -0.7 } };
    case "holdYou": return { brows: "raised", lids: 0, mouth: frame < k.thump2 ? "smile" : "flat", eyes: 1.2, look: { x: 0.75, y: -0.75 } };
    case "holdThree": return { brows: "worry", lids: 0.05, mouth: "flat", eyes: 1.15, look: { x: 0.75, y: -0.75 } };
    case "told": return fade < 0.5
      ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.8, y: -0.7 } }
      : { brows: "worry", lids: 0.18, mouth: "flat", eyes: 1, look: { x: 0.8, y: -0.75 } };
    case "always": case "fond": case "knew": return { brows: "worry", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: -0.2 } };
    case "ots": case "cardCU": return { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.7, y: -0.8 } };
    default: return { brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: { x: 0.7, y: -0.6 } };
  }
}

/** His face. In the hug his eyes are shut and his grin wide; he never looks up at the card. */
function hisFace(shot: string, frame: number, k: T): Face & { blink?: boolean } {
  if (frame >= k.hug && frame < k.q) return { brows: "raised", lids: 0, mouth: "open", eyes: 1, blink: true };
  if (shot === "fond") return { ...EXPRESSIONS.relieved, look: { x: 0.9, y: 0.2 } };
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
      <Bubble frame={frame} at={0} until={k.face} x={yh.x - 40} y={yh.y - yh.r - 18} text="I made it." size={56} side="right" />
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
  const on = current(frame, [
    [0, "wide"], [k.face, "face"], [k.card, "card"], [k.grin, "grin"], [k.hold, "hold"], [k.you, "holdYou"], [k.three, "holdThree"],
    [k.q, "hug"], [k.friend, "friend"], [k.number, "number"],
    [k.letter, "letter"], [k.told, "told"], [k.always, "always"], [k.fond, "fond"], [k.knew, "knew"], [k.cardCU, "cardCU"], [k.ots, "ots"],
  ]);
  const yb = youAt(frame, k), mb = minjunAt(frame, k);
  const yh = headAt(yb.x, yb.y, yb.scale, yb.pose, 1);
  const mh = headAt(mb.x, mb.y, mb.scale, mb.pose, -1);
  const card = { x: mh.x, y: mh.y - mh.r - mh.r * 1.05 }; // the card's middle
  const hand = handAt(yb, "front");
  const bump = (pulse(frame, k.thump1) + pulse(frame, k.thump2)) * 5;
  const cams: Record<typeof on, Camera> = {
    wide: frame < 2 ? REF : camAt(frame, [[0, REF], [k.face, { x: 980, y: 560, zoom: 1.04 }]]),
    face: camAt(frame, [[k.face, closeUp(yh.x + 150, yh.y + 40, 1.5)], [k.card, closeUp(yh.x + 160, yh.y + 40, 1.6)]]),
    card: camAt(frame, [[k.card, insert(card.x - 20, card.y + 40, 1.9)], [k.grin, insert(card.x - 20, card.y + 40, 2.05)]]),
    grin: camAt(frame, [[k.grin, closeUp(mh.x - 40, mh.y - 70, 1.55)], [k.hold, closeUp(mh.x - 40, mh.y - 80, 1.62)]]),
    hold: camAt(frame, [[k.hold, { x: 960, y: 560, zoom: 1.0 }], [k.hug, { x: 900, y: 570, zoom: 1.04 }], [k.you, { x: 760, y: 600, zoom: 1.14 }]]),
    holdYou: camAt(frame, [[k.you, { x: yh.x + 230, y: yh.y - 60 + bump, zoom: 1.4 }], [k.three, { x: yh.x + 240, y: yh.y - 60 + bump, zoom: 1.5 }]]),
    holdThree: camAt(frame, [[k.three, { x: 820, y: 580, zoom: 1.08 }], [k.q, { x: 820, y: 580, zoom: 1.1 }]]),
    hug: camAt(frame, [[k.q, { x: 820, y: 580, zoom: 1.1 }], [k.friend, { x: 760, y: 560, zoom: 1.2 }]]),
    friend: camAt(frame, [[k.friend, closeUp(mh.x - 30, mh.y - 110, 1.5)], [k.number, closeUp(mh.x - 30, mh.y - 120, 1.58)]]),
    number: camAt(frame, [[k.number, insert(card.x, card.y + 30, 2.0)], [k.letter, insert(card.x, card.y + 30, 2.25)]]),
    letter: camAt(frame, [[k.letter, insert(hand.x - 10, hand.y - 120, 1.9)], [k.told, insert(hand.x - 10, hand.y - 110, 2.05)]]),
    told: camAt(frame, [[k.told, closeUp(yh.x + 130, yh.y + 30, 1.55)], [k.always, closeUp(yh.x + 140, yh.y + 30, 1.68)]]),
    always: camAt(frame, [[k.always, { x: 720, y: 600, zoom: 1.08 }], [k.fond, { x: 740, y: 600, zoom: 1.16 }]]),
    fond: camAt(frame, [[k.fond, closeUp(mh.x - 20, mh.y - 60, 1.7)], [k.knew, closeUp(mh.x - 20, mh.y - 70, 1.78)]]),
    knew: camAt(frame, [[k.knew, closeUp(mh.x - 50, mh.y - 90, 1.45)], [k.cardCU, closeUp(mh.x - 50, mh.y - 90, 1.52)]]),
    cardCU: camAt(frame, [[k.cardCU, insert(card.x, card.y + 20, 2.3)], [k.ots, insert(card.x, card.y + 10, 2.45)]]),
    ots: camAt(frame, [[k.ots, closeUp(yh.x + 210, yh.y - 10, 1.45)], [k.end, closeUp(yh.x + 210, yh.y - 20, 1.55)]]),
  };
  const cam = on === "wide" && frame < 2 ? REF : drift(cams[on], frame, "cut", on === "wide" ? 2 : 3);
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

export const madeTheCut: Beat = { id: "MadeTheCut", firstLine: 0, Component: Scene };
