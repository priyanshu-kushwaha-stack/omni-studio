// A TV news studio or a live stream, side on: the anchor desk with its colour band, the big screen behind (a chart,
// a map or a face), the light rig overhead, a camera on its tripod soft in front, the red live dot. Built for the
// library from the office (monitor), the classroom (board drawings) and the phone (screens as shapes and bars).
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "../theme";
import { BOSS, HERO, TEACHER } from "./cast";
import { Deep, MOOD_NAMES, REF, seat, Sky, Skyline, type SetDef, type SetProps } from "./common";

const FLOOR = 980;
const DESK = { from: 600, to: 1400, top: 760 };
const SCREEN = { x: 960, y: 330, w: 900, h: 400 };

export interface TvStudioOptions {
  /** What the big screen shows. */
  screen: "chart" | "map" | "face";
  /** How far the chart's line has drawn, 0 to 1. */
  drawn: number;
  /** The face on the screen (its head colour), for a guest on a link. */
  guest: string;
  /** The live dot blinks in the corner of the screen. */
  live: boolean;
}

const BigScreen: React.FC<{ o: TvStudioOptions; frame: number }> = ({ o, frame }) => {
  const { x, y, w, h } = SCREEN;
  const left = x - w / 2, top = y - h / 2;
  return (
    <g>
      <rect x={left - 16} y={top - 16} width={w + 32} height={h + 32} rx={14} fill={INK} />
      <rect x={left} y={top} width={w} height={h} fill="#1b2240" />
      {o.screen === "chart" && (
        <g>
          {[0, 1, 2, 3].map((i) => <line key={i} x1={left + 60} y1={top + 80 + i * 80} x2={left + w - 60} y2={top + 80 + i * 80} stroke="#3a4270" strokeWidth={3} />)}
          <path d={`M${left + 60} ${top + 320} L${left + 260} ${top + 280} L${left + 420} ${top + 300} L${left + 600} ${top + 160} L${left + 840} ${top + 90}`}
            fill="none" stroke={MUSTARD} strokeWidth={12} strokeLinejoin="round" strokeDasharray={1000} strokeDashoffset={1000 * (1 - o.drawn)} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={left + 90 + i * 150} y={top + h - 40 - (40 + ((i * 53) % 120))} width={60} height={40 + ((i * 53) % 120)} fill={TEAL} opacity={0.5} />)}
        </g>
      )}
      {o.screen === "map" && (
        <g>
          <path d={`M${x - 120} ${top + 50} L${x + 60} ${top + 70} L${x + 130} ${top + 170} L${x + 40} ${top + 360} L${x - 40} ${top + 300} L${x - 160} ${top + 180}Z`} fill={TEAL} stroke={PAPER} strokeWidth={5} />
          {[[x - 40, top + 160], [x + 50, top + 220], [x - 90, top + 230]].map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={14 + Math.sin(frame / 8 + i) * 4} fill={CRIMSON} stroke={PAPER} strokeWidth={4} />
          ))}
        </g>
      )}
      {o.screen === "face" && (
        <g>
          <rect x={left} y={top} width={w} height={h} fill="#3d4a7a" />
          <circle cx={x} cy={top + 170} r={90} fill={o.guest} />
          <circle cx={x - 28} cy={top + 160} r={10} fill={INK} /><circle cx={x + 28} cy={top + 160} r={10} fill={INK} />
          <path d={`M${x - 30} ${top + 210} Q${x} ${top + 230} ${x + 30} ${top + 210}`} fill="none" stroke={INK} strokeWidth={6} />
          <path d={`M${x - 160} ${top + h} Q${x} ${top + 250} ${x + 160} ${top + h}Z`} fill="#2f3242" />
        </g>
      )}
      <rect x={left} y={top + h - 56} width={w} height={56} fill={CRIMSON} />
      <rect x={left + 30} y={top + h - 40} width={320} height={22} rx={11} fill={PAPER} opacity={0.85} />
      {o.live && <circle cx={left + w - 40} cy={top + 40} r={16} fill={CRIMSON} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.35} />}
    </g>
  );
};

