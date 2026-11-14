// Beat "The Rule" (script.md v5, ## [00:51] The Rule; narration lines 7-21). The rule, then the convenience store at
// night (sets/Store): your best friend, the clerk and the cat; the lie test; then the phone and the warehouse; then the
// flagged limit. No new card opens over your best friend in this beat. The title-card ident the script asks for before
// line 7 is not drawn: story.json leaves 0.35 s after line 6, not the 3 s it needs.
//
//   7-8   the rule, acted (Rule.Explain.tsx: the replay, the platform card with its sixty-second dial, the scale)
//   9     "And it never tells you why.": close on you by the store door; then, in the gap, the store: him at the counter
//         snapping a chocolate bar along its fold, the cat asleep on its crate
//   10    "You want half?" (his own voice), holding out half
//   11    insert: the bar snaps, the bigger half is yours; "Tonight you watch him chew"
//   12    the clerk scans the bar; you hold the letter up at him: "I made it."; his card: one click, a grey zero
//   13    "Receipt?" (his own voice): the till prints, he tears the slip and holds it out to you
//   14    the grey zero close; your face
//   15-16 the lie test (Rule.Lie.tsx): letter down, arms out, "I won the lottery!"; no snap; the clerk blinks and holds
//         the receipt an inch closer; the cat sleeps on; your face falls; the letter; the clerk scans a crisp packet
//   17    the cat (Rule.Lie.tsx): you crouch, it opens one eye, your mouth moves, nothing; the eye closes
//   18-20 the call (Rule.Call.tsx): your phone, her at the warehouse, "Say it again.", then video: her grin fills
//         your phone, you grin back into it, and nothing opens over the screen (Rule.Video.tsx)
//   21    the flagged limit (Rule.Call.tsx): you at the dark glass door, your own face in the glass beside you
//
// v7 (outside review of v6): lines 7-9 rebuilt (Rule.Explain.tsx: no third replay of the hug, a neutral card, the
// platform recalled inside a paper panel, the scale acted by three cards, "never tells you why" as two contradictory
// Min-jun panels); the clerk wears a cap and a name badge; "Receipt?" lands on a slip printing out toward the lens; the
// zero holds one beat, then the clerk lays the receipt on your letter and the card folds before the lie; the lie in
// three different framings, then silence, the cat, the receipt pushed closer; "A lie opens nothing" as a card stamped
// LIE that tries to unfold over him and fails; the cat in four acted beats (it swats the letter); the video call in a
// split screen while you check above, beside and behind the phone; the limit plays on the glass (a face drawn in your
// breath on it).
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Chocolate, headAt, MeterSound } from "../parts";
import { camAt, current, lineEnd, MINJUN, mix, ramp, type Beat, type Shot } from "../shared";
import { REF } from "../sets/common";
import { STORE, storeLook } from "../sets/Store";
import { lineAt, moodNow, SnapLines } from "./MadeTheCut.parts";
import { Explain, ExplainSound } from "./Rule.Explain";
import { BAR, chewFace, HALF, LETTER, Receipt, S, StoreShot, YOU_CLERK, YOU_COUNTER, YOUR_HALF, type Look, type Mood } from "./Rule.Store";
import { CatShots, LieShots } from "./Rule.Lie";
import { CallShots } from "./Rule.Call";

// ------------------------------------------------------------------------------------------------ timing

