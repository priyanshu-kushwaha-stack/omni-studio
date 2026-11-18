// The steel machine worker from the thumbnail (brand/thumbs/aitrap/Trap.tsx), as a reusable figure on the kit's rig:
// a steel body, a screen face with two happy arcs that NEVER change (no blink, no look, no mouth: the machine has one
// face), an antenna with a mustard bead, two steel arms and two steel legs that take the kit's Pose (STAND, SEATED,
// walkPose(phase), reach() for a hand target). It stands where a kit Figure stands: feet at (x, y), the same height at
// the same scale (head centre about 275 above the feet at scale 1), so it goes on any set spot, and SEATED works on a
// stool exactly as a Figure does (y = seatedY(seatTop, scale)). Props: a spatula with a burger flipping on `flip`, a
// paint gun with a spray, a pie plate, a card, the phone; a cap; a role badge on the chest. The chirp is sound.
import { dir, joints, LIMB, STAND, TORSO, type Pose } from "@whatif/kit/rig/pose";
import { useSoundOnly } from "@whatif/kit/sound";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Burger, Card, GLOW, Pie, SCREEN, SmallAppPhone, Spatula, spatulaTip, STEEL, STEEL_DARK, STEEL_LIGHT } from "./Props";

/** What a robot holds in its front hand. A ReactNode is drawn at the hand as is (like Figure `held`). */
export type RobotHeld = "spatula" | "paintGun" | "pie" | "card" | "strangeCard" | "phone" | "none" | React.ReactNode;

export interface RobotProps {
  x: number;
  y: number;
  scale?: number;
  /** 1 faces right (the arms reach right), -1 left. The screen face always looks out at the camera. */
  facing?: 1 | -1;
  /** The kit's Pose: STAND, SEATED, walkPose(phase), or arms from reach(). Legs and arms follow it; the body leans. */
  pose?: Pose;
  held?: RobotHeld;
  /** The spatula's angle in degrees from forward (negative tips it up). */
  toolAngle?: number;
  /** A burger on the spatula, flipping: the number of flips so far (e.g. frame / 30). Its fraction is the place in the
   *  flip: 0 on the blade, 0.5 at the top, one full turn per flip. Omit for no burger; use `burger` for one resting. */
  flip?: number;
  /** How high the flip goes, in robot units (scale 1). */
  flipHeight?: number;
  /** A burger resting on the spatula (when not flipping). */
  burger?: boolean;
  /** The paint gun's spray, 0..1, and its colour. */
  spray?: number;
  sprayColor?: string;
  /** Drives the spray's mist. */
  frame?: number;
  /** A cap on the screen head (a colour), for the steel customer. */
  cap?: string;
  /** A role on a paper badge on the chest, e.g. "COOK". Kept short (it is small); off the face by construction. */
  role?: string;
  /** Opacity of the face's glow, for a dark room (the arcs stay; the screen is never off). Default 1. */
  glow?: number;
  /** A tint on the body's steel (e.g. "#8a9aa6" for a darker machine). */
  steel?: string;
}

const ARM = LIMB * 1.04;
const HEAD_W = 112, HEAD_H = 88;

/** Where a robot's screen head sits (centre) and its half size, in output units, for keeping text off it. */
export function robotHead(r: Pick<RobotProps, "x" | "y" | "scale" | "facing" | "pose">) {
  const s = r.scale ?? 1;
  const h = shoulders(r.pose ?? STAND).head;
  return { x: r.x + h.x * s * (r.facing ?? 1), y: r.y + h.y * s, w: HEAD_W * s, h: HEAD_H * s };
}

/** Where a robot's front hand is, in output units. */
export function robotHand(r: Pick<RobotProps, "x" | "y" | "scale" | "facing" | "pose">) {
  const s = r.scale ?? 1;
  const pose = r.pose ?? STAND;
  const sh = shoulders(pose).front;
  const a = dir(pose.armF[0]), b = dir(pose.armF[0] + pose.armF[1]);
  return { x: r.x + (sh.x + (a.x + b.x) * ARM) * s * (r.facing ?? 1), y: r.y + (sh.y + (a.y + b.y) * ARM) * s };
}

/** A point of the upright body (hip at the origin of the lean) turned by the pose's lean about the hip. */
function leaned(pose: Pose, px: number, py: number) {
  const hip = joints(pose).hip;
  const r = (pose.lean * Math.PI) / 180;
  const dx = px - hip.x, dy = py - hip.y;
  return { x: hip.x + dx * Math.cos(r) - dy * Math.sin(r), y: hip.y + dx * Math.sin(r) + dy * Math.cos(r) };
}

