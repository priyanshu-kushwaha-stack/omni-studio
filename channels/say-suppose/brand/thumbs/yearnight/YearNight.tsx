// "What If You Lived a Year Every Night?" thumbnails, v2 (2026-11-14, K17), drawn with the what-if engine's kit: a hall
// of sleep pods (two tiers of pod hatches, each with a warm porthole lamp, no lettering anywhere). You sit half out of
// the open pod at the left, lids heavy and a sly grin, juggling three coils of teal cable in a perfect cascade; the
// split-flap day counter on the pod frame has stopped on 365 in crimson; your flatmate, jaw dropped, lets her mop slide
// out of her hand. A high window lets one wedge of morning onto the far wall. Frame i is candidate i. No AI images.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { CANDIDATES, COUNTER, COUNTER_AT, HERO, headOf, MATE, type Candidate, type Tag } from "./data";

const CAM: Camera = { x: 960, y: 540, zoom: 1 };
const MOOD = "night" as const;
const LAMP = "#ffc46b";
const WALL = "#151a2a";

const WordTag: React.FC<{ t: Tag }> = ({ t }) => (
  <div style={{
    position: "absolute", top: t.y, right: t.x, transform: `rotate(${t.tilt}deg)`, transformOrigin: "right center",
    background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22, textAlign: "right",
    fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1.02, letterSpacing: 2,
    padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(0,0,0,.45)",
  }}>{t.lines.map((l) => <div key={l}>{l}</div>)}</div>
);

/** One crimson split-flap tile of the day counter, its lower flap just landed. */
const Tile: React.FC<{ ch: string; x: number; y: number; s: number }> = ({ ch, x, y, s }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill="#000" opacity={0.4} transform={`translate(${s * 0.05} ${s * 0.08})`} />
    <rect x={-s * 0.4} y={-s * 0.55} width={s * 0.8} height={s * 1.1} rx={s * 0.1} fill={CRIMSON} stroke={PAPER} strokeWidth={s * 0.045} />
    <line x1={-s * 0.4} y1={0} x2={s * 0.4} y2={0} stroke="#7a1022" strokeWidth={s * 0.035} />
    <text x={0} y={s * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s * 0.82} fill={PAPER}>{ch}</text>
  </g>
);

/** The day counter: three tiles on an ink plate bolted to the pod frame. */
const Counter: React.FC = () => {
  const { x, y, tile } = COUNTER_AT;
  const chars = COUNTER.split("");
  const w = tile * 0.86;
  const x0 = x - ((chars.length - 1) * w) / 2;
  return (
    <g>
      <rect x={x0 - tile * 0.55} y={y - tile * 0.7} width={(chars.length - 1) * w + tile * 1.1} height={tile * 1.4} rx={tile * 0.16} fill={INK} stroke={PAPER} strokeWidth={8} />
      {chars.map((ch, i) => <Tile key={i} ch={ch} x={x0 + i * w} y={y} s={tile} />)}
    </g>
  );
};

/** A pod hatch in the wall: a rounded frame, a closed door, a warm porthole lamp. */
const Pod: React.FC<{ x: number; y: number; w: number; h: number; lit: boolean; dim: number }> = ({ x, y, w, h, lit, dim }) => (
  <g opacity={dim}>
    <rect x={x} y={y} width={w} height={h} rx={34} fill="#262d45" stroke={INK} strokeWidth={6} />
    <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} rx={24} fill="#1d2338" stroke="#3a4363" strokeWidth={4} />
    <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * 0.2} fill={lit ? LAMP : "#2b3250"} stroke={INK} strokeWidth={5} />
    {lit && <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * 0.2} fill="url(#porthole)" />}
    <rect x={x + w - 40} y={y + h / 2 - 22} width={14} height={44} rx={6} fill="#3a4363" />
  </g>
);

/** The hall behind: two tiers of pods down the right wall, the wedge of morning, the floor. */
const Hall: React.FC = () => {
  const pods: React.ReactNode[] = [];
  const cols = [760, 1080, 1400, 1720];
  cols.forEach((x, i) => {
    pods.push(<Pod key={`u${i}`} x={x} y={150} w={290} h={300} lit={i % 2 === 0} dim={0.8} />);
    pods.push(<Pod key={`l${i}`} x={x} y={480} w={290} h={300} lit={i !== 1} dim={0.9} />);
  });
  return (
    <g>
      <defs>
        <radialGradient id="porthole" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6dc" stopOpacity={0.9} />
          <stop offset="1" stopColor={LAMP} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="wedge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9b8" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffe9b8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={1960} height={1120} fill={WALL} />
      <polygon points="1240,0 1560,0 1880,820 1380,820" fill="url(#wedge)" />
      {pods}
      <rect x={-20} y={810} width={1960} height={290} fill="#20232e" />
      <rect x={-20} y={804} width={1960} height={12} fill="#3a3e4c" />
    </g>
  );
};

/** Your pod, the one you just climbed half out of: a big open capsule at the left, its door swung up, a warm reading
 *  lamp inside, a pillow and the mattress edge, so the opening reads as a bed-sized pod and not a doorway. */
