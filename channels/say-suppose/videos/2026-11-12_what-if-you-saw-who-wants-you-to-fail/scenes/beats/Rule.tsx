// Beat "The Rule" (script.md, ## [00:30] The Rule; narration lines 7-13). The convenience store at night (sets/Store),
// then the phone and the depot. The title-card ident the script asks for before line 7 is not drawn: story.json leaves
// 0.35 s after line 6, not the 3 s it needs (see the report).
//
//   7     wide: Min-jun at the counter with one triangle kimbap, you by the door with the letter, the cat on its crate;
//         his card snaps open on "The rule, once" and runs to -84; push in; insert on the card's stamped scale
//   8     the scale: "Plus one hundred" on the teal end, "Minus one hundred" on the crimson end
//   9     close on Min-jun under the card; you by the door look at the phone in your hand; the card folds on "Remember that"
//   10    at the counter: "Half?"; insert: the two halves, one to your hand; Min-jun chewing
//   11    insert: your phone calling Ji-yoon; cut to her at the depot, a forklift going by behind her; you, phone to ear
//   12    her, laughing: "Say it again."
//   13    you grinning into the phone; her, and the empty air over her head; you, the smile going
import { AbsoluteFill } from "remotion";
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
import { INK, MUSTARD } from "@whatif/kit/theme";
import { Bubble, headAt, Kimbap, Letter, Meter, MeterSound, Ponytail, Vest } from "../parts";
import { blinking, camAt, current, HERO, JIYOON, linear, MINJUN, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { REF } from "../sets/common";
import { Cat, STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import { aimArm, handAt, lineAt, moodNow, type Body } from "./MadeTheCut.parts";
import { DEPOT, DepotBack, depotLights } from "./Rule.Warehouse";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    wide: from(7),
    meter: at(7, 0.07), // "The rule, once."
    two: at(7, 0.33), // "... every time you say it a meter opens over whoever hears"
    scale: at(7, 0.72), // "from plus one hundred to minus one hundred"
    plus: from(8), // "Plus one hundred: pure joy for you."
    minus: at(8, 0.5), // "Minus one hundred: they want you to fail."
    why: from(9), // "It never says why."
    calls: at(9, 0.28), // "Calls, texts and posts open nothing."
    remember: at(9, 0.7), // "Remember that."
    fold: at(9, 0.82),
    halves: from(10), // "Every night, one kimbap, two halves." + Half?
    take: at(10, 0.36), // insert: the two halves
    chew: at(10, 0.64), // "and watch him chew."
    phone: from(11), // insert: your phone, calling Ji-yoon
    her: at(11, 0.26), // "Ji-yoon, your sister. Six years of nights at the depot ..."
    tell: at(11, 0.84), // "You tell her."
    again: from(12) - 3, // "Say it again."
    you: from(13), // "You do. You're grinning into a phone."
    nothing: at(13, 0.42), // "Nothing opens over a phone."
    fade: at(13, 0.68), // "You still don't know her number."
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the store

const S = STORE.scale;
const MJ_X = STORE.customer.x;
/** At the counter for "Half?": you step up beside him. */
const YOU_COUNTER = 1010;

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

/** The store with the clerk, the counter, Min-jun (and his card), you and the cat. */
const StoreShot: React.FC<{
  frame: number; k: T; cam: Camera; mood: ReturnType<typeof moodNow>; youX: number; youFace: Look; youPhone?: "ear" | "hand" | null;
  mjFacing?: 1 | -1; mjFace: Look; mjPose?: Pose; mjHeld?: React.ReactNode; youHeld?: React.ReactNode; youPose?: Pose; bubble?: boolean; card?: boolean;
}> = ({ frame, k, cam, mood, youX, youFace, youPhone = null, mjFacing = 1, mjFace, mjPose = STAND, mjHeld, youHeld, youPose = STAND, bubble, card = true }) => {
  const mh = headAt(MJ_X, STORE.floor, S, mjPose, mjFacing);
  let you: Body = { x: youX, y: STORE.floor, scale: S, facing: 1, pose: youPose };
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
      <Figure x={STORE.clerk.x} y={STORE.floor} scale={S} facing={-1} head={PASTELS[5]} coat="#3f7a6a" {...EXPRESSIONS.neutral}
        lids={0.35} look={{ x: 0.4, y: 0.5 }} blink={blinking(frame, 7)} time={frame} />
      <StoreCounter />
      <Cat {...STORE.cat} frame={frame} look={-0.4} />
      <Figure x={MJ_X} y={STORE.floor} scale={S} facing={mjFacing} pose={mjPose} head={MINJUN.head} coat={MINJUN.coat} {...mjFace}
        blink={blinking(frame, 2)} time={frame} held={mjHeld} />
      {card && <Meter frame={frame} at={k.meter} x={mh.x} headY={mh.y} r={mh.r} value={-84} until={k.fold} />}
      {phoneAt && youPhone === "ear" && <Phone at={phoneAt} scale={S} facing={1} />}
      <Figure {...you} {...HERO} {...youFace} blink={blinking(frame, 0)} time={frame} held={youHeld} />
      {phoneAt && youPhone === "hand" && <Phone at={phoneAt} scale={S * 0.9} facing={1} />}
      {bubble && <Bubble frame={frame} at={k.halves + 4} x={mh.x - mh.r * 0.9} y={mh.y - mh.r * 1.25} text="Half?" size={40} side="left" />}
    </>
  );
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<StoreBack cam={cam} mood={mood} frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

const LETTER = <Letter x={4} y={6} scale={0.42} tilt={-6} />;
const KIMBAP = <Kimbap x={6} y={-6} scale={0.42} />;
const HALF = <Kimbap x={6} y={-6} scale={0.42} half />;

/** Lines 7-9: the rule, with Min-jun under his card at the counter and you by the door. */
const RuleShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.wide, "wide"], [k.two, "two"], [k.scale, "scale"], [k.why, "why"], [k.calls, "calls"], [k.remember, "remember"]]);
  const mh = headAt(MJ_X, STORE.floor, S, STAND, 1);
  const card = { x: mh.x, y: mh.y - mh.r * 2.05, w: mh.r * 1.05 * 2.5 };
  const you = headAt(STORE.door.x, STORE.floor, S, STAND, 1);
  const pan = ramp(frame, k.plus + 6, k.minus + 10);
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.wide, REF], [k.two, { x: 980, y: 580, zoom: 1.08 }]]),
    two: camAt(frame, [[k.two, { x: 1060, y: 640, zoom: 1.5 }], [k.scale, { x: 1130, y: 620, zoom: 1.75 }]]),
    scale: frame < k.plus
      ? camAt(frame, [[k.scale, insert(card.x, card.y + 4, 5.0)], [k.plus, insert(card.x, card.y + 4, 5.6)]])
      : insert(mix(card.x - card.w * 0.28, card.x + card.w * 0.28, pan), card.y + 14, 6.4),
    why: camAt(frame, [[k.why, closeUp(mh.x + 10, mh.y - 50, 2.5)], [k.calls, closeUp(mh.x + 10, mh.y - 55, 2.65)]]),
    calls: camAt(frame, [[k.calls, closeUp(you.x + 40, you.y + 60, 2.2)], [k.remember, closeUp(you.x + 40, you.y + 70, 2.35)]]),
    remember: camAt(frame, [[k.remember, insert(card.x, card.y + 20, 4.2)], [k.halves, insert(card.x, card.y + 30, 4.5)]]),
  };
  const cam = drift(cams[on], frame, "rule-store", on === "scale" ? 1.5 : 3);
  const glance = ramp(frame, k.calls + 6, k.calls + 20);
  const youFace: Look = on === "calls"
    ? { ...EXPRESSIONS.sceptical, lids: 0.2, look: { x: mix(0.8, 0.1, glance), y: mix(0, 0.9, glance) } }
    : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 0.9, y: -0.3 } };
  return (
    <StoreShot frame={frame} k={k} cam={cam} mood={mood} youX={STORE.door.x} youFace={youFace} youHeld={LETTER} youPhone={on === "calls" ? "hand" : null}
      mjFace={{ ...EXPRESSIONS.happy, look: { x: 0.6, y: 0.5 } }} mjHeld={KIMBAP} mjPose={{ ...STAND, armF: [55, 70] }} />
  );
};

