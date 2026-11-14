// The ending of "Two Letters" (TwoLetters.tsx), rebuilt on the outside review of v4.1: the film stays on Min-jun in the
// doorway and on you. The card that opens over YOUR head is never seen: the camera keeps it just above the top of the
// frame; what shows is the paper's bottom edge flicking down into frame on the snap, its shadow across your crown, the
// light it throws on your face, and his eyes going up to it. World coordinates, for a <Stage>'s actors.
import { spring } from "remotion";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FPS, INK, PAPER } from "@whatif/kit/theme";

/** Where the card over a head hangs (the Meter's geometry): its top, height and width. */
export function cardOver(head: { x: number; y: number; r: number }) {
  const h = head.r * 1.05;
  return { x: head.x, top: head.y - head.r - h * 1.5, h, w: h * 2.5, bottom: head.y - head.r - h * 0.5 };
}

/** A camera at `zoom` whose top edge sits just under the card's bottom (the card stays out of frame, `peek` px of its
 *  edge at most), centred on `x`. */
export const underCard = (head: { x: number; y: number; r: number }, x: number, zoom: number, peek = 6): Camera => ({
  x,
  y: cardOver(head).bottom + (540 - peek) / zoom,
  zoom,
});

/**
 * The card over you, unseen: from `at` (the snap) its bottom edge springs down past the top of the frame and swings
 * back to a sliver; a soft shadow of it lies across the top of your head and sways with it; the paper throws a pale,
 * neutral light down on your face (no teal, no crimson: nothing gives the number away). Draw AFTER your figure.
 */
export const CardOverYou: React.FC<{ frame: number; at: number; head: { x: number; y: number; r: number } }> = ({ frame, at, head }) => {
  if (frame < at) return null;
  const c = cardOver(head);
  const open = spring({ frame: frame - at, fps: FPS, config: { damping: 9, stiffness: 210, mass: 0.6 } });
  const sway = Math.sin((frame - at) / 9) * 2 * Math.max(0.25, 1 - (frame - at) / 60);
  const flash = Math.max(0, 1 - (frame - at) / 12);
  const id = "tl-crown";
  return (
    <g>
      <defs>
        <clipPath id={id}><circle cx={head.x} cy={head.y} r={head.r} /></clipPath>
        <radialGradient id="tl-cardlight" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#fffaf0" stopOpacity={1} />
          <stop offset="100%" stopColor="#fffaf0" stopOpacity={0} />
        </radialGradient>
        <filter id="tl-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={head.r * 0.12} /></filter>
      </defs>
      {/* its light on your face */}
      <ellipse cx={head.x} cy={head.y - head.r * 0.2} rx={head.r * 2.1} ry={head.r * 1.9} fill="url(#tl-cardlight)" opacity={(0.28 + 0.35 * flash) * Math.min(1, open)} />
      {/* its shadow across your crown, swaying with it */}
      <g clipPath={`url(#${id})`}>
        <ellipse cx={head.x + sway * head.r * 0.08} cy={head.y - head.r * 1.0} rx={head.r * 1.15} ry={head.r * 0.55} fill={INK}
          opacity={0.3 * Math.min(1, open)} filter="url(#tl-soft)" />
      </g>
      {/* the paper's bottom edge: blank, just its border, swinging into frame on the snap */}
      <g transform={`translate(${c.x} ${c.top}) rotate(${-3 + sway}) scale(1 ${Math.max(0.001, open)})`}>
        <rect x={-c.w / 2} y={0} width={c.w} height={c.h} rx={c.h * 0.14} fill={PAPER} stroke={INK} strokeWidth={Math.max(3, head.r * 0.05)} />
      </g>
    </g>
  );
};
