// A Thousand Cards, the run-up to ten and one memory (outside review of v6, sheets 26 and 28): the street clock that
// counts down to 22:00:00, the last students running in through our academy's doors before ten, the late teacher the
// inspector's torch chases back inside, the academy count, and the walk home under one umbrella in first year. World
// coordinates on the academy street (AcademyStreet's ACADEMY), except the count (screen) and the memory (its own shot).
import { interpolate, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { blinking, camAt, HERO, linear, mix, PASTELS } from "../shared";
import { ACADEMY } from "../sets/AcademyStreet";
import { FlatShot } from "./WhosCrimson.Common";

/** The street clock on its post at the kerb, right of the snack shop. */
export const CLOCK = { x: 1350, base: 1250, y: 800 } as const;

/** The clock's reading: 22:00:00 at `ten`, a second per 30 frames before it. */
function reading(frame: number, ten: number) {
  const left = Math.max(0, Math.ceil((ten - frame) / 30));
  const t = 22 * 3600 - left;
  const p = (n: number) => String(n).padStart(2, "0");
  return { text: `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`, ten: left === 0 };
}

export const StreetClock: React.FC<{ frame: number; ten: number }> = ({ frame, ten }) => {
  const r = reading(frame, ten);
  const flash = r.ten ? Math.max(0, 1 - (frame - ten) / 20) : 0;
  return (
    <g>
      <rect x={CLOCK.x - 9} y={CLOCK.y} width={18} height={CLOCK.base - CLOCK.y} fill="#3b3e47" stroke={INK} strokeWidth={4} />
      {flash > 0 && <circle cx={CLOCK.x} cy={CLOCK.y - 50} r={190} fill={TEAL} opacity={0.35 * flash} />}
      <rect x={CLOCK.x - 150} y={CLOCK.y - 110} width={300} height={110} rx={12} fill="#14161c" stroke={INK} strokeWidth={6} />
      <text x={CLOCK.x} y={CLOCK.y - 32} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={62} fill={r.ten ? "#5ff0d8" : "#ff6f6f"}>{r.text}</text>
    </g>
  );
};

/** The last students running up our steps and in through the glass doors, from `from`, one every 10 frames. */
export const LateStudents: React.FC<{ frame: number; from: number }> = ({ frame, from }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const start = from + i * 10;
      const p = linear(frame, start, start + 46);
      if (p <= 0 || p >= 1) return null;
      // along the pavement to the foot of the steps, then up to the doors
      const x = p < 0.7 ? mix(1300, 420, p / 0.7) : mix(420, 330 + i * 20, (p - 0.7) / 0.3);
      const y = p < 0.7 ? ACADEMY.floor : mix(ACADEMY.floor, ACADEMY.steps.landing, (p - 0.7) / 0.3);
      const s = mix(0.74, 0.7, p);
      return (
        <Figure key={i} x={x} y={y} scale={s} facing={-1} pose={walkPose(frame * 0.5 + i * 2)} head={PASTELS[(i * 3 + 1) % PASTELS.length]} coat="#2a2d36"
          brows="worry" lids={0} mouth="o" eyes={1.1} look={{ x: 1, y: 0 }} time={frame} />
      );
    })}
  </g>
);

/** The late teacher peeking out of the glass doors from `peek`, ducking back in at `duck`. */
export const LateTeacher: React.FC<{ frame: number; peek: number; duck: number }> = ({ frame, peek, duck }) => {
  if (frame < peek || frame >= duck + 6) return null;
  const out = Math.min(1, (frame - peek) / 6) * (frame >= duck ? 1 - (frame - duck) / 6 : 1);
  return (
    <g opacity={out}>
      <Figure head={PASTELS[4]} coat="#5a4a3a" x={300} y={ACADEMY.steps.landing} scale={0.76} facing={1} pose={{ ...STAND, lean: 10 * out, armF: [80, 40] }}
        brows={frame >= duck - 10 ? "worry" : "raised"} lids={0} mouth={frame >= duck - 10 ? "o" : "smile"} eyes={1.1} look={{ x: 1, y: 0 }}
        blink={blinking(frame, 3)} time={frame} />
    </g>
  );
};

