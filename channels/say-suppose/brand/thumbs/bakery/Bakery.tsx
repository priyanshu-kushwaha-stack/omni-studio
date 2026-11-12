// "Doubled your money every day" G1 restart thumbnails (2026-11-12), drawn with the what-if engine's kit: Lotte's
// bakery under your flat in Berlin at night. The library's city skyline (`citySkyline.Back`) behind you; the bakery
// wall (cream tiles, bread rack, pretzel sign, a chalkboard of chalk marks) and the counter with its bread basket are
// drawn here. You at the left own it, the phone held up, its balance peeling off the screen as a paper ribbon of
// digits into the bread basket; Lotte behind the counter, chalk in hand, shocked. Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { dir, joints, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { citySkyline } from "@whatif/kit/sets";
import { Deep, setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { BALANCE, CANDIDATES, COUNTER_TOP, HERO, headOf, TILES, VENDOR, type Candidate, type Tag } from "./data";

/** The set's camera: the counter, close. */
const CAM: Camera = { x: 1150, y: 670, zoom: 2 };
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

/** A stick of chalk, in the figure's own units. */
const Chalk: React.FC = () => <rect x={-4} y={-26} width={8} height={30} rx={3} fill={PAPER} stroke={INK} strokeWidth={2.5} transform="rotate(-20)" />;

/** Lotte's hair, tied up at the back of her head (she faces left). */
const Bun: React.FC = () => {
  const j = joints(OFFER);
  const hx = VENDOR.x - j.head.x * VENDOR.scale, hy = VENDOR.y + j.head.y * VENDOR.scale;
  return <circle cx={hx + 40 * VENDOR.scale} cy={hy - 36 * VENDOR.scale} r={16 * VENDOR.scale} fill="#8a6a52" stroke={INK} strokeWidth={4} />;
};

const OFFER: Pose = { ...STAND, lean: -6, tilt: -10, armF: [100, 70], armB: [-10, 12] };

/** The bakery behind Lotte, in screen pixels: a cream tiled wall, a rack of loaves, a pretzel sign, a chalkboard of
 *  chalk marks (no figures: K5 counts words), a warm lamp. The city shows to the left of it, behind you. */
const BakeryWall: React.FC = () => (
  <g>
    <rect x={980} y={0} width={940} height={COUNTER_TOP + 10} fill="#d9cfb4" />
    {Array.from({ length: 12 }, (_, i) => <line key={`h${i}`} x1={980} y1={i * 72} x2={1920} y2={i * 72} stroke="#b9ae92" strokeWidth={3} />)}
    {Array.from({ length: 14 }, (_, i) => <line key={`v${i}`} x1={980 + i * 72} y1={0} x2={980 + i * 72} y2={COUNTER_TOP} stroke="#b9ae92" strokeWidth={3} />)}
    <rect x={960} y={0} width={30} height={COUNTER_TOP + 10} fill="#5a4030" stroke={INK} strokeWidth={5} />
    <g transform="translate(1440 120)">
      <rect x={0} y={0} width={420} height={250} rx={10} fill="#22302a" stroke="#7a5a3a" strokeWidth={14} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M40 ${55 + i * 48} q50 -14 100 0 t100 0 M300 ${55 + i * 48} h60`} fill="none" stroke="#efe9dc" strokeWidth={6} strokeLinecap="round" opacity={0.75} />)}
    </g>
    <g transform="translate(1700 470)">
      {[0, 1, 2].map((r) => <rect key={r} x={-170} y={r * 100} width={360} height={14} fill="#6b4a32" stroke={INK} strokeWidth={4} />)}
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => <ellipse key={`${r}-${k}`} cx={-130 + k * 88} cy={r * 100 - 24} rx={40} ry={26} fill="#c98a4a" stroke={INK} strokeWidth={4} />))}
    </g>
    <g transform="translate(1260 90)">
      <line x1={0} y1={-90} x2={0} y2={-10} stroke={INK} strokeWidth={5} />
      <path d="M-70 40 C-90 -20 -20 -40 0 10 C20 -40 90 -20 70 40 C55 80 -55 80 -70 40Z M-30 30 L30 30" fill="#c98a4a" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </g>
    <line x1={1160} y1={0} x2={1160} y2={40} stroke={INK} strokeWidth={4} />
    <circle cx={1160} cy={58} r={22} fill="#fff1c8" stroke={INK} strokeWidth={4} />
  </g>
);

/** The counter's front and top, in screen pixels, with the bread basket the digits pour into. */
const Counter: React.FC = () => (
  <g>
    <rect x={930} y={COUNTER_TOP} width={1000} height={1080 - COUNTER_TOP} fill="#7a5236" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={930 + i * 170} y1={COUNTER_TOP + 40} x2={930 + i * 170} y2={1080} stroke="#5f3e28" strokeWidth={5} />)}
    <rect x={910} y={COUNTER_TOP - 22} width={1030} height={34} rx={8} fill="#a8774f" stroke={INK} strokeWidth={8} />
    <g transform={`translate(1560 ${COUNTER_TOP - 18})`}>
      <ellipse cx={0} cy={-34} rx={64} ry={30} fill="#d89a58" stroke={INK} strokeWidth={5} />
      <ellipse cx={-70} cy={-24} rx={50} ry={24} fill="#c98a4a" stroke={INK} strokeWidth={5} />
      <path d="M-170 -20 L170 -20 L140 40 L-140 40Z" fill="#b8874f" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {[-110, -55, 0, 55, 110].map((x) => <line key={x} x1={x} y1={-16} x2={x * 0.85} y2={36} stroke="#7a5236" strokeWidth={4} />)}
    </g>
  </g>
);

/** The paper ribbon the digits ride on, out of the phone and over the counter edge into the basket. */
const Ribbon: React.FC = () => (
  <g>
    <path d="M930 650 C 1080 640, 1180 760, 1300 820 S 1480 930, 1560 1000" fill="none" stroke={INK} strokeWidth={96} strokeLinecap="round" />
    <path d="M930 650 C 1080 640, 1180 760, 1300 820 S 1480 930, 1560 1000" fill="none" stroke="#f4efe2" strokeWidth={84} strokeLinecap="round" />
  </g>
);

/** A pool of shadow on the set behind your head, so the mustard head stands at 3:1 in greyscale (K4). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  const c = { x: CAM.x + (head.x - 960) / CAM.zoom, y: CAM.y + (head.y - 540) / CAM.zoom };
  return (
    <g>
      <defs>
        <radialGradient id="bakery-shade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.35" stopColor="#07080d" stopOpacity={0.85} />
          <stop offset="1" stopColor="#07080d" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={c.x} cy={c.y} r={260} fill="url(#bakery-shade)" />
    </g>
  );
};

const Scene: React.FC = () => {
  const props = { cam: CAM, mood: MOOD, frame: 40, options: CITY };
  const hand = handAt(HERO.x, HERO.y, HERO.scale, HERO.pose);
  const actors = (
    <>
      <OnScreen>
        <BakeryWall />
        <Figure x={VENDOR.x} y={VENDOR.y} scale={VENDOR.scale} facing={-1} pose={OFFER} head="#f0a98e" coat="#efe9dc"
          {...EXPRESSIONS.shocked} eyes={1.35} look={{ x: 0.9, y: 0.25 }} held={<Chalk />} />
        <Bun />
        <Counter />
        <Ribbon />
        {TILES.map((t, i) => <Tile key={i} {...t} />)}
        <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.15}
          time={3} {...EXPRESSIONS.happy} brows="raised" mouth="open" eyes={1.2} look={HERO.look} />
        <Phone x={hand.x - 40} y={hand.y + 30} />
      </OnScreen>
    </>
  );
  return (
    <LookContext.Provider value={setLook([...citySkyline.lights(CITY)], MOOD, CAM)}>
      <Stage cam={CAM} radius={0} origin={{ x: 960, y: 540 }} back={<>{citySkyline.Back({ ...props, options: CITY })}<Shade /></>} actors={actors} />
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

export const BakeryThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
