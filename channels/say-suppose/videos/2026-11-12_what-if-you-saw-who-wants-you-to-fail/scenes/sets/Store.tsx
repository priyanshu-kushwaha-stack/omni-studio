// The convenience store by the academies (scene_plan.md, "Shared sets"; owner: builder A), side on, drawn for the REF
// camera (sets/common.tsx): fluorescent white inside, the dark street through the glass front at the left (the door,
// and a blue crate by it for the cat), the triangle-kimbap chiller, the drinks fridge, and the counter at the right
// with the clerk's spot behind it.
//
// Usage:
//   back={<StoreBack cam={cam} mood={mood} frame={frame} />}
//   actors: the clerk FIRST (at STORE.clerk, behind the counter), then <StoreCounter />, then the customers
//           (STORE.customer at the counter, STORE.door by the door) and <Cat {...STORE.cat} frame={frame} />.
//   front={<StoreFront cam={cam} />} (optional: a near shelf end at the left edge, for over-the-shoulder shots).
//   The light: wrap the <Stage> in <LookContext.Provider value={storeLook(mood, cam)}> so the inside reads fluorescent
//   white even at night (the night grade alone turns it blue).
// Typical cameras: STORE_CAMS.wide (REF), .counter (Min-jun at the counter), .door (you by the door), .kimbap (the
// chiller insert), .crate (the cat).
import { Easing, interpolate } from "remotion";
import type { Camera } from "@whatif/kit/stage/Stage";
import { setLook, OUTSIDE, Sky, Skyline, type SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { INK, PAPER } from "@whatif/kit/theme";
import { noise } from "../shared";
import { Deep, REF } from "./common";

/** Named points in the store, world units at REF. Figures stand at scale STORE.scale on STORE.floor. */
export const STORE = {
  /** Feet line inside the store. */
  floor: 960,
  /** The figure scale for this set's spots. */
  scale: 1.15,
  /** The counter: front from x `from` to `to`, top at y `top`. */
  counter: { from: 1380, to: 1900, top: 760 },
  /** Where on the counter something is put down (a kimbap, a coin). */
  counterTop: { x: 1460, y: 752 },
  /** The till's screen on the counter. */
  till: { x: 1760, y: 700 },
  /** The clerk behind the counter, facing the customers (-1). Draw before <StoreCounter>. */
  clerk: { x: 1700, y: 960, scale: 1.15, facing: -1 as const },
  /** A customer at the counter, facing the clerk (1). Min-jun's place. */
  customer: { x: 1240, y: 960, scale: 1.15, facing: 1 as const },
  /** By the door, facing into the store (1). Your place. */
  door: { x: 620, y: 960, scale: 1.15, facing: 1 as const },
  /** The glass door in the shop front (its opening), and the handle. */
  doorway: { from: 300, to: 520, top: 380, handle: { x: 500, y: 690 } },
  /** The blue crate by the door: its top centre. */
  crate: { x: 190, y: 872 },
  /** The cat on the crate: <Cat {...STORE.cat} frame={frame} />. */
  cat: { x: 190, y: 872, scale: 1, facing: 1 as const },
  /** The triangle-kimbap chiller: its shelves from x `from` to `to`, shelf tops at `shelves`. */
  kimbap: { from: 660, to: 1100, shelves: [560, 680, 800] as const, x: 880, y: 680 },
} as const;

/** Framings for the store (world units). */
export const STORE_CAMS: Record<"wide" | "counter" | "door" | "kimbap" | "crate" | "twoShot", Camera> = {
  wide: REF,
  twoShot: { x: 980, y: 700, zoom: 1.45 },
  counter: { x: 1420, y: 690, zoom: 2.0 },
  door: { x: 600, y: 700, zoom: 2.1 },
  kimbap: { x: 880, y: 680, zoom: 3.0 },
  crate: { x: 230, y: 820, zoom: 3.2 },
};

/** The fluorescent tubes and the chillers: they glow in every mood (the store is always lit). */
export const storeLights = (): SetLight[] => [
  { x: 880, y: 680, depth: 0.7, r: 420, color: "#e8f6ff", strength: 0.35, moods: ["morning", "day", "dusk", "night", "lamp", "frozen"] },
  { x: 1320, y: 680, depth: 0.7, r: 380, color: "#dff2ff", strength: 0.3, moods: ["morning", "day", "dusk", "night", "lamp", "frozen"] },
  { x: 1000, y: 60, depth: 0.7, r: 900, color: "#f4fbff", strength: 0.22, moods: ["dusk", "night", "lamp"] },
];

/** The store's light in a mood: the mood's look with a cool white grade inside (after dark the mood's own grade would
 *  turn the white blue) and the tubes' glows. */
export function storeLook(mood: MoodName, cam: Camera) {
  const dark = OUTSIDE[mood].dark;
  return setLook(storeLights(), mood, cam, dark
    ? { grade: { top: "#eef4ff", bottom: "#aab4d6", opacity: 0.32 }, rim: { color: "#e8f6ff", dx: -3, dy: -3 }, film: "contrast(1.1) saturate(1.02)" }
    : {});
}

const WALL = "#eef1ec";
const TILE = "#dfe3df";

/** One small triangle kimbap in its wrapper: a white triangle with a coloured label band, centred at (x, y). */
const Onigiri: React.FC<{ x: number; y: number; s: number; band: string }> = ({ x, y, s, band }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -26 L28 20 L-28 20Z" fill="#f7f4ea" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-12} y={2} width={24} height={18} fill="#1f2b22" />
    <rect x={-22} y={12} width={44} height={6} fill={band} />
  </g>
);

const BANDS = ["#d8344f", "#1d9a8f", "#f2b632", "#7fa0c4", "#e8792f"];

/** The open chiller of triangle kimbap: three shelves, rows of them, a cold glow. */
const KimbapChiller: React.FC = () => {
  const k = STORE.kimbap;
  return (
    <g>
      <rect x={k.from - 20} y={470} width={k.to - k.from + 40} height={480} rx={8} fill="#c9d2d8" stroke={INK} strokeWidth={5} />
      <rect x={k.from} y={490} width={k.to - k.from} height={440} fill="#e9f6fb" />
      <rect x={k.from - 20} y={450} width={k.to - k.from + 40} height={34} rx={6} fill="#3f6f8a" stroke={INK} strokeWidth={5} />
      {/* bars where a sign would be: no lettering */}
      <rect x={k.from + 30} y={461} width={150} height={12} rx={6} fill={PAPER} opacity={0.8} />
      {k.shelves.map((top, r) => (
        <g key={top}>
          {Array.from({ length: 9 }, (_, i) => (
            <Onigiri key={i} x={k.from + 30 + i * 48} y={top - 22} s={0.8} band={BANDS[(i + r * 2) % BANDS.length]} />
          ))}
          <rect x={k.from} y={top} width={k.to - k.from} height={12} fill="#9fb0ba" stroke={INK} strokeWidth={3} />
          <rect x={k.from + 10} y={top + 12} width={k.to - k.from - 20} height={10} fill="#f2b632" opacity={0.85} />
        </g>
      ))}
    </g>
  );
};

/** The drinks fridge: glass doors with bottles. */
const Fridge: React.FC<{ x: number; w: number }> = ({ x, w }) => (
  <g>
    <rect x={x} y={420} width={w} height={530} rx={10} fill="#bfc8cf" stroke={INK} strokeWidth={5} />
    {[0, 1].map((d) => (
      <g key={d}>
        <rect x={x + 14 + d * (w / 2 - 7)} y={436} width={w / 2 - 21} height={500} rx={6} fill="#dff3fb" stroke={INK} strokeWidth={4} />
        {[0, 1, 2, 3].map((r) => Array.from({ length: 4 }, (_, i) => (
          <rect key={`${r}-${i}`} x={x + 26 + d * (w / 2 - 7) + i * ((w / 2 - 45) / 4)} y={470 + r * 118} width={(w / 2 - 45) / 4 - 8} height={70} rx={6}
            fill={["#7fc29b", "#e6a0a0", "#f2b632", "#7fa0c4", "#c9a0d6"][(r * 3 + i + d) % 5]} opacity={0.9} />
        )))}
        {[0, 1, 2, 3].map((r) => <rect key={`s${r}`} x={x + 18 + d * (w / 2 - 7)} y={546 + r * 118} width={w / 2 - 29} height={6} fill="#9fb0ba" />)}
        <rect x={x + (d === 0 ? w / 2 - 22 : w / 2 + 12)} y={620} width={8} height={110} rx={4} fill="#8a949c" />
      </g>
    ))}
  </g>
);

/** Shelves of stock behind the counter: boxes in rows. */
const BackShelves: React.FC<{ x: number; w: number }> = ({ x, w }) => (
  <g>
    <rect x={x} y={300} width={w} height={420} fill="#d5dbd8" stroke={INK} strokeWidth={5} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        {Array.from({ length: Math.floor(w / 46) }, (_, i) => (
          <rect key={i} x={x + 12 + i * 46} y={318 + r * 100} width={38} height={60 + (noise(i + r * 17) * 18 - 9)} rx={4}
            fill={["#e6a0a0", "#7fa0c4", "#f2b632", "#a8c97f", "#b58fc7", "#f4efe2"][Math.floor(noise(i * 3 + r) * 6)]} stroke={INK} strokeWidth={2.5} />
        ))}
        <rect x={x} y={390 + r * 100} width={w} height={10} fill="#9fa8a4" />
      </g>
    ))}
  </g>
);

