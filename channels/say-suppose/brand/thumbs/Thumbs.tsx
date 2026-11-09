// Thumbnail candidates drawn with the what-if engine's kit: the rig (Figure), the stage (Stage, Finish, moods) and the
// channel's tag look (brand/thumb_tag.py: mustard Rubik 800 on an ink plate with a paper edge). One frame of the
// "Thumbs" composition is one candidate, in CANDIDATES order. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext, type Look } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { Flip } from "@whatif/kit/ui/Flip";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { CANDIDATES, headOf, type Candidate, type Hero, type Tag } from "./batch1";

const CAM: Camera = { x: 960, y: 540, zoom: 1 };
const FACE = {
  worried: { ...EXPRESSIONS.worried, eyes: 1.15 },
  shocked: EXPRESSIONS.shocked,
  afraid: { ...EXPRESSIONS.afraid, mouth: "wobble" as const, lids: 0, eyes: 1.35, look: { x: 0.5, y: -0.1 } },
  sceptical: { ...EXPRESSIONS.sad, lids: 0.2, eyes: 1.1, look: { x: 0.9, y: 0.25 } },
};

const blur = (n: number) => `url(#dof-${Math.max(1, Math.min(40, Math.round(n * 2)))})`;

const You: React.FC<{ h: Hero; held?: React.ReactNode }> = ({ h, held }) => {
  const f = FACE[h.face];
  return (
    <Figure x={h.x} y={h.y} scale={h.scale} facing={h.facing ?? 1} pose={h.pose} head={MUSTARD} scarf={TEAL} tuft
      flow={0.15} time={3} {...f} look={h.look} held={held} />
  );
};

/** The channel's word tag: mustard on an ink plate with a paper edge, tilted like the film's tags. */
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

// ---------- 1. Doorway: mom waves from the porch light; a counter over her head ----------

const Doorway: React.FC<{ c: Candidate }> = ({ c }) => {
  const back = (
    <>
      <rect width={1920} height={1080} fill="#1c2030" />
      {/* the hall wall, a photo frame, a shoe rack */}
      <g filter={blur(5)}>
        <rect x={120} y={140} width={260} height={200} rx={8} fill="#2b3046" stroke="#3a4060" strokeWidth={10} />
        <rect x={0} y={900} width={1180} height={180} fill="#171a28" />
      </g>
      {/* the open door: warm porch light, the night street beyond */}
      <rect x={1180} y={0} width={640} height={1080} fill="#ffcf8a" />
      <rect x={1180} y={0} width={640} height={1080} fill="url(#porch)" />
      <defs>
        <radialGradient id="porch" cx="0.5" cy="0.18" r="0.9">
          <stop offset="0" stopColor="#fff3d6" />
          <stop offset="0.45" stopColor="#f7b46a" />
          <stop offset="1" stopColor="#3b2a40" />
        </radialGradient>
      </defs>
      <rect x={1150} y={0} width={44} height={1080} fill="#0f111a" />
      <rect x={1806} y={0} width={44} height={1080} fill="#0f111a" />
      <rect x={1850} y={0} width={70} height={1080} fill="#1c2030" />
    </>
  );
  const momX = 1575;
  const actors = (
    <>
      <g filter={blur(2)}>
        <Figure x={momX} y={1450} scale={2.6} facing={-1} head="#e6a0a0" coat="#6b4a7a"
          pose={{ lean: 0, tilt: -6, armF: [118, 38], armB: [-6, 10], legB: [-4, -2], legF: [5, -3], drop: 0 }}
          mouth="smile" brows="none" eyes={1} look={{ x: 0.5, y: 0 }} />
        {/* her bun */}
        <circle cx={momX + 46} cy={1450 - 264 * 2.6 - 92} r={40} fill="#3a2a2a" />
      </g>
      <You h={c.hero} />
    </>
  );
  return (
    <>
      <Stage cam={CAM} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />
      <div style={{ position: "absolute", left: 1450, top: 330, transform: "scale(1.25)", transformOrigin: "left top" }}>
        <Flip value={c.stake ?? ""} previous={c.stake ?? ""} changedAt={-100} />
      </div>
    </>
  );
};

// ---------- 2. Hall: a coaching hall at night, every head with a glowing chip; yours over you ----------

