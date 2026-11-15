// Night One's plant for the climax (v7): the piano teacher's back room inside. A workbench under a hanging bulb with
// radios and lamps in pieces (open radio cases, a speaker cone, valves, a lampshade, a lamp base, loose bulbs), a
// soldering iron with a wisp of smoke, a pegboard of tools. The teacher (grey head, green cardigan) solders at the left
// of the bench; you stand at the right holding a lamp cord up to the light, the plug dangling, studying it. REF
// coordinates, its own lit Stage.
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { noise } from "../shared";
import { aimArm, handAt, Person, type Body, type Face } from "./TellMeTomorrow.Kit";

const FLOOR = 960;
const TOP = 740;
export const BULB = { x: 1480, y: 300 };

/** An old radio case, its back off: a box, a dial, a speaker grille, a valve or two showing. */
const Radio: React.FC<{ x: number; y: number; s?: number; open?: boolean; c?: string }> = ({ x, y, s = 1, open, c = "#8a5a3c" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-110} width={160} height={110} rx={14} fill={c} stroke={INK} strokeWidth={5} />
    <circle cx={-30} cy={-56} r={30} fill="#e9dcc2" stroke={INK} strokeWidth={4} />
    {[0, 1, 2].map((k) => <line key={k} x1={-52} y1={-66 + k * 10} x2={-8} y2={-66 + k * 10} stroke={INK} strokeWidth={2} />)}
    <circle cx={42} cy={-60} r={16} fill={PAPER} stroke={INK} strokeWidth={4} />
    <line x1={42} y1={-60} x2={52} y2={-70} stroke={CRIMSON} strokeWidth={3} />
    {open && [0, 1].map((k) => (
      <g key={k} transform={`translate(${20 + k * 28} -112)`}>
        <rect x={-8} y={-30} width={16} height={30} rx={8} fill="#cfe6f0" stroke={INK} strokeWidth={3} opacity={0.9} />
      </g>
    ))}
  </g>
);

/** A table lamp in pieces: the base on its side, the shade beside it, a loose bulb. */
const LampPieces: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-8} rx={44} ry={10} fill="#3f5a4a" stroke={INK} strokeWidth={4} />
    <rect x={-6} y={-70} width={12} height={62} fill="#c9a06a" stroke={INK} strokeWidth={3} transform="rotate(-70 0 -8)" />
    <path d="M70 -2 L90 -60 L150 -60 L170 -2 Z" fill={MUSTARD} stroke={INK} strokeWidth={4} />
    <circle cx={-80} cy={-16} r={14} fill="#fff6dc" stroke={INK} strokeWidth={3} />
    <rect x={-86} y={-4} width={12} height={8} fill="#9aa1ab" stroke={INK} strokeWidth={2} />
  </g>
);

export interface WorkshopProps {
  frame: number;
  cam: Camera;
  mood: MoodName;
  /** Your face while you study the cord. */
  face: Face;
  teacher: Face;
  /** 0..1: the teacher looks up from the iron and nods. */
  nod?: number;
}

