// Part C's pieces for script v2: the empty diner at midnight (the one job nobody is doing any more), the rival's "Buy
// with what?" in the doorway, the line at the cheque table turning away, the painter sure he's the first to try, Marco
// turned to the boss with the wrench, you with the phone in front of the crowd, the renters ready to walk, Marco's
// "Cheaper than a customer?" from the grill, and the dial's worked sum on the napkin (the same numbers as the Missing
// Line's: the three hundred and sixty to the app, to you, and out again as the town's cheque).
import { AbsoluteFill } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";

import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { BANKER, BOSS, MARCO, RIVAL, townsfolk, YOU, type Person } from "../Cast";
import { DinerShot, on, Place } from "../Places";
import { Cheque, STEEL, STEEL_DARK } from "../Props";
import { Robot } from "../Robot";
import type { ShotTime } from "../util";
import { act, CounterTop, mix, POINT, RAISED, ramp } from "./kit";
import { cooksAtPass, crowd, Extras, MARCO_X, type Extra } from "./Rooms";
import { Lunch } from "./Scenes";
import { town } from "./Town";

const noTools = (p: Extra): Extra => ({ ...p, who: { ...p.who, wear: (p.who.wear ?? []).filter((w) => w.kind !== "hammer" && w.kind !== "wrench") } });
const MARCO_W: Person = { ...MARCO, coat: "#3d6fb0", wear: [{ kind: "paperHat", tilt: 28 }, { kind: "wrench" }] };

/** Midnight, lamp over the till: forty empty stools, the four cooks beaming at nobody, you with the phone, looking along
 *  the stools for the one job nobody in town is doing any more. */
export const EmptyStools: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="lamp" robots={4} grill="cold" options={{ flip: false }} cam={{ x: 900, y: 640, zoom: 1.15 }} push={[1, 1.06]} pushAt={{ x: 700, y: 600 }}
    cast={[on("till", YOU, t.f < 60 ? "sad" : "determined", { behind: true, phone: true, pose: { ...STAND, armF: [60, 80] }, look: t.f < 60 ? { x: 0.9, y: 0.5 } : { x: 0.3, y: 0.6 } })]} />
);

/** The doorway: the boss hopeful in his coat, the rival behind him with her phone; she asks, he turns to her. */
export const RivalBuyWith: React.FC<{ t: ShotTime }> = ({ t }) => {
  const turn = t.f > 8;
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 300, y: 640, zoom: 1.85 }} grill="cold" options={{ flip: false, door: 1 }} push={[1.02, 1.06]}
      cast={[
        on("door", RIVAL, "sceptical", { dx: 190, dy: -6, facing: -1, pose: { ...STAND, armF: [70, 70] }, phone: true, look: { x: 0.8, y: 0 } }),
        on("door", { ...BOSS, wear: [{ kind: "longCoat", color: "#3a3d4a" }] }, turn ? "shocked" : "happy", { dx: 30, facing: turn ? 1 : -1, pose: STAND, look: { x: 0.8, y: 0 } }),
      ]} />
  );
};

/** The line at the cheque table sees the plumber and the hairdresser keep it, and turns away: each one in turn looks
 *  off down the street, then they walk off with hammers. You at the table with a cheque nobody takes. */
export const QueueQuits: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const people: Extra[] = Array.from({ length: 6 }, (_, i) => {
    const turn = 8 + i * 7;
    const go = ramp(f, 48 + i * 4, 120 + i * 4);
    const who: Person = { ...townsfolk(i), wear: f > 40 + i * 4 ? [{ kind: i % 3 ? "hammer" : "wrench" }] : [] };
    return {
      who, x: 480 + i * 175 + go * 700, y: 1050, s: 1.05, facing: f > turn ? 1 : -1, face: f > turn ? "determined" : "neutral",
      pose: go > 0 ? { ...walkPose(f * 0.3 + i), armF: RAISED.armF } : f > 40 + i * 4 ? RAISED : STAND, look: { x: 0.8, y: -0.1 },
    };
  });
  return (
    <Place t={t} set={town} mood="dusk" cam="queue" options={{ table: true, stack: 1 }} push={[1, 1.05]}
      cast={[on("table", YOU, f > 40 ? "shocked" : "neutral", { behind: true, pose: { ...STAND, armF: [80, 10] }, held: <Cheque s={0.2} rot={-10} />, look: { x: 0.9, y: 0 } })]}
      actors={<Extras people={people} frame={f} />} />
  );
};

