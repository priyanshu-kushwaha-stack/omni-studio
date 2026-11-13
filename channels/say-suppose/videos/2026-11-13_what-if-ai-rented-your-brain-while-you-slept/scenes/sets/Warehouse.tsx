// The warehouse by the bridge (builder C). Two sets in the library's shape (SetDef: Back, Mid, Front, spots, cameras),
// so a beat can use <SetScene set={warehouseFront} .../> or the parts in its own <Stage>:
//
//   warehouseFront   outside, side on: a corrugated wall, the roller door (rolls up: `door` 0..1) with the dark hall
//                    behind it (empty, or rows of sleepers with teal lights), a sodium lamp over the door, the clerk's
//                    spot beside it (a crate with a clipboard), a street lamp at the left, the bridge far behind.
//                    More Hours (builder B) uses it by day; The Warehouses uses it at midnight.
//   warehouseInside  inside, down the length of the hall: rows of cots going back, a sleeper on each with the band's
//                    light, a pale worker typing over each, threads of light up to the rafters, coins into a long
//                    trough at the front; the roller door shut at the far end, the clipboard desk, sodium lights.
//
// Everything is in REF coordinates (1920x1080, floor at WAREHOUSE.floor). Keep the exported names stable: B imports
// `warehouseFront` and `WAREHOUSE`.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, type Pose } from "@whatif/kit/rig/pose";
import { Deep, Floor, LIGHTS_ON, MOOD_NAMES, REF, Skyline, Sky, noise, type SetDef, type SetProps } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { INK, PAPER } from "@whatif/kit/theme";
import { CoinArc } from "../parts";
import { CLERK, GHOST, PASTELS } from "../shared";

/** Every anchor, in REF pixels. */
export const WAREHOUSE = {
  floor: 960,
  /** The roller door on the front: centre x, width, top. Its bottom is the floor. */
  door: { x: 1080, w: 560, top: 470 },
  /** The sodium lamp over the door (its bulb). */
  lamp: { x: 1080, y: 412 },
  /** The front wall's left edge (the street, the lamp and the bridge show to its left). */
  wallFrom: 420,
  /** The clerk's spot, left of the door, looking left down the queue. */
  clerk: { x: 700, y: 960, scale: 1.15, facing: -1 as const },
  /** The crate with the clipboard beside the clerk. */
  crate: { x: 800, y: 960 },
  /** Where a queue stands, left of the clerk, facing the door (x of each person's feet). */
  queue: [170, 330, 490],
  /** The street lamp at the far left (its pole's foot and the bulb). */
  streetLamp: { x: 250, y: 960, bulb: 470 },
  /** Inside: the trough the coins fall into (its top edge, from x to x). */
  trough: { y: 1000, from: -200, to: 2120 },
  /** Inside: the rafters' lowest beam, where the threads go. */
  rafter: 150,
} as const;

const SODIUM = "#ffb24a";

/** A colour lightened toward white by `k` (the ghost over a sleeper takes their head colour, lightened). */
export function lighten(hex: string, k = 0.6) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// ---------------------------------------------------------------- pieces

