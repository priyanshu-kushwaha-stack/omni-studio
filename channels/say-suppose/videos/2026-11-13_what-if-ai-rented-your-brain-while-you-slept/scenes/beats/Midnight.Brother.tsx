// G3 picture lock: your brother lying on the top bunk at Midnight (he read as a grey wedge in v6: a rotated rig). Drawn
// as a figure in bed, side on: his head on a pillow at the left end (the red cap, the face toward you), the grey hoodie's
// shoulder, a rust blanket over the rest along the mattress, and one short arm reaching down over the rail. `lean` 0..1
// brings his head and arm down over the edge. KEY px (sets/BunkRoom.tsx), drawn as BunkRoom children.
import type { Mouth } from "@whatif/kit/rig/Figure";
import { HEAD_R } from "@whatif/kit/rig/pose";
import { INK } from "@whatif/kit/theme";
import { BUNK } from "../sets/BunkRoom";
import { BROTHER, mix } from "../shared";
import type { Face } from "./Contract.Kit";

const HS = 1.55;
const RAIL = BUNK.topBunk.y - 70;

const MOUTHS: Record<Exclude<Mouth, "none">, React.ReactNode> = {
  smile: <path d="M-7 17 Q6 31 21 17" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />,
  smirk: <path d="M-3 22 Q10 25 22 14" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />,
  flat: <path d="M0 21 L17 21" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />,
  o: <ellipse cx={8} cy={23} rx={7} ry={9} fill={INK} />,
  open: <path d="M-8 15 Q7 11 24 15 Q21 36 7 36 Q-5 36 -8 15Z" fill={INK} />,
  frown: <path d="M-5 26 Q7 15 20 26" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />,
  wobble: <path d="M-6 22 Q-1 18 4 22 Q9 26 14 22 Q19 18 22 22" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />,
};