const YourPod: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="podlamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffd98a" stopOpacity={0.55} />
        <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-120} y={170} width={920} height={980} rx={70} fill="#2c3350" stroke={INK} strokeWidth={10} />
    <rect x={-90} y={200} width={860} height={920} rx={54} fill="#0a0c16" stroke="#47507a" strokeWidth={6} />
    {/* the reading lamp in the pod's ceiling, far corner, and its pool of light */}
    <circle cx={90} cy={300} r={260} fill="url(#podlamp)" />
    <rect x={40} y={226} width={110} height={30} rx={12} fill={LAMP} stroke={INK} strokeWidth={5} />
    {/* the pillow at the back and the mattress edge */}
    <path d="M-60 880 Q-40 800 60 806 L230 812 Q300 820 290 880 Q280 930 200 928 L-30 926 Q-70 920 -60 880Z" fill="#cfd3e6" stroke={INK} strokeWidth={6} />
    <rect x={-90} y={930} width={860} height={190} fill="#39406a" stroke={INK} strokeWidth={6} />
    <rect x={-90} y={930} width={860} height={26} fill="#5a6390" />
    {/* the door, swung up over the opening */}
    <rect x={-100} y={60} width={880} height={110} rx={30} fill="#323a5a" stroke={INK} strokeWidth={8} />
    <circle cx={340} cy={115} r={34} fill="#2b3250" stroke={INK} strokeWidth={5} />
    {/* the cable, out of the socket under the counter and down over the lip */}
    <path d="M800 560 C 720 700, 900 800, 800 920 S 720 1040, 790 1100" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d="M800 560 C 720 700, 900 800, 800 920 S 720 1040, 790 1100" fill="none" stroke={TEAL} strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** A mop, held in the flatmate's back hand; `tip` degrees as it slides out of her grip. */
const Mop: React.FC<{ x: number; y: number; tip?: number }> = ({ x, y, tip = 0 }) => (
  <g transform={`rotate(${tip} ${x} ${y})`}>
    <line x1={x} y1={y - 420} x2={x} y2={y + 420} stroke="#c9915a" strokeWidth={22} strokeLinecap="round" />
    <line x1={x} y1={y - 420} x2={x} y2={y + 420} stroke={INK} strokeWidth={4} opacity={0.5} />
    <path d={`M${x - 90} ${y + 420} Q${x} ${y + 360} ${x + 90} ${y + 420} L${x + 70} ${y + 520} L${x - 70} ${y + 520} Z`} fill="#dcd6c6" stroke={INK} strokeWidth={6} />
  </g>
);

function handAt(x: number, y: number, scale: number, facing: 1 | -1, pose: Pose, arm: "armF" | "armB") {
  const sh = joints(pose).shoulder;
  const a = dir(pose[arm][0]);
  const b = dir(pose[arm][0] + pose[arm][1]);
  return { x: x + facing * (sh.x + (a.x + b.x) * LIMB) * scale, y: y + (sh.y + (a.y + b.y) * LIMB) * scale };
}

/** Stunned: leaning back, the front hand up and open, the back hand letting go of the mop. */
const TALK: Pose = { ...STAND, lean: 5, tilt: 6, armF: [80, 50], armB: [30, 40] };

/** One coil of the boss's teal cable, a loop with its plug tail. */
const Coil: React.FC<{ x: number; y: number; r: number; turn: number }> = ({ x, y, r, turn }) => (
  <g transform={`translate(${x} ${y}) rotate(${turn})`}>
    {[0, 0.16, 0.32].map((k) => (
      <ellipse key={k} cx={k * r * 0.3} cy={k * r * 0.2} rx={r} ry={r * 0.82} fill="none" stroke={INK} strokeWidth={r * 0.3} />
    ))}
    {[0, 0.16, 0.32].map((k) => (
      <ellipse key={k} cx={k * r * 0.3} cy={k * r * 0.2} rx={r} ry={r * 0.82} fill="none" stroke={TEAL} strokeWidth={r * 0.16} />
    ))}
    <rect x={r * 0.9} y={-r * 0.2} width={r * 0.5} height={r * 0.36} rx={r * 0.08} fill="#d9dde8" stroke={INK} strokeWidth={r * 0.08} />
  </g>
);

/** The cascade: three coils in an arc between your hands and the counter, a dotted path over the top. */
const Cascade: React.FC = () => {
  const coils = [
    { x: 770, y: 640, r: 88, turn: -20 },
    { x: 880, y: 445, r: 92, turn: 15 },
    { x: 1045, y: 610, r: 88, turn: 40 },
  ];
  return (
    <g>
      <path d="M1040 520 Q 890 250 770 540" fill="none" stroke={PAPER} strokeWidth={8} strokeDasharray="6 30" strokeLinecap="round" opacity={0.7} />
      {coils.map((c, i) => <Coil key={i} {...c} />)}
    </g>
  );
};

/** A pool of shadow behind your head inside the pod, so the mustard head stands at 3:1 in greyscale (K4). */
const Shade: React.FC = () => {
  const head = headOf(HERO);
  return <circle cx={head.x} cy={head.y} r={head.r * 1.6} fill="#000" opacity={0.35} />;
};

const Scene: React.FC = () => {
  const mopHand = handAt(MATE.x, MATE.y, MATE.scale, -1, TALK, "armB");
  const actors = (
    <g>
      <Hall />
      <Figure x={MATE.x} y={MATE.y} scale={MATE.scale} facing={-1} pose={TALK} head="#c9b4ec" coat="#e9e1cf"
        brows="raised" lids={0} mouth="o" eyes={1.3} look={{ x: 0.9, y: -0.25 }} />
      <Mop x={mopHand.x + 40} y={mopHand.y + 60} tip={-24} />
      <YourPod />
      <Shade />
      <Counter />
      <Figure x={HERO.x} y={HERO.y} scale={HERO.scale} pose={HERO.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.05}
        time={3} brows="flat" lids={0.5} mouth="smirk" eyes={0.9} look={HERO.look} />
      <Cascade />
    </g>
  );
  return (
    <LookContext.Provider value={setLook([], MOOD, CAM)}>
      <Stage cam={CAM} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />
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

export const YearThumbs: React.FC = () => {
  const frame = useCurrentFrame();
  return <Thumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};