/** A sodium lamp: a bracket off the wall or a hanging rod, a dark shade, the orange bulb. (x, y) is the bulb. */
const SodiumLamp: React.FC<{ x: number; y: number; on: boolean; hang?: number; bracket?: 1 | -1; scale?: number }> = ({ x, y, on, hang, bracket, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {hang !== undefined && <line x1={0} y1={-hang} x2={0} y2={-24} stroke={INK} strokeWidth={5} />}
    {bracket !== undefined && <path d={`M${bracket * -110} -60 H0 V-24`} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />}
    {on && <path d="M-34 -4 L-150 230 H150 L34 -4Z" fill={SODIUM} opacity={0.12} />}
    <path d="M-46 0 Q-40 -34 0 -36 Q40 -34 46 0Z" fill="#3a3f4c" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={2} rx={22} ry={9} fill={on ? "#ffd27a" : "#6b6455"} stroke={INK} strokeWidth={3} />
  </g>
);

/** A street lamp: a tall pole with a head that leans out. (x, y) the foot, `bulb` the head's y. */
export const StreetLamp: React.FC<{ x: number; y: number; bulb: number; on: boolean; facing?: 1 | -1 }> = ({ x, y, bulb, on, facing = 1 }) => (
  <g>
    <rect x={x - 9} y={bulb - 20} width={18} height={y - bulb + 20} fill="#3a3f4c" stroke={INK} strokeWidth={4} />
    <path d={`M${x} ${bulb - 10} Q${x} ${bulb - 50} ${x + facing * 70} ${bulb - 46}`} fill="none" stroke="#3a3f4c" strokeWidth={14} strokeLinecap="round" />
    <path d={`M${x + facing * 40} ${bulb - 40} h${facing * 70} l${facing * -10} 22 h${facing * -50}Z`} fill="#3a3f4c" stroke={INK} strokeWidth={4} />
    <rect x={x + facing * 75 - 18} y={bulb - 18} width={36} height={8} rx={4} fill={on ? "#ffe6a6" : "#77705f"} />
    {on && <path d={`M${x + facing * 75 - 20} ${bulb - 12} L${x + facing * 75 - 160} ${y} H${x + facing * 75 + 160} L${x + facing * 75 + 20} ${bulb - 12}Z`} fill="#ffe6a6" opacity={0.1} />}
  </g>
);

/** The far bridge over the river: a long deck on piers, railing posts, lamps along it. Seen small, far behind. */
const FarBridge: React.FC<{ mood: MoodName; y: number }> = ({ mood, y }) => {
  const lit = LIGHTS_ON.includes(mood);
  return (
    <g>
      <rect x={-1400} y={y + 40} width={4800} height={300} fill={mood === "night" || mood === "lamp" ? "#24305a" : "#7fa6b8"} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-600 + i * 300} y={y} width={28} height={120} fill="#4b4f5e" />)}
      <rect x={-1400} y={y - 18} width={4800} height={22} fill="#5a5f70" />
      <path d={Array.from({ length: 60 }, (_, i) => `M${-1400 + i * 80} ${y - 18}v-22`).join("")} stroke="#4b4f5e" strokeWidth={5} />
      <line x1={-1400} y1={y - 40} x2={3400} y2={y - 40} stroke="#4b4f5e" strokeWidth={5} />
      {lit && Array.from({ length: 16 }, (_, i) => <circle key={i} cx={-500 + i * 240} cy={y - 52} r={6} fill="#ffe39a" />)}
    </g>
  );
};

