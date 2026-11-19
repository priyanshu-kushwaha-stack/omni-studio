// Part C's close inserts on the counter top: the napkin and the phone side by side (the dial dragged, stopped on the
// napkin's third line, held out to the mayor's thumbs), the town's napkin filling with crossings-out, and the strange
// card at the till beside your phone that does not ping. Screen pixels.
import { AbsoluteFill } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { AppPhone, Card, Napkin, Pencil, SmallAppPhone, Till } from "../Props";
import type { ShotTime } from "../util";
import { act, CounterTop, Hand, mix, ramp, Thumb } from "./kit";

/** Your napkin: two lines of the sum and the third, the missing line. */
export const NAPKIN_TEXT = "...and he ate here";

/** What a machine costs a week at a dial value (story numbers in plain words, like part A's "CHEAP"): the bottom reads
 *  CHEAP, the top TOO DEAR, and in between the weekly price, three hundred and sixty on the napkin's line. */
export const priceAt = (v: number) => Math.round((30 * Math.pow(2400 / 30, Math.max(0, v - 0.05) / 0.95)) / 10) * 10;
/** The dial value that shows a weekly price. */
export const valueFor = (price: number) => 0.05 + (0.95 * Math.log(price / 30)) / Math.log(2400 / 30);
export const readout = (v: number) => (v < 0.09 ? "CHEAP" : v > 0.96 ? "TOO DEAR" : `${priceAt(v)} A WEEK`);
/** Where the dial sits: at the bottom (cheap), on your napkin's line (360 a week), and on the town's number (the same). */
export const DIAL_LOW = 0.05;
export const DIAL_NAPKIN = valueFor(360);
export const DIAL_TOWN = DIAL_NAPKIN;

/** The phone and the napkin side by side on the counter. `value` the dial; `thumb` your thumb on the ring; `glow` lights
 *  the napkin's third line (the dial stopping on it); `slide` 0..1 brings both in from the bottom (laid down);
 *  `mood` the light. Extra nodes (thumbs, hands) go in `children`, over everything. */
