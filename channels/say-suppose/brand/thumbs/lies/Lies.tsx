// "What If You Could See Everyone's Lies Today?" G1 thumbnails (2026-11-24), drawn with the what-if engine's kit: the
// Monday meeting, blinds down, projector off. The only light is the glowing 47 over your boss's head, which lights his
// grin from above and the table below; you at the left, mug halfway to your mouth, stunned. Frame i is candidate i.
// The room is drawn here in screen space (no library set); the blinds carry no lettering, so K5 counts only the tag
// and the counter. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { dir, joints, LIMB, type Pose } from "@whatif/kit/rig/pose";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Counter } from "./Counter";
import { BOSS, BOSS_POSE, bossHead, CANDIDATES, COUNT, COUNTER_AT, HERO, headOf, type Candidate, type Tag } from "./data";

const CAM: Camera = { x: 960, y: 540, zoom: 1 };
const MOOD = "lamp" as const;
const GLOW = "#ffcf5a";

/** Screen-space group inside the Stage's camera. */
const OnScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g transform={`translate(${CAM.x} ${CAM.y}) scale(${1 / CAM.zoom}) translate(-960 -540)`}>{children}</g>
);

const WordTag: React.FC<{ t: Tag }> = ({ t }) =>
  t.lines.length ? (
    <div style={{
      position: "absolute", top: t.y, left: t.x, transform: `rotate(${t.tilt}deg)`, transformOrigin: "left center",
      background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22, textAlign: "left",
      fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1.02, letterSpacing: 2,
      padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
      boxShadow: "0 14px 26px rgba(0,0,0,.45)",
    }}>{t.lines.map((l) => <div key={l}>{l}</div>)}</div>
  ) : null;

/** The meeting room: a dark wall of closed blinds, the dead projector screen, the long table under the counter's light. */
const Room: React.FC = () => {
  const b = bossHead();
  const cx = b.x;
  return (
    <g>
      <rect x={-20} y={-20} width={1960} height={1120} fill="#0d1018" />
      {/* closed blinds on the back wall, faint slats */}
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={-20} y={30 + i * 34} width={1960} height={18} fill="#161b27" />
      ))}
      {/* the dead projector screen behind the boss */}
      <rect x={cx - 360} y={70} width={720} height={420} rx={8} fill="#141824" stroke="#222838" strokeWidth={8} />
      {/* the long table in perspective, lit from the counter above */}
      <defs>
        <radialGradient id="lies-pool" cx={cx / 1920} cy={0.74} r="0.42">
          <stop offset="0" stopColor={GLOW} stopOpacity={0.42} />
          <stop offset="0.6" stopColor={GLOW} stopOpacity={0.08} />
          <stop offset="1" stopColor={GLOW} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d="M-40 1100 L760 760 L1940 760 L1940 1100 Z" fill="#2a2420" stroke={INK} strokeWidth={6} />
      <path d="M-40 1100 L760 760 L1940 760 L1940 1100 Z" fill="url(#lies-pool)" />
      {/* papers and a laptop on the table, no words */}
      <rect x={1060} y={800} width={170} height={110} rx={6} fill={PAPER} opacity={0.75} transform="rotate(-8 1145 855)" />
      <rect x={1600} y={790} width={200} height={14} rx={7} fill="#3b3f4c" />
      <path d="M1610 790 L1640 700 L1790 700 L1800 790 Z" fill="#2c303b" stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** A pool of shadow behind your head, so the mustard head stands at 3:1 in greyscale (K4). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  return (
    <g>
      <defs>
        <radialGradient id="lies-shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.4" stopColor="#05060a" stopOpacity={0.9} />
          <stop offset="1" stopColor="#05060a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={head.x} cy={head.y} r={head.r * 1.9} fill="url(#lies-shade)" />
    </g>
  );
};

/** Where your front hand lands on screen, from the rig's own maths. */
function handAt(x: number, y: number, scale: number, pose: Pose, facing = 1) {
  const sh = joints(pose).shoulder;
  const a = dir(pose.armF[0]);
  const b = dir(pose.armF[0] + pose.armF[1]);
  return { x: x + (sh.x + (a.x + b.x) * LIMB) * scale * facing, y: y + (sh.y + (a.y + b.y) * LIMB) * scale };
}

/** Your mug: teal, steam frozen mid-curl. */
const Mug: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-10)`}>
    <rect x={-70} y={-90} width={130} height={150} rx={18} fill={TEAL} stroke={INK} strokeWidth={8} />
    <path d="M60 -55 q55 10 0 70" fill="none" stroke={INK} strokeWidth={14} />
    <path d="M60 -55 q55 10 0 70" fill="none" stroke={TEAL} strokeWidth={6} />
    <path d="M-30 -110 q-20 -30 0 -60 q20 -30 0 -60" fill="none" stroke={PAPER} strokeWidth={8} opacity={0.5} strokeLinecap="round" />
  </g>
);

const Scene: React.FC = () => {
  const b = bossHead();
  const lights = [{ x: b.x, y: b.y + COUNTER_AT.dy, r: 480, color: GLOW, strength: 0.55, moods: [MOOD] }];
  const hand = handAt(HERO.x, HERO.y, HERO.scale, HERO.pose);
  const actors = (
    <OnScreen>
      <Room />
      <Figure x={BOSS.x} y={BOSS.y} scale={BOSS.scale} facing={-1} pose={BOSS_POSE} head="#7d93bb" coat="#2f3a55"
        tie="#b8323e" {...EXPRESSIONS.happy} mouth="open" eyes={1.05} look={{ x: 1, y: 0.1 }} />
      <Counter x={b.x} y={b.y + COUNTER_AT.dy} value={COUNT} size={COUNTER_AT.size} glow={GLOW} id="c47" />
      <Shade />
      <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.15}
        time={3} brows="raised" lids={0} mouth="o" eyes={1.3} look={HERO.look} />
      <Mug x={hand.x + 20} y={hand.y + 10} />
    </OnScreen>
  );
  return (
    <LookContext.Provider value={setLook(lights, MOOD, CAM)}>
      <Stage cam={CAM} radius={0} origin={{ x: 960, y: 540 }} back={<g />} actors={actors} />
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

export const LiesThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
