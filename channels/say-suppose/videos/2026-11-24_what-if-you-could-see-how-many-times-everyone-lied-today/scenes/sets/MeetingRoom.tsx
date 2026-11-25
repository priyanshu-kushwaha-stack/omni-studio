// The Monday meeting room, as a set (the thumbnail's Room, channels/say-suppose/brand/thumbs/lies/Lies.tsx, lifted out
// of screen space into REF world units so a camera can move in it). The `thumb` camera (zoom 2.4) frames the thumbnail
// exactly: the boss on his spot at the head of the table, you large at the left. A dark wall of blinds (they roll up
// with `blinds`, showing the city in the mood's light), the dead projector screen, the long table in perspective with a
// pool of the counter's light on it, and seats for the colleagues round it. Used by Frame, Zeros and Floor. No AI images.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, seatedY } from "@whatif/kit/rig/pose";
import { Deep, OUTSIDE, REF, Sky, Skyline, setLook, type SetDef, type SetLight, type SetProps } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { BOSS, GLOW, HERO } from "../shared";

/** Screen (thumbnail) to world: the thumbnail is the `thumb` camera. */
const THUMB: Camera = { x: 1150, y: 520, zoom: 2.4 };
const W = (sx: number, sy: number) => ({ x: THUMB.x + (sx - 960) / THUMB.zoom, y: THUMB.y + (sy - 540) / THUMB.zoom });

export const ROOM = {
  floor: 980,
  window: { top: 300, bottom: 622 },
  /** The table: far edge y, near edge y, far-edge x range, near-edge x range. */
  table: { far: 612, near: 800, farFrom: 700, farTo: 1720, nearFrom: 420, nearTo: 1760 },
  screen: { x: 1370, y: 324, w: 300, h: 175 },
};

export interface MeetingRoomOptions {
  /** 0 the blinds are down and shut (the thumbnail); 1 rolled all the way up. */
  blinds: number;
  /** The counter's light pooled on the table, 0 to 1 (its x follows the boss). */
  pool: number;
  /** Papers and a laptop on the table. */
  clutter: boolean;
}

const dark = (mood: MoodName) => OUTSIDE[mood].dark;

const Back: React.FC<SetProps<MeetingRoomOptions>> = ({ cam, mood, options }) => {
  const d = dark(mood);
  const wall = d ? "#0d1018" : "#aeb6c4";
  const slat = d ? "#161b27" : "#d7dbe2";
  const { top, bottom } = ROOM.window;
  const rolled = top + (bottom - top) * (1 - options.blinds);
  const n = Math.ceil((rolled - top) / 14.2);
  const s = ROOM.screen;
  return (
    <>
      <Deep cam={cam} depth={0.5} flat>
        <Sky id="meeting" mood={mood} x={-1400} y={-200} w={4800} h={1100} sunAt={{ x: 400, y: 260 }} />
        <Skyline mood={mood} from={-1400} to={3400} base={640} tall={300} seed={3} />
      </Deep>
      <Deep cam={cam} depth={1} flat>
        {/* the wall, with the window band cut out */}
        <path d={`M-1400 -800 H3400 V1800 H-1400Z M-1400 ${top} H3400 V${bottom} H-1400Z`} fillRule="evenodd" fill={wall} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-1400 + i * 560} y={top} width={18} height={bottom - top} fill={d ? "#1a1f2c" : "#8d95a3"} />)}
        {/* the blinds, down to `rolled` */}
        <rect x={-1400} y={top - 30} width={4800} height={36} fill={d ? "#121620" : "#9aa2b0"} />
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={-1400} y={top + i * 14.2} width={4800} height={Math.min(7.5, rolled - top - i * 14.2)} fill={slat} />
        ))}
        {options.blinds < 1 && <rect x={-1400} y={top} width={4800} height={Math.max(0, rolled - top)} fill={slat} opacity={d ? 0.35 : 0.5} />}
        {/* the dead projector screen behind the boss */}
        <rect x={s.x - s.w / 2} y={s.y} width={s.w} height={s.h} rx={3} fill={d ? "#141824" : "#e9e6de"} stroke={d ? "#222838" : "#8d95a3"} strokeWidth={3.3} />
        <rect x={s.x - s.w / 2 - 8} y={s.y - 10} width={s.w + 16} height={10} rx={4} fill={d ? "#1c2130" : "#7d8593"} />
        {/* the floor */}
        <rect x={-1400} y={ROOM.table.near - 40} width={4800} height={1200} fill={d ? "#12141b" : "#6f7480"} />
      </Deep>
    </>
  );
};