/** The roller door's slats and drum. Open 0 (shut) to 1 (rolled up). The hall behind is drawn by the caller. */
const RollerDoor: React.FC<{ x: number; w: number; top: number; bottom: number; open: number; color?: string }> = ({ x, w, top, bottom, open, color = "#9aa4ad" }) => {
  const h = bottom - top;
  const edge = bottom - open * (h - 26);
  const slats = Math.max(0, Math.floor((edge - top - 26) / 26));
  return (
    <g>
      <rect x={x - w / 2} y={top + 26} width={w} height={edge - top - 26} fill={color} stroke={INK} strokeWidth={5} />
      <path d={Array.from({ length: slats }, (_, i) => `M${x - w / 2} ${top + 26 + (i + 1) * 26}h${w}`).join("")} stroke={INK} strokeWidth={3} opacity={0.35} />
      {open < 0.95 && <rect x={x - 40} y={edge - 22} width={80} height={12} rx={5} fill="#5a6068" stroke={INK} strokeWidth={3} />}
      <rect x={x - w / 2 - 20} y={top - 6} width={w + 40} height={36} rx={16} fill="#6b737c" stroke={INK} strokeWidth={5} />
      <rect x={x - w / 2 - 22} y={top} width={22} height={h} fill="#555c66" stroke={INK} strokeWidth={4} />
      <rect x={x + w / 2} y={top} width={22} height={h} fill="#555c66" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A canvas cot side on, with one sleeper under a blanket, the band's light on the forehead, and (`device` > 0) the
 *  pale worker typing over them at a floating desk with a thread of light up to `threadTo` (a world y). (x, y) is the
 *  cot's feet line; `s` its scale (1 = a near cot, about 300 px long). */
export const Cot: React.FC<{ x: number; y: number; s: number; head: string; device: number; frame: number; seed: number;
  threadTo?: number; empty?: boolean; band?: boolean }> = ({ x, y, s, head, device, frame, seed, threadTo, empty, band = true }) => {
  const k = (Math.sin(frame * 1.7 + seed * 2.1) + 1) / 2;
  const typing: Pose = { ...SEATED, lean: 4, tilt: 4, armF: [64 + k * 6, 44 - k * 4], armB: [56 - k * 5, 48 + k * 4] };
  const light = { x: -96, y: -128 };
  const lit = device > 0.05 && band;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* the legs (crossed, like a camp cot) and the canvas */}
      <path d="M-120 0 L-60 -58 M-60 0 L-120 -58 M120 0 L60 -58 M60 0 L120 -58" stroke="#3b3e47" strokeWidth={7} strokeLinecap="round" />
      <rect x={-150} y={-70} width={300} height={20} rx={8} fill="#6f7d5c" stroke={INK} strokeWidth={4} />
      {!empty && (
        <g>
          <ellipse cx={-112} cy={-78} rx={42} ry={14} fill="#e9dcc4" stroke={INK} strokeWidth={3} />
          <path d="M-70 -66 C-62 -112 -20 -118 20 -104 C60 -92 100 -100 140 -84 L146 -66Z" fill={["#3e5c8f", "#7a4f6a", "#4f6f5a", "#8a6a3a"][seed % 4]} stroke={INK} strokeWidth={4} />
          <circle cx={-104} cy={-112} r={34} fill={head} stroke={INK} strokeWidth={2} />
          <path d="M-118 -110 q6 5 12 0 M-96 -110 q6 5 12 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          {band && <path d="M-136 -126 Q-104 -142 -72 -128" fill="none" stroke="#1b1d24" strokeWidth={6} strokeLinecap="round" />}
          {band && <circle cx={light.x} cy={light.y - 7} r={6} fill={lit ? GHOST.light : "#2a3a3a"} stroke="#1b1d24" strokeWidth={2} />}
        </g>
      )}
      {lit && !empty && (
        <g opacity={device}>
          {threadTo !== undefined && (
            <path d={`M${light.x} ${light.y - 7} C${light.x - 20} ${light.y - 160} ${light.x + 40} ${(threadTo - y) / s + 200} ${light.x + 30} ${(threadTo - y) / s}`}
              fill="none" stroke={GHOST.light} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" opacity={0.75} />
          )}
          <circle cx={30} cy={-250} r={120} fill="#cfefff" opacity={0.1} />
          {/* the floating chair, the desk with its laptop, the worker */}
          <rect x={-40} y={-232} width={64} height={10} rx={4} fill={GHOST.scarf} stroke={INK} strokeWidth={3} />
          <rect x={30} y={-262} width={130} height={10} rx={4} fill={GHOST.scarf} stroke={INK} strokeWidth={3} />
          <path d="M70 -262 L62 -318 H130 L136 -262Z" fill="#bff4ff" stroke={INK} strokeWidth={3} />
          <Figure x={-8} y={-150} scale={0.68} pose={typing} head={lighten(head, 0.62)} scarf={GHOST.scarf} eyes={1.1} brows="worry"
            mouth="o" look={{ x: 0.9, y: 0.35 }} />
        </g>
      )}
    </g>
  );
};

/** A row of cots across the hall at feet line `y`, scale `s`, every `gap` px from `from` to `to`. */
const CotRow: React.FC<{ y: number; s: number; gap: number; from: number; to: number; seed: number; device: number;
  frame: number; empty?: boolean }> = ({ y, s, gap, from, to, seed, device, frame, empty }) => (
  <g>
    {Array.from({ length: Math.floor((to - from) / gap) + 1 }, (_, i) => {
      const n = seed * 17 + i;
      const on = device * (noise(n) < 0.08 ? 0 : 1);
      return <Cot key={i} x={from + i * gap + (noise(n + 3) - 0.5) * gap * 0.12} y={y} s={s} head={PASTELS[Math.floor(noise(n + 1) * PASTELS.length)]}
        device={on} frame={frame} seed={n} threadTo={WAREHOUSE.rafter} empty={empty} />;
    })}
  </g>
);

// ---------------------------------------------------------------- outside

export interface WarehouseFrontOptions {
  /** The roller door: 0 shut, 1 rolled up. */
  door: number;
  /** What shows through the open door: the dark empty hall, cots going in (no sleepers), or the rows of sleepers. */
  inside: "empty" | "cots" | "sleepers";
  /** The crate with the clipboard by the door (the clerk's spot). */
  crate: boolean;
  /** The street lamp at the left. */
  streetLamp: boolean;
}

