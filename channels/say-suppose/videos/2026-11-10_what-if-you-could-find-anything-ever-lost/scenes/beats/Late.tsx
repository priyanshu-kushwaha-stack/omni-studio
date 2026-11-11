// The back half: the dig at the tulsi, the roof and the planet, the power cut, the choice, and the lamp.
import { SIT, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { INK, PAPER } from "@whatif/kit/theme";
import type { Beat, Shot } from "../shared";
import { Cousin, DistTag, Dots, Envelope, Grandpa, Lamp, Madhav, Pill, You } from "../parts";
import { ease, local, push, Room, Set, Window } from "./kit";

const TULSI = { x: 1180, y: 860 };

/** The tulsi in its painted pot on a low plinth; `crooked` tilts it after it goes back in. */
const Tulsi: React.FC<{ x: number; y: number; f: number; crooked?: number; s?: number }> = ({ x, y, f, crooked = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-30} width={220} height={60} fill="#e8d6b0" stroke={INK} strokeWidth={5} />
    <path d="M-70 -30 L70 -30 L56 -150 L-56 -150Z" fill="#b5653a" stroke={INK} strokeWidth={5} />
    <rect x={-62} y={-120} width={124} height={20} fill="#f2c94c" />
    <g transform={`rotate(${crooked * 14} 0 -150)`}>
      <line x1={0} y1={-150} x2={0} y2={-330} stroke="#4f6a2a" strokeWidth={8} />
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx={(i % 2 ? 1 : -1) * 34} cy={-180 - i * 18} rx={34} ry={14} fill={["#4f8a3a", "#5a9a44", "#6aa850"][i % 3]}
          transform={`rotate(${(i % 2 ? -1 : 1) * 25 + Math.sin(f / 20 + i) * 4} ${(i % 2 ? 1 : -1) * 34} ${-180 - i * 18})`} />
      ))}
    </g>
  </g>
);

/** The courtyard at the back of the house, the tulsi in the middle. */
const Yard: React.FC<{ f: number; crooked?: number; dark?: boolean; slippers?: boolean }> = ({ f, crooked, dark, slippers }) => (
  <g>
    <Room wall={dark ? "#2a2a3a" : "#e2b98a"} floor={dark ? "#1e1e2a" : "#a58c6a"} horizon={760} />
    <rect x={160} y={260} width={260} height={500} fill={dark ? "#141420" : "#6b4a33"} stroke="#3b2a1f" strokeWidth={10} />
    {slippers && <g><ellipse cx={240} cy={790} rx={40} ry={12} fill="#7a3a2a" /><ellipse cx={330} cy={790} rx={40} ry={12} fill="#7a3a2a" /></g>}
    <Tulsi x={TULSI.x} y={TULSI.y} f={f} crooked={crooked} />
  </g>
);

const KNEEL: Pose = { lean: 34, tilt: 16, armF: [90, 40], armB: [70, 60], legB: [80, -120], legF: [70, -110], drop: 70 };

/** 27. Afternoon: his slippers and bag gone; you kneel at the tulsi with the trowel; your cousin behind you, filming. */
const DigStart: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  return (
    <Set cam={push(f, d, { x: 400, y: 640, zoom: 1.5 }, { x: 1000, y: 660, zoom: 1.25 })} back={<Yard f={f} />}
      actors={
        <>
          <You f={f} x={1000} y={1000} s={2.3} pose={{ ...KNEEL, armF: [90 + 25 * Math.sin(f / 3), 40] }} mouth="flat" brows="worry" look={{ x: 0.8, y: 0.6 }} />
          <Cousin f={f} x={620} y={990} s={2.3} pose={{ ...STAND, armF: [110, 20] }} mouth="o" look={{ x: 0.8, y: 0.2 }} />
          <circle cx={700} cy={560} r={8} fill="#d8344f" opacity={Math.floor(f / 15) % 2} />
        </>
      } />
  );
};

/** 28. The trowel hits something: an oilcloth envelope tied with string; on it, a woman's handwriting. */
const Found: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const lift = ease(f, 10, 50);
  return (
    <Set cam={push(f, d, { x: 1060, y: 760, zoom: 1.5 }, { x: 1100, y: 740, zoom: 1.8 })} back={<Yard f={f} />}
      actors={
        <>
          <You f={f} x={1000} y={1000} s={2.3} pose={{ ...KNEEL, armF: [120, 20] }} mouth="o" brows="raised" look={{ x: 0.6, y: 0.2 }} />
          <Envelope x={1180} y={900 - lift * 160} s={1.1} rot={-8 + lift * 8} lit={lift > 0.8} />
        </>
      } />
  );
};

