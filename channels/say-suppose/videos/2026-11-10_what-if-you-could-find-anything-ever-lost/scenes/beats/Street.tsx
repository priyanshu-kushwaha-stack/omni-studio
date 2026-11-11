// Outside: the lane with the stolen bicycle, the courtyard drain and the neem tree with the crow's nest, the jewellery
// bazaar with its grates and the drain-sifter, the hearing aid in the mango crate, Madhav, and the receipt in the lane.
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { INK, PAPER } from "@whatif/kit/theme";
import type { Beat, Shot } from "../shared";
import { Bubble, Cousin, DistTag, Dots, Extra, Grate, Madhav, Mango, Mother, Sifter, You } from "../parts";
import { ease, local, push, Set } from "./kit";

/** A lane of shopfronts or house fronts at different depths. */
const Lane: React.FC<{ shops?: boolean; wet?: boolean }> = ({ shops, wet }) => (
  <g>
    <rect width={1920} height={1080} fill={shops ? "#e9d3a8" : "#d7c7a4"} />
    {Array.from({ length: 6 }, (_, i) => {
      const x = i * 340 - 40;
      const h = 420 + (i % 3) * 60;
      const col = ["#c97a5a", "#7fa0c4", "#d9c26a", "#a8c97f", "#c9a0d6", "#e6a0a0"][i];
      return (
        <g key={i}>
          <rect x={x} y={760 - h} width={320} height={h} fill={col} stroke="#3b2a1f" strokeWidth={6} />
          {shops ? (
            <>
              <rect x={x + 20} y={760 - h * 0.55} width={280} height={h * 0.55 - 20} fill="#3b2a1f" />
              <rect x={x + 20} y={760 - h * 0.55} width={280} height={60} fill="#8a8f99" />
              {[0, 1, 2, 3].map((k) => <rect key={k} x={x + 40 + k * 64} y={760 - h * 0.3} width={40} height={30} fill="#f2c94c" opacity={0.7} />)}
            </>
          ) : (
            <rect x={x + 110} y={760 - 220} width={100} height={200} fill="#6b4a33" />
          )}
          <rect x={x + 40} y={760 - h + 40} width={80} height={70} fill="#f6e3b5" opacity={0.8} />
        </g>
      );
    })}
    <rect y={760} width={1920} height={320} fill={wet ? "#7d7a74" : "#b8a98e"} />
    {wet && [300, 900, 1500].map((x) => <ellipse key={x} cx={x} cy={900} rx={160} ry={24} fill="#9fb7c4" opacity={0.5} />)}
  </g>
);

/** 8. The lane: the cut lock in the dust; you whisper; nothing. */
const Bicycle: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const kick = ease(f, at(15) + 20, at(15) + 40);
  return (
    <Set cam={push(f, d, { x: 960, y: 640, zoom: 1.2 }, { x: 1040, y: 700, zoom: 1.45 })} back={<Lane />}
      actors={
        <>
          {/* the empty stand and the cut lock */}
          <rect x={1060} y={860} width={240} height={14} fill="#555" />
          {[1080, 1160, 1240].map((x) => <path key={x} d={`M${x} 860 q20 -60 40 0`} fill="none" stroke="#555" strokeWidth={8} />)}
          <g transform={`translate(${1180 + kick * 380} ${940 - Math.sin(kick * Math.PI) * 60}) rotate(${kick * 400})`}>
            <rect x={-26} y={-18} width={52} height={40} rx={8} fill="#c9a33a" stroke={INK} strokeWidth={4} />
            <path d="M-16 -18 q16 -36 32 0" fill="none" stroke="#999" strokeWidth={7} />
          </g>
          <Cousin f={f} x={1420} y={980} s={2.3} facing={-1} pose={{ ...STAND, armF: [70 + kick * 40, 20], legF: [kick * 50 + 6, -4] }} mouth="frown" brows="angry" look={{ x: 0.7, y: 0.5 }} />
          <You f={f} x={720} y={990} s={2.4} pose={STAND} mouth="flat" brows="flat" lids={0.3} look={{ x: 0.9, y: 0.6 }} />
        </>
      } />
  );
};

