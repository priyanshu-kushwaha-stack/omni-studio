// "The first jump", lines 22-23: the phone insert (you type to the boss, send, a tick, nothing, two small bars come
// back), then your bathroom in the morning (a single-use set drawn here): you read the reply, lean in to the mirror and
// tell it to stop worrying; your reflection frowns straight back at you.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { headAt } from "../parts";
import { HandPhone, PhoneTop } from "../parts2";
import { blinking, camAt, current, HERO, mix, ramp } from "../shared";
import { Deep } from "../sets/common";
import { aimed, type T } from "./FirstJump.Times";

const S = 1.15;
const FLOOR = 960;
const YOU_X = 800;
/** The mirror: its glass, and the plane the reflection is mirrored about. */
const GLASS = { x: 1050, y: 370, w: 400, h: 410 };
const PLANE = 1035;

// ------------------------------------------------------------------------------------------------ 22: the phone

/** The bathroom ledge from straight above, white tiles, under the phone. */
const LedgeTop: React.FC = () => (
  <g>
    <rect x={-1400} y={-1400} width={4800} height={4000} fill="#e9f1f3" />
    {Array.from({ length: 30 }, (_, i) => <line key={`v${i}`} x1={-1400 + i * 160} y1={-1400} x2={-1400 + i * 160} y2={2600} stroke="#cfdde2" strokeWidth={6} />)}
    {Array.from({ length: 26 }, (_, i) => <line key={`h${i}`} x1={-1400} y1={-1400 + i * 160} x2={3400} y2={-1400 + i * 160} stroke="#cfdde2" strokeWidth={6} />)}
    <rect x={1380} y={180} width={90} height={320} rx={40} fill="#1d9a8f" opacity={0.85} />
    <circle cx={460} cy={300} r={70} fill="#f3e9d7" stroke={INK} strokeWidth={5} />
  </g>
);

export const PhoneShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const sent = frame >= k.send + 2;
  const typed = sent ? 0 : ramp(frame, k.phone + 4, k.typed);
  // The thumb taps across the keys while typing, goes to the send arrow, then tucks away.
  const typing = frame < k.typed;
  const thumb = typing
    ? { x: 0.25 + 0.5 * Math.abs(Math.sin(frame / 3.3)), y: 0.35 + 0.25 * Math.abs(Math.sin(frame / 2.1)) }
    : frame < k.send + 6 ? { x: mix(0.6, 0.88, ramp(frame, k.typed, k.send)), y: mix(0.4, -0.18, ramp(frame, k.typed, k.send)) } : null;
  const reply = ramp(frame, k.reply, k.reply + 10) * 0.34;
  const cam = drift(camAt(frame, [[k.phone, { x: 960, y: 560, zoom: 1.2 }], [k.nothing, { x: 960, y: 520, zoom: 1.32 }], [k.look, { x: 960, y: 470, zoom: 1.5 }]]), frame, "phone22", 2);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<LedgeTop />}
      actors={<PhoneTop x={960} y={560} scale={1.1} frame={frame} typed={typed} seed={22} sent={sent} ticks={frame >= k.dots ? 2 : 1}
        dots={frame >= k.dots && frame < k.reply} reply={reply} thumb={thumb} cursor={!sent} />} />
  );
};

// ------------------------------------------------------------------------------------------------ the bathroom

const Bathroom: React.FC<{ cam: Camera }> = ({ cam }) => (
  <>
    <Deep cam={cam} depth={0.9} flat>
      <rect x={-1400} y={-800} width={4800} height={1800} fill="#d6e9ee" />
      {Array.from({ length: 34 }, (_, i) => <line key={`v${i}`} x1={-1400 + i * 120} y1={-800} x2={-1400 + i * 120} y2={1000} stroke="#c0d7de" strokeWidth={4} />)}
      {Array.from({ length: 16 }, (_, i) => <line key={`h${i}`} x1={-1400} y1={-800 + i * 120} x2={3400} y2={-800 + i * 120} stroke="#c0d7de" strokeWidth={4} />)}
      <rect x={-1400} y={40} width={4800} height={16} fill="#f3e9d7" opacity={0.7} />
      {/* a towel on a hook at the left */}
      <rect x={380} y={360} width={150} height={260} rx={20} fill="#e0793f" stroke={INK} strokeWidth={4} />
      <rect x={380} y={540} width={150} height={20} fill="#f3e9d7" />
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={FLOOR - 10} width={4800} height={700} fill="#b9c6cc" />
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-1400 + i * 240} y1={FLOOR} x2={-1400 + i * 240 - 160} y2={FLOOR + 300} stroke="#a3b1b8" strokeWidth={4} />)}
      {/* the mirror's frame (the glass and the reflection are drawn by the shot), the shelf, the basin and the tap */}
      <rect x={GLASS.x - 18} y={GLASS.y - 18} width={GLASS.w + 36} height={GLASS.h + 36} rx={26} fill="#9a6a44" stroke={INK} strokeWidth={5} />
      <rect x={GLASS.x - 90} y={GLASS.y + GLASS.h + 20} width={GLASS.w + 120} height={18} rx={6} fill="#f3f6f7" stroke={INK} strokeWidth={4} />
      <rect x={GLASS.x - 64} y={GLASS.y + GLASS.h - 24} width={40} height={44} rx={6} fill="#7fc29b" stroke={INK} strokeWidth={3} />
      <rect x={GLASS.x - 54} y={GLASS.y + GLASS.h - 70} width={8} height={50} rx={4} fill="#d8344f" />
      <path d={`M${GLASS.x + 60} 850 H${GLASS.x + GLASS.w - 60} Q${GLASS.x + GLASS.w - 70} 908 ${GLASS.x + GLASS.w / 2} 910 Q${GLASS.x + 70} 908 ${GLASS.x + 60} 850Z`} fill="#f3f6f7" stroke={INK} strokeWidth={5} />
      <rect x={GLASS.x + GLASS.w / 2 - 26} y={910} width={52} height={FLOOR - 910} fill="#f3f6f7" stroke={INK} strokeWidth={4} />
      <path d={`M${GLASS.x + GLASS.w / 2 + 40} 850 V834 H${GLASS.x + GLASS.w / 2 - 6} V844`} fill="none" stroke="#9aa3ad" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
    </Deep>
  </>
);

