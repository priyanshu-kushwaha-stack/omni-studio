// The river bridge walkway (owner: builder B; used by Crumbs, Night One and The Warehouses). Side on, at REF: the sky,
// the far mountains and the far city across the river, the river with its slow ripples, the railing, the lamp posts,
// the concrete walkway the queue walks along (left to right, toward the clinic on the far side). Dawn in `morning`,
// lamps lit in `dusk` and after.
//
// How beats use it:
//   <BridgeScene frame mood cam queue={6} actors={...} />          the whole stage, lit, with the walking queue
//   <bridge.Back .../> / <BridgeQueue .../> / <BridgeFront .../>    the parts, in your own <Stage>
//   BRIDGE                                                          the anchors (floor, rail, river, lamps, spots)
// Exports are stable: other builders import them.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Deep, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, setLook, Sky, Skyline, type SetDef, type SetLight, type SetProps } from "@whatif/kit/sets/common";
import { LookContext, type Look } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { PASTELS } from "../shared";

/** Where everything is on the bridge, in REF coordinates (depth 1 unless said). */
export const BRIDGE = {
  /** The walkway's surface: figures' feet. */
  floor: 960,
  /** The railing behind the walkers (depth 0.95): top rail, middle rail, the kerb at its foot. */
  rail: { top: 700, mid: 790, kerb: 880 },
  /** The river (depth 0.45), between the far bank and the bridge. */
  river: { top: 560, bottom: 900 },
  /** The lamp posts' x (depth 0.95); their heads at y 300. */
  lamps: [330, 1430],
  lampHead: 300,
  /** The queue walks along y 950 from `from` to `to`, `gap` apart. */
  queue: { y: 950, from: -300, to: 2300, gap: 175, scale: 0.98 },
  /** Named places for figures. */
  spots: {
    you: { x: 700, y: 965, scale: 1.15, facing: 1 as const },
    woman: { x: 980, y: 960, scale: 1.1, facing: -1 as const },
    railing: { x: 1300, y: 960, scale: 1.15, facing: -1 as const },
  },
};

export interface BridgeOptions {
  /** People in the walking queue (0 to 10). */
  queue: number;
  /** How fast the queue walks, px a frame (0 stands still, shuffling). */
  walk: number;
  /** The soft near railing post in front (depth 1.35). */
  near: boolean;
}

const RIVER: Record<MoodName, [string, string]> = {
  morning: ["#e9b98f", "#7fa7b5"],
  day: ["#8cc3d0", "#4f8a9a"],
  dusk: ["#d98a74", "#4e4677"],
  night: ["#1a2140", "#0e1328"],
  lamp: ["#1f2444", "#11152c"],
  frozen: ["#8cc3d0", "#4f8a9a"],
};

/** Low desert mountains behind the far city (El Paso's Franklins), one path. */
const Mountains: React.FC<{ mood: MoodName }> = ({ mood }) => {
  const dark = OUTSIDE[mood].dark;
  const fill = dark ? "#262a4a" : mood === "dusk" ? "#8a6a8f" : mood === "morning" ? "#c99a8e" : "#a9b8a8";
  return (
    <path d="M-1400 520 L-900 430 L-600 470 L-200 360 L120 420 L420 330 L760 410 L1100 300 L1380 390 L1700 340 L2100 430 L2600 380 L3400 470 V700 H-1400Z"
      fill={fill} />
  );
};