const FrontBack: React.FC<SetProps<WarehouseFrontOptions>> = ({ cam, mood, frame, options }) => {
  const on = LIGHTS_ON.includes(mood);
  const D = WAREHOUSE.door;
  const F = WAREHOUSE.floor;
  const wallTop = 300;
  const dark = mood === "night" || mood === "lamp";
  const wall = dark ? "#5d6a78" : mood === "dusk" ? "#8a8fa0" : "#a9b4bd";
  return (
    <>
      <Deep cam={cam} depth={0.3} flat>
        <Sky id="wh-front" mood={mood} x={-1400} y={-700} w={4800} h={1300} sunAt={{ x: 260, y: 140 }} />
      </Deep>
      <Deep cam={cam} depth={0.42} flat>
        <Skyline mood={mood} from={-1200} to={3200} base={560} tall={260} seed={4} />
      </Deep>
      <Deep cam={cam} depth={0.5} flat>
        <FarBridge mood={mood} y={560} />
      </Deep>
      <Deep cam={cam} depth={0.95}>
        {/* the corrugated wall, the roof edge and a blank plate over the door (bars, never letters) */}
        <rect x={WAREHOUSE.wallFrom} y={wallTop} width={2600} height={F - wallTop + 10} fill={wall} stroke={INK} strokeWidth={6} />
        <path d={Array.from({ length: 70 }, (_, i) => `M${WAREHOUSE.wallFrom + 18 + i * 38} ${wallTop + 30}V${F}`).join("")} stroke={INK} strokeWidth={3} opacity={0.22} />
        <rect x={WAREHOUSE.wallFrom - 30} y={wallTop - 34} width={2700} height={40} rx={6} fill="#4d545e" stroke={INK} strokeWidth={6} />
        <rect x={D.x - 170} y={wallTop + 40} width={340} height={64} rx={6} fill={PAPER} stroke={INK} strokeWidth={5} />
        <rect x={D.x - 130} y={wallTop + 62} width={150} height={18} rx={9} fill={INK} opacity={0.75} />
        <rect x={D.x + 36} y={wallTop + 62} width={90} height={18} rx={9} fill={INK} opacity={0.75} />
        {/* the hall behind the door */}
        <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={F - D.top} fill={dark ? "#141726" : "#262a36"} />
        <clipPath id="wh-front-door"><rect x={D.x - D.w / 2} y={D.top} width={D.w} height={F - D.top} /></clipPath>
        <g clipPath="url(#wh-front-door)">
          <SodiumLamp x={D.x - 120} y={D.top + 120} on hang={200} scale={0.6} />
          <SodiumLamp x={D.x + 160} y={D.top + 130} on hang={200} scale={0.6} />
          {options.inside !== "empty" && (
            <>
              <CotRow y={F - 170} s={0.34} gap={120} from={D.x - D.w / 2 - 40} to={D.x + D.w / 2 + 40} seed={1}
                device={options.inside === "sleepers" ? 1 : 0} frame={frame} empty={options.inside === "cots"} />
              <CotRow y={F - 40} s={0.5} gap={190} from={D.x - D.w / 2 + 20} to={D.x + D.w / 2 + 40} seed={2}
                device={options.inside === "sleepers" ? 1 : 0} frame={frame} empty={options.inside === "cots"} />
            </>
          )}
        </g>
        <RollerDoor x={D.x} w={D.w} top={D.top} bottom={F} open={options.door} />
        <SodiumLamp x={WAREHOUSE.lamp.x} y={WAREHOUSE.lamp.y} on={on} bracket={1} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={F} fill={dark ? "#4a4d57" : "#9a958c"} gap={220} slant={-90} />
        <rect x={-1400} y={F - 4} width={4800} height={14} fill="#6d6a64" />
        {options.streetLamp && <StreetLamp x={WAREHOUSE.streetLamp.x} y={F} bulb={WAREHOUSE.streetLamp.bulb} on={on} />}
        {options.crate && (
          <g>
            <rect x={WAREHOUSE.crate.x - 50} y={F - 96} width={100} height={96} fill="#b08a5a" stroke={INK} strokeWidth={5} />
            <path d={`M${WAREHOUSE.crate.x - 50} ${F - 48}h100M${WAREHOUSE.crate.x - 50} ${F - 96}l100 96`} stroke={INK} strokeWidth={3} opacity={0.5} />
            <rect x={WAREHOUSE.crate.x - 26} y={F - 112} width={52} height={18} rx={3} fill="#c9a36b" stroke={INK} strokeWidth={3} transform={`rotate(-8 ${WAREHOUSE.crate.x} ${F - 104})`} />
          </g>
        )}
      </Deep>
    </>
  );
};

