// The Rule's store pieces, shared by Rule.tsx, Rule.Lie.tsx and Rule.Call.tsx: the clerk, the props in hands, the
// phone held to the ear, and StoreShot (the store with everyone in it). World coordinates (sets/Store).
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone } from "@whatif/kit/sets/props";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { Bubble, Chocolate, headAt, Letter, Meter } from "../parts";
import { blinking, HERO, MINJUN, mix } from "../shared";
import { Cat, STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import { aimArm, handAt, type Body, type moodNow } from "./MadeTheCut.parts";

export type Mood = ReturnType<typeof moodNow>;
export type Look = Partial<Expression>;

export const S = STORE.scale;
export const MJ_X = STORE.customer.x;
/** At the counter for "You want half?": you step up beside him. */
export const YOU_COUNTER = 1010;
/** Where you stand facing the clerk (lines 12-16). */
export const YOU_CLERK = 1460;

/** The clerk behind the counter: grey-green head, a green apron over a grey shirt. */
export const CLERK = { head: "#9fb59a", coat: "#7a7f8c", apron: "#3f7a6a" } as const;
const Clerk: React.FC<{ frame: number; face: Look; held?: React.ReactNode; arm?: [number, number]; blink?: boolean }> = ({ frame, face, held, arm, blink }) => {
  const { x } = STORE.clerk;
  return (
    <g>
      <Figure x={x} y={STORE.floor} scale={S} facing={-1} pose={arm ? { ...STAND, armF: arm } : held ? { ...STAND, armF: [70, 40] } : STAND} head={CLERK.head} coat={CLERK.coat} {...face}
        blink={blink ?? blinking(frame, 7)} time={frame} held={held} />
      <path d={`M${x - 22 * S} ${STORE.floor - 205 * S} h${44 * S} l${8 * S} ${150 * S} h${-60 * S}z`} fill={CLERK.apron} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A phone held to the ear with the BACK arm (so no arm crosses the face): the arm angles and the phone's spot. */
export function earPhone(b: Body): { pose: Pose; phone: { x: number; y: number } } {
  const h = headAt(b.x, b.y, b.scale, b.pose, b.facing);
  const target = { x: h.x - b.facing * h.r * 1.0, y: h.y + h.r * 0.15 };
  return { pose: { ...b.pose, armB: aimArm(b, target) }, phone: target };
}

export const Phone: React.FC<{ at: { x: number; y: number }; scale: number; facing: 1 | -1 }> = ({ at, scale, facing }) => (
  <g transform={`translate(${at.x} ${at.y}) scale(${facing} 1)`}><HandPhone scale={scale * 1.1} lit /></g>
);

/** The receipt slip in the clerk's hand: `print` 0..1 how much has come out of the till, `offer` 0..1 how far it
 *  tilts toward you, `tear` a small jolt as he tears it. */
export const Receipt: React.FC<{ print?: number; offer?: number; tear?: number }> = ({ print = 1, offer = 1, tear = 0 }) => (
  <g transform={`translate(${-4 + tear} -4) rotate(${mix(8, -4, offer)})`}>
    <rect x={-14} y={0} width={28} height={10 + 70 * print} rx={2} fill={PAPER} stroke={INK} strokeWidth={3} />
    {Array.from({ length: Math.floor(print * 5) }, (_, i) => <rect key={i} x={-8} y={14 + i * 13} width={i % 2 ? 10 : 16} height={4} rx={2} fill={INK} opacity={0.5} />)}
    <path d={`M-14 ${10 + 70 * print} l5 5 l5 -5 l5 5 l5 -5 l5 5 l4 -5`} fill="none" stroke={INK} strokeWidth={2} />
  </g>
);

export const LETTER = <Letter x={4} y={6} scale={0.42} tilt={-6} />;
/** His chocolate bar in his hand, whole, then snapped (the half he keeps); your half. */
export const BAR = <Chocolate x={8} y={-4} scale={0.42} tilt={-10} />;
export const HALF = <Chocolate x={6} y={-4} scale={0.42} half="right" tilt={-10} />;
export const YOUR_HALF = <Chocolate x={6} y={-4} scale={0.42} half="left" tilt={-10} />;
/** Crouched by the crate. */
export const CROUCH: Pose = { ...STAND, lean: 16, drop: 50, legF: [70, -110], legB: [55, -105], armF: [62, 30] };

/** Him at the counter, chewing, a beat behind (lines 12-21). */
export const chewFace = (frame: number): Look => ({ brows: "none", lids: 0.4, mouth: Math.floor(frame / 6) % 2 ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } });

export interface BubbleSpec { at: number; until: number; text: string; size?: number; side?: "left" | "right" }

/** The store with the clerk, the counter, your best friend, you and the cat. */
export const StoreShot: React.FC<{
  frame: number; cam: Camera; mood: Mood; youX: number; youFace: Look; youPhone?: "ear" | "hand" | null;
  mjFacing?: 1 | -1; mjFace: Look; mjPose?: Pose; mjHeld?: React.ReactNode; youHeld?: React.ReactNode; youPose?: Pose;
  youFacing?: 1 | -1; mjX?: number; clerkFace?: Look; clerkHeld?: React.ReactNode; clerkCard?: [number, number]; bubble?: BubbleSpec;
  catEyes?: "open" | "one" | "shut"; clerkArm?: [number, number]; clerkBlink?: boolean; counterExtra?: React.ReactNode;
  front?: React.ReactNode; doorOpen?: number;
}> = ({ frame, cam, mood, youX, youFace, youPhone = null, mjFacing = 1, mjFace, mjPose = STAND, mjHeld, youHeld, youPose = STAND,
  youFacing = 1, mjX = MJ_X, clerkFace, clerkHeld, clerkCard, bubble, catEyes = "shut", clerkArm, clerkBlink, counterExtra, front, doorOpen }) => {
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
      <Clerk frame={frame} face={clerkFace ?? { ...EXPRESSIONS.neutral, lids: 0.35, look: { x: 0.4, y: 0.5 } }} held={clerkHeld} arm={clerkArm} blink={clerkBlink} />
      {clerkCard && <Meter frame={frame} at={clerkCard[0]} x={ch.x} headY={ch.y} r={ch.r} value={0} until={clerkCard[1]} />}
      <StoreCounter />
      {counterExtra}
      <Cat {...STORE.cat} frame={frame} look={0.6} eyes={catEyes} />
      <Figure x={mjX} y={STORE.floor} scale={S} facing={mjFacing} pose={mjPose} head={MINJUN.head} coat={MINJUN.coat} {...mjFace}
        blink={blinking(frame, 2)} time={frame} held={mjHeld} />
      {phoneAt && youPhone === "ear" && <Phone at={phoneAt} scale={S} facing={1} />}
      <Figure {...you} {...HERO} {...youFace} blink={blinking(frame, 0)} time={frame} held={youHeld} />
      {phoneAt && youPhone === "hand" && <Phone at={phoneAt} scale={S * 0.9} facing={1} />}
      {bubble && <Bubble frame={frame} at={bubble.at} until={bubble.until} x={yh.x + (bubble.side === "left" ? -1 : bubble.side === "right" ? 1 : youFacing) * yh.r * 0.8} y={yh.y - yh.r * 1.1} text={bubble.text} size={bubble.size ?? 40} side={bubble.side ?? (youFacing === 1 ? "right" : "left")} />}
    </>
  );
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<StoreBack cam={cam} mood={mood} frame={frame} doorOpen={doorOpen} />} actors={actors} front={front} />
    </LookContext.Provider>
  );
};
