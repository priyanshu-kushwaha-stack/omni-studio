// The Piano's drawings: the piano teacher's room, the keys insert (real keys or the cardboard ones), the rat on its
// track, the sleeper counting on their fingers, Siffre's cave calendar, and the year of days with her week lost in it.
// Inserts are drawn in screen pixels (inside an Overlay or a Sheet).
import { Figure } from "@whatif/kit/rig/Figure";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { FLATMATE, HERO, linear, mix, noise, ramp } from "../shared";
import { BigHand } from "./TellMeTomorrow.Kit";

// ------------------------------------------------------------------------------------------------ the teacher's room

export const ROOM_FLOOR = 960;
/** Where the keys are (the front of the keybed) and the bench you sit on. */
export const PIANO_AT = { x: 520, y: 690 };
export const BENCH = { x: 720, top: 790 };

/** The piano teacher's room inside: a warm wall, a window on the town (the sky counter blurring in it), an upright
 *  piano at the left with its bench. REF coordinates; goes in a Stage's `back`. */
export const PianoRoom: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-1400} y={-900} width={4700} height={2900} fill="#e6cfa8" />
    <rect x={-1400} y={700} width={4700} height={14} fill="#c9ad84" />
    <rect x={1240} y={170} width={420} height={360} rx={10} fill="#8fb6d8" stroke={INK} strokeWidth={8} />
    <rect x={1310} y={230} width={130} height={70} rx={8} fill={INK} />
    {[0, 1, 2].map((k) => <rect key={k} x={1316 + k * 42} y={236} width={36} height={58} rx={4} fill={CRIMSON} opacity={0.6 + noise(frame + k) * 0.4} />)}
    <line x1={1450} y1={170} x2={1450} y2={530} stroke={INK} strokeWidth={6} />
    <line x1={1240} y1={350} x2={1660} y2={350} stroke={INK} strokeWidth={6} />
    <rect x={-1400} y={ROOM_FLOOR - 40} width={4700} height={900} fill="#9a6f4c" />
    {/* the upright piano, side on: its tall case at the left, the keybed reaching right, a bench in front */}
    <rect x={PIANO_AT.x - 200} y={420} width={170} height={ROOM_FLOOR - 40 - 420} rx={10} fill="#2b2230" stroke={INK} strokeWidth={8} />
    <rect x={PIANO_AT.x - 40} y={PIANO_AT.y - 6} width={130} height={46} rx={6} fill="#3a2f40" stroke={INK} strokeWidth={6} />
    <rect x={PIANO_AT.x - 36} y={PIANO_AT.y - 16} width={120} height={14} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />
    <rect x={PIANO_AT.x - 30} y={PIANO_AT.y + 40} width={22} height={ROOM_FLOOR - 40 - PIANO_AT.y - 40} fill="#2b2230" stroke={INK} strokeWidth={5} />
    <rect x={PIANO_AT.x - 190} y={380} width={150} height={46} rx={8} fill="#3a2f40" stroke={INK} strokeWidth={6} />
    <rect x={PIANO_AT.x - 150} y={350} width={80} height={36} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
    <rect x={BENCH.x - 80} y={BENCH.top} width={160} height={24} rx={6} fill="#5b3e30" stroke={INK} strokeWidth={5} />
    {[-60, 60].map((dx) => <line key={dx} x1={BENCH.x + dx} y1={BENCH.top + 20} x2={BENCH.x + dx} y2={ROOM_FLOOR - 40} stroke={INK} strokeWidth={9} />)}
  </g>
);

// ------------------------------------------------------------------------------------------------ the keys insert

/**
 * Hands on keys, filling the frame: the real keys of the teacher's piano, or the cardboard ones in the kitchen (keys
 * drawn in pen). Fingers press in turn at `tempo` frames a note; `wrong` (a frame) sparks one crimson wrong note.
 */