export type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const shout = lineEnd(clips, 15) + 2;
  return {
    replay: from(7), // "The rule, once.": the opening card again, at -84
    meter: from(7) + 2, // the replayed card snaps
    say: at(7, 0.13), // "Say your good news out loud, to someone's face": the platform, you say it to her
    open: at(7, 0.4), // "and a card opens over their head"
    sixty: at(7, 0.58), // "For sixty seconds": the card close, the dial starts
    lands: at(7, 0.72), // "it shows how your news lands with them": her under the card
    fold7: lineEnd(clips, 7) - 2, // the dial runs out, the card folds shut
    plus: from(8), // "Plus one hundred": the scale, the marker to the teal end
    joy: at(8, 0.3), // "means pure joy for you"
    minus: at(8, 0.48), // "Minus one hundred"
    enemy: at(8, 0.7), // "means they want you to fail": his grin under the red card
    why: from(9), // "And it never tells you why.": your face, by the store door
    wide: lineEnd(clips, 9) + 2, // the store wide, him snapping the bar
    halves: from(10), // "You want half?" (his own voice)
    take: from(11), // "Every night, one chocolate bar, two halves.": insert, the two halves
    chew: at(11, 0.62), // "Tonight you watch him chew."
    clerk: from(12), // "The only other face in the shop: the clerk.": he scans the bar
    show: at(12, 0.5), // you hold the letter up at him: "I made it."
    clerkCard: at(12, 0.72), // his card snaps open: the flaps don't move, one click, a grey zero
    receipt: from(13) - 2, // "Receipt?" (his own voice)
    zero: from(14), // "Zero. Grey. One click.": the card close
    you12: at(14, 0.3), // "The biggest news of your life": your face
    slip: at(14, 0.62), // "and you're a receipt.": the clerk lays the receipt on your letter
    cardFold: at(14, 0.85), // the grey card folds shut before the lie
    lie: from(15), // "So you try the obvious cheat.": the card has folded; you lean on the counter, letter down
    idea: at(15, 0.45), // "Make something up, and scan the whole world for free.": the wind-up
    shout, // the hold: arms out, "I won the lottery!"
    silence: shout + 18, // no snap: the empty air over the clerk
    blinkAt: shout + 24, // the clerk blinks once
    nap: shout + 34, // the cat does not open an eye
    closer: shout + 56, // back on the clerk: he holds the receipt an inch closer
    flop: from(16), // "Nothing.": your face falls
    lieCard: at(16, 0.07), // "A lie opens nothing.": a card stamped LIE tries to unfold over him and fails
    truth: at(16, 0.22), // "The card works on good news that's true, and yours.": the letter insert
    oneLetter: at(16, 0.5), // "So you've got exactly one letter"
    snacks: at(16, 0.68), // "and you're spending it on a man who scans snacks."
    cat: from(17), // "The cat on the crate.": you crouch by the crate
    eye: at(17, 0.06), // the cat opens one eye
    speak: at(17, 0.2), // you crouch lower and hold the letter at it; your mouth moves; no snap
    catStare: at(17, 0.36), // "So either a cat isn't a face": it swats the letter; you recoil
    catShut: at(17, 0.6), // "or a cat doesn't care": the eye closes
    never: at(17, 0.84), // "You'll never know."
    phone: from(18), // insert: your phone, calling your sister
    her: at(18, 0.2), // "Your sister. Six years of night shifts at a warehouse": the warehouse wide
    herClose: at(18, 0.5), // waist up on her
    tell: at(18, 0.84), // "You tell her."
    again: from(19) - 3, // "Say it again." (her own voice)
    you: from(20), // "You do.": you, phone to your ear
    video: at(20, 0.1), // "You even switch on video": the phone close, the screen flips to her face
    grinBack: at(20, 0.42), // "so you can see her grin": your grin back into the phone
    nothing: at(20, 0.64), // "And nothing opens over a screen.": her face on the phone, the camera tilts up into empty air
    limit: from(21), // "So. Only out loud. Only to a face you can see.": you at the glass door
    glass: at(21, 0.3), // "Only to a face you can see.": face to face with your reflection; you breathe on the glass
    draw: at(21, 0.5), // "Remember that.": your finger draws a face in the fog
    matter: at(21, 0.68), // "It's going to matter.": the push onto the reflection beside the drawn face
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the store

/** Line 9: "And it never tells you why." on your face by the store door, looking across at him; then, in the gap, the
 *  store wide: him at the counter snapping the bar. */
const StoreRule: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.wide, REF], [k.halves, { x: 990, y: 600, zoom: 1.08 }]]), frame, "rule-store", 3);
  const snapped = frame >= k.wide + 4;
  const youFace: Look = { brows: "flat", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.1 } };
  return (
    <StoreShot frame={frame} cam={cam} mood={mood} youX={STORE.door.x} youFace={youFace} youHeld={LETTER}
      mjFace={{ ...EXPRESSIONS.happy, look: { x: 0.6, y: 0.5 } }} mjHeld={snapped ? HALF : BAR} mjPose={{ ...STAND, armF: [55, 70], armB: snapped ? [40, 60] : [-7, 8] }} />
  );
};

