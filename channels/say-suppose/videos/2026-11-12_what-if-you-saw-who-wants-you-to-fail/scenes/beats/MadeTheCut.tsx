// Beat "Made the Cut" (script.md v3, ## [00:11] Made the Cut; narration lines 1-6). After the platform skit: lines 1-2
// in the morning (MadeTheCut.Morning.tsx: your hand comes down, the letter close, the classroom insert); then the
// academy street at ten, the thumbnail's frame (AcademyStreet view "thumb", camera REF): you big at the left holding up
// the letter, your best friend at the right grinning, fist up, reaching for the hug.
//
//   1      close on you on the empty platform, your hand coming down; the letter close: the crest, the teal seal
//   2      your face; ONE insert: the classroom, him talking at you, your hand flat on the letter in your jacket
//   3      "Ten at night. Extra classes finally let out.": the academy steps (MadeTheCut.Steps.tsx), students coming
//          out and down, him waiting at the bottom; "And waiting at the bottom of the steps": the thumbnail's frame; his
//          grin; back to the two of you: "I made it." and the card snaps open over him, the flaps running down the red side
//   hold   PERFORMED (the 4 s after line 3, narrator silent): the card close as the flaps stop on -84; he never looks up
//          at it; his fist pumps once; he steps in, his near arm hooks round your neck and pulls you in, eyes shut,
//          grin wide; close on you: your eyes stay open on the card over his shoulder; his free hand thumps your back
//          twice; the three of you, held
//   4      on him in the hug; "And that's minus eighty-four": push to the card
//   5      "Knew it. Knew it." (his own voice): close on him laughing, the fist pumping
//   6      the card close, a paper dial beside it running out its sixty seconds: it folds shut with a click on "folds
//          shut"; then close on you in the hug, his arm round your neck, the soft edge of his head in the near foreground,
//          your eyes going from the empty air to him and back while he pats your back
//
// v7 (outside review of v6, round 19): the cold open plays this beat's hug (line 3's end and the hold) as the film's
// first eight seconds, so when the film itself reaches it (`cold` false) it enters later and from new angles: the steps
// shot runs on until you pull the letter out at his feet, a closer two-shot, the card's run smeared and -84 landing
// crisp with a punch and a crimson rim, then over your shoulder on his fist pump, close on you as the hug lands, and the
// three of you. The cold open (`cold` true) keeps its frames. In both, his near fist holds half a chocolate bar and the
// hug stamps a brown square on your cheek; your eyes never leave the card (round 19 gag). After the hold, three
// different beats: his hand thumping your back, the card folding shut with its paper timer strip, then the empty air
// above his head with his arm still round you.
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { lerpPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { Bubble, Chocolate, headAt, Letter, Meter, MeterSound, YourShoulder } from "../parts";
import { blinking, camAt, current, HERO, lineEnd, linear, MINJUN, mix, ramp, type Beat, type Shot } from "../shared";
import { REF } from "../sets/common";
import { ACADEMY, AcademyStreetBack, academyLights, TOWER_DEPTH } from "../sets/AcademyStreet";
import { CHEER, ChocSmudge, FlapFx, handAt, lineAt, lookFor, moodNow, Shade, shoulderAt, SHOW, Strollers, TimerStrip, type Body } from "./MadeTheCut.parts";
import { Morning } from "./MadeTheCut.Morning";
import { Steps } from "./MadeTheCut.Steps";

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
    letter: from(1), // "That's your scholarship letter.": the letter close, straight from the doors closing
    stamp: at(1, 0.3), // "You made the cut.": the SCHOLARSHIP stamp thumps down
    pocket: at(1, 0.5), // "And a card just opened over a stranger": you fold it, look up at the air, hide it
    classroom: from(2), // the classroom: You tell nobody all day
    // line 3, the thumbnail's frame
    t0: from(3), // "Ten at night. Extra classes finally let out.": the steps
    wide: at(3, 0.42), // "And waiting at the bottom of the steps": the thumbnail's frame
    grin: at(3, 0.64), // "like every night: your best friend": his grin
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
    fold: at(6, 0.29), // "The card folds shut."
    air: at(6, 0.42), // "His arm stays.": the two of you, the empty air over his head, his arm round you
    ots: at(6, 0.7), // "So does the number.": close on you over his shoulder
    pat1: at(6, 0.48), // his free hand pats your back: the hug jostles you
    pat2: at(6, 0.6),
    thumpA: from(4) + 6, // "Because that's your best friend.": his free hand thumps your back
    thumpB: from(4) + 22,
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the two of you

const T0 = ACADEMY.thumb;
/** Frame p of the way through the hold after line 3. */
const hpAt = (k: T, p: number) => Math.round(k.hold + (k.q - k.hold) * p);
/** You in the hug: leaning into him, head tipped his way, the letter lowered to your side in the front hand (no arm
 *  crosses your face). */
const HUGGED: Pose = { ...SHOW, lean: 4, tilt: 8, armF: [30, 60] };
/** Where he stands in the hug: just behind your shoulder (he is drawn behind you; his hooking arm is drawn over you). */
const HUG_X = 880;

/** A pulse 0..1..0 over `len` frames from `at`. */
const pulse = (frame: number, at: number, len = 8) => (frame < at || frame > at + len ? 0 : Math.sin(((frame - at) / len) * Math.PI));

function youAt(frame: number, k: T): Body {
  const p = ramp(frame, k.hug, k.hug + 14);
  const pat = pulse(frame, k.pat1, 10) + pulse(frame, k.pat2, 10);
  const pose = lerpPose(SHOW, HUGGED, p);
  return { x: T0.hero.x, y: T0.hero.y, scale: T0.hero.scale, facing: 1, pose: { ...pose, tilt: pose.tilt + pat * 3 } };
}

function minjunAt(frame: number, k: T): Body {
  const p = ramp(frame, k.hug, k.hug + 14);
  // One fist pump (the far arm drops and punches back up), then, in the hug, the far hand comes down to your back and
  // thumps it twice. "Knew it" pumps the fist again.
  const pumpOnce = pulse(frame, k.pump, 12);
  const thump = pulse(frame, k.thump1) + pulse(frame, k.thump2) + pulse(frame, k.thumpA) + pulse(frame, k.thumpB);
  const knew = frame >= k.knew && frame < k.cardCU ? Math.sin((frame - k.knew) / 2.6) * 16 : 0;
  const up: [number, number] = [CHEER.armB[0] + 55 * pumpOnce + knew, CHEER.armB[1] - 40 * pumpOnce];
  const back: [number, number] = [mix(55, 85, thump), mix(50, 20, thump)];
  const armB: [number, number] = frame >= k.thump1 - 10 && frame < k.knew ? back : up;
  const pose: Pose = { ...CHEER, lean: mix(-6, 7, p), tilt: mix(-10, 6, p), armF: p > 0 ? [80, 30] : CHEER.armF, armB };
  return { x: mix(T0.friend.x, HUG_X, p), y: T0.friend.y, scale: T0.friend.scale, facing: -1, pose };
}

/** His near arm hooked round your neck, drawn over you: from his shoulder, over your shoulder, to the back of your
 *  neck. `from` overrides the start (over his shoulder, he is off frame). */
const HookArm: React.FC<{ you: Body; him: Body; amount: number; cheek: { x: number; y: number }; from?: { x: number; y: number } }> = ({ you, him, amount, cheek, from }) => {
  if (amount <= 0) return null;
  const a = from ?? shoulderAt(him);
  const n = shoulderAt(you);
  const neck = { x: n.x - 40, y: n.y - 30 };
  // round 19: the fist (half a chocolate bar in it) lands on your cheek first, squashes, then slides down to your neck
  const end = amount < 0.5 ? { x: mix(a.x, cheek.x, amount / 0.5), y: mix(a.y, cheek.y, amount / 0.5) }
    : amount < 0.66 ? cheek
    : { x: mix(cheek.x, neck.x, (amount - 0.66) / 0.34), y: mix(cheek.y, neck.y, (amount - 0.66) / 0.34) };
  const mid = { x: (a.x + end.x) / 2 + 20, y: Math.min(a.y, end.y) - 90 * Math.min(1, amount * 1.4) };
  const squash = amount >= 0.5 && amount < 0.66 ? 0.8 : 1;
  return (
    <g>
      <path d={`M${a.x} ${a.y} Q${mid.x} ${mid.y} ${end.x} ${end.y}`} fill="none" stroke={INK} strokeWidth={13 * him.scale} strokeLinecap="round" />
      <g transform={`translate(${end.x + 4 * him.scale} ${end.y - 6 * him.scale}) scale(${squash} 1)`}><Chocolate x={0} y={0} scale={him.scale * 0.42} half="left" tilt={-24} /></g>
      <circle cx={end.x} cy={end.y} r={9 * him.scale} fill={MINJUN.head} />
    </g>
  );
};

/** Over his shoulder in the hug: the soft edge of HIS pale-blue head and navy hoodie in the near right foreground
 *  (screen space, outside <Stage>), so the near shape is him, not an anonymous blob (v4.2: the kit's black
 *  ForegroundHead is gone from this film). */
const HisShoulder: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "blur(9px)", pointerEvents: "none" }}>
    <g transform="translate(1900 1080) scale(-1 1)">
      <rect x={-250} y={-230} width={470} height={320} rx={150} fill={MINJUN.coat} stroke={INK} strokeWidth={8} />
      <circle cx={10} cy={-400} r={185} fill={MINJUN.head} stroke={INK} strokeWidth={10} />
    </g>
  </svg>
);

