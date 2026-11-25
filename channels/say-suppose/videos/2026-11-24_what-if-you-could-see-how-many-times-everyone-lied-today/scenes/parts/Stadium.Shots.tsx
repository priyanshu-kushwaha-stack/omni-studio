// The people of the Stadium beat (look C), in world units on the stadium-night plate: you and your neighbours in the
// nearest row of the stands, the crimson stranger two rows down behind a railing counting the directors' box on their
// fingers, a row of fans between you who stand for a corner, and the striker and a defender on the pitch (a long-lens
// shot: the painted pitch goes soft behind them). Code puppets only. No AI images.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, SIT, STAND, type Pose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, TEAL } from "@whatif/kit/theme";
import { Body, counterSpot } from "./SayItAgain.Kit";
import { handAt } from "./RivalParts";
import { GLOW, mix, PASTELS, STRANGER } from "../shared";

/** Your row (the nearest), the stranger's row two down (further, smaller), and the fans' row between. */
export const ROW = {
  you: { seat: 1180, s: 1.6 }, stranger: { seat: 1030, s: 1.2 }, fans: { seat: 1150, s: 1.3 },
};
export const YOU_X = 820;
export const STRANGER_X = 1330;
/** Neighbours in your row: x, facing, head, coat, count. */
export const NEIGHBOURS = [
  { x: 1210, facing: -1 as const, head: PASTELS[2], coat: "#3d5a6c", base: 0 },
  { x: 420, facing: 1 as const, head: PASTELS[6], coat: "#6b4b3a", base: 1 },
];
export const seatY = (row: { seat: number; s: number }) => seatedY(row.seat, row.s);

/** The crimson stranger, counting on their fingers with a raised hand; the counter over them hidden behind the
 *  railing of the row in front, only its glow showing over it. `tap` counts. */
export const Stranger: React.FC<{ frame: number; tap: number }> = ({ frame, tap }) => {
  const { s } = ROW.stranger;
  const y = seatY(ROW.stranger);
  const pose: Pose = { ...SEATED, armB: [-160 - (tap % 2) * 8, 6], armF: [25, 35], tilt: -6 };
  const c = counterSpot(STRANGER_X, y, s, pose, 1, 46);
  const hand = handAt(STRANGER_X, y, s, { ...pose, armF: pose.armB }, 1);
  return (
    <g>
      <Figure x={STRANGER_X} y={y} scale={s} facing={1} pose={pose} head={STRANGER.head} coat={STRANGER.coat} time={frame}
        look={{ x: 0.9, y: -0.6 }} brows="flat" lids={0.3} mouth="flat" blink={(frame + 40) % 97 < 4} />
      {Array.from({ length: 1 + (tap % 5) }, (_, i) => (
        <line key={i} x1={hand.x - 12 + i * 7} y1={hand.y} x2={hand.x - 14 + i * 8} y2={hand.y - 22} stroke={STRANGER.head} strokeWidth={6} strokeLinecap="round" />
      ))}
      <ellipse cx={c.x} cy={c.y} rx={80} ry={50} fill={GLOW} opacity={0.2} />
    </g>
  );
};

/** The railing of the row in front of the stranger, across the space over their head. */
export const Railing: React.FC = () => {
  const c = counterSpot(STRANGER_X, seatY(ROW.stranger), ROW.stranger.s, SEATED, 1, 46);
  return (
    <g>
      {[1130, 1530].map((x) => <rect key={x} x={x - 6} y={c.y - 34} width={12} height={460} fill={TEAL} stroke={INK} strokeWidth={3} />)}
      <rect x={1110} y={c.y - 40} width={440} height={26} rx={10} fill={TEAL} stroke={INK} strokeWidth={4} />
      <rect x={1110} y={c.y + 4} width={440} height={16} rx={7} fill={TEAL} stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** Fans in the row between you and the stranger, watching the pitch, dim counters over them; `stand` 0..1 they stand
 *  for a corner (and hide the stranger). */
export const Fans: React.FC<{ frame: number; stand: number }> = ({ frame, stand }) => (
  <g>
    {[1460, 1600, 1740].map((x0, i) => {
      const x = x0 - (i === 0 ? 100 : 60) * stand;
      const pose: Pose = stand > 0.5 ? { ...STAND, armF: [150 + Math.sin(frame / 4 + i) * 10, 10], armB: [-20, 10] } : SEATED;
      const y = seatY(ROW.fans) - stand * 110;
      return (
        <Body x={x} y={y} scale={ROW.fans.s} facing={1} pose={pose} head={PASTELS[(i * 3 + 1) % PASTELS.length]} key={i}
          coat={["#3d6fb0", CRIMSON, "#1d9a8f", "#6a5a3a"][i % 4]} frame={frame} id={`fan${i}`} count={{ base: i % 3 === 1 ? 1 : 0 }} size={40}
          seed={i + 9} look={{ x: 0.7, y: 0.5 }} mouth={stand > 0.5 ? "open" : "flat"} brows={stand > 0.5 ? "raised" : "none"} />
      );
    })}
  </g>
);

/** Your neighbours in the nearest row, dim counters over them; `turn` 0..1 they turn to look at you. */
export const Neighbours: React.FC<{ frame: number; turn?: number; phone?: React.ReactNode }> = ({ frame, turn = 0, phone }) => (
  <g>
    {NEIGHBOURS.map((n, i) => (
      <Body key={i} x={n.x} y={seatY(ROW.you)} scale={ROW.you.s} facing={n.facing} pose={{ ...SEATED, armF: i === 0 && turn > 0.5 ? [118, 20] : [25, 35] }}
        head={n.head} coat={n.coat} frame={frame} id={`nb${i}`} count={{ base: n.base }} size={44} seed={3 + i * 3}
        look={{ x: mix(i === 0 ? 0.5 : -0.4, -0.9 * n.facing, turn), y: mix(-0.5, 0, turn) }}
        mouth={turn > 0.5 ? "o" : "smile"} brows={turn > 0.5 ? "raised" : "none"} held={i === 0 && turn > 0.5 ? phone : undefined} />
    ))}
  </g>
);

/** The striker going down and the defender, on the pitch (long lens). `down` 0..1. */
export const STRIKER = { x: 760, y: 900, s: 0.95 };
export function strikerPose(down: number, frame: number): Pose {
  return down < 1
    ? { ...STAND, lean: mix(0, -40, down), armF: [mix(30, 205, down), 0], armB: [mix(-30, 160, down), 0] }
    : { ...SIT, drop: 104, armF: [205 + Math.sin(frame / 4) * 6, -4], armB: [160 - Math.sin(frame / 4) * 6, 4], tilt: -14 };
}
