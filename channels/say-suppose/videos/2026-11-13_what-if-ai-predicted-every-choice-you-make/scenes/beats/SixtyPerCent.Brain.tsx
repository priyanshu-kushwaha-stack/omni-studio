// The brain-scan paper diagram (Sixty Per Cent, line 53-54; The Dilemma, line 79): a head in profile, a scanner ring
// round it, two buttons with a hand hovering over them, a clock ticking a few seconds back, a tally of sixty marks
// against forty, a coin at fifty and fifty; and, for The Dilemma, the early signal trace going flat. Pinned on the
// stall's half-down shutter. No words: the only marks are the numbers the narrator says (60, 50).
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { interpolate } from "remotion";
import { pop, Sheet } from "../kit";
import { linear } from "../shared";
import { Shutter, Stamp } from "./SixtyPerCent.Parts";

/** The sheet's size and where it hangs (world, at REF). */
export const BRAIN = { x: 960, y: 540, w: 1500, h: 860 } as const;
/** A point on the sheet in world coordinates (ignoring its small tilt). */
export const onSheet = (sx: number, sy: number) => ({ x: BRAIN.x - BRAIN.w / 2 + sx, y: BRAIN.y - BRAIN.h / 2 + sy });

/** When each part draws (frames); leave one out and it is not drawn. */
export interface BrainTimes {
  sheet: number;
  head?: number;
  ring?: number;
  buttons?: number;
  hover?: number;
  clock?: number;
  tally?: number;
  tallyDone?: number;
  coin?: number;
  /** The Dilemma: the early signal draws (as remembered), then the flat line, then the early one fades. */
  signal?: number;
  flat?: number;
}

const HEAD = "M250 620 C230 520 200 420 230 320 C262 208 384 160 452 232 C482 262 484 302 480 332 L516 388 L486 408 L494 446 L470 500 C452 528 432 536 420 546 L420 620";
const RING = "M118 372 A232 232 0 1 1 582 372 A232 232 0 1 1 118 372";

const Group5: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={7} strokeLinecap="round">
    {[0, 1, 2, 3].map((i) => <line key={i} x1={i * 9} y1={-22} x2={i * 9} y2={22} />)}
    <line x1={-6} y1={16} x2={34} y2={-16} />
  </g>
);

