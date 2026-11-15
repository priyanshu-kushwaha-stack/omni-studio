// Staff Last's set: the hall of pods (sets/PodHall) with the night desk dressed for this beat and the plants the next
// beats use. All in the hall's world (REF) coordinates.
//   - the desk lamp (PodHall's, redrawn over the actors so nobody hides it) and its cord down the desk's right side;
//   - the kettle on the desk, its lead coiled on the desk top and down the left side to a floor socket;
//   - the taped-over spare socket under your old hatch (pod one), on the wall strip between the hatch and the floor,
//     drawn in the pods' layer (depth 0.85) at (585, 852) so it stays under the hatch as the camera moves;
//   - the key board behind the desk with its hook (the coils, the padlock), your chair at the desk's end with a peg on
//     its back (the coils, then the NO NAPS tag), the empty crate, the rota, and more tiers of portholes for the wide.
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { setLook } from "@whatif/kit/sets/common";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { Chair, Deep } from "../sets/common";
import { PodHallBack, podHallLights, POD_ONE } from "../sets/PodHall";
import { noise } from "../shared";

export const FLOOR = 960;
/** The night desk's top. */
export const DESK_TOP = 772;
/** The kettle's base centre on the desk. */
export const KETTLE = { x: 396, y: DESK_TOP };
/** The taped-over spare socket under pod one (depth 0.85, REF). */
export const SOCKET = { x: POD_ONE.x + POD_ONE.w / 2, y: 852 };
/** The hook on the key board behind the desk, where the coils end up padlocked. */
export const HOOK = { x: 170, y: 610 };
/** Your chair at the desk's end: its seat top, and the peg on its back (it faces the desk, so its back is on the right). */
export const CHAIR = { x: 660, top: 830 };
export const PEG = { x: CHAIR.x + 46, y: CHAIR.top - 112 };

/** A coil of the boss's teal cable with its plug tail, centred on (0, 0). */
export const Coil: React.FC<{ s?: number; turn?: number }> = ({ s = 1, turn = 0 }) => (
  <g transform={`rotate(${turn}) scale(${s})`}>
    <ellipse rx={28} ry={20} fill="none" stroke={INK} strokeWidth={13} />
    <ellipse rx={28} ry={20} fill="none" stroke={TEAL} strokeWidth={7} />
    <ellipse cx={4} cy={4} rx={20} ry={13} fill="none" stroke={TEAL} strokeWidth={5} />
    <path d="M26 8 Q40 20 44 34" fill="none" stroke={TEAL} strokeWidth={5} />
    <rect x={38} y={32} width={14} height={16} rx={4} fill="#cfd3e6" stroke={INK} strokeWidth={3} />
  </g>
);

