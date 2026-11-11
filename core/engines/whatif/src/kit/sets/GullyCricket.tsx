// Gully cricket in a lane between houses, side on: stumps chalked on the end wall (or a crate), a bike parked, wires
// overhead, an aunty at a window, the ball in flight. From the pause film (LongRun.Lane.tsx: the street-cricket lane
// between old houses, the bat along the forearm) and "60 Seconds" (sets.tsx TV: the cricket ball), drawn for REF.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { CRIMSON, INK, PAPER } from "../theme";
import { FRIEND, HERO, MOTHER } from "./cast";
import { Deep, Floor, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, Sky, type SetDef, type SetProps } from "./common";

const FLOOR = 980;
const WALL = 1700;

export interface GullyCricketOptions {
  /** Where the ball is, in world units, or null. */
  ball: { x: number; y: number } | null;
  /** The stumps: chalked on the wall or a plastic crate. */
  stumps: "chalk" | "crate";
  /** Someone watching from a window. */
  window: boolean;
}

/** A cricket bat for a hand (Figure `held`), along the forearm. */
export const Bat: React.FC<{ angle?: number }> = ({ angle = 20 }) => (
  <g transform={`rotate(${angle})`}>
    <rect x={-5} y={-4} width={10} height={44} rx={4} fill="#3b3e47" />
    <rect x={-14} y={38} width={28} height={110} rx={8} fill="#e6c88a" stroke={INK} strokeWidth={3} />
  </g>
);

const Back: React.FC<SetProps<GullyCricketOptions>> = ({ cam, mood, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.15} flat><Sky id="gully" mood={mood} x={-1400} y={-800} w={4800} h={1300} sunAt={{ x: 700, y: 120 }} /></Deep>
      <Deep cam={cam} depth={0.6}>
        {/* the houses along the lane: doors, windows, a balcony with a plant */}
        {Array.from({ length: 7 }, (_, i) => {
          const x = -900 + i * 400;
          const h = 600 + (i % 3) * 70;
          const col = o.dark ? ["#4a4f6e", "#56506a", "#3f4a66"][i % 3] : ["#d9b99a", "#a8c9c0", "#e6cd98", "#dc9d8f"][i % 4];
          return (
            <g key={i}>
              <rect x={x} y={860 - h} width={380} height={h + 200} fill={col} stroke="#3b2a1f" strokeWidth={5} />
              <rect x={x + 50} y={860 - h + 70} width={100} height={110} fill={on && noise(i + 4) > 0.3 ? "#ffd27a" : "#6c7f8f"} />
              <rect x={x + 230} y={860 - h + 70} width={100} height={110} fill={on && noise(i) > 0.5 ? "#ffd27a" : "#6c7f8f"} />
              <rect x={x + 140} y={680} width={100} height={180} fill="#6b3f2a" stroke="#3b2a1f" strokeWidth={4} />
              <rect x={x + 20} y={860 - h + 200} width={340} height={14} fill="#3b3e47" />
            </g>
          );
        })}
        {/* wires overhead */}
        {[120, 170, 210].map((y, i) => <path key={y} d={`M-1000 ${y} Q600 ${y + 60 + i * 10} 2400 ${y + 20}`} fill="none" stroke={INK} strokeWidth={3} opacity={0.8} />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={860} fill={o.dark ? "#7d7464" : "#c9b796"} gap={240} slant={-120} opacity={0.06} />
        {/* the end wall with the stumps */}
        <rect x={WALL} y={240} width={800} height={FLOOR - 240} fill={o.dark ? "#8a7a6a" : "#e8d3b0"} stroke={INK} strokeWidth={6} />
        {options.stumps === "chalk"
          ? [0, 1, 2].map((k) => <rect key={k} x={WALL + 40 + k * 34} y={720} width={10} height={FLOOR - 730} fill={PAPER} opacity={0.9} />)
          : <rect x={WALL - 40} y={800} width={150} height={FLOOR - 800} rx={8} fill="#3d6fb0" stroke={INK} strokeWidth={4} />}
        {options.stumps === "chalk" && <rect x={WALL + 34} y={712} width={88} height={8} fill={PAPER} opacity={0.9} />}
        {options.window && (
          <g>
            <rect x={WALL + 220} y={400} width={200} height={180} fill={on ? "#ffd27a" : "#3b3e47"} stroke={INK} strokeWidth={5} />
            <circle cx={WALL + 320} cy={470} r={40} fill={MOTHER.head} />
            <path d={`M${WALL + 270} 580 Q${WALL + 320} 510 ${WALL + 370} 580Z`} fill={MOTHER.coat} />
            <circle cx={WALL + 308} cy={462} r={5} fill={INK} /><circle cx={WALL + 332} cy={462} r={5} fill={INK} />
            <path d={`M${WALL + 308} 488 L${WALL + 332} 488`} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {/* the parked bike */}
        <g transform="translate(120 920)">
          {[0, 230].map((x) => <circle key={x} cx={x} cy={0} r={52} fill="none" stroke={INK} strokeWidth={10} />)}
          <path d="M0 0 L90 -90 H190 L230 0 M90 -90 L120 0 H190" fill="none" stroke={CRIMSON} strokeWidth={14} strokeLinejoin="round" />
          <rect x={60} y={-118} width={110} height={30} rx={14} fill={INK} />
          <path d="M190 -90 L210 -140 H250" fill="none" stroke={INK} strokeWidth={8} />
        </g>
        {options.ball && <circle cx={options.ball.x} cy={options.ball.y} r={13} fill={CRIMSON} stroke={INK} strokeWidth={3} />}
        {options.ball && [1, 2, 3].map((k) => <circle key={k} cx={options.ball!.x - k * 26} cy={options.ball!.y + k * 4} r={10 - k * 2} fill="#f3e9d7" opacity={0.5 - k * 0.12} />)}
      </Deep>
    </>
  );
};

export const gullyCricket: SetDef<GullyCricketOptions> = {
  name: "gully-cricket",
  about: "gully cricket in a lane: stumps chalked on the end wall (or a crate), a parked bike, wires, an aunty at the window",
  spots: {
    batter: { x: WALL - 70, y: FLOOR, scale: 1.15, facing: -1 },
    bowler: { x: 560, y: FLOOR, scale: 1.15, facing: 1 },
    fielder: { x: 1060, y: FLOOR + 20, scale: 1.2, facing: 1 },
    keeper: { x: WALL + 160, y: FLOOR, scale: 1.05, facing: -1 },
  },
  cameras: {
    wide: REF,
    batter: { x: WALL - 120, y: 640, zoom: 1.6 },
    lane: { x: 820, y: 600, zoom: 1.25 },
  },
  lights: () => [{ x: 960, y: 600, depth: 0.6, r: 900, color: "#ffd27a", strength: 0.15, moods: LIGHTS_ON }],
  defaults: { ball: { x: 1180, y: 700 }, stumps: "chalk", window: true },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "bowler", who: { ...FRIEND, look: { x: 0.8, y: -0.2 } }, face: EXPRESSIONS.shocked, pose: { ...STAND, armF: [150, 10], lean: 8 } },
      { spot: "batter", who: { ...HERO, look: { x: 0.8, y: 0 }, held: <Bat angle={-60} /> }, face: EXPRESSIONS.determined, pose: { ...STAND, armF: [70, 40], lean: 6 } },
    ],
  },
};
