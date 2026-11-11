// A city street, side on. From the pause film (sets/Street.tsx, itself the owner's sample street: the skyline, the
// buildings with windows, the road with its zebra crossing, the trees, the traffic light, the far-pavement crowd and
// the red bus), redrawn for REF with the mood: street lamps and lit windows after dark, shop signs, an auto at the kerb.
import { Figure } from "../rig/Figure";
import { EXPRESSIONS } from "../rig/expressions";
import { walkPose } from "../rig/pose";
import { CRIMSON, INK, PAPER } from "../theme";
import { HERO, PASTELS, SIBLING } from "./cast";
import { Deep, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, Sky, Skyline, type SetDef, type SetProps } from "./common";

const ROAD_TOP = 740;
const ROAD_BOTTOM = 930;
const CROSSING = 1080;
const LIGHT_X = 1660;

export interface StreetOptions {
  /** The traffic light: red stops the traffic. */
  red: boolean;
  /** Pedestrians on the far pavement. */
  crowd: boolean;
  /** The red bus on the road: its front's x, or null for none. */
  bus: number | null;
  /** An auto-rickshaw at the near kerb. */
  auto: boolean;
}

/** The red city bus, side on, its front at x, wheels on the road (the pause sample's bus). */
export const CityBus: React.FC<{ x: number; y?: number; lit?: boolean }> = ({ x, y = 0, lit }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={380} cy={885} rx={410} ry={20} fill="#000" opacity={0.25} />
    <path d="M28 610 Q0 610 0 650 V850 H760 V610Z" fill="#cf5b3a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={0} y={750} width={760} height={24} fill={PAPER} />
    <path d="M14 636 H104 V735 H6 V650 Q6 636 14 636Z" fill={lit ? "#ffe9b0" : "#bfe6ee"} stroke={INK} strokeWidth={6} />
    {[130, 250, 370, 490, 610].map((w) => <rect key={w} x={w} y={640} width={100} height={84} rx={9} fill={lit ? "#ffe9b0" : "#bfe6ee"} stroke={INK} strokeWidth={6} />)}
    <circle cx={12} cy={806} r={14} fill="#fff1b8" stroke={INK} strokeWidth={5} />
    {[150, 610].map((w) => (
      <g key={w}><circle cx={w} cy={852} r={38} fill={INK} /><circle cx={w} cy={852} r={15} fill={PAPER} /></g>
    ))}
  </g>
);

/** An auto-rickshaw, side on, facing left, wheels on y. */
export const Auto: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-10 -40 Q-20 -200 120 -220 H300 Q330 -220 330 -190 V-40Z" fill="#2f7a4a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-10 -40 Q0 -120 60 -130 H330 V-40Z" fill="#f2b632" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M70 -128 Q60 -200 120 -206 H200 V-128Z" fill="#bfe6ee" opacity={0.8} stroke={INK} strokeWidth={5} />
    <rect x={220} y={-200} width={100} height={150} rx={10} fill="#3b3e47" />
    {[30, 290].map((wx) => <g key={wx}><circle cx={wx} cy={-24} r={30} fill={INK} /><circle cx={wx} cy={-24} r={11} fill={PAPER} /></g>)}
  </g>
);

