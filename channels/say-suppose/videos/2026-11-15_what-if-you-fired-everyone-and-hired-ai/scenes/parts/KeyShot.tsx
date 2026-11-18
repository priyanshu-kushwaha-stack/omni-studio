// The film's key shot: exactly the thumbnail's frame (brand/thumbs/aitrap/Trap.tsx, approved by the owner): your diner
// at night, the car plant's lit sheds and chimney through the long window; you, large at the left, arms thrown wide,
// a fan of cash in your raised hand, eyes wide, mouth open; four steel cooks behind the counter, two happy arcs on
// every screen; a pile of plated burgers along the front counter; four empty teal stools. Same geometry and colours as
// the thumbnail (its data.ts is imported), drawn in screen space, without the word tag (the film's TAG is separate).
// Live: at frame 0 every burger is where the thumbnail has it; then each falls in an arc onto a new plate on the pile
// (the first lands inside half a second) and the next one flips up off the spatula. `sync` puts all four in step for
// the second staging (the sixth Friday). No AI images.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import type { Pose } from "@whatif/kit/rig/pose";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { BACK_COUNTER, FRONT_COUNTER, HERO, headOf, ROBOTS } from "../../../../brand/thumbs/aitrap/data";
import { Burger, CashFan, GLOW, Plate, SmallAppPhone, STEEL, STEEL_DARK } from "./Props";
import type { Face } from "./Places";
import { ease, mix, type ShotTime } from "./util";

const LIFT = [0, 24, 8, 30];
const ROT = [-24, 18, -8, 30];
/** The thumbnail's pile: [x, lift] of each plate on the front counter. */
const PILE: [number, number][] = [[880, 0], [1010, 0], [945, -46], [1140, 0], [1270, 0], [1205, -46], [1400, 0], [1530, 0], [1465, -46], [1660, 0], [1790, 0], [1725, -46], [1335, -92]];
/** Where each robot's burgers land: a column on top of the pile in front of it, one plate higher each time. */
const COLUMN = [945, 1205, 1465, 1725];
const FALL = 12;
const RISE = 14;
const PERIOD = FALL + RISE;
const OFFSET = [2, 11, 6, 15];
const MAX_LANDED = 4;

const top = BACK_COUNTER - 235;

/** The wall, the long window onto the night street and the car plant across it, the back counter (Trap.tsx Room). */
const Room: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#132026" />
    <rect x={640} y={70} width={1320} height={420} fill="#0b1226" stroke="#2b3a44" strokeWidth={18} />
    <rect x={640} y={330} width={1320} height={160} fill="#151d33" />
    <path d="M660 330 L660 250 L760 210 L860 250 L960 210 L1060 250 L1160 210 L1260 250 L1360 210 L1460 250 L1560 210 L1660 250 L1760 210 L1860 250 L1950 230 L1950 330 Z" fill="#1d2840" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={690 + i * 104} y={272} width={70} height={18} rx={3} fill="#f6c768" opacity={0.75} />)}
    <rect x={1520} y={110} width={46} height={150} fill="#1d2840" />
    <path d="M1543 108 C1520 80 1580 60 1550 30" fill="none" stroke="#3a4766" strokeWidth={22} strokeLinecap="round" opacity={0.8} />
    {[980, 1310, 1640].map((x) => <rect key={x} x={x - 9} y={70} width={18} height={420} fill="#2b3a44" />)}
    <rect x={720} y={BACK_COUNTER} width={1200} height={220} fill="#26343c" />
    <rect x={720} y={BACK_COUNTER - 14} width={1200} height={22} fill={STEEL} stroke={INK} strokeWidth={5} />
    <rect x={800} y={BACK_COUNTER - 30} width={1040} height={18} rx={4} fill="#2a2d33" />
  </g>
);

