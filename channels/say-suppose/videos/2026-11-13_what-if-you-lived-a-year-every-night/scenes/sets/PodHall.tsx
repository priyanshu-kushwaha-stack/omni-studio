// The hall of sleep pods (a set drawn for this film): the hotel's staff hall after close. Two tiers of pod hatches down
// the back wall, each with a warm porthole lamp and a small split-flap counter, no lettering anywhere; a high window at
// the right that lets in one wedge of light in the morning; the night desk at the left with the wall clock over it.
// Pod one, lower tier, is yours: its door swings up (`door` 0 shut .. 1 open) and its counter is the rule device.
//
// Drawn for REF (the 1920x1080 frame at zoom 1) in three depths: the far wall and window (0.6), the pods (0.85), the
// floor, desk and pod one's lip (1). Lights for setLook: every lit porthole, the desk lamp, and the window in the
// morning. `cameras.wide` is REF; `podOne` frames you at your hatch; `desk` the boss at the desk.
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { SetLight } from "@whatif/kit/sets/common";
import { Counter, WallClock } from "../parts";
import { noise } from "../shared";
import { Deep, REF } from "./common";

export const FLOOR = 960;
const LAMP = "#ffc46b";
const ALL: MoodName[] = ["morning", "day", "dusk", "night", "lamp", "frozen"];

/** The pods on the back wall: two tiers, six across. Pod one is lower tier, index 1 (the second from the left). */
const COLS = [150, 450, 750, 1050, 1350, 1650];
const W = 270;
const H = 200;
const LOWER = 640; // top of the lower tier
const UPPER = 395; // top of the upper tier
export const POD_ONE = { x: COLS[1], y: LOWER, w: W, h: H };
/** Pod one's counter, on the frame above the hatch, in world coordinates. */
export const POD_ONE_COUNTER = { x: COLS[1] + W / 2, y: LOWER - 34, tile: 44 };

export const PODHALL = {
  spots: {
    /** You, standing at your hatch. */
    you: { x: COLS[1] + W / 2 + 10, y: FLOOR, scale: 1.1 },
    /** Your flatmate, with the mop, mid-floor. */
    flatmate: { x: 1120, y: FLOOR, scale: 1.08 },
    /** Your boss behind the night desk. */
    boss: { x: 300, y: FLOOR - 10, scale: 1.12 },
  },
  cameras: {
    wide: REF,
    podOne: { x: 600, y: 700, zoom: 2.0 } as Camera,
    desk: { x: 400, y: 640, zoom: 1.6 } as Camera,
    twoShot: { x: 840, y: 680, zoom: 1.5 } as Camera,
  },
};

/** Lights for setLook: lit portholes (all moods), the desk lamp, the high window in the morning. */
export function podHallLights(): SetLight[] {
  const out: SetLight[] = [];
  COLS.forEach((x, i) => {
    [UPPER, LOWER].forEach((top, t) => {
      if ((i + t) % 3 !== 1) out.push({ x: x + W / 2, y: top + H / 2, depth: 0.85, r: 120, color: LAMP, strength: 0.35, moods: ALL });
    });
  });
  out.push({ x: 300, y: 700, depth: 1, r: 260, color: "#ffe2a6", strength: 0.35, moods: ["dusk", "night", "lamp"] });
  out.push({ x: 1600, y: 160, depth: 0.6, r: 520, color: "#fff1cc", strength: 0.5, moods: ["morning", "day"] });
  return out;
}

/** One pod hatch: a rounded frame, a door (swung up by `open`), a porthole lamp and a small counter tile strip. */
const Pod: React.FC<{ x: number; y: number; lit: boolean; open?: number; frame: number; seed: number; flutter?: boolean }> = ({ x, y, lit, open = 0, frame, seed, flutter }) => {
  const doorH = H - 30;
  return (
    <g>
      <rect x={x} y={y} width={W} height={H} rx={30} fill="#262d45" stroke={INK} strokeWidth={6} />
      {/* the inside, seen when the door is up: dark, a pillow, the lamp */}
      <rect x={x + 16} y={y + 16} width={W - 32} height={H - 32} rx={22} fill="#0a0c16" />
      <rect x={x + 30} y={y + 24} width={60} height={14} rx={6} fill={LAMP} opacity={0.9} />
      <path d={`M${x + 28} ${y + H - 40} Q${x + 40} ${y + H - 74} ${x + 100} ${y + H - 70} L${x + 120} ${y + H - 46} Z`} fill="#cfd3e6" />
      {/* the door: shuts down over the opening; as it opens it folds up into a slab over the frame */}
      {open < 1 && (
        <g>
          <rect x={x + 14} y={y + 14} width={W - 28} height={doorH * (1 - open)} rx={22} fill="#1d2338" stroke="#3a4363" strokeWidth={4} />
          {open < 0.4 && (
            <>
              <circle cx={x + W / 2} cy={y + 14 + doorH / 2} r={38} fill={lit ? LAMP : "#2b3250"} stroke={INK} strokeWidth={5} />
              {lit && <circle cx={x + W / 2} cy={y + 14 + doorH / 2} r={38} fill="url(#ph-glow)" />}
              <rect x={x + W - 44} y={y + 14 + doorH / 2 - 20} width={12} height={40} rx={5} fill="#3a4363" />
            </>
          )}
        </g>
      )}
      {open > 0 && <rect x={x + 6} y={y - 6 - 22 * open} width={W - 12} height={22 * open + 8} rx={8} fill="#323a5a" stroke={INK} strokeWidth={4} />}
      {/* a little counter strip over every hatch: dark, or fluttering when the whole hall plugs in */}
      <rect x={x + W / 2 - 46} y={y - 40} width={92} height={30} rx={6} fill={INK} stroke="#3a4363" strokeWidth={3} />
      {[0, 1, 2].map((k) => {
        const on = flutter;
        const ch = on ? String(Math.floor(noise(frame + seed * 7 + k * 3) * 10)) : "";
        return (
          <g key={k}>
            <rect x={x + W / 2 - 40 + k * 28} y={y - 36} width={24} height={22} rx={3} fill={on ? CRIMSON : "#2b2f3d"} />
            {ch && <text x={x + W / 2 - 28 + k * 28} y={y - 19} textAnchor="middle" fontSize={18} fontWeight={800} fill={PAPER}>{ch}</text>}
          </g>
        );
      })}
    </g>
  );
};

