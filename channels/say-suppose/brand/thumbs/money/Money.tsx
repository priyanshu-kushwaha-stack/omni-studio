// "Doubled your money every day" thumbnails, drawn with the what-if engine's kit: a pier kiosk at night, built from
// the library's city skyline across the bay (`citySkyline.Back`) and chai-stall counter (`chaiStall.Mid`) with the
// kiosk's back wall, roof and chalkboard drawn here; the rig and the channel's tag look. You at the left own it, the
// phone held out at the counter, its balance spilling off the screen as split-flap digit tiles over the counter;
// Mrs. Vance behind the counter, a paper cup held out, shocked. Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { dir, joints, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { chaiStall, citySkyline } from "@whatif/kit/sets";
import { Deep, setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { BALANCE, CANDIDATES, HERO, headOf, TILES, VENDOR, type Candidate, type Tag } from "./data";

/** The set's camera: the counter and the stall, close. */
const CAM: Camera = { x: 1150, y: 670, zoom: 2 };
const MOOD = "night" as const;
const OPTIONS = { ...chaiStall.defaults, poured: false, glasses: 0, steam: 1 };
const BAY = { ...citySkyline.defaults, birds: false, traffic: true, shoreLamps: true };

/** The kiosk round the counter: a dark plank wall behind Mrs. Vance, posts, a striped roof, a chalkboard of prices
 *  (chalk marks, no words) and the bulb. World units, at the stall's depth; the bay shows to the left of it. */
const KioskBack: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={1}>
    <rect x={1080} y={380} width={700} height={540} fill="#3a2a26" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={1080 + i * 78} y={380} width={4} height={540} fill="#2a1d1a" />)}
    <rect x={1150} y={430} width={170} height={120} rx={6} fill="#24342c" stroke="#7a5a3a" strokeWidth={8} />
    {[0, 1, 2].map((i) => <path key={i} d={`M${1170} ${460 + i * 32} q30 -8 60 0 t60 0`} fill="none" stroke="#e8e2cf" strokeWidth={4} opacity={0.7} />)}
    {[1060, 1790].map((x) => <rect key={x} x={x} y={300} width={16} height={620} fill="#4a3a30" />)}
    <path d="M980 340 L1040 270 H1830 L1890 340Z" fill="#2f5d73" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${1000 + i * 110} 340 l55 0 l0 18 q-27 14 -55 0Z`} fill={i % 2 ? "#e8e2cf" : "#2f5d73"} stroke={INK} strokeWidth={3} />)}
    <line x1={1230} y1={340} x2={1230} y2={346} stroke={INK} strokeWidth={3} />
    <circle cx={1230} cy={360} r={16} fill="#fff1c8" stroke={INK} strokeWidth={3} />
  </Deep>
);

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

/** One split-flap digit tile, the film's rule device, cut loose from the counter. */
const Tile: React.FC<{ ch: string; x: number; y: number; s: number; r: number }> = ({ ch, x, y, s, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-58} y={-76} width={116} height={152} rx={16} fill="#000" opacity={0.35} transform="translate(8 12)" />
    <rect x={-58} y={-76} width={116} height={152} rx={16} fill={INK} stroke={PAPER} strokeWidth={6} />
    <line x1={-58} y1={0} x2={58} y2={0} stroke="#0d0e12" strokeWidth={5} />
    <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={118} fill={PAPER}>{ch}</text>
  </g>
);

/** Where your front hand lands on screen, from the rig's own maths. */
function handAt(x: number, y: number, scale: number, pose: Pose) {
  const sh = joints(pose).shoulder;
  const a = dir(pose.armF[0]);
  const b = dir(pose.armF[0] + pose.armF[1]);
  return { x: x + (sh.x + (a.x + b.x) * LIMB) * scale, y: y + (sh.y + (a.y + b.y) * LIMB) * scale };
}

/** The phone, big, its screen full of the balance, the digits running off the right edge of the glass. */
const Phone: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-10)`}>
    <rect x={-20} y={-250} width={170} height={300} rx={26} fill="#0d0e14" />
    <rect x={-8} y={-238} width={146} height={276} rx={18} fill="#e9f6f2" />
    <rect x={-8} y={-238} width={146} height={276} rx={18} fill={TEAL} opacity={0.18} />
    <rect x={8} y={-210} width={70} height={14} rx={7} fill={INK} opacity={0.5} />
    <text x={8} y={-120} fontFamily={FONT} fontWeight={800} fontSize={64} fill={INK}>{BALANCE.slice(0, 4)}</text>
    <text x={8} y={-54} fontFamily={FONT} fontWeight={800} fontSize={64} fill={INK}>{BALANCE.slice(4, 8)}</text>
  </g>
);

