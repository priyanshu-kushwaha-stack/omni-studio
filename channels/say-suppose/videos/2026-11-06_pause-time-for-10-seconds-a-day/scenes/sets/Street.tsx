import { Figure } from "@whatif/kit/rig/Figure";
import { walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, HEIGHT, INK, WIDTH } from "@whatif/kit/theme";
import { blinking, noise } from "../shared";

/** The sample's street (core/engines/whatif/examples/pause-sample/scenes/Street.tsx), as a reusable set. World units:
 *  the far pavement top is at y 680-712, the road runs from ROAD_TOP to ROAD_BOTTOM, the near pavement below it.
 *  Actors on the far pavement stand at y about 712 (scale 0.62-0.74); on the near pavement at about 1010 (scale 1.3). */
export const ROAD_TOP = 725;
export const ROAD_BOTTOM = 930;
/** The zebra crossing spans these x values. */
export const CROSSING = { from: 1012, to: 1390 };
export const LIGHT_X = 2450;
export const BUS_STOP_X = 1400;
export const KID_FEET = 862;

export const SKY = (
  <>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fd0e4" />
        <stop offset="0.75" stopColor="#fbe7c2" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#sky)" />
  </>
);

/** The red bus. Its front is at x; it drives left (towards smaller x). */
export const Bus: React.FC<{ x: number; t: number; moving: boolean }> = ({ x, t, moving }) => (
  <g transform={`translate(${x} 0)`}>
    <ellipse cx={380} cy={885} rx={410} ry={20} fill="#000" opacity={0.25} />
    {moving && [0, 1, 2].map((i) => <rect key={i} x={790 + ((t * 9 + i * 40) % 90)} y={700 + i * 55} width={120} height={7} rx={4} fill="#fff" opacity={0.5} />)}
    <path d="M28 610 Q0 610 0 650 V850 H760 V610Z" fill="#cf5b3a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={0} y={750} width={760} height={24} fill="#f3e9d7" />
    <path d="M14 636 H104 V735 H6 V650 Q6 636 14 636Z" fill="#bfe6ee" stroke={INK} strokeWidth={6} />
    {[130, 250, 370, 490, 610].map((w) => <rect key={w} x={w} y={640} width={100} height={84} rx={9} fill="#bfe6ee" stroke={INK} strokeWidth={6} />)}
    <circle cx={62} cy={700} r={24} fill="#d9c26a" />
    <circle cx={50} cy={695} r={4} fill={INK} /><circle cx={64} cy={695} r={4} fill={INK} />
    <circle cx={12} cy={806} r={14} fill="#fff1b8" stroke={INK} strokeWidth={5} />
    {[150, 610].map((w) => (
      <g key={w} transform={`rotate(${-t * 14} ${w} 852)`}>
        <circle cx={w} cy={852} r={38} fill={INK} /><circle cx={w} cy={852} r={15} fill="#f3e9d7" />
        <rect x={w - 3} y={824} width={6} height={18} fill="#f3e9d7" />
      </g>
    ))}
  </g>
);

export const Pigeon: React.FC<{ x: number; y: number; flap: number }> = ({ x, y, flap }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse rx={23} ry={11} fill="#5f6a75" />
    <circle cx={-20} cy={-7} r={8} fill="#5f6a75" />
    <path d={`M0 -4 Q12 ${-34 * flap} 30 ${-30 * flap} L18 2Z`} fill="#3f4852" />
    <path d={`M-4 -4 Q-6 ${-30 * flap} -20 ${-32 * flap} L-14 2Z`} fill="#3f4852" />
  </g>
);

