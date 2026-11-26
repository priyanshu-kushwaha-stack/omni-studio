// The plasma clinic (owner: builder A; used by The Chair, Night One, More Hours at noon, Morning's front step).
// Inside, side on, at dawn: grey light through the blinds on the left, the wall clock in front of the chair, the
// plasma machine on its trolley with the drip stand, the reclining chair facing left, the door on the right. Outside:
// the clinic's front, a glass door under a sign with bars (no lettering), two concrete steps, the sidewalk, the low
// desert ridge far behind (El Paso).
//
// Every coordinate is REF (1920x1080 at zoom 1). Exports are stable, other builders import them:
//   CLINIC                      anchors inside (floor, the chair's hip point, clock, door, machine, nurse/broker spots)
//   ClinicBack                  the room behind the actors: <ClinicBack cam mood frame door clock />
//   ClinicDoorPanel, WallClock  the door's panel (to shut it in front of someone) and the clock
//   ClinicChair / ClinicArmrest the chair (behind whoever sits in it) and its armrest (in front of their arm)
//   seatedInChair, chairToWorld where a person in the chair goes (Figure props), and a chair-local point in world units
//   clinicLights                the set's lights for setLook
//   ClinicScene                 the whole room on a Stage: <ClinicScene frame mood cam actors front door clock />
//   CLINIC_OUT, ClinicOutsideBack, ClinicOutside   the front step outside, and its scene
import { LookContext, type Look } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { SEATED, type Pose } from "@whatif/kit/rig/pose";
import { Deep, Floor, LIGHTS_ON, lightsOn, OUTSIDE, setLook, Sky, TubeLight, type SetLight } from "@whatif/kit/sets/common";
import { INK, PAPER } from "@whatif/kit/theme";

const FLOOR = 940;

/** Anchors inside the clinic. The chair faces left: whoever sits in it looks at the clock. */
export const CLINIC = {
  floor: FLOOR,
  /** The hip point of whoever sits in the chair, the chair's lean back (degrees) and its facing. */
  chair: { x: 1000, y: 780, recline: 28, facing: -1 as const, scale: 1.3 },
  clock: { x: 640, y: 250, r: 72 },
  window: { x: 110, y: 170, w: 360, h: 380 },
  /** The doorway: its centre x, its top, its width. The door hinges on its right edge. */
  door: { x: 1675, top: 300, w: 240 },
  /** The plasma machine on its trolley and the drip stand beside it. */
  machine: { x: 760, top: 610 },
  drip: { x: 610, top: 300 },
  /** Standing spots (feet), people at scale 1.3 for the wide. */
  spots: {
    nurse: { x: 1185, y: FLOOR - 20, scale: 1.3, facing: -1 as const },
    broker: { x: 1250, y: FLOOR - 10, scale: 1.3, facing: -1 as const },
    doorway: { x: 1675, y: FLOOR - 10, scale: 1.3, facing: -1 as const },
    left: { x: 420, y: FLOOR - 10, scale: 1.3, facing: 1 as const },
  },
};

export interface ClinicOptions {
  /** The door, 0 shut to 1 wide open. */
  door?: number;
  /** The clock's time in minutes after midnight at frame 0 (it runs with the frame). Dawn: 6:10. */
  clock?: number;
}

