// Script v6's wider places (owner, 2026-11-15: "The whole story feels very zoomed in in here."; the GTA-money
// reference): Jonas's kitchen, every tram in Berlin free, a penthouse over the city, the sea, the sticky note on your
// phone, and Berlin in 1923. Wide by default: small figures in big places.
import { AbsoluteFill } from "remotion";
import { SetScene } from "@whatif/kit/sets/SetScene";
import { citySkyline, kitchen, street } from "@whatif/kit/sets";
import { FRIEND, HERO } from "@whatif/kit/sets/cast";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { LOTTE } from "./Bakery";
import { useTalk } from "./cast";
import { ease, mix, Push, ramp, type ShotTime } from "./util";

const W = 1920;
const H = 1080;
const Txt: React.FC<{ x: number; y: number; s: number; fill?: string; w?: number; a?: "start" | "middle" | "end"; children: React.ReactNode }> = ({
  x, y, s, fill = INK, w = 800, a = "middle", children,
}) => <text x={x} y={y} textAnchor={a} fontFamily={FONT} fontWeight={w} fontSize={s} fill={fill}>{children}</text>;

/** Day seventeen: Jonas at the kitchen counter, his phone's banking app reads RENT · PAID; he looks across at you. */
export const Kitchen: React.FC<{ t: ShotTime }> = ({ t }) => {
  const talk = useTalk();
  const paid = t.p > 0.2;
  return (
    <Push t={t} from={1} to={1.05}>
      <SetScene set={kitchen} mood="morning" frame={t.f} cam={kitchen.cameras.wide} options={{ steam: 0.4 }}
        cast={[
          { spot: "cook", who: { ...HERO, look: { x: 0.9, y: 0 } }, face: EXPRESSIONS.happy },
          { spot: "counter", who: { ...FRIEND, look: { x: -0.9, y: 0.2 } }, face: { ...EXPRESSIONS[paid ? "shocked" : "neutral"], ...talk("Jonas") }, pose: { ...STAND, armF: [70, 50] } },
        ]}
        actors={
          <g transform="translate(860 330) rotate(-3)">
            <rect x={-260} y={-120} width={520} height={240} rx={24} fill={PAPER} stroke={INK} strokeWidth={7} />
            <Txt x={0} y={-30} s={72} w={800}>JONAS · RENT</Txt>
            {paid && <Txt x={0} y={75} s={96} fill={TEAL}>PAID ✓</Txt>}
          </g>
        } />
    </Push>
  );
};

/** Day twenty-two: every tram in the city free. Trams cross the street one after another, FREE TODAY on each. */
export const TramsFree: React.FC<{ t: ShotTime }> = ({ t }) => (
  <SetScene set={street} mood="day" frame={t.f} cam={street.cameras.wide} options={{ auto: false, bus: null, crowd: true }} cast={[]}
    actors={
      <>
        {[0, 1, 2].map((i) => {
          const x = mix(2300, -1400, ((t.p * 1.6 + i * 0.45) % 1.4) / 1.4);
          return (
            <g key={i} transform={`translate(${x} ${i % 2 ? 690 : 740}) scale(${i % 2 ? 0.75 : 1})`}>
              <rect x={0} y={0} width={1000} height={230} rx={40} fill="#f2c94c" stroke={INK} strokeWidth={8} />
              {Array.from({ length: 6 }, (_, k) => <rect key={k} x={60 + k * 150} y={40} width={110} height={90} rx={10} fill="#cfe9f4" stroke={INK} strokeWidth={4} />)}
              <rect x={330} y={150} width={340} height={64} rx={10} fill={INK} />
              <Txt x={500} y={196} s={42} fill="#7ef0a8">FREE TODAY</Txt>
            </g>
          );
        })}
      </>
    } />
);

/** Day twenty-seven, or eleven at night: the penthouse. A glass wall, the whole city below, you small at the window. */
export const Penthouse: React.FC<{ t: ShotTime; night?: boolean; phone?: boolean }> = ({ t, night, phone }) => (
  <Push t={t} from={1.05} to={1}>
    <SetScene set={citySkyline} mood={night ? "night" : "dusk"} frame={t.f} cam={citySkyline.cameras.wide} options={{ birds: !night, traffic: true, shoreLamps: !!night }} cast={[]}
      actors={
        <>
          <rect x={0} y={0} width={W} height={60} fill="#1c1f28" />
          <rect x={0} y={900} width={W} height={180} fill="#2b2f3a" />
          {[0, 480, 960, 1440, 1920].map((x) => <rect key={x} x={x - 10} y={0} width={20} height={H} fill="#1c1f28" />)}
          <rect x={0} y={890} width={W} height={14} fill="#1c1f28" />
          <Figure x={1180} y={1000} scale={1.1} facing={-1} pose={phone ? { ...STAND, armF: [150, 140] } : { ...STAND, armF: [20, 10] }} {...HERO}
            {...EXPRESSIONS[night ? "determined" : "happy"]} time={t.f / 30} look={{ x: -0.6, y: 0.2 }} />
        </>
      } />
  </Push>
);

