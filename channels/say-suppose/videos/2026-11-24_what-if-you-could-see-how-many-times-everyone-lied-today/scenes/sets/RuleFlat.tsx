// The flat beyond the kitchen, for The Rule, in look C: the painted hallway (plate hallway-morning: the front door on
// the left wall with your lanyard's hook, a mirror on the far wall, a window on the right) and the painted kettle on
// the kitchen counter (plate kitchen-morning). Your reflection is drawn into the painted mirror's glass and the
// kettle's steel; the front door's leaf is a copy of the plate that swings toward its hinge on the light outside.
// Plate world units (x -240..2160, y -135..1215). No AI images.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { HERO } from "../shared";
import { ActorLayer } from "../parts/FrameLook";
import { PlateBack, PlateScene } from "../parts/Plate";

export const HALL = {
  /** Feet of a figure walking the hall (nearer is lower and bigger). */
  floor: 1000,
  scale: 2.45,
  /** The painted door leaf on the left wall (hinge at x 195) and its knob. */
  door: [[195, -135], [345, -135], [372, 1050], [195, 1190]] as [number, number][],
  hinge: 195,
  knob: { x: 335, y: 520 },
  /** The painted mirror's glass. */
  glass: { x: 893, y: 141, w: 190, h: 297 },
  /** The painted kettle's steel body in kitchen-morning. */
  kettle: [[1628, 443], [1668, 443], [1700, 526], [1605, 526]] as [number, number][],
};

/** The hallway through `cam`; `open` 0..1 swings the front door on the morning light. */
export const HallScene: React.FC<{ cam: Camera; blur: number; open?: number; actors?: React.ReactNode }> = ({ cam, blur, open = 0, actors }) => {
  const pts = HALL.door.map((p) => p.join(",")).join(" ");
  const leaf = 1 - 0.82 * open;
  return (
    <AbsoluteFill>
      <PlateScene plate="hallway-morning" cam={cam} mood="morning" blur={blur} rimFrom="right"
        lights={open > 0 ? [{ x: 300, y: 500, r: 900, color: "#fff4cf", strength: 0.6 * open, moods: ["morning"] }] : []}
        front={open > 0 ? (
          <g>
            <defs><clipPath id="hall-door"><polygon points={pts} /></clipPath></defs>
            <polygon points={pts} fill="#fff6dc" />
            <g clipPath="url(#hall-door)" transform={`translate(${HALL.hinge} 0) scale(${leaf} 1) translate(${-HALL.hinge} 0)`}>
              <PlateBack name="hallway-morning" cam={cam} blur={blur} />
              <rect x={HALL.hinge} y={-200} width={200} height={1500} fill="#000" opacity={0.25 * open} />
            </g>
          </g>
        ) : undefined} />
      {actors && <ActorLayer cam={cam} mood="morning" rimFrom="right">{actors}</ActorLayer>}
    </AbsoluteFill>
  );
};

/** You, chest up, as a reflection: looking up at the empty air over your own head. */
const Reflection: React.FC<{ x: number; y: number; scale: number; look: { x: number; y: number }; time: number; nose?: number; stretch?: number }> = ({
  x, y, scale, look, time, nose = 0, stretch = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${stretch} 1)`}>
    <Figure x={0} y={264 * scale} scale={scale} pose={STAND} head={HERO.head} scarf={HERO.scarf} tuft time={time} look={look} brows="raised"
      lids={0} mouth="flat" eyes={1.05} />
    {nose > 0 && <ellipse cx={8 * scale} cy={14 * scale} rx={9 * scale * nose} ry={7 * scale * nose} fill="#e0a23a" stroke={INK} strokeWidth={2.5 * scale} />}
  </g>
);

/** The painted mirror, close: your reflection in its glass, nothing over your head; `glint` lights your eyes. */
export const MirrorScene: React.FC<{ cam: Camera; frame: number; look: { x: number; y: number }; glint?: number }> = ({ cam, frame, look, glint = 0 }) => {
  const g = HALL.glass;
  const head = { x: g.x + g.w / 2, y: g.y + g.h * 0.6 };
  const s = 1.4;
  return (
    <PlateScene plate="hallway-morning" cam={cam} mood="morning" blur={0.6} rimFrom="right"
      front={
        <g>
          <defs><clipPath id="hall-glass"><rect x={g.x} y={g.y} width={g.w} height={g.h} /></clipPath></defs>
          <g clipPath="url(#hall-glass)">
            <rect x={g.x} y={g.y} width={g.w} height={g.h} fill="#c9d3d6" opacity={0.55} />
            <Reflection x={head.x} y={head.y} scale={s} look={look} time={frame} />
            {glint > 0 && [-12, 16].map((dx) => (
              <circle key={dx} cx={head.x + (dx + look.x * 3.5) * s} cy={head.y - 4 * s} r={9 * glint} fill="#ffcf5a" opacity={0.55 * glint} />
            ))}
            <rect x={g.x} y={g.y} width={g.w} height={g.h} fill="#dfe8ea" opacity={0.18} />
            <path d={`M${g.x} ${g.y + g.h * 0.75} L${g.x + g.w} ${g.y + g.h * 0.2}`} stroke="#fff" strokeWidth={26} opacity={0.18} />
          </g>
        </g>
      } />
  );
};

/** The painted kettle, close: in its steel your face, stretched wide, the nose growing; nothing over it. */
export const KettleScene: React.FC<{ cam: Camera; frame: number; nose: number }> = ({ cam, frame, nose }) => {
  const pts = HALL.kettle.map((p) => p.join(",")).join(" ");
  return (
    <PlateScene plate="kitchen-morning" cam={cam} mood="morning" blur={0.5} rimFrom="left"
      front={
        <g>
          <defs><clipPath id="kettle-steel"><polygon points={pts} /></clipPath></defs>
          <g clipPath="url(#kettle-steel)" opacity={0.78}>
            <Reflection x={1653} y={478} scale={0.42} look={{ x: 0.1, y: -0.9 }} time={frame} nose={nose} stretch={1.7} />
          </g>
          <g clipPath="url(#kettle-steel)">
            <rect x={1600} y={440} width={110} height={90} fill="#c4cad3" opacity={0.22} />
            <path d="M1638 446 L1636 524" stroke="#fff" strokeWidth={4} opacity={0.55} />
          </g>
        </g>
      } />
  );
};