/** The wall clock: a white face, twelve marks, the hands; the second hand jumps once a second (30 fps). */
export const WallClock: React.FC<{ x: number; y: number; r: number; frame: number; minutes?: number }> = ({ x, y, r, frame, minutes = 370 }) => {
  const sec = Math.floor(frame / 30);
  const m = minutes + sec / 60;
  const hand = (deg: number, len: number, w: number, color: string) => {
    const a = (deg * Math.PI) / 180;
    return <line x1={x} y1={y} x2={x + Math.sin(a) * len} y2={y - Math.cos(a) * len} stroke={color} strokeWidth={w} strokeLinecap="round" />;
  };
  return (
    <g>
      <circle cx={x} cy={y} r={r + 10} fill="#3d4148" stroke={INK} strokeWidth={5} />
      <circle cx={x} cy={y} r={r} fill="#fbf8f0" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r0 = i % 3 === 0 ? r * 0.74 : r * 0.83;
        return <line key={i} x1={x + Math.sin(a) * r0} y1={y - Math.cos(a) * r0} x2={x + Math.sin(a) * r * 0.92} y2={y - Math.cos(a) * r * 0.92}
          stroke={INK} strokeWidth={i % 3 === 0 ? 6 : 3} strokeLinecap="round" />;
      })}
      {hand(((m / 60) % 12) * 30, r * 0.5, 9, INK)}
      {hand((m % 60) * 6, r * 0.74, 6, INK)}
      {hand((sec % 60) * 6, r * 0.82, 3, "#d8344f")}
      <circle cx={x} cy={y} r={6} fill={INK} />
    </g>
  );
};

/** The blinds over the window: slats with sky between them. */
const Blinds: React.FC<{ mood: MoodName }> = ({ mood }) => {
  const W = CLINIC.window;
  return (
    <g>
      <clipPath id="clinic-win"><rect x={W.x} y={W.y} width={W.w} height={W.h} /></clipPath>
      <g clipPath="url(#clinic-win)">
        <Sky id="clinic" mood={mood} x={W.x} y={W.y} w={W.w} h={W.h} sunAt={{ x: W.x + W.w * 0.3, y: W.y + W.h * 0.75 }} />
        <path d={`M${W.x - 20} ${W.y + W.h} L${W.x + 60} ${W.y + W.h - 90} L${W.x + 150} ${W.y + W.h - 60} L${W.x + 250} ${W.y + W.h - 120} L${W.x + W.w + 20} ${W.y + W.h - 70} L${W.x + W.w + 20} ${W.y + W.h + 10}Z`}
          fill={OUTSIDE[mood].dark ? "#2a2c48" : "#b99a86"} opacity={0.85} />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={W.x - 10} y={W.y + 6 + i * 29} width={W.w + 20} height={17} fill="#e8e6dc" stroke="#b9b5a8" strokeWidth={2} />
        ))}
      </g>
      <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="none" stroke="#c9c6bb" strokeWidth={16} />
      <rect x={W.x - 18} y={W.y - 24} width={W.w + 36} height={22} rx={6} fill="#d8d4c8" stroke={INK} strokeWidth={4} />
      <line x1={W.x + W.w - 30} y1={W.y} x2={W.x + W.w - 30} y2={W.y + W.h + 60} stroke="#9a968a" strokeWidth={3} />
    </g>
  );
};

/** Stripes of dawn light from the blinds, falling across the wall and the floor (morning and day only). */
const BlindLight: React.FC<{ mood: MoodName }> = ({ mood }) => {
  if (mood !== "morning" && mood !== "day") return null;
  const W = CLINIC.window;
  return (
    <g opacity={mood === "morning" ? 0.22 : 0.14}>
      {Array.from({ length: 6 }, (_, i) => {
        const y = W.y + 40 + i * 58;
        return <path key={i} d={`M${W.x + W.w} ${y} L${W.x + W.w} ${y + 22} L${W.x + W.w + 700} ${y + 360} L${W.x + W.w + 700} ${y + 318}Z`} fill="#fff1c8" />;
      })}
    </g>
  );
};

