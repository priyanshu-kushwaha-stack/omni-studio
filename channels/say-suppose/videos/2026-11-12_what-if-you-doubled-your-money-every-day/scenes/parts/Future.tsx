// Script v5's set pieces (owner, 2026-11-13: "I want exciting stuff"; the Gemini outside review): the bar chart that
// shows one night beating all the nights before it, the spending run, the shares, a million euros to every phone in
// Berlin, the news, the Earth wrapped in your digits, the universe of cents, and the run for a one-cent taker.
// Library sets where one fits; the rest drawn in screen pixels.
import { AbsoluteFill } from "remotion";
import { SetScene } from "@whatif/kit/sets/SetScene";
import { citySkyline, street, tvStudio } from "@whatif/kit/sets";
import { HERO } from "@whatif/kit/sets/cast";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { useTalk } from "./cast";
import { ease, euros, mix, Push, ramp, type ShotTime } from "./util";

const W = 1920;
const H = 1080;
const Txt: React.FC<{ x: number; y: number; s: number; fill?: string; w?: number; a?: "start" | "middle" | "end"; children: React.ReactNode }> = ({
  x, y, s, fill = INK, w = 800, a = "middle", children,
}) => <text x={x} y={y} textAnchor={a} fontFamily={FONT} fontWeight={w} fontSize={s} fill={fill}>{children}</text>;
/** A tiny deterministic random in 0..1. */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Day twenty-three: twenty-two bars stacked into one column, then day twenty-three slams up taller than the stack. */
export const BarChart: React.FC<{ t: ShotTime }> = ({ t }) => {
  const stack = Array.from({ length: 22 }, (_, i) => 2 ** i);
  const total = 2 ** 22 - 1;
  const scale = 640 / 2 ** 22;
  let y = 900;
  const built = ramp(t.p, 0.05, 0.45);
  const big = ease(ramp(t.p, 0.5, 0.62));
  return (
    <AbsoluteFill style={{ background: "#1b2440" }}>
      <svg width={W} height={H}>
        {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 99) * 500} r={2 + rnd(i + 7) * 2} fill={PAPER} opacity={0.5} />)}
        <line x1={300} y1={900} x2={1620} y2={900} stroke={PAPER} strokeWidth={6} />
        {stack.map((v, i) => {
          const h = Math.max(4, v * scale);
          y -= h;
          const on = i / 22 < built;
          return on ? <rect key={i} x={620} y={y} width={240} height={h} fill={i % 2 ? TEAL : "#5fc4b8"} stroke={INK} strokeWidth={2} /> : null;
        })}
        <Txt x={740} y={960} s={40} fill={PAPER}>DAYS 1 TO 22</Txt>
        <Txt x={740} y={1010} s={30} fill={PAPER} w={600}>{euros(total)} €</Txt>
        <rect x={1060} y={900 - 2 ** 22 * scale * big} width={240} height={2 ** 22 * scale * big} fill={MUSTARD} stroke={INK} strokeWidth={4} />
        <Txt x={1180} y={960} s={40} fill={MUSTARD}>DAY 23 ALONE</Txt>
        <Txt x={1180} y={1010} s={30} fill={MUSTARD} w={600}>{euros(2 ** 22)} €</Txt>
        {big > 0.95 && <Txt x={1180} y={210} s={56} fill={MUSTARD}>+ 1 CENT TALLER</Txt>}
      </svg>
    </AbsoluteFill>
  );
};

/** A phone held big: `spend` taps BUY down a list while the cart total climbs; `midnight` tears the coin and flips
 *  what was left (six million) to thirteen. */