function shoulders(pose: Pose) {
  const j = joints(pose);
  const top = j.hip.y - TORSO;
  return { front: leaned(pose, j.hip.x + 40, top + 26), back: leaned(pose, j.hip.x - 40, top + 26), j, top, head: leaned(pose, j.hip.x, top - HEAD_H / 2 - 10) };
}

const Tube: React.FC<{ from: { x: number; y: number }; angles: [number, number]; color: string; width: number; len: number; foot?: boolean }> = ({
  from, angles, color, width, len, foot,
}) => {
  const a = dir(angles[0]);
  const b = dir(angles[0] + angles[1]);
  const mid = { x: from.x + a.x * len, y: from.y + a.y * len };
  const tip = { x: mid.x + b.x * len, y: mid.y + b.y * len };
  return (
    <g>
      <polyline points={`${from.x},${from.y} ${mid.x},${mid.y} ${tip.x},${tip.y}`} fill="none" stroke={INK} strokeWidth={width + 8} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${from.x},${from.y} ${mid.x},${mid.y} ${tip.x},${tip.y}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={mid.x} cy={mid.y} r={width * 0.55} fill={STEEL_DARK} stroke={INK} strokeWidth={3} />
      {foot ? <rect x={tip.x - 16} y={tip.y - 12} width={44} height={16} rx={7} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
        : <circle cx={tip.x} cy={tip.y} r={width * 0.72} fill={STEEL_LIGHT} stroke={INK} strokeWidth={4} />}
    </g>
  );
};

const PaintGun: React.FC<{ spray: number; color: string; frame: number }> = ({ spray, color, frame }) => (
  <g>
    {spray > 0 && (
      <g opacity={spray}>
        <path d="M62 -18 L250 -88 Q276 -20 250 48 Z" fill={color} opacity={0.32} />
        <path d="M62 -18 L210 -60 Q226 -18 210 26 Z" fill={color} opacity={0.4} />
        {Array.from({ length: 12 }, (_, i) => {
          const p = ((frame * 0.09 + i / 12) % 1);
          return <circle key={i} cx={66 + p * 190} cy={-18 + Math.sin(i * 2.3) * p * 60} r={3 + p * 5} fill={color} opacity={0.7 * (1 - p)} />;
        })}
      </g>
    )}
    <path d="M-6 6 Q-30 40 -12 80" fill="none" stroke="#3a3d45" strokeWidth={8} strokeLinecap="round" />
    <rect x={-10} y={-34} width={58} height={30} rx={8} fill={MUSTARD} stroke={INK} strokeWidth={4} />
    <rect x={44} y={-26} width={22} height={14} rx={3} fill={STEEL_DARK} stroke={INK} strokeWidth={3} />
    <rect x={-4} y={-8} width={16} height={30} rx={4} fill="#3a3d45" stroke={INK} strokeWidth={3} />
    <rect x={8} y={-52} width={26} height={20} rx={4} fill={STEEL_LIGHT} stroke={INK} strokeWidth={3} />
  </g>
);

