// Beat "The Rule" (script.md v3, ## [00:51] The Rule; narration lines 7-20). The rule, then the convenience store at
// night (sets/Store): your best friend, the clerk and the cat; then the phone and the warehouse. No new card opens over
// your best friend in this beat. The title-card ident the script asks for before line 7 is not drawn: story.json
// leaves 0.35 s after line 6, not the 3 s it needs, and the ident's sounds are not in this video's assets/sfx.
//
//   7-8   the rule, acted (Rule.Explain.tsx: the replay, the platform card with its sixty-second dial, the scale with a
//         teal reading and a red one)
//   9     "And it never tells you why.": close on you by the store door; then, in the gap, the store: him at the counter
//         snapping a chocolate bar along its fold, the cat asleep on its crate
//   10    "You want half?" (his own voice), holding out half
//   11    insert: the bar bends in his two palms and snaps, crumbs; the bigger half is yours; your hand comes, stops,
//         then takes it; his half goes up to his mouth; "Tonight you watch him chew"
//   12    the clerk sweeps the bar across the scanner (a red flash, the till lights); you hold the letter up at him: "I
//         made it."; his card snaps open, the flaps don't move, one click, a grey zero
//   13    "Receipt?" (his own voice): the till prints, he tears the slip and holds it out to you
//   14    the grey zero close; your face
//   15    you crouch by the crate; the cat opens one eye; your mouth moves; no snap, nothing
//   16    the eye closes; close on the cat; you
//   17    insert: your phone calling one contact, a peach avatar; cut to the warehouse wide, then waist up on her: the
//         vest, the phone at her ear, a forklift crossing behind her; you, phone to ear
//   18    her, laughing: "Say it again." (her own voice)
//   19    you grinning into the phone, waist up, him chewing at the counter behind you; the phone close, the camera
//         tilting up off it into the empty air where a card would be
//   20    you, the smile going
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone } from "@whatif/kit/sets/props";
import { phone } from "@whatif/kit/sets/Phone";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Bubble, Chocolate, headAt, Letter, Meter, MeterSound, Ponytail, Vest } from "../parts";
import { blinking, camAt, current, HERO, JIYOON, lineEnd, linear, MINJUN, mix, ramp, type Beat, type Shot } from "../shared";
import { REF } from "../sets/common";
import { Cat, STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import { aimArm, handAt, lineAt, moodNow, SnapLines, type Body } from "./MadeTheCut.parts";
import { Explain, ExplainSound } from "./Rule.Explain";
import { DEPOT, DepotBack, depotLights } from "./Rule.Warehouse";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    replay: from(7), // "The rule, once.": the opening card again, at -84
    meter: from(7) + 2, // the replayed card snaps
    say: at(7, 0.13), // "Say your good news out loud, to someone's face": the platform, you say it to her
    open: at(7, 0.4), // "and a card opens over their head"
    sixty: at(7, 0.58), // "For sixty seconds": the card close, the dial starts
    lands: at(7, 0.72), // "it shows how your news lands with them": her under the card
    fold7: lineEnd(clips, 7) - 2, // the dial runs out, the card folds shut
    plus: from(8), // "Plus one hundred": the scale, the marker to the teal end
    joy: at(8, 0.3), // "means pure joy for you": her beaming under the teal card
    minus: at(8, 0.48), // "Minus one hundred": the scale, the marker to the red end
    enemy: at(8, 0.7), // "means they want you to fail": his grin under the red card
    why: from(9), // "And it never tells you why.": your face, by the store door
    wide: lineEnd(clips, 9) + 2, // the store wide, him snapping the bar
    halves: from(10), // "Half?" (his own voice)
    take: from(11), // "Every night, one chocolate bar, two halves.": insert, the two halves
    chew: at(11, 0.62), // "Tonight you watch him chew."
    clerk: from(12), // "The only other face in the shop: the clerk.": he scans the bar
    show: at(12, 0.5), // you hold the letter up at him: "I made it."
    clerkCard: at(12, 0.72), // his card snaps open: the flaps don't move, one click, a grey zero
    receipt: from(13) - 2, // "Receipt?" (his own voice)
    zero: from(14), // "Zero. Grey. One click.": the card close
    you12: at(14, 0.45), // "The biggest news of your life, and you're a receipt."
    cat: from(15), // "The cat on the crate.": you crouch by the crate; the cat opens one eye
    eye: at(15, 0.12),
    speak: at(15, 0.3), // your mouth moves; no snap, nothing
    catShut: at(16, 0.3), // "So either a cat isn't a face, or a cat doesn't care.": the eye closes
    never: at(16, 0.62), // "You'll never know."
    phone: from(17), // insert: your phone, calling your sister
    her: at(17, 0.2), // "Your sister. Six years of night shifts at a warehouse ...": the warehouse wide
    herClose: at(17, 0.5), // waist up on her: the vest, the phone, the forklift behind
    tell: at(17, 0.84), // "You tell her."
    again: from(18) - 3, // "Say it again." (her own voice)
    you: from(19), // "You do. You're grinning into a phone."
    nothing: at(19, 0.55), // "And nothing opens over a phone."
    fade: from(20), // "So you've read your best friend. And her number, you still don't have."
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the store

const S = STORE.scale;
const MJ_X = STORE.customer.x;
/** At the counter for "Half?": you step up beside him. */
const YOU_COUNTER = 1010;

/** The clerk behind the counter: grey-green head, a green apron over a grey shirt. */
const CLERK = { head: "#9fb59a", coat: "#7a7f8c", apron: "#3f7a6a" } as const;
const Clerk: React.FC<{ frame: number; face: Look; held?: React.ReactNode; arm?: [number, number] }> = ({ frame, face, held, arm }) => {
  const { x } = STORE.clerk;
  return (
    <g>
      <Figure x={x} y={STORE.floor} scale={S} facing={-1} pose={arm ? { ...STAND, armF: arm } : held ? { ...STAND, armF: [70, 40] } : STAND} head={CLERK.head} coat={CLERK.coat} {...face}
        blink={blinking(frame, 7)} time={frame} held={held} />
      <path d={`M${x - 22 * S} ${STORE.floor - 205 * S} h${44 * S} l${8 * S} ${150 * S} h${-60 * S}z`} fill={CLERK.apron} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A phone held to the ear with the BACK arm (so no arm crosses the face): the arm angles and the phone's spot. */
function earPhone(b: Body): { pose: Pose; phone: { x: number; y: number } } {
  const h = headAt(b.x, b.y, b.scale, b.pose, b.facing);
  const target = { x: h.x - b.facing * h.r * 1.0, y: h.y + h.r * 0.15 };
  return { pose: { ...b.pose, armB: aimArm(b, target) }, phone: target };
}

const Phone: React.FC<{ at: { x: number; y: number }; scale: number; facing: 1 | -1 }> = ({ at, scale, facing }) => (
  <g transform={`translate(${at.x} ${at.y}) scale(${facing} 1)`}><HandPhone scale={scale * 1.1} lit /></g>
);

type Look = Partial<Expression>;

/** The store with the clerk, the counter, your best friend, you and the cat. No card opens here. */
const StoreShot: React.FC<{
  frame: number; k: T; cam: Camera; mood: ReturnType<typeof moodNow>; youX: number; youFace: Look; youPhone?: "ear" | "hand" | null;
  mjFacing?: 1 | -1; mjFace: Look; mjPose?: Pose; mjHeld?: React.ReactNode; youHeld?: React.ReactNode; youPose?: Pose;
  youFacing?: 1 | -1; mjX?: number; clerkFace?: Look; clerkHeld?: React.ReactNode; clerkCard?: boolean; youBubble?: boolean;
  catEyes?: "open" | "one" | "shut"; clerkArm?: [number, number]; counterExtra?: React.ReactNode;
}> = ({ frame, k, cam, mood, youX, youFace, youPhone = null, mjFacing = 1, mjFace, mjPose = STAND, mjHeld, youHeld, youPose = STAND,
  youFacing = 1, mjX = MJ_X, clerkFace, clerkHeld, clerkCard, youBubble, catEyes = "shut", clerkArm, counterExtra }) => {
  const ch = headAt(STORE.clerk.x, STORE.floor, S, STAND, -1);
  let you: Body = { x: youX, y: STORE.floor, scale: S, facing: youFacing, pose: youPose };
  const yh = headAt(you.x, you.y, S, youPose, youFacing);
  let phoneAt: { x: number; y: number } | null = null;
  if (youPhone === "ear") {
    const e = earPhone(you);
    you = { ...you, pose: e.pose };
    phoneAt = e.phone;
  } else if (youPhone === "hand") {
    you = { ...you, pose: { ...you.pose, armB: [30, 70] } };
    phoneAt = handAt(you, "back");
  }
  const actors = (
    <>
      <Clerk frame={frame} face={clerkFace ?? { ...EXPRESSIONS.neutral, lids: 0.35, look: { x: 0.4, y: 0.5 } }} held={clerkHeld} arm={clerkArm} />
      {clerkCard && <Meter frame={frame} at={k.clerkCard} x={ch.x} headY={ch.y} r={ch.r} value={0} until={k.cat} />}
      <StoreCounter />
      {counterExtra}
      <Cat {...STORE.cat} frame={frame} look={0.6} eyes={catEyes} />
      <Figure x={mjX} y={STORE.floor} scale={S} facing={mjFacing} pose={mjPose} head={MINJUN.head} coat={MINJUN.coat} {...mjFace}
        blink={blinking(frame, 2)} time={frame} held={mjHeld} />
      {phoneAt && youPhone === "ear" && <Phone at={phoneAt} scale={S} facing={1} />}
      <Figure {...you} {...HERO} {...youFace} blink={blinking(frame, 0)} time={frame} held={youHeld} />
      {phoneAt && youPhone === "hand" && <Phone at={phoneAt} scale={S * 0.9} facing={1} />}
      {youBubble && <Bubble frame={frame} at={k.show + 4} until={k.clerkCard} x={yh.x + youFacing * yh.r * 0.8} y={yh.y - yh.r * 1.1} text="I made it." size={40} side="right" />}
    </>
  );
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<StoreBack cam={cam} mood={mood} frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

const LETTER = <Letter x={4} y={6} scale={0.42} tilt={-6} />;
/** His chocolate bar in his hand, whole, then snapped (the half he keeps); your half. */
const BAR = <Chocolate x={8} y={-4} scale={0.42} tilt={-10} />;
const HALF = <Chocolate x={6} y={-4} scale={0.42} half="right" tilt={-10} />;
const YOUR_HALF = <Chocolate x={6} y={-4} scale={0.42} half="left" tilt={-10} />;

/** Line 9: "And it never tells you why." on your face by the store door, looking across at him; then, in the gap, the
 *  store wide: him at the counter snapping the bar. */
const StoreRule: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.why, "why"], [k.wide, "wide"]]);
  const you = headAt(STORE.door.x, STORE.floor, S, STAND, 1);
  const cams: Record<typeof on, Camera> = {
    why: camAt(frame, [[k.why, closeUp(you.x + 30, you.y, 2.55)], [k.wide, closeUp(you.x + 20, you.y, 2.8)]]),
    wide: camAt(frame, [[k.wide, REF], [k.halves, { x: 990, y: 600, zoom: 1.08 }]]),
  };
  const cam = drift(cams[on], frame, "rule-store", 3);
  const snapped = frame >= k.wide + 12;
  const down = ramp(frame, k.why + 26, k.why + 40);
  const youFace: Look = on === "why"
    ? { brows: "worry", lids: mix(0.15, 0.4, down), mouth: "flat", eyes: 1, look: { x: mix(0.9, 0.5, down), y: mix(0, 0.5, down) } }
    : { brows: "flat", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.1 } };
  return (
    <StoreShot frame={frame} k={k} cam={cam} mood={mood} youX={STORE.door.x} youFace={youFace} youHeld={LETTER}
      mjFace={{ ...EXPRESSIONS.happy, look: { x: 0.6, y: 0.5 } }} mjHeld={snapped ? HALF : BAR} mjPose={{ ...STAND, armF: [55, 70], armB: snapped ? [40, 60] : [-7, 8] }} />
  );
};