export const ShopPhone: React.FC<{ t: ShotTime; mode: "spend" | "midnight" }> = ({ t, mode }) => {
  const items: [string, number][] = [["ELECTRIC CAR", 120000], ["PENTHOUSE", 3200000], ["TINY JET", 680000]];
  const bought = mode === "spend" ? Math.min(3, Math.floor(ramp(t.p, 0.1, 0.85) * 3.2)) : 3;
  const flip = mode === "midnight" ? ease(ramp(t.p, 0.45, 0.6)) : 0;
  const left = 1073741824 - 400000000;
  const bal = flip > 0.5 ? left * 2 : left;
  return (
    <AbsoluteFill style={{ background: mode === "midnight" ? "#14182a" : "#e9d7b5" }}>
      <Push t={t} from={1} to={1.05}>
        <svg width={W} height={H}>
          <g transform="translate(960 540) rotate(-4)">
            <rect x={-300} y={-500} width={600} height={1000} rx={60} fill="#0d0e14" />
            <rect x={-270} y={-470} width={540} height={940} rx={40} fill={PAPER} />
            {mode === "spend" ? (
              <>
                <Txt x={0} y={-380} s={44}>SHOP</Txt>
                {items.map(([name, price], i) => (
                  <g key={name} transform={`translate(0 ${-260 + i * 190})`}>
                    <rect x={-230} y={-70} width={460} height={150} rx={20} fill={i < bought ? "#d6efe0" : "#fff"} stroke={INK} strokeWidth={4} />
                    <Txt x={-200} y={-12} s={36} a="start">{name}</Txt>
                    <Txt x={-200} y={40} s={30} a="start" w={600}>{euros(price * 100)} €</Txt>
                    <rect x={90} y={-30} width={120} height={64} rx={14} fill={i < bought ? TEAL : CRIMSON} />
                    <Txt x={150} y={14} s={30} fill={PAPER}>{i < bought ? "✓" : "BUY"}</Txt>
                  </g>
                ))}
                <Txt x={0} y={360} s={34} w={700}>SPENT TODAY</Txt>
                <Txt x={0} y={420} s={48} fill={CRIMSON}>{euros(items.slice(0, bought).reduce((s, [, p]) => s + p, 0) * 100)} €</Txt>
              </>
            ) : (
              <>
                <circle cx={-mix(0, 70, flip) * (flip > 0 ? 1 : 0)} cy={-200} r={60} fill={MUSTARD} stroke={INK} strokeWidth={5} />
                {flip > 0 && <circle cx={mix(0, 70, flip)} cy={-200} r={60} fill={MUSTARD} stroke={INK} strokeWidth={5} />}
                <Txt x={0} y={20} s={40} w={700}>{flip > 0.5 ? "DAY 32" : "DAY 31 · 23:59"}</Txt>
                <Txt x={0} y={110} s={62}>{euros(bal)} €</Txt>
              </>
            )}
          </g>
        </svg>
      </Push>
    </AbsoluteFill>
  );
};

/** Day thirty-four: a share chart on a laptop. Each BUY tap pushes the line up. */
export const Shares: React.FC<{ t: ShotTime }> = ({ t }) => {
  const n = 40;
  const drawn = ramp(t.p, 0.05, 0.9);
  const pts = Array.from({ length: n }, (_, i) => {
    const k = i / (n - 1);
    const lift = Math.max(0, k - 0.15) ** 1.4 * 640;
    return [360 + k * 1200, 760 - lift - Math.sin(i * 1.7) * 18];
  });
  const shown = pts.slice(0, Math.max(2, Math.round(drawn * n)));
  const tap = Math.floor(t.f / 14) % 2 === 0 && t.p > 0.3;
  return (
    <AbsoluteFill style={{ background: "#2a2f3a" }}>
      <Push t={t} from={1} to={1.06}>
        <svg width={W} height={H}>
          <rect x={260} y={140} width={1400} height={760} rx={30} fill="#0d0e14" />
          <rect x={290} y={170} width={1340} height={700} rx={14} fill="#f4f1e8" />
          <Txt x={340} y={240} s={42} a="start">BAKERY CHAIN · SHARES</Txt>
          <polyline points={shown.map((p) => p.join(",")).join(" ")} fill="none" stroke={TEAL} strokeWidth={10} strokeLinejoin="round" />
          <Txt x={1580} y={240} s={52} a="end" fill={TEAL}>+{Math.round(ramp(t.p, 0.3, 0.9) * 340)}%</Txt>
          <rect x={1340} y={760} width={240} height={80} rx={16} fill={tap ? "#9a1d33" : CRIMSON} />
          <Txt x={1460} y={815} s={40} fill={PAPER}>BUY</Txt>
          <rect x={160} y={900} width={1600} height={50} rx={12} fill="#8a8f98" />
        </svg>
      </Push>
    </AbsoluteFill>
  );
};