/** A paper cup of coffee with a lid, in the figure's own units. */
const PaperCup: React.FC = () => (
  <g transform="translate(0 -10) rotate(8)">
    <path d="M-14 -30 L14 -30 L10 12 L-10 12Z" fill="#f3e9d7" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <rect x={-13} y={-10} width={26} height={10} fill="#9a6a44" />
    <rect x={-16} y={-36} width={32} height={8} rx={3} fill="#3b3e47" />
  </g>
);

/** Mrs. Vance's grey bun, on the back of her head (she faces left). */
const Bun: React.FC = () => {
  const offer: Pose = { ...STAND, lean: -6, tilt: -10, armF: [96, 62], armB: [-10, 12] };
  const j = joints(offer);
  const hx = VENDOR.x - j.head.x * VENDOR.scale, hy = VENDOR.y + j.head.y * VENDOR.scale;
  return <circle cx={hx + 40 * VENDOR.scale} cy={hy - 36 * VENDOR.scale} r={16 * VENDOR.scale} fill="#c9c6c0" stroke={INK} strokeWidth={4} />;
};

/** A pool of shadow on the set behind your head, so the mustard head stands at 3:1 in greyscale (K4). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  const c = { x: CAM.x + (head.x - 960) / CAM.zoom, y: CAM.y + (head.y - 540) / CAM.zoom };
  return (
    <g>
      <defs>
        <radialGradient id="money-shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.35" stopColor="#07080d" stopOpacity={0.85} />
          <stop offset="1" stopColor="#07080d" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={c.x} cy={c.y} r={260} fill="url(#money-shade)" />
    </g>
  );
};

const Scene: React.FC = () => {
  const props = { cam: CAM, mood: MOOD, frame: 40, options: OPTIONS };
  const hand = handAt(HERO.x, HERO.y, HERO.scale, HERO.pose);
  const offer: Pose = { ...STAND, lean: -6, tilt: -10, armF: [96, 62], armB: [-10, 12] };
  const actors = (
    <>
      <OnScreen>
        <Figure x={VENDOR.x} y={VENDOR.y} scale={VENDOR.scale} facing={-1} pose={offer} head="#b58fc7" coat="#efe9dc"
          {...EXPRESSIONS.shocked} eyes={1.35} look={{ x: 0.9, y: 0.25 }}
          held={<PaperCup />} />
        <Bun />
      </OnScreen>
      {chaiStall.Mid?.(props)}
      <OnScreen>
        {TILES.map((t, i) => <Tile key={i} {...t} />)}
        <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.15}
          time={3} {...EXPRESSIONS.happy} brows="raised" mouth="open" eyes={1.2} look={HERO.look} />
        <Phone x={hand.x - 40} y={hand.y + 30} />
      </OnScreen>
    </>
  );
  return (
    <LookContext.Provider value={setLook([...chaiStall.lights(OPTIONS), ...citySkyline.lights(BAY)], MOOD, CAM)}>
      <Stage cam={CAM} radius={0} origin={{ x: 960, y: 540 }} back={<>{citySkyline.Back({ ...props, options: BAY })}<KioskBack cam={CAM} /><Shade /></>} actors={actors} />
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

export const MoneyThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