/** His head as the rig draws it (kit rig/Figure), red cap and all, facing left, at (x, y) tilted `tilt` degrees. */
const BroHead: React.FC<{ x: number; y: number; tilt: number; face: Face; blink: boolean }> = ({ x, y, tilt, face, blink }) => {
  const eyes = face.eyes ?? 1, look = face.look ?? { x: 0.4, y: 0 }, lids = face.lids ?? 0, brows = face.brows ?? "none";
  const eyeRy = blink ? 1.8 : 12.5 * eyes, eyeRx = 8.5 * Math.min(1.25, eyes);
  const ex = look.x * 12, ey = look.y * 8;
  const R = HEAD_R;
  const tiltB = { raised: [0, 0], worry: [6, -2], sad: [8, -3], angry: [-8, 3], flat: [0, 0], none: [0, 0] }[brows];
  const lift = brows === "raised" ? -8 : brows === "flat" ? 2 : 0;
  const by = -5 - eyeRy - 9 + lift;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${-HS} ${HS})`}>
      <circle r={R + 2.5} fill={INK} />
      <circle r={R} fill={BROTHER.head} />
      <path d={`M${-R} 0 A${R} ${R} 0 0 0 ${R} 0 A${R} ${R * 0.83} 0 0 1 ${-R} 0Z`} fill="#000" opacity={0.08} />
      <path d={`M${-R} -8 A${R} ${R} 0 0 1 ${R} -8 L${R + 24} -6 L${R} 2 L${-R} -2Z`} fill={BROTHER.cap} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      {[-10, 17].map((cx) => <ellipse key={cx} cx={cx + ex} cy={-5 + ey} rx={eyeRx} ry={eyeRy} fill={INK} />)}
      {!blink && [-7.5, 19.5].map((cx) => <circle key={cx} cx={cx + ex} cy={-10 + ey} r={3} fill="#fff" />)}
      {!blink && lids > 0 && [-10, 17].map((cx) => (
        <g key={`l${cx}`}>
          <rect x={cx + ex - eyeRx - 1} y={-5 + ey - eyeRy - 1} width={eyeRx * 2 + 2} height={(eyeRy * 2 + 2) * Math.min(1, lids)} fill={BROTHER.head} />
          <line x1={cx + ex - eyeRx} x2={cx + ex + eyeRx} y1={-5 + ey - eyeRy + eyeRy * 2 * Math.min(1, lids)}
            y2={-5 + ey - eyeRy + eyeRy * 2 * Math.min(1, lids)} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}
      {brows !== "none" && (
        <>
          <line x1={-22} y1={by - tiltB[1]} x2={-3} y2={by - tiltB[0]} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          <line x1={7} y1={by - tiltB[0]} x2={28} y2={by - tiltB[1]} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        </>
      )}
      {face.mouth && face.mouth !== "none" && MOUTHS[face.mouth]}
    </g>
  );
};

/** Where his head, shoulder, elbow and hand are at `lean` (0 lying on the pillow, 1 leaning down over the rail). */
export function brotherLying(lean: number, talking: boolean) {
  const head = { x: mix(400, 372, lean), y: mix(70, 168, lean) };
  const tilt = mix(-14, -30, lean);
  const shoulder = { x: head.x + mix(96, 84, lean), y: head.y + mix(46, 30, lean) };
  // a short arm: two bones of about 92 px (the rig's limb at his scale), hanging down over the rail toward you
  const elbow = { x: shoulder.x - mix(20, 34, lean), y: shoulder.y + mix(88, 86, lean) };
  // whispering, the hand comes up to his mouth (Midnight draws the cupped hand there)
  const hand = talking ? { x: head.x - 66, y: head.y + 66 } : { x: elbow.x - mix(18, 30, lean), y: elbow.y + mix(90, 86, lean) };
  return { head, tilt, shoulder, elbow, hand };
}

/** The lying figure. `holding` draws something in his hand (his band) at the hand. */
export const BrotherInBed: React.FC<{ lean: number; talking: boolean; face: Face; blink: boolean; holding?: React.ReactNode }> = ({
  lean, talking, face, blink, holding }) => {
  const b = brotherLying(lean, talking);
  const top = BUNK.topBunk.y;
  return (
    <g>
      {/* the pillow at the head end */}
      <ellipse cx={420} cy={top - 26} rx={130} ry={40} fill="#efe6d4" stroke={INK} strokeWidth={5} />
      <path d="M320 -12 Q420 0 520 -12" transform={`translate(0 ${top - 18})`} fill="none" stroke="#cfc3ac" strokeWidth={4} />
      {/* the hoodie: his shoulder and back, down into the blanket */}
      <path d={`M${b.shoulder.x - 10} ${b.shoulder.y - 6} Q${b.shoulder.x + 60} ${top - 110} 680 ${top - 60}`} fill="none" stroke={INK} strokeWidth={104} strokeLinecap="round" />
      <path d={`M${b.shoulder.x - 10} ${b.shoulder.y - 6} Q${b.shoulder.x + 60} ${top - 110} 680 ${top - 60}`} fill="none" stroke={BROTHER.coat} strokeWidth={94} strokeLinecap="round" />
      {/* the hood bunched behind his neck */}
      <ellipse cx={b.shoulder.x + 40} cy={b.shoulder.y - 46} rx={46} ry={30} fill="#4e5560" stroke={INK} strokeWidth={4} />
      {/* the blanket over the rest of him, a bump for his knees and feet at the far end */}
      <path d={`M620 ${top} L620 ${top - 72} Q760 ${top - 128} 980 ${top - 104} Q1180 ${top - 84} 1330 ${top - 112} Q1520 ${top - 140} 1640 ${top - 84} L1660 ${top} Z`}
        fill="#a5654a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M640 ${top - 76} Q760 ${top - 120} 980 ${top - 96}`} fill="none" stroke="#c98a6a" strokeWidth={18} strokeLinecap="round" />
      {[820, 1100, 1400].map((x) => <path key={x} d={`M${x} ${top - 100} q20 50 0 96`} fill="none" stroke="#7d4a36" strokeWidth={4} />)}
      {/* the guard rail again in front of him, so he lies behind it */}
      <rect x={300} y={RAIL} width={1400} height={24} rx={10} fill="#4a3022" stroke={INK} strokeWidth={5} />
      {[760, 1040, 1320].map((x) => <rect key={x} x={x} y={RAIL} width={16} height={56} fill="#4a3022" />)}
      {/* the arm: grey sleeve to the elbow, then the forearm, over the rail */}
      <polyline points={`${b.shoulder.x},${b.shoulder.y} ${b.elbow.x},${b.elbow.y}`} fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <polyline points={`${b.shoulder.x},${b.shoulder.y} ${b.elbow.x},${b.elbow.y}`} fill="none" stroke={BROTHER.coat} strokeWidth={22} strokeLinecap="round" />
      <polyline points={`${b.elbow.x},${b.elbow.y} ${b.hand.x},${b.hand.y}`} fill="none" stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <circle cx={b.hand.x} cy={b.hand.y} r={15} fill={BROTHER.head} stroke={INK} strokeWidth={3} />
      {holding && <g transform={`translate(${b.hand.x} ${b.hand.y})`}>{holding}</g>}
      <BroHead x={b.head.x} y={b.head.y} tilt={b.tilt} face={face} blink={blink} />
    </g>
  );
};