/** "You'd think nobody had ever tried this": the painter at the back sure he's the first, hammer up again, the others
 *  looking at him. */
export const FirstToTry: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 700, y: 690, zoom: 1.75 }} grill="cold" push={[1, 1.05]} steel={cooksAtPass(4, 0)}
      actors={<Extras people={crowd((i) => (i === 0 ? act(f, 6, 18) : 0), (i) => (i === 0 ? "determined" : "sceptical"), { x: -0.7, y: -0.2 })
        .map((p, i) => (i === 0 ? { ...p, look: { x: 0.2, y: -0.8 } } : p))} frame={f} />} />
  );
};

/** Marco turned to the boss in the doorway, the wrench still in his hand, asking. */
export const MarcoAsks: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 1000, y: 740, zoom: 2.0 }} grill="cold" push={[1, 1.05]} steel={cooksAtPass(4, 0)}
    actors={<Extras people={[
      ...crowd(() => 0, () => "worried", { x: 0.9, y: 0 }).map((p) => ({ ...p, facing: -1 as const })),
      { who: MARCO_W, x: MARCO_X, y: 1078, s: 1.1, facing: -1, face: "worried", pose: { ...STAND, armF: [40, 50 + 6 * Math.sin(t.f * 0.3)] }, look: { x: 0.9, y: -0.1 } },
    ]} frame={t.f} />} />
);

/** You at the till with the phone up in front of the crowd, the cooks beaming; "only you can turn it". */
export const LampPhone: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 820, y: 640, zoom: 1.45 }} grill="cold" push={[1, 1.06]} pushAt={{ x: 600, y: 520 }} steel={cooksAtPass(4, 0)}
    cast={[on("till", YOU, "determined", { behind: true, phone: true, pose: { ...STAND, armF: [70, 90] }, look: { x: 0.5, y: 0.3 } })]}
    actors={<Extras people={crowd(() => 0, () => "sceptical", { x: -0.8, y: -0.3 }).map(noTools)} frame={t.f} />} />
);

/** The renters at your counter watch your thumb over the dial; when it moves, they stand, ready to walk. */
export const RentersWatch: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const lift = act(f, 30, 44) * (1 - act(f, 70, 84));
  const up = act(f, 42, 54) * (1 - act(f, 76, 90));
  const renter = (spot: string, who: Person, i: number) => on(spot, who, up > 0.5 ? "determined" : "sceptical", {
    pose: up > 0.5 ? { ...walkPose(f * 0.3 + i), armF: [20, 20] } : SEATED, dy: -6 * up, dx: -40 * up, look: { x: 0.8, y: up > 0.5 ? 0 : 0.3 },
  });
  return (
    <DinerShot t={t} mood="morning" robots={2} cam={{ x: 880, y: 700, zoom: 1.6 }} push={[1, 1.05]}
      cast={[
        on("till", YOU, lift > 0.5 ? "neutral" : "relieved", { behind: true, phone: true, pose: { ...STAND, armF: [60 + 30 * lift, 80] }, look: { x: 0.5, y: 0.5 } }),
        renter("stool4", BOSS, 0), renter("stool5", RIVAL, 1), renter("stool6", BANKER, 2),
      ]} />
  );
};

