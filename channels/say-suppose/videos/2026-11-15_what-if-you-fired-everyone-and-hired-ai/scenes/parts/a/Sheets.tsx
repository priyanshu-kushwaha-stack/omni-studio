// Part A's paper pieces: the rule drawn on paper beside the app phone (three rows, one per spoken rule line), the
// Jevons diagram (a coal fire, CHEAPER, more fires), the napkins on a counter or a desk (yours, then the boss's in his
// own hand, the same line missing from both), and your pillow at night with the phone pinging under it. Screen pixels.
// No AI images.
import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { AppPhone, Dial, Napkin, STEEL_DARK } from "../Props";
import { Robot } from "../Robot";
import { ease, mix, Paper, ramp, type ShotTime } from "../util";
import { Caption } from "./Bits";

const pop = (f: number, at: number, len = 8) => ease(ramp(f, at, at + len));

/** Grow in about a point: a group that scales from 0.4 and fades in. */
const Pop: React.FC<{ x: number; y: number; k: number; children: ReactNode }> = ({ x, y, k, children }) =>
  k <= 0 ? null : <g transform={`translate(${x} ${y}) scale(${0.4 + 0.6 * k})`} opacity={k}>{children}</g>;

const Arrow: React.FC<{ x1: number; x2: number; y: number; k: number; color?: string; w?: number }> = ({ x1, x2, y, k, color = INK, w = 7 }) => {
  if (k <= 0) return null;
  const x = mix(x1, x2, k);
  return (
    <g>
      <line x1={x1} y1={y} x2={x - 10} y2={y} stroke={color} strokeWidth={w} strokeLinecap="round" />
      {k > 0.6 && <path d={`M${x} ${y} l-24 -16 v32 Z`} fill={color} />}
    </g>
  );
};

const Crossed: React.FC<{ k: number; children: ReactNode }> = ({ k, children }) => (
  <g>
    {children}
    {k > 0 && <line x1={-36} y1={-36} x2={-36 + 72 * k} y2={-36 + 72 * k} stroke={CRIMSON} strokeWidth={10} strokeLinecap="round" />}
  </g>
);

const Coin: React.FC = () => (
  <g><circle r={32} fill={MUSTARD} stroke={INK} strokeWidth={5} /><circle r={18} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} /></g>
);
const Moon: React.FC = () => <path d="M10 -32 A32 32 0 1 0 30 18 A26 26 0 1 1 10 -32 Z" fill="#7fa0c4" stroke={INK} strokeWidth={5} />;
const Oops: React.FC = () => (
  <g><circle r={32} fill={PAPER} stroke={INK} strokeWidth={5} /><path d="M-8 -16 Q0 -26 10 -16 Q16 -6 2 2 V10 M2 20 v2" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g>
);

/** A little shop front with a striped awning. */
const Shop: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <rect x={-56} y={-50} width={112} height={100} fill="#ecdcbc" stroke={INK} strokeWidth={5} />
    <path d="M-66 -50 L66 -50 L56 -80 L-56 -80 Z" fill={color} stroke={INK} strokeWidth={5} />
    {[-40, -14, 12, 38].map((x) => <path key={x} d={`M${x} -80 L${x - 4} -50`} stroke={PAPER} strokeWidth={8} />)}
    <rect x={-18} y={0} width={36} height={50} fill={TEAL} stroke={INK} strokeWidth={4} />
    <rect x={-46} y={-30} width={22} height={22} fill="#cfe3ea" stroke={INK} strokeWidth={3} />
  </g>
);

/** Your mustard hand pointing right. */
const PointHand: React.FC = () => (
  <g>
    <path d="M-40 -24 Q-10 -30 10 -20 L70 -20 Q84 -14 70 -6 L18 -6 Q22 14 0 22 L-40 22 Z" fill={MUSTARD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-70} y={-26} width={32} height={52} rx={6} fill={PAPER} stroke={INK} strokeWidth={5} />
  </g>
);

