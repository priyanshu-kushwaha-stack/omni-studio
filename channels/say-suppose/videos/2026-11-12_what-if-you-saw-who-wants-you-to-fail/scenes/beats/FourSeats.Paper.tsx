// Four Seats on paper and on the phone: the facts drawn on sheets on a desk (the old curve's top four per cent and the
// ten that come after you, 47; the class from above with its four seats, 48; your climb up the rank list in three
// stamps, 55; the closer, the sharper it cuts, 57) and the group chat with names dropping out (51). No words: names
// are ink bars, the only number is the stamped rank.
import { interpolate, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { phone } from "@whatif/kit/sets";
import { FONT } from "@whatif/kit/fonts";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { blinking, camAt, HERO, MINJUN, mix, noise, PASTELS, ramp } from "../shared";
import { FlatShot, HeadIcon, SetShot, WoodTop } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

const clamp01 = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ------------------------------------------------------------------------------------------------ 47 the curve

/** A bell curve on paper: the top four per cent shaded teal with your head on it; then a dashed line further in and a
 *  grey hatch out to it, the ten per cent the five-tier scale gives the years after you. */
export const PercentSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1100, H = 620;
  const cam = drift(camAt(frame, [[k.pct, insert(960, 540, 1.12)], [k.widen, insert(1080, 520, 1.3)], [k.seats, insert(1100, 520, 1.36)]]), frame, "pct", 2);
  const curve = "M80 520 C330 520 400 120 550 120 S770 520 1020 520";
  const shade = clamp01(frame, k.pct + 30, k.pct + 44);
  const wide = clamp01(frame, k.widen, k.widen + 18);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop />} actors={
      <Sheet frame={frame} at={k.pct - 4} x={960} y={540} w={W} h={H}>
        <line x1={60} y1={522} x2={1040} y2={522} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        {/* ten per cent: hatched grey, from the dashed line out (after you) */}
        <g opacity={wide}>
          <clipPath id="ten"><path d="M790 0 H1040 V520 H790Z" /></clipPath>
          <path d={`${curve} L1020 522 L80 522Z`} fill="#bdb6a6" clipPath="url(#ten)" opacity={0.7} />
          <line x1={790} y1={330} x2={790} y2={560} stroke={INK} strokeWidth={5} strokeDasharray="14 12" />
        </g>
        {/* four per cent: teal, the narrow tail */}
        <g opacity={shade}>
          <clipPath id="four"><path d="M880 0 H1040 V520 H880Z" /></clipPath>
          <path d={`${curve} L1020 522 L80 522Z`} fill={TEAL} clipPath="url(#four)" />
          <line x1={880} y1={420} x2={880} y2={560} stroke={INK} strokeWidth={6} />
          <HeadIcon x={945} y={410} r={26} color={HERO.head} tuft mouth="flat" />
        </g>
        <DrawLine d={curve} from={k.pct + 4} to={k.pct + 30} color={INK} width={8} />
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 48 four seats

/** The class from above: six rows of five desks; the front four teal. Min-jun's head and yours pop up at your two
 *  desks, side by side, and an ink arrow from each runs to the four. */
export const SeatsSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1000, H = 680;
  const cam = drift(camAt(frame, [[k.seats, insert(960, 540, 1.1)], [k.weapon, insert(960, 560, 1.25)]]), frame, "seats", 2);
  const glow = clamp01(frame, k.seats + 18, k.seats + 30);
  const desk = (c: number, r: number) => ({ x: 170 + c * 150, y: 120 + r * 92 });
  const mj = desk(2, 3), you = desk(3, 3);
  const pop = (at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps: 30, config: { damping: 10, stiffness: 220, mass: 0.6 } }));
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={3} />} actors={
      <Sheet frame={frame} at={k.seats - 4} x={960} y={540} w={W} h={H} tilt={1.5}>
        <rect x={290} y={30} width={420} height={36} rx={6} fill="#9aa3ad" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 30 }, (_, i) => {
          const c = i % 5, r = Math.floor(i / 5);
          const d = desk(c, r);
          const four = r === 0 && c < 4;
          return <rect key={i} x={d.x - 50} y={d.y - 28} width={100} height={56} rx={8} fill={four && glow > 0.5 ? TEAL : "#e2d6bf"}
            stroke={INK} strokeWidth={4} />;
        })}
        <g transform={`translate(${mj.x} ${mj.y}) scale(${pop(k.minjunSeat)})`}><HeadIcon x={0} y={0} r={30} color={MINJUN.head} mouth="flat" /></g>
        <g transform={`translate(${you.x} ${you.y}) scale(${pop(k.youSeat)})`}><HeadIcon x={0} y={0} r={30} color={HERO.head} tuft mouth="flat" /></g>
        <DrawLine d={`M${mj.x - 10} ${mj.y - 40} C${mj.x - 30} ${mj.y - 140} ${mj.x - 60} 200 ${desk(1, 0).x + 10} ${desk(1, 0).y + 36}`} from={k.minjunSeat + 6} to={k.minjunSeat + 24} color={INK} width={6} />
        <DrawLine d={`M${you.x + 10} ${you.y - 40} C${you.x + 20} ${you.y - 140} ${you.x} 200 ${desk(3, 0).x - 10} ${desk(3, 0).y + 36}`} from={k.youSeat + 6} to={k.youSeat + 24} color={INK} width={6} />
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 51 the group chat

