// The Weapon on paper and on the phone (script v5): a hundred small heads in rows, the top four places lit with TOP 4%
// (51), yours fourth and his fifth (52); the mock papers slapping down week after week, TRUE stamped on the first (53);
// your phone (56): the group chat with your best friend swiped out first ("Him first."), then the red classmate, the
// shared folder with both removed; the group chat's new name for you, WEATHERMAN and a cloud (57); and the tally,
// 4 -> 3 -> 2, that Second (74) uses. Names are ink bars.
import { interpolate, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { FONT } from "@whatif/kit/fonts";
import { phone } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { blinking, camAt, HERO, MINJUN, mix, noise, PASTELS, ramp } from "../shared";
import { FlatShot, HeadIcon, SetShot, WoodTop } from "./WhosCrimson.Common";
import { ROUND_ONE } from "./FourSeats.Class";
import type { SeatsTimes } from "./FourSeats.Times";

const clamp01 = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const thump = (frame: number, at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps: 30, config: { damping: 9, stiffness: 220, mass: 0.6 } }));
/** A one-off swell, 0 -> 1 -> 0 over `len` frames from `at`. */
const swell = (frame: number, at: number, len = 12) => (frame <= at || frame >= at + len ? 0 : Math.sin((Math.PI * (frame - at)) / len));

// ------------------------------------------------------------------------------------------------ 62-63 a hundred of you

const COLS = 10, GAP_X = 86, GAP_Y = 64, OX = 113, OY = 200;
const cell = (i: number) => ({ x: OX + (i % COLS) * GAP_X, y: OY + Math.floor(i / COLS) * GAP_Y });

/**
 * A hundred small heads in ten rows, in rank order, already on the paper as it lands (no blank sheet). On "the top 4 per
 * cent" the first four places light teal under a large TOP 4%; on "A hundred of you" a ripple runs through the heads; on
 * "Four places" the box swells; your head lands fourth, his fifth.
 */
