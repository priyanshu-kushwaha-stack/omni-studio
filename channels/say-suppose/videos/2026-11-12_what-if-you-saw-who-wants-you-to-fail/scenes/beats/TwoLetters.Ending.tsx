// The ending of "Two Letters" (TwoLetters.tsx): the card that opens over YOUR head is never seen. On the outside
// review of v6 the snap has to be felt in the picture: the paper's bottom edge flicks down into the top of the frame on
// the snap, its shadow sweeps down across your forehead and sways there, the paper throws a flash of pale light on your
// face. When the camera is wide enough that the whole card would show (`paper` false), only its shadow and light are
// drawn (v6 left a blank paper card in a two-shot that read as an empty speech bubble). World coordinates.
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
 * back to a sliver (`paper`); a shadow sweeps down across your forehead and sways with it; the paper throws a pale,
 * neutral flash on your face (no teal, no crimson: nothing gives the number away). Draw AFTER your figure.
 */
export const CardOverYou: React.FC<{ frame: number; at: number; head: { x: number; y: number; r: number }; paper?: boolean }> = ({
  frame, at, head, paper = true,
}) => {
  if (frame < at) return null;
  const c = cardOver(head);
  const open = spring({ frame: frame - at, fps: FPS, config: { damping: 9, stiffness: 210, mass: 0.6 } });
  const sway = Math.sin((frame - at) / 9) * 2 * Math.max(0.25, 1 - (frame - at) / 60);
  const flash = Math.max(0, 1 - (frame - at) / 14);
  // the shadow comes down from above the crown to across the brow on the snap, then settles a little higher
  const sweep = Math.min(1, open);
  const shadowY = head.y - head.r * (1.5 - 0.95 * sweep) - head.r * 0.12 * Math.max(0, open - 1);
  const id = `tl-crown-${Math.round(head.x)}`;
  return (
    <g>
      <defs>
        <clipPath id={id}><circle cx={head.x} cy={head.y} r={head.r} /></clipPath>
        <radialGradient id="tl-cardlight" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#fffaf0" stopOpacity={1} />
          <stop offset="100%" stopColor="#fffaf0" stopOpacity={0} />
        </radialGradient>
        <filter id="tl-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={head.r * 0.1} /></filter>
      </defs>
      <ellipse cx={head.x} cy={head.y - head.r * 0.2} rx={head.r * 2.3} ry={head.r * 2.0} fill="url(#tl-cardlight)" opacity={(0.25 + 0.55 * flash) * Math.min(1, open)} />
      <g clipPath={`url(#${id})`}>
        <rect x={head.x - head.r * 1.4 + sway * head.r * 0.08} y={shadowY - head.r * 0.5} width={head.r * 2.8} height={head.r * 0.75} rx={head.r * 0.3}
          fill={INK} opacity={0.38 * Math.min(1, open)} filter="url(#tl-soft)" transform={`rotate(${-3 + sway} ${head.x} ${shadowY})`} />
      </g>
      {paper && (
        <g transform={`translate(${c.x} ${c.top}) rotate(${-3 + sway}) scale(1 ${Math.max(0.001, open)})`}>
          <rect x={-c.w / 2} y={0} width={c.w} height={c.h} rx={c.h * 0.14} fill={PAPER} stroke={INK} strokeWidth={Math.max(3, head.r * 0.05)} />
        </g>
      )}
    </g>
  );
};
