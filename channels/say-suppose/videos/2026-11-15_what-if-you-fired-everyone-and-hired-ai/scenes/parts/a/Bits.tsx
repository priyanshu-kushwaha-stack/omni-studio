// Part A's small pieces (Who Eats? to The Plant): the paper page-flip back in time, the phone inserts (the app phone
// held to camera over the room, the diner's phone on speaker with Marco as the caller), and little props the
// foundation does not have (a car key, a painter's mask held in the hand, buzz marks, a sparkle, order ticks). All
// drawn in code, screen pixels unless noted. No AI images.
import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { MARCO_COAT, YOU } from "../Cast";
import { DinerShot, on, type Face } from "../Places";
import { AppPhone, type AppPhoneProps, CashFan, STEEL, STEEL_DARK, STEEL_LIGHT } from "../Props";
import { ease, mix, ramp, type ShotTime } from "../util";
import { Dressed } from "../Wear";

/** A shot time `by` frames later (to carry a looping prop on across a cut). */
export const later = (t: ShotTime, by: number): ShotTime => ({ ...t, f: t.f + by });

/** A page turned backwards: the new picture swings in over the old one from the left, hinged at the left edge,
 *  showing the paper's cream back on its way over. `f` frames since the flip began. */
export const PageFlip: React.FC<{ f: number; dur?: number; from: ReactNode; to: ReactNode }> = ({ f, dur = 16, from, to }) => {
  const k = ease(ramp(f, 0, dur));
  if (k >= 1) return <>{to}</>;
  const a = -180 * (1 - k);
  const front = a > -90;
  return (
    <AbsoluteFill>
      {from}
      <AbsoluteFill style={{ background: "#120c06", opacity: 0.5 * Math.sin(Math.PI * k) }} />
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 50%" }}>
        <AbsoluteFill style={{ transformOrigin: "0px 540px", transform: `rotateY(${a}deg)`, overflow: "hidden" }}>
          {front ? to : <AbsoluteFill style={{ background: PAPER, borderRight: `10px solid #d9cfbd` }} />}
          {front && <AbsoluteFill style={{ background: "#000", opacity: 0.4 * (1 - k) }} />}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A hand that holds the phone from below (your mustard hand by default), drawn under the phone's bottom edge. */
const HoldingHand: React.FC<{ x: number; y: number; s: number; color?: string }> = ({ x, y, s, color = MUSTARD }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-150 120 Q-170 -40 -120 -60 L120 -60 Q170 -40 150 120 Z" fill={color} stroke={INK} strokeWidth={8} />
    <path d="M-262 -20 Q-282 -140 -232 -150 Q-200 -150 -196 -40" fill={color} stroke={INK} strokeWidth={8} />
  </g>
);

/** The app phone held up to camera over the room (the diner dimmed behind it). `appear` frames to rise into view. */
export const PhoneInsert: React.FC<{
  t: ShotTime; phone: AppPhoneProps; mood?: "morning" | "day" | "night" | "lamp" | "dusk"; x?: number; s?: number;
  push?: [number, number]; pushAt?: { x: number; y: number }; bg?: ReactNode; hand?: string; extra?: ReactNode;
}> = ({ t, phone, mood = "morning", x = 960, s = 0.95, push = [1, 1.06], pushAt, bg, hand, extra }) => {
  const rise = ease(ramp(t.f, 0, 8));
  const y = mix(700, 560, rise);
  const z = mix(push[0], push[1], ease(t.p));
  return (
    <AbsoluteFill>
      {bg ?? <DinerShot t={t} mood={mood} cam="counter" grill="cold" dim={0.42} push={[1.04, 1.08]} />}
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${pushAt?.x ?? x}px ${pushAt?.y ?? 600}px` }}>
        <svg width={1920} height={1080}>
          <HoldingHand x={x} y={y + 470 * s} s={s} color={hand} />
          <AppPhone x={x} y={y} s={s} rot={-2} frame={t.f} {...phone} />
          {extra}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** The diner's phone on speaker in the waitress's peach hand, Marco on the screen as the caller (head and paper hat,
 *  in his street coat). `face` his face; `cough` puffs on the given frames; speaker waves while he talks. */
export const CallerPhone: React.FC<{ t: ShotTime; face?: Face; coughs?: number[]; talk?: boolean; jolt?: number }> = ({
  t, face = "sad", coughs = [], talk = true, jolt = -1,
}) => {
  const f = t.f;
  const rise = ease(ramp(f, 0, 8));
  const shake = jolt >= 0 && f >= jolt ? Math.sin((f - jolt) * 1.7) * 10 * Math.exp(-(f - jolt) / 8) : 0;
  const px = 1250 + shake, py = mix(680, 560, rise);
  const W = 470, H = 860;
  return (
    <AbsoluteFill>
      <DinerShot t={t} mood="morning" cam="counter" grill="cold" dim={0.4} push={[1.03, 1.07]}
        cast={[on("till", YOU, "worried", { behind: true, look: { x: 0.9, y: 0.1 } })]} />
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <defs>
            <clipPath id="caller-screen"><rect x={px - W / 2 + 24} y={py - H / 2 + 24} width={W - 48} height={H - 48} rx={36} /></clipPath>
          </defs>
          <g transform={`rotate(4 ${px} ${py})`}>
            <rect x={px - W / 2 + 16} y={py - H / 2 + 22} width={W} height={H} rx={56} fill="#000" opacity={0.4} />
            <rect x={px - W / 2} y={py - H / 2} width={W} height={H} rx={56} fill="#16181f" stroke={PAPER} strokeWidth={9} />
            <rect x={px - W / 2 + 24} y={py - H / 2 + 24} width={W - 48} height={H - 48} rx={36} fill="#cfe6f2" />
            <g clipPath="url(#caller-screen)">
              <rect x={px - W / 2} y={py - 30} width={W} height={H} fill="#b4d3e4" />
              <Dressed x={px - 20} y={py + 470} scale={2.1} facing={1} pose={{ ...STAND, armF: [30, 40] }} time={f}
                {...EXPRESSIONS[face]} {...MARCO_COAT} />
            </g>
            {/* the red hang-up and the speaker button, lit */}
            <circle cx={px - 100} cy={py + H / 2 - 110} r={40} fill={CRIMSON} stroke={INK} strokeWidth={5} />
            <circle cx={px + 100} cy={py + H / 2 - 110} r={40} fill={TEAL} stroke={INK} strokeWidth={5} />
            <path d={`M${px + 86} ${py + H / 2 - 122} h10 l12 -10 v44 l-12 -10 h-10 Z`} fill={PAPER} />
            {/* speaker waves out of the phone's side while he talks */}
            {talk && [0, 1, 2].map((i) => {
              const p = ((f / 18) + i / 3) % 1;
              return <path key={i} d={`M${px + W / 2 + 30 + p * 90} ${py - 140 - p * 40} q${30 + p * 30} ${120 + p * 40} 0 ${240 + p * 80}`}
                fill="none" stroke={PAPER} strokeWidth={8} strokeLinecap="round" opacity={0.85 * (1 - p)} />;
            })}
            {/* a cough: three puffs out of the screen */}
            {coughs.map((c) => (f >= c && f < c + 14 ? [0, 1, 2].map((i) => {
              const p = (f - c) / 14;
              return <circle key={`${c}-${i}`} cx={px + 60 + i * 40 + p * 80} cy={py - 120 - i * 26 - p * 40} r={14 + p * 18} fill={PAPER} opacity={0.8 * (1 - p)} />;
            }) : null))}
          </g>
          {/* her peach hand round the phone's lower half */}
          <path d={`M${px - 270} ${py + 520} Q${px - 290} ${py + 200} ${px - 220} ${py + 170} L${px - 150} ${py + 160} L${px - 150} ${py + 520} Z`}
            fill="#f6c09a" stroke={INK} strokeWidth={7} />
          <path d={`M${px + 215} ${py + 170} q34 0 36 30 q2 30 -36 30 Z M${px + 215} ${py + 240} q34 0 36 30 q2 30 -36 30 Z`} fill="#f6c09a" stroke={INK} strokeWidth={6} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A car key on a ring, gripped at the origin (for a raised hand). */
export const CarKey: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <circle cx={0} cy={-22} r={16} fill="none" stroke={STEEL_DARK} strokeWidth={5} />
    <rect x={-14} y={-50} width={28} height={30} rx={8} fill="#2f3242" stroke={INK} strokeWidth={4} />
    <path d="M-5 -50 V-92 h10 v8 h-6 v6 h6 v8 h-6 V-50 Z" fill={STEEL_LIGHT} stroke={INK} strokeWidth={3} />
  </g>
);

/** A painter's mask held in the hand (taken off), gripped at the origin. */
export const MaskInHand: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-26 -30 Q-28 6 0 10 Q28 6 26 -30 Q0 -44 -26 -30 Z" fill="#f4f6f7" stroke={INK} strokeWidth={4} />
    <circle cx={-12} cy={-12} r={7} fill={STEEL} stroke={INK} strokeWidth={3} />
    <circle cx={12} cy={-12} r={7} fill={STEEL} stroke={INK} strokeWidth={3} />
    <path d="M-26 -26 Q-40 -10 -30 8" fill="none" stroke={INK} strokeWidth={3} />
  </g>
);

/** Buzz marks either side of a point (a phone buzzing in a pocket), on `f`. */
export const Buzz: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const on = Math.floor(f / 4) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={on ? 1 : 0.35}>
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 34} -22 q${d * 10} 22 0 44`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d={`M${d * 50} -30 q${d * 14} 30 0 60`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

/** A four-point sparkle, popping on at `at` frames and fading. */
export const Sparkle: React.FC<{ x: number; y: number; f: number; at: number; s?: number; color?: string }> = ({ x, y, f, at, s = 1, color = "#fffbe6" }) => {
  if (f < at) return null;
  const k = ramp(f, at, at + 6) * (1 - ramp(f, at + 20, at + 34));
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.5 * k)}) rotate(${(f - at) * 3})`} opacity={k}>
      <path d="M0 -40 Q6 -6 40 0 Q6 6 0 40 Q-6 6 -40 0 Q-6 -6 0 -40 Z" fill={color} stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A small paper tick in a circle over a customer's head (an order taken), popping at `at`. World or screen units. */
export const OrderTick: React.FC<{ x: number; y: number; f: number; at: number }> = ({ x, y, f, at }) => {
  if (f < at) return null;
  const k = ramp(f, at, at + 5);
  return (
    <g transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * k})`} opacity={k}>
      <circle r={26} fill={PAPER} stroke={INK} strokeWidth={4} />
      <path d="M-12 0 L-3 10 L13 -10" fill="none" stroke={TEAL} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** A chime mark: a little bell with ring lines, popping at `at` (the door's two-note chirp made visible). */
export const ChimeMark: React.FC<{ x: number; y: number; f: number; at: number; s?: number }> = ({ x, y, f, at, s = 1 }) => {
  if (f < at || f > at + 22) return null;
  const k = ramp(f, at, at + 4) * (1 - ramp(f, at + 14, at + 22));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
      <path d="M-18 10 Q-16 -18 0 -18 Q16 -18 18 10 Z" fill="#e0b84a" stroke={INK} strokeWidth={4} />
      {[-1, 1].map((d) => <path key={d} d={`M${d * 28} -14 q${d * 10} 12 0 24`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />)}
    </g>
  );
};

/** A label for a tool: drawn text for small on-paper captions (one word, e.g. CHEAPER). */
export const Caption: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; rot?: number }> = ({ x, y, text, size = 44, color = INK, rot = 0 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} transform={`rotate(${rot} ${x} ${y})`}>{text}</text>
);

/** Marco's paper hat taken off and held in the hand (gripped at the origin, crown up). */
export const HatInHand: React.FC<{ s?: number; hard?: boolean }> = ({ s = 1, hard }) => (
  <g transform={`scale(${s}) translate(0 -6)`}>
    {hard ? (
      <g>
        <path d="M-40 10 Q-38 -40 2 -42 Q42 -40 42 10 Z" fill="#f7d038" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <rect x={-50} y={6} width={102} height={10} rx={5} fill="#f7d038" stroke={INK} strokeWidth={4} />
      </g>
    ) : (
      <g>
        <path d="M-44 10 L44 10 L36 -22 Q0 -40 -36 -22 Z" fill="#fbfbf6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M-38 0 L38 0" stroke={INK} strokeWidth={3} opacity={0.5} />
      </g>
    )}
  </g>
);

/** A few notes held out to pay (the thumbnail's cash fan, smaller). */
export const CashFanHeld: React.FC = () => <CashFan s={1.1} n={3} />;

/** A clipboard held at the chest (the boss at the gate), gripped at the origin. */
export const Clipboard: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s}) rotate(-8)`}>
    <rect x={-30} y={-80} width={60} height={84} rx={6} fill="#b98a5a" stroke={INK} strokeWidth={4} />
    <rect x={-22} y={-70} width={44} height={66} fill={PAPER} />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-16} y1={-58 + i * 14} x2={14} y2={-58 + i * 14} stroke={INK} strokeWidth={3} opacity={0.5} />)}
    <rect x={-12} y={-86} width={24} height={12} rx={3} fill={STEEL} stroke={INK} strokeWidth={3} />
  </g>
);
