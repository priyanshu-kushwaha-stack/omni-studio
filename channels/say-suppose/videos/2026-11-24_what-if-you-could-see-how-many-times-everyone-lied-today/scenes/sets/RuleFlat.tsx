// The flat beyond the kitchen, for The Rule: the hallway with the front door (coat hooks, two frames, a runner), and
// three inserts of you looking for your own counter: the bathroom mirror, the phone camera, the kettle's bent silver.
// Drawn for REF in paper layers; no library set has a hallway or a bathroom. No AI images.
import { Figure } from "@whatif/kit/rig/Figure";
import { Deep, Floor, setLook, Window } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { HERO } from "../shared";

export const HALL = { floor: 970, door: { x: 1480, w: 300, top: 260 }, latch: { x: 1505, y: 640 } };

const HallBack: React.FC<{ cam: Camera; mood: MoodName; open: number }> = ({ cam, mood, open }) => {
  const d = HALL.door;
  return (
    <>
      <Deep cam={cam} depth={0.9} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill="#e7d3b4" />
        <rect x={-1400} y={HALL.floor - 130} width={4800} height={14} fill="#c9a87e" />
        {[220, 640].map((x, i) => (
          <g key={x}>
            <rect x={x} y={330} width={200} height={150} rx={6} fill={["#9fc0e0", "#e6a0a0"][i]} stroke="#7a5a40" strokeWidth={12} />
            <circle cx={x + 60} cy={390} r={26} fill={["#f2b632", "#7fc29b"][i]} />
            <path d={`M${x + 10} ${470} L${x + 90} ${410} L${x + 190} ${470}Z`} fill={["#5b8a6a", "#b58fc7"][i]} />
          </g>
        ))}
        {/* coat hooks with a coat and a bag */}
        <rect x={1000} y={360} width={300} height={16} rx={6} fill="#8a5c3b" />
        <path d="M1050 376 q-30 120 -10 260 h90 q20 -140 -10 -260Z" fill="#4a6a8a" stroke={INK} strokeWidth={4} />
        <path d="M1200 376 l-30 160 h80 l-20 -160Z" fill="#c96f2d" stroke={INK} strokeWidth={4} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={HALL.floor - 116} fill="#a8774e" gap={180} slant={-70} opacity={0.08} />
        <rect x={200} y={HALL.floor - 60} width={1200} height={50} rx={8} fill="#b8323e" opacity={0.85} />
        {/* the front door: frame, the bright outside when it opens, the door leaf swinging in */}
        <rect x={d.x - 20} y={d.top - 20} width={d.w + 40} height={HALL.floor - 116 - d.top + 20} fill="#7a5a40" />
        <rect x={d.x} y={d.top} width={d.w} height={HALL.floor - 116 - d.top} fill="#fff4cf" />
        <rect x={d.x + d.w * open} y={d.top} width={d.w * (1 - open)} height={HALL.floor - 116 - d.top} fill="#2f6f7a" stroke={INK} strokeWidth={5} />
        {open < 0.6 && (
          <g>
            <rect x={d.x + d.w * open + 30} y={d.top + 40} width={Math.max(0, d.w * (1 - open) - 60)} height={160} rx={8} fill="none" stroke="#24575f" strokeWidth={6} />
            <rect x={HALL.latch.x - 10 + d.w * open} y={HALL.latch.y - 30} width={20} height={60} rx={6} fill="#d9c26a" stroke={INK} strokeWidth={3} />
          </g>
        )}
        {open > 0 && <rect x={d.x} y={d.top} width={d.w * open} height={HALL.floor - 116 - d.top} fill="#fffbe8" opacity={0.6} />}
      </Deep>
    </>
  );
};

