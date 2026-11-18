// Part B's paper diagrams (facts are drawn on paper, style.md) and screen inserts: the tellers and the cash machines,
// the farms emptying, Keynes's two bars and his fifteen-hour week, where the hours and the pay went, the economists'
// counters and crumbs, the money going round, the old union story, Ford's five dollars, the one who stops first, a
// price and a wage, the napkins fanned like cards, the phone typing a job, your card and its card. Each takes the
// shot frame `f` and draws itself step by step, so something changes every two or three seconds. Screen pixels.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { OVERALLS, WORKER_HEADS } from "../Cast";
import { AppPhone, Banknote, Card, CashFan, Napkin, Plate, Burger, Till } from "../Props";
import { clamp01, ease, mix, Paper, ramp } from "../util";
import { Finger, STEEL, STEEL_DARK } from "./bits";
import { Car, MiniBot, OldCar } from "./sets";

const Label: React.FC<{ x: number; y: number; size?: number; color?: string; anchor?: "start" | "middle" | "end"; k?: number; children: React.ReactNode }> = ({
  x, y, size = 48, color = INK, anchor = "middle", k = 1, children,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} opacity={k}>{children}</text>
);

/** A small paper person for the sheets. */
const Mini: React.FC<{ x: number; y: number; s?: number; head: string; coat?: string; k?: number; facing?: 1 | -1; walk?: number; cap?: string; mouth?: "smile" | "flat" | "frown" }> = ({
  x, y, s = 0.32, head, coat = "#6d7f8f", k = 1, facing = 1, walk, cap, mouth = "smile",
}) => (k <= 0 ? null : (
  <g opacity={k} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k}) translate(${-x} ${-y})`}>
    <Figure x={x} y={y} scale={s} head={head} coat={coat} facing={facing} pose={walk === undefined ? STAND : walkPose(walk)} mouth={mouth} cap={cap} look={{ x: 0.5, y: 0 }} />
  </g>
));

const pop = (f: number, at: number) => ease(ramp(f, at, at + 6));

// ---- The Whole Town ------------------------------------------------------------------------------------------------

/** 1980 and 2010: two columns of paper tellers, the second a little taller, while cash machines spread along the top. */
export const TellersCard: React.FC<{ f: number }> = ({ f }) => (
  <Paper f={f} w={1300} h={700} y={610}>
    {Array.from({ length: 12 }, (_, i) => (
      <g key={i} opacity={pop(f, 30 + i * 10)} transform={`translate(${90 + i * 100} 90) scale(0.8)`}>
        <rect x={-30} y={-46} width={60} height={86} rx={8} fill={STEEL} stroke={INK} strokeWidth={4} />
        <rect x={-20} y={-36} width={40} height={26} rx={4} fill="#1f3c44" />
        <rect x={-18} y={4} width={36} height={8} rx={3} fill={INK} />
      </g>
    ))}
    {[0, 1].map((col) => {
      const n = col ? 13 : 12;
      return Array.from({ length: n }, (_, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        return <Mini key={`${col}-${i}`} x={(col ? 770 : 270) + c * 88} y={600 - r * 112} s={0.34} head={WORKER_HEADS[(i + col) % 10]} coat="#4a4a6a" k={pop(f, (col ? 120 : 20) + i * 6)} />;
      });
    })}
    <Label x={400} y={672} k={pop(f, 15)}>1980</Label>
    <Label x={900} y={672} k={pop(f, 115)}>2010</Label>
    <Label x={400} y={240} size={38} k={pop(f, 220)}>about 500,000</Label>
    <Label x={900} y={180} size={38} k={pop(f, 250)}>about 550,000</Label>
    <path d="M560 300 L740 240" stroke={TEAL} strokeWidth={8} strokeLinecap="round" opacity={pop(f, 260)} />
  </Paper>
);

/** A field of paper farmers in 1900 that empties by 2000: they walk off to a plant, a shop and an office. */
export const FarmsCard: React.FC<{ f: number }> = ({ f }) => {
  const leave = ease(ramp(f, 110, 190));
  const year = f < 110 ? "1900" : "2000";
  return (
    <Paper f={f} w={1300} h={700} y={610}>
      <rect x={60} y={190} width={660} height={460} rx={10} fill="#bfe0a0" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={80} y1={230 + i * 48} x2={700} y2={230 + i * 48} stroke="#7fb26a" strokeWidth={6} />)}
      {Array.from({ length: 20 }, (_, i) => {
        const home = { x: 130 + (i % 5) * 130, y: 300 + Math.floor(i / 5) * 105 };
        const stays = i === 7;
        const dest = { x: 900 + (i % 3) * 140, y: 620 };
        const u = stays ? 0 : clamp01(leave * 1.4 - (i % 5) * 0.08);
        const x = mix(home.x, dest.x, u);
        const y = mix(home.y, dest.y, u);
        return <Mini key={i} x={x} y={y} head={WORKER_HEADS[i % 10]} coat="#7a6a58" cap={MUSTARD} k={pop(f, 10 + i * 3) * (u > 0.97 ? 0 : 1)} walk={u > 0 && u < 1 ? f * 0.3 + i : undefined} />;
      })}
      {/* where they went */}
      <g opacity={pop(f, 100)}>
        <path d="M850 620 V520 L900 480 V520 L950 480 V520 L1000 480 V620Z" fill="#b98a6e" stroke={INK} strokeWidth={4} />
        <rect x={1020} y={500} width={110} height={120} fill="#9fd8a8" stroke={INK} strokeWidth={4} />
        <rect x={1150} y={380} width={100} height={240} fill="#9fc0e0" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={1165 + (i % 2) * 40} y={400 + Math.floor(i / 2) * 50} width={28} height={30} fill={f > 200 ? MUSTARD : "#e9f2f7"} stroke={INK} strokeWidth={2} />)}
      </g>
      <Label x={70} y={110} anchor="start" size={64}>{year}</Label>
      <Label x={720} y={110} anchor="end" size={48} color={TEAL} k={pop(f, 40) * (f < 110 ? 1 : 0)}>41% on farms</Label>
      <Label x={720} y={110} anchor="end" size={48} color={CRIMSON} k={pop(f, 150)}>under 2%</Label>
    </Paper>
  );
};

// ---- Rich -----------------------------------------------------------------------------------------------------------

/** Keynes, 1930: machines save labour (a bar that climbs fast) faster than new uses for it are found (a bar that climbs
 *  slowly); people wait in the gap; then the slow bar catches up (a temporary phase). */
export const KeynesBars: React.FC<{ f: number }> = ({ f }) => {
  const a = 420 * ease(ramp(f, 10, 170));
  const catchUp = ease(ramp(f, 210, 260));
  const b = mix(240 * ease(ramp(f, 30, 200)), 420, catchUp);
  const gap = Math.max(0, a - b);
  const waiting = Math.round(gap / 36);
  return (
    <Paper f={f} w={1300} h={700} y={610}>
      <Label x={70} y={110} anchor="start" size={64}>1930</Label>
      <line x1={200} y1={640} x2={1120} y2={640} stroke={INK} strokeWidth={6} />
      <rect x={300} y={640 - a} width={160} height={a} fill={STEEL} stroke={INK} strokeWidth={5} />
      <MiniBot x={380} y={600 - a} s={1.3} />
      <rect x={840} y={640 - b} width={160} height={b} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      <g transform={`translate(920 ${598 - b})`}>
        <circle r={26} fill="#7fa0c4" stroke={INK} strokeWidth={4} />
        <path d="M-30 -8 Q-28 -40 2 -42 Q32 -40 32 -8Z" fill="#f7d038" stroke={INK} strokeWidth={4} />
      </g>
      {Array.from({ length: Math.min(8, waiting) }, (_, i) => (
        <Mini key={i} x={520 + (i % 4) * 75} y={630 - Math.floor(i / 4) * 0} head={WORKER_HEADS[i]} coat={OVERALLS} mouth="frown" s={0.36}
          k={1 - catchUp} facing={i % 2 ? 1 : -1} />
      ))}
    </Paper>
  );
};

/** About now: the year ticks from 1930 to about 2030 and the working week shrinks from forty-eight hours to fifteen;
 *  the pay beside it stays the same height. */
export const FifteenHours: React.FC<{ f: number }> = ({ f }) => {
  const year = Math.round(mix(1930, 2030, ease(ramp(f, 0, 50))));
  const hours = Math.round(mix(48, 15, ease(ramp(f, 60, 130))));
  return (
    <Paper f={f} w={1300} h={700} y={610}>
      <Label x={70} y={110} anchor="start" size={64}>{year}</Label>
      <g transform="translate(110 300)">
        <circle r={40} fill={PAPER} stroke={INK} strokeWidth={6} /><path d="M0 0 V-26 M0 0 L18 8" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </g>
      {Array.from({ length: 48 }, (_, i) => (
        <rect key={i} x={180 + i * 20} y={260} width={16} height={80} rx={3} fill={i < hours ? TEAL : "#e7dccb"} stroke={INK} strokeWidth={2}
          opacity={i < hours ? 1 : 0.5} />
      ))}
      <Label x={180 + hours * 20 + 16} y={240} anchor="start" size={44}>{`${hours} hours`}</Label>
      <g transform="translate(110 500)"><circle r={40} fill={MUSTARD} stroke={INK} strokeWidth={6} /><circle r={16} fill="none" stroke={INK} strokeWidth={4} /></g>
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={200 + i * 80} cy={500} r={34} fill={MUSTARD} stroke={INK} strokeWidth={4} opacity={pop(f, 4 + i * 2)} />
      ))}
      <Label x={1220} y={590} anchor="end" size={40} color={TEAL} k={pop(f, 130)}>same pay</Label>
    </Paper>
  );
};

/** Where they went: Keynes's hours shared out with the pay kept (four people, a short bar and coins each), then the
 *  hours go to four machines and every coin slides to you. `turn` is the shot frame where it turns. */
export const HoursAndPay: React.FC<{ f: number; turn: number; toYou: number }> = ({ f, turn, toYou }) => {
  const toBots = ease(ramp(f, turn, turn + 24));
  const coins = ease(ramp(f, toYou, toYou + 30));
  const xs = [190, 420, 650, 880];
  return (
    <Paper f={f} w={1300} h={700} y={610}>
      {xs.map((x, i) => (
        <g key={x}>
          <Mini x={x} y={620} s={0.5} head={WORKER_HEADS[i * 2]} coat={OVERALLS} mouth={toBots > 0.5 ? "frown" : "smile"} />
          <MiniBot x={x} y={170} s={1.2 * toBots} />
          <rect x={x - 60} y={mix(400, 220, toBots)} width={120} height={36} rx={6} fill={TEAL} stroke={INK} strokeWidth={4} />
          {[0, 1, 2].map((k) => {
            const from = { x: x + 70, y: 600 - k * 26 };
            const to = { x: 1150 + (i % 2) * 40, y: 600 - (i * 3 + k) * 22 };
            return <ellipse key={k} cx={mix(from.x, to.x, coins)} cy={mix(from.y, to.y, coins) - 120 * coins * (1 - coins)} rx={28} ry={12} fill={MUSTARD} stroke={INK} strokeWidth={3} />;
          })}
        </g>
      ))}
      <g opacity={ease(ramp(f, toYou - 20, toYou))}>
        <Figure x={1170} y={640} scale={0.62} head={MUSTARD} scarf={TEAL} tuft coat={PAPER} facing={-1} mouth="open" brows="raised" eyes={1.2} look={{ x: 0.6, y: 0 }} />
      </g>
    </Paper>
  );
};

// ---- The Missing Line -------------------------------------------------------------------------------------------

/** The economists' printed model beside your napkin: the paper prints itself, then the napkin slides in beside it. */
export const ModelAndNapkin: React.FC<{ f: number }> = ({ f }) => {
  const print = ramp(f, 10, 90);
  const slide = ease(ramp(f, 80, 115));
  return (
    <g>
      <Paper f={f} x={700} y={620} w={600} h={700} rot={-3}>
        <rect x={60} y={60} width={500} height={34} rx={6} fill={INK} opacity={0.8} />
        <rect x={60} y={110} width={340} height={20} rx={6} fill={INK} opacity={0.45} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={60} y={170 + i * 28} width={(i % 4 === 3 ? 260 : 500) * clamp01(print * 14 - i)} height={12} rx={6} fill={INK} opacity={0.3} />
        ))}
        <g opacity={ramp(f, 70, 90)}>
          <line x1={80} y1={650} x2={540} y2={650} stroke={INK} strokeWidth={4} />
          <path d="M80 640 Q200 630 300 590 T540 560" fill="none" stroke={CRIMSON} strokeWidth={6} />
        </g>
      </Paper>
      <Napkin x={mix(1700, 1270, slide)} y={630} s={0.95} rot={mix(18, 5, slide)} scribbles={2} text={["3 wages: gone.", "Burgers: same.", "...and he ate here"]} />
    </g>
  );
};

/** Eleven counters; every owner keeps a whole coin; a crumb falls off each of the ten others and lands on yours. */
export const CrumbsCard: React.FC<{ f: number }> = ({ f }) => {
  const xs = Array.from({ length: 11 }, (_, i) => 100 + i * 116);
  const you = 5;
  return (
    <Paper f={f} w={1360} h={700} y={610}>
      {xs.map((x, i) => {
        const yours = i === you;
        const coin = pop(f, 15 + Math.abs(i - you) * 4);
        return (
          <g key={x}>
            <circle cx={x} cy={420} r={40} fill={yours ? MUSTARD : WORKER_HEADS[i % 10]} stroke={INK} strokeWidth={4} />
            <rect x={x - 52} y={480} width={104} height={100} rx={8} fill={yours ? TEAL : "#7d8d99"} stroke={INK} strokeWidth={4} />
            <rect x={x - 58} y={472} width={116} height={16} rx={6} fill={PAPER} stroke={INK} strokeWidth={3} />
            <g transform={`translate(${x} 320) scale(${coin})`}><circle r={34} fill={MUSTARD} stroke={INK} strokeWidth={4} /><circle r={11} fill="none" stroke={INK} strokeWidth={3} /></g>
          </g>
        );
      })}
      {xs.map((x, i) => {
        if (i === you) return null;
        const order = Math.abs(i - you) * 2 + (i > you ? 1 : 0);
        const u = ease(ramp(f, 70 + order * 9, 100 + order * 9));
        if (u <= 0) return null;
        const to = { x: xs[you] + ((order % 4) - 1.5) * 24, y: 460 - Math.floor(order / 4) * 18 };
        const cx = mix(x, to.x, u);
        const cy = mix(476, to.y, u) - 160 * u * (1 - u);
        return <path key={x} d={`M${cx - 20} ${cy} l20 -24 l20 24z`} fill="#c9a05a" stroke={INK} strokeWidth={4} />;
      })}
    </Paper>
  );
};

/** The money going round: your till pays the wage, the wage buys lunch, lunch pays your till. Coins circle on `f`. */
export const MoneyLoop: React.FC<{ f: number }> = ({ f }) => {
  const c = { x: 650, y: 370 };
  const r = 230;
  const at = (deg: number) => ({ x: c.x + Math.cos((deg * Math.PI) / 180) * r, y: c.y + Math.sin((deg * Math.PI) / 180) * r });
  const till = at(-90), marco = at(30), lunch = at(150);
  return (
    <Paper f={f} w={1300} h={700} y={610}>
      <circle cx={c.x} cy={c.y} r={r} fill="none" stroke={TEAL} strokeWidth={14} strokeDasharray="30 20" strokeDashoffset={-f * 3} opacity={0.8} />
      <g transform={`translate(${till.x} ${till.y + 90})`}><Till s={1.2} ping={Math.max(0, Math.sin(f * 0.2))} /></g>
      <g transform={`translate(${marco.x + 40} ${marco.y + 150})`}><Figure x={0} y={0} scale={0.85} head="#a9d4ec" coat={OVERALLS} facing={-1} mouth="smile" look={{ x: 0.6, y: 0 }} /></g>
      <g transform={`translate(${lunch.x - 30} ${lunch.y + 50})`}><Plate s={2} /><Burger y={-60} s={1.5} /></g>
      {Array.from({ length: 6 }, (_, i) => {
        const p = at(-90 + ((f * 2.4 + i * 60) % 360));
        return <g key={i} transform={`translate(${p.x} ${p.y})`}><circle r={30} fill={MUSTARD} stroke={INK} strokeWidth={4} /><circle r={8} fill="none" stroke={INK} strokeWidth={3} /></g>;
      })}
    </Paper>
  );
};

/** The old union story, in sepia: a hall of machines; the manager shows them off; the union man points at a car. */
export const UnionStory: React.FC<{ f: number; part: "hall" | "cars" }> = ({ f, part }) => (
  <g style={{ filter: "sepia(0.85) saturate(0.8)" }}>
    <Paper f={f} w={1300} h={700} y={610}>
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i} transform={`translate(${140 + i * 140} ${part === "hall" ? 380 : 330}) scale(${part === "hall" ? 1 : 0.8})`}>
          <rect x={-50} y={-140} width={100} height={200} rx={6} fill="#8a8a80" stroke={INK} strokeWidth={4} />
          <circle cx={0} cy={-90} r={22} fill={PAPER} stroke={INK} strokeWidth={3} />
          <line x1={0} y1={-90} x2={Math.cos(f * 0.2 + i) * 16} y2={-90 + Math.sin(f * 0.2 + i) * 16} stroke={INK} strokeWidth={3} />
          <rect x={-30} y={-40} width={60} height={14} rx={4} fill={INK} opacity={0.5} />
          <path d={`M50 -20 L${90} ${-60 + Math.sin(f * 0.25 + i) * 20}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        </g>
      ))}
      {part === "hall" ? (
        <g>
          <Figure x={860} y={660} scale={0.9} head="#e0c8a0" coat="#2f3242" tie="#7a4a3a" cap="#2f3242" facing={-1}
            pose={{ ...STAND, armF: [100 + Math.sin(f * 0.12) * 8, 10] }} mouth="smirk" brows="raised" look={{ x: 0.8, y: -0.2 }} />
          <Figure x={1120} y={660} scale={0.9} head="#c9b08a" coat="#6b5a3a" cap="#4a3a2a" facing={-1} mouth="flat" brows="flat" lids={0.3} look={{ x: 0.7, y: 0 }} />
        </g>
      ) : (
        <g>
          <Figure x={980} y={660} scale={0.9} head="#c9b08a" coat="#6b5a3a" cap="#4a3a2a" facing={1}
            pose={{ ...STAND, armF: [95, 0] }} mouth="smirk" brows="raised" look={{ x: 0.8, y: 0 }} />
          <Car x={1160} y={660} s={0.6} color="#9a8a6a" />
          <Label x={560} y={150} size={120} color={INK} k={pop(f, 60)}>?</Label>
        </g>
      )}
    </Paper>
  </g>
);

