// Inserts for "The Loading Dock" (LoadingDock.tsx): your letter on the fridge at home (the first half of the match cut to
// hers six years ago), the camera both letters share, and the snap marks that tell the second card's reopening from a
// card that stayed open (outside review of v4.1).
import { interpolate } from "remotion";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { HOME, HomeBack } from "../sets/Home";
import { camAt } from "../shared";

/** The camera on a letter on the fridge (bottom centres at y HOME.hers.y), big: yours and hers share it, so one
 *  dissolves into the other in the same place. */
export const LETTER_CAM = (x: number, zoom = 4.2): Camera => ({ x: x + 2, y: HOME.hers.y - 48, zoom });

/** Home at dusk, nobody in: your letter on the fridge, the calendar beside it (over hers). A slow push. */
export const YourLetter: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const cam = drift(camAt(frame, [[from, LETTER_CAM(HOME.yours.x, 3.7)], [to, LETTER_CAM(HOME.yours.x, 4.2)]]), frame, "dock-yours", 1.5);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="dusk" frame={frame} />} actors={null} />;
};

/** Paper snap marks: short ink strokes flicking out round a card the instant it reopens. (x, y) the card's centre,
 *  w x h its size. World units. */
export const SnapMarks: React.FC<{ frame: number; at: number; x: number; y: number; w: number; h: number }> = ({ frame, at, x, y, w, h }) => {
  if (frame < at || frame >= at + 10) return null;
  const t = (frame - at) / 10;
  const out = interpolate(t, [0, 1], [0, 1]);
  const fade = 1 - t;
  const marks = [
    [-1, -0.2, -160], [-1, 0.5, 200], [1, -0.2, -20], [1, 0.5, 20], [-0.35, -1, -110], [0.35, -1, -70],
  ];
  return (
    <g stroke={INK} strokeWidth={Math.max(3, h * 0.07)} strokeLinecap="round" opacity={fade}>
      {marks.map(([sx, sy, deg], i) => {
        const ax = x + sx * (w / 2 + h * 0.15), ay = y + sy * (h / 2 + h * 0.12);
        const a = (deg * Math.PI) / 180;
        const r0 = h * (0.08 + 0.25 * out), r1 = h * (0.3 + 0.35 * out);
        return <line key={i} x1={ax + Math.cos(a) * r0} y1={ay + Math.sin(a) * r0} x2={ax + Math.cos(a) * r1} y2={ay + Math.sin(a) * r1} />;
      })}
    </g>
  );
};
