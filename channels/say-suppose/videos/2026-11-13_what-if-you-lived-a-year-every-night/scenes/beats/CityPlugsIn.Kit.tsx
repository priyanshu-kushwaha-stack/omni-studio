// Helpers shared by this builder's four beats (The City Plugs In, The Cold Apology, Night Thirty, It Was Yesterday):
// a figure that blinks and keeps its scarf alive, the arm aim, grey temples, ink bars for paper, a library set or an
// own-drawn set on the kit's Stage lit by the current line's mood, and the timing helper. Nothing here plays sound.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { joints, reach, type Pose } from "@whatif/kit/rig/pose";
import { LookContext, type Glow } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { setLook, type SetDef, type SetLight } from "@whatif/kit/sets/common";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { blinking, lastIndex, type Shot } from "../shared";

/** The mood of the line being spoken (Film.tsx lights the beat with it; library sets need the name for their palette). */
export function moodOf(shot: Shot): MoodName {
  const i = Math.max(0, lastIndex(shot.clips, (c) => shot.frame >= c.from));
  return (shot.lines[i]?.mood ?? "night") as MoodName;
}

/** Frame helpers from the narration clips: `from(i)`, `end(i)`, `at(i, p)` p of the way through line i. */
export function clock(clips: Clip[]) {
  const from = (i: number) => clips[i].from;
  const end = (i: number) => clips[i].from + clips[i].frames;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return { from, end, at };
}

export interface Body { x: number; y: number; scale: number; facing: 1 | -1; pose: Pose }

/** The arm angles that put a hand of `body` on a world point. */
export function aim(body: Body, target: { x: number; y: number }): [number, number] {
  const j = joints(body.pose);
  const sx = body.x + j.shoulder.x * body.scale * body.facing;
  const sy = body.y + j.shoulder.y * body.scale;
  return reach(((target.x - sx) / body.scale) * body.facing, (target.y - sy) / body.scale);
}

/** Where the head of `body` is, in world coordinates. */
export function head(body: Body) {
  const j = joints(body.pose);
  return { x: body.x + j.head.x * body.scale * body.facing, y: body.y + j.head.y * body.scale, r: 46 * body.scale };
}

type Look = Omit<FigureProps, "x" | "y" | "scale" | "facing" | "pose">;

/** A figure on a body that blinks on its own seed and whose scarf ripples with the frame. */
export const Person: React.FC<{ body: Body; frame: number; seed?: number; who: Look; temples?: boolean }> = ({ body, frame, seed = 0, who, temples }) => (
  <>
    <Figure x={body.x} y={body.y} scale={body.scale} facing={body.facing} pose={body.pose} time={frame}
      blink={who.blink ?? blinking(frame, seed)} {...who} />
    {temples && <Temples body={body} />}
  </>
);

/** Grey at the temples: two grey crescents on the sides of the head (a year older, many years over). */
export const Temples: React.FC<{ body: Body }> = ({ body }) => {
  const h = head(body);
  const r = h.r;
  return (
    <g>
      {[-1, 1].map((s) => (
        <path key={s} d={`M${h.x + s * r * 0.98} ${h.y - r * 0.05} A${r} ${r} 0 0 ${s > 0 ? 0 : 1} ${h.x + s * r * 0.62} ${h.y - r * 0.78}`}
          fill="none" stroke="#e8e6e0" strokeWidth={r * 0.2} strokeLinecap="round" />
      ))}
    </g>
  );
};

/** Ink bars standing for writing on paper (no words on screen): `n` bars from (x, y), `w` wide. */
export const InkBars: React.FC<{ x: number; y: number; w: number; n?: number; gap?: number; thick?: number; color?: string; seed?: number }> = ({
  x, y, w, n = 3, gap = 16, thick = 7, color = INK, seed = 1,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x} y={y + i * gap} width={w * (0.55 + (((i + 1) * 37 * seed) % 45) / 100)} height={thick} rx={thick / 2} fill={color} opacity={0.75} />
    ))}
  </g>
);