/** Day fifty: every phone in every window lights up with +1.000.000,00; the tram stops, its driver gone; the board climbs. */
export const Airdrop: React.FC<{ t: ShotTime; board?: boolean }> = ({ t, board }) => {
  const k = ease(ramp(t.p, 0, 0.5));
  const prices = ["4,20", "42,00", "63,00"];
  const price = prices[Math.min(2, Math.floor(ramp(t.p, 0.4, 0.95) * 3))];
  return (
    <Push t={t} from={1} to={1.08}>
      <SetScene set={citySkyline} mood="day" frame={t.f} cam={citySkyline.cameras.wide} options={{ birds: true, traffic: false, shoreLamps: false }} cast={[]}
        actors={
          <>
            {Array.from({ length: 46 }, (_, i) => {
              const x = 80 + rnd(i) * 1760;
              const y = 160 + rnd(i + 50) * 520;
              const on = rnd(i + 9) < k;
              const buzz = on ? Math.sin(t.f * 1.3 + i) * 3 : 0;
              return on ? (
                <g key={i} transform={`translate(${x + buzz} ${y})`}>
                  <circle r={34} fill="#cfe9f4" opacity={0.35} />
                  <rect x={-11} y={-18} width={22} height={36} rx={4} fill="#0d0e14" />
                  <rect x={-8} y={-15} width={16} height={28} rx={2} fill="#cfe9f4" />
                  {i % 3 === 0 && <Txt x={0} y={-30} s={24} fill={TEAL}>+1.000.000</Txt>}
                </g>
              ) : null;
            })}
            {board && (
              <g transform="translate(1500 760) rotate(3)">
                <rect x={-200} y={-110} width={400} height={220} rx={14} fill="#2b3a2f" stroke="#8a6a3a" strokeWidth={14} />
                <Txt x={0} y={-36} s={40} fill={PAPER}>Brötchen</Txt>
                <Txt x={0} y={60} s={84} fill={PAPER}>{price}</Txt>
              </g>
            )}
          </>
        } />
    </Push>
  );
};

/** Day fifty-two: the news. The anchor at her desk, BREAKING along the bottom, Berlin glowing gold on the screen. */
export const News: React.FC<{ t: ShotTime }> = ({ t }) => {
  const talk = useTalk();
  return (
    <Push t={t} from={1} to={1.05}>
      <SetScene set={tvStudio} mood="day" frame={t.f} cam={tvStudio.cameras.wide} options={{ screen: "map", drawn: 1, live: true }}
        cast={[{ spot: "anchor", who: { head: "#d9a07a", coat: "#2f4a6a" }, face: { ...EXPRESSIONS.shocked, ...talk("Anchor") } }]}
        actors={
          <>
            <circle cx={960} cy={330} r={60 + Math.sin(t.f / 6) * 8} fill={MUSTARD} opacity={0.5} />
            <circle cx={960} cy={330} r={24} fill={MUSTARD} stroke={INK} strokeWidth={4} />
            <rect x={0} y={900} width={W} height={110} fill={CRIMSON} />
            <rect x={0} y={900} width={260} height={110} fill={INK} />
            <Txt x={130} y={972} s={44} fill={PAPER}>BREAKING</Txt>
            <Txt x={300} y={972} s={44} fill={PAPER} a="start">ONE BERLIN ACCOUNT: TOO BIG TO COUNT</Txt>
          </>
        } />
    </Push>
  );
};