/** The street through the glass: the mood's sky, far towers, a lit signboard or two and the kerb. */
const Outside: React.FC<{ mood: MoodName; frame: number }> = ({ mood, frame }) => {
  const o = OUTSIDE[mood];
  const signs = ["#2fd3c3", "#ff6f91", "#7fb2ff", "#ffb36b"];
  return (
    <g>
      <Sky id="store-out" mood={mood} x={-1400} y={-200} w={2100} h={900} sunAt={{ x: 120, y: 160 }} />
      <Skyline mood={mood} from={-1400} to={700} base={760} tall={420} seed={3} />
      {/* two sign towers across the road, boards lit after dark */}
      {[{ x: -420, w: 280 }, { x: 10, w: 240 }].map((t, ti) => (
        <g key={ti}>
          <rect x={t.x} y={220} width={t.w} height={600} fill={o.dark ? "#1c2138" : "#8f8fa6"} />
          {Array.from({ length: 6 }, (_, r) => (
            <g key={r} opacity={o.dark ? 1 : 0.55}>
              <rect x={t.x + 14} y={240 + r * 90} width={t.w - 28} height={56} rx={5} fill={signs[(r + ti * 2) % signs.length]} />
              <rect x={t.x + 28} y={260 + r * 90} width={(t.w - 28) * 0.5} height={14} rx={7} fill={INK} opacity={0.5} />
            </g>
          ))}
        </g>
      ))}
      <rect x={-1400} y={800} width={2100} height={300} fill={o.dark ? "#22252f" : "#8a8d95"} />
      {/* a car's lights going by */}
      {o.dark && (() => {
        const cx = ((frame * 9) % 2600) - 1500;
        return <g><rect x={cx} y={830} width={150} height={34} rx={14} fill="#2b2f3c" /><circle cx={cx + 150} cy={846} r={9} fill="#fff4c8" /></g>;
      })()}
    </g>
  );
};

