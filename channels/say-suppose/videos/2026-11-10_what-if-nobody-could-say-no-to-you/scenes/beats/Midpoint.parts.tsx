// Helpers for "The midpoint: the proof" (Midpoint.tsx): your room at night with the week's YES tags on a string like
// fairy lights, the paper of three needs, your flat (the dinner table, the sink, the sofa and the door), the salt, Dev's
// bag, the chai man for the montage and the SUBSCRIBE tag for the metro ad frame. World coordinates for a <Stage> slot.
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { joints, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { headAt, YesTag } from "../parts";
import { noise, PASTELS } from "../shared";
import { Chair, Deep } from "../sets/common";

// ------------------------------------------------------------------------------------------------ your room

/** Your room: you sit on the floor in front of the low bed, facing right; the string runs along the wall above. */
export const ROOM = {
  floor: 960,
  you: { x: 760 },
  /** The string's pins (it sags between them) and how far it sags. */
  pins: [140, 660, 1180, 1700],
  pinY: 300,
  sag: 80,
  /** The paper of three needs, pinned on the wall under the string. */
  sheet: { x: 1330, y: 640, w: 620, h: 330 },
} as const;

/** The string's y at a world x (a sag between each pair of pins). */
export function stringY(x: number) {
  const p = ROOM.pins;
  for (let i = 0; i < p.length - 1; i++) {
    if (x >= p[i] && x <= p[i + 1]) return ROOM.pinY + ROOM.sag * Math.sin(((x - p[i]) / (p[i + 1] - p[i])) * Math.PI);
  }
  return ROOM.pinY;
}

/** The week's tags along the string: x positions (not on the pins). */
export const TAGS_X = [250, 360, 470, 560, 770, 880, 990, 1080, 1290, 1400, 1510, 1600];

export const RoomBack: React.FC<{ cam: Camera }> = ({ cam }) => (
  <>
    <Deep cam={cam} depth={0.5} flat>
      <rect x={-1400} y={-800} width={4800} height={1720} fill="#3d4670" />
      <rect x={-1400} y={700} width={4800} height={220} fill="#353d63" />
      {/* the window on the city at night */}
      <rect x={1700} y={420} width={300} height={260} rx={8} fill="#141a33" stroke="#2a2f4a" strokeWidth={14} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={1720 + (i % 5) * 52} y={460 + Math.floor(i / 5) * 90} width={26} height={30} fill="#f5d98a" opacity={noise(i + 4) > 0.45 ? 0.8 : 0.12} />)}
      <path d="M1850 420 V680 M1700 550 H2000" stroke="#2a2f4a" strokeWidth={10} />
      <rect x={-300} y={420} width={260} height={340} rx={6} fill="#5a6488" opacity={0.6} />
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={ROOM.floor - 20} width={4800} height={700} fill="#4a3f52" />
      {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-1400 + i * 200} y1={ROOM.floor - 20} x2={-1400 + i * 200} y2={1700} stroke="#000" strokeWidth={3} opacity={0.12} />)}
      {/* the low bed behind you, a pillow, a crumpled sheet */}
      <rect x={160} y={830} width={560} height={130} rx={18} fill="#6b7aa8" stroke={INK} strokeWidth={5} />
      <rect x={160} y={800} width={560} height={50} rx={22} fill="#e6e1d6" stroke={INK} strokeWidth={5} />
      <ellipse cx={250} cy={790} rx={80} ry={30} fill="#f3e9d7" stroke={INK} strokeWidth={5} />
    </Deep>
  </>
);

