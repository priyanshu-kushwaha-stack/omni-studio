// "What If AI Rented Your Brain While You Slept?" G1 thumbnails (2026-11-13), drawn with the what-if engine's kit: your
// bedroom after midnight. The library's bedroom (`bedroom.Back`: the wall, the window with its red curtains, the night
// outside) behind; the bed, you, the band, the second you at its desk, the coins and the jar are drawn here in screen
// space. You lie asleep at the left, smiling, the thin band on; out of the band a pale second you sits bolt upright at a
// little floating desk, wide awake, working; the night's pay drops from its desk into the jar on your bedside table.
// One crimson arrow to the second you (K8). Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { bedroom } from "@whatif/kit/sets";
import { Chair, setLook } from "@whatif/kit/sets/common";
import { Laptop } from "@whatif/kit/sets/props";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { CANDIDATES, DESK, GHOST, HEAD, JAR, SLEEPER, type Candidate, type Tag } from "./data";

const CAM: Camera = { x: 870, y: 690, zoom: 2 };
const MOOD = "night" as const;
const ROOM = { ...bedroom.defaults, lamp: false, hour: 3, curtains: 0.25, phoneLit: false };
const GHOST_HEAD = "#c9f3f6";
const BAND_LIGHT = "#7ff0e6";

/** The sleeper's tilt on the pillow: lying back, the head propped a little. */
const LIE = -72;

/** A point given in the sleeper's own head frame (rig units, head at 0,0), on screen. */
function onSleeper(x: number, y: number) {
  const a = (LIE * Math.PI) / 180;
  const s = SLEEPER.scale;
  return { x: HEAD.x + (x * Math.cos(a) - y * Math.sin(a)) * s, y: HEAD.y + (x * Math.sin(a) + y * Math.cos(a)) * s };
}

/** Screen-space group inside the Stage's camera: actors here are authored in 1920x1080 pixels. */
const OnScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g transform={`translate(${CAM.x} ${CAM.y}) scale(${1 / CAM.zoom}) translate(-960 -540)`}>{children}</g>
);

const WordTag: React.FC<{ t: Tag }> = ({ t }) => (
  <div style={{
    position: "absolute", top: t.y, right: t.x, transform: `rotate(${t.tilt}deg)`, transformOrigin: "right center",
    background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22, textAlign: "right",
    fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1.02, letterSpacing: 2,
    padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(0,0,0,.45)",
  }}>{t.lines.map((l) => <div key={l}>{l}</div>)}</div>
);

/** The bed: headboard, frame, mattress and a dark pillow (a pale one would sink the mustard head, K4). */
const Bed: React.FC = () => (
  <g>
    <rect x={250} y={470} width={60} height={640} rx={18} fill="#4a3022" stroke={INK} strokeWidth={6} />
    <rect x={290} y={850} width={1500} height={90} rx={20} fill="#e9dcc4" stroke={INK} strokeWidth={6} />
    <rect x={280} y={930} width={1520} height={200} fill="#5a3a28" stroke={INK} strokeWidth={6} />
    <ellipse cx={420} cy={800} rx={210} ry={95} fill="#262c45" stroke={INK} strokeWidth={6} />
  </g>
);

/** The blanket over you, from the shoulders to the feet, with two folds. */
const Blanket: React.FC = () => (
  <g>
    <path d="M560 860 C580 760 640 690 760 680 C900 668 960 720 1080 740 C1260 770 1420 770 1560 800 C1620 815 1640 840 1640 870 L1640 900 L560 900 Z"
      fill="#3e5c8f" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M900 690 Q960 790 930 890" fill="none" stroke={INK} strokeWidth={5} opacity={0.4} />
    <path d="M1300 772 Q1350 830 1320 890" fill="none" stroke={INK} strokeWidth={5} opacity={0.4} />
    <path d="M590 800 C620 730 680 700 770 698 C840 696 880 712 920 730" fill="none" stroke="#e9dcc4" strokeWidth={24} strokeLinecap="round" />
  </g>
);

/** You, asleep and smiling, the rig's own figure laid back on the pillow, with the thin band across the forehead. Only
 *  the head and shoulders show; the blanket covers the rest. */