/** Everything behind the actors: the glass front onto the street, the wall, the chiller, the fridge, the shelves, the
 *  ceiling tubes and the tiled floor. `doorOpen` 0..1 slides the glass door open. */
export const StoreBack: React.FC<{ cam: Camera; mood: MoodName; frame: number; doorOpen?: number }> = ({ cam, mood, frame, doorOpen = 0 }) => {
  const d = STORE.doorway;
  const slide = interpolate(doorOpen, [0, 1], [0, d.to - d.from - 20], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Deep cam={cam} depth={0.35} flat>
        <Outside mood={mood} frame={frame} />
      </Deep>
      <Deep cam={cam} depth={0.7}>
        {/* the wall, with the glass front cut out of it at the left */}
        <path d={`M560 -900 H3600 V1300 H560 Z`} fill={WALL} />
        <rect x={560} y={-900} width={3040} height={1000} fill="#f6f8f5" />
        {/* the shop front's frame: mullions over the glass */}
        {[-900, -560, -220, 120].map((x) => <rect key={x} x={x - 8} y={120} width={16} height={840} fill="#8a949c" />)}
        <rect x={-1400} y={100} width={1960} height={30} fill="#8a949c" />
        <rect x={-1400} y={940} width={1960} height={30} fill="#8a949c" />
        <rect x={-1400} y={-900} width={1960} height={1000} fill="#f6f8f5" />
        <rect x={-1400} y={970} width={1960} height={400} fill={TILE} />
        <rect x={548} y={100} width={24} height={870} fill="#8a949c" />
        <KimbapChiller />
        <Fridge x={1150} w={330} />
        <BackShelves x={1520} w={560} />
        {/* a coffee machine on a side table, and a poster made of bars (no lettering) */}
        <rect x={2120} y={560} width={300} height={390} fill="#c9d2d8" stroke={INK} strokeWidth={5} />
        <rect x={2180} y={420} width={150} height={140} rx={10} fill="#3b3e47" stroke={INK} strokeWidth={5} />
        <circle cx={2255} cy={480} r={22} fill="#e8792f" />
        <rect x={720} y={200} width={300} height={170} rx={8} fill="#f2b632" stroke={INK} strokeWidth={5} />
        <path d="M800 330 L850 250 L900 330Z" fill="#f7f4ea" stroke={INK} strokeWidth={4} />
        <rect x={930} y={240} width={70} height={14} rx={7} fill={INK} opacity={0.6} />
        <rect x={930} y={272} width={50} height={14} rx={7} fill={INK} opacity={0.6} />
        {/* the ceiling and its tubes */}
        <rect x={-1400} y={-900} width={5000} height={980} fill="#f0f2ef" />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <rect x={-600 + i * 420} y={52} width={300} height={18} rx={9} fill="#ffffff" stroke="#c9d2d8" strokeWidth={3} />
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={0.7} flat>
        {/* glass: a faint sheen over the street, and the door, which slides left as it opens */}
        <rect x={-1400} y={130} width={1950} height={810} fill="#cfe9f4" opacity={0.08} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${-800 + i * 420} 140 l120 0 l-260 790 l-120 0Z`} fill="#fff" opacity={0.06} />)}
        <g transform={`translate(${-slide} 0)`}>
          <rect x={d.from} y={d.top} width={d.to - d.from} height={STORE.floor - d.top - 30} fill="#cfe9f4" opacity={0.12} stroke="#6f7a82" strokeWidth={10} />
          <rect x={d.handle.x - 6} y={d.handle.y - 60} width={12} height={120} rx={6} fill="#6f7a82" />
        </g>
      </Deep>
      <Deep cam={cam} depth={1}>
        {/* the tiled floor */}
        <rect x={-1400} y={940} width={5000} height={800} fill={TILE} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 180} y1={940} x2={-1460 + i * 180 - 200} y2={1700} stroke="#000" strokeWidth={3} opacity={0.06} />)}
        {[1010, 1110, 1260].map((y) => <line key={y} x1={-1400} y1={y} x2={3600} y2={y} stroke="#000" strokeWidth={3} opacity={0.06} />)}
        <rect x={-1400} y={936} width={5000} height={8} fill="#b8bfbb" />
        {/* the blue crate by the door */}
        <Crate x={STORE.crate.x} y={STORE.crate.y} />
      </Deep>
    </>
  );
};

/** A blue plastic crate, its top centre at (x, y), standing on the floor. */
const Crate: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const h = STORE.floor - y;
  return (
    <g>
      <rect x={x - 90} y={y} width={180} height={h} rx={6} fill="#3d6fb0" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <rect key={i} x={x - 70 + i * 52} y={y + 18} width={36} height={h - 36} rx={6} fill="#2c568e" />)}
      <rect x={x - 96} y={y - 6} width={192} height={14} rx={5} fill="#4a7fc2" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** The counter and what sits on it (the till, a tray of chewing gum), for the actors' slot: after the clerk, before
 *  the customers. */
export const StoreCounter: React.FC<{ frame?: number }> = () => {
  const c = STORE.counter;
  return (
    <g>
      {/* the till: a screen on a stand, a card reader */}
      <rect x={STORE.till.x - 8} y={STORE.till.y + 20} width={16} height={c.top - STORE.till.y - 20} fill="#3b3e47" />
      <rect x={STORE.till.x - 70} y={STORE.till.y - 50} width={140} height={86} rx={8} fill="#2b2f3c" stroke={INK} strokeWidth={5} />
      <rect x={STORE.till.x - 58} y={STORE.till.y - 40} width={116} height={64} rx={4} fill="#9fd3e6" />
      <rect x={1560} y={c.top - 34} width={60} height={34} rx={5} fill="#3b3e47" stroke={INK} strokeWidth={4} />
      <rect x={1840} y={c.top - 26} width={46} height={26} rx={4} fill="#e6a0a0" stroke={INK} strokeWidth={3} />
      <rect x={c.from - 20} y={c.top - 14} width={c.to - c.from + 40} height={22} rx={6} fill="#c9d2d8" stroke={INK} strokeWidth={5} />
      <rect x={c.from} y={c.top + 8} width={c.to - c.from} height={STORE.floor - c.top - 8} fill="#e9ecea" stroke={INK} strokeWidth={5} />
      <rect x={c.from + 20} y={c.top + 40} width={c.to - c.from - 40} height={70} rx={6} fill="#1d9a8f" opacity={0.85} />
      <rect x={c.from + 40} y={c.top + 66} width={180} height={18} rx={9} fill={PAPER} opacity={0.8} />
    </g>
  );
};

/** A near shelf end at the left edge, soft with depth of field, for over-the-shoulder shots across the store. */
export const StoreFront: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={1.3}>
    <rect x={-900} y={520} width={520} height={900} fill="#d5dbd8" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((r) => Array.from({ length: 8 }, (_, i) => (
      <rect key={`${r}-${i}`} x={-880 + i * 62} y={548 + r * 150} width={52} height={96} rx={6}
        fill={["#f2b632", "#e6a0a0", "#7fc29b", "#7fa0c4"][(i + r) % 4]} stroke={INK} strokeWidth={3} />
    )))}
  </Deep>
);

/**
 * The store cat, sitting, its base centre at (x, y) (put it on STORE.cat). Ginger with darker stripes; its tail
 * curls and flicks on `frame`, and it blinks slowly. `look` turns its eyes (-1..1). Nothing opens over a cat.
 */
export const Cat: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; frame: number; look?: number }> = ({
  x, y, scale = 1, facing = 1, frame, look = 0.3,
}) => {
  const flick = Math.sin(frame / 22) * 10 + (frame % 140 < 12 ? Math.sin(((frame % 140) / 12) * Math.PI) * 18 : 0);
  const blink = frame % 160 > 150;
  const fur = "#d9893b", dark = "#a85f22";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      {/* the tail, curling round the front of the base */}
      <path d={`M-40 -6 Q-90 -10 -88 ${-50 - flick} Q-86 ${-80 - flick} -66 ${-86 - flick}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d={`M-40 -6 Q-90 -10 -88 ${-50 - flick} Q-86 ${-80 - flick} -66 ${-86 - flick}`} fill="none" stroke={fur} strokeWidth={13} strokeLinecap="round" />
      {/* the body: a pear, haunch at the back */}
      <path d="M-52 0 Q-62 -70 -14 -96 Q20 -106 30 -80 Q46 -40 40 0Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-40 -20 Q-30 -60 -6 -70" fill="none" stroke={dark} strokeWidth={7} strokeLinecap="round" />
      <path d="M-46 -44 Q-36 -74 -18 -84" fill="none" stroke={dark} strokeWidth={6} strokeLinecap="round" />
      {/* front legs and paws */}
      <rect x={14} y={-56} width={16} height={56} rx={8} fill={fur} stroke={INK} strokeWidth={4} />
      <ellipse cx={26} cy={-3} rx={15} ry={7} fill="#f3e2c8" stroke={INK} strokeWidth={4} />
      {/* the head with its ears */}
      <g transform="translate(18 -112)">
        <path d="M-34 -14 L-30 -52 L-8 -28Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M34 -14 L30 -52 L8 -28Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-27 -20 L-26 -42 L-14 -28Z" fill="#e6a0a0" />
        <path d="M27 -20 L26 -42 L14 -28Z" fill="#e6a0a0" />
        <ellipse cx={0} cy={0} rx={38} ry={33} fill={fur} stroke={INK} strokeWidth={5} />
        <path d="M-8 -30 L-6 -18 M8 -30 L6 -18 M0 -32 L0 -18" stroke={dark} strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={8} cy={14} rx={16} ry={11} fill="#f3e2c8" />
        {blink
          ? [-12, 16].map((cx) => <line key={cx} x1={cx - 7} y1={-2} x2={cx + 7} y2={-2} stroke={INK} strokeWidth={4} strokeLinecap="round" />)
          : [-12, 16].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx + look * 4} cy={-2} rx={7} ry={9} fill="#9fd36a" stroke={INK} strokeWidth={3} />
              <ellipse cx={cx + look * 5} cy={-2} rx={2.5} ry={7} fill={INK} />
            </g>
          ))}
        <path d="M4 8 l8 0 l-4 5z" fill="#e6a0a0" />
        <path d="M8 13 q-6 6 -12 2 M8 13 q6 6 12 2" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <path d="M-14 14 L-40 10 M-14 18 L-40 20 M30 14 L54 10 M30 18 L54 20" stroke={INK} strokeWidth={2} opacity={0.6} />
      </g>
    </g>
  );
};