const Hall: React.FC<{ c: Candidate }> = ({ c }) => {
  const rows = [
    { y: 560, s: 0.9, n: 7, x0: 980, dx: 135 },
    { y: 700, s: 1.15, n: 6, x0: 1010, dx: 170 },
  ];
  const back = (
    <>
      <rect width={1920} height={1080} fill="#171b2c" />
      {/* tube lights */}
      {[300, 900, 1500].map((x) => <rect key={x} x={x} y={40} width={300} height={16} rx={8} fill="#e9f3ff" opacity={0.85} />)}
      {[].map((r: (typeof rows)[number], ri: number) => (
        <g key={ri} filter={blur(ri === 0 ? 12 : 9)} opacity={0.55}>
          {Array.from({ length: r.n }, (_, i) => {
            const x = r.x0 + i * r.dx;
            const hy = r.y - 230 * r.s;
            return (
              <g key={i}>
                <rect x={x - 40 * r.s} y={hy - 120 * r.s} width={92 * r.s} height={40 * r.s} rx={12} fill={i % 3 === 1 ? "#7fe0b0" : "#9fd0ff"} opacity={0.8} />
                <Figure x={x} y={r.y + 200 * r.s} scale={r.s} head={["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a"][(i + ri) % 5]}
                  pose={{ lean: 0, tilt: 0, armF: [40, 60], armB: [30, 60], legB: [90, -2], legF: [90, -2], drop: 0 }} mouth="flat" />
                <rect x={x - 70 * r.s} y={r.y + 40 * r.s} width={160 * r.s} height={34 * r.s} fill="#3a2f2a" />
              </g>
            );
          })}
        </g>
      ))}
    </>
  );
  const head = headOf(c.hero);
  return (
    <>
      <Stage cam={CAM} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={<You h={c.hero} />} />
      {/* your chip: the stake, glowing crimson over your head */}
      <div style={{
        position: "absolute", left: 800, top: 390, padding: "0 60px", height: 220, borderRadius: 40,
        background: CRIMSON, color: "#fff4f0", fontFamily: FONT, fontWeight: 800, fontSize: 190, lineHeight: "220px",
        textAlign: "center", letterSpacing: 2, boxShadow: `0 0 60px 18px ${CRIMSON}aa, 0 0 0 7px ${PAPER}`,
      }}>{c.stake}</div>
    </>
  );
};

// ---------- 3 and 4. A phone held up at the right: the ledger, or the offer ----------

const PhoneShell: React.FC<{ at?: { x: number; y: number }; children: React.ReactNode }> = ({ at = { x: 880, y: 380 }, children }) => (
  <g transform={`translate(${at.x} ${at.y})`}>
    <rect x={-14} y={-14} width={428} height={668} rx={58} fill="#0d0e14" />
    <rect x={0} y={0} width={400} height={640} rx={46} fill="#f7f1e4" />
    <rect x={150} y={18} width={100} height={18} rx={9} fill="#0d0e14" />
    {children}
  </g>
);

const Coin: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 34 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#ffd54a" stroke={INK} strokeWidth={6} />
    <circle r={r * 0.62} fill="none" stroke="#c99a12" strokeWidth={5} />
  </g>
);

const Ledger: React.FC<{ c: Candidate }> = ({ c }) => {
  const back = (
    <>
      <rect width={1920} height={1080} fill="#1e1a2a" />
      <g filter={blur(7)}>
        <rect x={80} y={120} width={420} height={330} rx={10} fill="#2c2a46" stroke="#3b3858" strokeWidth={12} />
        <circle cx={1700} cy={260} r={110} fill="#ffcf8a" opacity={0.35} />
        <rect x={0} y={930} width={1920} height={150} fill="#16131f" />
      </g>
    </>
  );
  // two rows: mom's bar full of coins, the heart's empty
  const screen = (
    <PhoneShell at={c.prop}>
      <circle cx={80} cy={150} r={46} fill="#e6a0a0" />
      <circle cx={60} cy={142} r={7} fill={INK} /><circle cx={92} cy={142} r={7} fill={INK} />
      <path d="M60 166 Q76 178 94 166" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <circle cx={104} cy={100} r={20} fill="#3a2a2a" />
      <rect x={150} y={118} width={220} height={64} rx={32} fill="#d6ead8" />
      <rect x={150} y={118} width={220} height={64} rx={32} fill="#3fb37f" />
      <path d="M80 330 C40 290 40 250 80 262 C120 250 120 290 80 330Z" fill={CRIMSON} transform="translate(0 -20)" />
      <rect x={150} y={262} width={220} height={64} rx={32} fill="#e7ddcb" stroke="#cdbfa6" strokeWidth={4} />
    </PhoneShell>
  );
  const actors = (
    <>
      {screen}
      <You h={c.hero} />
    </>
  );
  return <Stage cam={CAM} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

const Hourglass: React.FC<{ c: Candidate }> = ({ c }) => {
  const back = (
    <>
      <rect width={1920} height={1080} fill="#15202a" />
      <g filter={blur(7)}>
        {/* a hospital ward at night: a window, a drip stand, dad asleep */}
        <rect x={1380} y={110} width={420} height={330} rx={10} fill="#22374a" stroke="#2e4a62" strokeWidth={12} />
        <line x1={1640} y1={360} x2={1640} y2={900} stroke="#8aa0b0" strokeWidth={10} />
        <rect x={1610} y={360} width={60} height={90} rx={14} fill="#bfe6ee" opacity={0.7} />
        <rect x={1240} y={760} width={680} height={110} rx={18} fill="#d9e6ea" />
        <circle cx={1330} cy={745} r={62} fill="#d9c26a" />
        <rect x={0} y={930} width={1920} height={150} fill="#101820" />
      </g>
    </>
  );
  const screen = (
    <PhoneShell at={c.prop}>
      {/* the hourglass */}
      <g transform="translate(200 230)">
        <rect x={-110} y={-150} width={220} height={22} rx={8} fill={INK} />
        <rect x={-110} y={128} width={220} height={22} rx={8} fill={INK} />
        <path d="M-90 -128 H90 Q90 -40 10 0 Q90 40 90 128 H-90 Q-90 40 -10 0 Q-90 -40 -90 -128Z" fill="#dff1f4" stroke={INK} strokeWidth={8} />
        <path d="M-60 -70 H60 Q40 -30 6 -6 H-6 Q-40 -30 -60 -70Z" fill={MUSTARD} />
        <path d="M-70 120 Q0 50 70 120Z" fill={MUSTARD} />
        <line x1={0} y1={-4} x2={0} y2={80} stroke={MUSTARD} strokeWidth={6} />
      </g>
      {/* the button */}
      <circle cx={200} cy={520} r={78} fill={CRIMSON} stroke={INK} strokeWidth={8} />
      <circle cx={200} cy={510} r={62} fill="#ef5a72" />
    </PhoneShell>
  );
  const actors = (
    <>
      {screen}
      <You h={c.hero} />
    </>
  );
  return <Stage cam={CAM} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

// ---------- 5. Pages: night before the exam, every page and one shout around your head ----------

const Page: React.FC<{ x: number; y: number; r: number; s?: number }> = ({ x, y, r, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-80} y={-105} width={160} height={210} rx={6} fill="#f6eedd" stroke="#c9b893" strokeWidth={3} />
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-58} y={-78 + i * 28} width={i % 2 ? 90 : 116} height={9} rx={4} fill="#8a8170" />)}
  </g>
);