const Back: React.FC<SetProps<TvStudioOptions>> = ({ cam, mood, frame, options }) => (
  <>
    <Deep cam={cam} depth={0.7} flat>
      <rect x={-1400} y={-800} width={4800} height={2400} fill="#141833" />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-1300 + i * 300} y={-800} width={140} height={2400} fill="#1b2042" />)}
      {/* the city backdrop through the glass wall behind the desk: it follows the mood */}
      <clipPath id="tv-glass"><rect x={-400} y={140} width={2720} height={560} /></clipPath>
      <g clipPath="url(#tv-glass)">
        <Sky id="tv" mood={mood} x={-400} y={140} w={2720} h={560} sunAt={{ x: 1700, y: 260 }} />
        <Skyline mood={mood} from={-400} to={2320} base={720} tall={380} seed={2} />
      </g>
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-400 + i * 340} y={140} width={14} height={560} fill="#0d1026" />)}
      <rect x={-400} y={700} width={2720} height={20} fill="#0d1026" />
      {/* the light rig: a truss and its lamps */}
      <rect x={-1400} y={40} width={4800} height={24} fill="#3b3e47" />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <line x1={-900 + i * 360} y1={64} x2={-900 + i * 360} y2={100} stroke="#3b3e47" strokeWidth={8} />
          <path d={`M${-930 + i * 360} 100 h60 l12 50 h-84Z`} fill="#5c6675" />
          <ellipse cx={-900 + i * 360} cy={150} rx={36} ry={8} fill="#fff6d0" />
        </g>
      ))}
    </Deep>
    <Deep cam={cam} depth={0.9}><BigScreen o={options} frame={frame} /></Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={FLOOR - 40} width={4800} height={800} fill="#262a44" />
      <ellipse cx={960} cy={FLOOR + 20} rx={900} ry={80} fill="#3d4a7a" opacity={0.6} />
    </Deep>
  </>
);

/** The anchor desk over the anchors' laps: a curved front with the channel's band. */
const Mid: React.FC<SetProps<TvStudioOptions>> = () => (
  <g>
    <path d={`M${DESK.from} ${DESK.top} H${DESK.to} L${DESK.to - 40} ${FLOOR - 40} H${DESK.from + 40}Z`} fill="#e8eef0" stroke={INK} strokeWidth={6} />
    <rect x={DESK.from + 20} y={DESK.top + 60} width={DESK.to - DESK.from - 40} height={40} fill={CRIMSON} />
    <rect x={DESK.from - 10} y={DESK.top - 16} width={DESK.to - DESK.from + 20} height={20} rx={6} fill="#c9ced6" stroke={INK} strokeWidth={4} />
    <rect x={DESK.from + 140} y={DESK.top - 26} width={120} height={10} rx={2} fill={PAPER} stroke={INK} strokeWidth={2} />
  </g>
);

/** A studio camera on its tripod, soft in the near foreground. */
const Front: React.FC<SetProps<TvStudioOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.4}>
    <rect x={1640} y={560} width={300} height={170} rx={16} fill="#2a2d36" stroke={INK} strokeWidth={6} />
    <rect x={1590} y={600} width={60} height={90} rx={10} fill="#3b3e47" />
    <path d="M1790 730 L1690 1200 M1790 730 L1790 1200 M1790 730 L1890 1200" stroke="#3b3e47" strokeWidth={16} />
  </Deep>
);

export const tvStudio: SetDef<TvStudioOptions> = {
  name: "tv-studio",
  about: "TV news studio or live stream: anchor desk, big screen (chart, map or a guest's face), light rig, camera, live dot",
  spots: {
    anchor: seat(820, DESK.top + 20, 1.1, 1),
    guest: seat(1180, DESK.top + 20, 1.1, -1),
    presenter: { x: 300, y: FLOOR, scale: 1.2, facing: 1 },
  },
  cameras: {
    wide: REF,
    screen: { x: SCREEN.x, y: SCREEN.y, zoom: 1.9 },
    desk: { x: 1000, y: 620, zoom: 1.5 },
  },
  lights: () => [
    { x: SCREEN.x, y: SCREEN.y, depth: 0.9, r: 700, color: "#9fb7ff", strength: 0.3, moods: MOOD_NAMES },
  ],
  defaults: { screen: "chart", drawn: 1, guest: "#e6a0a0", live: true },
  Back,
  Mid,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "anchor", who: { ...BOSS, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.determined, behind: true },
      { spot: "guest", who: { ...TEACHER, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.sceptical, behind: true },
      { spot: "presenter", who: { ...HERO, look: { x: 0.8, y: -0.3 } }, face: EXPRESSIONS.shocked, pose: { ...STAND, armF: [120, 20] } },
    ],
  },
};
