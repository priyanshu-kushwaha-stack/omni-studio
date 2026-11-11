// A chai stall on a college street, side on. From "Nobody Could Say No" (sets/ChaiStall.tsx: the tin roof on poles,
// the shelf of jars, the stove and kettle with steam, the stack of glasses, the counter, the college gate behind) and
// "60 Seconds" (sets.tsx StreetNight: the stall's bulb at night). Put the chai man `behind`; the counter (Mid) goes over
// him; customers stand in front.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK, PAPER } from "../theme";
import { FRIEND, HERO, VENDOR } from "./cast";
import { Deep, defineSet, lightsOn, noise, OUTSIDE, Sky, type SetProps } from "./common";
import { ChaiGlass } from "./props";

const FLOOR = 960;
const COUNTER = { from: 900, to: 1560, top: 800 };
const KETTLE = { x: 1462, y: 680 };
const BULB = { x: 1230, y: 360 };

export interface ChaiStallOptions {
  /** Glasses stacked on the counter. */
  glasses: number;
  /** Two full glasses waiting at the counter's front. */
  poured: boolean;
  /** Steam from the kettle, 0 to 1. */
  steam: number;
}

const Kettle: React.FC<{ frame: number; steam: number }> = ({ frame, steam }) => {
  const { x, y } = KETTLE;
  return (
    <g>
      <rect x={x - 120} y={y + 60} width={130} height={60} rx={8} fill="#3b3e47" stroke={INK} strokeWidth={5} />
      <ellipse cx={x - 55} cy={y + 60} rx={50} ry={8} fill="#e0793f" opacity={0.9} />
      <path d={`M${x - 110} ${y + 56} Q${x - 116} ${y - 10} ${x - 55} ${y - 14} Q${x + 6} ${y - 10} ${x} ${y + 56}Z`} fill="#b8bec8" stroke={INK} strokeWidth={5} />
      <path d={`M${x - 10} ${y + 20} Q${x + 10} ${y + 6} ${x} ${y}`} fill="none" stroke="#b8bec8" strokeWidth={14} strokeLinecap="round" />
      <path d={`M${x - 92} ${y - 14} Q${x - 55} ${y - 60} ${x - 18} ${y - 14}`} fill="none" stroke={INK} strokeWidth={6} />
      {steam > 0 && [0, 1, 2, 3].map((i) => {
        const p = (frame / 50 + i / 4) % 1;
        return <circle key={i} cx={x + 4 + Math.sin(frame / 14 + i) * 10 * p} cy={y - 10 - p * 150} r={14 + p * 26} fill={PAPER} opacity={0.5 * steam * (1 - p)} />;
      })}
    </g>
  );
};

const Back: React.FC<SetProps<ChaiStallOptions>> = ({ cam, mood, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  const c = COUNTER;
  return (
    <>
      <Deep cam={cam} depth={0.25} flat><Sky id="chai" mood={mood} x={-1400} y={-800} w={4800} h={1700} sunAt={{ x: 300, y: 170 }} /></Deep>
      <Deep cam={cam} depth={0.55} flat>
        {/* the college: a cream block with an arched gate, its windows lit after dark, trees */}
        <rect x={-500} y={260} width={1500} height={520} fill={o.dark ? "#8d8270" : "#e8d3a8"} />
        <rect x={-500} y={240} width={1500} height={30} fill={o.dark ? "#6f6656" : "#c9a77a"} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 10 }, (_, k) => (
          <rect key={`${r}-${k}`} x={-440 + k * 145} y={300 + r * 100} width={70} height={60} rx={30}
            fill={noise(r * 10 + k) < o.lit ? "#ffe39a" : o.dark ? "#2a2f52" : "#8fa6b5"} opacity={0.85} />
        )))}
        <path d="M180 780 V560 Q300 440 420 560 V780Z" fill="#6b5240" />
        {[-900, 1200, 1700, 2300].map((x, i) => (
          <g key={x}>
            <rect x={x - 12} y={520} width={24} height={260} fill="#6f4a2f" />
            <circle cx={x} cy={480} r={110 + noise(i) * 30} fill={o.dark ? "#2f4a48" : "#5ba06f"} />
            <circle cx={x + 70} cy={530} r={70} fill={o.dark ? "#284240" : "#4c9a76"} />
          </g>
        ))}
        <rect x={-1400} y={770} width={4800} height={30} fill="#cfc2a6" />
      </Deep>
      <Deep cam={cam} depth={0.8} flat>
        <rect x={-1400} y={790} width={4800} height={120} fill="#6c6f76" />
        {Array.from({ length: 20 }, (_, i) => <rect key={i} x={-1300 + i * 240} y={846} width={110} height={8} rx={4} fill={PAPER} opacity={0.7} />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={900} width={4800} height={700} fill="#d9cbb0" />
        <rect x={-1400} y={900} width={4800} height={12} fill="#b7a98f" />
        {/* the stall: back wall, the shelf of jars, poles, the tin roof, the bulb */}
        <rect x={c.from - 40} y={380} width={c.to - c.from + 80} height={530} fill="#7a4a3a" />
        <rect x={c.from} y={480} width={c.to - c.from} height={12} fill="#4a2a20" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={c.from + 30 + i * 90} y={420} width={56} height={60} rx={10} fill="#e9f3f4" opacity={0.85} stroke={INK} strokeWidth={4} />
            <rect x={c.from + 36 + i * 90} y={446} width={44} height={30} rx={6} fill={["#e6a23c", "#d8344f", "#f3e9d7", "#9a6a44"][i % 4]} />
          </g>
        ))}
        {[c.from - 40, c.to + 30].map((x) => <rect key={x} x={x} y={300} width={16} height={620} fill="#4a3a30" />)}
        <path d={`M${c.from - 120} 340 L${c.from - 60} 270 H${c.to + 110} L${c.to + 170} 340Z`} fill="#3d8a80" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={c.from - 90 + i * 70} y1={276} x2={c.from - 120 + i * 76} y2={340} stroke="#2e6d65" strokeWidth={5} />)}
        <line x1={BULB.x} y1={340} x2={BULB.x} y2={BULB.y - 14} stroke={INK} strokeWidth={3} />
        <circle cx={BULB.x} cy={BULB.y} r={16} fill={on ? "#fff1c8" : "#d9d2c0"} stroke={INK} strokeWidth={3} />
      </Deep>
    </>
  );
};

