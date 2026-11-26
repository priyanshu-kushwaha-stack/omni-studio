// Helpers shared by the sets in this folder (not by beats). Every set is authored for one reference camera, REF: at
// that camera each layer draws exactly where its coordinates say, whatever its depth, so a set can be drawn like a
// picture. As the camera moves away from REF, far layers drift less than near ones (the kit's Layer parallax).
import { Layer, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";

/** The camera every set is drawn for: the whole 1920x1080 frame at zoom 1. A set's "wide" is this camera. */
export const REF: Camera = { x: 960, y: 540, zoom: 1 };

/** A paper layer at `depth` (1 = the actors' plane, smaller = further back) authored in REF screen coordinates. `flat`
 *  drops the cut-paper shadow (use it for far walls and skies). */
export const Deep: React.FC<{ cam: Camera; depth: number; flat?: boolean; children: React.ReactNode }> = ({ cam, depth, flat, children }) => (
  <Layer cam={cam} depth={depth} flat={flat}>
    <g transform={`translate(${-REF.x * (1 - depth)} ${-REF.y * (1 - depth)})`}>{children}</g>
  </Layer>
);

/** A plain chair seen from the side, its seat top at (x, y), facing right when `facing` is 1. */
export const Chair: React.FC<{ x: number; y: number; scale?: number; facing?: 1 | -1; color?: string }> = ({ x, y, scale = 1, facing = 1, color = "#6b4b3a" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
    <rect x={-44} y={-6} width={88} height={14} rx={5} fill={color} stroke={INK} strokeWidth={4} />
    <rect x={-48} y={-118} width={14} height={124} rx={5} fill={color} stroke={INK} strokeWidth={4} />
    <line x1={-36} y1={8} x2={-38} y2={62} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <line x1={36} y1={8} x2={38} y2={62} stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </g>
);
