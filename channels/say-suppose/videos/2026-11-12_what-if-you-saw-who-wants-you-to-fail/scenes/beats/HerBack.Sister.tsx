// Ji-yoon and the hug, shared by builder C's four beats (Her Back, Say It Again, The Loading Dock, Two Letters): body
// maths (where a shoulder or a hand is, aiming an arm at a point), an arm redrawn over someone else, Ji-yoon from the
// side (vest on, vest open, or off duty with her hair down), Ji-yoon from behind (pulling on the vest), the hug poses,
// a speaking mouth, and the lamp glows a beat adds to the look. World coordinates, for a <Stage> slot. No sound here.
import { Figure, type FigureProps, type Mouth } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, STAND, type Pose } from "@whatif/kit/rig/pose";
import { screenOf } from "@whatif/kit/sets/common";
import { useLook, type Glow, type Look } from "@whatif/kit/stage/Look";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { HairDown, Ponytail, Vest } from "../parts";
import { blinking, HERO, JIYOON, mix, noise } from "../shared";

// ------------------------------------------------------------------------------------------------ bodies

/** Where a figure stands and how: the same numbers you pass to <Figure>. */
export interface Body { x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }

/** A figure's shoulder in world coordinates (both arms hang from it). */
export function shoulderAt(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
}

/** A figure's front (or back) hand in world coordinates. */
export function handAt(b: Body, arm: "front" | "back" = "front") {
  const s = shoulderAt(b);
  const [u, f] = arm === "front" ? b.pose.armF : b.pose.armB;
  const a = dir(u), c = dir(u + f);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

/** Arm angles that put a hand on a world point (as far as the arm reaches). Use as pose.armF or pose.armB. */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

/** Blend two arm settings. */
export const mixArm = (a: [number, number], b: [number, number], t: number): [number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t)];

