// The office (scene_plan.md, "Shared sets"). Three views, each drawn for the REF camera (sets/common.tsx):
//
//   view "doorway"  side on: the open floor at the left (your desk, Dev's desk) and the boss's cabin at the right
//                   behind a glass partition with a door gap. You stand in the gap at OFFICE_DOOR.hero with a hand
//                   on the frame (OFFICE_DOOR.frame); the boss stands at OFFICE_DOOR.boss. <OfficeFront view=
//                   "doorway"> draws the glass over the boss (not over the gap).
//   view "floor"    top-down: rows of desks with an aisle down the middle (OFFICE_FLOOR.aisle). People at desks are
//                   <TopDownHead>s at OFFICE_FLOOR.seats (turn them with `turn`). A YesTag works here too: hang it
//                   above a seat's head with `headY = seat.y`.
//   view "meeting"  the glass-walled meeting room: a whiteboard (OFFICE_MEETING.whiteboard) and a table for eight.
//                   Seat people with CHAIR_SIT (parts2.tsx) at OFFICE_MEETING.seats (figure y = seat.y); draw the
//                   far-side sitters, then <MeetingTable>, then the two at the ends (the boss at the head, right).
//
// Usage: back={<OfficeBack cam={cam} view="meeting" />}  front={<OfficeFront cam={cam} view="doorway" />}
// Typical cameras: doorway wide REF, two-shot { x: 1100, y: 640, zoom: 1.5 }; floor REF climbing to { x, y, zoom: 0.8 };
// meeting REF, the table { x: 960, y: 640, zoom: 1.35 }, the whiteboard insert(OFFICE_MEETING.whiteboard.x, ... , 2).
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { noise, PASTELS } from "../shared";
import { Deep } from "./common";

export type OfficeView = "doorway" | "floor" | "meeting";

/** Doorway view anchors. */
export const OFFICE_DOOR = {
  /** Feet line (scale about 1.15). */
  floor: 960,
  /** You in the door gap, facing right into the cabin. */
  hero: { x: 830, y: 960 },
  /** The door frame's left post: your hand on the frame goes at about (frame.x, 640). */
  frame: { x: 900, top: 330 },
  /** The boss at his glass partition, facing left. */
  boss: { x: 1330, y: 960 },
  /** The glass partition spans these x values (the door gap is from the frame post to `from`). */
  glass: { from: 1010, to: 2400 },
  /** Your desk and Dev's desk on the open floor at the left (the chair seat centre). */
  yourDesk: { x: 120, y: 860 },
  devDesk: { x: 470, y: 860 },
} as const;

/** Top-down floor anchors. The aisle runs left to right through the middle. */
export const OFFICE_FLOOR = {
  /** The aisle's centre line and its ends. */
  aisle: { y: 540, from: -600, to: 2600 },
  /** Desk seats (head centres from above), in walking order along the aisle; side -1 above the aisle, 1 below. */
  seats: Array.from({ length: 22 }, (_, i) => {
    const col = Math.floor(i / 2);
    const side = i % 2 === 0 ? -1 : 1;
    return { x: -420 + col * 290, y: 540 + side * 190, side: side as 1 | -1, head: PASTELS[(i * 3) % PASTELS.length] };
  }),
};

/** Meeting room anchors. */
export const OFFICE_MEETING = {
  /** Feet line for anyone standing. */
  floor: 960,
  /** The whiteboard on the back wall (centre and size). */
  whiteboard: { x: 960, y: 400, w: 720, h: 330 },
  /** The table top: x from `from` to `to`, its top at `top`. */
  table: { from: 520, to: 1400, top: 780 },
  /** Eight seats: figure x and y for CHAIR_SIT at scale 1, facing. 0-5 sit behind the table (far side), 6 is your end
   *  (left), 7 the boss's head (right). Dev is seat 0, at your left. */
  seats: [
    { x: 600, y: 900, facing: 1 }, { x: 760, y: 900, facing: -1 }, { x: 920, y: 900, facing: 1 },
    { x: 1080, y: 900, facing: -1 }, { x: 1240, y: 900, facing: -1 }, { x: 1360, y: 900, facing: -1 },
    { x: 420, y: 960, facing: 1 }, { x: 1520, y: 960, facing: -1 },
  ] as { x: number; y: number; facing: 1 | -1 }[],
} as const;

const WALL = "#e9e4d8";
const CARPET = "#8a94a0";

/** A person seen from straight above: shoulders and a head, with a face that tilts up (`face` shows eyes and a smile
 *  when they look up at you). `turn` rotates them toward a point (degrees, 0 = facing down the screen). */
