// The paper tally for "The Slow Room" (SlowRoom.tsx), line 88: a strip stamped 200 (hours, the narration's number)
// folds a thousand times into a sliver, and the sliver is laid on a kitchen clock at seven in the evening as a twelve-
// minute wedge. Screen pixels.
import { interpolate, spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, FPS, INK } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { mix, ramp } from "../shared";

export const FoldSheet: React.FC<{ frame: number; at: number; until: number; stamp: number; fold: [number, number]; clock: number; lay: [number, number] }> = ({
  frame, at, until, stamp, fold, clock, lay,
}) => {
  const w = 1040, h = 600;
  const f = ramp(frame, fold[0], fold[1]);
  const m = ramp(frame, lay[0], lay[1]);
  const len = mix(820, 14, f);
  const folds = Math.round(mix(1, 46, f));
  const sx = mix(90, 500 - 7, f);
  const stripY = 150;
  const clockAt = { x: 760, y: 360, r: 170 };
  const sliver = { x: mix(sx, clockAt.x, m), y: mix(stripY, clockAt.y - clockAt.r * 0.6, m) };
  const s = frame >= stamp ? spring({ frame: frame - stamp, fps: FPS, config: { damping: 10, stiffness: 220, mass: 0.6 } }) : 0;
  const c = frame >= clock ? spring({ frame: frame - clock, fps: FPS, config: { damping: 12, stiffness: 160, mass: 0.7 } }) : 0;
  const wedge = interpolate(frame, [lay[1] - 2, lay[1] + 10], [0, 72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arc = (deg: number) => {
    const r = clockAt.r * 0.86, a = (deg * Math.PI) / 180;
    return `M${clockAt.x} ${clockAt.y} L${clockAt.x} ${clockAt.y - r} A${r} ${r} 0 0 1 ${clockAt.x + Math.sin(a) * r} ${clockAt.y - Math.cos(a) * r} Z`;
  };
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <Sheet frame={frame} at={at} until={until} x={960} y={520} w={w} h={h} tilt={-1.2}>
        {/* the strip and its folds */}
        {m < 1 && (
          <g transform={m > 0 ? `translate(${sliver.x - sx} ${sliver.y - stripY})` : undefined}>
            <rect x={sx} y={stripY - 34} width={len} height={68} rx={6} fill="#efe2c4" stroke="#b9a989" strokeWidth={4} />
            <path d={Array.from({ length: folds }, (_, i) => `M${sx + (len * (i + 1)) / (folds + 1)} ${stripY - 34} v68`).join("")} stroke="#b9a989" strokeWidth={f > 0.5 ? 1.5 : 3} />
            {f < 0.35 && s > 0 && (
              <g transform={`translate(${sx + len / 2} ${stripY}) rotate(-5) scale(${s})`}>
                <rect x={-86} y={-40} width={172} height={80} rx={10} fill="none" stroke={CRIMSON} strokeWidth={6} />
                <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={CRIMSON}>200</text>
              </g>
            )}
          </g>
        )}
        {/* the kitchen clock at seven in the evening */}
        {c > 0 && (
          <g transform={`translate(${clockAt.x} ${clockAt.y}) scale(${c}) translate(${-clockAt.x} ${-clockAt.y})`}>
            <circle cx={clockAt.x} cy={clockAt.y} r={clockAt.r} fill="#fbf4e6" stroke={INK} strokeWidth={12} />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={clockAt.x} y1={clockAt.y - clockAt.r * 0.8} x2={clockAt.x} y2={clockAt.y - clockAt.r * 0.92} stroke={INK} strokeWidth={6}
                transform={`rotate(${i * 30} ${clockAt.x} ${clockAt.y})`} />
            ))}
            {wedge > 0 && <path d={arc(wedge)} fill={CRIMSON} opacity={0.8} />}
            <line x1={clockAt.x} y1={clockAt.y} x2={clockAt.x} y2={clockAt.y - clockAt.r * 0.75} stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <line x1={clockAt.x} y1={clockAt.y} x2={clockAt.x} y2={clockAt.y - clockAt.r * 0.48} stroke={INK} strokeWidth={13} strokeLinecap="round" transform={`rotate(210 ${clockAt.x} ${clockAt.y})`} />
            <circle cx={clockAt.x} cy={clockAt.y} r={10} fill={CRIMSON} />
          </g>
        )}
        {m > 0 && m < 1 && <rect x={sliver.x - 7} y={sliver.y - 34} width={14} height={68} rx={3} fill="#efe2c4" stroke="#b9a989" strokeWidth={3} />}
        {/* a little row of steaming cups on the left: her evening, drawn */}
        {c > 0 && (
          <g opacity={c}>
            <path d="M150 470 h120 v60 q0 30 -30 30 h-60 q-30 0 -30 -30 z" fill="#d8d0c0" stroke={INK} strokeWidth={5} />
            <path d="M270 485 q30 0 30 25 q0 25 -30 25" fill="none" stroke={INK} strokeWidth={5} />
            <path d="M180 455 q-10 -20 0 -40 M215 455 q-10 -20 0 -40 M250 455 q-10 -20 0 -40" fill="none" stroke="#b9a989" strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
      </Sheet>
    </svg>
  );
};
