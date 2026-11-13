// Helpers shared by the first four beats (Tell Me Tomorrow, The Rule, The Piano, Seven Years a Week): timing from the
// narration, the cast as figures, where hands are, the hall of pods on a Stage, the desk front and crate, a paper
// overlay in screen pixels for inserts, a TAG label, the inside of a pod, and hands for inserts.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import type { Expression } from "@whatif/kit/rig/expressions";
import { dir, joints, LIMB, reach, SEATED, seatedY, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Cable, Mop } from "../parts";
import { POD_ONE, PodHallBack, podHallLights, type PodHallProps } from "../sets/PodHall";
import { blinking, BOSS, FLATMATE, HERO, lastIndex, OLD, PIANO, type Shot } from "../shared";

// ------------------------------------------------------------------------------------------------ timing

/** p of the way through line i. */
export const at = (clips: Clip[], i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);

/** Roughly when a phrase is spoken in line i: its share of the line's text, mapped onto the clip (the first of several
 *  phrasings found; the line's start when none is). */
export function atText(shot: Shot, i: number, phrase: string | string[], nudge = 0): number {
  const text = shot.lines[i]?.text ?? "";
  const k = (Array.isArray(phrase) ? phrase : [phrase]).map((p) => text.indexOf(p)).find((n) => n >= 0) ?? -1;
  const p = k < 0 ? 0 : k / Math.max(1, text.length);
  return at(shot.clips, i, p) + nudge;
}

/** The mood of the line being spoken (or the last one spoken). */
export function moodNow(shot: Shot): MoodName {
  const i = Math.max(0, lastIndex(shot.clips, (c) => shot.frame >= c.from));
  return (shot.lines[i]?.mood ?? "night") as MoodName;
}

// ------------------------------------------------------------------------------------------------ bodies

export interface Body { x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }
export type Face = Partial<Expression>;

export function shoulderAt(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
}

export function handAt(b: Body, arm: "front" | "back" = "front") {
  const s = shoulderAt(b);
  const [u, f] = arm === "front" ? b.pose.armF : b.pose.armB;
  const a = dir(u), c = dir(u + f);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

export function headOf(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.head.x * b.scale * b.facing, y: b.y + j.head.y * b.scale, r: 46 * b.scale };
}

type Who = "you" | "mate" | "boss" | "old" | "piano" | { head: string; coat?: string };

/** One of the cast as a Figure: you (mustard, tuft, teal scarf), your flatmate (lilac, cream apron), your boss (tie),
 *  the old sleeper (grey, lids heavy), the piano teacher (grey head, green cardigan), or anyone by colours. */
export const Person: React.FC<{ who: Who; b: Body; face: Face; frame: number; seed?: number; held?: React.ReactNode; coat?: string; rotate?: number }> = ({
  who, b, face, frame, seed = 0, held, coat, rotate,
}) => {
  const base = { x: b.x, y: b.y, scale: b.scale, facing: b.facing, pose: b.pose, time: frame / 30, blink: blinking(frame, seed), held, rotate };
  if (who === "you") return <Figure {...base} head={HERO.head} scarf={HERO.scarf} tuft flow={0.08} coat={coat} {...face} />;
  if (who === "mate") return <Figure {...base} head={FLATMATE.head} coat={coat ?? FLATMATE.coat} {...face} />;
  if (who === "boss") return <Figure {...base} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie} {...face} />;
  if (who === "old") return <Figure {...base} head={OLD.head} coat={OLD.coat} {...face} lids={Math.max(0.8, face.lids ?? 0.85)} />;
  if (who === "piano") return <Figure {...base} head={PIANO.head} coat={PIANO.coat} {...face} />;
  return <Figure {...base} head={who.head} coat={coat ?? who.coat} {...face} />;
};

// ------------------------------------------------------------------------------------------------ the hall