const Numeral: React.FC<{ n: number; y: number; k: number }> = ({ n, y, k }) => (
  <Pop x={56} y={y} k={k}>
    <circle r={30} fill={INK} />
    <text x={0} y={14} textAnchor="middle" fontFamily="inherit" fontWeight={800} fontSize={40} fill={PAPER}>{n}</text>
  </Pop>
);

/** Row one: a word typed, a door with a chime, a machine stepping through with a tool, then no wage, no sleep, no
 *  mistakes (a coin, a moon, a slip, each struck out). `f` frames into the row (Infinity: all drawn). */
const RowHire: React.FC<{ f: number; y: number; at?: [number, number, number] }> = ({ f, y, at = [121, 148, 173] }) => {
  const typed = Math.max(0, Math.min(4, Math.floor(f / 5)));
  const step = ease(ramp(f, 62, 100));
  const bell = f > 62 ? Math.sin((f - 62) * 0.55) * 24 * Math.exp(-(f - 62) / 20) : 0;
  return (
    <g>
      <Pop x={200} y={y} k={pop(f, 0)}>
        <rect x={-96} y={-40} width={192} height={80} rx={14} fill="#fff" stroke={INK} strokeWidth={5} />
        <Caption x={-6} y={16} text={"COOK".slice(0, typed)} size={46} />
      </Pop>
      <Arrow x1={310} x2={372} y={y} k={ramp(f, 30, 40)} />
      <Pop x={440} y={y} k={pop(f, 40)}>
        <rect x={-46} y={-80} width={92} height={160} fill={TEAL} stroke={INK} strokeWidth={5} />
        <rect x={-30} y={-62} width={60} height={64} fill="#cfe3ea" stroke={INK} strokeWidth={3} />
        <path d="M-14 -88 Q-12 -104 0 -104 Q12 -104 14 -88 Z" fill="#e0b84a" stroke={INK} strokeWidth={3} transform={`rotate(${bell} 0 -108)`} />
      </Pop>
      {f >= 60 && (
        <g transform={`translate(${mix(470, 600, step)} ${y + 92})`}>
          <Robot x={0} y={0} scale={0.5} pose={step < 1 ? walkPose(f * 0.4) : { ...walkPose(0), armF: [118, 30] }} held="spatula" toolAngle={-30} frame={f} />
        </g>
      )}
      {[Coin, Moon, Oops].map((Icon, i) => (
        <Pop key={i} x={780 + i * 110} y={y} k={pop(f, at[i] - 4, 6)}>
          <Crossed k={ramp(f, at[i] + 2, at[i] + 9)}><Icon /></Crossed>
        </Pop>
      ))}
    </g>
  );
};

/** Row two: a row of machines, your hand pointing them on to other shops. */
const RowRent: React.FC<{ f: number; y: number }> = ({ f, y }) => (
  <g>
    {Array.from({ length: 5 }, (_, i) => (
      <Pop key={i} x={130 + i * 72} y={y + 70} k={pop(f, i * 7, 6)}>
        <Robot x={0} y={0} scale={0.32} frame={f} />
      </Pop>
    ))}
    <Pop x={540} y={y} k={pop(f, 40)}><PointHand /></Pop>
    {[-1, 0, 1].map((d, i) => (
      <g key={d} transform={`rotate(${d * 14} 620 ${y})`}><Arrow x1={620} x2={720} y={y} k={ramp(f, 52 + i * 5, 64 + i * 5)} w={6} /></g>
    ))}
    {[CRIMSON, TEAL, MUSTARD].map((c, i) => (
      <Pop key={c} x={800 + i * 130} y={y + 10 + (i === 1 ? 0 : 0)} k={pop(f, 60 + i * 8)}><Shop color={c} /></Pop>
    ))}
  </g>
);