/** Marco at the grill answering the boss on stool four: spatula pointed at him, grinning. */
export const MarcoReplies: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Lunch t={t} cam={{ x: 1690, y: 600, zoom: 1.75 }} push={[1, 1.04]}
    marco={{ pose: { ...POINT, armF: [96, -8] }, face: "happy", look: { x: 0.8, y: 0.2 } }}
    boss={{ face: { brows: "raised", lids: 0, mouth: "o", eyes: 1.2 } }} />
);

/** You at the till, sure the steel customer's card is the sequel's fantasy: a little smile at the phone. */
export const YouSure: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Lunch t={t} cam={{ x: 760, y: 650, zoom: 2.0 }} you="relieved" youLook={{ x: 0.7, y: 0.7 }} push={[1, 1.04]} />
);

// ---- The dial's worked sum on the napkin ----------------------------------------------------------------------------

const NAPKIN_INK = "#3b3f8f";
const pop = (f: number, at: number, len = 8) => act(f, at, at + len);

const Ink: React.FC<{ x: number; y: number; size?: number; color?: string; k?: number; anchor?: "start" | "middle" | "end"; children: React.ReactNode }> = ({
  x, y, size = 54, color = NAPKIN_INK, k = 1, anchor = "middle", children,
}) => (k <= 0 ? null : (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} opacity={k} transform={`rotate(-1.5 ${x} ${y})`}>{children}</text>
));

const Sheet: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const n = Math.round(w / 34), m = Math.round(h / 34);
  let d = "M0 0";
  for (let i = 0; i < n; i++) d += ` Q${((i + 0.5) * w) / n} -8 ${((i + 1) * w) / n} 0`;
  for (let i = 0; i < m; i++) d += ` Q${w + 8} ${((i + 0.5) * h) / m} ${w} ${((i + 1) * h) / m}`;
  for (let i = n; i > 0; i--) d += ` Q${((i - 0.5) * w) / n} ${h + 8} ${((i - 1) * w) / n} ${h}`;
  for (let i = m; i > 0; i--) d += ` Q-8 ${((i - 0.5) * h) / m} 0 ${((i - 1) * h) / m}`;
  return (
    <g>
      <path d={`${d} Z`} fill="#000" opacity={0.32} transform="translate(14 18)" />
      <path d={`${d} Z`} fill="#fbf7ee" stroke="#d9cfbd" strokeWidth={3} />
      <rect x={26} y={26} width={w - 52} height={h - 52} fill="none" stroke="#e7dccb" strokeWidth={3} strokeDasharray="3 10" />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#efe6d6" strokeWidth={3} />
    </g>
  );
};

