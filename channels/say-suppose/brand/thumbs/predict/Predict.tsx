// "What If AI Predicted Every Choice You Make?" G1 thumbnails (2026-11-13), drawn with the what-if engine's kit: the
// film's key shot (7:40). A food stall's counter at closing, mood `lamp`: one warm lamp over the counter, the food court
// behind shuttered and dark (shutters, blank stall boards with no lettering, stacked chairs, so K5 counts only the tag
// and the card). You at the left, shocked, hold the cash-box key out across the counter on an open palm; the tin box
// sits between you; your best friend at the right, stunned, his eyes coming up from the key to you (K17, G2 v2), a hand flat on the lid, and over his head a
// crimson split-flap card reads 94%, hung on a thread from the city's small teal lamp. Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { Finish, Stage } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { REF, setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { BOX, CANDIDATES, CARD, CARD_AT, COUNTER_TOP, FRIEND, handAt, HERO, headOf, LEAN, type Candidate, type Tag } from "./data";

const MOOD = "lamp" as const;
const LAMP = { x: 900, y: 330 };
const PEACH = "#f4b393";
const BRASS = "#e8b84a";

const WordTag: React.FC<{ t: Tag }> = ({ t }) => (
  <div style={{
    position: "absolute", top: t.y, right: t.x, transform: `rotate(${t.tilt}deg)`, transformOrigin: "right center",
    background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22, textAlign: "right",
    fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1.02, letterSpacing: 2,
    padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(0,0,0,.45)",
  }}>{t.lines.map((l) => <div key={l}>{l}</div>)}</div>
);

/** One crimson split-flap tile of the card, its lower flap just landed. */
const Tile: React.FC<{ ch: string; x: number; y: number; s: number }> = ({ ch, x, y, s }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill="#000" opacity={0.4} transform={`translate(${s * 0.05} ${s * 0.08})`} />
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill={CRIMSON} stroke={PAPER} strokeWidth={s * 0.045} />
    <line x1={-s * 0.4} y1={0} x2={s * 0.4} y2={0} stroke="#7a1022" strokeWidth={s * 0.035} />
    <text x={0} y={s * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s * 0.82} fill={PAPER}>{ch}</text>
  </g>
);

/** The forecast card: three tiles on a cream stamped card, hung on a thread from the city's teal lamp. */
const Card: React.FC = () => {
  const { x, y, tile } = CARD_AT;
  const chars = CARD.split("");
  const w = tile * 0.86;
  const x0 = x - ((chars.length - 1) * w) / 2;
  const top = y - tile * 0.72;
  return (
    <g>
      {/* the thread up to the lamp, and the lamp itself: a small teal clip-on at the top of the frame */}
      <line x1={x} y1={0} x2={x} y2={top} stroke={PAPER} strokeWidth={4} opacity={0.75} />
      <circle cx={x} cy={top - 4} r={12} fill={TEAL} stroke={PAPER} strokeWidth={4} />
      <rect x={x0 - tile * 0.58} y={top} width={(chars.length - 1) * w + tile * 1.16} height={tile * 1.44} rx={tile * 0.14} fill={PAPER} stroke={INK} strokeWidth={8} />
      {chars.map((ch, i) => <Tile key={i} ch={ch} x={x0 + i * w} y={y} s={tile} />)}
    </g>
  );
};

/** The cash-box key on your palm: a brass bow, a shank and two teeth, catching the lamp. Drawn at 2.3x so it is about
 *  12% of the frame width and reads at feed size (G2 v2, 2026-11-14). */