/** Lines 7-9: the rule, acted (Rule.Explain.tsx), then your face and the store. */
const RuleShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  if (frame < k.why) return <Explain frame={frame} k={k} />;
  return <StoreRule frame={frame} k={k} mood={mood} />;
};

/** The insert: the bar in his two palms over the counter bends and snaps (ink snap strokes, crumbs falling); the halves
 *  are not equal and the bigger one is yours; your hand comes in, stops short, then takes it; his half goes up to his
 *  mouth. (v4.1 snapped it in ten frames and held three seconds; outside review.) */
const HalvesInsert: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const t = frame - k.take;
  const bend = ramp(t, 2, 14) * 12;
  const part = ramp(t, 14, 24);
  const cam = drift(camAt(frame, [[k.take, { x: 960, y: 580, zoom: 1.0 }], [k.chew, { x: 940, y: 560, zoom: 1.12 }]]), frame, "halves", 2);
  const palm = (x: number, y: number, flip: 1 | -1) => (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <rect x={-60} y={60} width={140} height={700} rx={60} fill={MINJUN.coat} stroke={INK} strokeWidth={8} transform="rotate(-18)" />
      <ellipse cx={0} cy={30} rx={150} ry={92} fill={MINJUN.head} stroke={INK} strokeWidth={8} />
    </g>
  );
  // your hand: in from the left, stops short (you hesitate), then takes the bigger half and draws it away
  const come = ramp(t, 24, 38), take = ramp(t, 52, 62), away = ramp(t, 64, 82);
  const hand = { x: mix(-300, 470, come) + take * 150 - away * 520, y: mix(820, 700, come) - take * 60 + away * 40 };
  // his: the right half (the smaller) goes up toward his mouth after you take yours
  const eat = ramp(t, 70, 99);
  const right = { x: 960 + part * 120 + eat * 160, y: 600 - eat * 300 };
  const leftFree = { x: 960 - part * 120, y: 600 };
  const left = t < 60 ? leftFree : { x: hand.x + 120, y: hand.y - 90 };
  const half = (at: { x: number; y: number }, side: "left" | "right", sx: number, rot: number) => (
    <g transform={`translate(${at.x} ${at.y}) rotate(${rot}) scale(${4.2 * sx} 4.2)`}><Chocolate x={0} y={0} half={side} /></g>
  );
  const actors = (
    <g>
      {palm(right.x + 70, right.y + 40, 1)}
      {half(right, "right", 0.8, bend - part * 4 + eat * 10)}
      {palm(leftFree.x - 150 - away * 200, leftFree.y + 40 + away * 120, -1)}
      {half(left, "left", 1.25, -bend + part * 4 - take * 10)}
      <SnapLines frame={frame} at={k.take + 14} x={960} y={590} r={70} count={7} tilt={-20} />
      {/* crumbs off the break */}
      {t >= 14 && t < 40 && [0, 1, 2, 3].map((i) => (
        <rect key={i} x={950 + (i - 1.5) * 18 + (i - 1.5) * (t - 14) * 2} y={610 + Math.pow(t - 14, 2) * (0.8 + i * 0.15)} width={12} height={10}
          fill="#5a3422" transform={`rotate(${(t - 14) * 20 * (i % 2 ? 1 : -1)} ${955 + (i - 1.5) * 18} ${615 + Math.pow(t - 14, 2)})`} />
      ))}
      {/* your hand, from the left */}
      <g transform={`translate(${hand.x} ${hand.y}) scale(-1 1)`}>
        <rect x={0} y={-56} width={900} height={112} rx={50} fill="#3b3e47" stroke={INK} strokeWidth={8} />
        <circle cx={0} cy={0} r={72} fill={MUSTARD} stroke={INK} strokeWidth={8} />
      </g>
    </g>
  );
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<CounterTop />} actors={actors} />
    </LookContext.Provider>
  );
};

