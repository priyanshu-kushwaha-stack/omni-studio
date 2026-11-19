// The night globe (owner: builder D; One Mind's insert and THE wordless peak). A paper globe against a starry night,
// turned so the dark half faces you, a thin crescent of day on its left edge. Cities on the dark half are sparks (warm
// window lights); the band's teal threads join them into one tree grown from one city, so the lit half reads as a
// single brain cell: a body, branches thinning out to the tips. Pulses run out along the branches in one rhythm.
// One spark is your window; up close it resolves into a small lit window with red curtains.
//
// World coordinates for a 1920x1080 stage at REF (`sets/common.tsx`): the globe is at GLOBE, `GLOBE_HOME` is your
// window, `GLOBE_SOMA` the cell body. Draw with <GlobeScene cam frame ...> (a whole Stage) or the parts.
import { Deep } from "./common";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { GHOST, noise } from "../shared";

export const GLOBE = { x: 960, y: 560, r: 430 };
/** The night side: a circle offset right, clipped to the globe, leaves a crescent of day on the left. */
const NIGHT = { dx: 130, r: 452 };

/** The land, as paper blobs (ellipses relative to the globe's centre: x, y, rx, ry, rotation). */
const LAND: [number, number, number, number, number][] = [
  [-250, -180, 150, 110, -20], [-130, -60, 120, 150, 15], [-60, 190, 90, 140, -10], [120, -215, 210, 90, 10],
  [210, -60, 130, 125, -15], [255, 150, 95, 115, 20], [60, 70, 75, 55, 0], [-290, 70, 60, 95, 10], [120, 300, 70, 45, -25],
];

const inLand = (x: number, y: number) => LAND.some(([cx, cy, rx, ry, rot]) => {
  const a = (-rot * Math.PI) / 180;
  const dx = x - cx, dy = y - cy;
  const u = dx * Math.cos(a) - dy * Math.sin(a), v = dx * Math.sin(a) + dy * Math.cos(a);
  return (u * u) / (rx * rx) + (v * v) / (ry * ry) < 1;
});
const inNight = (x: number, y: number, margin = 0) => Math.hypot(x - NIGHT.dx, y) < NIGHT.r - margin && Math.hypot(x, y) < GLOBE.r - 18 - margin;

interface City { x: number; y: number; parent: number; dist: number; joined: number; lit: number; size: number }

/** The cities (world coordinates) and the tree that joins them, grown from the cell body by Prim's rule (each new city
 *  joins the nearest one already in). Computed once. */
function build() {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; pts.length < 150 && i < 4000; i++) {
    const x = (noise(i * 2 + 1) * 2 - 1) * GLOBE.r, y = (noise(i * 2 + 7) * 2 - 1) * GLOBE.r;
    if (inLand(x, y) && inNight(x, y, 14) && pts.every((p) => Math.hypot(p.x - x, p.y - y) > 26)) pts.push({ x, y });
  }
  const near = (tx: number, ty: number) => pts.reduce((b, p, i) => (Math.hypot(p.x - tx, p.y - ty) < Math.hypot(pts[b].x - tx, pts[b].y - ty) ? i : b), 0);
  const root = near(40, -40);
  const home = near(150, 40);
  const n = pts.length;
  const inTree = new Array(n).fill(false);
  const best = pts.map((p) => Math.hypot(p.x - pts[root].x, p.y - pts[root].y));
  const parent = new Array(n).fill(root);
  const dist = new Array(n).fill(0);
  const joined = new Array(n).fill(0);
  inTree[root] = true;
  for (let step = 1; step < n; step++) {
    let pick = -1;
    for (let i = 0; i < n; i++) if (!inTree[i] && (pick < 0 || best[i] < best[pick])) pick = i;
    inTree[pick] = true;
    joined[pick] = step / (n - 1);
    dist[pick] = dist[parent[pick]] + best[pick];
    for (let i = 0; i < n; i++) {
      if (inTree[i]) continue;
      const d = Math.hypot(pts[i].x - pts[pick].x, pts[i].y - pts[pick].y);
      if (d < best[i]) { best[i] = d; parent[i] = pick; }
    }
  }
  const size = new Array(n).fill(1);
  const byDist = [...Array(n).keys()].sort((a, b) => dist[b] - dist[a]);
  for (const i of byDist) if (i !== root) size[parent[i]] += size[i];
  const order = [...Array(n).keys()].sort((a, b) => noise(a + 500) - noise(b + 500));
  const lit = new Array(n).fill(0);
  order.forEach((i, rank) => { lit[i] = rank / n; });
  lit[home] = 0;
  const cities: City[] = pts.map((p, i) => ({ x: GLOBE.x + p.x, y: GLOBE.y + p.y, parent: i === root ? -1 : parent[i], dist: dist[i], joined: joined[i],
    lit: lit[i], size: size[i] }));
  const dust: { x: number; y: number; lit: number }[] = [];
  for (let i = 0; dust.length < 520 && i < 9000; i++) {
    const x = (noise(i * 3 + 11) * 2 - 1) * GLOBE.r, y = (noise(i * 3 + 17) * 2 - 1) * GLOBE.r;
    if (inLand(x, y) && inNight(x, y, 6)) dust.push({ x: GLOBE.x + x, y: GLOBE.y + y, lit: noise(i + 900) });
  }
  return { cities, dust, root, home, maxDist: Math.max(...dist) };
}