/** 29. Close on the envelope: the deed's edge, a stamp, the orchard's name; then your cousin's phone, still recording. */
const DeedClose: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const toPhone = f > d * 0.55;
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#3a2f28" />
      <g transform="translate(960 540) scale(3)"><Envelope x={0} y={0} lit /></g>
      <rect x={760} y={260} width={420} height={70} fill={PAPER} stroke={INK} strokeWidth={5} transform="rotate(-4 960 290)" />
      <circle cx={1180} cy={300} r={40} fill="none" stroke="#7a1f3a" strokeWidth={6} />
    </g>
  );
  const phone = (
    <g>
      <rect width={1920} height={1080} fill="#2a2a34" />
      <rect x={760} y={200} width={400} height={700} rx={40} fill="#0d0e14" />
      <rect x={780} y={240} width={360} height={620} rx={20} fill="#3a3f52" />
      <circle cx={1100} cy={280} r={14} fill="#d8344f" opacity={Math.floor(f / 15) % 2} />
      <rect x={830} y={600} width={260} height={160} fill="#c9b27a" />
    </g>
  );
  return <Set cam={push(f, d, { x: 960, y: 540, zoom: 1.0 }, { x: 960, y: 560, zoom: 1.1 })} back={toPhone ? phone : back} actors={<g />} />;
};

/** 30. You push the earth back; the tulsi goes back into its pot, crooked; the light drops. */
const Crooked: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const tilt = ease(f, 10, 40);
  return (
    <Set cam={push(f, d, { x: 1100, y: 680, zoom: 1.7 }, { x: 1180, y: 640, zoom: 2.2 })} back={<Yard f={f} crooked={tilt} />}
      actors={
        <>
          <You f={f} x={980} y={1000} s={2.3} pose={{ ...KNEEL, armF: [100 + 15 * Math.sin(f / 4), 40] }} mouth="flat" brows="sad" lids={0.4} look={{ x: 0.8, y: 0.4 }} />
          <Cousin f={f} x={620} y={990} s={2.3} pose={{ ...STAND, armF: [110 - ease(f, d * 0.6, d) * 100, 20] }} mouth="flat" lids={0.4} look={{ x: 0.8, y: 0.4 }} />
        </>
      } />
  );
};

/** 31. Your room at night; the envelope on the desk; you can't look at it; you go up. */
const NightRoom: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const back = (
    <g>
      <Room wall="#2c3150" floor="#1e2238" horizon={760} />
      <Window x={240} y={180} w={360} h={300} sky="#141a33" />
      <rect x={1100} y={620} width={460} height={20} fill="#6b4a33" />
      <rect x={1280} y={588} width={110} height={32} fill="#c9b27a" stroke={INK} strokeWidth={3} />
      <rect x={1640} y={300} width={140} height={460} fill="#3b2f2a" />
    </g>
  );
  const x = 1000 + ease(f, d * 0.4, d) * 700;
  return (
    <Set cam={push(f, d, { x: 1200, y: 600, zoom: 1.4 }, { x: 1300, y: 580, zoom: 1.2 })} back={back}
      actors={<You f={f} x={x} y={990} s={2.4} facing={1} pose={f > d * 0.4 ? walkPose(f / 7) : STAND} mouth="flat" brows="sad" lids={0.4} look={{ x: -0.6, y: 0.6 }} />} />
  );
};

