// The night desk kit shared by Night Thirty, The Kettle Lead and Tomorrow (all three are this builder's): the night
// desk drawn over the pod hall's own desk in the actors slot (so a figure seated behind it is hidden below the top),
// its lamp with a cord and the kettle with a lead running down to a floor strip, your chair with the boss's NO NAPS tag,
// the two sockets under pod one's counter (the spare one taped over), a mop leaning anywhere, a homemade plug, grey
// temples (a year older), and the hall on its Stage with the 3 a.m. wall clock. World coordinates; no sound here.
import { Figure } from "@whatif/kit/rig/Figure";
import { Mug } from "@whatif/kit/sets/props";
import { setLook, worldOf } from "@whatif/kit/sets/common";
import { LookContext, type Glow } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { WallClock } from "../parts";
import { Deep } from "../sets/common";
import { POD_ONE, PodHallBack, podHallLights, type PodHallProps } from "../sets/PodHall";
import { headOf, type Body } from "./Timeline.Cast";

/** The desk's geometry (the same as the pod hall's own desk, so the overlay covers it exactly). */
export const DESK = { left: 96, right: 544, top: 772, lamp: { x: 470, y: 680 }, kettle: 506, strip: { x: 690, y: 948 } };
/** Your seat behind the desk (seat top) and her perch on the desk top. */
export const YOUR_SEAT = { x: 200, top: 850, scale: 1.08 };
export const HER_PERCH = { x: 420, scale: 1.04 };
/** Pod one's two sockets on the frame at its right (depth 0.85, REF coordinates): the one in use and the spare. */
export const SOCKET = { x: POD_ONE.x + POD_ONE.w - 24, y: POD_ONE.y + 72 };
export const SPARE = { x: SOCKET.x, y: SOCKET.y + 52 };

/** A kettle: steel body, black handle, spout and base; `lead` hangs its lead off the base to the right. */
export const Kettle: React.FC<{ x: number; y: number; scale?: number; steam?: number; frame?: number }> = ({ x, y, scale = 1, steam = 0, frame = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-40} y={-10} width={80} height={10} rx={4} fill="#2b2f3d" stroke={INK} strokeWidth={3} />
    <path d="M-34 -10 L-28 -66 Q0 -78 28 -66 L34 -10 Z" fill="#c9ced6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-30 -40 L-58 -64 L-52 -70 L-27 -52" fill="#c9ced6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M26 -62 Q52 -60 46 -30 Q42 -14 30 -16" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <rect x={-8} y={-82} width={16} height={8} rx={3} fill={INK} />
    <path d="M-20 -50 Q-14 -60 -6 -62" fill="none" stroke="#fff" strokeWidth={4} opacity={0.6} strokeLinecap="round" />
    {steam > 0 && [0, 1].map((i) => (
      <path key={i} d={`M${-60 + i * 8} ${-74 - ((frame * 1.5 + i * 20) % 40)} q-8 -14 0 -26`} fill="none" stroke="#f3eee2" strokeWidth={4} opacity={steam * 0.7} strokeLinecap="round" />
    ))}
  </g>
);