/** The courtyard: the back wall, the drain, the neem tree with the crow's nest up high. */
const Courtyard: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={1920} height={1080} fill="#f1c99a" />
    <rect y={0} width={1920} height={760} fill="#d8b48a" />
    <rect x={0} y={680} width={1920} height={80} fill="#b89470" />
    <rect y={760} width={1920} height={320} fill="#a58c6a" />
    {/* the drain in the corner */}
    <rect x={380} y={880} width={180} height={40} fill="#4a4036" stroke={INK} strokeWidth={4} />
    {/* the neem: trunk and leaves */}
    <path d="M1300 1080 L1330 520 L1290 260 L1350 120" fill="none" stroke="#6b4a33" strokeWidth={70} strokeLinecap="round" />
    {[[1180, 220], [1420, 180], [1300, 90], [1480, 330], [1150, 380], [1360, 300]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={190} ry={110} fill={["#5a8a3a", "#4f7f34", "#6a9a48"][i % 3]} transform={`rotate(${Math.sin(f / 40 + i) * 3} ${x} ${y})`} />
    ))}
    {/* the crow's nest */}
    <ellipse cx={1340} cy={270} rx={80} ry={34} fill="#7a5a3a" stroke={INK} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={1270 + i * 30} y1={250} x2={1290 + i * 30} y2={290} stroke="#4a3220" strokeWidth={5} />)}
  </g>
);

const Crow: React.FC<{ x: number; y: number; f: number; tilt?: number }> = ({ x, y, f, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt + Math.sin(f / 15) * 4})`}>
    <ellipse rx={46} ry={30} fill="#23252b" />
    <circle cx={34} cy={-26} r={22} fill="#2c2f36" />
    <path d="M52 -28 L80 -22 L52 -16Z" fill="#555" />
    <circle cx={40} cy={-30} r={5} fill="#f2f2f2" />
    <path d="M-40 0 L-80 -14 L-74 14Z" fill="#23252b" />
  </g>
);

/** 9. The courtyard drain; your mother points; the line shoots up the neem into the crow's nest. 9.0 m. */
const Earring: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const go = Math.max(10, at(17) - 10);
  const path = [{ x: 470, y: 900 }, { x: 900, y: 880 }, { x: 1250, y: 760 }, { x: 1320, y: 520 }, { x: 1320, y: 300 }];
  return (
    <Set cam={push(f, d, { x: 760, y: 700, zoom: 1.3 }, { x: 1200, y: 420, zoom: 1.35 })} back={<Courtyard f={f} />}
      actors={
        <>
          <Dots frame={f} at={go} dur={40} path={path} size={12} shrink={0.2} />
          <Crow x={1420} y={240} f={f} />
          <Mother f={f} x={260} y={990} s={2.3} pose={{ ...STAND, armF: [70, 10] }} mouth="flat" brows="flat" look={{ x: 0.8, y: 0.5 }} seed={2} />
          <You f={f} x={700} y={1000} s={2.4} pose={STAND} mouth={f > go + 30 ? "o" : "flat"} brows={f > go + 30 ? "raised" : "none"} look={f > go + 30 ? { x: 0.7, y: -0.9 } : { x: -0.5, y: 0.6 }} />
          <DistTag frame={f} at={go + 42} x={1150} y={460} text="9.0 m" />
        </>
      } />
  );
};

/** 10. On a ladder, arm in the nest; the crow unimpressed; out come her earring and three strangers'. */
const Nest: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const out = ease(f, 20, 45);
  const reach: Pose = { ...STAND, armF: [160 - out * 40, 10] };
  return (
    <Set cam={push(f, d, { x: 1300, y: 360, zoom: 2.0 }, { x: 1320, y: 330, zoom: 2.3 })} back={<Courtyard f={f} />}
      actors={
        <>
          {/* the ladder */}
          <line x1={1180} y1={1080} x2={1240} y2={300} stroke="#8a6a4a" strokeWidth={16} />
          <line x1={1260} y1={1080} x2={1320} y2={300} stroke="#8a6a4a" strokeWidth={16} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1={1180 + i * 7.5} y1={1000 - i * 90} x2={1260 + i * 7.5} y2={1000 - i * 90} stroke="#8a6a4a" strokeWidth={10} />)}
          <You f={f} x={1225} y={760} s={2.0} pose={reach} mouth={out > 0.5 ? "smile" : "flat"} brows={out > 0.5 ? "raised" : "none"} look={{ x: 0.6, y: -0.6 }} />
          <Crow x={1460} y={230} f={f} tilt={f > 50 ? 18 : 0} />
          {out > 0.6 && [0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${1300 + i * 26} ${300 + (i % 2) * 14})`}>
              <circle r={11} fill="none" stroke={i === 0 ? "#f2d06a" : "#c9c9c9"} strokeWidth={5} />
              <circle cy={-11} r={5} fill={["#d8344f", "#7fc29b", "#9fc0e0", "#c9a0d6"][i]} />
            </g>
          ))}
        </>
      } />
  );
};

