// "What If You Fired Everyone and Hired AI?" G1 thumbnails (2026-11-15), drawn with the what-if engine's kit: your
// diner across the road from the car plant, late. Through the long window the plant's lit sheds and its chimney;
// behind the counter four robot cooks, each with a burger flipped high off its spatula; along the front counter a pile
// of plated burgers nobody is eating and a row of empty stools. You, large at the left, a fan of cash in your raised
// hand, stunned. Drawn in screen space (1920x1080), no set from the library. Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { Finish } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { BACK_COUNTER, CANDIDATES, FRONT_COUNTER, HERO, headOf, ROBOTS, type Candidate, type Tag } from "./data";

const STEEL = "#9fb0bd";
const STEEL_DARK = "#5f6f7c";
const GLOW = "#8fe9ff";

const WordTag: React.FC<{ t: Tag }> = ({ t }) => (
  <div style={{
    position: "absolute", top: t.y, right: t.x, transform: `rotate(${t.tilt}deg)`, transformOrigin: "right center",
    background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22, textAlign: "right",
    fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1.02, letterSpacing: 2,
    padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(0,0,0,.45)",
  }}>{t.lines.map((l) => <div key={l}>{l}</div>)}</div>
);

/** The wall, the long window onto the night street and the car plant across it, and the checker floor strip. */
const Room: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill="#132026" />
    {/* the window */}
    <rect x={640} y={70} width={1320} height={420} fill="#0b1226" stroke="#2b3a44" strokeWidth={18} />
    <rect x={640} y={330} width={1320} height={160} fill="#151d33" />
    {/* the plant: long sheds with lit window bands, a chimney */}
    <g>
      <path d="M660 330 L660 250 L760 210 L860 250 L960 210 L1060 250 L1160 210 L1260 250 L1360 210 L1460 250 L1560 210 L1660 250 L1760 210 L1860 250 L1950 230 L1950 330 Z" fill="#1d2840" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={690 + i * 104} y={272} width={70} height={18} rx={3} fill="#f6c768" opacity={0.75} />
      ))}
      <rect x={1520} y={110} width={46} height={150} fill="#1d2840" />
      <path d="M1543 108 C1520 80 1580 60 1550 30" fill="none" stroke="#3a4766" strokeWidth={22} strokeLinecap="round" opacity={0.8} />
    </g>
    {[980, 1310, 1640].map((x) => <rect key={x} x={x - 9} y={70} width={18} height={420} fill="#2b3a44" />)}
    {/* the hood over the grill line */}
    <path d={`M760 ${BACK_COUNTER - 300} L1880 ${BACK_COUNTER - 300} L1840 ${BACK_COUNTER - 250} L800 ${BACK_COUNTER - 250} Z`} fill={STEEL_DARK} stroke={INK} strokeWidth={6} opacity={0} />
    {/* the back counter (the grill line) */}
    <rect x={720} y={BACK_COUNTER} width={1200} height={220} fill="#26343c" />
    <rect x={720} y={BACK_COUNTER - 14} width={1200} height={22} fill={STEEL} stroke={INK} strokeWidth={5} />
    <rect x={800} y={BACK_COUNTER - 30} width={1040} height={18} rx={4} fill="#2a2d33" />
  </g>
);

/** A burger, centred, `s` its scale. */
const Burger: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-46 -6 Q-46 -46 0 -48 Q46 -46 46 -6 Z" fill="#e0a046" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[-22, -4, 16].map((dx, i) => <ellipse key={i} cx={dx} cy={-30 + (i % 2) * 6} rx={4} ry={2.4} fill={PAPER} />)}
    <path d="M-50 -4 Q-30 6 -12 -2 Q8 8 26 -2 Q40 6 50 -4 L50 4 L-50 4 Z" fill="#6fbf5a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-48} y={2} width={96} height={16} rx={7} fill="#5a3322" stroke={INK} strokeWidth={5} />
    <path d="M-46 18 L46 18 Q44 36 0 36 Q-44 36 -46 18 Z" fill="#d9963e" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

/** A robot cook: a steel body behind the counter, a screen head with two glowing eyes, a spatula raised, its burger
 *  flipped high above. */