export const HundredSheet: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1000, H = 820;
  const four = clamp01(frame, k.top4, k.top4 + 10);
  const stamp = thump(frame, k.top4 + 2);
  const yours = ramp(frame, k.fourth, k.fourth + 8);
  const his = ramp(frame, k.fifth, k.fifth + 8);
  const box = 1 + 0.08 * swell(frame, k.four, 14);
  const cam = drift(camAt(frame, [[k.pct, insert(960, 540, 1.0)], [k.top4, insert(955, 530, 1.04)], [k.four, insert(930, 500, 1.1)],
    [k.fourth, insert(820, 310, 1.6)], [k.weapon, insert(830, 310, 1.68)]]), frame, "hundred", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={4} />} actors={
      <Sheet frame={frame} at={k.pct - 6} x={960} y={540} w={W} h={H} tilt={-1}>
        <g opacity={Math.min(1, stamp * 1.5)} transform={`translate(${OX - 38} 150) scale(${mix(1.4, 1, Math.min(1, stamp))})`}>
          <text x={0} y={0} fontFamily={FONT} fontWeight={800} fontSize={112} fill={TEAL} stroke={INK} strokeWidth={5} paintOrder="stroke">TOP 4%</text>
        </g>
        <g transform={`translate(${OX - 38 + (GAP_X * 4 - 10) / 2} ${OY}) scale(${box}) translate(${-(OX - 38 + (GAP_X * 4 - 10) / 2)} ${-OY})`}>
          <rect x={OX - 38} y={OY - 34} width={GAP_X * 4 - 10} height={68} rx={14} fill={TEAL} opacity={0.85 * four} stroke={INK} strokeWidth={four > 0 ? 4 : 0} />
        </g>
        {Array.from({ length: 100 }, (_, i) => {
          if (i === 3 || i === 4) return null;
          const c = cell(i);
          const row = Math.floor(i / COLS), col = i % COLS;
          const show = clamp01(frame, k.pct + 2 + row * 2, k.pct + 10 + row * 2);
          const pulse = 1 + 0.35 * swell(frame, k.heads + (row + col) * 1.4, 12);
          return (
            <g key={i} transform={`translate(${c.x} ${c.y}) scale(${pulse})`}>
              <HeadIcon x={0} y={0} r={20} color={PASTELS[i % PASTELS.length]} dim={(i < 3 ? mix(0.55, 1, four) : 0.55) * show} />
            </g>
          );
        })}
        <g transform={`translate(${cell(4).x} ${cell(4).y}) scale(${his})`}><HeadIcon x={0} y={0} r={26} color={MINJUN.head} mouth="flat" /></g>
        <g transform={`translate(${cell(3).x} ${cell(3).y}) scale(${yours})`}><HeadIcon x={0} y={0} r={26} color={HERO.head} tuft mouth="flat" /></g>
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ the climb, a tally (Second, 74)

/** The tally's frames: the cut in, "Fourth", "Third", "Second", and the cut away. */
export interface TallyTimes { climb: number; fourth2: number; third: number; second: number; red: number }

/** "You climb. Fourth. Third. Second.": a big inked 4; on "Third" a red stroke through it and a 3; on "Second" a stroke
 *  through the 3 and a teal 2, ringed. Your head hops along above the number you are on. */
export const TallySheet: React.FC<{ frame: number; k: TallyTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const W = 1100, H = 600;
  const xs = [300, 600, 900];
  const steps = [k.climb + 6, k.third, k.second];
  const cam = drift(camAt(frame, [[k.climb, insert(960, 540, 1.04)], [k.second, insert(990, 540, 1.14)], [k.red, insert(1000, 540, 1.18)]]), frame, "tally", 2);
  const on = ramp(frame, k.third, k.third + 8) + ramp(frame, k.second, k.second + 8);
  const hx = on < 1 ? mix(xs[0], xs[1], on) : mix(xs[1], xs[2], on - 1);
  const hop = Math.abs(Math.sin(Math.PI * (on % 1))) * 40;
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={6} />} actors={
      <Sheet frame={frame} at={k.climb - 6} x={960} y={540} w={W} h={H} tilt={1}>
        {["4", "3", "2"].map((n, i) => {
          const s = thump(frame, steps[i]);
          if (frame < steps[i]) return null;
          const pulse = i === 0 ? 1 + 0.12 * swell(frame, k.fourth2, 12) : 1;
          return (
            <g key={n} transform={`translate(${xs[i]} 470) scale(${mix(1.5, 1, Math.min(1, s)) * pulse})`} opacity={Math.min(1, s * 1.5)}>
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={300} fill={i === 2 ? TEAL : INK}
                stroke={INK} strokeWidth={i === 2 ? 6 : 0} paintOrder="stroke">{n}</text>
            </g>
          );
        })}
        {/* the arrows between them, and the strokes through the places you leave */}
        <DrawLine d={`M${xs[0] + 90} 380 l70 0 m-24 -22 l24 22 l-24 22`} from={k.third} to={k.third + 8} color={INK} width={8} />
        <DrawLine d={`M${xs[1] + 90} 380 l70 0 m-24 -22 l24 22 l-24 22`} from={k.second} to={k.second + 8} color={INK} width={8} />
        <DrawLine d={`M${xs[0] - 90} 440 L${xs[0] + 90} 270`} from={k.third + 2} to={k.third + 10} color={CRIMSON} width={14} />
        <DrawLine d={`M${xs[1] - 90} 440 L${xs[1] + 90} 270`} from={k.second + 2} to={k.second + 10} color={CRIMSON} width={14} />
        <DrawLine d={`M${xs[2]} 210 C${xs[2] + 150} 210 ${xs[2] + 150} 520 ${xs[2]} 520 C${xs[2] - 150} 520 ${xs[2] - 150} 210 ${xs[2] + 20} 214`}
          from={k.second + 8} to={k.second + 22} color={TEAL} width={9} />
        <HeadIcon x={hx} y={120 - hop} r={52} color={HERO.head} tuft mouth="flat" />
      </Sheet>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 67 the phone

/** The people in the group chat (and with the shared folder): an avatar and a name as an ink bar each. Row 1 is the red
 *  classmate (the green head from your bench, -44), row 2 your best friend (-84): the two who go red in the room just
 *  before, and the two you swipe out (outside review of v4.1: each avatar removed matches the red classmate just shown). */
const MEMBERS = [PASTELS[0], PASTELS[2], MINJUN.head, PASTELS[5], PASTELS[3], PASTELS[6], PASTELS[7], PASTELS[1]];
const RED_ROWS: Record<number, number> = { 1: ROUND_ONE.classmate, 2: ROUND_ONE.minjun };

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
            <HeadIcon x={x0 + 46} y={y + 30} r={23} color={c} />
            <rect x={x0 + 86} y={y + 22} width={90 + noise(i + 4) * 70} height={16} rx={8} fill={INK} opacity={0.55} />
            {RED_ROWS[i] !== undefined && (
              <g transform={`translate(${x0 + w - 62} ${y + 30})`}>
                <rect x={-40} y={-17} width={80} height={34} rx={8} fill={CRIMSON} stroke={INK} strokeWidth={3} />
                <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={PAPER}>{RED_ROWS[i]}</text>
              </g>
            )}
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

/** Line 67: "Anyone who goes red: out of the group chat." (your best friend, then the red classmate, swiped out); "No
 *  more past papers from the shared folder." (the folder's list; the same two removed). Your face at the left, set. */
export const PhoneShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const folder = frame >= k.folder;
  const out = [2, 1];
  const from = folder ? k.folder + 6 : k.himFirst - 6;
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

// ------------------------------------------------------------------------------------------------ 53 fresh ammunition

/** "A mock score is true, and there's a new one every week. Fresh ammunition.": mock papers slap down on the desk one a
 *  week, each with its ringed score; on "true" a teal TRUE stamp thumps onto the top one; on "Fresh ammunition" your
 *  mustard hand slides the top paper off the pile like a round into a chamber. */
export const AmmoShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const drops = [0, 9, 18, 27, 36, 45].map((d) => k.ammo + 2 + d);
  const scores = ["81", "84", "86", "88", "90", "92"];
  const stamp = thump(frame, k.stamp);
  const grab = ramp(frame, k.fresh, k.fresh + 14);
  const cam = drift(camAt(frame, [[k.ammo, insert(960, 540, 1.0)], [k.fresh, insert(960, 560, 1.12)], [k.stand, insert(1040, 560, 1.2)]]), frame, "ammo", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={2} />} actors={
      <g>
        {drops.map((at, i) => {
          if (frame < at) return null;
          const t = thump(frame, at);
          const top = i === drops.length - 1;
          const slide = top ? grab * 520 : 0;
          const x = 960 + (noise(i + 3) - 0.5) * 70 + slide, y = 560 + (noise(i + 9) - 0.5) * 50 - i * 6;
          const rot = (noise(i + 1) - 0.5) * 16;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${mix(1.25, 1, Math.min(1, t))})`}>
              <rect x={-230} y={-300} width={460} height={600} rx={8} fill="#000" opacity={0.22} transform="translate(10 14)" />
              <rect x={-230} y={-300} width={460} height={600} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
              {[0, 1, 2, 3, 4, 5].map((r) => <line key={r} x1={-180} y1={-150 + r * 60} x2={r % 3 === 2 ? 40 : 170} y2={-150 + r * 60} stroke={INK} strokeWidth={8} strokeLinecap="round" opacity={0.35} />)}
              <rect x={-180} y={-250} width={200} height={20} rx={10} fill={INK} opacity={0.6} />
              <circle cx={130} cy={-220} r={60} fill="none" stroke={CRIMSON} strokeWidth={8} />
              <text x={130} y={-198} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill={CRIMSON}>{scores[i]}</text>
            </g>
          );
        })}
        {frame >= k.stamp && (
          <g transform={`translate(${940 + grab * 520} 600) rotate(-14) scale(${mix(1.8, 1, Math.min(1, stamp))})`} opacity={Math.min(1, stamp * 1.5) * 0.92}>
            <rect x={-200} y={-70} width={400} height={140} rx={16} fill="none" stroke={TEAL} strokeWidth={14} />
            <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill={TEAL}>TRUE</text>
          </g>
        )}
        {frame >= k.fresh - 10 && (
          <g transform={`translate(${mix(1900, 1180, ramp(frame, k.fresh - 10, k.fresh)) + grab * 520} 640) rotate(-90)`}>
            <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" transform="scale(1.6)" />
          </g>
        )}
      </g>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 57 the nickname

/** "The group chat has a name for you now.": your phone, the group's header renamed: your avatar, WEATHERMAN and a
 *  cloud; the messages under it fill with little clouds. Your face at the left, flat. */
export const NicknameShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const x0 = 1012, y0 = 240, w = 336;
  const named = ramp(frame, k.nickname + 6, k.nickname + 14);
  const cam = drift(camAt(frame, [[k.nickname, { x: 1080, y: 560, zoom: 1.3 }], [k.tae, { x: 1160, y: 520, zoom: 1.6 }]]), frame, "nick", 2);
  const face = phone.spots.face;
  const msgs = [0, 1, 2, 3, 4].map((i) => k.nickname + 22 + i * 10);
  return (
    <SetShot set={phone} mood={mood} frame={frame} cam={cam} options={{ mode: "off", thumb: null, behind: "desk" }}
      behind={<Figure {...HERO} x={face.x} y={face.y} scale={face.scale} facing={1} brows="flat" lids={0.5} mouth="flat" eyes={1}
        look={{ x: 1, y: 0.35 }} blink={blinking(frame, 1)} time={frame} />}
      actors={
        <g>
          <rect x={x0} y={y0} width={w} height={640} rx={18} fill="#eef1f4" />
          <rect x={x0} y={y0} width={w} height={110} rx={18} fill="#d9dee6" />
          <HeadIcon x={x0 + 52} y={y0 + 56} r={30} color={HERO.head} tuft mouth="flat" />
          <g opacity={named} transform={`translate(${x0 + 94} ${y0 + 70})`}>
            <text x={0} y={0} fontFamily={FONT} fontWeight={800} fontSize={27} fill={INK}>WEATHERMAN</text>
          </g>
          <g transform={`translate(${x0 + 290} ${y0 + 30}) scale(${0.32 * named})`}>
            <path d="M-60 20 Q-84 20 -84 -2 Q-84 -26 -56 -26 Q-52 -56 -18 -56 Q8 -74 34 -50 Q70 -54 72 -20 Q94 -14 88 8 Q84 22 62 20Z" fill="#fff" stroke={INK} strokeWidth={10} />
          </g>
          {msgs.map((at, i) => {
            if (frame < at) return null;
            const left = i % 2 === 0;
            const y = y0 + 150 + i * 92;
            const pop = Math.min(1, thump(frame, at));
            return (
              <g key={i} transform={`translate(${left ? x0 + 24 : x0 + w - 24} ${y}) scale(${pop})`}>
                <rect x={left ? 0 : -190} y={0} width={190} height={70} rx={20} fill={left ? "#ffffff" : "#bfe6d6"} stroke={INK} strokeWidth={3} />
                <g transform={`translate(${left ? 60 : -130} 36) scale(0.28)`}>
                  <path d="M-60 20 Q-84 20 -84 -2 Q-84 -26 -56 -26 Q-52 -56 -18 -56 Q8 -74 34 -50 Q70 -54 72 -20 Q94 -14 88 8 Q84 22 62 20Z" fill="#eef1f4" stroke={INK} strokeWidth={10} />
                </g>
                <rect x={left ? 110 : -70} y={28} width={50} height={14} rx={7} fill={INK} opacity={0.45} />
              </g>
            );
          })}
        </g>
      } />
  );
};