type Face = Partial<Expression>;

/** Your face for the shot on. */
function yourFace(shot: string, frame: number, k: T): Face {
  switch (shot) {
    case "wide": return { brows: "raised", lids: 0, mouth: "open", eyes: 1.2, look: { x: 0.8, y: -0.4 } };
    case "two": return { brows: "raised", lids: 0, mouth: frame < k.meter ? "open" : "o", eyes: 1.2, look: frame < k.meter ? { x: 0.8, y: 0.1 } : { x: 0.75, y: -0.6 } };
    case "cardHold": case "hold": return frame < k.hug ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.8, y: -0.6 } }
      : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: { x: 0.7, y: -0.7 } };
    case "holdYou": return { brows: "raised", lids: 0, mouth: frame < k.thump2 ? "smile" : "flat", eyes: 1.2, look: { x: 0.75, y: -0.75 } };
    case "holdThree": return { brows: "worry", lids: 0.05, mouth: "flat", eyes: 1.15, look: { x: 0.75, y: -0.75 } };
    case "friend": case "number": case "knew": return { brows: "worry", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: -0.2 } };
    case "cardCU": return { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.7, y: -0.8 } };
    case "air": return { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.1, look: { x: 0.75, y: -0.8 } };
    case "overHim": return { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.8, y: -0.6 } };
    case "ots": {
      // unsettled: up at the empty air where the card was, across to him, down, and up again
      const glances = [{ x: 0.7, y: -0.85 }, { x: 0.95, y: 0.05 }, { x: 0.35, y: 0.6 }, { x: 0.75, y: -0.8 }];
      const i = Math.min(3, Math.floor((frame - k.ots) / 24));
      return { brows: i === 1 ? "sad" : "worry", lids: i === 2 ? 0.45 : 0.15, mouth: i === 1 ? "smile" : "flat", eyes: 1.05, look: glances[i] };
    }
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
  const hook = ramp(frame, k.hug + 2, k.hug + 24);
  const hand = handAt(yb, "front");
  const face = hisFace(shot, frame, k);
  const cheek = { x: yh.x + yh.r * 0.62, y: yh.y + yh.r * 0.42 };
  const stamped = frame >= k.hug + 13;
  const card = { x: mh.x, y: mh.y - mh.r - mh.r * 1.05 };
  const actors = (
    <>
      <Shade id="you" x={yh.x} y={yh.y} r={yh.r} />
      {him && <Figure {...mb} head={MINJUN.head} coat={MINJUN.coat} {...face} blink={face.blink ?? blinking(frame, 2)} time={frame}
        held={hook <= 0 ? <Chocolate x={6} y={-4} scale={0.42} half="left" tilt={-10} /> : undefined} />}
      {you && <Figure {...yb} {...HERO} flow={0.15} time={3 + frame * 0.4} {...yourFace(shot, frame, k)} blink={shot !== "wide" && !(frame >= k.hug && frame < k.q) && blinking(frame, 0)} />}
      {you && stamped && <ChocSmudge x={cheek.x} y={cheek.y} s={yh.r * 0.3} />}
      {you && <Letter x={hand.x - 10} y={hand.y + 40} scale={2.07} tilt={mix(8, -6, hook)} />}
      {/* his near arm round your neck; over his shoulder it comes in from the right edge */}
      <HookArm you={yb} him={mb} amount={hook} cheek={cheek} from={him ? undefined : { x: shoulderAt(yb).x + 900, y: shoulderAt(yb).y + 160 }} />
      {him && (
        <FlapFx id="minjun" frame={frame} from={k.meter + 4} to={k.meter + 22} x={card.x} y={card.y} r={mh.r} rim={CRIMSON}>
          <Meter frame={frame} at={k.meter} x={mh.x} headY={mh.y} r={mh.r} value={-84} until={k.fold} />
        </FlapFx>
      )}
      {/* "Sixty seconds.": a paper timer strip hung from the card's edge runs out, and folds shut with the card */}
      {him && <TimerStrip frame={frame} start={k.cardCU} end={k.fold} p0={0.8} x={mh.x} headY={mh.y} r={mh.r} />}
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
  // the cold open plays this beat at other film frames (Film.tsx coldSource): there it keeps its v6 shots
  const cold = useCurrentFrame() !== frame;
  if (frame < k.t0) return <AbsoluteFill style={{ background: "#000" }}><Morning frame={frame} t={{ letter: k.letter, stamp: k.stamp, pocket: k.pocket, classroom: k.classroom, end: k.t0 }} mood={moodNow(shot)} /></AbsoluteFill>;
  const stepsTo = cold ? k.wide : k.two;
  if (frame < stepsTo) return <AbsoluteFill style={{ background: "#000" }}><Steps frame={frame} from={k.t0} to={stepsTo} long={!cold} /></AbsoluteFill>;
  type On = "wide" | "grin" | "two" | "cardHold" | "overHim" | "hold" | "holdYou" | "holdThree" | "friend" | "number" | "knew" | "cardCU" | "air" | "ots";
  const list: [number, On][] = cold
    ? [[k.wide, "wide"], [k.grin, "grin"], [k.two, "two"], [k.hold, "cardHold"], [k.twoShot, "hold"], [k.you, "holdYou"], [k.three, "holdThree"]]
    : [[k.two, "two"], [k.hold, "overHim"], [hpAt(k, 0.26), "holdYou"], [hpAt(k, 0.62), "holdThree"]];
  const on = current<On>(frame, [...list, [k.q, "friend"], [k.number, "number"], [k.knew, "knew"], [k.cardCU, "cardCU"], [k.air, "air"], [k.ots, "ots"]]);
  const yb = youAt(frame, k), mb = minjunAt(frame, k);
  const yh = headAt(yb.x, yb.y, yb.scale, yb.pose, 1);
  const mh = headAt(mb.x, mb.y, mb.scale, mb.pose, -1);
  const card = { x: mh.x, y: mh.y - mh.r - mh.r * 1.05 }; // the card's middle
  const bump = (pulse(frame, k.thump1) + pulse(frame, k.thump2) + pulse(frame, k.pat1, 10) + pulse(frame, k.pat2, 10)) * 5;
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.wide, REF], [k.grin, { x: 980, y: 560, zoom: 1.06 }]]),
    grin: camAt(frame, [[k.grin, closeUp(mh.x - 40, mh.y - 70, 1.55)], [k.two, closeUp(mh.x - 40, mh.y - 80, 1.62)]]),
    two: cold ? camAt(frame, [[k.two, REF], [k.hold, { x: 1000, y: 560, zoom: 1.04 }]])
      : camAt(frame, [[k.two, { x: 900, y: 600, zoom: 1.2 }], [k.hold, { x: 920, y: 590, zoom: 1.26 }]]),
    // v7, the film's own pass: over your shoulder (your head's edge at the left) on his fist pump and the reach in
    overHim: camAt(frame, [[k.hold, closeUp(mh.x - 160, mh.y - 150, 1.6)], [hpAt(k, 0.26), closeUp(mh.x - 200, mh.y - 130, 1.7)]]),
    cardHold: camAt(frame, [[k.hold, insert(card.x - 20, card.y + 40, 1.9)], [k.twoShot, insert(card.x - 20, card.y + 40, 2.05)]]),
    hold: camAt(frame, [[k.twoShot, { x: 960, y: 560, zoom: 1.0 }], [k.hug, { x: 900, y: 570, zoom: 1.04 }], [k.you, { x: 760, y: 600, zoom: 1.14 }]]),
    holdYou: camAt(frame, [[cold ? k.you : hpAt(k, 0.26), { x: yh.x + 230, y: yh.y - 60 + bump, zoom: 1.4 }], [cold ? k.three : hpAt(k, 0.62), { x: yh.x + 240, y: yh.y - 60 + bump, zoom: 1.5 }]]),
    holdThree: camAt(frame, [[cold ? k.three : hpAt(k, 0.62), { x: 820, y: 580, zoom: 1.08 }], [k.q, { x: 820, y: 580, zoom: 1.1 }]]),
    friend: camAt(frame, [[k.friend, closeUp(mh.x - 30, mh.y - 110, 1.5)], [k.number, closeUp(mh.x - 30, mh.y - 120, 1.58)]]),
    number: camAt(frame, [[k.number, insert(card.x, card.y + 30, 2.0)], [k.knew, insert(card.x, card.y + 30, 2.25)]]),
    knew: camAt(frame, [[k.knew, closeUp(mh.x - 50, mh.y - 90, 1.45)], [k.cardCU, closeUp(mh.x - 50, mh.y - 90, 1.52)]]),
    cardCU: camAt(frame, [[k.cardCU, insert(card.x, card.y + 60, 2.1)], [k.air, insert(card.x, card.y + 50, 2.25)]]),
    // "His arm stays.": the two of you in the hug and, over his head, nothing
    air: camAt(frame, [[k.air, { x: 900, y: 470, zoom: 1.12 }], [k.ots, { x: 900, y: 490, zoom: 1.18 }]]),
    ots: camAt(frame, [[k.ots, closeUp(yh.x + 170, yh.y - 10 + bump, 1.5)], [k.end, closeUp(yh.x + 150, yh.y - 20 + bump, 1.68)]]),
  };
  // the first frames of the thumbnail shot are the thumbnail's frame exactly
  const cam = on === "wide" && frame < k.wide + 2 ? REF : drift(cams[on], frame, "cut", on === "wide" ? 2 : 3);
  const lightCam = cam;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={lookFor(shot, academyLights("thumb"), lightCam)}>
        <Street frame={frame} k={k} cam={cam} shot={on} him={on !== "ots"} you={on !== "overHim"} />
      </LookContext.Provider>
      {on === "ots" && <HisShoulder />}
      {on === "overHim" && <YourShoulder side="left" />}
      <MeterSound at={k.meter} />
      {/* a harder click as -84 locks; the chocolate stamp's soft thud; the SCHOLARSHIP stamp */}
      <Sequence from={k.meter + 22} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.8} /></Sequence>
      <Sequence from={k.hug + 13} durationInFrames={20}><Audio src={staticFile("sfx/snap-soft.wav")} volume={0.45} /></Sequence>
      <Sequence from={k.stamp} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.9} /></Sequence>
      <Sequence from={k.fold} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
    </AbsoluteFill>
  );
};

export const madeTheCut: Beat = { id: "MadeTheCut", firstLine: 1, Component: Scene };