export const KeysInsert: React.FC<{ frame: number; cardboard?: boolean; tempo?: number; wrong?: number | null; sure?: boolean; tapX?: number | null }> = ({
  frame, cardboard, tempo = 8, wrong = null, sure, tapX = null,
}) => {
  const n = 12;
  const kw = 1500 / n;
  const x0 = 210;
  const y0 = 380;
  const note = Math.floor(frame / tempo);
  const left = 3 + (note % 3);
  const right = 7 + ((note * 2) % 4);
  const shake = wrong !== null && frame >= wrong && frame < wrong + 10 ? Math.sin(frame * 3) * 10 : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      <rect width={1920} height={1080} fill={cardboard ? "#8a5a3c" : "#2b2230"} />
      {cardboard && <rect x={0} y={880} width={1920} height={200} fill="#6e4630" />}
      <rect x={x0 - 30} y={y0 - 40} width={1560} height={440} rx={cardboard ? 6 : 14} fill={cardboard ? "#c9a06a" : "#1b161f"} stroke={INK} strokeWidth={8}
        transform={cardboard ? `rotate(-1.5 960 560)` : undefined} />
      {Array.from({ length: n }, (_, i) => {
        const pressed = i === left || i === right;
        return (
          <rect key={i} x={x0 + i * kw} y={y0} width={kw} height={360} fill={cardboard ? (pressed ? "#b88f5c" : "#d9b884") : pressed ? "#e9dcc2" : PAPER}
            stroke={INK} strokeWidth={cardboard ? 5 : 4} strokeDasharray={cardboard ? "18 6" : undefined} />
        );
      })}
      {Array.from({ length: n - 1 }, (_, i) => ([0, 1, 3, 4, 5].includes(i % 7) ? (
        <rect key={i} x={x0 + (i + 1) * kw - 26} y={y0} width={52} height={210} fill={cardboard ? "none" : INK} stroke={INK} strokeWidth={6} />
      ) : null))}
      <BigHand from={{ x: x0 + left * kw - 120, y: 1180 }} x={x0 + left * kw + kw / 2} y={y0 + 260 + (frame % tempo < 3 ? 14 : 0)} r={70} fingers={3} />
      <BigHand from={{ x: x0 + right * kw + 160, y: 1180 }} x={x0 + right * kw + kw / 2} y={y0 + 250 + ((frame + 4) % tempo < 3 ? 14 : 0)} r={70} fingers={3} />
      {tapX !== null && <BigHand from={{ x: 1900, y: 200 }} x={tapX} y={y0 - 80 + (frame % tempo < 3 ? 22 : 0)} r={54} skin={FLATMATE.head} sleeve="#e9e1cf" point />}
      {wrong !== null && frame >= wrong && frame < wrong + 22 && (
        <path d={`M${x0 + left * kw + 40} ${y0 - 10} l40 -90 l20 50 l50 -110 l10 80 l60 -60`} fill="none" stroke={CRIMSON} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round"
          opacity={1 - linear(frame, wrong + 12, wrong + 22)} />
      )}
      {sure && [0, 1, 2].map((k) => (
        <circle key={k} cx={x0 + right * kw + kw / 2} cy={y0 - 40 - ((frame * 4 + k * 40) % 120)} r={10 - k * 2} fill={MUSTARD} opacity={0.8} />
      ))}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the rat

const TRACK = "M200 420 C 200 200, 520 160, 600 300 S 900 520, 1000 300 S 1180 120, 1180 300 S 1000 560, 700 520 S 260 600, 200 420";

/** The rat insert (c10): a rat runs its track at ordinary speed, then sleeps, and over its head the same track is
 *  replayed as a fast streak, lap after lap. */
export const RatSheet: React.FC<{ frame: number; at: number; until: number; replay: number }> = ({ frame, at: from, until, replay }) => {
  const runP = ((frame - from) / 120) % 1;
  const asleep = frame >= replay;
  return (
    <Sheet frame={frame} at={from} until={until} x={960} y={520} w={1400} h={760} tilt={-2}>
      <g transform={asleep ? "translate(300 20) scale(0.55)" : "translate(0 0)"}>
        <path d={TRACK} fill="none" stroke="#c9b48a" strokeWidth={70} strokeLinecap="round" />
        <path d={TRACK} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="20 16" opacity={0.5} />
        {!asleep && <Rat p={runP} />}
        {asleep && <Streak frame={frame} from={replay} />}
      </g>
      {asleep && (
        <g>
          {[0, 1, 2].map((k) => <circle key={k} cx={360 + k * 30} cy={560 - k * 60} r={14 + k * 8} fill={PAPER} stroke={INK} strokeWidth={4} />)}
          <g transform="translate(300 620)">
            <ellipse cx={0} cy={0} rx={110} ry={56} fill="#9a9a9a" stroke={INK} strokeWidth={5} />
            <circle cx={90} cy={-10} r={38} fill="#a8a8a8" stroke={INK} strokeWidth={5} />
            <line x1={92} y1={-12} x2={110} y2={-12} stroke={INK} strokeWidth={4} />
            <path d="M-110 10 Q-180 40 -150 -30" fill="none" stroke="#e6a0a0" strokeWidth={8} strokeLinecap="round" />
          </g>
        </g>
      )}
    </Sheet>
  );
};

/** A point along the rat's track at p (0..1), approximated by sampling the path element. */
function trackPoint(p: number) {
  // a smooth loop through the track's corners, close enough for a drawing
  const pts = [[200, 420], [330, 200], [600, 300], [800, 470], [1000, 300], [1180, 180], [1180, 300], [1000, 520], [700, 520], [360, 560], [200, 420]];
  const t = p * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(t));
  const f = t - i;
  return { x: mix(pts[i][0], pts[i + 1][0], f), y: mix(pts[i][1], pts[i + 1][1], f) };
}

