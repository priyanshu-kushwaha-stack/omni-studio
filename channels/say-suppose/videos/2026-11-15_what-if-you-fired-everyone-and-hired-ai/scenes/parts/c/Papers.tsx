// Part C's paper drawings (facts are drawn on paper, style.md): the Alaska cheque, the tills loop, the string quartet,
// the Luddites' loom, Pigou's chimney, the model's fixes, the board's vote, the shopping agent, and the tab. Each draws
// itself over its shot on a cream sheet held low enough to keep the top band free for the card. Screen pixels.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { WORKER_HEADS } from "../Cast";
import { Burger, Card, Cheque, Hammer, Pie, STEEL, STEEL_DARK, Till, WallClock } from "../Props";
import { Robot } from "../Robot";
import { Paper, type ShotTime } from "../util";
import { act, Hand, ramp } from "./kit";

const DESK = "#c9b48e";

/** The sheet on the desk, with a slow push so it never sits still. */
const Sheet: React.FC<{ t: ShotTime; w?: number; h?: number; y?: number; children: React.ReactNode }> = ({ t, w = 1500, h = 720, y = 640, children }) => (
  <AbsoluteFill style={{ background: DESK }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <g transform={`translate(960 ${y}) scale(${1 + 0.035 * t.p}) translate(-960 ${-y})`}>
        <Paper f={t.f} x={960} y={y} w={w} h={h}>{children}</Paper>
      </g>
    </svg>
  </AbsoluteFill>
);

const Coin: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 22 }) => (
  <g transform={`translate(${x} ${y})`}><circle r={r} fill={MUSTARD} stroke={INK} strokeWidth={4} /><circle r={r * 0.55} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.5} /></g>
);

const House: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-70} width={100} height={70} fill={color} stroke={INK} strokeWidth={4} />
    <path d="M-62 -68 L0 -120 L62 -68Z" fill="#b5523f" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-14} y={-40} width={28} height={40} fill="#2b3a44" />
  </g>
);

/** Since 1982, Alaska's yearly cheque: a derrick in the snow, cheques flying out of it to a row of houses, one each. */
export const AlaskaSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const houses = [0, 1, 2, 3, 4, 5];
  return (
    <Sheet t={t}>
      {/* snowy hills and the derrick */}
      <path d="M30 600 Q200 420 380 560 Q520 380 700 600Z" fill="#e8f1f6" stroke={INK} strokeWidth={4} />
      <g transform="translate(250 580) scale(1.3)">
        <path d="M-70 0 L-20 -300 L20 -300 L70 0" fill="none" stroke={INK} strokeWidth={8} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-62 + i * 12} y1={-60 - i * 60} x2={62 - i * 12} y2={-60 - i * 60} stroke={INK} strokeWidth={5} />)}
        <rect x={-30} y={-330} width={60} height={30} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
        <path d={`M-90 ${-150 + Math.sin(t.f * 0.12) * 30} L90 ${-150 - Math.sin(t.f * 0.12) * 30}`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      </g>
      {houses.map((i) => <House key={i} x={720 + i * 135} y={640} color={["#f3c8a8", "#c9e0b8", "#bcd4ec", "#f4d58d", "#e8c0d8", "#d4c4a8"][i]} s={1.25} />)}
      {/* a cheque per house, one after another, on a looping year */}
      {houses.map((i) => {
        const at = 20 + i * 14;
        const p = act(t.f, at, at + 30);
        if (t.f < at) return null;
        const x = 290 + (720 + i * 135 - 290) * p;
        const y = 220 - 260 * 4 * p * (1 - p) + (540 - 220) * p * p;
        return <Cheque key={i} x={x} y={y} s={0.28} rot={-20 + 20 * p} />;
      })}
      {/* the year ticking over: snowflakes */}
      {Array.from({ length: 16 }, (_, i) => {
        const p = (t.f / 120 + i / 16) % 1;
        return <circle key={i} cx={60 + ((i * 97) % 1380)} cy={40 + p * 560} r={5} fill="#bcd4ec" opacity={0.8} />;
      })}
    </Sheet>
  );
};

/** The tills loop: your coin into a till with a steel figure behind it, out the back to the owner's hand, and from there
 *  into a new steel figure that walks in to stand behind the till. Each lap adds one more. */
