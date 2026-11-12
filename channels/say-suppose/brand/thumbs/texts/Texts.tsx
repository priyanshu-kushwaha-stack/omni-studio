// "What If You Saw Who Uses AI to Text You?" G1 thumbnails (2026-11-13), drawn with the what-if engine's kit: your
// birthday, the kitchen before six, the lamp on. The library's kitchen (`kitchen.Back`, mood `night`: the window dark)
// far behind, a dark pool behind your head; you at the left hold your phone up at chest height and look down at it:
// four long warm bubbles (your best friend's pink first), each with a small crimson dot, and at the bottom one short
// grey-blue bubble with none. Behind you on the table, the cake, one candle just blown out, smoke curling up.
// Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { kitchen } from "@whatif/kit/sets";
import { setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { CAKE, CANDIDATES, HERO, headOf, PHONE, type Candidate, type Tag } from "./data";

const CAM: Camera = { x: 980, y: 560, zoom: 1.6 };
const MOOD = "night" as const;
const KITCHEN = { ...kitchen.defaults, stove: "kettle" as const, steam: 0, counter: ["mug" as const] };

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

/** A dark wall pool and the kitchen's dimness, so the frame reads dark (K9) and the head stands at 3:1 (K4). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  return (
    <g>
      <defs>
        <radialGradient id="texts-shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.45" stopColor="#07080d" stopOpacity={0.92} />
          <stop offset="1" stopColor="#07080d" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="texts-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf8a" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffcf8a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-40} y={-40} width={2000} height={1160} fill="#0b0c14" opacity={0.55} />
      <circle cx={head.x} cy={head.y} r={head.r * 2.1} fill="url(#texts-shade)" />
      <ellipse cx={CAKE.x} cy={CAKE.y - 140} rx={420} ry={300} fill="url(#texts-lamp)" />
    </g>
  );
};

/** The table edge behind you and the cake on it: one candle, just out, a thread of smoke toward the phone. */
const Cake: React.FC = () => {
  const { x, y } = CAKE;
  return (
    <g>
      <rect x={1040} y={y} width={920} height={200} fill="#5a3b2e" stroke={INK} strokeWidth={6} />
      <rect x={1040} y={y - 8} width={920} height={20} fill="#7a5240" stroke={INK} strokeWidth={5} />
      <ellipse cx={x} cy={y - 4} rx={170} ry={26} fill={PAPER} stroke={INK} strokeWidth={6} />
      <path d={`M${x - 130} ${y - 10} L${x - 130} ${y - 120} Q${x} ${y - 160} ${x + 130} ${y - 120} L${x + 130} ${y - 10} Q${x} ${y + 24} ${x - 130} ${y - 10}Z`} fill="#f6c9d4" stroke={INK} strokeWidth={6} />
      <ellipse cx={x} cy={y - 120} rx={130} ry={34} fill="#fbe3ea" stroke={INK} strokeWidth={6} />
      <path d={`M${x - 130} ${y - 92} Q${x - 65} ${y - 60} ${x} ${y - 92} Q${x + 65} ${y - 124} ${x + 130} ${y - 92}`} fill="none" stroke="#fff3f6" strokeWidth={12} strokeLinecap="round" />
      <rect x={x - 8} y={y - 210} width={16} height={92} rx={5} fill={TEAL} stroke={INK} strokeWidth={4} />
      <line x1={x} y1={y - 210} x2={x} y2={y - 228} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d={`M${x} ${y - 230} C${x - 40} ${y - 290} ${x + 30} ${y - 330} ${x - 30} ${y - 390} S${x - 160} ${y - 470} ${x - 260} ${y - 450}`}
        fill="none" stroke="#d9d6e6" strokeWidth={10} strokeLinecap="round" opacity={0.55} />
    </g>
  );
};

/** One chat bubble: scribbled paper lines for words (the screen never shows letters), and a crimson dot if a machine wrote it. */
const Bubble: React.FC<{ x: number; y: number; w: number; lines: number; fill: string; dot: boolean }> = ({ x, y, w, lines, fill, dot }) => {
  const h = 26 + lines * 26;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={20} fill={fill} stroke={INK} strokeWidth={4} />
      {Array.from({ length: lines }, (_, i) => (
        <rect key={i} x={x + 18} y={y + 20 + i * 26} width={(i === lines - 1 ? 0.55 : 0.86) * (w - 36)} height={11} rx={5.5} fill={INK} opacity={0.42} />
      ))}
      {dot ? (
        <g>
          <circle cx={x + w + 26} cy={y + h - 18} r={25} fill={PAPER} stroke={INK} strokeWidth={3} />
          <circle cx={x + w + 26} cy={y + h - 18} r={19} fill={CRIMSON} />
        </g>
      ) : null}
    </g>
  );
};

/** The phone, screen to camera, held in your front hand: the chat column, four dotted warm bubbles and one bare one. */
const Phone: React.FC = () => {
  const { x, y, w, h } = PHONE;
  const sx = x - w / 2 + 18, sw = w - 36, top = y - h / 2 + 46;
  return (
    <g transform={`rotate(-6 ${x} ${y})`}>
      <rect x={x - w / 2 + 12} y={y - h / 2 + 16} width={w} height={h} rx={40} fill="#000" opacity={0.45} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={40} fill="#1b1d26" stroke={PAPER} strokeWidth={7} />
      <rect x={sx} y={top - 26} width={sw} height={h - 64} rx={22} fill="#eef1f4" />
      <rect x={sx} y={top - 26} width={sw} height={44} rx={22} fill="#d9dee6" />
      <circle cx={sx + 30} cy={top - 4} r={13} fill="#c9a8d8" stroke={INK} strokeWidth={3} />
      <rect x={sx + 52} y={top - 10} width={110} height={12} rx={6} fill={INK} opacity={0.5} />
      <Bubble x={sx + 12} y={top + 30} w={sw - 86} lines={4} fill="#f9c6d3" dot />
      <Bubble x={sx + 12} y={top + 174} w={sw - 100} lines={2} fill="#c3ead7" dot />
      <Bubble x={sx + 12} y={top + 264} w={sw - 86} lines={2} fill="#fbd8b8" dot />
      <Bubble x={sx + 12} y={top + 354} w={sw - 108} lines={1} fill="#dacbf0" dot />
      <Bubble x={sx + 12} y={top + 418} w={100} lines={1} fill="#b9c8dc" dot={false} />
    </g>
  );
};

const Scene: React.FC = () => {
  const props = { cam: CAM, mood: MOOD, frame: 40, options: KITCHEN };
  const actors = (
    <OnScreen>
      <Shade />
      <Cake />
      <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.1}
        time={3} brows="worry" lids={0.1} mouth="o" eyes={1.15} look={HERO.look} />
      <Phone />
    </OnScreen>
  );
  return (
    <LookContext.Provider value={setLook([...kitchen.lights(KITCHEN)], MOOD, CAM)}>
      <Stage cam={CAM} radius={0} origin={{ x: 960, y: 540 }} back={kitchen.Back(props)} actors={actors} />
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

export const TextsThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