/** The plasma machine on its trolley (a white box, a spinning bowl window, a small screen) and the drip stand. */
const Machine: React.FC<{ frame: number }> = ({ frame }) => {
  const M = CLINIC.machine;
  const D = CLINIC.drip;
  const spin = frame * 14;
  return (
    <g>
      {/* the drip stand: a pole on a five-foot base, a hook, a bag of pale gold */}
      <rect x={D.x - 4} y={D.top} width={8} height={FLOOR - D.top - 30} fill="#9aa1ab" stroke={INK} strokeWidth={2} />
      <path d={`M${D.x - 50} ${FLOOR - 10} L${D.x} ${FLOOR - 40} L${D.x + 50} ${FLOOR - 10}`} fill="none" stroke="#7d848e" strokeWidth={7} strokeLinecap="round" />
      <path d={`M${D.x - 30} ${D.top + 10} H${D.x + 30}`} stroke="#9aa1ab" strokeWidth={6} strokeLinecap="round" />
      <rect x={D.x - 28} y={D.top + 16} width={56} height={84} rx={14} fill="#f6dc8a" opacity={0.9} stroke={INK} strokeWidth={3} />
      <rect x={D.x - 28} y={D.top + 56} width={56} height={44} rx={12} fill="#efc24e" opacity={0.9} />
      {/* the machine */}
      <rect x={M.x - 90} y={M.top} width={180} height={220} rx={16} fill="#eef0ee" stroke={INK} strokeWidth={5} />
      <rect x={M.x - 62} y={M.top + 22} width={124} height={60} rx={8} fill="#2f3542" />
      <rect x={M.x - 50} y={M.top + 36} width={58} height={8} rx={4} fill="#7ff0e6" opacity={0.8} />
      <rect x={M.x - 50} y={M.top + 54} width={86} height={8} rx={4} fill="#9fd9dc" opacity={0.6} />
      <circle cx={M.x} cy={M.top + 140} r={42} fill="#d9dde3" stroke={INK} strokeWidth={4} />
      <g transform={`rotate(${spin} ${M.x} ${M.top + 140})`}>
        <path d={`M${M.x - 30} ${M.top + 140} A30 30 0 0 1 ${M.x + 30} ${M.top + 140}`} fill="#f2d27a" stroke={INK} strokeWidth={3} />
      </g>
      <rect x={M.x - 100} y={M.top + 220} width={200} height={16} rx={6} fill="#9aa1ab" stroke={INK} strokeWidth={3} />
      {[M.x - 80, M.x + 80].map((x) => <circle key={x} cx={x} cy={FLOOR - 16} r={14} fill={INK} />)}
      <rect x={M.x - 6} y={M.top + 236} width={12} height={FLOOR - M.top - 252} fill="#7d848e" />
    </g>
  );
};

/** The door's panel on its right hinge: 0 shut, 1 open (it turns edge-on). Drawn by ClinicBack; a beat can draw it
 *  again in its actors to shut the door in front of someone walking out. */