/** 11. The bazaar after rain: you lift a nose-pin from a grate; at the next grate an old man is already sifting. */
const Bazaar: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const go = Math.max(6, at(19) - 4);
  return (
    <Set cam={push(f, d, { x: 760, y: 700, zoom: 1.35 }, { x: 1100, y: 720, zoom: 1.3 })} back={<Lane shops wet />}
      actors={
        <>
          <Grate x={560} y={900} w={220} h={60} />
          <Grate x={1180} y={900} w={220} h={60} />
          <Dots frame={f} at={go} dur={16} path={[{ x: 560, y: 1010 }, { x: 640, y: 960 }, { x: 670, y: 930 }]} size={10} shrink={0.3} gap={30} fadeAt={go + 60} />
          <DistTag frame={f} at={go + 18} until={go + 90} x={760} y={830} text="0.6 m" size={44} />
          <You f={f} x={500} y={1030} s={2.2} pose={{ lean: 30, tilt: 18, armF: [80, 30], armB: [40, 60], legB: [70, -120], legF: [60, -110], drop: 70 }}
            mouth={f > go + 60 ? "smile" : "flat"} look={{ x: 0.8, y: 0.7 }} />
          <Sifter f={f} x={1180} y={1010} s={1.7} facing={1} swirl={f / 8} />
        </>
      } />
  );
};

/** 12. The old man looks at your one nose-pin, then at his pan full of glints, and grins. */
const Beginner: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  return (
    <Set cam={push(f, d, { x: 1260, y: 840, zoom: 2.4 }, { x: 1200, y: 820, zoom: 2.0 })} back={<Lane shops wet />}
      actors={
        <>
          <Grate x={1180} y={900} w={220} h={60} />
          <Sifter f={f} x={1180} y={1010} s={1.7} facing={1} swirl={f / 6} mouth={f > 24 ? "smile" : "flat"} brows={f > 24 ? "raised" : "none"} look={{ x: -0.8, y: 0 }} />
          <Bubble frame={f} at={30} until={d} x={1220} y={830} text="Beginner." size={34} side="left" />
        </>
      } />
  );
};

/** 13. An old man asks the lane for his hearing aid; the line runs forty metres into a mango crate; the man who comes
 *  for it has the folded photograph's face. */