/** A small padlock, its shackle open (`shut` 0) or snapped shut (1). */
export const Padlock: React.FC<{ x: number; y: number; shut: number; s?: number }> = ({ x, y, shut, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M-12 ${-6 - 12 * (1 - shut)} v-12 a12 12 0 0 1 24 0 v12`} fill="none" stroke="#8a8f9c" strokeWidth={6} />
    <rect x={-18} y={-6} width={36} height={30} rx={6} fill="#d9b64a" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={6} r={4} fill={INK} />
  </g>
);

/** The key board on its post behind the desk: a wooden board and the hook. Children hang on the hook. */
export const KeyBoard: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <rect x={HOOK.x - 10} y={HOOK.y + 70} width={20} height={FLOOR - HOOK.y - 70} fill="#5b4636" stroke={INK} strokeWidth={4} />
    <rect x={HOOK.x - 70} y={HOOK.y - 50} width={140} height={130} rx={8} fill="#8a6a4a" stroke={INK} strokeWidth={5} />
    <path d={`M${HOOK.x} ${HOOK.y - 20} v22 a10 10 0 0 0 20 0`} fill="none" stroke="#c9ccd6" strokeWidth={6} strokeLinecap="round" />
    {children}
  </g>
);

/** The night desk's front, drawn over whoever stands behind it. */
export const DeskFront: React.FC = () => (
  <g>
    <rect x={110} y={790} width={420} height={170} rx={10} fill="#5b4636" stroke={INK} strokeWidth={6} />
    <rect x={150} y={820} width={340} height={10} rx={4} fill="#4a382b" />
    <rect x={96} y={DESK_TOP} width={448} height={28} rx={8} fill="#7a5d47" stroke={INK} strokeWidth={6} />
  </g>
);

/** The desk lamp (PodHall's), lit at night, with its cord down the desk's right side to the floor. */
export const DeskLamp: React.FC<{ lit: boolean }> = ({ lit }) => (
  <g>
    <path d={`M472 ${DESK_TOP - 2} Q520 ${DESK_TOP - 4} 538 ${DESK_TOP + 20} L540 ${FLOOR - 6}`} fill="none" stroke={INK} strokeWidth={5} />
    <rect x={448} y={DESK_TOP - 12} width={44} height={12} rx={4} fill="#3b3e47" stroke={INK} strokeWidth={3} />
    <line x1={470} y1={DESK_TOP - 10} x2={470} y2={690} stroke={INK} strokeWidth={8} />
    {lit && <polygon points={`436,700 504,700 540,${DESK_TOP} 400,${DESK_TOP}`} fill="#ffe2a6" opacity={0.28} />}
    <path d="M430 700 L510 700 L490 660 L450 660 Z" fill={lit ? "#ffd27a" : "#c9a45a"} stroke={INK} strokeWidth={5} />
  </g>
);

/** The kettle on the desk and its lead: coiled on the desk top, down the desk's left side, into a floor socket.
 *  `steam` 0..1 puffs from the spout. */
export const Kettle: React.FC<{ steam?: number; frame: number }> = ({ steam = 0, frame }) => (
  <g>
    <path d={`M${KETTLE.x - 24} ${KETTLE.y - 4} C${KETTLE.x - 60} ${KETTLE.y + 2} ${KETTLE.x - 70} ${KETTLE.y - 14} ${KETTLE.x - 110} ${KETTLE.y - 6}
      S180 ${KETTLE.y + 2} 130 ${KETTLE.y - 4} Q98 ${KETTLE.y} 98 ${KETTLE.y + 40} L98 ${FLOOR - 24}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <rect x={78} y={FLOOR - 30} width={40} height={24} rx={4} fill="#d9dde8" stroke={INK} strokeWidth={3} />
    <g transform={`translate(${KETTLE.x} ${KETTLE.y}) scale(0.8) translate(${-KETTLE.x} ${-KETTLE.y})`}>
    <path d={`M${KETTLE.x - 34} ${KETTLE.y} L${KETTLE.x - 28} ${KETTLE.y - 58} Q${KETTLE.x} ${KETTLE.y - 74} ${KETTLE.x + 28} ${KETTLE.y - 58} L${KETTLE.x + 34} ${KETTLE.y} Z`}
      fill="#c9ccd6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M${KETTLE.x + 30} ${KETTLE.y - 40} L${KETTLE.x + 58} ${KETTLE.y - 58}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <path d={`M${KETTLE.x - 30} ${KETTLE.y - 50} Q${KETTLE.x - 56} ${KETTLE.y - 40} ${KETTLE.x - 34} ${KETTLE.y - 16}`} fill="none" stroke={INK} strokeWidth={7} />
    <rect x={KETTLE.x - 36} y={KETTLE.y - 8} width={72} height={10} rx={3} fill="#3b3e47" />
    </g>
    {steam > 0 && [0, 1, 2].map((i) => {
      const t = ((frame / 20) + i / 3) % 1;
      return <circle key={i} cx={KETTLE.x + 62 + t * 18} cy={KETTLE.y - 66 - t * 60} r={8 + t * 10} fill={PAPER} opacity={steam * (1 - t) * 0.8} />;
    })}
  </g>
);

/** The spare socket under your old hatch, taped over with a cream cross of tape (pods' layer, depth 0.85). */
export const TapedSocket: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={0.85}>
    <g transform={`translate(${SOCKET.x} ${SOCKET.y})`}>
      <rect x={-17} y={-12} width={34} height={24} rx={4} fill="#d9dde8" stroke={INK} strokeWidth={3} />
      <circle cx={-6} cy={0} r={3} fill={INK} />
      <circle cx={6} cy={0} r={3} fill={INK} />
      <rect x={-22} y={-4} width={44} height={8} fill="#efe2b8" stroke="#c9b98a" strokeWidth={1.5} transform="rotate(28)" opacity={0.95} />
      <rect x={-22} y={-4} width={44} height={8} fill="#efe2b8" stroke="#c9b98a" strokeWidth={1.5} transform="rotate(-28)" opacity={0.95} />
    </g>
  </Deep>
);