const Robot: React.FC<{ x: number; i: number }> = ({ x, i }) => {
  const top = BACK_COUNTER - 235;
  const lift = [0, 24, 8, 30][i];
  return (
    <g>
      <rect x={x - 62} y={top + 92} width={124} height={170} rx={22} fill={STEEL} stroke={INK} strokeWidth={6} />
      <rect x={x - 34} y={top + 128} width={68} height={40} rx={8} fill={STEEL_DARK} />
      <circle cx={x} cy={top + 148} r={9} fill={GLOW} />
      <rect x={x - 10} y={top + 72} width={20} height={24} fill={STEEL_DARK} stroke={INK} strokeWidth={4} />
      <rect x={x - 66} y={top - 26} width={132} height={102} rx={26} fill={STEEL} stroke={INK} strokeWidth={6} />
      <rect x={x - 50} y={top - 12} width={100} height={74} rx={16} fill="#18252e" />
      <path d={`M${x - 30} ${top + 30} q10 -14 20 0 M${x + 10} ${top + 30} q10 -14 20 0`} fill="none" stroke={GLOW} strokeWidth={7} strokeLinecap="round" />
      <line x1={x} y1={top - 26} x2={x} y2={top - 52} stroke={INK} strokeWidth={5} />
      <circle cx={x} cy={top - 56} r={9} fill={MUSTARD} stroke={INK} strokeWidth={4} />
      {/* the arm with the spatula, raised */}
      <path d={`M${x + 56} ${top + 120} L${x + 100} ${top + 60} L${x + 112} ${top - 10}`} fill="none" stroke={STEEL_DARK} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={x + 92} y={top - 52} width={44} height={14} rx={3} fill="#c9d3da" stroke={INK} strokeWidth={4} transform={`rotate(-18 ${x + 114} ${top - 45})`} />
      <Burger x={x + 100} y={top - 108 - lift} s={0.8} rot={[-24, 18, -8, 30][i]} />
      <path d={`M${x + 112} ${top - 58} q-4 -10 -6 -${18 + lift / 2}`} fill="none" stroke={PAPER} strokeWidth={4} strokeDasharray="6 10" opacity={0.5} />
    </g>
  );
};

/** The front counter across the bottom: chrome edge, a pile of plated burgers, and the empty stools before it. */
const FrontCounter: React.FC = () => (
  <g>
    <rect x={0} y={FRONT_COUNTER} width={1920} height={60} fill="#e6ecef" stroke={INK} strokeWidth={6} />
    <rect x={0} y={FRONT_COUNTER + 60} width={1920} height={120} fill="#1a6f68" />
    {Array.from({ length: 24 }, (_, i) => <rect key={i} x={i * 84} y={FRONT_COUNTER + 60} width={8} height={120} fill="#155a54" />)}
    {/* plates of burgers nobody is eating, piling up */}
    {[[880, 0], [1010, 0], [945, -46], [1140, 0], [1270, 0], [1205, -46], [1400, 0], [1530, 0], [1465, -46], [1660, 0], [1790, 0], [1725, -46], [1335, -92]].map(([x, dy], i) => (
      <g key={i}>
        <ellipse cx={x} cy={FRONT_COUNTER + 2 + dy} rx={62} ry={12} fill={PAPER} stroke={INK} strokeWidth={4} />
        <Burger x={x} y={FRONT_COUNTER - 30 + dy} s={0.72} />
      </g>
    ))}
    {/* the empty stools */}
    {[800, 1030, 1260, 1490].map((x) => (
      <g key={x}>
        <rect x={x - 8} y={FRONT_COUNTER + 120} width={16} height={60} fill={STEEL} />
        <ellipse cx={x} cy={FRONT_COUNTER + 112} rx={78} ry={22} fill="#26343c" stroke={INK} strokeWidth={5} />
        <ellipse cx={x} cy={FRONT_COUNTER + 104} rx={78} ry={20} fill={TEAL} stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);

/** A dark pool behind your head, so you stand at 3:1 against the room (K4). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  return (
    <g>
      <defs>
        <radialGradient id="trap-shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.45" stopColor="#05080b" stopOpacity={0.9} />
          <stop offset="1" stopColor="#05080b" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="trap-grill" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb45a" stopOpacity={0.32} />
          <stop offset="1" stopColor="#ffb45a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={1300} cy={BACK_COUNTER - 120} rx={720} ry={320} fill="url(#trap-grill)" />
      <circle cx={head.x} cy={head.y} r={head.r * 2.1} fill="url(#trap-shade)" />
    </g>
  );
};

/** A fan of cash in your raised hand. */
const Cash: React.FC = () => (
  <g transform="scale(0.25)">
    {[-28, -10, 8, 26].map((r, i) => (
      <g key={i} transform={`rotate(${r - 20})`}>
        <rect x={-30} y={-150} width={64} height={136} rx={6} fill={i % 2 ? "#8fcf8a" : "#7cc276"} stroke={INK} strokeWidth={6} />
        <circle cx={2} cy={-82} r={16} fill="none" stroke="#3f7d42" strokeWidth={5} />
      </g>
    ))}
  </g>
);

const Scene: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: "absolute" }}>
    <Room />
    <Shade />
    {ROBOTS.map((x, i) => <Robot key={x} x={x} i={i} />)}
    <FrontCounter />
    <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.15}
      time={3} brows="raised" lids={0} mouth="open" eyes={1.3} look={HERO.look} coat="#f3e9d7" held={<Cash />} />
  </svg>
);

export const Thumb: React.FC<{ c: Candidate }> = ({ c }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Scene />
    <Finish />
    <WordTag t={c.tag} />
  </AbsoluteFill>
);

export const TrapThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
