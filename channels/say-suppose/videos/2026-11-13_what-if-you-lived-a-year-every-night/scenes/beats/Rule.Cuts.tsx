// The Rule's hall pictures (v7): the quick cuts of a lifetime of skills at the night desk (a drawn violin, an omelette
// flip, a bow to a guest in a hat), your flatmate's jaw dropping a notch further each time, the boss closing the
// crate's lid, the counters on every hatch fluttering once in a ripple, and the mop lying where she dropped it. All in
// the hall's world coordinates (REF), for a HallStage `actors` slot.
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { noise, PASTELS } from "../shared";
import { aimArm, Crate, DeskFront, handAt, headOf, Person, type Body, type Face } from "./TellMeTomorrow.Kit";
import { Jaw } from "./TellMeTomorrow.Key";

const FLOOR = 960;
/** You behind the night desk (the boss's spot). */
const DESK_YOU: Body = { x: 330, y: 950, scale: 1.12, facing: 1, pose: STAND };

/** A drawn music note floating up (an ink head and stem; no text). */
const Note: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <g opacity={o}>
    <ellipse cx={x} cy={y} rx={12} ry={9} fill={INK} transform={`rotate(-20 ${x} ${y})`} />
    <line x1={x + 10} y1={y - 2} x2={x + 10} y2={y - 46} stroke={INK} strokeWidth={5} />
    <path d={`M${x + 10} ${y - 46} q16 8 14 24`} fill="none" stroke={INK} strokeWidth={5} />
  </g>
);

/** You behind the desk playing a drawn violin, eyes shut, the bow sawing, notes floating off. */
export const ViolinCut: React.FC<{ frame: number }> = ({ frame }) => {
  const saw = Math.sin(frame / 3.5);
  const base: Pose = { ...STAND, lean: -4, tilt: -14 };
  const b = { ...DESK_YOU, pose: base };
  const h = headOf(b);
  const chin = { x: h.x + 34, y: h.y + 60 };
  const pose: Pose = { ...base, armB: aimArm(b, { x: chin.x + 110, y: chin.y - 10 }), armF: aimArm(b, { x: chin.x + 10 + saw * 60, y: chin.y + 70 - saw * 20 }) };
  const hand = handAt({ ...b, pose }, "front");
  return (
    <>
      <Person who="you" b={{ ...b, pose }} face={{ brows: "raised", lids: 1, mouth: "smile" }} frame={frame} />
      <g transform={`translate(${chin.x} ${chin.y}) rotate(-24)`}>
        <path d="M0 -26 C 30 -40, 50 -10, 70 -24 C 96 -40, 120 -20, 120 0 C 120 20, 96 40, 70 24 C 50 10, 30 40, 0 26 Z" fill="#a8582e" stroke={INK} strokeWidth={5} />
        <line x1={110} y1={0} x2={190} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        <path d="M40 -10 q6 10 0 20 M80 -10 q-6 10 0 20" fill="none" stroke={INK} strokeWidth={3} />
      </g>
      <line x1={hand.x - 90} y1={hand.y - 54} x2={hand.x + 90} y2={hand.y + 54} stroke="#d9c79a" strokeWidth={6} strokeLinecap="round" />
      {[0, 1, 2].map((k) => {
        const p = ((frame + k * 14) % 42) / 42;
        return <Note key={k} x={chin.x + 160 + k * 40 + p * 60} y={chin.y - 40 - p * 200} o={1 - p} />;
      })}
      <DeskFront />
    </>
  );
};

/** You behind the desk flipping an omelette out of a pan, high, over a little camping stove, eyes following it. */
export const OmeletteCut: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const p = ((frame - from) % 30) / 30;
  const hop = Math.sin(p * Math.PI);
  const b = { ...DESK_YOU, pose: { ...STAND, lean: 4 } };
  const pan = { x: 470, y: 720 - (p < 0.15 ? p * 120 : 0) };
  const pose: Pose = { ...STAND, lean: 4, tilt: -8 - hop * 10, armF: aimArm(b, { x: pan.x - 70, y: pan.y + 4 }), armB: [30, 90] };
  return (
    <>
      <Person who="you" b={{ ...b, pose }} face={{ brows: "raised", lids: 0, mouth: hop > 0.5 ? "o" : "smile", eyes: 1.15, look: { x: 0.6, y: -0.4 - hop * 0.5 } }} frame={frame} />
      <rect x={420} y={746} width={110} height={30} rx={6} fill="#5c6470" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((k) => <path key={k} d={`M${445 + k * 30} 746 q-6 -16 0 -28 q6 12 0 28Z`} fill="#4aa0e0" />)}
      <ellipse cx={pan.x} cy={pan.y} rx={70} ry={16} fill={INK} />
      <line x1={pan.x - 70} y1={pan.y} x2={pan.x - 150} y2={pan.y + 10} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <g transform={`translate(${pan.x} ${pan.y - 14 - hop * 230}) rotate(${p * 360})`}>
        <ellipse cx={0} cy={0} rx={56} ry={18} fill="#f6d36b" stroke={INK} strokeWidth={4} />
        <ellipse cx={-12} cy={-4} rx={14} ry={6} fill="#ffe9a8" />
      </g>
      <DeskFront />
    </>
  );
};