/** The roof at night: water tanks, a washing line, the city's lights below, the old fort on a hill, the sea far off. */
const Roof: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={1920} height={1080} fill="#0f1430" />
    {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={(i * 197) % 1920} cy={(i * 89) % 360} r={2} fill="#e9f3ff" opacity={0.5 + 0.3 * Math.sin(f / 20 + i)} />)}
    <path d="M1300 520 Q1420 380 1560 520Z" fill="#1c2240" />
    <rect x={1380} y={430} width={90} height={60} fill="#232a4a" />
    <rect x={1700} y={500} width={220} height={40} fill="#16224a" />
    {Array.from({ length: 60 }, (_, i) => <rect key={i} x={(i * 151) % 1920} y={540 + ((i * 37) % 200)} width={8} height={8} fill="#ffd36b" opacity={0.7} />)}
    <rect y={760} width={1920} height={320} fill="#2a2e44" />
    <rect x={160} y={600} width={180} height={160} rx={20} fill="#3a3f5a" />
    <line x1={500} y1={640} x2={1100} y2={620} stroke="#555a70" strokeWidth={3} />
    {[0, 1, 2].map((i) => <rect key={i} x={620 + i * 150} y={624} width={70} height={90} fill={["#7fa0c4", "#c9a0d6", "#e6a0a0"][i]} transform={`rotate(${Math.sin(f / 15 + i) * 4} ${655 + i * 150} 624)`} />)}
  </g>
);

/** 32-33. You whisper: the line runs over the rooftops, out past the old fort (3.4 km); it snaps; the next runs to open
 *  sea (212 km). */
const RoofLines: React.FC<{ shot: Shot; second?: boolean }> = ({ shot, second }) => {
  const { f, d } = local(shot);
  const fort = [{ x: 820, y: 980 }, { x: 1000, y: 820 }, { x: 1250, y: 620 }, { x: 1420, y: 470 }];
  const sea = [{ x: 820, y: 980 }, { x: 1100, y: 780 }, { x: 1500, y: 560 }, { x: 1900, y: 520 }, { x: 2400, y: 500 }];
  return (
    <Set cam={push(f, d, { x: 960, y: 640, zoom: 1.15 }, { x: second ? 1200 : 1100, y: 600, zoom: 1.0 })} back={<Roof f={f} />}
      actors={
        <>
          {!second && <Dots frame={f} at={10} dur={50} path={fort} size={11} shrink={0.6} />}
          {second && <Dots frame={f} at={-200} dur={1} path={fort} size={11} shrink={0.6} snapAt={0} />}
          {second && <Dots frame={f} at={14} dur={60} path={sea} size={11} shrink={0.7} />}
          <You f={f} x={700} y={1000} s={2.3} pose={{ ...STAND, tilt: -6 }} mouth="o" brows="raised" look={{ x: 0.9, y: -0.3 }} />
          {!second && <DistTag frame={f} at={58} x={1420} y={380} text="3.4 km" size={50} />}
          {second && <DistTag frame={f} at={70} x={1500} y={420} text={`${Math.round(ease(f, 70, 130) * 212)} km`} size={50} />}
        </>
      } />
  );
};
const FortLine: React.FC<{ shot: Shot }> = ({ shot }) => <RoofLines shot={shot} />;
const SeaLine: React.FC<{ shot: Shot }> = ({ shot }) => <RoofLines shot={shot} second />;

/** 34. The planet as one image: the camera rises until the city is a small glowing patch, your one teal line running
 *  out across the sea, the dark Earth curving away. */
const Planet: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const rise = ease(f, 0, d * 0.7);
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#05070f" />
      {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={(i * 211) % 1920} cy={(i * 97) % 1080} r={1.5 + (i % 3)} fill="#e9f3ff" opacity={0.6} />)}
      <circle cx={960} cy={1700 - rise * 300} r={1200} fill="#14284a" />
      <path d={`M${560} ${600 + (1 - rise) * 300} q140 -60 260 10 q160 40 260 -20 l40 200 l-560 0Z`} fill="#2a3a2a" opacity={0.85} />
      <circle cx={760} cy={640 + (1 - rise) * 300} r={34} fill="#ffd36b" opacity={0.5} />
      {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={300 + i * 300} cy={420 + (i % 2) * 60} rx={160} ry={40} fill="#ffffff" opacity={0.08} transform={`translate(${f * 0.6} 0)`} />)}
    </g>
  );
  return (
    <Set cam={{ x: 960, y: 540, zoom: 1.0 + rise * 0.05 }} back={back}
      actors={<Dots frame={f} at={-200} dur={1} path={[{ x: 760, y: 640 + (1 - rise) * 300 }, { x: 1100, y: 560 + (1 - rise) * 260 }, { x: 1500, y: 520 + (1 - rise) * 220 }, { x: 1880, y: 520 + (1 - rise) * 200 }]} size={8} shrink={0.3} gap={34} />} />
  );
};

