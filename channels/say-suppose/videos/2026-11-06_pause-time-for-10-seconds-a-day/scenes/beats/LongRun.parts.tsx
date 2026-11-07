import type { Clip } from "@whatif/kit/timeline";
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, STAND, type Pose } from "@whatif/kit/rig/pose";
import { LookContext, useLook, type Glow } from "@whatif/kit/stage/Look";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { HERO, mix, MOTHER } from "../shared";

/** Beat 5's key frames, all built from cues and clip starts (never fixed frames). */
export const SHORT = 34;
export function beatTimes(cues: Record<string, number>, clips: Clip[]) {
  const L = (i: number) => clips[i].from;
  const lane = cues.vault + 8;            // the cloud has popped: cut to the cricket
  const hit = cues.six_hit - 20;          // bat meets ball
  const cuts = L(55) + 94;                // "It's exactly the right size for an accident."
  const bottleSnap = cuts + 12;
  const panCut = cuts + 80;
  const panSnap = panCut + 10;
  const todCut = cues.small - 14;
  const mother = L(57);
  const year40 = L(60);
  const corner = L(61);
  const clocks = L(62);
  const mirror = L(63);
  const pullBack = L(64);
  return { lane, hit, cuts, bottleSnap, panCut, panSnap, todCut, mother, year40, corner, clocks, mirror, pullBack };
}

export function beatPauses(cues: Record<string, number>, clips: Clip[]) {
  const b = beatTimes(cues, clips);
  return [
    { from: cues.six_hit, to: cues.caught },
    { from: b.bottleSnap, to: b.bottleSnap + SHORT },
    { from: b.panSnap, to: b.panSnap + SHORT },
    { from: cues.small, to: cues.small + SHORT },
  ];
}

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixColor = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, "0")).join("");
};

type Placed = { x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Pose };

/** World position of a figure's shoulder, head or front/back hand. */
export function shoulderAt({ x, y, scale = 1, facing = 1, pose = STAND }: Placed) {
  const j = joints(pose);
  return { x: x + facing * scale * j.shoulder.x, y: y + scale * j.shoulder.y };
}
export function headAt({ x, y, scale = 1, facing = 1, pose = STAND }: Placed) {
  const j = joints(pose);
  return { x: x + facing * scale * j.head.x, y: y + scale * j.head.y };
}
export function handAt({ x, y, scale = 1, facing = 1, pose = STAND }: Placed, arm: "armF" | "armB" = "armF") {
  const j = joints(pose);
  const [u, f] = pose[arm];
  const a = dir(u);
  const b = dir(u + f);
  return { x: x + facing * scale * (j.shoulder.x + (a.x + b.x) * LIMB), y: y + scale * (j.shoulder.y + (a.y + b.y) * LIMB) };
}
/** Arm angles that put a hand on a world point. */
export function armTo(p: Placed, tx: number, ty: number): [number, number] {
  const s = shoulderAt(p);
  const scale = p.scale ?? 1;
  return reach(((tx - s.x) / scale) * (p.facing ?? 1), (ty - s.y) / scale);
}
export const blendArm = (a: [number, number], b: [number, number], k: number): [number, number] => [mix(a[0], b[0], k), mix(a[1], b[1], k)];

/** Draw in a figure's head space (origin at the head centre, x towards where it faces). */
export const HeadSpace: React.FC<Placed & { children: React.ReactNode }> = ({ x, y, scale = 1, facing = 1, pose = STAND, children }) => {
  const j = joints(pose);
  return <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale}) translate(${j.head.x} ${j.head.y}) rotate(${pose.tilt})`}>{children}</g>;
};

const TUFT = "M-9 -41 Q-14 -66 4 -71 Q-2 -58 11 -55 Q7 -47 8 -41 Z";
const GREY_HAIR = "#b9b5ae";

type FigureLike = Omit<FigureProps, "head"> & { head?: string };

/** You. `age` 0 is now; 1 is forty years on: a grey tuft and a slightly faded mustard head. */
export const You: React.FC<FigureLike & { age?: number }> = ({ age = 0, ...p }) => (
  <>
    <HeadSpace x={p.x} y={p.y} scale={p.scale} facing={p.facing} pose={p.pose}>
      <path d={TUFT} fill={mixColor(INK, GREY_HAIR, age)} />
    </HeadSpace>
    <Figure {...HERO} {...p} head={mixColor(MUSTARD, "#d7b46c", age * 0.8)} tuft={false} />
  </>
);

/** Your mother, older: grey hair and a grey bun. */
export const Mother: React.FC<FigureLike> = (p) => (
  <>
    <HeadSpace x={p.x} y={p.y} scale={p.scale} facing={p.facing} pose={p.pose}>
      <circle cx={-6} cy={-7} r={51} fill={GREY_HAIR} stroke={INK} strokeWidth={4} />
      <circle cx={-44} cy={-30} r={22} fill={GREY_HAIR} stroke={INK} strokeWidth={4} />
      <path d="M-58 -36 Q-44 -26 -30 -34" fill="none" stroke="#8f8a83" strokeWidth={3} />
    </HeadSpace>
    <Figure head={MOTHER.head} coat={MOTHER.coat} {...p} />
    <HeadSpace x={p.x} y={p.y} scale={p.scale} facing={p.facing} pose={p.pose}>
      <path d="M-30 -36 A46 46 0 0 1 24 -40 Q-2 -47 -30 -36 Z" fill={GREY_HAIR} />
    </HeadSpace>
  </>
);

export const KID_HEADS = ["#e0a070", "#7fa0c4", "#7fc29b", "#e6a0a0", "#d9c26a", "#b58fc7"];

/** Adds scene light (glows, in screen px) to the mood Film gives. */
export const Lit: React.FC<{ glows: Glow[]; children: React.ReactNode }> = ({ glows, children }) => {
  const look = useLook();
  return <LookContext.Provider value={{ ...look, glows: [...(look.glows ?? []), ...glows] }}>{children}</LookContext.Provider>;
};

/** Smooth 0..1 step. */
export const smooth = (k: number) => {
  const c = Math.max(0, Math.min(1, k));
  return c * c * (3 - 2 * c);
};