/** The hallway on the Stage; `open` 0..1 swings the front door. */
export const HallScene: React.FC<{ cam: Camera; mood?: MoodName; open?: number; actors?: React.ReactNode }> = ({ cam, mood = "morning", open = 0, actors }) => (
  <LookContext.Provider value={setLook([{ x: HALL.door.x + 150, y: 560, r: 600 * open + 1, color: "#fff4cf", strength: 0.6 * open, moods: ["morning"] }], mood, cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<HallBack cam={cam} mood={mood} open={open} />} actors={actors} />
  </LookContext.Provider>
);

/** You, chest up, in a frame (a reflection): looking up at the empty air over your own head. */
const Reflection: React.FC<{ x: number; y: number; scale: number; look: { x: number; y: number }; time: number; nose?: number; stretch?: number }> = ({
  x, y, scale, look, time, nose = 0, stretch = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${stretch} 1)`}>
    <Figure x={0} y={0} scale={scale} head={HERO.head} scarf={HERO.scarf} tuft time={time} look={look} brows="raised" lids={0} mouth="flat" eyes={1.05} />
    {nose > 0 && <ellipse cx={8 * scale} cy={-250 * scale} rx={9 * scale * nose} ry={7 * scale * nose} fill="#e0a23a" stroke={INK} strokeWidth={2.5 * scale} />}
  </g>
);

/** The bathroom mirror: tiles, the basin, your reflection, and nothing over your head. */
export const MirrorScene: React.FC<{ cam: Camera; frame: number; look: { x: number; y: number }; glint?: number }> = ({ cam, frame, look, glint = 0 }) => (
  <LookContext.Provider value={setLook([], "morning", cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <Deep cam={cam} depth={1}>
          <rect x={-1400} y={-800} width={4800} height={2400} fill="#d6ecea" />
          {Array.from({ length: 160 }, (_, i) => <rect key={i} x={-400 + (i % 20) * 140} y={-100 + Math.floor(i / 20) * 140} width={136} height={136} fill={i % 2 ? "#cfe6e3" : "#e0f1ef"} />)}
          <rect x={600} y={120} width={720} height={720} rx={30} fill="#9fb8c0" stroke="#7a8a90" strokeWidth={22} />
          <clipPath id="mirror-clip"><rect x={611} y={131} width={698} height={698} rx={22} /></clipPath>
          <g clipPath="url(#mirror-clip)">
            <rect x={600} y={120} width={720} height={720} fill="#cfe2e6" />
            <rect x={600} y={120} width={720} height={720} fill="#e8d5b5" opacity={0.5} />
            <Reflection x={960} y={1300} scale={2.6} look={look} time={frame} />
            {glint > 0 && [-10, 17].map((dx) => <circle key={dx} cx={960 + dx * 2.6 + look.x * 12 * 2.6} cy={1300 - 264 * 2.6 - 5 * 2.6} r={22 * glint} fill="#ffcf5a" opacity={0.45 * glint} />)}
            <path d="M640 200 L760 140 M660 300 L860 160" stroke="#fff" strokeWidth={18} opacity={0.35} />
          </g>
          <rect x={560} y={880} width={800} height={60} rx={20} fill={PAPER} stroke={INK} strokeWidth={6} />
        </Deep>
      }
      actors={<g />} />
  </LookContext.Provider>
);

/** Your phone in your hand, the front camera on: your face, nothing over it; the shutter button. */
export const PhoneScene: React.FC<{ cam: Camera; frame: number; look: { x: number; y: number } }> = ({ cam, frame, look }) => (
  <LookContext.Provider value={setLook([], "morning", cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <Deep cam={cam} depth={1}>
          <rect x={-1400} y={-800} width={4800} height={2400} fill="#e7d3b4" />
          <Window id="rule-phone" mood="morning" x={120} y={140} w={420} h={360} frame="#e8e2d2" />
          {/* the hand and the phone */}
          <path d="M760 1200 Q740 900 800 820 L1120 820 Q1180 900 1160 1200Z" fill={HERO.head} stroke={INK} strokeWidth={6} />
          <rect x={720} y={80} width={480} height={900} rx={56} fill="#23252b" />
          <clipPath id="phone-clip"><rect x={744} y={110} width={432} height={840} rx={40} /></clipPath>
          <g clipPath="url(#phone-clip)">
            <rect x={744} y={110} width={432} height={840} fill="#cfe2e6" />
            <Reflection x={960} y={1220} scale={1.9} look={look} time={frame} />
            <rect x={744} y={830} width={432} height={120} fill="#000" opacity={0.35} />
            <circle cx={960} cy={890} r={40} fill="#fff" stroke="#ccc" strokeWidth={6} />
            <text x={960} y={160} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#fff" opacity={0.8}>PHOTO</text>
          </g>
          <circle cx={960} cy={128} r={8} fill="#000" />
          <path d="M700 520 q-40 -20 -50 40 q20 40 70 30Z M1220 560 q40 -20 50 40 q-20 40 -70 30Z" fill={HERO.head} stroke={INK} strokeWidth={5} />
        </Deep>
      }
      actors={<g />} />
  </LookContext.Provider>
);

/** The kettle, side on, big: in its silver your face, stretched wide with an enormous nose, and nothing over it. */
export const KettleScene: React.FC<{ cam: Camera; frame: number; nose: number }> = ({ cam, frame, nose }) => (
  <LookContext.Provider value={setLook([], "morning", cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <Deep cam={cam} depth={1}>
          <rect x={-1400} y={-800} width={4800} height={2400} fill="#d6e8d8" />
          {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-200 + (i % 10) * 240} y={100 + Math.floor(i / 10) * 240} width={236} height={236} fill={i % 2 ? "#eef3ea" : "#e1ebe0"} />)}
          <rect x={-1400} y={900} width={4800} height={60} fill="#4a4a52" stroke={INK} strokeWidth={6} />
          <rect x={-1400} y={960} width={4800} height={600} fill="#d8344f" />
          {/* the kettle */}
          <path d="M1380 520 Q1560 440 1620 300" fill="none" stroke="#b8bec8" strokeWidth={60} strokeLinecap="round" />
          <path d="M600 900 Q560 300 960 270 Q1360 300 1320 900Z" fill="#c4cad3" stroke={INK} strokeWidth={10} />
          <clipPath id="kettle-clip"><path d="M620 890 Q585 310 960 285 Q1335 310 1300 890Z" /></clipPath>
          <g clipPath="url(#kettle-clip)">
            <rect x={560} y={260} width={800} height={660} fill="#b0b8c4" />
            <Reflection x={960} y={1260} scale={2.2} look={{ x: 0.1, y: -0.9 }} time={frame} nose={nose} stretch={1.6} />
            <path d="M700 340 Q760 600 720 860" fill="none" stroke="#fff" strokeWidth={30} opacity={0.4} />
            <path d="M1220 340 Q1180 600 1220 860" fill="none" stroke="#fff" strokeWidth={14} opacity={0.3} />
          </g>
          <path d="M760 270 Q960 120 1160 270" fill="none" stroke={INK} strokeWidth={22} />
        </Deep>
      }
      actors={<g />} />
  </LookContext.Provider>
);