const BrainMarks: React.FC<{ frame: number; t: BrainTimes; hand?: "left" | "right" | "hover" }> = ({ frame, t, hand = "hover" }) => {
  const d = (at: number | undefined, len = 30) => (at === undefined ? null : { from: at, to: at + len });
  const head = d(t.head ?? t.sheet + 8, 34);
  const ring = d(t.ring, 26);
  const showButtons = t.buttons !== undefined && frame >= t.buttons;
  const handX = hand === "left" ? 300 : hand === "right" ? 440 : 370 + Math.sin(frame / 9) * 70;
  const clockOn = t.clock !== undefined && frame >= t.clock;
  const back = t.clock !== undefined ? Math.floor(Math.max(0, frame - t.clock - 10) / 9) : 0;
  const tallyGroups = (n: number, row: number) => {
    if (t.tally === undefined) return 0;
    const span = (t.tallyDone ?? t.tally + 60) - t.tally;
    return Math.round(n * linear(frame, t.tally + row * 6, t.tally + span + row * 6));
  };
  const coinOn = t.coin !== undefined && frame >= t.coin;
  const spin = coinOn ? Math.cos(linear(frame, t.coin!, t.coin! + 30) * Math.PI * 5) : 1;
  const flatOn = t.flat !== undefined;
  const fade = flatOn ? 1 - linear(frame, t.flat! + 30, t.flat! + 50) * 0.75 : 1;
  return (
    <g>
      {head && <DrawLine d={HEAD} from={head.from} to={head.to} color={INK} width={9} />}
      {/* the brain, a soft patch inside the head, once the ring is on */}
      {ring && frame >= ring.to && <ellipse cx={350} cy={330} rx={110} ry={80} fill={TEAL} opacity={0.18 + 0.08 * Math.sin(frame / 6)} />}
      {ring && <DrawLine d={RING} from={ring.from} to={ring.to} color={TEAL} width={16} />}
      {ring && frame >= ring.to && [0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return <circle key={a} cx={350 + Math.cos(r) * 232} cy={372 + Math.sin(r) * 232} r={11} fill={PAPER} stroke={TEAL} strokeWidth={5} />;
      })}
      {showButtons && (
        <g transform={`translate(370 760) scale(${pop(frame, t.buttons!)}) translate(-370 -760)`}>
          <rect x={220} y={740} width={300} height={60} rx={14} fill="#c9bfa8" stroke={INK} strokeWidth={6} />
          <circle cx={300} cy={740} r={34} fill={hand === "left" ? "#9aa6b8" : "#e8e0cc"} stroke={INK} strokeWidth={6} />
          <circle cx={440} cy={740} r={34} fill={hand === "right" ? "#9aa6b8" : "#e8e0cc"} stroke={INK} strokeWidth={6} />
        </g>
      )}
      {t.hover !== undefined && frame >= t.hover && (
        <g transform={`translate(${handX} ${hand === "hover" ? 668 + Math.sin(frame / 5) * 6 : 700})`}>
          <path d="M-20 -150 L-14 -30" stroke="#9aa6b8" strokeWidth={26} strokeLinecap="round" />
          <ellipse cx={0} cy={0} rx={34} ry={28} fill="#e9c9a8" stroke={INK} strokeWidth={6} />
          <ellipse cx={4} cy={26} rx={10} ry={16} fill="#e9c9a8" stroke={INK} strokeWidth={5} />
        </g>
      )}
      {clockOn && (
        <g transform={`translate(820 230) scale(${pop(frame, t.clock!)})`}>
          <circle r={112} fill={PAPER} stroke={INK} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, i) => {
            const r = (i * 30 * Math.PI) / 180;
            return <line key={i} x1={Math.sin(r) * 90} y1={-Math.cos(r) * 90} x2={Math.sin(r) * 102} y2={-Math.cos(r) * 102} stroke={INK} strokeWidth={6} />;
          })}
          <line x1={0} y1={0} x2={Math.sin((-back * 30 * Math.PI) / 180) * 84} y2={-Math.cos((-back * 30 * Math.PI) / 180) * 84} stroke={CRIMSON} strokeWidth={9} strokeLinecap="round" />
          <circle r={10} fill={INK} />
        </g>
      )}
      {clockOn && <DrawLine d="M920 120 A150 150 0 0 0 700 120" from={t.clock! + 12} to={t.clock! + 34} color={CRIMSON} width={10} />}
      {clockOn && frame >= t.clock! + 34 && <path d="M700 120 l6 -32 l26 22 z" fill={CRIMSON} />}
      {t.tally !== undefined && (
        <g>
          {Array.from({ length: tallyGroups(12, 0) }, (_, i) => <Group5 key={`a${i}`} x={700 + i * 50} y={470} color={TEAL} />)}
          {Array.from({ length: tallyGroups(8, 1) }, (_, i) => <Group5 key={`b${i}`} x={700 + i * 50} y={580} color="#9a9a94" />)}
          <Stamp frame={frame} at={t.tallyDone ?? t.tally + 60} x={1380} y={470} text="60" color={TEAL} size={92} />
        </g>
      )}
      {coinOn && (
        <g transform={`translate(1150 740) scale(${Math.max(0.06, Math.abs(spin))} 1)`}>
          <circle r={72} fill="#9a9a94" stroke={INK} strokeWidth={7} />
          <path d="M0 -72 A72 72 0 0 1 0 72 Z" fill={MUSTARD} />
          <line x1={0} y1={-72} x2={0} y2={72} stroke={INK} strokeWidth={6} />
          <circle r={72} fill="none" stroke={INK} strokeWidth={7} />
        </g>
      )}
      {coinOn && <Stamp frame={frame} at={t.coin! + 32} x={1330} y={740} text="50" color={MUSTARD} size={86} />}
      {t.signal !== undefined && (
        <g>
          <line x1={650} y1={560} x2={1420} y2={560} stroke={INK} strokeWidth={5} opacity={0.5} />
          <line x1={1180} y1={260} x2={1180} y2={640} stroke={INK} strokeWidth={6} strokeDasharray="16 14" opacity={frame >= t.signal ? 0.7 : 0} />
          <g opacity={fade}>
            <DrawLine d="M660 556 C780 556 840 552 900 530 C980 500 1060 420 1170 300 L1180 296 C1220 330 1300 520 1410 552" from={t.signal} to={t.signal + 36} color={TEAL} width={12} />
          </g>
          {flatOn && <DrawLine d="M660 556 C900 556 1000 552 1100 556 C1200 560 1300 552 1410 556" from={t.flat!} to={t.flat! + 30} color={CRIMSON} width={14} />}
        </g>
      )}
    </g>
  );
};

/** The diagram on the shutter, at its own camera, in the given light. */
export const BrainShot: React.FC<{ frame: number; t: BrainTimes; cam: Camera; mood: MoodName; hand?: "left" | "right" | "hover" }> = ({ frame, t, cam, mood, hand }) => {
  const settle = interpolate(frame, [t.sheet, t.sheet + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const back = (
    <g>
      <Shutter x={-1400} w={4800} top={-900} bottom={1500} />
      <rect x={-1400} y={-900} width={4800} height={2600} fill="#0c0e16" opacity={0.25} />
    </g>
  );
  const actors = (
    <g>
      <Sheet frame={frame} at={t.sheet} x={BRAIN.x} y={BRAIN.y} w={BRAIN.w} h={BRAIN.h} tilt={-1.2}>
        <BrainMarks frame={frame} t={t} hand={hand} />
      </Sheet>
      {/* tape at the two top corners */}
      {settle > 0.9 && [-1, 1].map((s) => (
        <rect key={s} x={BRAIN.x + s * (BRAIN.w / 2 - 40) - 60} y={BRAIN.y - BRAIN.h / 2 - 34} width={120} height={46} fill="#e8dcb8" opacity={0.85}
          transform={`rotate(${s * 12} ${BRAIN.x + s * (BRAIN.w / 2 - 40)} ${BRAIN.y - BRAIN.h / 2 - 10})`} />
      ))}
    </g>
  );
  return (
    <LookContext.Provider value={setLook([{ x: 900, y: 120, r: 900, color: "#ffcf7a", strength: 0.35, moods: ["lamp", "dusk", "night"] }], mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} />
    </LookContext.Provider>
  );
};
