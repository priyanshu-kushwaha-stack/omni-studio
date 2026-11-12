// The lamppost outside the food court at night (The Board): the night sky and the far towers, the court's long low
// front with its shutters down and a warm glow leaking under them, the pavement, and the lamppost: a tall grey pole with
// the city's teal lamp clipped near the top and the split-flap CITY SCORE board under it (draw <TealLamp> and
// <RateBoard> at LAMPPOST.lamp and LAMPPOST.board in the actors slot), and the worker's ladder still leaning on it from
// the first night. Drawn for REF in paper layers; no lettering.
import type { SetLight } from "@whatif/kit/sets/common";
import { Floor, Sky, Skyline } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, TEAL } from "@whatif/kit/theme";
import { Deep } from "./common";

/** Where things are, at REF. */
export const LAMPPOST = {
  floor: 1000,
  scale: 2.2,
  /** The pole's centre line. */
  pole: 1270,
  lamp: { x: 1270, y: 150 },
  board: { x: 1270, y: 300 },
  /** You and your best friend under it, the open box on the ground between you. */
  you: { x: 790, y: 1000 },
  friend: { x: 1090, y: 1000 },
  box: { x: 955, y: 1000 },
  /** The ladder's foot and top. */
  ladder: { foot: { x: 1500, y: 1000 }, top: { x: 1300, y: 330 } },
} as const;

/** The court's front: a long low building, shutters down, a warm line under them. */
const CourtFront: React.FC = () => (
  <g>
    <rect x={-1400} y={360} width={4800} height={700} fill="#2a2f45" />
    <rect x={-1400} y={330} width={4800} height={46} fill="#1d2133" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 14 }, (_, i) => {
      const x = -1300 + i * 360;
      return (
        <g key={i}>
          <rect x={x} y={440} width={300} height={430} fill="#353b55" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 15 }, (_, r) => <line key={r} x1={x + 6} y1={460 + r * 27} x2={x + 294} y2={460 + r * 27} stroke="#41486a" strokeWidth={6} />)}
          <rect x={x + 4} y={866} width={292} height={8} fill="#ffcf7a" opacity={i === 6 ? 0.85 : 0.25} />
        </g>
      );
    })}
  </g>
);

/** The lamppost and the ladder against it (actors' plane, behind the figures). */
export const Lamppost: React.FC = () => {
  const { pole, floor, ladder } = LAMPPOST;
  const rails = [-36, 36];
  const dx = ladder.top.x - ladder.foot.x;
  const dy = ladder.top.y - ladder.foot.y;
  return (
    <g>
      <rect x={pole - 22} y={-900} width={44} height={floor + 940} fill="#6b7080" stroke={INK} strokeWidth={6} />
      <rect x={pole - 22} y={-900} width={12} height={floor + 940} fill="#000" opacity={0.2} />
      <rect x={pole - 46} y={floor - 30} width={92} height={40} rx={8} fill="#5a5f6e" stroke={INK} strokeWidth={6} />
      {rails.map((o) => <line key={o} x1={ladder.foot.x + o} y1={ladder.foot.y} x2={ladder.top.x + o} y2={ladder.top.y} stroke="#c9a24a" strokeWidth={14} strokeLinecap="round" />)}
      {Array.from({ length: 10 }, (_, i) => {
        const t = (i + 0.6) / 10.5;
        const x = ladder.foot.x + dx * t;
        const y = ladder.foot.y + dy * t;
        return <line key={i} x1={x - 36} y1={y} x2={x + 36} y2={y} stroke="#a8862f" strokeWidth={10} />;
      })}
    </g>
  );
};

/** Everything behind the actors: sky, towers, the court's front, the pavement. */
export const LamppostBack: React.FC<{ cam: Camera; frame: number }> = ({ cam }) => (
  <g>
    <Deep cam={cam} depth={0.08} flat><Sky id="lamppost" mood="night" x={-1400} y={-900} w={4800} h={1300} sunAt={{ x: 420, y: 120 }} /></Deep>
    <Deep cam={cam} depth={0.2} flat><Skyline mood="night" from={-1400} to={3400} base={420} tall={360} seed={7} /></Deep>
    <Deep cam={cam} depth={0.6}><CourtFront /></Deep>
    <Deep cam={cam} depth={1}><Floor y={LAMPPOST.floor - 40} fill="#3a3f52" gap={220} slant={-140} /></Deep>
  </g>
);

/** The teal lamp's light (dimmed by `dim`), and the court's warm leak. */
export const lamppostLights = (dim = 1): SetLight[] => [
  { x: LAMPPOST.lamp.x, y: LAMPPOST.lamp.y, r: 620, color: TEAL, strength: 0.45 * dim, moods: ["night", "lamp", "dusk"] },
  { x: 900, y: 870, depth: 0.6, r: 500, color: "#ffcf7a", strength: 0.15, moods: ["night", "lamp", "dusk"] },
];