export const LoopSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const lap = 70;
  const k = Math.floor(t.f / lap);
  const p = (t.f % lap) / lap;
  const robots = Math.min(4, 1 + k);
  // the coin's path: your hand (left) -> the till -> out the back -> the owner's hand (right, top) -> down into a robot
  const pts = [{ x: 220, y: 430 }, { x: 600, y: 440 }, { x: 760, y: 300 }, { x: 1230, y: 200 }, { x: 1300, y: 470 }];
  const seg = Math.min(3, Math.floor(p * 4));
  const u = p * 4 - seg;
  const a = pts[seg], b = pts[seg + 1];
  const coin = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u - 60 * 4 * u * (1 - u) };
  const walker = act(t.f % lap, lap * 0.75, lap);
  return (
    <Sheet t={t}>
      {/* the loop arrow */}
      <path d="M200 520 C400 640 1100 640 1300 520 M1300 520 C1400 300 1100 120 760 260" fill="none" stroke={TEAL} strokeWidth={6} strokeDasharray="18 14" />
      <path d="M770 252 l30 -6 l-14 26Z" fill={TEAL} />
      <Figure x={150} y={620} scale={0.85} pose={{ ...STAND, armF: [80, 10] }} head={MUSTARD} scarf={TEAL} tuft coat={PAPER} mouth="smile" time={t.f} />
      {Array.from({ length: robots }, (_, i) => (
        <Robot key={i} x={820 + i * 95} y={600} scale={0.62} frame={t.f} />
      ))}
      <Till x={600} y={600} s={1.6} ping={seg === 1 ? 1 - u : 0} />
      {/* the new one, walking in from the owner */}
      {k < 4 && walker > 0 && <Robot x={1300 - (1300 - (820 + robots * 95)) * walker} y={600} scale={0.62} facing={-1} pose={walkPose(t.f * 0.3)} frame={t.f} />}
      <Figure x={1300} y={360} scale={0.8} facing={-1} pose={{ ...STAND, armF: [100, -10] }} head="#8fa3b8" coat="#2f3242" tie={CRIMSON} mouth="smile" time={t.f} />
      <Coin x={coin.x} y={coin.y} r={30} />
    </Sheet>
  );
};

const Quartet: React.FC<{ x: number; y: number; f: number; old?: boolean }> = ({ x, y, f, old }) => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <Figure x={x + i * 95} y={y + Math.sin(f * 0.22 + i) * 2} scale={0.5} facing={i < 2 ? 1 : -1} pose={{ ...STAND, legB: [88, -88], legF: [92, -92], armF: [100, 40], armB: [60, 70] }}
          head={old ? "#d9c8a0" : WORKER_HEADS[(i * 3 + 2) % 10]} coat={old ? "#8a7550" : "#2a2d33"} mouth="smile" time={f} />
        <ellipse cx={x + i * 95 + (i < 2 ? 18 : -18)} cy={y - 110} rx={14} ry={8} fill="#a0522d" stroke={INK} strokeWidth={2} transform={`rotate(${i < 2 ? -30 : 30} ${x + i * 95} ${y - 110})`} />
      </g>
    ))}
  </g>
);

/** Baumol's string quartet: the same four players and the same clock, two centuries apart; a ticket's price climbs as a
 *  machine-made toaster's falls. */
