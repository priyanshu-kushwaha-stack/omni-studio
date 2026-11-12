// Helpers for "The Key" (TheKey.tsx): the thumbnail's frame, copied from channels/say-suppose/brand/thumbs/predict
// (Predict.tsx and data.ts) and drawn in the film's own code, not imported. The world is the thumbnail's screen at REF:
// you large at the left with the key on your open palm, the tin box on the counter between you, your best friend at the
// right with a hand flat on the lid, the crimson split-flap card over his head on a thread from the city's teal lamp,
// the food court behind shuttered and dark. Added for the film: a few late figures in the dark court whose faces turn,
// each under a teal card that never changes, and the coffee seller at the far right with her phone up.
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone } from "@whatif/kit/sets/props";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { Tag } from "../device";
import { blinking, COFFEE, FRIEND, HERO, PASTELS } from "../shared";
import { Deep } from "../sets/common";

// ------------------------------------------------------------------------------------------------ the geometry (data.ts)

/** Reaching across the counter: the front arm out level, the forearm turned up a little, so the hand is a palm. */
export const OFFER: Pose = { ...STAND, lean: 6, tilt: 4, armF: [84, -6], armB: [-6, 14] };
/** Your best friend: leaning in over the box, the near hand down flat on its lid. */
export const LEAN: Pose = { ...STAND, lean: 10, tilt: 14, armF: [72, 22], armB: [-10, 10] };

/** You, at screen scale, cut at the knees by the counter. */
export const YOU = { x: 400, y: 1775, scale: 4.2 };
/** Your best friend across the box, facing you. */
export const HIM = { x: 1600, y: 1450, scale: 3.0 };
/** The stall's one warm lamp. */
export const LAMP = { x: 900, y: 330 };
/** The card over his head: its tiles' centre line and a tile's size. */
export const CARD_AT = { x: 1560, y: 405, tile: 120 };
export const COUNTER_TOP = 960;
export const PEACH = FRIEND.head;
const BRASS = "#e8b84a";

/** Where a figure's front hand lands, from the rig's own maths (data.ts handAt). */
export function frontHand(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const sh = joints(pose).shoulder;
  const a = dir(pose.armF[0]);
  const b = dir(pose.armF[0] + pose.armF[1]);
  return { x: x + facing * (sh.x + (a.x + b.x) * LIMB) * scale, y: y + (sh.y + (a.y + b.y) * LIMB) * scale };
}

/** Where a figure's head centre is. */
export function headOf(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1 = 1) {
  const j = joints(pose);
  return { x: x + facing * j.head.x * scale, y: y + j.head.y * scale, r: 46 * scale };
}

const HAND0 = frontHand(HIM.x, HIM.y, HIM.scale, LEAN, -1);
/** The box on the counter with its lid just under his hand (data.ts BOX). */
export const BOX = { x: HAND0.x - 60, w: 300, h: COUNTER_TOP - HAND0.y - 8 };
/** Your palm and the key on it. */
export const PALM = frontHand(YOU.x, YOU.y, YOU.scale, OFFER);
export const KEY_AT = { x: PALM.x + 20, y: PALM.y - 30 };
export const YOUR_HEAD = headOf(YOU.x, YOU.y, YOU.scale, OFFER);
export const HIS_HEAD = headOf(HIM.x, HIM.y, HIM.scale, LEAN, -1);
/** His shoulder, for aiming his front arm. */
export function hisShoulder(pose: Pose) {
  const sh = joints(pose).shoulder;
  return { x: HIM.x - sh.x * HIM.scale, y: HIM.y + sh.y * HIM.scale };
}

// ------------------------------------------------------------------------------------------------ the court

const SHUTTER = "#2b3142";
const BOARDS = ["#7a3b46", "#2f5f63", "#6b5a33", "#3d4a78", "#5f3d6b"];