/** The night desk: a counter top, a lamp, a crate when `crate`. */
const Desk: React.FC<{ crate?: boolean }> = ({ crate }) => (
  <g>
    <rect x={110} y={790} width={420} height={170} rx={10} fill="#5b4636" stroke={INK} strokeWidth={6} />
    <rect x={96} y={772} width={448} height={28} rx={8} fill="#7a5d47" stroke={INK} strokeWidth={6} />
    <line x1={470} y1={772} x2={470} y2={690} stroke={INK} strokeWidth={8} />
    <path d="M430 700 L510 700 L490 660 L450 660 Z" fill="#ffd27a" stroke={INK} strokeWidth={5} />
    {crate && (
      <g>
        <rect x={170} y={690} width={180} height={84} rx={6} fill="#b8895a" stroke={INK} strokeWidth={5} />
        <line x1={170} y1={732} x2={350} y2={732} stroke={INK} strokeWidth={4} opacity={0.5} />
      </g>
    )}
  </g>
);

export interface PodHallProps {
  cam: Camera;
  frame: number;
  /** Pod one's door, 0 shut to 1 open. */
  door?: number;
  /** Pod one's counter: fluttering from `at`, steady `value`, or dark. */
  counter?: { at?: number; value?: string; dark?: boolean };
  /** Every hatch's strip flutters (the whole city plugged in). */
  flutterAll?: boolean;
  /** The crate on the desk (the skit). */
  crate?: boolean;
  /** Wall clock minutes past the hour. */
  minutes?: number;
  /** The morning wedge of light from the high window. */
  wedge?: boolean;
}

/** The hall behind the actors: wall, window, pods, desk, floor. */
export const PodHallBack: React.FC<PodHallProps> = ({ cam, frame, door = 0, counter, flutterAll, crate, minutes = 10, wedge }) => (
  <g>
    <defs>
      <radialGradient id="ph-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff6dc" stopOpacity={0.9} />
        <stop offset="1" stopColor={LAMP} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="ph-wedge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe9b8" stopOpacity={0.5} />
        <stop offset="1" stopColor="#ffe9b8" stopOpacity={0} />
      </linearGradient>
    </defs>
    <Deep cam={cam} depth={0.6} flat>
      <rect x={-1400} y={-900} width={4700} height={2900} fill="#151a2a" />
      <rect x={1460} y={40} width={300} height={120} rx={10} fill={wedge ? "#f6e3b4" : "#26304a"} stroke={INK} strokeWidth={6} />
      <line x1={1610} y1={40} x2={1610} y2={160} stroke={INK} strokeWidth={5} />
    </Deep>
    {wedge && (
      <Deep cam={cam} depth={0.7} flat>
        <polygon points="1470,160 1750,160 1500,900 900,900" fill="url(#ph-wedge)" />
      </Deep>
    )}
    <Deep cam={cam} depth={0.85}>
      {COLS.map((x, i) => (
        <g key={i}>
          <Pod x={x} y={UPPER} lit={(i + 0) % 3 !== 1} frame={frame} seed={i} flutter={flutterAll} />
          {i !== 1 && <Pod x={x} y={LOWER} lit={(i + 1) % 3 !== 1} frame={frame} seed={i + 11} flutter={flutterAll} />}
        </g>
      ))}
      <Pod x={POD_ONE.x} y={POD_ONE.y} lit open={door} frame={frame} seed={99} />
      <Counter frame={frame} x={POD_ONE_COUNTER.x} y={POD_ONE_COUNTER.y} tile={POD_ONE_COUNTER.tile}
        at={counter?.at} value={counter?.value ?? "365"} dark={counter === undefined || counter.dark} />
      <WallClock x={300} y={250} r={58} minutes={minutes} hours={11} />
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={880} width={4700} height={900} fill="#20232e" />
      <rect x={-1400} y={874} width={4700} height={12} fill="#3a3e4c" />
      <Desk crate={crate} />
    </Deep>
  </g>
);