/** Day fifty-five: out from the city to the whole Earth, a ring of your digits wrapping it. */
export const Globe: React.FC<{ t: ShotTime; label?: string }> = ({ t, label = "180.143.985.094.819,84 €" }) => {
  const k = ease(ramp(t.p, 0, 0.6));
  const r = mix(1400, 300, k);
  const spin = t.f * 0.6;
  return (
    <AbsoluteFill style={{ background: "#070a18" }}>
      <svg width={W} height={H}>
        {Array.from({ length: 120 }, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 300) * H} r={1 + rnd(i + 5) * 2} fill={PAPER} opacity={0.7} />)}
        <defs><clipPath id="earth"><circle cx={960} cy={540} r={r} /></clipPath></defs>
        <circle cx={960} cy={540} r={r} fill="#2f6fb0" />
        <g clipPath="url(#earth)">
          {[[-0.4, -0.2, 0.5, 0.35], [0.3, 0.1, 0.4, 0.5], [-0.1, 0.45, 0.35, 0.2], [0.55, -0.45, 0.3, 0.2]].map(([x, y, w, h], i) => (
            <ellipse key={i} cx={960 + (((x * r + spin) % (2 * r)) + 2 * r) % (2 * r) - r} cy={540 + y * r} rx={w * r} ry={h * r} fill="#4f9a5a" />
          ))}
          <circle cx={960 - r * 0.3} cy={540 - r * 0.3} r={r} fill="#fff" opacity={0.08} />
        </g>
        <circle cx={960} cy={540} r={r} fill="none" stroke={INK} strokeWidth={6} />
        {k > 0.6 && (
          <g opacity={ramp(k, 0.6, 1)}>
            <ellipse cx={960} cy={540} rx={r * 1.7} ry={r * 0.42} fill="none" stroke={MUSTARD} strokeWidth={26} opacity={0.9} />
            <Txt x={960} y={Math.max(110, 540 - r - 60)} s={62} fill={MUSTARD}>{label}</Txt>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/** Day two hundred and sixty-seven: past the Earth, past the stars, cents drifting among the galaxies. */
export const Cosmos: React.FC<{ t: ShotTime }> = ({ t }) => {
  const z = mix(1, 1.6, ease(t.p));
  return (
    <AbsoluteFill style={{ background: "#05060f" }}>
      <svg width={W} height={H}>
        <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
          {Array.from({ length: 220 }, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 900) * H} r={0.8 + rnd(i + 3) * 1.8} fill={PAPER} opacity={0.6} />)}
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i} transform={`translate(${200 + rnd(i + 40) * 1500} ${150 + rnd(i + 70) * 780}) rotate(${rnd(i) * 180})`}>
              <ellipse rx={140} ry={44} fill="#8a7fd8" opacity={0.25} />
              <ellipse rx={60} ry={20} fill="#c8bff0" opacity={0.4} />
            </g>
          ))}
          {Array.from({ length: 70 }, (_, i) => {
            const x = rnd(i + 500) * W + Math.sin(t.f / 50 + i) * 20;
            const y = rnd(i + 600) * H + Math.cos(t.f / 60 + i) * 14;
            return <circle key={`c${i}`} cx={x} cy={y} r={7 + rnd(i) * 7} fill={MUSTARD} stroke={INK} strokeWidth={2} opacity={ramp(t.p, rnd(i) * 0.5, rnd(i) * 0.5 + 0.2)} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Three minutes to midnight: you running down the night street, past a vending machine (1,00 €) and a tram stop
 *  (FREE TODAY), Jonas's window dark above. */
export const NightRun: React.FC<{ t: ShotTime }> = ({ t }) => {
  const run = Math.sin(t.f / 3);
  const x = mix(260, 1500, ease(t.p));
  return (
    <SetScene set={street} mood="night" frame={t.f} cam={street.cameras.wide} options={{ auto: false, bus: null, crowd: false }} cast={[]}
      actors={
        <>
          <g transform="translate(560 640)">
            <rect x={0} y={0} width={190} height={370} rx={12} fill={CRIMSON} stroke={INK} strokeWidth={6} />
            <rect x={20} y={30} width={150} height={200} rx={6} fill="#cfe9f4" opacity={0.85} />
            <rect x={30} y={250} width={130} height={60} rx={6} fill={INK} />
            <Txt x={95} y={292} s={36} fill={MUSTARD}>1,00 €</Txt>
          </g>
          <g transform="translate(1180 560)">
            <rect x={-6} y={0} width={12} height={450} fill={INK} />
            <rect x={-150} y={-10} width={300} height={130} rx={14} fill={PAPER} stroke={INK} strokeWidth={6} />
            <Txt x={0} y={44} s={34}>TRAM</Txt>
            <Txt x={0} y={98} s={40} fill={TEAL}>FREE TODAY</Txt>
          </g>
          <rect x={1600} y={180} width={150} height={190} fill="#1a1d28" stroke={INK} strokeWidth={6} />
          <Figure x={x} y={1010} scale={1.35} facing={1} pose={{ ...STAND, armF: [60 + run * 50, 40], armB: [-60 - run * 50, -30] }} {...HERO}
            {...EXPRESSIONS.afraid} time={t.f / 30} look={{ x: 0.9, y: 0 }} />
        </>
      } />
  );
};

/** Day thirty-one: the cash machine's screen. You ask for everything; the daily limit gives you five hundred. */
export const Atm: React.FC<{ t: ShotTime }> = ({ t }) => {
  const typed = "10.737.418,24".slice(0, Math.round(ramp(t.p, 0.05, 0.35) * 13));
  const limit = t.p > 0.45;
  const notes = ease(ramp(t.p, 0.6, 0.85));
  return (
    <AbsoluteFill style={{ background: "#9aa3ad" }}>
      <Push t={t} from={1} to={1.05}>
        <svg width={W} height={H}>
          <rect x={360} y={80} width={1200} height={900} rx={40} fill="#3b4250" stroke={INK} strokeWidth={8} />
          <rect x={460} y={160} width={1000} height={480} rx={20} fill={limit ? "#2b1d22" : "#173a4a"} />
          <Txt x={960} y={260} s={44} fill={PAPER} w={700}>WITHDRAW</Txt>
          <Txt x={960} y={380} s={80} fill={MUSTARD}>{typed} €</Txt>
          {limit && <Txt x={960} y={520} s={60} fill={CRIMSON}>DAILY LIMIT 500,00 €</Txt>}
          <rect x={620} y={720} width={680} height={40} rx={10} fill={INK} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={700 + i * 8} y={740 + notes * (60 + i * 6)} width={500} height={170} rx={8} fill="#c9a8d8" stroke={INK} strokeWidth={4} opacity={notes > 0 ? 1 : 0} />
          ))}
        </svg>
      </Push>
    </AbsoluteFill>
  );
};
