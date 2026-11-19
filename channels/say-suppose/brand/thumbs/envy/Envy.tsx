// "What If You Saw Who Wants You to Fail?" G1 thumbnails (2026-11-12), drawn with the what-if engine's kit: 10 p.m. on
// a cram-school street in Seoul. The library's city skyline (`citySkyline.Back`) far behind; the sign towers (stacked,
// lit academy boards with no lettering, so K5 counts only the tag and the meter) and the pavement are drawn here. You
// at the left hold up the letter, mid-smile, and look up at what just snapped open; your best friend claps beside you,
// a fist up for you, grinning, a crimson split-flap meter over his head at minus eighty-four. Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { dir, joints, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { citySkyline } from "@whatif/kit/sets";
import { setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { CANDIDATES, FRIEND, HERO, headOf, METER, METER_AT, type Candidate, type Tag } from "./data";

const CAM: Camera = { x: 1150, y: 600, zoom: 2 };
const MOOD = "night" as const;
const CITY = { ...citySkyline.defaults, birds: false, traffic: true, shoreLamps: false };

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

/** One crimson split-flap tile of the meter, its lower flap just landed. */
const Tile: React.FC<{ ch: string; x: number; y: number; s: number }> = ({ ch, x, y, s }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill="#000" opacity={0.4} transform={`translate(${s * 0.05} ${s * 0.08})`} />
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill={CRIMSON} stroke={PAPER} strokeWidth={s * 0.045} />
    <line x1={-s * 0.4} y1={0} x2={s * 0.4} y2={0} stroke="#7a1022" strokeWidth={s * 0.035} />
    <text x={0} y={s * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s * 0.82} fill={PAPER}>{ch}</text>
  </g>
);

/** The meter: four tiles on a paper hinge strip, hung over the friend's head. */
const Meter: React.FC = () => {
  const { x, y, tile } = METER_AT;
  const chars = METER.split("");
  const w = tile * 0.86;
  const x0 = x - ((chars.length - 1) * w) / 2;
  return (
    <g>
      <rect x={x0 - tile * 0.55} y={y - tile * 0.7} width={(chars.length - 1) * w + tile * 1.1} height={tile * 1.4} rx={tile * 0.16} fill={INK} stroke={PAPER} strokeWidth={8} />
      {chars.map((ch, i) => <Tile key={i} ch={ch} x={x0 + i * w} y={y} s={tile} />)}
      <path d={`M${x - 26} ${y + tile * 0.7} L${x} ${y + tile * 0.7 + 34} L${x + 26} ${y + tile * 0.7}Z`} fill={INK} stroke={PAPER} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

/** Where your front hand lands on screen, from the rig's own maths. */
function handAt(x: number, y: number, scale: number, pose: Pose) {
  const sh = joints(pose).shoulder;
  const a = dir(pose.armF[0]);
  const b = dir(pose.armF[0] + pose.armF[1]);
  return { x: x + (sh.x + (a.x + b.x) * LIMB) * scale, y: y + (sh.y + (a.y + b.y) * LIMB) * scale };
}

/** The letter you made the cut with: paper, ink lines, a teal seal. */
const Letter: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(8)`}>
    <rect x={-120} y={-300} width={250} height={330} rx={8} fill="#000" opacity={0.35} transform="translate(10 14)" />
    <rect x={-120} y={-300} width={250} height={330} rx={8} fill={PAPER} stroke={INK} strokeWidth={7} />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-88} y1={-246 + i * 40} x2={i === 4 ? 10 : 98} y2={-246 + i * 40} stroke={INK} strokeWidth={9} strokeLinecap="round" opacity={0.6} />)}
    <circle cx={60} cy={-34} r={44} fill="none" stroke={TEAL} strokeWidth={10} />
    <circle cx={60} cy={-34} r={26} fill={TEAL} opacity={0.85} />
  </g>
);

const SIGN_COLORS = ["#2fd3c3", "#ff6f91", "#f4efe2", "#7fb2ff", "#ffb36b", "#b38cff"];

/** A sign tower: a building faced with lit academy boards stacked floor on floor, bars for lettering, no words. */
const Tower: React.FC<{ x: number; w: number; top: number; seed: number; dim?: number }> = ({ x, w, top, seed, dim = 1 }) => {
  const rows = Math.floor((900 - top) / 92);
  return (
    <g opacity={dim}>
      <rect x={x} y={top} width={w} height={1080 - top} fill="#1c2138" stroke={INK} strokeWidth={6} />
      {Array.from({ length: rows }, (_, r) => {
        const c = SIGN_COLORS[(r * 3 + seed) % SIGN_COLORS.length];
        const narrow = (r + seed) % 3 === 0;
        const bw = narrow ? w * 0.55 : w - 36;
        const bx = narrow ? x + (r % 2 ? w - bw - 18 : 18) : x + 18;
        const by = top + 20 + r * 92;
        return (
          <g key={r}>
            <rect x={bx} y={by} width={bw} height={64} rx={6} fill={c} stroke={INK} strokeWidth={5} />
            <rect x={bx + 16} y={by + 22} width={bw * 0.55} height={18} rx={9} fill={INK} opacity={0.55} />
            <circle cx={bx + bw - 30} cy={by + 32} r={14} fill={INK} opacity={0.45} />
          </g>
        );
      })}
      {/* a vertical blade sign down the corner */}
      <rect x={x + w - 46} y={top + 30} width={36} height={Math.min(560, 1000 - top)} rx={6} fill={SIGN_COLORS[(seed + 2) % 6]} stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** The street behind you: three sign towers and the pavement. */
const Street: React.FC = () => (
  <g>
    <Tower x={-40} w={520} top={60} seed={1} dim={0.55} />
    <Tower x={820} w={460} top={140} seed={4} dim={0.8} />
    <Tower x={1500} w={460} top={20} seed={2} dim={0.8} />
    <rect x={-20} y={930} width={1960} height={170} fill="#2a2d38" />
    <rect x={-20} y={924} width={1960} height={14} fill="#4a4e5c" />
  </g>
);

/** A pool of shadow on the set behind your head, so the mustard head stands at 3:1 in greyscale (K4). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  return (
    <g>
      <defs>
        <radialGradient id="envy-shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.4" stopColor="#07080d" stopOpacity={0.9} />
          <stop offset="1" stopColor="#07080d" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={head.x} cy={head.y} r={head.r * 1.9} fill="url(#envy-shade)" />
    </g>
  );
};

/** Cheering you: the far fist up, the near arm reaching out to pull you into a hug. */
const CHEER: Pose = { ...STAND, lean: -6, tilt: -10, armF: [96, 18], armB: [-150, -20] };

const Scene: React.FC = () => {
  const props = { cam: CAM, mood: MOOD, frame: 40, options: CITY };
  const hand = handAt(HERO.x, HERO.y, HERO.scale, HERO.pose);
  const actors = (
    <OnScreen>
      <Street />
      <Shade />
      <Figure x={FRIEND.x} y={FRIEND.y} scale={FRIEND.scale} facing={-1} pose={CHEER} head="#9fd3e6" coat="#3b4a6b"
        {...EXPRESSIONS.happy} mouth="open" eyes={1.1} look={{ x: 0.9, y: 0.15 }} />
      <Meter />
      <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.15}
        time={3} brows="raised" lids={0} mouth="o" eyes={1.25} look={HERO.look} />
      <Letter x={hand.x - 10} y={hand.y + 40} />
    </OnScreen>
  );
  return (
    <LookContext.Provider value={setLook([...citySkyline.lights(CITY)], MOOD, CAM)}>
      <Stage cam={CAM} radius={0} origin={{ x: 960, y: 540 }} back={citySkyline.Back({ ...props, options: CITY })} actors={actors} />
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

export const EnvyThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