/** The dark pool behind your head and the grill's warm light (Trap.tsx Shade). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  return (
    <g>
      <defs>
        <radialGradient id="key-shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.45" stopColor="#05080b" stopOpacity={0.9} />
          <stop offset="1" stopColor="#05080b" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="key-grill" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb45a" stopOpacity={0.32} />
          <stop offset="1" stopColor="#ffb45a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={1300} cy={BACK_COUNTER - 120} rx={720} ry={320} fill="url(#key-grill)" />
      <circle cx={head.x} cy={head.y} r={head.r * 2.1} fill="url(#key-shade)" />
    </g>
  );
};

/** One robot cook as the thumbnail draws it, its spatula flicking when it throws (`flick` 0..1). */
const ThumbRobot: React.FC<{ x: number; flick: number }> = ({ x, flick }) => {
  const a = -18 - 24 * flick;
  return (
    <g>
      <rect x={x - 62} y={top + 92} width={124} height={170} rx={22} fill={STEEL} stroke={INK} strokeWidth={6} />
      <rect x={x - 34} y={top + 128} width={68} height={40} rx={8} fill={STEEL_DARK} />
      <circle cx={x} cy={top + 148} r={9} fill={GLOW} />
      <rect x={x - 10} y={top + 72} width={20} height={24} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
      <rect x={x - 66} y={top - 26} width={132} height={102} rx={26} fill={STEEL} stroke={INK} strokeWidth={6} />
      <rect x={x - 50} y={top - 12} width={100} height={74} rx={16} fill="#18252e" />
      <path d={`M${x - 30} ${top + 30} q10 -14 20 0 M${x + 10} ${top + 30} q10 -14 20 0`} fill="none" stroke={GLOW} strokeWidth={7} strokeLinecap="round" />
      <line x1={x} y1={top - 26} x2={x} y2={top - 52} stroke={INK} strokeWidth={5} />
      <circle cx={x} cy={top - 56} r={9} fill={MUSTARD} stroke={INK} strokeWidth={4} />
      <path d={`M${x + 56} ${top + 120} L${x + 100} ${top + 60} L${x + 112} ${top - 10}`} fill="none" stroke={STEEL_DARK} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={x + 92} y={top - 52} width={44} height={14} rx={3} fill="#c9d3da" stroke={INK} strokeWidth={4} transform={`rotate(${a} ${x + 114} ${top - 45})`} />
    </g>
  );
};

/** Where robot i's burger is at shot frame f, and how many it has landed on the pile. */
function burgerAt(i: number, f: number, sync: boolean) {
  const x = ROBOTS[i];
  const lift = sync ? 16 : LIFT[i];
  const rot0 = sync ? 0 : ROT[i];
  const apex = { x: x + 100, y: top - 108 - lift };
  const blade = { x: x + 114, y: top - 72 };
  const T = f - (sync ? 2 : OFFSET[i]);
  if (T < 0) return { pos: apex, rot: rot0, s: 0.8, landed: 0, flick: 0, trail: true };
  const c = Math.floor(T / PERIOD);
  const u = T - c * PERIOD;
  const landed = Math.min(MAX_LANDED, c + (u >= FALL ? 1 : 0));
  if (u < FALL) {
    const k = Math.min(MAX_LANDED - 1, c);
    const land = { x: COLUMN[i], y: FRONT_COUNTER - 30 - 46 * (k + 2) };
    const s = u / FALL;
    return { pos: { x: mix(apex.x, land.x, s), y: apex.y + (land.y - apex.y) * s * s }, rot: rot0 * (1 - s), s: mix(0.8, 0.72, s), landed, flick: 0, trail: false };
  }
  const s = (u - FALL) / RISE;
  const k = 1 - (1 - s) * (1 - s);
  const flick = Math.sin(Math.PI * Math.min(1, (u - FALL) / 6));
  return { pos: { x: mix(blade.x, apex.x, s), y: mix(blade.y, apex.y, k) }, rot: rot0 * s + 360 * ease(s), s: 0.8, landed, flick, trail: s > 0.5 };
}