/** Day twenty-nine: the sea at sunset. Anna with her shoes in her hand, apron on; Jonas in the waves. */
export const Sea: React.FC<{ t: ShotTime }> = ({ t }) => {
  const talk = useTalk();
  const wave = Math.sin(t.f / 12);
  return (
    <AbsoluteFill>
      <Push t={t} from={1} to={1.06} oy={700}>
        <svg width={W} height={H}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6b77a" /><stop offset="1" stopColor="#f7d9a8" /></linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#sky)" />
          <circle cx={1300} cy={520} r={110} fill="#ffdf8a" />
          <rect x={0} y={560} width={W} height={260} fill="#3f86b8" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${i * 260 + wave * 20} ${600 + (i % 3) * 60} q60 -16 120 0`} stroke="#cfe9f4" strokeWidth={6} fill="none" opacity={0.7} />)}
          <path d={`M0 ${800 + wave * 6} Q 960 ${770 - wave * 6} 1920 ${800 + wave * 6} L1920 1080 L0 1080Z`} fill="#ecd3a0" />
          <path d={`M0 ${810 + wave * 6} Q 960 ${780 - wave * 6} 1920 ${810 + wave * 6}`} stroke={PAPER} strokeWidth={10} fill="none" />
        </svg>
      </Push>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Figure x={1500} y={760} scale={0.8} facing={-1} pose={{ ...STAND, armF: [160 + wave * 10, 10], armB: [-160, -10] }} {...FRIEND} {...EXPRESSIONS.happy} time={t.f / 30} />
        <Figure x={720} y={1040} scale={1.3} facing={1} pose={{ ...STAND, armF: [30, 20], armB: [-25, 20] }} {...LOTTE} {...EXPRESSIONS.happy} {...talk("Anna")}
          time={t.f / 30 + 1} look={{ x: 0.9, y: -0.2 }} held={<g><ellipse cx={-6} cy={4} rx={14} ry={7} fill={CRIMSON} /><ellipse cx={10} cy={10} rx={14} ry={7} fill={CRIMSON} /></g>} />
        <Figure x={480} y={1040} scale={1.3} facing={1} pose={{ ...STAND, armF: [20, 10] }} {...HERO} {...EXPRESSIONS.happy} time={t.f / 30 + 2} look={{ x: 0.9, y: -0.2 }} />
      </svg>
    </AbsoluteFill>
  );
};

/** The sticky note on the back of your phone: the old number crossed out, the new one written. */
export const StickyNote: React.FC<{ t: ShotTime; old?: string; text: string }> = ({ t, old, text }) => {
  const strike = ease(ramp(t.p, 0.1, 0.35));
  const write = ramp(t.p, old ? 0.4 : 0.1, old ? 0.8 : 0.6);
  const shown = text.slice(0, Math.round(write * text.length));
  return (
    <AbsoluteFill style={{ background: "#d9c6a4" }}>
      <Push t={t} from={1} to={1.06}>
        <svg width={W} height={H}>
          <g transform="translate(960 560) rotate(-6)">
            <rect x={-330} y={-500} width={660} height={1060} rx={70} fill="#16181f" />
            <circle cx={-220} cy={-400} r={44} fill="#2a2d36" stroke="#3a3e4a" strokeWidth={8} />
            <g transform="rotate(4)">
              <rect x={-250} y={-200} width={500} height={420} fill="#f7e36a" />
              <rect x={-250} y={-200} width={500} height={40} fill="#e8d24f" />
              {old && <Txt x={0} y={-30} s={60} fill="#6a5a2a">{old}</Txt>}
              {old && <line x1={-210} y1={-48} x2={-210 + 420 * strike} y2={-48} stroke={CRIMSON} strokeWidth={12} strokeLinecap="round" />}
              <Txt x={0} y={old ? 110 : 40} s={old ? 68 : 76} fill={INK}>{shown}</Txt>
            </g>
          </g>
        </svg>
      </Push>
    </AbsoluteFill>
  );
};

/** Berlin, late 1923: a baker's window, one loaf, a price tag of 200.000.000.000 marks; sepia, like an old photo. */
export const Berlin1923: React.FC<{ t: ShotTime }> = ({ t }) => {
  const zeros = Math.round(ramp(t.p, 0.05, 0.5) * 9);
  const price = "200" + ".000".repeat(Math.floor(zeros / 3)) + "000".slice(0, zeros % 3);
  return (
    <AbsoluteFill style={{ background: "#c9b48a", filter: "sepia(0.6)" }}>
      <Push t={t} from={1} to={1.08}>
        <svg width={W} height={H}>
          <rect x={300} y={140} width={1320} height={760} fill="#3b2f22" />
          <rect x={340} y={180} width={1240} height={680} fill="#e8dcc0" />
          <Txt x={960} y={270} s={64} fill="#3b2f22">BÄCKEREI · 1923</Txt>
          <ellipse cx={760} cy={620} rx={230} ry={110} fill="#b07a3e" stroke={INK} strokeWidth={6} />
          <path d="M600 600 q60 -40 120 0 M700 590 q60 -40 120 0 M800 600 q60 -40 120 0" stroke="#7a4f22" strokeWidth={6} fill="none" />
          <g transform="translate(1250 560) rotate(5)">
            <rect x={-260} y={-90} width={520} height={190} rx={10} fill={PAPER} stroke={INK} strokeWidth={6} />
            <Txt x={0} y={0} s={52}>{price}</Txt>
            <Txt x={0} y={70} s={40} w={700}>MARK</Txt>
          </g>
        </svg>
      </Push>
    </AbsoluteFill>
  );
};