/** Lines 7-9: the rule, acted (Rule.Explain.tsx), then your face and the store. */
const RuleShots: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  if (frame < k.wide) return <Explain frame={frame} k={k} />;
  return <StoreRule frame={frame} k={k} mood={mood} />;
};

/** The insert: the bar in his two palms over the counter bends and snaps (ink snap strokes, crumbs falling); the halves
 *  are not equal and the bigger one is yours; your hand comes in, stops short, then takes it; his half goes up to his
 *  mouth. (v4.1 snapped it in ten frames and held three seconds; outside review.) */
const HalvesInsert: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
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
const HalfShots: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.halves, "offer"], [k.take, "insert"], [k.chew, "chew"]]);
  if (on === "insert") return <HalvesInsert frame={frame} k={k} mood={mood} />;
  const turn: Pose = { ...STAND, armF: [70, 30] };
  const cam = drift(on === "offer"
    ? camAt(frame, [[k.halves, { x: 1110, y: 640, zoom: 1.9 }], [k.take, { x: 1120, y: 640, zoom: 2.0 }]])
    : camAt(frame, [[k.chew, { x: 1160, y: 650, zoom: 2.1 }], [k.clerk, { x: 1170, y: 650, zoom: 2.2 }]]), frame, "half", 3);
  const chewing = on === "chew" && Math.floor((frame - k.chew) / 5) % 2 === 0;
  return (
    <StoreShot frame={frame} cam={cam} mood={mood} youX={YOU_COUNTER}
      youFace={on === "offer" ? { ...EXPRESSIONS.happy, look: { x: 0.9, y: 0 } } : { ...EXPRESSIONS.happy, lids: 0.2, look: { x: 1, y: -0.1 } }}
      youHeld={on === "chew" ? YOUR_HALF : LETTER} youPose={on === "chew" ? { ...STAND, armF: [60, 80] } : STAND}
      mjFacing={-1} mjPose={turn} mjHeld={HALF}
      mjFace={on === "chew" ? { brows: "none", lids: 0.4, mouth: chewing ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } } : { ...EXPRESSIONS.happy, mouth: Math.floor((frame - k.halves) / 5) % 2 ? "open" : "smile", look: { x: 0.9, y: 0.1 } }} />
  );
};

/** Lines 12-14: the clerk. You turn to the counter, he scans the bar; you hold the letter up at him; his card: the flaps
 *  don't move, one click, a grey zero; "Receipt?"; the card close; your face. */