/** A library set on the Stage: its back, the `behind` figures, its Mid piece, the actors, its Front. Lit by the mood
 *  plus the set's own lights and `glows`. */
export function InSet<O extends object>({ set, mood, frame, cam, options, behind, children, front = true, back, over, glows, lights }: {
  set: SetDef<O>; mood: MoodName; frame: number; cam: Camera; options?: Partial<O>; behind?: React.ReactNode; children?: React.ReactNode;
  front?: boolean; back?: React.ReactNode; over?: React.ReactNode; glows?: Glow[]; lights?: SetLight[];
}) {
  const o = { ...set.defaults, ...options } as O;
  const props = { cam, mood, frame, options: o };
  return (
    <LookContext.Provider value={setLook(lights ?? set.lights(o), mood, cam, { glows })}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<>{set.Back(props)}{back}</>}
        actors={<>{behind}{set.Mid?.(props)}{children}</>}
        front={front || over ? <>{front && set.Front?.(props)}{over}</> : undefined} />
    </LookContext.Provider>
  );
}

/** An own-drawn set on the Stage, lit by the mood and `glows` (screen pixels). */
export const OwnSet: React.FC<{ mood: MoodName; cam: Camera; back: React.ReactNode; children?: React.ReactNode; front?: React.ReactNode; glows?: Glow[] }> = ({
  mood, cam, back, children, front, glows,
}) => (
  <LookContext.Provider value={moodLook(mood, { glows })}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={<>{children}</>} front={front} />
  </LookContext.Provider>
);

/** A wordless speech bubble: a squiggle of ink instead of a word (a grandparent's word, nobody's to read). */
export const InkBubble: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; side?: 1 | -1; size?: number }> = ({
  frame, at, until, x, y, side = 1, size = 1,
}) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = Math.min(1, (frame - at) / 6) * size;
  return (
    <g transform={`translate(${x} ${y}) scale(${side * s} ${s})`}>
      <path d="M0 0 L30 -46 L70 -46 Z" fill="#f3e9d7" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={10} y={-150} width={200} height={110} rx={50} fill="#f3e9d7" stroke={INK} strokeWidth={5} />
      <rect x={34} y={-50} width={50} height={12} fill="#f3e9d7" />
      <path d="M48 -96 q16 -24 32 0 t32 0 t32 0" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ v7 additions

/** Roughly when `text` is spoken in line i: its share of the line's characters mapped onto the clip (the line's start
 *  when the text is not found), plus `nudge` frames. */
export function phrase(shot: Shot, i: number, text: string, nudge = 0): number {
  const line = shot.lines[i]?.text ?? "";
  const k = line.indexOf(text);
  const c = shot.clips[i];
  return Math.round(c.from + c.frames * (k < 0 ? 0 : k / Math.max(1, line.length))) + nudge;
}

/** Where a hand of `body` is, in world coordinates. */
export function hand(body: Body, arm: "front" | "back" = "front") {
  const j = joints(body.pose);
  const [u, f] = arm === "front" ? body.pose.armF : body.pose.armB;
  const a = { x: Math.sin((u * Math.PI) / 180), y: Math.cos((u * Math.PI) / 180) };
  const b = { x: Math.sin(((u + f) * Math.PI) / 180), y: Math.cos(((u + f) * Math.PI) / 180) };
  return {
    x: body.x + (j.shoulder.x + (a.x + b.x) * 56) * body.scale * body.facing,
    y: body.y + (j.shoulder.y + (a.y + b.y) * 56) * body.scale,
  };
}

/** Children drawn in the head's own coordinates (as the Figure draws its face: +x is the way it faces, the mouth near
 *  y 20), for moustaches, glasses, veils and grey eyes. */
export const OnFace: React.FC<{ body: Body; children: React.ReactNode }> = ({ body, children }) => {
  const h = head(body);
  return <g transform={`translate(${h.x} ${h.y}) scale(${body.scale * body.facing} ${body.scale}) rotate(${body.pose.tilt})`}>{children}</g>;
};