/** Row three: the one dial with your thumb on it, and what a shift costs (a stack of coins that follows the dial). */
const RowDial: React.FC<{ f: number; y: number; value: number }> = ({ f, y, value }) => {
  const n = 1 + Math.round(value * 6);
  return (
    <g>
      <Pop x={230} y={y} k={pop(f, 0, 10)}>
        <g transform="scale(0.58)"><Dial value={value} thumb /></g>
      </Pop>
      <Arrow x1={360} x2={470} y={y} k={ramp(f, 50, 62)} />
      <Pop x={570} y={y + 60} k={pop(f, 58)}>
        {Array.from({ length: n }, (_, i) => (
          <g key={i} transform={`translate(0 ${-i * 20})`}>
            <ellipse cx={0} cy={0} rx={52} ry={16} fill="#c99a2a" stroke={INK} strokeWidth={4} />
            <ellipse cx={0} cy={-6} rx={52} ry={16} fill={MUSTARD} stroke={INK} strokeWidth={4} />
          </g>
        ))}
      </Pop>
    </g>
  );
};

/** The rule on paper beside the app phone, over the morning diner. `step` is the row being drawn (1-3; 0 the paper
 *  alone); earlier rows are drawn whole. `value` drives the dial on paper and on the phone. */
export const RuleBoard: React.FC<{ t: ShotTime; step: 0 | 1 | 2 | 3; bg: ReactNode; value?: number; fresh?: boolean }> = ({ t, step, bg, value = 0.55, fresh }) => {
  const f = t.f;
  const all = 1e6;
  const rowF = (i: number) => (i < step ? all : i === step ? f : -1);
  const phone = step === 0 ? { mode: "home" as const, ping: f > 10 ? 1 : 0 }
    : step === 1 ? { mode: "app" as const, job: "COOK", typed: f / 5, value: 0.5 }
    : { mode: "app" as const, job: "COOK", value: step === 3 ? value : 0.5, thumb: step === 3 };
  const rows = [160, 420, 680];
  return (
    <AbsoluteFill>
      {bg}
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <g transform={`translate(0 ${fresh ? mix(80, 0, ease(ramp(f, 0, 10))) : 0})`}>
            <path d="M330 1100 Q300 960 360 930 L560 930 Q620 960 600 1100 Z" fill={MUSTARD} stroke={INK} strokeWidth={7} />
            <AppPhone x={440} y={560} s={0.8} rot={-4} frame={f} {...phone} />
          </g>
          <Paper f={fresh ? f : 100} x={1290} y={560} w={1100} h={850} rot={1}>
            {rows.map((y, i) => <Numeral key={i} n={i + 1} y={y} k={i + 1 <= step ? 1 : 0} />)}
            {step >= 1 && <RowHire f={rowF(1)} y={rows[0]} />}
            {step >= 2 && <RowRent f={rowF(2)} y={rows[1]} />}
            {step >= 3 && <RowDial f={rowF(3)} y={rows[2]} value={value} />}
          </Paper>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---- Jevons ----------------------------------------------------------------------------------------------------------

/** A coal fire in a grate, flames breathing gently on `f` (scale, no line boil). */
const Fire: React.FC<{ x: number; y: number; s?: number; f: number; seed?: number }> = ({ x, y, s = 1, f, seed = 0 }) => {
  const b = 1 + 0.06 * Math.sin(f * 0.22 + seed * 1.7);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`scale(1 ${b})`}>
        <path d="M-70 0 Q-80 -80 -30 -120 Q-34 -70 -6 -60 Q-10 -140 40 -170 Q30 -100 70 -70 Q86 -30 70 0 Z" fill="#f08a3a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-40 0 Q-46 -50 -12 -76 Q-8 -40 14 -40 Q14 -90 40 -100 Q36 -50 50 -30 Q56 -10 46 0 Z" fill={MUSTARD} />
      </g>
      {[-50, -16, 18, 52].map((cx, i) => <ellipse key={cx} cx={cx} cy={-4 - (i % 2) * 6} rx={22} ry={14} fill="#2b2d33" stroke={INK} strokeWidth={3} />)}
      <rect x={-96} y={0} width={192} height={18} rx={4} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
      {[-70, -30, 10, 50].map((bx) => <rect key={bx} x={bx} y={18} width={14} height={40} fill={STEEL_DARK} stroke={INK} strokeWidth={3} />)}
    </g>
  );
};

