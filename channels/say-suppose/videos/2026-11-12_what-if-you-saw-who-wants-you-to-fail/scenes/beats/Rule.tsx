// Beat "The Rule" (script.md v3, ## [00:51] The Rule; narration lines 7-20). The rule, then the convenience store at
// night (sets/Store): your best friend, the clerk and the cat; then the phone and the warehouse. No new card opens over
// your best friend in this beat. The title-card ident the script asks for before line 7 is not drawn: story.json
// leaves 0.35 s after line 6, not the 3 s it needs, and the ident's sounds are not in this video's assets/sfx.
//
//   7     "The rule, once": an insert replays the opening card at -84 (the street at ten, his grin under it); then a
//         clean paper scale draws itself on a sheet, upright: teal above, a grey zero, red below
//   8     the marker: "Plus one hundred" at the top, "Minus one hundred" at the bottom
//   9     the store: him at the counter snapping a chocolate bar along its fold, you by the door with the letter, the
//         cat asleep on its crate; "A call, a text, a post": you look at the phone in your hand; "Remember that": you
//   10    "Half?" (his own voice), holding out half
//   11    insert: the two halves in his palms, one to your hand; "Tonight you watch him chew"
//   12    the clerk scanning the bar; you hold the letter up at him: "I made it."; his card snaps open, the flaps don't
//         move, one click, a grey zero
//   13    "Receipt?" (his own voice)
//   14    the grey zero close; your face
//   15    you crouch by the crate; the cat opens one eye; your mouth moves; no snap, nothing
//   16    the eye closes; close on the cat; you
//   17    insert: your phone calling one contact, a peach avatar; cut to her at the warehouse, a forklift behind her;
//         you, phone to ear
//   18    her, laughing: "Say it again." (her own voice)
//   19    you grinning into the phone; her, and the empty air over her head
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
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { FONT } from "@whatif/kit/fonts";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { Bubble, Chocolate, headAt, Letter, Meter, MeterSound, Ponytail, Sheet, Vest } from "../parts";
import { blinking, camAt, current, HERO, JIYOON, linear, MINJUN, mix, ramp, type Beat, type Shot } from "../shared";
import { REF } from "../sets/common";
import { ACADEMY, AcademyStreetBack } from "../sets/AcademyStreet";
import { Cat, STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import { aimArm, CHEER, handAt, lineAt, moodNow, type Body } from "./MadeTheCut.parts";
import { DEPOT, DepotBack, depotLights } from "./Rule.Warehouse";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    replay: from(7), // "The rule, once.": the opening card again, at -84
    meter: from(7) + 2, // the replayed card snaps
    scale: at(7, 0.24), // "... a meter opens over whoever hears it ...": the paper scale draws itself
    plus: from(8), // "Plus one hundred: pure joy for you."
    minus: at(8, 0.5), // "Minus one hundred: they want you to fail."
    wide: from(9), // "It never says why. Only out loud. Only to a face.": the store
    calls: at(9, 0.45), // "A call, a text, a post: nothing opens."
    remember: at(9, 0.8), // "Remember that."
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
    her: at(17, 0.2), // "Your sister. Six years of night shifts at a warehouse ..."
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
const Clerk: React.FC<{ frame: number; face: Look; held?: React.ReactNode }> = ({ frame, face, held }) => {
  const { x } = STORE.clerk;
  return (
    <g>
      <Figure x={x} y={STORE.floor} scale={S} facing={-1} pose={held ? { ...STAND, armF: [70, 40] } : STAND} head={CLERK.head} coat={CLERK.coat} {...face}
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
  catEyes?: "open" | "one" | "shut";
}> = ({ frame, k, cam, mood, youX, youFace, youPhone = null, mjFacing = 1, mjFace, mjPose = STAND, mjHeld, youHeld, youPose = STAND,
  youFacing = 1, mjX = MJ_X, clerkFace, clerkHeld, clerkCard, youBubble, catEyes = "shut" }) => {
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
      <Clerk frame={frame} face={clerkFace ?? { ...EXPRESSIONS.neutral, lids: 0.35, look: { x: 0.4, y: 0.5 } }} held={clerkHeld} />
      {clerkCard && <Meter frame={frame} at={k.clerkCard} x={ch.x} headY={ch.y} r={ch.r} value={0} until={k.cat} />}
      <StoreCounter />
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

/** "The rule, once": the opening frame again, close on his card at -84 over his grin. */
const ReplayInsert: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const f = ACADEMY.thumb.friend;
  const h = headAt(f.x, f.y, f.scale, CHEER, -1);
  const card = { x: h.x, y: h.y - h.r * 2.05 };
  const cam = drift(camAt(frame, [[k.replay, insert(card.x - 20, card.y + 110, 1.7)], [k.scale, insert(card.x - 20, card.y + 80, 1.95)]]), frame, "replay", 2);
  const actors = (
    <>
      <Figure x={f.x} y={f.y} scale={f.scale} facing={-1} pose={CHEER} head={MINJUN.head} coat={MINJUN.coat} {...EXPRESSIONS.happy}
        mouth="open" eyes={1.1} look={{ x: 0.9, y: 0.15 }} time={frame} />
      <Meter frame={frame} at={k.meter} x={h.x} headY={h.y} r={h.r} value={-84} until={k.scale} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<AcademyStreetBack cam={cam} mood="night" frame={frame} view="thumb" />} actors={actors} />;
};

/** Stamped flap tiles, the card's own lettering, centred at (x, y). */
const Stamp: React.FC<{ x: number; y: number; text: string; color: string; size: number }> = ({ x, y, text, color, size }) => (
  <g transform={`translate(${x} ${y})`}>
    {text.split("").map((ch, i, all) => {
      const cx = (i - (all.length - 1) / 2) * size * 0.62;
      return (
        <g key={i} transform={`translate(${cx} 0)`}>
          <rect x={-size * 0.28} y={-size * 0.42} width={size * 0.56} height={size * 0.84} rx={size * 0.08} fill={color} stroke={INK} strokeWidth={4} />
          <text x={0} y={size * 0.26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.66} fill={PAPER}>{ch}</text>
        </g>
      );
    })}
  </g>
);

/** The paper scale that draws itself, upright: teal above (+100), a grey zero in the middle, red below (-100); its
 *  marker goes to the teal end on "Plus one hundred" and the red end on "Minus one hundred". */
const ScaleSheet: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const W = 760, H = 900, x = 250, y0 = 110, y1 = H - 110, mid = H / 2;
  const drawn = k.scale + 8, done = k.scale + 44;
  const toPlus = ramp(frame, k.plus + 4, k.plus + 22), toMinus = ramp(frame, k.minus + 2, k.minus + 26);
  const m = mid + (y0 - mid) * toPlus + (y1 - y0) * toMinus;
  const cam = drift(camAt(frame, [[k.scale, { x: 960, y: 540, zoom: 1.0 }], [k.wide, { x: 960, y: 540, zoom: 1.06 }]]), frame, "scale", 2);
  const sheet = (
    <Sheet frame={frame} at={k.scale} x={960} y={540} w={W} h={H} tilt={-1.5}>
      <DrawLine d={`M${x} ${mid} V${y0}`} from={drawn} to={done} color={TEAL} width={40} />
      <DrawLine d={`M${x} ${mid} V${y1}`} from={drawn} to={done} color={CRIMSON} width={40} />
      {frame >= done && [-1, -0.5, 0, 0.5, 1].map((t) => <line key={t} x1={x - 70} y1={mid + t * (y1 - mid)} x2={x - 34} y2={mid + t * (y1 - mid)} stroke={INK} strokeWidth={6} />)}
      {frame >= done - 6 && <Stamp x={x + 230} y={y0} text="+100" color={TEAL} size={120} />}
      {frame >= done && <Stamp x={x + 160} y={mid} text="0" color="#9a9a94" size={120} />}
      {frame >= done + 6 && <Stamp x={x + 230} y={y1} text="-100" color={CRIMSON} size={120} />}
      {frame >= k.plus && <path d={`M${x - 32} ${m} l-44 -28 v56z`} fill={INK} />}
    </Sheet>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={<rect x={-1400} y={-900} width={4800} height={2600} fill="#2a2d38" />} actors={sheet} />
  );
};

/** Line 9: the store. Him at the counter snapping the bar, you by the door; your phone; "Remember that". */
const StoreRule: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.wide, "wide"], [k.calls, "calls"], [k.remember, "remember"]]);
  const you = headAt(STORE.door.x, STORE.floor, S, STAND, 1);
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.wide, REF], [k.calls, { x: 990, y: 600, zoom: 1.12 }]]),
    calls: camAt(frame, [[k.calls, closeUp(you.x + 40, you.y + 70, 2.2)], [k.remember, closeUp(you.x + 40, you.y + 70, 2.35)]]),
    remember: camAt(frame, [[k.remember, closeUp(you.x + 20, you.y, 2.6)], [k.halves, closeUp(you.x + 20, you.y, 2.8)]]),
  };
  const cam = drift(cams[on], frame, "rule-store", 3);
  const glance = ramp(frame, k.calls + 6, k.calls + 20);
  const snapped = frame >= k.wide + 40;
  const youFace: Look = on === "calls"
    ? { ...EXPRESSIONS.sceptical, lids: 0.2, look: { x: mix(0.8, 0.1, glance), y: mix(0, 0.9, glance) } }
    : on === "remember" ? { brows: "flat", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.1 } }
    : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 0.9, y: 0.1 } };
  return (
    <StoreShot frame={frame} k={k} cam={cam} mood={mood} youX={STORE.door.x} youFace={youFace} youHeld={LETTER} youPhone={on === "calls" ? "hand" : null}
      mjFace={{ ...EXPRESSIONS.happy, look: { x: 0.6, y: 0.5 } }} mjHeld={snapped ? HALF : BAR} mjPose={{ ...STAND, armF: [55, 70], armB: snapped ? [40, 60] : [-7, 8] }} />
  );
};

