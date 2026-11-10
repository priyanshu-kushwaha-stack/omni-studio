// G1 thumbnails for "What If You Saw 60 Seconds Into the Future?", drawn with the what-if engine's kit (the rig, the
// stage, the lamp mood) and the channel's tag look. The rule device is the ghost layer: a pale, translucent copy of
// the world one minute ahead. Here it holds your ghost, head bowed, and the glass already in pieces. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import type { Candidate, Hero, Tag } from "./batch1";
import { GHOST, GLASS_AT, SHARDS, SIXTY } from "./sixty";

const CAM: Camera = { x: 960, y: 540, zoom: 1 };
const LOOK = moodLook("lamp", { grade: { top: "#e8c29a", bottom: "#3a3052", opacity: 0.3 } });
const blur = (n: number) => `url(#dof-${Math.max(1, Math.min(40, Math.round(n * 2)))})`;

/** A cutting-chai glass in figure units (drawn at the hand): ribbed tumbler, chai to near the rim. */
const ChaiGlass: React.FC = () => (
  <g transform="translate(-2 -26)">
    <path d="M-15 -14 L15 -14 L12 18 L-12 18 Z" fill="#f6efe2" opacity={0.55} stroke="#fff8ea" strokeWidth={1.6} />
    <path d="M-14 -8 L14 -8 L12 17 L-12 17 Z" fill="#c9823f" />
    <path d="M-14 -8 L14 -8 L13.6 -5 L-13.6 -5 Z" fill="#e7b277" />
    {[-8, -2.7, 2.7, 8].map((x) => <line key={x} x1={x} y1={-13} x2={x * 0.85} y2={17} stroke="#fff8ea" strokeWidth={1} opacity={0.45} />)}
  </g>
);

const You: React.FC<{ h: Hero; held?: React.ReactNode }> = ({ h, held }) => (
  <Figure x={h.x} y={h.y} scale={h.scale} facing={h.facing ?? 1} pose={h.pose} head={MUSTARD} scarf={TEAL} tuft
    flow={0.15} time={3} {...EXPRESSIONS.shocked} eyes={1.3} look={h.look} held={held} />
);

/** The ghost layer's colour: everything mapped to a pale blue-white, keeping light and dark apart. */
const GhostDefs = () => (
  <defs>
    <filter id="ghost" x="-10%" y="-10%" width="120%" height="120%">
      <feColorMatrix type="matrix" values="0.12 0.24 0.04 0 0.62  0.12 0.24 0.04 0 0.68  0.12 0.24 0.04 0 0.76  0 0 0 1 0" />
    </filter>
  </defs>
);

const Shards: React.FC = () => {
  const { x, y } = SHARDS;
  // the same glass, smashed on the counter: its base with a jagged top, three big shards, a splash with drops
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-30 78 Q10 40 90 50 Q150 30 220 46 Q300 38 380 66 Q400 84 340 88 L330 150 Q322 162 314 150 L306 90 Q220 96 150 92 L144 128 Q138 138 132 128 L126 92 Q40 96 -30 78Z" fill="#f6e2c6" />
      {[[-40, 30, 12], [40, 6, 9], [420, 40, 11], [360, 0, 8], [250, 10, 7]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#f6e2c6" />)}
      <path d="M150 70 L156 0 L176 22 L196 -6 L212 26 L232 2 L238 70 Z" fill="#ffffff" stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" />
      <path d="M40 60 L84 -10 L110 52 Z" fill="#ffffff" stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" />
      <path d="M280 66 L318 8 L350 58 Z" fill="#ffffff" stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" />
      <path d="M-10 64 L8 36 L26 62 Z" fill="#ffffff" />
    </g>
  );
};

const StallBack: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill="#14161f" />
    {/* the lamp: one mustard bulb upper left, behind and above the shoulder, never behind the head */}
    <defs>
      <radialGradient id="bulb" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffe3a0" stopOpacity={0.9} />
        <stop offset="0.35" stopColor="#f2b632" stopOpacity={0.35} />
        <stop offset="1" stopColor="#f2b632" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={110} cy={120} r={260} fill="url(#bulb)" />
    <circle cx={110} cy={120} r={26} fill="#fff1c8" />
    <g filter={blur(6)}>
      {/* the stall's back: a shelf, a kettle and stacked glasses at far right, dim */}
      <rect x={1180} y={560} width={740} height={18} fill="#262a38" />
      <path d="M1660 560 Q1660 470 1730 470 Q1800 470 1800 560 Z" fill="#3a3f52" />
      <path d="M1800 510 L1860 480 L1864 492 L1806 528 Z" fill="#3a3f52" />
      {[0, 1, 2].map((i) => <rect key={i} x={1500 + i * 52} y={500} width={40} height={60} rx={4} fill="#3b4256" />)}
    </g>
    {/* the counter: a dark ink slab across the lower third, right of you */}
    <rect x={820} y={930} width={1100} height={150} fill="#1d202b" />
    <rect x={820} y={918} width={1100} height={16} rx={4} fill="#2c3040" />
  </>
);

const WordTag: React.FC<{ t: Tag }> = ({ t }) => (
  <div style={{
    position: "absolute", top: t.y, ...(t.align === "right" ? { right: t.x } : { left: t.x }),
    transform: `rotate(${t.tilt}deg)`, transformOrigin: t.align === "right" ? "right center" : "left center",
    background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22,
    fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1, letterSpacing: 2,
    padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(0,0,0,.45)",
  }}>{t.text}</div>
);

/** One crimson arrow from the right edge down to the ghost shards (K8: one pointer). */
const Arrow: React.FC = () => {
  const tip = { x: SHARDS.x + 250, y: SHARDS.y - 20 };
  return (
    <g>
      <path d={`M1830 470 Q1800 680 ${tip.x + 40} ${tip.y - 50}`} fill="none" stroke={CRIMSON} strokeWidth={30} strokeLinecap="round" />
      <path d={`M${tip.x - 14} ${tip.y + 6} L${tip.x + 92} ${tip.y - 34} L${tip.x + 22} ${tip.y - 104} Z`} fill={CRIMSON} strokeLinejoin="round" stroke={CRIMSON} strokeWidth={10} />
    </g>
  );
};

export const SixtyThumb: React.FC<{ c: Candidate }> = ({ c }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <LookContext.Provider value={LOOK}>
      <Stage cam={CAM} radius={0} origin={{ x: 0, y: 0 }} back={<StallBack />} actors={<You h={c.hero} held={<ChaiGlass />} />} />
    </LookContext.Provider>
    {/* the ghost layer, one minute ahead: your ghost and the broken glass, pale and translucent */}
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <GhostDefs />
        <g filter="url(#ghost)" opacity={0.3}>
          <Figure x={GHOST.x} y={GHOST.y} scale={GHOST.scale} pose={GHOST.pose} head={MUSTARD} scarf={TEAL} tuft
            flow={0.1} time={3} {...EXPRESSIONS.worried} look={GHOST.look} />
        </g>
        <g opacity={0.8}><Shards /></g>
        <Arrow />
      </svg>
    </AbsoluteFill>
    <Finish />
    <WordTag t={c.tag} />
  </AbsoluteFill>
);

/** Frame i is candidate i. GLASS_AT is where the hand lands; kept here so a reader finds it next to the drawing. */
export const SixtyThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  void GLASS_AT;
  return <SixtyThumb c={SIXTY[Math.min(frame, SIXTY.length - 1)]} />;
};