/** The food court behind, closed: shutters down, dim blank boards, chairs stacked on tables. */
const Court: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2800} fill="#10121b" />
    {[-2, -1, 0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={120 + i * 470} y={128} width={260} height={14} rx={7} fill="#2c3040" />)}
    {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((i) => {
      const x = -60 + i * 420;
      return (
        <g key={i} opacity={0.9}>
          <rect x={x} y={230} width={380} height={70} rx={6} fill={BOARDS[(i + 10) % 5]} opacity={0.55} stroke={INK} strokeWidth={5} />
          <rect x={x + 30} y={256} width={170} height={16} rx={8} fill={INK} opacity={0.5} />
          <rect x={x} y={310} width={380} height={600} fill={SHUTTER} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 22 }, (_, r) => <line key={r} x1={x + 6} y1={330 + r * 26} x2={x + 374} y2={330 + r * 26} stroke="#3a4156" strokeWidth={6} />)}
          <rect x={x + 160} y={870} width={60} height={14} rx={6} fill="#4a5168" />
        </g>
      );
    })}
    {[260, 1020, -500, 1780].map((cx) => (
      <g key={cx} fill="#1a1d29" stroke="#262a39" strokeWidth={5}>
        <rect x={cx - 120} y={740} width={240} height={18} />
        <rect x={cx - 100} y={758} width={14} height={150} />
        <rect x={cx + 86} y={758} width={14} height={150} />
        <rect x={cx - 90} y={660} width={180} height={14} />
        <rect x={cx - 90} y={600} width={12} height={140} />
        <rect x={cx + 78} y={600} width={12} height={140} />
      </g>
    ))}
    <rect x={-1400} y={905} width={4800} height={1000} fill="#1b1e29" />
  </g>
);

/** The stall's one lamp over the counter: a warm bulb under a metal shade, a cone of light. */
const Lamp: React.FC = () => (
  <g>
    <line x1={LAMP.x} y1={-900} x2={LAMP.x} y2={LAMP.y - 50} stroke="#14161f" strokeWidth={8} />
    <path d={`M${LAMP.x - 520} 1080 L${LAMP.x - 60} ${LAMP.y + 10} L${LAMP.x + 60} ${LAMP.y + 10} L${LAMP.x + 640} 1080Z`} fill="#ffd98a" opacity={0.07} />
    <path d={`M${LAMP.x - 80} ${LAMP.y} L${LAMP.x - 30} ${LAMP.y - 54} L${LAMP.x + 30} ${LAMP.y - 54} L${LAMP.x + 80} ${LAMP.y}Z`} fill="#3b404e" stroke={INK} strokeWidth={6} />
    <circle cx={LAMP.x} cy={LAMP.y + 8} r={22} fill="#fff1c2" />
  </g>
);

/** A pool of shadow behind your head, so the mustard head stands off the court (K4). */
const YourShade: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="key-shade" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.4" stopColor="#06070b" stopOpacity={0.9} />
        <stop offset="1" stopColor="#06070b" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={YOUR_HEAD.x} cy={YOUR_HEAD.y} r={YOUR_HEAD.r * 1.9} fill="url(#key-shade)" />
  </g>
);

/** A late figure in the dark court under its own teal card, which never changes. Faces away until `turn`, then toward
 *  the counter. */
export interface Watcher { x: number; y: number; s: number; head: string; coat: string; text: string; pct: number; turn: number; away: 1 | -1 }

/** The watchers, their faces turning on the peak at `turn` frames after it starts (TheKey.tsx adds the start). */
export const WATCHERS: Watcher[] = [
  { x: 120, y: 905, s: 0.8, head: PASTELS[0], coat: "#2a2d36", text: "GOES HOME", pct: 92, turn: 24, away: -1 },
  { x: 780, y: 915, s: 0.85, head: PASTELS[3], coat: "#3b4a6b", text: "STACKS CHAIRS", pct: 96, turn: 70, away: -1 },
  { x: 1000, y: 900, s: 0.78, head: PASTELS[2], coat: "#2a2d36", text: "SWEEPS", pct: 98, turn: 112, away: 1 },
  { x: 1310, y: 910, s: 0.82, head: PASTELS[5], coat: "#5f3d6b", text: "LOCKS UP", pct: 97, turn: 48, away: 1 },
  { x: -380, y: 905, s: 0.8, head: PASTELS[6], coat: "#3b4a6b", text: "CHECKS PHONE", pct: 94, turn: 90, away: -1 },
  { x: 2150, y: 905, s: 0.8, head: PASTELS[4], coat: "#2a2d36", text: "WALKS OUT", pct: 93, turn: 140, away: 1 },
];
/** Where the coffee seller stands with her phone up, at the right of the court. */
export const SELLER = { x: 1845, y: 920, s: 0.95 };

