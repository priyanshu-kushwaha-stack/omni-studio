// The film's key shot, staged exactly as the thumbnail frames it (brand/thumbs/yearnight; owner, 2026-11-12: "the
// thumbnail is the film's strongest picture, and the film stages its key shot exactly as the thumbnail frames it").
// Seven in the morning in the hall of sleep pods: you, large at the left, sitting half out of your open pod, door
// swung up, the reading lamp and pillow inside; the crimson day counter on the pod frame; your flatmate right of
// centre, apron and mop, mid-sentence. Drawn in REF screen coordinates (camera REF: x 960, y 540, zoom 1); push in
// with a camera of your own. Every switch is a prop, so the skit can play it: the door shut (you inside), the counter
// fluttering, the stare, her mouth.
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import type { Brows, Mouth } from "@whatif/kit/rig/Figure";
import { INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { Counter } from "../parts";
import { FLATMATE, HERO as YOU } from "../shared";

const LAMP = "#ffc46b";
const WALL = "#151a2a";

/** You on the lip of your pod, shoulders sunk, the front hand gripping the rim (the thumbnail's HERO). */
export const KEY_POSE: Pose = { ...SEATED, lean: 4, tilt: 6, armF: [28, 40], armB: [-6, 30] };
export const KEY_HERO = { x: 470, y: 1694, scale: 4.3 };
export const KEY_MATE = { x: 1500, y: 1500, scale: 3.1 };
export const KEY_COUNTER = { x: 975, y: 470, tile: 150 };
/** Mid-sentence: the front hand up and open, the back hand on the mop. */
export const TALK: Pose = { ...STAND, lean: -3, tilt: -4, armF: [70, 60], armB: [25, 95] };

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
const Hall: React.FC<{ wedge: boolean }> = ({ wedge }) => {
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
      <rect x={-200} y={-200} width={2320} height={1480} fill={WALL} />
      {wedge && <polygon points="1240,0 1560,0 1880,820 1380,820" fill="url(#wedge)" />}
      {pods}
      <rect x={-200} y={810} width={2320} height={470} fill="#20232e" />
      <rect x={-200} y={804} width={2320} height={12} fill="#3a3e4c" />
    </g>
  );
};

/** Your pod, the one you just climbed half out of: a big open capsule at the left, its door swung up, a warm reading
 *  lamp inside, a pillow and the mattress edge, so the opening reads as a bed-sized pod and not a doorway. */
const YourPod: React.FC<{ door: number }> = ({ door }) => (
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
    {/* the door: swung up over the opening (door 1), or down over it (door 0) */}
    {door > 0 && (
      <g>
        <rect x={-100} y={170 - 110 * door} width={880} height={110 * door} rx={30} fill="#323a5a" stroke={INK} strokeWidth={8} />
        {door > 0.6 && <circle cx={340} cy={115} r={34} fill="#2b3250" stroke={INK} strokeWidth={5} />}
      </g>
    )}
    {door < 1 && (
      <g>
        <rect x={-90} y={200} width={860} height={920 * (1 - door)} rx={54} fill="#323a5a" stroke={INK} strokeWidth={8} />
        {door < 0.3 && <circle cx={340} cy={560} r={70} fill={LAMP} stroke={INK} strokeWidth={8} opacity={0.9} />}
      </g>
    )}
    {/* the cable, out of the socket under the counter and down over the lip */}
    <path d="M800 560 C 720 700, 900 800, 800 920 S 720 1040, 790 1100" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d="M800 560 C 720 700, 900 800, 800 920 S 720 1040, 790 1100" fill="none" stroke={TEAL} strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** A mop, held upright in the flatmate's back hand. */
const Mop: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
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


export interface KeyShotProps {
  frame: number;
  /** Your pod's door: 1 swung up (the thumbnail), 0 shut over the opening (you inside). */
  door?: number;
  /** You visible on the lip (false while you are inside, door shut). */
  you?: boolean;
  /** The counter: fluttering from `at`, else steady on `value`; `dark` for the last morning. */
  counter?: { at?: number; value?: string; dark?: boolean };
  /** Your face. The thumbnail: lids 0.62, brows flat, mouth flat, look at her. */
  lids?: number;
  brows?: Brows;
  mouth?: Mouth;
  look?: { x: number; y: number };
  /** Your flatmate's face: mouth open mid-word by default. */
  mateMouth?: Mouth;
  mateBrows?: Brows;
  mateLook?: { x: number; y: number };
  /** The morning wedge from the high window (the thumbnail has it). */
  wedge?: boolean;
  blink?: boolean;
}

/** The key shot's world, in REF screen coordinates: put it in a <Stage> `actors` slot with a camera of your own. */
export const KeyShot: React.FC<KeyShotProps> = ({
  frame, door = 1, you = true, counter, lids = 0.62, brows = "flat", mouth = "flat", look = { x: 0.95, y: 0.05 },
  mateMouth = "open", mateBrows = "raised", mateLook = { x: 0.9, y: 0.1 }, wedge = true, blink,
}) => {
  const mopHand = handAt(KEY_MATE.x, KEY_MATE.y, KEY_MATE.scale, -1, TALK, "armB");
  return (
    <g>
      <Hall wedge={wedge} />
      <Figure x={KEY_MATE.x} y={KEY_MATE.y} scale={KEY_MATE.scale} facing={-1} pose={TALK} head={FLATMATE.head} coat={FLATMATE.coat}
        brows={mateBrows} lids={0} mouth={mateMouth} eyes={1.05} look={mateLook} blink={blink} />
      <Mop x={mopHand.x} y={mopHand.y} />
      <YourPod door={door} />
      {you && <circle cx={KEY_HERO.x + 46} cy={560} r={198 * 1.6} fill="#000" opacity={0.35} />}
      <Counter frame={frame} x={KEY_COUNTER.x} y={KEY_COUNTER.y} tile={KEY_COUNTER.tile} at={counter?.at}
        value={counter?.value ?? "365"} dark={counter?.dark} />
      {you && (
        <Figure x={KEY_HERO.x} y={KEY_HERO.y} scale={KEY_HERO.scale} pose={KEY_POSE} head={YOU.head} scarf={YOU.scarf} tuft
          flow={0.05} time={frame / 30} brows={brows} lids={lids} mouth={mouth} eyes={0.9} look={look} blink={blink} />
      )}
    </g>
  );
};