const NET = build();
export const GLOBE_HOME = { x: NET.cities[NET.home].x, y: NET.cities[NET.home].y };
export const GLOBE_SOMA = { x: NET.cities[NET.root].x, y: NET.cities[NET.root].y };

export interface GlobeState {
  /** 0..1: how many of the window lights are on (one by one). */
  lit: number;
  /** 0..1: how much of the thread tree has joined up (from the cell body out). */
  join: number;
  /** Pulses: the first leaves the cell body at `from`, then one every `every` frames, running `speed` px a frame. */
  fire?: { from: number; every: number; speed?: number };
  /** 0..1: a whole-tree flash (the cell firing). */
  flash?: number;
  /** 0..1: your window resolves out of its spark. */
  home?: number;
}

/** How brightly a pulse is passing a point `d` along the tree, 0..1. */
function pulseAt(frame: number, d: number, fire?: GlobeState["fire"]) {
  if (!fire || frame < fire.from) return 0;
  const speed = fire.speed ?? 9;
  let best = 0;
  for (let n = 0; ; n++) {
    const start = fire.from + n * fire.every;
    if (start > frame) break;
    const w = (frame - start) * speed;
    if (w > NET.maxDist + 200) continue;
    best = Math.max(best, Math.exp(-(((w - d) / 70) ** 2)));
  }
  return best;
}

/** The starry night behind the globe (far, flat). */
export const GlobeSky: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <Deep cam={cam} depth={0.25} flat>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="#070a1c" />
    <defs>
      <radialGradient id="globe-sky" cx={GLOBE.x} cy={GLOBE.y} r={1100} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#1d2552" />
        <stop offset="1" stopColor="#070a1c" />
      </radialGradient>
    </defs>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="url(#globe-sky)" />
    {Array.from({ length: 140 }, (_, i) => {
      const x = noise(i + 70) * 3000 - 540, y = noise(i + 340) * 1700 - 300;
      const tw = 0.45 + 0.55 * Math.max(0, Math.sin(frame / 23 + i * 1.7));
      return <circle key={i} cx={x} cy={y} r={1.4 + noise(i + 20) * 2.2} fill="#f3e9d7" opacity={0.25 + 0.6 * tw * noise(i + 3)} />;
    })}
  </Deep>
);