export const warehouseFront: SetDef<WarehouseFrontOptions> = {
  name: "warehouse-front",
  about: "the warehouse by the bridge from the street: corrugated wall, roller door (open or shut), sodium lamp, the clerk's crate, a street lamp, the far bridge",
  spots: {
    clerk: WAREHOUSE.clerk,
    q1: { x: WAREHOUSE.queue[2], y: WAREHOUSE.floor, scale: 1.1, facing: 1 },
    q2: { x: WAREHOUSE.queue[1], y: WAREHOUSE.floor, scale: 1.1, facing: 1 },
    q3: { x: WAREHOUSE.queue[0], y: WAREHOUSE.floor, scale: 1.1, facing: 1 },
    door: { x: WAREHOUSE.door.x, y: WAREHOUSE.floor, scale: 1.1, facing: 1 },
  },
  cameras: {
    wide: REF,
    door: { x: WAREHOUSE.door.x - 80, y: 700, zoom: 1.6 },
    clerk: { x: WAREHOUSE.clerk.x - 120, y: 720, zoom: 2.0 },
  },
  lights: () => [
    { x: WAREHOUSE.lamp.x, y: WAREHOUSE.lamp.y + 10, depth: 0.95, r: 460, color: SODIUM, strength: 0.55, moods: LIGHTS_ON },
    { x: WAREHOUSE.streetLamp.x + 75, y: WAREHOUSE.streetLamp.bulb, r: 380, color: "#ffe6a6", strength: 0.45, moods: LIGHTS_ON },
  ],
  defaults: { door: 0.85, inside: "sleepers", crate: true, streetLamp: true },
  Back: FrontBack,
  example: {
    camera: "wide",
    cast: [
      { spot: "clerk", who: { ...CLERK, look: { x: 0.9, y: 0 } } },
      { spot: "q1", who: { head: PASTELS[0], coat: "#3f4a5c", look: { x: 0.9, y: 0 } } },
      { spot: "q2", who: { head: PASTELS[2], coat: "#5a4a3f", look: { x: 0.9, y: 0 } } },
    ],
  },
};

// ---------------------------------------------------------------- inside

export interface WarehouseInsideOptions {
  /** The rule device over every cot, 0..1 (the workers rise, the threads and the lights). */
  device: number;
  /** Coins from the front row's desks into the trough, from this frame (null: none). */
  coinsFrom: number | null;
  /** The front row of cots (in the actors' plane). Off for a shot that puts its own people there. */
  frontRow: boolean;
}

const ROWS = [
  { depth: 0.5, y: 650, s: 0.3, gap: 118, from: -500, to: 2500 },
  { depth: 0.6, y: 700, s: 0.38, gap: 150, from: -450, to: 2450 },
  { depth: 0.72, y: 770, s: 0.5, gap: 196, from: -420, to: 2400 },
  { depth: 0.86, y: 870, s: 0.7, gap: 270, from: -380, to: 2350 },
];
const FRONT_ROW = { y: 1010, s: 1.0, gap: 400, from: -120, to: 2100 };

const InsideBack: React.FC<SetProps<WarehouseInsideOptions>> = ({ cam, frame, options }) => (
  <>
    <Deep cam={cam} depth={0.42} flat>
      {/* the far wall, the high windows, the shut roller door at the far end and the clipboard desk */}
      <rect x={-1400} y={-800} width={4800} height={1500} fill="#3e4654" />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-600 + i * 230} y={250} width={150} height={70} rx={4} fill="#1d2440" stroke={INK} strokeWidth={4} />)}
      <RollerDoor x={960} w={420} top={400} bottom={660} open={0} color="#7f8992" />
      <rect x={1380} y={600} width={160} height={14} fill="#6b4b3a" stroke={INK} strokeWidth={3} />
      <rect x={1390} y={614} width={10} height={46} fill="#6b4b3a" /><rect x={1520} y={614} width={10} height={46} fill="#6b4b3a" />
      <rect x={1420} y={584} width={34} height={18} rx={3} fill="#c9a36b" stroke={INK} strokeWidth={2} />
      <path d="M1500 600 l10 -40 l20 0" fill="none" stroke={INK} strokeWidth={3} />
      <rect x={-1400} y={655} width={4800} height={1000} fill="#5a5e66" />
    </Deep>
    <Deep cam={cam} depth={0.55} flat>
      {/* the rafters: two beams and a lattice */}
      <rect x={-1400} y={WAREHOUSE.rafter - 70} width={4800} height={20} fill="#2c313c" />
      <rect x={-1400} y={WAREHOUSE.rafter} width={4800} height={16} fill="#2c313c" />
      <path d={Array.from({ length: 50 }, (_, i) => `M${-1400 + i * 100} ${WAREHOUSE.rafter}l50 -50l50 50`).join("")} fill="none" stroke="#2c313c" strokeWidth={6} />
      {[-200, 300, 760, 1200, 1660, 2100].map((x) => <SodiumLamp key={x} x={x} y={WAREHOUSE.rafter + 150} on hang={140} scale={0.7} />)}
    </Deep>
    {ROWS.map((r, i) => (
      <Deep key={i} cam={cam} depth={r.depth} flat={i < 2}>
        <rect x={-1400} y={r.y - 6} width={4800} height={10} fill="#000" opacity={0.08} />
        <CotRow y={r.y} s={r.s} gap={r.gap} from={r.from} to={r.to} seed={i + 3} device={options.device} frame={frame} />
      </Deep>
    ))}
  </>
);

