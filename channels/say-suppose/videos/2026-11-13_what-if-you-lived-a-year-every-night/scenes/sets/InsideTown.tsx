// The inside town (a set drawn for this film): the world your mind lives in for a year each night. A street of paper
// house fronts in warm colours, roofs and a far skyline behind, and in the sky, where the sun should be, the same
// split-flap counter that sits on every pod hatch, blurring through its digits (it only stops once, in the slow room).
// `room` draws the slow room's plain door on the right with its one window and a wall clock inside; `queue` adds a line
// of grey heads down the street to that door. Drawn for REF in three depths: sky and far roofs (0.5), house fronts
// (0.8), the street (1).
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { SetLight } from "@whatif/kit/sets/common";
import { WallClock } from "../parts";
import { noise } from "../shared";
import { Deep, REF } from "./common";

export const TOWN_FLOOR = 960;
const ALL: MoodName[] = ["morning", "day", "dusk", "night", "lamp", "frozen"];
const FRONTS = ["#e8b98a", "#d79c7a", "#c9b07a", "#e2c8a0", "#b7a58f", "#d8a98f", "#c2a07e"];

export const TOWN = {
  /** The slow room's door, right of centre on the street. */
  door: { x: 1450, y: 600, w: 190, h: 330 },
  /** Its one window, left of the door. */
  window: { x: 1160, y: 560, w: 230, h: 200 },
  cameras: {
    wide: REF,
    window: { x: 1275, y: 660, zoom: 2.2 } as Camera,
    street: { x: 700, y: 620, zoom: 1.35 } as Camera,
  },
};

/** Lights for setLook: the street lamps at dusk and after, and the slow room's window when `room`. */
export function townLights(room = false): SetLight[] {
  const out: SetLight[] = [200, 700, 1700].map((x) => ({ x, y: 520, depth: 1, r: 240, color: "#ffd99a", strength: 0.35, moods: ["dusk", "night", "lamp"] as MoodName[] }));
  if (room) out.push({ x: TOWN.window.x + TOWN.window.w / 2, y: TOWN.window.y + TOWN.window.h / 2, depth: 0.8, r: 260, color: "#ffe6b0", strength: 0.45, moods: ALL });
  return out;
}

/** The counter that hangs in the sky in place of the sun. It blurs (`spin` true) except in the slow room's one click. */
export const SkyCounter: React.FC<{ frame: number; x?: number; y?: number; spin?: boolean; value?: string }> = ({ frame, x = 960, y = 150, spin = true, value = "365" }) => {
  const chars = spin ? [0, 1, 2].map((k) => String(Math.floor(noise(frame * 3 + k * 11) * 10))) : value.split("");
  return (
    <g>
      <circle cx={x} cy={y} r={150} fill="#fff1c4" opacity={0.25} />
      <rect x={x - 120} y={y - 60} width={240} height={120} rx={18} fill={INK} stroke={PAPER} strokeWidth={6} />
      {chars.map((ch, k) => (
        <g key={k} transform={`translate(${x - 70 + k * 70} ${y})`}>
          <rect x={-30} y={-44} width={60} height={88} rx={8} fill={CRIMSON} stroke={PAPER} strokeWidth={4} opacity={spin ? 0.85 : 1} />
          <line x1={-30} y1={0} x2={30} y2={0} stroke="#7a1022" strokeWidth={4} />
          <text x={0} y={24} textAnchor="middle" fontSize={66} fontWeight={800} fill={PAPER} opacity={spin ? 0.6 : 1}>{ch}</text>
        </g>
      ))}
      {spin && <rect x={x - 120} y={y - 8} width={240} height={16} fill={PAPER} opacity={0.15} />}
    </g>
  );
};

/** A house front: a coloured wall, a pitched roof, two windows and a door. */
const Front: React.FC<{ x: number; w: number; top: number; c: string; lit: boolean }> = ({ x, w, top, c, lit }) => (
  <g>
    <polygon points={`${x - 10},${top} ${x + w / 2},${top - 90} ${x + w + 10},${top}`} fill="#7a4b3a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={x} y={top} width={w} height={TOWN_FLOOR - 60 - top} fill={c} stroke={INK} strokeWidth={6} />
    {[0.22, 0.62].map((f, i) => (
      <rect key={i} x={x + w * f} y={top + 50} width={w * 0.18} height={70} rx={6} fill={lit ? "#ffd98a" : "#5a6a86"} stroke={INK} strokeWidth={5} />
    ))}
    <rect x={x + w * 0.4} y={TOWN_FLOOR - 60 - 140} width={w * 0.2} height={140} rx={6} fill="#5b3e30" stroke={INK} strokeWidth={5} />
  </g>
);

export interface TownProps {
  cam: Camera;
  frame: number;
  /** The sky counter blurs (true) or has stopped (false: the slow room's one click). */
  spin?: boolean;
  /** Draw the slow room's door, window and clock on the right. */
  room?: boolean;
  /** Minutes on the slow room's wall clock (it moves at outside speed: a minute a minute). */
  clockMinutes?: number;
  /** Lit windows (dusk and after). */
  lit?: boolean;
}

/** Everything behind the actors in the inside town. */
export const TownBack: React.FC<TownProps> = ({ cam, frame, spin = true, room, clockMinutes = 20, lit }) => (
  <g>
    <Deep cam={cam} depth={0.45} flat>
      <rect x={-1400} y={-900} width={4700} height={2900} fill="#8fb6d8" />
      <SkyCounter frame={frame} spin={spin} />
    </Deep>
    <Deep cam={cam} depth={0.6}>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-300 + i * 220} y={330 + (i % 3) * 30} width={190} height={700} fill="#9aa7bd" stroke={INK} strokeWidth={4} opacity={0.7} />
      ))}
    </Deep>
    <Deep cam={cam} depth={0.8}>
      {Array.from({ length: 8 }, (_, i) => {
        const x = -200 + i * 300;
        if (room && x > 1050 && x < 1700) return null;
        return <Front key={i} x={x} w={270} top={420 + (i % 2) * 40} c={FRONTS[i % FRONTS.length]} lit={!!lit} />;
      })}
      {room && (
        <g>
          {/* the slow room: a plain grey front, one window, one door */}
          <rect x={1100} y={430} width={600} height={TOWN_FLOOR - 60 - 430} fill="#b8b4aa" stroke={INK} strokeWidth={6} />
          <rect x={TOWN.window.x} y={TOWN.window.y} width={TOWN.window.w} height={TOWN.window.h} rx={8} fill="#ffe6b0" stroke={INK} strokeWidth={6} />
          <WallClock x={TOWN.window.x + TOWN.window.w / 2} y={TOWN.window.y + 60} r={38} minutes={clockMinutes} hours={4} />
          <rect x={TOWN.window.x + 40} y={TOWN.window.y + 150} width={150} height={22} rx={6} fill="#7a5d47" stroke={INK} strokeWidth={4} />
          <rect x={TOWN.door.x} y={TOWN.door.y} width={TOWN.door.w} height={TOWN.door.h} rx={8} fill="#6b5a4a" stroke={INK} strokeWidth={6} />
          <circle cx={TOWN.door.x + 30} cy={TOWN.door.y + 170} r={9} fill={INK} />
        </g>
      )}
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={TOWN_FLOOR - 60} width={4700} height={900} fill="#b9a68c" />
      <rect x={-1400} y={TOWN_FLOOR - 66} width={4700} height={12} fill="#8d7a62" />
    </Deep>
  </g>
);