/** The hall of pods on a Stage, lit for the mood. `actors` are in the hall's world coordinates (REF). */
export const HallStage: React.FC<{ frame: number; cam: Camera; mood: MoodName; hall?: Omit<PodHallProps, "cam" | "frame">; actors: React.ReactNode }> = ({
  frame, cam, mood, hall = {}, actors,
}) => (
  <LookContext.Provider value={setLook(podHallLights(), mood, cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<PodHallBack cam={cam} frame={frame} {...hall} />} actors={actors} />
  </LookContext.Provider>
);

/** The night desk's front, drawn over the boss so he stands behind it (PodHall's Desk shape). */
export const DeskFront: React.FC = () => (
  <g>
    <rect x={110} y={790} width={420} height={170} rx={10} fill="#5b4636" stroke={INK} strokeWidth={6} />
    <rect x={150} y={820} width={340} height={10} rx={4} fill="#4a382b" />
    <rect x={96} y={772} width={448} height={28} rx={8} fill="#7a5d47" stroke={INK} strokeWidth={6} />
  </g>
);

/** The crate on the desk: its lid tears up and off (`torn` 0..1); `coils` coils of teal cable showing inside. */
export const Crate: React.FC<{ x?: number; y?: number; torn: number; coils?: number }> = ({ x = 180, y = 772, torn, coils = 4 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-95} y={-90} width={190} height={90} rx={6} fill="#b8895a" stroke={INK} strokeWidth={5} />
    <line x1={-95} y1={-45} x2={95} y2={-45} stroke={INK} strokeWidth={4} opacity={0.4} />
    {torn > 0.3 && Array.from({ length: coils }, (_, i) => (
      <ellipse key={i} cx={-60 + i * 40} cy={-90} rx={24} ry={10} fill="none" stroke="#1D9A8F" strokeWidth={8} />
    ))}
    <g transform={`translate(${-95 + torn * 30} ${-90 - torn * 60}) rotate(${-torn * 38})`}>
      <rect x={0} y={-12} width={190} height={14} rx={4} fill="#caa070" stroke={INK} strokeWidth={4} />
      {torn > 0 && torn < 1 && <path d="M150 2 l10 10 l8 -8 l10 10" fill="none" stroke={INK} strokeWidth={3} />}
    </g>
  </g>
);

/** A coil of teal cable with a small plug, held or lying (centre at 0, 0). */
export const Coil: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={0} rx={30} ry={20} fill="none" stroke={INK} strokeWidth={14} />
    <ellipse cx={0} cy={0} rx={30} ry={20} fill="none" stroke="#1D9A8F" strokeWidth={8} />
    <ellipse cx={4} cy={4} rx={22} ry={13} fill="none" stroke="#1D9A8F" strokeWidth={6} />
    <path d="M28 6 Q46 18 52 34" fill="none" stroke="#1D9A8F" strokeWidth={6} />
    <rect x={46} y={32} width={14} height={18} rx={4} fill="#cfd3e6" stroke={INK} strokeWidth={3} />
  </g>
);

// ------------------------------------------------------------------------------------------------ paper over the picture

/** An SVG over the whole frame in screen pixels, for paper inserts and labels (not moved by the camera). */
export const Overlay: React.FC<{ children: React.ReactNode; dim?: number }> = ({ children, dim = 0 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {dim > 0 && <rect width={1920} height={1080} fill="#0b0d16" opacity={dim} />}
      {children}
    </svg>
  </AbsoluteFill>
);

/** A `> TAG:` label: ink on a cream paper tab, top left inside the safe area. */
export const TagLabel: React.FC<{ text: string; frame: number; at: number; until?: number; x?: number; y?: number }> = ({ text, frame, at: from, until, x = 150, y = 120 }) => {
  if (frame < from || (until !== undefined && frame >= until)) return null;
  const s = Math.min(1, (frame - from) / 6);
  const w = text.length * 34 + 70;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={6} y={10} width={w} height={84} rx={12} fill="#000" opacity={0.3} />
      <rect width={w} height={84} rx={12} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect width={16} height={84} rx={6} fill="#d8344f" />
      <text x={w / 2 + 8} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={50} fill={INK}>{text}</text>
    </g>
  );
};

/** A hand for inserts: a sleeve from `from` to the hand at (x, y), the hand a mustard (or `skin`) mitten; `fingers`
 *  raised 0..5 fan up from it. */
export const BigHand: React.FC<{ from: { x: number; y: number }; x: number; y: number; r?: number; skin?: string; sleeve?: string; fingers?: number; point?: boolean }> = ({
  from, x, y, r = 60, skin = MUSTARD, sleeve = "#3b3e47", fingers = 0, point,
}) => (
  <g>
    <line x1={from.x} y1={from.y} x2={x} y2={y} stroke={INK} strokeWidth={r * 1.25 + 10} strokeLinecap="round" />
    <line x1={from.x} y1={from.y} x2={x} y2={y} stroke={sleeve} strokeWidth={r * 1.25} strokeLinecap="round" />
    {Array.from({ length: fingers }, (_, i) => {
      const a = -60 + i * 30;
      const rad = (a * Math.PI) / 180;
      return <line key={i} x1={x} y1={y} x2={x + Math.sin(rad) * r * 1.7} y2={y - Math.cos(rad) * r * 1.7} stroke={skin} strokeWidth={r * 0.36} strokeLinecap="round" />;
    })}
    {point && <line x1={x} y1={y} x2={x} y2={y - r * 1.8} stroke={skin} strokeWidth={r * 0.38} strokeLinecap="round" />}
    <circle cx={x} cy={y} r={r} fill={skin} stroke={INK} strokeWidth={5} />
  </g>
);

// ------------------------------------------------------------------------------------------------ inside a pod