/** One arm drawn again on top of whatever came after its figure (the near arm of a hug, over the other body). */
export const ArmOver: React.FC<{ body: Body; arm?: "front" | "back"; hand: string; color?: string; held?: React.ReactNode }> = ({
  body, arm = "front", hand, color, held,
}) => {
  const j = joints(body.pose);
  const [u, f] = arm === "front" ? body.pose.armF : body.pose.armB;
  const a = dir(u), b = dir(u + f);
  const s = j.shoulder;
  const mid = { x: s.x + a.x * LIMB, y: s.y + a.y * LIMB };
  const tip = { x: mid.x + b.x * LIMB, y: mid.y + b.y * LIMB };
  return (
    <g transform={`translate(${body.x} ${body.y}) scale(${body.scale * body.facing} ${body.scale})`}>
      <polyline points={`${s.x},${s.y} ${mid.x},${mid.y} ${tip.x},${tip.y}`} fill="none" stroke={color ?? (arm === "front" ? INK : "#3b3e47")}
        strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={tip.x} cy={tip.y} r={9} fill={hand} />
      {held && <g transform={`translate(${tip.x} ${tip.y})`}>{held}</g>}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ faces and mouths

/** The mouth of someone speaking between two frames (shapes change every 4 frames; no lip-sync), `rest` otherwise. */
export function talk(frame: number, from: number, to: number, rest: Mouth = "flat"): Mouth {
  if (frame < from || frame >= to) return rest;
  const shapes: Mouth[] = ["open", rest === "smile" ? "smile" : "flat", "o", "open", rest];
  return shapes[Math.floor(noise(Math.floor(frame / 4)) * shapes.length)];
}

export type Face = Pick<FigureProps, "brows" | "lids" | "mouth" | "eyes" | "look">;

// ------------------------------------------------------------------------------------------------ Ji-yoon

/** On duty with the vest zipped, on duty with it open (end of shift), or off duty: no vest, hair down. */
export type Duty = "vest" | "open" | "off";

/** Ji-yoon from the side. Her front arm is drawn again over the vest so a hand in front of her body shows. */
export const Sister: React.FC<{ body: Body; face: Face; frame: number; duty: Duty; held?: React.ReactNode; opacity?: number }> = ({
  body, face, frame, duty, held, opacity = 1,
}) => (
  <g opacity={opacity}>
    {duty !== "off" && <Ponytail {...body} />}
    <Figure head={JIYOON.head} coat={JIYOON.coat} {...body} {...face} blink={blinking(frame, 3)} time={frame} />
    {duty !== "off" && <Vest {...body} />}
    {duty === "open" && <OpenEdge body={body} />}
    {duty === "off" && <HairDown {...body} />}
    <ArmOver body={body} hand={JIYOON.head} held={held} />
  </g>
);

/** The vest unzipped: its front edge hangs open over the grey top. */
const OpenEdge: React.FC<{ body: Body }> = ({ body }) => {
  const j = joints(body.pose);
  const s = body.scale, f = body.facing;
  const nx = body.x + j.neck.x * s * f, ny = body.y + j.neck.y * s;
  const hx = body.x + j.hip.x * s * f, hy = body.y + j.hip.y * s;
  const w = 24 * s;
  return (
    <g>
      <path d={`M${nx + f * w * 0.35} ${ny + 8 * s} L${nx + f * w * 1.02} ${ny + 8 * s} L${hx + f * w * 0.95} ${hy - 2} L${hx + f * w * 0.2} ${hy - 2}Z`}
        fill={JIYOON.coat} />
      <path d={`M${nx + f * w * 0.35} ${ny + 8 * s} L${hx + f * w * 0.2} ${hy - 2}`} stroke={INK} strokeWidth={3 * s} />
    </g>
  );
};

/** You, with the faces passed. */
export const You: React.FC<{ body: Body; face: Face; frame: number; held?: React.ReactNode; flow?: number }> = ({ body, face, frame, held, flow = 0 }) => (
  <Figure {...HERO} {...body} {...face} blink={blinking(frame, 1)} time={frame} held={held} flow={flow} />
);

/**
 * Ji-yoon from behind, standing in a doorway: dark hair over the back of her head and the ponytail, the grey top, and
 * the vest going on: `vest` 0 has it held low behind her, elbows out; 1 has it on her shoulders and her arms down.
 * `laugh` 0..1 bobs her shoulders. (x, y) is between her feet.
 */
export const SisterBack: React.FC<{ x: number; y: number; scale: number; frame: number; vest: number; laugh?: number; tilt?: number }> = ({
  x, y, scale, frame, vest, laugh = 0, tilt = 0,
}) => {
  const bob = laugh * Math.abs(Math.sin(frame * 0.55)) * -6;
  const sh = -222 + bob;
  const lift = Math.min(1, vest / 0.65);
  const settle = Math.max(0, (vest - 0.65) / 0.35);
  // the hands: holding the vest's edges out at the waist, lifting it onto the shoulders, then down
  const handY = vest < 0.65 ? mix(-128, -212, lift) : mix(-212, -104, settle);
  const handX = vest < 0.65 ? mix(70, 56, lift) : mix(56, 46, settle);
  const vTop = mix(-150, sh + 2, lift);
  const vw = mix(48, 42, lift);
  const arm = (side: 1 | -1) => {
    const s = { x: side * 38, y: sh + 8 };
    const h = { x: side * handX, y: handY };
    const e = { x: (s.x + h.x) / 2 + side * mix(30, 8, settle), y: (s.y + h.y) / 2 + 10 };
    return (
      <g key={side}>
        <polyline points={`${s.x},${s.y} ${e.x},${e.y} ${h.x},${h.y}`} fill="none" stroke={JIYOON.coat} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={h.x} cy={h.y} r={9} fill={JIYOON.head} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${tilt} 0 -112)`}>
      {/* legs */}
      <line x1={-14} y1={-112} x2={-16} y2={-4} stroke="#3b3e47" strokeWidth={17} strokeLinecap="round" />
      <line x1={14} y1={-112} x2={16} y2={-4} stroke="#3b3e47" strokeWidth={17} strokeLinecap="round" />
      {/* the grey top */}
      <path d={`M${-40} ${sh} L40 ${sh} L32 -104 L-32 -104Z`} fill={JIYOON.coat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* the vest, back panel: orange with the reflective H */}
      <g>
        <path d={`M${-vw} ${vTop} L${vw} ${vTop} L${vw - 6} ${vTop + 112} L${-vw + 6} ${vTop + 112}Z`} fill={JIYOON.vest} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <line x1={-vw + 4} y1={vTop + 60} x2={vw - 4} y2={vTop + 60} stroke="#f4efe2" strokeWidth={9} />
        <line x1={-vw * 0.5} y1={vTop + 4} x2={-vw * 0.5} y2={vTop + 108} stroke="#f4efe2" strokeWidth={7} />
        <line x1={vw * 0.5} y1={vTop + 4} x2={vw * 0.5} y2={vTop + 108} stroke="#f4efe2" strokeWidth={7} />
      </g>
      {arm(-1)}
      {arm(1)}
      {/* the head from behind: all hair, a sliver of neck, and the ponytail */}
      <g transform={`translate(0 ${bob})`}>
        <rect x={-10} y={-236} width={20} height={20} fill={JIYOON.head} />
        <ellipse cx={-46} cy={-262} rx={8} ry={12} fill={JIYOON.head} stroke={INK} strokeWidth={2} />
        <ellipse cx={46} cy={-262} rx={8} ry={12} fill={JIYOON.head} stroke={INK} strokeWidth={2} />
        <circle cx={0} cy={-266} r={46} fill={JIYOON.hair} />
        <path d="M-30 -296 Q0 -312 30 -296" fill="none" stroke="#5a4040" strokeWidth={4} strokeLinecap="round" />
        <path d={`M-10 -228 Q${-16 + Math.sin(frame * 0.2) * 2} -196 ${Math.sin(frame * 0.15) * 4} -168 Q14 -196 10 -228Z`} fill={JIYOON.hair}
          stroke="#5a4040" strokeWidth={2.5} />
        <rect x={-11} y={-232} width={22} height={7} rx={3} fill="#3a2a2a" stroke="#5a4040" strokeWidth={2} />
      </g>
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the hug

/**
 * The hug at a strength t (0 apart, 1 holding): her leaning in with both arms round your back, you either stiff
 * (arms straight down, fists) or holding her back. `you` faces right at `youX`; she faces left at `herX`; both on
 * `floor` at `scale`. Her arms aim at your back, a little below your shoulder blades, so the near arm stays under her
 * chin; `squeeze` 0..1 pulls them in tighter.
 */
export function hug(o: {
  youX: number; herX: number; floor: number; scale: number; t: number; hold: number; squeeze?: number; shake?: number; frame: number;
}) {
  const { youX, herX, floor, scale, t, hold, squeeze = 0, shake = 0, frame } = o;
  const sob = shake * Math.sin(frame * 0.7) * 2.2;
  const herPose: Pose = { ...STAND, lean: mix(0, 22, t), tilt: mix(0, 10, t), drop: mix(0, 14, t) + sob };
  const her: Body = { x: herX, y: floor, scale, facing: -1, pose: herPose };
  const yourPose: Pose = { ...STAND, lean: mix(0, hold > 0 ? 6 : -3, t), tilt: mix(0, hold > 0 ? -8 : 0, t) };
  const you: Body = { x: youX, y: floor, scale, facing: 1, pose: yourPose };
  const back = { x: youX - 22 * scale + squeeze * 6, y: floor - 196 * scale };
  her.pose = {
    ...her.pose,
    armF: mixArm(STAND.armF, aimArm(her, back), t),
    armB: mixArm(STAND.armB, aimArm(her, { x: back.x + 14, y: back.y - 18 * scale }), t),
  };
  const herBack = { x: herX + 18 * scale, y: floor - 214 * scale };
  const stiff: [number, number] = [-2, 2];
  you.pose = {
    ...you.pose,
    armF: hold > 0 ? mixArm(stiff, aimArm(you, herBack), hold) : mixArm(STAND.armF, stiff, t),
    armB: hold > 0 ? mixArm(stiff, aimArm(you, { x: herBack.x - 10, y: herBack.y + 26 * scale }), hold) : mixArm(STAND.armB, [-4, 1], t),
  };
  return { her, you };
}

// ------------------------------------------------------------------------------------------------ light

/** A practical light in world coordinates (a lamp, a sodium lamp) for `withGlows`. */
export interface Practical { x: number; y: number; r: number; color: string; strength?: number }

/** The current look with these lights' glows added where the camera sees them. */
export function useGlows(cam: Camera, lights: Practical[]): Look {
  const look = useLook();
  const glows: Glow[] = lights.map((l) => {
    const p = screenOf(cam, l.x, l.y, 1);
    return { x: p.x, y: p.y, r: l.r * cam.zoom, color: l.color, strength: l.strength };
  });
  return { ...look, glows: [...(look.glows ?? []), ...glows] };
}