/** 1865, Jevons: a coal fire, an arrow marked CHEAPER, then more fires, not fewer. Over the hall, dimmed. */
export const JevonsSheet: React.FC<{ t: ShotTime; bg: ReactNode }> = ({ t, bg }) => {
  const f = t.f;
  const spots = Array.from({ length: 9 }, (_, i) => ({ x: 930 + (i % 3) * 170, y: 250 + Math.floor(i / 3) * 190 }));
  return (
    <AbsoluteFill>
      {bg}
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <Paper f={f} x={960} y={610} w={1400} h={760} rot={-1}>
            <Pop x={230} y={520} k={pop(f, 4, 12)}><Fire x={0} y={0} s={1.3} f={f} /></Pop>
            <Arrow x1={420} x2={760} y={420} k={ramp(f, 100, 124)} w={10} />
            {f >= 108 && <g opacity={ramp(f, 108, 118)}><Caption x={590} y={380} text="CHEAPER" size={54} color={TEAL} rot={-2} /></g>}
            {spots.map((p, i) => (
              <Pop key={i} x={p.x} y={p.y + 70} k={pop(f, 140 + i * 13, 7)}><Fire x={0} y={0} s={0.62} f={f} seed={i + 1} /></Pop>
            ))}
          </Paper>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---- Napkins ---------------------------------------------------------------------------------------------------------

/** The empty slot under a napkin's sum: the line nobody wrote (dashed, pulsing), in the napkin's own frame. */
const Missing: React.FC<{ x: number; y: number; s: number; rot: number; f: number; at: number }> = ({ x, y, s, rot, f, at }) => {
  if (f < at) return null;
  const k = ramp(f, at, at + 8);
  const pulse = 0.65 + 0.35 * Math.sin((f - at) * 0.25);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={k * pulse}>
      <rect x={-220} y={148} width={440} height={64} rx={10} fill="none" stroke={CRIMSON} strokeWidth={6} strokeDasharray="18 12" />
    </g>
  );
};

/** Napkins on a surface: yours (written over the shot, or whole) and, with `his`, the boss's in his own hand. */
export const NapkinTable: React.FC<{ t: ShotTime; his?: boolean; missingAt?: number; surface?: "counter" | "desk" }> = ({ t, his, missingAt = 1e6, surface = "counter" }) => {
  const f = t.f;
  const z = mix(1, 1.06, ease(t.p));
  const mine = his ? { x: 560, y: 560, s: 1.02, rot: -6 } : { x: 960, y: 540, s: 1.4, rot: -4 };
  const boss = { x: 1360, y: 540, s: 1.02, rot: 5 };
  return (
    <AbsoluteFill style={{ background: surface === "desk" ? "#9a6a44" : "#e6ecef" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "960px 560px" }}>
        <svg width={1920} height={1080}>
          {surface === "desk"
            ? Array.from({ length: 9 }, (_, i) => <rect key={i} x={0} y={i * 130} width={1920} height={126} fill={i % 2 ? "#a8754c" : "#93633f"} />)
            : (
              <g>
                <rect x={0} y={0} width={1920} height={1080} fill="#dfe6ea" />
                {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={60 + i * 90} x2={1920} y2={40 + i * 90} stroke="#fff" strokeWidth={10} opacity={0.5} />)}
                <rect x={0} y={960} width={1920} height={120} fill="#1a6f68" />
              </g>
            )}
          {surface === "desk" && <circle cx={1700} cy={180} r={90} fill="none" stroke="#6b4426" strokeWidth={10} opacity={0.5} />}
          <Napkin {...mine} text={["3 WAGES: GONE", "BURGERS: SAME"]} write={his ? 1 : ramp(f, 4, 96)} pencil={!his} seed={1} big={58} />
          <Missing {...mine} f={f} at={missingAt} />
          {his && <Napkin {...boss} text={["WAGES: GONE", "CARS: SAME"]} ink="#8a2b3c" write={ramp(f, 0, 50)} pencil={f < 56} seed={4} big={58} />}
          {his && <Missing {...boss} f={f} at={missingAt} />}
          {his && <g transform={`translate(1740 900) rotate(-30)`}><rect x={-14} y={-140} width={28} height={190} rx={10} fill="#2f3242" stroke={INK} strokeWidth={4} /></g>}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---- The pillow ------------------------------------------------------------------------------------------------------

/** Night: you asleep on your pillow, the phone under it pinging once a shift (a glow through the cotton, a ring of
 *  ping lines, feathers puffing out). Pings on the given frames. */
export const Pillow: React.FC<{ t: ShotTime; pings: number[] }> = ({ t, pings }) => {
  const f = t.f;
  const z = mix(1.02, 1.08, ease(t.p));
  const last = pings.filter((p) => p <= f).pop();
  const since = last === undefined ? 99 : f - last;
  const glow = Math.max(0, 1 - since / 16);
  const jolt = since < 10 ? Math.sin(since * 2.2) * 6 * (1 - since / 10) : 0;
  return (
    <AbsoluteFill style={{ background: "#2a3158" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "960px 560px" }}>
        <svg width={1920} height={1080}>
          <rect x={0} y={0} width={1920} height={1080} fill="#2f3866" />
          <rect x={1320} y={90} width={420} height={300} rx={8} fill="#3c4a86" stroke="#1b2040" strokeWidth={14} />
          <circle cx={1560} cy={200} r={50} fill="#f6e7b0" opacity={0.85} />
          <rect x={0} y={640} width={1920} height={440} fill="#e9e3f3" />
          <path d="M0 700 Q480 640 960 700 T1920 690 V1080 H0 Z" fill={TEAL} stroke={INK} strokeWidth={6} />
          <g transform={`translate(${jolt} 0)`}>
            <rect x={460} y={430} width={980} height={310} rx={130} fill="#fbf7ee" stroke={INK} strokeWidth={7} />
            <path d="M520 470 Q560 450 600 470 M1320 470 Q1360 450 1400 470" stroke="#d9cfbd" strokeWidth={6} fill="none" />
            {glow > 0 && <ellipse cx={1180} cy={640} rx={220} ry={70} fill="#bff2ff" opacity={0.55 * glow} />}
            {/* your sleeping head on the pillow */}
            <g transform="translate(820 540) rotate(-14)">
              <path d="M-9 -112 Q-14 -150 6 -158 Q-2 -138 16 -134 Q10 -122 12 -112 Z" fill={INK} />
              <circle r={112} fill={MUSTARD} stroke={INK} strokeWidth={6} />
              <path d={since < 14 ? "M-44 -8 h28 M18 -8 h28" : "M-46 -6 q14 12 28 0 M16 -6 q14 12 28 0"} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
              <path d="M-6 46 q12 8 24 0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
          </g>
          {/* ping rings out from under the pillow */}
          {since < 22 && [0, 1].map((i) => {
            const p = Math.min(1, (since - i * 5) / 16);
            return p > 0 ? <ellipse key={i} cx={1180} cy={640} rx={120 + p * 260} ry={40 + p * 90} fill="none" stroke="#8fe9ff" strokeWidth={8} opacity={0.9 * (1 - p)} /> : null;
          })}
          {/* feathers puff out of the seam and drift down */}
          {pings.flatMap((p, k) => Array.from({ length: 4 }, (_, i) => {
            const u = (f - p) / 60;
            if (u < 0 || u > 1) return null;
            const fx = 1180 + (i - 1.5) * 70 + u * (i % 2 ? 90 : -70);
            const fy = 520 - Math.sin(u * Math.PI) * 160 + u * 90;
            return (
              <g key={`${k}-${i}`} transform={`translate(${fx} ${fy}) rotate(${(i - 1.5) * 30 + u * 140})`} opacity={1 - u * 0.6}>
                <path d="M0 -26 Q16 -6 0 26 Q-16 -6 0 -26 Z" fill="#fff" stroke={INK} strokeWidth={3} />
                <line x1={0} y1={-26} x2={0} y2={30} stroke={INK} strokeWidth={2} />
              </g>
            );
          }))}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
