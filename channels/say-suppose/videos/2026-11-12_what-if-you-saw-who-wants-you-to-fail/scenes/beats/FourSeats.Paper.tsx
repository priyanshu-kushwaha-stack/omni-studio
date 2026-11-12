// Four in a Hundred on paper and on the phone (script v3): the curve's top four per cent (62, one plain fact); a
// hundred small heads in rows, four places teal, yours fourth and his fifth (63), then yours climbing to second (75);
// the closer, the sharper it cuts (77); and your phone (67): the group chat with a name swiped out, then another; the
// shared folder with a name removed. No words: names are ink bars.
import { interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { phone } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { blinking, camAt, HERO, MINJUN, mix, noise, PASTELS, ramp } from "../shared";
import { FlatShot, HeadIcon, SetShot, WoodTop } from "./WhosCrimson.Common";
import type { SeatsTimes } from "./FourSeats.Times";

const clamp01 = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ------------------------------------------------------------------------------------------------ 62 the curve

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

// ------------------------------------------------------------------------------------------------ 63 and 75 a hundred of you

const COLS = 10, GAP_X = 86, GAP_Y = 66, OX = 113, OY = 80;
const cell = (i: number) => ({ x: OX + (i % COLS) * GAP_X, y: OY + Math.floor(i / COLS) * GAP_Y });

/**
 * A hundred small heads in ten rows, in rank order. The first four places are boxed teal; your head is fourth, his
 * fifth. With `climbing`, yours moves up to third, then second ("Fourth. Third. Second."), and each one you pass steps
 * down one place.
 */
export const HundredSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName; climbing?: boolean }> = ({ frame, k, mood, climbing }) => {
  const W = 1000, H = 760;
  const at0 = climbing ? k.climb - 30 : k.hundred;
  const heads = climbing ? 1 : clamp01(frame, k.heads - 6, k.heads + 8);
  const four = climbing ? 1 : clamp01(frame, k.four, k.four + 10);
  const yours = climbing ? 1 : ramp(frame, k.fourth, k.fourth + 8);
  const his = climbing ? 1 : ramp(frame, k.fifth, k.fifth + 8);
  const yourPlace = climbing ? 3 - ramp(frame, k.third, k.third + 10) - ramp(frame, k.second, k.second + 10) : 3;
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
          // each one above you steps down one place as you climb past them
          const p = i < 3 ? i + Math.min(1, Math.max(0, i + 1 - yourPlace)) : i;
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

// ------------------------------------------------------------------------------------------------ 67 the phone

/** The people in the group chat (and with the shared folder): an avatar and a name as an ink bar each. */
const MEMBERS = [PASTELS[0], PASTELS[2], MINJUN.head, PASTELS[5], PASTELS[3], PASTELS[6], PASTELS[7], PASTELS[1]];

/** The screen (over the phone set's handset, its screen 336 x 640 at x 1012, y 240): the group chat, or the shared
 *  folder's "shared with" list under a folder. The rows in `out` leave one by one, swiped off to the left, from `from`
 *  to `to`; the rows below close the gap. */
const PhoneList: React.FC<{ frame: number; kind: "chat" | "folder"; out: number[]; from: number; to: number }> = ({ frame, kind, out, from, to }) => {
  const x0 = 1012, y0 = 240, w = 336, row = 62;
  const outAt = (n: number) => mix(from, to, (n + 0.3) / out.length);
  const top = kind === "chat" ? 110 : 220;
  let shift = 0;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={640} rx={18} fill="#eef1f4" />
      {kind === "chat" ? (
        <g>
          <rect x={x0} y={y0} width={w} height={84} rx={18} fill="#d9dee6" />
          {[0, 1, 2].map((i) => <circle key={i} cx={x0 + 40 + i * 22} cy={y0 + 42} r={18} fill={[PASTELS[0], MINJUN.head, HERO.head][i]} stroke="#3a3550" strokeWidth={3} />)}
          <rect x={x0 + 120} y={y0 + 32} width={130} height={18} rx={9} fill={INK} opacity={0.6} />
        </g>
      ) : (
        <g>
          <path d={`M${x0 + 110} ${y0 + 60} H${x0 + 160} L${x0 + 176} ${y0 + 76} H${x0 + 230} V${y0 + 170} H${x0 + 110}Z`} fill="#d9b26a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <rect x={x0 + 104} y={y0 + 88} width={132} height={82} rx={6} fill="#e8c27a" stroke={INK} strokeWidth={5} />
          <rect x={x0 + 40} y={y0 + 192} width={120} height={12} rx={6} fill={INK} opacity={0.4} />
        </g>
      )}
      {MEMBERS.slice(0, kind === "chat" ? 8 : 6).map((c, i) => {
        const o = out.indexOf(i);
        const leave = o < 0 ? 0 : interpolate(frame, [outAt(o), outAt(o) + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const y = y0 + top + i * row - shift * row;
        if (o >= 0) shift += interpolate(frame, [outAt(o) + 8, outAt(o) + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (leave >= 1) return null;
        return (
          <g key={i} transform={`translate(${-leave * 300} 0)`} opacity={1 - leave * 0.6}>
            {o >= 0 && frame >= outAt(o) - 8 && <rect x={x0 + 8} y={y + 4} width={w - 16} height={row - 8} rx={12} fill={CRIMSON} opacity={0.25} />}
            <circle cx={x0 + 46} cy={y + 30} r={24} fill="#3a3550" />
            <circle cx={x0 + 46} cy={y + 26} r={11} fill={c} />
            <rect x={x0 + 86} y={y + 22} width={100 + noise(i + 4) * 90} height={16} rx={8} fill={INK} opacity={0.55} />
          </g>
        );
      })}
    </g>
  );
};

/** Your thumb on the row that is leaving, swiping it left. */
const Swipe: React.FC<{ frame: number; out: number[]; from: number; to: number; top: number }> = ({ frame, out, from, to, top }) => {
  const outAt = (n: number) => mix(from, to, (n + 0.3) / out.length);
  const n = Math.max(0, out.findIndex((_, i) => frame < outAt(i) + 8));
  const target = out[Math.min(n, out.length - 1)];
  const before = out.slice(0, n).filter((o) => o < target).length;
  const ty = 240 + top + (target - before) * 62 + 34;
  const swipe = interpolate(frame, [outAt(n) - 4, outAt(n) + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <g transform={`translate(${1012 + 300 - swipe * 220} ${ty})`}>
      <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={12} cy={6} rx={16} ry={22} fill="#f7cf6e" />
    </g>
  );
};

/** Line 67: "Anyone who goes red: out of the group chat." (your best friend's name, then another, swiped out); "No
 *  more past papers from the shared folder." (the folder's list; one name removed). Your face at the left, set. */
export const PhoneShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const folder = frame >= k.folder;
  const out = folder ? [3] : [2, 4];
  const from = folder ? k.folder + 6 : k.chat + 16;
  const to = folder ? k.notes - 10 : k.folder - 4;
  const cam = drift(folder
    ? camAt(frame, [[k.folder, { x: 1140, y: 560, zoom: 1.45 }], [k.notes, { x: 1160, y: 560, zoom: 1.55 }]])
    : camAt(frame, [[k.chat, { x: 980, y: 560, zoom: 1.05 }], [k.chat + 20, { x: 1120, y: 560, zoom: 1.4 }], [k.folder, { x: 1150, y: 560, zoom: 1.5 }]]), frame, "phone", 2);
  const face = phone.spots.face;
  return (
    <SetShot set={phone} mood={mood} frame={frame} cam={cam} options={{ mode: "off", thumb: null, behind: "desk" }}
      behind={<Figure {...HERO} x={face.x} y={face.y} scale={face.scale} facing={1} brows="angry" lids={0.3} mouth="flat" eyes={1}
        look={{ x: 1, y: 0.35 }} blink={blinking(frame, 1)} time={frame} />}
      actors={<><PhoneList frame={frame} kind={folder ? "folder" : "chat"} out={out} from={from} to={to} />
        <Swipe frame={frame} out={out} from={from} to={to} top={folder ? 220 : 110} /></>} />
  );
};

// ------------------------------------------------------------------------------------------------ 77 the closer, the sharper

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
