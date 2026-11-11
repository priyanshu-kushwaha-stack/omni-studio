// The treasure beats: the cousin's news, the demolished bungalow, the jeweller (and the stranger's one second), your
// room at night, the dump and its cross-section, and the Konkan sea.
import { SIT, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import type { Beat, Shot } from "../shared";
import { Cousin, DistTag, Dots, Extra, Stranger, You } from "../parts";
import { ease, local, push, Room, Set, Window } from "./kit";

/** A phone held up, showing a small picture. */
const Phone: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-120} width={140} height={240} rx={18} fill="#0d0e14" />
    <rect x={-60} y={-108} width={120} height={216} rx={10} fill="#f7f1e4" />
    {children}
  </g>
);

/** Your room: a bed, a desk, a window. `night` darkens it. */
const Bedroom: React.FC<{ night?: boolean; envelope?: boolean }> = ({ night, envelope }) => (
  <g>
    <Room wall={night ? "#2c3150" : "#e9d7b8"} floor={night ? "#1e2238" : "#a88a6a"} horizon={760} />
    <Window x={1340} y={180} w={360} h={300} sky={night ? "#141a33" : "#bfe0f2"}>
      {night && [0, 1, 2, 3, 4].map((i) => <rect key={i} x={1360 + i * 68} y={380 - (i % 3) * 40} width={40} height={100 + (i % 3) * 40} fill="#232a48" />)}
    </Window>
    <rect x={160} y={600} width={700} height={170} rx={20} fill={night ? "#4a3f6a" : "#7fa0c4"} />
    <rect x={160} y={560} width={180} height={70} rx={24} fill={night ? "#d9d3e6" : "#f3e9d7"} />
    <rect x={1100} y={620} width={460} height={20} fill="#6b4a33" />
    <rect x={1120} y={640} width={20} height={130} fill="#6b4a33" />
    <rect x={1520} y={640} width={20} height={130} fill="#6b4a33" />
    {envelope && <rect x={1280} y={588} width={110} height={32} fill="#c9b27a" stroke={INK} strokeWidth={3} />}
  </g>
);

/** 15. Your cousin shows you the news: a bungalow coming down. */
const News: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const screen = (
    <g>
      <rect x={-50} y={-80} width={100} height={70} fill="#c9a06a" />
      <path d="M-50 -10 L-10 -50 L30 -10Z" fill="#8a5a3a" />
      <rect x={-50} y={0} width={100} height={8} fill="#8a8170" />
      <rect x={-50} y={16} width={70} height={8} fill="#8a8170" />
      <rect x={-50} y={32} width={90} height={8} fill="#8a8170" />
    </g>
  );
  return (
    <Set cam={push(f, d, { x: 960, y: 560, zoom: 1.2 }, { x: 1040, y: 520, zoom: 1.6 })} back={<Bedroom />}
      actors={
        <>
          <Cousin f={f} x={760} y={980} s={2.6} pose={{ ...STAND, armF: [100, 30] }} mouth="open" brows="raised" look={{ x: 0.9, y: 0 }} />
          <Phone x={1010} y={540} s={1.3}>{screen}</Phone>
          <You f={f} x={1300} y={990} s={2.6} facing={-1} pose={STAND} mouth="flat" look={{ x: 0.7, y: -0.2 }} />
        </>
      } />
  );
};

