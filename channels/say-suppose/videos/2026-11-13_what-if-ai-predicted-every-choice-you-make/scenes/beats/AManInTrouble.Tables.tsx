// The tables nearest your stall, in the near foreground (A Man in Trouble): seated diners who turn toward his crimson
// card and away, the couple on a date who pick up their trays and leave; and the calendar on the pillar, its last day.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, walkPose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { Deep } from "../sets/common";
import { COURT } from "../sets/FoodCourt";
import { blinking, DATE_HER, DATE_HIM, PASTELS } from "../shared";
import { Tray } from "./SixtyPerCent.Parts";

/** A diner at a near table. `turn`: 0 eating, 1 looking up at his card, 2 turned away. `leave` 0..1 walks them off. */
export interface Diner { x: number; head: string; coat: string; facing: 1 | -1; turn?: 0 | 1 | 2; leave?: number }

export const NEAR = { seat: 1150, scale: 2.0, tables: [330, 1400] } as const;

/** The couple at the left table and two strangers at the right one. */
export const NEAR_DINERS: Diner[] = [
  { x: 180, head: DATE_HER.head, coat: DATE_HER.coat, facing: 1 },
  { x: 480, head: DATE_HIM.head, coat: DATE_HIM.coat, facing: -1 },
  { x: 1250, head: PASTELS[0], coat: "#3b4a6b", facing: 1 },
  { x: 1550, head: PASTELS[3], coat: "#2a2d36", facing: -1 },
];

export const NearTables: React.FC<{ frame: number; diners: Diner[]; tables?: number[] }> = ({ frame, diners, tables = [...NEAR.tables] }) => (
  <g>
    {diners.map((d, i) => {
      const s = NEAR.scale;
      if ((d.leave ?? 0) >= 1) return null;
      if (d.leave !== undefined && d.leave > 0) {
        const x = d.x - d.leave * 900;
        return (
          <Figure key={i} x={x} y={NEAR.seat + 112 * s} scale={s} facing={-1} pose={{ ...walkPose(frame * 0.2 + i), armF: [70, 40] }} head={d.head} coat={d.coat}
            mouth="flat" brows="flat" lids={0.3} look={{ x: 0.8, y: 0.2 }} blink={blinking(frame, 20 + i)} time={frame} held={<Tray tilt={0} />} />
        );
      }
      const turn = d.turn ?? 0;
      const facing = turn === 2 ? (-d.facing as 1 | -1) : d.facing;
      const look = turn === 1 ? { x: d.facing === 1 ? 0.7 : -0.7, y: -0.9 } : turn === 2 ? { x: 0.3, y: 0.7 } : { x: 0.5, y: 0.6 };
      const eating = turn === 0 && Math.floor((frame + i * 13) / 18) % 2 === 0;
      return (
        <Figure key={i} x={d.x} y={NEAR.seat + 112 * s} scale={s} facing={facing} pose={{ ...SEATED, armF: eating ? [70, 70] : [40, 50] }} head={d.head}
          coat={d.coat} mouth={turn === 1 ? "flat" : eating ? "o" : "flat"} brows={turn === 1 ? "raised" : turn === 2 ? "flat" : "none"} lids={turn === 2 ? 0.45 : 0.1}
          look={turn === 1 && facing !== d.facing ? { x: -look.x, y: look.y } : look} blink={blinking(frame, 20 + i)} time={frame} />
      );
    })}
    {tables.map((x) => (
      <g key={x}>
        <rect x={x - 200} y={NEAR.seat - 150} width={400} height={26} rx={6} fill="#8a8f9c" stroke={INK} strokeWidth={6} />
        <rect x={x - 12} y={NEAR.seat - 124} width={24} height={300} fill="#6b6f7a" stroke={INK} strokeWidth={4} />
        <ellipse cx={x - 60} cy={NEAR.seat - 156} rx={50} ry={12} fill="#e8e4da" stroke={INK} strokeWidth={4} />
        <ellipse cx={x + 70} cy={NEAR.seat - 156} rx={50} ry={12} fill="#e8e4da" stroke={INK} strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** The calendar on the pillar: a month of days crossed off one by one, the last one circled. Drawn on the pillar's
 *  own layer so it sits on it at every camera. */
export const PillarCalendar: React.FC<{ cam: Camera; frame: number; at: number; done: number }> = ({ cam, frame, at, done }) => {
  const x0 = COURT.pillar.x - 62, y0 = 560;
  const cells = Array.from({ length: 30 }, (_, n) => ({ c: n % 6, r: Math.floor(n / 6) }));
  const crossed = Math.round(29 * Math.min(1, Math.max(0, (frame - at) / Math.max(1, done - at))));
  const last = cells[29];
  const lx = x0 + 10 + last.c * 19 + 9, ly = y0 + 42 + last.r * 22 + 10;
  return (
    <Deep cam={cam} depth={0.95}>
      <rect x={x0} y={y0} width={124} height={160} rx={4} fill="#f1e9d6" stroke={INK} strokeWidth={4} />
      <rect x={x0} y={y0} width={124} height={30} fill="#8f939b" stroke={INK} strokeWidth={4} />
      {cells.map(({ c, r }, n) => (
        <g key={n}>
          <rect x={x0 + 10 + c * 19} y={y0 + 42 + r * 22} width={16} height={18} fill="none" stroke="#b8ad96" strokeWidth={2} />
          {n < crossed && <path d={`M${x0 + 12 + c * 19} ${y0 + 44 + r * 22} l12 14 m0 -14 l-12 14`} stroke={INK} strokeWidth={2.5} />}
        </g>
      ))}
      <DrawLine d={`M${lx + 14} ${ly} A14 14 0 1 1 ${lx + 14} ${ly - 0.1}`} from={done + 4} to={done + 20} color={CRIMSON} width={4} />
    </Deep>
  );
};