/** The front row of cots in the actors' plane, and the coins from its desks. */
const InsideMid: React.FC<SetProps<WarehouseInsideOptions>> = ({ frame, options }) => {
  if (!options.frontRow) return null;
  const n = Math.floor((FRONT_ROW.to - FRONT_ROW.from) / FRONT_ROW.gap) + 1;
  return (
    <g>
      <CotRow y={FRONT_ROW.y} s={FRONT_ROW.s} gap={FRONT_ROW.gap} from={FRONT_ROW.from} to={FRONT_ROW.to} seed={9} device={options.device} frame={frame} />
      {options.coinsFrom !== null && Array.from({ length: n }, (_, i) => {
        const x = FRONT_ROW.from + i * FRONT_ROW.gap;
        return <CoinArc key={i} frame={frame} start={options.coinsFrom! + i * 4} from={{ x: x + 150, y: FRONT_ROW.y - 262 }}
          via={{ x: x + 260, y: FRONT_ROW.y - 360 }} to={{ x: x + 230, y: WAREHOUSE.trough.y + 20 }} every={14} fall={22} r={14} />;
      })}
    </g>
  );
};

/** The long steel trough along the front, catching the coins. */
const InsideFront: React.FC<SetProps<WarehouseInsideOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.08}>
    <path d={`M${WAREHOUSE.trough.from} ${WAREHOUSE.trough.y} H${WAREHOUSE.trough.to} L${WAREHOUSE.trough.to - 30} ${WAREHOUSE.trough.y + 70} H${WAREHOUSE.trough.from + 30}Z`}
      fill="#8d96a0" stroke={INK} strokeWidth={6} />
    <rect x={WAREHOUSE.trough.from} y={WAREHOUSE.trough.y - 8} width={WAREHOUSE.trough.to - WAREHOUSE.trough.from} height={14} rx={6} fill="#b5bec7" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 40 }, (_, i) => (
      <ellipse key={i} cx={WAREHOUSE.trough.from + 40 + i * 58 + noise(i) * 20} cy={WAREHOUSE.trough.y + 4 - noise(i + 9) * 6} rx={16} ry={6} fill="#ffd36b" stroke={INK} strokeWidth={2} />
    ))}
  </Deep>
);

export const warehouseInside: SetDef<WarehouseInsideOptions> = {
  name: "warehouse-inside",
  about: "inside the warehouse: rows of cots going back, a sleeper and a pale typing worker on each, threads to the rafters, coins into a trough",
  spots: {
    /** Someone walking the aisle between the front row and the trough. */
    aisle: { x: 960, y: 1050, scale: 1.1, facing: 1 },
  },
  cameras: {
    wide: REF,
    rows: { x: 960, y: 640, zoom: 1.45 },
    rafters: { x: 960, y: 380, zoom: 1.25 },
    near: { x: 300, y: 860, zoom: 2.0 },
  },
  lights: () => [
    ...[300, 760, 1200, 1660].map((x) => ({ x, y: WAREHOUSE.rafter + 150, depth: 0.55, r: 300, color: SODIUM, strength: 0.4, moods: MOOD_NAMES })),
    { x: 960, y: 560, depth: 0.72, r: 900, color: "#bff4ff", strength: 0.25, moods: MOOD_NAMES },
  ],
  defaults: { device: 1, coinsFrom: 0, frontRow: true },
  Back: InsideBack,
  Mid: InsideMid,
  Front: InsideFront,
  example: { camera: "wide", cast: [] },
};