/** The front counter, the pile (with what has landed), the empty stools (Trap.tsx FrontCounter). */
const FrontCounter: React.FC<{ landed: number[]; phone: boolean; extra: number }> = ({ landed, phone, extra }) => (
  <g>
    <rect x={0} y={FRONT_COUNTER} width={1920} height={60} fill="#e6ecef" stroke={INK} strokeWidth={6} />
    <rect x={0} y={FRONT_COUNTER + 60} width={1920} height={120} fill="#1a6f68" />
    {Array.from({ length: 24 }, (_, i) => <rect key={i} x={i * 84} y={FRONT_COUNTER + 60} width={8} height={120} fill="#155a54" />)}
    {PILE.map(([x, dy], i) => (
      <g key={i}>
        <Plate x={x} y={FRONT_COUNTER + 2 + dy} />
        <Burger x={x} y={FRONT_COUNTER - 30 + dy} s={0.72} />
      </g>
    ))}
    {COLUMN.map((x, i) => Array.from({ length: Math.min(MAX_LANDED, landed[i] + extra) }, (_, k) => (
      <g key={`${i}-${k}`}>
        <Plate x={x} y={FRONT_COUNTER + 2 - 46 * (k + 2)} />
        <Burger x={x} y={FRONT_COUNTER - 30 - 46 * (k + 2)} s={0.72} />
      </g>
    )))}
    {phone && <g transform={`translate(560 ${FRONT_COUNTER + 4})`}><SmallAppPhone faceUp s={2.4} /></g>}
    {[800, 1030, 1260, 1490].map((x) => (
      <g key={x}>
        <rect x={x - 8} y={FRONT_COUNTER + 120} width={16} height={60} fill={STEEL} />
        <ellipse cx={x} cy={FRONT_COUNTER + 112} rx={78} ry={22} fill="#26343c" stroke={INK} strokeWidth={5} />
        <ellipse cx={x} cy={FRONT_COUNTER + 104} rx={78} ry={20} fill={TEAL} stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);

export interface KeyShotProps {
  t: ShotTime;
  /** The push over the shot: a number zooms in by that much (0.04 = 4%), a pair is [from, to] (a pull-back is [1.5, 1]). */
  push?: number | [number, number];
  /** Where the push zooms toward, screen pixels (default the counter's middle). */
  pushAt?: { x: number; y: number };
  /** The fan of cash in your raised hand (default on, as the thumbnail). */
  cash?: boolean;
  /** Your face: "thumb" is the thumbnail's (brows up, eyes wide, mouth open); or a named kit expression. */
  face?: "thumb" | Face;
  /** Your pose (default the thumbnail's arms-wide WHOA). */
  pose?: Pose;
  /** You in the frame at all (off for the empty room of the second staging's start). */
  you?: boolean;
  /** Burgers flip and land (off: the thumbnail's frame held still). */
  flip?: boolean;
  /** All four cooks in step, the same arc (the sixth Friday). */
  sync?: boolean;
  /** Plates already landed on each column at frame 0 (0 is the thumbnail's pile; up to 4). */
  extra?: number;
  /** Your phone face up on the counter (the sixth Friday). */
  phone?: boolean;
}

/** The key shot, the thumbnail live. At t.f 0 with the defaults it is the thumbnail's frame without the tag. */
export const KeyShot: React.FC<KeyShotProps> = ({
  t, push = 0.04, pushAt = { x: 1100, y: 640 }, cash = true, face = "thumb", pose, you = true, flip = true, sync = false, extra = 0, phone = false,
}) => {
  const f = flip ? t.f : 0;
  const burgers = ROBOTS.map((_, i) => burgerAt(i, f, sync));
  const [from, to] = typeof push === "number" ? [1, 1 + push] : push;
  const z = mix(from, to, ease(t.p));
  const expr = face === "thumb" ? { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.3 } : EXPRESSIONS[face];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: `${pushAt.x}px ${pushAt.y}px` }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <Room />
          <Shade />
          {ROBOTS.map((x, i) => {
            const b = burgers[i];
            return (
              <g key={x}>
                <ThumbRobot x={x} flick={b.flick} />
                <Burger x={b.pos.x} y={b.pos.y} s={b.s} rot={b.rot} />
                {b.trail && <path d={`M${x + 112} ${top - 58} q-4 -10 -6 -${18 + (sync ? 16 : LIFT[i]) / 2}`} fill="none" stroke={PAPER} strokeWidth={4} strokeDasharray="6 10" opacity={0.5} />}
              </g>
            );
          })}
          <FrontCounter landed={burgers.map((b) => b.landed)} phone={phone} extra={Math.max(0, Math.min(MAX_LANDED, extra))} />
          {you && (
            <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={pose ?? HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.15}
              time={3 + t.f * 0.5} look={HERO.look} coat={PAPER} held={cash ? <CashFan /> : undefined} {...expr} />
          )}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