export const ClinicDoorPanel: React.FC<{ open: number }> = ({ open }) => {
  const D = CLINIC.door;
  const left = D.x - D.w / 2;
  const h = FLOOR - 20 - D.top;
  const panel = D.w * (1 - 0.86 * open);
  return (
    <g transform={`translate(${left + D.w} 0) scale(${-panel / D.w} 1)`}>
      <rect x={0} y={D.top} width={D.w} height={h} fill="#8fa3a0" stroke={INK} strokeWidth={5} />
      <rect x={60} y={D.top + 50} width={D.w - 120} height={110} rx={6} fill="#cfe6ec" stroke={INK} strokeWidth={4} />
      <rect x={D.w - 44} y={D.top + h * 0.5} width={22} height={60} rx={8} fill="#d8d4c8" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** The doorway: the frame, the lit corridor beyond, and the panel. */
const Door: React.FC<{ open: number }> = ({ open }) => {
  const D = CLINIC.door;
  const left = D.x - D.w / 2;
  const h = FLOOR - 20 - D.top;
  return (
    <g>
      <rect x={left - 22} y={D.top - 22} width={D.w + 44} height={h + 22} fill="#c9c6bb" stroke={INK} strokeWidth={5} />
      <rect x={left} y={D.top} width={D.w} height={h} fill="#f3efe2" />
      <rect x={left} y={D.top + h * 0.72} width={D.w} height={h * 0.28} fill="#d4d9d2" />
      <rect x={left + 40} y={D.top + 60} width={70} height={90} rx={4} fill="#e2ddd0" stroke="#b9b5a8" strokeWidth={3} />
      <ClinicDoorPanel open={open} />
    </g>
  );
};

/** The room behind the actors. `door` 0..1 open, `clock` the time in minutes at frame 0. */
export const ClinicBack: React.FC<{ cam: Camera; mood: MoodName; frame: number; door?: number; clock?: number }> = ({
  cam, mood, frame, door = 0, clock = 370,
}) => {
  const on = lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  const C = CLINIC.clock;
  return (
    <>
      <Deep cam={cam} depth={0.86} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#9fb0aa" : "#dbe4dc"} />
        <rect x={-1400} y={620} width={4800} height={340} fill={dark ? "#86998f" : "#c3d3c8"} />
        <rect x={-1400} y={612} width={4800} height={14} fill="#a9bdb0" />
        <Blinds mood={mood} />
        {/* a poster with bars for words and a drawn drop, and the hand-sanitiser box */}
        <rect x={880} y={190} width={170} height={230} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
        <path d="M965 228 Q935 270 935 292 A30 30 0 0 0 995 292 Q995 270 965 228Z" fill="#efc24e" stroke={INK} strokeWidth={3} />
        {[340, 365, 390].map((y) => <rect key={y} x={905} y={y} width={y === 390 ? 80 : 120} height={10} rx={5} fill="#b9b5a8" />)}
        <rect x={1260} y={330} width={70} height={110} rx={10} fill="#eef0ee" stroke={INK} strokeWidth={4} />
        <rect x={1285} y={440} width={20} height={16} fill="#9aa1ab" />
        <WallClock x={C.x} y={C.y} r={C.r} frame={frame} minutes={clock} />
        <TubeLight x={1100} y={110} w={320} on={on} />
        <BlindLight mood={mood} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={FLOOR - 20} fill={dark ? "#9aa59c" : "#c7cfc7"} gap={170} slant={-70} opacity={0.06} />
        <Door open={door} />
        <Machine frame={frame} />
      </Deep>
    </>
  );
};

/** A point given in the chair's own coordinates (hip at 0,0, facing right, unscaled, upright) in world units. */
export function chairToWorld(p: { x: number; y: number }, c = CLINIC.chair) {
  const s = c.scale;
  const lx = p.x * s * c.facing;
  const ly = p.y * s;
  const a = (-c.facing * c.recline * Math.PI) / 180;
  return { x: c.x + lx * Math.cos(a) - ly * Math.sin(a), y: c.y + lx * Math.sin(a) + ly * Math.cos(a) };
}

/** Figure props that sit someone in the chair: hips on the seat, leaning back with it. Pass the pose's arms and face. */
export function seatedInChair(pose: Pose = SEATED, lean = 0, c = CLINIC.chair) {
  return {
    x: c.x, y: c.y + 112 * c.scale, scale: c.scale, facing: c.facing, rotate: -c.facing * (c.recline - lean), pose,
  };
}

/** The reclining chair behind its sitter: the back cushion and headrest, the seat, the raised leg rest, the base. */
export const ClinicChair: React.FC<{ c?: typeof CLINIC.chair; color?: string }> = ({ c = CLINIC.chair, color = "#3f5f73" }) => {
  const s = c.scale;
  const rot = -c.facing * c.recline;
  return (
    <g>
      {/* the base: a column and a foot on the floor */}
      <path d={`M${c.x - 30} ${c.y + 20} L${c.x + 30} ${c.y + 20} L${c.x + 22} ${FLOOR - 40} L${c.x - 22} ${FLOOR - 40}Z`} fill="#7d848e" stroke={INK} strokeWidth={4} />
      <rect x={c.x - 120} y={FLOOR - 46} width={240} height={26} rx={10} fill="#5d636c" stroke={INK} strokeWidth={4} />
      <g transform={`translate(${c.x} ${c.y}) rotate(${rot}) scale(${s * c.facing} ${s})`}>
        <rect x={-62} y={-250} width={62} height={262} rx={26} fill={color} stroke={INK} strokeWidth={4} />
        <rect x={-54} y={-196} width={16} height={190} rx={8} fill="#000" opacity={0.12} />
        <rect x={-50} y={-6} width={176} height={36} rx={16} fill={color} stroke={INK} strokeWidth={4} />
        <rect x={104} y={4} width={34} height={124} rx={14} fill={color} stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};

/** The chair's near armrest, drawn after the sitter so the arm lies on it. */
export const ClinicArmrest: React.FC<{ c?: typeof CLINIC.chair; color?: string }> = ({ c = CLINIC.chair, color = "#4f7389" }) => (
  <g transform={`translate(${c.x} ${c.y}) rotate(${-c.facing * c.recline}) scale(${c.scale * c.facing} ${c.scale})`}>
    <rect x={-24} y={-40} width={128} height={18} rx={9} fill={color} stroke={INK} strokeWidth={4} />
    <rect x={-4} y={-24} width={14} height={30} fill="#5d636c" />
  </g>
);

/** The set's lights: the window at dawn, the tube light when it is dark outside. */
export const clinicLights = (): SetLight[] => [
  { x: 290, y: 360, depth: 0.86, r: 460, color: "#fff2cc", strength: 0.4, moods: ["morning", "day"] },
  { x: 1100, y: 120, depth: 0.86, r: 560, color: "#f4fbf2", strength: 0.3, moods: LIGHTS_ON },
];

/** The clinic on a Stage, lit by the mood and the set's lights. `actors` draws people (use ClinicChair/ClinicArmrest
 *  around whoever sits in the chair); `front` draws in front of everything. */
export const ClinicScene: React.FC<{
  frame: number; mood: MoodName; cam: Camera; actors: React.ReactNode; front?: React.ReactNode; door?: number; clock?: number;
  look?: Partial<Look>;
}> = ({ frame, mood, cam, actors, front, door, clock, look }) => (
  <LookContext.Provider value={setLook(clinicLights(), mood, cam, look)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<ClinicBack cam={cam} mood={mood} frame={frame} door={door} clock={clock} />}
      actors={actors} front={front} />
  </LookContext.Provider>
);

// ------------------------------------------------------------------------------------------------ outside

/** The clinic's front, outside: the sidewalk (floor), the two steps up to the glass door. People stand on the
 *  sidewalk at `floor` or on the top step at `step.top`. */
export const CLINIC_OUT = {
  floor: 980,
  step: { x: 960, top: 900, w: 520 },
  door: { x: 960, top: 420, w: 260 },
  spots: {
    step: { x: 960, y: 900, scale: 1.2, facing: -1 as const },
    left: { x: 520, y: 980, scale: 1.2, facing: 1 as const },
    right: { x: 1420, y: 980, scale: 1.2, facing: -1 as const },
  },
};

/** The front outside: the sky, the far desert ridge, the stucco front, the sign with bars, the glass door, the steps. */
export const ClinicOutsideBack: React.FC<{ cam: Camera; mood: MoodName; frame: number; door?: number }> = ({ cam, mood, door = 0 }) => {
  const O = CLINIC_OUT;
  const dark = OUTSIDE[mood].dark;
  const on = lightsOn(mood);
  const D = O.door;
  return (
    <>
      <Deep cam={cam} depth={0.4} flat>
        <Sky id="clinic-out" mood={mood} x={-1400} y={-800} w={4800} h={1500} sunAt={{ x: 1500, y: 260 }} />
        <path d="M-1400 640 L-600 560 L-200 600 L300 500 L700 560 L1100 470 L1500 540 L2000 500 L2600 580 L3400 560 V900 H-1400Z"
          fill={dark ? "#2c2f50" : "#c99a7a"} opacity={0.9} />
      </Deep>
      <Deep cam={cam} depth={0.9}>
        <rect x={-1400} y={170} width={4800} height={760} fill={dark ? "#8a7f74" : "#e6d4b6"} />
        <rect x={-1400} y={150} width={4800} height={34} fill={dark ? "#6e655c" : "#c9b493"} stroke={INK} strokeWidth={4} />
        {/* the sign: a board with bars for the words and a drawn drop */}
        <rect x={D.x - 330} y={230} width={660} height={130} rx={10} fill="#2f5f6f" stroke={INK} strokeWidth={5} />
        <path d={`M${D.x - 250} 262 Q${D.x - 280} 302 ${D.x - 280} 318 A30 30 0 0 0 ${D.x - 220} 318 Q${D.x - 220} 302 ${D.x - 250} 262Z`} fill="#efc24e" />
        <rect x={D.x - 180} y={275} width={420} height={22} rx={11} fill={PAPER} opacity={0.9} />
        <rect x={D.x - 180} y={312} width={280} height={18} rx={9} fill={PAPER} opacity={0.6} />
        {/* windows either side, blinds down */}
        {[-560, 400].map((dx) => (
          <g key={dx}>
            <rect x={D.x + dx} y={430} width={160 + 120} height={280} fill={on ? "#ffe7a8" : "#cfe2e6"} stroke={INK} strokeWidth={5} />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={D.x + dx} y={440 + i * 34} width={280} height={20} fill="#e8e6dc" opacity={0.85} />)}
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={O.floor - 20} fill={dark ? "#6f6a66" : "#b9b2a6"} gap={240} slant={-60} opacity={0.08} />
        <rect x={-1400} y={O.floor + 60} width={4800} height={30} fill="#8f877b" />
        {/* the glass door, opening inward (it darkens as it opens) */}
        <rect x={D.x - D.w / 2 - 20} y={D.top - 20} width={D.w + 40} height={O.step.top - D.top + 20} fill="#5d636c" stroke={INK} strokeWidth={5} />
        <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={O.step.top - D.top} fill={door > 0.5 ? "#3a4048" : "#a9cdd6"} />
        <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={O.step.top - D.top} fill="#e9f4f6" opacity={0.35 * (1 - door)} />
        <line x1={D.x - D.w / 2 + 30} y1={D.top + 30} x2={D.x - D.w / 2 + 90} y2={D.top + 140} stroke="#fff" strokeWidth={8} opacity={0.4} />
        <rect x={D.x + D.w / 2 - 40} y={D.top + 200} width={14} height={90} rx={6} fill="#c9c6bb" />
        {/* the steps */}
        <rect x={O.step.x - O.step.w / 2} y={O.step.top} width={O.step.w} height={40} fill="#cfc8bb" stroke={INK} strokeWidth={4} />
        <rect x={O.step.x - O.step.w / 2 - 60} y={O.step.top + 40} width={O.step.w + 120} height={O.floor - O.step.top - 60} fill="#c2baab" stroke={INK} strokeWidth={4} />
      </Deep>
    </>
  );
};

/** The front step outside on a Stage. */
export const ClinicOutside: React.FC<{ frame: number; mood: MoodName; cam: Camera; actors: React.ReactNode; door?: number; look?: Partial<Look> }> = ({
  frame, mood, cam, actors, door, look,
}) => (
  <LookContext.Provider value={setLook([{ x: 1500, y: 260, depth: 0.4, r: 500, color: "#fff2cc", strength: 0.3, moods: ["morning", "day"] }], mood, cam, look)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<ClinicOutsideBack cam={cam} mood={mood} frame={frame} door={door} />} actors={actors} />
  </LookContext.Provider>
);