export const PhoneAndNapkin: React.FC<{
  t: ShotTime; value: number; thumb?: boolean; glow?: number; slide?: number; mood?: "lamp" | "day" | "morning"; job?: string;
  napkin?: React.ReactNode; push?: number; children?: React.ReactNode;
}> = ({ t, value, thumb, glow = 0, slide = 1, mood = "morning", job = "COOK", napkin, push = 0.04, children }) => {
  const s = 1 + push * t.p;
  const up = (1 - slide) * 900;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform={`translate(960 540) scale(${s}) translate(-960 -540)`}>
          <CounterTop mood={mood} />
          <g transform={`translate(0 ${up * 1.1})`}>
            {napkin ?? <Napkin x={560} y={560} s={1.25} rot={-5} scribbles={2} text={NAPKIN_TEXT} />}
            {glow > 0 && (
              <g transform="translate(560 560) rotate(-5)">
                <rect x={-250} y={-48} width={500} height={58} rx={12} fill={MUSTARD} opacity={0.35 * glow} />
              </g>
            )}
          </g>
          <g transform={`translate(0 ${up})`}>
            <AppPhone x={1300} y={540} s={0.92} rot={3} mode="app" job={job} value={value} readout={readout(value)} thumb={thumb} frame={t.f} />
          </g>
          {children}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Where the AppPhone's ring is in PhoneAndNapkin (screen), and a point on it at a value. */
const DIAL = { x: 1300, y: 540, s: 0.92, rot: 3 };
export function ringPoint(v: number) {
  const a = ((-225 + 270 * v) * Math.PI) / 180;
  const top = -480 + 26;
  const lx = Math.cos(a) * 150, ly = top + 520 + Math.sin(a) * 150;
  const r = (DIAL.rot * Math.PI) / 180;
  return { x: DIAL.x + (lx * Math.cos(r) - ly * Math.sin(r)) * DIAL.s, y: DIAL.y + (lx * Math.sin(r) + ly * Math.cos(r)) * DIAL.s, a: (-225 + 270 * v) + DIAL.rot };
}

/** The mayor's thumbs on the ring: one, then two, straining; the ring never moves. f is frames into the attempt. */
export const MayorThumbs: React.FC<{ f: number; v: number }> = ({ f, v }) => {
  const p = ringPoint(v);
  const shake = Math.sin(f * 1.7) * 4;
  const two = f > 34;
  const press = act(f, 0, 8);
  return (
    <g>
      <Thumb x={p.x + shake} y={p.y + 30 * (1 - press)} rot={p.a + 90} skin="#a9c4a0" sleeve="#3b4a5a" s={0.85} />
      {two && <Thumb x={p.x + 46 - shake} y={p.y + 30 + 30 * (1 - act(f, 34, 42))} rot={p.a + 70} skin="#a9c4a0" sleeve="#3b4a5a" s={0.85} />}
      {f > 10 && [0, 1, 2].map((i) => (
        <line key={i} x1={p.x - 90 - i * 18} y1={p.y - 60 + i * 30} x2={p.x - 120 - i * 18} y2={p.y - 70 + i * 30} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      ))}
    </g>
  );
};

/** One person's go at the town's number: who (their skin and sleeve for the hand, their ink) and what they write. */
export interface Writer { skin: string; sleeve: string; ink: string; text: string }
export const WRITERS: Writer[] = [
  { skin: "#a9c4a0", sleeve: "#3b4a5a", ink: "#3f6f3a", text: "300" },
  { skin: "#8fa3b8", sleeve: "#2f3242", ink: "#2f3242", text: "200" },
  { skin: "#c3b1e1", sleeve: "#4a4a6a", ink: "#6a4fa0", text: "500" },
  { skin: "#f6c09a", sleeve: "#e58f9a", ink: "#c0567a", text: "400" },
  { skin: "#c8a2e8", sleeve: "#4f6d8a", ink: "#7a3fa0", text: "380" },
  { skin: "#a9d4ec", sleeve: "#e6ecef", ink: "#2f6f9f", text: "360" },
];
const SLOTS = [[-215, 80], [-70, 80], [75, 80], [-215, 180], [-70, 180], [92, 192]] as const;
const FROM = [200, 240, 300, 120, 60, 90];

/** The town's napkin (screen pixels, centred at x, y, scale s): your three lines, and under them each person's number,
 *  each crossing out the one before, until the last stands circled. `n` how many have written (fractional: the current
 *  one is mid-stroke); `hands` draws the current writer's hand. */
export const TownNapkin: React.FC<{ x: number; y: number; s?: number; n: number; hands?: boolean }> = ({ x, y, s = 1.25, n, hands = true }) => {
  const done = Math.floor(n);
  const part = n - done;
  const cur = Math.min(WRITERS.length - 1, done);
  const circle = ramp(n, WRITERS.length, WRITERS.length + 0.4);
  return (
    <g transform={`translate(${x} ${y}) rotate(-5) scale(${s})`}>
      <Napkin x={0} y={0} s={1} rot={0} scribbles={2} text={NAPKIN_TEXT} />
      {WRITERS.map((w, i) => {
        if (i > done || (i === done && part <= 0)) return null;
        const k = i < done ? 1 : ramp(part, 0.2, 0.75);
        const [sx, sy] = SLOTS[i];
        const crossed = i < done - 0 && i < WRITERS.length - 1 && n >= i + 1.15;
        return (
          <g key={i}>
            <clipPath id={`town-n-${i}`}><rect x={sx - 6} y={sy - 60} width={140 * k} height={80} /></clipPath>
            <text x={sx} y={sy} fontFamily={FONT} fontWeight={800} fontSize={i === WRITERS.length - 1 ? 60 : 44} fill={w.ink} clipPath={`url(#town-n-${i})`}
              transform={`rotate(${(i % 3) - 1.5} ${sx} ${sy})`}>{w.text}</text>
            {crossed && <line x1={sx - 8} y1={sy - 18} x2={sx - 8 + 120 * ramp(n, i + 1.0, i + 1.2)} y2={sy - 24} stroke={WRITERS[i + 1].ink} strokeWidth={8} strokeLinecap="round" />}
          </g>
        );
      })}
      {circle > 0 && (
        <ellipse cx={SLOTS[5][0] + 62} cy={SLOTS[5][1] - 20} rx={92} ry={50} fill="none" stroke={CRIMSON} strokeWidth={7}
          strokeDasharray={480} strokeDashoffset={480 * (1 - circle)} />
      )}
      {hands && n < WRITERS.length + 0.1 && part > 0.05 && (() => {
        const w = WRITERS[cur];
        const [sx, sy] = SLOTS[cur];
        const k = ramp(part, 0.2, 0.75);
        const inn = act(part, 0, 0.2) * (1 - act(part, 0.85, 1));
        const tipX = sx + 120 * k, tipY = sy - 10;
        const far = 700 * (1 - inn);
        const a = (FROM[cur] * Math.PI) / 180;
        return <Hand x={tipX + Math.cos(a) * far} y={tipY + Math.sin(a) * far} from={FROM[cur] - 180 + 90} skin={w.skin} sleeve={w.sleeve} s={0.75} pencil />;
      })()}
    </g>
  );
};

/** The strange card at the till, close: the steel hand taps a card you've never seen (no name, a colour you don't know);
 *  the till pings; your phone on the counter beside it stays dark. `f` frames into the insert. */
export const CardAtTill: React.FC<{ t: ShotTime }> = ({ t }) => {
  const tap = act(t.f, 4, 14);
  const ping = ramp(t.f, 14, 22) * (1 - ramp(t.f, 40, 50));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform={`translate(760 540) scale(${1 + 0.05 * t.p}) translate(-760 -540)`}>
          <CounterTop mood="day" />
          <Till x={560} y={900} s={2.6} ping={ping} />
          {/* your phone face up beside the till: dark, no ping */}
          <g transform="translate(1180 930) rotate(-4)">
            <rect x={-150} y={-60} width={300} height={120} rx={26} fill="#1b1d24" stroke={INK} strokeWidth={6} />
            <rect x={-130} y={-44} width={260} height={88} rx={16} fill="#20242c" />
            <circle cx={-112} cy={0} r={7} fill="#3a3f4a" />
          </g>
          {/* the steel hand with the card */}
          <g transform={`translate(${mix(1500, 820, tap)} ${mix(420, 520, tap)}) rotate(-20)`}>
            <rect x={0} y={-22} width={700} height={44} rx={20} fill="#9fb0bd" stroke={INK} strokeWidth={6} />
            <circle cx={0} cy={0} r={34} fill="#c9d3da" stroke={INK} strokeWidth={6} />
            <Card x={-40} y={-40} s={1.6} rot={-10} strange named={false} />
          </g>
          {ping > 0 && <circle cx={560} cy={500} r={60 + 140 * ping} fill="none" stroke={PAPER} strokeWidth={8} opacity={0.6 * (1 - ping)} />}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** The strange card and your phone, side by side, still: you look from one to the other. */
export const CardAndPhone: React.FC<{ t: ShotTime }> = ({ t }) => (
  <AbsoluteFill>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <g transform={`translate(800 540) scale(${1.02 + 0.06 * t.p}) translate(-800 -540)`}>
        <CounterTop mood="day" />
        <Card x={520} y={560} s={3.2} rot={-6} strange named={false} />
        <g transform="translate(1140 560) rotate(5) scale(3.4)"><SmallAppPhone s={1} rot={0} lit={false} /></g>
        <g transform={`translate(${mix(400, 1140, act(t.f, 14, 30))} 860)`} opacity={0.9}>
          <circle r={14} fill={MUSTARD} stroke={INK} strokeWidth={4} />
        </g>
      </g>
    </svg>
  </AbsoluteFill>
);

/** You lay the napkin and the phone side by side in front of the crowd (lamp light): both slide in from the bottom. */
export const LayDown: React.FC<{ t: ShotTime }> = ({ t }) => (
  <PhoneAndNapkin t={t} value={DIAL_LOW} slide={act(t.f, 4, 30)} mood="lamp">
    <g opacity={1 - act(t.f, 30, 44)}>
      <Hand x={mix(560, 560, 0)} y={mix(1400, 720, act(t.f, 4, 30))} from={100} skin={MUSTARD} sleeve={PAPER} s={1} />
      <Hand x={1300} y={mix(1500, 860, act(t.f, 8, 30))} from={80} skin={MUSTARD} sleeve={PAPER} s={1} />
    </g>
  </PhoneAndNapkin>
);

/** A pencil lying by the napkin (slid across to the mayor). */
export const SlidPencil: React.FC<{ x: number; y: number }> = ({ x, y }) => <Pencil x={x} y={y} rot={-20} s={1.4} />;