/** The steel machine worker. Feet at (x, y); everything else follows the kit's Pose. */
export const Robot: React.FC<RobotProps> = ({
  x, y, scale = 1, facing = 1, pose = STAND, held = "none", toolAngle = -20, flip, flipHeight = 160, burger, spray = 0, sprayColor = "#d8344f",
  frame = 0, cap, role, glow = 1, steel = STEEL,
}) => {
  if (useSoundOnly()) return null;
  const { front, back, j, top, head: headC } = shoulders(pose);
  const hip = j.hip;
  const a = dir(pose.armF[0]), b = dir(pose.armF[0] + pose.armF[1]);
  const hand = { x: front.x + (a.x + b.x) * ARM, y: front.y + (a.y + b.y) * ARM };
  const tip = spatulaTip(toolAngle);
  const f = flip === undefined ? 0 : flip - Math.floor(flip);
  const flipY = -flipHeight * 4 * f * (1 - f);
  const bodyTop = top + 4;
  const bodyH = hip.y - bodyTop + 22;
  const heldNode = (() => {
    switch (held) {
      case "spatula":
        return (
          <g>
            <Spatula angle={toolAngle} />
            {(flip !== undefined || burger) && <Burger x={tip.x} y={tip.y - 26 + flipY} s={0.62} rot={f * 360 * (facing === 1 ? 1 : -1)} />}
          </g>
        );
      case "paintGun": return <PaintGun spray={spray} color={sprayColor} frame={frame} />;
      case "pie": return <Pie x={30} y={-6} s={0.8} />;
      case "card": return <Card x={22} y={-24} s={0.42} rot={-12} />;
      case "strangeCard": return <Card x={22} y={-24} s={0.42} rot={-12} strange />;
      case "phone": return <SmallAppPhone s={1.6} />;
      case "none": return null;
      default: return held;
    }
  })();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      {/* legs: the back one darker, behind */}
      <Tube from={{ x: hip.x - 10, y: hip.y }} angles={pose.legB} color={STEEL_DARK} width={18} len={LIMB} foot />
      {/* the back arm */}
      <Tube from={back} angles={pose.armB} color={STEEL_DARK} width={14} len={ARM} />
      {/* the body, leaning with the pose */}
      <g transform={`rotate(${pose.lean} ${hip.x} ${hip.y})`}>
        <rect x={hip.x - 48} y={bodyTop} width={96} height={bodyH} rx={20} fill={steel} stroke={INK} strokeWidth={6} />
        <rect x={hip.x - 40} y={bodyTop + 8} width={80} height={16} rx={8} fill="#fff" opacity={0.22} />
        <rect x={hip.x - 28} y={bodyTop + 30} width={56} height={32} rx={7} fill={STEEL_DARK} />
        <circle cx={hip.x} cy={bodyTop + 46} r={8} fill={GLOW} opacity={glow} />
        {role && (
          <g transform={`translate(${hip.x} ${bodyTop + 86})`}>
            <rect x={-Math.max(30, role.length * 9 + 8)} y={-14} width={Math.max(60, role.length * 18 + 16)} height={28} rx={5} fill={PAPER} stroke={INK} strokeWidth={3} />
            <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={INK}
              transform={facing === -1 ? "scale(-1 1)" : undefined}>{role}</text>
          </g>
        )}
      </g>
      <Tube from={{ x: hip.x + 10, y: hip.y }} angles={pose.legF} color={steel} width={18} len={LIMB} foot />
      {/* the neck and the screen head: two happy arcs that never change */}
      <rect x={headC.x - 10} y={headC.y + HEAD_H / 2 - 4} width={20} height={20} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
      {!cap && <line x1={headC.x} y1={headC.y - HEAD_H / 2} x2={headC.x} y2={headC.y - HEAD_H / 2 - 24} stroke={INK} strokeWidth={5} />}
      {!cap && <circle cx={headC.x} cy={headC.y - HEAD_H / 2 - 28} r={8} fill={MUSTARD} stroke={INK} strokeWidth={4} />}
      <rect x={headC.x - HEAD_W / 2} y={headC.y - HEAD_H / 2} width={HEAD_W} height={HEAD_H} rx={22} fill={steel} stroke={INK} strokeWidth={6} />
      <rect x={headC.x - HEAD_W / 2 + 13} y={headC.y - HEAD_H / 2 + 12} width={HEAD_W - 26} height={HEAD_H - 26} rx={14} fill={SCREEN} />
      <path d={`M${headC.x - 26} ${headC.y + 6} q9 -13 18 0 M${headC.x + 8} ${headC.y + 6} q9 -13 18 0`} fill="none" stroke={GLOW} strokeWidth={6.5}
        strokeLinecap="round" opacity={0.35 + 0.65 * glow} />
      {cap && (
        <g>
          <path d={`M${headC.x - 54} ${headC.y - HEAD_H / 2 + 14} Q${headC.x - 52} ${headC.y - HEAD_H / 2 - 30} ${headC.x} ${headC.y - HEAD_H / 2 - 32} Q${headC.x + 52} ${headC.y - HEAD_H / 2 - 30} ${headC.x + 54} ${headC.y - HEAD_H / 2 + 14}Z`}
            fill={cap} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M${headC.x + 40} ${headC.y - HEAD_H / 2 + 6} H${headC.x + 100} Q${headC.x + 96} ${headC.y - HEAD_H / 2 + 20} ${headC.x + 40} ${headC.y - HEAD_H / 2 + 18}Z`}
            fill={cap} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={headC.x} cy={headC.y - HEAD_H / 2 - 30} r={6} fill={INK} />
        </g>
      )}
      {/* the front arm and what it holds */}
      <Tube from={front} angles={pose.armF} color={steel} width={14} len={ARM} />
      {heldNode && <g transform={`translate(${hand.x} ${hand.y})`}>{heldNode}</g>}
    </g>
  );
};

/** Arm angles that raise the spatula high and forward (the thumbnail's flip). */
export const FLIP_ARM: [number, number] = [118, 40];
/** A standing robot cook mid-flip (STAND with the front arm up). */
export const COOK_POSE: Pose = { ...STAND, armF: FLIP_ARM, armB: [20, 30] };
/** Arms out with a plate (a waiter). */
export const SERVE_POSE: Pose = { ...STAND, armF: [80, 10], armB: [30, 40] };
/** The painter: arm out level with the gun. */
export const SPRAY_POSE: Pose = { ...STAND, lean: 4, armF: [95, -5], armB: [40, 50] };