const Back: React.FC<SetProps<StreetOptions>> = ({ cam, mood, frame, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.15} flat><Sky id="street" mood={mood} x={-1400} y={-800} w={4800} h={1700} sunAt={{ x: 700, y: 250 }} /></Deep>
      <Deep cam={cam} depth={0.28} flat><Skyline mood={mood} from={-1400} to={3400} base={620} tall={340} seed={1} colors={["#c9dcd2", "#bcd2cb", "#d3e2da"]} /></Deep>
      <Deep cam={cam} depth={0.6} flat>
        {Array.from({ length: 12 }, (_, i) => {
          const bx = -900 + i * 370;
          const h = 240 + noise(i) * 240;
          const color = o.dark ? ["#3a3f68", "#33385e", "#2e3458"][i % 3] : ["#e4b48e", "#dc9d8f", "#e6cd98", "#a3c7bf", "#d4ae93"][i % 5];
          return (
            <g key={i}>
              <rect x={bx} y={700 - h} width={350} height={h + 40} fill={color} />
              {Array.from({ length: Math.floor(h / 75) * 3 }, (_, w) => (
                <rect key={w} x={bx + 34 + (w % 3) * 102} y={700 - h + 28 + Math.floor(w / 3) * 75} width={66} height={46} rx={4}
                  fill={noise(i * 10 + w) < o.lit + 0.12 ? "#fff1b8" : o.dark ? "#1a1f3d" : "rgba(40,50,60,.22)"} />
              ))}
              <rect x={bx + 20} y={640} width={310} height={36} rx={4} fill={["#d8344f", "#1d9a8f", "#f2b632"][i % 3]} />
            </g>
          );
        })}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={ROAD_TOP - 45} width={4800} height={50} fill="#d9cbb0" />
        <rect x={-1400} y={ROAD_TOP} width={4800} height={ROAD_BOTTOM - ROAD_TOP} fill={o.dark ? "#3a3d45" : "#4b4f57"} />
        <rect x={-1400} y={ROAD_BOTTOM} width={4800} height={600} fill="#d9cbb0" />
        <rect x={-1400} y={ROAD_BOTTOM} width={4800} height={14} fill="#b7a98f" />
        <rect x={-1400} y={ROAD_TOP - 6} width={4800} height={10} fill="#b7a98f" />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1300 + i * 160} y={832} width={88} height={9} rx={3} fill={PAPER} opacity={0.85} />)}
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={CROSSING + i * 54} y={750} width={32} height={175} fill={PAPER} opacity={0.9} />)}
        {options.bus !== null && <CityBus x={options.bus} lit={on} />}
        {[60, 1480, 2700].map((x) => (
          <g key={x}>
            <rect x={x - 11} y={470} width={22} height={225} fill="#6f4a2f" />
            <circle cx={x} cy={430} r={92} fill={o.dark ? "#2f4a48" : "#4c9a76"} /><circle cx={x - 62} cy={475} r={58} fill={o.dark ? "#2f4a48" : "#4c9a76"} />
            <circle cx={x + 62} cy={478} r={62} fill={o.dark ? "#284240" : "#3f8a68"} />
          </g>
        ))}
        {[700, 2100].map((x) => (
          <g key={x}>
            <rect x={x - 6} y={380} width={12} height={320} fill="#4a5262" />
            <path d={`M${x} 384 Q${x + 40} 360 ${x + 80} 384`} fill="none" stroke="#4a5262" strokeWidth={10} />
            <ellipse cx={x + 80} cy={392} rx={26} ry={10} fill={on ? "#ffe6a0" : "#9aa1ab"} />
            {on && <path d={`M${x + 56} 396 L${x + 104} 396 L${x + 200} 700 L${x - 40} 700Z`} fill="#ffe6a0" opacity={0.12} />}
          </g>
        ))}
        <rect x={LIGHT_X - 8} y={420} width={16} height={280} fill={INK} />
        <rect x={LIGHT_X - 36} y={290} width={72} height={185} rx={13} fill={INK} />
        {options.red && <circle cx={LIGHT_X} cy={330} r={46 + Math.sin(frame * 0.5) * 7} fill={CRIMSON} opacity={0.35} />}
        <circle cx={LIGHT_X} cy={330} r={24} fill={options.red ? CRIMSON : "#5a2a32"} />
        <circle cx={LIGHT_X} cy={383} r={24} fill="#57482a" /><circle cx={LIGHT_X} cy={436} r={24} fill={options.red ? "#28503c" : "#3fbf7f"} />
        {options.crowd && [-40, 230, 520, 880, 1250, 1900].map((x, i) => (
          <Figure key={i} x={x + ((frame * 1.5 * (i % 2 ? 1 : -1)) % 200)} y={702 + (i % 2) * 9} scale={0.66} facing={i % 2 ? 1 : -1} pose={walkPose(frame * 0.18 + i * 1.7)}
            head={PASTELS[i % PASTELS.length]} look={{ x: 0.6, y: 0 }} mouth="flat" time={frame} />
        ))}
        {options.auto && <Auto x={1440} y={ROAD_BOTTOM} />}
      </Deep>
    </>
  );
};

export const street: SetDef<StreetOptions> = {
  name: "street",
  about: "city street: skyline, shopfront buildings, road with a zebra crossing, trees, traffic light, lamps, bus, auto",
  spots: {
    near: { x: 640, y: 1010, scale: 1.3, facing: 1 },
    nearRight: { x: 1060, y: 1010, scale: 1.3, facing: -1 },
    crossing: { x: CROSSING + 180, y: 900, scale: 1.1, facing: -1 },
    far: { x: 380, y: 708, scale: 0.68, facing: 1 },
  },
  cameras: {
    wide: REF,
    pavement: { x: 860, y: 680, zoom: 1.4 },
    crossing: { x: 1260, y: 640, zoom: 1.5 },
  },
  lights: () => [
    { x: 780, y: 392, r: 320, color: "#ffe6a0", strength: 0.45, moods: LIGHTS_ON },
    { x: 2180, y: 392, r: 320, color: "#ffe6a0", strength: 0.45, moods: LIGHTS_ON },
  ],
  defaults: { red: false, crowd: true, bus: null, auto: true },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "near", who: { ...HERO, flow: 0.4, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.determined, pose: walkPose(1.2) },
      { spot: "nearRight", who: { ...SIBLING, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
    ],
  },
};