const Pages: React.FC<{ c: Candidate }> = ({ c }) => {
  const head = headOf(c.hero);
  const back = (
    <>
      <rect width={1920} height={1080} fill="#151827" />
      <g filter={blur(7)}>
        <rect x={1300} y={120} width={360} height={300} rx={10} fill="#1f2a44" stroke="#2c3656" strokeWidth={12} />
        <rect x={0} y={920} width={1920} height={160} fill="#3b2a22" />
      </g>
    </>
  );
  const near = [[head.x + 470, head.y + 300, 12], [head.x + 1250, head.y + 260, -8]] as const;
  const actors = (
    <>
      <You h={c.hero} />
      {near.map(([x, y, r], i) => <Page key={i} x={x} y={y} r={r} s={1.05} />)}
      {/* the shout: a jagged crimson bubble, the one memory that will not fade */}
      <g transform={`translate(${head.x + 830} ${head.y + 10}) rotate(-8) scale(1.6)`}>
        <path d="M-150 -90 L-90 -120 L-40 -95 L20 -130 L60 -96 L130 -118 L150 -60 L190 -20 L140 20 L160 80 L90 80 L60 130 L10 92 L-50 120 L-80 80 L-150 90 L-130 30 L-180 -10 L-130 -40Z"
          fill={CRIMSON} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <circle cx={-20} cy={-10} r={44} fill="#e6a0a0" />
        <circle cx={-6} cy={-36} r={18} fill="#3a2a2a" />
        <line x1={-40} y1={-26} x2={-24} y2={-18} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={-18} x2={14} y2={-26} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={-14} cy={8} rx={12} ry={14} fill={INK} />
      </g>
    </>
  );
  return <Stage cam={CAM} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

const SCENES = { doorway: Doorway, hall: Hall, ledger: Ledger, hourglass: Hourglass, pages: Pages } as const;
const MOOD: Record<Candidate["scene"], Look> = {
  doorway: moodLook("dusk", { grade: { top: "#ffb98a", bottom: "#3b3560", opacity: 0.35 }, vignette: 0.4 }),
  hall: moodLook("night", { grade: { top: "#5a64b8", bottom: "#2a2c58", opacity: 0.35 } }),
  ledger: moodLook("lamp", { grade: { top: "#e8c29a", bottom: "#6e4c52", opacity: 0.3 } }),
  hourglass: moodLook("night", { grade: { top: "#5a8ab8", bottom: "#1f3048", opacity: 0.3 } }),
  pages: moodLook("lamp", { grade: { top: "#e8c29a", bottom: "#3a3052", opacity: 0.3 } }),
};

export const Thumb: React.FC<{ c: Candidate }> = ({ c }) => {
  const Scene = SCENES[c.scene];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={MOOD[c.scene]}>
        <Scene c={c} />
      </LookContext.Provider>
      <Finish />
      <WordTag t={c.tag} />
    </AbsoluteFill>
  );
};

/** Frame i is candidate i. */
export const Thumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