/** 16. The demolition site: rubble, a sleeping digger; the line threads through the bricks; a heavy pouch. */
const Demolition: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const go = 12;
  const dig = at(27) + 10;
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#f3dfb5" />
      <rect x={200} y={300} width={500} height={460} fill="#d9c7a4" stroke="#8a7a64" strokeWidth={8} />
      <path d="M700 300 L900 420 L780 760 L700 760Z" fill="#cbb894" />
      <rect y={760} width={1920} height={320} fill="#b39878" />
      {Array.from({ length: 26 }, (_, i) => (
        <rect key={i} x={600 + ((i * 97) % 900)} y={760 + ((i * 53) % 220)} width={70} height={34} rx={4} fill={["#b5653a", "#a8562e", "#c97a5a"][i % 3]} transform={`rotate(${(i * 37) % 40 - 20} ${640 + ((i * 97) % 900)} ${770 + ((i * 53) % 220)})`} />
      ))}
      {/* the yellow digger, asleep */}
      <g transform="translate(1500 640)">
        <rect x={0} y={0} width={260} height={140} rx={16} fill="#f2c94c" stroke={INK} strokeWidth={6} />
        <rect x={40} y={-90} width={130} height={100} fill="#f2c94c" stroke={INK} strokeWidth={6} />
        <path d="M0 40 L-160 -60 L-220 40" fill="none" stroke="#f2c94c" strokeWidth={34} strokeLinejoin="round" />
        <circle cx={50} cy={150} r={40} fill="#333" /><circle cx={210} cy={150} r={40} fill="#333" />
      </g>
    </g>
  );
  const path = [{ x: 560, y: 1000 }, { x: 760, y: 960 }, { x: 900, y: 1000 }, { x: 1060, y: 930 }];
  const kneel: Pose = { lean: 34, tilt: 16, armF: [90 + 30 * Math.sin(f / 3), 40], armB: [70, 60], legB: [80, -120], legF: [70, -110], drop: 70 };
  return (
    <Set cam={push(f, d, { x: 900, y: 640, zoom: 1.15 }, { x: 1000, y: 800, zoom: 1.6 })} back={back}
      actors={
        <>
          <Dots frame={f} at={go} dur={30} path={path} size={11} shrink={0.3} fadeAt={dig + 30} />
          <DistTag frame={f} at={go + 32} until={dig + 30} x={1100} y={860} text="2.3 m" size={44} />
          {f > dig + 20 && <g transform="translate(1060 930)"><path d="M-30 0 Q0 -50 30 0 Q0 20 -30 0Z" fill="#8a6a4a" stroke={INK} strokeWidth={4} /></g>}
          <You f={f} x={f > dig ? 980 : 500} y={1030} s={2.3} pose={f > dig ? kneel : STAND} mouth={f > dig + 20 ? "smile" : "flat"} look={{ x: 0.8, y: 0.6 }} />
        </>
      } />
  );
};

/** 17. The jeweller: coins on velvet; he pushes a form across instead of money. On the bench by the door, for one
 *  second, a crimson head in a long dark coat watches you count; when you look up, the bench is empty. */
const Jeweller: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const form = ease(f, at(29), at(29) + 20);
  const strangerFrom = 20, strangerTo = 50;
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#d9b06a" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={140 + i * 420} y={140} width={360} height={260} fill="#8a5a3a" stroke="#3b2a1f" strokeWidth={8} />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={160 + i * 420} y={160} width={320} height={220} fill="#f2c94c" opacity={0.25} />)}
      <rect x={120} y={500} width={300} height={40} fill="#6b4a33" />
      <rect y={720} width={1920} height={360} fill="#6b4a33" />
      <rect x={500} y={660} width={1100} height={80} fill="#3b2a1f" />
      <rect x={640} y={640} width={700} height={30} fill="#7a1f3a" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={700 + i * 90} cy={650} r={20} fill="#c9a33a" stroke={INK} strokeWidth={3} />)}
    </g>
  );
  return (
    <Set cam={push(f, d, { x: 960, y: 560, zoom: 1.1 }, { x: 1000, y: 600, zoom: 1.35 })} back={back}
      actors={
        <>
          <Extra i={4} f={f} x={1260} y={640} s={2.0} facing={-1} pose={{ ...STAND, armF: [80, 30] }} mouth="flat" brows="flat" lids={0.3} look={{ x: 0.6, y: 0.4 }} />
          {form > 0 && <g transform={`translate(${1150 - form * 260} 600) rotate(-6)`}><rect width={120} height={150} fill={PAPER} stroke={INK} strokeWidth={4} />{[0, 1, 2, 3].map((i) => <line key={i} x1={14} y1={30 + i * 26} x2={100} y2={30 + i * 26} stroke="#8a8170" strokeWidth={3} />)}</g>}
          {f >= strangerFrom && f < strangerTo && <Stranger f={f} x={270} y={680} s={1.7} pose={SIT} look={{ x: 0.9, y: 0.2 }} />}
          <You f={f} x={620} y={1010} s={2.7} pose={{ ...STAND, armF: [70, 30] }} mouth={form > 0.5 ? "frown" : "smile"} brows={form > 0.5 ? "worry" : "none"}
            look={f > strangerTo - 10 && f < strangerTo + 20 ? { x: -0.9, y: 0 } : { x: 0.8, y: 0.2 }} />
        </>
      } />
  );
};