/** The globe itself: ocean, land, the day crescent, the night, the window lights, the threads, the pulses. */
export const GlobeBody: React.FC<{ frame: number; state: GlobeState }> = ({ frame, state }) => {
  const { lit, join, fire, flash = 0, home = 0 } = state;
  const G = GLOBE;
  const land = LAND.map(([x, y, rx, ry, rot], i) => (
    <ellipse key={i} cx={G.x + x} cy={G.y + y} rx={rx} ry={ry} transform={`rotate(${rot} ${G.x + x} ${G.y + y})`} />
  ));
  const breath = 0.5 + 0.5 * Math.sin(frame / 9);
  return (
    <g>
      <circle cx={G.x} cy={G.y} r={G.r + 40} fill="#5aa8d8" opacity={0.08} />
      <circle cx={G.x} cy={G.y} r={G.r + 16} fill="#7fd0ff" opacity={0.07} />
      <clipPath id="globe-clip"><circle cx={G.x} cy={G.y} r={G.r} /></clipPath>
      <clipPath id="globe-night"><circle cx={G.x + NIGHT.dx} cy={G.y} r={NIGHT.r} /></clipPath>
      <g clipPath="url(#globe-clip)">
        <rect x={G.x - G.r} y={G.y - G.r} width={G.r * 2} height={G.r * 2} fill="#6fa3c8" />
        <g fill="#7d9e6c" stroke="#7d9e6c" strokeWidth={10}>{land}</g>
        <g fill="#a6c98f">{land}</g>
        <g clipPath="url(#globe-night)">
          <rect x={G.x - G.r} y={G.y - G.r} width={G.r * 2} height={G.r * 2} fill="#121838" />
          <g fill="#2c3668" stroke="#2c3668" strokeWidth={10}>{land}</g>
          <g fill="#1f2750">{land}</g>
          <circle cx={G.x + NIGHT.dx} cy={G.y} r={NIGHT.r} fill="none" stroke="#3b4a8a" strokeWidth={26} opacity={0.35} />
        </g>
        {/* the day's edge: a soft line where the light ends */}
        <circle cx={G.x + NIGHT.dx} cy={G.y} r={NIGHT.r} fill="none" stroke="#fff2c8" strokeWidth={6} opacity={0.18} />
        {/* the dust of a million small windows */}
        {NET.dust.map((d, i) => d.lit < lit && (
          <circle key={i} cx={d.x} cy={d.y} r={1.8} fill="#ffd36b" opacity={0.45 + 0.35 * flash + 0.2 * pulseAt(frame, Math.hypot(d.x - GLOBE_SOMA.x, d.y - GLOBE_SOMA.y), fire)} />
        ))}
        {/* the threads: one tree from the cell body, thicker near it */}
        {NET.cities.map((c, i) => {
          if (c.parent < 0 || c.joined > join) return null;
          const p = NET.cities[c.parent];
          const glow = Math.max(flash, pulseAt(frame, (c.dist + p.dist) / 2, fire));
          const w = 1.6 + Math.sqrt(c.size) * 0.9;
          return (
            <g key={i}>
              <line x1={p.x} y1={p.y} x2={c.x} y2={c.y} stroke={GHOST.light} strokeWidth={w + 10 * glow} opacity={0.12 + 0.25 * glow} strokeLinecap="round" />
              <line x1={p.x} y1={p.y} x2={c.x} y2={c.y} stroke={glow > 0.4 ? "#e8fffb" : GHOST.light} strokeWidth={w} opacity={0.45 + 0.55 * glow}
                strokeLinecap="round" strokeDasharray={glow > 0.3 ? undefined : "2 7"} />
            </g>
          );
        })}
        {/* the window lights */}
        {NET.cities.map((c, i) => {
          if (c.lit > lit && i !== NET.home) return null;
          if (i === NET.home && lit <= 0) return null;
          const glow = Math.max(flash, pulseAt(frame, c.dist, fire));
          const r = 3.2 + Math.min(4, Math.sqrt(c.size) * 0.5);
          return (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={r * 3.2 + glow * 8} fill="#ffb84a" opacity={0.16 + 0.3 * glow} />
              <circle cx={c.x} cy={c.y} r={r + glow * 2} fill={glow > 0.5 ? "#fff6d8" : "#ffd36b"} />
            </g>
          );
        })}
        {/* the cell body: the city the tree grew from */}
        {join > 0 && (
          <g>
            <circle cx={GLOBE_SOMA.x} cy={GLOBE_SOMA.y} r={26 + 6 * breath + 22 * flash} fill={GHOST.light} opacity={0.18 + 0.3 * flash} />
            <circle cx={GLOBE_SOMA.x} cy={GLOBE_SOMA.y} r={9 + 3 * flash} fill="#e8fffb" />
          </g>
        )}
      </g>
      <circle cx={G.x} cy={G.y} r={G.r} fill="none" stroke={INK} strokeWidth={7} />
      <path d={`M${G.x - G.r * 0.62} ${G.y - G.r * 0.7} A${G.r} ${G.r} 0 0 1 ${G.x + G.r * 0.2} ${G.y - G.r * 0.97}`} fill="none" stroke="#ffffff"
        strokeWidth={8} opacity={0.12} strokeLinecap="round" />
      {home > 0 && <HomeWindow x={GLOBE_HOME.x} y={GLOBE_HOME.y} t={home} frame={frame} />}
    </g>
  );
};

/** Your window, resolving out of its spark: a small warm window with red curtains and a bunk's shadow. */
const HomeWindow: React.FC<{ x: number; y: number; t: number; frame: number }> = ({ x, y, t, frame }) => {
  const s = 0.4 + 0.6 * t;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, t * 1.6)}>
      <circle r={30 + 3 * Math.sin(frame / 8)} fill="#ffb84a" opacity={0.25} />
      <rect x={-14} y={-12} width={28} height={24} fill="#ffe7a8" stroke={INK} strokeWidth={2} />
      <path d="M-14 -12 H-6 Q-8 0 -10 12 H-14Z M14 -12 H6 Q8 0 10 12 H14Z" fill="#d8344f" />
      <rect x={-6} y={2} width={14} height={2.5} fill={INK} opacity={0.55} />
      <rect x={-6} y={-5} width={14} height={2.5} fill={INK} opacity={0.4} />
      <circle cx={2} cy={-0.5} r={2} fill={GHOST.light} />
    </g>
  );
};

/** The whole globe shot on a Stage. `extra` draws in world coordinates over the globe. */
export const GlobeScene: React.FC<{ cam: Camera; frame: number; state: GlobeState; extra?: React.ReactNode }> = ({ cam, frame, state, extra }) => (
  <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<GlobeSky cam={cam} frame={frame} />}
    actors={<><GlobeBody frame={frame} state={state} />{extra}</>} />
);