const Key: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-14) scale(2.3)`}>
    <circle cx={0} cy={0} r={48} fill="#fff6c8" opacity={0.28} />
    <circle cx={-34} cy={-16} r={26} fill={BRASS} stroke={INK} strokeWidth={6} />
    <circle cx={-34} cy={-16} r={10} fill={INK} />
    <rect x={-10} y={-24} width={78} height={16} rx={4} fill={BRASS} stroke={INK} strokeWidth={6} />
    <rect x={44} y={-10} width={12} height={20} fill={BRASS} stroke={INK} strokeWidth={5} />
    <rect x={58} y={-10} width={10} height={14} fill={BRASS} stroke={INK} strokeWidth={5} />
  </g>
);

/** The dark tin cash box with a brass lock, lid shut. */
const CashBox: React.FC = () => {
  const { x, w, h } = BOX;
  const top = COUNTER_TOP - h;
  return (
    <g>
      <rect x={x - w / 2 + 10} y={top + 14} width={w} height={h} rx={10} fill="#000" opacity={0.45} />
      <rect x={x - w / 2} y={top} width={w} height={h} rx={10} fill="#3a4150" stroke={INK} strokeWidth={7} />
      <rect x={x - w / 2} y={top} width={w} height={h * 0.3} rx={10} fill="#4c5568" stroke={INK} strokeWidth={7} />
      <rect x={x - 26} y={top + h * 0.3} width={52} height={50} rx={8} fill={BRASS} stroke={INK} strokeWidth={6} />
      <rect x={x - 5} y={top + h * 0.3 + 14} width={10} height={22} rx={4} fill={INK} />
    </g>
  );
};

const SHUTTER = "#2b3142";
const BOARDS = ["#7a3b46", "#2f5f63", "#6b5a33", "#3d4a78", "#5f3d6b"];

/** The food court behind, closed: stall fronts with their shutters down, dim blank boards, stacked chairs. */
const Court: React.FC = () => (
  <g>
    <rect x={-20} y={-20} width={1960} height={1120} fill="#10121b" />
    {/* the ceiling: unlit tube lights */}
    {[0, 1, 2, 3].map((i) => <rect key={i} x={120 + i * 470} y={128} width={260} height={14} rx={7} fill="#2c3040" />)}
    {[0, 1, 2, 3, 4].map((i) => {
      const x = -60 + i * 420;
      return (
        <g key={i} opacity={0.9}>
          <rect x={x} y={230} width={380} height={70} rx={6} fill={BOARDS[i]} opacity={0.55} stroke={INK} strokeWidth={5} />
          <rect x={x + 30} y={256} width={170} height={16} rx={8} fill={INK} opacity={0.5} />
          <rect x={x} y={310} width={380} height={600} fill={SHUTTER} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 22 }, (_, r) => <line key={r} x1={x + 6} y1={330 + r * 26} x2={x + 374} y2={330 + r * 26} stroke="#3a4156" strokeWidth={6} />)}
          <rect x={x + 160} y={870} width={60} height={14} rx={6} fill="#4a5168" />
        </g>
      );
    })}
    {/* chairs stacked upside down on tables, in silhouette, mid-distance */}
    {[260, 1020].map((cx) => (
      <g key={cx} fill="#1a1d29" stroke="#262a39" strokeWidth={5}>
        <rect x={cx - 120} y={740} width={240} height={18} />
        <rect x={cx - 100} y={758} width={14} height={150} />
        <rect x={cx + 86} y={758} width={14} height={150} />
        <rect x={cx - 90} y={660} width={180} height={14} />
        <rect x={cx - 90} y={600} width={12} height={140} />
        <rect x={cx + 78} y={600} width={12} height={140} />
      </g>
    ))}
    <rect x={-20} y={905} width={1960} height={200} fill="#1b1e29" />
  </g>
);

/** The stall's one lamp over the counter: a warm bulb under a metal shade, a cone of light. */
const Lamp: React.FC = () => (
  <g>
    <line x1={LAMP.x} y1={0} x2={LAMP.x} y2={LAMP.y - 50} stroke="#14161f" strokeWidth={8} />
    <path d={`M${LAMP.x - 520} 1080 L${LAMP.x - 60} ${LAMP.y + 10} L${LAMP.x + 60} ${LAMP.y + 10} L${LAMP.x + 640} 1080Z`} fill="#ffd98a" opacity={0.07} />
    <path d={`M${LAMP.x - 80} ${LAMP.y} L${LAMP.x - 30} ${LAMP.y - 54} L${LAMP.x + 30} ${LAMP.y - 54} L${LAMP.x + 80} ${LAMP.y}Z`} fill="#3b404e" stroke={INK} strokeWidth={6} />
    <circle cx={LAMP.x} cy={LAMP.y + 8} r={22} fill="#fff1c2" />
  </g>
);

/** The counter in front of you both: a wooden top edge and a dark front panel. */
const Counter: React.FC = () => (
  <g>
    <rect x={-20} y={COUNTER_TOP} width={1960} height={200} fill="#5a3b2a" stroke={INK} strokeWidth={8} />
    <rect x={-20} y={COUNTER_TOP} width={1960} height={30} fill="#8a5d3c" stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={i * 360 + 120} y1={COUNTER_TOP + 40} x2={i * 360 + 120} y2={1080} stroke="#3f2a1e" strokeWidth={6} />)}
  </g>
);

/** A pool of shadow behind your head, so the mustard head stands at 3:1 in greyscale (K4). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  return (
    <g>
      <defs>
        <radialGradient id="predict-shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.4" stopColor="#06070b" stopOpacity={0.9} />
          <stop offset="1" stopColor="#06070b" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={head.x} cy={head.y} r={head.r * 1.9} fill="url(#predict-shade)" />
    </g>
  );
};

const Scene: React.FC = () => {
  const hand = handAt(HERO.x, HERO.y, HERO.scale, HERO.pose);
  const back = (
    <g>
      <Court />
      <Lamp />
      <Shade />
    </g>
  );
  const actors = (
    <g>
      <Figure x={FRIEND.x} y={FRIEND.y} scale={FRIEND.scale} facing={-1} pose={LEAN} head={PEACH} coat="#6b4f3a"
        brows="raised" lids={0} mouth="o" eyes={1.25} look={{ x: 0.95, y: -0.2 }} />
      <Card />
      <Counter />
      <CashBox />
      <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.1}
        time={3} brows="raised" lids={0} mouth="o" eyes={1.3} look={HERO.look} />
      <Key x={hand.x + 20} y={hand.y - 30} />
    </g>
  );
  return (
    <LookContext.Provider value={setLook([{ x: LAMP.x, y: LAMP.y + 40, r: 520, color: "#ffcf7a", strength: 0.55, moods: [MOOD] }], MOOD, REF)}>
      <Stage cam={REF} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} />
    </LookContext.Provider>
  );
};

export const Thumb: React.FC<{ c: Candidate }> = ({ c }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Scene />
    <Finish />
    <WordTag t={c.tag} />
  </AbsoluteFill>
);

export const PredictThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
