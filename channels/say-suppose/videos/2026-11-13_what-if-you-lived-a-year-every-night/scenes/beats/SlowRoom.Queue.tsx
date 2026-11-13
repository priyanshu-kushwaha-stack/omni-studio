// Pieces for "The Slow Room" (SlowRoom.tsx): the town widened for the long pull-back (sky, far blocks, house fronts and
// street far past the set's own edges), the feast hall (lit and loud), the queue of grey heads with heavy lids winding
// down the street to the slow room's door, the door opening, the bench and the old sleeper's ticket, the two inside the
// window, and the clock's second hand. Everything here goes in a <Stage> back slot (Deep layers in REF coordinates) or
// its actors slot (world coordinates), as noted.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { TOWN, TOWN_FLOOR } from "../sets/InsideTown";
import { Deep } from "../sets/common";
import { blinking, noise, OLD, PASTELS } from "../shared";

const GREYS = ["#b9b6ae", "#a9a59c", "#c8c4bb", "#9c988f", "#d1cdc4"];
const COATS = [OLD.coat, "#5b5450", "#6e6458", "#4f4a52", "#7a6a5a"];
/** The street line the front row of the queue stands on, and how far the queue runs back. */
export const QUEUE = { y: 935, scale: 0.78, gap: 64, head: 1100, tail: -2800 };
/** The bench beside the door, outside. */
export const BENCH = { x: 1690, w: 200, top: 878 };
/** Your place in the queue (front row). */
export const YOUR_PLACE = 520;

/** The sky past the set's edges, so a wide pull-back never runs off the paper. Back slot, before TownBack. */
export const WideSky: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={0.45} flat>
    <rect x={-9000} y={-4000} width={18000} height={9000} fill="#8fb6d8" />
  </Deep>
);

/** The town past the set's edges (far blocks, house fronts, the street). Back slot, after TownBack (it only draws
 *  outside the set's own blocks and fronts). */
export const WideTown: React.FC<{ cam: Camera }> = ({ cam }) => (
  <g>
    <Deep cam={cam} depth={0.6}>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={-3800 + i * 220} y={330 + (i % 3) * 30} width={190} height={900} fill="#9aa7bd" stroke={INK} strokeWidth={4} opacity={0.7} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`r${i}`} x={2400 + i * 220} y={330 + (i % 3) * 30} width={190} height={900} fill="#9aa7bd" stroke={INK} strokeWidth={4} opacity={0.7} />
      ))}
    </Deep>
    <Deep cam={cam} depth={0.8}>
      {Array.from({ length: 11 }, (_, i) => {
        const x = -3500 + i * 300;
        return (
          <g key={i}>
            <polygon points={`${x - 10},${420 + (i % 2) * 40} ${x + 135},${330 + (i % 2) * 40} ${x + 280},${420 + (i % 2) * 40}`} fill="#7a4b3a" stroke={INK} strokeWidth={6} />
            <rect x={x} y={420 + (i % 2) * 40} width={270} height={TOWN_FLOOR - 60 - 420 - (i % 2) * 40} fill={["#e8b98a", "#d79c7a", "#c9b07a", "#e2c8a0", "#b7a58f"][i % 5]} stroke={INK} strokeWidth={6} />
            <rect x={x + 60} y={500 + (i % 2) * 40} width={50} height={70} rx={6} fill="#ffd98a" stroke={INK} strokeWidth={5} />
            <rect x={x + 160} y={500 + (i % 2) * 40} width={50} height={70} rx={6} fill="#ffd98a" stroke={INK} strokeWidth={5} />
          </g>
        );
      })}
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-9000} y={TOWN_FLOOR - 60} width={18000} height={3000} fill="#b9a68c" />
    </Deep>
  </g>
);

/** The feast hall: a wide warm front with tall lit windows, heads bobbing behind them, bunting and lanterns. Back slot,
 *  after TownBack. */