/** The NO NAPS tag: a cream paper tag with a crimson edge and a struck-through crescent (no words). */
export const NapTag: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(-8) scale(${s})`}>
    <rect x={-30} y={-22} width={60} height={44} rx={5} fill={PAPER} stroke={CRIMSON} strokeWidth={5} />
    <path d="M6 -12 A13 13 0 1 0 6 12 A10 10 0 1 1 6 -12Z" fill={INK} />
    <line x1={-18} y1={-14} x2={18} y2={14} stroke={CRIMSON} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** Your chair at the desk's end, facing the desk; `coils` hang from the peg on its back; `tag` the NO NAPS tag on it. */
export const YourChair: React.FC<{ coils?: number; tag?: number }> = ({ coils = 0, tag = 0 }) => (
  <g>
    <Chair x={CHAIR.x} y={CHAIR.top} scale={1.05} facing={-1} />
    <circle cx={PEG.x + 4} cy={PEG.y} r={5} fill="#c9ccd6" stroke={INK} strokeWidth={2} />
    {Array.from({ length: coils }, (_, i) => <g key={i} transform={`translate(${PEG.x + 10 + i * 5} ${PEG.y + 26 + i * 8})`}><Coil s={0.9} turn={80} /></g>)}
    {tag > 0 && <NapTag x={PEG.x - 2} y={PEG.y + 46} s={tag} />}
  </g>
);

/** The empty crate, upside down and shaken when `tip` is 1 (the head start lasted exactly as long as the crate). */
export const EmptyCrate: React.FC<{ x: number; y: number; tip: number; shake: number }> = ({ x, y, tip, shake }) => (
  <g transform={`translate(${x + shake} ${y - 300 * tip}) rotate(${180 * tip})`}>
    <rect x={-95} y={-90} width={190} height={90} rx={6} fill="#b8895a" stroke={INK} strokeWidth={5} />
    <rect x={-80} y={-84} width={160} height={10} fill="#8a6a44" opacity={0.6} />
    <line x1={-95} y1={-45} x2={95} y2={-45} stroke={INK} strokeWidth={4} opacity={0.4} />
  </g>
);

/** The rota on a clipboard: an ink grid, a few boxes ticked (figure coordinates, for `held`). */
export const Rota = (
  <g transform="translate(0 -30)">
    <rect x={-34} y={-44} width={68} height={88} rx={6} fill="#8a6a4a" stroke={INK} strokeWidth={3} />
    <rect x={-28} y={-34} width={56} height={72} fill={PAPER} />
    {[0, 1, 2, 3, 4].map((r) => <line key={r} x1={-24} y1={-24 + r * 14} x2={24} y2={-24 + r * 14} stroke={INK} strokeWidth={2} />)}
    {[0, 1, 2].map((c) => <line key={c} x1={-24 + c * 24} y1={-30} x2={-24 + c * 24} y2={34} stroke={INK} strokeWidth={2} />)}
    <rect x={-10} y={-50} width={20} height={10} rx={3} fill="#c9ccd6" stroke={INK} strokeWidth={2} />
  </g>
);

/** More tiers of portholes above and beside the hall's own (depth 0.75): the thousand sleepers, each counter blurring. */
export const Tiers: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => {
  const lamps: string[] = [];
  const strips: string[] = [];
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 34; c++) {
      const x = -760 + c * 108, y = -600 + r * 92;
      const beside = x < 110 || x > 1930;
      if (y > 300 && !beside) continue;
      if (y > 820) continue;
      if (x > 1420 && x < 1800 && y > -10 && y < 210) continue;
      lamps.push(`M${x + 22} ${y}a22 22 0 1 0 -44 0a22 22 0 1 0 44 0Z`);
      if (noise(r * 40 + c + Math.floor(frame / 2)) > 0.3) strips.push(`M${x - 18} ${y - 40}h36v10h-36Z`);
    }
  }
  return (
    <Deep cam={cam} depth={0.75}>
      <path d={lamps.join("")} fill="#ffc46b" stroke={INK} strokeWidth={4} opacity={0.9} />
      <path d={strips.join("")} fill={CRIMSON} />
    </Deep>
  );
};

/** The hall on a Stage, lit for the mood, with the socket under your old hatch; `tiers` adds the thousand. */
export const Lobby: React.FC<{ frame: number; cam: Camera; mood: MoodName; tiers?: boolean; flutter?: boolean; children: React.ReactNode }> = ({
  frame, cam, mood, tiers, flutter, children,
}) => (
  <LookContext.Provider value={setLook(podHallLights(), mood, cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <>
          <PodHallBack cam={cam} frame={frame} wedge={mood === "morning" || mood === "day"} minutes={mood === "night" ? 50 : 20} flutterAll={flutter} />
          {tiers && <Tiers cam={cam} frame={frame} />}
          <TapedSocket cam={cam} />
        </>
      }
      actors={children} />
  </LookContext.Provider>
);