/** The back room: the teacher soldering, you holding the lamp cord up to the bulb. */
export const Workshop: React.FC<WorkshopProps> = ({ frame, cam, mood, face, teacher, nod = 0 }) => {
  const you: Body = { x: 1700, y: FLOOR, scale: 1.15, facing: -1, pose: { ...STAND, tilt: -10 } };
  const lift = { x: 1560 + Math.sin(frame / 18) * 10, y: 480 + Math.sin(frame / 11) * 6 };
  const youPose: Pose = { ...STAND, tilt: -12, armF: aimArm(you, lift), armB: [20, 60] };
  const hand = handAt({ ...you, pose: youPose }, "front");
  const tb: Body = { x: 520, y: FLOOR, scale: 1.15, facing: 1, pose: { ...STAND, lean: 14 } };
  const iron = { x: 760, y: TOP - 30 + (frame % 16 < 5 ? 4 : 0) };
  const tPose: Pose = { ...STAND, lean: 14 - nod * 10, tilt: Math.sin(nod * Math.PI * 4) * 9, armF: aimArm(tb, iron), armB: [40, 70] };
  const tHand = handAt({ ...tb, pose: tPose }, "front");
  const look = setLook([{ x: BULB.x, y: BULB.y + 40, r: 560, color: "#ffe2a6", strength: 0.55, moods: ["morning", "day", "dusk", "night", "lamp", "frozen"] }], mood, cam);
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={
          <g>
            <rect x={-1400} y={-900} width={4700} height={2900} fill="#6b5240" />
            {/* the pegboard of tools */}
            <rect x={330} y={170} width={640} height={360} rx={8} fill="#b08a5a" stroke={INK} strokeWidth={6} />
            {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={360 + (i % 12) * 52} cy={200 + Math.floor(i / 12) * 66} r={4} fill="#6b5240" />)}
            <path d="M420 230 l0 120 M400 230 l40 0" stroke={INK} strokeWidth={10} strokeLinecap="round" />
            <path d="M540 240 q30 40 0 80 q-30 40 0 80" fill="none" stroke={INK} strokeWidth={8} />
            <rect x={640} y={240} width={24} height={150} rx={6} fill={CRIMSON} stroke={INK} strokeWidth={4} />
            <circle cx={800} cy={300} r={46} fill="none" stroke="#1D9A8F" strokeWidth={12} />
            {/* a shelf of more radios */}
            <rect x={1100} y={540} width={660} height={14} fill="#4a3a2c" />
            <Radio x={1220} y={540} s={0.7} c="#5a6070" />
            <Radio x={1420} y={540} s={0.7} />
            <Radio x={1620} y={540} s={0.7} c="#3f5a4a" />
            <rect x={-1400} y={FLOOR - 40} width={4700} height={900} fill="#4a3a2c" />
            {/* the hanging bulb */}
            <line x1={BULB.x} y1={-300} x2={BULB.x} y2={BULB.y - 30} stroke={INK} strokeWidth={5} />
            <rect x={BULB.x - 14} y={BULB.y - 34} width={28} height={20} fill="#9aa1ab" stroke={INK} strokeWidth={3} />
            <circle cx={BULB.x} cy={BULB.y} r={26} fill="#fff6dc" stroke={INK} strokeWidth={4} />
            <circle cx={BULB.x} cy={BULB.y} r={70} fill="#fff1c4" opacity={0.25} />
          </g>
        }
        actors={
          <>
            <Person who="piano" b={{ ...tb, pose: tPose }} face={teacher} frame={frame} seed={4} />
            <Person who="you" b={{ ...you, pose: youPose }} face={face} frame={frame} />
            {/* the bench and what's on it */}
            <rect x={600} y={TOP} width={980} height={26} rx={6} fill="#8a6a4f" stroke={INK} strokeWidth={6} />
            <rect x={640} y={TOP + 26} width={22} height={FLOOR - 40 - TOP - 26} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
            <rect x={1520} y={TOP + 26} width={22} height={FLOOR - 40 - TOP - 26} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
            <Radio x={930} y={TOP} open />
            <g transform={`translate(1080 ${TOP - 30})`}>
              <circle r={44} fill="#3b3e47" stroke={INK} strokeWidth={5} />
              <circle r={20} fill="#6d6a62" stroke={INK} strokeWidth={4} />
            </g>
            {[0, 1, 2].map((k) => <rect key={k} x={1140 + k * 22} y={TOP - 34} width={14} height={30} rx={7} fill="#cfe6f0" stroke={INK} strokeWidth={3} transform={`rotate(${-20 + k * 25} ${1147 + k * 22} ${TOP - 4})`} />)}
            <LampPieces x={1320} y={TOP} />
            {/* the soldering iron in the teacher's hand, and its smoke */}
            <line x1={tHand.x} y1={tHand.y} x2={iron.x + 10} y2={iron.y + 26} stroke={INK} strokeWidth={10} strokeLinecap="round" />
            <line x1={iron.x - 20} y1={iron.y - 4} x2={iron.x + 12} y2={iron.y + 28} stroke="#9aa1ab" strokeWidth={5} strokeLinecap="round" />
            {[0, 1, 2].map((k) => {
              const q = ((frame + k * 12) % 36) / 36;
              return <circle key={k} cx={iron.x + 14 + Math.sin(q * 6 + k) * 10} cy={iron.y + 20 - q * 120} r={8 + q * 10} fill="#e9e6df" opacity={0.5 * (1 - q)} />;
            })}
            {/* the lamp cord you hold up to the light: from your hand down to the lamp base, the plug dangling */}
            <path d={`M${hand.x} ${hand.y} C ${hand.x - 60} ${hand.y + 200}, 1420 ${TOP - 140}, 1320 ${TOP - 10}`} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <path d={`M${hand.x} ${hand.y} C ${hand.x - 60} ${hand.y + 200}, 1420 ${TOP - 140}, 1320 ${TOP - 10}`} fill="none" stroke="#e9dcc2" strokeWidth={4} strokeLinecap="round" />
            <path d={`M${hand.x} ${hand.y} q-10 40 -2 ${70 + Math.sin(frame / 7) * 6}`} fill="none" stroke={INK} strokeWidth={7} />
            <g transform={`translate(${hand.x - 2} ${hand.y + 74 + Math.sin(frame / 7) * 6}) rotate(${Math.sin(frame / 9) * 12})`}>
              <rect x={-14} y={0} width={28} height={30} rx={5} fill="#2b2f3d" stroke={INK} strokeWidth={3} />
              <rect x={-9} y={30} width={5} height={16} fill="#c9ced6" /><rect x={4} y={30} width={5} height={16} fill="#c9ced6" />
            </g>
            {[0, 1, 2].map((k) => <circle key={k} cx={hand.x - 30 + noise(k) * 10} cy={hand.y - 20 - k * 6} r={3} fill={MUSTARD} opacity={frame % 20 < 10 ? 0.9 : 0} />)}
          </>
        } />
    </LookContext.Provider>
  );
};