export const FeastHall: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <Deep cam={cam} depth={0.8}>
    <rect x={60} y={380} width={620} height={TOWN_FLOOR - 60 - 380} fill="#b5523b" stroke={INK} strokeWidth={6} />
    <polygon points="40,380 370,250 700,380" fill="#6b3a2e" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[0, 1, 2].map((w) => {
      const wx = 100 + w * 195;
      return (
        <g key={w}>
          <path d={`M${wx} 700 V520 Q${wx + 75} 440 ${wx + 150} 520 V700 Z`} fill="#ffd98a" stroke={INK} strokeWidth={6} />
          {[0, 1, 2].map((h) => {
            const bob = Math.sin(frame / 5 + w * 2 + h) * 8;
            return <circle key={h} cx={wx + 30 + h * 45} cy={640 + bob} r={20} fill={PASTELS[(w * 3 + h) % PASTELS.length]} stroke={INK} strokeWidth={3} />;
          })}
          <rect x={wx + 20} y={650} width={110} height={10} rx={4} fill="#8a5c3b" />
        </g>
      );
    })}
    <path d="M60 400 Q370 470 680 400" fill="none" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 11 }, (_, i) => {
      const t = i / 10;
      const x = 60 + 620 * t;
      const y = 400 + 70 * 4 * t * (1 - t);
      return <polygon key={i} points={`${x - 14},${y} ${x + 14},${y} ${x},${y + 26}`} fill={[CRIMSON, "#f2b632", "#1d9a8f"][i % 3]} />;
    })}
    <rect x={300} y={720} width={140} height={180} rx={8} fill="#ffe6b0" stroke={INK} strokeWidth={6} />
  </Deep>
);

/** One bowed grey head in the queue (a Figure). */
const Sleeper: React.FC<{ x: number; y: number; scale: number; i: number; frame: number }> = ({ x, y, scale, i, frame }) => {
  const sway = Math.sin(frame / 40 + i) * 2;
  return (
    <Figure x={x} y={y} scale={scale} facing={1} pose={{ ...STAND, lean: 8 + noise(i) * 6, tilt: 14 + noise(i + 3) * 8 + sway, armF: [12, 18] }}
      head={GREYS[i % GREYS.length]} coat={COATS[(i * 7) % COATS.length]} brows={i % 3 ? "none" : "sad"} lids={0.82 + noise(i + 9) * 0.1}
      mouth="flat" eyes={1} look={{ x: 0.6, y: 0.7 }} blink={blinking(frame, i)} />
  );
};

/** The queue's front row, in the actors slot, from the door back down the street. `skip` leaves a gap where you stand
 *  (or stood). `from` hides anyone left of it (the feast-hall shot shows no queue). */
export const QueueFront: React.FC<{ frame: number; skip?: number; from?: number }> = ({ frame, skip, from = -99999 }) => {
  const out: React.ReactNode[] = [];
  let i = 0;
  for (let x = QUEUE.head; x > QUEUE.tail; x -= QUEUE.gap, i++) {
    if (x < from) break;
    if (skip !== undefined && Math.abs(x - skip) < QUEUE.gap / 2) continue;
    out.push(<Sleeper key={i} x={x + (noise(i + 40) - 0.5) * 14} y={QUEUE.y} scale={QUEUE.scale} i={i} frame={frame} />);
  }
  return <g>{out}</g>;
};

/** The rows the queue winds back in, further down the street: figures, then just heads. Back slot, after TownBack. */
export const QueueBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <g>
    {[{ d: 0.84, y: 892, n: 120, head: 9 }, { d: 0.87, y: 900, n: 120, head: 11 }, { d: 0.9, y: 908, n: 110, head: 13 }].map((row, r) => (
      <Deep key={`h${r}`} cam={cam} depth={row.d} flat>
        {Array.from({ length: row.n }, (_, i) => {
          const x = 1080 - i * 36 - (r % 2) * 18;
          return (
            <g key={i}>
              <path d={`M${x - row.head * 1.3} ${row.y + row.head * 2.6} Q${x} ${row.y + row.head * 0.6} ${x + row.head * 1.3} ${row.y + row.head * 2.6} Z`} fill={COATS[(i + r) % COATS.length]} />
              <circle cx={x + 3} cy={row.y + row.head * 0.2} r={row.head} fill={GREYS[(i + r * 2) % GREYS.length]} stroke={INK} strokeWidth={2} />
            </g>
          );
        })}
      </Deep>
    ))}
    <Deep cam={cam} depth={0.94}>
      {Array.from({ length: 64 }, (_, i) => (
        <Sleeper key={i} x={1060 - i * 62} y={920} scale={0.6} i={i + 200} frame={frame} />
      ))}
    </Deep>
  </g>
);

