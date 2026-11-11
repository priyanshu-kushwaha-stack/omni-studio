// The city across the bay from a sea-front promenade: three depths of skyline with lit windows, a sea that catches
// the light, the curve of street lamps along the far shore after dusk, a flyover with moving headlights, birds, and
// the promenade wall you sit on. Built for the library from the shared Skyline and the balcony; at its best at dusk.
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { HERO, SIBLING } from "./cast";
import { Deep, Floor, LIGHTS_ON, lightsOn, OUTSIDE, REF, seat, Sky, Skyline, type SetDef, type SetProps } from "./common";

const FLOOR = 980;
const WALL = 860;

export interface CitySkylineOptions {
  /** Cars on the flyover (their lights after dark). */
  traffic: boolean;
  /** Birds crossing the sky. */
  birds: boolean;
  /** The curve of lamps along the far shore: null follows the mood, or force it. */
  shoreLamps: boolean | null;
}

const Back: React.FC<SetProps<CitySkylineOptions>> = ({ cam, mood, frame, options }) => {
  const o = OUTSIDE[mood];
  const lamps = options.shoreLamps ?? lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.05} flat>
        <Sky id="skyline" mood={mood} x={-1400} y={-800} w={4800} h={1300} sunAt={{ x: 1200, y: 230 }} />
        {options.birds && [0, 1, 2, 3, 4].map((i) => {
          const x = ((frame * 2.2 + i * 160) % 2600) - 300;
          return <path key={i} d={`M${x} ${150 + i * 18} q14 -12 28 0 q14 -12 28 0`} fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />;
        })}
      </Deep>
      <Deep cam={cam} depth={0.12} flat><Skyline mood={mood} from={-1400} to={3400} base={520} tall={420} seed={13} colors={["#b9a6c4", "#c9b4c8", "#a99ab8"]} /></Deep>
      <Deep cam={cam} depth={0.2} flat><Skyline mood={mood} from={-1200} to={3200} base={540} tall={300} seed={5} /></Deep>
      <Deep cam={cam} depth={0.3} flat>
        {/* the flyover across the bay, its traffic */}
        <rect x={-1400} y={500} width={4800} height={22} fill={o.dark ? "#3a3f5c" : "#9aa1ab"} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-1300 + i * 360} y={522} width={18} height={60} fill={o.dark ? "#2a2f44" : "#8a94a0"} />)}
        {options.traffic && Array.from({ length: 10 }, (_, i) => {
          const x = (((i * 480 + frame * (i % 2 ? 6 : -5)) % 4800) + 4800) % 4800 - 1400;
          return <rect key={i} x={x} y={490} width={36} height={12} rx={6} fill={o.dark ? (i % 2 ? "#fff6d0" : "#ff5a6e") : ["#d8344f", "#f2b632", "#3d6fb0"][i % 3]} />;
        })}
      </Deep>
      <Deep cam={cam} depth={0.4} flat>
        {/* the sea, its glints, the far shore's lamps */}
        <rect x={-1400} y={560} width={4800} height={800} fill={o.dark ? "#141a33" : "#6aa6c4"} />
        <path d="M-1400 600 Q960 520 3400 600" fill="none" stroke={o.dark ? "#2a2f52" : "#c9b796"} strokeWidth={22} />
        {lamps && Array.from({ length: 50 }, (_, i) => {
          const x = -1300 + i * 96;
          const y = 590 - Math.sin(((x + 1400) / 4800) * Math.PI) * 70;
          return <g key={i}><circle cx={x} cy={y} r={7} fill="#ffe39a" /><rect x={x - 3} y={y + 14} width={6} height={60} fill="#ffe39a" opacity={0.25} /></g>;
        })}
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1200 + ((i * 263) % 4400)} y={640 + (i % 6) * 40} width={60 + (i % 3) * 30} height={5} rx={3} fill={o.dark ? "#3a4270" : "#bfe0ea"} opacity={0.6} />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        {/* the promenade: its wall, the tetrapods below it, the walkway */}
        <rect x={-1400} y={WALL} width={4800} height={40} fill="#b9b2a6" stroke={INK} strokeWidth={4} />
        <Floor y={WALL + 40} fill="#9a958c" gap={180} slant={-120} />
      </Deep>
    </>
  );
};

export const citySkyline: SetDef<CitySkylineOptions> = {
  name: "city-skyline",
  about: "the city across the bay from a sea-front promenade: layered skyline, flyover traffic, shore lamps at dusk, birds",
  spots: {
    wall: seat(760, WALL, 1.1, 1),
    wallRight: seat(1060, WALL, 1.1, -1),
    walker: { x: 1500, y: FLOOR + 20, scale: 1.2, facing: -1 },
  },
  cameras: {
    wide: REF,
    city: { x: 960, y: 420, zoom: 1.4 },
    twoShot: { x: 900, y: 700, zoom: 1.6 },
  },
  lights: () => [{ x: 960, y: 560, depth: 0.4, r: 1100, color: "#ffd8a0", strength: 0.18, moods: LIGHTS_ON }],
  defaults: { traffic: true, birds: true, shoreLamps: null },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "wall", who: { ...HERO, flow: 0.6, look: { x: 0.6, y: -0.3 } }, face: EXPRESSIONS.relieved },
      { spot: "wallRight", who: { ...SIBLING, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
    ],
  },
};