export const QuartetSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const climb = act(t.f, 40, 150);
  return (
    <Sheet t={t}>
      <rect x={40} y={40} width={620} height={330} rx={10} fill="#efe2c4" stroke={INK} strokeWidth={4} />
      <g transform="translate(-40 -60) scale(1.15)"><Quartet x={150} y={330} f={t.f} old /></g>
      <rect x={840} y={40} width={620} height={330} rx={10} fill="#e4eef0" stroke={INK} strokeWidth={4} />
      <g transform="translate(-180 -60) scale(1.15)"><Quartet x={950} y={330} f={t.f} /></g>
      <WallClock x={750} y={200} s={0.8} hours={8 + ((t.f / 40) % 1) * 0.5} />
      <path d="M690 200 h-20 M810 200 h20" stroke={INK} strokeWidth={4} />
      {/* the ticket climbs */}
      <g transform={`translate(420 ${640 - 190 * climb}) scale(1.6)`}>
        <rect x={-90} y={-46} width={180} height={92} rx={10} fill={MUSTARD} stroke={INK} strokeWidth={5} />
        <circle cx={-90} cy={0} r={14} fill={PAPER} stroke={INK} strokeWidth={4} />
        <circle cx={90} cy={0} r={14} fill={PAPER} stroke={INK} strokeWidth={4} />
        <path d="M-30 12 v-34 l40 -8 v30" fill="none" stroke={INK} strokeWidth={6} /><circle cx={-36} cy={14} r={9} fill={INK} /><circle cx={4} cy={6} r={9} fill={INK} />
      </g>
      <path d={`M300 650 V${640 - 190 * climb + 40}`} stroke={CRIMSON} strokeWidth={8} strokeLinecap="round" />
      <path d={`M286 ${640 - 190 * climb + 54} l14 -24 l14 24Z`} fill={CRIMSON} />
      {/* the toaster falls */}
      <g transform={`translate(1080 ${470 + 150 * climb}) scale(${1.6 * (1 - 0.3 * climb)})`}>
        <rect x={-80} y={-60} width={160} height={110} rx={24} fill={STEEL} stroke={INK} strokeWidth={5} />
        <rect x={-50} y={-70} width={30} height={14} fill={INK} /><rect x={20} y={-70} width={30} height={14} fill={INK} />
      </g>
      <path d={`M1240 450 V${470 + 170 * climb}`} stroke={TEAL} strokeWidth={8} strokeLinecap="round" />
      <path d={`M1226 ${456 + 170 * climb} l14 24 l14 -24Z`} fill={TEAL} />
    </Sheet>
  );
};

/** 1811 to 1816: a mill window, a loom behind it, and a hammer swung through the loom; the pieces fly. */
export const LudditeSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const swing = act(t.f, 30, 44);
  const hit = t.f >= 44;
  const fly = ramp(t.f, 44, 90);
  const swing2 = act(t.f, 120, 134);
  return (
    <Sheet t={t}>
      {/* the mill's brick wall and its window */}
      <rect x={0} y={0} width={1500} height={720} fill="#c77a5a" opacity={0.35} />
      {Array.from({ length: 12 }, (_, r) => <line key={r} x1={0} y1={60 * r} x2={1500} y2={60 * r} stroke="#8a4a3a" strokeWidth={3} opacity={0.4} />)}
      <rect x={380} y={90} width={740} height={520} fill="#efe6d0" stroke={INK} strokeWidth={10} />
      <line x1={750} y1={90} x2={750} y2={610} stroke={INK} strokeWidth={8} />
      <line x1={380} y1={350} x2={1120} y2={350} stroke={INK} strokeWidth={8} />
      {/* the loom: a frame, threads, a shuttle; it breaks where the hammer lands */}
      <g transform={`translate(750 380)`}>
        {[[-260, -200, 520, 30], [-260, 150, 520, 30], [-260, -200, 30, 380], [230, -200, 30, 380]].map(([x, y, w, h], i) => {
          const dx = hit ? (i % 2 ? 1 : -1) * 260 * fly : 0;
          const dy = hit ? (i < 2 ? -1 : 1) * 120 * fly + 300 * fly * fly : 0;
          const r = hit ? (i % 2 ? 1 : -1) * 70 * fly : 0;
          return <rect key={i} x={x} y={y} width={w} height={h} fill="#a0703f" stroke={INK} strokeWidth={4} transform={`translate(${dx} ${dy}) rotate(${r} ${x + w / 2} ${y + h / 2})`} />;
        })}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-220 + i * 32} y1={-170} x2={-220 + i * 32 + (hit ? (i - 7) * 30 * fly : 0)} y2={150 + (hit ? 200 * fly : 0)} stroke="#e9e1cf" strokeWidth={4} opacity={hit ? 1 - fly : 1} />
        ))}
        {!hit && <rect x={-60 + Math.sin(t.f * 0.3) * 160} y={-20} width={120} height={26} rx={10} fill="#6b4b3a" stroke={INK} strokeWidth={3} />}
      </g>
      {/* the hammer */}
      <g transform={`translate(1240 640) rotate(${-80 + 80 * swing - 40 * swing2})`}><Hammer s={2.4} /></g>
      {hit && t.f < 70 && <circle cx={750} cy={380} r={60 + 200 * fly} fill="none" stroke={PAPER} strokeWidth={10} opacity={1 - fly} />}
    </Sheet>
  );
};