/** A guest in a hat at the desk with a suitcase; you bow, the guest bows back, you bow lower. */
export const BowCut: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const t = frame - from;
  const you = Math.max(0, Math.sin(t / 7)) * (t > 26 ? 62 : 40);
  const them = Math.max(0, Math.sin((t - 8) / 7)) * 30;
  const guest: Body = { x: 760, y: FLOOR, scale: 1.08, facing: -1, pose: { ...STAND, lean: them, armF: [10, 10], armB: [20, 10] } };
  const gHand = handAt(guest, "back");
  return (
    <>
      <Person who="you" b={{ ...DESK_YOU, pose: { ...STAND, lean: you, armF: [20 + you * 0.6, 30], armB: [10, 20] } }}
        face={{ brows: "raised", lids: you > 30 ? 0.6 : 0, mouth: "smile", look: { x: 0.8, y: 0.2 } }} frame={frame} />
      <DeskFront />
      <Person who={{ head: PASTELS[0], coat: "#4a4f5c" }} b={guest} face={{ brows: "raised", lids: 0, mouth: them > 10 ? "smile" : "o", eyes: 1.1, look: { x: 0.8, y: 0.1 } }}
        frame={frame} seed={6} />
      {/* the hat, lifted as the guest bows */}
      <g transform={`translate(${headOf(guest).x} ${headOf(guest).y - 44 - them * 1.2}) rotate(${them * -0.6})`}>
        <rect x={-46} y={-8} width={92} height={14} rx={6} fill="#6a3b2e" stroke={INK} strokeWidth={4} />
        <rect x={-30} y={-48} width={60} height={44} rx={8} fill="#6a3b2e" stroke={INK} strokeWidth={4} />
        <rect x={-30} y={-18} width={60} height={9} fill={CRIMSON} />
      </g>
      <g transform={`translate(${gHand.x} ${gHand.y})`}>
        <rect x={-50} y={0} width={100} height={76} rx={10} fill="#3d6fb0" stroke={INK} strokeWidth={4} />
        <rect x={-18} y={-12} width={36} height={14} rx={6} fill="none" stroke={INK} strokeWidth={4} />
      </g>
    </>
  );
};

/** The mop lying on the floor where she dropped it. */
export const FloorMop: React.FC<{ x?: number }> = ({ x = 1260 }) => (
  <g>
    <line x1={x - 330} y1={FLOOR - 8} x2={x + 60} y2={FLOOR - 22} stroke="#c9915a" strokeWidth={10} strokeLinecap="round" />
    <path d={`M${x + 50} ${FLOOR - 56} Q${x + 70} ${FLOOR - 20} ${x + 50} ${FLOOR + 10} L${x + 100} ${FLOOR + 6} L${x + 100} ${FLOOR - 50} Z`} fill="#dcd6c6" stroke={INK} strokeWidth={4} />
  </g>
);

/** Your flatmate standing, staring at you, her jaw `drop` px lower than open (a notch further each cut). */
export const StaringMate: React.FC<{ frame: number; drop: number; eyes?: number; b?: Partial<Body>; brows?: Face["brows"] }> = ({ frame, drop, eyes = 1.15, b, brows = "raised" }) => {
  const body: Body = { x: 1120, y: FLOOR, scale: 1.08, facing: -1, pose: { ...STAND, lean: 4, tilt: 2, armF: [24, 20], armB: [16, 20] }, ...b };
  return (
    <>
      <Person who="mate" b={body} face={{ brows, lids: 0, mouth: "none", eyes, look: { x: 0.9, y: 0.05 } }} frame={frame} seed={5} />
      <Jaw x={body.x} y={body.y} scale={body.scale} facing={body.facing} pose={body.pose} drop={drop} />
    </>
  );
};

/** The boss's hand closing the crate's lid (`close` 0 open .. 1 shut), then patting it; he looks out, smug. */
export const CrateClose: React.FC<{ frame: number; close: number; pat: boolean }> = ({ frame, close, pat }) => {
  const b: Body = { x: 340, y: 950, scale: 1.12, facing: 1, pose: { ...STAND, lean: 14 } };
  const lid = { x: 200, y: 690 + (1 - close) * -50 + (pat && frame % 12 < 4 ? 6 : 0) };
  const pose: Pose = { ...STAND, lean: 14, tilt: -6, armF: aimArm(b, lid), armB: [30, 60] };
  return (
    <>
      <Person who="boss" b={{ ...b, pose }} face={{ brows: pat ? "raised" : "flat", lids: 0.3, mouth: "smirk", look: pat ? { x: -0.2, y: 0 } : { x: 0.3, y: 0.9 } }} frame={frame} seed={3} />
      <DeskFront />
      <Crate torn={1 - close} coils={1} />
    </>
  );
};

/** Pod hatch columns on the hall's 0.85 layer (PodHall's own layout): the counter strip sits over each hatch. */
const COLS = [150, 450, 750, 1050, 1350, 1650];
const TIERS = [395, 640];

/** The counters on every hatch fluttering once in a ripple, left to right, from `at` (drawn over PodHall's dark
 *  strips; positions follow the 0.85 layer's drift under `cam`). */
export const Ripple: React.FC<{ frame: number; at: number; cam: Camera }> = ({ frame, at, cam }) => {
  const ox = (cam.x - 960) * 0.15, oy = (cam.y - 540) * 0.15;
  return (
    <g transform={`translate(${ox} ${oy})`}>
      {COLS.map((x, i) => TIERS.map((y, t) => {
        if (i === 1 && t === 1) return null;
        const on = at + i * 4 + t * 2;
        if (frame < on || frame >= on + 16) return null;
        return (
          <g key={`${i}-${t}`}>
            {[0, 1, 2].map((k) => (
              <g key={k}>
                <rect x={x + 135 - 40 + k * 28} y={y - 36} width={24} height={22} rx={3} fill={CRIMSON} />
                <rect x={x + 135 - 36 + k * 28} y={y - 28 + (noise(frame + i * 7 + k) > 0.5 ? 4 : -2)} width={16} height={6} fill={PAPER} />
              </g>
            ))}
          </g>
        );
      }))}
    </g>
  );
};