/** Ford, 1914: an old five-dollar note; a worker's hand takes it; then the worker gets the car. */
export const FordNote: React.FC<{ f: number }> = ({ f }) => {
  const grab = ease(ramp(f, 40, 70));
  const away = ease(ramp(f, 90, 130));
  return (
    <g style={{ filter: "sepia(0.35)" }}>
      <Paper f={f} w={1300} h={700} y={610}>
        <g transform={`translate(650 ${mix(330, 330, grab) + away * 520})`}>
          <Banknote old s={1.7} amount="$5" rot={-4 + away * 10} />
        </g>
        <g transform={`translate(${720} ${mix(980, 470, grab) + away * 520})`}>
          <rect x={-60} y={0} width={120} height={600} rx={24} fill={OVERALLS} stroke={INK} strokeWidth={6} />
          <rect x={-56} y={-70} width={112} height={90} rx={34} fill="#a9d4ec" stroke={INK} strokeWidth={5} />
        </g>
        <OldCar x={mix(1700, 760, ease(ramp(f, 120, 170)))} y={640} s={1.3} />
        <g opacity={ramp(f, 160, 175)}>
          <Figure x={420} y={650} scale={0.85} head="#a9d4ec" coat={OVERALLS} cap="#4a3a2a" facing={1} mouth="smile" brows="raised" look={{ x: 0.8, y: 0 }}
            pose={{ ...STAND, armF: [70, 20] }} />
        </g>
      </Paper>
    </g>
  );
};