const Sleeper: React.FC = () => (
  <g>
    <defs>
      <clipPath id="rent-sleeper"><circle cx={HEAD.x + 60} cy={HEAD.y + 40} r={HEAD.r * 1.75} /></clipPath>
    </defs>
    <g clipPath="url(#rent-sleeper)">
      <g transform={`translate(${HEAD.x} ${HEAD.y}) rotate(${LIE}) scale(${SLEEPER.scale})`}>
        <Figure x={0} y={264} pose={STAND} head={MUSTARD} scarf={TEAL} tuft blink mouth="smile" />
        <path d="M-40 -24 Q2 -34 44 -22" fill="none" stroke="#1b1d24" strokeWidth={9} strokeLinecap="round" />
        <circle cx={30} cy={-27} r={8} fill={BAND_LIGHT} stroke="#1b1d24" strokeWidth={3} />
      </g>
    </g>
  </g>
);

/** The room after midnight: the set's wall taken down toward the dark, so the second you's glow carries the frame. */
const Night: React.FC = () => <rect x={-40} y={-40} width={2000} height={1160} fill="#0b1024" opacity={0.42} />;

/** A pool of shadow on the set behind your head, so the mustard head stands at 3:1 in greyscale (K4). */
const Shade: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="rent-shade" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.45" stopColor="#07080d" stopOpacity={0.92} />
        <stop offset="1" stopColor="#07080d" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r * 1.9} fill="url(#rent-shade)" />
  </g>
);

/** Bolt upright, both hands on the keys. */
const TYPING: Pose = { ...SEATED, lean: 4, tilt: 4, armF: [64, 44], armB: [56, 48] };

/** The second you: wide awake, working, glowing, sitting on a paper chair that floats over the bed. */
const Ghost: React.FC = () => {
  const s = GHOST.scale;
  const hip = { x: GHOST.x, y: GHOST.y - 112 * s };
  return (
    <g>
      <defs>
        <filter id="ghost-aura" x="-50%" y="-50%" width="200%" height="200%">
          <feColorMatrix type="matrix" values="0 0 0 0 0.78  0 0 0 0 0.96  0 0 0 0 0.97  0 0 0 1 0" />
          <feMorphology operator="dilate" radius={10} />
          <feGaussianBlur stdDeviation={18} />
        </filter>
      </defs>
      <g filter="url(#ghost-aura)" opacity={0.55}>
        <Figure x={GHOST.x} y={GHOST.y} scale={s} pose={TYPING} head={GHOST_HEAD} />
      </g>
      <Chair x={GHOST.x} y={hip.y} scale={1.25} facing={1} color="#9fd9dc" />
      <g opacity={0.92}>
        <Figure x={GHOST.x} y={GHOST.y} scale={s} pose={TYPING} head={GHOST_HEAD} scarf="#9fd9dc" tuft
          eyes={1.3} brows="worry" mouth="o" look={{ x: 0.9, y: 0.35 }} />
      </g>
    </g>
  );
};

/** The little desk the second you works at, floating, with a lit laptop. */
const WorkDesk: React.FC = () => (
  <g>
    <circle cx={DESK.x + DESK.w * 0.55} cy={DESK.y - 90} r={170} fill="#cfefff" opacity={0.16} />
    <rect x={DESK.x} y={DESK.y} width={DESK.w} height={22} rx={6} fill="#9fd9dc" stroke={INK} strokeWidth={6} />
    <rect x={DESK.x + 20} y={DESK.y + 22} width={14} height={90} fill="#9fd9dc" stroke={INK} strokeWidth={4} />
    <rect x={DESK.x + DESK.w - 34} y={DESK.y + 22} width={14} height={90} fill="#9fd9dc" stroke={INK} strokeWidth={4} />
    <Laptop x={DESK.x + DESK.w * 0.6} y={DESK.y} scale={1.05} screen="code" facing={-1} />
  </g>
);