const Watchers: React.FC<{ frame: number; peak: number; long: number }> = ({ frame, peak, long }) => (
  <g>
    {WATCHERS.map((w, i) => {
      const turned = frame >= peak + w.turn;
      const towards: 1 | -1 = w.x < 900 ? 1 : -1;
      const facing = turned ? towards : w.away;
      const h = headOf(w.x, w.y, w.s, STAND, facing);
      return (
        <g key={i}>
          <Figure x={w.x} y={w.y} scale={w.s} facing={facing} pose={STAND} head={w.head} coat={w.coat} mouth="flat"
            brows={turned ? "raised" : "none"} eyes={turned ? 1.15 : 1} look={turned ? { x: 1, y: 0.15 } : { x: 0.6, y: 0.5 }}
            blink={blinking(frame, i + 3)} time={frame} />
          <Tag frame={frame} x={h.x} headY={h.y} r={h.r} scale={0.9} keys={[{ at: long, text: w.text, pct: w.pct, state: "tick" }]} />
        </g>
      );
    })}
  </g>
);

/** The coffee seller with her phone up, filming; she lowers it from `lower`. */
const Seller: React.FC<{ frame: number; lower: number }> = ({ frame, lower }) => {
  const t = Math.min(1, Math.max(0, (frame - lower) / 14));
  const up: Pose = { ...STAND, armF: [150 - 120 * t, 30 + 10 * t], armB: [140 - 120 * t, 40] };
  const h = headOf(SELLER.x, SELLER.y, SELLER.s, up, -1);
  return (
    <g>
      <Figure x={SELLER.x} y={SELLER.y} scale={SELLER.s} facing={-1} pose={up} head={COFFEE.head} coat={COFFEE.coat}
        mouth={t > 0.5 ? "o" : "flat"} brows={t > 0.5 ? "raised" : "flat"} lids={t > 0.5 ? 0 : 0.3} look={{ x: 0.9, y: 0.1 }}
        blink={blinking(frame, 9)} time={frame} held={<g transform="scale(1.6)"><HandPhone lit /></g>} />
      <path d={`M${h.x - h.r * 0.9} ${h.y - h.r * 0.55} Q${h.x} ${h.y - h.r * 1.45} ${h.x + h.r * 0.9} ${h.y - h.r * 0.55} Z`} fill={COFFEE.cap}
        stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** Everything behind the actors: the court, the watchers, the coffee seller, the lamp, the shade behind your head. */
export const KeyBack: React.FC<{ cam: Camera; frame: number; peak: number; lower: number }> = ({ cam, frame, peak, lower }) => (
  <g>
    <Deep cam={cam} depth={0.7}>
      <Court />
      <Watchers frame={frame} peak={peak} long={peak - 400} />
      <Seller frame={frame} lower={lower} />
      <rect x={-1400} y={-900} width={4800} height={2800} fill="#05060a" opacity={0.28} />
    </Deep>
    <Lamp />
    <YourShade />
  </g>
);

// ------------------------------------------------------------------------------------------------ the props

/** One crimson split-flap tile of the card. `deep` 0..2 darkens it a step each flap. */
const Tile: React.FC<{ ch: string; x: number; y: number; s: number; color: string }> = ({ ch, x, y, s, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill="#000" opacity={0.4} transform={`translate(${s * 0.05} ${s * 0.08})`} />
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill={color} stroke={PAPER} strokeWidth={s * 0.045} />
    <line x1={-s * 0.4} y1={0} x2={s * 0.4} y2={0} stroke="#5a0c1a" strokeWidth={s * 0.035} />
    <text x={0} y={s * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s * 0.82} fill={PAPER}>{ch}</text>
  </g>
);

/** One state of his card: digits ("94%") on tiles of a crimson that deepens, or blank (cream, no type). */
export interface CardKey { at: number; text: string | null; deep: number }

const CRIMSONS = [CRIMSON, "#b5243f", "#8c162e"];

/** His card from the thumbnail: three tiles on a cream stamped card, hung on a thread from the city's teal lamp at the
 *  top edge. Each new key flips the card (a squash and back over 6 frames). */
export const KeyCard: React.FC<{ frame: number; keys: CardKey[] }> = ({ frame, keys }) => {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (frame >= keys[k].at) i = k;
  const key = keys[i];
  const { x, y, tile } = CARD_AT;
  const chars = "94%".split("");
  const w = tile * 0.86;
  const x0 = x - ((chars.length - 1) * w) / 2;
  const top = y - tile * 0.72;
  const since = frame - key.at;
  const flip = i > 0 && since < 6 ? Math.max(0.04, Math.abs(Math.cos((since / 6) * Math.PI))) : 1;
  const sway = Math.sin(frame / 13) * 0.8;
  const face = key.text === null ? PAPER : key.deep >= 2 ? "#f2d3d3" : key.deep === 1 ? "#f6e0dc" : PAPER;
  return (
    <g>
      <line x1={x} y1={-900} x2={x} y2={top} stroke={PAPER} strokeWidth={4} opacity={0.75} />
      <circle cx={x} cy={-2} r={60} fill={TEAL} opacity={0.18} />
      <circle cx={x} cy={top - 4} r={12} fill={TEAL} stroke={PAPER} strokeWidth={4} />
      <g transform={`translate(${x} ${top}) rotate(${sway}) scale(1 ${flip}) translate(${-x} ${-top})`}>
        <rect x={x0 - tile * 0.58} y={top} width={(chars.length - 1) * w + tile * 1.16} height={tile * 1.44} rx={tile * 0.14} fill={face} stroke={INK} strokeWidth={8} />
        {key.text !== null && key.text.split("").map((ch, n) => <Tile key={n} ch={ch} x={x0 + n * w} y={y} s={tile} color={CRIMSONS[Math.min(2, key.deep)]} />)}
      </g>
    </g>
  );
};

/** The cash-box key: a brass bow, a shank and two teeth, catching the lamp. */
export const BrassKey: React.FC<{ x: number; y: number; scale?: number; rotate?: number; glint?: number }> = ({ x, y, scale = 1, rotate = -14, glint = 0.28 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    {glint > 0 && <circle cx={0} cy={0} r={48} fill="#fff6c8" opacity={glint} />}
    <circle cx={-34} cy={-16} r={26} fill={BRASS} stroke={INK} strokeWidth={6} />
    <circle cx={-34} cy={-16} r={10} fill={INK} />
    <rect x={-10} y={-24} width={78} height={16} rx={4} fill={BRASS} stroke={INK} strokeWidth={6} />
    <rect x={44} y={-10} width={12} height={20} fill={BRASS} stroke={INK} strokeWidth={5} />
    <rect x={58} y={-10} width={10} height={14} fill={BRASS} stroke={INK} strokeWidth={5} />
  </g>
);

/** The tin box at x on the counter: lid shut with its brass lock, or lifted (`open` 0..1) on a hinge at his side,
 *  showing the night's coins and the two rent envelopes. */
export const KeyBox: React.FC<{ x?: number; open?: number }> = ({ x = BOX.x, open = 0 }) => {
  const { w, h } = BOX;
  const top = COUNTER_TOP - h;
  const lid = h * 0.3;
  return (
    <g>
      <rect x={x - w / 2 + 10} y={top + 14} width={w} height={h} rx={10} fill="#000" opacity={0.45} />
      <rect x={x - w / 2} y={top} width={w} height={h} rx={10} fill="#3a4150" stroke={INK} strokeWidth={7} />
      {open > 0.15 && (
        <g>
          <rect x={x - w / 2 + 12} y={top + 4} width={w - 24} height={h * 0.45} rx={6} fill="#1d2029" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <ellipse key={i} cx={x - w / 2 + 40 + i * 34} cy={top + 10 - (i % 2) * 6} rx={18} ry={8} fill={BRASS} stroke={INK} strokeWidth={3} />)}
          <rect x={x - 70} y={top - 26} width={90} height={40} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} transform={`rotate(-8 ${x - 25} ${top})`} />
          <rect x={x + 10} y={top - 22} width={90} height={40} rx={4} fill="#e8dcc4" stroke={INK} strokeWidth={4} transform={`rotate(6 ${x + 55} ${top})`} />
          <circle cx={x - 25} cy={top - 8} r={8} fill="#9a9ca3" />
          <circle cx={x + 55} cy={top - 4} r={8} fill="#9a9ca3" />
        </g>
      )}
      <g transform={`translate(${x + w / 2} ${top}) rotate(${-100 * open}) translate(${-(x + w / 2)} ${-top})`}>
        <rect x={x - w / 2} y={top} width={w} height={lid} rx={10} fill="#4c5568" stroke={INK} strokeWidth={7} />
      </g>
      <rect x={x - 26} y={top + lid} width={52} height={50} rx={8} fill={BRASS} stroke={INK} strokeWidth={6} />
      <rect x={x - 5} y={top + lid + 14} width={10} height={22} rx={4} fill={INK} />
    </g>
  );
};

/** The counter in front of you both: a wooden top edge and a dark front panel. */
export const KeyCounter: React.FC = () => (
  <g>
    <rect x={-1400} y={COUNTER_TOP} width={4800} height={900} fill="#5a3b2a" stroke={INK} strokeWidth={8} />
    <rect x={-1400} y={COUNTER_TOP} width={4800} height={30} fill="#8a5d3c" stroke={INK} strokeWidth={6} />
    {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1={i * 360 + 120} y1={COUNTER_TOP + 40} x2={i * 360 + 120} y2={1900} stroke="#3f2a1e" strokeWidth={6} />)}
  </g>
);