const HearingAid: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const go = 20;
  const path = [{ x: 420, y: 1000 }, { x: 800, y: 960 }, { x: 1200, y: 990 }, { x: 1560, y: 930 }];
  const arrive = at(23);
  return (
    <Set cam={push(f, d, { x: 900, y: 660, zoom: 1.1 }, { x: 1380, y: 700, zoom: 1.5 })} back={<Lane shops />}
      actors={
        <>
          <Dots frame={f} at={go} dur={50} path={path} size={11} shrink={0.4} />
          {/* the mango crate */}
          <rect x={1480} y={880} width={200} height={110} fill="#c9a06a" stroke={INK} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <Mango key={i} x={1510 + i * 44} y={880} r={18} rot={i * 20} />)}
          <You f={f} x={380} y={1010} s={2.2} pose={STAND} mouth="flat" look={{ x: 0.9, y: 0.4 }} />
          <Madhav f={f} x={arrive > 0 && f > arrive ? 1720 - ease(f, arrive, arrive + 40) * 120 : 2100} y={1010} s={2.3} facing={-1}
            pose={f < arrive + 40 ? walkPose(f / 7) : STAND} mouth="flat" look={{ x: 0.6, y: 0 }} />
          <DistTag frame={f} at={go + 52} x={1580} y={780} text="40 m" size={44} />
        </>
      } />
  );
};

/** 14. He takes it, looks at you a beat too long, and presses a mango into your hands. */
const MadhavMango: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const give = ease(f, 30, 60);
  const walk = ease(f, d - 70, d - 10);
  return (
    <Set cam={push(f, d, { x: 960, y: 560, zoom: 1.6 }, { x: 900, y: 600, zoom: 1.4 })} back={<Lane shops />}
      actors={
        <>
          <Madhav f={f} x={1180 + walk * 700} y={1000} s={2.6} facing={-1} pose={walk > 0 ? walkPose(f / 7) : { ...STAND, armF: [70 - give * 10, 20] }}
            mouth="smile" lids={0.3} look={{ x: 0.8, y: 0.1 }} />
          {give < 1 && <Mango x={1060 - give * 120} y={720} r={22} />}
          <You f={f} x={760} y={1000} s={2.6} pose={{ ...STAND, armF: [70, 30] }} held={give >= 1 ? <Mango x={0} y={0} r={10} /> : undefined}
            mouth="o" brows="raised" look={{ x: 0.9, y: -0.1 }} />
        </>
      } />
  );
};

/** 18. The lane: you hold a receipt; across the lane the dead owner's family argues at the jeweller's door. */
const Receipt: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const flutter = Math.sin(f / 4) * 6;
  const paper = (
    <g transform={`rotate(${flutter})`}>
      <rect x={-6} y={-40} width={36} height={50} fill={PAPER} stroke={INK} strokeWidth={2} />
      {[0, 1, 2].map((i) => <line key={i} x1={0} y1={-30 + i * 12} x2={24} y2={-30 + i * 12} stroke="#8a8170" strokeWidth={2} />)}
    </g>
  );
  return (
    <Set cam={push(f, d, { x: 900, y: 600, zoom: 1.2 }, { x: 820, y: 560, zoom: 1.45 })} back={<Lane shops />}
      actors={
        <>
          {[0, 1, 2].map((i) => (
            <Extra key={i} i={i + 3} f={f} x={1300 + i * 150} y={980} s={2.0} facing={-1}
              pose={{ ...STAND, armF: [90 + 30 * Math.sin(f / 5 + i), 20] }} mouth="open" brows="angry" />
          ))}
          <You f={f} x={640} y={1000} s={2.5} pose={{ ...STAND, armF: [70, 30] }} held={paper} mouth="flat" brows="flat" lids={0.4} look={{ x: 0.6, y: 0.5 }} />
        </>
      } />
  );
};

export const streetScenes: Beat[] = [
  { id: "bicycle", after: 13, atLine: 14, Component: Bicycle },
  { id: "earring", after: 15, Component: Earring },
  { id: "nest", after: 17, Component: Nest },
  { id: "bazaar", after: 18, Component: Bazaar },
  { id: "beginner", after: 21, Component: Beginner },
  { id: "hearing-aid", after: 21, atLine: 22, Component: HearingAid },
  { id: "madhav", after: 23, Component: MadhavMango },
];
export const receiptScenes: Beat[] = [{ id: "receipt", after: 32, Component: Receipt }];
