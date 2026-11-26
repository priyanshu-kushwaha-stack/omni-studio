// Helpers for "The Loading Dock" (LoadingDock.tsx): the bronze and silver fact (c08) as a paper podium, no words, in its
// own frame (outside review of v4.1: not beside the hug, and no cast-coloured heads). World coordinates, for a <Stage>.
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { ramp } from "../shared";

const GOLD = "#e8c23a", SILVER = "#c9ced6", BRONZE = "#c98a5a";
/** The medallists' heads: medal-toned, with a metal shine, so nobody takes them for the cast. */
const HEADS = { gold: "#e6d48a", silver: "#b9bfc9", bronze: "#b97a4c" } as const;

type Mood = "proud" | "flat" | "sour" | "beam";

/** A small paper medallist on a step: a head with a shine, a body, the medal; `mood` sets brows, eyes and mouth. */
const Medallist: React.FC<{ x: number; y: number; head: string; medal: string; pop: number; mood: Mood; look: { x: number; y: number }; bob?: number }> = ({
  x, y, head, medal, pop, mood, look, bob = 0,
}) => {
  if (pop <= 0) return null;
  const mouth = mood === "beam" ? "M-9 6 Q2 20 13 6Z" : mood === "proud" ? "M-8 8 Q2 16 12 8" : mood === "sour" ? "M-8 15 Q2 6 12 15" : "M-6 11 H10";
  const brows = mood === "sour" ? ["M-12 -14 L-2 -10", "M6 -10 L16 -14"] : mood === "proud" || mood === "beam" ? ["M-12 -13 Q-7 -17 -2 -13", "M5 -13 Q10 -17 15 -13"] : [];
  const happyEyes = mood === "beam" && look.y <= 0;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${pop})`}>
      <rect x={-12} y={-34} width={24} height={34} rx={8} fill={INK} />
      <circle cx={0} cy={-26} r={8} fill={medal} stroke={INK} strokeWidth={2} />
      <g transform="translate(0 -58)">
        <circle r={22} fill={head} stroke={INK} strokeWidth={3} />
        <path d="M-14 -10 Q-10 -17 -2 -19" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
        {happyEyes ? (
          <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round">
            <path d="M-10 -2 Q-6 -7 -2 -2" />
            <path d="M5 -2 Q9 -7 13 -2" />
          </g>
        ) : (
          <g fill={INK}>
            <circle cx={-6 + look.x * 4} cy={-3 + look.y * 4} r={3.4} />
            <circle cx={8 + look.x * 4} cy={-3 + look.y * 4} r={3.4} />
          </g>
        )}
        {brows.map((d, i) => <path key={i} d={d} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
        <path d={mouth} fill={mood === "beam" ? INK : "none"} stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

/**
 * The podium on a sheet that unfolds at `at`, centre (x, y): gold in the middle (already up, proud), bronze pops on at
 * `bronze` beaming, silver at `silver`, flat. At `silverThinks` silver turns up to the gold step and sours, a dotted
 * line running to the gold medal; at `bronzeThinks` bronze looks down at the empty floor past the podium, a dotted line
 * to it, and keeps smiling. The steps carry their places, 2 1 3.
 */
export const Podium: React.FC<{
  frame: number; at: number; until?: number; x: number; y: number; bronze: number; silver: number; silverThinks: number; bronzeThinks: number;
}> = ({ frame, at, until, x, y, bronze, silver, silverThinks, bronzeThinks }) => {
  const W = 470, H = 330, base = 280;
  const steps = [
    { x: 80, w: 110, h: 92, c: SILVER, n: "2" },
    { x: 190, w: 110, h: 140, c: GOLD, n: "1" },
    { x: 300, w: 110, h: 62, c: BRONZE, n: "3" },
  ];
  const sThink = frame >= silverThinks;
  const bThink = frame >= bronzeThinks;
  const bob = (seed: number) => Math.max(0, Math.sin((frame + seed) / 7)) * 3;
  return (
    <Sheet frame={frame} at={at} until={until} x={x} y={y} w={W} h={H} tilt={1}>
      <line x1={30} y1={base} x2={W - 20} y2={base} stroke={INK} strokeWidth={4} />
      {steps.map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={base - s.h} width={s.w} height={s.h} fill={s.c} stroke={INK} strokeWidth={4} />
          <text x={s.x + s.w / 2} y={base - s.h / 2 + 14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={PAPER} stroke={INK} strokeWidth={1.5}>{s.n}</text>
        </g>
      ))}
      <Medallist x={245} y={base - 140} head={HEADS.gold} medal={GOLD} pop={ramp(frame, at + 8, at + 18)} mood="proud" look={{ x: 0, y: -0.2 }} />
      <Medallist x={135} y={base - 92} head={HEADS.silver} medal={SILVER} pop={ramp(frame, silver, silver + 10)} mood={sThink ? "sour" : "flat"}
        look={sThink ? { x: 1, y: -1 } : { x: 0.3, y: 0 }} />
      <Medallist x={355} y={base - 62} head={HEADS.bronze} medal={BRONZE} pop={ramp(frame, bronze, bronze + 10)} mood="beam"
        look={bThink ? { x: 1, y: 1 } : { x: -0.2, y: 0 }} bob={bThink ? 0 : bob(11)} />
      <DrawLine d={`M150 ${base - 160} Q190 ${base - 230} 238 ${base - 172}`} from={silverThinks} to={silverThinks + 18} color={INK} width={4} />
      <DrawLine d={`M372 ${base - 124} Q430 ${base - 90} 440 ${base - 6}`} from={bronzeThinks} to={bronzeThinks + 18} color={INK} width={4} />
      {bThink && <ellipse cx={440} cy={base + 4} rx={18} ry={5} fill={INK} opacity={0.25 * ramp(frame, bronzeThinks + 12, bronzeThinks + 22)} />}
    </Sheet>
  );
};