/** The river: a gradient band with short ripple dashes that drift with `frame`, and the far bank's edge. */
const River: React.FC<{ mood: MoodName; frame: number }> = ({ mood, frame }) => {
  const [top, bottom] = RIVER[mood];
  const R = BRIDGE.river;
  const dash = OUTSIDE[mood].dark ? "#3a4570" : "#ffffff";
  return (
    <g>
      <defs>
        <linearGradient id="bridge-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x={-1400} y={R.top} width={4800} height={R.bottom - R.top + 600} fill="url(#bridge-river)" />
      <rect x={-1400} y={R.top - 10} width={4800} height={16} fill={OUTSIDE[mood].dark ? "#2a2f4c" : "#b9a27a"} />
      {Array.from({ length: 36 }, (_, i) => {
        const row = i % 6;
        const x = ((noise(i + 3) * 4800 + frame * (0.6 + row * 0.15)) % 4800) - 1400;
        const y = R.top + 30 + row * 48 + noise(i) * 16;
        return <rect key={i} x={x} y={y} width={60 + noise(i + 9) * 90} height={5} rx={3} fill={dash} opacity={0.3} />;
      })}
      {lightsOn(mood) && BRIDGE.lamps.map((x) => (
        <rect key={x} x={x + 60} y={R.top + 20} width={40} height={R.bottom - R.top - 40} rx={20} fill="#ffe6a0" opacity={0.18} />
      ))}
    </g>
  );
};

/** One lamp post on the railing, its head at (x, BRIDGE.lampHead), lit in the evening moods. */
const LampPost: React.FC<{ x: number; on: boolean }> = ({ x, on }) => (
  <g>
    <rect x={x - 9} y={BRIDGE.lampHead} width={18} height={BRIDGE.rail.kerb - BRIDGE.lampHead} fill="#3b4250" stroke={INK} strokeWidth={4} />
    <path d={`M${x} ${BRIDGE.lampHead + 6} Q${x + 46} ${BRIDGE.lampHead - 30} ${x + 82} ${BRIDGE.lampHead + 4}`} fill="none" stroke="#3b4250" strokeWidth={12} />
    <path d={`M${x + 58} ${BRIDGE.lampHead + 2} h48 l-8 22 h-32Z`} fill={on ? "#ffe6a0" : "#9aa1ab"} stroke={INK} strokeWidth={4} />
    {on && <path d={`M${x + 62} ${BRIDGE.lampHead + 24} L${x + 102} ${BRIDGE.lampHead + 24} L${x + 230} ${BRIDGE.floor} L${x - 66} ${BRIDGE.floor}Z`} fill="#ffe6a0" opacity={0.13} />}
  </g>
);

/** The railing behind the walkers: posts, two rails, a kerb. */
const Railing: React.FC = () => {
  const R = BRIDGE.rail;
  const posts = Array.from({ length: 32 }, (_, i) => -1400 + i * 160);
  return (
    <g>
      <path d={posts.map((x) => `M${x} ${R.top} V${R.kerb}`).join("")} stroke="#5c6675" strokeWidth={16} />
      <path d={posts.map((x) => `M${x + 80} ${R.mid} V${R.kerb}`).join("")} stroke="#5c6675" strokeWidth={8} />
      <rect x={-1400} y={R.top - 10} width={4800} height={20} rx={8} fill="#6d7888" stroke={INK} strokeWidth={4} />
      <rect x={-1400} y={R.mid - 6} width={4800} height={12} rx={6} fill="#6d7888" stroke={INK} strokeWidth={3} />
      <rect x={-1400} y={R.kerb} width={4800} height={34} fill="#b9b1a2" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** The walkway: pale concrete with expansion joints. */
const Walkway: React.FC<{ mood: MoodName }> = ({ mood }) => (
  <g>
    <rect x={-1400} y={BRIDGE.rail.kerb + 34} width={4800} height={1200} fill={OUTSIDE[mood].dark ? "#6f6a66" : "#d6cbb7"} />
    <path d={Array.from({ length: 24 }, (_, i) => `M${-1400 + i * 220} ${BRIDGE.rail.kerb + 34} l-140 400`).join("")} stroke="#000" strokeWidth={4} opacity={0.08} />
  </g>
);

const Back: React.FC<SetProps<BridgeOptions>> = ({ cam, mood, frame }) => {
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.1} flat><Sky id="bridge" mood={mood} x={-1400} y={-800} w={4800} h={1400} sunAt={{ x: 1500, y: 330 }} /></Deep>
      <Deep cam={cam} depth={0.18} flat><Mountains mood={mood} /></Deep>
      <Deep cam={cam} depth={0.28} flat>
        <Skyline mood={mood} from={-1400} to={3400} base={570} tall={230} seed={3} colors={["#d9b8a0", "#cdb0a6", "#e0cba4", "#b9c9c0"]} />
      </Deep>
      <Deep cam={cam} depth={0.45} flat><River mood={mood} frame={frame} /></Deep>
      <Deep cam={cam} depth={0.95}>
        <Railing />
        {BRIDGE.lamps.map((x) => <LampPost key={x} x={x} on={on} />)}
      </Deep>
      <Deep cam={cam} depth={1}><Walkway mood={mood} /></Deep>
    </>
  );
};

/** A soft railing post in the near foreground at the right (depth 1.35). */
export const BridgeFront: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={1.35}>
    <rect x={1760} y={560} width={46} height={700} rx={14} fill="#5c6675" stroke={INK} strokeWidth={6} />
    <rect x={1500} y={600} width={900} height={26} rx={10} fill="#6d7888" stroke={INK} strokeWidth={5} />
  </Deep>
);

