// Who's Red, more uses of the card (script v3): the mirror in the school toilets (31: no snap; your eyes go above
// your reflection's head, then above your own); the tour group outside the station (32-33: eleven cards snap open
// together and click to zero in a row; the group flows round you like water round a post); the bus home (34-36: a
// little kid in a cap, feet swinging, "What did you win?", +77, a grin with every tooth).
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { dir, joints, LIMB, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { bus, street } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { headAt, Letter, Meter } from "../parts";
import { blinking, camAt, current, HERO, mix, PASTELS, ramp } from "../shared";
import { FlatShot, SetShot } from "./WhosCrimson.Common";
import type { CrimsonTimes } from "./WhosCrimson.Times";

const LETTER_UP: [number, number] = [124, 16];

/** A figure's front or back hand in world coordinates. */
export function handAt(x: number, y: number, scale: number, pose: Pose, facing: 1 | -1, arm: "front" | "back" = "front") {
  const j = joints(pose);
  const [u, f] = arm === "front" ? pose.armF : pose.armB;
  const a = dir(u), b = dir(u + f);
  return { x: x + (j.shoulder.x + (a.x + b.x) * LIMB) * scale * facing, y: y + (j.shoulder.y + (a.y + b.y) * LIMB) * scale };
}

// ------------------------------------------------------------------------------------------------ 31 the mirror

/** The school toilets' wall: pale tiles, a dado line, the floor. */
const TileWall: React.FC = () => (
  <g>
    <rect x={-1400} y={-800} width={4800} height={2600} fill="#d6e4e2" />
    <path d={Array.from({ length: 60 }, (_, i) => `M${-1400 + i * 90} -800 V1000`).join(" ") + Array.from({ length: 22 }, (_, i) => ` M-1400 ${-800 + i * 90} H3400`).join("")}
      stroke="#b9cbc8" strokeWidth={3} />
    <rect x={-1400} y={880} width={4800} height={20} fill="#8fa8a4" />
    <rect x={-1400} y={1000} width={4800} height={800} fill="#a9b6b3" />
  </g>
);

const MIRROR = { x: 620, y: 110, w: 680, h: 600 } as const;
/** Your reflection, big, facing out of the glass (-1): the letter up by your face in the raised back hand. */
const REFL = { x: 960, y: 960, scale: 2.0 } as const;
const REFL_POSE: Pose = { ...STAND, armB: [-150, -20], armF: [10, 20] };

/** The mirror over the sink: glass, frame, the basin and tap below, and your reflection inside the glass. */
const MirrorAndSink: React.FC<{ frame: number; face: object }> = ({ frame, face }) => {
  const m = MIRROR;
  const hand = handAt(REFL.x, REFL.y, REFL.scale, REFL_POSE, -1, "back");
  return (
    <g>
      <clipPath id="mirror-glass"><rect x={m.x} y={m.y} width={m.w} height={m.h} rx={10} /></clipPath>
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={10} fill="#c5dadd" />
      <g clipPath="url(#mirror-glass)">
        <path d={Array.from({ length: 10 }, (_, i) => `M${m.x + i * 90} ${m.y} V${m.y + m.h}`).join(" ")} stroke="#aec4c6" strokeWidth={3} />
        <Figure {...HERO} x={REFL.x} y={REFL.y} scale={REFL.scale} facing={-1} pose={REFL_POSE} {...face} blink={blinking(frame, 1)} time={frame} />
        <Letter x={hand.x} y={hand.y + 30} scale={0.8} tilt={-8} />
        {[0, 1].map((i) => <path key={i} d={`M${m.x + 80 + i * 260} ${m.y} l90 0 l-260 ${m.h} l-90 0Z`} fill="#fff" opacity={0.12} />)}
      </g>
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={10} fill="none" stroke="#8a949c" strokeWidth={18} />
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={10} fill="none" stroke={INK} strokeWidth={5} />
      <path d={`M${m.x + 90} 760 H${m.x + m.w - 90} Q${m.x + m.w - 110} 850 ${m.x + m.w / 2} 856 Q${m.x + 110} 850 ${m.x + 90} 760Z`} fill="#f4f6f5" stroke={INK} strokeWidth={6} />
      <rect x={m.x + 70} y={748} width={m.w - 140} height={18} rx={8} fill="#e9ecea" stroke={INK} strokeWidth={5} />
      <path d={`M${m.x + m.w / 2 - 10} 748 V722 Q${m.x + m.w / 2 - 10} 708 ${m.x + m.w / 2 + 20} 708 H${m.x + m.w / 2 + 40}`} fill="none" stroke="#8a949c" strokeWidth={14} strokeLinecap="round" />
    </g>
  );
};

type MirrorView = "glass" | "own";

export const MirrorShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<MirrorView>(frame, [[0, "glass"], [k.ownHead, "own"]]);
  if (view === "glass") {
    const saying = frame < Math.round(mix(k.mirror, k.mirrorUp, 0.6));
    const up = ramp(frame, k.mirrorUp, k.mirrorUp + 10);
    const face = { brows: up > 0.5 ? "worry" as const : "raised" as const, lids: 0, mouth: saying ? "open" as const : "flat" as const, eyes: 1.05,
      look: { x: mix(0.05, 0.1, up), y: mix(0.05, -1, up) } };
    const cam = drift(camAt(frame, [[k.mirror, { x: 960, y: 470, zoom: 1.4 }], [k.mirrorUp, { x: 960, y: 420, zoom: 1.5 }], [k.ownHead, { x: 960, y: 380, zoom: 1.6 }]]), frame, "mirror", 2);
    return <FlatShot cam={cam} mood={mood} back={<TileWall />} actors={<MirrorAndSink frame={frame} face={face} />} />;
  }
  // side on, in front of the glass: your eyes go to the air over your own head
  const yx = 700, yy = 1000, s = 1.3;
  const h = headAt(yx, yy, s, STAND);
  const cam = drift(camAt(frame, [[k.ownHead, closeUp(h.x + 30, h.y - 30, 2.6)], [k.tour, closeUp(h.x + 30, h.y - 110, 2.6)]]), frame, "own", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<TileWall />} actors={
      <>
        <rect x={1060} y={110} width={40} height={600} fill="#8a949c" stroke={INK} strokeWidth={5} />
        <Figure {...HERO} x={yx} y={yy} scale={s} pose={{ ...STAND, armF: [60, 70] }} brows="worry" lids={0.1} mouth="flat" eyes={1.1}
          look={{ x: 0.15, y: -1 }} blink={blinking(frame, 1)} time={frame} held={<Letter x={0} y={8} scale={0.42} tilt={20} />} />
      </>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 32-33 the tour group

/** The tour group walks from the right past you along the near pavement, a guide's flag at its head. Even ones pass
 *  behind you, odd ones in front, so the group parts round you like water round a post. */
const TOUR = { n: 11, step: 112, start: 1560, you: 760, y: 1012 } as const;

const Flag: React.FC = () => (
  <g>
    <line x1={0} y1={0} x2={0} y2={-130} stroke="#3b3e47" strokeWidth={6} />
    <path d="M0 -130 L58 -114 L0 -98Z" fill={TEAL} stroke={INK} strokeWidth={3} />
  </g>
);

/** The station's entrance sign on the pavement: a blue board with a train and an arrow, no lettering. */
const StationSign: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 8} y={y - 420} width={16} height={420} fill="#6f7a82" stroke={INK} strokeWidth={4} />
    <rect x={x - 130} y={y - 520} width={260} height={110} rx={12} fill="#22305a" stroke={INK} strokeWidth={5} />
    <rect x={x - 100} y={y - 494} width={90} height={56} rx={14} fill={PAPER} />
    {[0, 1].map((i) => <rect key={i} x={x - 90 + i * 40} y={y - 484} width={28} height={18} rx={4} fill="#22305a" />)}
    <path d={`M${x + 20} ${y - 466} H${x + 96} M${x + 74} ${y - 488} L${x + 98} ${y - 466} L${x + 74} ${y - 444}`} fill="none" stroke={PAPER} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export const tourTagAt = (k: CrimsonTimes, i: number) => k.tourTag + (i % 3);

function tourist(frame: number, k: CrimsonTimes, i: number) {
  const speed = (TOUR.start - TOUR.you) / Math.max(30, k.tourTag - k.tour);
  const x = TOUR.start + i * TOUR.step - speed * (frame - k.tour);
  const front = i % 2 === 1;
  const y = TOUR.y + (front ? 34 : -22);
  const scale = front ? 1.0 : 0.9;
  return { x, y, scale, front, pose: walkPose(frame * 0.3 + i * 0.7), head: headAt(x, y, scale, walkPose(frame * 0.3 + i * 0.7), -1) };
}

type TourView = "group" | "say" | "zeros" | "flow";

export const TourShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<TourView>(frame, [[0, "group"], [k.tourTag - 40, "say"], [k.tourTag + 30, "zeros"], [k.tourClose, "flow"]]);
  const yPose: Pose = { ...STAND, armF: LETTER_UP };
  const yh = headAt(TOUR.you, TOUR.y, 1.2, yPose);
  const cams: Record<TourView, Camera> = {
    group: camAt(frame, [[k.tour, { x: 1060, y: 700, zoom: 1.05 }], [k.tourTag - 40, { x: 1000, y: 720, zoom: 1.12 }]]),
    say: camAt(frame, [[k.tourTag - 40, { x: 900, y: 760, zoom: 1.45 }], [k.tourTag + 30, { x: 900, y: 750, zoom: 1.5 }]]),
    zeros: camAt(frame, [[k.tourTag + 30, { x: 960, y: 700, zoom: 1.08 }], [k.tourClose, { x: 940, y: 710, zoom: 1.14 }]]),
    flow: camAt(frame, [[k.tourClose, closeUp(yh.x + 40, yh.y - 20, 2.3)], [k.bus, closeUp(yh.x + 40, yh.y - 20, 2.45)]]),
  };
  const cam = drift(cams[view], frame, "tour", 3);
  const people = Array.from({ length: TOUR.n }, (_, i) => ({ i, ...tourist(frame, k, i) }));
  const draw = (p: (typeof people)[number]) => (
    <g key={p.i}>
      <Figure head={PASTELS[(p.i * 3 + 1) % PASTELS.length]} coat={["#6d7f8f", "#b58fc7", "#5a6488", "#c98a5a"][p.i % 4]} x={p.x} y={p.y} scale={p.scale}
        facing={-1} pose={p.i === 0 ? { ...p.pose, armF: [40, 50] } : p.pose} brows={frame >= k.tourTag ? "raised" : "none"} lids={0.1}
        mouth={p.i % 3 === 0 ? "smile" : "flat"} eyes={1} look={{ x: frame >= k.tourTag && Math.abs(p.x - TOUR.you) < 260 ? -0.8 : 0.7, y: 0.05 }}
        blink={blinking(frame, p.i + 2)} time={frame} held={p.i === 0 ? <Flag /> : undefined} />
      <Meter frame={frame} at={tourTagAt(k, p.i)} x={p.head.x} headY={p.head.y} r={p.head.r} value={0} until={k.bus} tilt={p.i % 2 ? 3 : -3} />
    </g>
  );
  const yFace = view === "flow"
    ? { brows: "flat" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: Math.sin(frame / 10) * 0.8, y: -0.4 } }
    : { brows: "raised" as const, lids: 0, mouth: frame >= k.tourTag - 30 && frame < k.tourTag ? "open" as const : "flat" as const, eyes: 1.1, look: { x: 0.9, y: -0.2 } };
  return (
    <SetShot set={street} mood={mood} frame={frame} cam={cam} options={{ auto: false, bus: null }} actors={
      <>
        <StationSign x={260} y={TOUR.y} />
        {people.filter((p) => !p.front).map(draw)}
        <Figure {...HERO} x={TOUR.you} y={TOUR.y} scale={1.2} pose={yPose} {...yFace} blink={blinking(frame, 1)} time={frame}
          held={<Letter x={0} y={8} scale={0.42} tilt={6} />} />
        {people.filter((p) => p.front).map(draw)}
      </>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 34-36 the bus

const SEAT_TOP = 840;
const YOU = { x: 1400, scale: 1.1 } as const;
const KID = { x: 1215, scale: 0.66 } as const;
const WOMAN = { x: 1010, scale: 1.05 } as const;

/** The kid's cap, over the top of his head, the bill toward where he faces. Draw after his Figure. */
const Cap: React.FC<{ h: { x: number; y: number; r: number }; facing: 1 | -1 }> = ({ h, facing }) => (
  <g>
    <path d={`M${h.x - h.r * 0.9} ${h.y - h.r * 0.5} A${h.r} ${h.r} 0 0 1 ${h.x + h.r * 0.9} ${h.y - h.r * 0.5}Z`} fill={CRIMSON} stroke={INK} strokeWidth={4} />
    <path d={`M${h.x + facing * h.r * 0.55} ${h.y - h.r * 0.56} Q${h.x + facing * h.r * 1.5} ${h.y - h.r * 0.62} ${h.x + facing * h.r * 1.6} ${h.y - h.r * 0.42} L${h.x + facing * h.r * 0.55} ${h.y - h.r * 0.46}Z`}
      fill={CRIMSON} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

type BusView = "bus" | "try" | "kid" | "grin" | "two";

export const BusShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<BusView>(frame, [[0, "bus"], [k.tryHim, "try"], [k.kid, "kid"], [k.kidGrin, "grin"], [k.busTwo, "two"]]);
  const swing = Math.sin(frame / 6) * 22;
  const kPose: Pose = { ...SEATED, legF: [70 + swing, -70], legB: [70 - swing, -70], armF: [40, 40], armB: [30, 50] };
  const ky = seatedY(SEAT_TOP, KID.scale);
  const kh = headAt(KID.x, ky, KID.scale, kPose, 1);
  const show = ramp(frame, k.tryHim, k.tryHim + 10);
  const yPose: Pose = { ...SEATED, armF: [mix(25, 74, show), mix(35, 26, show)] };
  const yy = seatedY(SEAT_TOP, YOU.scale);
  const yh = headAt(YOU.x, yy, YOU.scale, yPose, -1);
  const grin = frame >= k.kidTag + 18;
  const kidFace = view === "bus"
    ? { ...EXPRESSIONS.neutral, look: { x: -0.5, y: 0.2 } }
    : frame < k.kid ? { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.15, look: { x: 0.6, y: 0.2 } }
      : frame < k.kidTag ? { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.1, look: { x: 0.9, y: -0.4 } }
        : { brows: "raised" as const, lids: 0, mouth: grin ? "open" as const : "smile" as const, eyes: 1.25, look: { x: 0.9, y: -0.45 } };
  const youFace = view === "two" || view === "grin"
    ? { ...EXPRESSIONS.happy, look: { x: 0.8, y: 0.45 } }
    : { brows: "raised" as const, lids: 0, mouth: view === "try" ? "open" as const : "flat" as const, eyes: 1, look: { x: 0.8, y: 0.4 } };
  const womanUp = view === "two" ? ramp(frame, k.busTwo + 6, k.busTwo + 14) : 0;
  const cams: Record<BusView, Camera> = {
    bus: camAt(frame, [[k.bus, { x: 1180, y: 650, zoom: 1.45 }], [k.tryHim, { x: 1220, y: 660, zoom: 1.6 }]]),
    try: camAt(frame, [[k.tryHim, { x: 1300, y: 690, zoom: 2.0 }], [k.kid, { x: 1300, y: 690, zoom: 2.1 }]]),
    kid: camAt(frame, [[k.kid, closeUp(kh.x + 20, kh.y - 50, 3.0)], [k.kidGrin, closeUp(kh.x + 20, kh.y - 60, 3.1)]]),
    grin: camAt(frame, [[k.kidGrin, closeUp(kh.x + 20, kh.y - 60, 3.2)], [k.busTwo, closeUp(kh.x + 20, kh.y - 60, 3.4)]]),
    two: camAt(frame, [[k.busTwo, { x: 1220, y: 670, zoom: 1.75 }], [k.desks, { x: 1220, y: 665, zoom: 1.85 }]]),
  };
  const cam = drift(cams[view], frame, "bus", 2);
  return (
    <SetShot set={bus} mood={mood} frame={frame} cam={cam} options={{ speed: 7, hangers: 2 }} actors={
      <>
        <Figure head={PASTELS[6]} coat="#b0306a" x={WOMAN.x} y={seatedY(SEAT_TOP, WOMAN.scale)} scale={WOMAN.scale} facing={-1}
          pose={{ ...SEATED, armF: [70, 40], armB: [60, 50] }} brows={womanUp > 0.5 ? "raised" : "none"} lids={mix(0.2, 0, womanUp)} mouth={womanUp > 0.5 ? "smile" : "flat"}
          eyes={1} look={{ x: mix(0.5, -0.8, womanUp), y: mix(0.8, 0, womanUp) }} blink={blinking(frame, 6)} time={frame}
          held={<rect x={-6} y={-46} width={44} height={56} rx={3} fill={TEAL} stroke={INK} strokeWidth={4} />} />
        <Figure head={PASTELS[4]} coat="#3d6fb0" x={KID.x} y={ky} scale={KID.scale} facing={1} pose={kPose} {...kidFace} blink={blinking(frame, 4)} time={frame} />
        <Cap h={kh} facing={1} />
        <Meter frame={frame} at={k.kidTag} x={kh.x} headY={kh.y - kh.r * 0.3} r={kh.r} value={77} until={k.desks} />
        <Figure {...HERO} x={YOU.x} y={yy} scale={YOU.scale} facing={-1} pose={yPose} {...youFace} blink={blinking(frame, 1)} time={frame}
          held={show > 0 ? <Letter x={0} y={8} scale={0.42} tilt={-8} /> : undefined} />
      </>
    } />
  );
};