export type Face = Partial<{ brows: "none" | "raised" | "worry" | "sad" | "angry" | "flat"; lids: number; mouth: "none" | "smile" | "smirk" | "o" | "flat" | "open" | "frown" | "wobble"; eyes: number; look: { x: number; y: number }; blink: boolean }>;

/** You, in the thumbnail's pose, the key on your palm unless `key` is false. */
export const You: React.FC<{ frame: number; face: Face; pose?: Pose; showKey?: boolean }> = ({ frame, face, pose = OFFER, showKey = true }) => {
  const hand = frontHand(YOU.x, YOU.y, YOU.scale, pose);
  return (
    <g>
      <Figure x={YOU.x} y={YOU.y} scale={YOU.scale} pose={pose} head={HERO.head} scarf={HERO.scarf} tuft flow={0.1} time={frame}
        blink={blinking(frame, 1)} {...face} />
      {showKey && <BrassKey x={hand.x + 20} y={hand.y - 30} />}
    </g>
  );
};

/** Your best friend, leaning over the box; his front hand where `pose` puts it, holding `held`. */
export const Him: React.FC<{ frame: number; face: Face; pose?: Pose; held?: React.ReactNode; ghost?: Face }> = ({ frame, face, pose = LEAN, held, ghost }) => (
  <g>
    <Figure x={HIM.x} y={HIM.y} scale={HIM.scale} facing={-1} pose={pose} head={PEACH} coat={FRIEND.coat} time={frame}
      blink={blinking(frame, 2)} held={held} {...face} />
    {/* the slow-motion ghost: the same figure, faint, with the eyes where they were a moment ago */}
    {ghost && (
      <g opacity={0.4}>
        <Figure x={HIM.x} y={HIM.y} scale={HIM.scale} facing={-1} pose={pose} head={PEACH} coat={FRIEND.coat} time={frame} held={held} {...face} {...ghost} />
      </g>
    )}
  </g>
);