/** 19. Night, your room; your cousin on the bed reading out from a phone. */
const BitcoinNews: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  return (
    <Set cam={push(f, d, { x: 900, y: 600, zoom: 1.15 }, { x: 760, y: 600, zoom: 1.45 })} back={<Bedroom night />}
      actors={
        <>
          <Cousin f={f} x={520} y={760} s={2.2} pose={{ ...SIT, armF: [100, 40] }} mouth={Math.floor(f / 8) % 2 ? "open" : "smile"} brows="raised" look={{ x: 0.5, y: 0.4 }} />
          <Phone x={720} y={520} s={0.7}><circle r={30} fill={MUSTARD} /><text y={12} textAnchor="middle" fontSize={34} fontWeight={800} fill={INK}>B</text></Phone>
          <You f={f} x={1180} y={990} s={2.5} facing={-1} pose={STAND} mouth="o" brows="raised" look={{ x: 0.9, y: 0 }} />
        </>
      } />
  );
};

/** The dump at dawn: hills of rubbish, gulls, a bulldozer. */
const DumpTop: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={1920} height={1080} fill="#f6d2a6" />
    <circle cx={1500} cy={300} r={90} fill="#ffe2a8" />
    {[[200, 700, 520], [760, 640, 640], [1400, 720, 560]].map(([x, y, w], i) => (
      <path key={i} d={`M${x - w / 2} 1080 Q${x} ${y - 260} ${x + w / 2} 1080Z`} fill={["#8a7a6a", "#7a6a5a", "#958575"][i]} />
    ))}
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={(i * 173) % 1900} y={760 + ((i * 61) % 260)} width={30 + (i % 4) * 10} height={18} fill={["#c94f4f", "#7fa0c4", "#d9c26a", "#ffffff", "#5a8a3a"][i % 5]} transform={`rotate(${i * 23})`} />)}
    {[0, 1, 2].map((i) => {
      const x = (300 + i * 500 + f * (2 + i)) % 2000;
      const y = 200 + i * 60 + Math.sin(f / 10 + i) * 20;
      return <path key={i} d={`M${x - 30} ${y} Q${x - 15} ${y - 20} ${x} ${y} Q${x + 15} ${y - 20} ${x + 30} ${y}`} fill="none" stroke={INK} strokeWidth={5} />;
    })}
    <rect y={900} width={1920} height={180} fill="#6a5a4a" />
  </g>
);

const TROWEL = <g><rect x={-4} y={-30} width={8} height={30} fill="#6b4a33" /><path d="M-12 0 L12 0 L0 30Z" fill="#9aa0a8" stroke={INK} strokeWidth={2} /></g>;

