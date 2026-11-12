// Your bathroom mirror in the morning (Random, builder a): we look into the mirror, so you face us. Pale tiles round
// the glass, a towel on a rail, a shelf with a cup; the city's teal lamp clipped over the top of the glass (your tag
// hangs from it) and a small split-flap rate board stuck in the mirror's top corner. The basin is in front of you at
// the bottom of the frame. Drawn for REF. No lettering.
//
//   <Stage cam={cam} back={<MirrorBack />} actors={<>...you...<MirrorFront frame={f} rate={keys} /></>} />
//   lights for setLook: mirrorLights
import type { SetLight } from "@whatif/kit/sets/common";
import { INK, PAPER } from "@whatif/kit/theme";
import { RateBoard, TealLamp, type BoardKey } from "../device";

export const MIRROR = {
  /** The glass. */
  glass: { x: 330, y: 70, w: 1260, h: 900 },
  /** You, facing us: feet far below the frame, head near the middle of the glass. */
  you: { x: 960, y: 1370, scale: 3.2 },
  /** The basin's front edge (your hands go flat on it). */
  basin: 960,
  lamp: { x: 960, y: 92 },
  board: { x: 1440, y: 120 },
} as const;

/** The bathroom behind you, seen in the glass: a pale wall, a door frame, a towel; and round the glass, the tiles. */
export const MirrorBack: React.FC = () => {
  const g = MIRROR.glass;
  return (
    <g>
      {/* the wall outside the mirror: tiles */}
      <rect x={-1400} y={-900} width={4800} height={2600} fill="#cfe3dc" />
      {Array.from({ length: 60 }, (_, i) => <line key={`v${i}`} x1={-1400 + i * 90} y1={-900} x2={-1400 + i * 90} y2={1700} stroke="#b4cdc5" strokeWidth={4} />)}
      {Array.from({ length: 30 }, (_, i) => <line key={`h${i}`} x1={-1400} y1={-900 + i * 90} x2={3400} y2={-900 + i * 90} stroke="#b4cdc5" strokeWidth={4} />)}
      {/* in the glass: the room behind you */}
      <rect x={g.x} y={g.y} width={g.w} height={g.h} fill="#e9dcc4" />
      <rect x={g.x} y={g.y + g.h * 0.62} width={g.w} height={g.h * 0.38} fill="#d8c8aa" />
      <rect x={g.x + 80} y={g.y + 120} width={260} height={g.h} fill="#c9b08a" stroke={INK} strokeWidth={6} />
      <rect x={g.x + 100} y={g.y + 140} width={220} height={g.h} fill="#b8986e" />
      <rect x={g.x + g.w - 260} y={g.y + 260} width={180} height={14} rx={7} fill="#8a8f9c" />
      <path d={`M${g.x + g.w - 250} ${g.y + 274} h160 v260 q-80 30 -160 0z`} fill="#e07a5f" stroke={INK} strokeWidth={5} />
      <rect x={g.x} y={g.y} width={g.w} height={g.h} fill="#ffffff" opacity={0.12} />
      <path d={`M${g.x + 60} ${g.y + g.h - 40} l220 -260 M${g.x + 140} ${g.y + g.h - 30} l140 -170`} stroke="#ffffff" strokeWidth={14} opacity={0.25} strokeLinecap="round" />
    </g>
  );
};

/** In front of you: the mirror's frame, the teal lamp over the glass, the small rate board, the shelf, the basin. */
export const MirrorFront: React.FC<{ frame: number; rate: BoardKey[]; showBoard?: boolean }> = ({ frame, rate, showBoard = true }) => {
  const g = MIRROR.glass;
  return (
    <g>
      <rect x={g.x - 26} y={g.y - 26} width={g.w + 52} height={g.h + 52} rx={30} fill="none" stroke="#e8e2d4" strokeWidth={52} />
      <rect x={g.x - 52} y={g.y - 52} width={g.w + 104} height={g.h + 104} rx={44} fill="none" stroke={INK} strokeWidth={6} />
      <rect x={g.x} y={g.y} width={g.w} height={g.h} fill="none" stroke={INK} strokeWidth={6} />
      <TealLamp frame={frame} x={MIRROR.lamp.x} y={MIRROR.lamp.y} size={26} />
      {showBoard && <RateBoard frame={frame} x={MIRROR.board.x} y={MIRROR.board.y} size={50} label="YOUR RATE" keys={rate} />}
      {/* the basin and its tap */}
      <rect x={260} y={MIRROR.basin} width={1400} height={200} rx={40} fill="#f4f4f0" stroke={INK} strokeWidth={8} />
      <rect x={260} y={MIRROR.basin} width={1400} height={34} rx={17} fill="#ffffff" stroke={INK} strokeWidth={6} />
      <rect x={920} y={MIRROR.basin - 70} width={30} height={80} rx={10} fill="#b9bec8" stroke={INK} strokeWidth={5} />
      <rect x={880} y={MIRROR.basin - 82} width={110} height={24} rx={10} fill="#b9bec8" stroke={INK} strokeWidth={5} />
      <rect x={1380} y={MIRROR.basin - 70} width={60} height={72} rx={10} fill={PAPER} stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** A toothbrush (hand units). */
export const Toothbrush: React.FC = () => (
  <g transform="rotate(-70)">
    <rect x={-6} y={-60} width={12} height={74} rx={5} fill="#5aa070" stroke={INK} strokeWidth={3} />
    <rect x={-8} y={-74} width={16} height={18} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />
  </g>
);

export const mirrorLights: SetLight[] = [
  { x: MIRROR.lamp.x, y: MIRROR.lamp.y, r: 380, color: "#5fd6c8", strength: 0.3, moods: ["morning", "day", "night", "lamp", "dusk"] },
  { x: 1500, y: 300, r: 900, color: "#fff0c2", strength: 0.35, moods: ["morning", "day"] },
];