/** A plug on the end of a lead: a body and two pins, pointing along `angle` (0 = right). */
export const LeadPlug: React.FC<{ x: number; y: number; angle?: number; color?: string; scale?: number }> = ({ x, y, angle = 0, color = "#2b2f3d", scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <rect x={-20} y={-10} width={28} height={20} rx={5} fill={color} stroke={INK} strokeWidth={3} />
    <line x1={8} y1={-5} x2={20} y2={-5} stroke="#c9ced6" strokeWidth={4} strokeLinecap="round" />
    <line x1={8} y1={5} x2={20} y2={5} stroke="#c9ced6" strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** The homemade plug: a lumpy cream body wrapped in tape, two pins, a black and a cream cord twisted out of its back. */
export const HomePlug: React.FC<{ x: number; y: number; angle?: number; scale?: number }> = ({ x, y, angle = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M-70 4 C-90 10 -110 -6 -130 2" fill="none" stroke="#2b2f3d" strokeWidth={8} strokeLinecap="round" />
    <path d="M-70 -2 C-92 -12 -108 8 -130 -4" fill="none" stroke="#efe6d2" strokeWidth={7} strokeLinecap="round" />
    <path d="M-36 -18 Q-4 -26 12 -14 Q18 0 12 14 Q-6 26 -36 18 Q-46 0 -36 -18Z" fill="#efe6d2" stroke={INK} strokeWidth={4} />
    <rect x={-30} y={-22} width={10} height={44} rx={3} fill="#d9c27a" opacity={0.9} transform="rotate(-8)" />
    <rect x={-14} y={-22} width={10} height={44} rx={3} fill="#d9c27a" opacity={0.9} transform="rotate(6)" />
    <path d="M-46 -6 L-70 -2 M-46 4 L-70 4" stroke={INK} strokeWidth={5} />
    <line x1={12} y1={-7} x2={30} y2={-7} stroke="#c9ced6" strokeWidth={5} strokeLinecap="round" />
    <line x1={12} y1={7} x2={30} y2={7} stroke="#c9ced6" strokeWidth={5} strokeLinecap="round" />
  </g>
);

export interface DeskState {
  /** The lamp is lit (it is unplugged in The Kettle Lead). */
  lamp?: boolean;
  /** The lamp's plug: in the strip, or lifted to a world point (unplugged). */
  lampPlug?: { x: number; y: number } | null;
  /** The kettle's plug likewise; `kettleLead: false` draws the kettle with no lead at all (the last image). */
  kettlePlug?: { x: number; y: number } | null;
  kettleLead?: boolean;
  /** The lamp still has its cord (it went into the homemade plug). */
  lampCord?: boolean;
  kettle?: boolean;
  /** Mugs on the desk top at these x. */
  mugs?: number[];
}

/** The night desk, drawn in the actors slot: body, top, lamp, kettle, the two cords to the floor strip, mugs. */
export const NightDesk: React.FC<DeskState> = ({ lamp = true, lampPlug, kettlePlug, kettleLead = true, lampCord = true, kettle = true, mugs = [] }) => {
  const { top, right, strip } = DESK;
  const lampAt = lampPlug ?? { x: strip.x - 24, y: strip.y - 4 };
  const kettleAt = kettlePlug ?? { x: strip.x + 22, y: strip.y - 4 };
  return (
    <g>
      <rect x={110} y={790} width={420} height={170} rx={10} fill="#5b4636" stroke={INK} strokeWidth={6} />
      <rect x={140} y={820} width={360} height={8} rx={4} fill="#000" opacity={0.15} />
      <rect x={96} y={top} width={448} height={28} rx={8} fill="#7a5d47" stroke={INK} strokeWidth={6} />
      {/* the lamp */}
      <line x1={470} y1={top} x2={470} y2={690} stroke={INK} strokeWidth={8} />
      <path d="M430 700 L510 700 L490 660 L450 660 Z" fill={lamp ? "#ffd27a" : "#8a7a5a"} stroke={INK} strokeWidth={5} />
      {lamp && <path d="M434 702 L506 702 L540 772 L400 772 Z" fill="#fff1c4" opacity={0.18} />}
      {/* the floor strip */}
      <rect x={strip.x - 50} y={strip.y - 10} width={100} height={24} rx={6} fill="#e8e2d2" stroke={INK} strokeWidth={4} />
      {[-24, 0, 22].map((dx) => <rect key={dx} x={strip.x + dx - 6} y={strip.y - 4} width={12} height={12} rx={2} fill={INK} />)}
      {/* the lamp's cord: down the desk's right side to the strip */}
      {lampCord && (
        <>
          <path d={`M478 ${top} C ${right + 30} ${top + 20}, ${right + 10} 900, ${lampAt.x - 20} ${lampAt.y}`} fill="none" stroke="#efe6d2" strokeWidth={6} />
          <LeadPlug x={lampAt.x} y={lampAt.y} angle={lampPlug ? -30 : 90} color="#efe6d2" scale={0.8} />
        </>
      )}
      {kettle && (
        <>
          <Kettle x={DESK.kettle} y={top} scale={0.72} />
          {kettleLead && (
            <>
              <path d={`M${DESK.kettle + 24} ${top - 4} C ${right + 50} ${top - 6}, ${right + 40} 910, ${kettleAt.x - 18} ${kettleAt.y}`} fill="none" stroke="#2b2f3d" strokeWidth={7} />
              <LeadPlug x={kettleAt.x} y={kettleAt.y} angle={kettlePlug ? -40 : 90} scale={0.8} />
            </>
          )}
        </>
      )}
      {mugs.map((x, i) => <Mug key={i} x={x} y={top} scale={0.55} />)}
    </g>
  );
};

/** The two sockets on pod one's frame (in world coordinates for this camera). `tape` 1 taped over, 0 peeled off. */
export const Sockets: React.FC<{ cam: Camera; tape?: number; spareIn?: boolean }> = ({ cam, tape = 1, spareIn }) => {
  const a = worldOf(cam, SOCKET.x, SOCKET.y, 0.85);
  const b = worldOf(cam, SPARE.x, SPARE.y, 0.85);
  const plate = (p: { x: number; y: number }) => (
    <g>
      <rect x={p.x - 18} y={p.y - 20} width={36} height={40} rx={6} fill="#e8e2d2" stroke={INK} strokeWidth={3} />
      <rect x={p.x - 9} y={p.y - 9} width={5} height={14} rx={2} fill={INK} />
      <rect x={p.x + 4} y={p.y - 9} width={5} height={14} rx={2} fill={INK} />
    </g>
  );
  return (
    <g>
      {plate(a)}
      {plate(b)}
      {tape > 0 && (
        <g opacity={Math.min(1, tape * 1.5)}>
          <rect x={b.x - 26} y={b.y - 7} width={52 * tape} height={14} rx={3} fill="#e6d29a" stroke="#b8a46a" strokeWidth={2} transform={`rotate(32 ${b.x} ${b.y})`} />
          <rect x={b.x - 26} y={b.y - 7} width={52} height={14} rx={3} fill="#e6d29a" stroke="#b8a46a" strokeWidth={2} transform={`rotate(-32 ${b.x} ${b.y})`} opacity={tape >= 0.5 ? 1 : tape * 2} />
        </g>
      )}
      {spareIn && <HomePlug x={b.x - 26} y={b.y} angle={0} scale={0.7} />}
    </g>
  );
};

/** Your chair behind the desk, the boss's NO NAPS tag on its back. (x, top) is the seat top; it faces right. */
export const DeskChair: React.FC<{ x: number; top: number; tag?: boolean }> = ({ x, top, tag = true }) => (
  <g>
    <rect x={x - 70} y={top - 150} width={16} height={156} rx={6} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
    <rect x={x - 60} y={top - 4} width={110} height={16} rx={6} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
    {tag && (
      <g transform={`translate(${x - 160} ${top - 96}) rotate(-6)`}>
        <line x1={34} y1={-14} x2={38} y2={2} stroke="#b9a989" strokeWidth={3} />
        <rect x={-6} y={0} width={92} height={36} rx={6} fill={PAPER} stroke={INK} strokeWidth={3} />
        <text x={40} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={19} fill={CRIMSON}>NO NAPS</text>
      </g>
    )}
  </g>
);

/** A mop leaning at `angle` degrees from upright, its head on the floor at (x, y). */
export const LeaningMop: React.FC<{ x: number; y: number; angle?: number; scale?: number }> = ({ x, y, angle = 14, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <line x1={0} y1={-20} x2={0} y2={-330} stroke="#c9915a" strokeWidth={9} strokeLinecap="round" />
    <path d="M-40 0 Q0 -26 40 0 L30 40 L-30 40 Z" fill="#dcd6c6" stroke={INK} strokeWidth={4} transform="translate(0 -40)" />
  </g>
);

/** A mop held level across a doorway, its handle from (x1, y) to (x2, y), the head at x2. */
export const BarMop: React.FC<{ x1: number; x2: number; y: number }> = ({ x1, x2, y }) => (
  <g>
    <line x1={x1} y1={y} x2={x2} y2={y} stroke="#c9915a" strokeWidth={10} strokeLinecap="round" />
    <rect x={x2 - 6} y={y - 20} width={18} height={40} rx={4} fill="#8a8f9e" stroke={INK} strokeWidth={3} />
    {[-16, -8, 0, 8, 16].map((dy) => (
      <path key={dy} d={`M${x2 + 10} ${y + dy * 0.8} q20 ${dy * 0.6} 34 ${dy * 1.4 + 26}`} fill="none" stroke="#e8e2d2" strokeWidth={7} strokeLinecap="round" />
    ))}
  </g>
);

/** Grey at the temples: two grey crescents on the sides of a head (a year older). */
export const Temples: React.FC<{ body: Body }> = ({ body }) => {
  const h = headOf(body);
  const r = h.r;
  return (
    <g>
      {[-1, 1].map((s) => (
        <path key={s} d={`M${h.x + s * r * 0.98} ${h.y - r * 0.05} A${r} ${r} 0 0 ${s > 0 ? 0 : 1} ${h.x + s * r * 0.62} ${h.y - r * 0.78}`}
          fill="none" stroke="#e8e6e0" strokeWidth={r * 0.2} strokeLinecap="round" />
      ))}
    </g>
  );
};

/** A plain figure for crowds and walk-ons (pastel head, a coat), blinking on its seed. */
export const Extra: React.FC<{ body: Body; frame: number; head: string; coat: string; seed?: number; mouth?: "smile" | "open" | "o" | "flat" | "smirk" | "frown";
  lids?: number; look?: { x: number; y: number }; brows?: "raised" | "flat" | "worry" | "none"; held?: React.ReactNode; eyes?: number; cap?: string; tie?: string }> = ({
  body, frame, head, coat, seed = 0, mouth = "smile", lids = 0, look = { x: 0.8, y: 0 }, brows = "none", held, eyes = 1, cap, tie,
}) => (
  <Figure {...body} head={head} coat={coat} mouth={mouth} lids={lids} look={look} brows={brows} held={held} eyes={eyes} cap={cap} tie={tie}
    time={frame} blink={(frame + seed * 37) % 97 < 4} />
);

/** The pod hall on its Stage, lit by the mood and the hall's lights (`lamp` false drops the desk lamp's glow), with the
 *  wall clock overdrawn at `clock` (3 a.m. by default). `back` goes over the hall; `actors` in front. */
export const HallStage: React.FC<{ cam: Camera; frame: number; mood: MoodName; hall?: Omit<PodHallProps, "cam" | "frame">;
  clock?: { minutes: number; hours: number }; back?: React.ReactNode; actors: React.ReactNode; front?: React.ReactNode; glows?: Glow[]; lamp?: boolean }> = ({
  cam, frame, mood, hall = {}, clock, back, actors, front, glows = [], lamp = true,
}) => {
  const lights = podHallLights().filter((l) => lamp || !(l.x === 300 && l.y === 700));
  return (
    <LookContext.Provider value={setLook(lights, mood, cam, { glows })}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} front={front}
        back={<>
          <PodHallBack cam={cam} frame={frame} {...hall} />
          {clock && <Deep cam={cam} depth={0.85}><WallClock x={300} y={250} r={58} minutes={clock.minutes} hours={clock.hours} /></Deep>}
          {back}
        </>}
        actors={actors} />
    </LookContext.Provider>
  );
};