/** The insert: two hands pull one triangle kimbap into halves over the counter, and one half goes to your hand. */
const HalvesInsert: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const split = ramp(frame, k.take, k.take + 14);
  const give = ramp(frame, k.take + 22, k.take + 40);
  const cam = drift(camAt(frame, [[k.take, { x: 960, y: 560, zoom: 1.0 }], [k.chew, { x: 960, y: 560, zoom: 1.08 }]]), frame, "halves", 2);
  const sleeve = (x: number, y: number, rot: number, color: string, hand: string) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={0} y={-60} width={700} height={120} rx={50} fill={color} stroke={INK} strokeWidth={8} />
      <circle cx={0} cy={0} r={76} fill={hand} stroke={INK} strokeWidth={8} />
    </g>
  );
  const yours = ramp(frame, k.take + 10, k.take + 28);
  const actors = (
    <g>
      {/* his two hands, from the right, pull the kimbap into halves; the left half slides to your hand */}
      {sleeve(mix(1150, 1270, split), 700, -10, MINJUN.coat, MINJUN.head)}
      <Kimbap x={mix(990, 1090, split)} y={560} scale={5.5} half tilt={mix(0, 10, split)} />
      <g transform={`translate(${mix(950, 850, split) - give * 300} ${560 + give * 30}) scale(-1 1)`}>
        <Kimbap x={0} y={0} scale={5.5} half tilt={mix(0, 10, split)} />
      </g>
      {sleeve(mix(1020, 1060, split) - give * 300, 790, 18, MINJUN.coat, MINJUN.head)}
      {/* your hand, from the left, coming for your half */}
      <g transform={`translate(${mix(-260, 470, yours) - give * 80} 760) scale(-1 1)`}>
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

/** Line 10: at the counter, "Half?", the insert, and Min-jun chewing. */
const HalfShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.halves, "offer"], [k.take, "insert"], [k.chew, "chew"]]);
  if (on === "insert") return <HalvesInsert frame={frame} k={k} mood={mood} />;
  const turn: Pose = { ...STAND, armF: [70, 30] };
  const cam = drift(on === "offer"
    ? camAt(frame, [[k.halves, { x: 1110, y: 640, zoom: 1.9 }], [k.take, { x: 1120, y: 640, zoom: 2.0 }]])
    : camAt(frame, [[k.chew, { x: 1160, y: 650, zoom: 2.1 }], [k.phone, { x: 1170, y: 650, zoom: 2.2 }]]), frame, "half", 3);
  const chewing = on === "chew" && Math.floor((frame - k.chew) / 5) % 2 === 0;
  return (
    <StoreShot frame={frame} k={k} cam={cam} mood={mood} youX={YOU_COUNTER} card={false}
      youFace={on === "offer" ? { ...EXPRESSIONS.happy, look: { x: 0.9, y: 0 } } : { ...EXPRESSIONS.happy, lids: 0.2, look: { x: 1, y: -0.1 } }}
      youHeld={on === "chew" ? HALF : LETTER} youPose={on === "chew" ? { ...STAND, armF: [60, 80] } : STAND}
      mjFacing={-1} mjPose={turn} mjHeld={HALF} bubble={on === "offer"}
      mjFace={on === "chew" ? { brows: "none", lids: 0.4, mouth: chewing ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } } : { ...EXPRESSIONS.happy, mouth: "open", look: { x: 0.9, y: 0.1 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ the phone and the depot

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

/** Ji-yoon at the depot, the phone to her ear (her back arm), the vest, the hair tied back. */
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
      card={false} mjFace={{ brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const part = current(frame, [[0, "rule"], [k.halves, "half"], [k.phone, "call"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "rule" && <RuleShots frame={frame} k={k} mood={mood} />}
      {part === "half" && <HalfShots frame={frame} k={k} mood={mood} />}
      {part === "call" && <CallShots frame={frame} k={k} mood={mood} />}
      <MeterSound at={k.meter} />
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "Rule", firstLine: 7, Component: Scene };
