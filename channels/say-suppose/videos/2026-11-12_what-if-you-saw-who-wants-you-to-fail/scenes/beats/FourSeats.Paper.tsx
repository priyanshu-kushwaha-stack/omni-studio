// Four in a Hundred on paper: the facts drawn on sheets on a desk. The curve's top four per cent (44, one plain fact);
// a hundred small heads in rows, four places teal, yours fourth and his fifth (45), then yours first (49); the closer,
// the sharper it cuts (51). No words on paper.
import { interpolate } from "remotion";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, TEAL } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { camAt, HERO, MINJUN, mix, PASTELS, ramp } from "../shared";
import { FlatShot, HeadIcon, WoodTop } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

const clamp01 = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ------------------------------------------------------------------------------------------------ 44 the curve

/** A bell curve on paper, and its top four per cent shaded teal with your head on it. */
export const PercentSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1100, H = 620;
  const cam = drift(camAt(frame, [[k.pct, insert(960, 540, 1.12)], [k.hundred, insert(1090, 520, 1.32)]]), frame, "pct", 2);
  const curve = "M80 520 C330 520 400 120 550 120 S770 520 1020 520";
  const shade = clamp01(frame, k.pct + 30, k.pct + 44);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop />} actors={
      <Sheet frame={frame} at={k.pct - 4} x={960} y={540} w={W} h={H}>
        <line x1={60} y1={522} x2={1040} y2={522} stroke={INK} strokeWidth={6} strokeLinecap="round" />
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

// ------------------------------------------------------------------------------------------------ 45 and 49 a hundred of you

const COLS = 10, GAP_X = 86, GAP_Y = 66, OX = 113, OY = 80;
const cell = (i: number) => ({ x: OX + (i % COLS) * GAP_X, y: OY + Math.floor(i / COLS) * GAP_Y });

/**
 * A hundred small heads in ten rows, in rank order. The first four places are boxed teal; your head is fourth, his
 * fifth. With `climbing`, yours moves up to first and the three above you each step down one.
 */
export const HundredSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName; climbing?: boolean }> = ({ frame, k, mood, climbing }) => {
  const W = 1000, H = 760;
  const at0 = climbing ? k.climb - 30 : k.hundred;
  const heads = climbing ? 1 : clamp01(frame, k.heads - 6, k.heads + 8);
  const four = climbing ? 1 : clamp01(frame, k.four, k.four + 10);
  const yours = climbing ? 1 : ramp(frame, k.fourth, k.fourth + 8);
  const his = climbing ? 1 : ramp(frame, k.fifth, k.fifth + 8);
  const up = climbing ? ramp(frame, k.climb + 2, k.climb + 20) : 0;
  const yourPlace = mix(3, 0, up);
  const cam = climbing
    ? drift(camAt(frame, [[k.climb, insert(760, 320, 1.75)], [k.red, insert(720, 310, 1.9)]]), frame, "climb", 2)
    : drift(camAt(frame, [[k.hundred, insert(960, 540, 1.05)], [k.four, insert(940, 520, 1.12)], [k.fourth, insert(760, 330, 1.7)], [k.weapon, insert(780, 330, 1.78)]]), frame, "hundred", 2);
  const place = (p: number) => {
    const a = cell(Math.floor(p)), b = cell(Math.ceil(p));
    const t = p - Math.floor(p);
    return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
  };
  const you = place(yourPlace);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={4} />} actors={
      <Sheet frame={frame} at={at0 - 4} x={960} y={540} w={W} h={H} tilt={-1}>
        <rect x={OX - 38} y={OY - 34} width={GAP_X * 4 - 10} height={68} rx={14} fill={TEAL} opacity={0.85 * four} stroke={INK} strokeWidth={four > 0 ? 4 : 0} />
        {Array.from({ length: 100 }, (_, i) => {
          if (i === 3 || i === 4) return null;
          // the three above you step down one place as you climb past them
          const p = i < 3 ? i + up : i;
          const c = place(p);
          const show = clamp01(heads, Math.floor(i / COLS) / 14, Math.floor(i / COLS) / 14 + 0.3);
          return <HeadIcon key={i} x={c.x} y={c.y} r={20} color={PASTELS[i % PASTELS.length]} dim={0.5 * show} />;
        })}
        <g transform={`translate(${cell(4).x} ${cell(4).y}) scale(${his})`}><HeadIcon x={0} y={0} r={26} color={MINJUN.head} mouth="flat" /></g>
        <g transform={`translate(${you.x} ${you.y}) scale(${yours})`}><HeadIcon x={0} y={0} r={26} color={HERO.head} tuft mouth="flat" /></g>
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 51 the closer, the sharper

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
          const s = r.size * 44;
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