export const TopDownHead: React.FC<{ x: number; y: number; head: string; turn?: number; face?: boolean; smile?: boolean; scale?: number; coat?: string }> = ({
  x, y, head, turn = 0, face = false, smile = false, scale = 1, coat = "#3b3e47",
}) => (
  <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}>
    <ellipse cx={0} cy={6} rx={62} ry={30} fill={coat} stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={0} r={40} fill={head} stroke={INK} strokeWidth={4} />
    {face ? (
      <g>
        <ellipse cx={-12} cy={8} rx={6} ry={8} fill={INK} /><ellipse cx={12} cy={8} rx={6} ry={8} fill={INK} />
        {smile && <path d="M-14 22 Q0 34 14 22" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
      </g>
    ) : <path d="M-26 -14 Q0 -34 26 -14" fill="none" stroke="#000" strokeWidth={6} opacity={0.15} />}
  </g>
);

const Desk: React.FC<{ x: number; y: number; side: 1 | -1; seed: number }> = ({ x, y, side, seed }) => (
  <g>
    <rect x={x - 120} y={side < 0 ? y - 150 : y + 70} width={240} height={90} rx={8} fill="#c9a77a" stroke={INK} strokeWidth={5} />
    <rect x={x - 50} y={side < 0 ? y - 140 : y + 116} width={100} height={18} rx={4} fill="#3b3e47" />
    <rect x={x + 50 - noise(seed) * 60} y={side < 0 ? y - 118 : y + 84} width={46} height={30} rx={3} fill={PAPER} transform={`rotate(${noise(seed + 1) * 20 - 10} ${x} ${y})`} />
    <circle cx={x - 90} cy={side < 0 ? y - 112 : y + 116} r={13} fill="#e9f3f4" stroke={INK} strokeWidth={3} />
  </g>
);

const FloorTop: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={1}>
    <rect x={-1400} y={-1000} width={4800} height={3000} fill={CARPET} />
    <rect x={-1400} y={OFFICE_FLOOR.aisle.y - 70} width={4800} height={140} fill="#9aa3ad" />
    {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 160} y1={-1000} x2={-1400 + i * 160} y2={2000} stroke="#000" strokeWidth={3} opacity={0.05} />)}
    {OFFICE_FLOOR.seats.map((s, i) => <Desk key={i} x={s.x} y={s.y} side={s.side} seed={i} />)}
    {/* far rows beyond the first ones, top and bottom */}
    {[-1, 1].map((side) => Array.from({ length: 11 }, (_, c) => (
      <g key={`${side}-${c}`}>
        <rect x={-540 + c * 290} y={OFFICE_FLOOR.aisle.y + side * 470 - 45} width={240} height={90} rx={8} fill="#c9a77a" stroke={INK} strokeWidth={5} />
        <circle cx={-420 + c * 290} cy={OFFICE_FLOOR.aisle.y + side * 470 + side * 90} r={36} fill={PASTELS[(c + 2) % PASTELS.length]} stroke={INK} strokeWidth={4} />
      </g>
    )))}
  </Deep>
);

const DoorwaySide: React.FC<{ cam: Camera }> = ({ cam }) => {
  const d = OFFICE_DOOR;
  return (
    <>
      <Deep cam={cam} depth={0.45} flat>
        <rect x={-1400} y={-800} width={4800} height={1720} fill={WALL} />
        {[-500, 300, 1500, 2300].map((x) => <rect key={x} x={x} y={140} width={420} height={260} rx={8} fill="#b9d8e4" stroke="#a5998a" strokeWidth={10} />)}
        <rect x={-1400} y={60} width={4800} height={16} fill="#fdfaf1" opacity={0.8} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={d.floor - 20} width={4800} height={700} fill={CARPET} />
        {/* the open floor at the left: two desks with monitors and chairs */}
        {[d.yourDesk, d.devDesk].map((k, i) => (
          <g key={i}>
            <rect x={k.x - 130} y={760} width={260} height={18} rx={4} fill="#c9a77a" stroke={INK} strokeWidth={5} />
            <rect x={k.x - 115} y={778} width={14} height={180} fill="#7a6a58" /><rect x={k.x + 101} y={778} width={14} height={180} fill="#7a6a58" />
            <rect x={k.x - 60} y={650} width={120} height={84} rx={6} fill="#3b3e47" stroke={INK} strokeWidth={5} />
            <rect x={k.x - 50} y={660} width={100} height={64} rx={3} fill={i ? "#9fd8a8" : "#9fc0e0"} opacity={0.7} />
            <rect x={k.x - 8} y={734} width={16} height={26} fill="#3b3e47" />
          </g>
        ))}
        {/* the cabin: back wall, a desk, a plant and the door post */}
        <rect x={d.glass.from} y={300} width={d.glass.to - d.glass.from} height={d.floor - 300} fill="#dcd5c4" />
        <rect x={d.boss.x + 140} y={720} width={340} height={20} rx={4} fill="#5b3c2a" stroke={INK} strokeWidth={5} />
        <rect x={d.boss.x + 160} y={740} width={300} height={200} fill="#6b4b3a" stroke={INK} strokeWidth={5} />
        <rect x={d.boss.x + 380} y={660} width={60} height={60} rx={6} fill="#c96f2d" />
        <circle cx={d.boss.x + 410} cy={620} r={44} fill="#4c9a76" />
        <rect x={d.frame.x - 20} y={d.frame.top} width={40} height={d.floor - d.frame.top} fill="#7a6a58" stroke={INK} strokeWidth={5} />
        <rect x={d.frame.x - 20} y={d.frame.top - 30} width={d.glass.to - d.frame.x + 40} height={36} fill="#7a6a58" stroke={INK} strokeWidth={5} />
        <rect x={d.glass.from - 16} y={d.frame.top} width={32} height={d.floor - d.frame.top} fill="#7a6a58" stroke={INK} strokeWidth={5} />
      </Deep>
    </>
  );
};

