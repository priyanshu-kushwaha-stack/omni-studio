// Helpers for the cold open's two beats, "The change" (Change.tsx) and "The rule" (Rule.tsx): where the gate scene's
// people stand, the checker, the snap sounds, and the top-down floor under a phone insert.
import { Audio, Sequence, staticFile } from "remotion";
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { METRO_GATE } from "../sets/Metro";
import { PeakCap } from "../parts2";
import { CHECKER, noise } from "../shared";

/** The gate scene's blocking: you and the checker face each other in front of the turnstile; both at scale S. */
export const S = 1.15;
export const FLOOR = METRO_GATE.floor;
export const HX = 930;
export const CX = 1215;

/** The frame the checker's YES tag snaps up (The change, line 7): the Rule beat keeps it hanging over his cap. */
export const checkerTagAt = (clips: Clip[]) => clips[7].from - 6;
/** The line-6 tear: from here the paper is in four pieces in your palm. */
export const piecesFrom = (clips: Clip[]) => clips[6].from + 28;

/** A sound effect from assets/sfx at a whole-film frame. Place it OUTSIDE <Stage> (kit/sound.ts). */
export const Sfx: React.FC<{ at: number; name: "snap" | "snap-soft"; volume?: number }> = ({ at, name, volume = 0.5 }) => (
  <Sequence from={Math.max(0, at)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} /></Sequence>
);

/** The ticket checker: pale blue head, navy cap and coat. */
export const Checker: React.FC<Omit<FigureProps, "head" | "cap">> = (p) => {
  const body = { x: p.x, y: p.y, scale: p.scale ?? 1, pose: p.pose ?? STAND, facing: p.facing ?? 1 };
  return (
    <>
      <Figure head={CHECKER.head} coat={CHECKER.coat} {...p} />
      <PeakCap {...body} color={CHECKER.cap} />
    </>
  );
};

/** The concourse floor from straight above (for a phone insert in the queue): dark tiles, the yellow guide strip, and
 *  the shoes of the person ahead of you at the top of the frame, shuffling forward by `step` (world px). */
export const FloorTop: React.FC<{ step?: number }> = ({ step = 0 }) => (
  <g>
    <rect x={-1400} y={-1400} width={4800} height={4000} fill="#1a1d2c" />
    {Array.from({ length: 30 }, (_, i) => <line key={`v${i}`} x1={-1400 + i * 180} y1={-1400} x2={-1400 + i * 180} y2={2600} stroke="#23273a" strokeWidth={6} />)}
    {Array.from({ length: 24 }, (_, i) => <line key={`h${i}`} x1={-1400} y1={-1400 + i * 180} x2={3400} y2={-1400 + i * 180} stroke="#23273a" strokeWidth={6} />)}
    <rect x={1480} y={-1400} width={110} height={4000} fill="#c9a42c" />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={1505 + (i % 3) * 30} cy={-1380 + Math.floor(i / 3) * 34} r={7} fill="#e8c23a" />)}
    <g transform={`translate(0 ${-step})`}>
      {[[880, 40], [1040, 70]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={46} ry={90} fill={INK} />
          <ellipse cx={x} cy={y - 40} rx={34} ry={40} fill="#3b3e47" />
        </g>
      ))}
    </g>
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={200 + noise(i) * 1400} y={-200 + noise(i + 9) * 1300} width={30} height={10} rx={4} fill="#2b2f44" />
    ))}
  </g>
);