/** The inside of a pod, filling the frame (REF): a dark capsule, the reading lamp in its ceiling, the pillow and the
 *  mattress, the socket on the wall with the cable running to it. `note` slides a paper note off the pillow (0..1). */
export const PodInside: React.FC<{ lamp?: boolean; note?: number | null; cable?: boolean }> = ({ lamp = true, note = null, cable = true }) => (
  <g>
    <defs>
      <radialGradient id="pi-lamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffd98a" stopOpacity={0.55} />
        <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-600} y={-400} width={3200} height={1900} fill="#1a2036" />
    <rect x={60} y={120} width={1800} height={860} rx={160} fill="#0d1020" stroke="#47507a" strokeWidth={10} />
    {lamp && <circle cx={420} cy={200} r={460} fill="url(#pi-lamp)" />}
    <rect x={340} y={130} width={170} height={40} rx={14} fill={lamp ? "#ffc46b" : "#5a5040"} stroke={INK} strokeWidth={5} />
    <rect x={60} y={760} width={1800} height={220} fill="#39406a" stroke={INK} strokeWidth={6} />
    <rect x={60} y={760} width={1800} height={30} fill="#5a6390" />
    <path d="M150 760 Q160 660 300 660 L520 668 Q600 680 590 740 Q585 770 500 768 L190 766 Q140 764 150 760Z" fill="#cfd3e6" stroke={INK} strokeWidth={6} />
    {note !== null && (
      <g transform={`translate(${380 + note * 120} ${690 + note * note * 140}) rotate(${-8 + note * 50})`}>
        <rect x={-70} y={-48} width={140} height={96} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
        {[0, 1, 2].map((k) => <rect key={k} x={-50} y={-26 + k * 22} width={k === 2 ? 60 : 100} height={9} rx={4} fill={INK} opacity={0.75} />)}
      </g>
    )}
    <rect x={1620} y={420} width={110} height={130} rx={18} fill="#2c3350" stroke={INK} strokeWidth={6} />
    <circle cx={1675} cy={485} r={22} fill="#0a0c16" />
    {cable && <Cable d="M1675 485 C 1500 470, 1350 600, 1100 640 S 600 640, 470 650" width={14} />}
  </g>
);

// ------------------------------------------------------------------------------------------------ people in the hall

/** Pod one's lip in world units under this camera (the pods are a 0.85-deep layer, so they drift against the actors). */
export const lipAt = (cam: Camera) => ({ x: POD_ONE.x + 165 + (cam.x - 960) * 0.15, y: POD_ONE.y + POD_ONE.h + (cam.y - 540) * 0.15 });

/** You sitting on the lip of pod one, legs over the edge. */
export const YouOnLip: React.FC<{ frame: number; cam: Camera; face: Face; pose?: Pose }> = ({ frame, cam, face, pose }) => {
  const L = lipAt(cam);
  return <Person who="you" b={{ x: L.x, y: seatedY(L.y, 1), scale: 1, facing: 1, pose: pose ?? { ...SEATED, lean: 4, tilt: 4, armF: [28, 40] } }} face={face} frame={frame} />;
};

/** Your flatmate with the mop in her back hand. */
export const MateMop: React.FC<{ frame: number; b: Body; face: Face }> = ({ frame, b, face }) => {
  const h = handAt(b, "back");
  return (
    <>
      <Person who="mate" b={b} face={face} frame={frame} seed={5} />
      <Mop x={h.x} y={h.y} reach={b.y - h.y - 30} scale={b.scale} />
    </>
  );
};

/** Your boss behind the night desk, with the crate (lid off) on it. */
export const BossAtDesk: React.FC<{ frame: number; pose: Pose; face: Face; held?: React.ReactNode; coils?: number }> = ({ frame, pose, face, held, coils = 3 }) => (
  <>
    <Person who="boss" b={{ x: 340, y: 950, scale: 1.12, facing: 1, pose }} face={face} frame={frame} seed={3} held={held} />
    <DeskFront />
    <Crate torn={1} coils={coils} />
  </>
);

/** A camera target for a point drawn on the hall's pods layer (depth 0.85): the camera centred there sees it centred. */
export const onPods = (x: number, y: number) => ({ x: (x - 0.15 * 960) / 0.85, y: (y - 0.15 * 540) / 0.85 });

/** You lying on your back, head to the left; (x, y) is your hip. */
export const LyingYou: React.FC<{ frame: number; x: number; y: number; s: number; face: Face; armF?: [number, number]; armB?: [number, number] }> = ({
  frame, x, y, s, face, armF = [20, 20], armB = [10, 10],
}) => (
  <Person who="you" b={{ x, y: y + 112 * s, scale: s, facing: 1, pose: { lean: 0, tilt: 0, armF, armB, legB: [-3, 0], legF: [4, -2], drop: 0 } }}
    face={face} frame={frame} rotate={-90} />
);