/** The slow room's door swung open onto warm light (open 0..1), and the red second hand on its clock. Back slot, after
 *  TownBack (depth 0.8, the room's front). */
export const RoomOpen: React.FC<{ cam: Camera; frame: number; open: number; inside: number; talk: number }> = ({ cam, frame, open, inside, talk }) => {
  const d = TOWN.door;
  const w = TOWN.window;
  const cx = w.x + w.w / 2, cy = w.y + 60;
  const a = (frame / 30) * 6;
  const sx = 0.3;
  const benchTop = w.y + 150;
  return (
    <Deep cam={cam} depth={0.8}>
      {/* the two inside, on the bench under the window: one tells a story, hands moving; the other listens */}
      {inside > 0 && (
        <g opacity={inside}>
          <Figure x={w.x + 70} y={seatedY(benchTop, sx)} scale={sx} facing={1} pose={{ ...SEATED, armF: [70 + 30 * Math.sin(frame / 6) * talk, 50 + 20 * Math.sin(frame / 4) * talk], armB: [40 + 25 * Math.sin(frame / 5 + 1) * talk, 60] }}
            head={OLD.head} coat={OLD.coat} brows="raised" lids={0.75} mouth={talk > 0 && Math.floor(frame / 9) % 2 ? "open" : "smile"} eyes={1} look={{ x: 1, y: 0 }} blink={blinking(frame, 51)} />
          <Figure x={w.x + 160} y={seatedY(benchTop, sx)} scale={sx} facing={-1} pose={{ ...SEATED, tilt: -8, lean: -4 }}
            head="#a9a59c" coat="#5b5450" brows="none" lids={0.8} mouth="smile" eyes={1} look={{ x: 1, y: 0.1 }} blink={blinking(frame, 52)} />
          <rect x={w.x + 40} y={benchTop} width={150} height={16} rx={6} fill="#7a5d47" stroke={INK} strokeWidth={3} />
        </g>
      )}
      <line x1={cx} y1={cy} x2={cx + Math.sin((a * Math.PI) / 180) * 30} y2={cy - Math.cos((a * Math.PI) / 180) * 30} stroke={CRIMSON} strokeWidth={3} strokeLinecap="round" />
      {open > 0 && (
        <g>
          <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={8} fill="#ffe6b0" stroke={INK} strokeWidth={6} />
          <rect x={d.x + d.w * (1 - 0.25 * open) - 6} y={d.y - 4} width={d.w * (1 - 0.82 * open)} height={d.h + 8} rx={8} fill="#6b5a4a" stroke={INK} strokeWidth={6} />
        </g>
      )}
    </Deep>
  );
};

/** The old sleeper's ticket: a paper strip covered in tiny crimson flaps, a year's worth. Figure `held` units. */
export const Ticket: React.FC = () => (
  <g transform="rotate(-14) translate(-10 -46)">
    <rect x={-30} y={-6} width={60} height={88} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
    {Array.from({ length: 48 }, (_, i) => (
      <rect key={i} x={-24 + (i % 6) * 8.4} y={2 + Math.floor(i / 6) * 9.4} width={6} height={7} rx={1} fill={CRIMSON} opacity={0.85} />
    ))}
  </g>
);

/** The bench outside, beside the door. Actors slot. */
export const Bench: React.FC = () => (
  <g>
    <rect x={BENCH.x} y={BENCH.top} width={BENCH.w} height={16} rx={6} fill="#7a5d47" stroke={INK} strokeWidth={4} />
    <line x1={BENCH.x + 20} y1={BENCH.top + 14} x2={BENCH.x + 20} y2={BENCH.top + 62} stroke={INK} strokeWidth={8} />
    <line x1={BENCH.x + BENCH.w - 20} y1={BENCH.top + 14} x2={BENCH.x + BENCH.w - 20} y2={BENCH.top + 62} stroke={INK} strokeWidth={8} />
  </g>
);
