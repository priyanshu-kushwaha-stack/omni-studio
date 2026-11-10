// "Find anything ever lost" thumbnails, drawn with the what-if engine's kit (rig, stage, moods) in the channel's tag
// look. Night metro platform in the rain: you mid-step at the left, a teal dotted line from your shoes across the wet
// slabs into a storm grate with a glow under its bars, one crimson arrow at the glow. Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { CANDIDATES, GRATE, HERO, type Candidate, type Tag } from "./data";

const CAM: Camera = { x: 960, y: 540, zoom: 1 };
const GLOW = "#5ff0dc";
const blur = (n: number) => `url(#dof-${Math.max(1, Math.min(40, Math.round(n * 2)))})`;

const WordTag: React.FC<{ t: Tag }> = ({ t }) => (
  <div style={{
    position: "absolute", top: t.y, right: t.x, transform: `rotate(${t.tilt}deg)`, transformOrigin: "right center",
    background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22, textAlign: "right",
    fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1.02, letterSpacing: 2,
    padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(0,0,0,.45)",
  }}>{t.lines.map((l) => <div key={l}>{l}</div>)}</div>
);

/** A point on the line from your front shoe to the grate's centre: a cubic that swings out toward the camera first. */
function linePoint(t: number) {
  const p0 = { x: HERO.x + 120, y: HERO.y - 8 };
  const p1 = { x: 860, y: 1090 };
  const p2 = { x: 1000, y: 860 };
  const p3 = { x: GRATE.x + GRATE.w / 2, y: GRATE.y + GRATE.h / 2 };
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

const Platform: React.FC = () => {
  const back = (
    <>
      <defs>
        <radialGradient id="grateGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={GLOW} stopOpacity={0.95} />
          <stop offset="0.45" stopColor={TEAL} stopOpacity={0.55} />
          <stop offset="1" stopColor={TEAL} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262c3a" />
          <stop offset="1" stopColor="#1b202b" />
        </linearGradient>
      </defs>
      {/* the far tunnel wall: tiles, two lamps, a blank poster frame, all soft */}
      <rect width={1920} height={1080} fill="#121722" />
      <g filter={blur(9)}>
        {[0, 1, 2, 3, 4, 5].map((r) => <rect key={r} x={0} y={70 + r * 82} width={1920} height={5} fill="#1b2130" />)}
        <rect x={760} y={170} width={360} height={220} rx={8} fill="#1d2536" stroke="#2a3348" strokeWidth={10} />
        <circle cx={330} cy={60} r={70} fill="#ffe7b0" opacity={0.18} />
        <circle cx={1500} cy={60} r={70} fill="#ffe7b0" opacity={0.18} />
      </g>
      {/* the track pit and a rail glint */}
      <rect x={0} y={520} width={1920} height={120} fill="#090b11" />
      <rect x={0} y={575} width={1920} height={6} fill="#3a4152" opacity={0.6} />
      {/* the platform: the yellow edge strip, then wet slabs */}
      <rect x={0} y={640} width={1920} height={440} fill="url(#floor)" />
      <rect x={0} y={640} width={1920} height={26} fill="#9a8030" />
      {[700, 770, 860, 975].map((y) => <rect key={y} x={0} y={y} width={1920} height={3} fill="#121620" opacity={0.8} />)}
      {Array.from({ length: 13 }, (_, i) => {
        const xTop = -240 + i * 200;
        const xBot = 960 + (xTop - 960) * 1.9;
        return <line key={i} x1={xTop} y1={666} x2={xBot} y2={1080} stroke="#121620" strokeWidth={3} opacity={0.8} />;
      })}
      {/* lamp reflections in the wet floor */}
      <g filter={blur(10)} opacity={0.35}>
        <rect x={300} y={680} width={60} height={300} fill="#ffe7b0" />
        <rect x={1470} y={680} width={60} height={300} fill="#ffe7b0" />
      </g>
      {/* the glow spills out of the grate onto the slabs */}
      <ellipse cx={GRATE.x + GRATE.w / 2} cy={GRATE.y + GRATE.h / 2} rx={GRATE.w * 0.95} ry={GRATE.h * 1.5} fill="url(#grateGlow)" opacity={0.75} />
    </>
  );
  // The grate in perspective: a trapezoid, bars across it, the glow showing between them.
  const g = GRATE;
  const tl = { x: g.x + 30, y: g.y };
  const tr = { x: g.x + g.w - 30, y: g.y };
  const grate = (
    <g>
      <path d={`M${tl.x} ${tl.y} L${tr.x} ${tr.y} L${g.x + g.w} ${g.y + g.h} L${g.x} ${g.y + g.h} Z`} fill={INK} stroke="#0b0d12" strokeWidth={10} strokeLinejoin="round" />
      <ellipse cx={g.x + g.w / 2} cy={g.y + g.h * 0.55} rx={g.w * 0.42} ry={g.h * 0.42} fill={GLOW} />
      <ellipse cx={g.x + g.w / 2} cy={g.y + g.h * 0.55} rx={g.w * 0.2} ry={g.h * 0.22} fill="#e9fffb" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        const xt = tl.x + (tr.x - tl.x) * t;
        const xb = g.x + g.w * t;
        return <line key={i} x1={xt} y1={g.y + 4} x2={xb} y2={g.y + g.h - 4} stroke={INK} strokeWidth={16} strokeLinecap="round" />;
      })}
      <path d={`M${tl.x} ${tl.y} L${tr.x} ${tr.y} L${g.x + g.w} ${g.y + g.h} L${g.x} ${g.y + g.h} Z`} fill="none" stroke="#3a4152" strokeWidth={8} strokeLinejoin="round" />
    </g>
  );
  // The rule device: teal dots from your shoe to the grate, smaller with distance, each with a glow.
  const dots = Array.from({ length: 17 }, (_, i) => {
    const t = (i / 16) * 0.86;
    const p = linePoint(t);
    const r = 15 - 7 * t;
    return { ...p, r };
  });
  const line = (
    <g>
      {dots.map((d, i) => <circle key={`g${i}`} cx={d.x} cy={d.y} r={d.r * 2.4} fill={TEAL} opacity={0.35} filter={blur(4)} />)}
      {dots.map((d, i) => <ellipse key={i} cx={d.x} cy={d.y} rx={d.r * 1.35} ry={d.r * 0.8} fill={GLOW} stroke={INK} strokeWidth={3} />)}
    </g>
  );
  // One crimson arrow at the glow (K8), from above-right, clear of the badge zone (K11).
  const ax = g.x + g.w * 0.72, ay = g.y - 30;
  const arrow = (
    <g transform={`translate(${ax} ${ay}) rotate(-38)`}>
      <path d="M-26 -250 L26 -250 L26 -90 L74 -90 L0 0 L-74 -90 L-26 -90 Z" fill={CRIMSON} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    </g>
  );
  // Rain: thin slanted streaks over the whole set.
  const rain = (
    <g opacity={0.28}>
      {Array.from({ length: 70 }, (_, i) => {
        const x = (i * 211) % 2000 - 40;
        const y = (i * 137) % 1000;
        return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 70} stroke="#c9d6ea" strokeWidth={3} strokeLinecap="round" />;
      })}
    </g>
  );
  const f = EXPRESSIONS.shocked;
  const actors = (
    <>
      {grate}
      {line}
      <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.12} time={3}
        {...f} eyes={1.35} look={HERO.look} />
      {arrow}
      {rain}
    </>
  );
  return <Stage cam={CAM} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

const MOOD = moodLook("night", { grade: { top: "#4f5aa8", bottom: "#1d2440", opacity: 0.28 } });

export const Thumb: React.FC<{ c: Candidate }> = ({ c }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <LookContext.Provider value={MOOD}>
      <Platform />
    </LookContext.Provider>
    <Finish />
    <WordTag t={c.tag} />
  </AbsoluteFill>
);

export const LostThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