/** 20. You stand at the edge with a garden trowel; the line goes two steps forward, then straight down. */
const Dump: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const go = Math.max(10, at(37) - 4);
  return (
    <Set cam={push(f, d, { x: 960, y: 600, zoom: 1.1 }, { x: 800, y: 760, zoom: 1.5 })} back={<DumpTop f={f} />}
      actors={
        <>
          <Dots frame={f} at={go} dur={36} path={[{ x: 700, y: 1000 }, { x: 860, y: 990 }, { x: 900, y: 1060 }, { x: 905, y: 1200 }]} size={12} shrink={0.2} />
          <You f={f} x={560} y={1000} s={2.3} pose={{ ...STAND, armF: [40, 40] }} held={TROWEL} mouth={f > go + 30 ? "o" : "flat"} brows={f > go + 30 ? "raised" : "none"} look={{ x: 0.8, y: 0.8 }} />
        </>
      } />
  );
};

/** 21. The picture only this premise can show: the camera drops through a paper cross-section of the dump, layer
 *  under layer, the teal line falling through all of it to a small glowing drive; you tiny on top with a trowel. */
const CrossSection: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const LAYERS = ["#8a7a6a", "#a08a6a", "#6a5f55", "#b59a7a", "#7a6a5a", "#5a5048", "#958070", "#4a423c"];
  const top = 200;
  const lh = 180;
  const bottom = top + LAYERS.length * lh;
  const fall = ease(f, 10, d - 20);
  const metres = Math.round(fall * 11);
  const back = (
    <g>
      <rect width={1920} height={bottom + 400} fill="#f6d2a6" />
      {LAYERS.map((c, i) => (
        <g key={i}>
          <rect x={0} y={top + i * lh} width={1920} height={lh} fill={c} />
          <path d={`M0 ${top + i * lh} ${Array.from({ length: 13 }, (_, k) => `L${k * 160} ${top + i * lh + ((k * 37 + i * 11) % 24) - 12}`).join(" ")} L1920 ${top + i * lh}`} fill="none" stroke="#00000033" strokeWidth={6} />
        </g>
      ))}
      {/* what's down there: a mattress, a scooter, a television, a cricket bat, newspapers */}
      <rect x={300} y={top + lh * 1 + 40} width={360} height={80} rx={20} fill="#d9c7e6" stroke={INK} strokeWidth={5} />
      <g transform={`translate(1300 ${top + lh * 2 + 60})`}><rect x={-80} y={-30} width={160} height={50} rx={14} fill="#c94f4f" stroke={INK} strokeWidth={5} /><circle cx={-60} cy={30} r={26} fill="#333" /><circle cx={60} cy={30} r={26} fill="#333" /></g>
      <g transform={`translate(560 ${top + lh * 3 + 50})`}><rect x={-90} y={-60} width={180} height={130} rx={10} fill="#3a3a44" stroke={INK} strokeWidth={5} /><rect x={-74} y={-46} width={148} height={100} fill="#6a7a8a" /></g>
      <rect x={1100} y={top + lh * 4 + 70} width={240} height={26} rx={10} fill="#d9b06a" stroke={INK} strokeWidth={4} transform={`rotate(-12 1220 ${top + lh * 4 + 80})`} />
      {[0, 1, 2].map((i) => <rect key={i} x={300 + i * 60} y={top + lh * 5 + 60 + i * 12} width={120} height={70} fill={PAPER} stroke="#8a8170" strokeWidth={3} transform={`rotate(${i * 9 - 9} 360 ${top + lh * 5 + 90})`} />)}
      {/* the drive at the bottom, glowing */}
      <circle cx={980} cy={bottom - 90} r={80} fill="#5ff0dc" opacity={0.3} />
      <rect x={930} y={bottom - 120} width={100} height={60} rx={8} fill="#2a2e38" stroke="#5ff0dc" strokeWidth={6} />
    </g>
  );
  const camY = 540 + fall * (bottom - 540 - 200);
  return (
    <Set cam={{ x: 960, y: camY, zoom: 1.0 + fall * 0.15 }} back={back}
      actors={
        <>
          <You f={f} x={900} y={top + 4} s={0.6} pose={STAND} held={TROWEL} look={{ x: 0.3, y: 0.9 }} />
          <Dots frame={f} at={0} dur={Math.max(30, d - 30)} path={[{ x: 975, y: top + 10 }, { x: 990, y: top + lh * 3 }, { x: 960, y: top + lh * 6 }, { x: 980, y: bottom - 100 }]} size={13} shrink={0} gap={60} />
          <DistTag frame={f} at={10} x={1300} y={camY - 260} text={`${metres} m`} size={60} />
        </>
      } />
  );
};