/** The thread from the band's light to the second you. */
const Wisp: React.FC = () => {
  const a = onSleeper(30, -27);
  const b = { x: GHOST.x - 30, y: GHOST.y - 230 };
  return (
    <g>
      <path d={`M${a.x} ${a.y} C${a.x + 40} ${a.y - 220} ${b.x - 260} ${b.y - 60} ${b.x} ${b.y}`} fill="none" stroke={BAND_LIGHT} strokeWidth={26} opacity={0.18} strokeLinecap="round" />
      <path d={`M${a.x} ${a.y} C${a.x + 40} ${a.y - 220} ${b.x - 260} ${b.y - 60} ${b.x} ${b.y}`} fill="none" stroke={BAND_LIGHT} strokeWidth={7} opacity={0.8} strokeLinecap="round" strokeDasharray="2 16" />
    </g>
  );
};

/** One coin, a little tilted. */
const Coin: React.FC<{ x: number; y: number; r: number; tilt: number }> = ({ x, y, r, tilt }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <ellipse rx={r} ry={r * 0.92} fill="#ffd36b" stroke={INK} strokeWidth={4} />
    <ellipse rx={r * 0.55} ry={r * 0.5} fill="none" stroke="#c98f1f" strokeWidth={3} />
  </g>
);

/** The night's pay: coins dropping from the desk's edge in an arc down into the jar. */
const Coins: React.FC = () => {
  const p0 = { x: DESK.x + 10, y: DESK.y + 10 };
  const p1 = { x: 520, y: 330 };
  const p2 = { x: JAR.x + 10, y: JAR.y - JAR.h - 10 };
  const at = (t: number) => ({
    x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
    y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
  });
  return <g>{[0.08, 0.22, 0.37, 0.52, 0.66, 0.8, 0.93].map((t, i) => {
    const p = at(t);
    return <Coin key={t} x={p.x} y={p.y} r={22 + i * 1.5} tilt={i * 37} />;
  })}</g>;
};

/** The bedside table, and on it the jar, already half full. */
const Bedside: React.FC = () => {
  const { x, y, w, h } = JAR;
  return (
    <g>
      <rect x={20} y={y} width={220} height={400} rx={10} fill="#5f3e2b" stroke={INK} strokeWidth={6} />
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={22} fill="#cfe9f4" opacity={0.18} />
      <rect x={x - w / 2 + 6} y={y - h * 0.58} width={w - 12} height={h * 0.58 - 6} rx={16} fill="#f2b632" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <ellipse key={i} cx={x - 48 + (i % 4) * 32 + (i > 3 ? 16 : 0)} cy={y - h * 0.58 + 6 + (i > 3 ? 34 : 0)} rx={24} ry={10} fill="#ffd36b" stroke={INK} strokeWidth={3} />
      ))}
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={22} fill="none" stroke={PAPER} strokeWidth={6} />
      <path d={`M${x - w / 2 + 18} ${y - h + 24} V${y - 30}`} stroke="#ffffff" strokeWidth={8} opacity={0.35} strokeLinecap="round" />
      <rect x={x - w / 2 - 8} y={y - h - 18} width={w + 16} height={24} rx={8} fill="#8a96a8" stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** One crimson arrow, pointing at the second you (K8). */
const Arrow: React.FC = () => {
  const tip = { x: GHOST.x - 105, y: GHOST.y - 420 };
  return (
    <g transform={`translate(${tip.x} ${tip.y}) rotate(200) scale(1.25)`}>
      <path d="M0 0 L60 -34 L50 -12 L170 -16 L172 16 L50 12 L60 34 Z" fill={CRIMSON} stroke={PAPER} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

const Scene: React.FC = () => {
  const props = { cam: CAM, mood: MOOD, frame: 40, options: ROOM };
  const actors = (
    <OnScreen>
      <Night />
      <Bedside />
      <Bed />
      <Shade />
      <Sleeper />
      <Blanket />
      <Wisp />
      <WorkDesk />
      <Ghost />
      <Coins />
      <Arrow />
    </OnScreen>
  );
  const glow = { x: DESK.x + DESK.w * 0.55, y: DESK.y - 100, r: 420, color: "#bfe8ff", strength: 0.5 };
  return (
    <LookContext.Provider value={setLook([...bedroom.lights(ROOM)], MOOD, CAM, { glows: [glow] })}>
      <Stage cam={CAM} radius={0} origin={{ x: 960, y: 540 }} back={bedroom.Back(props)} actors={actors} />
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

export const RentThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