/** The counter's top seen close: pale laminate with a seam, a receipt roll at the edge. */
const CounterTop: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2600} fill="#9fb0ba" />
    {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-1400} y1={-200 + i * 180} x2={3400} y2={-260 + i * 180} stroke="#000" strokeWidth={3} opacity={0.05} />)}
    <rect x={-1400} y={900} width={4800} height={40} fill="#c9d2d8" />
    <rect x={1500} y={160} width={160} height={110} rx={12} fill="#f4efe2" stroke={INK} strokeWidth={6} />
  </g>
);

/** Line 10: at the counter, "Half?", the insert, and him chewing. */
const HalfShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.halves, "offer"], [k.take, "insert"], [k.chew, "chew"]]);
  if (on === "insert") return <HalvesInsert frame={frame} k={k} mood={mood} />;
  const turn: Pose = { ...STAND, armF: [70, 30] };
  const cam = drift(on === "offer"
    ? camAt(frame, [[k.halves, { x: 1110, y: 640, zoom: 1.9 }], [k.take, { x: 1120, y: 640, zoom: 2.0 }]])
    : camAt(frame, [[k.chew, { x: 1160, y: 650, zoom: 2.1 }], [k.clerk, { x: 1170, y: 650, zoom: 2.2 }]]), frame, "half", 3);
  const chewing = on === "chew" && Math.floor((frame - k.chew) / 5) % 2 === 0;
  return (
    <StoreShot frame={frame} k={k} cam={cam} mood={mood} youX={YOU_COUNTER}
      youFace={on === "offer" ? { ...EXPRESSIONS.happy, look: { x: 0.9, y: 0 } } : { ...EXPRESSIONS.happy, lids: 0.2, look: { x: 1, y: -0.1 } }}
      youHeld={on === "chew" ? YOUR_HALF : LETTER} youPose={on === "chew" ? { ...STAND, armF: [60, 80] } : STAND}
      mjFacing={-1} mjPose={turn} mjHeld={HALF}
      mjFace={on === "chew" ? { brows: "none", lids: 0.4, mouth: chewing ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } } : { ...EXPRESSIONS.happy, mouth: Math.floor((frame - k.halves) / 5) % 2 ? "open" : "smile", look: { x: 0.9, y: 0.1 } }} />
  );
};

