// Who's Red, more uses of the card (script v3): the mirror in the school toilets (31: no snap; one shot over your
// shoulder with the sink, your back and your reflection together, the empty air above the reflection, then the focus
// racks to the empty air above your own head); the tour group outside the station (32-33: eleven cards ripple open down
// the group, in one row above the heads like a timetable, and click to zero; the group flows round you like water round
// a post); the bus home (34-36: a little kid in a cap, feet swinging, "What did you win?", +77, a grin with every tooth;
// then, outside, the bus pulls away). Outside review of v4.1, 2:40-3:15.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { dir, joints, LIMB, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { bus, street } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
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

const MIRROR = { x: 760, y: 90, w: 640, h: 600 } as const;
/** Your reflection, facing out of the glass (-1): the letter up by your face in the raised back hand. */
const REFL = { x: 1090, y: 950, scale: 1.8 } as const;
const REFL_POSE: Pose = { ...STAND, armB: [-150, -20], armF: [10, 20] };
/** Your own head from behind, in the near foreground at the lower left (world). */
const BACK = { x: 640, y: 840, r: 132 } as const;

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
        <Letter x={hand.x} y={hand.y + 30} scale={0.72} tilt={-8} />
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

/** You from behind, big in the near foreground: the back of your head and its tuft, the teal scarf, your shoulders,
 *  and the raised arm holding the letter (its back) up at the glass, off to the left so the reflection stays clear. `up` 0..1 tips your head back to look above it. */