/** Pigou, 1920: a chimney's smoke blackening the neighbour's washing; a tax tag lands on the chimney and the smoke thins. */
export const PigouSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const tag = act(t.f, 70, 86);
  const thin = 1 - 0.75 * act(t.f, 86, 130);
  return (
    <Sheet t={t}>
      <rect x={0} y={560} width={1500} height={160} fill="#d6c7a0" opacity={0.6} />
      {/* the works */}
      <path d="M120 560 V380 L240 320 V380 L360 320 V380 L480 320 V560Z" fill="#b98a6e" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={400} y={140} width={60} height={180} fill="#8e6552" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => {
        const p = (t.f / 70 + i / 6) % 1;
        return <circle key={i} cx={430 + p * 700} cy={130 - Math.sin(p * 3) * 60 + p * 120} r={(30 + p * 60) * (0.5 + 0.5 * thin)} fill="#4a4a50" opacity={0.6 * thin * (1 - p * 0.6)} />;
      })}
      {/* the neighbour's house and washing line */}
      <House x={1260} y={560} color="#f3c8a8" s={1.4} />
      <line x1={800} y1={380} x2={1150} y2={360} stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={830 + i * 80} y={378 - i * 4} width={56} height={80} rx={4} fill={thin < 0.5 ? PAPER : ["#5a5a5a", "#6a6a6a"][i % 2]} stroke={INK} strokeWidth={3} opacity={1} />
      ))}
      {/* the tag on the chimney: a coin on a string */}
      <g transform={`translate(430 ${-120 + 340 * tag})`}>
        <line x1={0} y1={-60} x2={0} y2={0} stroke={INK} strokeWidth={3} />
        <rect x={-50} y={0} width={100} height={64} rx={8} fill={MUSTARD} stroke={INK} strokeWidth={4} />
        <circle cx={0} cy={32} r={18} fill="none" stroke={INK} strokeWidth={4} />
      </g>
    </Sheet>
  );
};

/** The model's fixes: a basic income, a wage cut, new firms, each crossed out in turn; then a tax on the machine itself
 *  (a dial tag hung on a steel figure) that stays. `stage` 0 = the three fail, 1 = the machine's tag. */