/** Lines 12-14: the clerk. You turn to the counter, he scans the bar; you hold the letter up at him; his card: the flaps
 *  don't move, one click, a grey zero; "Receipt?"; the card close; your face. */
const ClerkShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.clerk, "clerk"], [k.show, "show"], [k.receipt, "receipt"], [k.zero, "zero"], [k.you12, "you"]]);
  const ch = headAt(STORE.clerk.x, STORE.floor, S, STAND, -1);
  const card = { x: ch.x, y: ch.y - ch.r * 2.05 };
  const YX = 1460;
  const yh = headAt(YX, STORE.floor, S, STAND, 1);
  const cams: Record<typeof on, Camera> = {
    clerk: camAt(frame, [[k.clerk, { x: 1560, y: 640, zoom: 1.7 }], [k.show, { x: 1570, y: 630, zoom: 1.8 }]]),
    show: camAt(frame, [[k.show, { x: 1580, y: 600, zoom: 1.75 }], [k.receipt, { x: 1600, y: 590, zoom: 1.85 }]]),
    receipt: camAt(frame, [[k.receipt, closeUp(ch.x - 40, ch.y - 50, 2.5)], [k.zero, closeUp(ch.x - 40, ch.y - 55, 2.6)]]),
    zero: camAt(frame, [[k.zero, insert(card.x, card.y + 30, 4.2)], [k.you12, insert(card.x, card.y + 30, 4.5)]]),
    you: camAt(frame, [[k.you12, closeUp(yh.x + 30, yh.y, 2.6)], [k.cat, closeUp(yh.x + 30, yh.y, 2.8)]]),
  };
  const cam = drift(cams[on], frame, "clerk", on === "zero" ? 1.5 : 3);
  const up = ramp(frame, k.show, k.show + 8);
  const youFace: Look = on === "you" ? { brows: "sad", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.3 } }
    : frame >= k.clerkCard + 6 ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 0.8, y: -0.7 } }
    : { brows: "raised", lids: 0, mouth: frame >= k.show ? "open" : "smile", eyes: 1.1, look: { x: 0.9, y: 0 } };
  // he sweeps the bar across the scanner (a red flash and the till lighting at the beep); then, on "Receipt?", the till
  // prints, he tears the slip and holds it out to you, and keeps holding it out
  const scanning = frame < k.show + 10;
  const sweep = ramp(frame, k.clerk + 8, k.clerk + 30);
  const beep = frame >= k.clerk + 18 && frame < k.clerk + 26;
  const print = ramp(frame, k.receipt - 14, k.receipt - 2);
  const offer = ramp(frame, k.receipt, k.receipt + 8);
  const tear = frame >= k.receipt - 2 && frame < k.receipt + 2 ? 4 : 0;
  const receipt = frame >= k.receipt - 14
    ? (
      <g transform={`translate(${-4 + tear} -4) rotate(${mix(8, -4, offer)})`}>
        <rect x={-14} y={0} width={28} height={10 + 70 * print} rx={2} fill={PAPER} stroke={INK} strokeWidth={3} />
        {Array.from({ length: Math.floor(print * 5) }, (_, i) => <rect key={i} x={-8} y={14 + i * 13} width={i % 2 ? 10 : 16} height={4} rx={2} fill={INK} opacity={0.5} />)}
        <path d={`M-14 ${10 + 70 * print} l5 5 l5 -5 l5 5 l5 -5 l5 5 l4 -5`} fill="none" stroke={INK} strokeWidth={2} />
      </g>
    ) : undefined;
  const clerkArm: [number, number] | undefined = scanning ? [mix(40, 100, sweep), mix(60, 10, sweep)]
    : receipt ? [mix(40, 95, offer), mix(50, 0, offer)] : undefined;
  const clerkFace: Look = on === "receipt"
    ? { brows: "flat", lids: 0.4, mouth: Math.floor((frame - k.receipt) / 5) % 2 ? "o" : "flat", eyes: 1, look: { x: 0.8, y: 0.1 } }
    : { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: scanning ? { x: 0.3, y: 0.7 } : { x: 0.8, y: 0.1 } };
  const flash = beep ? (
    <g>
      <rect x={1556} y={STORE.counter.top - 40} width={68} height={42} rx={6} fill={CRIMSON} opacity={0.35} />
      <line x1={1566} y1={STORE.counter.top - 36} x2={1614} y2={STORE.counter.top - 36} stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />
      <rect x={STORE.till.x - 58} y={STORE.till.y - 40} width={116} height={64} rx={4} fill="#ffffff" opacity={0.6} />
    </g>
  ) : null;
  return (
    <StoreShot frame={frame} k={k} cam={cam} mood={mood} youX={YX} youFace={youFace} youHeld={LETTER}
      youPose={{ ...STAND, armF: [mix(30, 100, up), mix(60, 10, up)] }} youBubble mjX={1150}
      mjFace={{ brows: "none", lids: 0.4, mouth: Math.floor(frame / 6) % 2 ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF}
      clerkFace={clerkFace} clerkHeld={scanning ? <Chocolate x={6} y={-4} scale={0.4} half="right" /> : receipt} clerkArm={clerkArm} counterExtra={flash} clerkCard />
  );
};