/** One walker's look: pastel head, coat, and every third one a shopping bag. */
const walkerLook = (i: number) => ({
  head: PASTELS[(i * 5 + 1) % PASTELS.length],
  coat: ["#5a6488", "#7a5a8c", "#6d7f8f", "#8a5c3b", "#4f6b5a", "#7c6f5a"][i % 6],
  bag: i % 3 === 1,
});

/**
 * The queue walking in, left to right, along the walkway: `n` people `gap` apart, moving `walk` px a frame and wrapping
 * between BRIDGE.queue.from and .to (so it never runs out). `skip` leaves gaps (indices) for a beat's own figures;
 * `offset` slides the whole line. Draw it in the actors' slot.
 */
export const BridgeQueue: React.FC<{ frame: number; n: number; walk?: number; gap?: number; offset?: number; skip?: number[];
  y?: number; scale?: number }> = ({ frame, n, walk = 1.6, gap = BRIDGE.queue.gap, offset = 0, skip = [], y = BRIDGE.queue.y,
  scale = BRIDGE.queue.scale }) => {
  const Q = BRIDGE.queue;
  const span = Q.to - Q.from;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        if (skip.includes(i)) return null;
        const x = Q.from + ((((i * gap + offset + frame * walk) % span) + span) % span);
        const w = walkerLook(i);
        const phase = walk > 0 ? frame * 0.16 * (walk / 1.6) + i * 1.3 : 0;
        const pose = walk > 0 ? walkPose(phase) : { ...STAND, tilt: Math.sin(frame / 40 + i) * 3 };
        const bag = (
          <g>
            <path d="M-12 -2 q12 -22 24 0" fill="none" stroke={INK} strokeWidth={4} />
            <rect x={-20} y={-2} width={40} height={44} rx={6} fill="#e6d3a8" stroke={INK} strokeWidth={4} />
          </g>
        );
        return (
          <Figure key={i} x={x} y={y + (i % 2) * 6} scale={scale} facing={1} pose={pose} head={w.head} coat={w.coat}
            mouth="flat" look={{ x: 0.7, y: 0.1 }} blink={(frame + i * 37) % 97 < 4} time={frame} held={w.bag ? bag : undefined} />
        );
      })}
    </g>
  );
};

const lights = (): SetLight[] => [
  ...BRIDGE.lamps.map((x) => ({ x: x + 82, y: BRIDGE.lampHead + 14, depth: 0.95, r: 300, color: "#ffe6a0", strength: 0.5, moods: LIGHTS_ON })),
  { x: 1500, y: 330, depth: 0.1, r: 700, color: "#ffd9a0", strength: 0.35, moods: ["morning"] as MoodName[] },
];

/** The bridge as a library set (for <SetScene>): its spots, cameras and lights. */
export const bridge: SetDef<BridgeOptions> = {
  name: "bridge",
  about: "river bridge walkway: far city and mountains across the river, railing, lamp posts, a queue walking in",
  spots: BRIDGE.spots,
  cameras: {
    wide: REF,
    walkway: { x: 900, y: 700, zoom: 1.5 },
    rail: { x: 1100, y: 640, zoom: 1.9 },
    river: { x: 960, y: 520, zoom: 1.2 },
  },
  lights,
  defaults: { queue: 6, walk: 1.6, near: false },
  Back: (p) => <Back {...p} />,
  Front: (p) => (p.options.near ? <BridgeFront cam={p.cam} /> : null),
  example: { camera: "wide", cast: [] },
};

/**
 * The bridge on a lit Stage: the set at `cam` in `mood`, the queue (`queue` people walking `walk` px a frame, `skip`
 * leaving gaps), then `actors` (a beat's own figures, bubbles, tags) and, if `near`, the soft post in front. `under`
 * draws before the queue (someone the queue walks in front of). `look` adds glows or focus.
 */
export const BridgeScene: React.FC<{
  frame: number; mood: MoodName; cam: Camera; queue?: number; walk?: number; skip?: number[]; offset?: number; near?: boolean;
  under?: React.ReactNode; actors?: React.ReactNode; look?: Partial<Look>;
}> = ({ frame, mood, cam, queue = 6, walk = 1.6, skip, offset, near = false, under, actors, look }) => {
  const options: BridgeOptions = { queue, walk, near };
  const props = { cam, mood, frame, options };
  return (
    <LookContext.Provider value={setLook(lights(), mood, cam, look)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<Back {...props} />}
        actors={<>{under}<BridgeQueue frame={frame} n={queue} walk={walk} skip={skip} offset={offset} />{actors}</>}
        front={near ? <BridgeFront cam={cam} /> : undefined} />
    </LookContext.Provider>
  );
};