const ClerkShots: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.clerk, "clerk"], [k.show, "show"], [k.receipt, "receipt"], [k.zero, "zero"], [k.you12, "you"], [k.slip, "slip"]]);
  const ch = headAt(STORE.clerk.x, STORE.floor, S, STAND, -1);
  const card = { x: ch.x, y: ch.y - ch.r * 2.05 };
  const YX = YOU_CLERK;
  const yh = headAt(YX, STORE.floor, S, STAND, 1);
  const cams: Record<typeof on, Camera> = {
    clerk: camAt(frame, [[k.clerk, { x: 1560, y: 640, zoom: 1.7 }], [k.show, { x: 1570, y: 630, zoom: 1.8 }]]),
    show: camAt(frame, [[k.show, { x: 1580, y: 600, zoom: 1.75 }], [k.receipt, { x: 1600, y: 590, zoom: 1.85 }]]),
    receipt: camAt(frame, [[k.receipt, closeUp(ch.x - 40, ch.y - 50, 2.5)], [k.zero, closeUp(ch.x - 40, ch.y - 55, 2.6)]]),
    zero: camAt(frame, [[k.zero, insert(card.x, card.y + 30, 4.2)], [k.you12, insert(card.x, card.y + 30, 4.5)]]),
    you: camAt(frame, [[k.you12, closeUp(yh.x + 30, yh.y, 2.6)], [k.slip, closeUp(yh.x + 30, yh.y, 2.8)]]),
    // "and you're a receipt.": the two of you; he lays the slip on your letter; the grey card folds
    slip: camAt(frame, [[k.slip, { x: 1580, y: 600, zoom: 1.75 }], [k.lie, { x: 1585, y: 610, zoom: 1.85 }]]),
  };
  const cam = drift(cams[on], frame, "clerk", on === "zero" ? 1.5 : 3);
  const up = ramp(frame, k.show, k.show + 8);
  const youFace: Look = on === "you" || on === "slip" ? { brows: "sad", lids: 0.45, mouth: "flat", eyes: 1, look: on === "slip" ? { x: 0.6, y: -0.2 } : { x: 0.8, y: 0.3 } }
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
  const receipt = frame >= k.receipt - 14 ? <Receipt print={print} offer={offer} tear={tear} /> : undefined;
  // "and you're a receipt.": he reaches over and lays the slip on the letter you are still holding up
  const lay = ramp(frame, k.slip + 4, k.slip + 18);
  const laid = frame >= k.slip + 18;
  const clerkArm: [number, number] | undefined = scanning ? [mix(40, 100, sweep), mix(60, 10, sweep)]
    : laid ? [mix(110, 40, ramp(frame, k.slip + 18, k.slip + 28)), mix(-10, 60, ramp(frame, k.slip + 18, k.slip + 28))]
    : on === "slip" ? [mix(95, 110, lay), mix(0, -10, lay)]
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
    <>
      <StoreShot frame={frame} cam={cam} mood={mood} youX={YX} youFace={youFace} youHeld={laid ? <g>{LETTER}<g transform="translate(14 -70) rotate(16) scale(1.1)"><Receipt /></g></g> : LETTER}
        youPose={{ ...STAND, armF: [mix(30, 100, up), mix(60, 10, up)] }} bubble={{ at: k.show + 4, until: k.clerkCard, text: "I made it." }} mjX={1150}
        mjFace={chewFace(frame)} mjHeld={HALF}
        clerkFace={clerkFace} clerkHeld={scanning ? <Chocolate x={6} y={-4} scale={0.4} half="right" /> : laid ? undefined : receipt} clerkArm={clerkArm} counterExtra={flash} clerkCard={[k.clerkCard, k.cardFold]} />
      {on === "receipt" && <ReceiptToLens frame={frame} at={k.receipt} />}
    </>
  );
};

/** "Receipt?": the slip printing out of the till toward the lens, filling the lower right of the frame on the word.
 *  Screen space, over the clerk's close-up. */
const ReceiptToLens: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const t = ramp(frame, at - 4, at + 8);
  if (t <= 0) return null;
  const h = 120 + 700 * t;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <g transform={`translate(1450 1120) rotate(${mix(-4, -14, t)}) scale(${mix(0.7, 1.25, t)})`}>
        <rect x={-150 + 10} y={-h + 14} width={300} height={h} fill="#000" opacity={0.25} />
        <rect x={-150} y={-h} width={300} height={h} fill={PAPER} stroke={INK} strokeWidth={8} />
        {Array.from({ length: Math.floor(h / 70) }, (_, i) => <rect key={i} x={-110} y={-h + 50 + i * 70} width={i % 3 === 2 ? 120 : 220} height={16} rx={8} fill={INK} opacity={0.45} />)}
        <path d={`M-150 ${-h} l25 -22 l25 22 l25 -22 l25 22 l25 -22 l25 22 l25 -22 l25 22 l25 -22 l25 22 l25 -22 l25 22`} fill={PAPER} stroke={INK} strokeWidth={6} />
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const part = current(frame, [[0, "rule"], [k.halves, "half"], [k.clerk, "clerk"], [k.lie, "lie"], [k.cat, "cat"], [k.phone, "call"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "rule" && <RuleShots frame={frame} k={k} mood={mood} />}
      {part === "half" && <HalfShots frame={frame} k={k} mood={mood} />}
      {part === "clerk" && <ClerkShots frame={frame} k={k} mood={mood} />}
      {part === "lie" && <LieShots frame={frame} k={k} mood={mood} />}
      {part === "cat" && <CatShots frame={frame} k={k} mood={mood} />}
      {part === "call" && <CallShots frame={frame} k={k} mood={mood} />}
      <ExplainSound k={k} />
      {/* the clerk's card: the snap, no flutter (the flaps don't move), one click */}
      <Sequence from={k.clerkCard} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} /></Sequence>
      <Sequence from={k.clerkCard + 10} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
      <Sequence from={k.receipt - 4} durationInFrames={14}><Audio src={staticFile("sfx/flutter.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.cardFold} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.7} /></Sequence>
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "Rule", firstLine: 7, Component: Scene };