/** Lines 15-16: you crouch by the crate; the cat opens one eye; your mouth moves; nothing; the eye closes. */
const CROUCH: Pose = { ...STAND, lean: 16, drop: 50, legF: [70, -110], legB: [55, -105], armF: [62, 30] };
const CatShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.cat, "crouch"], [k.catShut, "cat"], [k.never, "you"]]);
  const YX = 500;
  const yh = headAt(YX, STORE.floor, S, CROUCH, -1);
  const c = STORE.cat;
  const cams: Record<typeof on, Camera> = {
    crouch: camAt(frame, [[k.cat, { x: 350, y: 760, zoom: 2.1 }], [k.catShut, { x: 340, y: 760, zoom: 2.25 }]]),
    cat: camAt(frame, [[k.catShut, insert(c.x + 20, c.y - 120, 3.6)], [k.never, insert(c.x + 20, c.y - 120, 3.9)]]),
    you: camAt(frame, [[k.never, closeUp(yh.x - 30, yh.y, 2.8)], [k.phone, closeUp(yh.x - 30, yh.y, 3.0)]]),
  };
  const cam = drift(cams[on], frame, "cat", 2.5);
  const speaking = frame >= k.speak && frame < k.speak + 40;
  const youFace: Look = on === "you" ? { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.3 } }
    : { brows: "raised", lids: 0, mouth: speaking && Math.floor(frame / 5) % 2 ? "open" : "smile", eyes: 1.05, look: { x: 0.9, y: 0.4 } };
  const catEyes = frame >= k.eye && frame < k.catShut + 10 ? "one" : "shut";
  return (
    <StoreShot frame={frame} k={k} cam={cam} mood={mood} youX={YX} youFacing={-1} youPose={CROUCH} youFace={youFace} youHeld={LETTER}
      mjFace={{ brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF} catEyes={catEyes} />
  );
};