const Shop: React.FC<{ x: number; y: number; color: string; k: number; lit: number; icon: "pole" | "wrench" | "apple" }> = ({ x, y, color, k, lit, icon }) => (k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * k})`} opacity={k}>
    <rect x={-70} y={-60} width={140} height={120} fill={color} stroke={INK} strokeWidth={5} />
    <path d="M-80 -60 L-66 -92 H66 L80 -60Z" fill={PAPER} stroke={INK} strokeWidth={5} />
    <rect x={-48} y={-36} width={60} height={50} fill={lit > 0.5 ? "#fff1c6" : "#6b6f7a"} stroke={INK} strokeWidth={4} />
    <rect x={22} y={-36} width={30} height={96} fill="#5a4a3a" stroke={INK} strokeWidth={4} />
    <g transform="translate(0 -76)">
      {icon === "pole" && <g><rect x={-8} y={-14} width={16} height={28} fill={PAPER} stroke={INK} strokeWidth={3} /><path d="M-8 -6 L8 -14 M-8 6 L8 -2 M-8 14 L8 10" stroke={CRIMSON} strokeWidth={4} /></g>}
      {icon === "wrench" && <path d="M-14 12 L10 -10 M4 -16 Q18 -18 14 -4" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />}
      {icon === "apple" && <g><circle r={12} fill={CRIMSON} stroke={INK} strokeWidth={3} /><path d="M0 -12 q4 -8 10 -8" stroke="#2f7a4a" strokeWidth={4} fill="none" /></g>}
    </g>
    {lit > 0 && <circle cx={-18} cy={-12} r={50 * lit} fill="#fff1c6" opacity={0.35 * lit} />}
  </g>
));

/** The 360 token: a coin with the number on it. */
const Token: React.FC<{ x: number; y: number; s?: number; label?: string; color?: string }> = ({ x, y, s = 1, label = "360", color = MUSTARD }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={62} fill={color} stroke={INK} strokeWidth={6} />
    <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={INK}>{label}</text>
  </g>
);

const along = (a: { x: number; y: number }, b: { x: number; y: number }, u: number, h = 120) => ({ x: mix(a.x, b.x, u), y: mix(a.y, b.y, u) - h * 4 * u * (1 - u) });

/** The dial's sum, step by step on the spoken words of "A machine now costs whoever rents it..." (`f` is frames into
 *  that line). The machine's tag, the three hundred and sixty its worker spent at the barber, the garage and the
 *  grocer; Marco fired: kept four hundred, lost forty; the three hundred and sixty to the app, to you, and out as the
 *  town's cheque, the shops lit again; then every owner's sum: 400 - 360 - 40 = 0. `zoom` pushes in. */
export const DialSum: React.FC<{ t: ShotTime; f: number; zoom?: [number, number] }> = ({ t, f, zoom = [1, 1.04] }) => {
  const W = 1500, H = 800;
  const robot = { x: 230, y: 560 };
  const tagAt = { x: 410, y: 380 };
  const phone = { x: 760, y: 560 };
  const counter = { x: 1210, y: 700 };
  const shopX = (i: number) => 820 + i * 220;
  const shopY = 210;
  const tagK = pop(f, 103);
  const shops = [169, 189, 209].map((w) => pop(f, w - 4));
  const fired = pop(f, 242);
  const kept = pop(f, 285, 10);
  const lost = pop(f, 311);
  const toApp = ramp(f, 350, 384);
  const toYou = ramp(f, 392, 410);
  const out = ramp(f, 420, 452);
  const lit = ramp(f, 448, 460);
  const sum = [481, 498, 511, 524].map((w) => pop(f, w));
  const z = mix(zoom[0], zoom[1], t.p);
  const token = toApp < 1 ? along(tagAt, phone, toApp, 160) : toYou < 1 ? along(phone, { x: counter.x, y: counter.y - 150 }, toYou, 90) : { x: counter.x, y: counter.y - 150 };
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <CounterTop mood="morning" />
        <g transform={`translate(960 610) scale(${z}) translate(${-W / 2} ${-H / 2})`}>
          <Sheet w={W} h={H} />
          <Ink x={60} y={84} size={32} anchor="start">...and he ate here</Ink>
          {/* the machine with its weekly tag */}
          <g transform={`translate(${robot.x} ${robot.y}) scale(0.95)`}><Robot x={0} y={0} scale={1} frame={t.f} pose={{ ...STAND, armF: [60, 30] }} /></g>
          {tagK > 0 && toApp <= 0 && (
            <g opacity={tagK}>
              <line x1={robot.x + 40} y1={robot.y - 250} x2={tagAt.x} y2={tagAt.y - 60} stroke={INK} strokeWidth={4} />
              <Token x={tagAt.x} y={tagAt.y} s={0.6 + 0.4 * tagK} />
            </g>
          )}
          <Ink x={tagAt.x + 10} y={tagAt.y + 110} size={46} k={tagK * (1 - toApp)}>a week</Ink>
          {/* where its worker used to spend it */}
          {shops.map((k, i) => <Shop key={i} x={shopX(i)} y={shopY} color={["#e85f6f", "#7d8d99", "#7fc29b"][i]} icon={(["pole", "wrench", "apple"] as const)[i]} k={k} lit={k > 0 && f < 233 ? 1 : lit} />)}
          {shops.map((k, i) => (k > 0 && f < 233 ? (
            <path key={i} d={`M${tagAt.x + 70} ${tagAt.y - 30} Q${(tagAt.x + shopX(i)) / 2} ${shopY - 40} ${shopX(i) - 40} ${shopY + 50}`} fill="none" stroke={NAPKIN_INK} strokeWidth={4}
              strokeDasharray="10 12" opacity={0.7 * k} />
          ) : null))}
          {/* Marco, fired: you keep his four hundred and lose your forty */}
          <g opacity={pop(f, 228)} transform="translate(590 380)">
            <circle r={58} fill="#a9d4ec" stroke={INK} strokeWidth={5} />
            <circle cx={14} cy={-6} r={6} fill={INK} /><circle cx={32} cy={-6} r={6} fill={INK} />
            <path d="M-58 -36 L62 -36 L52 -76 Q6 -96 -48 -76 Z" fill={PAPER} stroke={INK} strokeWidth={5} transform="rotate(24 0 -40)" />
            {fired > 0 && <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke={CRIMSON} strokeWidth={12} strokeLinecap="round" opacity={fired * 0.85} />}
          </g>
          {/* your counter */}
          <g transform={`translate(${counter.x} ${counter.y})`}>
            <circle cx={-40} cy={-120} r={44} fill={MUSTARD} stroke={INK} strokeWidth={5} />
            <circle cx={-26} cy={-128} r={5} fill={INK} /><circle cx={-6} cy={-128} r={5} fill={INK} />
            <path d={sum[3] > 0.5 ? "M-34 -102 H-4" : "M-36 -104 Q-16 -86 2 -106"} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
            <rect x={-130} y={-60} width={260} height={66} rx={8} fill={TEAL} stroke={INK} strokeWidth={5} />
            <rect x={-140} y={-70} width={280} height={18} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
          </g>
          <Ink x={counter.x - 110} y={counter.y - 190} size={46} k={kept * (1 - lit)} color={TEAL} anchor="end">kept 400</Ink>
          <Ink x={counter.x - 110} y={counter.y - 130} size={46} k={lost * (1 - lit)} color={CRIMSON} anchor="end">lost 40</Ink>
          {/* the app */}
          <g opacity={pop(f, 340)} transform={`translate(${phone.x} ${phone.y})`}>
            <rect x={-70} y={-120} width={140} height={240} rx={22} fill="#16181f" stroke={INK} strokeWidth={5} />
            <rect x={-56} y={-104} width={112} height={208} rx={14} fill="#e9edf0" />
            <circle cy={10} r={36} fill="none" stroke={STEEL_DARK} strokeWidth={12} />
            <line x1={0} y1={10} x2={20} y2={-12} stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />
            <circle cy={10} r={8} fill={STEEL} stroke={INK} strokeWidth={3} />
          </g>
          {toApp > 0 && out <= 0 && <Token x={token.x} y={token.y} s={0.8} />}
          {/* out again as the town's cheque */}
          {out > 0 && (() => {
            const p = along({ x: counter.x, y: counter.y - 150 }, { x: shopX(1), y: shopY + 120 }, out, 200);
            return <Cheque x={p.x} y={p.y} s={mix(0.3, 0.45, out)} rot={-10 + 20 * out} />;
          })()}
          <Ink x={shopX(1)} y={shopY + 250} size={46} k={lit * (1 - sum[0])}>the town's cheque</Ink>
          {/* every owner's sum */}
          <Ink x={420} y={740} size={60} k={sum[0]} anchor="start">400</Ink>
          <Ink x={560} y={740} size={60} k={sum[1]} color={CRIMSON} anchor="start">- 360</Ink>
          <Ink x={760} y={740} size={60} k={sum[2]} color={CRIMSON} anchor="start">- 40</Ink>
          <Ink x={920} y={740} size={60} k={sum[3]} anchor="start">= 0</Ink>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

