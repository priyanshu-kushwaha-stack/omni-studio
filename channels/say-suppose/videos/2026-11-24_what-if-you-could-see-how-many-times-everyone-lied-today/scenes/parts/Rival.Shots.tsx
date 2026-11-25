// Look C helpers for the back half (Stadium, Rival, Polygraph, Statement, ReadItAloud): the click frames the sound
// uses (clickData.ts), so every visible tick lands on its click; a counter's warm light for PlateScene's `lights`;
// plate pixels to world units; a piece of the plate cut out and laid over the actors (a painted lectern or desk in
// front of a code figure); and the blurred back of a head and shoulder in the near foreground for over-the-shoulder
// shots (the Looks.tsx `Over` pattern). No AI images.
import { MOOD_NAMES, type SetLight } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FPS, INK } from "@whatif/kit/theme";
import { CLICKS } from "../clickData";
import { findLine, GLOW, type Shot } from "../shared";
import { PlateBack, type PlateName } from "./Plate";

/** Frames of the clicks clickData.ts places on a line: `after` it ends (a hold's clicks), or `on` its start (the
 *  picture ticks as the line starts; the sound leads it by 3 frames). */
export function clickFrames(shot: Shot, prefix: string, kind: "after" | "on" = "after"): number[] {
  const start = Math.max(0, shot.clips.findIndex((c) => c.from >= shot.from));
  const i = findLine(shot.lines, prefix, start);
  const text = shot.lines[i].text;
  const item = CLICKS.find((c) => {
    const key = kind === "after" ? c.after : c.on;
    return key !== undefined && (key === text || key === text.slice(0, 60));
  });
  if (!item) throw new Error(`no ${kind} click on ${JSON.stringify(prefix)}`);
  const clip = shot.clips[i];
  const base = kind === "after" ? clip.from + clip.frames : clip.from;
  return item.at.map((s) => Math.round(base + s * FPS));
}

/** A counter's warm light on the face under it (world units, for PlateScene's `lights`). */
export const counterLight = (x: number, y: number, r = 320, strength = 0.32, color: string = GLOW): SetLight => ({
  x, y, r, color, strength, moods: MOOD_NAMES,
});

/** A plate pixel (1536 x 864 image) in world units, for the default overscan of 1.25. */
export const pw = (u: number, v: number) => ({ x: -240 + u * 1.5625, y: -135 + v * 1.5625 });

/** A path through plate pixels, in world units. */
export const platePath = (pts: [number, number][]) =>
  pts.map(([u, v], i) => { const p = pw(u, v); return `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`; }).join(" ") + "Z";

/** The plate again, cut to a path in world units, for the Stage's front slot: the painted thing stands in front. */
export const PlateCut: React.FC<{ name: PlateName; cam: Camera; d: string; id: string }> = ({ name, cam, d, id }) => (
  <g>
    <defs><clipPath id={id}><path d={d} /></clipPath></defs>
    <g clipPath={`url(#${id})`}><PlateBack name={name} cam={cam} /></g>
  </g>
);

export type Back = { head: string; coat: string; scarf?: string; tuft?: boolean };

/** The back of a head and shoulder, close and out of focus, in screen pixels: (x, y) is the head's centre, r its radius.
 *  `lit` is the counter's warm light on the far side of the head. */
export const OverShoulder: React.FC<{ who: Back; x: number; y?: number; r?: number; blur?: number; lit?: number }> = ({
  who, x, y = 820, r = 230, blur = 10, lit = 0,
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, pointerEvents: "none" }}>
    <rect x={x - r * 1.45} y={y + r * 0.72} width={r * 2.9} height={r * 2.2} rx={r * 0.9} fill={who.coat} />
    {who.scarf && <path d={`M${x - r * 1.0} ${y + r * 0.82} Q${x} ${y + r * 1.12} ${x + r * 1.0} ${y + r * 0.82} L${x + r} ${y + r * 1.08} Q${x} ${y + r * 1.36} ${x - r} ${y + r * 1.08}Z`} fill={who.scarf} />}
    <circle cx={x} cy={y} r={r} fill={who.head} />
    {who.tuft && <path d={`M${x - r * 0.2} ${y - r * 0.92} Q${x - r * 0.32} ${y - r * 1.3} ${x + r * 0.05} ${y - r * 1.38} Q${x - r * 0.05} ${y - r * 1.12} ${x + r * 0.2} ${y - r * 1.0}Z`} fill={INK} />}
    {lit > 0 && <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.75} fill={GLOW} opacity={0.18 * lit} />}
  </svg>
);

/** A blurred row of heads and shoulders from behind across the bottom of the frame (a studio audience), bobbing when
 *  they laugh. Screen pixels; no counters (they would add nothing this close). */
export const CrowdBacks: React.FC<{ frame: number; laugh: number; n?: number; y?: number; r?: number; blur?: number; heads: string[] }> = ({
  frame, laugh, n = 6, y = 1000, r = 120, blur = 9, heads,
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, pointerEvents: "none" }}>
    {Array.from({ length: n }, (_, i) => {
      const x = (1920 * (i + 0.5)) / n + Math.sin(i * 5.3) * 40;
      const bob = -Math.abs(Math.sin((frame + i * 5) / 3.2)) * 18 * laugh;
      const yy = y + (i % 2) * 40 + bob;
      return (
        <g key={i}>
          <rect x={x - r * 1.4} y={yy + r * 0.7} width={r * 2.8} height={r * 2} rx={r * 0.8} fill="#23252e" />
          <circle cx={x} cy={yy} r={r} fill={heads[i % heads.length]} />
        </g>
      );
    })}
  </svg>
);