/** The academy count, screen space, upper middle: the number rolls up to 1,000 by `to`. */
export const AcademyCount: React.FC<{ frame: number; from: number; to: number; until: number }> = ({ frame, from, to, until }) => {
  if (frame < from || frame >= until) return null;
  const n = Math.round(interpolate(frame, [from, to], [0, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) / 10) * 10;
  const s = spring({ frame: frame - from, fps: 30, config: { damping: 11, stiffness: 200, mass: 0.6 } });
  const done = frame >= to ? 1 + 0.08 * Math.max(0, 1 - (frame - to) / 8) : 1;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(960 210) scale(${Math.min(1, s) * done}) rotate(-1.5)`}>
        <rect x={-500} y={-78} width={1000} height={156} rx={18} fill={PAPER} stroke={INK} strokeWidth={8} />
        <rect x={-500} y={-78} width={26} height={156} rx={10} fill={TEAL} />
        <text x={14} y={32} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={92} fill={INK}>
          <tspan fill={TEAL}>{n.toLocaleString("en-US")}</tspan> ACADEMIES
        </text>
      </g>
    </svg>
  );
};

/** First year, the walk home: you and the boy under one umbrella in the rain, dusk, a memory (warm and soft). */
export const MemoryShot: React.FC<{ frame: number; from: number; to: number; mood: MoodName }> = ({ frame, from, to, mood }) => {
  const p = linear(frame, from, to);
  const cam = drift(camAt(frame, [[from, insert(900, 600, 1.1)], [to, insert(1000, 600, 1.16)]]), frame, "memory", 2);
  const x = mix(700, 1180, p);
  const boy = { head: "#8fa3b8", coat: "#2a2d36" };
  const pose = (ph: number) => walkPose(frame * 0.22 + ph);
  return (
    <FlatShot cam={cam} mood={mood} back={
      <g>
        <rect x={-600} y={-400} width={3200} height={1300} fill="#5b5a78" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-500 + i * 260} y={260} width={180} height={420} rx={6} fill="#4a4866" />)}
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-460 + i * 260} y={320} width={100} height={70} rx={4} fill="#f2c982" opacity={0.55} />)}
        <rect x={-600} y={820} width={3200} height={700} fill="#3c3b52" />
      </g>
    } actors={
      <g>
        <Figure {...HERO} x={x - 70} y={900} scale={1.1} facing={1} pose={pose(0)} brows="raised" lids={0.1} mouth="smile" eyes={1} look={{ x: 1, y: 0 }} time={frame} />
        <Figure {...boy} x={x + 70} y={900} scale={1.1} facing={-1} pose={{ ...pose(Math.PI), armF: [150, 10] }} brows="raised" lids={0.3} mouth="open" eyes={1}
          look={{ x: 1, y: 0 }} time={frame} />
        {/* the umbrella over both: the boy holds it */}
        <line x1={x + 20} y1={690} x2={x + 20} y2={500} stroke={INK} strokeWidth={8} />
        <path d={`M${x - 220} 520 Q${x + 20} 330 ${x + 260} 520 Q${x + 200} 495 ${x + 140} 520 Q${x + 80} 495 ${x + 20} 520 Q${x - 40} 495 ${x - 100} 520 Q${x - 160} 495 ${x - 220} 520Z`}
          fill={TEAL} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        {Array.from({ length: 40 }, (_, i) => {
          const rx = ((i * 137) % 2200) - 200, fall = ((frame * 22 + i * 61) % 1100) - 100;
          return Math.abs(rx - x - 20) < 240 && fall > 360 && fall < 520 ? null : <line key={i} x1={rx} y1={fall} x2={rx - 8} y2={fall + 40} stroke="#cfe0f4" strokeWidth={3} opacity={0.6} />;
        })}
        <rect x={-600} y={-400} width={3200} height={1900} fill="#f2c982" opacity={0.14} />
      </g>
    } />
  );
};