export const FixesSheet: React.FC<{ t: ShotTime; stage: 0 | 1 }> = ({ t, stage }) => {
  const cross = (at: number) => act(t.f, at, at + 10);
  if (stage === 0) {
    const ats = [40, 80, 125];
    return (
      <Sheet t={t}>
        <g transform="translate(260 340)"><Cheque s={0.55} rot={-4} signed={1} /></g>
        <g transform="translate(750 340)">
          <rect x={-150} y={-70} width={300} height={140} rx={8} fill="#8fcf8a" stroke={INK} strokeWidth={5} />
          <path d="M-40 -110 L40 110 M40 -110 L-40 110" stroke={STEEL_DARK} strokeWidth={10} />
          <circle cx={-48} cy={-120} r={22} fill="none" stroke={INK} strokeWidth={6} /><circle cx={48} cy={-120} r={22} fill="none" stroke={INK} strokeWidth={6} />
        </g>
        <g transform="translate(1240 440)">
          <rect x={-150} y={-220} width={300} height={220} fill="#f4d58d" stroke={INK} strokeWidth={5} />
          <path d="M-170 -220 L0 -300 L170 -220Z" fill="#e05a7f" stroke={INK} strokeWidth={5} />
          <rect x={-40} y={-120} width={80} height={120} fill="#2b3a44" />
          <path d="M60 -320 l10 -30 l10 30 l30 0 l-24 18 l10 30 l-26 -18 l-26 18 l10 -30 l-24 -18Z" fill={MUSTARD} stroke={INK} strokeWidth={3} />
        </g>
        {[260, 750, 1240].map((x, i) => {
          const c = cross(ats[i]);
          return c > 0 ? (
            <g key={x} stroke={CRIMSON} strokeWidth={22} strokeLinecap="round">
              <line x1={x - 180} y1={150} x2={x - 180 + 360 * Math.min(1, c * 2)} y2={150 + 380 * Math.min(1, c * 2)} />
              {c > 0.5 && <line x1={x + 180} y1={150} x2={x + 180 - 360 * (c - 0.5) * 2} y2={150 + 380 * (c - 0.5) * 2} />}
            </g>
          ) : null;
        })}
      </Sheet>
    );
  }
  const hang = act(t.f, 15, 35);
  return (
    <Sheet t={t}>
      <Robot x={750} y={640} scale={1.5} frame={t.f} pose={{ ...STAND, armF: [30 + 10 * Math.sin(t.f * 0.1), 20] }} />
      <g transform={`translate(890 ${-80 + 430 * hang}) rotate(${8 * Math.sin(t.f * 0.12)})`}>
        <line x1={0} y1={-200} x2={0} y2={0} stroke={INK} strokeWidth={4} />
        <rect x={-110} y={0} width={220} height={140} rx={14} fill={PAPER} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={70} r={46} fill="none" stroke={STEEL_DARK} strokeWidth={14} />
        <line x1={0} y1={70} x2={30} y2={44} stroke={CRIMSON} strokeWidth={8} strokeLinecap="round" />
      </g>
      {t.f > 45 && (
        <path d={`M1180 300 l40 50 l${90 * act(t.f, 45, 60)} ${-120 * act(t.f, 45, 60)}`} fill="none" stroke={TEAL} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Sheet>
  );
};

/** Friday noon: the board's table seen from above, a clock at twelve, the hands going up one by one. */
export const BoardSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const seats = Array.from({ length: 8 }, (_, i) => ({ x: 400 + (i % 4) * 230, y: i < 4 ? 210 : 510, up: i !== 6 }));
  return (
    <Sheet t={t}>
      <rect x={320} y={260} width={860} height={200} rx={30} fill="#8a5a3a" stroke={INK} strokeWidth={6} />
      <rect x={340} y={276} width={820} height={30} rx={14} fill="#fff" opacity={0.15} />
      <WallClock x={1340} y={150} s={1} hours={12} />
      {seats.map((s, i) => {
        const at = 6 + i * 6;
        const up = s.up && t.f >= at ? act(t.f, at, at + 8) : 0;
        const dir = s.y < 300 ? -1 : 1;
        return (
          <g key={i}>
            {up > 0 && <Hand x={s.x + 40} y={s.y + dir * (70 + 80 * up)} from={dir < 0 ? 90 : 270} skin={["#8fa3b8", "#c3b1e1", "#a9c4a0", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f"][i]} sleeve="#2f3242" s={0.42} />}
            <path d={`M${s.x - 60} ${s.y + dir * 50} Q${s.x} ${s.y + dir * 110} ${s.x + 60} ${s.y + dir * 50}`} fill="#2f3242" stroke={INK} strokeWidth={4} />
            <circle cx={s.x} cy={s.y + dir * 50} r={44} fill={["#8fa3b8", "#c3b1e1", "#a9c4a0", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f"][i]} stroke={INK} strokeWidth={4} />
          </g>
        );
      })}
    </Sheet>
  );
};

/** 2025, the shopping agent: a phone with a small steel figure inside it carrying a bag; a card taps a reader; a receipt
 *  comes out; the shopper, elsewhere, has his feet up. Kept in the left two-thirds (the end screen's third stays quiet). */
export const AgentSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const tap = act(t.f, 30, 42) * (1 - act(t.f, 52, 64));
  const receipt = act(t.f, 50, 90);
  return (
    <Sheet t={t} w={1180} h={700} y={620}>
      <g transform="translate(110 0)">
        {/* the phone with the agent */}
        <rect x={60} y={80} width={300} height={540} rx={40} fill="#16181f" stroke={INK} strokeWidth={6} />
        <rect x={80} y={100} width={260} height={500} rx={28} fill="#e9edf0" />
        <Robot x={210} y={540} scale={0.9} frame={t.f} pose={{ ...STAND, armF: [70, 20] }} held={<g><rect x={-20} y={0} width={56} height={60} rx={6} fill="#c9a06a" stroke={INK} strokeWidth={4} /><path d="M-10 0 q18 -30 36 0" fill="none" stroke={INK} strokeWidth={4} /></g>} />
        {/* the card reader and a card tapping */}
        <rect x={500} y={300} width={170} height={260} rx={22} fill={STEEL} stroke={INK} strokeWidth={5} />
        <rect x={520} y={320} width={130} height={80} rx={10} fill={tap > 0.6 ? "#9fe8a0" : "#2a4a3a"} />
        <Card x={585 + 160 * (1 - tap)} y={460 - 40 * tap} s={0.9} rot={-15 + 15 * tap} strange />
        <path d={`M520 560 h130 v${200 * receipt} h-130Z`} fill={PAPER} stroke={INK} strokeWidth={4} />
        {Array.from({ length: Math.floor(6 * receipt) }, (_, i) => <rect key={i} x={540} y={580 + i * 28} width={70 + (i % 3) * 14} height={10} rx={5} fill={INK} opacity={0.4} />)}
        {/* the shopper, feet up, elsewhere */}
        <g transform="translate(830 300)">
          <rect x={-30} y={140} width={200} height={110} rx={20} fill="#7a6a58" stroke={INK} strokeWidth={5} />
          <Figure x={60} y={300} scale={0.85} pose={{ ...STAND, lean: -20, legB: [88, -10], legF: [92, -20], armF: [150, 40], armB: [140, 50] }} head={WORKER_HEADS[2]} coat="#6d7f8f" lids={0.6} mouth="smile" time={t.f} />
        </g>
      </g>
    </Sheet>
  );
};

/** The tab its worker would have run up: a receipt unrolling down the sheet, one line a counter in town (a burger, a
 *  haircut, a pint, a plumber's call, a pie), and a total under the rule. */
export const TabSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const rows = 5;
  const shown = act(t.f, 10, 100) * rows;
  const icon = (i: number) => {
    switch (i) {
      case 0: return <Burger s={0.55} />;
      case 1: return <g stroke={INK} strokeWidth={4} fill="none"><circle cx={-12} cy={10} r={9} /><circle cx={12} cy={10} r={9} /><path d="M-6 3 L12 -20 M6 3 L-12 -20" strokeWidth={5} /></g>;
      case 2: return <g><path d="M-16 -22 h32 l-4 42 h-24Z" fill={MUSTARD} stroke={INK} strokeWidth={4} /><path d="M-16 -22 h32 v8 h-32Z" fill={PAPER} /></g>;
      case 3: return <g transform="rotate(-40)"><rect x={-6} y={-30} width={12} height={56} rx={5} fill={STEEL} stroke={INK} strokeWidth={3} /><path d="M-16 -30 Q-18 -52 -4 -54 v12 h8 v-12 Q18 -52 16 -30Z" fill={STEEL} stroke={INK} strokeWidth={3} /></g>;
      default: return <Pie s={0.5} slice />;
    }
  };
  return (
    <Sheet t={t}>
      <g transform="translate(750 20) scale(1.25)">
        <rect x={-230} y={0} width={460} height={110 + 96 * shown} fill="#fffdf6" stroke={INK} strokeWidth={5} />
        <path d={`M-230 ${110 + 96 * shown} ${Array.from({ length: 12 }, (_, i) => `l${460 / 24} 14 l${460 / 24} -14`).join(" ")}`} fill="#fffdf6" stroke={INK} strokeWidth={4} />
        <circle cx={0} cy={50} r={28} fill="none" stroke={STEEL_DARK} strokeWidth={10} />
        <line x1={0} y1={50} x2={16} y2={36} stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />
        {Array.from({ length: rows }, (_, i) => {
          const k = Math.min(1, Math.max(0, shown - i));
          if (k <= 0) return null;
          return (
            <g key={i} transform={`translate(0 ${150 + i * 96})`} opacity={k}>
              <g transform="translate(-160 0)">{icon(i)}</g>
              <line x1={-100} y1={10} x2={100} y2={10} stroke={INK} strokeWidth={3} strokeDasharray="4 10" opacity={0.5} />
              <Coin x={160} y={0} r={22} />
            </g>
          );
        })}
      </g>
    </Sheet>
  );
};