/** The glass with your reflection in it: the same body mirrored about PLANE, with its own face. */
const Mirror: React.FC<{ frame: number; pose: Pose; x: number; face: object; held?: React.ReactNode }> = ({ frame, pose, x, face, held }) => (
  <g>
    <clipPath id="fj-mirror"><rect x={GLASS.x} y={GLASS.y} width={GLASS.w} height={GLASS.h} rx={14} /></clipPath>
    <rect x={GLASS.x} y={GLASS.y} width={GLASS.w} height={GLASS.h} rx={14} fill="#cfe6ee" />
    <g clipPath="url(#fj-mirror)">
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={GLASS.x + i * 90} y1={GLASS.y} x2={GLASS.x + i * 90} y2={GLASS.y + GLASS.h} stroke="#b8d3dc" strokeWidth={4} />)}
      <Figure {...HERO} x={2 * PLANE - x} y={FLOOR} scale={S} facing={-1} pose={pose} {...face} blink={blinking(frame, 1)} time={frame} held={held} />
      <path d={`M${GLASS.x + 60} ${GLASS.y + GLASS.h} L${GLASS.x + 200} ${GLASS.y}`} stroke="#fff" strokeWidth={40} opacity={0.18} />
    </g>
  </g>
);

export const BathroomShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const c = k.clips;
  const shot = current(frame, [[k.look, "read"], [k.mirror, "talk"], [k.doesnt, "glass"], [k.doesnt + 20, "you"]]);
  const reading = frame < k.mirror;
  // You: reading the phone at your chest; then the phone is gone and you lean in, a palm patting the air: calm down.
  const lean = reading ? 0 : 10 * ramp(frame, k.mirror, k.mirror + 10);
  const calm = Math.sin((frame - k.mirror) / 5) * 22;
  const you = aimed(YOU_X, FLOOR, S, 1, { ...STAND, lean },
    reading ? { x: YOU_X + 82, y: 700 } : { x: YOU_X + 150, y: 720 + (frame < k.doesnt + 20 ? calm : 0) });
  const youHead = headAt(you.x, you.y, S, you.pose);
  const talking = !reading && frame >= c[23].from && frame < k.doesnt + 20;
  const yFace = reading
    ? { brows: "flat" as const, lids: 0.4, mouth: "flat" as const, eyes: 1, look: { x: 0.7, y: 0.75 } }
    : frame < k.doesnt + 22
      ? { brows: "raised" as const, lids: 0.1, mouth: talking && Math.floor(frame / 7) % 2 === 0 ? "open" as const : "smile" as const, eyes: 1, look: { x: 0.95, y: 0 } }
      : { ...EXPRESSIONS.shocked, eyes: 1.25, look: { x: 0.95, y: 0 } };
  // The reflection copies you, until "It doesn't.": then it stops, crosses its arms and frowns.
  const defiant = frame >= k.doesnt;
  const rPose: Pose = defiant ? { ...STAND, lean: 4, armF: [70, 110], armB: [60, 110] } : you.pose;
  const rFace = defiant ? { brows: "angry" as const, lids: 0.3, mouth: "frown" as const, eyes: 1, look: { x: 0.95, y: 0 } } : yFace;
  const phone = reading ? <HandPhone frame={frame} scale={S} /> : undefined;
  const actors = (
    <>
      <Mirror frame={frame} pose={rPose} x={you.x} face={rFace} held={phone} />
      <Figure {...HERO} x={you.x} y={you.y} scale={S} pose={you.pose} {...yFace} blink={blinking(frame, 1)} time={frame} held={phone} />
    </>
  );
  const rHead = { x: 2 * PLANE - youHead.x, y: youHead.y };
  const cams: Record<typeof shot, Camera> = {
    read: camAt(frame, [[k.look, closeUp(youHead.x + 60, youHead.y + 20, 2.3)], [k.mirror, closeUp(youHead.x + 70, youHead.y + 20, 2.5)]]),
    talk: camAt(frame, [[k.mirror, { x: 1020, y: 640, zoom: 1.8 }], [k.doesnt, { x: 1025, y: 645, zoom: 1.95 }]]),
    glass: camAt(frame, [[k.doesnt, closeUp(rHead.x, rHead.y + 30, 2.5)], [k.doesnt + 20, closeUp(rHead.x, rHead.y + 30, 2.7)]]),
    you: camAt(frame, [[k.doesnt + 20, { x: (youHead.x + rHead.x) / 2, y: youHead.y + 30, zoom: 2.0 }], [k.like, { x: (youHead.x + rHead.x) / 2, y: youHead.y + 30, zoom: 2.15 }]]),
  };
  const cam = drift(cams[shot], frame, "mirror", 3);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<Bathroom cam={cam} />} actors={actors} />;
};