/** Lines 7-9: the replay, the scale, the store. */
const RuleShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  if (frame < k.scale) return <ReplayInsert frame={frame} k={k} />;
  if (frame < k.wide) return <ScaleSheet frame={frame} k={k} />;
  return <StoreRule frame={frame} k={k} mood={mood} />;
};

/** The insert: the two halves in his palms over the counter; one goes to your hand. */
const HalvesInsert: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const split = ramp(frame, k.take, k.take + 10);
  const give = ramp(frame, k.take + 22, k.take + 40);
  const cam = drift(camAt(frame, [[k.take, { x: 960, y: 560, zoom: 1.0 }], [k.chew, { x: 960, y: 560, zoom: 1.08 }]]), frame, "halves", 2);
  const palm = (x: number, y: number, flip: 1 | -1) => (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <rect x={-60} y={60} width={140} height={700} rx={60} fill={MINJUN.coat} stroke={INK} strokeWidth={8} transform="rotate(-18)" />
      <ellipse cx={0} cy={30} rx={150} ry={92} fill={MINJUN.head} stroke={INK} strokeWidth={8} />
    </g>
  );
  const yours = ramp(frame, k.take + 10, k.take + 28);
  const leftX = mix(900, 800, split) - give * 260;
  const actors = (
    <g>
      {/* his two palms, the bar snapped across them; the left half goes to your hand */}
      {palm(mix(1060, 1160, split), 620, 1)}
      <Chocolate x={mix(1020, 1120, split)} y={590} scale={4.2} half="right" tilt={mix(0, 8, split)} />
      {palm(leftX, 640, -1)}
      <Chocolate x={leftX + 40} y={600 + give * 10} scale={4.2} half="left" tilt={mix(0, -8, split)} />
      {/* your hand, from the left, coming for your half */}
      <g transform={`translate(${mix(-260, 420, yours) - give * 60} 800) scale(-1 1)`}>
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
  const scanning = frame < k.show + 10;
  const clerkFace: Look = on === "receipt"
    ? { brows: "flat", lids: 0.4, mouth: Math.floor((frame - k.receipt) / 5) % 2 ? "o" : "flat", eyes: 1, look: { x: 0.8, y: 0.1 } }
    : { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: scanning ? { x: 0.3, y: 0.7 } : { x: 0.8, y: 0.1 } };
  return (
    <StoreShot frame={frame} k={k} cam={cam} mood={mood} youX={YX} youFace={youFace} youHeld={LETTER}
      youPose={{ ...STAND, armF: [mix(30, 100, up), mix(60, 10, up)] }} youBubble mjX={1150}
      mjFace={{ brows: "none", lids: 0.4, mouth: Math.floor(frame / 6) % 2 ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF}
      clerkFace={clerkFace} clerkHeld={scanning ? <Chocolate x={6} y={-4} scale={0.4} half="right" /> : undefined} clerkCard />
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

/** Your sister at the warehouse, the phone to her ear (her back arm), the vest, the hair tied back. */
const DepotShot: React.FC<{ frame: number; k: T; cam: Camera; face: Look; mood: ReturnType<typeof moodNow> }> = ({ frame, k, cam, face, mood }) => {
  const d = DEPOT.jiyoon;
  const e = earPhone({ x: d.x, y: d.y, scale: d.scale, facing: d.facing, pose: STAND });
  const pose = e.pose;
  const lift = linear(frame, k.her - 20, k.tell + 20);
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
  const on = current(frame, [[k.phone, "phone"], [k.her, "her"], [k.tell, "tell"], [k.again, "again"], [k.you, "grin"], [k.nothing, "nothing"], [k.fade, "fade"]]);
  if (on === "phone") return <PhoneInsert frame={frame} k={k} mood={mood} />;
  const jh = headAt(DEPOT.jiyoon.x, DEPOT.jiyoon.y, DEPOT.jiyoon.scale, STAND, -1);
  if (on === "her" || on === "again" || on === "nothing") {
    const cams: Record<"her" | "again" | "nothing", Camera> = {
      her: camAt(frame, [[k.her, { x: 1060, y: 640, zoom: 1.2 }], [k.tell, { x: 1090, y: 630, zoom: 1.4 }]]),
      again: camAt(frame, [[k.again, closeUp(jh.x - 30, jh.y, 2.6)], [k.you, closeUp(jh.x - 30, jh.y, 2.75)]]),
      nothing: camAt(frame, [[k.nothing, { x: jh.x - 20, y: jh.y - 40, zoom: 2.0 }], [k.fade, { x: jh.x - 20, y: jh.y - 150, zoom: 2.0 }]]),
    };
    const faces: Record<"her" | "again" | "nothing", Look> = {
      her: { brows: "raised", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 0.4, y: 0.4 } },
      again: { brows: "raised", lids: 0.3, mouth: "open", eyes: 1.1, look: { x: 0.8, y: 0 } },
      nothing: { ...EXPRESSIONS.happy, lids: 0.35, look: { x: 0.6, y: 0.2 } },
    };
    return <DepotShot frame={frame} k={k} cam={drift(cams[on], frame, "depot", 3)} face={faces[on]} mood={mood} />;
  }
  const you = headAt(STORE.door.x, STORE.floor, S, STAND, 1);
  const fading = ramp(frame, k.fade + 8, k.fade + 40);
  const cams: Record<"tell" | "grin" | "fade", Camera> = {
    tell: camAt(frame, [[k.tell, closeUp(you.x + 40, you.y, 2.3)], [k.again, closeUp(you.x + 40, you.y, 2.4)]]),
    grin: camAt(frame, [[k.you, closeUp(you.x + 60, you.y, 2.5)], [k.nothing, closeUp(you.x + 60, you.y, 2.62)]]),
    fade: camAt(frame, [[k.fade, closeUp(you.x + 30, you.y, 2.7)], [k.end, closeUp(you.x + 30, you.y, 2.95)]]),
  };
  const faces: Record<"tell" | "grin" | "fade", Look> = {
    tell: { brows: "raised", lids: 0, mouth: "open", eyes: 1.1, look: { x: 0.9, y: 0.1 } },
    grin: { brows: "raised", lids: 0.1, mouth: Math.floor((frame - k.you) / 7) % 3 === 0 ? "smile" : "open", eyes: 1.05, look: { x: 0.8, y: 0.2 } },
    fade: fading < 0.5 ? { ...EXPRESSIONS.happy, look: { x: 0.8, y: -0.2 } } : { brows: "worry", lids: mix(0.15, 0.4, fading), mouth: "flat", eyes: 1, look: { x: 0.6, y: -0.6 } },
  };
  return (
    <StoreShot frame={frame} k={k} cam={drift(cams[on], frame, "call", 3)} mood={mood} youX={STORE.door.x} youFace={faces[on]} youPhone="ear" youHeld={LETTER}
      mjFace={{ brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF} />
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
      {/* the clerk's card: the snap, no flutter (the flaps don't move), one click */}
      <Sequence from={k.clerkCard} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} /></Sequence>
      <Sequence from={k.clerkCard + 10} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "Rule", firstLine: 7, Component: Scene };