/** 22. Back on top: you look at the trowel, then at the hill. */
const TrowelLook: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const look = f > d / 2 ? { x: 0.8, y: -0.5 } : { x: 0.4, y: 0.6 };
  return (
    <Set cam={push(f, d, { x: 640, y: 640, zoom: 1.8 }, { x: 700, y: 600, zoom: 1.5 })} back={<DumpTop f={f} />}
      actors={<You f={f} x={560} y={1000} s={2.3} pose={{ ...STAND, armF: [60, 60] }} held={TROWEL} mouth="flat" brows="flat" lids={0.35} look={look} />} />
  );
};

/** 23. The Konkan coast at night: black water, a lighthouse sweep; the line runs into the sea; 41 m, down. */
const Sea: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const go = 10;
  const beam = ((f / 90) % 1) * 2 - 1;
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#0e1430" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 211) % 1920} cy={(i * 97) % 420} r={2 + (i % 3)} fill="#e9f3ff" opacity={0.6} />)}
      <rect x={1640} y={300} width={60} height={320} fill="#d9dde3" />
      <rect x={1630} y={270} width={80} height={50} fill="#ffe7b0" />
      <path d={`M1670 290 L${1670 - 2200} ${290 + beam * 500} L${1670 - 2200} ${290 + beam * 500 + 160}Z`} fill="#ffe7b0" opacity={0.12} />
      <rect y={560} width={1920} height={520} fill="#0a1a2e" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M0 ${600 + i * 60} ${Array.from({ length: 13 }, (_, k) => `Q${k * 160 + 80} ${600 + i * 60 + Math.sin(f / 12 + k + i) * 10} ${(k + 1) * 160} ${600 + i * 60}`).join(" ")}`} fill="none" stroke="#2c4a6a" strokeWidth={4} />)}
      <path d="M0 880 Q600 820 1200 900 L1200 1080 L0 1080Z" fill="#c9b48a" />
    </g>
  );
  return (
    <Set cam={push(f, d, { x: 700, y: 760, zoom: 1.35 }, { x: 960, y: 640, zoom: 1.05 })} back={back}
      actors={
        <>
          <Dots frame={f} at={go} dur={40} path={[{ x: 420, y: 980 }, { x: 760, y: 920 }, { x: 1100, y: 800 }, { x: 1300, y: 700 }]} size={12} shrink={0.5} />
          <You f={f} x={320} y={990} s={2.0} pose={STAND} mouth="o" brows="raised" look={{ x: 0.9, y: -0.1 }} />
          <DistTag frame={f} at={go + 42} x={1360} y={620} text={`${Math.round(ease(f, go + 42, go + 90) * 41)} m ↓`} size={56} />
        </>
      } />
  );
};

export const treasureScenes: Beat[] = [
  { id: "news", after: 25, Component: News },
  { id: "demolition", after: 26, Component: Demolition },
  { id: "jeweller", after: 28, Component: Jeweller },
];
export const fortuneScenes: Beat[] = [
  { id: "bitcoin-news", after: 33, Component: BitcoinNews },
  { id: "dump", after: 35, Component: Dump },
  { id: "cross-section", after: 37, Component: CrossSection },
  { id: "trowel", after: 37, atLine: 38, Component: TrowelLook },
  { id: "sea", after: 40, Component: Sea },
];

export const _unused = { walkPose, CRIMSON };
