// Helpers for "The Loading Dock" (LoadingDock.tsx): the bronze and silver fact (c08) as a small paper insert of a
// three-step podium, no words. World coordinates, for a <Stage> slot.
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { INK } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { PASTELS, ramp } from "../shared";

const GOLD = "#e8c23a", SILVER = "#c9ced6", BRONZE = "#c98a5a";

/** A small paper medallist on a step: a head, a body, the medal; the face looks where `look` says. */
const Medallist: React.FC<{ x: number; y: number; head: string; medal: string; pop: number; mouth: "smile" | "frown" | "flat"; look: { x: number; y: number } }> = ({
  x, y, head, medal, pop, mouth, look,
}) => {
  if (pop <= 0) return null;
  const m = mouth === "smile" ? "M-8 8 Q2 16 12 8" : mouth === "frown" ? "M-8 14 Q2 6 12 14" : "M-6 11 H10";
  return (
    <g transform={`translate(${x} ${y}) scale(${pop})`}>
      <rect x={-12} y={-34} width={24} height={34} rx={8} fill={INK} />
      <circle cx={0} cy={-26} r={8} fill={medal} stroke={INK} strokeWidth={2} />
      <g transform="translate(0 -58)">
        <circle r={22} fill={head} stroke={INK} strokeWidth={3} />
        <circle cx={-6 + look.x * 4} cy={-3 + look.y * 4} r={3.4} fill={INK} />
        <circle cx={8 + look.x * 4} cy={-3 + look.y * 4} r={3.4} fill={INK} />
        <path d={m} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
};

/**
 * The podium on a sheet that unfolds at `at`, centre (x, y): gold in the middle (already up), bronze pops on at
 * `bronze` smiling, silver at `silver`, flat. At `silverThinks` silver turns up to the gold step and frowns, a dotted
 * line running to the gold medal; at `bronzeThinks` bronze looks down at the empty floor past the podium, a dotted line
 * to it, and keeps smiling.
 */
export const Podium: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; bronze: number; silver: number; silverThinks: number; bronzeThinks: number;
}> = ({ frame, at, until, x, y, bronze, silver, silverThinks, bronzeThinks }) => {
  const W = 470, H = 330, base = 280;
  const steps = [
    { x: 80, w: 110, h: 92, c: SILVER },
    { x: 190, w: 110, h: 140, c: GOLD },
    { x: 300, w: 110, h: 62, c: BRONZE },
  ];
  const sThink = frame >= silverThinks;
  const bThink = frame >= bronzeThinks;
  return (
    <Sheet frame={frame} at={at} until={until} x={x} y={y} w={W} h={H} tilt={2}>
      <line x1={30} y1={base} x2={W - 20} y2={base} stroke={INK} strokeWidth={4} />
      {steps.map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={base - s.h} width={s.w} height={s.h} fill={s.c} stroke={INK} strokeWidth={4} />
          <circle cx={s.x + s.w / 2} cy={base - s.h / 2} r={14} fill="none" stroke={INK} strokeWidth={3} opacity={0.4} />
        </g>
      ))}
      <Medallist x={245} y={base - 140} head={PASTELS[5]} medal={GOLD} pop={ramp(frame, at + 8, at + 18)} mouth="smile" look={{ x: 0, y: 0 }} />
      <Medallist x={135} y={base - 92} head={PASTELS[1]} medal={SILVER} pop={ramp(frame, silver, silver + 10)} mouth={sThink ? "frown" : "flat"}
        look={sThink ? { x: 1, y: -1 } : { x: 0.3, y: 0 }} />
      <Medallist x={355} y={base - 62} head={PASTELS[2]} medal={BRONZE} pop={ramp(frame, bronze, bronze + 10)} mouth="smile"
        look={bThink ? { x: 1, y: 1 } : { x: -0.2, y: 0 }} />
      <DrawLine d={`M150 ${base - 160} Q190 ${base - 230} 238 ${base - 172}`} from={silverThinks} to={silverThinks + 18} color={INK} width={4} />
      <DrawLine d={`M372 ${base - 124} Q430 ${base - 90} 440 ${base - 6}`} from={bronzeThinks} to={bronzeThinks + 18} color={INK} width={4} />
      {bThink && <ellipse cx={440} cy={base + 4} rx={18} ry={5} fill={INK} opacity={0.25 * ramp(frame, bronzeThinks + 12, bronzeThinks + 22)} />}
    </Sheet>
  );
};