// ---- The trap and Make Them Buy -----------------------------------------------------------------------------------

/** Two diners side by side: the left one stops (its machines walk out), its customers walk over to the right one. */
export const StopFirst: React.FC<{ f: number }> = ({ f }) => {
  const out = ease(ramp(f, 20, 60));
  const walk = ease(ramp(f, 50, 110));
  return (
    <Paper f={f} w={1300} h={700} y={610}>
      {[300, 980].map((x, d) => (
        <g key={x}>
          <rect x={x - 220} y={420} width={440} height={60} rx={8} fill={d ? "#e85f6f" : TEAL} stroke={INK} strokeWidth={5} />
          <rect x={x - 230} y={410} width={460} height={18} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
          {[0, 1, 2].map((k) => (
            <g key={k} transform={`translate(${x - 120 + k * 120 + (d === 0 ? -out * 380 : 0)} 380)`} opacity={d === 0 ? 1 - out : 1}>
              <MiniBot x={0} y={0} s={1.1} />
            </g>
          ))}
          <circle cx={x} cy={150} r={44} fill={d ? "#a8e6cf" : MUSTARD} stroke={INK} strokeWidth={5} />
          <path d={d ? `M${x - 16} 160 Q${x} 176 ${x + 16} 160` : `M${x - 16} 172 Q${x} 156 ${x + 16} 172`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      {Array.from({ length: 5 }, (_, i) => {
        const from = 180 + i * 60;
        const to = 860 + i * 60 + 300;
        const u = clamp01(walk * 1.3 - i * 0.07);
        return <Mini key={i} x={mix(from, to - 300, u)} y={640} s={0.3} head={WORKER_HEADS[i * 2 + 1]} coat={OVERALLS} walk={u > 0 && u < 1 ? f * 0.3 + i : undefined} />;
      })}
    </Paper>
  );
};

/** A price slides down toward zero and stops on its floor; a wage drops all the way to zero. */
export const PriceAndWage: React.FC<{ f: number }> = ({ f }) => {
  const price = ease(ramp(f, 8, 50));
  const wage = ease(ramp(f, 46, 80));
  return (
    <Paper f={f} w={1300} h={700} y={610}>
      <line x1={100} y1={600} x2={1200} y2={600} stroke={INK} strokeWidth={6} />
      <Label x={90} y={614} anchor="end" size={40}>0</Label>
      <rect x={300} y={540} width={140} height={60} fill="#c9a05a" stroke={INK} strokeWidth={4} />
      <g transform={`translate(370 ${mix(180, 470, price)}) rotate(-8)`}>
        <path d="M-80 -40 H60 L100 0 L60 40 H-80Z" fill={MUSTARD} stroke={INK} strokeWidth={5} />
        <circle cx={66} cy={0} r={9} fill={PAPER} stroke={INK} strokeWidth={3} />
      </g>
      <g transform={`translate(860 ${mix(180, 560, wage)})`}>
        <rect x={-100} y={-40} width={200} height={80} rx={6} fill={wage > 0.98 ? "#e9e2d0" : "#d9c08a"} stroke={INK} strokeWidth={5} />
        <path d="M-100 -40 L0 10 L100 -40" fill="none" stroke={INK} strokeWidth={4} />
      </g>
    </Paper>
  );
};

/** Every owner's napkin, fanned like a hand of cards: the same two lines in a different hand on each. */
export const NapkinFan: React.FC<{ f: number; lines?: number; fanAt?: number }> = ({ f, lines = 2, fanAt = 60 }) => {
  const owners = [
    { ink: "#2f7a4a", same: "Bread: same." },
    { ink: "#4f5f6a", same: "Repairs: same." },
    { ink: "#6b5a8a", same: "Loans: same." },
    { ink: "#c0394f", same: "Pies: same." },
    { ink: "#3b4a8f", same: "Taxes: same." },
  ];
  const fan = ease(ramp(f, fanAt, fanAt + 30));
  const every = fanAt < 40 ? 3 : 11;
  return (
    <g>
      {owners.map((o, i) => {
        const at = 2 + i * every;
        const k = ease(ramp(f, at, at + 12));
        const spread = (i - 2) * mix(170, 310, fan);
        const rot = (i - 2) * mix(4, 11, fan);
        return (
          <g key={i} opacity={k}>
            <Napkin x={960 + spread + (1 - k) * 600} y={mix(600, 560 + Math.abs(i - 2) * 40, fan)} s={0.6} rot={rot} scribbles={1} seed={i + 3} ink={o.ink}
              text={lines === 3 ? ["Wages: gone.", o.same, "...and he ate here"] : ["Wages: gone.", o.same]} big={58} />
          </g>
        );
      })}
    </g>
  );
};

/** The phone held to camera with the app open, a job typed letter by letter by a fingertip; text that is too long for
 *  the app's own field (MAYOR'S ASSISTANT) is drawn smaller, on its own. */
export const TypePhone: React.FC<{ f: number; job: string; perLetter?: number; start?: number; skin?: string; sleeve?: string; value?: number }> = ({
  f, job, perLetter = 3, start = 4, skin = MUSTARD, sleeve = PAPER, value = 0.5,
}) => {
  const n = Math.max(0, Math.min(job.length, Math.floor((f - start) / perLetter) + 1));
  const long = job.length > 9;
  const tap = (f - start) % perLetter;
  const press = n < job.length && f >= start ? 1 - Math.abs(tap - perLetter / 2) / (perLetter / 2) : 0;
  return (
    <g>
      <AppPhone x={960} y={560} s={0.95} mode="app" job={long ? "" : job} typed={long ? 0 : n} value={value} frame={f} />
      {long && (
        <g transform="translate(960 560) rotate(-3) scale(0.95)">
          <text x={-192} y={-246} fontFamily={FONT} fontWeight={800} fontSize={34} fill={INK} letterSpacing={1}>{job.slice(0, n)}</text>
          {(n < job.length || Math.floor(f / 15) % 2 === 0) && <rect x={-190 + n * 22} y={-280} width={6} height={42} fill={TEAL} />}
        </g>
      )}
      <Finger x={long ? 820 + Math.min(n, 16) * 20 : 860 + n * 28} y={300 + 10 * press} press={0.6 + 0.4 * press} skin={skin} sleeve={sleeve} s={0.9} />
    </g>
  );
};

/** Your card and the machine's card, side by side, then slid together: the same card. */
export const SameCard: React.FC<{ f: number }> = ({ f }) => {
  const together = ease(ramp(f, 26, 46));
  return (
    <g>
      <g transform={`translate(${mix(640, 930, together)} 560)`}>
        <rect x={-60} y={60} width={120} height={400} rx={30} fill={PAPER} stroke={INK} strokeWidth={6} />
        <circle cx={0} cy={50} r={60} fill={MUSTARD} stroke={INK} strokeWidth={6} />
        <Card x={0} y={-60} s={2.2} rot={-6} />
      </g>
      <g transform={`translate(${mix(1280, 990, together)} 560)`}>
        <rect x={-50} y={60} width={100} height={400} rx={40} fill={STEEL} stroke={INK} strokeWidth={6} />
        <circle cx={0} cy={50} r={58} fill={STEEL_DARK} stroke={INK} strokeWidth={6} />
        <Card x={0} y={-60} s={2.2} rot={6} />
      </g>
    </g>
  );
};

/** The fan of cash in your hand, alone (an insert for the till humming). */
export const CashInsert: React.FC<{ f: number }> = ({ f }) => (
  <g transform={`translate(960 640) rotate(${Math.sin(f * 0.6) * 2}) scale(2.6)`}><CashFan n={6} /></g>
);