/** The group's members as rows: an avatar and a name as an ink bar. The ones past minus forty drop out, one by one. */
const MEMBERS = [PASTELS[0], PASTELS[2], MINJUN.head, PASTELS[5], PASTELS[3], PASTELS[6], PASTELS[7], PASTELS[1]];
const OUT = [4, 2, 6];

const ChatScreen: React.FC<{ frame: number; k: SeatsTimes }> = ({ frame, k }) => {
  const x0 = 1180 - 168, y0 = 240, w = 336, row = 66;
  const outAt = (n: number) => mix(k.chat + 14, k.folder - 20, n / OUT.length);
  let shift = 0;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={640} rx={18} fill="#eef1f4" />
      <rect x={x0} y={y0} width={w} height={84} rx={18} fill="#d9dee6" />
      {[0, 1, 2].map((i) => <circle key={i} cx={x0 + 40 + i * 22} cy={y0 + 42} r={18} fill={[PASTELS[0], MINJUN.head, HERO.head][i]} stroke="#3a3550" strokeWidth={3} />)}
      <rect x={x0 + 120} y={y0 + 32} width={130} height={18} rx={9} fill={INK} opacity={0.6} />
      {MEMBERS.map((c, i) => {
        const o = OUT.indexOf(i);
        const leave = o < 0 ? 0 : clamp01(frame, outAt(o), outAt(o) + 8);
        const y = y0 + 110 + i * row - shift * row;
        if (o >= 0) shift += clamp01(frame, outAt(o) + 8, outAt(o) + 16);
        if (leave >= 1) return null;
        return (
          <g key={i} transform={`translate(${leave * 260} 0)`} opacity={1 - leave}>
            <circle cx={x0 + 46} cy={y + 30} r={24} fill="#3a3550" />
            <circle cx={x0 + 46} cy={y + 26} r={11} fill={c} />
            <rect x={x0 + 86} y={y + 22} width={100 + noise(i + 4) * 90} height={16} rx={8} fill={INK} opacity={0.55} />
            {o >= 0 && <circle cx={x0 + w - 36} cy={y + 30} r={16} fill={CRIMSON} opacity={0.9} />}
            {o >= 0 && <path d={`M${x0 + w - 44} ${y + 30} h16`} stroke="#fff" strokeWidth={5} strokeLinecap="round" />}
          </g>
        );
      })}
    </g>
  );
};

/** Your thumb, tapping the red button on the row that is leaving. */
const Thumb: React.FC<{ frame: number; k: SeatsTimes }> = ({ frame, k }) => {
  const outAt = (n: number) => mix(k.chat + 14, k.folder - 20, n / OUT.length);
  const n = Math.max(0, OUT.findIndex((_, i) => frame < outAt(i) + 6));
  const target = OUT[n] ?? OUT[OUT.length - 1];
  const before = OUT.slice(0, n).filter((o) => o < target).length;
  const ty = 240 + 110 + (target - before) * 66 + 30;
  const tap = Math.max(0, Math.sin(((frame - outAt(n) + 6) / 6) * Math.PI)) * 10;
  return (
    <g transform={`translate(${1180 + 168 - 36} ${ty + 6 + tap})`}>
      <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={12} cy={6} rx={16} ry={22} fill="#f7cf6e" />
    </g>
  );
};