/** The house in the power cut: dark, one oil lamp, the window with the sea line still glowing through it. */
const DarkHouse: React.FC<{ f: number; seaLine?: boolean; snapAt?: number }> = ({ f, seaLine = true, snapAt }) => (
  <g>
    <Room wall="#1e1a24" floor="#14111a" horizon={760} />
    <Window x={1300} y={180} w={420} h={320} sky="#0e1430">
      {seaLine && <Dots frame={f} at={-200} dur={1} path={[{ x: 1310, y: 470 }, { x: 1500, y: 380 }, { x: 1720, y: 300 }]} size={9} shrink={0.4} gap={30} snapAt={snapAt} />}
    </Window>
    <Lamp x={420} y={740} f={f} />
  </g>
);

/** 35-36. The next evening: a power cut, one lamp; at the gate a torch beam, Madhav, holding a phone with your
 *  cousin's video on it. */
const Gate: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#0f1020" />
      <rect y={760} width={1920} height={320} fill="#17151f" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={720 + i * 60} y={440} width={14} height={320} fill="#3a3a48" />)}
      <rect x={700} y={440} width={500} height={18} fill="#3a3a48" />
      <path d={`M1100 560 L${1700 + Math.sin(f / 20) * 40} 380 L${1700 + Math.sin(f / 20) * 40} 760Z`} fill="#ffe7b0" opacity={0.14} />
    </g>
  );
  return (
    <Set cam={push(f, d, { x: 960, y: 600, zoom: 1.1 }, { x: 1040, y: 600, zoom: 1.35 })} back={back}
      actors={
        <>
          <Madhav f={f} x={1000} y={1000} s={2.4} pose={{ ...STAND, armF: [110, 30] }} mouth="flat" brows="sad" lids={0.3} look={{ x: 0.9, y: 0 }} />
          <g transform="translate(1120 640)"><rect x={-26} y={-44} width={52} height={88} rx={8} fill="#0d0e14" /><rect x={-20} y={-36} width={40} height={72} fill="#5a7a9a" /></g>
        </>
      } />
  );
};

/** 37. The dark courtyard: your grandfather, one hand on the wall, pats his kurta pocket three times. */
const Pocket: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const patting = f < 50 && f % 16 < 8;
  const sat = f > at(64) + 30;
  const pose: Pose = sat ? { ...SIT, armF: [70, 40] } : patting ? { ...STAND, armF: [20, 110], armB: [-60, 20] } : { ...STAND, armF: [10, 100], armB: [-60, 20] };
  return (
    <Set cam={push(f, d, { x: 900, y: 600, zoom: 1.4 }, { x: 860, y: 560, zoom: 1.8 })} back={<DarkHouse f={f} />}
      actors={<Grandpa f={f} x={860} y={sat ? 880 : 990} s={2.4} pose={pose} mouth={sat ? "o" : "flat"} brows="worry" eyes={1.2} look={{ x: 0.2, y: 0.7 }} />} />
  );
};

/** 38. Close on you; the sea line glowing behind you through the window. */
const Decide: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const look = f < d * 0.4 ? { x: 0.9, y: -0.3 } : f < d * 0.7 ? { x: -0.9, y: 0.2 } : { x: 0.9, y: -0.3 };
  return (
    <Set cam={push(f, d, { x: 1100, y: 480, zoom: 1.7 }, { x: 1080, y: 470, zoom: 2.1 })} back={<DarkHouse f={f} />}
      actors={<You f={f} x={1060} y={1060} s={2.6} facing={-1} pose={STAND} mouth="flat" brows="worry" look={look} />} />
  );
};

/** 39. You whisper: the sea line snaps out of the window; a new line loops back to his kurta lining, under the
 *  pocket he patted. 0.3 m. */
