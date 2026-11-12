// The morning train seen DOWN its length (the film's key picture, "the picture only this premise can show"): one
// vanishing point at the far end, the benches along both walls, standing passengers either side of a clear aisle, a
// row of window panes on each wall with the sunrise and the towers sliding past, the ceiling with a teal lamp over
// every head, and at the far end the end doors with a split-flap fare board over them. Drawn for REF in a simple
// perspective: a point (X across, Y up from the floor, z along the coach) lands at proj(X, Y, z), scale 1/z.
//
//   coachProj(X, Y, z) -> { x, y, s }       PASSENGERS: the 40 places (you are PASSENGERS[YOU_SEAT])
//   <CoachBack frame mood />  <CoachEnd frame fare={...} />   coachLights
import type { SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { INK, TEAL } from "@whatif/kit/theme";
import { noise, PASTELS } from "../shared";

/** The vanishing point, and how far below it the floor is at z = 1. */
export const VP = { x: 960, y: 470 };
const FLOOR_H = 640;
/** Coach half-width, window band, ceiling, bench top, the far end, in coach units (z = 1 is one REF pixel). */
export const COACH = { half: 1150, winLow: 470, winHigh: 1040, ceiling: 1460, bench: 310, end: 5.6, near: 1 } as const;
/** Figures in the coach are drawn at K times their perspective scale. */
export const K = 2.7;

export const coachProj = (X: number, Y: number, z: number) => {
  const s = 1 / z;
  return { x: VP.x + X * s, y: VP.y + (FLOOR_H - Y) * s, s };
};

/** One passenger: where (X across, z along), seated or standing, which way they face, their colours. */
export interface Passenger { X: number; z: number; sit: boolean; facing: 1 | -1; head: string; coat: string; i: number }

const COATS = ["#2a2d36", "#3b4a6b", "#4a3b46", "#2f4a48", "#3d3a52", "#5a4a3e"];
const SEAT_X = 930;
const STAND_X = 430;

/** Forty passengers, far to near: ten seated on each bench, ten standing either side of the aisle. */
export const PASSENGERS: Passenger[] = (() => {
  const out: Passenger[] = [];
  let i = 0;
  for (let r = 0; r < 10; r++) {
    const zs = 1.3 + r * 0.42;
    const zt = 1.95 + r * 0.38;
    for (const side of [-1, 1] as const) {
      out.push({ X: side * SEAT_X, z: zs + noise(r * 3 + side) * 0.06, sit: true, facing: (side === -1 ? 1 : -1), head: PASTELS[(i * 3) % PASTELS.length], coat: COATS[i % COATS.length], i: i++ });
      out.push({ X: side * (STAND_X + noise(r + side * 5) * 60), z: zt, sit: false, facing: (side === -1 ? -1 : 1), head: PASTELS[(i * 5 + 2) % PASTELS.length], coat: COATS[(i + 3) % COATS.length], i: i++ });
    }
  }
  return out.sort((a, b) => b.z - a.z);
})();

/** Your place: seated on the left bench, nearest row, nobody between you and the camera. */
export const YOU_SEAT = PASSENGERS.findIndex((p) => p.sit && p.X < 0 && p.z < 1.45);

const quad = (pts: { x: number; y: number }[]) => `M${pts.map((p) => `${p.x} ${p.y}`).join(" L")}Z`;

/** The window panes, as [zNear, zFar] pairs along each wall. */
const PANES: [number, number][] = Array.from({ length: 9 }, (_, i) => [1.15 + i * 0.5, 1.15 + i * 0.5 + 0.38]);

/** The sunrise outside: a warm sky, a low sun on the right, towers sliding back past each wall. Screen units. */
const Outside: React.FC<{ frame: number; mood: MoodName }> = ({ frame, mood }) => {
  const morning = mood === "morning";
  const sky = morning ? ["#ffcf9a", "#f4a37a"] : ["#8fd0e4", "#fbe7c2"];
  const towers = (side: -1 | 1) => {
    const run = ((frame * 2.2) % 420);
    return Array.from({ length: 9 }, (_, i) => {
      const x = side === -1 ? 520 - i * 140 - run * 0.9 + 420 : 1400 + i * 140 + run * 0.9 - 420;
      const h = 120 + noise(i * 7 + (side + 1)) * 220;
      return (
        <g key={`${side}-${i}`}>
          <rect x={x - 36} y={VP.y + 40 - h} width={72} height={h + 600} fill={morning ? "#b46a5e" : "#8fa3b8"} opacity={0.85} />
          {Array.from({ length: Math.floor(h / 40) }, (_, w) => (
            <rect key={w} x={x - 22 + (w % 2) * 24} y={VP.y + 52 - h + Math.floor(w / 2) * 40} width={14} height={14}
              fill={noise(i * 13 + w) < 0.25 ? "#ffe39a" : "#7a4a50"} opacity={0.7} />
          ))}
        </g>
      );
    });
  };
  return (
    <g>
      <defs>
        <linearGradient id="coach-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.6" stopColor={sky[1]} />
          <stop offset="1" stopColor="#e07a5f" />
        </linearGradient>
        <radialGradient id="coach-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4c8" />
          <stop offset="0.35" stopColor="#ffd98a" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ffb070" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-1400} y={-900} width={4800} height={2800} fill="url(#coach-sky)" />
      {morning && <circle cx={1660} cy={VP.y - 10} r={300} fill="url(#coach-sun)" />}
      {morning && <circle cx={1660} cy={VP.y - 10} r={64} fill="#fff4c8" />}
      {towers(-1)}
      {towers(1)}
      <rect x={-1400} y={VP.y + 40} width={4800} height={1400} fill={morning ? "#7a4a50" : "#6b7a8a"} />
    </g>
  );
};

/** Everything behind the passengers: the outside through the panes, the walls, ceiling, floor and benches. */
export const CoachBack: React.FC<{ frame: number; mood: MoodName }> = ({ frame, mood }) => {
  const { half, winLow, winHigh, ceiling, bench, end, near } = COACH;
  const P = coachProj;
  const wall = (side: -1 | 1) => quad([P(side * half, 0, near), P(side * half, ceiling, near), P(side * half, ceiling, end), P(side * half, 0, end)]);
  const panes = (side: -1 | 1) => PANES.map(([a, b]) => quad([P(side * half, winLow, a), P(side * half, winHigh, a), P(side * half, winHigh, b), P(side * half, winLow, b)])).join(" ");
  const holes = `${panes(-1)} ${panes(1)}`;
  const benchTop = (side: -1 | 1) => quad([P(side * half, bench, near), P(side * (half - 330), bench, near), P(side * (half - 330), bench, end), P(side * half, bench, end)]);
  const benchFront = (side: -1 | 1) => quad([P(side * (half - 330), bench, near), P(side * (half - 330), 60, near), P(side * (half - 330), 60, end), P(side * (half - 330), bench, end)]);
  return (
    <g>
      <clipPath id="coach-panes"><path d={holes} /></clipPath>
      <g clipPath="url(#coach-panes)"><Outside frame={frame} mood={mood} /></g>
      {/* the walls with the panes cut out */}
      {([-1, 1] as const).map((side) => (
        <g key={side}>
          <path d={`${wall(side)} ${panes(side)}`} fillRule="evenodd" fill={side === -1 ? "#c3cccc" : "#b4bfc0"} stroke={INK} strokeWidth={3} />
          {PANES.map(([a, b], i) => (
            <path key={i} d={quad([P(side * half, winLow, a), P(side * half, winHigh, a), P(side * half, winHigh, b), P(side * half, winLow, b)])}
              fill="none" stroke="#5c6675" strokeWidth={Math.max(3, 14 / a)} strokeLinejoin="round" />
          ))}
          {/* a glint across each pane */}
          {PANES.map(([a, b], i) => {
            const p0 = P(side * half, winLow + 80, a + 0.08), p1 = P(side * half, winHigh - 60, b - 0.05);
            return <line key={`g${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#fff" strokeWidth={Math.max(2, 18 / a)} opacity={0.12} />;
          })}
        </g>
      ))}
      {/* ceiling and floor */}
      <path d={quad([P(-half, ceiling, near), P(half, ceiling, near), P(half, ceiling, end), P(-half, ceiling, end)])} fill="#d7dcdc" stroke={INK} strokeWidth={3} />
      {[-STAND_X, STAND_X].map((x) => {
        const a = P(x, ceiling - 150, near), b = P(x, ceiling - 150, end);
        return <line key={x} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8a929e" strokeWidth={10} />;
      })}
      <path d={quad([P(-half, 0, near), P(half, 0, near), P(half, 0, end), P(-half, 0, end)])} fill="#6d7482" stroke={INK} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => {
        const z = 1.1 + i * 0.4;
        const a = P(-half, 0, z), b = P(half, 0, z);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#000" strokeWidth={Math.max(1, 6 / z)} opacity={0.1} />;
      })}
      <path d={quad([P(-140, 0, near), P(140, 0, near), P(140, 0, end), P(-140, 0, end)])} fill="#7c8492" opacity={0.6} />
      {([-1, 1] as const).map((side) => (
        <g key={`b${side}`}>
          <path d={benchFront(side)} fill="#2f4f66" stroke={INK} strokeWidth={3} />
          <path d={benchTop(side)} fill="#4f82a0" stroke={INK} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

/** The far end: the end wall, the end doors with their windows, the fare board's place over them (draw the board
 *  with <RateBoard> at FARE_AT). */
export const CoachEnd: React.FC = () => {
  const { half, ceiling, end } = COACH;
  const P = coachProj;
  const tl = P(-half, ceiling, end), br = P(half, 0, end);
  const d0 = P(-260, 0, end), d1 = P(260, 900, end);
  return (
    <g>
      <rect x={tl.x} y={tl.y} width={br.x - tl.x} height={br.y - tl.y} fill="#aeb8ba" stroke={INK} strokeWidth={3} />
      <rect x={d0.x} y={d1.y} width={d1.x - d0.x} height={d0.y - d1.y} fill="#8d97a3" stroke={INK} strokeWidth={3} />
      <line x1={VP.x} y1={d1.y} x2={VP.x} y2={d0.y} stroke={INK} strokeWidth={3} />
      {[-1, 1].map((s) => {
        const a = P(s * 200, 760, end), b = P(s * 40, 420, end);
        return <rect key={s} x={Math.min(a.x, b.x)} y={a.y} width={Math.abs(b.x - a.x)} height={b.y - a.y} rx={6} fill="#ffd9a0" opacity={0.85} stroke={INK} strokeWidth={2} />;
      })}
    </g>
  );
};

/** Where the fare board hangs: over the end doors (top centre), and its tile size. */
export const FARE_AT = (() => {
  const p = coachProj(0, 1300, COACH.end);
  return { x: p.x, y: p.y - 40, size: 58 };
})();

/** A teal lamp on the ceiling over a passenger: its point, for the tag's thread. */
export const lampOver = (p: Passenger) => coachProj(p.X, COACH.ceiling - 30, p.z);

/** The coach's light: the sun through the right-hand panes. */
export const coachLights: SetLight[] = [
  { x: 1660, y: VP.y, r: 520, color: "#ffd9a0", strength: 0.35, moods: ["morning"] },
  { x: VP.x, y: VP.y - 260, r: 900, color: "#e9fffb", strength: 0.12, moods: ["morning", "day"] },
];

export { TEAL };