export const ChatShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.chat, { x: 980, y: 560, zoom: 1.05 }], [k.chat + 24, { x: 1120, y: 560, zoom: 1.4 }], [k.folder, { x: 1160, y: 560, zoom: 1.5 }]]), frame, "chat", 2);
  const face = phone.spots.face;
  return (
    <SetShot set={phone} mood={mood} frame={frame} cam={cam} options={{ mode: "off", thumb: null, behind: "desk" }}
      behind={<Figure {...HERO} x={face.x} y={face.y} scale={face.scale} facing={1} brows="angry" lids={0.3} mouth="flat" eyes={1}
        look={{ x: 1, y: 0.35 }} blink={blinking(frame, 1)} time={frame} />}
      actors={<><ChatScreen frame={frame} k={k} /><Thumb frame={frame} k={k} /></>} />
  );
};

// ------------------------------------------------------------------------------------------------ 55 the climb

/** The rank list on paper: ten rows; your head climbs in three stamps, each with its rank stamped beside it. */
export const ClimbSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 760, H = 700, row = 60, top = 60;
  const steps = [0.12, 0.45, 0.78].map((p) => Math.round(mix(k.climb, k.red, p)));
  const ranks = [7, 4, 2];
  const n = steps.filter((s) => frame >= s).length;
  const fromRank = n <= 1 ? 9 : ranks[n - 2];
  const toRank = n === 0 ? 9 : ranks[n - 1];
  const move = n === 0 ? 1 : ramp(frame, steps[n - 1], steps[n - 1] + 10);
  const rank = mix(fromRank, toRank, move);
  const thump = n === 0 ? 0 : spring({ frame: frame - steps[n - 1] - 8, fps: 30, config: { damping: 9, stiffness: 240, mass: 0.6 } });
  const cam = drift(camAt(frame, [[k.climb, insert(960, 560, 1.15)], [k.red, insert(960, 480, 1.3)]]), frame, "climb", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={4} />} actors={
      <Sheet frame={frame} at={k.climb - 4} x={960} y={540} w={W} h={H} tilt={-1.5}>
        {Array.from({ length: 10 }, (_, r) => (
          <g key={r}>
            <circle cx={170} cy={top + r * row + 30} r={16} fill={r === 2 ? MINJUN.head : "#c9c2b0"} />
            <rect x={210} y={top + r * row + 22} width={200 + noise(r + 11) * 200} height={16} rx={8} fill={INK} opacity={0.4} />
          </g>
        ))}
        <HeadIcon x={170} y={top + (rank - 1) * row + 30} r={26} color={HERO.head} tuft mouth="flat" />
        {n > 0 && (
          <g transform={`translate(${90} ${top + (toRank - 1) * row + 30}) rotate(-12) scale(${mix(1.8, 1, Math.min(1, thump))})`} opacity={Math.min(1, thump * 1.5)}>
            <circle r={24} fill="none" stroke={CRIMSON} strokeWidth={5} />
            <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={CRIMSON}>{toRank}</text>
          </g>
        )}
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 57 the closer, the sharper

/** Three pairs: you, and someone far, nearer, nearest; under each other person a crimson crack that grows as they
 *  get closer. */
export const CutsSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1100, H = 640;
  const cam = drift(camAt(frame, [[k.cuts, insert(960, 540, 1.1)], [k.down, insert(980, 560, 1.28)]]), frame, "cuts", 2);
  const rows = [{ gap: 620, size: 0.4, c: PASTELS[0] }, { gap: 380, size: 0.7, c: PASTELS[3] }, { gap: 150, size: 1.1, c: MINJUN.head }];
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={5} />} actors={
      <Sheet frame={frame} at={k.cuts - 4} x={960} y={540} w={W} h={H}>
        {rows.map((r, i) => {
          const y = 130 + i * 190;
          const at = Math.round(mix(k.cuts + 8, k.down - 20, i / 3));
          const ox = 180 + r.gap;
          const s = r.size * 30;
          return (
            <g key={i} opacity={frame >= at - 4 ? 1 : 0}>
              <HeadIcon x={180} y={y} r={34} color={HERO.head} tuft mouth="flat" />
              <line x1={230} y1={y} x2={ox - 50} y2={y} stroke={INK} strokeWidth={4} strokeDasharray="6 14" opacity={0.6} />
              <HeadIcon x={ox} y={y} r={34} color={r.c} mouth="frown" />
              <DrawLine d={`M${ox - s * 1.6} ${y + 52} l${s * 0.8} ${s * 0.7} l${s * 0.6} ${-s * 0.8} l${s * 0.7} ${s * 1.0} l${s * 0.8} ${-s * 0.9}`}
                from={at + 6} to={at + 18} color={CRIMSON} width={6 + r.size * 8} />
            </g>
          );
        })}
      </Sheet>
    } />
  );
};