const YouFromBehind: React.FC<{ up: number }> = ({ up }) => {
  const { x, y, r } = BACK;
  const hy = y - up * 10;
  return (
    <g>
      <rect x={x - 250} y={y + r - 30} width={500} height={600} rx={170} fill={INK} />
      <polyline points={`${x - 200},${y + r + 40} ${x - 300},${y + 10} ${x - 330},${y - 120}`} fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(${x - 336} ${y - 96}) rotate(6)`}>
        <rect x={-64} y={-170} width={128} height={172} rx={6} fill="#efe6d2" stroke={INK} strokeWidth={5} />
        {[0, 1, 2].map((i) => <line key={i} x1={-40} y1={-140 + i * 24} x2={44} y2={-140 + i * 24} stroke={INK} strokeWidth={5} opacity={0.12} />)}
      </g>
      <circle cx={x - 330} cy={y - 100} r={24} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      <path d={`M${x - 220} ${y + r - 40} Q${x} ${y + r + 30} ${x + 220} ${y + r - 40} L${x + 200} ${y + r + 40} Q${x} ${y + r + 100} ${x - 200} ${y + r + 40}Z`}
        fill={TEAL} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <circle cx={x} cy={hy} r={r} fill={MUSTARD} stroke={INK} strokeWidth={9} />
      <path d={`M${x - 8} ${hy - r + 4} q${10 - up * 6} -58 46 -18`} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
    </g>
  );
};

type MirrorView = "glass" | "air" | "own";

/** Line 31 as a test, in one set-up over your shoulder: the sink, your back and your reflection; "Nothing opens.", the
 *  camera finds the empty air above the reflection; "Or the one card you can't see is yours.", the focus racks off the
 *  glass to the empty air above your real head. */
export const MirrorShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<MirrorView>(frame, [[0, "glass"], [k.mirrorUp, "air"], [k.ownHead, "own"]]);
  const saying = frame >= k.mirror + 50 && frame < k.mirror + 80;
  const up = ramp(frame, k.mirrorUp, k.mirrorUp + 10);
  const face = { brows: up > 0.5 ? "worry" as const : "raised" as const, lids: 0, mouth: saying ? "open" as const : "flat" as const, eyes: 1.05,
    look: { x: mix(0.05, 0.1, up), y: mix(0.05, -1, up) } };
  const rack = ramp(frame, k.ownHead, k.ownHead + 14);
  const cams: Record<MirrorView, Camera> = {
    glass: camAt(frame, [[k.mirror, { x: 990, y: 560, zoom: 1.12 }], [k.mirrorUp, { x: 1000, y: 540, zoom: 1.2 }]]),
    air: camAt(frame, [[k.mirrorUp, { x: 1060, y: 420, zoom: 1.4 }], [k.ownHead, { x: 1070, y: 380, zoom: 1.48 }]]),
    own: camAt(frame, [[k.ownHead, { x: 760, y: 560, zoom: 1.35 }], [k.tourIn, { x: 740, y: 540, zoom: 1.45 }]]),
  };
  const cam = drift(cams[view], frame, "mirror", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<TileWall />} actors={
      <>
        <filter id="mirror-rack" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={mix(0, 6, rack)} /></filter>
        <filter id="mirror-near" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={mix(3, 0, rack)} /></filter>
        <g filter="url(#mirror-rack)"><MirrorAndSink frame={frame} face={face} /></g>
        <g filter="url(#mirror-near)"><YouFromBehind up={view === "own" ? ramp(frame, k.ownHead + 8, k.ownHead + 20) : 0} /></g>
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

/** The eleven cards open one after another down the group, a quick ripple (3 frames apart) from the guide back. */
export const tourTagAt = (k: CrimsonTimes, i: number) => k.tourTag + i * 3;

/** All eleven cards hang in one row (their bottoms on this line), clear of every head, yours included: a timetable. */
const CARD_ROW = 588;
const CARD_SCALE = 0.85;

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
    group: camAt(frame, [[k.tourIn, { x: 1060, y: 700, zoom: 1.05 }], [k.tourTag - 40, { x: 1000, y: 720, zoom: 1.12 }]]),
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
      <Meter frame={frame} at={tourTagAt(k, p.i)} x={p.head.x} headY={CARD_ROW + p.head.r * (1 + 0.525 * CARD_SCALE)} r={p.head.r} value={0} until={k.bus}
        tilt={p.i % 2 ? 2 : -2} scale={CARD_SCALE} />
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
export const Cap: React.FC<{ h: { x: number; y: number; r: number }; facing: 1 | -1 }> = ({ h, facing }) => (
  <g>
    <path d={`M${h.x - h.r * 0.9} ${h.y - h.r * 0.5} A${h.r} ${h.r} 0 0 1 ${h.x + h.r * 0.9} ${h.y - h.r * 0.5}Z`} fill={CRIMSON} stroke={INK} strokeWidth={4} />
    <path d={`M${h.x + facing * h.r * 0.55} ${h.y - h.r * 0.56} Q${h.x + facing * h.r * 1.5} ${h.y - h.r * 0.62} ${h.x + facing * h.r * 1.6} ${h.y - h.r * 0.42} L${h.x + facing * h.r * 0.55} ${h.y - h.r * 0.46}Z`}
      fill={CRIMSON} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

type BusView = "bus" | "try" | "kid" | "grin" | "two" | "away";

export const BusShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<BusView>(frame, [[0, "bus"], [k.tryHim, "try"], [k.kid, "kid"], [k.kidGrin, "grin"], [k.busTwo, "two"], [k.busAway, "away"]]);
  if (view === "away") return <BusAway frame={frame} k={k} mood={mood} />;
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
    two: camAt(frame, [[k.busTwo, { x: 1220, y: 670, zoom: 1.75 }], [k.busAway, { x: 1220, y: 665, zoom: 1.85 }]]),
    away: { x: 960, y: 540, zoom: 1 },
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


/** Outside: the bus pulls away from the stop and out of frame to the left, you and the kid's cap in two of its windows. */
const BusAway: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const t = frame - k.busAway;
  const bx = 820 - 0.9 * t * t - 6 * t; // pulls away, gathering speed
  const cam = drift(camAt(frame, [[k.busAway, { x: 940, y: 690, zoom: 1.4 }], [k.desks, { x: 860, y: 690, zoom: 1.32 }]]), frame, "busaway", 3);
  // the two heads in the second and third windows, on the bus's own plane (the street set draws it at the actors' depth)
  const heads = (
    <g transform={`translate(${bx} 0)`}>
        <circle cx={300} cy={700} r={24} fill={PASTELS[4]} stroke={INK} strokeWidth={4} />
        <path d="M276 692 A24 24 0 0 1 324 692Z M276 692 L258 695 L276 700Z" fill={CRIMSON} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={420} cy={692} r={30} fill={MUSTARD} stroke={INK} strokeWidth={4} />
        <path d="M416 662 q6 -18 18 -8" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
  return <SetShot set={street} mood={mood} frame={frame} cam={cam} options={{ auto: false, crowd: false, bus: bx }} actors={heads} />;
};