const Lining: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const go = 26;
  const loop = [{ x: 700, y: 1000 }, { x: 900, y: 1040 }, { x: 1120, y: 960 }, { x: 1040, y: 820 }, { x: 960, y: 760 }];
  return (
    <Set cam={push(f, d, { x: 900, y: 700, zoom: 1.2 }, { x: 960, y: 720, zoom: 1.6 })} back={<DarkHouse f={f} snapAt={6} />}
      actors={
        <>
          <Dots frame={f} at={go} dur={40} path={loop} size={11} shrink={0.2} />
          <Grandpa f={f} x={980} y={900} s={2.2} pose={{ ...SIT, armF: [70, 40] }} mouth="o" brows="worry" look={{ x: -0.8, y: 0.3 }} />
          <You f={f} x={560} y={1010} s={2.3} pose={STAND} mouth="o" brows="raised" look={{ x: 0.9, y: 0.3 }} />
          <DistTag frame={f} at={go + 42} x={1120} y={700} text="0.3 m" size={46} />
        </>
      } />
  );
};

/** 40. You put the tablet in his palm; then the envelope beside it, unopened. */
const Give: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const env = ease(f, d * 0.45, d * 0.7);
  return (
    <Set cam={push(f, d, { x: 900, y: 760, zoom: 1.9 }, { x: 860, y: 700, zoom: 1.6 })} back={<DarkHouse f={f} seaLine={false} />}
      actors={
        <>
          <Grandpa f={f} x={980} y={900} s={2.2} pose={{ ...SIT, armF: [60, 40] }} mouth="flat" brows="sad" lids={0.3} look={{ x: -0.6, y: 0.5 }} />
          <Pill x={860} y={760} r={7} />
          {env > 0 && <Envelope x={640 + env * 180} y={830} s={0.5} />}
          <You f={f} x={600} y={1010} s={2.3} pose={{ ...STAND, armF: [70, 20] }} mouth="flat" brows="sad" look={{ x: 0.8, y: 0.3 }} />
        </>
      } />
  );
};

/** 41. The wordless peak (9 s): the lamp, the two old men side by side, the envelope between them. He reads her line,
 *  slides it to his brother; Madhav holds its corner to the flame. They watch it go. */
const LampPeak: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const read = ease(f, d * 0.05, d * 0.25);
  const slide = ease(f, d * 0.3, d * 0.45);
  const burn = ease(f, d * 0.55, d * 0.95);
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#1a1014" />
      <rect y={720} width={1920} height={360} fill="#2a1a16" />
      <rect x={500} y={700} width={920} height={40} fill="#5a3a2a" />
      <Lamp x={960} y={700} f={f} s={1.4} />
    </g>
  );
  const ex = 860 + slide * 180;
  return (
    <Set cam={push(f, d, { x: 960, y: 560, zoom: 1.25 }, { x: 960, y: 600, zoom: 1.55 })} back={back}
      actors={
        <>
          <Grandpa f={f} x={720} y={900} s={2.2} pose={{ ...SIT, armF: [80 + read * 20, 30] }} mouth="flat" brows="sad" lids={0.45} look={{ x: 0.7, y: 0.6 }} />
          <Madhav f={f} x={1200} y={900} s={2.2} facing={-1} pose={{ ...SIT, armF: [80 + burn * 30, 30] }} mouth="flat" brows="sad" lids={0.4} look={{ x: 0.6, y: 0.5 }} />
          <g opacity={1 - burn}>
            <Envelope x={ex + burn * 60} y={660 - burn * 40} s={0.45} rot={-10 + burn * 30} lit={read > 0.5 && slide < 1} />
          </g>
          {burn > 0 && burn < 1 && <circle cx={ex + 80} cy={640} r={26 * (1 - burn) + 8} fill="#ffb347" opacity={0.6} />}
        </>
      } />
  );
};

export const tulsiScenes: Beat[] = [
  { id: "dig", after: 51, Component: DigStart },
  { id: "found", after: 52, Component: Found },
  { id: "deed-close", after: 54, Component: DeedClose },
  { id: "crooked", after: 56, Component: Crooked },
];
export const roofScenes: Beat[] = [
  { id: "night-room", after: 56, atLine: 57, Component: NightRoom },
  { id: "fort", after: 57, Component: FortLine },
  { id: "sea-line", after: 58, Component: SeaLine },
  { id: "planet", after: 59, Component: Planet },
];
export const choiceScenes: Beat[] = [
  { id: "gate", after: 61, Component: Gate },
  { id: "pocket", after: 62, Component: Pocket },
  { id: "decide", after: 64, Component: Decide },
  { id: "lining", after: 65, Component: Lining },
  { id: "give", after: 66, Component: Give },
  { id: "lamp", after: 67, Component: LampPeak },
];

export const _unused = { walkPose };