/** The meeting table for the actors' slot: draw it after the far-side sitters, before the two at the ends. A stack of
 *  paper (your pitch) sits in the middle unless `pitch` is false. */
export const MeetingTable: React.FC<{ pitch?: boolean }> = ({ pitch = true }) => {
  const t = OFFICE_MEETING.table;
  return (
    <g>
      <rect x={t.from} y={t.top} width={t.to - t.from} height={28} rx={8} fill="#5b3c2a" stroke={INK} strokeWidth={6} />
      <rect x={t.from + 20} y={t.top + 28} width={t.to - t.from - 40} height={OFFICE_MEETING.floor - t.top - 28} fill="#6b4b3a" stroke={INK} strokeWidth={5} />
      {pitch && [0, 1, 2, 3].map((i) => <rect key={i} x={940 - i * 2} y={t.top - 8 - i * 7} width={110} height={8} rx={2} fill={PAPER} stroke={INK} strokeWidth={2} />)}
    </g>
  );
};

const MeetingRoom: React.FC<{ cam: Camera }> = ({ cam }) => {
  const w = OFFICE_MEETING.whiteboard;
  return (
    <>
      <Deep cam={cam} depth={0.4} flat>
        {/* the office beyond the glass, soft */}
        <rect x={-1400} y={-800} width={4800} height={1720} fill="#d8d2c2" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i}>
            <rect x={-1200 + i * 360} y={700} width={240} height={14} fill="#a88a68" />
            <circle cx={-1080 + i * 360} cy={650} r={30} fill={PASTELS[i % PASTELS.length]} />
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={0.85} flat>
        {/* the glass walls: pale panes with mullions and a streak each */}
        {Array.from({ length: 9 }, (_, i) => -800 + i * 480).map((x) => (
          <g key={x}>
            <rect x={x} y={120} width={470} height={820} fill="#e8f2f4" opacity={0.35} />
            <rect x={x - 6} y={120} width={12} height={820} fill="#9aa3ad" />
            <path d={`M${x + 80} 900 L${x + 260} 160`} stroke="#fff" strokeWidth={30} opacity={0.18} />
          </g>
        ))}
        <rect x={-1400} y={100} width={4800} height={24} fill="#9aa3ad" />
        {/* the back wall panel holding the whiteboard */}
        <rect x={w.x - w.w / 2 - 80} y={160} width={w.w + 160} height={800} fill={WALL} />
      </Deep>
      <Deep cam={cam} depth={0.95}>
        <rect x={w.x - w.w / 2} y={w.y - w.h / 2} width={w.w} height={w.h} rx={8} fill="#fdfcf7" stroke="#7a8088" strokeWidth={12} />
        <rect x={w.x - 120} y={w.y + w.h / 2 + 6} width={240} height={14} rx={4} fill="#7a8088" />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={OFFICE_MEETING.floor - 20} width={4800} height={700} fill={CARPET} />
      </Deep>
    </>
  );
};

/** The office behind the actors. */
export const OfficeBack: React.FC<{ cam: Camera; view: OfficeView }> = ({ cam, view }) => {
  if (view === "floor") return <FloorTop cam={cam} />;
  if (view === "meeting") return <MeetingRoom cam={cam} />;
  return <DoorwaySide cam={cam} />;
};

/** In front of the actors: the boss's glass partition (doorway view). Nothing on the other views. */
export const OfficeFront: React.FC<{ cam: Camera; view: OfficeView }> = ({ cam, view }) => {
  if (view !== "doorway") return null;
  const d = OFFICE_DOOR;
  return (
    <Deep cam={cam} depth={1}>
      <rect x={d.glass.from + 16} y={d.frame.top} width={d.glass.to - d.glass.from} height={d.floor - d.frame.top} fill="#dff0f4" opacity={0.16} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${d.glass.from + 120 + i * 420} ${d.floor - 40} L${d.glass.from + 260 + i * 420} ${d.frame.top + 30}`} stroke="#fff" strokeWidth={22} opacity={0.14} />)}
      <rect x={d.glass.from + 16} y={640} width={d.glass.to - d.glass.from} height={14} fill="#fff" opacity={0.25} />
    </Deep>
  );
};