/** The kid's ball. */
export const Ball: React.FC<{ x: number; y: number; spin: number; squash?: number }> = ({ x, y, spin, squash = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${2 - squash} ${squash}) rotate(${spin})`}>
    <circle r={26} fill="#f3e9d7" stroke={INK} strokeWidth={5} /><path d="M-26 0 H26 M0 -26 V26" stroke={CRIMSON} strokeWidth={5} />
  </g>
);

const CROWD = [-40, 130, 300, 480, 850, 1020, 1190, 1350, 1530].map((x, i) => ({
  x,
  head: ["#c96f2d", "#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a"][i % 6],
  facing: (i % 3 === 0 ? -1 : 1) as 1 | -1,
  pose: { ...walkPose(i * 1.7), armF: i % 4 === 0 ? [110, 60] : walkPose(i * 1.7).armF } as Pose,
  scale: 0.62 + noise(i) * 0.06,
}));

/** Skyline, buildings, road with the crossing, trees and the traffic light. `red` lights the red lamp with a pulse;
 *  `crowd` puts the sample's nine pedestrians on the far pavement (they freeze mid-step when `paused`); `leaves`
 *  recolours the trees for seasons. Put actors and the bus in the scene, not here. */
export const StreetBack: React.FC<{ cam: Camera; frame: number; t: number; red?: boolean; crowd?: boolean; paused?: boolean; leaves?: [string, string] }> = ({
  cam, frame, t, red, crowd, paused, leaves = ["#4c9a76", "#3f8a68"],
}) => (
  <>
    <Layer cam={cam} depth={0.25} flat>
      <circle cx={700} cy={250} r={85} fill="#fff1b8" />
      <path d="M-900 560 L-700 380 H-540 V260 H-350 V420 H-150 V300 H60 V450 H260 V230 H460 V430 H700 V330 H900 V240 H1120 V440 H1400 V300 H1650 V420 H1900 V270 H2200 V430 H2500 V320 H2800 V760 H-900Z" fill="#c9dcd2" />
    </Layer>
    <Layer cam={cam} depth={0.6} flat>
      {Array.from({ length: 13 }, (_, i) => {
        const bx = -700 + i * 370;
        const h = 240 + noise(i) * 240;
        const color = ["#e4b48e", "#dc9d8f", "#e6cd98", "#a3c7bf", "#d4ae93"][i % 5];
        return (
          <g key={i}>
            <rect x={bx} y={700 - h} width={350} height={h + 40} fill={color} />
            {Array.from({ length: Math.floor(h / 75) * 3 }, (_, w) => (
              <rect key={w} x={bx + 34 + (w % 3) * 102} y={700 - h + 28 + Math.floor(w / 3) * 75} width={66} height={46} rx={4} fill={noise(i * 10 + w) > 0.8 ? "#fff1b8" : "rgba(40,50,60,.22)"} />
            ))}
          </g>
        );
      })}
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-800} y={ROAD_TOP - 45} width={5000} height={50} fill="#d9cbb0" />
      <rect x={-800} y={ROAD_TOP} width={5000} height={ROAD_BOTTOM - ROAD_TOP} fill="#4b4f57" />
      <rect x={-800} y={ROAD_BOTTOM} width={5000} height={400} fill="#d9cbb0" />
      <rect x={-800} y={ROAD_BOTTOM} width={5000} height={14} fill="#b7a98f" />
      <rect x={-800} y={ROAD_TOP - 6} width={5000} height={10} fill="#b7a98f" />
      {Array.from({ length: 34 }, (_, i) => <rect key={i} x={-700 + i * 160} y={826} width={88} height={9} rx={3} fill="#f3e9d7" opacity={0.85} />)}
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={CROSSING.from + i * 54} y={735} width={32} height={185} fill="#f3e9d7" opacity={0.9} />)}
    </Layer>
    <Layer cam={cam} depth={1}>
      {[60, 1590, 2850].map((x) => (
        <g key={x}>
          <rect x={x - 11} y={470} width={22} height={225} fill="#6f4a2f" />
          <circle cx={x} cy={430} r={92} fill={leaves[0]} /><circle cx={x - 62} cy={475} r={58} fill={leaves[0]} /><circle cx={x + 62} cy={478} r={62} fill={leaves[1]} />
        </g>
      ))}
      <rect x={LIGHT_X - 8} y={420} width={16} height={280} fill={INK} />
      <rect x={LIGHT_X - 36} y={290} width={72} height={185} rx={13} fill={INK} />
      {red && <circle cx={LIGHT_X} cy={330} r={46 + Math.sin(frame * 0.5) * 7} fill={CRIMSON} opacity={0.35} />}
      <circle cx={LIGHT_X} cy={330} r={24} fill={red ? CRIMSON : "#5a2a32"} />
      <circle cx={LIGHT_X} cy={383} r={24} fill="#57482a" /><circle cx={LIGHT_X} cy={436} r={24} fill={red ? "#28503c" : "#3fbf7f"} />
      {crowd && CROWD.map((c, i) => (
        <Figure key={i} x={c.x} y={712 + (i % 2) * 9} scale={c.scale} facing={c.facing} pose={c.pose} head={c.head} look={{ x: 0.6, y: 0 }}
          mouth={i % 3 === 0 ? "smile" : "flat"} blink={!paused && blinking(frame, i)} time={t} />
      ))}
    </Layer>
  </>
);