/** The counter and what sits on it, over the chai man: the kettle on its stove, the glasses, two full ones. */
const Mid: React.FC<SetProps<ChaiStallOptions>> = ({ frame, options }) => {
  const c = COUNTER;
  return (
    <g>
      <Kettle frame={frame} steam={options.steam} />
      <rect x={c.from - 20} y={c.top - 16} width={c.to - c.from + 40} height={22} rx={6} fill="#9a6a44" stroke={INK} strokeWidth={5} />
      <rect x={c.from} y={c.top + 6} width={c.to - c.from} height={FLOOR - c.top - 6} fill="#c7884f" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={c.from + 20 + i * 108} y={c.top + 24} width={86} height={FLOOR - c.top - 48} rx={6} fill="#b5763f" />)}
      {Array.from({ length: options.glasses }, (_, i) => <ChaiGlass key={i} x={1140 + (i % 2) * 6 - 3} y={c.top - 16 - i * 22} scale={0.8} fill={0} />)}
      {options.poured && [960, 1020].map((x) => <ChaiGlass key={x} x={x} y={c.top - 16} scale={0.9} />)}
    </g>
  );
};

export const chaiStall = defineSet<ChaiStallOptions>({
  name: "chai-stall",
  about: "chai stall outside college: tin roof, shelf of jars, kettle steaming on the stove, glasses, the bulb at night",
  spots: {
    chaiwala: { x: 1320, y: FLOOR, scale: 1.1, facing: -1 },
    customer: { x: 760, y: FLOOR, scale: 1.15, facing: 1 },
    friend: { x: 520, y: FLOOR, scale: 1.15, facing: 1 },
    street: { x: 1760, y: FLOOR + 20, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: { x: 960, y: 540, zoom: 1 },
    twoShot: { x: 1080, y: 600, zoom: 1.5 },
    counter: { x: 1010, y: 760, zoom: 3 },
  },
  lights: [
    { x: BULB.x, y: BULB.y, r: 480, color: "#ffd27a", strength: 0.55, moods: ["dusk", "night", "lamp"] },
    { x: KETTLE.x - 55, y: KETTLE.y + 60, r: 160, color: "#ff9a4a", strength: 0.35, moods: ["dusk", "night", "lamp"] },
  ],
  defaults: { glasses: 5, poured: true, steam: 1 },
  Back,
  Mid,
  example: {
    camera: "wide",
    cast: [
      { spot: "chaiwala", who: { ...VENDOR, look: { x: 0.8, y: 0.2 } }, face: EXPRESSIONS.happy, behind: true, pose: { ...STAND, armF: [80, 20] } },
      { spot: "customer", who: { ...HERO, flow: 0.2, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.relieved },
      { spot: "friend", who: { ...FRIEND, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
    ],
  },
});