// ------------------------------------------------------------------------------------------------ the phone and the warehouse

const PhoneInsert: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.phone, { x: 1180, y: 520, zoom: 1.45 }], [k.her, { x: 1180, y: 540, zoom: 1.6 }]]), frame, "phone", 2);
  const press = ramp(frame, k.phone + 8, k.phone + 22);
  const options = { ...phone.defaults, mode: "call" as const, contact: JIYOON.head, thumb: mix(0.95, 0.74, press), behind: "desk" as const };
  const props = { cam, mood, frame, options };
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<><StoreBack cam={cam} mood={mood} frame={frame} /><rect x={-1400} y={-900} width={4800} height={2600} fill="#0d0f18" opacity={0.45} /></>}
        actors={phone.Mid?.(props)} />
    </LookContext.Provider>
  );
};

/** "And nothing opens over a phone.": your phone close, in the call (her avatar), then the camera tilts up off it into
 *  the empty air above, where a card would open. */
const PhoneAir: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.nothing, { x: 1180, y: 560, zoom: 1.5 }], [k.nothing + 18, { x: 1180, y: 540, zoom: 1.5 }], [k.fade, { x: 1170, y: 40, zoom: 1.6 }]]), frame, "phone-air", 2);
  const options = { ...phone.defaults, mode: "call" as const, contact: JIYOON.head, thumb: null, behind: "desk" as const };
  const props = { cam, mood, frame, options };
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<><StoreBack cam={cam} mood={mood} frame={frame} /><rect x={-1400} y={-900} width={4800} height={2600} fill="#0d0f18" opacity={0.45} /></>}
        actors={phone.Mid?.(props)} />
    </LookContext.Provider>
  );
};