/** The table: drawn in the actors' slot, after the colleagues seated behind it, before the boss and you. */
const Mid: React.FC<SetProps<MeetingRoomOptions>> = ({ mood, options }) => {
  const t = ROOM.table;
  const d = dark(mood);
  const poolX = W(1488, 0).x;
  const top = `M${t.nearFrom} ${t.near} L${t.farFrom} ${t.far} L${t.farTo} ${t.far} L${t.nearTo} ${t.near}Z`;
  const p1 = W(1145, 855);
  return (
    <g>
      <defs>
        <radialGradient id="meeting-pool" gradientUnits="userSpaceOnUse" cx={poolX} cy={t.far + 60} r={420}>
          <stop offset="0" stopColor={GLOW} stopOpacity={0.42 * options.pool} />
          <stop offset="0.6" stopColor={GLOW} stopOpacity={0.08 * options.pool} />
          <stop offset="1" stopColor={GLOW} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={t.nearFrom + 40} y={t.near} width={24} height={ROOM.floor - t.near} fill="#1a1512" />
      <rect x={t.nearTo - 64} y={t.near} width={24} height={ROOM.floor - t.near} fill="#1a1512" />
      <path d={`M${t.nearFrom} ${t.near} H${t.nearTo} V${t.near + 26} H${t.nearFrom}Z`} fill={d ? "#1e1915" : "#5a4636"} stroke={INK} strokeWidth={3} />
      <path d={top} fill={d ? "#2a2420" : "#8a6a52"} stroke={INK} strokeWidth={3} />
      <path d={top} fill="url(#meeting-pool)" />
      {options.clutter && (
        <g>
          <rect x={p1.x - 35} y={p1.y - 23} width={71} height={46} rx={3} fill={PAPER} opacity={0.75} transform={`rotate(-8 ${p1.x} ${p1.y})`} />
          <rect x={1420} y={W(0, 790).y} width={83} height={6} rx={3} fill="#3b3f4c" />
          <path d={`M1424 ${W(0, 790).y} L1436 ${W(0, 700).y} L1499 ${W(0, 700).y} L1503 ${W(0, 790).y}Z`} fill="#2c303b" stroke={INK} strokeWidth={2} />
        </g>
      )}
    </g>
  );
};

/** The seats round the table: seven along the far side, three down the left, three along the near side (backs to us). */
const far = (i: number) => ({ x: 790 + i * 120, y: seatedY(ROOM.table.far + 20, 0.9), scale: 0.9, facing: (i < 3 ? 1 : -1) as 1 | -1, sit: true });
export const SEATS = [
  ...Array.from({ length: 7 }, (_, i) => far(i)),
  { x: 560, y: seatedY(700, 1.0), scale: 1.0, facing: 1 as const, sit: true },
  { x: 470, y: seatedY(745, 1.05), scale: 1.05, facing: 1 as const, sit: true },
  { x: 650, y: seatedY(655, 0.95), scale: 0.95, facing: 1 as const, sit: true },
];

const BOSS_AT = { x: 1354, y: 978, scale: 1.5, facing: -1 as const };
const YOU_AT = { ...W(430, 1880), scale: 4.4 / THUMB.zoom, facing: 1 as const };

export const meetingRoom: SetDef<MeetingRoomOptions> = {
  name: "meeting-room",
  about: "office meeting room: blinds that roll up, a dead projector screen, the long table under the counter's light",
  spots: {
    boss: BOSS_AT,
    you: YOU_AT,
    ...Object.fromEntries(SEATS.map((s, i) => [`seat${i}`, s])),
  },
  cameras: {
    wide: REF,
    thumb: THUMB,
    table: { x: 1050, y: 560, zoom: 1.45 },
    boss: { x: 1360, y: 470, zoom: 2.6 },
  },
  lights: (o) => (o.blinds > 0.3 ? [{ x: 600, y: 460, r: 700, color: "#fff2cc", strength: 0.3 * o.blinds, moods: ["morning", "day"] }] : []),
  defaults: { blinds: 0, pool: 1, clutter: true },
  Back,
  Mid,
  example: {
    camera: "thumb",
    cast: [
      { spot: "boss", who: { ...BOSS }, pose: { ...STAND, lean: -4, tilt: -6, armF: [28, -128], armB: [-165, -8] } },
      { spot: "you", who: { ...HERO } },
    ],
  },
};

/** The thumbnail's boss pose: one hand on his heart, the other up mid-sentence. */
export const BOSS_POSE = { ...STAND, lean: -4, tilt: -6, armF: [28, -128] as [number, number], armB: [-165, -8] as [number, number] };
/** The thumbnail's you: the mug halfway to your mouth. */
export const MUG_POSE = { ...STAND, lean: 4, tilt: 4, armF: [40, 118] as [number, number], armB: [-10, 12] as [number, number] };
export { SEATED };

/** The meeting room on the Stage through `cam`, lit by the mood, the set's windows and any extra lights (the counter's
 *  glow, in world units). `behind` is drawn before the table (the seated colleagues); `actors` after it. */
export const MeetingScene: React.FC<{
  cam: Camera; mood: MoodName; frame: number; options?: Partial<MeetingRoomOptions>; lights?: SetLight[];
  behind?: React.ReactNode; actors?: React.ReactNode;
}> = ({ cam, mood, frame, options, lights = [], behind, actors }) => {
  const o = { ...meetingRoom.defaults, ...options };
  const props = { cam, mood, frame, options: o };
  return (
    <LookContext.Provider value={setLook([...meetingRoom.lights(o), ...lights], mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={meetingRoom.Back(props)}
        actors={<>{behind}{meetingRoom.Mid?.(props)}{actors}</>} />
    </LookContext.Provider>
  );
};

/** A seated colleague behind the table, by seat index. */
export const Seated: React.FC<{ i: number; head: string; frame: number; nod?: number; clap?: number }> = ({ i, head, frame, nod = 0, clap = 0 }) => {
  const s = SEATS[i];
  const arms: [number, number] = clap > 0 ? [100 + 20 * Math.sin(frame * 0.9 + i), 60] : [25, 35];
  return (
    <Figure x={s.x} y={s.y} scale={s.scale} facing={s.facing} pose={{ ...SEATED, tilt: nod * 8 * Math.sin(frame * 0.25 + i), armF: arms, armB: clap > 0 ? [80, 70] : [10, 25] }}
      head={head} coat="#3b3e47" mouth={clap > 0 ? "smile" : "flat"} look={{ x: 0.7, y: 0.1 }} time={frame} blink={(frame + i * 23) % 89 < 4} />
  );
};