/** The string of the week's YES tags. `lit(i)` 0..1 lights tag i (a warm glow behind it); unlit tags hang dim. */
export const TagString: React.FC<{ frame: number; lit: (i: number) => number }> = ({ frame, lit }) => {
  const xs = Array.from({ length: 61 }, (_, i) => ROOM.pins[0] + (i / 60) * (ROOM.pins[3] - ROOM.pins[0]));
  const r = 40, h = r * 0.95;
  return (
    <g>
      <defs>
        <radialGradient id="mid-bulb">
          <stop offset="0%" stopColor="#ffe9a8" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#ffe9a8" stopOpacity={0} />
        </radialGradient>
      </defs>
      {TAGS_X.map((x, i) => <circle key={`g${i}`} cx={x} cy={stringY(x) + 50} r={95} fill="url(#mid-bulb)" opacity={lit(i)} />)}
      <polyline points={xs.map((x) => `${x},${stringY(x)}`).join(" ")} fill="none" stroke="#1b1d24" strokeWidth={4} />
      {ROOM.pins.map((x) => <circle key={x} cx={x} cy={ROOM.pinY} r={9} fill={MUSTARD} stroke={INK} strokeWidth={3} />)}
      {TAGS_X.map((x, i) => {
        const sy = stringY(x);
        const headY = sy + 0.45 * h + r + 1.55 * h;
        const sway = Math.sin(frame / 23 + i * 1.7) * 3;
        return (
          <g key={i} opacity={0.55 + 0.45 * lit(i)}>
            <YesTag frame={frame} at={-100} x={x} headY={headY} r={r} tilt={-4 + (noise(i) - 0.5) * 10 + sway} />
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the paper of needs

export interface NeedCues { alone: number; hand: number; pair: number; light: number }

const Badge: React.FC<{ cx: number; at: number; lit?: number; children: React.ReactNode }> = ({ cx, at, lit = 0, children }) => (
  <g>
    {lit > 0 && <circle cx={cx} cy={170} r={96 + 6 * lit} fill={MUSTARD} opacity={0.85 * lit} />}
    <DrawLine d={`M${cx} 82 A88 88 0 1 1 ${cx - 0.1} 82`} from={at} to={at + 14} color={INK} width={6} />
    {children}
  </g>
);

/** Three needs, drawn in the sheet's coordinates (w 620, h 330): a hand (feeling capable), two figures side by side
 *  (feeling close), one figure walking alone (choosing for yourself), which lights up at `light`. */
export const NeedsPaper: React.FC<{ frame: number; c: NeedCues }> = ({ frame, c }) => {
  const lit = interpolate(frame, [c.light, c.light + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stick = (x: number, y: number, at: number, step = 0) =>
    `M${x} ${y + 22} V${y + 72} M${x} ${y + 72} L${x - 16 - step} ${y + 112} M${x} ${y + 72} L${x + 16 + step} ${y + 112} M${x} ${y + 36} L${x - 20} ${y + 64} M${x} ${y + 36} L${x + 20} ${y + 64}`;
  return (
    <g>
      <Badge cx={110} at={c.hand}>
        <DrawLine d="M80 230 V150 M100 230 V128 M120 230 V126 M140 230 V138 M80 230 Q110 250 140 230 M80 196 Q60 180 58 160" from={c.hand + 6} to={c.hand + 24} color={INK} width={10} />
      </Badge>
      <Badge cx={310} at={c.pair}>
        {frame >= c.pair + 6 && <><circle cx={282} cy={118} r={20} fill="none" stroke={INK} strokeWidth={6} /><circle cx={338} cy={118} r={20} fill="none" stroke={INK} strokeWidth={6} /></>}
        <DrawLine d={stick(282, 116, c.pair) + " " + stick(338, 116, c.pair)} from={c.pair + 6} to={c.pair + 22} color={INK} width={6} />
        <DrawLine d="M302 152 H318" from={c.pair + 18} to={c.pair + 24} color={INK} width={6} />
      </Badge>
      <Badge cx={510} at={c.alone} lit={lit}>
        {frame >= c.alone + 6 && <circle cx={510} cy={118} r={20} fill="none" stroke={INK} strokeWidth={6} />}
        <DrawLine d={stick(510, 116, c.alone, 10)} from={c.alone + 6} to={c.alone + 22} color={INK} width={6} />
        <DrawLine d="M450 252 H570" from={c.alone + 16} to={c.alone + 26} color={INK} width={4} />
      </Badge>
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ your flat

/** The flat's dinner table, side on: you at the left end, Dev at the right end, three friends behind it. */
export const FLAT = {
  floor: 960,
  seat: 893,
  you: 660,
  dev: 1260,
  behind: [{ x: 830, head: PASTELS[0], facing: 1 }, { x: 960, head: PASTELS[6], facing: -1 }, { x: 1090, head: PASTELS[4], facing: -1 }],
  table: { from: 720, to: 1200, top: 840 },
  salt: { x: 960, y: 838 },
  /** The kitchen corner and the room ("later"): the sink, the sofa arm Dev perches on, the door. */
  sink: { x: 420, top: 800 },
  sofa: { from: 1120, to: 1560, arm: 1150, armTop: 850 },
  door: { x: 1790 },
} as const;

export const FlatBack: React.FC<{ cam: Camera; view: "table" | "room" }> = ({ cam, view }) => (
  <>
    <Deep cam={cam} depth={0.5} flat>
      <rect x={-1400} y={-800} width={4800} height={1720} fill="#d9a878" />
      <rect x={-1400} y={640} width={4800} height={280} fill="#c99868" />
      <rect x={-1400} y={632} width={4800} height={10} fill="#a57850" />
      <rect x={1380} y={220} width={300} height={280} rx={8} fill="#1d2440" stroke="#7a5a40" strokeWidth={14} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={1410 + (i % 3) * 90} y={260 + Math.floor(i / 3) * 110} width={30} height={34} fill="#f5d98a" opacity={noise(i + 2) > 0.5 ? 0.8 : 0.15} />)}
      <rect x={240} y={250} width={180} height={220} rx={4} fill="#3d8a80" stroke="#7a5a40" strokeWidth={10} />
      <circle cx={330} cy={340} r={50} fill="#f2b632" opacity={0.7} />
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={FLAT.floor - 20} width={4800} height={700} fill="#7a5238" />
      {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-1400 + i * 200} y1={FLAT.floor - 20} x2={-1400 + i * 200} y2={1700} stroke="#000" strokeWidth={3} opacity={0.12} />)}
      {view === "table" && (
        <g>
          <line x1={960} y1={-400} x2={960} y2={330} stroke="#2a1c18" strokeWidth={5} />
          <path d="M920 330 L860 390 H1060 L1000 330Z" fill="#e6d7b6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={960} cy={392} rx={40} ry={14} fill="#fff3c4" />
        </g>
      )}
      {view === "room" && (
        <g>
          {/* the kitchen counter and sink at the left */}
          <rect x={-200} y={FLAT.sink.top} width={760} height={FLAT.floor - FLAT.sink.top} fill="#e6e1d6" stroke={INK} strokeWidth={5} />
          <rect x={-220} y={FLAT.sink.top - 18} width={800} height={22} rx={4} fill="#8a92a2" stroke={INK} strokeWidth={4} />
          <path d={`M${FLAT.sink.x - 60} ${FLAT.sink.top - 18} V${FLAT.sink.top - 120} Q${FLAT.sink.x - 60} ${FLAT.sink.top - 150} ${FLAT.sink.x - 20} ${FLAT.sink.top - 150} H${FLAT.sink.x}`}
            fill="none" stroke="#9aa1ab" strokeWidth={10} strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={180} cy={FLAT.sink.top - 24 - i * 12} rx={60} ry={8} fill="#c9ced6" stroke={INK} strokeWidth={3} />)}
          {/* the door at the right */}
          <rect x={FLAT.door.x - 110} y={420} width={220} height={FLAT.floor - 440} fill="#8a5c3b" stroke={INK} strokeWidth={6} />
          <circle cx={FLAT.door.x - 70} cy={700} r={10} fill="#e8c23a" />
        </g>
      )}
    </Deep>
  </>
);

/** The sofa for the actors' slot, before whoever sits on it: its back, cushions and the arm at the left end. */
export const Sofa: React.FC = () => {
  const s = FLAT.sofa;
  return (
    <g>
      <rect x={s.from} y={700} width={s.to - s.from} height={200} rx={30} fill="#5a7a9a" stroke={INK} strokeWidth={5} />
      <rect x={s.from + 40} y={820} width={s.to - s.from - 60} height={60} rx={16} fill="#6a8aaa" stroke={INK} strokeWidth={4} />
      <rect x={s.arm - 40} y={s.armTop} width={90} height={FLAT.floor - s.armTop - 20} rx={22} fill="#4a6a8a" stroke={INK} strokeWidth={5} />
      <rect x={s.from + 20} y={900} width={16} height={50} fill="#3b3e47" /><rect x={s.to - 36} y={900} width={16} height={50} fill="#3b3e47" />
    </g>
  );
};

/** The flat's table for the actors' slot: plates, glasses and the salt, which tips over by `tip` (0..1) and spills. */
export const FlatTable: React.FC<{ tip: number; plates?: boolean }> = ({ tip, plates = true }) => {
  const t = FLAT.table, s = FLAT.salt;
  return (
    <g>
      <rect x={t.from} y={t.top} width={t.to - t.from} height={20} rx={6} fill="#a8703f" stroke={INK} strokeWidth={5} />
      <rect x={t.from + 20} y={t.top + 20} width={14} height={FLAT.floor - t.top - 20} fill="#7a5032" />
      <rect x={t.to - 34} y={t.top + 20} width={14} height={FLAT.floor - t.top - 20} fill="#7a5032" />
      {plates && [800, 1120].map((x) => <ellipse key={x} cx={x} cy={t.top - 2} rx={44} ry={8} fill="#f3e9d7" stroke={INK} strokeWidth={3} />)}
      {plates && [880, 1045].map((x) => <rect key={x} x={x - 12} y={t.top - 40} width={24} height={40} rx={4} fill="#cfe6ec" opacity={0.85} stroke={INK} strokeWidth={3} />)}
      {tip > 0.3 && Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={s.x + 18 + noise(i) * 70 * tip} cy={t.top - 2 - noise(i + 9) * 4} r={3} fill="#ffffff" stroke="#9aa1ab" strokeWidth={1} />
      ))}
      <g transform={`rotate(${tip * 88} ${s.x + 14} ${s.y})`}>
        <path d={`M${s.x - 14} ${s.y} L${s.x - 12} ${s.y - 44} H${s.x + 12} L${s.x + 14} ${s.y}Z`} fill="#f6f6f2" stroke={INK} strokeWidth={3} />
        <path d={`M${s.x - 12} ${s.y - 44} Q${s.x} ${s.y - 60} ${s.x + 12} ${s.y - 44}Z`} fill="#9aa1ab" stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

/** A messenger bag on a figure: the strap from the shoulder across, the bag at the far hip. Draw AFTER the figure. */
export const Bag: React.FC<{ x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }> = ({ x, y, scale, pose, facing }) => {
  const j = joints(pose);
  const nx = x + j.neck.x * scale * facing, ny = y + j.neck.y * scale;
  const hx = x + j.hip.x * scale * facing, hy = y + j.hip.y * scale;
  return (
    <g>
      <path d={`M${nx + facing * 14 * scale} ${ny + 6 * scale} L${hx - facing * 28 * scale} ${hy - 6 * scale}`} stroke="#5a3d2a" strokeWidth={8 * scale} strokeLinecap="round" />
      <rect x={hx - facing * 28 * scale - 34 * scale} y={hy - 30 * scale} width={68 * scale} height={52 * scale} rx={10 * scale} fill="#8a5c3b" stroke={INK} strokeWidth={4 * scale} />
      <rect x={hx - facing * 28 * scale - 34 * scale} y={hy - 30 * scale} width={68 * scale} height={18 * scale} rx={8 * scale} fill="#6b4530" />
    </g>
  );
};

/** A seated friend at the flat (pastel head). */
export const Friend: React.FC<{ x: number; y: number; scale: number; facing: 1 | -1; head: string; pose: Pose; frame: number; look?: { x: number; y: number }; mouth?: "smile" | "flat" | "open" }> = ({
  x, y, scale, facing, head, pose, frame, look = { x: 0.8, y: 0.2 }, mouth = "smile",
}) => (
  <>
    <Chair x={x} y={y - 112 * scale} scale={scale} facing={facing} color="#7a5238" />
    <Figure x={x} y={y} scale={scale} facing={facing} pose={pose} head={head} look={look} mouth={mouth} blink={(frame + x) % 89 < 4} time={frame} />
  </>
);

// ------------------------------------------------------------------------------------------------ the montage and the metro

/** The chai man (as FirstJump draws him): a peach head, a white vest, a red cloth on his shoulder, a moustache. */
export const ChaiMan: React.FC<{ x: number; y: number; scale: number; pose: Pose; frame: number; face: object }> = ({ x, y, scale, pose, frame, face }) => {
  const h = headAt(x, y, scale, pose, -1);
  return (
    <>
      <Figure x={x} y={y} scale={scale} facing={-1} pose={pose} head="#f0a882" coat="#f1ece0" look={{ x: 0.9, y: 0.1 }} {...face} blink={(frame + 30) % 97 < 4} time={frame} />
      <path d={`M${h.x - 22 * scale} ${h.y + 12 * scale} Q${h.x - 10 * scale} ${h.y + 4 * scale} ${h.x} ${h.y + 12 * scale} Q${h.x + 4 * scale} ${h.y + 4 * scale} ${h.x + 8 * scale} ${h.y + 12 * scale}`}
        fill="none" stroke={INK} strokeWidth={6 * scale} strokeLinecap="round" />
      <rect x={h.x + 40 * scale - 14 * scale} y={h.y + h.r * 1.05} width={28 * scale} height={60 * scale} rx={6} fill="#d8344f" stroke={INK} strokeWidth={3} />
    </>
  );
};

/** A folded note (a small paper square with a crease), centred at (x, y). */
export const FoldedNote: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = -10 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M-22 -14 H22 V14 H-22Z" fill={PAPER} stroke={INK} strokeWidth={3} />
    <path d="M-22 -14 L0 2 L22 -14" fill="none" stroke="#cdbfa6" strokeWidth={2.5} />
  </g>
);

/** The SUBSCRIBE tag where the ad should be: a small cream tag with a bell, filling an ad frame centred at (x, y). */
export const SubscribeTag: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => {
  const ring = Math.sin(frame / 7) * 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(-2)`}>
      <rect x={-150} y={-30} width={300} height={60} rx={10} fill={PAPER} stroke={INK} strokeWidth={4} />
      <g transform={`translate(-118 0) rotate(${ring} 0 -14)`}>
        <path d="M-12 8 Q-12 -14 0 -16 Q12 -14 12 8 Z" fill={MUSTARD} stroke={INK} strokeWidth={3} />
        <circle cx={0} cy={11} r={4} fill={INK} />
      </g>
      <text x={14} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={INK} letterSpacing={2}>SUBSCRIBE</text>
    </g>
  );
};