/** Your sister at the warehouse, the phone to her ear (her back arm), the vest, the hair tied back. */
const DepotShot: React.FC<{ frame: number; k: T; cam: Camera; face: Look; mood: ReturnType<typeof moodNow> }> = ({ frame, k, cam, face, mood }) => {
  const d = DEPOT.jiyoon;
  const e = earPhone({ x: d.x, y: d.y, scale: d.scale, facing: d.facing, pose: STAND });
  const pose = e.pose;
  // the forklift crosses behind her through the wide and the waist-up shot
  const lift = mix(0.08, 0.72, linear(frame, k.her, k.tell));
  const actors = (
    <>
      <Phone at={e.phone} scale={d.scale} facing={-1} />
      <Ponytail x={d.x} y={d.y} scale={d.scale} pose={pose} facing={-1} />
      <Figure x={d.x} y={d.y} scale={d.scale} facing={-1} pose={pose} head={JIYOON.head} coat={JIYOON.coat} {...face} blink={blinking(frame, 5)} time={frame} />
      <Vest x={d.x} y={d.y} scale={d.scale} pose={pose} facing={-1} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(depotLights(), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<DepotBack cam={cam} lift={lift} />} actors={actors} />
    </LookContext.Provider>
  );
};

/** Lines 11-13: the call. */
const CallShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.phone, "phone"], [k.her, "her"], [k.herClose, "herClose"], [k.tell, "tell"], [k.again, "again"], [k.you, "grin"], [k.nothing, "nothing"], [k.fade, "fade"]]);
  if (on === "phone") return <PhoneInsert frame={frame} k={k} mood={mood} />;
  const jh = headAt(DEPOT.jiyoon.x, DEPOT.jiyoon.y, DEPOT.jiyoon.scale, STAND, -1);
  if (on === "nothing") return <PhoneAir frame={frame} k={k} mood={mood} />;
  if (on === "her" || on === "herClose" || on === "again") {
    const cams: Record<"her" | "herClose" | "again", Camera> = {
      her: camAt(frame, [[k.her, { x: 1060, y: 640, zoom: 1.2 }], [k.herClose, { x: 1075, y: 640, zoom: 1.3 }]]),
      // waist up: her head high in frame, the vest's stripe and the phone readable, the aisle and the forklift behind
      herClose: camAt(frame, [[k.herClose, { x: jh.x - 70, y: jh.y + 120, zoom: 2.35 }], [k.tell, { x: jh.x - 60, y: jh.y + 110, zoom: 2.5 }]]),
      again: camAt(frame, [[k.again, closeUp(jh.x - 70, jh.y - 10, 2.9)], [k.you, closeUp(jh.x - 70, jh.y - 10, 3.05)]]),
    };
    const faces: Record<"her" | "herClose" | "again", Look> = {
      her: { brows: "raised", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 0.4, y: 0.4 } },
      herClose: { brows: "raised", lids: 0.15, mouth: frame > k.herClose + 30 ? "open" : "smile", eyes: 1.1, look: { x: 0.6, y: 0.1 } },
      again: { brows: "raised", lids: 0.45, mouth: Math.floor((frame - k.again) / 6) % 3 === 2 ? "smile" : "open", eyes: 1.05, look: { x: 0.8, y: 0 } },
    };
    return <DepotShot frame={frame} k={k} cam={drift(cams[on], frame, "depot", 3)} face={faces[on]} mood={mood} />;
  }
  const you = headAt(STORE.door.x, STORE.floor, S, STAND, 1);
  const fading = ramp(frame, k.fade + 8, k.fade + 40);
  const cams: Record<"tell" | "grin" | "fade", Camera> = {
    tell: camAt(frame, [[k.tell, closeUp(you.x + 40, you.y, 2.3)], [k.again, closeUp(you.x + 40, you.y, 2.4)]]),
    // your grin, waist up and wider, with him at the counter behind you chewing (the friend you just read)
    grin: camAt(frame, [[k.you, { x: 930, y: 700, zoom: 1.5 }], [k.nothing, { x: 900, y: 690, zoom: 1.6 }]]),
    fade: camAt(frame, [[k.fade, closeUp(you.x + 30, you.y, 2.7)], [k.end, closeUp(you.x + 30, you.y, 2.95)]]),
  };
  const faces: Record<"tell" | "grin" | "fade", Look> = {
    tell: { brows: "raised", lids: 0, mouth: "open", eyes: 1.1, look: { x: 0.9, y: 0.1 } },
    grin: { brows: "raised", lids: 0.1, mouth: Math.floor((frame - k.you) / 7) % 3 === 0 ? "smile" : "open", eyes: 1.05, look: { x: 0.8, y: 0.2 } },
    fade: fading < 0.5 ? { ...EXPRESSIONS.happy, look: { x: 0.8, y: -0.2 } } : { brows: "worry", lids: mix(0.15, 0.4, fading), mouth: "flat", eyes: 1, look: { x: 0.6, y: -0.6 } },
  };
  return (
    <StoreShot frame={frame} k={k} cam={drift(cams[on], frame, "call", 3)} mood={mood} youX={STORE.door.x} youFace={faces[on]} youPhone="ear" youHeld={LETTER}
      mjFace={{ brows: "none", lids: 0.4, mouth: on === "grin" && Math.floor(frame / 6) % 2 ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const part = current(frame, [[0, "rule"], [k.halves, "half"], [k.clerk, "clerk"], [k.cat, "cat"], [k.phone, "call"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "rule" && <RuleShots frame={frame} k={k} mood={mood} />}
      {part === "half" && <HalfShots frame={frame} k={k} mood={mood} />}
      {part === "clerk" && <ClerkShots frame={frame} k={k} mood={mood} />}
      {part === "cat" && <CatShots frame={frame} k={k} mood={mood} />}
      {part === "call" && <CallShots frame={frame} k={k} mood={mood} />}
      <MeterSound at={k.meter} />
      <ExplainSound k={k} />
      {/* the clerk's card: the snap, no flutter (the flaps don't move), one click */}
      <Sequence from={k.clerkCard} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} /></Sequence>
      <Sequence from={k.clerkCard + 10} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "Rule", firstLine: 7, Component: Scene };