const Rat: React.FC<{ p: number }> = ({ p }) => {
  const a = trackPoint(p), b = trackPoint(Math.min(1, p + 0.01));
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return (
    <g transform={`translate(${a.x} ${a.y}) rotate(${ang})`}>
      <ellipse cx={0} cy={0} rx={46} ry={26} fill="#9a9a9a" stroke={INK} strokeWidth={4} />
      <circle cx={42} cy={-4} r={18} fill="#a8a8a8" stroke={INK} strokeWidth={4} />
      <circle cx={50} cy={-8} r={4} fill={INK} />
      <path d="M-46 0 Q-80 20 -96 -6" fill="none" stroke="#e6a0a0" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

/** The replay: a bright streak running the track six or seven times faster than the rat did. */
const Streak: React.FC<{ frame: number; from: number }> = ({ frame, from }) => (
  <g>
    {Array.from({ length: 8 }, (_, k) => {
      const p = (((frame - from) * 6.5) / 120 - k * 0.012 + 10) % 1;
      const q = trackPoint(p);
      return <circle key={k} cx={q.x} cy={q.y} r={30 - k * 3} fill={MUSTARD} opacity={1 - k * 0.11} />;
    })}
  </g>
);

// ------------------------------------------------------------------------------------------------ counting to ten

/** A lucid dreamer counting to ten on their fingers at ordinary speed: a sleeper lying, a big hand raising fingers. */
export const CountingSleeper: React.FC<{ frame: number; at: number }> = ({ frame, at: from }) => {
  const count = Math.min(10, Math.max(0, Math.floor((frame - from) / 14) + 1));
  return (
    <g>
      <rect width={1920} height={1080} fill="#252a44" />
      <rect x={0} y={760} width={1920} height={320} fill="#39406a" />
      <path d="M180 770 Q190 690 320 690 L480 698 Q540 708 530 760Z" fill="#cfd3e6" stroke={INK} strokeWidth={6} />
      <Figure x={620} y={732 + 112 * 1.5} scale={1.5} rotate={-90} pose={{ lean: 0, tilt: 0, armF: [150, 30], armB: [10, 10], legB: [-3, 0], legF: [4, -2], drop: 0 }}
        head="#7fc29b" coat="#5a6390" lids={1} mouth="smile" brows="raised" />
      <BigHand from={{ x: 1250, y: 1150 }} x={1250} y={560} r={80} skin="#7fc29b" fingers={Math.min(5, count)} />
      {count > 5 && <BigHand from={{ x: 1600, y: 1150 }} x={1600} y={600} r={80} skin="#7fc29b" fingers={count - 5} />}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the cave and the year

/** Siffre's cave (c16): a cave arch, a man with a lamp, a paper calendar on the rock with no numbers; two days stamped
 *  and the strip between them torn out, 25 in the gap when the narration says it. */
export const CaveSheet: React.FC<{ frame: number; at: number; until: number; stamp: number; tear: number; say25: number }> = ({ frame, at: from, until, stamp, tear, say25 }) => {
  const torn = ramp(frame, tear, tear + 16);
  return (
    <Sheet frame={frame} at={from} until={until} x={960} y={530} w={1460} h={780} tilt={-1}>
      <path d="M60 760 L60 380 Q60 60 730 60 Q1400 60 1400 380 L1400 760Z" fill="#3a3530" stroke={INK} strokeWidth={8} />
      <circle cx={360} cy={470} r={210} fill="#ffd98a" opacity={0.25} />
      <Figure x={360} y={720} scale={1.4} facing={1} pose={{ lean: 6, tilt: 0, armF: [100, 30], armB: [10, 20], legB: [-5, -2], legF: [6, -3], drop: 0 }}
        head="#7fa0c4" coat="#5a4a3a" lids={0.3} mouth="flat" look={{ x: 0.9, y: -0.3 }}
        held={<g><line x1={0} y1={0} x2={0} y2={-30} stroke={INK} strokeWidth={4} /><circle cx={0} cy={-44} r={18} fill="#ffd98a" stroke={INK} strokeWidth={4} /></g>} />
      <g transform="translate(620 170)">
        <rect width={660} height={480} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
        <rect width={660} height={60} rx={8} fill="#b9a68c" />
        {Array.from({ length: 35 }, (_, i) => {
          const c = i % 7, r = Math.floor(i / 7);
          const gone = torn > 0 && i > 8 && i < 34;
          return gone ? null : <rect key={i} x={20 + c * 90} y={78 + r * 78} width={80} height={68} rx={4} fill="none" stroke="#b9a68c" strokeWidth={4} />;
        })}
        {torn > 0 && (
          <g opacity={torn}>
            <path d="M20 156 L640 156 L640 392 L20 392Z" fill="#2a2622" />
            <path d="M20 156 l30 12 l30 -10 l30 14 l30 -12 l30 10 l30 -14 l30 12 l30 -10 l30 14 l30 -12 l30 10 l30 -14 l30 12 l30 -10 l30 14 l30 -12 l30 10 l30 -14 l30 12 l20 -6"
              fill="none" stroke={PAPER} strokeWidth={6} />
          </g>
        )}
        {frame >= stamp && <circle cx={20 + 1 * 90 + 40} cy={78 + 1 * 78 + 34} r={36 * Math.min(1, ramp(frame, stamp, stamp + 6) * 1.3)} fill="none" stroke={CRIMSON} strokeWidth={9} />}
        {frame >= stamp + 10 && <circle cx={20 + 6 * 90 + 40} cy={78 + 4 * 78 + 34} r={36 * Math.min(1, ramp(frame, stamp + 10, stamp + 16) * 1.3)} fill="none" stroke={CRIMSON} strokeWidth={9} />}
        {frame >= say25 && <text x={330} y={310} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={130} fill={MUSTARD}
          opacity={ramp(frame, say25, say25 + 8)}>25</text>}
      </g>
    </Sheet>
  );
};

/** A year of days as small paper cells; her week (seven lilac cells, one row, at the very start) fades into the rest
 *  as `lost` goes 0..1, and your finger wanders over the grid looking for it. */
export const YearGrid: React.FC<{ frame: number; at: number; until: number; fill: number; lost: number }> = ({ frame, at: from, until, fill, lost }) => {
  const cols = 25, cw = 46, ch = 36;
  const shown = Math.round(365 * ramp(frame, fill, fill + 50));
  const fx = 400 + Math.sin((frame - from) / 14) * 330 + Math.sin((frame - from) / 5) * 40;
  const fy = 400 + Math.cos((frame - from) / 19) * 160;
  return (
    <Sheet frame={frame} at={from} until={until} x={960} y={540} w={1340} h={760} tilt={1}>
      {Array.from({ length: 365 }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const week = i < 7;
        const on = i >= 365 - shown;
        return (
          <rect key={i} x={100 + c * cw} y={110 + r * ch} width={cw - 8} height={ch - 8} rx={4}
            fill={week ? (lost > 0 ? mix01("#c9b4ec", "#e9dcc2", lost) : "#c9b4ec") : on ? (i > 357 ? MUSTARD : "#e9dcc2") : "none"}
            stroke={week && lost < 0.5 ? INK : "#cdbfa6"} strokeWidth={week && lost < 0.5 ? 4 : 2} />
        );
      })}
      {lost > 0 && <BigHand from={{ x: fx + 300, y: 900 }} x={fx} y={fy} r={30} skin={HERO.head} point />}
    </Sheet>
  );
};

/** Two colours mixed, t 0..1 (hex #rrggbb). */
function mix01(a: string, b: string, t: number) {
  const p = (s: string, k: number) => parseInt(s.slice(1 + k * 2, 3 + k * 2), 16);
  const c = [0, 1, 2].map((k) => Math.round(mix(p(a, k), p(b, k), t)).toString(16).padStart(2, "0"));
  return `#${c.join("")}`;
}
